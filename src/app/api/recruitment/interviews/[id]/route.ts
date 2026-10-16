import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc, HR hoặc Trưởng phòng mới có quyền cập nhật kết quả phỏng vấn.", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { scheduledAt, result, notes } = body;
    if (scheduledAt && !Number.isFinite(new Date(scheduledAt).getTime())) {
      return new NextResponse("Thời gian phỏng vấn không hợp lệ.", { status: 400 });
    }
    if (result !== undefined && !["PASS", "FAIL"].includes(result)) {
      return new NextResponse("Kết quả phỏng vấn không hợp lệ.", { status: 400 });
    }

    if (body.advanceToOffer === true && !["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự (HR) mới có quyền chuyển ứng viên sang trạng thái Gửi Offer (OFFERED).", { status: 403 });
    }

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { jobPosting: true } } }
    });

    if (!existing) return new NextResponse("Không tìm thấy lịch phỏng vấn", { status: 404 });
    if (roleName === "MANAGER") {
      const managedDept = await prisma.department.findFirst({ where: { manager: { userId: session.user.id } }, select: { id: true } });
      if (!managedDept || existing.application.jobPosting.departmentId !== managedDept.id) {
        return new NextResponse("Chỉ được cập nhật phỏng vấn thuộc phòng ban đang phụ trách.", { status: 403 });
      }
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        result: result ?? undefined,
        notes: notes ?? undefined
      }
    });

    if (body.advanceToOffer === true && ["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      await prisma.application.update({
        where: { id: existing.applicationId },
        data: { status: "OFFERED" }
      });
    } else if (result === "FAIL" && body.rejectCandidate === true) {
      await prisma.application.update({
        where: { id: existing.applicationId },
        data: { status: "REJECTED" }
      });
    }

    await prisma.auditLog.create({
      data: {
        userName: session.user.name || "Người phỏng vấn",
        userRole: roleName,
        action: `Cập nhật kết quả phỏng vấn (${existing.application.candidateName} - Kết quả: ${result || "Đã lưu nhận xét"})`,
        target: "Interview",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[INTERVIEW_PATCH]", error);
    return new NextResponse(error.message || "Lỗi cập nhật", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc hoặc HR mới có quyền hủy lịch phỏng vấn.", { status: 403 });
    }

    const { id } = await params;
    const deleted = await prisma.interview.delete({ where: { id } });

    return NextResponse.json(deleted);
  } catch (error: any) {
    console.error("[INTERVIEW_DELETE]", error);
    return new NextResponse(error.message || "Lỗi hủy lịch", { status: 500 });
  }
}
