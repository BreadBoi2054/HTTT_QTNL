import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type Scope = { userId: string; roleName: string; actorName: string };
const approverRoles = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"];

async function visibleEmployeeIds(scope: Scope): Promise<string[] | undefined> {
  if (["SYSTEM_ADMIN", "BOD", "HR", "ACCOUNTANT"].includes(scope.roleName)) return undefined;
  const own = await prisma.employeeProfile.findUnique({ where: { userId: scope.userId }, select: { id: true, managedDept: { select: { id: true } } } });
  if (!own) return [];
  if (scope.roleName !== "MANAGER" || !own.managedDept) return [own.id];
  const members = await prisma.employeeProfile.findMany({ where: { departmentId: own.managedDept.id }, select: { id: true } });
  return [...new Set([own.id, ...members.map((member) => member.id)])];
}

export function evaluateOvertimeThresholds(monthlyHours: number, yearlyHours: number) {
  const warnings: string[] = [];
  const exceedsMonthly40 = monthlyHours > 40;
  const exceedsYearly200 = yearlyHours > 200;
  const exceedsYearly300 = yearlyHours > 300;

  if (exceedsMonthly40) {
    warnings.push(
      `Lũy kế tháng (${monthlyHours}h) vượt ngưỡng 40h/tháng · Duyệt theo thỏa thuận 2 bên / công việc cấp bách.`
    );
  }
  if (exceedsYearly300) {
    warnings.push(
      `Lũy kế năm (${yearlyHours}h) vượt trần đặc thù 300h/năm (Điều 107/108 BLLĐ 2019).`
    );
  } else if (exceedsYearly200) {
    warnings.push(
      `Lũy kế năm (${yearlyHours}h) vượt ngưỡng chuẩn 200h/năm (trong khung đặc thù 300h/năm).`
    );
  }

  return {
    monthlyHours,
    yearlyHours,
    exceedsMonthly40,
    exceedsYearly200,
    exceedsYearly300,
    warnings,
  };
}

