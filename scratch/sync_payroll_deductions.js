require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function sync() {
  console.log("=== CHUẨN HÓA VÀ LÀM TRÒN SỐ NGUYÊN VNĐ CHO TOÀN BỘ BẢNG LƯƠNG ===");
  
  const payrolls = await prisma.payroll.findMany();
  let updatedCount = 0;

  for (const p of payrolls) {
    const roundedBase = Math.round(p.baseSalary);
    const roundedBonus = Math.round(p.bonus || 0);

    // Tính chính xác 10.5% bảo hiểm bắt buộc theo luật lao động VN
    const bhxh = Math.round(roundedBase * 0.08);
    const bhyt = Math.round(roundedBase * 0.015);
    const bhtn = Math.round(roundedBase * 0.01);
    const totalDeductions = bhxh + bhyt + bhtn;

    const netSalary = roundedBase + roundedBonus - totalDeductions;

    const details = [
      {
        name: "Lương cơ bản theo ngày công thực tế",
        type: "EARNING",
        amount: roundedBase,
        amountType: "FIXED"
      },
      {
        name: "Bảo hiểm Xã hội (BHXH 8%)",
        type: "DEDUCTION",
        amount: bhxh,
        amountType: "FIXED"
      },
      {
        name: "Bảo hiểm Y tế (BHYT 1.5%)",
        type: "DEDUCTION",
        amount: bhyt,
        amountType: "FIXED"
      },
      {
        name: "Bảo hiểm Thất nghiệp (BHTN 1.0%)",
        type: "DEDUCTION",
        amount: bhtn,
        amountType: "FIXED"
      }
    ];

    await prisma.payroll.update({
      where: { id: p.id },
      data: {
        baseSalary: roundedBase,
        bonus: roundedBonus,
        deductions: totalDeductions,
        netSalary: netSalary,
        details: details
      }
    });
    updatedCount++;
  }

  console.log(`Đã chuẩn hóa 100% cho ${updatedCount} phiếu lương!`);

  // Kiểm tra 3 phiếu mẫu
  const samples = await prisma.payroll.findMany({
    take: 3,
    include: { employee: { include: { user: true } } }
  });

  samples.forEach(s => {
    const isExact = (s.baseSalary + s.bonus - s.deductions) === s.netSalary;
    console.log(`\n- Cán bộ: ${s.employee.user.name}`);
    console.log(`  + Lương cơ bản: ${s.baseSalary.toLocaleString('vi-VN')} VNĐ`);
    console.log(`  + Khấu trừ BH (10.5%): ${s.deductions.toLocaleString('vi-VN')} VNĐ`);
    console.log(`  + Thực lĩnh: ${s.netSalary.toLocaleString('vi-VN')} VNĐ`);
    console.log(`  + Khớp số học tuyệt đối: ${isExact ? 'CHÍNH XÁC 100%' : 'LỆCH'}`);
  });

  await prisma.$disconnect();
  await pool.end();
}

sync().catch(e => {
  console.error("Lỗi:", e);
  process.exit(1);
});
