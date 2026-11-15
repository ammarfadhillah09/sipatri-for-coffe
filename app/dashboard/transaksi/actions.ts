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

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

/**
 * Server Action: Catat Mutasi Stok (Stok Masuk / Stok Keluar)
 * Dijalankan dalam transaksi database atomik (prisma.$transaction)
 */
export async function createMutasiStokAction(
  formData: FormData
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return { error: "Akses ditolak: Anda tidak terautentikasi. Silakan masuk terlebih dahulu." };
  }

  const bahanBakuId = formData.get("bahanBakuId")?.toString().trim();
  const tipe = formData.get("tipe")?.toString().trim();
  const jumlahInputRaw = formData.get("jumlah")?.toString().trim();
  const satuanInput = (formData.get("satuan")?.toString().trim() || "GRAM").toUpperCase();
  const keterangan = formData.get("keterangan")?.toString().trim() || null;

  if (!bahanBakuId) {
    return { error: "Silakan pilih bahan baku yang akan dimutasi." };
  }

  if (bahanBakuId.length > 100) {
    return { error: "ID bahan baku tidak valid." };
  }

  if (tipe !== "MASUK" && tipe !== "KELUAR") {
    return {
      error: "Jenis aktivitas harus berupa Stok Masuk (+) atau Stok Keluar / Pemakaian (-).",
    };
  }

  const jumlahInput = parseFloat(jumlahInputRaw || "0");
  if (!Number.isFinite(jumlahInput) || jumlahInput <= 0 || jumlahInput > 1_000_000_000) {
    return { error: "Jumlah mutasi harus berupa angka positif antara 0.01 dan 1.000.000.000." };
  }

  if (keterangan && keterangan.length > 500) {
    return { error: "Keterangan mutasi tidak boleh melebihi 500 karakter." };
  }

  // Hitung jumlah mutasi dalam satuan baku GRAM untuk audit sistem
  let multiplier = 1;
  if (satuanInput === "KG") multiplier = 1000;
  else if (satuanInput === "MG") multiplier = 0.001;
  else if (satuanInput === "GRAM") multiplier = 1;
  else {
    return { error: "Satuan bahan tidak valid. Pilih Gram atau Kilogram." };
  }

  const jumlahTerkonversi = jumlahInput * multiplier;
  if (!Number.isFinite(jumlahTerkonversi) || jumlahTerkonversi <= 0 || jumlahTerkonversi > 1_000_000_000) {
    return { error: "Hasil konversi jumlah mutasi melebihi batas sistem yang diizinkan." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data bahan terkini
      const bahan = await tx.bahanBaku.findUnique({
        where: { id: bahanBakuId },
      });

      if (!bahan) {
        throw new Error("Bahan baku yang dipilih tidak ditemukan di inventori.");
      }

      // 2. Verifikasi kecukupan stok jika aktivitas adalah Stok Keluar / Pemakaian
      if (tipe === "KELUAR") {
        if (bahan.stokTotal < jumlahTerkonversi) {
          throw new Error(
            `Stok tidak mencukupi untuk pemakaian ini. Stok ${bahan.namaBahan} saat ini adalah ${numberFormat.format(bahan.stokTotal)} g.`
          );
        }
      }

      // 3. Catat riwayat log transaksi mutasi
      await tx.logTransaksi.create({
        data: {
          userId: session.user.id,
          bahanBakuId,
          tipe: tipe as "MASUK" | "KELUAR",
          jumlahInput,
          satuanInput: satuanInput as "GRAM" | "KG" | "MG",
          jumlahTerkonversi,
          keterangan,
        },
      });

      // 4. Perbarui stokTotal pada master BahanBaku secara atomik
      const updatedBahan = await tx.bahanBaku.update({
        where: { id: bahanBakuId },
        data: {
          stokTotal:
            tipe === "MASUK"
              ? { increment: jumlahTerkonversi }
              : { decrement: jumlahTerkonversi },
        },
      });

      return {
        namaBahan: bahan.namaBahan,
        stokAkhir: updatedBahan.stokTotal,
      };
    });

    // Revalidasi seluruh halaman yang terpengaruh oleh mutasi stok
    revalidatePath("/dashboard/transaksi");
    revalidatePath("/dashboard/inventori");
    revalidatePath("/dashboard/staff");
    revalidatePath("/dashboard");

    const formattedJumlah = numberFormat.format(jumlahTerkonversi);
    const formattedStokAkhir = numberFormat.format(result.stokAkhir);

    return {
      success: true,
      message: `Mutasi ${
        tipe === "MASUK" ? "Stok Masuk (+)" : "Pemakaian (-)"
      } ${result.namaBahan} sebesar ${formattedJumlah} g berhasil dicatat. Sisa stok: ${formattedStokAkhir} g.`,
    };
  } catch (err: any) {
    console.error("Gagal mencatat mutasi stok:", err);
    return {
      error: err.message || "Gagal mencatat mutasi stok ke database.",
    };
  }
}

