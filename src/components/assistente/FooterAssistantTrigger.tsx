"use client";

export function FooterAssistantTrigger({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("daime:open-assistant"))}
      className="mt-3 rounded-full border border-white/30 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {label}
    </button>
  );
}