export async function getOvertimeRequests(scope: Scope, month?: number, year?: number) {
  const ids = await visibleEmployeeIds(scope);
  const date = month && year ? {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  } : undefined;
  const requests = await prisma.overtimeRequest.findMany({
    where: { ...(ids ? { employeeId: { in: ids } } : {}), ...(date ? { date } : {}) },
    include: { employee: { select: { userId: true, user: { select: { name: true } }, department: { select: { name: true } } } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  if (requests.length === 0) return [];

  const empIds = [...new Set(requests.map((r) => r.employeeId))];
  const years = [...new Set(requests.map((r) => r.date.getUTCFullYear()))];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const allActiveYearRequests = await prisma.overtimeRequest.findMany({
    where: {
      employeeId: { in: empIds },
      status: { in: ["APPROVED", "PENDING"] },
      date: {
        gte: new Date(Date.UTC(minYear, 0, 1)),
        lt: new Date(Date.UTC(maxYear + 1, 0, 1)),
      },
    },
    select: { employeeId: true, date: true, hours: true, status: true },
  });

  const monthlyTotals = new Map<string, number>();
  const yearlyTotals = new Map<string, number>();

  for (const item of allActiveYearRequests) {
    const y = item.date.getUTCFullYear();
    const m = item.date.getUTCMonth() + 1;
    const mKey = `${item.employeeId}:${y}-${m}`;
    const yKey = `${item.employeeId}:${y}`;
    monthlyTotals.set(mKey, (monthlyTotals.get(mKey) || 0) + item.hours);
    yearlyTotals.set(yKey, (yearlyTotals.get(yKey) || 0) + item.hours);
  }

  return requests.map((req) => {
    const y = req.date.getUTCFullYear();
    const m = req.date.getUTCMonth() + 1;
    const monthlyAccumulatedHours = monthlyTotals.get(`${req.employeeId}:${y}-${m}`) || req.hours;
    const yearlyAccumulatedHours = yearlyTotals.get(`${req.employeeId}:${y}`) || req.hours;
    const thresholdInfo = evaluateOvertimeThresholds(monthlyAccumulatedHours, yearlyAccumulatedHours);
    return {
      ...req,
      monthlyAccumulatedHours,
      yearlyAccumulatedHours,
      warnings: thresholdInfo.warnings,
    };
  });
}

export async function createOvertimeRequest(scope: Scope, data: { employeeId?: string; date?: string; hours?: number; reason?: string }) {
  const dateText = data.date;
  const hours = Number(data.hours);
  if (!dateText || !/^\d{4}-\d{2}-\d{2}$/.test(dateText) || !Number.isFinite(new Date(`${dateText}T00:00:00.000Z`).getTime()) ||
      new Date(`${dateText}T00:00:00.000Z`).toISOString().slice(0, 10) !== dateText) throw new Error("Ngày làm thêm không hợp lệ.");
  if (!Number.isFinite(hours) || hours <= 0 || hours > 12 || hours * 2 !== Math.round(hours * 2)) {
    throw new Error("Số giờ OT phải từ 0,5 đến 12 giờ, theo bước 0,5 giờ.");
  }
  const self = await prisma.employeeProfile.findUnique({ where: { userId: scope.userId }, select: { id: true } });
  const canCreateForOthers = ["SYSTEM_ADMIN", "BOD", "HR"].includes(scope.roleName);
  const employeeId = canCreateForOthers && data.employeeId ? data.employeeId : self?.id;
  if (!employeeId || (!canCreateForOthers && data.employeeId && data.employeeId !== self?.id)) throw new Error("Không có quyền tạo đơn OT cho nhân viên này.");
  const employee = await prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { status: true, user: { select: { name: true } } } });
  if (!employee || ["RESIGNED", "SUSPENDED"].includes(employee.status)) throw new Error("Nhân viên không hoạt động.");

  return prisma.$transaction(async (tx) => {
    const overtimeDate = new Date(`${dateText}T00:00:00.000Z`);
    const payroll = await tx.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month: overtimeDate.getUTCMonth() + 1,
          year: overtimeDate.getUTCFullYear(),
        },
      },
      select: { status: true },
    });
    if (payroll?.status === "PAID") {
      throw new Error("Kỳ lương tháng này đã khóa sổ (PAID); không thể tạo đơn OT.");
    }

    const [approvedLeave, workedAttendance] = await Promise.all([
      tx.leaveRequest.findFirst({
        where: {
          employeeId,
          status: "APPROVED",
          startDate: { lte: overtimeDate },
          endDate: { gte: overtimeDate },
        },
        select: { id: true },
      }),
      tx.attendance.findUnique({
        where: { employeeId_date: { employeeId, date: overtimeDate } },
        select: { status: true, checkIn: true },
      }),
    ]);

    const actuallyWorked =
      workedAttendance &&
      (["PRESENT", "LATE"].includes(workedAttendance.status) || Boolean(workedAttendance.checkIn));

    if (approvedLeave && !actuallyWorked) {
      throw new Error("Không thể đăng ký OT vào ngày đang nghỉ phép đã duyệt.");
    }

    const existing = await tx.overtimeRequest.findUnique({ where: { employeeId_date: { employeeId, date: overtimeDate } } });
    if (existing && existing.status !== "REJECTED") throw new Error("Ngày này đã có đơn OT đang chờ hoặc đã duyệt.");
    const created = existing
      ? await tx.overtimeRequest.update({ where: { id: existing.id, status: "REJECTED" }, data: { hours, reason: data.reason?.trim().slice(0, 500) || null, status: "PENDING", approvedBy: null, approvedAt: null } })
      : await tx.overtimeRequest.create({ data: { employeeId, date: overtimeDate, hours, reason: data.reason?.trim().slice(0, 500) || null } });
    await tx.auditLog.create({ data: { userName: scope.actorName, userRole: scope.roleName, action: `Đề nghị OT ${hours} giờ ngày ${dateText} cho ${employee.user.name}`, target: "OvertimeRequest", ip: "127.0.0.1", status: "SUCCESS" } });
    return created;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}

