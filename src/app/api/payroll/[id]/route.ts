import { NextResponse } from "next/server";
import { updatePayroll, deletePayroll } from "@/services/payroll.service";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName;
    if (!["SYSTEM_ADMIN", "BOD", "HR", "ACCOUNTANT"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc, Kế toán hoặc Nhân sự mới có quyền chỉnh sửa phiếu lương.", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Duyệt chi trả (PAID) dành riêng cho Ban Giám Đốc (BOD) hoặc Quản trị viên cấp cao
    if (body.status === "PAID" && !["SYSTEM_ADMIN", "BOD"].includes(roleName)) {
      return new NextResponse("Chỉ Ban Giám Đốc (BOD) hoặc Quản trị viên cấp cao mới có quyền duyệt chi trả (PAID).", { status: 403 });
    }

    const actorName = session.user?.name || "Kế toán / HR";
    const result = await updatePayroll(id, body, actorName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PAYROLL_PUT]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName;
    if (!["SYSTEM_ADMIN", "BOD", "HR", "ACCOUNTANT"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc, Kế toán hoặc Nhân sự mới có quyền xóa phiếu lương nháp (DRAFT).", { status: 403 });
    }

    const { id } = await params;
    const actorName = session.user?.name || "Quản trị viên";
    const result = await deletePayroll(id, actorName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PAYROLL_DELETE]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}