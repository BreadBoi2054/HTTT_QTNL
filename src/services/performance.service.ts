import { prisma } from "@/lib/prisma";

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  roleId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export async function getPerformanceEvaluations(
  period?: string,
  year?: number,
  scope?: { userEmail?: string; roleName?: string; userId?: string }
) {
  const where: any = {};
  if (period && period !== "ALL") where.period = period;
  if (year) where.year = year;

  if (scope?.roleName === "USER" && scope.userEmail) {
    where.employee = { user: { email: scope.userEmail } };
  } else if (scope?.roleName === "MANAGER" && scope.userId) {
    const managedDept = await prisma.department.findFirst({
      where: { manager: { userId: scope.userId } },
      select: { id: true },
    });
    if (managedDept) {
      where.employee = {
        OR: [{ departmentId: managedDept.id }, { user: { id: scope.userId } }],
      };
    } else {
      where.employee = { user: { id: scope.userId } };
    }
  }

  return await prisma.performanceEvaluation.findMany({
    where,
    orderBy: [{ totalScore: "desc" }, { createdAt: "desc" }],
    include: {
      employee: {
        include: {
          user: { select: SAFE_USER_SELECT },
          department: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export function computeGradeAndBonus(totalScore: number): {
  grade: string;
  bonusRate: number;
  bonusLabel: string;
} {
  if (totalScore >= 90) {
    return { grade: "HẠNG A (XUẤT SẮC)", bonusRate: 0.25, bonusLabel: "+25% Lương CB" };
  } else if (totalScore >= 75) {
    return { grade: "HẠNG B (HOÀN THÀNH TỐT)", bonusRate: 0.1, bonusLabel: "+10% Lương CB" };
  } else if (totalScore >= 60) {
    return { grade: "HẠNG C (ĐẠT YÊU CẦU)", bonusRate: 0.0, bonusLabel: "0% Lương CB" };
  } else {
    return { grade: "HẠNG D (CẦN CẢI THIỆN)", bonusRate: -0.1, bonusLabel: "-10% Phạt KPI" };
  }
}

export async function upsertPerformanceEvaluation(
  data: any,
  actorName: string = "Hội đồng Đánh giá",
  actorRole: string = "HR"
) {
  const {
    employeeId,
    period = "Q4-2026",
    year = 2026,
    selfScore = 80,
    managerScore = 80,
    criterion1 = 80,
    criterion2 = 80,
    criterion3 = 80,
    status = "APPROVED",
    managerNotes,
  } = data;

  const totalScore =
    Math.round((Number(criterion1) * 0.5 + Number(criterion2) * 0.25 + Number(criterion3) * 0.25) * 10) / 10;
  const { grade, bonusRate } = computeGradeAndBonus(totalScore);

  const evaluation = await prisma.performanceEvaluation.upsert({
    where: {
      employeeId_period_year: {
        employeeId,
        period,
        year: Number(year),
      },
    },
    update: {
      selfScore: Number(selfScore),
      managerScore: Number(managerScore),
      criterion1: Number(criterion1),
      criterion2: Number(criterion2),
      criterion3: Number(criterion3),
      totalScore,
      grade,
      bonusRate,
      status,
      managerNotes,
    },
    create: {
      employeeId,
      period,
      year: Number(year),
      selfScore: Number(selfScore),
      managerScore: Number(managerScore),
      criterion1: Number(criterion1),
      criterion2: Number(criterion2),
      criterion3: Number(criterion3),
      totalScore,
      grade,
      bonusRate,
      status,
      managerNotes,
    },
    include: {
      employee: {
        include: { user: { select: SAFE_USER_SELECT }, department: true },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Cập nhật đánh giá KPI ${period}/${year} cho nhân sự ${evaluation.employee.user.name}: ${totalScore} điểm (${grade})`,
      target: "PerformanceEvaluation",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return evaluation;
}

