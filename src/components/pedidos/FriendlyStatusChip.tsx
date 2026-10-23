import type { Tone } from "@/lib/domain/acompanhamento";

const TONE: Record<Tone, string> = {
  neutral: "border-[#DDDDDD] bg-[#F0F0F0] text-[#555555]",
  progress: "border-[#C4D9F2] bg-[#E3EEFB] text-[#2B5AA0]",
  action: "border-[#EBD9A8] bg-[#FDF3DC] text-[#8A6414]",
  done: "border-[#CBE3D2] bg-[#EDF6EF] text-[#2F6B4F]",
  stopped: "border-[#DDDDDD] bg-[#F0F0F0] text-[#777777]",
};

export function FriendlyStatusChip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold ${TONE[tone]}`}>
      {label}
    </span>
  );
}
