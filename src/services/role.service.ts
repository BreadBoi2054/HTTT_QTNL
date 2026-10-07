import { prisma } from "@/lib/prisma";

export async function getRoles() {
  return await prisma.role.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });
}

export async function createRole(data: { name: string; permissions?: string }) {
  return await prisma.role.create({ data });
}

export async function updateRole(id: string, data: { name?: string; permissions?: string }) {
  return await prisma.role.update({ where: { id }, data });
}

export async function deleteRole(id: string) {
  return await prisma.role.delete({ where: { id } });
}
