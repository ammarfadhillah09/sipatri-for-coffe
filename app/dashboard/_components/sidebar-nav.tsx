"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeftRight, Home, Package, Tags, Users } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/inventori", label: "Inventori Bahan", icon: Package },
  { href: "/dashboard/kategori", label: "Kategori Bahan", icon: Tags, adminOnly: true },
  { href: "/dashboard/transaksi", label: "Kelola Bahan", icon: ArrowLeftRight },
  { href: "/dashboard/staff", label: "Kelola Staff", icon: Users, adminOnly: true },
];

export function SidebarNav({
  orientation = "vertical",
  onNavigate,
  userRole,
}: {
  orientation?: "vertical" | "horizontal";
  onNavigate?: () => void;
  userRole?: string;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Prioritaskan role yang dioper dari server component, lalu fallback ke client session
  const effectiveRole = userRole || session?.user?.role;
  const isAdmin = effectiveRole === "ADMIN";

  // Filter menu: Staf hanya melihat menu operasional (Dashboard, Inventori, Kelola Bahan)
  // Admin melihat seluruh menu termasuk Kategori Bahan dan Kelola Staff
  const items = navItems.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigasi utama"
      className={
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex w-max min-w-full gap-1.5"
      }
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={[
              "group relative flex items-center gap-3 whitespace-nowrap rounded-xl text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
              orientation === "vertical" ? "px-3 py-2.5" : "px-3.5 py-2",
              active
                ? "bg-amber-100/60 font-medium text-amber-900"
                : "text-stone-600 hover:bg-stone-100/60 hover:text-stone-900",
            ].join(" ")}
          >
            {active && orientation === "vertical" && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-amber-500"
              />
            )}
            <Icon
              className={[
                "h-[18px] w-[18px] shrink-0 transition-colors",
                active
                  ? "text-amber-700"
                  : "text-stone-400 group-hover:text-stone-600",
              ].join(" ")}
              strokeWidth={1.75}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
