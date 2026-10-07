import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || (role !== 'SYSTEM_ADMIN' && role !== 'HR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, headcount, departmentId } = body;

    const job = await prisma.jobPosting.create({
      data: {
        title,
        description,
        headcount: parseInt(headcount) || 1,
        departmentId: departmentId || null,
        status: 'OPEN'
      }
    });
    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || !['SYSTEM_ADMIN', 'HR', 'MANAGER'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
