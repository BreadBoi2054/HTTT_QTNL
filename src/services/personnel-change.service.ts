import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class PersonnelChangeError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "PersonnelChangeError";
    this.status = status;
  }
}

export interface PersonnelChangeActor {
  userId?: string;
  userEmail?: string;
  userName?: string;
  roleName: string;
}

const VALID_CHANGE_TYPES = new Set([
  "NEW_HIRE",
  "PROMOTION",
  "TRANSFER",
  "RESIGNATION",
]);

export function normalizeEffectiveDateString(rawDate?: string): string {
  const trimmed = String(rawDate || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new PersonnelChangeError(
      "Ngày có hiệu lực thi hành không hợp lệ (định dạng chuẩn YYYY-MM-DD).",
      400
    );
  }
  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== trimmed
  ) {
    throw new PersonnelChangeError(
      "Ngày có hiệu lực thi hành không tồn tại trên lịch.",
      400
    );
  }
  return trimmed;
}

export function parseProposedSalary(rawNewSalary: unknown): number | null {
  if (
    rawNewSalary === undefined ||
    rawNewSalary === null ||
    String(rawNewSalary).trim() === ""
  ) {
    return null;
  }
  const parsed = Number(rawNewSalary);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new PersonnelChangeError(
      "Mức lương cơ bản đề xuất phải là số dương lớn hơn 0.",
      400
    );
  }
  return Math.round(parsed);
}

async function resolveTargetDepartment(
  tx: Prisma.TransactionClient,
  type: string,
  toDeptId?: string | null,
  toDeptName?: string | null
) {
  if (type === "RESIGNATION") {
    return {
      id: null,
      name: (toDeptName && toDeptName.trim()) || "Lưu trữ hồ sơ thôi việc",
    };
  }

  if (toDeptId && String(toDeptId).trim()) {
    const deptById = await tx.department.findUnique({
      where: { id: String(toDeptId).trim() },
    });
    if (!deptById) {
      throw new PersonnelChangeError(
        "Phòng ban tiếp nhận không tồn tại trong hệ thống.",
        400
      );
    }
    return { id: deptById.id, name: deptById.name };
  }

  const trimmedName = String(toDeptName || "").trim();
  if (!trimmedName) {
    throw new PersonnelChangeError(
      "Vui lòng chọn phòng ban tiếp nhận hợp lệ.",
      400
    );
  }

  const deptByName = await tx.department.findFirst({
    where: {
      name: { equals: trimmedName, mode: "insensitive" },
    },
  });

  if (!deptByName) {
    throw new PersonnelChangeError(
      `Phòng ban tiếp nhận "${trimmedName}" không tồn tại trong hệ thống.`,
      400
    );
  }

  return { id: deptByName.id, name: deptByName.name };
}

