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
    if (!["SYSTEM_ADMIN", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên hoặc Nhân sự mới có quyền cập nhật phòng ban.", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, managerId } = body;

    const department = await updateDepartment(id, { name, description, managerId });
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
    if (roleName !== "SYSTEM_ADMIN") {
      return new NextResponse("Chỉ Quản trị viên hệ thống (SYSTEM_ADMIN) mới có quyền xóa phòng ban.", { status: 403 });
    }

    const { id } = await params;
    const department = await deleteDepartment(id);
    return NextResponse.json(department);
  } catch (error: any) {
    console.error("[DEPARTMENT_DELETE]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 400 });
  }
}
