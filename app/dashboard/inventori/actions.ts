"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type ActionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

/**
 * Server Action untuk memperbarui informasi Bahan Baku
 */
export async function updateBahanBakuAction(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya Administrator yang diizinkan." };
  }

  const cleanId = id?.trim();
  if (!cleanId) {
    return { error: "ID bahan baku tidak valid." };
  }

  const namaBahan = formData.get("namaBahan")?.toString().trim();
  const stokTotalRaw = formData.get("stokTotal")?.toString().trim();
  const kategoriId = formData.get("kategoriId")?.toString().trim();

  if (!namaBahan) {
    return { error: "Nama bahan baku wajib diisi." };
  }

  if (namaBahan.length > 100) {
    return { error: "Nama bahan baku tidak boleh melebihi 100 karakter." };
  }

  if (!kategoriId || kategoriId.length > 100) {
    return { error: "Silakan pilih kategori bahan yang valid." };
  }

  const stokTotal = parseFloat(stokTotalRaw || "0");
  if (!Number.isFinite(stokTotal) || stokTotal < 0 || stokTotal > 1_000_000_000) {
    return { error: "Jumlah stok total harus berupa angka valid antara 0 dan 1.000.000.000." };
  }

  // Pastikan bahan baku yang akan diedit ada di database
  const existing = await prisma.bahanBaku.findUnique({
    where: { id: cleanId },
  });

  if (!existing) {
    return { error: "Bahan baku tidak ditemukan." };
  }

  // Pastikan kategori yang dipilih valid
  const categoryExists = await prisma.kategori.findUnique({
    where: { id: kategoriId },
  });

  if (!categoryExists) {
    return { error: "Kategori yang dipilih tidak valid." };
  }

  try {
    await prisma.bahanBaku.update({
      where: { id: cleanId },
      data: {
        namaBahan,
        stokTotal,
        kategoriId,
      },
    });
  } catch (err) {
    console.error("Error updating bahan baku:", err);
    return { error: "Gagal memperbarui bahan baku di database." };
  }

  revalidatePath("/dashboard/inventori");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventori");
}

/**
 * Server Action untuk menghapus Bahan Baku dengan pemeriksaan relasi keamanan
 */
export async function deleteBahanBakuAction(
  id: string
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya Administrator yang diizinkan." };
  }

  const cleanId = id?.trim();
  if (!cleanId) {
    return { error: "ID bahan baku tidak valid." };
  }

  // Safety check: Periksa relasi logTransaksi dan jadwalPenerimaan
  const bahan = await prisma.bahanBaku.findUnique({
    where: { id: cleanId },
    include: {
      _count: {
        select: {
          logTransaksi: true,
          jadwalPenerimaan: true,
        },
      },
    },
  });

  if (!bahan) {
    return { error: "Bahan baku tidak ditemukan." };
  }

  if (bahan._count.logTransaksi > 0 || bahan._count.jadwalPenerimaan > 0) {
    return {
      error:
        "Bahan tidak dapat dihapus karena sudah memiliki riwayat transaksi atau penerimaan.",
    };
  }

  try {
    await prisma.bahanBaku.delete({
      where: { id: cleanId },
    });

    revalidatePath("/dashboard/inventori");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Bahan "${bahan.namaBahan}" berhasil dihapus.`,
    };
  } catch (err) {
    console.error("Error deleting bahan baku:", err);
    return { error: "Gagal menghapus bahan baku dari database." };
  }
}

