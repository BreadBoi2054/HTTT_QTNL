import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.roleName;
    if (!session || !['SYSTEM_ADMIN', 'HR', 'MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        jobPosting: {
          include: { department: true }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ ứng viên' }, { status: 404 });
    }

    // Phân quyền nghiệp vụ tuyển dụng:
    // Trưởng phòng (MANAGER) chỉ được lọc CV (REVIEWING), mời phỏng vấn (INTERVIEWING) hoặc loại hồ sơ (REJECTED) ứng viên phòng mình
    if (userRole === 'MANAGER') {
      if (status === 'OFFERED' || status === 'HIRED') {
        return NextResponse.json({ error: 'Chỉ Quản trị viên hoặc Nhân sự (HR) mới có thẩm quyền gửi Offer hoặc tiếp nhận nhân sự chính thức (HIRED).' }, { status: 403 });
      }

      const managerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        include: { managedDept: true }
      });
      const deptId = managerProfile?.managedDept?.id || managerProfile?.departmentId;
      if (deptId && application.jobPosting.departmentId !== deptId) {
        return NextResponse.json({ error: 'Bạn chỉ có quyền đánh giá hồ sơ ứng viên thuộc phòng ban mình phụ trách.' }, { status: 403 });
      }
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: { status }
    });

    // KHI ỨNG VIÊN ĐƯỢC CHUYỂN SANG TRẠNG THÁI "HIRED" (TRÚNG TUYỂN):
    // TỰ ĐỘNG ONBOARDING SANG HỒ SƠ NHÂN SỰ VÀ BAN HÀNH QUYẾT ĐỊNH TIẾP NHẬN
    if (status === "HIRED") {
      const existingUser = await prisma.user.findUnique({
        where: { email: application.candidateEmail },
        include: { employee: true }
      });

      if (!existingUser) {
        // 1. Tìm vai trò mặc định USER
        let defaultRole = await prisma.role.findFirst({
          where: { name: "USER" }
        });
        if (!defaultRole) {
          defaultRole = await prisma.role.create({
            data: { name: "USER", permissions: "USER_DASHBOARD,ATTENDANCE_CHECKIN,LEAVE_REQUEST,VIEW_OWN_PAYROLL" }
          });
        }

        const hashedPassword = await bcrypt.hash("Hrmis@123", 10);

        // 2. Tạo User, EmployeeProfile và SalaryConfig đồng thời
        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: application.candidateEmail,
              name: application.candidateName,
              password: hashedPassword,
              roleId: defaultRole!.id
            }
          });

          const newProfile = await tx.employeeProfile.create({
            data: {
              userId: newUser.id,
              departmentId: application.jobPosting.departmentId || null,
              position: application.jobPosting.title || "Nhân sự mới",
              phone: application.candidatePhone,
              status: "ACTIVE",
              joinDate: new Date()
            }
          });

          // Tự động tạo cấu hình lương cơ bản mặc định (12,000,000 VNĐ) để sẵn sàng chạy tính lương
          await tx.employeeSalaryConfig.create({
            data: {
              employeeId: newProfile.id,
              baseSalary: 12000000
            }
          });
        });
      }

      // 3. Tự động sinh Quyết định tiếp nhận nhân sự (NEW_HIRE)
      const count = await prisma.personnelChange.count();
      const code = `QĐ-2026-${String(count + 50).padStart(3, "0")}`;
      const toDeptName = application.jobPosting.department?.name || "Phòng Công nghệ (IT)";

      await prisma.personnelChange.create({
        data: {
          code,
          employeeName: application.candidateName,
          employeeEmail: application.candidateEmail,
          type: "NEW_HIRE",
          fromDept: "Thị trường tuyển dụng",
          toDept: toDeptName,
          fromPosition: "Ứng viên trúng tuyển",
          toPosition: application.jobPosting.title,
          effectiveDate: new Date().toLocaleDateString("vi-VN"),
          signer: (session.user as any)?.name || "Hội Đồng Tuyển Dụng",
          status: "APPROVED"
        }
      });

      // 4. Ghi nhật ký kiểm toán
      await prisma.auditLog.create({
        data: {
          userName: session.user?.name || "Hội đồng tuyển dụng",
          userRole: userRole,
          action: `Onboarding ứng viên ${application.candidateName} thành Nhân viên chính thức (Vị trí: ${application.jobPosting.title}, Mã QĐ: ${code})`,
          target: "Application/EmployeeProfile",
          ip: "127.0.0.1",
          status: "SUCCESS"
        }
      });
    }

    return NextResponse.json(updatedApp);
  } catch (error: any) {
    console.error("[APPLICATION_PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
