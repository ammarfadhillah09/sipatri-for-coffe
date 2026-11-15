"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "icon";
  className?: string;
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        aria-label="Keluar"
        className={`rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100/70 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:opacity-50 cursor-pointer ${className}`}
      >
        {isSigningOut ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin text-amber-800" />
        ) : (
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-100/60 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:opacity-50 cursor-pointer ${className}`}
    >
      {isSigningOut ? (
        <>
          <Loader2 className="h-[18px] w-[18px] animate-spin text-amber-700" />
          <span>Keluar...</span>
        </>
      ) : (
        <>
          <LogOut className="h-[18px] w-[18px] text-stone-400" strokeWidth={1.75} />
          <span>Keluar</span>
        </>
      )}
    </button>
  );
}
