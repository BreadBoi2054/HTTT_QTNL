require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const totalEmployees = await prisma.employeeProfile.count();
  const totalSalaryConfigs = await prisma.employeeSalaryConfig.count();
  const totalComponents = await prisma.salaryComponent.count();

  console.log(`Tổng nhân viên: ${totalEmployees}`);
  console.log(`Số nhân viên có cấu hình lương (SalaryConfig): ${totalSalaryConfigs}`);
  console.log(`Số cấu phần lương (SalaryComponent): ${totalComponents}`);

  if (totalSalaryConfigs < totalEmployees) {
    console.log(`CẢNH BÁO: Có ${totalEmployees - totalSalaryConfigs} nhân viên CHƯA CÓ cấu hình lương!`);
    const withoutConfig = await prisma.employeeProfile.findMany({
      where: { salaryConfig: null },
      include: { user: true }
    });
    withoutConfig.forEach(e => console.log(`  - ${e.user.name} (${e.user.email}) chưa có cấu hình lương`));
  } else {
    console.log("Tuyệt vời: Toàn bộ nhân viên đều đã có cấu hình lương.");
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
