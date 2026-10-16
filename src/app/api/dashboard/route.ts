import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { toUtcDateOnly } from '@/services/attendance.service';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleName = (session?.user as { roleName?: string } | undefined)?.roleName || 'USER';
    const isUser = !['BOD', 'SYSTEM_ADMIN', 'HR', 'ACCOUNTANT', 'MANAGER'].includes(roleName);
    const canSeeRecruitment = ['BOD', 'SYSTEM_ADMIN', 'HR', 'MANAGER'].includes(roleName);
    if (isUser) {
      return NextResponse.json({
        totalEmployees: null,
        attendanceToday: null,
        headcountByDept: null,
        activeJobs: null,
        recentApplications: null
      });
    }

    // 1. Tổng nhân sự
    const totalEmployees = await prisma.employeeProfile.count({ where: { status: { in: ['ACTIVE', 'PROBATION'] } } });

    // 2. Headcount by Department
    const depts = await prisma.department.findMany({
      include: {
        _count: { select: { employees: { where: { status: { in: ['ACTIVE', 'PROBATION'] } } } } }
      }
    });
    
    const headcountByDept = depts
      .map(d => ({
        name: d.name,
        value: d._count.employees
      }))
      .filter(d => d.value > 0);

    // 3. Attendance Today
    const today = toUtcDateOnly(new Date());

    const attendances = await prisma.attendance.groupBy({
      by: ['status'],
      where: { date: today },
      _count: { status: true }
    });

    const attendanceToday = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      LEAVE: 0
    };

    attendances.forEach(a => {
      if (a.status === 'PRESENT') attendanceToday.PRESENT = a._count.status;
      if (a.status === 'LATE') attendanceToday.LATE = a._count.status;
      if (a.status === 'ABSENT') attendanceToday.ABSENT = a._count.status;
      if (a.status === 'LEAVE') attendanceToday.LEAVE = a._count.status;
    });

    // 4. Tuyển dụng
    const activeJobs = canSeeRecruitment ? await prisma.jobPosting.count({ where: { status: 'OPEN', OR: [{ dueDate: null }, { dueDate: { gte: toUtcDateOnly() } }] } }) : null;

    const recentApplications = canSeeRecruitment ? await prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { jobPosting: { select: { title: true } } }
    }) : [];

    const formattedApplications = recentApplications.map(app => ({
      id: app.id,
      candidateName: app.candidateName,
      jobTitle: app.jobPosting.title,
      status: app.status,
      createdAt: app.createdAt
    }));

    return NextResponse.json({
      totalEmployees,
      attendanceToday,
      headcountByDept,
      activeJobs,
      recentApplications: canSeeRecruitment ? formattedApplications : null
    });

  } catch (error: any) {
    console.error("[DASHBOARD_API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
