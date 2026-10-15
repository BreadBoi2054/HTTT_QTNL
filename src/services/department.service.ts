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

export async function getDepartments() {
  return await prisma.department.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      manager: {
        include: {
          user: { select: SAFE_USER_SELECT },
        },
      },
      _count: {
        select: { employees: true },
      },
    },
  });
}

export async function getDepartmentById(id: string) {
  return await prisma.department.findUnique({
    where: { id },
    include: {
      manager: {
        include: {
          user: { select: SAFE_USER_SELECT },
        },
      },
      _count: {
        select: { employees: true },
      },
    },
  });
}

export async function createDepartment(
  data: { name: string; description?: string; managerId?: string | null },
  actorName: string = "Quản trị viên",
  actorRole: string = "HR"
) {
  const { name, description, managerId } = data;

  if (managerId) {
    await prisma.department.updateMany({
      where: { managerId },
      data: { managerId: null },
    });
  }

  const dept = await prisma.department.create({
    data: {
      name,
      description,
      managerId: managerId || null,
    },
    include: {
      manager: {
        include: { user: { select: SAFE_USER_SELECT } },
      },
    },
  });

  if (managerId) {
    const managerProfile = await prisma.employeeProfile.update({
      where: { id: managerId },
      data: { departmentId: dept.id },
      include: { user: { include: { role: true } } },
    });

    if (managerProfile.user?.role?.name === "USER") {
      const managerRole = await prisma.role.findUnique({ where: { name: "MANAGER" } });
      if (managerRole) {
        await prisma.user.update({
          where: { id: managerProfile.userId },
          data: { roleId: managerRole.id },
        });
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Tạo mới phòng ban: ${name}`,
      target: "Department",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return dept;
}

export async function updateDepartment(
  id: string,
  data: { name?: string; description?: string; managerId?: string | null },
  actorName: string = "Quản trị viên",
  actorRole: string = "HR"
) {
  const { name, description, managerId } = data;

  if (managerId) {
    await prisma.department.updateMany({
      where: { managerId, id: { not: id } },
      data: { managerId: null },
    });
  }

  const dept = await prisma.department.update({
    where: { id },
    data: {
      name: name ?? undefined,
      description: description ?? undefined,
      managerId: managerId !== undefined ? (managerId || null) : undefined,
    },
    include: {
      manager: {
        include: { user: { select: SAFE_USER_SELECT } },
      },
    },
  });

  if (managerId) {
    const managerProfile = await prisma.employeeProfile.update({
      where: { id: managerId },
      data: { departmentId: id },
      include: { user: { include: { role: true } } },
    });

    if (managerProfile.user?.role?.name === "USER") {
      const managerRole = await prisma.role.findUnique({ where: { name: "MANAGER" } });
      if (managerRole) {
        await prisma.user.update({
          where: { id: managerProfile.userId },
          data: { roleId: managerRole.id },
        });
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Cập nhật phòng ban: ${dept.name}`,
      target: "Department",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return dept;
}

export async function deleteDepartment(
  id: string,
  actorName: string = "Quản trị viên",
  actorRole: string = "SYSTEM_ADMIN"
) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: { employees: true, jobPostings: true },
      },
    },
  });

  if (!dept) throw new Error("Không tìm thấy phòng ban.");
  if (dept._count.employees > 0) {
    throw new Error(
      `Không thể xóa phòng ban đang có ${dept._count.employees} nhân sự trực thuộc. Vui lòng điều chuyển nhân sự sang phòng ban khác trước.`
    );
  }

  if (dept._count.jobPostings > 0) {
    await prisma.jobPosting.updateMany({
      where: { departmentId: id },
      data: { departmentId: null },
    });
  }

  const deleted = await prisma.department.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Xóa phòng ban: ${dept.name}`,
      target: "Department",
      ip: "127.0.0.1",
      status: "WARNING",
    },
  });

  return deleted;
}
