import { NextResponse } from "next/server";
import { updateLeaveRequestStatus, deleteLeaveRequest } from "@/services/leave.service";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    const { status } = body;
    if (!status) {
      return new NextResponse("Trạng thái phê duyệt (status) là bắt buộc", { status: 400 });
    }
    const roleName = (session.user as any).roleName || "USER";
    const actorName = session.user.name || "Người xét duyệt";
    const actorUserId = session.user.id;

    const result = await updateLeaveRequestStatus(resolvedParams.id, status, roleName, actorName, actorUserId);
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

    const resolvedParams = await params;
    const userId = session.user.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const roleName = (session.user as any).roleName || "USER";

    await deleteLeaveRequest(resolvedParams.id, userId, roleName);
    return new NextResponse("Deleted", { status: 200 });
  } catch (error: any) {
    console.error("[LEAVE_DELETE]", error);
    return new NextResponse(error.message || "Internal Error", { status: 400 });
  }
}
