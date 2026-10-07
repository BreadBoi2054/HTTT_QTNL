import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import * as xlsx from 'xlsx';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause: any = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0); // last day of month
      
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const roleName = (session.user as any)?.roleName || "USER";
    const userEmail = session.user?.email;
    const userId = session.user?.id;

    if (roleName === "USER" && userEmail) {
      whereClause.employee = { user: { email: userEmail } };
    } else if (roleName === "MANAGER" && userId) {
      const managedDept = await prisma.department.findFirst({
        where: { manager: { userId } },
        select: { id: true }
      });
      if (managedDept) {
        whereClause.employee = {
          OR: [
            { departmentId: managedDept.id },
            { user: { id: userId } }
          ]
        };
      } else {
        whereClause.employee = { user: { id: userId } };
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: true
          }
        }
      }
    });

    const data = attendances.map(record => ({
      'Mã Nhân viên': record.employeeId,
      'Họ tên': record.employee.user.name,
      'Email': record.employee.user.email,
      'Phòng ban': record.employee.department?.name || 'N/A',
      'Ngày làm việc': record.date.toISOString().split('T')[0],
      'Giờ Check-in': record.checkIn ? new Date(record.checkIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      'Giờ Check-out': record.checkOut ? new Date(record.checkOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      'Trạng thái': record.status,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="attendance_report.xlsx"'
      }
    });
  } catch (error: any) {
    console.error("[EXCEL_EXPORT_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
