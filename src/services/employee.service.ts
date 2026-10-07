import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function getEmployees() {
  return await prisma.employeeProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: { role: true }
      },
      department: {
        include: {
          manager: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        }
      },
      managedDept: true
    }
  });
}

export async function createEmployee(data: any, actorName: string = "Quản trị viên", actorRole: string = "HR") {
  const { email, name, roleId, departmentId, position, phone, address, isManager } = data;
  
  // 1. Kiểm tra email tồn tại
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email này đã được đăng ký tài khoản");

  // 2. Sinh mật khẩu mặc định: Hrmis@123
  const hashedPassword = await bcrypt.hash("Hrmis@123", 10);

  // 3. Dùng Transaction để đảm bảo tính toàn vẹn (Tạo User xong mới tạo Profile)
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId
      }
    });

    const profile = await tx.employeeProfile.create({
      data: {
        userId: user.id,
        departmentId: departmentId || null,
        position,
        phone,
        address,
        status: "ACTIVE"
      }
    });

    // Tự động tạo cấu hình lương cơ bản để nhân viên sẵn sàng được tính lương
    await tx.employeeSalaryConfig.create({
      data: {
        employeeId: profile.id,
        baseSalary: 12000000 // 12,000,000 VNĐ mức cơ bản mặc định
      }
    });

    if (isManager && departmentId) {
      await tx.department.update({
        where: { id: departmentId },
        data: { managerId: profile.id }
      });
    }

    return { user, profile };
  });

  // 4. Ghi nhật ký kiểm toán (Audit Trail)
  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Tạo mới hồ sơ nhân sự: ${name} (${email} - Chức danh: ${position}${isManager ? " - Bổ nhiệm Trưởng phòng" : ""})`,
      target: "EmployeeProfile",
      ip: "127.0.0.1",
      status: "SUCCESS"
    }
  });

  return result;
}

export async function updateEmployee(id: string, data: any, actorName: string = "Quản trị viên", actorRole: string = "HR") {
  const { name, roleId, departmentId, position, phone, address, status, isManager } = data;

  const profile = await prisma.employeeProfile.findUnique({ 
    where: { id },
    include: { user: true }
  });
  if (!profile) throw new Error("Không tìm thấy hồ sơ nhân sự");

  const result = await prisma.$transaction(async (tx) => {
    // Cập nhật thông tin gốc bên bảng User
    if (name || roleId) {
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          name: name ?? undefined,
          roleId: roleId ?? undefined
        }
      });
    }

    // Cập nhật Profile
    const updatedProfile = await tx.employeeProfile.update({
      where: { id },
      data: {
        departmentId: departmentId !== undefined ? (departmentId || null) : undefined,
        position: position ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
        status: status ?? undefined
      }
    });

    // Cập nhật Trưởng phòng nếu có truyền cờ isManager
    const targetDeptId = departmentId !== undefined ? departmentId : profile.departmentId;
    if (isManager === true && targetDeptId) {
      // Giải phóng các phòng ban cũ mà nhân sự này đang quản trị để tránh vi phạm ràng buộc Unique constraint
      await tx.department.updateMany({
        where: { managerId: id },
        data: { managerId: null }
      });
      await tx.department.update({
        where: { id: targetDeptId },
        data: { managerId: id }
      });
    } else if (isManager === false) {
      await tx.department.updateMany({
        where: { managerId: id },
        data: { managerId: null }
      });
    }

    return updatedProfile;
  });

  // Ghi nhật ký kiểm toán
  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Cập nhật thông tin hồ sơ nhân sự: ${profile.user.name} (${profile.user.email})`,
      target: "EmployeeProfile",
      ip: "127.0.0.1",
      status: "SUCCESS"
    }
  });

  return result;
}

export async function deleteEmployee(id: string, actorName: string = "Quản trị viên", actorRole: string = "SYSTEM_ADMIN") {
  const profile = await prisma.employeeProfile.findUnique({ 
    where: { id },
    include: { 
      user: true,
      payrolls: { select: { id: true } },
      attendances: { select: { id: true } }
    }
  });
  if (!profile) throw new Error("Không tìm thấy hồ sơ nhân sự");

  // NGUYÊN TẮC KIỂM TOÁN NHÂN SỰ & KẾ TOÁN (SOFT ARCHIVE VS HARD DELETE):
  // Nếu nhân viên đã có lịch sử bảng lương hoặc chấm công, chuyển trạng thái sang RESIGNED để bảo lưu chứng từ
  if (profile.payrolls.length > 0 || profile.attendances.length > 0) {
    // Nếu nhân viên đang phụ trách quản lý phòng ban, giải phóng vị trí trưởng phòng
    await prisma.department.updateMany({
      where: { managerId: id },
      data: { managerId: null }
    });

    await prisma.employeeProfile.update({
      where: { id },
      data: { status: "RESIGNED" }
    });

    await prisma.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Lưu trữ hồ sơ thôi việc (RESIGNED) cho nhân sự ${profile.user.name} (${profile.user.email}) - Bảo lưu lịch sử chấm công & kế toán`,
        target: "EmployeeProfile",
        ip: "127.0.0.1",
        status: "WARNING"
      }
    });

    return { message: "Nhân viên đã có dữ liệu kế toán/chấm công. Đã chuyển trạng thái sang RESIGNED để lưu trữ hồ sơ hợp lệ.", status: "RESIGNED" };
  }

  // Nếu là tài khoản vừa tạo thử nghiệm chưa phát sinh nghiệp vụ thì xóa an toàn
  const deleted = await prisma.$transaction(async (tx) => {
    // 1. Giải phóng trưởng phòng nếu có
    await tx.department.updateMany({
      where: { managerId: id },
      data: { managerId: null }
    });

    // 2. Xóa các lịch phỏng vấn được phân công cho user này (nếu có)
    await tx.interview.deleteMany({
      where: { interviewerId: profile.userId }
    });

    // 3. Xóa user (cascade sang EmployeeProfile và các bảng liên quan)
    return await tx.user.delete({
      where: { id: profile.userId }
    });
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Xóa vĩnh viễn hồ sơ nhân sự: ${profile.user.name} (${profile.user.email})`,
      target: "EmployeeProfile",
      ip: "127.0.0.1",
      status: "CRITICAL"
    }
  });

  return deleted;
}
