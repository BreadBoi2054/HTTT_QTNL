import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobPostingId, name, email, phone, cvUrl } = body;
    
    if (!jobPostingId || !name || !email || !cvUrl) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }, { status: 400 });
    }

    if (typeof cvUrl !== 'string' || (!cvUrl.startsWith('http://') && !cvUrl.startsWith('https://'))) {
      return NextResponse.json({ error: 'Đường dẫn CV không hợp lệ (phải bắt đầu bằng http:// hoặc https://)' }, { status: 400 });
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId }
    });

    if (!job || job.status !== 'OPEN') {
      return NextResponse.json({ error: 'Vị trí tuyển dụng không tồn tại hoặc đã ngừng nhận hồ sơ' }, { status: 400 });
    }

    const existingApp = await prisma.application.findFirst({
      where: {
        jobPostingId,
        candidateEmail: { equals: String(email).trim(), mode: 'insensitive' }
      }
    });

    if (existingApp) {
      return NextResponse.json({ error: 'Email này đã nộp hồ sơ ứng tuyển vào vị trí này rồi' }, { status: 409 });
    }

    const app = await prisma.application.create({
      data: {
        jobPostingId,
        candidateName: String(name).trim(),
        candidateEmail: String(email).trim(),
        candidatePhone: phone ? String(phone).trim() : "",
        cvUrl: cvUrl.trim(),
        status: 'APPLIED'
      }
    });
    
    return NextResponse.json(app);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}