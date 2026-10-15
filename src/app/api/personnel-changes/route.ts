import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function syncEmployeeFromApprovedDecision(change: {
  employeeEmail: string;
  type: string;
  toDept: string;
  toPosition: string;
}, newSalary?: number) {
  if (!change.employeeEmail) return;

  const user = await prisma.user.findUnique({
    where: { email: change.employeeEmail },
    include: { employee: true },
  });

  if (!user?.employee) return;

  let targetDeptId = user.employee.departmentId;
  if (change.toDept) {
    const dept = await prisma.department.findFirst({
      where: {
        name: { contains: change.toDept.replace(/Phòng\s*/i, "").trim(), mode: "insensitive" },
      },
    });
    if (dept) targetDeptId = dept.id;
  }

  if (change.type === "PROMOTION" || change.type === "TRANSFER" || change.type === "NEW_HIRE") {
    if (
      change.type === "TRANSFER" &&
      targetDeptId !== user.employee.departmentId &&
      user.employee.departmentId
    ) {
      await prisma.department.updateMany({
        where: { id: user.employee.departmentId, managerId: user.employee.id },
        data: { managerId: null },
      });
    }

    await prisma.employeeProfile.update({
      where: { id: user.employee.id },
      data: {
        position: change.toPosition || user.employee.position,
        departmentId: targetDeptId,
        status: "ACTIVE",
      },
    });

    const parsedSalary = Number(newSalary);
    if (!isNaN(parsedSalary) && parsedSalary > 0) {
      await prisma.employeeSalaryConfig.upsert({
        where: { employeeId: user.employee.id },
        update: { baseSalary: parsedSalary },
        create: { employeeId: user.employee.id, baseSalary: parsedSalary },
      });

      const activeContract = await prisma.contract.findFirst({
        where: { employeeId: user.employee.id, status: "ACTIVE" },
        orderBy: { startDate: "desc" },
      });
      if (activeContract) {
        await prisma.contract.update({
          where: { id: activeContract.id },
          data: { salary: parsedSalary },
        });
      }
    }
  } else if (change.type === "RESIGNATION") {
    await prisma.$transaction([
      prisma.department.updateMany({
        where: { managerId: user.employee.id },
        data: { managerId: null },
      }),
      prisma.employeeProfile.update({
        where: { id: user.employee.id },
        data: { status: "RESIGNED" },
      }),
      prisma.contract.updateMany({
        where: { employeeId: user.employee.id, status: "ACTIVE" },
        data: { status: "TERMINATED" },
      }),
    ]);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return NextResponse.json({ error: "Bạn không có quyền truy cập dữ liệu biến động nhân sự." }, { status: 403 });
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
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return NextResponse.json({ error: "Bạn không có quyền khởi tạo quyết định biến động nhân sự." }, { status: 403 });
    }

    const body = await req.json();

    const prefix = "QĐ-2026-";
    const existingCodes = await prisma.personnelChange.findMany({
      where: {
        OR: [{ code: { startsWith: prefix } }, { code: { startsWith: "Q?-2026-" } }],
      },
      select: { code: true },
    });
    const maxNum = existingCodes.reduce((max, item) => {
      const num = parseInt(item.code.replace(/^Q[Đ\?]-2026-/, ""), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const code = `${prefix}${String(maxNum + 1).padStart(3, "0")}`;

    const initialStatus =
      roleName === "MANAGER"
        ? "PENDING"
        : body.status === "PENDING"
        ? "PENDING"
        : "APPROVED";

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
        signer: body.signer || (session.user as any)?.name || "Ban Giám Đốc",
        status: initialStatus,
      },
    });

    if (initialStatus === "APPROVED") {
      await syncEmployeeFromApprovedDecision(newChange, body.newSalary);
    }

    const salaryNote = Number(body.newSalary) > 0 ? ` - Lương mới: ${Number(body.newSalary).toLocaleString("vi-VN")} VNĐ` : "";

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Người dùng",
        userRole: roleName,
        action: `${initialStatus === "APPROVED" ? "Ban hành" : "Trình duyệt"} Quyết định biến động nhân sự ${code} (${body.employeeName} - ${body.type}${salaryNote})`,
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

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleName = (session.user as any)?.roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return NextResponse.json(
        { error: "Chỉ Ban Giám Đốc, Quản trị viên hoặc Nhân sự mới có thẩm quyền phê duyệt quyết định biến động." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, status, newSalary } = body;

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Dữ liệu phê duyệt không hợp lệ." }, { status: 400 });
    }

    const existing = await prisma.personnelChange.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy quyết định biến động." }, { status: 404 });
    }

    const updated = await prisma.personnelChange.update({
      where: { id },
      data: {
        status,
        signer: session.user?.name || existing.signer,
      },
    });

    if (status === "APPROVED" && existing.status !== "APPROVED") {
      await syncEmployeeFromApprovedDecision(updated, newSalary);
    }

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Ban Giám Đốc",
        userRole: roleName,
        action: `${status === "APPROVED" ? "Phê duyệt ban hành" : "Từ chối"} Quyết định biến động nhân sự ${existing.code} (${existing.employeeName})`,
        target: "PersonnelChange",
        ip: "127.0.0.1",
        status: status === "APPROVED" ? "SUCCESS" : "WARNING",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH personnel-changes error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật trạng thái quyết định" }, { status: 500 });
  }
}
