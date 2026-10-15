import { NextResponse } from "next/server";
import { getRoles, createRole } from "@/services/role.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CORE_ROLES = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER", "ACCOUNTANT", "USER"];

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const roles = await getRoles();
    return NextResponse.json(roles);
  } catch (error) {
    console.error("[ROLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any)?.roleName;
    if (roleName !== "SYSTEM_ADMIN") {
      return new NextResponse("Chỉ Quản trị viên hệ thống (SYSTEM_ADMIN) mới có quyền tạo vai trò mới.", { status: 403 });
    }

    const body = await req.json();
    const { name, permissions } = body;

    if (!name || !name.trim()) {
      return new NextResponse("Tên vai trò là bắt buộc", { status: 400 });
    }

    const normalizedName = name.trim();
    if (CORE_ROLES.includes(normalizedName.toUpperCase())) {
      return new NextResponse("Vai trò cốt lõi của hệ thống đã tồn tại và được bảo vệ.", { status: 400 });
    }

    const role = await createRole({ name: normalizedName, permissions });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Quản trị viên",
        userRole: roleName,
        action: `Tạo vai trò mới: ${role.name}`,
        target: "Role",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("[ROLES_POST]", error);
    return new NextResponse("Tên vai trò đã tồn tại hoặc lỗi", { status: 500 });
  }
}