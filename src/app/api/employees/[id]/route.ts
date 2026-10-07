import { NextResponse } from "next/server";
import { updateEmployee, deleteEmployee } from "@/services/employee.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();
    
    if (body.roleId) {
      const currentUserRole = (session?.user as any)?.roleName;
      const targetRole = await prisma.role.findUnique({ where: { id: body.roleId } });
      if (!targetRole) return new NextResponse("Vai trò không hợp lệ", { status: 400 });

      if (currentUserRole !== "SYSTEM_ADMIN") {
        if (targetRole.name === "SYSTEM_ADMIN") {
          return new NextResponse("Bạn không có quyền gán vai trò Quản trị viên hệ thống (SYSTEM_ADMIN)", { status: 403 });
        }
        if (currentUserRole === "MANAGER" && targetRole.name !== "USER") {
          return new NextResponse("Bạn chỉ có quyền tạo tài khoản nhân viên (USER)", { status: 403 });
        }
      }
    }

    const actorName = session.user?.name || "Người quản lý";
    const roleName = (session.user as any)?.roleName || "HR";
    const result = await updateEmployee(id, body, actorName, roleName);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[EMPLOYEE_PUT]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const currentUserRole = (session?.user as any)?.roleName;
    if (currentUserRole !== "SYSTEM_ADMIN" && currentUserRole !== "HR") {
      return new NextResponse("Bạn không có quyền xóa nhân viên", { status: 403 });
    }

    const actorName = session.user?.name || "Quản trị viên";
    const result = await deleteEmployee(id, actorName, currentUserRole);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[EMPLOYEE_DELETE]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 500 });
  }
}
