import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding contracts and initializing annualLeaveDays...");

  const employees = await prisma.employeeProfile.findMany({
    include: { user: true, salaryConfig: true, contracts: true },
    orderBy: { createdAt: "asc" }
  });

  console.log(`Found ${employees.length} employees.`);

  const today = new Date();

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const baseSal = emp.salaryConfig?.baseSalary || 18000000;
    const joinYear = new Date(emp.joinDate).getFullYear();
    const countStr = String(i + 1).padStart(4, "0");
    const code = `HĐLĐ-${joinYear}/NX-${countStr}`;

    // Update annual leave quota
    await prisma.employeeProfile.update({
      where: { id: emp.id },
      data: { annualLeaveDays: 12 }
    });

    // Check if contract already exists
    if (emp.contracts.length === 0) {
      let contractType = "Hợp đồng Không xác định thời hạn";
      let startDate = new Date(emp.joinDate);
      let endDate: Date | null = null;
      let status = "ACTIVE";

      if (i % 4 === 1) {
        // Expiring soon in late October / November 2026
        contractType = "Hợp đồng Xác định thời hạn 12 tháng";
        startDate = new Date("2025-10-25");
        endDate = new Date("2026-10-31");
        status = "EXPIRING_SOON";
      } else if (i % 4 === 2) {
        // Expiring in November 2026
        contractType = "Hợp đồng Xác định thời hạn 12 tháng";
        startDate = new Date("2025-11-15");
        endDate = new Date("2026-11-15");
        status = "EXPIRING_SOON";
      } else if (i % 4 === 3 && i > 30) {
        // Probation contract
        contractType = "Hợp đồng Thử việc (02 tháng)";
        startDate = new Date("2026-09-01");
        endDate = new Date("2026-10-31");
        status = "ACTIVE";
      } else {
        // Indefinite
        contractType = "Hợp đồng Không xác định thời hạn";
        startDate = new Date(emp.joinDate);
        endDate = null;
        status = "ACTIVE";
      }

      await prisma.contract.create({
        data: {
          code,
          employeeId: emp.id,
          contractType,
          startDate,
          endDate,
          salary: baseSal,
          status,
          note: `Hợp đồng lao động tiêu chuẩn theo Bộ luật Lao động 2019 số ${code}.`
        }
      });
    }
  }

  const contractCount = await prisma.contract.count();
  console.log(`Seeding complete. Total contracts in DB: ${contractCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
