import { prisma } from "@/lib/prisma";

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

export async function getAttendances(
  date?: Date,
  scope?: { userEmail?: string; roleName?: string; userId?: string }
) {
  const whereClause: any = {};
  if (date) whereClause.date = toUtcDateOnly(date);

  if (scope?.roleName === "USER" && scope.userEmail) {
    whereClause.employee = { user: { email: scope.userEmail } };
  } else if (scope?.roleName === "MANAGER" && scope.userId) {
    const managedDept = await prisma.department.findFirst({
      where: { manager: { userId: scope.userId } },
      select: { id: true },
    });
    if (managedDept) {
      whereClause.employee = {
        OR: [{ departmentId: managedDept.id }, { user: { id: scope.userId } }],
      };
    } else {
      whereClause.employee = { user: { id: scope.userId } };
    }
  }

  return await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    include: {
      employee: {
        include: {
          user: {
            select: { name: true, email: true },
          },
          department: true,
        },
      },
    },
  });
}

export async function getDailyAttendance(employeeId: string, date: Date) {
  const recordDate = toUtcDateOnly(date);

  return await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: recordDate,
    },
  });
}

export async function processCheckIn(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { name: true } },
        },
      },
    },
  });

  if (!profile) throw new Error("Tài khoản chưa được gán Hồ sơ nhân viên. Vui lòng liên hệ HR.");

  if (profile.status === "RESIGNED" || profile.status === "SUSPENDED") {
    throw new Error("Tài khoản nhân sự đã ngừng hoạt động hoặc đang tạm đình chỉ, không thể chấm công.");
  }

  const now = new Date();
  const today = toUtcDateOnly(now);

  const existingRecord = await getDailyAttendance(profile.id, today);
  if (existingRecord) {
    if (existingRecord.status === "LEAVE" && !existingRecord.checkIn) {
      throw new Error("Hôm nay bạn đang trong lịch Nghỉ phép đã được phê duyệt, không thể Check-in.");
    }
    throw new Error("Bạn đã thực hiện Check-in trong ngày hôm nay rồi.");
  }

  const vnFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  const parts = vnFormatter.formatToParts(now);
  const vnHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const vnMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

  const isLate = vnHour > 8 || (vnHour === 8 && vnMinute > 30);
  const status = isLate ? "LATE" : "PRESENT";

  const record = await prisma.attendance.create({
    data: {
      employeeId: profile.id,
      date: today,
      checkIn: now,
      status: status,
    },
  });

  await prisma.auditLog.create({
    data: {
      userName: profile.user.name,
      userRole: profile.user.role?.name || "USER",
      action: `Check-in ngày công [${status}] lúc ${now.toLocaleTimeString("vi-VN")}`,
      target: "Attendance",
      ip: "127.0.0.1",
      status: isLate ? "WARNING" : "SUCCESS",
    },
  });

  return record;
}

export async function processCheckOut(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { name: true } },
        },
      },
    },
  });

  if (!profile) throw new Error("Không tìm thấy Hồ sơ nhân viên.");

  if (profile.status === "RESIGNED" || profile.status === "SUSPENDED") {
    throw new Error("Tài khoản nhân sự đã ngừng hoạt động hoặc đang tạm đình chỉ, không thể chấm công.");
  }

  const now = new Date();
  const today = toUtcDateOnly(now);

  const existingRecord = await getDailyAttendance(profile.id, today);
  if (!existingRecord || !existingRecord.checkIn || existingRecord.status === "LEAVE") {
    throw new Error("Bạn chưa thực hiện Check-in trong ngày hôm nay nên không thể Check-out.");
  }
  if (existingRecord.checkOut) {
    throw new Error("Bạn đã thực hiện Check-out hôm nay rồi.");
  }

  const record = await prisma.attendance.update({
    where: { id: existingRecord.id },
    data: {
      checkOut: now,
    },
  });

  await prisma.auditLog.create({
    data: {
      userName: profile.user.name,
      userRole: profile.user.role?.name || "USER",
      action: `Check-out hoàn thành ngày làm việc lúc ${now.toLocaleTimeString("vi-VN")}`,
      target: "Attendance",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return record;
}
