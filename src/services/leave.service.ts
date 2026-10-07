import { prisma } from "@/lib/prisma";

export async function getLeaveRequests(userId: string, roleName: string) {
  const isSuperAdminOrHR = ["SYSTEM_ADMIN", "HR"].includes(roleName);

  if (isSuperAdminOrHR) {
    // Trả về toàn bộ đơn nghỉ phép cho Admin và Nhân sự HR
    return await prisma.leaveRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } }
          }
        }
      }
    });
  } else if (roleName === "MANAGER") {
    // Quản lý phòng ban: Chỉ xem đơn của nhân viên thuộc phòng ban mình phụ trách
    const managerProfile = await prisma.employeeProfile.findUnique({
      where: { userId },
      include: { managedDept: true }
    });

    const deptId = managerProfile?.managedDept?.id || managerProfile?.departmentId;

    return await prisma.leaveRequest.findMany({
      where: deptId ? {
        employee: { departmentId: deptId }
      } : {
        employee: { userId }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } }
          }
        }
      }
    });
  } else {
    // Nhân viên thông thường: Chỉ xem đơn của chính mình
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId }
    });
    
    if (!employee) return [];

    return await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } }
          }
        }
      }
    });
  }
}

export async function createLeaveRequest(userId: string, data: any, userRole: string = "USER") {
  let employeeId = data.employeeId;
  let applicantName = "";

  if (employeeId && ["SYSTEM_ADMIN", "HR"].includes(userRole)) {
    const targetEmp = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });
    if (!targetEmp) throw new Error("Không tìm thấy nhân viên được chỉ định.");
    applicantName = targetEmp.user.name;
  } else {
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId },
      include: { user: true }
    });
    if (!employee) throw new Error("Chỉ nhân viên mới có thể tạo đơn xin nghỉ phép.");
    employeeId = employee.id;
    applicantName = employee.user.name;
  }

  const { startDate, endDate, type, reason } = data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new Error("Ngày kết thúc không hợp lệ (nhỏ hơn ngày bắt đầu).");
  }

  // Kiểm tra trùng lặp khoảng thời gian nghỉ phép đang chờ hoặc đã duyệt
  const overlapping = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: end },
      endDate: { gte: start }
    }
  });

  if (overlapping) {
    throw new Error(`Đã có đơn nghỉ phép (${overlapping.type} - trạng thái ${overlapping.status === "APPROVED" ? "Đã duyệt" : "Đang chờ duyệt"}) trùng khoảng thời gian này.`);
  }

  const newRequest = await prisma.leaveRequest.create({
    data: {
      employeeId,
      startDate: start,
      endDate: end,
      type,
      reason,
      status: "PENDING"
    }
  });

  // Ghi nhật ký kiểm toán (Audit Trail)
  await prisma.auditLog.create({
    data: {
      userName: applicantName,
      userRole: userRole,
      action: `Khởi tạo đơn xin nghỉ phép [${type}] cho nhân sự ${applicantName} từ ngày ${startDate} đến ${endDate}`,
      target: "LeaveRequest",
      ip: "127.0.0.1",
      status: "SUCCESS"
    }
  });

  return newRequest;
}

