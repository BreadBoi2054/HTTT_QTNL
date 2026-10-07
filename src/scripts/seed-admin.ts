import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Tạo Role Admin
  const adminRole = await prisma.role.upsert({
    where: { name: "SYSTEM_ADMIN" },
    update: {},
    create: {
      name: "SYSTEM_ADMIN",
      permissions: JSON.stringify(["ALL"]),
    },
  });

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  // Tạo User Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@hrmis.com" },
    update: {},
    create: {
      email: "admin@hrmis.com",
      password: hashedPassword,
      name: "System Administrator",
      roleId: adminRole.id,
    },
  });

  console.log("Seeding completed!");
  console.log("Admin Email:", adminUser.email);
  console.log("Admin Password: Admin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
