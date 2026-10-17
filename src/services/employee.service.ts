import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  roleId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export async function getEmployees(scope?: {
  roleName?: string;
  userId?: string;
  includeSalary?: boolean;
}) {
  const where: any = {};
  if (scope?.roleName === "USER" && scope.userId) {
    where.userId = scope.userId;
  } else if (scope?.roleName === "MANAGER" && scope.userId) {
    const manager = await prisma.employeeProfile.findUnique({
      where: { userId: scope.userId },
      select: { id: true, departmentId: true, managedDept: { select: { id: true } } },
    });
    const departmentId = manager?.managedDept?.id;
    where.OR = departmentId
      ? [{ departmentId }, { userId: scope.userId }]
      : [{ userId: scope.userId }];
  }

  return await prisma.employeeProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: SAFE_USER_SELECT,
      },
      department: {
        include: {
          manager: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      managedDept: true,
      ...(scope?.includeSalary ? { salaryConfig: true } : {}),
    },
  });
}

export async function createEmployee(
  data: any,
  actorName: string = "Quản trị viên",
  actorRole: string = "HR"
) {
  const { email, name, roleId, departmentId, position, phone, address, isManager, baseSalary, dependentCount } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email này đã được đăng ký tài khoản");

  const temporaryPassword = randomBytes(15).toString("base64url");
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    let targetRoleId = roleId;
    if (isManager && departmentId) {
      const assignedRole = await tx.role.findUnique({ where: { id: roleId } });
      if (assignedRole?.name === "USER") {
        const managerRole = await tx.role.findUnique({ where: { name: "MANAGER" } });
        if (managerRole) {
          targetRoleId = managerRole.id;
        }
      }
    }

    const user = await tx.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId: targetRoleId,
      },
      select: SAFE_USER_SELECT,
    });

    const profile = await tx.employeeProfile.create({
      data: {
        userId: user.id,
        departmentId: departmentId || null,
        position,
        phone,
        address,
        dependentCount: Number.isInteger(Number(dependentCount)) && Number(dependentCount) >= 0 ? Number(dependentCount) : 0,
        status: "ACTIVE",
      },
    });

    const initialBaseSalary = Number(baseSalary) > 0 ? Number(baseSalary) : 12000000;

    await tx.employeeSalaryConfig.create({
      data: {
        employeeId: profile.id,
        baseSalary: initialBaseSalary,
      },
    });

    if (isManager && departmentId) {
      const targetDept = await tx.department.findUnique({
        where: { id: departmentId },
        select: { managerId: true },
      });
      await tx.department.update({
        where: { id: departmentId },
        data: { managerId: profile.id },
      });
      if (targetDept?.managerId && targetDept.managerId !== profile.id) {
        const stillManaging = await tx.department.count({
          where: { managerId: targetDept.managerId },
        });
        if (stillManaging === 0) {
          const oldMgr = await tx.employeeProfile.findUnique({
            where: { id: targetDept.managerId },
            include: { user: { include: { role: true } } },
          });
          if (oldMgr?.user?.role?.name === "MANAGER") {
            const userRole = await tx.role.findUnique({ where: { name: "USER" } });
            if (userRole) {
              await tx.user.update({
                where: { id: oldMgr.userId },
                data: { roleId: userRole.id },
              });
            }
          }
        }
      }
    }

    return { user, profile };
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Tạo mới hồ sơ nhân sự: ${name} (${email} - Chức danh: ${position}${isManager ? " - Bổ nhiệm Trưởng phòng" : ""})`,
      target: "EmployeeProfile",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return { ...result, temporaryPassword };
}

export async function updateEmployee(
  id: string,
  data: any,
  actorName: string = "Quản trị viên",
  actorRole: string = "HR"
) {
  const { name, roleId, departmentId, position, phone, address, status, isManager, baseSalary, dependentCount } = data;

  const profile = await prisma.employeeProfile.findUnique({
    where: { id },
    include: { user: { select: SAFE_USER_SELECT } },
  });
  if (!profile) throw new Error("Không tìm thấy hồ sơ nhân sự");

  const result = await prisma.$transaction(async (tx) => {
    const targetDeptId = departmentId !== undefined ? departmentId : profile.departmentId;
    let effectiveRoleId = roleId;

    if (isManager === true && targetDeptId) {
      const roleToCheck = roleId
        ? await tx.role.findUnique({ where: { id: roleId } })
        : profile.user.role;
      if (roleToCheck?.name === "USER") {
        const managerRole = await tx.role.findUnique({ where: { name: "MANAGER" } });
        if (managerRole) {
          effectiveRoleId = managerRole.id;
        }
      }
    } else if (isManager === false && !roleId && profile.user.role?.name === "MANAGER") {
      const userRole = await tx.role.findUnique({ where: { name: "USER" } });
      if (userRole) {
        effectiveRoleId = userRole.id;
      }
    }

    if (name || effectiveRoleId) {
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          name: name ?? undefined,
          roleId: effectiveRoleId ?? undefined,
        },
      });
    }

    if (baseSalary !== undefined && Number(baseSalary) > 0) {
      await tx.employeeSalaryConfig.upsert({
        where: { employeeId: id },
        update: { baseSalary: Number(baseSalary) },
        create: { employeeId: id, baseSalary: Number(baseSalary) },
      });
    }

    const updatedProfile = await tx.employeeProfile.update({
      where: { id },
      data: {
        departmentId: departmentId !== undefined ? (departmentId || null) : undefined,
        position: position ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
        dependentCount: dependentCount === undefined ? undefined : Math.max(0, Math.floor(Number(dependentCount) || 0)),
        status: status ?? undefined,
      },
    });

    if (isManager === true && targetDeptId) {
      const prevDept = await tx.department.findUnique({
        where: { id: targetDeptId },
        select: { managerId: true },
      });
      await tx.department.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      });
      await tx.department.update({
        where: { id: targetDeptId },
        data: { managerId: id },
      });
      if (prevDept?.managerId && prevDept.managerId !== id) {
        const stillManaging = await tx.department.count({
          where: { managerId: prevDept.managerId },
        });
        if (stillManaging === 0) {
          const oldMgr = await tx.employeeProfile.findUnique({
            where: { id: prevDept.managerId },
            include: { user: { include: { role: true } } },
          });
          if (oldMgr?.user?.role?.name === "MANAGER") {
            const userRole = await tx.role.findUnique({ where: { name: "USER" } });
            if (userRole) {
              await tx.user.update({
                where: { id: oldMgr.userId },
                data: { roleId: userRole.id },
              });
            }
          }
        }
      }
    } else if (isManager === false) {
      await tx.department.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      });
    }

    if (status === "RESIGNED" || status === "SUSPENDED") {
      await tx.department.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      });
      await tx.leaveRequest.updateMany({
        where: { employeeId: id, status: "PENDING" },
        data: { status: "REJECTED" },
      });
      await tx.overtimeRequest.updateMany({
        where: { employeeId: id, status: "PENDING" },
        data: { status: "REJECTED" },
      });
    }

    return updatedProfile;
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Cập nhật thông tin hồ sơ nhân sự: ${profile.user.name} (${profile.user.email})`,
      target: "EmployeeProfile",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return result;
}

