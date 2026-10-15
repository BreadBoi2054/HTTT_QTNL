import { NextResponse } from "next/server";
import { getPerformanceEvaluations, upsertPerformanceEvaluation } from "@/services/performance.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER", "USER"].includes(roleName)) {
      return new NextResponse("Bạn không có quyền xem đánh giá hiệu suất.", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    const userEmail = session.user.email || undefined;
    const userId = session.user.id || undefined;

    const evaluations = await getPerformanceEvaluations(period, year, { userEmail, roleName, userId });
    return NextResponse.json(evaluations);
  } catch (error: any) {
    console.error("[PERFORMANCE_GET]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return new NextResponse("Không có thẩm quyền đánh giá hiệu suất.", { status: 403 });
    }

    const body = await req.json();
    const scores = [body.selfScore, body.managerScore, body.criterion1, body.criterion2, body.criterion3];
    if (!body.employeeId || (body.year !== undefined && !Number.isInteger(Number(body.year))) || scores.some((score) => score !== undefined && (!Number.isFinite(Number(score)) || Number(score) < 0 || Number(score) > 100))) {
      return NextResponse.json({ error: "Thông tin kỳ đánh giá hoặc điểm số không hợp lệ (0–100)." }, { status: 400 });
    }
    if (roleName === "MANAGER") {
      const employee = await prisma.employeeProfile.findUnique({ where: { id: body.employeeId }, select: { id: true, departmentId: true } });
      const actor = await prisma.employeeProfile.findUnique({ where: { userId: session.user.id }, select: { id: true, departmentId: true, managedDept: { select: { id: true } } } });
      const managedDepartmentId = actor?.managedDept?.id || actor?.departmentId;
      if (!employee || !actor || employee.departmentId !== managedDepartmentId || employee.id === actor.id) {
        return NextResponse.json({ error: "Chỉ được đánh giá nhân sự thuộc phòng ban của bạn." }, { status: 403 });
      }
    }
    const actorName = session.user.name || "Hội đồng Đánh giá";

    const result = await upsertPerformanceEvaluation({
      ...body,
      status: roleName === "MANAGER" ? "PENDING_REVIEW" : body.status === "APPROVED" ? "APPROVED" : "PENDING_REVIEW",
    }, actorName, roleName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PERFORMANCE_POST]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
