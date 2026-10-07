import { NextResponse } from "next/server";
import { getLeaveRequests, createLeaveRequest } from "@/services/leave.service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const roleName = (session.user as any).roleName || "USER";

    const records = await getLeaveRequests(userId, roleName);
    return NextResponse.json(records);
  } catch (error) {
    console.error("[LEAVE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const roleName = (session.user as any).roleName || "USER";
    const body = await req.json();

    const result = await createLeaveRequest(userId, body, roleName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[LEAVE_POST]", error);
    return new NextResponse(error.message || "Internal Error", { status: 400 });
  }
}