export function toUtcDateOnly(date: Date = new Date()): Date {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

export async function updateLeaveRequestStatus(id: string, status: string, userRole: string, actorName?: string, actorUserId?: string) {
  if (!["SYSTEM_ADMIN", "MANAGER", "HR"].includes(userRole)) {
    throw new Error("Không có thẩm quyền phê duyệt đơn nghỉ phép.");
  }

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      employee: {
        include: { user: true, department: true }
      }
    }
  });

  if (!leave) throw new Error("Không tìm thấy đơn nghỉ phép.");

  // Quản lý không được tự duyệt đơn của mình, và chỉ được duyệt đơn của nhân viên thuộc phòng ban mình phụ trách
  if (userRole === "MANAGER" && actorUserId) {
    if (leave.employee.userId === actorUserId) {
      throw new Error("Trưởng phòng không thể tự phê duyệt đơn nghỉ phép của chính mình. Vui lòng gửi Ban Giám Đốc hoặc HR phê duyệt.");
    }

    const managerProfile = await prisma.employeeProfile.findUnique({
      where: { userId: actorUserId },
      include: { managedDept: true }
    });

    const deptId = managerProfile?.managedDept?.id || managerProfile?.departmentId;
    if (deptId && leave.employee.departmentId !== deptId) {
      throw new Error("Bạn chỉ có quyền phê duyệt đơn nghỉ phép của nhân sự thuộc phòng ban mình phụ trách.");
    }
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status }
  });

  // TỰ ĐỘNG ĐỒNG BỘ SANG BẢNG CHẤM CÔNG (ATTENDANCE) KHI DUYỆT THÀNH CÔNG
  if (status === "APPROVED") {
    const cur = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    while (cur <= end) {
      const dayOfWeek = cur.getDay(); // 0: Chủ nhật
      if (dayOfWeek !== 0) { // Loại trừ Chủ nhật, ghi nhận ngày công nghỉ phép
        const recordDate = toUtcDateOnly(cur);

        await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: leave.employeeId,
              date: recordDate
            }
          },
          update: {
            status: "LEAVE"
          },
          create: {
            employeeId: leave.employeeId,
            date: recordDate,
            status: "LEAVE"
          }
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
  } else if (leave.status === "APPROVED" && status === "REJECTED") {
    // Nếu đơn trước đó đã duyệt nay chuyển sang từ chối, giải phóng các ngày LEAVE đã đồng bộ
    const cur = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (cur <= end) {
      const recordDate = toUtcDateOnly(cur);
      await prisma.attendance.deleteMany({
        where: {
          employeeId: leave.employeeId,
          date: recordDate,
          status: "LEAVE"
        }
      });
      cur.setDate(cur.getDate() + 1);
    }
  }

  // Ghi nhật ký kiểm toán (Audit Trail)
  await prisma.auditLog.create({
    data: {
      userName: actorName || "Người xét duyệt",
      userRole: userRole,
      action: `${status === "APPROVED" ? "Phê duyệt" : "Từ chối"} đơn nghỉ phép (${leave.employee.user.name} - ${leave.type})`,
      target: "LeaveRequest",
      ip: "127.0.0.1",
      status: status === "APPROVED" ? "SUCCESS" : "WARNING"
    }
  });

  return updated;
}

export async function deleteLeaveRequest(id: string, userId: string, userRole: string) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      employee: {
        include: { user: true }
      }
    }
  });

  if (!leave) throw new Error("Không tìm thấy đơn.");

  const isOwner = leave.employee.userId === userId;
  const isManagerOrAdmin = ["SYSTEM_ADMIN", "MANAGER", "HR"].includes(userRole);

  if (!isOwner && !isManagerOrAdmin) {
    throw new Error("Không có quyền xóa đơn này.");
  }

  if (leave.status !== "PENDING" && !isManagerOrAdmin) {
    throw new Error("Chỉ có thể xóa đơn đang chờ duyệt.");
  }

  // Nếu xóa đơn đã từng duyệt thành công, giải phóng ngày công LEAVE trong bảng attendance
  if (leave.status === "APPROVED") {
    const cur = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (cur <= end) {
      const recordDate = toUtcDateOnly(cur);
      await prisma.attendance.deleteMany({
        where: {
          employeeId: leave.employeeId,
          date: recordDate,
          status: "LEAVE"
        }
      });
      cur.setDate(cur.getDate() + 1);
    }
  }

  const deleted = await prisma.leaveRequest.delete({ where: { id } });

  // Ghi nhật ký kiểm toán
  await prisma.auditLog.create({
    data: {
      userName: leave.employee.user.name,
      userRole: userRole,
      action: `Rút / Xóa đơn xin nghỉ phép mã #${id.slice(-6)}`,
      target: "LeaveRequest",
      ip: "127.0.0.1",
      status: "WARNING"
    }
  });

  return deleted;
}
