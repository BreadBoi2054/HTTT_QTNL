import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function syncEmployeeFromApprovedDecision(
  tx: Prisma.TransactionClient,
  change: {
    employeeEmail: string;
    type: string;
    toDept: string;
    toPosition: string;
  },
  newSalary?: number
) {
  if (!change.employeeEmail) return;

  const user = await tx.user.findUnique({
    where: { email: change.employeeEmail },
    include: { employee: true, role: true },
  });

  if (!user?.employee) return;

  let targetDeptId = user.employee.departmentId;
  if (change.toDept) {
    const dept = await tx.department.findFirst({
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
      await tx.department.updateMany({
        where: { id: user.employee.departmentId, managerId: user.employee.id },
        data: { managerId: null },
      });

      const remainingManaged = await tx.department.count({
        where: { managerId: user.employee.id },
      });
      if (remainingManaged === 0 && user.role?.name === "MANAGER") {
        const userRole = await tx.role.findUnique({ where: { name: "USER" } });
        if (userRole) {
          await tx.user.update({
            where: { id: user.id },
            data: { roleId: userRole.id },
          });
        }
      }
    }

    await tx.employeeProfile.update({
      where: { id: user.employee.id },
      data: {
        position: change.toPosition || user.employee.position,
        departmentId: targetDeptId,
        status: "ACTIVE",
      },
    });

    const parsedSalary = Number(newSalary);
    if (!isNaN(parsedSalary) && parsedSalary > 0) {
      await tx.employeeSalaryConfig.upsert({
        where: { employeeId: user.employee.id },
        update: { baseSalary: parsedSalary },
        create: { employeeId: user.employee.id, baseSalary: parsedSalary },
      });

      const activeContract = await tx.contract.findFirst({
        where: { employeeId: user.employee.id, status: "ACTIVE" },
        orderBy: { startDate: "desc" },
      });
      if (activeContract) {
        await tx.contract.update({
          where: { id: activeContract.id },
          data: { salary: parsedSalary },
        });
      }
    }
  } else if (change.type === "RESIGNATION") {
    await tx.department.updateMany({
      where: { managerId: user.employee.id },
      data: { managerId: null },
    });

    if (user.role?.name === "MANAGER") {
      const userRole = await tx.role.findUnique({ where: { name: "USER" } });
      if (userRole) {
        await tx.user.update({
          where: { id: user.id },
          data: { roleId: userRole.id },
        });
      }
    }

    await tx.employeeProfile.update({
      where: { id: user.employee.id },
      data: { status: "RESIGNED" },
    });

    await tx.contract.updateMany({
      where: { employeeId: user.employee.id, status: "ACTIVE" },
      data: { status: "TERMINATED" },
    });

    await tx.leaveRequest.updateMany({
      where: { employeeId: user.employee.id, status: "PENDING" },
      data: { status: "REJECTED" },
    });

    await tx.overtimeRequest.updateMany({
      where: { employeeId: user.employee.id, status: "PENDING" },
      data: { status: "REJECTED" },
    });
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

    if (roleName === "MANAGER") {
      const managerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          managedDept: {
            include: {
              employees: { include: { user: { select: { email: true } } } },
            },
          },
        },
      });

      const deptName = managerProfile?.managedDept?.name;
      const deptEmails = (managerProfile?.managedDept?.employees || [])
        .map((e) => e.user?.email)
        .filter((email): email is string => Boolean(email));
      if (session.user.email && !deptEmails.includes(session.user.email)) {
        deptEmails.push(session.user.email);
      }

      const orConditions: Prisma.PersonnelChangeWhereInput[] = [
        { employeeEmail: { in: deptEmails } },
      ];
      if (deptName) {
        orConditions.push(
          { fromDept: { contains: deptName, mode: "insensitive" } },
          { toDept: { contains: deptName, mode: "insensitive" } }
        );
      }

      const scopedChanges = await prisma.personnelChange.findMany({
        where: { OR: orConditions },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(scopedChanges);
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
    const targetEmail = String(body.employeeEmail || "").trim();

    if (!body.employeeName || !targetEmail || !body.type) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc: Họ tên, Email nhân sự và Loại quyết định." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { role: true, employee: true },
    });

    if (["HR", "MANAGER"].includes(roleName)) {
      if (
        targetEmail.toLowerCase() === (session.user.email || "").toLowerCase() ||
        (targetUser && targetUser.id === session.user.id)
      ) {
        return NextResponse.json(
          { error: "Bạn không được tự khởi tạo hoặc phê duyệt quyết định biến động nhân sự / nâng lương cho chính mình." },
          { status: 403 }
        );
      }

      const targetRoleName = targetUser?.role?.name || "USER";
      if (["SYSTEM_ADMIN", "BOD"].includes(targetRoleName)) {
        return NextResponse.json(
          { error: "Bạn không có thẩm quyền tạo quyết định biến động đối với tài khoản Quản trị hệ thống hoặc Ban Giám Đốc." },
          { status: 403 }
        );
      }
    }

    if (roleName === "MANAGER") {
      const managerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        include: { managedDept: true },
      });
      const managedDeptId = managerProfile?.managedDept?.id;
      if (!managedDeptId || !targetUser?.employee || targetUser.employee.departmentId !== managedDeptId) {
        return NextResponse.json(
          { error: "Trưởng phòng chỉ được phép đề xuất biến động cho nhân sự thuộc phòng ban mình quản lý." },
          { status: 403 }
        );
      }
    }

    const initialStatus =
      roleName === "MANAGER"
        ? "PENDING"
        : body.status === "PENDING"
        ? "PENDING"
        : "APPROVED";

    const newChange = await prisma.$transaction(
      async (tx) => {
        const prefix = "QĐ-2026-";
        const existingCodes = await tx.personnelChange.findMany({
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

        const created = await tx.personnelChange.create({
          data: {
            code,
            employeeName: body.employeeName,
            employeeEmail: targetEmail,
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
          await syncEmployeeFromApprovedDecision(tx, created, body.newSalary);
        }

        const salaryNote =
          Number(body.newSalary) > 0
            ? ` - Lương mới: ${Number(body.newSalary).toLocaleString("vi-VN")} VNĐ`
            : "";

        await tx.auditLog.create({
          data: {
            userName: session.user?.name || "Người dùng",
            userRole: roleName,
            action: `${initialStatus === "APPROVED" ? "Ban hành" : "Trình duyệt"} Quyết định biến động nhân sự ${code} (${body.employeeName} - ${body.type}${salaryNote})`,
            target: "PersonnelChange",
            ip: "127.0.0.1",
            status: "SUCCESS",
          },
        });

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

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

    if (roleName === "HR") {
      if (
        existing.employeeEmail &&
        existing.employeeEmail.toLowerCase() === (session.user.email || "").toLowerCase()
      ) {
        return NextResponse.json(
          { error: "Nhân sự (HR) không được tự phê duyệt quyết định biến động của chính mình." },
          { status: 403 }
        );
      }

      if (existing.employeeEmail) {
        const targetUser = await prisma.user.findUnique({
          where: { email: existing.employeeEmail },
          include: { role: true },
        });
        if (targetUser && ["SYSTEM_ADMIN", "BOD"].includes(targetUser.role?.name || "")) {
          return NextResponse.json(
            { error: "Nhân sự (HR) không có thẩm quyền phê duyệt quyết định đối với Quản trị hệ thống hoặc Ban Giám Đốc." },
            { status: 403 }
          );
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.personnelChange.update({
        where: { id },
        data: {
          status,
          signer: session.user?.name || existing.signer,
        },
      });

      if (status === "APPROVED" && existing.status !== "APPROVED") {
        await syncEmployeeFromApprovedDecision(tx, record, newSalary);
      }

      await tx.auditLog.create({
        data: {
          userName: session.user?.name || "Ban Giám Đốc",
          userRole: roleName,
          action: `${status === "APPROVED" ? "Phê duyệt ban hành" : "Từ chối"} Quyết định biến động nhân sự ${existing.code} (${existing.employeeName})`,
          target: "PersonnelChange",
          ip: "127.0.0.1",
          status: status === "APPROVED" ? "SUCCESS" : "WARNING",
        },
      });

      return record;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH personnel-changes error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật trạng thái quyết định" }, { status: 500 });
  }
}
