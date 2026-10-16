import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { holidayDatesForYear, isScheduledWorkday, monthlyWorkdays } from "@/lib/work-calendar";

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  roleId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export function calculateVietnamesePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 10000000) {
    return Math.round(taxableIncome * 0.05);
  } else if (taxableIncome <= 30000000) {
    return Math.round(taxableIncome * 0.1 - 500000);
  } else if (taxableIncome <= 60000000) {
    return Math.round(taxableIncome * 0.2 - 3500000);
  } else if (taxableIncome <= 100000000) {
    return Math.round(taxableIncome * 0.3 - 9500000);
  } else {
    return Math.round(taxableIncome * 0.35 - 14500000);
  }
}

function buildManualPayrollDetails(
  baseSalary: number,
  bonus: number,
  deductions: number,
  existingDetails?: any
) {
  const dayItems = Array.isArray(existingDetails)
    ? existingDetails.filter((d: any) => d && d.amountType === "DAYS")
    : [
        {
          name: "Ngày công thực tế",
          type: "INFO",
          amount: monthlyWorkdays(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1),
          amountType: "DAYS",
        },
      ];

  const details: any[] = [...dayItems];

  details.push({
    name: "Lương cơ bản theo kỳ",
    type: "EARNING",
    amount: baseSalary,
    amountType: "FIXED",
  });

  if (bonus > 0) {
    details.push({
      name: "Phụ cấp & Thưởng hiệu suất",
      type: "EARNING",
      amount: bonus,
      amountType: "FIXED",
    });
  }

  if (deductions > 0) {
    const bhxh = Math.round(baseSalary * 0.08);
    const bhyt = Math.round(baseSalary * 0.015);
    const bhtn = Math.round(baseSalary * 0.01);
    const statutoryTotal = bhxh + bhyt + bhtn;

    if (deductions >= statutoryTotal && baseSalary > 0) {
      details.push({
        name: "Bảo hiểm Xã hội (BHXH 8%)",
        type: "DEDUCTION",
        amount: bhxh,
        amountType: "FIXED",
      });
      details.push({
        name: "Bảo hiểm Y tế (BHYT 1.5%)",
        type: "DEDUCTION",
        amount: bhyt,
        amountType: "FIXED",
      });
      details.push({
        name: "Bảo hiểm Thất nghiệp (BHTN 1.0%)",
        type: "DEDUCTION",
        amount: bhtn,
        amountType: "FIXED",
      });
      const remainingDeduction = deductions - statutoryTotal;
      if (remainingDeduction > 0) {
        details.push({
          name: "Khấu trừ khác / Thuế TNCN",
          type: "DEDUCTION",
          amount: remainingDeduction,
          amountType: "FIXED",
        });
      }
    } else {
      details.push({
        name: "Tổng khoản giảm trừ nghĩa vụ",
        type: "DEDUCTION",
        amount: deductions,
        amountType: "FIXED",
      });
    }
  }

  return details;
}

export async function getPayrolls(
  month?: number,
  year?: number,
  scope?: { userEmail?: string; roleName?: string; userId?: string }
) {
  const where: any = {};
  if (month) where.month = month;
  if (year) where.year = year;

  if (scope?.roleName === "USER") {
    if (!scope.userId) throw new Error("Thiếu định danh người dùng.");
    where.employee = { user: { id: scope.userId } };
  } else if (scope?.roleName === "MANAGER") {
    if (!scope.userId) throw new Error("Thiếu định danh người dùng.");
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

  return await prisma.payroll.findMany({
    where,
    orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true, role: { select: { name: true } } } },
          department: true,
        },
      },
    },
  });
}

