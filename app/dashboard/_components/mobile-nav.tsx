"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChefHat, Menu, ShieldCheck, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { SignOutButton } from "./sign-out-button";
import { Brand } from "./brand";

interface MobileNavProps {
  user: {
    name: string;
    role: string;
    initials: string;
    rawRole?: string;
  };
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup drawer secara otomatis saat rute berpindah
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Mencegah scroll pada konten utama saat drawer terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Mobile & Tablet Header Bar (< lg) */}
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-[#FFFCF5]/90 px-4 py-3 backdrop-blur lg:hidden print:hidden">
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Buka menu navigasi"
            aria-expanded={isOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/80 bg-white/80 text-stone-700 shadow-2xs transition-colors hover:bg-amber-50/80 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Slide-Over Drawer Portal */}
      {mounted &&
        isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi mobile"
            className="fixed inset-0 z-50 flex lg:hidden"
          >
            {/* Backdrop overlay dengan efek blur */}
            <div
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <div className="relative flex w-full max-w-xs flex-1 flex-col border-r border-stone-200/80 bg-[#FFFAF0] p-5 shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/70">
                <Brand onClick={handleClose} />
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Tutup menu navigasi"
                  className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mt-6 flex-1 overflow-y-auto">
                <p className="mb-2 px-3 text-xs font-medium text-stone-400">
                  Menu Navigasi
                </p>
                <SidebarNav
                  orientation="vertical"
                  onNavigate={handleClose}
                  userRole={user.rawRole}
                />
              </div>

              {/* User Profile & Sign Out Button */}
              <div className="mt-6 border-t border-stone-200/70 pt-4">
                <div className="flex items-center gap-3 px-2">
                  <div
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800 border border-amber-200/80"
                  >
                    {user.initials}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-medium text-stone-800">
                      {user.name}
                    </p>
                    <div className="mt-1">
                      {user.rawRole === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 shadow-2xs">
                          <ShieldCheck className="h-3 w-3 text-amber-700" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 shadow-2xs">
                          <ChefHat className="h-3 w-3 text-emerald-700" />
                          Staf Dapur
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <SignOutButton className="mt-4" />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

