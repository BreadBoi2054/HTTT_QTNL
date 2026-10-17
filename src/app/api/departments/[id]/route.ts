import { NextResponse } from "next/server";
import { updateDepartment, deleteDepartment } from "@/services/department.service";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName;
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự mới có quyền cập nhật phòng ban.", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, managerId } = body;

    const actorName = session.user?.name || "Quản trị viên";
    const department = await updateDepartment(id, { name, description, managerId }, actorName, roleName);
    return NextResponse.json(department);
  } catch (error) {
    console.error("[DEPARTMENT_PUT]", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName;
    if (!["SYSTEM_ADMIN", "BOD"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên hệ thống (SYSTEM_ADMIN) hoặc Ban Giám Đốc (BOD) mới có quyền xóa phòng ban.", { status: 403 });
    }

    const { id } = await params;
    const actorName = session.user?.name || "Quản trị viên";
    const department = await deleteDepartment(id, actorName, roleName);
    return NextResponse.json(department);
  } catch (error: any) {
    console.error("[DEPARTMENT_DELETE]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}