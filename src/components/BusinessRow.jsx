import { Link } from 'react-router-dom';
import Stars from '@/components/Stars';

export function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function BusinessRow({ business }) {
  const types = (business.type || []).join(' · ');
  return (
    <Link
      to={`/business/${business.id}`}
      className="flex items-center gap-4 rounded-2xl border border-hairline bg-white px-4 py-3.5 transition-colors duration-200 hover:bg-brand-soft/40"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft font-heading text-[15px] font-semibold text-brand">
        {initialsOf(business.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[15px] font-semibold text-ink">
          {business.name}
        </span>
        <span className="block truncate text-[13px] text-ink-soft">
          {types}
          {business.area ? ` · ${business.area}` : ''}
        </span>
        <span className="mt-1 flex items-center gap-2">
          <Stars value={business.rating || 0} size={13} />
          <span className="text-[12px] text-ink-soft">
            {business.review_count ? `${business.rating} · ${business.review_count} reviews` : 'No reviews yet'}
          </span>
        </span>
      </span>
    </Link>
  );
}