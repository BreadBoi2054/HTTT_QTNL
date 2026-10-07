import { NextResponse } from "next/server";
import { getPayrolls, createPayroll, calculateMonthlyPayroll } from "@/services/payroll.service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const m = month ? parseInt(month) : undefined;
    const y = year ? parseInt(year) : undefined;

    const roleName = (session.user as any).roleName || "USER";
    const userEmail = session.user.email || undefined;
    const userId = session.user.id || undefined;

    const records = await getPayrolls(m, y, { userEmail, roleName, userId });
    return NextResponse.json(records);
  } catch (error) {
    console.error("[PAYROLL_GET]", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });
    
    const roleName = (session.user as any).roleName;
    if (!["SYSTEM_ADMIN", "HR"].includes(roleName)) {
      return new NextResponse("Không có quyền tính lương.", { status: 403 });
    }

    const body = await req.json();

    const actorName = session.user.name || "Kế toán / HR";

    if (body.action === "calculate") {
      const { month, year } = body;
      if (!month || !year) throw new Error("Vui lòng cung cấp tháng và năm.");
      const result = await calculateMonthlyPayroll(parseInt(month), parseInt(year), actorName);
      return NextResponse.json(result);
    }

    const result = await createPayroll(body, actorName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PAYROLL_POST]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}
