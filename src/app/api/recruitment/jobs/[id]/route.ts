import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || !['SYSTEM_ADMIN', 'BOD', 'HR'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, headcount, status, departmentId, dueDate } = body;
    const parsedDueDate = dueDate ? new Date(`${String(dueDate).slice(0, 10)}T00:00:00.000Z`) : null;
    if (parsedDueDate && Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: 'Hạn nộp hồ sơ không hợp lệ.' }, { status: 400 });
    }

    const job = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        title,
        description,
        headcount: parseInt(headcount) || 1,
        ...(departmentId !== undefined ? { departmentId: departmentId || null } : {}),
        ...(dueDate !== undefined ? { dueDate: parsedDueDate } : {}),
        status: status || 'OPEN'
      }
    });
    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || !['SYSTEM_ADMIN', 'BOD', 'HR'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.jobPosting.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}