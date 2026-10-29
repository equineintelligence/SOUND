import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function FlagQueue() {
  const [flags, setFlags] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const flagPage = await base44.entities.Flag.filter({ status: 'open' }, { sort: 'created_date', limit: 50 });
    const items = flagPage.items || [];
    const ids = [...new Set(items.map((f) => f.review))];
    let reviewItems = [];
    if (ids.length) {
      const reviewPage = await base44.entities.Review.filter({ id: { $in: ids } }, { limit: 50 });
      reviewItems = reviewPage.items || [];
    }
    setFlags(items);
    setReviews(reviewItems);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (flag, outcome) => {
    setBusyId(flag.id);
    await base44.entities.Flag.update(flag.id, { status: 'resolved', outcome });
    setBusyId(null);
    load();
  };

  const removeReview = async (flag) => {
    setBusyId(flag.id);
    await base44.entities.Review.update(flag.review, { status: 'removed' });
    await base44.entities.Flag.update(flag.id, {
      status: 'resolved',
      outcome: 'Review removed',
    });
    setBusyId(null);
    load();
  };

  const editReview = async (flag) => {
    setBusyId(flag.id);
    await base44.entities.Review.update(flag.review, { text: edits[flag.id] || '' });
    await base44.entities.Flag.update(flag.id, {
      status: 'resolved',
      outcome: 'Review edited before staying up',
    });
    setBusyId(null);
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading flags and disputes…</p>;
  if (!flags.length) return <p className="text-[14px] text-ink-soft">No open flags or disputes.</p>;

  return (
    <div className="space-y-4">
      {flags.map((f) => {
        const review = reviews.find((r) => r.id === f.review);
        return (
          <article key={f.id} className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
            <div>
              <p className="font-heading text-[16px] font-semibold text-ink">
                {f.type === 'policy_breach' ? 'Policy breach' : 'Factual dispute'}
              </p>
              <p className="text-[13px] text-ink-soft">
                {f.reason}
                {f.details ? ` · ${f.details}` : ''}
              </p>
            </div>

            {review ? (
              <>
                <p className="text-[13px] text-ink-soft">
                  {review.business_name} · {review.display_name}
                </p>
                <textarea
                  rows={4}
                  value={edits[f.id] !== undefined ? edits[f.id] : review.text || ''}
                  onChange={(e) => setEdits({ ...edits, [f.id]: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-white p-4 text-[14px] leading-relaxed outline-none focus:border-brand"
                />
              </>
            ) : (
              <p className="text-[13px] text-ink-soft">The review is no longer available.</p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === f.id}
                onClick={() => resolve(f, 'Review kept as written')}
                className="min-h-[44px] rounded-xl bg-brand px-4 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                Keep review
              </button>
              <button
                type="button"
                disabled={busyId === f.id || !review || edits[f.id] === undefined}
                onClick={() => editReview(f)}
                className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink disabled:opacity-40"
              >
                Save edit
              </button>
              <button
                type="button"
                disabled={busyId === f.id || !review}
                onClick={() => removeReview(f)}
                className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink-soft disabled:opacity-40"
              >
                Remove review
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}