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
    const targetUserId = requestedUserId || session.user.id;
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName) && targetUserId !== session.user.id) {
      if (roleName !== "MANAGER") {
        return new NextResponse("Forbidden", { status: 403 });
      }
      const managedDepartment = await prisma.department.findFirst({ where: { manager: { userId: session.user.id } }, select: { id: true } });
      const targetProfile = await prisma.employeeProfile.findUnique({ where: { userId: targetUserId }, select: { departmentId: true } });
      if (!managedDepartment || !targetProfile || targetProfile.departmentId !== managedDepartment.id) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
    const yearParam = searchParams.get("year");
    const year = yearParam !== null ? Number(yearParam) : new Date().getFullYear();
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return new NextResponse("Năm không hợp lệ", { status: 400 });
    }

    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: targetUserId }
    });

    if (!profile) {
      return new NextResponse("Không tìm thấy hồ sơ nhân sự.", { status: 404 });
    }

    const balance = await getLeaveBalance(profile.id, year);
    return NextResponse.json(balance);
  } catch (error: any) {
    console.error("[LEAVE_BALANCE_GET]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
