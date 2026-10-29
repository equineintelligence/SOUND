import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CheckRow from '@/components/CheckRow';
import { BUSINESS_TYPES, matchBusinesses } from '@/lib/sound';
import { cn } from '@/lib/utils';

export default function AddBusiness() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [types, setTypes] = useState([]);
  const [area, setArea] = useState('');
  const [website, setWebsite] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [existing, setExisting] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const page = await base44.entities.Business.filter(
        { status: { $in: ['unclaimed', 'claimed'] } },
        { limit: 200 }
      );
      if (active) setExisting(page.items || []);
    })();
    return () => {
      active = false;
    };
  }, []);

  const similar = useMemo(() => matchBusinesses(existing, name).slice(0, 4), [existing, name]);

  const toggleType = (t) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const canSubmit = name.trim().length > 1 && types.length > 0 && confirmed && !busy;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const created = await base44.entities.Business.create({
        name: name.trim(),
        type: types,
        area: area.trim(),
        website: website.trim(),
        status: 'pending_check',
        source: 'customer',
        review_count: 0,
      });
      navigate(`/write/topic?business=${created.id}`);
    } catch (err) {
      setError('That could not be saved. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
          Add a new business
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Only businesses and professionals offering equestrian services to the public can be added.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[14px] font-medium text-ink" htmlFor="biz-name">
          Business name
        </label>
        <input
          id="biz-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
      </div>

      {similar.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-hairline bg-surface p-4">
          <p className="font-heading text-[15px] font-semibold text-ink">Is it one of these?</p>
          <div className="space-y-2">
            {similar.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate(`/write/topic?business=${b.id}`)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-hairline bg-white px-3.5 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-ink">{b.name}</span>
                  <span className="block truncate text-[12px] text-ink-soft">
                    {(b.type || []).join(' · ')}
                    {b.area ? ` · ${b.area}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] font-semibold text-brand">Choose</span>
              </button>
            ))}
          </div>
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Choosing an existing listing avoids duplicates.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[14px] font-medium text-ink">Type of business</p>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_TYPES.map((t) => {
            const active = types.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={cn(
                  'min-h-[44px] rounded-full border px-4 text-[13px] font-medium transition-colors duration-200',
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-hairline bg-white text-ink-soft hover:border-brand/40'
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-ink" htmlFor="biz-area">
            Town or area
          </label>
          <input
            id="biz-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-ink" htmlFor="biz-web">
            Website or social page (optional)
          </label>
          <input
            id="biz-web"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      <CheckRow checked={confirmed} onChange={setConfirmed}>
        I confirm this is a business or professional offering equestrian services to the public.
      </CheckRow>

      <p className="rounded-2xl border border-hairline bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
        We check every new business before it appears, and let them know so they can claim their free
        profile.
      </p>

      {error && <p className="text-[13px] text-destructive">{error}</p>}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
      >
        {busy ? 'Saving…' : 'Continue'}
      </button>
    </div>
  );
}