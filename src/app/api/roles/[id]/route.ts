import { NextResponse } from "next/server";
import { updateRole, deleteRole } from "@/services/role.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any)?.roleName;
    if (roleName !== "SYSTEM_ADMIN") {
      return new NextResponse("Chỉ Quản trị viên hệ thống (SYSTEM_ADMIN) mới có quyền chỉnh sửa vai trò.", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, permissions } = body;

    const role = await updateRole(id, { name, permissions });
    return NextResponse.json(role);
  } catch (error) {
    console.error("[ROLE_PUT]", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any)?.roleName;
    if (roleName !== "SYSTEM_ADMIN") {
      return new NextResponse("Chỉ Quản trị viên hệ thống (SYSTEM_ADMIN) mới có quyền xóa vai trò.", { status: 403 });
    }

    const { id } = await params;
    const targetRole = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    });

    if (!targetRole) {
      return new NextResponse("Không tìm thấy vai trò.", { status: 404 });
    }

    if (["SYSTEM_ADMIN", "MANAGER", "HR", "USER"].includes(targetRole.name)) {
      return new NextResponse(`Không thể xóa vai trò hệ thống cốt lõi (${targetRole.name}).`, { status: 400 });
    }

    if (targetRole._count.users > 0) {
      return new NextResponse(`Không thể xóa vai trò đang có ${targetRole._count.users} người dùng được chỉ định. Vui lòng chuyển vai trò của người dùng trước.`, { status: 400 });
    }

    const role = await deleteRole(id);
    return NextResponse.json(role);
  } catch (error: any) {
    console.error("[ROLE_DELETE]", error);
    return new NextResponse(error.message || "Không thể xóa vai trò này", { status: 400 });
  }
}
