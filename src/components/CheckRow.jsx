import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CheckRow({ checked, onChange, children }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-2xl border border-hairline bg-white p-3.5 text-left transition-colors duration-200 hover:bg-brand-soft/40"
    >
      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200',
          checked ? 'border-brand bg-brand text-white' : 'border-hairline bg-white text-transparent'
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
      <span className="text-[14px] leading-relaxed text-ink">{children}</span>
    </button>
  );
}