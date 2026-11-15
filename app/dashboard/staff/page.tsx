import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StaffManager } from "./staff-manager";

export const metadata = {
  title: "Kelola Staff & Pengguna | SIPATRI - For Coffe",
  description: "Manajemen akun staf dapur dan hak akses administrator SIPATRI",
};

export default async function StaffPage() {
  const session = await getAuthSession();

  // 1. Proteksi Autentikasi: Pengguna harus login
  if (!session || !session.user) {
    redirect("/login");
  }

  // 2. Proteksi Otorisasi Ketat: Hanya peran ADMIN yang diizinkan mengakses halaman ini
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Mengambil seluruh akun pengguna beserta jumlah transaksi yang tercatat
  const users = await prisma.user.findMany({
    orderBy: [
      { role: "asc" }, // ADMIN terlebih dahulu, kemudian STAFF
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          logTransaksi: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Back navigation */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium text-stone-500 hover:text-amber-900 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          <ArrowLeft className="h-4 w-4 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-amber-700 transition-all" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-start gap-4 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-800 border border-amber-200/80 shadow-2xs">
          <Users className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">
            Kelola Staff &amp; Pengguna
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-stone-500 max-w-xl">
            Kelola hak akses administrator, daftarkan staf baru, dan pantau akun
            pengguna dapur pastry For Coffe.
          </p>
        </div>
      </header>

      {/* Main Staff Management Hub */}
      <StaffManager users={users} currentUserId={session.user.id} />
    </div>
  );
}

