"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import {
  createKategoriAction,
  deleteKategoriAction,
  updateKategoriAction,
} from "./actions";

export interface KategoriWithCount {
  id: string;
  namaKategori: string;
  deskripsi: string | null;
  _count: {
    bahanBaku: number;
  };
}

interface KategoriManagerProps {
  categories: KategoriWithCount[];
}

export function KategoriManager({ categories }: KategoriManagerProps) {
  const [isPending, startTransition] = useTransition();

  // Alert feedback state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newNamaKategori, setNewNamaKategori] = useState("");
  const [newDeskripsi, setNewDeskripsi] = useState("");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editNamaKategori, setEditNamaKategori] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");

  // Deleting id state (for loader)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Handler: Tambah Kategori Baru
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetAlerts();

    if (!newNamaKategori.trim()) {
      setErrorMessage("Nama kategori tidak boleh kosong.");
      return;
    }

    const formData = new FormData();
    formData.append("namaKategori", newNamaKategori.trim());
    formData.append("deskripsi", newDeskripsi.trim());

    setIsCreating(true);
    startTransition(async () => {
      try {
        const res = await createKategoriAction(formData);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Kategori berhasil ditambahkan.");
          setNewNamaKategori("");
          setNewDeskripsi("");
        }
      } finally {
        setIsCreating(false);
      }
    });
  };

  // Handler: Mulai Edit Inline
  const handleStartEdit = (cat: KategoriWithCount) => {
    resetAlerts();
    setEditingId(cat.id);
    setEditNamaKategori(cat.namaKategori);
    setEditDeskripsi(cat.deskripsi || "");
  };

  // Handler: Batal Edit Inline
  const handleCancelEdit = () => {
    setEditingId(null);
    setSavingId(null);
    setEditNamaKategori("");
    setEditDeskripsi("");
  };

  // Handler: Simpan Edit Inline
  const handleSaveEdit = async (id: string) => {
    resetAlerts();

    if (!editNamaKategori.trim()) {
      setErrorMessage("Nama kategori tidak boleh kosong.");
      return;
    }

    setSavingId(id);
    startTransition(async () => {
      try {
        const res = await updateKategoriAction(
          id,
          editNamaKategori.trim(),
          editDeskripsi.trim()
        );
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Kategori berhasil diperbarui.");
          setEditingId(null);
        }
      } finally {
        setSavingId(null);
      }
    });
  };

  // Handler: Hapus Kategori
  const handleDelete = async (cat: KategoriWithCount) => {
    resetAlerts();

    // Validasi client-side ramah pengguna
    if (cat._count.bahanBaku > 0) {
      setErrorMessage(
        `Kategori "${cat.namaKategori}" tidak bisa dihapus karena masih digunakan oleh ${cat._count.bahanBaku} bahan baku.`
      );
      return;
    }

    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus kategori "${cat.namaKategori}"?`
      )
    ) {
      return;
    }

    setDeletingId(cat.id);
    startTransition(async () => {
      try {
        const res = await deleteKategoriAction(cat.id);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Kategori berhasil dihapus.");
        }
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Feedback Alerts */}
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

      {/* Card 1: Form Tambah Kategori Baru */}
      <section className="rounded-2xl border border-stone-200/70 bg-white/60 p-5 sm:p-6 backdrop-blur-sm shadow-xs min-w-0 w-full">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-200/70">
          <FolderPlus className="h-5 w-5 text-amber-700" strokeWidth={1.75} />
          <h2 className="text-base font-semibold text-stone-800">
            Tambah Kategori Baru
          </h2>
        </div>

        <form onSubmit={handleCreate} className="mt-5 min-w-0 w-full">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="space-y-1.5 min-w-0 w-full lg:col-span-5">
              <label
                htmlFor="namaKategori"
                className="block text-xs font-medium text-stone-700"
              >
                Nama Kategori <span className="text-amber-700">*</span>
              </label>
              <input
                id="namaKategori"
                type="text"
                required
                value={newNamaKategori}
                onChange={(e) => setNewNamaKategori(e.target.value)}
                placeholder="Contoh: Tepung & Biji-bijian"
                className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              />
            </div>

            <div className="space-y-1.5 min-w-0 w-full lg:col-span-4">
              <label
                htmlFor="deskripsi"
                className="block text-xs font-medium text-stone-700"
              >
                Deskripsi / Keterangan (Opsional)
              </label>
              <input
                id="deskripsi"
                type="text"
                value={newDeskripsi}
                onChange={(e) => setNewDeskripsi(e.target.value)}
                placeholder="Contoh: Butter, margarin, whipping cream"
                className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              />
            </div>

            <div className="min-w-0 w-full lg:col-span-3">
              <button
                type="submit"
                disabled={isCreating || isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 py-2.5 text-sm font-medium text-amber-950 shadow-xs transition-colors hover:bg-amber-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-900" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    <span className="truncate">Tambah Kategori</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Card 2: Daftar Kategori */}
      {categories.length === 0 ? (
        <section className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300/80 bg-white/50 px-6 py-14 text-center backdrop-blur-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-700 ring-8 ring-amber-50">
            <Tags className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 text-base font-medium text-stone-800">
            Belum ada kategori yang terdaftar
          </h3>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-stone-500">
            Tambahkan kategori pertama Anda menggunakan formulir di atas untuk
            mengelompokkan bahan inventori pastry.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/60 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-3.5">
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-800">
                {categories.length}
              </span>{" "}
              kategori terdaftar
            </p>
            <p className="text-xs text-stone-500">
              Klik ikon pensil untuk mengubah nama kategori
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200/70 bg-stone-50/40 text-xs font-medium text-stone-500">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Nama Kategori
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium text-center">
                    Bahan Terkait
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 font-medium text-right"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;
                  const isSaving = savingId === cat.id;
                  const isDeleting = deletingId === cat.id;
                  const hasIngredients = cat._count.bahanBaku > 0;

                  if (isEditing) {
                    return (
                      <tr
                        key={cat.id}
                        className="bg-amber-50/60 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <input
                            type="text"
                            value={editNamaKategori}
                            onChange={(e) => setEditNamaKategori(e.target.value)}
                            placeholder="Nama Kategori"
                            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                            autoFocus
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="text"
                            value={editDeskripsi}
                            onChange={(e) => setEditDeskripsi(e.target.value)}
                            placeholder="Deskripsi (Opsional)"
                            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                          />
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs text-stone-600">
                            {cat._count.bahanBaku} Bahan
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={isSaving || isPending}
                              title="Simpan Perubahan"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-emerald-700 transition-colors disabled:opacity-60 cursor-pointer"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Menyimpan...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                                  <span>Simpan</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isSaving || isPending}
                              title="Batal"
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 shadow-2xs hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" strokeWidth={2} />
                              <span>Batal</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={cat.id}
                      className="transition-colors hover:bg-amber-50/30"
                    >
                      <td className="px-5 py-3.5 font-medium text-stone-800">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                          <span>{cat.namaKategori}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-500 max-w-xs truncate">
                        {cat.deskripsi || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            hasIngredients
                              ? "border-amber-200/80 bg-amber-50/90 text-amber-900"
                              : "border-stone-200/70 bg-stone-100/80 text-stone-500"
                          }`}
                        >
                          {cat._count.bahanBaku} Bahan
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            title={`Edit ${cat.namaKategori}`}
                            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            disabled={isDeleting || isPending}
                            title={
                              hasIngredients
                                ? `Tidak bisa dihapus (${cat._count.bahanBaku} bahan terkait)`
                                : `Hapus ${cat.namaKategori}`
                            }
                            className={`rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 cursor-pointer ${
                              hasIngredients
                                ? "text-stone-300 hover:text-stone-400 hover:bg-stone-50 cursor-not-allowed"
                                : "text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                            }`}
                          >
                            {isDeleting ? (
                              <div className="flex items-center gap-1 text-xs text-rose-600">
                                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                                <span className="sr-only">Menghapus...</span>
                              </div>
                            ) : (
                              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            )}
                          </button>
                        </div>
                      </td>
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
