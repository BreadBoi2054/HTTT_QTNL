import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [courses, surveys] = await Promise.all([
      prisma.trainingCourse.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.survey.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({ courses, surveys });
  } catch (error) {
    console.error("GET training-surveys error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu đào tạo và khảo sát" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "HR"].includes(roleName)) {
      return NextResponse.json({ error: "Chỉ Quản trị viên hoặc Nhân sự mới có quyền khởi tạo khóa đào tạo." }, { status: 403 });
    }

    const body = await req.json();

    const course = await prisma.trainingCourse.create({
      data: {
        title: body.title,
        instructor: body.instructor,
        category: body.category || "Kỹ năng chuyên môn",
        duration: body.duration || "16 giờ",
        participants: Number(body.participants) || 0,
        progress: 0,
        startDate: body.startDate,
        status: "ENROLLING",
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Người dùng",
        userRole: (session.user as any)?.roleName || "USER",
        action: `Tạo Khóa đào tạo mới: ${body.title}`,
        target: "TrainingCourse",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST training course error:", error);
    return NextResponse.json({ error: "Lỗi tạo khóa học" }, { status: 500 });
  }
}
