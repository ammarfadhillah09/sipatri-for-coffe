import Link from "next/link";
import Image from "next/image";

export function Brand({
  onClick,
  className = "",
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${className}`}
    >
      <Image
        src="/logo.jpg"
        alt="Logo For Coffe"
        width={40}
        height={40}
        priority
        className="h-10 w-10 rounded-full border border-amber-200/80 object-cover ring-4 ring-amber-50"
      />
      <div className="leading-tight">
        <p className="text-[15px] font-semibold tracking-wide text-stone-800">
          SIPATRI
        </p>
        <p className="text-xs text-stone-500">For Coffe</p>
      </div>
    </Link>
  );
}

