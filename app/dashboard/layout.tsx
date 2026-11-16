import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ChefHat, ShieldCheck } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { SidebarNav } from "./_components/sidebar-nav";
import { SignOutButton } from "@/app/dashboard/_components/sign-out-button";
import { Brand } from "./_components/brand";
import { MobileNav } from "./_components/mobile-nav";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

function formatRole(role?: string | null) {
  if (role === "ADMIN") return "Administrator";
  return "Staf Dapur";
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const name = session.user?.name ?? "Pengguna";
  const role = formatRole(session.user?.role);
  const rawRole = session.user?.role;
  const initials = getInitials(name);

  return (
    <div
      className={`${font.className} min-h-screen bg-[#FFFCF5] text-stone-800 antialiased lg:flex print:block print:bg-white print:min-h-0`}
    >
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-stone-200/70 bg-[#FFFAF0]/80 px-4 py-6 backdrop-blur lg:flex print:hidden">
        <div className="px-2">
          <Brand />
        </div>

        <div className="mt-10 flex-1 overflow-y-auto">
          <p className="mb-2 px-3 text-xs font-medium text-stone-400">Menu</p>
          <SidebarNav userRole={rawRole} />
        </div>

        <div className="mt-6 border-t border-stone-200/70 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800"
            >
              {initials}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-stone-800">
                {name}
              </p>
              <div className="mt-1">
                {rawRole === "ADMIN" ? (
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
          <SignOutButton className="mt-3" />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col print:block print:w-full print:m-0 print:p-0">
        {/* Mobile top bar with interactive slide-over drawer */}
        <MobileNav user={{ name, role, initials, rawRole }} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-14 lg:px-10 lg:py-12 print:m-0 print:p-0 print:max-w-none print:w-full print:bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFCF5]" />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
