import { NextResponse } from 'next/server';
import { calculateMonthlyPayroll } from '@/services/payroll.service';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || (role !== 'SYSTEM_ADMIN' && role !== 'HR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ error: 'Thiếu thông tin month, year' }, { status: 400 });
    }

    const payrolls = await calculateMonthlyPayroll(Number(month), Number(year));

    return NextResponse.json({ 
      success: true, 
      message: `Đã tính xong bảng lương cho ${payrolls.length} nhân viên.`,
      count: payrolls.length
    }, { status: 200 });

  } catch (error: any) {
    console.error("[PAYROLL_CALCULATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
