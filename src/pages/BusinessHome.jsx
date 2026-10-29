import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Share2, CheckCircle2, Circle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Rosette from '@/components/Rosette';
import { rosetteTone } from '@/lib/sound';
import Stars from '@/components/Stars';
import EmptyState from '@/components/EmptyState';
import { appUrl } from '@/lib/basePath';

const TASKS = [
  { key: 'description', label: 'Write a description' },
  { key: 'area', label: 'Add your town or area' },
  { key: 'phone', label: 'Add a phone number' },
  { key: 'website', label: 'Add a website' },
  { key: 'services', label: 'List your services' },
  { key: 'photos', label: 'Add photos' },
  { key: 'opening_hours', label: 'Add opening hours' },
];

export default function BusinessHome() {
  const [business, setBusiness] = useState(null);
  const [rosettes, setRosettes] = useState([]);
  const [waiting, setWaiting] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

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
        const [rosettePage, reviewPage, replyPage] = await Promise.all([
          base44.entities.Rosette.filter({ business: record.id, status: 'active' }, { limit: 10 }),
          base44.entities.Review.filter({ business: record.id, status: 'published' }, { limit: 200 }),
          base44.entities.BusinessReply.filter({ business: record.id, status: 'published' }, { limit: 200 }),
        ]);
        if (!active) return;
        setRosettes(rosettePage.items || []);
        const replied = new Set((replyPage.items || []).map((r) => r.review));
        setWaiting((reviewPage.items || []).filter((r) => !replied.has(r.id)).length);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="text-[14px] text-ink-soft">Loading your business…</p>;

  if (!business) {
    return (
      <EmptyState
        title="No business profile linked to you yet"
        text="Create a free profile, or claim one that a customer already added."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/business/create"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
          >
            Create a free profile
          </Link>
          <Link
            to="/business/claim"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-hairline px-5 text-[14px] font-semibold text-ink"
          >
            Claim your profile
          </Link>
        </div>
      </EmptyState>
    );
  }

  if (business.status !== 'claimed') {
    return (
      <EmptyState
        title="Your profile is waiting for approval"
        text="A moderator is verifying your details. You can reply to reviews and share rosettes once it is live."
      >
        <Link
          to="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
        >
          Back to Discover
        </Link>
      </EmptyState>
    );
  }

  const done = TASKS.filter((t) => {
    const value = business[t.key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  const percent = Math.round((done.length / TASKS.length) * 100);
  const missing = TASKS.filter((t) => !done.includes(t));

  const share = async () => {
    const url = `${window.location.origin}${appUrl(`/business/${business.id}`)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text: `See ${business.name} on Sound`, url });
        return;
      } catch (err) {
        /* the person closed the share sheet */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch (err) {
      setShared(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
          {business.name}
        </h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          {(business.type || []).join(' · ')}
          {business.area ? ` · ${business.area}` : ''}
        </p>
      </div>

      {rosettes.length > 0 && (
        <section className="flex flex-col items-center rounded-2xl border border-tan/40 bg-[#F7EFE5] p-5 text-center">
          <Rosette size={104} tone={rosetteTone(business.rating_overall)}>
            <span className="font-heading text-[22px] font-bold leading-none">
              {business.rating_overall ? business.rating_overall.toFixed(1) : '–'}
            </span>
          </Rosette>
          <p className="mt-4 font-heading text-[17px] font-semibold text-ink">
            You earned a {rosettes[0].category_label || 'community'} rosette {rosettes[0].year}
          </p>
          <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-soft">
            Riders rated you this highly from verified reviews. Share it on your own channels.
          </p>
          <button
            type="button"
            onClick={share}
            className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            <Share2 className="h-4 w-4" strokeWidth={2} />
            {shared ? 'Link copied' : 'Share your rosette'}
          </button>
        </section>
      )}

      <section className="flex items-center gap-5 rounded-2xl border border-hairline bg-white p-5">
        <Rosette size={92} tone={rosetteTone(business.rating_overall)}>
          <span className="font-heading text-[22px] font-bold leading-none">
            {business.rating_overall ? business.rating_overall.toFixed(1) : '–'}
          </span>
          <span className="mt-0.5 text-[10px] opacity-90">
            {business.review_count || 0} {(business.review_count || 0) === 1 ? 'review' : 'reviews'}
          </span>
        </Rosette>
        <div>
          <Stars value={business.rating_overall || 0} size={18} />
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Your average from verified customers. It is calculated from published reviews only.
          </p>
        </div>
      </section>

      <Link
        to="/business/reviews"
        className="flex items-center gap-4 rounded-2xl border border-hairline bg-white p-5 transition-colors duration-200 hover:bg-brand-soft/40"
      >
        <MessageSquare className="h-6 w-6 shrink-0 text-brand" strokeWidth={1.9} />
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[16px] font-semibold text-ink">
            {waiting} {waiting === 1 ? 'review' : 'reviews'} waiting for your reply
          </span>
          <span className="block text-[13px] text-ink-soft">
            One public reply per review, moderated before it appears.
          </span>
        </span>
      </Link>

      <section className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-[16px] font-semibold text-ink">Profile completeness</h2>
          <span className="font-heading text-[15px] font-semibold text-brand">{percent}%</span>
        </div>
        <span className="block h-2 overflow-hidden rounded-full bg-surface">
          <span className="block h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
        </span>
        <ul className="space-y-2 pt-1">
          {TASKS.map((t) => {
            const complete = done.includes(t);
            return (
              <li key={t.key} className="flex items-center gap-2 text-[13px]">
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-hairline" strokeWidth={2} />
                )}
                <span className={complete ? 'text-ink-soft line-through' : 'text-ink'}>{t.label}</span>
              </li>
            );
          })}
        </ul>
        {missing.length > 0 && (
          <Link
            to="/business/profile"
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
          >
            Finish your profile
          </Link>
        )}
      </section>
    </div>
  );
}