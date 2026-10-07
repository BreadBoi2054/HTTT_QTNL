import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const changes = await prisma.personnelChange.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(changes);
  } catch (error) {
    console.error("GET personnel-changes error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu biến động nhân sự" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "HR"].includes(roleName)) {
      return NextResponse.json({ error: "Chỉ Quản trị viên hoặc Nhân sự mới có quyền ban hành quyết định biến động nhân sự." }, { status: 403 });
    }

    const body = await req.json();
    const count = await prisma.personnelChange.count();
    const code = `QĐ-2026-${String(count + 45).padStart(3, "0")}`;

    const newChange = await prisma.personnelChange.create({
      data: {
        code,
        employeeName: body.employeeName,
        employeeEmail: body.employeeEmail,
        type: body.type,
        fromDept: body.fromDept || "Phòng Công nghệ (IT)",
        toDept: body.toDept || "Phòng Công nghệ (IT)",
        fromPosition: body.fromPosition,
        toPosition: body.toPosition,
        effectiveDate: body.effectiveDate,
        signer: (session.user as any)?.name || "Ban Giám Đốc",
        status: "APPROVED",
      },
    });

    // 1. Tự động đồng bộ hóa sang Hồ sơ nhân viên (EmployeeProfile)
    if (body.employeeEmail) {
      const user = await prisma.user.findUnique({
        where: { email: body.employeeEmail },
        include: { employee: true },
      });

      if (user?.employee) {
        let targetDeptId = user.employee.departmentId;
        if (body.toDept) {
          const dept = await prisma.department.findFirst({
            where: {
              name: { contains: body.toDept.replace(/Phòng\s*/i, "").trim(), mode: "insensitive" }
            }
          });
          if (dept) targetDeptId = dept.id;
        }

        if (body.type === "PROMOTION" || body.type === "TRANSFER") {
          // Nếu chuyển sang phòng ban khác, giải phóng chức vụ quản lý phòng ban cũ
          if (body.type === "TRANSFER" && targetDeptId !== user.employee.departmentId && user.employee.departmentId) {
            await prisma.department.updateMany({
              where: { id: user.employee.departmentId, managerId: user.employee.id },
              data: { managerId: null }
            });
          }

          await prisma.employeeProfile.update({
            where: { id: user.employee.id },
            data: {
              position: body.toPosition || user.employee.position,
              departmentId: targetDeptId,
              status: "ACTIVE",
            },
          });
        } else if (body.type === "RESIGNATION") {
          await prisma.$transaction([
            prisma.department.updateMany({
              where: { managerId: user.employee.id },
              data: { managerId: null }
            }),
            prisma.employeeProfile.update({
              where: { id: user.employee.id },
              data: {
                status: "RESIGNED",
              },
            })
          ]);
        }
      }
    }

    // 2. Ghi nhật ký kiểm toán (Audit Trail)
    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Người dùng",
        userRole: (session.user as any)?.roleName || "USER",
        action: `Ban hành Quyết định biến động nhân sự ${code} (${body.employeeName} - ${body.type})`,
        target: "PersonnelChange",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return NextResponse.json(newChange, { status: 201 });
  } catch (error) {
    console.error("POST personnel-changes error:", error);
    return NextResponse.json({ error: "Lỗi tạo quyết định biến động" }, { status: 500 });
  }
}
