"use server";

import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export interface RequestOtpResponse {
  success?: boolean;
  error?: string;
  resetToken?: string;
  email?: string;
  message?: string;
}

export interface ResetPasswordResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

const SECRET = process.env.NEXTAUTH_SECRET || "sipatri-secret-warm-pastry-auth";

// Rate limiting in-memory stores
interface RequestLimit {
  timestamps: number[];
}

interface VerifyLimit {
  attempts: number;
  firstAttempt: number;
}

const otpRequestLimits = new Map<string, RequestLimit>();
const otpVerifyLimits = new Map<string, VerifyLimit>();

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;

function recordFailedVerifyAttempt(email: string) {
  const now = Date.now();
  const current = otpVerifyLimits.get(email);
  if (!current || now - current.firstAttempt >= FIFTEEN_MINUTES) {
    otpVerifyLimits.set(email, { attempts: 1, firstAttempt: now });
  } else {
    current.attempts += 1;
    otpVerifyLimits.set(email, current);
  }
}

/**
 * Menghasilkan signature HMAC-SHA256 stateless untuk verifikasi OTP.
 * Mengombinasikan SECRET dengan hash kata sandi pengguna saat ini untuk
 * mencegah replay attack (single-use token secara matematis).
 */
function generateSignature(
  email: string,
  otp: string,
  expiresAt: number,
  passwordHash: string
): string {
  const hmacKey = `${SECRET}-${passwordHash}`;
  return crypto
    .createHmac("sha256", hmacKey)
    .update(`${email}.${otp}.${expiresAt}`)
    .digest("hex");
}

/**
 * Template Email HTML Bergaya "Warm Pastry"
 */
function renderOtpEmailHtml(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Kode OTP Pemulihan Kata Sandi - SIPATRI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F8F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292524;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8F3EC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFCF5; border-radius: 28px; border: 1px solid #E7DFC6; box-shadow: 0 10px 30px -8px rgba(180, 83, 9, 0.08); overflow: hidden; padding: 40px 32px;" cellspacing="0" cellpadding="0">
          
          <!-- Header Brand -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; padding: 10px 18px; background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 9999px;">
                <span style="font-size: 12px; font-weight: 700; color: #78350F; letter-spacing: 1.5px; text-transform: uppercase;">
                  FOR COFFE &bull; SIPATRI
                </span>
              </div>
              <h1 style="margin: 20px 0 6px 0; font-size: 24px; font-weight: 800; color: #1C1917; letter-spacing: -0.5px;">
                Pemulihan Kata Sandi Admin
              </h1>
              <p style="margin: 0; font-size: 13px; color: #78716C; line-height: 1.5;">
                Portal Manajemen Stok &amp; Produksi Dapur Pastry
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #F0E8D9; padding-bottom: 24px;"></td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="font-size: 14px; line-height: 1.6; color: #44403C; padding-bottom: 24px;">
              <p style="margin: 0 0 14px 0;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 16px 0;">
                Kami menerima permintaan pengaturan ulang kata sandi untuk akun Administrator SIPATRI Anda. Gunakan kode verifikasi (OTP) 6-digit di bawah ini untuk melanjutkan:
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #FEF3C7; border: 2px dashed #F59E0B; border-radius: 20px; padding: 22px 16px;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                      Kode Verifikasi OTP Anda
                    </span>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #78350F;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 14px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #92400E;">
                <strong>Perhatian:</strong> Kode OTP ini hanya berlaku selama <strong>5 menit</strong>. Jangan berikan kode ini kepada pihak mana pun demi menjaga keamanan sistem.
              </div>

              <p style="margin: 0; font-size: 12px; color: #78716C; line-height: 1.5;">
                Jika Anda tidak merasa meminta pemulihan kata sandi ini, abaikan email ini. Kata sandi Anda saat ini tetap aman dan tidak akan berubah.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #F0E8D9; padding-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #A8A29E;">
                &copy; ${new Date().getFullYear()} For Coffe &bull; Divisi Pastry SIPATRI Security
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Step 1: Permintaan OTP Pemulihan Kata Sandi Administrator
 */
export async function requestAdminOtp(email: string): Promise<RequestOtpResponse> {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return { error: "Email Administrator wajib diisi." };
  }

  // Rate Limiting: Maksimal 1 permintaan per 60 detik & 5 permintaan per 15 menit
  const now = Date.now();
  const requestRecord = otpRequestLimits.get(normalizedEmail) || { timestamps: [] };
  const recentTimestamps = requestRecord.timestamps.filter((ts) => now - ts < FIFTEEN_MINUTES);

  if (recentTimestamps.length > 0) {
    const lastRequest = recentTimestamps[recentTimestamps.length - 1];
    const elapsed = now - lastRequest;
    if (elapsed < ONE_MINUTE) {
      const remainingSec = Math.ceil((ONE_MINUTE - elapsed) / 1000);
      return {
        error: `Harap tunggu ${remainingSec} detik sebelum meminta kode OTP baru.`,
      };
    }
  }

  if (recentTimestamps.length >= 5) {
    return {
      error: "Batas permintaan OTP tercapai (maksimal 5 kali per 15 menit). Silakan coba lagi nanti.",
    };
  }

  // 1. Validasi keberadaan akun di database
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { error: "Email tidak terdaftar di dalam sistem SIPATRI." };
  }

  // 2. Proteksi Peran Ketat: Hanya peran ADMIN yang dapat melakukan reset mandiri via email
  if (user.role !== "ADMIN") {
    return {
      error:
        "Pemulihan mandiri hanya untuk Administrator. Staf dapur silakan hubungi Admin untuk mereset kata sandi.",
    };
  }

  // 3. Verifikasi konfigurasi SMTP pada file .env
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    console.error("Konfigurasi SMTP_EMAIL atau SMTP_PASSWORD tidak ditemukan di environment variables.");
    return {
      error:
        "Konfigurasi email pengirim (SMTP_EMAIL / SMTP_PASSWORD) belum diatur di server (.env).",
    };
  }

  // 4. Generate 6-digit OTP & Expired timestamp (5 menit)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  // 5. Buat stateless HMAC token (dikombinasikan dengan hash password saat ini untuk mencegah replay)
  const signature = generateSignature(normalizedEmail, otp, expiresAt, user.password);
  const resetToken = `${expiresAt}.${signature}`;

  // Catat riwayat rate limit request OTP
  recentTimestamps.push(now);
  otpRequestLimits.set(normalizedEmail, { timestamps: recentTimestamps });

  // 6. Konfigurasi Transporter Nodemailer (Gmail SMTP)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `"SIPATRI • For Coffe Security" <${smtpEmail}>`,
      to: user.email,
      subject: "Kode OTP Pemulihan Kata Sandi Admin - SIPATRI",
      html: renderOtpEmailHtml(user.name || "Administrator", otp),
    });

    return {
      success: true,
      resetToken,
      email: user.email,
      message: `Kode OTP 6-digit telah dikirimkan ke email ${user.email}.`,
    };
  } catch (err: any) {
    console.error("Gagal mengirim email OTP:", err);
    return {
      error:
        "Gagal mengirim kode OTP ke email tujuan. Pastikan SMTP_EMAIL dan App Password Gmail pada file .env sudah valid.",
    };
  }
}

