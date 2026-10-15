import { prisma } from "@/lib/prisma";

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

export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
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
  year: number = new Date().getFullYear()
) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: employeeId },
    select: { annualLeaveDays: true },
  });

  const allowance = profile?.annualLeaveDays ?? 12;

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const leaves = await prisma.leaveRequest.findMany({
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
    const days = calculateWorkingDays(s, e);
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
  data: any,
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

  if (start > end) {
    throw new Error("Ngày kết thúc không hợp lệ (nhỏ hơn ngày bắt đầu).");
  }

  const overlapping = await prisma.leaveRequest.findFirst({
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

  const requestedWorkingDays = calculateWorkingDays(start, end);
  if (requestedWorkingDays <= 0) {
    throw new Error(
      "Khoảng thời gian nghỉ chỉ rơi vào Thứ 7 hoặc Chủ Nhật (không tính ngày làm việc)."
    );
  }

  if (type === "ANNUAL_LEAVE") {
    const year = start.getFullYear();
    const balance = await getLeaveBalance(employeeId, year);
    if (requestedWorkingDays > balance.remainingDays) {
      throw new Error(
        `Đã vượt quá Quỹ phép năm được cấp (${balance.allowance} ngày/năm). Số ngày phép còn lại: ${balance.remainingDays} ngày, số ngày bạn xin nghỉ: ${requestedWorkingDays} ngày. Vui lòng chuyển sang Nghỉ không lương (UNPAID_LEAVE) hoặc rút ngắn ngày nghỉ.`
      );
    }
  }

  const newRequest = await prisma.leaveRequest.create({
    data: {
      employeeId,
      startDate: start,
      endDate: end,
      type,
      reason,
      status: "PENDING",
    },
  });

  await prisma.auditLog.create({
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
}

export async function updateLeaveRequestDetails(
  id: string,
  data: any,
  userRole: string = "USER",
  userId?: string
) {
  const leave = await prisma.leaveRequest.findUnique({
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

  if (start > end) {
    throw new Error("Ngày kết thúc không hợp lệ (nhỏ hơn ngày bắt đầu).");
  }

  const overlapping = await prisma.leaveRequest.findFirst({
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

  const requestedWorkingDays = calculateWorkingDays(start, end);
  if (requestedWorkingDays <= 0) {
    throw new Error("Khoảng thời gian nghỉ chỉ rơi vào Thứ 7 hoặc Chủ Nhật (không tính ngày làm việc).");
  }

  if (type === "ANNUAL_LEAVE") {
    const year = start.getFullYear();
    const balance = await getLeaveBalance(leave.employeeId, year);
    const oldDaysInSameYear =
      leave.type === "ANNUAL_LEAVE" && leave.startDate.getFullYear() === year
        ? calculateWorkingDays(leave.startDate, leave.endDate)
        : 0;
    if (requestedWorkingDays > balance.remainingDays + oldDaysInSameYear) {
      throw new Error(
        `Đã vượt quá Quỹ phép năm được cấp (${balance.allowance} ngày/năm).`
      );
    }
  }

  return await prisma.leaveRequest.update({
    where: { id },
    data: {
      startDate: start,
      endDate: end,
      type,
      reason,
    },
  });
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

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      employee: {
        include: { user: { select: SAFE_USER_SELECT }, department: true },
      },
    },
  });

  if (!leave) throw new Error("Không tìm thấy đơn nghỉ phép.");

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
      ? await prisma.employeeProfile.findUnique({
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

  if (status === "APPROVED" && leave.status !== "APPROVED") {
    const overlappingApproved = await prisma.leaveRequest.findFirst({
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
      const requestedWorkingDays = calculateWorkingDays(leave.startDate, leave.endDate);
      const balance = await getLeaveBalance(
        leave.employeeId,
        new Date(leave.startDate).getFullYear()
      );
      if (leave.status === "PENDING") {
        if (balance.usedDays + requestedWorkingDays > balance.totalAllowance) {
          throw new Error(
            `Không thể phê duyệt: Tổng số ngày phép năm đã sử dụng vượt quá hạn mức (${balance.totalAllowance} ngày/năm).`
          );
        }
      } else if (leave.status === "REJECTED") {
        if (requestedWorkingDays > balance.remainingDays) {
          throw new Error(
            `Không thể phê duyệt: Số ngày xin nghỉ (${requestedWorkingDays} ngày) vượt quá số ngày phép còn lại (${balance.remainingDays} ngày).`
          );
        }
      }
    }
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED" && leave.status !== "APPROVED") {
    const cur = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const recordDate = toUtcDateOnly(cur);

        const existingAtt = await prisma.attendance.findUnique({
          where: {
            employeeId_date: {
              employeeId: leave.employeeId,
              date: recordDate,
            },
          },
        });

        if (!existingAtt) {
          await prisma.attendance.create({
            data: {
              employeeId: leave.employeeId,
              date: recordDate,
              status: "LEAVE",
            },
          });
        } else if (!existingAtt.checkIn) {
          await prisma.attendance.update({
            where: { id: existingAtt.id },
            data: { status: "LEAVE" },
          });
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  } else if (
    leave.status === "APPROVED" &&
    (status === "REJECTED" || status === "PENDING")
  ) {
    const cur = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (cur <= end) {
      const recordDate = toUtcDateOnly(cur);
      await prisma.attendance.deleteMany({
        where: {
          employeeId: leave.employeeId,
          date: recordDate,
          status: "LEAVE",
          checkIn: null,
        },
      });
      cur.setDate(cur.getDate() + 1);
    }
  }

  await prisma.auditLog.create({
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
}

export async function deleteLeaveRequest(
  id: string,
  userId: string,
  userRole: string
) {
  const leave = await prisma.leaveRequest.findUnique({
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
    const managerProfile = await prisma.employeeProfile.findUnique({
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
    const cur = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (cur <= end) {
      const recordDate = toUtcDateOnly(cur);
      await prisma.attendance.deleteMany({
        where: {
          employeeId: leave.employeeId,
          date: recordDate,
          status: "LEAVE",
          checkIn: null,
        },
      });
      cur.setDate(cur.getDate() + 1);
    }
  }

  const deleted = await prisma.leaveRequest.delete({ where: { id } });

  await prisma.auditLog.create({
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
}
