import { NextResponse } from "next/server";
import { updateLeaveRequestStatus, deleteLeaveRequest } from "@/services/leave.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const roleName = (session.user as any).roleName || "USER";
    const callerUserId = (session.user as any)?.id;

    const hasFieldUpdates =
      body.startDate !== undefined ||
      body.endDate !== undefined ||
      body.type !== undefined ||
      body.reason !== undefined;

    if (hasFieldUpdates) {
      const existingLeave = await prisma.leaveRequest.findUnique({
        where: { id },
        include: { employee: true }
      });

      if (!existingLeave) {
        return new NextResponse("Không tìm thấy đơn nghỉ phép", { status: 404 });
      }

      if (existingLeave.status !== "PENDING") {
        return new NextResponse("Chỉ có thể chỉnh sửa đơn nghỉ phép đang ở trạng thái chờ duyệt (PENDING)", { status: 400 });
      }

      const isOwner = existingLeave.employee.userId === callerUserId;
      const isPrivileged = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName);
      if (!isOwner && !isPrivileged) {
        return new NextResponse("Không có quyền chỉnh sửa đơn nghỉ phép này", { status: 403 });
      }

      const updatedLeave = await prisma.leaveRequest.update({
        where: { id },
        data: {
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          type: body.type ?? undefined,
          reason: body.reason !== undefined ? body.reason : undefined
        }
      });

      if (!body.status || body.status === "PENDING") {
        return NextResponse.json(updatedLeave);
      }
    }

    if (!body.status) {
      return new NextResponse("Trạng thái phê duyệt (status) là bắt buộc", { status: 400 });
    }

    const result = await updateLeaveRequestStatus(id, body.status, roleName, (session.user as any)?.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[LEAVE_PUT]", error);
    return new NextResponse(error.message || "Internal Error", { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const userId = session.user.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const roleName = (session.user as any).roleName || "USER";

    await deleteLeaveRequest(id, userId, roleName);
    return new NextResponse("Deleted", { status: 200 });
  } catch (error: any) {
    console.error("[LEAVE_DELETE]", error);
    return new NextResponse(error.message || "Internal Error", { status: 400 });
  }
}