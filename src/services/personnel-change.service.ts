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

export function formatVietnamDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (year && month && day) {
    return `${year}-${month}-${day}`;
  }
  return date.toISOString().slice(0, 10);
}

export function normalizeEffectiveDateString(rawDate?: string): string {
  const trimmed = String(rawDate || "").trim();
  let isoCandidate = trimmed;

  const dmyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (dmyMatch) {
    isoCandidate = `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
  } else if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const parsedIso = new Date(trimmed);
    if (!Number.isNaN(parsedIso.getTime())) {
      isoCandidate = formatVietnamDate(parsedIso);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoCandidate)) {
    throw new PersonnelChangeError(
      "Ngày có hiệu lực thi hành không hợp lệ (định dạng chuẩn YYYY-MM-DD hoặc DD/MM/YYYY).",
      400
    );
  }
  const parsed = new Date(`${isoCandidate}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== isoCandidate
  ) {
    throw new PersonnelChangeError(
      "Ngày có hiệu lực thi hành không tồn tại trên lịch.",
      400
    );
  }
  return isoCandidate;
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
): Promise<{
  synced: boolean;
  employeeId: string | null;
  fromDeptId: string | null;
  toDeptId: string | null;
  toDeptName: string;
}> {
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

  const resolvedDept = await resolveTargetDepartment(
    tx,
    change.type,
    change.toDeptId,
    change.toDept
  );

  if (!employeeProfile) {
    if (change.type === "NEW_HIRE") {
      return {
        synced: false,
        employeeId: null,
        fromDeptId: null,
        toDeptId: resolvedDept.id,
        toDeptName: resolvedDept.name,
      };
    }
    throw new PersonnelChangeError(
      "Không tìm thấy hồ sơ nhân sự để đồng bộ quyết định biến động.",
      400
    );
  }

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

  return {
    synced: true,
    employeeId: employeeProfile.id,
    fromDeptId: employeeProfile.departmentId ?? null,
    toDeptId: resolvedDept.id,
    toDeptName: resolvedDept.name,
  };
}

export interface AppliedDuePersonnelChangesResult extends Array<string> {
  appliedIds: string[];
  skippedUnverified: Array<{
    id: string;
    code: string;
    employeeName: string;
    effectiveDate: string;
    reason: string;
  }>;
  failed: Array<{
    id: string;
    code: string;
    employeeName: string;
    effectiveDate: string;
    error: string;
  }>;
  referenceDateIso: string;
}

export function isUnverifiedHistoricalDecision(change: {
  status: string;
  appliedAt?: Date | string | null;
  employeeId?: string | null;
  toDeptId?: string | null;
  type?: string;
}): boolean {
  if (change.status !== "APPROVED" || change.appliedAt !== null) {
    return false;
  }
  const hasEmployeeId = Boolean(change.employeeId && String(change.employeeId).trim());
  const hasToDeptId =
    change.type === "RESIGNATION" ||
    Boolean(change.toDeptId && String(change.toDeptId).trim());
  return !hasEmployeeId && !hasToDeptId;
}

