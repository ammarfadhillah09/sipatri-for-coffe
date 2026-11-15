"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: "amber" | "rose" | "stone" | "emerald";
  sublabel?: string;
}

interface CustomSelectProps {
  id?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "-- Pilih --",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Deteksi klik di luar komponen untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getBadgeClass = (color?: string) => {
    switch (color) {
      case "rose":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "emerald":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "amber":
        return "bg-amber-100/80 text-amber-900 border-amber-200/80";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  return (
    <div ref={containerRef} className={`relative min-w-0 w-full ${className}`}>
      {/* Hidden input agar form data tetap tersubmit dengan benar */}
      <input type="hidden" name={name} value={value} />

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled || options.length === 0}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          "flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-white/90 px-3.5 py-2.5 text-left text-sm text-stone-800 shadow-2xs transition-all cursor-pointer",
          "focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen ? "border-amber-400/80 ring-2 ring-amber-400/60" : "hover:border-amber-300/80",
        ].join(" ")}
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span
                  className={`hidden sm:inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.2 text-[11px] font-medium ${getBadgeClass(
                    selectedOption.badgeColor
                  )}`}
                >
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="text-stone-400">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-700" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border border-stone-200/80 bg-[#FFFCF5] p-1.5 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-100"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-stone-400 text-center">
              Tidak ada pilihan tersedia
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={[
                    "flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors select-none",
                    isSelected
                      ? "bg-amber-100/70 text-amber-950 font-medium"
                      : "text-stone-700 hover:bg-amber-50/80 hover:text-stone-900",
                  ].join(" ")}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={`shrink-0 rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${getBadgeClass(
                            opt.badgeColor
                          )}`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.sublabel && (
                      <p className="text-[11px] text-stone-400 truncate">
                        {opt.sublabel}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-amber-800 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

