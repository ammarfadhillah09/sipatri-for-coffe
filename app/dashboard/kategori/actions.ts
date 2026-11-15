"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type ActionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Tambah Kategori Baru
 */
export async function createKategoriAction(
  formData: FormData
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya Administrator yang diizinkan." };
  }

  const namaKategori = formData.get("namaKategori")?.toString().trim();
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!namaKategori) {
    return { error: "Nama kategori tidak boleh kosong." };
  }

  if (namaKategori.length > 50) {
    return { error: "Nama kategori tidak boleh melebihi 50 karakter." };
  }

  if (deskripsi && deskripsi.length > 500) {
    return { error: "Deskripsi kategori tidak boleh melebihi 500 karakter." };
  }

  const existing = await prisma.kategori.findUnique({
    where: { namaKategori },
  });

  if (existing) {
    return { error: `Kategori "${namaKategori}" sudah ada.` };
  }

  try {
    await prisma.kategori.create({
      data: {
        namaKategori,
        deskripsi,
      },
    });

    revalidatePath("/dashboard/kategori");
    revalidatePath("/dashboard/inventori/baru");
    revalidatePath("/dashboard/inventori");

    return {
      success: true,
      message: `Kategori "${namaKategori}" berhasil ditambahkan.`,
    };
  } catch (err) {
    console.error("Error creating kategori:", err);
    return { error: "Gagal menyimpan kategori ke database." };
  }
}

/**
 * Update Kategori (Nama & Deskripsi)
 */
export async function updateKategoriAction(
  id: string,
  namaKategori: string,
  deskripsi?: string | null
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya Administrator yang diizinkan." };
  }

  const cleanId = id?.trim();
  if (!cleanId) {
    return { error: "ID kategori tidak valid." };
  }

  const trimmedName = namaKategori?.trim();
  if (!trimmedName) {
    return { error: "Nama kategori tidak boleh kosong." };
  }

  if (trimmedName.length > 50) {
    return { error: "Nama kategori tidak boleh melebihi 50 karakter." };
  }

  const trimmedDesc = deskripsi ? deskripsi.trim() : null;
  if (trimmedDesc && trimmedDesc.length > 500) {
    return { error: "Deskripsi kategori tidak boleh melebihi 500 karakter." };
  }

  // Cek apakah nama kategori sudah digunakan oleh kategori lain
  const existing = await prisma.kategori.findFirst({
    where: {
      namaKategori: trimmedName,
      NOT: { id: cleanId },
    },
  });

  if (existing) {
    return { error: `Nama kategori "${trimmedName}" sudah digunakan.` };
  }

  try {
    await prisma.kategori.update({
      where: { id: cleanId },
      data: {
        namaKategori: trimmedName,
        deskripsi: trimmedDesc,
      },
    });

    revalidatePath("/dashboard/kategori");
    revalidatePath("/dashboard/inventori/baru");
    revalidatePath("/dashboard/inventori");

    return { success: true, message: "Kategori berhasil diperbarui." };
  } catch (err) {
    console.error("Error updating kategori:", err);
    return { error: "Gagal memperbarui kategori di database." };
  }
}

/**
 * Hapus Kategori dengan Pengecekan Relasi Bahan Baku
 */
export async function deleteKategoriAction(id: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya Administrator yang diizinkan." };
  }

  const cleanId = id?.trim();
  if (!cleanId) {
    return { error: "ID kategori tidak valid." };
  }

  // Pengecekan krusial: pastikan kategori tidak sedang dipakai bahan baku
  const kategori = await prisma.kategori.findUnique({
    where: { id: cleanId },
    include: {
      _count: {
        select: { bahanBaku: true },
      },
    },
  });

  if (!kategori) {
    return { error: "Kategori tidak ditemukan." };
  }

  if (kategori._count.bahanBaku > 0) {
    return {
      error: `Kategori "${kategori.namaKategori}" tidak bisa dihapus karena masih digunakan oleh ${kategori._count.bahanBaku} bahan baku di inventori.`,
    };
  }

  try {
    await prisma.kategori.delete({
      where: { id: cleanId },
    });

    revalidatePath("/dashboard/kategori");
    revalidatePath("/dashboard/inventori/baru");
    revalidatePath("/dashboard/inventori");

    return {
      success: true,
      message: `Kategori "${kategori.namaKategori}" berhasil dihapus.`,
    };
  } catch (err) {
    console.error("Error deleting kategori:", err);
    return { error: "Gagal menghapus kategori dari database." };
  }
}

