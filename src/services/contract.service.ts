import { prisma } from "@/lib/prisma";

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  roleId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export async function getContracts(scope?: { userEmail?: string; roleName?: string; userId?: string }) {
  const whereClause: any = {};

  if (scope?.roleName === "USER" && scope.userEmail) {
    whereClause.employee = { user: { email: scope.userEmail } };
  } else if (scope?.roleName === "MANAGER" && scope.userId) {
    const managerProfile = await prisma.employeeProfile.findUnique({
      where: { userId: scope.userId },
      include: { managedDept: true },
    });
    const deptId = managerProfile?.managedDept?.id;
    if (deptId) {
      whereClause.employee = {
        OR: [{ departmentId: deptId }, { userId: scope.userId }],
      };
    } else {
      whereClause.employee = { userId: scope.userId };
    }
  }

  const contracts = await prisma.contract.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        include: {
          user: { select: SAFE_USER_SELECT },
          department: { select: { id: true, name: true } },
          salaryConfig: { select: { baseSalary: true } },
        },
      },
    },
  });

  const now = new Date();

  return contracts.map((c) => {
    let daysLeft: number | undefined = undefined;
    let computedStatus = c.status;

    if (c.endDate) {
      const end = new Date(c.endDate);
      const diffTime = end.getTime() - now.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (c.status !== "TERMINATED") {
        if (daysLeft < 0) {
          computedStatus = "EXPIRED";
        } else if (daysLeft <= 30) {
          computedStatus = "EXPIRING_SOON";
        } else {
          computedStatus = "ACTIVE";
        }
      }
    }

    return {
      ...c,
      status: computedStatus,
      daysLeft,
    };
  });
}

export interface ContractActorContext {
  name?: string;
  roleName?: string;
  userId?: string;
}

