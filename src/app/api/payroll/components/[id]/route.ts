import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || (role !== "SYSTEM_ADMIN" && role !== "HR")) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, type, amountType, defaultVal } = body;

    const updated = await prisma.salaryComponent.update({
      where: { id },
      data: {
        name: name ?? undefined,
        type: type ?? undefined,
        amountType: amountType ?? undefined,
        defaultVal: defaultVal !== undefined ? parseFloat(defaultVal) : undefined,
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Kế toán / HR",
        userRole: role,
        action: `Cập nhật thành phần lương: ${updated.name}`,
        target: "SalaryComponent",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[SALARY_COMPONENT_PUT]", error);
    return new NextResponse(error.message || "Lỗi cập nhật", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || (role !== "SYSTEM_ADMIN" && role !== "HR")) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    const comp = await prisma.salaryComponent.findUnique({
      where: { id },
      include: {
        _count: { select: { configs: true } }
      }
    });

    if (!comp) {
      return new NextResponse("Không tìm thấy thành phần lương", { status: 404 });
    }

    if (comp._count.configs > 0) {
      return new NextResponse(
        `Không thể xóa thành phần lương [${comp.name}] vì đang được áp dụng cho ${comp._count.configs} nhân sự. Vui lòng gỡ khỏi cấu hình lương nhân viên trước.`,
        { status: 400 }
      );
    }

    const deleted = await prisma.salaryComponent.delete({
      where: { id }
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user?.name || "Kế toán / HR",
        userRole: role,
        action: `Xóa thành phần lương: ${comp.name}`,
        target: "SalaryComponent",
        ip: "127.0.0.1",
        status: "WARNING"
      }
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    console.error("[SALARY_COMPONENT_DELETE]", error);
    return new NextResponse(error.message || "Lỗi xóa thành phần lương", { status: 500 });
  }
}
