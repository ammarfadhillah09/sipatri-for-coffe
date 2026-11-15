"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type ActionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Validasi otentikasi dan hak akses Administrator
 */
async function verifyAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { authorized: false, error: "Akses ditolak. Silakan masuk terlebih dahulu." };
  }
  if (session.user.role !== "ADMIN") {
    return {
      authorized: false,
      error: "Akses ditolak: Hanya Administrator yang diizinkan.",
    };
  }
  return { authorized: true, session };
}

/**
 * Server Action: Daftarkan Staf atau Admin Baru
 */
export async function createStaffAction(
  formData: FormData
): Promise<ActionResponse> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();

  // Validasi input wajib & batas panjang string
  if (!name || name.length < 2 || name.length > 100) {
    return { error: "Nama lengkap wajib diisi antara 2 hingga 100 karakter." };
  }

  if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format alamat email tidak valid (maksimal 100 karakter)." };
  }

  if (!password || password.length < 6 || password.length > 128) {
    return { error: "Kata sandi wajib diisi antara 6 hingga 128 karakter." };
  }

  if (role !== "ADMIN" && role !== "STAFF") {
    return { error: "Peran (role) pengguna tidak valid. Pilih Staf atau Admin." };
  }

  // Cek duplikasi email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: `Alamat email "${email}" sudah digunakan oleh akun lain.` };
  }

  try {
    // Hash password menggunakan bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as "ADMIN" | "STAFF",
      },
    });

    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `Akun ${role === "ADMIN" ? "Administrator" : "Staf"} "${name}" berhasil didaftarkan.`,
    };
  } catch (err) {
    console.error("Error creating staff account:", err);
    return { error: "Gagal menyimpan akun pengguna ke database." };
  }
}

/**
 * Server Action: Perbarui Akun Staf / Admin
 */
export async function updateStaffAction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  const cleanId = id?.trim();
  if (!cleanId) {
    return { error: "ID pengguna tidak valid." };
  }

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const role = formData.get("role")?.toString();
  const newPassword = formData.get("newPassword")?.toString()?.trim();

  if (!name || name.length < 2 || name.length > 100) {
    return { error: "Nama lengkap wajib diisi antara 2 hingga 100 karakter." };
  }

  if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format alamat email tidak valid (maksimal 100 karakter)." };
  }

  if (role !== "ADMIN" && role !== "STAFF") {
    return { error: "Peran (role) pengguna tidak valid. Pilih Staf atau Admin." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: cleanId },
  });

  if (!existingUser) {
    return { error: "Akun pengguna tidak ditemukan." };
  }

  // Cek apakah email diubah dan sudah terpakai
  if (email !== existingUser.email) {
    const emailInUse = await prisma.user.findUnique({
      where: { email },
    });
    if (emailInUse) {
      return { error: `Alamat email "${email}" sudah digunakan oleh akun lain.` };
    }
  }

  // Lindungi agar admin terakhir tidak diturunkan jabatannya ke STAFF
  if (existingUser.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return {
        error: "Tidak dapat mengubah peran Administrator terakhir menjadi Staf.",
      };
    }
  }

  try {
    const updateData: {
      name: string;
      email: string;
      role: "ADMIN" | "STAFF";
      password?: string;
    } = {
      name,
      email,
      role: role as "ADMIN" | "STAFF",
    };

    // Re-hash password hanya jika password baru diisi
    if (newPassword && newPassword.length > 0) {
      if (newPassword.length < 6 || newPassword.length > 128) {
        return { error: "Kata sandi baru minimal 6 dan maksimal 128 karakter." };
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: cleanId },
      data: updateData,
    });

    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `Data akun "${name}" berhasil diperbarui.`,
    };
  } catch (err) {
    console.error("Error updating staff account:", err);
    return { error: "Gagal memperbarui akun pengguna di database." };
  }
}

/**
 * Server Action: Hapus Akun Staf / Admin dengan Pengecekan Relasi Keamanan
 */
export async function deleteStaffAction(id: string): Promise<ActionResponse> {
  const auth = await verifyAdminSession();
  if (!auth.authorized || !auth.session) {
    return { error: auth.error };
  }

  const cleanId = id?.trim();
  if (!cleanId) {
    return { error: "ID pengguna tidak valid." };
  }

  // 1. Cegah Admin menghapus akunnya sendiri
  if (cleanId === auth.session.user.id) {
    return {
      error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.",
    };
  }

  // Cari data pengguna beserta relasi audit transaksi
  const targetUser = await prisma.user.findUnique({
    where: { id: cleanId },
    include: {
      _count: {
        select: {
          logTransaksi: true,
        },
      },
    },
  });

  if (!targetUser) {
    return { error: "Akun pengguna tidak ditemukan." };
  }

  // 2. Cegah penghapusan jika pengguna memiliki riwayat transaksi (Restrict)
  if (targetUser._count.logTransaksi > 0) {
    return {
      error: `Pengguna "${targetUser.name}" tidak dapat dihapus karena memiliki riwayat ${targetUser._count.logTransaksi} transaksi bahan baku. Akun ini diperlukan untuk integritas jejak audit (audit trail).`,
    };
  }

  // 3. Cegah penghapusan jika merupakan Administrator terakhir
  if (targetUser.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return {
        error: "Tidak dapat menghapus Administrator terakhir dalam sistem.",
      };
    }
  }

  try {
    await prisma.user.delete({
      where: { id: cleanId },
    });

    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `Akun "${targetUser.name}" berhasil dihapus dari sistem.`,
    };
  } catch (err) {
    console.error("Error deleting staff account:", err);
    return { error: "Gagal menghapus akun pengguna dari database." };
  }
}

