export default function RatingBar({ label, value }) {
  const numeric = Number(value) || 0;
  const pct = Math.max(0, Math.min(100, (numeric / 5) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-[104px] shrink-0 text-[13px] text-ink-soft">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
        <span className="block h-full rounded-full bg-tan" style={{ width: `${pct}%` }} />
      </span>
      <span className="w-9 text-right font-heading text-[13px] font-semibold text-ink">
        {numeric ? numeric.toFixed(1) : '–'}
      </span>
    </div>
  );
}