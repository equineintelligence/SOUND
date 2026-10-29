import { Link } from 'react-router-dom';
import { Check, Star, MapPin, MessageSquare } from 'lucide-react';
import Rosette from '@/components/Rosette';

const BENEFITS = [
  { icon: MapPin, title: 'Get found nearby', text: 'Riders searching your area see your profile first.' },
  { icon: Star, title: 'Earn community rosettes', text: 'Rosettes come from verified reviews, never from payment.' },
  { icon: MessageSquare, title: 'Reply to every review', text: 'One public reply per review, moderated like the review.' },
];

export default function BusinessLanding() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col items-center pt-4 text-center">
        <Rosette size={104}>
          <span className="font-heading text-[15px] font-bold leading-tight">FREE</span>
          <span className="text-[10px] opacity-90">PROFILE</span>
        </Rosette>
        <h1 className="mt-5 font-heading text-[27px] font-bold leading-tight text-ink">
          Show riders what you do best
        </h1>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
          A free Sound profile puts your yard, school or practice in front of the riders looking for
          exactly what you offer.
        </p>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Check className="h-4 w-4" strokeWidth={2.6} />
          </span>
          <span>
            <span className="block text-[14px] font-semibold text-ink">A free profile, always</span>
            <span className="block text-[13px] text-ink-soft">
              List your services, photos, area and contact details.
            </span>
          </span>
        </div>
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <b.icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-ink">{b.title}</span>
              <span className="block text-[13px] text-ink-soft">{b.text}</span>
            </span>
          </div>
        ))}
      </section>

      <section className="space-y-2 rounded-2xl border border-hairline bg-surface p-5">
        <h2 className="font-heading text-[16px] font-semibold text-ink">Fair for everyone</h2>
        <p className="text-[14px] leading-relaxed text-ink-soft">
          No business can pay to remove, hide or reorder a review. Rosettes are earned only through
          verified reviews. Reviews stay up unless they break the Content Policy.
        </p>
      </section>

      <div className="space-y-3">
        <Link
          to="/business/create"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Create your free profile
        </Link>
        <Link
          to="/business/claim"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-hairline px-5 text-[15px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
        >
          Already listed? Claim your profile
        </Link>
      </div>
    </div>
  );
}