import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { decideOvertimeRequest } from "@/services/overtime.service";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const { id } = await context.params;
    const { status } = await req.json();
    if (status !== "APPROVED" && status !== "REJECTED") return new NextResponse("Trạng thái không hợp lệ.", { status: 400 });
    const roleName = (session.user as { roleName?: string }).roleName || "USER";
    return NextResponse.json(await decideOvertimeRequest({ userId: session.user.id, roleName, actorName: session.user.name || "Người dùng" }, id, status));
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Không cập nhật được đơn OT.", { status: 400 });
  }
}