export async function createPayroll(data: any, actorName: string = "Phòng Nhân Sự", actorRole: string = "HR") {
  const { employeeId, month, year, baseSalary, bonus = 0, deductions = 0 } = data;
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const parsedBase = Number(baseSalary);
  const parsedBonus = Number(bonus);
  const parsedDed = Number(deductions);
  if (!employeeId || !Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || !Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
    throw new Error("Nhân viên hoặc kỳ lương không hợp lệ.");
  }
  if (![parsedBase, parsedBonus, parsedDed].every((value) => Number.isFinite(value) && value >= 0) || parsedDed > parsedBase + parsedBonus) {
    throw new Error("Các khoản lương phải là số không âm và khấu trừ không được vượt tổng thu nhập.");
  }

  const existing = await prisma.payroll.findUnique({
    where: {
      employeeId_month_year: {
        employeeId,
        month: parsedMonth,
        year: parsedYear,
      },
    },
  });

  if (existing) {
    throw new Error(`Phiếu lương tháng ${month}/${year} của nhân viên này đã tồn tại.`);
  }

  const netSalary = parsedBase + parsedBonus - parsedDed;
  const details = data.details ?? buildManualPayrollDetails(parsedBase, parsedBonus, parsedDed);

  return prisma.$transaction(async (tx) => {
    const created = await tx.payroll.create({
      data: {
        employeeId,
        month: parsedMonth,
        year: parsedYear,
        baseSalary: parsedBase,
        bonus: parsedBonus,
        deductions: parsedDed,
        netSalary,
        details,
        status: "DRAFT",
      },
      include: {
        employee: {
          include: { user: { select: SAFE_USER_SELECT } },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Khởi tạo phiếu lương nháp Tháng ${month}/${year} cho nhân viên ${created.employee.user.name} (Thực lĩnh: ${netSalary.toLocaleString("vi-VN")} VNĐ)`,
        target: "Payroll",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return created;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}

export async function updatePayroll(id: string, data: any, actorName: string = "Kế toán / HR", actorRole: string = "HR") {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: {
        include: { user: { select: SAFE_USER_SELECT } },
      },
    },
  });
  if (!payroll) throw new Error("Không tìm thấy phiếu lương.");
  if (payroll.status === "PAID") {
    throw new Error("Sổ sách đã đóng. Không thể sửa phiếu lương đã thanh toán.");
  }

  const { baseSalary, bonus, deductions, status } = data;

  if (status === "PAID") {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.payroll.update({
        where: { id, status: "DRAFT" },
        data: { status: "PAID" },
      });
      await tx.auditLog.create({
        data: {
          userName: actorName,
          userRole: actorRole,
          action: `Ghi nhận đã chi trả (PAID) phiếu lương Tháng ${payroll.month}/${payroll.year} của ${payroll.employee.user.name} (Tổng ghi nhận: ${payroll.netSalary.toLocaleString("vi-VN")} VNĐ)`,
          target: "Payroll",
          ip: "127.0.0.1",
          status: "SUCCESS",
        },
      });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
  }

  const newBase = baseSalary !== undefined ? Number(baseSalary) : payroll.baseSalary;
  const newBonus = bonus !== undefined ? Number(bonus) : payroll.bonus;
  const newDed = deductions !== undefined ? Number(deductions) : payroll.deductions;

  if (![newBase, newBonus, newDed].every((value) => Number.isFinite(value) && value >= 0) || newDed > newBase + newBonus) {
    throw new Error("Các khoản lương phải là số không âm và khấu trừ không được vượt tổng thu nhập.");
  }
  const netSalary = newBase + newBonus - newDed;
  const details =
    data.details ?? buildManualPayrollDetails(newBase, newBonus, newDed, payroll.details);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payroll.update({
      where: { id, status: "DRAFT" },
      data: { baseSalary: newBase, bonus: newBonus, deductions: newDed, netSalary, details },
    });
    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Điều chỉnh số liệu phiếu lương Tháng ${payroll.month}/${payroll.year} (${payroll.employee.user.name})`,
        target: "Payroll",
        ip: "127.0.0.1",
        status: "WARNING",
      },
    });
    return updated;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}

export async function deletePayroll(id: string, actorName: string = "Quản trị viên", actorRole: string = "HR") {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: {
        include: { user: { select: SAFE_USER_SELECT } },
      },
    },
  });
  if (!payroll) throw new Error("Không tìm thấy phiếu lương.");
  if (payroll.status === "PAID") {
    throw new Error("Sổ sách đã đóng. Không thể xóa phiếu lương đã thanh toán.");
  }

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.payroll.delete({ where: { id, status: "DRAFT" } });
    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Hủy phiếu lương nháp Tháng ${payroll.month}/${payroll.year} của nhân viên ${payroll.employee.user.name}`,
        target: "Payroll",
        ip: "127.0.0.1",
        status: "CRITICAL",
      },
    });
    return deleted;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}

export async function calculateMonthlyPayroll(
  month: number,
  year: number,
  actorName: string = "Hệ thống / HR",
  actorRole: string = "HR"
) {
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Kỳ lương không hợp lệ.");
  }
  const now = new Date();
  if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)) {
    throw new Error("Không thể tính lương tự động cho kỳ lương tương lai chưa phát sinh công.");
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = new Date(Date.UTC(year, month - 1, lastDay, 23, 59, 59, 999));
  const holidays = holidayDatesForYear(year);
  const standardWorkingDays = monthlyWorkdays(year, month, holidays);

  const employeeConfigs = await prisma.employeeSalaryConfig.findMany({
    include: {
      employee: {
        include: {
          attendances: {
            where: {
              date: { gte: startDate, lte: endDate },
            },
          },
          overtimeRequests: {
            where: { date: { gte: startDate, lte: endDate }, status: "APPROVED" },
          },
          leaveRequests: {
            where: {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
              status: "APPROVED",
            },
          },
          evaluations: {
            where: {
              year: year,
              status: "APPROVED",
            },
            orderBy: { createdAt: "desc" },
          },
          contracts: {
            where: { status: "ACTIVE" },
            orderBy: { startDate: "desc" },
            take: 1,
          },
          user: { select: { name: true } },
        },
      },
      components: {
        include: {
          component: true,
        },
      },
    },
  });

  const payrollsCreated = [];

  for (const config of employeeConfigs) {
    const { employee, components } = config;

    if (employee.status === "RESIGNED" || employee.status === "SUSPENDED") {
      continue;
    }

    let baseSalary = config.baseSalary;
    if (
      baseSalary === 12000000 &&
      employee.contracts?.[0]?.salary &&
      employee.contracts[0].salary > 0
    ) {
      baseSalary = employee.contracts[0].salary;
      await prisma.employeeSalaryConfig.update({
        where: { id: config.id },
        data: { baseSalary },
      });
    }

    const workedDateKeys = new Set(
      employee.attendances
        .filter((a) => (a.status === "PRESENT" || a.status === "LATE") && isScheduledWorkday(a.date, holidays))
        .map((a) => a.date.toISOString().slice(0, 10))
    );
    const workedDays = workedDateKeys.size;

    const unexcusedAbsences = employee.attendances.filter(
      (a) => a.status === "ABSENT" && isScheduledWorkday(a.date, holidays)
    ).length;

    let calculatedPaidLeaveDays = 0;
    let calculatedUnpaidLeaveDays = 0;
    let calculatedSickLeaveDays = 0;
    const leaveDateKeys = new Set<string>();

    for (const leave of employee.leaveRequests) {
      const cur = new Date(leave.startDate > startDate ? leave.startDate : startDate);
      const leaveEnd = new Date(leave.endDate < endDate ? leave.endDate : endDate);
      while (cur <= leaveEnd) {
        const dateKey = cur.toISOString().slice(0, 10);
        if (isScheduledWorkday(cur, holidays) &&
            !workedDateKeys.has(dateKey) && !leaveDateKeys.has(dateKey)) {
          leaveDateKeys.add(dateKey);
          if (leave.type === "UNPAID_LEAVE") {
            calculatedUnpaidLeaveDays++;
          } else if (leave.type === "SICK_LEAVE") {
            calculatedSickLeaveDays++;
          } else {
            calculatedPaidLeaveDays++;
          }
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }

    const paidLeaveDays = calculatedPaidLeaveDays;

    // Chỉ ghi nhận ngày công có bằng chứng; dữ liệu chấm công thiếu không được tự suy ra đủ lương.
    const effectiveDays = Math.min(workedDays + paidLeaveDays, standardWorkingDays);
    const actualWorkingDays = workedDays;

    const proRatedBaseSalary = Math.round((baseSalary / standardWorkingDays) * effectiveDays);

    let totalBonus = 0;
    let totalDeduction = 0;
    let kpiPenaltyAmount = 0;
    const details: any[] = [];

    details.push({ name: "Ngày công chuẩn của kỳ (đã trừ lễ)", type: "INFO", amount: standardWorkingDays, amountType: "DAYS" });

    details.push({
      name: "Ngày công thực tế",
      type: "INFO",
      amount: actualWorkingDays,
      amountType: "DAYS",
    });

    if (paidLeaveDays > 0) {
      details.push({
        name: "Ngày nghỉ phép (Có lương)",
        type: "INFO",
        amount: paidLeaveDays,
        amountType: "DAYS",
      });
    }

    if (calculatedUnpaidLeaveDays > 0) {
      details.push({
        name: "Nghỉ không lương (Khấu trừ ngày công)",
        type: "DEDUCTION",
        amount: calculatedUnpaidLeaveDays,
        amountType: "DAYS",
      });
    }

    if (calculatedSickLeaveDays > 0) {
      details.push({ name: "Nghỉ ốm theo chế độ BHXH (không tính vào lương công ty)", type: "INFO", amount: calculatedSickLeaveDays, amountType: "DAYS" });
    }

    if (unexcusedAbsences > 0) {
      details.push({
        name: "Nghỉ không phép (Trừ công)",
        type: "DEDUCTION",
        amount: unexcusedAbsences,
        amountType: "DAYS",
      });
    }

    const overtimeByRate = new Map<number, number>();
    for (const request of employee.overtimeRequests) {
      const rate = holidays.has(request.date.toISOString().slice(0, 10)) ? 3 :
        [0, 6].includes(request.date.getUTCDay()) ? 2 : 1.5;
      overtimeByRate.set(rate, (overtimeByRate.get(rate) || 0) + request.hours);
    }
    for (const [rate, totalOtHours] of overtimeByRate) {
      const hourlyRate = baseSalary / standardWorkingDays / 8;
      const otBonus = Math.round(hourlyRate * rate * totalOtHours);
      totalBonus += otBonus;
      details.push({
        name: `OT đã duyệt ${totalOtHours}h × ${rate * 100}%`,
        type: "EARNING",
        amount: otBonus,
        amountType: "FIXED",
      });
    }

    for (const empComp of components) {
      const comp = empComp.component;
      let amount = empComp.customAmount !== null ? empComp.customAmount : comp.defaultVal;

      if (comp.amountType === "PERCENTAGE") {
        amount = (amount / 100) * baseSalary;
      }

      details.push({
        name: comp.name,
        type: comp.type,
        amount: amount,
        amountType: comp.amountType,
      });

      if (comp.type === "EARNING") {
        totalBonus += amount;
      } else if (comp.type === "DEDUCTION") {
        totalDeduction += amount;
      }
    }

    const quarter = Math.ceil(month / 3);
    const quarterPeriod = `Q${quarter}-${year}`;
    const monthPeriod = `${year}-${String(month).padStart(2, "0")}`;

    const matchedKpi =
      employee.evaluations?.find((ev) => ev.period === monthPeriod) ||
      (month % 3 === 0
        ? employee.evaluations?.find((ev) => ev.period === quarterPeriod) ||
          employee.evaluations?.[0]
        : undefined);

    if (matchedKpi && matchedKpi.status === "APPROVED") {
      if (matchedKpi.bonusRate > 0) {
        const kpiBonus = Math.round(proRatedBaseSalary * matchedKpi.bonusRate);
        totalBonus += kpiBonus;
        details.push({
          name: `Thưởng hiệu suất KPI (${matchedKpi.grade.split(" (")[0]} +${Math.round(
            matchedKpi.bonusRate * 100
          )}%)`,
          type: "EARNING",
          amount: kpiBonus,
          amountType: "FIXED",
        });
      } else if (matchedKpi.bonusRate < 0) {
        kpiPenaltyAmount = Math.round(proRatedBaseSalary * Math.abs(matchedKpi.bonusRate));
        totalDeduction += kpiPenaltyAmount;
        details.push({
          name: `Khấu trừ vi phạm KPI (${matchedKpi.grade.split(" (")[0]} ${Math.round(
            matchedKpi.bonusRate * 100
          )}%)`,
          type: "DEDUCTION",
          amount: kpiPenaltyAmount,
          amountType: "FIXED",
        });
      }
    }

    const hasStatutoryInsuranceInConfig = components.some(
      (c) =>
        c.component.type === "DEDUCTION" &&
        (c.component.name.includes("BHXH") ||
          c.component.name.includes("Bảo hiểm") ||
          c.component.name.includes("BHYT"))
    );

    if (!hasStatutoryInsuranceInConfig) {
      const bhxh = Math.round(proRatedBaseSalary * 0.08);
      const bhyt = Math.round(proRatedBaseSalary * 0.015);
      const bhtn = Math.round(proRatedBaseSalary * 0.01);
      const statutoryTotal = bhxh + bhyt + bhtn;

      totalDeduction += statutoryTotal;

      details.push({
        name: "Bảo hiểm Xã hội (BHXH 8%)",
        type: "DEDUCTION",
        amount: bhxh,
        amountType: "FIXED",
      });
      details.push({
        name: "Bảo hiểm Y tế (BHYT 1.5%)",
        type: "DEDUCTION",
        amount: bhyt,
        amountType: "FIXED",
      });
      details.push({
        name: "Bảo hiểm Thất nghiệp (BHTN 1.0%)",
        type: "DEDUCTION",
        amount: bhtn,
        amountType: "FIXED",
      });
    }

    let statutoryInsuranceAmount = 0;
    if (!hasStatutoryInsuranceInConfig) {
      statutoryInsuranceAmount = Math.round(proRatedBaseSalary * 0.105);
    } else {
      const insComp = components.filter(
        (c) =>
          c.component.type === "DEDUCTION" &&
          (c.component.name.includes("BHXH") ||
            c.component.name.includes("Bảo hiểm") ||
            c.component.name.includes("BHYT"))
      );
      for (const ic of insComp) {
        let val = ic.customAmount !== null ? ic.customAmount : ic.component.defaultVal;
        if (ic.component.amountType === "PERCENTAGE") val = (val / 100) * baseSalary;
        statutoryInsuranceAmount += val;
      }
    }

    const lunchComp = components.find((c) =>
      c.component.name.toLowerCase().includes("ăn trưa")
    );
    let lunchAmount = 0;
    if (lunchComp) {
      lunchAmount =
        lunchComp.customAmount !== null
          ? lunchComp.customAmount
          : lunchComp.component.defaultVal;
      if (lunchComp.component.amountType === "PERCENTAGE") {
        lunchAmount = (lunchAmount / 100) * baseSalary;
      }
    }
    const taxExemptLunch = Math.min(lunchAmount, 730000);

    const grossIncome = Math.max(0, proRatedBaseSalary + totalBonus - kpiPenaltyAmount);
    const personalRelief = 15500000 + (employee.dependentCount || 0) * 6200000;
    const assessableIncome = Math.max(
      0,
      grossIncome - taxExemptLunch - statutoryInsuranceAmount - personalRelief
    );
    const pitAmount = calculateVietnamesePIT(assessableIncome);

    if (pitAmount > 0) {
      totalDeduction += pitAmount;
      details.push({
        name: "Thuế Thu nhập Cá nhân (Thuế TNCN lũy tiến)",
        type: "DEDUCTION",
        amount: pitAmount,
        amountType: "FIXED",
      });
    }

    const netSalary = Math.max(
      0,
      Math.round(proRatedBaseSalary + totalBonus - totalDeduction)
    );

    const existing = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month,
          year,
        },
      },
    });

    if (existing && existing.status === "PAID") {
      payrollsCreated.push(existing);
      continue;
    }

    const payroll = await prisma.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month,
          year,
        },
      },
      update: {
        baseSalary: proRatedBaseSalary,
        bonus: totalBonus,
        deductions: totalDeduction,
        netSalary: netSalary,
        details: details,
        status: "DRAFT",
      },
      create: {
        employeeId: employee.id,
        month,
        year,
        baseSalary: proRatedBaseSalary,
        bonus: totalBonus,
        deductions: totalDeduction,
        netSalary: netSalary,
        details: details,
        status: "DRAFT",
      },
    });

    payrollsCreated.push(payroll);
  }

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: actorRole,
      action: `Chạy bảng tính lương tự động Tháng ${month}/${year} cho toàn bộ nhân sự (${payrollsCreated.length} phiếu lương)`,
      target: "PayrollEngine",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return payrollsCreated;
}

export async function bulkDisbursePayrolls(ids: string[], actorName: string = "Ban Giám Đốc", actorRole: string = "BOD") {
  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => typeof id !== "string" || !id.trim())) {
    throw new Error("Cần chọn ít nhất một phiếu lương nháp để duyệt chi.");
  }
  const selectedIds = [...new Set(ids)];

  return prisma.$transaction(async (tx) => {
    const drafts = await tx.payroll.findMany({
      where: { id: { in: selectedIds }, status: "DRAFT" },
      select: { id: true, netSalary: true },
    });

    if (drafts.length !== selectedIds.length) {
      throw new Error("Một hoặc nhiều phiếu lương được chọn không còn ở trạng thái nháp. Vui lòng tải lại danh sách.");
    }

    const totalDisbursed = drafts.reduce((sum, p) => sum + p.netSalary, 0);

    const updated = await tx.payroll.updateMany({
      where: { id: { in: selectedIds }, status: "DRAFT" },
      data: { status: "PAID" },
    });
    if (updated.count !== selectedIds.length) {
      throw new Error("Danh sách phiếu lương đã thay đổi trong lúc duyệt chi. Vui lòng thử lại.");
    }

    await tx.auditLog.create({
      data: {
        userName: actorName,
        userRole: actorRole,
        action: `Ghi nhận đã chi trả hàng loạt (${drafts.length} phiếu lương) - Tổng ghi nhận: ${Math.round(totalDisbursed).toLocaleString("vi-VN")} VNĐ`,
        target: "Payroll",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return { count: drafts.length, totalDisbursed };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}
