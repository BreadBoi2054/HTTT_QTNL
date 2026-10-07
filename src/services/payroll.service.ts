import { prisma } from "@/lib/prisma";

export async function getPayrolls(
  month?: number, 
  year?: number, 
  scope?: { userEmail?: string; roleName?: string; userId?: string }
) {
  const where: any = {};
  if (month) where.month = month;
  if (year) where.year = year;

  // Bảo mật thu nhập theo phân quyền vai trò (Role-Based Salary Privacy)
  if (scope?.roleName === "USER" && scope.userEmail) {
    where.employee = { user: { email: scope.userEmail } };
  } else if (scope?.roleName === "MANAGER" && scope.userId) {
    const managedDept = await prisma.department.findFirst({
      where: { manager: { userId: scope.userId } },
      select: { id: true }
    });
    if (managedDept) {
      where.employee = {
        OR: [
          { departmentId: managedDept.id },
          { user: { id: scope.userId } }
        ]
      };
    } else {
      where.employee = { user: { id: scope.userId } };
    }
  }

  return await prisma.payroll.findMany({
    where,
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true, role: { select: { name: true } } } },
          department: true
        }
      }
    }
  });
}

export async function createPayroll(data: any, actorName: string = "Phòng Nhân Sự") {
  const { employeeId, month, year, baseSalary, bonus = 0, deductions = 0 } = data;

  const existing = await prisma.payroll.findUnique({
    where: {
      employeeId_month_year: { 
        employeeId, 
        month: parseInt(month), 
        year: parseInt(year) 
      }
    }
  });

  if (existing) {
    throw new Error(`Phiếu lương tháng ${month}/${year} của nhân viên này đã tồn tại.`);
  }

  const netSalary = Math.max(0, parseFloat(baseSalary) + parseFloat(bonus) - parseFloat(deductions));

  const created = await prisma.payroll.create({
    data: {
      employeeId,
      month: parseInt(month),
      year: parseInt(year),
      baseSalary: parseFloat(baseSalary),
      bonus: parseFloat(bonus),
      deductions: parseFloat(deductions),
      netSalary,
      status: "DRAFT"
    },
    include: {
      employee: {
        include: { user: true }
      }
    }
  });

  // Ghi nhật ký kiểm toán
  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Khởi tạo phiếu lương nháp Tháng ${month}/${year} cho nhân viên ${created.employee.user.name} (Thực lĩnh: ${netSalary.toLocaleString('vi-VN')} VNĐ)`,
      target: "Payroll",
      ip: "127.0.0.1",
      status: "SUCCESS"
    }
  });

  return created;
}

export async function updatePayroll(id: string, data: any, actorName: string = "Kế toán / HR") {
  const payroll = await prisma.payroll.findUnique({ 
    where: { id },
    include: {
      employee: {
        include: { user: true }
      }
    }
  });
  if (!payroll) throw new Error("Không tìm thấy phiếu lương.");
  if (payroll.status === "PAID") throw new Error("Sổ sách đã đóng. Không thể sửa phiếu lương đã thanh toán.");

  const { baseSalary, bonus, deductions, status } = data;

  // Nếu Request chuyển trạng thái sang PAID (Phê duyệt chi trả)
  if (status === "PAID") {
    const updated = await prisma.payroll.update({
      where: { id },
      data: { status: "PAID" }
    });

    await prisma.auditLog.create({
      data: {
        userName: actorName,
        userRole: "FINANCE_DIRECTOR",
        action: `Phê duyệt chi trả (PAID) phiếu lương Tháng ${payroll.month}/${payroll.year} của ${payroll.employee.user.name} (Tổng chi: ${payroll.netSalary.toLocaleString('vi-VN')} VNĐ)`,
        target: "Payroll",
        ip: "127.0.0.1",
        status: "SUCCESS"
      }
    });

    return updated;
  }

  // Cập nhật số liệu tài chính
  const newBase = baseSalary !== undefined ? parseFloat(baseSalary) : payroll.baseSalary;
  const newBonus = bonus !== undefined ? parseFloat(bonus) : payroll.bonus;
  const newDed = deductions !== undefined ? parseFloat(deductions) : payroll.deductions;
  
  const netSalary = Math.max(0, newBase + newBonus - newDed);

  const updated = await prisma.payroll.update({
    where: { id },
    data: {
      baseSalary: newBase,
      bonus: newBonus,
      deductions: newDed,
      netSalary
    }
  });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Điều chỉnh số liệu phiếu lương Tháng ${payroll.month}/${payroll.year} (${payroll.employee.user.name})`,
      target: "Payroll",
      ip: "127.0.0.1",
      status: "WARNING"
    }
  });

  return updated;
}

