"use client";

import { useState, useTransition, useId } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  History,
  Info,
  Loader2,
  Package,
  Plus,
  Minus,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { createMutasiStokAction } from "./actions";
import { CustomSelect, type CustomSelectOption } from "../_components/custom-select";

export interface BahanItem {
  id: string;
  namaBahan: string;
  stokTotal: number;
  kategori?: {
    namaKategori: string;
  } | null;
}

export interface LogTransaksiItem {
  id: string;
  tipe: "MASUK" | "KELUAR";
  jumlahInput: number;
  satuanInput: "GRAM" | "KG" | "MG";
  jumlahTerkonversi: number;
  keterangan: string | null;
  timestamp: Date | string;
  bahanBaku: {
    id: string;
    namaBahan: string;
    kategori?: {
      namaKategori: string;
    } | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TransaksiManagerProps {
  bahanList: BahanItem[];
  history: LogTransaksiItem[];
  initialTipe?: "MASUK" | "KELUAR";
}

const numberFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

export function TransaksiManager({
  bahanList,
  history,
  initialTipe = "MASUK",
}: TransaksiManagerProps) {
  const [isPending, startTransition] = useTransition();

  // State Form
  const [tipe, setTipe] = useState<"MASUK" | "KELUAR">(initialTipe);
  const [selectedBahanId, setSelectedBahanId] = useState<string>(
    bahanList[0]?.id || ""
  );
  const [jumlah, setJumlah] = useState<string>("");
  const [satuan, setSatuan] = useState<"GRAM" | "KG">("GRAM");
  const [keterangan, setKeterangan] = useState<string>("");

  // Opsi dropdown untuk CustomSelect
  const bahanOptions: CustomSelectOption[] = bahanList.map((item) => ({
    value: item.id,
    label: item.namaBahan,
    badge: `Stok: ${numberFormat.format(item.stokTotal)} g`,
    badgeColor: item.stokTotal <= 10 ? "rose" : "amber",
    sublabel: item.kategori?.namaKategori
      ? `Kategori: ${item.kategori.namaKategori}`
      : undefined,
  }));

  const satuanOptions: CustomSelectOption[] = [
    { value: "GRAM", label: "Gram (g)" },
    { value: "KG", label: "Kg (Kilogram)" },
  ];

  // Feedback Alert State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedBahan = bahanList.find((b) => b.id === selectedBahanId);

  // Perhitungan konversi jumlah input
  const parsedJumlah = parseFloat(jumlah || "0");
  const multiplier = satuan === "KG" ? 1000 : 1;
  const jumlahTerkonversi = isNaN(parsedJumlah) ? 0 : parsedJumlah * multiplier;

  // Cek apakah pemakaian melebihi stok yang ada
  const isOverStock =
    tipe === "KELUAR" &&
    selectedBahan &&
    jumlahTerkonversi > selectedBahan.stokTotal;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedBahanId) {
      setErrorMessage("Silakan pilih bahan baku yang akan dimutasi.");
      return;
    }

    if (isNaN(parsedJumlah) || parsedJumlah <= 0) {
      setErrorMessage("Jumlah mutasi harus lebih besar dari 0.");
      return;
    }

    if (isOverStock && selectedBahan) {
      setErrorMessage(
        `Stok tidak mencukupi untuk pemakaian ini. Stok ${
          selectedBahan.namaBahan
        } saat ini adalah ${numberFormat.format(selectedBahan.stokTotal)} g.`
      );
      return;
    }

    const formData = new FormData();
    formData.append("bahanBakuId", selectedBahanId);
    formData.append("tipe", tipe);
    formData.append("jumlah", parsedJumlah.toString());
    formData.append("satuan", satuan);
    formData.append("keterangan", keterangan.trim());

    startTransition(async () => {
      try {
        const res = await createMutasiStokAction(formData);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Mutasi stok berhasil dicatat.");
          setJumlah("");
          setKeterangan("");
        }
      } catch (err) {
        console.error("Gagal mencatat mutasi stok:", err);
        setErrorMessage("Terjadi kesalahan sistem saat mencatat mutasi stok.");
      }
    });
  };

  return (
    <div className="space-y-8 min-w-0 w-full">
      {/* Alert Notifications */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-2xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 leading-snug">
            <p className="font-semibold">Perhatian</p>
            <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
            aria-label="Tutup pesan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 leading-snug">
            <p className="font-semibold">Berhasil</p>
            <p className="mt-0.5 text-xs text-emerald-700">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
            aria-label="Tutup pesan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Card 1: Formulir Pencatatan Mutasi Stok */}
      <section className="rounded-2xl border border-stone-200/70 bg-white/60 p-5 sm:p-7 backdrop-blur-sm shadow-xs min-w-0 w-full">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-200/70">
          <ArrowLeftRight className="h-5 w-5 text-amber-700" strokeWidth={1.75} />
          <div>
            <h2 className="text-base font-semibold text-stone-800">
              Formulir Kelola Mutasi Bahan
            </h2>
            <p className="text-xs text-stone-500">
              Catat pergerakan stok masuk dari supplier atau pemakaian harian produksi dapur
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 min-w-0 w-full">
          {/* 1. Selector Jenis Aktivitas (Masuk vs Keluar) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-stone-700">
              Jenis Aktivitas <span className="text-amber-700">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Stok Masuk */}
              <button
                type="button"
                onClick={() => setTipe("MASUK")}
                className={[
                  "flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                  tipe === "MASUK"
                    ? "border-emerald-300 bg-emerald-50/90 shadow-2xs ring-2 ring-emerald-400/50"
                    : "border-stone-200/80 bg-white/80 hover:bg-stone-50 text-stone-600",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    tipe === "MASUK"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-stone-100 text-stone-500",
                  ].join(" ")}
                >
                  <ArrowDownToLine className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p
                    className={[
                      "text-sm font-semibold",
                      tipe === "MASUK" ? "text-emerald-900" : "text-stone-800",
                    ].join(" ")}
                  >
                    Stok Masuk (+)
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    Penerimaan restock dari supplier
                  </p>
                </div>
              </button>

              {/* Option: Stok Keluar / Pemakaian */}
              <button
                type="button"
                onClick={() => setTipe("KELUAR")}
                className={[
                  "flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                  tipe === "KELUAR"
                    ? "border-rose-300 bg-rose-50/90 shadow-2xs ring-2 ring-rose-400/50"
                    : "border-stone-200/80 bg-white/80 hover:bg-stone-50 text-stone-600",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    tipe === "KELUAR"
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "bg-stone-100 text-stone-500",
                  ].join(" ")}
                >
                  <ArrowUpFromLine className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p
                    className={[
                      "text-sm font-semibold",
                      tipe === "KELUAR" ? "text-rose-900" : "text-stone-800",
                    ].join(" ")}
                  >
                    Stok Keluar / Pemakaian (-)
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    Pemakaian produksi / bahan rusak
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Grid Input: Bahan Baku, Jumlah & Satuan */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Field Bahan Baku */}
            <div className="space-y-1.5 md:col-span-6 min-w-0">
              <label
                htmlFor="select-bahan"
                className="block text-xs font-medium text-stone-700"
              >
                Pilih Bahan Baku <span className="text-amber-700">*</span>
              </label>
              <CustomSelect
                id="select-bahan"
                name="bahanBakuId"
                value={selectedBahanId}
                onChange={setSelectedBahanId}
                options={bahanOptions}
                placeholder="-- Pilih Bahan Baku --"
                disabled={bahanList.length === 0}
              />

              {selectedBahan && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-stone-500">Stok saat ini:</span>
                  <span
                    className={[
                      "inline-flex items-center gap-1 font-semibold rounded-md px-2 py-0.5",
                      selectedBahan.stokTotal <= 10
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100/70 text-amber-900 border border-amber-200/70",
                    ].join(" ")}
                  >
                    {numberFormat.format(selectedBahan.stokTotal)} g
                    {selectedBahan.stokTotal <= 10 && " (Kritis)"}
                  </span>
                </div>
              )}
            </div>

            {/* Field Jumlah */}
            <div className="space-y-1.5 md:col-span-4 min-w-0">
              <label
                htmlFor="input-jumlah"
                className="block text-xs font-medium text-stone-700"
              >
                Jumlah Mutasi <span className="text-amber-700">*</span>
              </label>
              <input
                id="input-jumlah"
                type="number"
                step="any"
                min="0.01"
                required
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="Contoh: 500"
                className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60 tabular-nums"
              />

              {satuan === "KG" && parsedJumlah > 0 && (
                <p className="text-[11px] text-amber-800 font-medium pt-0.5">
                  = {numberFormat.format(jumlahTerkonversi)} Gram (g)
                </p>
              )}
            </div>

            {/* Field Satuan Input */}
            <div className="space-y-1.5 md:col-span-2 min-w-0">
              <label
                htmlFor="select-satuan"
                className="block text-xs font-medium text-stone-700"
              >
                Satuan <span className="text-amber-700">*</span>
              </label>
              <CustomSelect
                id="select-satuan"
                name="satuan"
                value={satuan}
                onChange={(v) => setSatuan(v as "GRAM" | "KG")}
                options={satuanOptions}
              />
            </div>
          </div>

          {/* Warning banner jika pemakaian melebihi stok */}
          {isOverStock && selectedBahan && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50 p-3 text-xs text-rose-800 shadow-2xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>
                Jumlah pemakaian yang Anda masukkan (
                <strong>{numberFormat.format(jumlahTerkonversi)} g</strong>) melebihi
                stok yang tersedia (
                <strong>{numberFormat.format(selectedBahan.stokTotal)} g</strong>).
              </span>
            </div>
          )}

          {/* 3. Field Keterangan / Catatan */}
          <div className="space-y-1.5 min-w-0">
            <label
              htmlFor="input-keterangan"
              className="block text-xs font-medium text-stone-700"
            >
              Catatan / Keterangan (Opsional)
            </label>
            <input
              id="input-keterangan"
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Produksi 60 Croissant Almond atau Restock Supplier Toko Berkah"
              className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            />
            <p className="text-[11px] text-stone-500">
              Gunakan catatan untuk mempermudah pelacakan batch produksi atau audit keuangan dapur.
            </p>
          </div>

          {/* Action Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending || isOverStock || bahanList.length === 0}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-xs transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] disabled:cursor-not-allowed disabled:opacity-60",
                tipe === "MASUK"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500"
                  : "bg-amber-200 text-amber-950 hover:bg-amber-300/80 focus-visible:ring-amber-400/70",
              ].join(" ")}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Mutasi...</span>
                </>
              ) : tipe === "MASUK" ? (
                <>
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  <span>Simpan Stok Masuk (+)</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                  <span>Catat Pemakaian Stok (-)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Card 2: Riwayat Kronologis Mutasi Bahan */}
      <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/60 backdrop-blur-sm shadow-xs min-w-0 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-amber-700" strokeWidth={1.75} />
            <div>
              <h3 className="text-base font-semibold text-stone-800">
                Riwayat Pergerakan Bahan
              </h3>
              <p className="text-xs text-stone-500">
                Catatan kronologis mutasi stok masuk dan pemakaian terbaru
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-md border border-stone-200 bg-stone-100/80 px-2.5 py-0.5 text-xs font-medium text-stone-600">
            {history.length} catatan aktivitas
          </span>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-700 ring-6 ring-amber-50">
              <Package className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h4 className="mt-4 text-sm font-semibold text-stone-800">
              Belum ada mutasi bahan yang dicatat
            </h4>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-stone-500">
              Gunakan formulir di atas untuk mencatat stok masuk atau pemakaian bahan pertama Anda.
            </p>
          </div>
        ) : (
          <>
            {/* Tampilan Mobile & Tablet (< lg): Stacked Card View */}
            <div className="divide-y divide-stone-100 lg:hidden">
              {history.map((item) => {
                const date = new Date(item.timestamp);
                const formattedDate = new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).format(date);

                return (
                  <div
                    key={`mobile-${item.id}`}
                    className="p-4 space-y-3 transition-colors hover:bg-amber-50/30"
                  >
                    {/* Header Card: Bahan Baku & Jenis Aktivitas */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-800 text-sm truncate">
                          {item.bahanBaku.namaBahan}
                        </p>
                        {item.bahanBaku.kategori && (
                          <span className="inline-block mt-0.5 rounded-md border border-stone-200 bg-stone-100/80 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                            {item.bahanBaku.kategori.namaKategori}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0">
                        {item.tipe === "MASUK" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 shadow-2xs">
                            <ArrowDownToLine className="h-3 w-3 text-emerald-700" />
                            Stok Masuk (+)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                            <ArrowUpFromLine className="h-3 w-3 text-rose-600" />
                            Pemakaian (-)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Baris Jumlah Mutasi */}
                    <div className="flex items-baseline justify-between rounded-xl bg-stone-50/80 border border-stone-200/60 px-3 py-2 text-xs">
                      <span className="text-stone-500 font-medium">
                        Jumlah Mutasi:
                      </span>
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            item.tipe === "MASUK"
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {item.tipe === "MASUK" ? "+" : "-"}
                          {numberFormat.format(item.jumlahTerkonversi)}{" "}
                          <span className="text-xs font-normal text-stone-500">
                            g
                          </span>
                        </span>
                        {item.satuanInput === "KG" && (
                          <p className="text-[10px] text-stone-400">
                            ({item.jumlahInput} kg)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Keterangan / Catatan jika ada */}
                    {item.keterangan && (
                      <div className="rounded-lg bg-amber-50/60 border border-amber-200/60 px-2.5 py-1.5 text-xs text-stone-700">
                        <span className="font-semibold text-amber-900">Catatan: </span>
                        <span>{item.keterangan}</span>
                      </div>
                    )}

                    {/* Footer: Waktu & Petugas */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-stone-500 border-t border-stone-100/80">
                      <span className="flex items-center gap-1 font-mono text-stone-400">
                        <Clock className="h-3 w-3 text-stone-400" />
                        {formattedDate} WIB
                      </span>
                      <span className="flex items-center gap-1 font-medium text-stone-600 truncate max-w-[150px]">
                        <User className="h-3 w-3 text-amber-700 shrink-0" />
                        <span className="truncate">{item.user.name}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tampilan Desktop (lg+): Full Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200/70 bg-stone-50/40 text-xs font-medium text-stone-500">
                    <th scope="col" className="px-5 py-3 font-medium">
                      Waktu & Tanggal
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Bahan Baku
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Jenis Aktivitas
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium text-right">
                      Jumlah Mutasi
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Keterangan / Catatan
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Dicatat Oleh
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {history.map((item) => {
                    const date = new Date(item.timestamp);
                    const formattedDate = new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    }).format(date);

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-amber-50/40"
                      >
                        {/* Tanggal & Waktu */}
                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-stone-500 font-mono">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-stone-400" />
                            {formattedDate} WIB
                          </span>
                        </td>

                        {/* Bahan Baku */}
                        <td className="px-5 py-3.5">
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-800 truncate">
                              {item.bahanBaku.namaBahan}
                            </p>
                            {item.bahanBaku.kategori && (
                              <span className="inline-block text-[11px] text-stone-500">
                                {item.bahanBaku.kategori.namaKategori}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Jenis Aktivitas */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {item.tipe === "MASUK" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 shadow-2xs">
                              <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-700" />
                              Stok Masuk (+)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                              <ArrowUpFromLine className="h-3.5 w-3.5 text-rose-600" />
                              Pemakaian (-)
                            </span>
                          )}
                        </td>

                        {/* Jumlah Mutasi */}
                        <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium tabular-nums">
                          <span
                            className={
                              item.tipe === "MASUK"
                                ? "text-emerald-700 font-semibold"
                                : "text-rose-700 font-semibold"
                            }
                          >
                            {item.tipe === "MASUK" ? "+" : "-"}
                            {numberFormat.format(item.jumlahTerkonversi)}{" "}
                            <span className="text-xs text-stone-400 font-normal">
                              g
                            </span>
                          </span>
                          {item.satuanInput === "KG" && (
                            <p className="text-[10px] text-stone-400">
                              ({item.jumlahInput} kg)
                            </p>
                          )}
                        </td>

                        {/* Keterangan */}
                        <td className="px-5 py-3.5 text-xs text-stone-600 max-w-xs truncate">
                          {item.keterangan ? (
                            <span>{item.keterangan}</span>
                          ) : (
                            <span className="text-stone-300 italic">-</span>
                          )}
                        </td>

                        {/* Dicatat Oleh */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-xs text-stone-700">
                          <span className="flex items-center gap-1.5 font-medium">
                            <User className="h-3.5 w-3.5 text-amber-700" />
                            {item.user.name}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

