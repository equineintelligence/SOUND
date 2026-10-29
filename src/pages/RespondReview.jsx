import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ReviewCard from '@/components/ReviewCard';
import StatusPill from '@/components/StatusPill';
import { FLAG_REASONS } from '@/lib/sound';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'reply', label: 'Reply' },
  { key: 'flag', label: 'Flag' },
  { key: 'dispute', label: 'Dispute' },
];

export default function RespondReview() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [replies, setReplies] = useState([]);
  const [flags, setFlags] = useState([]);
  const [tab, setTab] = useState('reply');
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [reason, setReason] = useState('');
  const [flagDetails, setFlagDetails] = useState('');
  const [disputeText, setDisputeText] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    const record = await base44.entities.Review.get(id);
    setReview(record || null);
    if (record) {
      const [replyPage, flagPage] = await Promise.all([
        base44.entities.BusinessReply.filter({ review: id }, { limit: 10 }),
        base44.entities.Flag.filter({ review: id }, { limit: 10 }),
      ]);
      setReplies(replyPage.items || []);
      setFlags(flagPage.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const sendReply = async () => {
    setBusy(true);
    await base44.entities.BusinessReply.create({
      review: id,
      business: review.business,
      text: replyText.trim(),
      status: 'pending',
    });
    setReplyText('');
    setNotice('Your reply is with a moderator. It appears under the review once approved.');
    setBusy(false);
    load();
  };

  const sendFlag = async (type) => {
    setBusy(true);
    await base44.entities.Flag.create({
      review: id,
      business: review.business,
      type,
      reason: type === 'policy_breach' ? reason : 'Factual dispute',
      details: type === 'policy_breach' ? flagDetails.trim() : disputeText.trim(),
      status: 'open',
    });
    setReason('');
    setFlagDetails('');
    setDisputeText('');
    setNotice(
      type === 'policy_breach'
        ? 'A moderator will look at this within 5 business days.'
        : 'A moderator will ask the customer to support that claim. Your business details are never shared with them, and their identity and documents are never shared with you.'
    );
    setBusy(false);
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading the review…</p>;
  if (!review) return <p className="text-[14px] text-ink-soft">That review is no longer available.</p>;

  return (
    <div className="space-y-6">
      <Link to="/business/reviews" className="inline-flex min-h-[44px] items-center text-[14px] font-medium text-brand">
        Back to reviews
      </Link>

      <ReviewCard review={review} reply={replies.find((r) => r.status === 'published')} showStatus />

      {replies.some((r) => r.status === 'pending') && (
        <p className="rounded-2xl border border-hairline bg-surface px-4 py-3 text-[13px] text-ink-soft">
          Your reply is waiting for a moderator.
        </p>
      )}

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'min-h-[44px] flex-1 rounded-2xl border text-[14px] font-semibold transition-colors duration-200',
              tab === t.key
                ? 'border-brand bg-brand text-white'
                : 'border-hairline bg-white text-ink-soft hover:bg-brand-soft/40'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {notice && (
        <p className="rounded-2xl border border-hairline bg-brand-soft/60 px-4 py-3 text-[13px] leading-relaxed text-ink">
          {notice}
        </p>
      )}

      {tab === 'reply' && (
        <div className="space-y-3">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            One public reply per review. Keep it to the service, and leave out the reviewer's personal
            details.
          </p>
          <textarea
            rows={5}
            maxLength={600}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full rounded-2xl border border-hairline bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
          <p className="text-right text-[12px] text-ink-soft">{replyText.length} / 600</p>
          <button
            type="button"
            disabled={replyText.trim().length < 10 || busy}
            onClick={sendReply}
            className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'Sending…' : 'Send reply for checking'}
          </button>
        </div>
      )}

      {tab === 'flag' && (
        <div className="space-y-3">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Flag a policy breach. A moderator keeps, edits or removes the review within 5 business
            days.
          </p>
          <div className="space-y-2">
            {FLAG_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  'flex min-h-[48px] w-full items-center gap-3 rounded-2xl border px-4 text-left text-[14px] transition-colors duration-200',
                  reason === r ? 'border-brand bg-brand-soft/60 text-ink' : 'border-hairline bg-white text-ink-soft'
                )}
              >
                <span
                  className={cn(
                    'h-5 w-5 shrink-0 rounded-full border',
                    reason === r ? 'border-brand bg-brand' : 'border-hairline'
                  )}
                />
                {r}
              </button>
            ))}
          </div>
          <textarea
            rows={4}
            value={flagDetails}
            onChange={(e) => setFlagDetails(e.target.value)}
            placeholder="What is the problem?"
            className="w-full rounded-2xl border border-hairline bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-brand"
          />
          <button
            type="button"
            disabled={!reason || busy}
            onClick={() => sendFlag('policy_breach')}
            className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'Sending…' : 'Send flag'}
          </button>
        </div>
      )}

      {tab === 'dispute' && (
        <div className="space-y-3">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Which statement is not true? A moderator will ask the customer to support it. If they
            cannot, the claim is edited out or the review is removed. The customer's identity and
            their documents are never shared with you.
          </p>
          <textarea
            rows={5}
            value={disputeText}
            onChange={(e) => setDisputeText(e.target.value)}
            placeholder="Quote the statement you dispute and say what actually happened."
            className="w-full rounded-2xl border border-hairline bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-brand"
          />
          <button
            type="button"
            disabled={disputeText.trim().length < 20 || busy}
            onClick={() => sendFlag('factual_dispute')}
            className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'Sending…' : 'Send dispute'}
          </button>
        </div>
      )}

      {flags.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-[16px] font-semibold text-ink">Your flags and disputes</h2>
          {flags.map((f) => (
            <div key={f.id} className="rounded-2xl border border-hairline bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-ink">
                  {f.type === 'policy_breach' ? 'Policy breach' : 'Factual dispute'}
                </p>
                <StatusPill status={f.status} />
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                {f.reason}
                {f.details ? ` · ${f.details}` : ''}
              </p>
              {f.outcome && <p className="mt-1 text-[13px] text-brand">Outcome: {f.outcome}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}