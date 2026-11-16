import Image from "next/image";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrintActions } from "./print-actions";

export const metadata = {
  title: "Laporan Resmi Mutasi Stok | SIPATRI - For Coffe",
  description: "Dokumen resmi riwayat mutasi stok bahan baku dapur pastry For Coffe",
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDateTimeIndonesian(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function formatDateIndonesian(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

export default async function LaporanPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  // 1. Ambil data mutasi stok lengkap dari Prisma
  const mutasiList = await prisma.logTransaksi.findMany({
    orderBy: { timestamp: "desc" },
    include: {
      bahanBaku: {
        select: {
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
          name: true,
          role: true,
        },
      },
    },
  });

  // 2. Ambil data Administrator untuk kolom tanda tangan resmi
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { name: true },
  });

  const todayFormatted = formatDateIndonesian(new Date());

  return (
    <div className="w-full min-w-0 pb-12 print:p-0 print:m-0 print:pb-0">
      {/* Action Bar (Hanya tampil di layar, disembunyikan saat dicetak) */}
      <PrintActions />

      {/* Kontainer Kertas Resmi A4 */}
      <div className="mx-auto max-w-4xl bg-white text-black p-8 sm:p-12 shadow-md border border-stone-200/80 rounded-2xl print:rounded-none print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full print:m-0">
        
        {/* Kop Surat Resmi */}
        <div className="relative flex items-center justify-between pb-3">
          {/* Logo For Coffe di sebelah kiri */}
          <div className="shrink-0 flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="Logo For Coffe"
              width={82}
              height={82}
              priority
              className="h-20 w-20 rounded-full object-cover border border-stone-800 shadow-2xs"
            />
          </div>

          {/* Teks Instansi di tengah */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
              FOR COFFE &bull; DIVISI PASTRY
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-stone-800 uppercase mt-0.5">
              Sistem Informasi Presisi &amp; Manajemen Inventori (SIPATRI)
            </p>
            <p className="text-[11px] sm:text-xs text-stone-600 mt-1 leading-relaxed">
              Unit Operasional Dapur Pastry &amp; Bakery Utama &bull; For Coffe Indonesia
              <br />
              Jl. Gandasoli Ragawacana, Gandasoli, Kec. Kramatmulya, Kabupaten Kuningan, Jawa Barat 45553 &bull; Surel: manajemen@forcoffe.com
            </p>
            <h2 className="mt-2.5 text-sm sm:text-base font-extrabold uppercase tracking-wide text-black underline underline-offset-4">
              LAPORAN RIWAYAT MUTASI STOK
            </h2>
          </div>

          {/* Spacer penyeimbang logo di sisi kanan */}
          <div className="w-20 shrink-0 hidden sm:block" aria-hidden="true" />
        </div>

        {/* Garis Pemisah Hitam Tebal Khas Surat Resmi */}
        <div className="border-b-[3px] border-black mt-1" />
        <div className="border-b border-black mt-[2px] mb-5" />

        {/* Meta-Informasi Dokumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-black mb-6 border-b border-stone-200 pb-4 print:border-black">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-700 w-28 shrink-0">Tanggal Cetak:</span>
              <span className="font-semibold text-black">{todayFormatted}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-700 w-28 shrink-0">Dicetak Oleh:</span>
              <span className="font-semibold text-black">
                {session.user?.name ?? "Petugas"} (
                {session.user?.role === "ADMIN" ? "Administrator" : "Staf Dapur"})
              </span>
            </div>
          </div>
          <div className="space-y-1.5 sm:text-right">
            <div className="flex sm:justify-end items-center gap-2">
              <span className="font-bold text-stone-700">Total Aktivitas:</span>
              <span className="font-semibold text-black">{mutasiList.length} mutasi tercatat</span>
            </div>
            <div className="flex sm:justify-end items-center gap-2">
              <span className="font-bold text-stone-700">Status Dokumen:</span>
              <span className="font-semibold text-emerald-800 print:text-black">RESMI / VALID</span>
            </div>
          </div>
        </div>

        {/* Tabel Data Mutasi Stok */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-xs text-black">
            <thead>
              <tr className="bg-stone-100 print:bg-stone-100">
                <th className="border border-black px-2.5 py-2 text-center font-bold w-10">No</th>
                <th className="border border-black px-3 py-2 text-left font-bold">Nama Bahan Baku</th>
                <th className="border border-black px-3 py-2 text-center font-bold w-36">Jenis Mutasi</th>
                <th className="border border-black px-3 py-2 text-right font-bold w-28">Jumlah</th>
                <th className="border border-black px-3 py-2 text-left font-bold w-40">Dilakukan Oleh</th>
                <th className="border border-black px-3 py-2 text-center font-bold w-44">Tanggal &amp; Waktu</th>
              </tr>
            </thead>
            <tbody>
              {mutasiList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-black px-4 py-8 text-center text-stone-500 italic">
                    Belum ada riwayat mutasi stok bahan baku yang tercatat di dalam sistem.
                  </td>
                </tr>
              ) : (
                mutasiList.map((item, index) => {
                  const isMasuk = item.tipe === "MASUK";
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 print:hover:bg-transparent">
                      <td className="border border-black px-2.5 py-2 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="border border-black px-3 py-2">
                        <span className="font-semibold text-black">{item.bahanBaku.namaBahan}</span>
                        {item.keterangan ? (
                          <span className="block text-[11px] text-stone-600 italic mt-0.5">
                            Ket: {item.keterangan}
                          </span>
                        ) : null}
                      </td>
                      <td className="border border-black px-3 py-2 text-center">
                        <span className="font-semibold">
                          {isMasuk ? "Penambahan Stok" : "Pengurangan Stok"}
                        </span>
                      </td>
                      <td className="border border-black px-3 py-2 text-right font-mono font-medium">
                        {isMasuk ? "+" : "-"}{numberFormat.format(item.jumlahInput)} {item.satuanInput}
                      </td>
                      <td className="border border-black px-3 py-2">
                        <span className="font-semibold text-black">{item.user?.name ?? "-"}</span>
                        <span className="block text-[10px] text-stone-600">
                          {item.user?.role === "ADMIN" ? "Administrator" : "Staf Dapur"}
                        </span>
                      </td>
                      <td className="border border-black px-3 py-2 text-center font-mono text-[11px]">
                        {formatDateTimeIndonesian(item.timestamp)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Kolom Tanda Tangan Administrator */}
        <div className="mt-14 flex justify-end text-xs sm:text-sm break-inside-avoid print:mt-12">
          <div className="w-64 text-center">
            <p className="text-stone-700">
              Jakarta, {todayFormatted}
            </p>
            <p className="mt-1.5 font-bold text-black">Mengetahui,</p>
            <p className="font-medium text-stone-800">Administrator</p>
            
            {/* Ruang Tanda Tangan Resmi */}
            <div className="my-16 mx-auto w-44 border-b border-black" />
            
            <p className="font-bold text-black uppercase underline underline-offset-2">
              ( {adminUser?.name || "Administrator"} )
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Divisi Pastry &bull; For Coffe Indonesia
            </p>
          </div>
        </div>

      </div>

      {/* Konfigurasi CSS Cetak Standar A4 Portrait */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
