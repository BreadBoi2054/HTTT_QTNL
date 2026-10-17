import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { computeGradeAndBonus } from "@/services/performance.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER", "ACCOUNTANT", "USER"].includes(roleName)) {
      return new NextResponse("Không có quyền chỉnh sửa đánh giá KPI.", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { criterion1, criterion2, criterion3, selfScore, managerScore, status, managerNotes, grade: bodyGrade, bonusRate: bodyBonusRate } = body;
    const submittedScores = [criterion1, criterion2, criterion3, selfScore, managerScore].filter((score) => score !== undefined);
    if (submittedScores.some((score) => !Number.isFinite(Number(score)) || Number(score) < 0 || Number(score) > 100)) {
      return NextResponse.json({ error: "Điểm đánh giá phải nằm trong khoảng 0–100." }, { status: 400 });
    }

    const existingEval = await prisma.performanceEvaluation.findUnique({
      where: { id },
      include: { employee: { include: { user: { include: { role: true } } } } }
    });

    if (!existingEval) return new NextResponse("Không tìm thấy hồ sơ đánh giá.", { status: 404 });
    if (existingEval.status === "APPROVED" && ["USER", "ACCOUNTANT", "MANAGER"].includes(roleName)) {
      return new NextResponse("Đánh giá đã phê duyệt không thể chỉnh sửa ở cấp nhân viên hoặc trưởng phòng.", { status: 400 });
    }

    const isSelfRecord = existingEval.employee.userId === session.user.id;
    const isSelfAssessmentOnly =
      selfScore !== undefined &&
      criterion1 === undefined &&
      criterion2 === undefined &&
      criterion3 === undefined &&
      managerScore === undefined &&
      bodyGrade === undefined &&
      bodyBonusRate === undefined &&
      status !== "APPROVED";

    if (roleName === "USER" || roleName === "ACCOUNTANT" || (isSelfRecord && ["MANAGER", "HR"].includes(roleName))) {
      if (!isSelfRecord) {
        return new NextResponse("Bạn chỉ có quyền tự đánh giá KPI của chính mình.", { status: 403 });
      }
      if (existingEval.status === "APPROVED") {
        return new NextResponse("Đánh giá KPI đã được phê duyệt, không thể tự chỉnh sửa.", { status: 400 });
      }
      if (!isSelfAssessmentOnly) {
        return new NextResponse("Bạn chỉ được phép cập nhật điểm tự đánh giá (selfScore) và trạng thái SELF_ASSESSED cho KPI của chính mình.", { status: 403 });
      }

      const updatedSelf = await prisma.performanceEvaluation.update({
        where: { id },
        data: {
          selfScore: selfScore !== undefined ? Number(selfScore) : existingEval.selfScore,
          status: "SELF_ASSESSED"
        },
        include: {
          employee: {
            include: {
              user: { select: { id: true, name: true, email: true, roleId: true, createdAt: true, updatedAt: true } },
              department: true
            }
          }
        }
      });

      await prisma.auditLog.create({
        data: {
          userName: session.user.name || "Nhân viên",
          userRole: roleName,
          action: `Tự đánh giá KPI (${updatedSelf.employee.user.name}: ${updatedSelf.selfScore} điểm)`,
          target: "PerformanceEvaluation",
          ip: "127.0.0.1",
          status: "SUCCESS"
        }
      });

      return NextResponse.json(updatedSelf);
    }

    if (["HR", "MANAGER"].includes(roleName)) {
      const targetRoleName = existingEval.employee.user?.role?.name || "USER";
      if (["SYSTEM_ADMIN", "BOD"].includes(targetRoleName)) {
        return new NextResponse("Bạn không có thẩm quyền chỉnh sửa đánh giá KPI của Quản trị hệ thống hoặc Ban Giám Đốc.", { status: 403 });
      }
    }

    if (roleName === "MANAGER") {
      const callerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        include: { managedDept: true }
      });
      const managedDeptId = callerProfile?.managedDept?.id;
      if (!managedDeptId || existingEval.employee.departmentId !== managedDeptId) {
        return new NextResponse("Trưởng phòng chỉ được phép đánh giá KPI cho nhân sự thuộc phòng ban mình quản lý.", { status: 403 });
      }
    }

    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return new NextResponse("Bạn không có quyền sửa đánh giá của nhân sự khác.", { status: 403 });
    }

    const c1 = criterion1 !== undefined ? Number(criterion1) : existingEval.criterion1;
    const c2 = criterion2 !== undefined ? Number(criterion2) : existingEval.criterion2;
    const c3 = criterion3 !== undefined ? Number(criterion3) : existingEval.criterion3;
    const totalScore = Math.round(((c1 * 0.5) + (c2 * 0.25) + (c3 * 0.25)) * 10) / 10;
    const { grade, bonusRate } = computeGradeAndBonus(totalScore);

    const updated = await prisma.performanceEvaluation.update({
      where: { id },
      data: {
        criterion1: c1,
        criterion2: c2,
        criterion3: c3,
        selfScore: selfScore !== undefined ? Number(selfScore) : existingEval.selfScore,
        managerScore: managerScore !== undefined ? Number(managerScore) : existingEval.managerScore,
        totalScore,
        grade,
        bonusRate,
        status: roleName === "MANAGER" ? "PENDING_REVIEW" : (["APPROVED", "PENDING_REVIEW"].includes(status) ? status : existingEval.status),
        managerNotes: managerNotes !== undefined ? managerNotes : existingEval.managerNotes
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true, roleId: true, createdAt: true, updatedAt: true } },
            department: true
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userName: session.user.name || "Quản trị viên",
        userRole: roleName,
        action: `Điều chỉnh kết quả KPI (${updated.employee.user.name}: ${totalScore} điểm - ${grade})`,
        target: "PerformanceEvaluation",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PERFORMANCE_PUT]", error);
    return new NextResponse(error.message || "Lỗi cập nhật", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc hoặc HR mới có quyền xóa hồ sơ KPI.", { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.performanceEvaluation.findUnique({
      where: { id },
      include: { employee: { include: { user: { include: { role: true } } } } },
    });

    if (!existing) {
      return new NextResponse("Không tìm thấy hồ sơ đánh giá KPI.", { status: 404 });
    }

    if (roleName === "HR") {
      if (existing.employee.userId === session.user.id) {
        return new NextResponse("Nhân sự (HR) không được tự xóa hồ sơ KPI của chính mình.", { status: 403 });
      }
      const targetRoleName = existing.employee.user?.role?.name || "USER";
      if (["SYSTEM_ADMIN", "BOD"].includes(targetRoleName)) {
        return new NextResponse("Nhân sự (HR) không có thẩm quyền xóa hồ sơ KPI của Quản trị hệ thống hoặc Ban Giám Đốc.", { status: 403 });
      }
    }

    if (existing.status === "APPROVED") {
      const quarterMonthMap: Record<string, number> = {
        Q1: 3,
        Q2: 6,
        Q3: 9,
        Q4: 12,
      };
      const qPrefix = existing.period.split("-")[0]?.toUpperCase();
      const closingMonth = quarterMonthMap[qPrefix];
      if (closingMonth) {
        const paidPayroll = await prisma.payroll.findFirst({
          where: {
            employeeId: existing.employeeId,
            month: closingMonth,
            year: existing.year,
            status: "PAID",
          },
        });
        if (paidPayroll) {
          return new NextResponse(
            `Không thể xóa đánh giá KPI ${existing.period} đã phê duyệt vì kỳ lương tháng ${closingMonth}/${existing.year} đã khóa sổ (PAID).`,
            { status: 400 }
          );
        }
      }
    }

    const deleted = await prisma.performanceEvaluation.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userName: session.user.name || "Quản trị viên",
        userRole: roleName,
        action: `Xóa hồ sơ đánh giá KPI ${existing.period}/${existing.year} của nhân sự ${existing.employee.user.name}`,
        target: "PerformanceEvaluation",
        ip: "127.0.0.1",
        status: "WARNING",
      },
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    console.error("[PERFORMANCE_DELETE]", error);
    return new NextResponse(error.message || "Lỗi xóa bản ghi", { status: 500 });
  }
}
