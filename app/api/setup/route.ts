import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Mengecek apakah admin sudah ada agar tidak duplikat
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@forcoffe.com" }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin sudah ada di database!" });
    }

    // Mengenkripsi password "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Menyimpan admin ke database
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@forcoffe.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ message: "Akun Admin Pertama berhasil dibuat!", user: admin.email });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}