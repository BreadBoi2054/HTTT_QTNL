require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const p9 = await prisma.payroll.findMany({
    where: { month: 9, year: 2026 },
    include: { employee: { include: { user: true, salaryConfig: true } } }
  });
  console.log('Month 9 total:', p9.length);
  const zero9 = p9.filter(p => p.netSalary === 0);
  const nonzero9 = p9.filter(p => p.netSalary > 0);
  console.log('Month 9 zeros:', zero9.length, 'non-zeros:', nonzero9.length);
  for (const p of nonzero9) {
    console.log('  Non-zero in month 9:', p.employee.user.name, 'net:', p.netSalary, 'base:', p.baseSalary);
  }

  const p10 = await prisma.payroll.findMany({
    where: { month: 10, year: 2026 },
    include: { employee: { include: { user: true, salaryConfig: true } } }
  });
  console.log('\nMonth 10 total:', p10.length);
  const zero10 = p10.filter(p => p.netSalary === 0);
  const nonzero10 = p10.filter(p => p.netSalary > 0);
  console.log('Month 10 zeros:', zero10.length, 'non-zeros:', nonzero10.length);
  for (const p of zero10) {
    console.log('  Zero in month 10:', p.employee.user.name);
  }

  // Let's also check all months
  const allMonths = await prisma.payroll.groupBy({
    by: ['month', 'year'],
    _count: { id: true }
  });
  console.log('\nAll months in payroll table:', allMonths);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
