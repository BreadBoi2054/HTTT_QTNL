import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { monthlyWorkdays } from "@/lib/work-calendar";
import { getWorkCalendar } from "@/services/work-calendar.service";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const params = new URL(req.url).searchParams;
  const month = Number(params.get("month"));
  const year = Number(params.get("year"));
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2100) {
    return new NextResponse("Kỳ lương không hợp lệ.", { status: 400 });
  }
  try {
    const { holidays, extraWorkdays } = await getWorkCalendar(year);
    return NextResponse.json({ month, year, workingDays: monthlyWorkdays(year, month, holidays, extraWorkdays), holidays: [...holidays].filter((day) => Number(day.slice(5, 7)) === month) });
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : "Chưa có lịch công.", { status: 400 });
  }
}
