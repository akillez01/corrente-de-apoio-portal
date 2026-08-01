import type { TrailStep, TrailStepState } from "@/lib/domain/transparencyTrail";

const DOT_STYLE: Record<TrailStepState, string> = {
  concluido: "bg-primary border-primary text-white",
  atual: "bg-accent border-accent text-ink",
  futuro: "bg-white border-border",
};

export function TransparencyTrail({ steps }: { steps: TrailStep[] }) {
  return (
    <div className="relative pl-7">
      <div className="absolute bottom-2 left-[9px] top-2 w-0.5 bg-border" />
      {steps.map((step, i) => (
        <div key={step.label} className={i < steps.length - 1 ? "relative pb-5" : "relative"}>
          <span
            className={`absolute -left-7 top-px flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 text-[10px] ${DOT_STYLE[step.state]}`}
          >
            {step.state === "concluido" ? "✔" : step.state === "atual" ? "●" : ""}
          </span>
          <div className={`text-[13.5px] font-semibold ${step.state === "futuro" ? "text-muted" : ""}`}>
            {step.label}
          </div>
          <div className="text-xs text-muted">{step.sublabel}</div>
        </div>
      ))}
    </div>
  );
}
