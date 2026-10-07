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

    // Nếu là USER bình thường, ta có thể hạn chế dữ liệu trả về
    const isUser = (session?.user as any)?.roleName === 'USER';

    // 1. Tổng nhân sự
    const totalEmployees = await prisma.employeeProfile.count();

    // 2. Headcount by Department
    const depts = await prisma.department.findMany({
      include: {
        _count: { select: { employees: true } }
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
    const activeJobs = await prisma.jobPosting.count({
      where: { status: 'OPEN' }
    });

    const recentApplications = await prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { jobPosting: { select: { title: true } } }
    });

    const formattedApplications = recentApplications.map(app => ({
      id: app.id,
      candidateName: app.candidateName,
      jobTitle: app.jobPosting.title,
      status: app.status,
      createdAt: app.createdAt
    }));

    if (isUser) {
      // Ẩn dữ liệu nhạy cảm đối với tài khoản USER
      return NextResponse.json({
        totalEmployees,
        attendanceToday: null,
        headcountByDept: null,
        activeJobs,
        recentApplications: null
      });
    }

    return NextResponse.json({
      totalEmployees,
      attendanceToday,
      headcountByDept,
      activeJobs,
      recentApplications: formattedApplications
    });

  } catch (error: any) {
    console.error("[DASHBOARD_API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