export async function syncEmployeeFromApprovedDecision(
  tx: Prisma.TransactionClient,
  change: {
    id: string;
    employeeId?: string | null;
    employeeEmail: string;
    type: string;
    toDeptId?: string | null;
    toDept: string;
    toPosition: string;
    newSalary?: number | null;
  },
  overrideSalary?: number | null
) {
  let employeeProfile = change.employeeId
    ? await tx.employeeProfile.findUnique({
        where: { id: change.employeeId },
        include: { user: { include: { role: true } }, department: true },
      })
    : null;

  if (!employeeProfile && change.employeeEmail) {
    const user = await tx.user.findUnique({
      where: { email: change.employeeEmail },
      include: {
        role: true,
        employee: { include: { department: true } },
      },
    });
    employeeProfile = user?.employee
      ? {
          ...user.employee,
          user: { ...user, role: user.role },
        }
      : null;
  }

  if (!employeeProfile) {
    if (change.type === "NEW_HIRE") {
      return false;
    }
    throw new PersonnelChangeError(
      "Không tìm thấy hồ sơ nhân sự để đồng bộ quyết định biến động.",
      400
    );
  }

  const resolvedDept = await resolveTargetDepartment(
    tx,
    change.type,
    change.toDeptId,
    change.toDept
  );

  const salaryToApply =
    overrideSalary !== undefined && overrideSalary !== null
      ? overrideSalary
      : change.newSalary;

  if (
    change.type === "PROMOTION" ||
    change.type === "TRANSFER" ||
    change.type === "NEW_HIRE"
  ) {
    if (
      change.type === "TRANSFER" &&
      resolvedDept.id &&
      resolvedDept.id !== employeeProfile.departmentId &&
      employeeProfile.departmentId
    ) {
      await tx.department.updateMany({
        where: {
          id: employeeProfile.departmentId,
          managerId: employeeProfile.id,
        },
        data: { managerId: null },
      });

      const remainingManaged = await tx.department.count({
        where: { managerId: employeeProfile.id },
      });
      if (
        remainingManaged === 0 &&
        employeeProfile.user?.role?.name === "MANAGER"
      ) {
        const userRole = await tx.role.findUnique({ where: { name: "USER" } });
        if (userRole) {
          await tx.user.update({
            where: { id: employeeProfile.userId },
            data: { roleId: userRole.id },
          });
        }
      }
    }

    await tx.employeeProfile.update({
      where: { id: employeeProfile.id },
      data: {
        position: change.toPosition || employeeProfile.position,
        departmentId: resolvedDept.id ?? employeeProfile.departmentId,
        status: "ACTIVE",
      },
    });

    const parsedSalary = Number(salaryToApply);
    if (Number.isFinite(parsedSalary) && parsedSalary > 0) {
      await tx.employeeSalaryConfig.upsert({
        where: { employeeId: employeeProfile.id },
        update: { baseSalary: parsedSalary },
        create: { employeeId: employeeProfile.id, baseSalary: parsedSalary },
      });

      const activeContract = await tx.contract.findFirst({
        where: { employeeId: employeeProfile.id, status: "ACTIVE" },
        orderBy: { startDate: "desc" },
      });
      if (activeContract) {
        await tx.contract.update({
          where: { id: activeContract.id },
          data: { salary: parsedSalary },
        });
      }
    }
  } else if (change.type === "RESIGNATION") {
    await tx.department.updateMany({
      where: { managerId: employeeProfile.id },
      data: { managerId: null },
    });

    if (employeeProfile.user?.role?.name === "MANAGER") {
      const userRole = await tx.role.findUnique({ where: { name: "USER" } });
      if (userRole) {
        await tx.user.update({
          where: { id: employeeProfile.userId },
          data: { roleId: userRole.id },
        });
      }
    }

    await tx.employeeProfile.update({
      where: { id: employeeProfile.id },
      data: { status: "RESIGNED" },
    });

    await tx.contract.updateMany({
      where: { employeeId: employeeProfile.id, status: "ACTIVE" },
      data: { status: "TERMINATED" },
    });

    await tx.leaveRequest.updateMany({
      where: { employeeId: employeeProfile.id, status: "PENDING" },
      data: { status: "REJECTED" },
    });

    await tx.overtimeRequest.updateMany({
      where: { employeeId: employeeProfile.id, status: "PENDING" },
      data: { status: "REJECTED" },
    });
  }

  return true;
}

