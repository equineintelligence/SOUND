import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';

export default function BusinessReviews() {
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await base44.auth.me();
      if (!active || !me) return;
      const owned = await base44.entities.Business.filter({ claimed_by: me.id }, { limit: 1 });
      const record = (owned.items || [])[0] || null;
      if (!active) return;
      setBusiness(record);
      if (record) {
        const [reviewPage, replyPage] = await Promise.all([
          base44.entities.Review.filter(
            { business: record.id, status: 'published' },
            { sort: '-created_date', limit: 100 }
          ),
          base44.entities.BusinessReply.filter({ business: record.id }, { limit: 100 }),
        ]);
        if (!active) return;
        setReviews(reviewPage.items || []);
        setReplies(replyPage.items || []);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="text-[14px] text-ink-soft">Loading your reviews…</p>;

  if (!business) {
    return (
      <EmptyState
        title="No business profile linked to you yet"
        text="Create a free profile, or claim one that a customer already added."
      >
        <Link
          to="/business/list"
          className="inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
        >
          Get started
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">Reviews</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          You can reply, flag or dispute on each review. You cannot delete a review.
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No published reviews yet"
          text="When a customer review is approved it appears here, and we email you about it."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const reply = replies.find((x) => x.review === r.id);
            return (
              <div key={r.id} className="space-y-2">
                <ReviewCard review={r} reply={reply} />
                <Link
                  to={`/business/review/${r.id}`}
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
                >
                  {reply ? 'View or flag this review' : 'Reply, flag or dispute'}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}