import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { defaultWorkCalendar, isScheduledWorkday, type WorkCalendar } from "@/lib/work-calendar";
import { getWorkCalendar } from "@/services/work-calendar.service";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export function toUtcDateOnly(date: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

type Calendars = Map<number, WorkCalendar>;
type LeaveInput = {
  employeeId?: string;
  startDate: string | Date;
  endDate: string | Date;
  type: string;
  reason?: string | null;
};

async function loadCalendars(startDate: Date, endDate: Date, client: Prisma.TransactionClient | typeof prisma = prisma): Promise<Calendars> {
  const calendars: Calendars = new Map();
  for (let year = startDate.getUTCFullYear(); year <= endDate.getUTCFullYear(); year++) {
    calendars.set(year, await getWorkCalendar(year, client));
  }
  return calendars;
}

export function calculateWorkingDays(startDate: Date, endDate: Date, configured?: Calendars): number {
  let count = 0;
  const cur = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  const calendars = configured ?? new Map<number, WorkCalendar>();
  while (cur <= end) {
    const year = cur.getUTCFullYear();
    if (!calendars.has(year)) calendars.set(year, defaultWorkCalendar(year));
    const calendar = calendars.get(year)!;
    if (isScheduledWorkday(cur, calendar.holidays, calendar.extraWorkdays)) {
      count++;
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

function workingDates(startDate: Date, endDate: Date, configured?: Calendars): Date[] {
  const dates: Date[] = [];
  const cur = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  const calendars = configured ?? new Map<number, WorkCalendar>();
  while (cur <= end) {
    const year = cur.getUTCFullYear();
    if (!calendars.has(year)) calendars.set(year, defaultWorkCalendar(year));
    const calendar = calendars.get(year)!;
    if (isScheduledWorkday(cur, calendar.holidays, calendar.extraWorkdays)) dates.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

async function clearLeaveAttendance(tx: Prisma.TransactionClient, leaveRequestId: string): Promise<void> {
  const linked = await tx.attendance.findMany({
    where: { leaveRequestId },
    select: { id: true, status: true, statusBeforeLeave: true, checkIn: true, checkOut: true },
  });
  for (const record of linked) {
    if (record.status === "LEAVE" && !record.checkIn && !record.checkOut) {
      if (record.statusBeforeLeave === null) {
        await tx.attendance.delete({ where: { id: record.id } });
      } else {
        await tx.attendance.update({
          where: { id: record.id },
          data: { status: record.statusBeforeLeave, leaveRequestId: null, statusBeforeLeave: null },
        });
      }
    } else {
      await tx.attendance.update({
        where: { id: record.id },
        data: { leaveRequestId: null, statusBeforeLeave: null },
      });
    }
  }
}

export function workingDaysInYear(startDate: Date, endDate: Date, year: number, configured?: Calendars): number {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  const start = startDate > yearStart ? startDate : yearStart;
  const end = endDate < yearEnd ? endDate : yearEnd;
  return start <= end ? calculateWorkingDays(start, end, configured) : 0;
}

function leaveYears(startDate: Date, endDate: Date): number[] {
  const years: number[] = [];
  for (let year = startDate.getUTCFullYear(); year <= endDate.getUTCFullYear(); year++) {
    years.push(year);
  }
  return years;
}

function validateLeaveDateRange(start: Date, end: Date): void {
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new Error("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.");
  }
  if (start > end) {
    throw new Error("Ngày kết thúc không hợp lệ (nhỏ hơn ngày bắt đầu).");
  }
  if (start.getUTCFullYear() < 2000 || end.getUTCFullYear() > 2100 ||
      end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) {
    throw new Error("Khoảng thời gian nghỉ phép không hợp lệ hoặc dài quá một năm.");
  }
}

export async function getLeaveRequests(userId: string, roleName: string) {
  const isSuperAdminOrHR = ["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName);

  if (isSuperAdminOrHR) {
    return await prisma.leaveRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  } else if (roleName === "MANAGER") {
    const managerProfile = await prisma.employeeProfile.findUnique({
      where: { userId },
      include: { managedDept: true },
    });

    const deptId = managerProfile?.managedDept?.id;

    return await prisma.leaveRequest.findMany({
      where: deptId
        ? {
            OR: [{ employee: { departmentId: deptId } }, { employee: { userId } }],
          }
        : {
            employee: { userId },
          },
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  } else {
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId },
    });

    if (!employee) return [];

    return await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });
  }
}

export async function getLeaveBalance(
  employeeId: string,
  year: number = new Date().getFullYear(),
  client: Prisma.TransactionClient | typeof prisma = prisma
) {
  const profile = await client.employeeProfile.findUnique({
    where: { id: employeeId },
    select: { annualLeaveDays: true },
  });

  const allowance = profile?.annualLeaveDays ?? 12;

  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  const calendars = await loadCalendars(startOfYear, endOfYear, client);

  const leaves = await client.leaveRequest.findMany({
    where: {
      employeeId,
      type: "ANNUAL_LEAVE",
      status: { in: ["APPROVED", "PENDING"] },
      startDate: { lte: endOfYear },
      endDate: { gte: startOfYear },
    },
  });

  let usedDays = 0;
  let pendingDays = 0;
  for (const l of leaves) {
    const s = l.startDate < startOfYear ? startOfYear : l.startDate;
    const e = l.endDate > endOfYear ? endOfYear : l.endDate;
    const days = calculateWorkingDays(s, e, calendars);
    if (l.status === "APPROVED") {
      usedDays += days;
    } else if (l.status === "PENDING") {
      pendingDays += days;
    }
  }

  const remainingDays = Math.max(0, allowance - usedDays - pendingDays);

  return {
    allowance,
    totalAllowance: allowance,
    usedDays,
    pendingDays,
    remainingDays,
  };
}

export async function createLeaveRequest(
  userId: string,
  data: LeaveInput,
  userRole: string = "USER"
) {
  let employeeId = data.employeeId;
  let applicantName = "";

  if (employeeId && ["SYSTEM_ADMIN", "BOD", "HR"].includes(userRole)) {
    const targetEmp = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: { user: { select: SAFE_USER_SELECT } },
    });
    if (!targetEmp) throw new Error("Không tìm thấy nhân viên được chỉ định.");
    if (targetEmp.status === "RESIGNED" || targetEmp.status === "SUSPENDED") {
      throw new Error(
        "Nhân sự đã thôi việc hoặc đang bị tạm đình chỉ, không thể tạo đơn xin nghỉ phép."
      );
    }
    applicantName = targetEmp.user.name;
  } else {
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId },
      include: { user: { select: SAFE_USER_SELECT } },
    });
    if (!employee) throw new Error("Chỉ nhân viên mới có thể tạo đơn xin nghỉ phép.");
    if (employee.status === "RESIGNED" || employee.status === "SUSPENDED") {
      throw new Error(
        "Tài khoản nhân sự đã ngừng hoạt động hoặc đang tạm đình chỉ, không thể tạo đơn xin nghỉ phép."
      );
    }
    employeeId = employee.id;
    applicantName = employee.user.name;
  }

  const { startDate, endDate, type, reason } = data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  validateLeaveDateRange(start, end);
  if (!["ANNUAL_LEAVE", "SICK_LEAVE", "UNPAID_LEAVE"].includes(type)) {
    throw new Error("Loại nghỉ phép không hợp lệ.");
  }

  return prisma.$transaction(async (tx) => {
    const calendars = await loadCalendars(start, end, tx);
    if (calculateWorkingDays(start, end, calendars) <= 0) {
      throw new Error("Khoảng nghỉ không có ngày làm việc theo lịch công đã cấu hình.");
    }
    const overlapping = await tx.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping) {
      throw new Error(
        `Đã có đơn nghỉ phép (${overlapping.type} - trạng thái ${
          overlapping.status === "APPROVED" ? "Đã duyệt" : "Đang chờ duyệt"
        }) trùng khoảng thời gian này.`
      );
    }

    if (type === "ANNUAL_LEAVE") {
      for (const year of leaveYears(start, end)) {
        const requestedDays = workingDaysInYear(start, end, year, calendars);
        if (requestedDays === 0) continue;
        const balance = await getLeaveBalance(employeeId, year, tx);
        if (requestedDays > balance.remainingDays) {
          throw new Error(
            `Phép năm ${year} không đủ: còn ${balance.remainingDays} ngày, đơn xin ${requestedDays} ngày trong năm này.`
          );
        }
      }
    }

    const newRequest = await tx.leaveRequest.create({
      data: {
        employeeId,
        startDate: start,
        endDate: end,
        type,
        reason,
        status: "PENDING",
      },
    });

    await tx.auditLog.create({
      data: {
        userName: applicantName,
        userRole: userRole,
        action: `Khởi tạo đơn xin nghỉ phép [${type}] cho nhân sự ${applicantName} từ ngày ${startDate} đến ${endDate}`,
        target: "LeaveRequest",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return newRequest;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}

export async function updateLeaveRequestDetails(
  id: string,
  data: Partial<LeaveInput>,
  userRole: string = "USER",
  userId?: string
) {
  return prisma.$transaction(async (tx) => {
    const leave = await tx.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          include: { user: { select: SAFE_USER_SELECT } },
        },
      },
    });

    if (!leave) throw new Error("Không tìm thấy đơn nghỉ phép.");

    if (leave.status !== "PENDING") {
      throw new Error("Chỉ có thể chỉnh sửa thông tin đơn nghỉ phép đang ở trạng thái chờ duyệt (PENDING).");
    }

    const isOwner = userId && leave.employee.userId === userId;
    const isHighPrivilege = ["SYSTEM_ADMIN", "BOD", "HR"].includes(userRole);
    if (!isOwner && !isHighPrivilege) {
      throw new Error("Bạn không có quyền chỉnh sửa đơn nghỉ phép này.");
    }

    const start = data.startDate ? new Date(data.startDate) : leave.startDate;
    const end = data.endDate ? new Date(data.endDate) : leave.endDate;
    const type = data.type ?? leave.type;
    const reason = data.reason !== undefined ? data.reason : leave.reason;

    validateLeaveDateRange(start, end);
    if (!["ANNUAL_LEAVE", "SICK_LEAVE", "UNPAID_LEAVE"].includes(type)) {
      throw new Error("Loại nghỉ phép không hợp lệ.");
    }

    const overlapping = await tx.leaveRequest.findFirst({
      where: {
        id: { not: id },
        employeeId: leave.employeeId,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping) {
      throw new Error("Khoảng thời gian cập nhật bị trùng với một đơn nghỉ phép khác.");
    }

    const calendars = await loadCalendars(start, end, tx);
    const requestedWorkingDays = calculateWorkingDays(start, end, calendars);
    if (requestedWorkingDays <= 0) {
      throw new Error("Khoảng nghỉ không có ngày làm việc theo lịch công đã cấu hình.");
    }

    if (type === "ANNUAL_LEAVE") {
      for (const year of leaveYears(start, end)) {
        const requestedDays = workingDaysInYear(start, end, year, calendars);
        if (requestedDays === 0) continue;
        const balance = await getLeaveBalance(leave.employeeId, year, tx);
        const oldDays = leave.type === "ANNUAL_LEAVE"
          ? workingDaysInYear(leave.startDate, leave.endDate, year, await loadCalendars(leave.startDate, leave.endDate, tx))
          : 0;
        if (requestedDays > balance.remainingDays + oldDays) {
          throw new Error(`Phép năm ${year} không đủ cho khoảng thời gian cập nhật.`);
        }
      }
    }

    return await tx.leaveRequest.update({
      where: { id, status: "PENDING" },
      data: {
        startDate: start,
        endDate: end,
        type,
        reason,
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}

export async function updateLeaveRequestStatus(
  id: string,
  status: string,
  userRole: string,
  actorName?: string,
  actorUserId?: string
) {
  if (!["SYSTEM_ADMIN", "BOD", "MANAGER", "HR"].includes(userRole)) {
    throw new Error("Không có thẩm quyền phê duyệt đơn nghỉ phép.");
  }

  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Trạng thái phê duyệt không hợp lệ.");
  }

  return prisma.$transaction(async (tx) => {
    const leave = await tx.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          include: { user: { select: SAFE_USER_SELECT }, department: true },
        },
      },
    });

    if (!leave) throw new Error("Không tìm thấy đơn nghỉ phép.");

    const calendars = await loadCalendars(leave.startDate, leave.endDate, tx);

    if (
      actorUserId &&
      leave.employee.userId === actorUserId &&
      userRole !== "SYSTEM_ADMIN" &&
      userRole !== "BOD"
    ) {
      throw new Error("Bạn không thể tự phê duyệt đơn nghỉ phép của chính mình.");
    }

    if (userRole === "MANAGER") {
      const managerProfile = actorUserId
        ? await tx.employeeProfile.findUnique({
            where: { userId: actorUserId },
            include: { managedDept: true },
          })
        : null;

      const deptId = managerProfile?.managedDept?.id;
      if (!deptId || leave.employee.departmentId !== deptId) {
        throw new Error(
          "Bạn chỉ có quyền phê duyệt đơn nghỉ phép của nhân sự thuộc phòng ban mình phụ trách."
        );
      }
    }

    if (status === leave.status) return leave;

    if (status === "APPROVED" && leave.status !== "APPROVED") {
      const overlappingApproved = await tx.leaveRequest.findFirst({
        where: {
          id: { not: id },
          employeeId: leave.employeeId,
          status: "APPROVED",
          startDate: { lte: leave.endDate },
          endDate: { gte: leave.startDate },
        },
      });

      if (overlappingApproved) {
        throw new Error(
          "Nhân sự này đã có đơn nghỉ phép Đã duyệt trùng khoảng thời gian này."
        );
      }

      if (leave.type === "ANNUAL_LEAVE") {
        for (const year of leaveYears(leave.startDate, leave.endDate)) {
          const requestedDays = workingDaysInYear(leave.startDate, leave.endDate, year, calendars);
          if (requestedDays === 0) continue;
          const balance = await getLeaveBalance(leave.employeeId, year, tx);
          if (leave.status === "PENDING" &&
              balance.usedDays + balance.pendingDays > balance.totalAllowance) {
            throw new Error(`Không thể phê duyệt: quỹ phép năm ${year} đã vượt hạn mức.`);
          }
          if (leave.status === "REJECTED" && requestedDays > balance.remainingDays) {
            throw new Error(`Không thể phê duyệt: phép năm ${year} chỉ còn ${balance.remainingDays} ngày.`);
          }
        }
      }
    }

    const updated = await tx.leaveRequest.update({
      where: { id },
      data: { status },
    });

    if (status === "APPROVED" && leave.status !== "APPROVED") {
      const dates = workingDates(leave.startDate, leave.endDate, calendars);
      const existing = await tx.attendance.findMany({
        where: { employeeId: leave.employeeId, date: { in: dates } },
        select: { id: true, date: true, status: true, checkIn: true, checkOut: true, leaveRequestId: true },
      });
      const existingDates = new Set(existing.map((record) => record.date.toISOString().slice(0, 10)));
      const missingDates = dates.filter((date) => !existingDates.has(date.toISOString().slice(0, 10)));
      if (missingDates.length > 0) {
        await tx.attendance.createMany({
          data: missingDates.map((date) => ({ employeeId: leave.employeeId, date, status: "LEAVE", leaveRequestId: leave.id })),
          skipDuplicates: true,
        });
      }
      for (const record of existing) {
        if (!record.checkIn && !record.checkOut && record.status !== "LEAVE" && !record.leaveRequestId) {
          await tx.attendance.update({
            where: { id: record.id },
            data: { status: "LEAVE", leaveRequestId: leave.id, statusBeforeLeave: record.status },
          });
        }
      }
    } else if (
      leave.status === "APPROVED" &&
      (status === "REJECTED" || status === "PENDING")
    ) {
      await clearLeaveAttendance(tx, leave.id);
    }

    await tx.auditLog.create({
      data: {
        userName: actorName || "Người xét duyệt",
        userRole: userRole,
        action: `${
          status === "APPROVED"
            ? "Phê duyệt"
            : status === "REJECTED"
            ? "Từ chối"
            : "Chuyển chờ duyệt"
        } đơn nghỉ phép (${leave.employee.user.name} - ${leave.type})`,
        target: "LeaveRequest",
        ip: "127.0.0.1",
        status: status === "APPROVED" ? "SUCCESS" : "WARNING",
      },
    });

    return updated;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}

export async function deleteLeaveRequest(
  id: string,
  userId: string,
  userRole: string
) {
  return prisma.$transaction(async (tx) => {
    const leave = await tx.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          include: { user: { select: SAFE_USER_SELECT } },
        },
      },
    });

    if (!leave) throw new Error("Không tìm thấy đơn.");

    const isOwner = leave.employee.userId === userId;
    const isHighPrivilege = ["SYSTEM_ADMIN", "BOD", "HR"].includes(userRole);
    let isDeptManager = false;

    if (userRole === "MANAGER") {
      const managerProfile = await tx.employeeProfile.findUnique({
        where: { userId },
        include: { managedDept: true },
      });
      const deptId = managerProfile?.managedDept?.id;
      if (deptId && leave.employee.departmentId === deptId) {
        isDeptManager = true;
      }
    }

    if (!isOwner && !isHighPrivilege && !isDeptManager) {
      throw new Error("Không có quyền xóa đơn này.");
    }

    if (leave.status === "APPROVED" && !isHighPrivilege) {
      throw new Error(
        "Chỉ Ban Giám Đốc, HR hoặc Quản trị viên hệ thống mới có quyền xóa đơn nghỉ phép đã được phê duyệt."
      );
    }

    if (leave.status !== "PENDING" && !isHighPrivilege && !isDeptManager) {
      throw new Error("Chỉ có thể xóa đơn đang chờ duyệt.");
    }

    if (leave.status === "APPROVED") {
      await clearLeaveAttendance(tx, leave.id);
    }

    const deleted = await tx.leaveRequest.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        userName: leave.employee.user.name,
        userRole: userRole,
        action: `Rút / Xóa đơn xin nghỉ phép mã #${id.slice(-6)}`,
        target: "LeaveRequest",
        ip: "127.0.0.1",
        status: "WARNING",
      },
    });

    return deleted;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}
