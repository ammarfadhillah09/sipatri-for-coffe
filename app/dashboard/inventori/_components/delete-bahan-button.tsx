"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, Trash2, X } from "lucide-react";
import { deleteBahanBakuAction } from "../actions";

interface DeleteBahanButtonProps {
  id: string;
  namaBahan: string;
}

export function DeleteBahanButton({ id, namaBahan }: DeleteBahanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Pastikan komponen hanya me-render portal setelah di-mount pada sisi client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending]);

  const handleOpen = () => {
    setErrorMessage(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isPending) return;
    setErrorMessage(null);
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await deleteBahanBakuAction(id);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Gagal menghapus bahan baku:", err);
        setErrorMessage("Terjadi kesalahan sistem saat mencoba menghapus bahan baku.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Hapus ${namaBahan}`}
        title="Hapus"
        disabled={isPending}
        className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
        ) : (
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        )}
      </button>

      {/* Confirmation Modal rendered via portal to escape table overflow & blur traps */}
      {mounted &&
        isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          >
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md rounded-2xl border border-stone-200/80 bg-[#FFFCF5] p-6 shadow-xl transition-all sm:p-7">
              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                aria-label="Tutup dialog"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 disabled:opacity-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-100 text-rose-600 shadow-2xs">
                  <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3
                    id="modal-title"
                    className="text-lg font-semibold tracking-tight text-stone-800"
                  >
                    Hapus Bahan Baku
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600">
                    Apakah Anda yakin ingin menghapus bahan{" "}
                    <strong className="font-semibold text-stone-800">
                      {namaBahan}
                    </strong>
                    ? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/90 p-3.5 text-xs text-rose-800 shadow-2xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="leading-snug">
                    <p className="font-semibold">Tidak Dapat Menghapus</p>
                    <p className="mt-0.5 text-rose-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl border border-stone-200/80 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-2xs transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Menghapus Bahan...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      <span>Hapus Bahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