export async function applyDuePersonnelChanges(
  referenceDate: Date = new Date(),
  options?: {
    actorName?: string;
    actorRole?: string;
  }
): Promise<AppliedDuePersonnelChangesResult> {
  const referenceIso = formatVietnamDate(referenceDate);
  const actorName = options?.actorName || "Hệ thống / Tự động theo ngày hiệu lực";
  const actorRole = options?.actorRole || "SYSTEM_ADMIN";

  const candidateChanges = await prisma.personnelChange.findMany({
    where: {
      status: "APPROVED",
      appliedAt: null,
    },
    orderBy: [{ createdAt: "asc" }],
  });

  const appliedIds: string[] = [];
  const skippedUnverified: AppliedDuePersonnelChangesResult["skippedUnverified"] = [];
  const failed: AppliedDuePersonnelChangesResult["failed"] = [];

  for (const item of candidateChanges) {
    let normalizedEffectiveDate: string;
    try {
      normalizedEffectiveDate = normalizeEffectiveDateString(item.effectiveDate);
    } catch (dateErr: unknown) {
      const msg =
        dateErr instanceof Error
          ? dateErr.message
          : "Ngày hiệu lực không hợp lệ.";
      failed.push({
        id: item.id,
        code: item.code,
        employeeName: item.employeeName,
        effectiveDate: item.effectiveDate,
        error: msg,
      });
      continue;
    }

    if (normalizedEffectiveDate > referenceIso) {
      continue;
    }

    // Chặn tự động thi hành lại các quyết định lịch sử chưa được xác minh khóa định danh
    if (isUnverifiedHistoricalDecision(item)) {
      skippedUnverified.push({
        id: item.id,
        code: item.code,
        employeeName: item.employeeName,
        effectiveDate: normalizedEffectiveDate,
        reason:
          "Quyết định lịch sử tạo trước khi có cơ chế đóng dấu appliedAt và định danh hồ sơ; cần HR đối chiếu thủ công để tránh ghi đè hồ sơ nhân sự mới hơn.",
      });
      continue;
    }

    try {
      await prisma.$transaction(
        async (tx) => {
          const fresh = await tx.personnelChange.findUnique({
            where: { id: item.id },
          });
          if (!fresh || fresh.status !== "APPROVED" || fresh.appliedAt !== null) {
            return;
          }
          const freshEffectiveIso = normalizeEffectiveDateString(fresh.effectiveDate);
          if (freshEffectiveIso > referenceIso) {
            return;
          }
          if (isUnverifiedHistoricalDecision(fresh)) {
            return;
          }

          const syncResult = await syncEmployeeFromApprovedDecision(tx, fresh);
          if (syncResult.synced) {
            const updateResult = await tx.personnelChange.updateMany({
              where: { id: fresh.id, appliedAt: null },
              data: {
                appliedAt: new Date(),
                effectiveDate: freshEffectiveIso,
                employeeId: fresh.employeeId ?? syncResult.employeeId,
                toDeptId: fresh.toDeptId ?? syncResult.toDeptId,
              },
            });
            if (updateResult.count === 0) {
              return;
            }
            await tx.auditLog.create({
              data: {
                userName: actorName,
                userRole: actorRole,
                action: `Thi hành Quyết định biến động nhân sự đến hạn hiệu lực ${fresh.code} (${fresh.employeeName} - ngày hiệu lực ${freshEffectiveIso})`,
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
    } catch (err: unknown) {
      const prismaCode = (err as { code?: string })?.code;
      const errMsg = err instanceof Error ? err.message : "Lỗi không xác định khi đồng bộ hồ sơ.";
      if (
        prismaCode === "P2034" ||
        errMsg.includes("could not serialize access") ||
        errMsg.includes("deadlock")
      ) {
        const afterCheck = await prisma.personnelChange.findUnique({
          where: { id: item.id },
          select: { appliedAt: true },
        });
        if (afterCheck?.appliedAt) {
          continue;
        }
      }

      failed.push({
        id: item.id,
        code: item.code,
        employeeName: item.employeeName,
        effectiveDate: normalizedEffectiveDate,
        error: errMsg,
      });

      await prisma.auditLog
        .create({
          data: {
            userName: actorName,
            userRole: actorRole,
            action: `Lỗi khi thi hành Quyết định đến hạn ${item.code} (${item.employeeName}): ${errMsg}`,
            target: "PersonnelChange",
            ip: "127.0.0.1",
            status: "WARNING",
          },
        })
        .catch(() => undefined);
    }
  }

  return Object.assign([...appliedIds], {
    appliedIds,
    skippedUnverified,
    failed,
    referenceDateIso: referenceIso,
  });
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

  const referenceIso = formatVietnamDate(referenceDate);
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
        const syncResult = await syncEmployeeFromApprovedDecision(
          tx,
          created,
          proposedSalary
        );
        if (syncResult.synced) {
          finalRecord = await tx.personnelChange.update({
            where: { id: created.id },
            data: {
              appliedAt: new Date(),
              employeeId: created.employeeId ?? syncResult.employeeId,
              toDeptId: created.toDeptId ?? syncResult.toDeptId,
            },
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

  const referenceIso = formatVietnamDate(referenceDate);

  return prisma.$transaction(
    async (tx) => {
      const fresh = await tx.personnelChange.findUnique({ where: { id } });
      if (!fresh || fresh.status !== "PENDING") {
        throw new PersonnelChangeError(
          "Trạng thái quyết định đã thay đổi, không thể phê duyệt lại.",
          400
        );
      }

      const normalizedEffectiveDate = normalizeEffectiveDateString(
        fresh.effectiveDate
      );

      let resolvedEmpId = fresh.employeeId;
      let resolvedFromDeptId = fresh.fromDeptId;
      let resolvedToDeptId = fresh.toDeptId;
      let resolvedToDeptName = fresh.toDept;

      if (status === "APPROVED") {
        if (!resolvedEmpId && fresh.employeeEmail) {
          const matchedUser = await tx.user.findUnique({
            where: { email: fresh.employeeEmail },
            include: { employee: true },
          });
          if (matchedUser?.employee) {
            resolvedEmpId = matchedUser.employee.id;
            resolvedFromDeptId =
              resolvedFromDeptId ?? matchedUser.employee.departmentId ?? null;
          } else if (fresh.type !== "NEW_HIRE") {
            throw new PersonnelChangeError(
              "Không tìm thấy hồ sơ nhân sự để phê duyệt quyết định biến động.",
              400
            );
          }
        }
        const resolvedDept = await resolveTargetDepartment(
          tx,
          fresh.type,
          fresh.toDeptId,
          fresh.toDept
        );
        resolvedToDeptId = resolvedDept.id;
        resolvedToDeptName = resolvedDept.name;
      }

      const shouldApplyImmediately =
        status === "APPROVED" && normalizedEffectiveDate <= referenceIso;

      let record = await tx.personnelChange.update({
        where: { id },
        data: {
          status,
          effectiveDate: normalizedEffectiveDate,
          employeeId: resolvedEmpId,
          fromDeptId: resolvedFromDeptId,
          toDeptId: resolvedToDeptId,
          toDept: resolvedToDeptName,
          newSalary: effectiveSalary,
          signer: actor.userName || fresh.signer,
        },
      });

      if (shouldApplyImmediately) {
        const syncResult = await syncEmployeeFromApprovedDecision(
          tx,
          record,
          effectiveSalary
        );
        if (syncResult.synced) {
          record = await tx.personnelChange.update({
            where: { id },
            data: {
              appliedAt: new Date(),
              employeeId: record.employeeId ?? syncResult.employeeId,
              toDeptId: record.toDeptId ?? syncResult.toDeptId,
            },
          });
        }
      }

      const salaryNote =
        effectiveSalary && effectiveSalary > 0
          ? ` - Lương áp dụng: ${effectiveSalary.toLocaleString("vi-VN")} VNĐ`
          : "";
      const scheduleNote =
        status === "APPROVED" && normalizedEffectiveDate > referenceIso
          ? ` (Chờ đến ngày hiệu lực ${normalizedEffectiveDate})`
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

export type DecisionLifecycleState =
  | "APPLIED"
  | "SCHEDULED"
  | "DUE_READY"
  | "HISTORICAL_MATCHED"
  | "HISTORICAL_NEEDS_REVIEW"
  | "PENDING"
  | "REJECTED";

export async function enrichPersonnelChangesWithLifecycle<
  T extends {
    id: string;
    code: string;
    employeeId?: string | null;
    employeeEmail: string;
    type: string;
    toDeptId?: string | null;
    toDept: string;
    toPosition: string;
    newSalary?: number | null;
    effectiveDate: string;
    appliedAt?: Date | string | null;
    status: string;
  },
>(changes: T[], referenceDate: Date = new Date()) {
  const referenceIso = formatVietnamDate(referenceDate);
  const unappliedApproved = changes.filter(
    (c) => c.status === "APPROVED" && !c.appliedAt
  );

  if (unappliedApproved.length === 0) {
    return changes.map((c) => ({
      ...c,
      effectiveDateIso: (() => {
        try {
          return normalizeEffectiveDateString(c.effectiveDate);
        } catch {
          return c.effectiveDate;
        }
      })(),
      lifecycleState: (c.status === "APPROVED"
        ? "APPLIED"
        : c.status === "REJECTED"
          ? "REJECTED"
          : "PENDING") as DecisionLifecycleState,
      lifecycleNote: null as string | null,
    }));
  }

  const emails = [
    ...new Set(unappliedApproved.map((c) => c.employeeEmail).filter(Boolean)),
  ];
  const empIds = [
    ...new Set(
      unappliedApproved
        .map((c) => c.employeeId)
        .filter((v): v is string => Boolean(v))
    ),
  ];

  const [profiles, departments] = await Promise.all([
    prisma.employeeProfile.findMany({
      where: {
        OR: [
          ...(empIds.length > 0 ? [{ id: { in: empIds } }] : []),
          ...(emails.length > 0 ? [{ user: { email: { in: emails } } }] : []),
        ],
      },
      include: {
        user: { select: { email: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.department.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const profileByEmail = new Map(
    profiles.map((p) => [p.user.email.toLowerCase(), p])
  );
  const deptByName = new Map(
    departments.map((d) => [d.name.trim().toLowerCase(), d])
  );

  return changes.map((c) => {
    let effectiveDateIso = c.effectiveDate;
    try {
      effectiveDateIso = normalizeEffectiveDateString(c.effectiveDate);
    } catch {
      // Giữ nguyên nếu chuỗi ngày lịch sử bị lỗi định dạng
    }

    if (c.status === "REJECTED") {
      return {
        ...c,
        effectiveDateIso,
        lifecycleState: "REJECTED" as DecisionLifecycleState,
        lifecycleNote: null,
      };
    }
    if (c.status !== "APPROVED") {
      return {
        ...c,
        effectiveDateIso,
        lifecycleState: "PENDING" as DecisionLifecycleState,
        lifecycleNote: null,
      };
    }
    if (c.appliedAt) {
      return {
        ...c,
        effectiveDateIso,
        lifecycleState: "APPLIED" as DecisionLifecycleState,
        lifecycleNote: null,
      };
    }

    if (effectiveDateIso > referenceIso) {
      return {
        ...c,
        effectiveDateIso,
        lifecycleState: "SCHEDULED" as DecisionLifecycleState,
        lifecycleNote: `Chờ đến ngày hiệu lực ${effectiveDateIso}`,
      };
    }

    if (!isUnverifiedHistoricalDecision(c)) {
      return {
        ...c,
        effectiveDateIso,
        lifecycleState: "DUE_READY" as DecisionLifecycleState,
        lifecycleNote: `Đã đến ngày hiệu lực (${effectiveDateIso}), sẵn sàng thi hành`,
      };
    }

    const matchedProfile =
      (c.employeeId ? profileById.get(c.employeeId) : undefined) ||
      profileByEmail.get(c.employeeEmail.toLowerCase());
    const matchedDept = deptByName.get(c.toDept.trim().toLowerCase());

    if (!matchedProfile) {
      return {
        ...c,
        effectiveDateIso,
        lifecycleState: "HISTORICAL_NEEDS_REVIEW" as DecisionLifecycleState,
        lifecycleNote:
          c.type === "NEW_HIRE"
            ? "Quyết định lịch sử tiếp nhận nhân sự chưa khởi tạo hồ sơ EmployeeProfile; cần HR đối chiếu onboarding."
            : "Quyết định lịch sử không tìm thấy hồ sơ nhân sự khớp; cần HR đối chiếu.",
      };
    }

    const positionMatched =
      matchedProfile.position.trim().toLowerCase() ===
      c.toPosition.trim().toLowerCase();
    const deptMatched =
      c.type === "RESIGNATION"
        ? matchedProfile.status === "RESIGNED"
        : Boolean(
            matchedDept && matchedProfile.departmentId === matchedDept.id
          );

    if (positionMatched && deptMatched) {
      return {
        ...c,
        effectiveDateIso,
        lifecycleState: "HISTORICAL_MATCHED" as DecisionLifecycleState,
        lifecycleNote:
          "Quyết định lịch sử đã khớp với hồ sơ thực tế hiện tại (chưa đóng dấu appliedAt).",
      };
    }

    return {
      ...c,
      effectiveDateIso,
      lifecycleState: "HISTORICAL_NEEDS_REVIEW" as DecisionLifecycleState,
      lifecycleNote:
        "Quyết định lịch sử khác biệt với hồ sơ/phòng ban hiện tại; đã khóa tự động chạy lại để tránh ghi đè hồ sơ mới hơn.",
    };
  });
}

export async function reconcileHistoricalPersonnelChange(
  actor: PersonnelChangeActor,
  body: Record<string, unknown>
) {
  const roleName = actor.roleName || "USER";
  if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
    throw new PersonnelChangeError(
      "Chỉ Quản trị hệ thống, Ban Giám Đốc hoặc Nhân sự mới có quyền đối chiếu quyết định lịch sử.",
      403
    );
  }

  const id = String(body.id || "").trim();
  const action = String(body.reconcileAction || "").trim();
  if (!id || !["MARK_HISTORICAL_APPLIED", "APPLY_DECISION_NOW"].includes(action)) {
    throw new PersonnelChangeError(
      "Thao tác đối chiếu quyết định lịch sử không hợp lệ.",
      400
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const decision = await tx.personnelChange.findUnique({ where: { id } });
      if (!decision) {
        throw new PersonnelChangeError("Không tìm thấy quyết định biến động.", 404);
      }
      if (decision.status !== "APPROVED") {
        throw new PersonnelChangeError(
          "Chỉ có thể đối chiếu các quyết định ở trạng thái APPROVED.",
          400
        );
      }
      if (decision.appliedAt) {
        return decision;
      }

      const normalizedEffectiveDate = normalizeEffectiveDateString(
        decision.effectiveDate
      );

      if (action === "MARK_HISTORICAL_APPLIED") {
        const matchedUser = decision.employeeEmail
          ? await tx.user.findUnique({
              where: { email: decision.employeeEmail },
              include: { employee: true },
            })
          : null;
        const matchedDept = await tx.department.findFirst({
          where: { name: { equals: decision.toDept.trim(), mode: "insensitive" } },
        });

        const updated = await tx.personnelChange.update({
          where: { id: decision.id },
          data: {
            appliedAt: new Date(),
            effectiveDate: normalizedEffectiveDate,
            employeeId: decision.employeeId ?? matchedUser?.employee?.id ?? null,
            toDeptId: decision.toDeptId ?? matchedDept?.id ?? null,
          },
        });

        await tx.auditLog.create({
          data: {
            userName: actor.userName || "Nhân sự / Quản trị",
            userRole: roleName,
            action: `Xác nhận đối chiếu lịch sử (đóng dấu đã thi hành, giữ nguyên hồ sơ hiện tại) cho Quyết định ${decision.code} (${decision.employeeName})`,
            target: "PersonnelChange",
            ip: "127.0.0.1",
            status: "SUCCESS",
          },
        });

        return updated;
      }

      const syncResult = await syncEmployeeFromApprovedDecision(tx, decision);
      if (!syncResult.synced) {
        throw new PersonnelChangeError(
          "Không thể thi hành quyết định tiếp nhận mới khi ứng viên chưa có hồ sơ nhân sự (EmployeeProfile).",
          400
        );
      }

      const updated = await tx.personnelChange.update({
        where: { id: decision.id },
        data: {
          appliedAt: new Date(),
          effectiveDate: normalizedEffectiveDate,
          employeeId: decision.employeeId ?? syncResult.employeeId,
          toDeptId: decision.toDeptId ?? syncResult.toDeptId,
        },
      });

      await tx.auditLog.create({
        data: {
          userName: actor.userName || "Nhân sự / Quản trị",
          userRole: roleName,
          action: `Xác nhận thi hành thủ công Quyết định ${decision.code} (${decision.employeeName})`,
          target: "PersonnelChange",
          ip: "127.0.0.1",
          status: "SUCCESS",
        },
      });

      return updated;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

