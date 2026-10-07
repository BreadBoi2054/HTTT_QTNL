import { prisma } from "@/lib/prisma";

export function toUtcDateOnly(date: Date = new Date()): Date {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

export async function getAttendances(
  date?: Date,
  scope?: { userEmail?: string; roleName?: string; userId?: string }
) {
  const whereClause: any = {};
  if (date) whereClause.date = toUtcDateOnly(date);

  // Bảo mật và phân quyền dữ liệu chấm công theo vai trò
  if (scope?.roleName === "USER" && scope.userEmail) {
    whereClause.employee = { user: { email: scope.userEmail } };
  } else if (scope?.roleName === "MANAGER" && scope.userId) {
    const managedDept = await prisma.department.findFirst({
      where: { manager: { userId: scope.userId } },
      select: { id: true }
    });
    if (managedDept) {
      whereClause.employee = {
        OR: [
          { departmentId: managedDept.id },
          { user: { id: scope.userId } }
        ]
      };
    } else {
      whereClause.employee = { user: { id: scope.userId } };
    }
  }

  return await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
    include: {
      employee: {
        include: {
          user: {
            select: { name: true, email: true }
          },
          department: true
        }
      }
    }
  });
}

export async function getDailyAttendance(employeeId: string, date: Date) {
  const recordDate = toUtcDateOnly(date);

  return await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: recordDate,
    }
  });
}

export async function processCheckIn(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!profile) throw new Error("Tài khoản chưa được gán Hồ sơ nhân viên. Vui lòng liên hệ HR.");

  const now = new Date();
  const today = toUtcDateOnly(now);

  const existingRecord = await getDailyAttendance(profile.id, today);
  if (existingRecord) throw new Error("Bạn đã thực hiện Check-in trong ngày hôm nay rồi.");

  // Logic: Tính giờ phút theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - UTC+7), trễ nếu Check-in sau 08:30 sáng
  const vnFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  });
  const parts = vnFormatter.formatToParts(now);
  const vnHour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
  const vnMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);

  const isLate = vnHour > 8 || (vnHour === 8 && vnMinute > 30);
  const status = isLate ? "LATE" : "PRESENT";

  const record = await prisma.attendance.create({
    data: {
      employeeId: profile.id,
      date: today,
      checkIn: now,
      status: status
    }
  });

  // Ghi nhật ký kiểm toán (Audit Trail)
  await prisma.auditLog.create({
    data: {
      userName: profile.user.name,
      userRole: "USER",
      action: `Check-in ngày công [${status}] lúc ${now.toLocaleTimeString("vi-VN")}`,
      target: "Attendance",
      ip: "127.0.0.1",
      status: isLate ? "WARNING" : "SUCCESS"
    }
  });

  return record;
}

export async function processCheckOut(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!profile) throw new Error("Không tìm thấy Hồ sơ nhân viên.");

  const now = new Date();
  const today = toUtcDateOnly(now);

  const existingRecord = await getDailyAttendance(profile.id, today);
  if (!existingRecord) throw new Error("Bạn chưa Check-in hôm nay, không thể Check-out.");
  if (existingRecord.checkOut) throw new Error("Bạn đã thực hiện Check-out hôm nay rồi.");

  const record = await prisma.attendance.update({
    where: { id: existingRecord.id },
    data: {
      checkOut: now
    }
  });

  // Ghi nhật ký kiểm toán
  await prisma.auditLog.create({
    data: {
      userName: profile.user.name,
      userRole: "USER",
      action: `Check-out hoàn thành ngày làm việc lúc ${now.toLocaleTimeString("vi-VN")}`,
      target: "Attendance",
      ip: "127.0.0.1",
      status: "SUCCESS"
    }
  });

  return record;
}
