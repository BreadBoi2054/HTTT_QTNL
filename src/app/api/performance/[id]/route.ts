import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { computeGradeAndBonus } from "@/services/performance.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER", "USER"].includes(roleName)) {
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
      include: { employee: { include: { user: true } } }
    });

    if (!existingEval) return new NextResponse("Không tìm thấy hồ sơ đánh giá.", { status: 404 });

    if (roleName === "USER") {
      if (existingEval.employee.userId !== session.user.id) {
        return new NextResponse("Bạn chỉ có quyền tự đánh giá KPI của chính mình.", { status: 403 });
      }
      if (
        criterion1 !== undefined ||
        criterion2 !== undefined ||
        criterion3 !== undefined ||
        bodyGrade !== undefined ||
        bodyBonusRate !== undefined ||
        status === "APPROVED"
      ) {
        return new NextResponse("Nhân viên chỉ được phép cập nhật điểm tự đánh giá (selfScore) và trạng thái SELF_ASSESSED.", { status: 403 });
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

    if (roleName === "MANAGER") {
      if (existingEval.employee.userId === session.user.id) {
        return new NextResponse("Trưởng phòng không thể tự phê duyệt KPI của chính mình", { status: 403 });
      }
      const callerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        include: { managedDept: true }
      });
      const managedDeptId = callerProfile?.managedDept?.id || callerProfile?.departmentId;
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
    const deleted = await prisma.performanceEvaluation.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (error: any) {
    console.error("[PERFORMANCE_DELETE]", error);
    return new NextResponse(error.message || "Lỗi xóa bản ghi", { status: 500 });
  }
}
