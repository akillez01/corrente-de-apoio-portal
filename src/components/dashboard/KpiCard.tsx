export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-[0_1px_2px_rgba(27,58,45,0.04)]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1.5 font-mono text-[28px] leading-none text-primary">{value}</div>
      {hint && <p className="mt-2 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}