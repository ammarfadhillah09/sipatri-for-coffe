"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Package,
  Tags,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChefHat,
  Coffee,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

/**
 * Cute mini inline croissant SVG brand icon
 */
function BrandCroissant() {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sidePastryGrad" x1="10" y1="10" x2="62" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path
        d="M14 46C10 38 12 26 22 20C30 15 42 15 50 20C60 26 62 38 58 46C55 52 48 50 44 44C40 37 32 37 28 44C24 50 17 52 14 46Z"
        fill="url(#sidePastryGrad)"
      />
      <path
        d="M26 23C32 19 40 19 46 23C50 26 51 34 48 40C45 46 41 48 36 48C31 48 27 46 24 40C21 34 22 26 26 23Z"
        fill="#F59E0B"
      />
      <path d="M27 28C29 27 32 28 33 30" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 27C36 26 38 26 39 28" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="34" r="1" fill="#FEF3C7" />
    </svg>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Inventori Bahan",
      href: "/dashboard/inventori",
      icon: Package,
    },
    {
      name: "Kategori Bahan",
      href: "/dashboard/kategori",
      icon: Tags,
    },
    {
      name: "Log Transaksi",
      href: "/dashboard/transaksi",
      icon: ClipboardList,
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white/80 backdrop-blur-md border-b border-amber-200/60 sticky top-0 z-30 shadow-2xs">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-100/80 border border-amber-200/80 flex items-center justify-center">
            <BrandCroissant />
          </div>
          <div>
            <div className="font-black text-stone-800 text-lg tracking-tight leading-none">
              SIPATRI
            </div>
            <div className="text-[10px] font-semibold text-amber-700 tracking-wide">
              For Coffe
            </div>
          </div>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-stone-600 hover:text-amber-900 hover:bg-amber-100/60 border border-amber-200/60 transition-colors"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          aria-hidden="true"
          className="fixed inset-0 bg-stone-900/25 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 md:w-64 lg:w-72 bg-white/80 md:bg-white/70 backdrop-blur-xl border-r border-amber-200/60 flex flex-col justify-between p-5 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="flex items-center justify-between pb-6 pt-1 border-b border-amber-100/80">
            <Link href="/dashboard" onClick={closeSidebar} className="flex items-center gap-3 group">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/80 shadow-[0_4px_12px_-2px_rgba(217,119,6,0.15)] group-hover:scale-105 transition-transform">
                <BrandCroissant />
              </div>
              <div>
                <span className="text-xl font-black text-stone-800 tracking-tight block">
                  SIPATRI
                </span>
                <span className="text-[11px] font-semibold text-amber-700 block tracking-wide">
                  For Coffe Pastry System
                </span>
              </div>
            </Link>

            {/* Close button for mobile */}
            <button
              onClick={closeSidebar}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5" aria-label="Navigasi Utama">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-amber-100/90 text-amber-950 border border-amber-200/80 shadow-xs"
                      : "text-stone-600 hover:bg-amber-50/80 hover:text-amber-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-amber-800" : "text-stone-400 group-hover:text-amber-700"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="pt-4 border-t border-amber-100/80 space-y-3">
          {/* User Card */}
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/90 border border-amber-300/80 text-amber-950 font-black text-sm flex items-center justify-center shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "FC"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-stone-800 truncate leading-snug">
                {user?.name || "Staf Pastry"}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    user?.role === "ADMIN"
                      ? "bg-amber-200/80 text-amber-950 border-amber-300/70"
                      : "bg-white text-stone-700 border-amber-200/60"
                  }`}
                >
                  {user?.role === "ADMIN" ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-amber-800" />
                      <span>ADMIN</span>
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-3 h-3 text-amber-700" />
                      <span>STAFF</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl text-stone-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-stone-400 group-hover:text-rose-600" />
            <span>Keluar dari Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
}

