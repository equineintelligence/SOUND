export default function YardField({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[12.5px] font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="block text-[11.5px] text-ink-soft">{hint}</span>}
    </label>
  );
}