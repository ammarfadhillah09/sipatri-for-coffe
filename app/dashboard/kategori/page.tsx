import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Tags } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { KategoriManager } from "./kategori-manager";

export const metadata = {
  title: "Kelola Kategori Bahan | SIPATRI - For Coffe",
  description: "Daftar dan pengelolaan kategori bahan baku dapur pastry",
};

export default async function KategoriPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  // Proteksi RBAC: Hanya ADMIN yang diizinkan mengelola kategori bahan
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Mengambil seluruh kategori beserta jumlah bahan baku yang menggunakannya
  const categories = await prisma.kategori.findMany({
    orderBy: { namaKategori: "asc" },
    include: {
      _count: {
        select: { bahanBaku: true },
      },
    },
  });

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Back navigation */}
      <div>
        <Link
          href="/dashboard/inventori"
          className="inline-flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium text-stone-500 hover:text-amber-900 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          <ArrowLeft className="h-4 w-4 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-amber-700 transition-all" />
          <span>Kembali ke Inventori</span>
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-start gap-4 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-800 border border-amber-200/80 shadow-2xs">
          <Tags className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">
            Kategori Bahan Baku
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-stone-500 max-w-xl">
            Kelola kelompok bahan baku untuk memudahkan pencatatan, pemantauan stok,
            dan peracikan resep dapur pastry For Coffe.
          </p>
        </div>
      </header>

      {/* Main Category Management Hub */}
      <KategoriManager categories={categories} />
    </div>
  );
}
