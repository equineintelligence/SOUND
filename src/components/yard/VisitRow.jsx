import { Pencil, Trash2 } from 'lucide-react';
import { dayParts, dayLabel } from '@/lib/yard';

export default function VisitRow({ visit, onEdit, onDelete, hideHorse }) {
  const { weekday, number } = dayParts(visit.date);
  const details = [
    hideHorse ? null : visit.horse_name,
    visit.time,
    visit.cost ? `R${visit.cost}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-white p-3">
      <div className="w-11 shrink-0 rounded-xl bg-brand-soft py-1.5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">{weekday}</p>
        <p className="font-heading text-[17px] font-bold leading-none text-brand">{number}</p>
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-heading text-[14px] font-semibold leading-snug text-ink">
          {visit.type}
          {visit.provider ? ` · ${visit.provider}` : ''}
        </p>
        <p className="text-[12.5px] text-ink-soft">{details || dayLabel(visit.date)}</p>
        {visit.notes && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-ink-soft">{visit.notes}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(visit)}
            aria-label="Edit visit"
            className="tap flex items-center justify-center rounded-lg text-ink-soft transition-colors duration-200 hover:text-brand"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.9} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(visit)}
            aria-label="Delete visit"
            className="tap flex items-center justify-center rounded-lg text-ink-soft transition-colors duration-200 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.9} />
          </button>
        )}
      </div>
    </div>
  );
}