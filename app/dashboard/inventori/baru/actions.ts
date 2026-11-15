"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createBahanBakuAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { error: "Akses ditolak: Hanya Administrator yang diizinkan." };
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

  const kategoriExists = await prisma.kategori.findUnique({
    where: { id: kategoriId },
  });

  if (!kategoriExists) {
    return { error: "Kategori bahan yang dipilih tidak ditemukan." };
  }

  try {
    await prisma.bahanBaku.create({
      data: {
        namaBahan,
        stokTotal,
        kategoriId,
      },
    });
  } catch (err) {
    console.error("Error creating bahan baku:", err);
    return { error: "Gagal menyimpan bahan baku ke database." };
  }

  revalidatePath("/dashboard/inventori");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventori");
}
