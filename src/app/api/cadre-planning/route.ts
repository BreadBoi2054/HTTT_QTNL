import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.successionPlan.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET cadre-planning error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu quy hoạch cán bộ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "HR", "MANAGER"].includes(roleName)) {
      return NextResponse.json({ error: "Chỉ Quản trị viên, Nhân sự hoặc Trưởng phòng mới có quyền quy hoạch cán bộ." }, { status: 403 });
    }

    const body = await req.json();

    const plan = await prisma.successionPlan.create({
      data: {
        position: body.position,
        department: body.department,
        currentHolder: body.currentHolder,
        successorName: body.successorName,
        successorEmail: body.successorEmail,
        readiness: body.readiness || "READY_1_2_YEARS",
        potentialScore: body.potentialScore || "HIGH",
        mentor: body.mentor,
        plannedYear: body.plannedYear || "2026 - 2028",
        status: "APPROVED",
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Người dùng",
        userRole: (session.user as any)?.roleName || "USER",
        action: `Phê duyệt Quy hoạch cán bộ nguồn: ${body.position} (${body.successorName})`,
        target: "SuccessionPlan",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("POST cadre-planning error:", error);
    return NextResponse.json({ error: "Lỗi tạo hồ sơ quy hoạch cán bộ" }, { status: 500 });
  }
}
