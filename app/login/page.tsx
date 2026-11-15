"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage("Email atau kata sandi tidak valid. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      if (res?.ok) {
        // Berhasil login, arahkan ke dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi gangguan sistem saat proses autentikasi. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut",
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FFFCF5] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-amber-200 selection:text-amber-950">
      {/* Ambient warm glowing radial gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-[420px] sm:w-[540px] h-[420px] sm:h-[540px] rounded-full bg-gradient-to-br from-amber-200/40 via-amber-100/25 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] rounded-full bg-gradient-to-tl from-orange-200/30 via-amber-100/20 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-amber-50/70 blur-3xl"
      />

      {/* Main Glassmorphic Card Container */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md bg-white/75 backdrop-blur-xl rounded-[32px] p-7 sm:p-9 border border-amber-200/60 shadow-[0_20px_50px_-12px_rgba(217,119,6,0.12),0_8px_20px_-6px_rgba(180,83,9,0.05)] flex flex-col space-y-6"
      >
        {/* Discreet Back to Home Link */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-500 hover:text-amber-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-amber-700 transition-all" />
            <span>Kembali ke Beranda</span>
          </Link>

          {/* Mini cafe badge */}
          <span className="text-[11px] font-semibold tracking-wider text-amber-800/70 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/60 uppercase">
            For Coffe
          </span>
        </motion.div>

        {/* Card Header with Pastry Emblem & Titles */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-3 pt-1">
          {/* Gentle Floating Icon */}
          <motion.div
            animate={{
              y: [-3, 3, -3],
              rotate: [-1, 1, -1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-amber-100/60 border border-amber-200/80 shadow-[0_8px_18px_-4px_rgba(217,119,6,0.15)] flex items-center justify-center"
          >
            <Image
              src="/logo.jpg"
              alt="Logo For Coffe"
              width={64}
              height={64}
              priority
              className="rounded-full object-cover"
            />
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">
              Masuk ke Akun
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
              Portal internal manajemen stok &amp; produksi <span className="font-semibold text-amber-800">SIPATRI</span>
            </p>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Error Alert Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="p-3 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="leading-tight">{errorMessage}</p>
            </motion.div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-stone-700 tracking-wide"
            >
              Email Staf / Manajer
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-700 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@forcoffe.com"
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-amber-200/80 rounded-2xl text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-stone-700 tracking-wide"
              >
                Kata Sandi
              </label>
              <Link
                href="/lupa-password"
                className="text-xs font-medium text-amber-800 hover:text-amber-950 transition-colors"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-700 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-white/80 border border-amber-200/80 rounded-2xl text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all duration-200 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none transition-colors"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{
                scale: 1.02,
                boxShadow:
                  "0 14px 28px -4px rgba(217, 119, 6, 0.32), 0 4px 10px -2px rgba(180, 83, 9, 0.12)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-sm sm:text-base shadow-[0_8px_20px_-4px_rgba(217,119,6,0.2)] border border-amber-300/80 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span>{isLoading ? "Memproses..." : "Masuk"}</span>
              <ArrowRight className="w-4 h-4 text-amber-950/80 group-hover:translate-x-1 transition-transform duration-200 ease-out" />
            </motion.button>
          </div>
        </motion.form>

        {/* Minimalist Security Footer Line */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-1.5 pt-1 text-xs text-stone-500"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-700/70 shrink-0" strokeWidth={2} />
          <span>Sistem Internal Terbatas &bull; Khusus Personel Resmi For Coffe</span>
        </motion.div>
      </motion.main>

      {/* Footer Branding */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-6 text-center text-xs text-stone-500 font-normal"
      >
        <p>&copy; 2026 For Coffe &bull; Divisi Pastry</p>
      </motion.footer>
    </div>
  );
}

