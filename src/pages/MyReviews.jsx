import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ReviewCard from '@/components/ReviewCard';
import RatingRow from '@/components/RatingRow';
import EmptyState from '@/components/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [draftRating, setDraftRating] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const me = await base44.auth.me();
    const page = await base44.entities.Review.filter(
      { reviewer: me.id },
      { sort: '-created_date', limit: 50 }
    );
    setReviews(page.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (review) => {
    setEditing(review);
    setDraftText(review.text || '');
    setDraftRating(review.overall_rating || 0);
  };

  const saveEdit = async () => {
    setBusy(true);
    await base44.entities.Review.update(editing.id, {
      text: draftText,
      overall_rating: draftRating,
      status: 'pending',
      moderator_note: '',
    });
    setEditing(null);
    setBusy(false);
    load();
  };

  const withdraw = async (review) => {
    await base44.entities.Review.update(review.id, {
      status: 'removed',
      moderator_note: 'Withdrawn by the reviewer.',
    });
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading your reviews…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">My reviews</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          You can edit or withdraw any review you have written. An edited review goes back to a
          moderator before it is visible again.
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="You have not written a review yet"
          text="Reviews help other riders find sound yards, coaches and farriers."
        >
          <Link
            to="/write"
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
          >
            Write a review
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="space-y-2">
              <p className="font-heading text-[15px] font-semibold text-ink">{r.business_name}</p>
              <ReviewCard
                review={r}
                showStatus
                actions={
                  r.status === 'removed' ? null : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => withdraw(r)}
                        className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink-soft transition-colors duration-200 hover:bg-surface"
                      >
                        Withdraw
                      </button>
                    </>
                  )
                }
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit your review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RatingRow label="Overall" value={draftRating} onChange={setDraftRating} />
            <textarea
              value={draftText}
              maxLength={1000}
              rows={6}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-brand"
            />
            <p className="text-right text-[12px] text-ink-soft">{draftText.length} / 1000</p>
          </div>
          <DialogFooter>
            <button
              type="button"
              disabled={busy || draftText.trim().length < 20}
              onClick={saveEdit}
              className="min-h-[48px] w-full rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white disabled:opacity-40"
            >
              {busy ? 'Saving…' : 'Save and send for checking'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}