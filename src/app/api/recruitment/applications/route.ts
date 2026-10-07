import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any)?.roleName;
    if (!['SYSTEM_ADMIN', 'HR', 'MANAGER'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let whereClause: any = {};
    if (role === 'MANAGER') {
      const managedDept = await prisma.department.findFirst({
        where: { manager: { userId: session.user.id } },
        select: { id: true }
      });
      if (managedDept) {
        whereClause = { jobPosting: { departmentId: managedDept.id } };
      } else {
        const empProfile = await prisma.employeeProfile.findUnique({
          where: { userId: session.user.id },
          select: { departmentId: true }
        });
        if (empProfile?.departmentId) {
          whereClause = { jobPosting: { departmentId: empProfile.departmentId } };
        }
      }
    }

    const apps = await prisma.application.findMany({
      where: whereClause,
      include: {
        jobPosting: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(apps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
