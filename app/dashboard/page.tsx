import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpFromLine,
  ChefHat,
  ChevronRight,
  Clock,
  Package,
  PackagePlus,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getDashboardData() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalItem, stokKritis, transaksiHariIni, recentMutasi] = await Promise.all([
    prisma.bahanBaku.count().catch(() => 0),
    prisma.bahanBaku
      .count({
        where: {
          stokTotal: { lte: 10 },
        },
      })
      .catch(() => 0),
    prisma.logTransaksi
      .count({
        where: {
          timestamp: {
            gte: todayStart,
          },
        },
      })
      .catch(() => 0),
    prisma.logTransaksi
      .findMany({
        take: 5,
        orderBy: { timestamp: "desc" },
        select: {
          id: true,
          tipe: true,
          jumlahTerkonversi: true,
          timestamp: true,
          keterangan: true,
          bahanBaku: { select: { namaBahan: true } },
          user: { select: { name: true } },
        },
      })
      .catch(() => []),
  ]);

  return {
    totalItem,
    stokKritis,
    transaksiHariIni,
    recentMutasi,
  };
}

function formatRole(role?: string | null) {
  if (!role) return "Staf";
  const lower = role.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

type Metric = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  iconWrap: string;
};

const quickActions = [
  {
    href: "/dashboard/transaksi?tipe=masuk",
    title: "Catat stok masuk",
    description: "Tambahkan bahan yang baru diterima dari pemasok.",
    icon: ArrowDownToLine,
  },
  {
    href: "/dashboard/transaksi?tipe=keluar",
    title: "Catat pemakaian",
    description: "Kurangi stok setelah bahan dipakai atau terbuang.",
    icon: ArrowUpFromLine,
  },
  {
    href: "/dashboard/inventori/baru",
    title: "Tambah bahan baru",
    description: "Daftarkan bahan yang belum ada di inventori.",
    icon: PackagePlus,
  },
  {
    href: "/dashboard/inventori?filter=kritis",
    title: "Periksa stok kritis",
    description: "Lihat bahan yang perlu segera dipesan ulang.",
    icon: AlertTriangle,
  },
];

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const name = session.user?.name ?? "Pengguna";
  const isAdmin = session.user?.role === "ADMIN";
  const { totalItem, stokKritis, transaksiHariIni, recentMutasi } =
    await getDashboardData();

  const availableQuickActions = quickActions.filter((action) => {
    if (!isAdmin && action.href === "/dashboard/inventori/baru") {
      return false;
    }
    return true;
  });

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const metrics: Metric[] = [
    {
      label: "Total Item",
      value: totalItem,
      hint: "Jenis bahan terdaftar",
      icon: Package,
      iconWrap: "bg-amber-100/70 text-amber-700",
    },
    {
      label: "Stok Kritis",
      value: stokKritis,
      hint:
        stokKritis > 0
          ? "Perlu segera dipesan ulang"
          : "Semua stok masih aman",
      icon: AlertTriangle,
      iconWrap:
        stokKritis > 0
          ? "bg-rose-100/70 text-rose-600"
          : "bg-stone-100 text-stone-500",
    },
    {
      label: "Aktivitas Stok Hari Ini",
      value: transaksiHariIni,
      hint: "Catatan stok masuk & pemakaian",
      icon: ArrowLeftRight,
      iconWrap: "bg-emerald-100/70 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">
            {isAdmin ? `Selamat datang, ${name}` : `Selamat bertugas, ${name}`}
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            {today} &bull;{" "}
            {isAdmin
              ? "Portal Manajemen SIPATRI"
              : "Panel Operasional Dapur Pastry"}
          </p>
        </div>

        {isAdmin ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/90 px-3 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-700" strokeWidth={2} />
            Administrator
          </span>
        ) : (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-2xs">
            <ChefHat className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
            Staf Dapur
          </span>
        )}
      </header>

      {/* Warning banner jika stok kritis */}
      {stokKritis > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-4 text-xs sm:text-sm text-rose-800 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">
                Perhatian: {stokKritis} bahan baku berstatus Stok Kritis (&le; 10 g)
              </p>
              <p className="mt-0.5 text-xs text-rose-700">
                {isAdmin
                  ? "Segera rencanakan pengadaan ulang atau hubungi pemasok bahan."
                  : "Perhatikan kuantiti pemakaian saat produksi, atau catat stok masuk jika bahan telah tiba."}
              </p>
            </div>
          </div>
          <Link
            href={isAdmin ? "/dashboard/inventori" : "/dashboard/transaksi?tipe=masuk"}
            className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200 shadow-2xs hover:bg-rose-50 transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>{isAdmin ? "Lihat Inventori" : "Catat Stok Masuk"}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics */}
      <section aria-labelledby="ringkasan" className="space-y-4">
        <h2 id="ringkasan" className="text-base font-medium text-stone-700">
          Ringkasan hari ini
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map(({ label, value, hint, icon: Icon, iconWrap }) => (
            <article
              key={label}
              className="rounded-2xl border border-stone-200/70 bg-white/60 p-5 backdrop-blur-sm shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-stone-500">{label}</p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconWrap}`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-stone-800">
                {value.toLocaleString("id-ID")}
              </p>
              <p className="mt-1 text-xs text-stone-400">{hint}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="aksi-cepat" className="space-y-4">
        <h2 id="aksi-cepat" className="text-base font-medium text-stone-700">
          Aksi cepat operasional
        </h2>

        <div
          className={`grid gap-3 ${
            isAdmin ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {availableQuickActions.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-stone-200/70 bg-[#FFFAF0]/70 p-4 transition-colors hover:border-amber-200 hover:bg-amber-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 shadow-2xs"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 ring-1 ring-stone-200/70 transition-colors group-hover:ring-amber-200 shadow-2xs">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-800">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                  {description}
                </p>
              </div>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600"
                strokeWidth={1.75}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Kitchen Activity Feed */}
      <section aria-labelledby="riwayat-terkini" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="riwayat-terkini" className="text-base font-medium text-stone-700">
            Aktivitas Stok Dapur Terkini
          </h2>
          <Link
            href="/dashboard/transaksi"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors group"
          >
            <span>Buka Kelola Bahan</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentMutasi.length === 0 ? (
          <div className="rounded-2xl border border-stone-200/70 bg-white/60 p-6 text-center text-xs text-stone-400 backdrop-blur-sm shadow-2xs">
            Belum ada aktivitas mutasi stok yang dicatat hari ini.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/60 backdrop-blur-sm shadow-xs divide-y divide-stone-100">
            {recentMutasi.map((item) => {
              const date = new Date(item.timestamp);
              const formattedDate = new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
              }).format(date);

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 sm:px-5 text-xs transition-colors hover:bg-amber-50/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        item.tipe === "MASUK"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {item.tipe === "MASUK" ? (
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 truncate">
                        {item.bahanBaku.namaBahan}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">
                        Oleh: {item.user.name} {item.keterangan ? `• "${item.keterangan}"` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span
                      className={`font-semibold tabular-nums ${
                        item.tipe === "MASUK"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {item.tipe === "MASUK" ? "+" : "-"}
                      {new Intl.NumberFormat("id-ID").format(item.jumlahTerkonversi)} g
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-stone-400">
                      <Clock className="h-3 w-3" />
                      {formattedDate} WIB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
} 