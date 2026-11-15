import prisma from "@/lib/prisma";

/**
 * Mengambil seluruh daftar kategori dari database tanpa auto-seed
 */
export async function getAllCategories() {
  return prisma.kategori.findMany({
    orderBy: { namaKategori: "asc" },
  });
}
