import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Phone, Mail, Globe, MapPin, PenLine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Rosette from '@/components/Rosette';
import { rosetteTone } from '@/lib/sound';
import Stars from '@/components/Stars';
import RatingBar from '@/components/RatingBar';
import ReviewCard from '@/components/ReviewCard';
import StatusPill from '@/components/StatusPill';
import EmptyState from '@/components/EmptyState';
import { Image } from '@/components/ui/image';
import { CRITERION_BARS } from '@/lib/sound';

export default function BusinessProfile() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replies, setReplies] = useState([]);
  const [rosettes, setRosettes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [biz, reviewPage, replyPage, rosettePage] = await Promise.all([
        base44.entities.Business.get(id),
        base44.entities.Review.filter({ business: id, status: 'published' }, { sort: '-created_date', limit: 50 }),
        base44.entities.BusinessReply.filter({ business: id, status: 'published' }, { limit: 50 }),
        base44.entities.Rosette.filter({ business: id, status: 'active' }, { limit: 10 }),
      ]);
      if (!active) return;
      setBusiness(biz || null);
      setReviews(reviewPage.items || []);
      setReplies(replyPage.items || []);
      setRosettes(rosettePage.items || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="text-[14px] text-ink-soft">Loading the profile…</p>;
  if (!business) {
    return <EmptyState title="We could not find that business" text="It may have been removed." />;
  }

  const rating = business.rating_overall || 0;
  const replyFor = (reviewId) => replies.find((r) => r.review === reviewId);

  return (
    <div className="space-y-8 pb-24">
      <section className="space-y-4">
        <div>
          <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">{business.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-soft">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            {(business.type || []).join(' · ')}
            {business.area ? ` · ${business.area}` : ''}
          </p>
          <div className="mt-2">
            <StatusPill status={business.status} />
          </div>
        </div>

        <div className="flex items-center gap-5 rounded-2xl border border-hairline bg-white p-5">
          <div className="flex h-[92px] w-[92px] shrink-0 flex-col items-center justify-center rounded-full bg-brand text-white">
            <span className="font-heading text-[28px] font-bold leading-none">
              {rating ? rating.toFixed(1) : '–'}
            </span>
            <span className="mt-1 text-[11px] leading-none opacity-85">out of 5</span>
          </div>
          <div className="min-w-0">
            <Stars value={rating} size={19} />
            <p className="mt-2 text-[13px] font-medium text-ink">
              {business.review_count || 0}{' '}
              {(business.review_count || 0) === 1 ? 'verified review' : 'verified reviews'}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Average from verified customers of {business.name}.
            </p>
          </div>
        </div>

        {rosettes.length > 0 && (
          <div className="space-y-2">
            {rosettes.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-2xl border border-tan/40 bg-[#F7EFE5] p-4"
              >
                <Rosette size={52} tone={rosetteTone(r.average)} />
                <div>
                  <p className="font-heading text-[15px] font-semibold text-ink">
                    {r.category_label || 'Community'} rosette {r.year}
                  </p>
                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    Earned from verified reviews. Never bought or sponsored.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-brand px-4 text-[14px] font-semibold text-white"
            >
              <Phone className="h-4 w-4" strokeWidth={2} />
              Call
            </a>
          )}
          {business.contact_email && (
            <a
              href={`mailto:${business.contact_email}`}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-hairline px-4 text-[14px] font-semibold text-ink"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              Message
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-hairline px-4 text-[14px] font-semibold text-ink"
            >
              <Globe className="h-4 w-4" strokeWidth={2} />
              Website
            </a>
          )}
        </div>
      </section>

      {business.description && (
        <section className="space-y-2">
          <h2 className="font-heading text-[18px] font-semibold text-ink">About</h2>
          <p className="text-[14px] leading-relaxed text-ink-soft">{business.description}</p>
        </section>
      )}

      {(business.services || []).length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Services</h2>
          <div className="flex flex-wrap gap-2">
            {business.services.map((s) => (
              <span
                key={s}
                className="rounded-full border border-hairline bg-white px-3 py-1.5 text-[13px] text-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {(business.photos || []).length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Photos</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {business.photos.map((p) => (
              <Image key={p} src={p} className="h-36 w-full rounded-2xl" fittingType="fill" />
            ))}
          </div>
        </section>
      )}

      {business.opening_hours && (
        <section className="space-y-2">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Opening hours</h2>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
            {business.opening_hours}
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-[18px] font-semibold text-ink">Ratings by criterion</h2>
        <div className="space-y-2.5 rounded-2xl border border-hairline bg-white p-5">
          {CRITERION_BARS.map((c) => (
            <RatingBar key={c.key} label={c.label} value={business[c.key]} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-[18px] font-semibold text-ink">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <EmptyState
            title="No published reviews yet"
            text="Be the first to share your experience of this business."
          />
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} reply={replyFor(r.id)} />
            ))}
          </div>
        )}
      </section>

      {business.status === 'unclaimed' && (
        <section className="rounded-2xl border border-hairline bg-surface p-5">
          <h2 className="font-heading text-[16px] font-semibold text-ink">Is this your business?</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            Claim this free profile to add photos and services, and to reply to reviews.
          </p>
          <Link
            to={`/business/claim?business=${business.id}`}
            className="mt-4 inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
          >
            Claim this profile
          </Link>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-[58px] z-30 border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur safe-bottom">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            to={`/write/topic?business=${business.id}`}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            <PenLine className="h-4 w-4" strokeWidth={2.2} />
            Write a review
          </Link>
        </div>
      </div>
    </div>
  );
}