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
          amount: 22,
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

export async function createPayroll(data: any, actorName: string = "Phòng Nhân Sự") {
  const { employeeId, month, year, baseSalary, bonus = 0, deductions = 0 } = data;

  const existing = await prisma.payroll.findUnique({
    where: {
      employeeId_month_year: {
        employeeId,
        month: parseInt(month),
        year: parseInt(year),
      },
    },
  });

  if (existing) {
    throw new Error(`Phiếu lương tháng ${month}/${year} của nhân viên này đã tồn tại.`);
  }

  const parsedBase = parseFloat(baseSalary) || 0;
  const parsedBonus = parseFloat(bonus) || 0;
  const parsedDed = parseFloat(deductions) || 0;
  const netSalary = Math.max(0, parsedBase + parsedBonus - parsedDed);
  const details = data.details ?? buildManualPayrollDetails(parsedBase, parsedBonus, parsedDed);

  const created = await prisma.payroll.create({
    data: {
      employeeId,
      month: parseInt(month),
      year: parseInt(year),
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

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Khởi tạo phiếu lương nháp Tháng ${month}/${year} cho nhân viên ${created.employee.user.name} (Thực lĩnh: ${netSalary.toLocaleString("vi-VN")} VNĐ)`,
      target: "Payroll",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return created;
}

export async function updatePayroll(id: string, data: any, actorName: string = "Kế toán / HR") {
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
    const updated = await prisma.payroll.update({
      where: { id },
      data: { status: "PAID" },
    });

    await prisma.auditLog.create({
      data: {
        userName: actorName,
        userRole: "FINANCE_DIRECTOR",
        action: `Phê duyệt chi trả (PAID) phiếu lương Tháng ${payroll.month}/${payroll.year} của ${payroll.employee.user.name} (Tổng chi: ${payroll.netSalary.toLocaleString("vi-VN")} VNĐ)`,
        target: "Payroll",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
    });

    return updated;
  }

  const newBase = baseSalary !== undefined ? parseFloat(baseSalary) : payroll.baseSalary;
  const newBonus = bonus !== undefined ? parseFloat(bonus) : payroll.bonus;
  const newDed = deductions !== undefined ? parseFloat(deductions) : payroll.deductions;

  const netSalary = Math.max(0, newBase + newBonus - newDed);
  const details =
    data.details ?? buildManualPayrollDetails(newBase, newBonus, newDed, payroll.details);

  const updated = await prisma.payroll.update({
    where: { id },
    data: {
      baseSalary: newBase,
      bonus: newBonus,
      deductions: newDed,
      netSalary,
      details,
    },
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Điều chỉnh số liệu phiếu lương Tháng ${payroll.month}/${payroll.year} (${payroll.employee.user.name})`,
      target: "Payroll",
      ip: "127.0.0.1",
      status: "WARNING",
    },
  });

  return updated;
}

