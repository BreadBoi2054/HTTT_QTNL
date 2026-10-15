import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return NextResponse.json({ error: "Bạn không có quyền truy cập dữ liệu quy hoạch cán bộ." }, { status: 403 });
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
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return NextResponse.json({ error: "Chỉ Quản trị viên, Ban Giám Đốc, Nhân sự hoặc Trưởng phòng mới có quyền quy hoạch cán bộ." }, { status: 403 });
    }

    const body = await req.json();
    const initialStatus = roleName === "MANAGER" ? "REVIEWING" : "APPROVED";

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
        status: initialStatus,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Người dùng",
        userRole: roleName,
        action: `${initialStatus === "APPROVED" ? "Phê duyệt" : "Đề xuất"} Quy hoạch cán bộ nguồn: ${body.position} (${body.successorName})`,
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

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return NextResponse.json({ error: "Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự mới có quyền phê duyệt / cập nhật quy hoạch cán bộ." }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, readiness, potentialScore, mentor, plannedYear } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID hồ sơ quy hoạch cán bộ" }, { status: 400 });
    }

    const existing = await prisma.successionPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ quy hoạch cán bộ" }, { status: 404 });
    }

    const updated = await prisma.successionPlan.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        readiness: readiness ?? existing.readiness,
        potentialScore: potentialScore ?? existing.potentialScore,
        mentor: mentor ?? existing.mentor,
        plannedYear: plannedYear ?? existing.plannedYear,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Ban Giám Đốc / HR",
        userRole: roleName,
        action: `Cập nhật Quy hoạch cán bộ nguồn: ${updated.position} (${updated.successorName} - Trạng thái: ${updated.status})`,
        target: "SuccessionPlan",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH cadre-planning error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật hồ sơ quy hoạch cán bộ" }, { status: 500 });
  }
}