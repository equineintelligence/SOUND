import { Link } from 'react-router-dom';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { KIND_ICONS, KIND_LABELS } from '@/lib/training';

export default function ResourceCard({ resource, isAdmin, onEdit, onDelete }) {
  const Icon = KIND_ICONS[resource.kind] || BookOpen;

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
      <Link
        to={`/training/${resource.id}`}
        className="flex gap-3.5 p-4 transition-colors duration-200 hover:bg-brand-soft/30"
      >
        {resource.cover_url ? (
          <Image
            src={resource.cover_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl"
            fittingType="fill"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            {KIND_LABELS[resource.kind] || 'Resource'}
            {resource.duration && <span className="font-medium normal-case">· {resource.duration}</span>}
          </span>
          <span className="mt-1 block font-heading text-[15px] font-semibold leading-snug text-ink">
            {resource.title}
          </span>
          {resource.summary && (
            <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
              {resource.summary}
            </span>
          )}
        </span>
      </Link>

      {isAdmin && (
        <div className="flex justify-end gap-2 border-t border-hairline px-3 py-2">
          <button
            type="button"
            onClick={() => onEdit(resource)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-ink-soft transition-colors duration-200 hover:bg-brand-soft/50 hover:text-brand"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(resource)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/5"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}