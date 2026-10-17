import { NextResponse } from "next/server";
import { updateContract, deleteContract } from "@/services/contract.service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự (HR) mới có quyền chỉnh sửa Hợp đồng lao động.", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const actor = {
      name: session.user.name || "HR",
      roleName,
      userId: session.user.id || undefined,
    };

    const result = await updateContract(id, body, actor);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[CONTRACTS_PUT]", error);
    return new NextResponse(error.message || "Lỗi cập nhật hợp đồng", { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự (HR) mới có quyền xóa Hợp đồng lao động.", { status: 403 });
    }

    const { id } = await params;
    const actor = {
      name: session.user.name || "HR",
      roleName,
      userId: session.user.id || undefined,
    };

    const result = await deleteContract(id, actor);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[CONTRACTS_DELETE]", error);
    return new NextResponse(error.message || "Lỗi xóa hợp đồng", { status: 400 });
  }
}