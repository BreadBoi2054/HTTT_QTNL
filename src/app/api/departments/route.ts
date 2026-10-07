import { NextResponse } from "next/server";
import { getDepartments, createDepartment } from "@/services/department.service";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const departments = await getDepartments();
    return NextResponse.json(departments);
  } catch (error) {
    console.error("[DEPARTMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName;
    if (!["SYSTEM_ADMIN", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên hoặc Nhân sự mới có quyền tạo phòng ban.", { status: 403 });
    }

    const body = await req.json();
    const { name, description, managerId } = body;

    if (!name) {
      return new NextResponse("Tên phòng ban là bắt buộc", { status: 400 });
    }

    const department = await createDepartment({ name, description, managerId });
    return NextResponse.json(department);
  } catch (error) {
    console.error("[DEPARTMENTS_POST]", error);
    return new NextResponse("Tên phòng ban đã tồn tại hoặc lỗi hệ thống", { status: 500 });
  }
}
