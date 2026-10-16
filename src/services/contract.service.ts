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

export async function createContract(data: any, actorName: string = "Quản trị viên") {
  const { employeeId, contractType, startDate, endDate, salary, baseSalary, note, fileUrl } = data;

  if (!employeeId || !contractType || !startDate) {
    throw new Error("Thiếu thông tin bắt buộc: Nhân viên, Loại hợp đồng và Ngày bắt đầu.");
  }

  const employee = await prisma.employeeProfile.findUnique({
    where: { id: employeeId },
    include: { user: { select: SAFE_USER_SELECT } },
  });

  if (!employee) throw new Error("Không tìm thấy nhân viên được chỉ định.");

  const year = new Date(startDate).getFullYear();
  const prefix = `HĐLĐ-${year}/NX-`;
  let code = data.code;
  if (!code) {
    const existingContracts = await prisma.contract.findMany({
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

  const newContract = await prisma.contract.create({
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

  if (contractSalary > 0) {
    await prisma.employeeSalaryConfig.upsert({
      where: { employeeId },
      update: { baseSalary: contractSalary },
      create: { employeeId, baseSalary: contractSalary },
    });
  }

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Ký mới Hợp đồng lao động ${code} cho nhân sự ${employee.user.name} (${contractType})`,
      target: "Contract",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return newContract;
}

export async function updateContract(id: string, data: any, actorName: string = "Quản trị viên") {
  const existing = await prisma.contract.findUnique({
    where: { id },
    include: { employee: { include: { user: { select: SAFE_USER_SELECT } } } },
  });

  if (!existing) throw new Error("Không tìm thấy hợp đồng lao động.");

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

  const updated = await prisma.contract.update({
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

  if (parsedSalary !== undefined && parsedSalary > 0 && finalStatus !== "TERMINATED" && finalStatus !== "EXPIRED") {
    await prisma.employeeSalaryConfig.upsert({
      where: { employeeId: existing.employeeId },
      update: { baseSalary: parsedSalary },
      create: { employeeId: existing.employeeId, baseSalary: parsedSalary },
    });
  }

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Cập nhật Hợp đồng lao động ${existing.code} (${existing.employee.user.name})`,
      target: "Contract",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return updated;
}

export async function deleteContract(id: string, actorName: string = "Quản trị viên") {
  const existing = await prisma.contract.findUnique({
    where: { id },
    include: { employee: { include: { user: { select: SAFE_USER_SELECT } } } },
  });

  if (!existing) throw new Error("Không tìm thấy hợp đồng lao động.");

  const deleted = await prisma.contract.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Hủy / Xóa Hợp đồng lao động ${existing.code} của nhân sự ${existing.employee.user.name}`,
      target: "Contract",
      ip: "127.0.0.1",
      status: "WARNING",
    },
  });

  return deleted;
}
