import Stars from '@/components/Stars';
import StatusPill from '@/components/StatusPill';
import { TOPIC_LABELS } from '@/lib/sound';

const monthLabel = (value) => {
  if (!value) return '';
  const [y, m] = value.split('-');
  if (!y || !m) return value;
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString('en-ZA', { month: 'long', year: 'numeric' });
};

export default function ReviewCard({ review, reply, showStatus, actions }) {
  return (
    <article className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-[15px] font-semibold text-ink">{review.display_name}</p>
          <p className="text-[12px] text-ink-soft">
            {[TOPIC_LABELS[review.topic], review.service_used, monthLabel(review.month_of_service)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Stars value={review.overall_rating} size={15} />
          {showStatus && <StatusPill status={review.status} />}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-ink">{review.text}</p>

      {review.moderator_note && (
        <p className="mt-3 rounded-xl bg-[#F7EFE5] px-3 py-2 text-[13px] text-[#A8692A]">
          Moderator note: {review.moderator_note}
        </p>
      )}

      {reply && (
        <div className="mt-3 rounded-xl border-l-2 border-brand bg-brand-soft/60 px-3 py-2.5">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">
            Reply from the business
          </p>
          <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-ink">{reply.text}</p>
        </div>
      )}

      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}