async function syncEmployeeBaseSalaryFromActiveContract(
  tx: any,
  employeeId: string,
  preferredSalary?: number
) {
  if (preferredSalary !== undefined && preferredSalary > 0) {
    await tx.employeeSalaryConfig.upsert({
      where: { employeeId },
      update: { baseSalary: preferredSalary },
      create: { employeeId, baseSalary: preferredSalary },
    });
    return;
  }

  const now = new Date();
  const latestActiveContract = await tx.contract.findFirst({
    where: {
      employeeId,
      status: { in: ["ACTIVE", "EXPIRING_SOON"] },
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });

  if (latestActiveContract && latestActiveContract.salary > 0) {
    await tx.employeeSalaryConfig.upsert({
      where: { employeeId },
      update: { baseSalary: latestActiveContract.salary },
      create: { employeeId, baseSalary: latestActiveContract.salary },
    });
  }
}

export async function createContract(
  data: any,
  actorInput: string | ContractActorContext = "Quản trị viên"
) {
  const actor: ContractActorContext =
    typeof actorInput === "string"
      ? { name: actorInput, roleName: "HR" }
      : actorInput;
  const actorName = actor.name || "Quản trị viên";
  const actorRole = actor.roleName || "HR";

  const { employeeId, contractType, startDate, endDate, salary, baseSalary, note, fileUrl } = data;

  if (!employeeId || !contractType || !startDate) {
    throw new Error("Thiếu thông tin bắt buộc: Nhân viên, Loại hợp đồng và Ngày bắt đầu.");
  }

  const employee = await prisma.employeeProfile.findUnique({
    where: { id: employeeId },
    include: {
      user: { select: SAFE_USER_SELECT },
      salaryConfig: { select: { baseSalary: true } },
    },
  });

  if (!employee) throw new Error("Không tìm thấy nhân viên được chỉ định.");

  if (actorRole === "HR") {
    if (actor.userId && employee.userId === actor.userId) {
      throw new Error("Nhân sự (HR) không được phép tự ký mới hợp đồng hoặc tự thay đổi mức lương của chính mình.");
    }
    const targetRoleName = employee.user?.role?.name || "USER";
    if (["SYSTEM_ADMIN", "BOD"].includes(targetRoleName)) {
      throw new Error("Nhân sự (HR) không có thẩm quyền tạo hợp đồng cho Quản trị hệ thống hoặc Ban Giám Đốc.");
    }
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (end && start > end) {
    throw new Error("Ngày kết thúc hợp đồng không thể nhỏ hơn ngày bắt đầu.");
  }

  let status = "ACTIVE";
  if (end) {
    const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) status = "EXPIRED";
    else if (daysLeft <= 30) status = "EXPIRING_SOON";
  }

  const contractSalary = parseFloat(salary ?? baseSalary) || 0;
  const year = start.getFullYear();
  const prefix = `HĐLĐ-${year}/NX-`;

  return await prisma.$transaction(async (tx) => {
    let code = data.code;
    if (!code) {
      const existingContracts = await tx.contract.findMany({
        where: { code: { startsWith: prefix } },
        select: { code: true },
      });
      let maxSuffix = 0;
      for (const item of existingContracts) {
        const numPart = parseInt(item.code.slice(prefix.length), 10);
        if (!isNaN(numPart) && numPart > maxSuffix) {
          maxSuffix = numPart;
        }
      }
      code = `${prefix}${String(maxSuffix + 1).padStart(4, "0")}`;
    }

    const newContract = await tx.contract.create({
      data: {
        code,
        employeeId,
        contractType,
        startDate: start,
        endDate: end,
        salary: contractSalary,
        status,
        note,
        fileUrl,
      },
      include: {
        employee: {
          include: {
            user: { select: SAFE_USER_SELECT },
            department: true,
          },
        },
      },
    });

    const isEffectiveNow =
      status !== "EXPIRED" &&
      status !== "TERMINATED" &&
      (start.getTime() <= Date.now() || !employee.salaryConfig);

    if (contractSalary > 0 && isEffectiveNow) {
      await syncEmployeeBaseSalaryFromActiveContract(tx, employeeId, contractSalary);
    }

    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Ký mới Hợp đồng lao động ${code} cho nhân sự ${employee.user.name} (${contractType})`,
        target: "Contract",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return newContract;
  });
}

export async function updateContract(
  id: string,
  data: any,
  actorInput: string | ContractActorContext = "Quản trị viên"
) {
  const actor: ContractActorContext =
    typeof actorInput === "string"
      ? { name: actorInput, roleName: "HR" }
      : actorInput;
  const actorName = actor.name || "Quản trị viên";
  const actorRole = actor.roleName || "HR";

  const existing = await prisma.contract.findUnique({
    where: { id },
    include: { employee: { include: { user: { select: SAFE_USER_SELECT } } } },
  });

  if (!existing) throw new Error("Không tìm thấy hợp đồng lao động.");

  if (actorRole === "HR") {
    if (actor.userId && existing.employee.userId === actor.userId) {
      throw new Error("Nhân sự (HR) không được phép tự chỉnh sửa hợp đồng hoặc mức lương của chính mình.");
    }
    const targetRoleName = existing.employee.user?.role?.name || "USER";
    if (["SYSTEM_ADMIN", "BOD"].includes(targetRoleName)) {
      throw new Error("Nhân sự (HR) không có thẩm quyền chỉnh sửa hợp đồng của Quản trị hệ thống hoặc Ban Giám Đốc.");
    }
  }

  const { contractType, startDate, endDate, salary, baseSalary, status, note, fileUrl } = data;

  const start = startDate ? new Date(startDate) : existing.startDate;
  const end = endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate;

  if (end && start > end) {
    throw new Error("Ngày kết thúc hợp đồng không thể nhỏ hơn ngày bắt đầu.");
  }

  let finalStatus = status || existing.status;
  if (end && !status && existing.status !== "TERMINATED") {
    const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) finalStatus = "EXPIRED";
    else if (daysLeft <= 30) finalStatus = "EXPIRING_SOON";
    else finalStatus = "ACTIVE";
  }

  const rawSalary = salary !== undefined ? salary : baseSalary;
  const parsedSalary = rawSalary !== undefined ? parseFloat(rawSalary) : undefined;

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.contract.update({
      where: { id },
      data: {
        contractType: contractType ?? undefined,
        startDate: start,
        endDate: end,
        salary: parsedSalary,
        status: finalStatus,
        note: note !== undefined ? note : undefined,
        fileUrl: fileUrl !== undefined ? fileUrl : undefined,
      },
      include: {
        employee: {
          include: {
            user: { select: SAFE_USER_SELECT },
            department: true,
          },
        },
      },
    });

    if (
      parsedSalary !== undefined &&
      parsedSalary > 0 &&
      finalStatus !== "TERMINATED" &&
      finalStatus !== "EXPIRED" &&
      start.getTime() <= Date.now()
    ) {
      await syncEmployeeBaseSalaryFromActiveContract(tx, existing.employeeId, parsedSalary);
    } else if (finalStatus === "TERMINATED" || finalStatus === "EXPIRED") {
      await syncEmployeeBaseSalaryFromActiveContract(tx, existing.employeeId);
    }

    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Cập nhật Hợp đồng lao động ${existing.code} (${existing.employee.user.name})`,
        target: "Contract",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return updated;
  });
}

export async function deleteContract(
  id: string,
  actorInput: string | ContractActorContext = "Quản trị viên"
) {
  const actor: ContractActorContext =
    typeof actorInput === "string"
      ? { name: actorInput, roleName: "HR" }
      : actorInput;
  const actorName = actor.name || "Quản trị viên";
  const actorRole = actor.roleName || "HR";

  const existing = await prisma.contract.findUnique({
    where: { id },
    include: { employee: { include: { user: { select: SAFE_USER_SELECT } } } },
  });

  if (!existing) throw new Error("Không tìm thấy hợp đồng lao động.");

  if (actorRole === "HR") {
    if (actor.userId && existing.employee.userId === actor.userId) {
      throw new Error("Nhân sự (HR) không được phép tự xóa hợp đồng của chính mình.");
    }
    const targetRoleName = existing.employee.user?.role?.name || "USER";
    if (["SYSTEM_ADMIN", "BOD"].includes(targetRoleName)) {
      throw new Error("Nhân sự (HR) không có thẩm quyền xóa hợp đồng của Quản trị hệ thống hoặc Ban Giám Đốc.");
    }
  }

  return await prisma.$transaction(async (tx) => {
    const deleted = await tx.contract.delete({ where: { id } });

    await syncEmployeeBaseSalaryFromActiveContract(tx, existing.employeeId);

    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Hủy / Xóa Hợp đồng lao động ${existing.code} của nhân sự ${existing.employee.user.name}`,
        target: "Contract",
        ip: "127.0.0.1",
        status: "WARNING",
      },
    });

    return deleted;
  });
}
