import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageOpen, Pencil, Plus } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeleteBahanButton } from "./_components/delete-bahan-button";

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

function AddButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/dashboard/inventori/baru"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 py-2.5 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] ${className}`}
    >
      <Plus className="h-4 w-4" strokeWidth={2} />
      Tambah Bahan
    </Link>
  );
}

function StatusBadge({ critical }: { critical: boolean }) {
  return critical ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden />
      Kritis
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
      Aman
    </span>
  );
}

export default async function InventoriPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  // Mengambil bahan beserta relasi kategorinya
  const bahan = await prisma.bahanBaku.findMany({
    include: {
      kategori: true,
    },
    orderBy: { namaBahan: "asc" },
  });

  // Karena tidak ada minimumStok, kita gunakan 10 sebagai ambang batas sementara
  const totalKritis = bahan.filter((item) => item.stokTotal <= 10).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">
            Inventori Bahan Baku
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone-500">
            {isAdmin
              ? "Pantau dan kelola master data stok bahan di For Coffe. Ketahui lebih awal mana yang perlu segera dipesan ulang."
              : "Pantau ketersediaan stok bahan baku dapur pastry For Coffe secara real-time. Untuk mutasi harian, gunakan menu Kelola Bahan."}
          </p>
        </div>
        {isAdmin && bahan.length > 0 && <AddButton className="w-full sm:w-auto" />}
      </header>

      {bahan.length === 0 ? (
        /* Empty state */
        <section className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300/80 bg-white/50 px-6 py-16 text-center backdrop-blur-sm sm:py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-700 ring-8 ring-amber-50">
            <PackageOpen className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 text-lg font-medium text-stone-800">
            Belum ada bahan di inventori
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
            {isAdmin
              ? "Daftarkan bahan pertama Anda supaya stoknya bisa mulai dipantau."
              : "Belum ada bahan baku yang terdaftar. Hubungi Administrator untuk mendaftarkan bahan baru ke sistem."}
          </p>
          {isAdmin && <AddButton className="mt-6" />}
        </section>
      ) : (
        /* Table card */
        <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/60 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 px-5 py-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-stone-600">
                <span className="font-medium text-stone-800">{bahan.length}</span>{" "}
                bahan terdaftar
              </p>
              {!isAdmin && (
                <span className="inline-flex items-center rounded-md border border-stone-200 bg-stone-100/70 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                  Mode Pantau (Hanya Baca)
                </span>
              )}
            </div>
            {totalKritis > 0 ? (
              <p className="text-xs text-rose-600 font-medium">
                {totalKritis} bahan perlu dipesan ulang
              </p>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">Semua stok aman</p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table
              className={`w-full ${
                isAdmin ? "min-w-[720px]" : "min-w-[620px]"
              } text-left text-sm`}
            >
              <thead>
                <tr className="border-b border-stone-200/70 bg-stone-50/40 text-xs font-medium text-stone-500">
                  <th scope="col" className="px-5 py-3 font-medium">
                    ID Ref
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Nama Bahan
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Kategori
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Stok Saat Ini
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Status
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {bahan.map((item) => {
                  const critical = item.stokTotal <= 10;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-amber-50/40"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-stone-500">
                        #{item.id.slice(0, 6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-stone-800">
                        {item.namaBahan}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center rounded-md border border-amber-200/70 bg-amber-50/80 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          {item.kategori?.namaKategori ?? "Umum"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right tabular-nums text-stone-700">
                        {numberFormat.format(item.stokTotal)} <span className="text-stone-400">g</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge critical={critical} />
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/dashboard/inventori/${item.id}/edit`}
                              aria-label={`Edit ${item.namaBahan}`}
                              title="Edit"
                              className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                            >
                              <Pencil className="h-4 w-4" strokeWidth={1.75} />
                            </Link>
                            <DeleteBahanButton
                              id={item.id}
                              namaBahan={item.namaBahan}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}