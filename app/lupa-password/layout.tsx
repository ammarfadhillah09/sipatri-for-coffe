import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi Administrator | SIPATRI - For Coffe",
  description: "Pemulihan kata sandi akun Administrator SIPATRI via kode OTP email",
};

export default function LupaPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
