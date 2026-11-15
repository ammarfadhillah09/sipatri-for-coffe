import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TransaksiManager } from "./transaksi-manager";

export const metadata = {
  title: "Kelola Bahan & Mutasi Stok | SIPATRI - For Coffe",
  description: "Pencatatan stok masuk, pemakaian produksi, dan riwayat mutasi bahan dapur pastry",
};

interface TransaksiPageProps {
  searchParams: Promise<{ tipe?: string }>;
}

export default async function TransaksiPage({
  searchParams,
}: TransaksiPageProps) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const { tipe } = await searchParams;
  const normalizedTipe =
    tipe?.toLowerCase() === "masuk"
      ? "MASUK"
      : tipe?.toLowerCase() === "keluar"
      ? "KELUAR"
      : "MASUK";

  // Mengambil daftar bahan baku terdaftar beserta stok terkini
  const bahanList = await prisma.bahanBaku.findMany({
    orderBy: { namaBahan: "asc" },
    select: {
      id: true,
      namaBahan: true,
      stokTotal: true,
      kategori: {
        select: {
          namaKategori: true,
        },
      },
    },
  });

  // Mengambil 50 riwayat mutasi stok terbaru secara kronologis
  const history = await prisma.logTransaksi.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
    select: {
      id: true,
      tipe: true,
      jumlahInput: true,
      satuanInput: true,
      jumlahTerkonversi: true,
      keterangan: true,
      timestamp: true,
      bahanBaku: {
        select: {
          id: true,
          namaBahan: true,
          kategori: {
            select: {
              namaKategori: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 min-w-0 w-full pt-1 sm:pt-0">
      {/* Back navigation */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white/80 px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-600 shadow-2xs hover:bg-amber-50 hover:text-amber-900 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          <ArrowLeft className="h-4 w-4 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-amber-700 transition-all" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-start gap-4 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-800 border border-amber-200/80 shadow-2xs">
          <ArrowLeftRight className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">
            Kelola Bahan &amp; Mutasi Stok
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-stone-500 max-w-xl">
            Catat penerimaan stok baru dari pemasok atau pemakaian bahan untuk
            produksi dapur pastry For Coffe secara real-time.
          </p>
        </div>
      </header>

      {/* Main Transaksi / Mutasi Hub */}
      <TransaksiManager
        bahanList={bahanList}
        history={history}
        initialTipe={normalizedTipe}
      />
    </div>
  );
}

