import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Vui lòng đăng nhập lại." }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, phone } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản người dùng." }, { status: 404 });
    }

    const updatedFields: string[] = [];

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Vui lòng nhập mật khẩu hiện tại để xác thực." }, { status: 400 });
      }
      if (String(newPassword).length < 6) {
        return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự." }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác." }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      updatedFields.push("mật khẩu");
    }

    if (phone !== undefined && user.employee) {
      await prisma.employeeProfile.update({
        where: { id: user.employee.id },
        data: { phone: String(phone).trim() },
      });
      updatedFields.push("số điện thoại liên hệ");
    }

    if (updatedFields.length === 0) {
      return NextResponse.json({ error: "Không có thông tin nào được thay đổi." }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        userName: user.name,
        userRole: user.role?.name || "USER",
        action: `Cập nhật bảo mật cá nhân (${updatedFields.join(", ")}) tại Cổng tự phục vụ ESS`,
        target: "UserProfile",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${updatedFields.join(" và ")} thành công!`,
    });
  } catch (error) {
    console.error("[PROFILE_PASSWORD_PUT]", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật bảo mật cá nhân." }, { status: 500 });
  }
}
