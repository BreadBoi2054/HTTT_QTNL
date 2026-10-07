require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== KIỂM THỬ DỮ LIỆU & LOGIC HỆ THỐNG ===");
  
  // 1. Kiểm tra Người dùng & Vai trò
  const users = await prisma.user.findMany({
    include: { role: true, employee: { include: { department: true } } }
  });
  console.log(`\n1. Tổng số tài khoản: ${users.length}`);
  users.forEach(u => {
    console.log(`  - [${u.role ? u.role.name : 'NO_ROLE'}] ${u.email} (${u.name}) - Phòng: ${u.employee?.department?.name || 'N/A'}`);
  });

  // 2. Kiểm tra Bảng lương
  const payrolls = await prisma.payroll.findMany({
    include: { employee: { include: { user: true, department: true } } }
  });
  console.log(`\n2. Tổng số phiếu lương hiện có: ${payrolls.length}`);
  payrolls.slice(0, 5).forEach(p => {
    console.log(`  - Kỳ ${p.month}/${p.year}: ${p.employee?.user?.name} | Lương cơ bản: ${p.baseSalary.toLocaleString()} | Thực lĩnh: ${p.netSalary.toLocaleString()} | Trạng thái: ${p.status}`);
  });

  // 3. Kiểm tra Điểm danh
  const attendances = await prisma.attendance.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: { employee: { include: { user: true } } }
  });
  console.log(`\n3. Dữ liệu điểm danh mẫu (${attendances.length} dòng gần nhất):`);
  attendances.forEach(a => {
    console.log(`  - Ngày ${a.date.toISOString().slice(0,10)}: ${a.employee?.user?.name} | Vào: ${a.checkIn ? a.checkIn.toLocaleTimeString() : 'N/A'} | Ra: ${a.checkOut ? a.checkOut.toLocaleTimeString() : 'N/A'} | Trạng thái: ${a.status}`);
  });

  // 4. Kiểm tra Hợp đồng
  const contracts = await prisma.laborContract.findMany({
    take: 5,
    include: { employee: { include: { user: true } } }
  });
  console.log(`\n4. Hợp đồng lao động mẫu: ${contracts.length} hợp đồng`);
  contracts.forEach(c => {
    console.log(`  - Số: ${c.code} | Nhân viên: ${c.employee?.user?.name} | Lương: ${c.salary.toLocaleString()} | Loại: ${c.type}`);
  });

  // 5. Kiểm tra Biến động nhân sự & Quy hoạch cán bộ
  const changes = await prisma.personnelChange.count();
  const plans = await prisma.successionPlan.count();
  const surveys = await prisma.survey.count();
  const courses = await prisma.trainingCourse.count();
  console.log(`\n5. Thống kê các phân hệ khác:`);
  console.log(`  - Quyết định biến động nhân sự: ${changes}`);
  console.log(`  - Quy hoạch cán bộ nguồn: ${plans}`);
  console.log(`  - Khóa đào tạo: ${courses}`);
  console.log(`  - Khảo sát nội bộ: ${surveys}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
