import { useEffect, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProofLink from '@/components/admin/ProofLink';
import Stars from '@/components/Stars';
import { TOPIC_LABELS } from '@/lib/sound';

const CHECKLIST = [
  'Reviewer verified and the proof matches the business',
  'No connection to the business (owner, employee, family, competitor)',
  'About the business service, not a private individual',
  'Opinions phrased as opinions; facts from first-hand experience',
  'No allegation of theft, fraud, cruelty or professional misconduct',
  'No personal details such as addresses, phone or identity numbers',
  'No minor identified anywhere',
  'No hate speech, threats, profanity or personal insults',
  'Not incentivised, paid for or part of a campaign',
  'Reviewer has not reviewed this business in the last 12 months',
];

export default function ReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [awaitingProfileIds, setAwaitingProfileIds] = useState([]);

  const load = async () => {
    const [page, pendingProfiles] = await Promise.all([
      base44.entities.Review.filter({ status: 'pending' }, { sort: 'created_date', limit: 50 }),
      // A published review stays hidden while its business profile is unapproved.
      base44.entities.Business.filter({ status: 'pending_check' }, { limit: 100 }),
    ]);
    setReviews(page.items || []);
    setAwaitingProfileIds((pendingProfiles.items || []).map((b) => b.id));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (review, status) => {
    setBusyId(review.id);
    if (status === 'published') {
      const business = await base44.entities.Business.get(review.business);
      await base44.entities.Review.update(review.id, {
        status: 'published',
        published_date: new Date().toISOString(),
        business_owner_id: business && business.claimed_by ? business.claimed_by : '',
        moderator_note: '',
      });
      if (business) {
        try {
          await base44.functions.invoke('updateBusinessStandings', { business_id: business.id });
        } catch (err) {
          /* standings refresh is best effort */
        }
        try {
          await base44.functions.invoke('notifyBusiness', {
            kind: 'review_published',
            business_id: business.id,
          });
        } catch (err) {
          /* the business notice is best effort */
        }
      }
    } else {
      await base44.entities.Review.update(review.id, {
        status,
        moderator_note: notes[review.id] || 'This review does not follow the Content Policy.',
      });
    }
    setBusyId(null);
    load();
  };

  const remove = async (review) => {
    setBusyId(review.id);
    // The reviewer's proof document goes with the review it supports.
    await base44.entities.ProofOfCustom.deleteMany({ review: review.id });
    await base44.entities.Review.delete(review.id);
    setBusyId(null);
    setConfirmId(null);
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading the review queue…</p>;
  if (!reviews.length) return <p className="text-[14px] text-ink-soft">Nothing waiting for review.</p>;

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <article key={r.id} className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-heading text-[16px] font-semibold text-ink">{r.business_name}</p>
              <p className="text-[13px] text-ink-soft">
                {r.display_name} · {TOPIC_LABELS[r.topic] || 'Topic not set'} · {r.service_used} ·{' '}
                {r.month_of_service}
              </p>
            </div>
            <Stars value={r.overall_rating} size={15} />
          </div>

          {awaitingProfileIds.includes(r.business) && (
            <p className="rounded-xl bg-brand-soft px-3 py-2 text-[13px] leading-relaxed text-brand">
              This business profile is still waiting for approval, so the review stays hidden from
              Discover. Approve the profile under “New businesses”.
            </p>
          )}

          {r.senior_review && (
            <p className="flex gap-2 rounded-xl bg-[#F7EFE5] px-3 py-2 text-[13px] text-[#A8692A]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              Senior review needed. {(r.screening_notes || []).join(' · ')}
            </p>
          )}

          <p className="whitespace-pre-line rounded-xl bg-surface p-4 text-[14px] leading-relaxed text-ink">
            {r.text}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[13px] text-ink-soft sm:grid-cols-3">
            <span>Horse care: {r.criterion_horse_care || '–'}</span>
            <span>Communication: {r.criterion_communication || '–'}</span>
            <span>Value: {r.criterion_value || '–'}</span>
            <span>Facilities: {r.criterion_facilities || '–'}</span>
            <span>Declaration: {r.declaration_accepted ? 'accepted' : 'missing'}</span>
          </div>

          <ProofLink fileUri={r.proof_uri} label="Open proof of custom" />

          <details className="rounded-xl border border-hairline px-4 py-3">
            <summary className="cursor-pointer text-[13px] font-semibold text-ink">
              Moderator checklist
            </summary>
            <ul className="mt-2 space-y-1.5">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex gap-2 text-[13px] text-ink-soft">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2.6} />
                  {c}
                </li>
              ))}
            </ul>
          </details>

          <input
            value={notes[r.id] || ''}
            onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
            placeholder="Message to the reviewer (used when returning a review)"
            className="h-[48px] w-full rounded-xl border border-hairline bg-white px-4 text-[14px] outline-none focus:border-brand"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => decide(r, 'published')}
              className="min-h-[44px] rounded-xl bg-brand px-4 text-[13px] font-semibold text-white disabled:opacity-40"
            >
              Approve and publish
            </button>
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => decide(r, 'returned')}
              className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink disabled:opacity-40"
            >
              Return to reviewer
            </button>
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => decide(r, 'removed')}
              className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink-soft disabled:opacity-40"
            >
              Reject
            </button>
            {confirmId === r.id ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2">
                <span className="text-[13px] text-ink">Delete this review permanently?</span>
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => remove(r)}
                  className="min-h-[44px] rounded-xl bg-destructive px-4 text-[13px] font-semibold text-destructive-foreground disabled:opacity-40"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => setConfirmId(r.id)}
                className="min-h-[44px] rounded-xl border border-destructive/40 px-4 text-[13px] font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/5 disabled:opacity-40"
              >
                Delete permanently
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}