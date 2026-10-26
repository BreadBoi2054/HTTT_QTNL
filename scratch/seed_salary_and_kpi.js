require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== BẮT ĐẦU CHUẨN HÓA DỮ LIỆU LƯƠNG & KPI ===");

  // 1. Khởi tạo các cấu phần phụ cấp lương mẫu (SalaryComponent)
  console.log("\n1. Nạp danh mục Thành phần lương (SalaryComponent)...");
  
  const compLunch = await prisma.salaryComponent.upsert({
    where: { id: "comp_lunch_allowance" },
    update: {},
    create: {
      id: "comp_lunch_allowance",
      name: "Phụ cấp ăn trưa",
      type: "EARNING",
      amountType: "FIXED",
      defaultVal: 730000 // Mức miễn thuế TNCN chuẩn
    }
  });

  const compFuel = await prisma.salaryComponent.upsert({
    where: { id: "comp_fuel_comm" },
    update: {},
    create: {
      id: "comp_fuel_comm",
      name: "Phụ cấp xăng xe & liên lạc",
      type: "EARNING",
      amountType: "FIXED",
      defaultVal: 500000
    }
  });

  const compResponsibility = await prisma.salaryComponent.upsert({
    where: { id: "comp_responsibility" },
    update: {},
    create: {
      id: "comp_responsibility",
      name: "Phụ cấp trách nhiệm",
      type: "EARNING",
      amountType: "FIXED",
      defaultVal: 2000000
    }
  });

  console.log("Đã tạo 3 cấu phần lương chuẩn:", [compLunch.name, compFuel.name, compResponsibility.name]);

  // 2. Gán phụ cấp cho nhân viên vào EmployeeSalaryConfig
  console.log("\n2. Gán phụ cấp vào cấu hình lương của 38 nhân sự...");
  const configs = await prisma.employeeSalaryConfig.findMany({
    include: { employee: { include: { user: true } } }
  });

  for (const cfg of configs) {
    // Phụ cấp ăn trưa cho 100% nhân sự
    await prisma.employeeSalaryComponent.upsert({
      where: { configId_componentId: { configId: cfg.id, componentId: compLunch.id } },
      update: {},
      create: { configId: cfg.id, componentId: compLunch.id, customAmount: 730000 }
    });

    // Phụ cấp xăng xe cho 100% nhân sự
    await prisma.employeeSalaryComponent.upsert({
      where: { configId_componentId: { configId: cfg.id, componentId: compFuel.id } },
      update: {},
      create: { configId: cfg.id, componentId: compFuel.id, customAmount: 500000 }
    });

    // Phụ cấp trách nhiệm cho các chức danh Trưởng phòng / Giám đốc
    const isLeadership = cfg.employee.position.includes("Trưởng") || 
                         cfg.employee.position.includes("Giám Đốc") || 
                         cfg.employee.position.includes("CEO") ||
                         cfg.employee.position.includes("Lead");
    if (isLeadership) {
      await prisma.employeeSalaryComponent.upsert({
        where: { configId_componentId: { configId: cfg.id, componentId: compResponsibility.id } },
        update: {},
        create: { configId: cfg.id, componentId: compResponsibility.id, customAmount: 2000000 }
      });
    }
  }
  console.log(`Đã gán thành công phụ cấp cho ${configs.length} cấu hình lương.`);

  // 3. Khởi tạo đánh giá KPI mẫu (Q4-2026) cho toàn bộ nhân sự
  console.log("\n3. Nạp dữ liệu đánh giá KPI (Q4-2026) vào CSDL...");
  const employees = await prisma.employeeProfile.findMany({
    include: { user: true, department: true }
  });

  for (const emp of employees) {
    let c1 = 82, c2 = 84, c3 = 80;
    const name = emp.user.name;

    if (name.includes("An") || name.includes("Dũng") || emp.position.includes("Trưởng phòng") || emp.position.includes("Giám Đốc")) {
      c1 = 95; c2 = 92; c3 = 94; // Hạng A: 94.0đ -> Thưởng +25%
    } else if (name.includes("Bích") || name.includes("Cường") || name.includes("Mai") || name.includes("Đăng")) {
      c1 = 88; c2 = 85; c3 = 84; // Hạng B: 86.25đ -> Thưởng +10%
    } else if (name.includes("Khánh")) {
      c1 = 65; c2 = 70; c3 = 62; // Hạng C: 65.5đ -> Thưởng 0%
    } else {
      c1 = 80 + (emp.id.charCodeAt(emp.id.length - 1) % 15);
      c2 = 80 + (emp.id.charCodeAt(emp.id.length - 2) % 15);
      c3 = 78 + (emp.id.charCodeAt(emp.id.length - 3) % 15);
    }

    const total = Math.round((c1 * 0.5 + c2 * 0.25 + c3 * 0.25) * 10) / 10;
    let grade = "HẠNG B (HOÀN THÀNH TỐT)";
    let bonusRate = 0.10;

    if (total >= 90) {
      grade = "HẠNG A (XUẤT SẮC)";
      bonusRate = 0.25;
    } else if (total >= 75) {
      grade = "HẠNG B (HOÀN THÀNH TỐT)";
      bonusRate = 0.10;
    } else if (total >= 60) {
      grade = "HẠNG C (ĐẠT YÊU CẦU)";
      bonusRate = 0.0;
    } else {
      grade = "HẠNG D (CẦN CẢI THIỆN)";
      bonusRate = -0.10;
    }

    await prisma.performanceEvaluation.upsert({
      where: {
        employeeId_period_year: {
          employeeId: emp.id,
          period: "Q4-2026",
          year: 2026
        }
      },
      update: {
        criterion1: c1,
        criterion2: c2,
        criterion3: c3,
        selfScore: Math.round((c1 + c2 + c3) / 3),
        managerScore: total,
        totalScore: total,
        grade,
        bonusRate,
        status: "APPROVED"
      },
      create: {
        employeeId: emp.id,
        period: "Q4-2026",
        year: 2026,
        criterion1: c1,
        criterion2: c2,
        criterion3: c3,
        selfScore: Math.round((c1 + c2 + c3) / 3),
        managerScore: total,
        totalScore: total,
        grade,
        bonusRate,
        status: "APPROVED",
        managerNotes: total >= 90 ? "Cán bộ xuất sắc, chủ trì dự án vượt tiến độ và tinh thần trách nhiệm cao." : "Hoàn thành tốt nhiệm vụ chuyên môn được giao."
      }
    });
  }

  const totalKPI = await prisma.performanceEvaluation.count();
  console.log(`Đã nạp thành công ${totalKPI} bản ghi đánh giá KPI vào bảng PerformanceEvaluation.`);

  await prisma.$disconnect();
  await pool.end();
  console.log("=== HOÀN TẤT CHUẨN HÓA ===");
}

main().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
