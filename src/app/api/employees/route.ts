import { NextResponse } from "next/server";
import { getEmployees, createEmployee } from "@/services/employee.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any)?.roleName || "USER";
    const allowedRoles = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER", "ACCOUNTANT", "USER"];
    if (!allowedRoles.includes(roleName)) {
      return new NextResponse("Bạn không có quyền xem danh sách nhân sự", { status: 403 });
    }

    const employees = await getEmployees({
      roleName,
      userId: session.user.id,
      includeSalary: ["SYSTEM_ADMIN", "BOD", "HR", "ACCOUNTANT"].includes(roleName),
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("[EMPLOYEES_GET]", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const currentUserRole = (session.user as any)?.roleName;
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(currentUserRole)) {
      return new NextResponse("Bạn không có quyền thêm mới nhân sự", { status: 403 });
    }

    const body = await req.json();
    const targetRole = await prisma.role.findUnique({ where: { id: body.roleId } });
    if (!targetRole) return new NextResponse("Vai trò không hợp lệ", { status: 400 });

    if (currentUserRole !== "SYSTEM_ADMIN" && targetRole.name === "SYSTEM_ADMIN") {
      return new NextResponse("Bạn không có quyền gán vai trò Quản trị viên hệ thống (SYSTEM_ADMIN)", { status: 403 });
    }

    if (currentUserRole === "HR" && targetRole.name === "BOD") {
      return new NextResponse("Nhân sự (HR) không có quyền gán vai trò Ban Giám Đốc (BOD)", { status: 403 });
    }

    if (currentUserRole === "MANAGER") {
      if (targetRole.name !== "USER") {
        return new NextResponse("Bạn chỉ có quyền tạo tài khoản nhân viên (USER)", { status: 403 });
      }
      body.isManager = false;

      const callerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id }
      });
      if (!callerProfile) {
        return new NextResponse("Không tìm thấy hồ sơ quản lý của bạn", { status: 403 });
      }
      const managedDept = await prisma.department.findUnique({
        where: { managerId: callerProfile.id }
      });
      const allowedDeptId = managedDept?.id || callerProfile.departmentId;
      if (!allowedDeptId || body.departmentId !== allowedDeptId) {
        return new NextResponse("Trưởng phòng chỉ được phép thêm nhân sự vào phòng ban mình phụ trách", { status: 403 });
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
