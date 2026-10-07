import { NextResponse } from "next/server";
import { getEmployees, createEmployee } from "@/services/employee.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const employees = await getEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error("[EMPLOYEES_GET]", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    
    // Validate role permissions
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

    const actorName = session.user?.name || "Chuyên viên Nhân sự";
    const result = await createEmployee(body, actorName, currentUserRole);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[EMPLOYEES_POST]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 500 });
  }
}
