"use client";

import Link from "next/link";
import { ArrowLeft, Printer, FileDown } from "lucide-react";

export function PrintActions() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="print:hidden mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/90 backdrop-blur p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-700 shadow-2xs hover:bg-amber-50 hover:text-amber-950 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          <ArrowLeft className="h-4 w-4 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-amber-700 transition-all" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Format Siap Cetak (A4 Portrait)</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm px-5 py-2.5 shadow-2xs border border-amber-300/80 transition-all hover:shadow cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
          title="Buka dialog cetak atau Simpan sebagai PDF"
        >
          <Printer className="h-4 w-4 text-amber-900" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>
    </div>
  );
}
