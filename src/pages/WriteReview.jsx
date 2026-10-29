import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SearchField from '@/components/SearchField';
import Stars from '@/components/Stars';
import StatusPill from '@/components/StatusPill';
import { initials, matchBusinesses } from '@/lib/sound';

export default function WriteReview() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const page = await base44.entities.Business.filter(
        { status: { $in: ['unclaimed', 'claimed'] } },
        { sort: '-rating_overall', limit: 200 }
      );
      if (!active) return;
      setBusinesses(page.items || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => matchBusinesses(businesses, query).slice(0, 15), [businesses, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
          Find the business
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Already on Sound. Choose one to avoid duplicates.
        </p>
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Start typing a business name"
      />

      <div className="space-y-2.5">
        {loading && <p className="text-[14px] text-ink-soft">Looking through the directory…</p>}

        {!loading &&
          results.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate(`/write/topic?business=${b.id}`)}
              className="flex w-full items-center gap-4 rounded-2xl border border-hairline bg-white px-4 py-3.5 text-left transition-colors duration-200 hover:bg-brand-soft/40"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft font-heading text-[15px] font-semibold text-brand">
                {initials(b.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-[15px] font-semibold text-ink">
                  {b.name}
                </span>
                <span className="block truncate text-[13px] text-ink-soft">
                  {(b.type || []).join(' · ')}
                  {b.area ? ` · ${b.area}` : ''}
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <Stars value={b.rating_overall || 0} size={13} />
                  <StatusPill status={b.status} />
                </span>
              </span>
            </button>
          ))}

        {!loading && query.trim() && results.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-surface px-4 py-6 text-center text-[14px] text-ink-soft">
            Nothing matches that name yet. You can add it in the next step.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/write/add')}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-hairline bg-white px-4 py-4 text-left transition-colors duration-200 hover:border-brand hover:bg-brand-soft/40"
      >
        <Plus className="h-5 w-5 shrink-0 text-brand" strokeWidth={2.2} />
        <span>
          <span className="block text-[14px] font-semibold text-ink">Not listed? Add a new business</span>
          <span className="block text-[12px] text-ink-soft">
            We check it before it appears, then invite the business to claim it.
          </span>
        </span>
      </button>
    </div>
  );
}