export async function deleteEmployee(
  id: string,
  actorName: string = "Quản trị viên",
  actorRole: string = "SYSTEM_ADMIN"
) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id },
    include: {
      user: { select: SAFE_USER_SELECT },
      payrolls: { select: { id: true } },
      attendances: { select: { id: true } },
      overtimeRequests: { select: { id: true } },
      contracts: { select: { id: true } },
      leaveRequests: { select: { id: true } },
      evaluations: { select: { id: true } },
    },
  });
  if (!profile) throw new Error("Không tìm thấy hồ sơ nhân sự");

  if (
    profile.payrolls.length > 0 ||
    profile.attendances.length > 0 ||
    profile.overtimeRequests.length > 0 ||
    profile.contracts.length > 0 ||
    profile.leaveRequests.length > 0 ||
    profile.evaluations.length > 0
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.department.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      });

      await tx.contract.updateMany({
        where: {
          employeeId: id,
          status: { in: ["ACTIVE", "EXPIRING_SOON"] },
        },
        data: { status: "TERMINATED" },
      });

      await tx.leaveRequest.updateMany({
        where: {
          employeeId: id,
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      await tx.overtimeRequest.updateMany({
        where: {
          employeeId: id,
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });

      await tx.employeeProfile.update({
        where: { id },
        data: { status: "RESIGNED" },
      });
    });

    await prisma.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Lưu trữ hồ sơ thôi việc (RESIGNED) cho nhân sự ${profile.user.name} (${profile.user.email}) - Bảo lưu lịch sử chấm công & kế toán`,
        target: "EmployeeProfile",
        ip: "127.0.0.1",
        status: "WARNING",
      },
    });

    return {
      message:
        "Nhân viên đã có dữ liệu kế toán/chấm công/hợp đồng. Đã chuyển trạng thái sang RESIGNED để lưu trữ hồ sơ hợp lệ.",
      status: "RESIGNED",
    };
  }

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.department.updateMany({
      where: { managerId: id },
      data: { managerId: null },
    });

    await tx.interview.deleteMany({
      where: { interviewerId: profile.userId },
    });

    return await tx.user.delete({
      where: { id: profile.userId },
      select: SAFE_USER_SELECT,
    });
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Xóa vĩnh viễn hồ sơ nhân sự: ${profile.user.name} (${profile.user.email})`,
      target: "EmployeeProfile",
      ip: "127.0.0.1",
      status: "CRITICAL",
    },
  });

  return deleted;
}
