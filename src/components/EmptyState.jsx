export default function EmptyState({ title, text, children }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface px-5 py-10 text-center">
      <p className="font-heading text-[16px] font-semibold text-ink">{title}</p>
      {text && <p className="mx-auto mt-1.5 max-w-md text-[14px] leading-relaxed text-ink-soft">{text}</p>}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}