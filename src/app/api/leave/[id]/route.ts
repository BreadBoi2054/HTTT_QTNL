import { NextResponse } from "next/server";
import { updateLeaveRequestStatus, updateLeaveRequestDetails, deleteLeaveRequest } from "@/services/leave.service";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const roleName = (session.user as any).roleName || "USER";
    const callerUserId = session.user.id;

    const hasFieldUpdates =
      body.startDate !== undefined ||
      body.endDate !== undefined ||
      body.type !== undefined ||
      body.reason !== undefined;

    if (hasFieldUpdates) {
      if (body.status && body.status !== "PENDING") {
        return new NextResponse("Hãy chỉnh sửa đơn và xét duyệt trong hai thao tác riêng", { status: 400 });
      }
      const updatedLeave = await updateLeaveRequestDetails(id, body, roleName, callerUserId);
      return NextResponse.json(updatedLeave);
    }

    if (!body.status) {
      return new NextResponse("Trạng thái phê duyệt (status) là bắt buộc", { status: 400 });
    }

    const result = await updateLeaveRequestStatus(id, body.status, roleName, session.user.name || undefined, callerUserId);
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