export async function decideOvertimeRequest(scope: Scope, id: string, decision: "APPROVED" | "REJECTED") {
  if (!approverRoles.includes(scope.roleName) || !["APPROVED", "REJECTED"].includes(decision)) throw new Error("Không có quyền phê duyệt OT.");
  return prisma.$transaction(async (tx) => {
    const request = await tx.overtimeRequest.findUnique({ where: { id }, include: { employee: { select: { userId: true, departmentId: true, user: { select: { name: true } } } } } });
    if (!request || request.status !== "PENDING") throw new Error("Đơn OT không còn chờ duyệt.");
    if (request.employee.userId === scope.userId) throw new Error("Không thể tự duyệt OT của mình.");
    if (scope.roleName === "MANAGER") {
      const managed = await tx.department.findFirst({ where: { manager: { userId: scope.userId } }, select: { id: true } });
      if (!managed || managed.id !== request.employee.departmentId) throw new Error("Chỉ quản lý trực tiếp mới được duyệt OT của phòng mình.");
    }
    const payroll = await tx.payroll.findUnique({ where: { employeeId_month_year: { employeeId: request.employeeId, month: request.date.getUTCMonth() + 1, year: request.date.getUTCFullYear() } }, select: { status: true } });
    if (payroll?.status === "PAID") throw new Error("Kỳ lương đã khóa; cần xử lý điều chỉnh riêng.");

    let agreementNote = "";
    if (decision === "APPROVED") {
      const reqYear = request.date.getUTCFullYear();
      const reqMonth = request.date.getUTCMonth();
      const [approvedLeave, workedAttendance, monthAggregate, yearAggregate] = await Promise.all([
        tx.leaveRequest.findFirst({
          where: {
            employeeId: request.employeeId,
            status: "APPROVED",
            startDate: { lte: request.date },
            endDate: { gte: request.date },
          },
          select: { id: true },
        }),
        tx.attendance.findUnique({
          where: { employeeId_date: { employeeId: request.employeeId, date: request.date } },
          select: { status: true, checkIn: true },
        }),
        tx.overtimeRequest.aggregate({
          where: {
            employeeId: request.employeeId,
            status: "APPROVED",
            date: {
              gte: new Date(Date.UTC(reqYear, reqMonth, 1)),
              lt: new Date(Date.UTC(reqYear, reqMonth + 1, 1)),
            },
          },
          _sum: { hours: true },
        }),
        tx.overtimeRequest.aggregate({
          where: {
            employeeId: request.employeeId,
            status: "APPROVED",
            date: {
              gte: new Date(Date.UTC(reqYear, 0, 1)),
              lt: new Date(Date.UTC(reqYear + 1, 0, 1)),
            },
          },
          _sum: { hours: true },
        }),
      ]);
      const actuallyWorked =
        workedAttendance &&
        (["PRESENT", "LATE"].includes(workedAttendance.status) || Boolean(workedAttendance.checkIn));
      if (approvedLeave && !actuallyWorked) {
        throw new Error("Không thể duyệt OT vào ngày nhân sự đang nghỉ phép đã duyệt.");
      }

      const newMonthlyTotal = (monthAggregate._sum.hours || 0) + request.hours;
      const newYearlyTotal = (yearAggregate._sum.hours || 0) + request.hours;
      if (newMonthlyTotal > 40 || newYearlyTotal > 200) {
        agreementNote = ` [Xác nhận thỏa thuận 2 bên: Lũy kế tháng ${newMonthlyTotal}h, năm ${newYearlyTotal}h]`;
      }
    }

    const updated = await tx.overtimeRequest.update({ where: { id, status: "PENDING" }, data: { status: decision, approvedBy: scope.userId, approvedAt: new Date() } });
    await tx.auditLog.create({ data: { userName: scope.actorName, userRole: scope.roleName, action: `${decision === "APPROVED" ? "Duyệt" : "Từ chối"} OT ${request.hours} giờ ngày ${request.date.toISOString().slice(0, 10)} của ${request.employee.user.name}${agreementNote}`, target: "OvertimeRequest", ip: "127.0.0.1", status: "SUCCESS" } });
    return updated;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}
