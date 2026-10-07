import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobPostingId, name, email, phone, cvUrl } = body;
    
    if (!jobPostingId || !name || !email || !cvUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const app = await prisma.application.create({
      data: {
        jobPostingId,
        candidateName: name,
        candidateEmail: email,
        candidatePhone: phone || "",
        cvUrl,
        status: 'APPLIED'
      }
    });
    
    return NextResponse.json(app);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
