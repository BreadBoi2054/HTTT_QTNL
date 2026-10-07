import { NextResponse } from "next/server";
import { getAttendances } from "@/services/attendance.service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    let targetDate: Date | undefined;
    
    if (dateStr) {
      const parts = dateStr.split("-").map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        targetDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      } else {
        targetDate = new Date(dateStr);
      }
    }

    const roleName = (session.user as any)?.roleName || "USER";
    const userEmail = session.user?.email || undefined;
    const userId = session.user?.id || undefined;

    const records = await getAttendances(targetDate, { userEmail, roleName, userId });
    return NextResponse.json(records);
  } catch (error) {
    console.error("[ATTENDANCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
