"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "./actions";

export interface StaffUserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  createdAt: Date | string;
  _count: {
    logTransaksi: number;
  };
}

interface StaffManagerProps {
  users: StaffUserItem[];
  currentUserId: string;
}

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StaffManager({ users, currentUserId }: StaffManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Alert State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Registrasi State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Modal Edit State
  const [editingUser, setEditingUser] = useState<StaffUserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [editNewPassword, setEditNewPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Delete State
  const [deletingUser, setDeletingUser] = useState<StaffUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup modal jika tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingUser && !isUpdating) setEditingUser(null);
        if (deletingUser && !isDeleting) setDeletingUser(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingUser, deletingUser, isUpdating, isDeleting]);

  // Kunci scroll saat modal aktif
  useEffect(() => {
    if (editingUser || deletingUser) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingUser, deletingUser]);

  const resetAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Handler: Tambah Akun Baru
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetAlerts();

    if (!name.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Alamat email wajib diisi.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    formData.append("role", role);

    setIsCreating(true);
    startTransition(async () => {
      try {
        const res = await createStaffAction(formData);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Akun berhasil didaftarkan.");
          setName("");
          setEmail("");
          setPassword("");
          setRole("STAFF");
        }
      } catch (err) {
        console.error("Gagal mendaftarkan staff:", err);
        setErrorMessage("Terjadi kesalahan sistem saat mendaftarkan akun.");
      } finally {
        setIsCreating(false);
      }
    });
  };

  // Handler: Buka Modal Edit
  const handleOpenEdit = (user: StaffUserItem) => {
    resetAlerts();
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setAdminPassword("");
    setShowAdminPassword(false);
    setEditNewPassword("");
    setShowEditPassword(false);
  };

  // Handler: Simpan Perubahan Edit
  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    resetAlerts();

    if (!editName.trim()) {
      setErrorMessage("Nama lengkap tidak boleh kosong.");
      return;
    }
    if (!editEmail.trim()) {
      setErrorMessage("Alamat email tidak boleh kosong.");
      return;
    }
    if (editNewPassword.trim()) {
      if (!adminPassword) {
        setErrorMessage(
          "Masukkan kata sandi Admin Anda untuk mengonfirmasi perubahan password!"
        );
        return;
      }
      if (editNewPassword.trim().length < 6) {
        setErrorMessage("Kata sandi baru minimal 6 karakter.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", editName.trim());
    formData.append("email", editEmail.trim().toLowerCase());
    formData.append("role", editRole);
    if (editNewPassword.trim()) {
      formData.append("adminPassword", adminPassword);
      formData.append("newPassword", editNewPassword.trim());
    }

    setIsUpdating(true);
    startTransition(async () => {
      try {
        const res = await updateStaffAction(editingUser.id, formData);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Data akun berhasil diperbarui.");
          setEditingUser(null);
        }
      } catch (err) {
        console.error("Gagal memperbarui staff:", err);
        setErrorMessage("Terjadi kesalahan sistem saat memperbarui akun.");
      } finally {
        setIsUpdating(false);
      }
    });
  };

  // Handler: Konfirmasi Hapus Akun
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    resetAlerts();

    setIsDeleting(true);
    startTransition(async () => {
      try {
        const res = await deleteStaffAction(deletingUser.id);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.success) {
          setSuccessMessage(res.message || "Akun berhasil dihapus.");
          setDeletingUser(null);
        }
      } catch (err) {
        console.error("Gagal menghapus akun:", err);
        setErrorMessage("Terjadi kesalahan sistem saat mencoba menghapus akun.");
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const staffCount = users.filter((u) => u.role === "STAFF").length;

  return (
    <div className="space-y-8 min-w-0 w-full">
      {/* Feedback Alerts */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-4 text-sm text-rose-800 shadow-2xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 leading-snug">
            <p className="font-semibold">Perhatian</p>
            <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
            aria-label="Tutup pesan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 leading-snug">
            <p className="font-semibold">Berhasil</p>
            <p className="mt-0.5 text-xs text-emerald-700">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
            aria-label="Tutup pesan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Card 1: Formulir Registrasi Akun Baru */}
      <section className="rounded-2xl border border-stone-200/70 bg-white/60 p-5 sm:p-6 backdrop-blur-sm shadow-xs min-w-0 w-full">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-200/70">
          <UserPlus className="h-5 w-5 text-amber-700" strokeWidth={1.75} />
          <div>
            <h2 className="text-base font-semibold text-stone-800">
              Tambah Akun Baru
            </h2>
            <p className="text-xs text-stone-500">
              Daftarkan staf dapur atau administrator baru ke dalam sistem SIPATRI
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-5 min-w-0 w-full space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Field: Nama Lengkap */}
            <div className="space-y-1.5 min-w-0">
              <label
                htmlFor="create-name"
                className="block text-xs font-medium text-stone-700"
              >
                Nama Lengkap <span className="text-amber-700">*</span>
              </label>
              <input
                id="create-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              />
            </div>

            {/* Field: Email */}
            <div className="space-y-1.5 min-w-0">
              <label
                htmlFor="create-email"
                className="block text-xs font-medium text-stone-700"
              >
                Alamat Email <span className="text-amber-700">*</span>
              </label>
              <input
                id="create-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staf@forcoffe.com"
                className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              />
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5 min-w-0">
              <label
                htmlFor="create-password"
                className="block text-xs font-medium text-stone-700"
              >
                Kata Sandi <span className="text-amber-700">*</span>
              </label>
              <div className="relative">
                <input
                  id="create-password"
                  type={showCreatePassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 pr-10 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  aria-label={showCreatePassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showCreatePassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Field: Role */}
            <div className="space-y-1.5 min-w-0">
              <label
                htmlFor="create-role"
                className="block text-xs font-medium text-stone-700"
              >
                Peran (Role) <span className="text-amber-700">*</span>
              </label>
              <select
                id="create-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "STAFF" | "ADMIN")}
                className="w-full min-w-0 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              >
                <option value="STAFF">Staf Dapur (STAFF)</option>
                <option value="ADMIN">Administrator (ADMIN)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isCreating || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 py-2.5 text-sm font-medium text-amber-950 shadow-xs transition-colors hover:bg-amber-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-900" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" strokeWidth={2} />
                  <span>Daftarkan Akun</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Card 2: Daftar Akun Terdaftar */}
      <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/60 backdrop-blur-sm shadow-xs min-w-0 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-500" />
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-800">
                {users.length}
              </span>{" "}
              akun terdaftar
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/80 bg-amber-100/70 px-2 py-0.5 font-medium text-amber-900">
              <ShieldCheck className="h-3 w-3 text-amber-700" />
              {adminCount} Administrator
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
              <ChefHat className="h-3 w-3 text-stone-500" />
              {staffCount} Staf
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200/70 bg-stone-50/40 text-xs font-medium text-stone-500">
                <th scope="col" className="px-5 py-3 font-medium">
                  Pengguna
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Alamat Email
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Peran (Role)
                </th>
                <th scope="col" className="px-5 py-3 text-center font-medium">
                  Aktivitas Stok
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((item) => {
                const isCurrent = item.id === currentUserId;
                const initials = getInitials(item.name);

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-amber-50/40"
                  >
                    {/* Kolom 1: Avatar & Nama */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/80 bg-amber-100 text-xs font-semibold text-amber-800"
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 truncate">
                            {item.name}
                          </p>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-900 border border-amber-200">
                              Akun Anda
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Email */}
                    <td className="px-5 py-3.5 text-stone-600 font-mono text-xs">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{item.email}</span>
                      </span>
                    </td>

                    {/* Kolom 3: Role Badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {item.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900 shadow-2xs">
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                          <ChefHat className="h-3.5 w-3.5 text-stone-500" />
                          Staf Dapur
                        </span>
                      )}
                    </td>

                    {/* Kolom 4: Log Transaksi / Aktivitas Stok */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md border border-stone-200/80 bg-white/90 px-2.5 py-0.5 text-xs text-stone-600 shadow-2xs">
                        {item._count.logTransaksi} aktivitas
                      </span>
                    </td>

                    {/* Kolom 5: Aksi */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title={`Edit ${item.name}`}
                          aria-label={`Edit ${item.name}`}
                          className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            resetAlerts();
                            setDeletingUser(item);
                          }}
                          disabled={isCurrent}
                          title={
                            isCurrent
                              ? "Tidak dapat menghapus akun Anda sendiri"
                              : `Hapus ${item.name}`
                          }
                          aria-label={
                            isCurrent
                              ? "Tidak dapat menghapus akun Anda sendiri"
                              : `Hapus ${item.name}`
                          }
                          className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Edit Akun (Rendered via Portal) */}
      {mounted &&
        editingUser &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          >
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={() => !isUpdating && setEditingUser(null)}
              aria-hidden="true"
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg rounded-2xl border border-stone-200/80 bg-[#FFFCF5] p-6 shadow-xl transition-all sm:p-7 z-10">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={isUpdating}
                aria-label="Tutup dialog"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 disabled:opacity-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3.5 pb-4 border-b border-stone-200/70">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-100 text-amber-800 shadow-2xs">
                  <UserCheck className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3
                    id="edit-modal-title"
                    className="text-lg font-semibold tracking-tight text-stone-800"
                  >
                    Edit Data Pengguna
                  </h3>
                  <p className="text-xs text-stone-500">
                    Perbarui profil, peran akses, atau ganti kata sandi
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
                {/* Field: Nama Lengkap */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-name"
                    className="block text-xs font-medium text-stone-700"
                  >
                    Nama Lengkap <span className="text-amber-700">*</span>
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  />
                </div>

                {/* Field: Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-email"
                    className="block text-xs font-medium text-stone-700"
                  >
                    Alamat Email <span className="text-amber-700">*</span>
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  />
                </div>

                {/* Field: Role */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-role"
                    className="block text-xs font-medium text-stone-700"
                  >
                    Peran (Role) <span className="text-amber-700">*</span>
                  </label>
                  <select
                    id="edit-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "STAFF" | "ADMIN")}
                    className="w-full rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-sm text-stone-800 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  >
                    <option value="STAFF">Staf Dapur (STAFF)</option>
                    <option value="ADMIN">Administrator (ADMIN)</option>
                  </select>
                </div>

                {/* Field: Password Admin (Konfirmasi jika Kata Sandi Baru diisi) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-admin-password"
                    className="block text-xs font-medium text-stone-700"
                  >
                    Kata Sandi Admin (Konfirmasi) {editNewPassword.trim() ? <span className="text-amber-700">*</span> : null}
                  </label>
                  <div className="relative">
                    <input
                      id="edit-admin-password"
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required={!!editNewPassword.trim()}
                      placeholder="Masukkan kata sandi akun Anda untuk konfirmasi"
                      className="w-full rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 pr-10 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      aria-label={showAdminPassword ? "Sembunyikan kata sandi Admin" : "Tampilkan kata sandi Admin"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showAdminPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Wajib diisi dengan kata sandi akun Admin Anda untuk mengonfirmasi perubahan kata sandi.
                  </p>
                </div>

                {/* Field: Password Baru (Opsional) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-password"
                    className="block text-xs font-medium text-stone-700"
                  >
                    Kata Sandi Baru (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      id="edit-password"
                      type={showEditPassword ? "text" : "password"}
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
                      className="w-full rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 pr-10 text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs transition-all focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      aria-label={showEditPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showEditPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Isi hanya jika ingin mereset password akun ini (minimal 6 karakter).
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-stone-200/70">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center rounded-xl border border-stone-200/80 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-2xs transition-colors hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 py-2 text-sm font-medium text-amber-950 shadow-2xs transition-colors hover:bg-amber-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-900" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Konfirmasi Hapus Akun (Rendered via Portal) */}
      {mounted &&
        deletingUser &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          >
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={() => !isDeleting && setDeletingUser(null)}
              aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md rounded-2xl border border-stone-200/80 bg-[#FFFCF5] p-6 shadow-xl transition-all sm:p-7 z-10">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
                aria-label="Tutup dialog"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 disabled:opacity-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200/80 bg-rose-100 text-rose-600 shadow-2xs">
                  <Trash2 className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <h3
                    id="delete-modal-title"
                    className="text-lg font-semibold tracking-tight text-stone-800"
                  >
                    Hapus Akun Pengguna
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600">
                    Apakah Anda yakin ingin menghapus akun{" "}
                    <strong className="font-semibold text-stone-800">
                      {deletingUser.name}
                    </strong>{" "}
                    ({deletingUser.email})? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              {/* Peringatan Keamanan Relasi Log Transaksi */}
              {deletingUser._count.logTransaksi > 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/90 p-3.5 text-xs text-rose-800 shadow-2xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="leading-snug">
                    <p className="font-semibold">Penghapusan Diblokir</p>
                    <p className="mt-0.5 text-rose-700">
                      Pengguna ini memiliki riwayat{" "}
                      <strong>{deletingUser._count.logTransaksi}</strong> aktivitas
                      mutasi bahan baku di inventori. Akun ini tidak dapat dihapus demi
                      menjaga jejak audit sistem.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-xl border border-stone-200/80 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-2xs transition-colors hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting || deletingUser._count.logTransaksi > 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFCF5] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      <span>Hapus Akun</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

