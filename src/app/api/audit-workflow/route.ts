import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "ACCOUNTANT", "MANAGER"].includes(roleName)) {
      return NextResponse.json({ error: "Chỉ Quản trị viên, Ban Giám Đốc, Nhân sự, Kế toán và cấp Quản lý mới có quyền truy cập nhật ký kiểm toán hệ thống." }, { status: 403 });
    }

    const whereClause: any = {};

    if (roleName === "MANAGER") {
      const managerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          managedDept: {
            include: {
              employees: { include: { user: { select: { name: true } } } },
            },
          },
        },
      });
      const memberNames = (managerProfile?.managedDept?.employees || [])
        .map((e) => e.user?.name)
        .filter((name): name is string => Boolean(name));
      if (session.user.name && !memberNames.includes(session.user.name)) {
        memberNames.push(session.user.name);
      }

      whereClause.AND = [
        { target: { notIn: ["Payroll", "SalaryComponent", "Role"] } },
        { userName: { in: memberNames } },
      ];
    } else if (roleName === "ACCOUNTANT") {
      whereClause.OR = [
        { target: { in: ["Payroll", "SalaryComponent", "Contract", "Attendance", "OvertimeRequest"] } },
        ...(session.user.name ? [{ userName: session.user.name }] : []),
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(logs.map((log) => ({ ...log, ip: log.ip === "127.0.0.1" ? null : log.ip })));
  } catch (error) {
    console.error("GET audit-workflow error:", error);
    return NextResponse.json({ error: "Lỗi tải nhật ký kiểm toán" }, { status: 500 });
  }
}
