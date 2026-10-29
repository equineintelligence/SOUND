import { Search } from 'lucide-react';

export default function SearchField({ value, onChange, placeholder, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative"
      role="search"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft" strokeWidth={1.9} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-2xl border border-hairline bg-white pl-12 pr-4 text-[15px] text-ink placeholder:text-ink-soft/70 outline-none transition-colors duration-200 focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </form>
  );
}