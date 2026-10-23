import Link from "next/link";
import type { TimelineStep } from "@/lib/domain/acompanhamento";

const DOT: Record<TimelineStep["state"], string> = {
  done: "bg-primary border-primary",
  current: "bg-[#F1D58A] border-[#BD8127]",
  upcoming: "bg-white border-border",
  info: "bg-[#F0F0F0] border-[#BBBBBB]",
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative ml-2 border-l-2 border-border pl-6">
      {steps.map((step, index) => (
        <li key={index} className="relative pb-5 last:pb-0">
          <span aria-hidden="true" className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 ${DOT[step.state]}`} />
          <p className={`font-semibold ${step.state === "upcoming" ? "text-muted" : "text-ink"}`}>
            {step.title}
            {step.state === "current" && <span className="ml-2 text-[11.5px] font-semibold text-[#8A6414]">agora</span>}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">{step.detail}</p>
          {step.href && (
            <Link href={step.href} className="mt-1 inline-block text-[13px] font-semibold text-primary underline">
              Ver a campanha
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}
