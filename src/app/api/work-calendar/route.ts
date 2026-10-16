import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCalendarSummary, saveWorkCalendar } from "@/services/work-calendar.service";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const year = Number(new URL(req.url).searchParams.get("year"));
  try {
    return NextResponse.json(await getCalendarSummary(year));
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Không tải được lịch công.", { status: 400 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const role = (session.user as { roleName?: string }).roleName || "USER";
  if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(role)) return new NextResponse("Không có quyền cập nhật lịch công.", { status: 403 });
  try {
    const { year, holidays, extraWorkdays } = await req.json();
    await saveWorkCalendar(Number(year), holidays, extraWorkdays, session.user.name || "Người dùng", role);
    return NextResponse.json(await getCalendarSummary(Number(year)));
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Không lưu được lịch công.", { status: 400 });
  }
}