/**
 * Step 2: Verifikasi OTP & Update Kata Sandi Administrator
 */
export async function verifyOtpAndResetPassword(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string,
  resetToken: string
): Promise<ResetPasswordResponse> {
  const normalizedEmail = email?.trim().toLowerCase();
  const cleanOtp = otp?.trim();

  if (!normalizedEmail || !cleanOtp || !resetToken) {
    return { error: "Semua kolom verifikasi wajib diisi." };
  }

  // Rate Limiting: Maksimal 5 percobaan verifikasi per 15 menit
  const now = Date.now();
  const verifyRecord = otpVerifyLimits.get(normalizedEmail);
  if (verifyRecord) {
    if (now - verifyRecord.firstAttempt < FIFTEEN_MINUTES) {
      if (verifyRecord.attempts >= 5) {
        const waitMinutes = Math.ceil((FIFTEEN_MINUTES - (now - verifyRecord.firstAttempt)) / 60000);
        return {
          error: `Terlalu banyak percobaan verifikasi yang gagal. Akun dibatasi selama ${waitMinutes} menit demi keamanan.`,
        };
      }
    } else {
      otpVerifyLimits.delete(normalizedEmail);
    }
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Kata sandi baru minimal terdiri dari 6 karakter." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru." };
  }

  // 1. Parsing token stateless (expiresAt.signature)
  const parts = resetToken.split(".");
  if (parts.length !== 2) {
    recordFailedVerifyAttempt(normalizedEmail);
    return { error: "Token sesi pemulihan tidak valid. Silakan ulangi proses dari awal." };
  }

  const [expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);

  if (isNaN(expiresAt)) {
    recordFailedVerifyAttempt(normalizedEmail);
    return { error: "Format token pemulihan tidak valid." };
  }

  // 2. Periksa masa berlaku OTP (maksimal 5 menit)
  if (Date.now() > expiresAt) {
    recordFailedVerifyAttempt(normalizedEmail);
    return {
      error: "Kode OTP telah kadaluarsa (melebihi 5 menit). Silakan klik 'Kirim Ulang Kode'.",
    };
  }

  // 3. Verifikasi keberadaan akun di database dan pastikan tetap berstatus ADMIN
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    recordFailedVerifyAttempt(normalizedEmail);
    return { error: "Akun pengguna tidak ditemukan di dalam sistem." };
  }

  if (user.role !== "ADMIN") {
    recordFailedVerifyAttempt(normalizedEmail);
    return {
      error: "Akses ditolak. Fitur pemulihan mandiri ini hanya diperuntukkan bagi Administrator.",
    };
  }

  // 4. Verifikasi signature HMAC secara aman dengan timingSafeEqual (menggunakan hash password user)
  const expectedSignature = generateSignature(
    normalizedEmail,
    cleanOtp,
    expiresAt,
    user.password
  );
  const signatureBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");

  if (
    signatureBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    recordFailedVerifyAttempt(normalizedEmail);
    return { error: "Kode OTP yang Anda masukkan salah atau tidak valid." };
  }

  // 5. Enkripsi password baru dengan bcryptjs dan simpan ke database
  // Catatan: Begitu password diperbarui, hash password di DB berubah,
  // sehingga token lama otomatis INVALID dan tidak bisa digunakan ulang (Single-Use).
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Reset limit setelah verifikasi berhasil
    otpVerifyLimits.delete(normalizedEmail);
    otpRequestLimits.delete(normalizedEmail);

    return {
      success: true,
      message: "Kata sandi Administrator berhasil diperbarui! Silakan login kembali dengan kata sandi baru Anda.",
    };
  } catch (err) {
    console.error("Gagal memperbarui kata sandi di database:", err);
    return { error: "Terjadi kesalahan sistem saat memperbarui kata sandi." };
  }
}
