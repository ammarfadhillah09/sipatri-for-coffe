"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Fraunces } from "next/font/google";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  ShieldCheck,
  Users,
  Wheat,
} from "lucide-react";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

/* ------------------------------ Motion setup ------------------------------ */

const leftContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const rightContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.4 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function Float({
  children,
  distance = 8,
  duration = 6,
  delay = 0,
}: {
  children: ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -distance, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------- Preview data ------------------------------ */

const glass =
  "rounded-3xl border border-stone-200/80 bg-white/75 backdrop-blur-xl shadow-[0_24px_60px_-24px_rgba(120,53,15,0.28)]";

const materials = [
  {
    name: "French Butter Elle & Vire",
    detail: "24 kg tersisa · Minimum 10 kg",
    level: "78%",
    status: "Stok Aman",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-400",
  },
  {
    name: "Tepung Protein Tinggi",
    detail: "4 kg tersisa · Minimum 15 kg",
    level: "18%",
    status: "Stok Kritis",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-400",
  },
];

/* --------------------------------- Page ----------------------------------- */

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#FFFCF5] text-stone-900 selection:bg-amber-200 selection:text-amber-950">
      {/* Warm ambient gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_85%_5%,rgba(253,230,138,0.45),transparent_60%),radial-gradient(45rem_32rem_at_0%_100%,rgba(253,186,116,0.25),transparent_60%)]"
      />
      {/* Fine dot-grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(120,53,15,0.16)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,black,transparent)]"
      />

      {/* ------------------------------ Navbar ------------------------------ */}
      <header className="relative z-10">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_-4px_rgba(28,25,23,0.25)] ring-1 ring-stone-200">
              <Image
                src="/logo.jpg"
                alt="Logo For Coffe"
                width={36}
                height={36}
                priority
                className="h-9 w-9 rounded-full object-cover"
              />
            </span>
            <span className="text-lg font-bold tracking-tight text-stone-900">
              SIPATRI
            </span>
            <span className="rounded-full border border-stone-200 bg-white/70 px-2.5 py-0.5 text-xs font-medium text-stone-500">
              For Coffe
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden items-center gap-2 rounded-full border border-stone-200/80 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-stone-600 backdrop-blur-xl sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Sistem Operasional Aktif
            </span>
            <Link
              href="/login"
              className="rounded-lg px-1 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Login Staf<span aria-hidden>→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* -------------------------------- Hero ------------------------------ */}
      <main className="relative z-10 flex flex-1 items-center">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-12 lg:grid-cols-12 lg:gap-12 lg:py-20">
          {/* Left — editorial brand & action */}
          <motion.div
            variants={leftContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-7"
          >
            <motion.span
              variants={rise}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-950"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Internal Portal • Divisi Pastry For Coffe
            </motion.span>

            <motion.h1
              variants={rise}
              className={`${fraunces.className} mt-6 text-4xl font-medium leading-[1.12] tracking-tight text-stone-900 sm:text-5xl lg:text-[3.35rem]`}
            >
              Sistem Manajemen Inventori
              <span className="mt-1.5 block italic text-stone-600">
                Dapur Pastry For Coffe.
              </span>
            </motion.h1>

            <motion.p
              variants={rise}
              className="mt-6 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg"
            >
              SIPATRI memusatkan pencatatan bahan baku, mutasi pemakaian harian,
              dan peringatan stok kritis dalam satu portal, agar Manajer dan
              Staf Pastry selalu tahu apa yang tersedia di dapur.
            </motion.p>

            <motion.div variants={rise} className="mt-9">
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 rounded-2xl bg-amber-200 px-7 py-4 font-semibold text-amber-950 shadow-sm transition-all hover:bg-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5]"
              >
                Masuk ke Portal Sistem
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </motion.div>

            <motion.p
              variants={rise}
              className="mt-6 flex items-center gap-2 text-sm text-stone-500"
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              Akses Terautentikasi • Khusus Manajer &amp; Staf Resmi For Coffe
            </motion.p>
          </motion.div>

          {/* Right — live system preview bento */}
          <motion.div
            aria-hidden="true"
            variants={rightContainer}
            initial="hidden"
            animate="show"
            className="pointer-events-none relative mx-auto flex w-full max-w-md select-none flex-col gap-4 lg:col-span-5 lg:mx-0 lg:max-w-none lg:pb-12 lg:pt-10"
          >
            {/* Warm glow behind the cards */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/50 blur-3xl" />

            {/* Card 1 — main */}
            <motion.div variants={rise} className={`${glass} p-5`}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-900">
                  <Wheat className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Status Bahan Baku Utama
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Pratinjau sistem langsung
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {materials.map((item) => (
                  <li
                    key={item.name}
                    className="rounded-2xl border border-stone-200/70 bg-white/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {item.detail}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${item.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full ${item.bar}`}
                        style={{ width: item.level }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-2 border-t border-stone-200/70 pt-4 text-xs text-stone-600">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                1 bahan perlu restock hari ini
              </div>
            </motion.div>

            {/* Card 2 — floating accent */}
            <motion.div
              variants={rise}
              className="z-10 w-full lg:absolute lg:-right-4 lg:-top-16 lg:w-72"
            >
              <Float distance={8} duration={6}>
                <div className={`${glass} p-4`}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-200 text-amber-950">
                      <ArrowLeftRight className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        Mutasi Dapur Real-Time
                      </p>
                      <p className="text-xs text-stone-500">
                        Tercatat setiap transaksi
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      + Stok Masuk
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
                      − Pemakaian Produksi
                    </span>
                  </div>
                </div>
              </Float>
            </motion.div>

            {/* Card 3 — bottom compact */}
            <motion.div
              variants={rise}
              className="z-10 w-full lg:absolute lg:-bottom-2 lg:-left-8 lg:w-72"
            >
              <Float distance={7} duration={7} delay={1}>
                <div className={`${glass} p-4`}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-amber-100">
                      <Users className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900">
                        Kontrol Multi-Role
                      </p>
                      <p className="text-xs text-stone-500">
                        Admin &amp; Staf Dapur
                      </p>
                    </div>
                    <div className="ml-auto flex -space-x-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-950 ring-2 ring-white">
                        A
                      </span>
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-stone-200 text-[11px] font-bold text-stone-700 ring-2 ring-white">
                        S
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-stone-600">
                    Setiap perubahan stok tercatat atas nama pengguna.
                  </p>
                </div>
              </Float>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ------------------------------ Footer ------------------------------ */}
      <footer className="relative z-10 border-t border-stone-200/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-stone-500 sm:flex-row">
          <p>© 2026 For Coffe • Sistem Inventori Pastry (SIPATRI)</p>
          <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 font-medium text-stone-600">
            v1.0 Internal Release
          </span>
        </div>
      </footer>
    </div>
  );
}
