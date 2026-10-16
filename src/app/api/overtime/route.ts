import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOvertimeRequest, getOvertimeRequests } from "@/services/overtime.service";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const roleName = (session.user as { roleName?: string }).roleName || "USER";
  const params = new URL(req.url).searchParams;
  const month = params.has("month") ? Number(params.get("month")) : undefined;
  const year = params.has("year") ? Number(params.get("year")) : undefined;
  if ((month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12)) ||
      (year !== undefined && (!Number.isInteger(year) || year < 2000 || year > 2100))) return new NextResponse("Kỳ không hợp lệ.", { status: 400 });
  try {
    return NextResponse.json(await getOvertimeRequests({ userId: session.user.id, roleName, actorName: session.user.name || "Người dùng" }, month, year));
  } catch (error) {
    console.error("[OVERTIME_GET]", error);
    return new NextResponse("Không tải được đơn OT.", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const roleName = (session.user as { roleName?: string }).roleName || "USER";
    return NextResponse.json(await createOvertimeRequest({ userId: session.user.id, roleName, actorName: session.user.name || "Người dùng" }, await req.json()));
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Không tạo được đơn OT.", { status: 400 });
  }
}
