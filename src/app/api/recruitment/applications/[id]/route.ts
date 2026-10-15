import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.roleName;
    if (!session || !['SYSTEM_ADMIN', 'BOD', 'HR', 'MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const currentApplication = await prisma.application.findUnique({
      where: { id },
      include: {
        jobPosting: {
          include: { department: true }
        }
      }
    });

    if (!currentApplication) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ ứng viên' }, { status: 404 });
    }

    if (userRole === 'MANAGER') {
      if (status === 'OFFERED' || status === 'HIRED') {
        return NextResponse.json({ error: 'Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự (HR) mới có thẩm quyền gửi Offer hoặc tiếp nhận nhân sự chính thức (HIRED).' }, { status: 403 });
      }

      const managerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user?.id },
        include: { managedDept: true }
      });
      const deptId = managerProfile?.managedDept?.id || managerProfile?.departmentId;
      if (deptId && currentApplication.jobPosting.departmentId !== deptId) {
        return NextResponse.json({ error: 'Bạn chỉ có quyền đánh giá hồ sơ ứng viên thuộc phòng ban mình phụ trách.' }, { status: 403 });
      }
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: { status }
    });

    if (status === "HIRED" && currentApplication.status !== "HIRED") {
      const existingUser = await prisma.user.findUnique({
        where: { email: currentApplication.candidateEmail },
        include: { employee: true }
      });

      const year = new Date().getFullYear();

      if (!existingUser) {
        let defaultRole = await prisma.role.findFirst({
          where: { name: "USER" }
        });
        if (!defaultRole) {
          defaultRole = await prisma.role.create({
            data: { name: "USER", permissions: "USER_DASHBOARD,ATTENDANCE_CHECKIN,LEAVE_REQUEST,VIEW_OWN_PAYROLL" }
          });
        }

        const hashedPassword = await bcrypt.hash("Hrmis@123", 10);

        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: currentApplication.candidateEmail,
              name: currentApplication.candidateName,
              password: hashedPassword,
              roleId: defaultRole!.id
            }
          });

          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 2);

          const newProfile = await tx.employeeProfile.create({
            data: {
              userId: newUser.id,
              departmentId: currentApplication.jobPosting.departmentId || null,
              position: currentApplication.jobPosting.title || "Nhân sự mới",
              phone: currentApplication.candidatePhone,
              status: "PROBATION",
              joinDate: startDate
            }
          });

          await tx.employeeSalaryConfig.create({
            data: {
              employeeId: newProfile.id,
              baseSalary: 12000000
            }
          });

          const contractCode = `HĐTV-${year}/NX-${String(Date.now()).slice(-5)}`;
          await tx.contract.create({
            data: {
              code: contractCode,
              employeeId: newProfile.id,
              contractType: "Hợp đồng Thử việc (02 tháng)",
              startDate,
              endDate,
              salary: 12000000,
              status: "ACTIVE",
              note: `Hợp đồng thử việc khởi tạo tự động khi tiếp nhận ứng viên ${currentApplication.candidateName}`
            }
          });
        });
      }

      const prefix = `QĐ-${year}-`;
      const existingChanges = await prisma.personnelChange.findMany({
        where: { code: { startsWith: prefix } },
        select: { code: true }
      });
      const maxNum = existingChanges.reduce((max, item) => {
        const numPart = parseInt(item.code.replace(prefix, ""), 10);
        return !isNaN(numPart) && numPart > max ? numPart : max;
      }, 0);
      const code = `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
      const toDeptName = currentApplication.jobPosting.department?.name || "Phòng Công nghệ (IT)";

      await prisma.personnelChange.create({
        data: {
          code,
          employeeName: currentApplication.candidateName,
          employeeEmail: currentApplication.candidateEmail,
          type: "NEW_HIRE",
          fromDept: "Thị trường tuyển dụng",
          toDept: toDeptName,
          fromPosition: "Ứng viên trúng tuyển",
          toPosition: currentApplication.jobPosting.title,
          effectiveDate: new Date().toLocaleDateString("vi-VN"),
          signer: (session.user as any)?.name || "Hội Đồng Tuyển Dụng",
          status: "APPROVED"
        }
      });

      const hiredCount = await prisma.application.count({
        where: {
          jobPostingId: currentApplication.jobPostingId,
          status: "HIRED"
        }
      });
      if (hiredCount >= currentApplication.jobPosting.headcount) {
        await prisma.jobPosting.update({
          where: { id: currentApplication.jobPostingId },
          data: { status: "CLOSED" }
        });
      }

      await prisma.auditLog.create({
        data: {
          userName: session.user?.name || "Hội đồng tuyển dụng",
          userRole: userRole,
          action: `Onboarding ứng viên ${currentApplication.candidateName} thành Nhân viên mới (Vị trí: ${currentApplication.jobPosting.title}, Mã QĐ: ${code})`,
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