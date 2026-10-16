import { NextResponse } from "next/server";
import { updateEmployee, deleteEmployee } from "@/services/employee.service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const currentUserRole = (session.user as any)?.roleName;
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(currentUserRole)) {
      return new NextResponse("Bạn không có quyền chỉnh sửa hồ sơ nhân sự", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const targetEmployee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: { user: { include: { role: true } } }
    });
    if (!targetEmployee) {
      return new NextResponse("Không tìm thấy hồ sơ nhân sự", { status: 404 });
    }

    const existingRoleName = targetEmployee.user.role.name;
    if (currentUserRole !== "SYSTEM_ADMIN" && existingRoleName === "SYSTEM_ADMIN") {
      return new NextResponse("Không có quyền chỉnh sửa tài khoản Quản trị viên hệ thống (SYSTEM_ADMIN)", { status: 403 });
    }
    if ((currentUserRole === "HR" || currentUserRole === "MANAGER") && existingRoleName === "BOD") {
      return new NextResponse("Không có quyền chỉnh sửa hồ sơ thành viên Ban Giám Đốc (BOD)", { status: 403 });
    }

    if (body.roleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: body.roleId } });
      if (!targetRole) return new NextResponse("Vai trò không hợp lệ", { status: 400 });

      if (currentUserRole !== "SYSTEM_ADMIN" && targetRole.name === "SYSTEM_ADMIN") {
        return new NextResponse("Bạn không có quyền gán vai trò Quản trị viên hệ thống (SYSTEM_ADMIN)", { status: 403 });
      }
      if ((currentUserRole === "HR" || currentUserRole === "MANAGER") && targetRole.name === "BOD") {
        return new NextResponse("Bạn không có quyền gán vai trò Ban Giám Đốc (BOD)", { status: 403 });
      }
      if (currentUserRole === "MANAGER" && targetRole.name !== "USER") {
        return new NextResponse("Trưởng phòng chỉ có quyền gán vai trò nhân viên (USER)", { status: 403 });
      }
    }

    if (currentUserRole === "MANAGER") {
      if (body.isManager === true) {
        return new NextResponse("Trưởng phòng không có quyền bổ nhiệm chức vụ Trưởng phòng", { status: 403 });
      }
      const callerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id }
      });
      const managedDept = callerProfile
        ? await prisma.department.findUnique({ where: { managerId: callerProfile.id } })
        : null;
      const allowedDeptId = managedDept?.id;

      if (!allowedDeptId || targetEmployee.departmentId !== allowedDeptId) {
        return new NextResponse("Trưởng phòng chỉ được phép chỉnh sửa nhân sự thuộc phòng ban mình phụ trách", { status: 403 });
      }
      if (body.departmentId && body.departmentId !== allowedDeptId) {
        return new NextResponse("Trưởng phòng không thể điều chuyển nhân sự sang phòng ban khác", { status: 403 });
      }
    }

    const actorName = session.user?.name || "Người quản lý";
    const result = await updateEmployee(id, body, actorName, currentUserRole);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[EMPLOYEE_PUT]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const currentUserRole = (session.user as any)?.roleName;
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(currentUserRole)) {
      return new NextResponse("Bạn không có quyền xóa nhân viên", { status: 403 });
    }

    const targetEmployee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: { user: { include: { role: true } } }
    });
    if (!targetEmployee) {
      return new NextResponse("Không tìm thấy hồ sơ nhân sự", { status: 404 });
    }

    const existingRoleName = targetEmployee.user.role.name;
    if (currentUserRole !== "SYSTEM_ADMIN" && existingRoleName === "SYSTEM_ADMIN") {
      return new NextResponse("Không thể xóa tài khoản Quản trị viên hệ thống (SYSTEM_ADMIN)", { status: 403 });
    }
    if (currentUserRole === "HR" && existingRoleName === "BOD") {
      return new NextResponse("Nhân sự (HR) không có quyền xóa hồ sơ Ban Giám Đốc (BOD)", { status: 403 });
    }

    const actorName = session.user?.name || "Quản trị viên";
    const result = await deleteEmployee(id, actorName, currentUserRole);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[EMPLOYEE_DELETE]", error);
    return new NextResponse(error.message || "Lỗi hệ thống", { status: 500 });
  }
}
