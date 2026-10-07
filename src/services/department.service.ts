import { prisma } from "@/lib/prisma";

export async function getDepartments() {
  return await prisma.department.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      manager: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      },
      _count: {
        select: { employees: true }
      }
    }
  });
}

export async function getDepartmentById(id: string) {
  return await prisma.department.findUnique({
    where: { id },
    include: {
      manager: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      },
      _count: {
        select: { employees: true }
      }
    }
  });
}

export async function createDepartment(data: { name: string; description?: string; managerId?: string | null }) {
  const { name, description, managerId } = data;

  // Nếu bổ nhiệm Trưởng phòng, giải phóng vị trí Trưởng phòng cũ của nhân sự này nếu đang quản lý phòng ban khác
  if (managerId) {
    await prisma.department.updateMany({
      where: { managerId },
      data: { managerId: null }
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
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  // Tự động cập nhật phòng ban cho Trưởng phòng
  if (managerId) {
    await prisma.employeeProfile.update({
      where: { id: managerId },
      data: { departmentId: dept.id }
    });
  }

  return dept;
}

export async function updateDepartment(id: string, data: { name?: string; description?: string; managerId?: string | null }) {
  const { name, description, managerId } = data;

  // Nếu bổ nhiệm Trưởng phòng, giải phóng vị trí Trưởng phòng cũ của nhân sự này ở phòng ban khác
  if (managerId) {
    await prisma.department.updateMany({
      where: { managerId, id: { not: id } },
      data: { managerId: null }
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
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  // Tự động đồng bộ phòng ban cho Trưởng phòng
  if (managerId) {
    await prisma.employeeProfile.update({
      where: { id: managerId },
      data: { departmentId: id }
    });
  }

  return dept;
}

export async function deleteDepartment(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: { employees: true, jobPostings: true }
      }
    }
  });

  if (!dept) throw new Error("Không tìm thấy phòng ban.");
  if (dept._count.employees > 0) {
    throw new Error(`Không thể xóa phòng ban đang có ${dept._count.employees} nhân sự trực thuộc. Vui lòng điều chuyển nhân sự sang phòng ban khác trước.`);
  }

  // Hủy liên kết tin tuyển dụng nếu có
  if (dept._count.jobPostings > 0) {
    await prisma.jobPosting.updateMany({
      where: { departmentId: id },
      data: { departmentId: null }
    });
  }

  return await prisma.department.delete({
    where: { id },
  });
}
