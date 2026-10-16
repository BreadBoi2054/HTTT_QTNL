import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toUtcDateOnly } from '@/services/attendance.service';

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: { status: 'OPEN', OR: [{ dueDate: null }, { dueDate: { gte: toUtcDateOnly() } }] },
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
