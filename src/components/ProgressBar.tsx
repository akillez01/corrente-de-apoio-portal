export function ProgressBar({
  pct,
  variant = "andamento",
}: {
  pct: number;
  variant?: "andamento" | "concluida";
}) {
  const width = Math.min(100, Math.max(0, pct));
  const gradient =
    variant === "concluida"
      ? "linear-gradient(90deg,#D9A441,#E8BD63)"
      : "linear-gradient(90deg,#2F6B4F,#5FA37E)";

  return (
    <div className="h-[9px] overflow-hidden rounded-md border border-border bg-bg">
      <div
        className="h-full rounded-md transition-[width] duration-600 ease-out"
        style={{ width: `${width}%`, background: gradient }}
      />
    </div>
  );
}