export async function deletePayroll(id: string, actorName: string = "Quản trị viên") {
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

  const deleted = await prisma.payroll.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Hủy phiếu lương nháp Tháng ${payroll.month}/${payroll.year} của nhân viên ${payroll.employee.user.name}`,
      target: "Payroll",
      ip: "127.0.0.1",
      status: "CRITICAL",
    },
  });

  return deleted;
}

export async function calculateMonthlyPayroll(
  month: number,
  year: number,
  actorName: string = "Hệ thống / HR"
) {
  const now = new Date();
  if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)) {
    throw new Error("Không thể tính lương tự động cho kỳ lương tương lai chưa phát sinh công.");
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = new Date(Date.UTC(year, month - 1, lastDay, 23, 59, 59, 999));

  const employeeConfigs = await prisma.employeeSalaryConfig.findMany({
    include: {
      employee: {
        include: {
          attendances: {
            where: {
              date: { gte: startDate, lte: endDate },
            },
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
  const STANDARD_WORKING_DAYS = 22;

  const activeConfigs = employeeConfigs.filter(
    (c) => c.employee.status !== "RESIGNED" && c.employee.status !== "SUSPENDED"
  );

  const maxRecordedDaysInCompany = Math.max(
    0,
    ...activeConfigs.map(
      (c) =>
        c.employee.attendances.filter(
          (a) =>
            a.status === "PRESENT" ||
            a.status === "LATE" ||
            a.status === "LEAVE" ||
            a.status === "ABSENT"
        ).length
    )
  );

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

    const workedDays = employee.attendances.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE"
    ).length;

    const leaveAttendanceDays = employee.attendances.filter(
      (a) => a.status === "LEAVE"
    ).length;

    const unexcusedAbsences = employee.attendances.filter(
      (a) => a.status === "ABSENT"
    ).length;

    let calculatedPaidLeaveDays = 0;
    let calculatedUnpaidLeaveDays = 0;

    for (const leave of employee.leaveRequests) {
      const cur = new Date(leave.startDate > startDate ? leave.startDate : startDate);
      const leaveEnd = new Date(leave.endDate < endDate ? leave.endDate : endDate);
      while (cur <= leaveEnd) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          if (leave.type === "UNPAID_LEAVE") {
            calculatedUnpaidLeaveDays++;
          } else {
            calculatedPaidLeaveDays++;
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    const paidLeaveAttDays = Math.max(0, leaveAttendanceDays - calculatedUnpaidLeaveDays);
    const paidLeaveDays = Math.max(paidLeaveAttDays, calculatedPaidLeaveDays);

    let effectiveDays = 0;
    let actualWorkingDays = 0;

    if (maxRecordedDaysInCompany === 0) {
      effectiveDays = Math.max(0, STANDARD_WORKING_DAYS - calculatedUnpaidLeaveDays);
      actualWorkingDays = Math.max(0, effectiveDays - paidLeaveDays);
    } else if (maxRecordedDaysInCompany < STANDARD_WORKING_DAYS) {
      const penaltyDays = Math.max(0, maxRecordedDaysInCompany - (workedDays + paidLeaveDays));
      effectiveDays = Math.max(0, STANDARD_WORKING_DAYS - penaltyDays);
      actualWorkingDays = Math.max(0, effectiveDays - paidLeaveDays);
    } else {
      const totalPaidDays = workedDays + paidLeaveDays;
      effectiveDays = Math.min(totalPaidDays, STANDARD_WORKING_DAYS);
      actualWorkingDays = workedDays;
    }

    const proRatedBaseSalary = Math.round((baseSalary / STANDARD_WORKING_DAYS) * effectiveDays);

    let totalBonus = 0;
    let totalDeduction = 0;
    let kpiPenaltyAmount = 0;
    const details: any[] = [];

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

    if (unexcusedAbsences > 0) {
      details.push({
        name: "Nghỉ không phép (Trừ công)",
        type: "DEDUCTION",
        amount: unexcusedAbsences,
        amountType: "DAYS",
      });
    }

    const totalOtHours = Math.round(
      employee.attendances.reduce((acc, a) => {
        const rawHours = a.checkIn && a.checkOut ? (new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) / (1000 * 60 * 60) : 0;
        const wh = rawHours > 5 ? rawHours - 1 : rawHours;
        return wh > 8 ? acc + (wh - 8) : acc;
      }, 0) * 10
    ) / 10;

    if (totalOtHours > 0) {
      const hourlyRate = baseSalary / STANDARD_WORKING_DAYS / 8;
      const otBonus = Math.round(hourlyRate * 1.5 * totalOtHours);
      totalBonus += otBonus;
      details.push({
        name: `Lương làm thêm giờ (OT ${totalOtHours}h x 150%)`,
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
      userRole: "HR",
      action: `Chạy bảng tính lương tự động Tháng ${month}/${year} cho toàn bộ nhân sự (${payrollsCreated.length} phiếu lương)`,
      target: "PayrollEngine",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return payrollsCreated;
}

export async function bulkDisbursePayrolls(ids: string[], actorName: string = "Ban Giám Đốc") {
  const whereClause: any = { status: "DRAFT" };
  if (Array.isArray(ids) && ids.length > 0) {
    whereClause.id = { in: ids };
  }

  const drafts = await prisma.payroll.findMany({
    where: whereClause,
    include: { employee: { include: { user: { select: { name: true } } } } },
  });

  if (drafts.length === 0) {
    throw new Error("Không có phiếu lương nháp nào cần duyệt chi.");
  }

  const totalDisbursed = drafts.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  await prisma.payroll.updateMany({
    where: { id: { in: drafts.map((d) => d.id) } },
    data: { status: "PAID" },
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "BOD",
      action: `Phê duyệt chi trả hàng loạt (${drafts.length} phiếu lương) - Tổng giải ngân: ${Math.round(totalDisbursed).toLocaleString("vi-VN")} VNĐ`,
      target: "Payroll",
      ip: "127.0.0.1",
      status: "SUCCESS",
    },
  });

  return { count: drafts.length, totalDisbursed };
}
