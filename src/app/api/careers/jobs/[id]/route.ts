import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: { department: true }
    });
    if (!job || job.status !== 'OPEN') {
      return NextResponse.json({ error: 'Job not found or closed' }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}