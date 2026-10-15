import { NextResponse } from "next/server";
import { updateRole, deleteRole } from "@/services/role.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CORE_ROLES = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER", "ACCOUNTANT", "USER"];

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

    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      return new NextResponse("Không tìm thấy vai trò.", { status: 404 });
    }

    if (existingRole.name === "SYSTEM_ADMIN") {
      return new NextResponse("Không thể sửa đổi tên hoặc quyền hạn của vai trò Quản trị viên tối cao (SYSTEM_ADMIN).", { status: 400 });
    }

    if (CORE_ROLES.includes(existingRole.name) && name && name !== existingRole.name) {
      return new NextResponse("Không thể đổi tên Vai trò cốt lõi của hệ thống, chỉ có thể cập nhật danh sách quyền.", { status: 400 });
    }

    if (!CORE_ROLES.includes(existingRole.name) && name && CORE_ROLES.includes(name.trim().toUpperCase())) {
      return new NextResponse("Không thể đặt tên trùng với Vai trò cốt lõi của hệ thống.", { status: 400 });
    }

    const role = await updateRole(id, {
      name: CORE_ROLES.includes(existingRole.name) ? existingRole.name : name,
      permissions
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Quản trị viên",
        userRole: roleName,
        action: `Cập nhật phân quyền vai trò: ${role.name}`,
        target: "Role",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

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

    if (CORE_ROLES.includes(targetRole.name)) {
      return new NextResponse(`Không thể xóa vai trò hệ thống cốt lõi (${targetRole.name}).`, { status: 400 });
    }

    if (targetRole._count.users > 0) {
      return new NextResponse(`Không thể xóa vai trò đang có ${targetRole._count.users} người dùng được chỉ định. Vui lòng chuyển vai trò của người dùng trước.`, { status: 400 });
    }

    const role = await deleteRole(id);

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Quản trị viên",
        userRole: roleName,
        action: `Xóa vai trò: ${targetRole.name}`,
        target: "Role",
        ip: "127.0.0.1",
        status: "WARNING"
      }
    });

    return NextResponse.json(role);
  } catch (error: any) {
    console.error("[ROLE_DELETE]", error);
    return new NextResponse(error.message || "Không thể xóa vai trò này", { status: 400 });
  }
}