export async function applyDuePersonnelChanges(referenceDate: Date = new Date()) {
  const referenceIso = referenceDate.toISOString().slice(0, 10);
  const dueChanges = await prisma.personnelChange.findMany({
    where: {
      status: "APPROVED",
      appliedAt: null,
      effectiveDate: { lte: referenceIso },
    },
    orderBy: [{ effectiveDate: "asc" }, { createdAt: "asc" }],
  });

  const appliedIds: string[] = [];
  for (const item of dueChanges) {
    await prisma.$transaction(
      async (tx) => {
        const fresh = await tx.personnelChange.findUnique({
          where: { id: item.id },
        });
        if (
          !fresh ||
          fresh.status !== "APPROVED" ||
          fresh.appliedAt !== null ||
          fresh.effectiveDate > referenceIso
        ) {
          return;
        }
        const synced = await syncEmployeeFromApprovedDecision(tx, fresh);
        if (synced) {
          await tx.personnelChange.update({
            where: { id: fresh.id },
            data: { appliedAt: new Date() },
          });
          await tx.auditLog.create({
            data: {
              userName: "Hệ thống / Tự động theo ngày hiệu lực",
              userRole: "SYSTEM_ADMIN",
              action: `Tự động thi hành Quyết định biến động nhân sự đến hạn hiệu lực ${fresh.code} (${fresh.employeeName} - ngày hiệu lực ${fresh.effectiveDate})`,
              target: "PersonnelChange",
              ip: "127.0.0.1",
              status: "SUCCESS",
            },
          });
          appliedIds.push(fresh.id);
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  }

  return appliedIds;
}

export async function createPersonnelChangeDecision(
  actor: PersonnelChangeActor,
  body: Record<string, unknown>,
  referenceDate: Date = new Date()
) {
  const roleName = actor.roleName || "USER";
  if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
    throw new PersonnelChangeError(
      "Bạn không có quyền khởi tạo quyết định biến động nhân sự.",
      403
    );
  }

  const changeType = String(body.type || "").trim();
  if (!VALID_CHANGE_TYPES.has(changeType)) {
    throw new PersonnelChangeError("Loại quyết định biến động không hợp lệ.", 400);
  }

  const effectiveDate = normalizeEffectiveDateString(
    typeof body.effectiveDate === "string" ? body.effectiveDate : String(body.effectiveDate || "")
  );
  const proposedSalary = parseProposedSalary(body.newSalary);

  let targetEmployee: {
    id: string;
    userId: string;
    position: string;
    departmentId: string | null;
    departmentName: string | null;
    userName: string;
    userEmail: string;
    roleName: string;
  } | null = null;

  if (body.employeeId && String(body.employeeId).trim()) {
    const emp = await prisma.employeeProfile.findUnique({
      where: { id: String(body.employeeId).trim() },
      include: {
        user: { include: { role: true } },
        department: true,
      },
    });
    if (!emp) {
      throw new PersonnelChangeError(
        "Không tìm thấy hồ sơ nhân sự theo mã định danh đã chọn.",
        400
      );
    }
    targetEmployee = {
      id: emp.id,
      userId: emp.userId,
      position: emp.position,
      departmentId: emp.departmentId,
      departmentName: emp.department?.name || null,
      userName: emp.user.name,
      userEmail: emp.user.email,
      roleName: emp.user.role?.name || "USER",
    };
  } else if (body.employeeEmail && String(body.employeeEmail).trim()) {
    const email = String(body.employeeEmail).trim();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        employee: { include: { department: true } },
      },
    });
    if (user?.employee) {
      targetEmployee = {
        id: user.employee.id,
        userId: user.id,
        position: user.employee.position,
        departmentId: user.employee.departmentId,
        departmentName: user.employee.department?.name || null,
        userName: user.name,
        userEmail: user.email,
        roleName: user.role?.name || "USER",
      };
    } else if (changeType !== "NEW_HIRE") {
      throw new PersonnelChangeError(
        "Không tìm thấy hồ sơ nhân sự cần thực hiện quyết định biến động.",
        400
      );
    }
  } else if (changeType !== "NEW_HIRE") {
    throw new PersonnelChangeError(
      "Vui lòng chọn nhân sự cần thực hiện quyết định biến động.",
      400
    );
  }

  const targetEmail =
    targetEmployee?.userEmail || String(body.employeeEmail || "").trim();
  const targetName =
    targetEmployee?.userName || String(body.employeeName || "").trim();

  if (!targetName || !targetEmail) {
    throw new PersonnelChangeError(
      "Thiếu thông tin bắt buộc: Họ tên, Email nhân sự và Loại quyết định.",
      400
    );
  }

  if (!String(body.toPosition || "").trim()) {
    throw new PersonnelChangeError(
      "Vui lòng nhập chức vụ / vị trí mới trong quyết định.",
      400
    );
  }

  if (["HR", "MANAGER"].includes(roleName)) {
    if (
      (actor.userEmail &&
        targetEmail.toLowerCase() === actor.userEmail.toLowerCase()) ||
      (targetEmployee && actor.userId && targetEmployee.userId === actor.userId)
    ) {
      throw new PersonnelChangeError(
        "Bạn không được tự khởi tạo hoặc phê duyệt quyết định biến động nhân sự / nâng lương cho chính mình.",
        403
      );
    }

    if (
      targetEmployee &&
      ["SYSTEM_ADMIN", "BOD"].includes(targetEmployee.roleName)
    ) {
      throw new PersonnelChangeError(
        "Bạn không có thẩm quyền tạo quyết định biến động đối với tài khoản Quản trị hệ thống hoặc Ban Giám Đốc.",
        403
      );
    }
  }

  if (roleName === "MANAGER") {
    const managerProfile = actor.userId
      ? await prisma.employeeProfile.findUnique({
          where: { userId: actor.userId },
          include: { managedDept: true },
        })
      : null;
    const managedDeptId = managerProfile?.managedDept?.id;
    if (
      !managedDeptId ||
      !targetEmployee ||
      targetEmployee.departmentId !== managedDeptId
    ) {
      throw new PersonnelChangeError(
        "Trưởng phòng chỉ được phép đề xuất biến động cho nhân sự thuộc phòng ban mình quản lý.",
        403
      );
    }
  }

  const initialStatus =
    roleName === "MANAGER"
      ? "PENDING"
      : body.status === "PENDING"
        ? "PENDING"
        : "APPROVED";

  const referenceIso = referenceDate.toISOString().slice(0, 10);
  const decisionYear = effectiveDate.slice(0, 4);

  return prisma.$transaction(
    async (tx) => {
      const resolvedToDept = await resolveTargetDepartment(
        tx,
        changeType,
        typeof body.toDeptId === "string" ? body.toDeptId : null,
        typeof body.toDept === "string" ? body.toDept : null
      );

      const prefix = `QĐ-${decisionYear}-`;
      const altPrefix = `Q?-${decisionYear}-`;
      const existingCodes = await tx.personnelChange.findMany({
        where: {
          OR: [
            { code: { startsWith: prefix } },
            { code: { startsWith: altPrefix } },
          ],
        },
        select: { code: true },
      });
      const codePattern = new RegExp(`^Q[Đ\\?]-${decisionYear}-`);
      const maxNum = existingCodes.reduce((max, item) => {
        const num = parseInt(item.code.replace(codePattern, ""), 10);
        return !Number.isNaN(num) && num > max ? num : max;
      }, 0);
      const code = `${prefix}${String(maxNum + 1).padStart(3, "0")}`;

      const shouldApplyImmediately =
        initialStatus === "APPROVED" && effectiveDate <= referenceIso;

      const created = await tx.personnelChange.create({
        data: {
          code,
          employeeId: targetEmployee?.id ?? null,
          employeeName: targetName,
          employeeEmail: targetEmail,
          type: changeType,
          fromDeptId: targetEmployee?.departmentId ?? null,
          fromDept:
            targetEmployee?.departmentName ||
            String(body.fromDept || "Chưa xếp phòng"),
          toDeptId: resolvedToDept.id,
          toDept: resolvedToDept.name,
          fromPosition:
            targetEmployee?.position ||
            String(body.fromPosition || "Nhân viên"),
          toPosition: String(body.toPosition).trim(),
          newSalary: proposedSalary,
          effectiveDate,
          appliedAt: null,
          signer: String(body.signer || actor.userName || "Ban Giám Đốc"),
          status: initialStatus,
        },
      });

      let finalRecord = created;
      if (shouldApplyImmediately) {
        const synced = await syncEmployeeFromApprovedDecision(
          tx,
          created,
          proposedSalary
        );
        if (synced) {
          finalRecord = await tx.personnelChange.update({
            where: { id: created.id },
            data: { appliedAt: new Date() },
          });
        }
      }

      const salaryNote =
        proposedSalary && proposedSalary > 0
          ? ` - Lương đề xuất/mới: ${proposedSalary.toLocaleString("vi-VN")} VNĐ`
          : "";
      const scheduleNote =
        initialStatus === "APPROVED" && effectiveDate > referenceIso
          ? ` (Chờ hiệu lực ngày ${effectiveDate})`
          : "";

      await tx.auditLog.create({
        data: {
          userName: actor.userName || "Người dùng",
          userRole: roleName,
          action: `${
            initialStatus === "APPROVED" ? "Ban hành" : "Trình duyệt"
          } Quyết định biến động nhân sự ${code} (${targetName} - ${changeType}${salaryNote})${scheduleNote}`,
          target: "PersonnelChange",
          ip: "127.0.0.1",
          status: "SUCCESS",
        },
      });

      return finalRecord;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

export async function decidePersonnelChangeDecision(
  actor: PersonnelChangeActor,
  body: Record<string, unknown>,
  referenceDate: Date = new Date()
) {
  const roleName = actor.roleName || "USER";
  if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
    throw new PersonnelChangeError(
      "Chỉ Ban Giám Đốc, Quản trị viên hoặc Nhân sự mới có thẩm quyền phê duyệt quyết định biến động.",
      403
    );
  }

  const id = String(body.id || "").trim();
  const status = String(body.status || "").trim();

  if (!id || !["APPROVED", "REJECTED"].includes(status)) {
    throw new PersonnelChangeError("Dữ liệu phê duyệt không hợp lệ.", 400);
  }

  const existing = await prisma.personnelChange.findUnique({ where: { id } });
  if (!existing) {
    throw new PersonnelChangeError(
      "Không tìm thấy quyết định biến động.",
      404
    );
  }

  // Khóa vòng đời một chiều: Quyết định đã APPROVED hoặc REJECTED không được sửa hoặc đảo ngược trạng thái
  if (existing.status !== "PENDING") {
    throw new PersonnelChangeError(
      `Quyết định ${existing.code} đã ở trạng thái "${existing.status}" (đã ban hành hoặc đã xử lý), không thể sửa đổi hoặc chuyển sang "${status}". Nếu cần điều chỉnh, vui lòng lập quyết định biến động mới.`,
      400
    );
  }

  const overrideSalary = parseProposedSalary(body.newSalary);
  const effectiveSalary = overrideSalary ?? existing.newSalary;

  if (roleName === "HR") {
    if (
      (existing.employeeEmail &&
        actor.userEmail &&
        existing.employeeEmail.toLowerCase() ===
          actor.userEmail.toLowerCase()) ||
      (existing.employeeId && actor.userId)
    ) {
      if (
        existing.employeeEmail &&
        actor.userEmail &&
        existing.employeeEmail.toLowerCase() === actor.userEmail.toLowerCase()
      ) {
        throw new PersonnelChangeError(
          "Nhân sự (HR) không được tự phê duyệt quyết định biến động của chính mình.",
          403
        );
      }
      if (existing.employeeId && actor.userId) {
        const selfEmp = await prisma.employeeProfile.findUnique({
          where: { id: existing.employeeId },
          select: { userId: true },
        });
        if (selfEmp && selfEmp.userId === actor.userId) {
          throw new PersonnelChangeError(
            "Nhân sự (HR) không được tự phê duyệt quyết định biến động của chính mình.",
            403
          );
        }
      }
    }

    if (existing.employeeEmail) {
      const targetUser = await prisma.user.findUnique({
        where: { email: existing.employeeEmail },
        include: { role: true },
      });
      if (
        targetUser &&
        ["SYSTEM_ADMIN", "BOD"].includes(targetUser.role?.name || "")
      ) {
        throw new PersonnelChangeError(
          "Nhân sự (HR) không có thẩm quyền phê duyệt quyết định đối với Quản trị hệ thống hoặc Ban Giám Đốc.",
          403
        );
      }
    }
  }

  const referenceIso = referenceDate.toISOString().slice(0, 10);

  return prisma.$transaction(
    async (tx) => {
      const fresh = await tx.personnelChange.findUnique({ where: { id } });
      if (!fresh || fresh.status !== "PENDING") {
        throw new PersonnelChangeError(
          "Trạng thái quyết định đã thay đổi, không thể phê duyệt lại.",
          400
        );
      }

      const shouldApplyImmediately =
        status === "APPROVED" && fresh.effectiveDate <= referenceIso;

      let record = await tx.personnelChange.update({
        where: { id },
        data: {
          status,
          newSalary: effectiveSalary,
          signer: actor.userName || fresh.signer,
        },
      });

      if (shouldApplyImmediately) {
        const synced = await syncEmployeeFromApprovedDecision(
          tx,
          record,
          effectiveSalary
        );
        if (synced) {
          record = await tx.personnelChange.update({
            where: { id },
            data: { appliedAt: new Date() },
          });
        }
      }

      const salaryNote =
        effectiveSalary && effectiveSalary > 0
          ? ` - Lương áp dụng: ${effectiveSalary.toLocaleString("vi-VN")} VNĐ`
          : "";
      const scheduleNote =
        status === "APPROVED" && fresh.effectiveDate > referenceIso
          ? ` (Chờ đến ngày hiệu lực ${fresh.effectiveDate})`
          : "";

      await tx.auditLog.create({
        data: {
          userName: actor.userName || "Ban Giám Đốc",
          userRole: roleName,
          action: `${
            status === "APPROVED" ? "Phê duyệt ban hành" : "Từ chối"
          } Quyết định biến động nhân sự ${fresh.code} (${fresh.employeeName}${salaryNote})${scheduleNote}`,
          target: "PersonnelChange",
          ip: "127.0.0.1",
          status: status === "APPROVED" ? "SUCCESS" : "WARNING",
        },
      });

      return record;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}
