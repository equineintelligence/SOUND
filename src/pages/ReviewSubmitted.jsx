import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Rosette from '@/components/Rosette';

const TIMELINE = [
  { title: 'Submitted', text: 'Your review and your proof of custom are with us.' },
  {
    title: 'Checked by a moderator',
    text: 'Usually within 3 business days. We check it against the Content Policy, not whether you are right.',
  },
  {
    title: 'Published',
    text: 'It appears on the business profile and the business is notified. They can reply once.',
  },
];

export default function ReviewSubmitted() {
  return (
    <div className="space-y-7">
      <div className="flex flex-col items-center pt-4 text-center">
        <Rosette size={112}>
          <Check className="h-10 w-10" strokeWidth={2.6} />
        </Rosette>
        <h1 className="mt-5 font-heading text-[26px] font-bold leading-tight text-ink">
          Thanks, your review is in
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
          You can edit or withdraw it at any time from My reviews.
        </p>
      </div>

      <ol className="space-y-3">
        {TIMELINE.map((t, i) => (
          <li key={t.title} className="flex gap-4 rounded-2xl border border-hairline bg-white p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft font-heading text-[13px] font-semibold text-brand">
              {i + 1}
            </span>
            <span>
              <span className="block font-heading text-[15px] font-semibold text-ink">{t.title}</span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-soft">{t.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/my-reviews"
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Go to My reviews
        </Link>
        <Link
          to="/"
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl border border-hairline px-5 text-[15px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
        >
          Back to Discover
        </Link>
      </div>
    </div>
  );
}