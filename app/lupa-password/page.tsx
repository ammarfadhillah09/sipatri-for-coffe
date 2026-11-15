"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { requestAdminOtp, verifyOtpAndResetPassword } from "./actions";

export default function LupaPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  // Submit Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      try {
        const res = await requestAdminOtp(email);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success && res.resetToken) {
          setResetToken(res.resetToken);
          setSuccessMessage(res.message || "Kode OTP 6-digit berhasil dikirim ke email.");
          setStep(2);
        }
      } catch {
        setErrorMessage("Terjadi gangguan sistem saat mengirim kode OTP. Silakan coba beberapa saat lagi.");
      }
    });
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    setErrorMessage("");
    setIsResending(true);
    try {
      const res = await requestAdminOtp(email);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setSuccessMessage("Kode OTP baru telah berhasil dikirimkan ke email Anda.");
      }
    } catch {
      setErrorMessage("Gagal mengirim ulang kode OTP.");
    } finally {
      setIsResending(false);
    }
  };

  // Submit Step 2: Verify OTP & Reset Password
  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await verifyOtpAndResetPassword(
          email,
          otp,
          newPassword,
          confirmPassword,
          resetToken
        );

        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Kata sandi berhasil diperbarui!");
          // Tunggu sebentar lalu arahkan ke login
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch {
        setErrorMessage("Terjadi kesalahan saat memproses pembaruan kata sandi.");
      }
    });
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
        {/* Back Link to Login */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-500 hover:text-amber-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-amber-700 transition-all" />
            <span>Kembali ke Halaman Login</span>
          </Link>

          {/* Mini cafe badge */}
          <span className="text-[11px] font-semibold tracking-wider text-amber-800/70 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/60 uppercase">
            For Coffe
          </span>
        </motion.div>

        {/* Card Header with Logo & Title */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-amber-100/60 border border-amber-200/80 shadow-[0_8px_18px_-4px_rgba(217,119,6,0.15)] flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="Logo For Coffe"
              width={64}
              height={64}
              priority
              className="rounded-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">
              {step === 1 ? "Pemulihan Akun" : "Verifikasi & Reset"}
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
              {step === 1
                ? "Masukkan email admin atau staff untuk menerima kode OTP verifikasi"
                : "Masukkan 6-digit kode OTP dan tentukan kata sandi baru Anda"}
            </p>
          </div>
        </motion.div>

        {/* Alert Notifications */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5 shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{successMessage}</p>
          </motion.div>
        )}

        {/* STEP 1: Form Input Email */}
        {step === 1 && (
          <motion.form variants={itemVariants} onSubmit={handleRequestOtp} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-stone-700 tracking-wide"
              >
                Masukkan Email 
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
                  placeholder="admin@forcoffe.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-amber-200/80 rounded-2xl text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all duration-200 shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-sm sm:text-base shadow-[0_8px_20px_-4px_rgba(217,119,6,0.2)] border border-amber-300/80 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                    <span>Mengirim Kode OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Kode OTP ke Email</span>
                    <ArrowRight className="w-4 h-4 text-amber-950/80 group-hover:translate-x-1 transition-transform duration-200 ease-out" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Security Notice */}
            <div className="pt-2 text-center">
              <p className="text-[11px] leading-relaxed text-stone-500">
                Kode OTP 6-digit akan dikirimkan langsung ke inbox email resmi Administrator yang terdaftar.
              </p>
            </div>
          </motion.form>
        )}

        {/* STEP 2: Form Input OTP & Password Baru */}
        {step === 2 && (
          <motion.form variants={itemVariants} onSubmit={handleResetPassword} className="space-y-4 pt-1">
            {/* Target Email indicator & Change email button */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
              <div className="min-w-0 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="truncate text-stone-700 font-medium">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 shrink-0 ml-2 underline cursor-pointer"
              >
                Ubah Email
              </button>
            </div>

            {/* OTP Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="otp"
                  className="block text-xs font-semibold text-stone-700 tracking-wide"
                >
                  Kode OTP (6 Digit)
                </label>
                <button
                  type="button"
                  disabled={isResending || isPending}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <RotateCcw className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`} />
                  <span>{isResending ? "Mengirim..." : "Kirim ulang kode"}</span>
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-700 transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-amber-200/80 rounded-2xl text-stone-900 text-base sm:text-lg font-mono font-bold tracking-[0.3em] text-center placeholder:tracking-normal placeholder:font-normal placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all duration-200 shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-stone-400">
                Masa berlaku kode: 5 menit sejak email dikirimkan.
              </p>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold text-stone-700 tracking-wide"
              >
                Kata Sandi Baru
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-700 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-stone-700 tracking-wide"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-amber-700 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-10 pr-11 py-3 bg-white/80 border border-amber-200/80 rounded-2xl text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all duration-200 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button Step 2 */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-sm sm:text-base shadow-[0_8px_20px_-4px_rgba(217,119,6,0.2)] border border-amber-300/80 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                    <span>Memperbarui Kata Sandi...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Kata Sandi Baru</span>
                    <ArrowRight className="w-4 h-4 text-amber-950/80 group-hover:translate-x-1 transition-transform duration-200 ease-out" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}

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
