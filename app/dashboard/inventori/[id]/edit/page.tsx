import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EditBahanForm } from "./form";

export const metadata = {
  title: "Edit Bahan Baku | SIPATRI - For Coffe",
  description: "Perbarui informasi dan stok bahan baku dapur pastry",
};

interface EditBahanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBahanPage({ params }: EditBahanPageProps) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  // Proteksi RBAC: Hanya ADMIN yang diizinkan mengedit bahan baku
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Mengambil bahan baku dari database berdasarkan parameter ID
  const bahan = await prisma.bahanBaku.findUnique({
    where: { id },
  });

  if (!bahan) {
    notFound();
  }

  // Mengambil seluruh kategori yang tersedia
  const categories = await prisma.kategori.findMany({
    orderBy: { namaKategori: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href="/dashboard/inventori"
          className="inline-flex items-center gap-2 rounded-xl text-xs sm:text-sm font-medium text-stone-500 hover:text-amber-900 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          <ArrowLeft className="h-4 w-4 text-stone-400 group-hover:-translate-x-0.5 group-hover:text-amber-700 transition-all" />
          <span>Kembali ke Inventori</span>
        </Link>
      </div>

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-800 border border-amber-200/80 shadow-2xs">
          <Pencil className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">
            Edit Bahan Baku
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-stone-500 max-w-xl">
            Perbarui informasi nama, kategori, atau penyesuaian stok untuk bahan{" "}
            <span className="font-medium text-stone-700">{bahan.namaBahan}</span>.
          </p>
        </div>
      </header>

      {/* Form Card Container */}
      <section className="rounded-2xl border border-stone-200/70 bg-white/60 p-6 sm:p-8 backdrop-blur-sm max-w-2xl shadow-xs">
        <EditBahanForm initialData={bahan} categories={categories} />
      </section>
    </div>
  );
}

