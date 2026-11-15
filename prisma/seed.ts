import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@forcoffe.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@forcoffe.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Akun Admin berhasil dibuat via seed.");
  } else {
    await prisma.user.update({
      where: { email: "admin@forcoffe.com" },
      data: { name: "Admin" },
    });
    console.log("Akun Admin diperbarui menjadi 'Admin'.");
  }

  // Seed akun demo Staff
  const existingStaff = await prisma.user.findUnique({
    where: { email: "staf@forcoffe.com" },
  });

  if (!existingStaff) {
    const hashedStaffPassword = await bcrypt.hash("staf123", 10);
    await prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: "staf@forcoffe.com",
        password: hashedStaffPassword,
        role: "STAFF",
      },
    });
    console.log("Akun Staf demo berhasil dibuat via seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

