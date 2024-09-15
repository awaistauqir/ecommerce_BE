import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: { name: "User" },
  });

  // Seed a user with the Admin role
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      isEmailVerified: true,
      isActive: true,
      phone: "+923161689694",
      password: await hash("awais1122", 10), // Consider hashing this in a real app
      roles: {
        connect: { id: adminRole.id },
      },
    },
  });

  // Seed categories
  const category1 = await prisma.productCategory.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics" },
  });

  const category2 = await prisma.productCategory.upsert({
    where: { name: "Books" },
    update: {},
    create: { name: "Books" },
  });

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
