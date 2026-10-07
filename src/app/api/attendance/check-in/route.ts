import { NextResponse } from "next/server";
import { processCheckIn } from "@/services/attendance.service";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const record = await processCheckIn(session.user.id);
    return NextResponse.json(record);
  } catch (error: any) {
    console.error("[CHECK_IN_POST]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}
