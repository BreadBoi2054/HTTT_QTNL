require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const { calculateMonthlyPayroll } = require('../src/services/payroll.service');

async function testCalc() {
  console.log("=== CHẠY THỰC TẾ TÍNH LƯƠNG TỰ ĐỘNG THÁNG 10/2026 ===");
  const results = await calculateMonthlyPayroll(10, 2026, "Kiểm thử tự động");
  console.log(`Đã tính toán thành công cho ${results.length} cán bộ nhân viên.`);

  const sample = await prisma.payroll.findFirst({
    where: { month: 10, year: 2026 },
    include: { employee: { include: { user: true } } }
  });

  if (sample) {
    console.log(`\nPhiếu lương mẫu sau khi tính toán chuẩn:`);
    console.log(`- Cán bộ: ${sample.employee.user.name}`);
    console.log(`- Lương cơ bản theo ngày công: ${sample.baseSalary.toLocaleString('vi-VN')} VNĐ`);
    console.log(`- Thưởng & phụ cấp: ${sample.bonus.toLocaleString('vi-VN')} VNĐ`);
    console.log(`- Khấu trừ bảo hiểm (10.5%): ${sample.deductions.toLocaleString('vi-VN')} VNĐ`);
    console.log(`- Lương thực lĩnh: ${sample.netSalary.toLocaleString('vi-VN')} VNĐ`);
    
    const expectedNet = sample.baseSalary + sample.bonus - sample.deductions;
    const diff = Math.abs(sample.netSalary - expectedNet);
    console.log(`- Kiểm tra khớp toán học: ${diff < 1 ? 'CHÍNH XÁC 100% (Khớp từng đồng)' : 'LỆCH: ' + diff}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

testCalc().catch(e => {
  console.error("Lỗi:", e);
  process.exit(1);
});
