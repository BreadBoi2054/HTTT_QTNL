import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc, HR hoặc Trưởng phòng mới có quyền xem lịch phỏng vấn.", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    const where: any = {};
    if (applicationId) where.applicationId = applicationId;

    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        application: {
          include: { jobPosting: { select: { title: true, department: { select: { name: true } } } } }
        },
        interviewer: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(interviews);
  } catch (error: any) {
    console.error("[INTERVIEWS_GET]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc, HR hoặc Trưởng phòng mới có quyền lên lịch phỏng vấn.", { status: 403 });
    }

    const body = await req.json();
    const { applicationId, interviewerId, scheduledAt, notes } = body;

    if (!applicationId || !scheduledAt) {
      return new NextResponse("Thiếu thông tin bắt buộc (Hồ sơ ứng viên và Thời gian phỏng vấn).", { status: 400 });
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobPosting: true }
    });

    if (!app) return new NextResponse("Không tìm thấy hồ sơ ứng viên.", { status: 404 });

    const targetInterviewerId = interviewerId || session.user.id;

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        interviewerId: targetInterviewerId,
        scheduledAt: new Date(scheduledAt),
        notes: notes || "Lịch phỏng vấn chuyên môn / hội đồng nhân sự"
      },
      include: {
        application: true,
        interviewer: { select: { name: true } }
      }
    });

    if (app.status === "APPLIED" || app.status === "REVIEWING") {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "INTERVIEWING" }
      });
    }

    await prisma.auditLog.create({
      data: {
        userName: session.user.name || "Người phỏng vấn",
        userRole: roleName,
        action: `Lên lịch phỏng vấn cho ứng viên ${app.candidateName} (${app.jobPosting.title}) vào lúc ${new Date(scheduledAt).toLocaleString("vi-VN")}`,
        target: "Interview",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

    return NextResponse.json(interview, { status: 201 });
  } catch (error: any) {
    console.error("[INTERVIEWS_POST]", error);
    return new NextResponse(error.message || "Lỗi tạo lịch phỏng vấn", { status: 500 });
  }
}