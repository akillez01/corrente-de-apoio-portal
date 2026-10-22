"use client";

import { useState } from "react";

export function ShareLinkButton({ path, label, copiedLabel }: { path: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // Cancelado pela pessoa ou indisponível: cai para copiar o link.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-[#2A6249]/40 px-5 py-2.5 text-sm font-semibold text-[#2A6249] transition hover:bg-[#EFF4EF]"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
