import { NextResponse } from "next/server";
import { getLeaveBalance } from "@/services/leave.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");
    const targetUserId = roleName === "USER" ? session.user.id : (requestedUserId || session.user.id);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: targetUserId }
    });

    if (!profile) {
      return NextResponse.json({
        allowance: 12,
        usedDays: 0,
        remainingDays: 12
      });
    }

    const balance = await getLeaveBalance(profile.id, year);
    return NextResponse.json(balance);
  } catch (error: any) {
    console.error("[LEAVE_BALANCE_GET]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}