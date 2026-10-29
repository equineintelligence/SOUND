import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function ReplyQueue() {
  const [replies, setReplies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const replyPage = await base44.entities.BusinessReply.filter(
      { status: 'pending' },
      { sort: 'created_date', limit: 50 }
    );
    const items = replyPage.items || [];
    const ids = [...new Set(items.map((r) => r.review))];
    let reviewItems = [];
    if (ids.length) {
      const reviewPage = await base44.entities.Review.filter({ id: { $in: ids } }, { limit: 50 });
      reviewItems = reviewPage.items || [];
    }
    setReplies(items);
    setReviews(reviewItems);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (reply, status) => {
    setBusyId(reply.id);
    await base44.entities.BusinessReply.update(reply.id, { status });
    setBusyId(null);
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading replies…</p>;
  if (!replies.length) return <p className="text-[14px] text-ink-soft">No replies waiting.</p>;

  return (
    <div className="space-y-4">
      {replies.map((r) => {
        const review = reviews.find((x) => x.id === r.review);
        return (
          <article key={r.id} className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
            <p className="text-[13px] text-ink-soft">
              {review ? `${review.business_name} · reply to ${review.display_name}` : 'Business reply'}
            </p>
            {review && (
              <p className="rounded-xl bg-surface p-4 text-[13px] leading-relaxed text-ink-soft">
                {review.text}
              </p>
            )}
            <p className="rounded-xl border-l-2 border-brand bg-brand-soft/60 p-4 text-[14px] leading-relaxed text-ink">
              {r.text}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => decide(r, 'published')}
                className="min-h-[44px] rounded-xl bg-brand px-4 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                Publish reply
              </button>
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => decide(r, 'removed')}
                className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink-soft disabled:opacity-40"
              >
                Reject reply
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}