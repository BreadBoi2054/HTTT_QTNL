import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createHmac } from "node:crypto";

const MANAGERS = ["SYSTEM_ADMIN", "BOD", "HR"];
const respondentKey = (surveyId: string, userId: string) =>
  createHmac("sha256", process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development-survey-key").update(`${surveyId}:${userId}`).digest("hex");

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [courses, surveys] = await Promise.all([
      prisma.trainingCourse.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.survey.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    const responses = await prisma.surveyResponse.findMany({
      where: { respondentKey: { in: surveys.map((survey) => respondentKey(survey.id, session.user.id!)) } },
      select: { surveyId: true },
    });
    const responded = new Set(responses.map((response) => response.surveyId));
    return NextResponse.json({ courses, surveys: surveys.map((survey) => ({ ...survey, hasResponded: responded.has(survey.id) })) });
  } catch (error) {
    console.error("GET training-surveys error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu đào tạo và khảo sát" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!MANAGERS.includes(roleName)) {
      return NextResponse.json({ error: "Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự mới có quyền khởi tạo khóa đào tạo / khảo sát." }, { status: 403 });
    }

    const body = await req.json();
    if (typeof body.title !== "string" || !body.title.trim()) return NextResponse.json({ error: "Vui lòng nhập tên khóa học hoặc khảo sát." }, { status: 400 });

    if (body.type === "SURVEY" || body.targetDept) {
      const survey = await prisma.survey.create({
        data: {
          title: body.title,
          targetDept: body.targetDept || "Toàn tập đoàn",
          respondents: 0,
          totalTarget: Number(body.totalTarget) || 38,
          deadline: body.deadline || "31/10/2026",
          score: 0,
          status: "ACTIVE",
        },
      });

      await prisma.auditLog.create({
        data: {
          userName: session.user?.name || "Người dùng",
          userRole: roleName,
          action: `Phát động Khảo sát nội bộ: ${body.title}`,
          target: "Survey",
          ip: "127.0.0.1",
          status: "SUCCESS",
        },
      });

      return NextResponse.json(survey, { status: 201 });
    }

    const course = await prisma.trainingCourse.create({
      data: {
        title: body.title,
        instructor: body.instructor || "Giảng viên chuyên môn",
        category: body.category || "Kỹ năng chuyên môn",
        duration: body.duration || "16 giờ",
        participants: Number(body.participants) || 0,
        progress: 0,
        startDate: body.startDate || new Date().toISOString().slice(0, 10),
        status: "ENROLLING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Người dùng",
        userRole: roleName,
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

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    const body = await req.json();
    const targetId = body.id || body.courseId || body.surveyId;

    if (!targetId) {
      return NextResponse.json({ error: "Thiếu ID bản ghi cần cập nhật" }, { status: 400 });
    }

    if (body.kind === "SURVEY" || body.type === "SURVEY" || body.surveyId || body.rating !== undefined || body.score !== undefined) {
      const existingSurvey = await prisma.survey.findUnique({ where: { id: targetId } });
      if (!existingSurvey) {
        return NextResponse.json({ error: "Không tìm thấy khảo sát" }, { status: 404 });
      }

      if (body.status !== undefined) {
        if (!MANAGERS.includes(roleName)) return NextResponse.json({ error: "Bạn không có quyền đóng hoặc mở khảo sát." }, { status: 403 });
        if (!["ACTIVE", "CLOSED"].includes(body.status)) return NextResponse.json({ error: "Trạng thái khảo sát không hợp lệ." }, { status: 400 });
        const result = await prisma.survey.update({ where: { id: targetId }, data: { status: body.status } });
        return NextResponse.json(result);
      }
      if (!Number.isFinite(Number(body.score)) || Number(body.score) < 1 || Number(body.score) > 5) {
        return NextResponse.json({ error: "Điểm phản hồi phải từ 1 đến 5." }, { status: 400 });
      }
      if (existingSurvey.status !== "ACTIVE") return NextResponse.json({ error: "Khảo sát đã đóng." }, { status: 409 });
      const submittedScore = Number(body.score);
      try {
        await prisma.surveyResponse.create({ data: { surveyId: targetId, respondentKey: respondentKey(targetId, session.user.id), score: submittedScore } });
      } catch (error: any) {
        if (error?.code === "P2002") return NextResponse.json({ error: "Bạn đã gửi phản hồi cho khảo sát này." }, { status: 409 });
        throw error;
      }
      const newRespondents = existingSurvey.respondents + 1;
      const weightedScore = Math.round((((existingSurvey.score * existingSurvey.respondents) + submittedScore) / newRespondents) * 10) / 10;
      const updatedSurvey = await prisma.survey.update({ where: { id: targetId }, data: { respondents: newRespondents, score: weightedScore } });

      await prisma.auditLog.create({
        data: {
          userName: session.user?.name || "Nhân viên",
          userRole: roleName,
          action: `Gửi phản hồi khảo sát nội bộ: ${updatedSurvey.title} (${submittedScore}/5 điểm)`,
          target: "Survey",
          ip: "127.0.0.1",
          status: "SUCCESS"
        }
      });

      return NextResponse.json(updatedSurvey);
    }

    if (!MANAGERS.includes(roleName)) return NextResponse.json({ error: "Bạn không có quyền chỉnh sửa tiến độ khóa học." }, { status: 403 });
    const existingCourse = await prisma.trainingCourse.findUnique({ where: { id: targetId } });
    if (!existingCourse) {
      return NextResponse.json({ error: "Không tìm thấy khóa đào tạo" }, { status: 404 });
    }

    const nextParticipants = body.participants !== undefined ? Number(body.participants) : existingCourse.participants;

    const nextProgress =
      body.progress !== undefined
        ? Math.min(100, Math.max(0, Number(body.progress)))
        : body.incrementProgress !== undefined
        ? Math.min(100, existingCourse.progress + Number(body.incrementProgress))
        : existingCourse.progress;
    if (!Number.isFinite(nextProgress) || nextProgress < 0 || nextProgress > 100 || !Number.isInteger(nextParticipants) || nextParticipants < 0) {
      return NextResponse.json({ error: "Số học viên hoặc tiến độ không hợp lệ." }, { status: 400 });
    }

    const nextStatus =
      body.status ||
      (nextProgress >= 100 ? "COMPLETED" : nextProgress > 0 ? "IN_PROGRESS" : existingCourse.status);

    const updatedCourse = await prisma.trainingCourse.update({
      where: { id: targetId },
      data: {
        participants: nextParticipants,
        progress: nextProgress,
        status: nextStatus
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Nhân viên",
        userRole: roleName,
        action: `Cập nhật tham gia khóa đào tạo: ${updatedCourse.title} (Học viên: ${updatedCourse.participants}, Tiến độ: ${updatedCourse.progress}%)`,
        target: "TrainingCourse",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("PATCH training-surveys error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật đào tạo / khảo sát" }, { status: 500 });
  }
}
