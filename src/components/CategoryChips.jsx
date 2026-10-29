import { cn } from '@/lib/utils';

export default function CategoryChips({ items, value, onChange }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {items.map((item) => {
        const active = item === value;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              'tap shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200',
              active
                ? 'border-brand bg-brand text-white'
                : 'border-hairline bg-white text-ink-soft hover:border-brand/40 hover:text-ink'
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}