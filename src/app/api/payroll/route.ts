import { NextResponse } from "next/server";
import { getPayrolls, createPayroll, calculateMonthlyPayroll, bulkDisbursePayrolls } from "@/services/payroll.service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const m = month !== null ? Number(month) : undefined;
    const y = year !== null ? Number(year) : undefined;
    if ((m !== undefined && (!Number.isInteger(m) || m < 1 || m > 12)) ||
        (y !== undefined && (!Number.isInteger(y) || y < 2000 || y > 2100))) {
      return new NextResponse("Kỳ lương không hợp lệ.", { status: 400 });
    }

    const roleName = (session.user as any).roleName || "USER";
    if (!["USER", "MANAGER", "HR", "ACCOUNTANT", "BOD", "SYSTEM_ADMIN"].includes(roleName)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const userId = session.user.id || undefined;

    const records = await getPayrolls(m, y, { roleName, userId });
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
    if (!["SYSTEM_ADMIN", "BOD", "HR", "ACCOUNTANT"].includes(roleName)) {
      return new NextResponse("Không có quyền tính lương.", { status: 403 });
    }

    const body = await req.json();
    const actorName = session.user.name || "Kế toán / HR";

    if (body.action === "calculate") {
      const { month, year } = body;
      if (!month || !year) throw new Error("Vui lòng cung cấp tháng và năm.");
      const result = await calculateMonthlyPayroll(parseInt(month), parseInt(year), actorName, roleName);
      return NextResponse.json(result);
    }

    const result = await createPayroll(body, actorName, roleName, session.user.id || undefined);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PAYROLL_POST]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName;
    if (!["SYSTEM_ADMIN", "BOD"].includes(roleName)) {
      return new NextResponse("Chỉ Tổng Giám Đốc (BOD) hoặc Quản trị viên mới có thẩm quyền duyệt chi hàng loạt.", { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const actorName = session.user.name || "Ban Giám Đốc";
    const result = await bulkDisbursePayrolls(body.ids || [], actorName, roleName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PAYROLL_PATCH]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}
