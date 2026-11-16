<h1 align="center">SIPATRI - Sistem Inventori Pastry For Coffe</h1>

<p align="center">
  Sistem Manajemen Inventori presisi berbasis web yang dirancang khusus untuk operasional Dapur Pastry & Bakery. Dibangun dengan fokus pada kecepatan, akurasi data, dan penerapan keamanan siber (*security-by-design*).
</p>

<p align="center">
  <a href="#fitur-utama">Fitur Utama</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#instalasi--menjalankan-lokal">Instalasi</a> •
  <a href="#arsitektur-keamanan-cyber-security">Keamanan</a>
</p>

---

## 🚀 Fitur Utama

- **Manajemen Inventori Real-Time:** Pencatatan mutasi stok (masuk/keluar) secara akurat dengan peringatan batas stok kritis.
- **Role-Based Access Control (RBAC):** Pemisahan hak akses yang tegas antara **Administrator** (kontrol penuh) dan **Staf Dapur** (pencatatan operasional harian).
- **Laporan Resmi (Export to PDF):** Menghasilkan laporan riwayat mutasi stok berformat surat resmi A4 dengan kop surat instansi yang siap dicetak.
- **Pemulihan Akun Berbasis OTP:** Fitur "Lupa Kata Sandi" mandiri menggunakan *One-Time Password* (OTP) 6 digit via email dengan batas waktu kadaluarsa (5 menit).
- **Admin Sudo-Mode:** Pencegahan pengambilalihan akun staf melalui verifikasi ulang kata sandi Administrator saat melakukan reset kredensial.

## 🛠 Tech Stack

Aplikasi ini dibangun menggunakan ekosistem JavaScript/TypeScript modern:

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) & [React](https://react.dev/)
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM v5](https://www.prisma.io/)
- **Autentikasi:** [NextAuth.js (v4)](https://next-auth.js.org/) & `bcryptjs`
- **Email Service:** `nodemailer` (untuk pengiriman OTP)
- **Validasi Data:** [Zod](https://zod.dev/)

## 🛡 Arsitektur Keamanan (Cyber Security)

SIPATRI dirancang dengan standar keamanan web modern untuk memitigasi kerentanan umum (OWASP Top 10):
1. **Pencegahan SQL Injection:** Eksekusi kueri basis data menggunakan *Parameterized Queries* melalui Prisma ORM.
2. **Pencegahan XSS:** Validasi input ketat di sisi *server* (Zod) dan *auto-escaping* pada komponen antarmuka React.
3. **Manajemen Sesi Aman:** Menggunakan *cookie* terenkripsi dengan atribut `HttpOnly`, `Secure`, dan `SameSite`.
4. **Isolasi Infrastruktur (Production):** Dideploy pada Linux VPS menggunakan **Cloudflare Tunnel (`cloudflared`)** untuk menegakkan enkripsi SSL/TLS (HTTPS penuh) tanpa membuka port *inbound* ke internet publik.

## 💻 Instalasi & Menjalankan Lokal

Ikuti langkah-langkah berikut untuk menjalankan SIPATRI di perangkat lokal Anda.

### Prasyarat
- Node.js (v18.x atau terbaru)
- PostgreSQL (berjalan di lokal atau *cloud* seperti Supabase/Neon)
- Akun Email SMTP (untuk fitur pengiriman OTP)

### Langkah Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone [https://github.com/ammarfadhillah09/sipatri-for-coffe.git](https://github.com/ammarfadhillah09/sipatri-for-coffe.git)
   cd sipatri-for-coffe