export async function deletePayroll(id: string, actorName: string = "Quản trị viên") {
  const payroll = await prisma.payroll.findUnique({ 
    where: { id },
    include: {
      employee: {
        include: { user: true }
      }
    }
  });
  if (!payroll) throw new Error("Không tìm thấy phiếu lương.");
  if (payroll.status === "PAID") throw new Error("Sổ sách đã đóng. Không thể xóa phiếu lương đã thanh toán.");

  const deleted = await prisma.payroll.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Hủy phiếu lương nháp Tháng ${payroll.month}/${payroll.year} của nhân viên ${payroll.employee.user.name}`,
      target: "Payroll",
      ip: "127.0.0.1",
      status: "CRITICAL"
    }
  });

  return deleted;
}

export async function calculateMonthlyPayroll(month: number, year: number, actorName: string = "Hệ thống / HR") {
  const startDate = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = new Date(year, month - 1, lastDay, 23, 59, 59, 999);

  // 1. Lấy tất cả EmployeeConfig
  const employeeConfigs = await prisma.employeeSalaryConfig.findMany({
    include: {
      employee: {
        include: {
          attendances: {
            where: {
              date: { gte: startDate, lte: endDate },
              status: { not: "ABSENT" }
            }
          },
          leaveRequests: {
            where: {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
              status: "APPROVED",
              type: { in: ["ANNUAL_LEAVE", "SICK_LEAVE"] } // Paid leaves
            }
          },
          user: { select: { name: true } }
        }
      },
      components: {
        include: {
          component: true
        }
      }
    }
  });

  const payrollsCreated = [];
  const STANDARD_WORKING_DAYS = 22; // Cố định 22 ngày công chuẩn mỗi tháng

  // 2. Tính lương cho từng nhân viên
  for (const config of employeeConfigs) {
    const { employee, baseSalary, components } = config;
    
    // Ngày công thực tế (chỉ tính ngày đi làm có mặt hoặc đi muộn)
    const workedDays = employee.attendances.filter(a => a.status === "PRESENT" || a.status === "LATE").length;

    // Ngày nghỉ phép có lương từ bảng chấm công
    const leaveAttendanceDays = employee.attendances.filter(a => a.status === "LEAVE").length;

    // Tính ngày nghỉ phép có lương từ các đơn đã được duyệt (loại trừ Chủ nhật)
    let calculatedLeaveDays = 0;
    for (const leave of employee.leaveRequests) {
      const cur = new Date(leave.startDate > startDate ? leave.startDate : startDate);
      const leaveEnd = new Date(leave.endDate < endDate ? leave.endDate : endDate);
      while (cur <= leaveEnd) {
        if (cur.getDay() !== 0) { // Loại trừ Chủ nhật
          calculatedLeaveDays++;
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Tránh cộng trùng nếu đơn nghỉ phép đã đồng bộ sang bảng attendance
    const paidLeaveDays = Math.max(leaveAttendanceDays, calculatedLeaveDays);
    const actualWorkingDays = workedDays;
    const totalPaidDays = actualWorkingDays + paidLeaveDays;
    const effectiveDays = Math.min(totalPaidDays, STANDARD_WORKING_DAYS);

    const proRatedBaseSalary = Math.round((baseSalary / STANDARD_WORKING_DAYS) * effectiveDays);

    let totalBonus = 0;
    let totalDeduction = 0;
    const details: any[] = [];

    details.push({
      name: "Ngày công thực tế",
      type: "INFO",
      amount: actualWorkingDays,
      amountType: "DAYS"
    });
    if (paidLeaveDays > 0) {
      details.push({
        name: "Ngày nghỉ phép (Có lương)",
        type: "INFO",
        amount: paidLeaveDays,
        amountType: "DAYS"
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
        amountType: comp.amountType
      });

      if (comp.type === "EARNING") {
        totalBonus += amount;
      } else if (comp.type === "DEDUCTION") {
        totalDeduction += amount;
      }
    }

    // Trích nộp bảo hiểm bắt buộc theo Luật Lao động Việt Nam (Tổng 10.5%: BHXH 8%, BHYT 1.5%, BHTN 1%)
    const hasDeductionsInConfig = components.some(c => c.component.type === "DEDUCTION");
    if (!hasDeductionsInConfig) {
      const bhxh = Math.round(proRatedBaseSalary * 0.08);
      const bhyt = Math.round(proRatedBaseSalary * 0.015);
      const bhtn = Math.round(proRatedBaseSalary * 0.01);
      const statutoryTotal = bhxh + bhyt + bhtn;

      totalDeduction += statutoryTotal;

      details.push({
        name: "Bảo hiểm Xã hội (BHXH 8%)",
        type: "DEDUCTION",
        amount: bhxh,
        amountType: "FIXED"
      });
      details.push({
        name: "Bảo hiểm Y tế (BHYT 1.5%)",
        type: "DEDUCTION",
        amount: bhyt,
        amountType: "FIXED"
      });
      details.push({
        name: "Bảo hiểm Thất nghiệp (BHTN 1.0%)",
        type: "DEDUCTION",
        amount: bhtn,
        amountType: "FIXED"
      });
    }

    const netSalary = Math.max(0, Math.round(proRatedBaseSalary + totalBonus - totalDeduction));

    const payroll = await prisma.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month,
          year
        }
      },
      update: {
        baseSalary: proRatedBaseSalary,
        bonus: totalBonus,
        deductions: totalDeduction,
        netSalary: netSalary,
        details: details,
        status: "DRAFT"
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
        status: "DRAFT"
      }
    });

    payrollsCreated.push(payroll);
  }

  // 3. Ghi nhật ký kiểm toán cho chu kỳ tính lương
  await prisma.auditLog.create({
    data: {
      userName: actorName,
      userRole: "HR",
      action: `Chạy bảng tính lương tự động Tháng ${month}/${year} cho toàn bộ nhân sự (${payrollsCreated.length} phiếu lương)`,
      target: "PayrollEngine",
      ip: "127.0.0.1",
      status: "SUCCESS"
    }
  });

  return payrollsCreated;
}
