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

async function demoteReplacedManagers(tx: any, profileIds: string[]) {
  const uniqueIds = [...new Set(profileIds.filter(Boolean))];
  if (uniqueIds.length === 0) return;

  const userRole = await tx.role.findUnique({ where: { name: "USER" } });
  if (!userRole) return;

  for (const profileId of uniqueIds) {
    const stillManagingCount = await tx.department.count({
      where: { managerId: profileId },
    });
    if (stillManagingCount === 0) {
      const profile = await tx.employeeProfile.findUnique({
        where: { id: profileId },
        include: { user: { include: { role: true } } },
      });
      if (profile?.user?.role?.name === "MANAGER") {
        await tx.user.update({
          where: { id: profile.userId },
          data: { roleId: userRole.id },
        });
      }
    }
  }
}

export async function createDepartment(
  data: { name: string; description?: string; managerId?: string | null },
  actorName: string = "Quản trị viên",
  actorRole: string = "HR"
) {
  const { name, description, managerId } = data;

  return prisma.$transaction(async (tx) => {
    if (managerId) {
      await tx.department.updateMany({
        where: { managerId },
        data: { managerId: null },
      });
    }

    const dept = await tx.department.create({
      data: {
        name: name.trim(),
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
      const managerProfile = await tx.employeeProfile.update({
        where: { id: managerId },
        data: { departmentId: dept.id },
        include: { user: { include: { role: true } } },
      });

      if (managerProfile.user?.role?.name === "USER") {
        const managerRole = await tx.role.findUnique({ where: { name: "MANAGER" } });
        if (managerRole) {
          await tx.user.update({
            where: { id: managerProfile.userId },
            data: { roleId: managerRole.id },
          });
        }
      }
    }

    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Tạo mới phòng ban: ${dept.name}`,
        target: "Department",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return dept;
  });
}

export async function updateDepartment(
  id: string,
  data: { name?: string; description?: string; managerId?: string | null },
  actorName: string = "Quản trị viên",
  actorRole: string = "HR"
) {
  const { name, description, managerId } = data;

  return prisma.$transaction(async (tx) => {
    const existingDept = await tx.department.findUnique({
      where: { id },
      select: { id: true, managerId: true },
    });
    if (!existingDept) throw new Error("Không tìm thấy phòng ban.");

    const previousManagerId = existingDept.managerId;

    if (managerId) {
      await tx.department.updateMany({
        where: { managerId, id: { not: id } },
        data: { managerId: null },
      });
    }

    const dept = await tx.department.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
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
      const managerProfile = await tx.employeeProfile.update({
        where: { id: managerId },
        data: { departmentId: id },
        include: { user: { include: { role: true } } },
      });

      if (managerProfile.user?.role?.name === "USER") {
        const managerRole = await tx.role.findUnique({ where: { name: "MANAGER" } });
        if (managerRole) {
          await tx.user.update({
            where: { id: managerProfile.userId },
            data: { roleId: managerRole.id },
          });
        }
      }
    }

    if (previousManagerId && previousManagerId !== (managerId ?? previousManagerId)) {
      await demoteReplacedManagers(tx, [previousManagerId]);
    }

    await tx.auditLog.create({
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
  });
}

export async function deleteDepartment(
  id: string,
  actorName: string = "Quản trị viên",
  actorRole: string = "SYSTEM_ADMIN"
) {
  return prisma.$transaction(async (tx) => {
    const dept = await tx.department.findUnique({
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

    const previousManagerId = dept.managerId;

    if (dept._count.jobPostings > 0) {
      await tx.jobPosting.updateMany({
        where: { departmentId: id },
        data: { departmentId: null },
      });
    }

    const deleted = await tx.department.delete({
      where: { id },
    });

    if (previousManagerId) {
      await demoteReplacedManagers(tx, [previousManagerId]);
    }

    await tx.auditLog.create({
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
  });
}
