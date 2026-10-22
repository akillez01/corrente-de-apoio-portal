"use client";

import { locales } from "@/lib/i18n/config";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LABEL: Record<string, string> = { pt: "PT", en: "EN" };

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide">
      {locales.map((l, index) => (
        <span key={l} className="flex items-center gap-1">
          {index > 0 && <span className="opacity-40">/</span>}
          <Link
            href={`/${l}${rest ? `/${rest}` : ""}`}
            className={l === locale ? "opacity-100" : "opacity-55 hover:opacity-90"}
          >
            {LABEL[l]}
          </Link>
        </span>
      ))}
    </div>
  );
}
