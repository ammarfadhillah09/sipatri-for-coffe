"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Check, Loader2, Save, Tag } from "lucide-react";
import { updateBahanBakuAction, type ActionState } from "../../actions";

interface KategoriItem {
  id: string;
  namaKategori: string;
}

interface EditBahanFormProps {
  initialData: {
    id: string;
    namaBahan: string;
    stokTotal: number;
    kategoriId: string;
  };
  categories: KategoriItem[];
}

const initialState: ActionState = {};

function SubmitButton({ isActionPending }: { isActionPending: boolean }) {
  const { pending } = useFormStatus();
  const isBusy = pending || isActionPending;

  return (
    <button
      type="submit"
      disabled={isBusy}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 py-2.5 text-sm font-medium text-amber-950 shadow-xs transition-colors hover:bg-amber-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      {isBusy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-amber-900" />
          <span>Menyimpan Perubahan...</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" strokeWidth={2} />
          <span>Simpan Perubahan</span>
        </>
      )}
    </button>
  );
}

export function EditBahanForm({ initialData, categories }: EditBahanFormProps) {
  const updateWithId = updateBahanBakuAction.bind(null, initialData.id);
  const [state, formAction, isPending] = useActionState(
    updateWithId,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Alert Banner */}
      {state.error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-2xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="leading-snug">
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="mt-0.5 text-xs text-rose-700">{state.error}</p>
          </div>
        </div>
      )}

      {/* Field 1: Nama Bahan */}
      <div className="space-y-2">
        <label
          htmlFor="namaBahan"
          className="block text-sm font-medium text-stone-700"
        >
          Nama Bahan Baku <span className="text-amber-700">*</span>
        </label>
        <input
          id="namaBahan"
          name="namaBahan"
          type="text"
          required
          defaultValue={initialData.namaBahan}
          placeholder="Contoh: Tepung Terigu Protein Tinggi (Cakra Kembar)"
          className="w-full rounded-xl border border-stone-200/80 bg-white/90 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        />
        <p className="text-xs text-stone-500">
          Gunakan nama yang jelas beserta merek atau varian bila perlu.
        </p>
      </div>

      {/* Field 2: Dropdown Kategori Bahan */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="kategoriId"
            className="block text-sm font-medium text-stone-700"
          >
            Kategori Bahan <span className="text-amber-700">*</span>
          </label>
          <Link
            href="/dashboard/kategori"
            className="text-xs font-medium text-amber-800 hover:text-amber-950 hover:underline transition-colors"
          >
            Kelola Kategori &rarr;
          </Link>
        </div>
        <div className="relative">
          <select
            id="kategoriId"
            name="kategoriId"
            required
            defaultValue={initialData.kategoriId}
            className="w-full appearance-none rounded-xl border border-stone-200/80 bg-white/90 px-4 py-2.5 pr-10 text-sm text-stone-800 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          >
            <option value="" disabled>
              {categories.length > 0
                ? "-- Pilih Kategori Bahan --"
                : "-- Belum ada kategori, silakan buat dahulu --"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.namaKategori}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
            <Tag className="h-4 w-4" />
          </div>
        </div>
        {categories.length === 0 ? (
          <p className="text-xs text-amber-800">
            Belum ada kategori yang terdaftar.{" "}
            <Link
              href="/dashboard/kategori"
              className="font-medium underline hover:text-amber-950"
            >
              Klik di sini untuk membuat kategori baru
            </Link>
            .
          </p>
        ) : (
          <p className="text-xs text-stone-500">
            Pilih kategori yang sesuai untuk mempermudah pengelompokan bahan baku.
          </p>
        )}
      </div>

      {/* Field 3: Stok Total (Gram) */}
      <div className="space-y-2">
        <label
          htmlFor="stokTotal"
          className="block text-sm font-medium text-stone-700"
        >
          Penyesuaian Stok Total <span className="text-amber-700">*</span>
        </label>
        <div className="relative">
          <input
            id="stokTotal"
            name="stokTotal"
            type="number"
            step="any"
            min="0"
            defaultValue={initialData.stokTotal}
            required
            className="w-full rounded-xl border border-stone-200/80 bg-white/90 px-4 py-2.5 pr-20 text-sm text-stone-800 shadow-2xs tabular-nums transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
              Gram (g)
            </span>
          </div>
        </div>
        <p className="text-xs text-stone-500">
          Semua inventori di SIPATRI dicatat dalam satuan <strong>Gram (g)</strong>. Catatan: Mengubah angka ini akan langsung menyesuaikan saldo fisik bahan di sistem.
        </p>
      </div>

      {/* Actions: Cancel & Submit */}
      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/dashboard/inventori"
          className="inline-flex items-center justify-center rounded-xl border border-stone-200/80 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-2xs transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
        >
          Batal
        </Link>
        <SubmitButton isActionPending={isPending} />
      </div>
    </form>
  );
}

