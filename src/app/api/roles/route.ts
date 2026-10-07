import { NextResponse } from "next/server";
import { getRoles, createRole } from "@/services/role.service";
import { auth } from "@/auth";

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

    if (!name) {
      return new NextResponse("Tên vai trò là bắt buộc", { status: 400 });
    }

    const role = await createRole({ name, permissions });
    return NextResponse.json(role);
  } catch (error) {
    console.error("[ROLES_POST]", error);
    return new NextResponse("Tên vai trò đã tồn tại hoặc lỗi", { status: 500 });
  }
}
