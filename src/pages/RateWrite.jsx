import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StepProgress from '@/components/StepProgress';
import RatingRow from '@/components/RatingRow';
import { SERVICES, monthOptions } from '@/lib/sound';
import { readDraft, writeDraft } from '@/lib/draft';

const STEPS = ['Topic', 'Rating', 'Proof'];
const MONTHS = monthOptions();

export default function RateWrite() {
  const navigate = useNavigate();
  const businessId = new URLSearchParams(window.location.search).get('business');
  const draft = readDraft();

  const [ratings, setRatings] = useState({
    overall_rating: draft.overall_rating || 0,
    criterion_horse_care: draft.criterion_horse_care || 0,
    criterion_communication: draft.criterion_communication || 0,
    criterion_value: draft.criterion_value || 0,
    criterion_professionalism: draft.criterion_professionalism || 0,
    criterion_facilities: draft.criterion_facilities || 0,
  });
  const [business, setBusiness] = useState(null);
  const [serviceUsed, setServiceUsed] = useState(draft.service_used || '');
  const [month, setMonth] = useState(draft.month_of_service || '');
  const [text, setText] = useState(draft.text || '');

  useEffect(() => {
    let active = true;
    (async () => {
      const record = await base44.entities.Business.get(businessId);
      if (active) setBusiness(record || null);
    })();
    return () => {
      active = false;
    };
  }, [businessId]);

  const set = (key) => (value) => setRatings((prev) => ({ ...prev, [key]: value }));

  const canContinue =
    ratings.overall_rating > 0 && text.trim().length >= 20 && serviceUsed && month;

  return (
    <div className="space-y-6">
      <StepProgress step={2} labels={STEPS} />

      <div>
        <h1 className="font-heading text-[24px] font-bold leading-tight text-ink">
          Rate and write your review
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          {business ? business.name : 'This business'}
          {business && business.area ? ` · ${business.area}` : ''}
        </p>
      </div>

      <section className="space-y-1 rounded-2xl border border-hairline bg-white p-5">
        <RatingRow label="Overall" value={ratings.overall_rating} onChange={set('overall_rating')} />
        <RatingRow
          label="Horse care"
          value={ratings.criterion_horse_care}
          onChange={set('criterion_horse_care')}
        />
        <RatingRow
          label="Communication"
          value={ratings.criterion_communication}
          onChange={set('criterion_communication')}
        />
        <RatingRow label="Value" value={ratings.criterion_value} onChange={set('criterion_value')} />
        <RatingRow
          label="Professionalism"
          value={ratings.criterion_professionalism}
          onChange={set('criterion_professionalism')}
        />
        <RatingRow
          label="Facilities"
          value={ratings.criterion_facilities}
          onChange={set('criterion_facilities')}
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-ink" htmlFor="service">
            Service you used
          </label>
          <select
            id="service"
            value={serviceUsed}
            onChange={(e) => setServiceUsed(e.target.value)}
            className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand"
          >
            <option value="">Choose a service</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-ink" htmlFor="month">
            Month of service
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand"
          >
            <option value="">Choose a month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[14px] font-medium text-ink" htmlFor="review-text">
          Your review
        </label>
        <textarea
          id="review-text"
          value={text}
          maxLength={1000}
          rows={7}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-2xl border border-hairline bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        <p className="text-right text-[12px] text-ink-soft">{text.length} / 1000</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface p-4 text-[13px] leading-relaxed text-ink-soft">
        Describe what happened and how it affected you. Stick to your own experience, not what others
        told you. Avoid labels like liar or thief, and leave out personal details.
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={() => {
          writeDraft({ ...ratings, service_used: serviceUsed, month_of_service: month, text });
          navigate(`/write/proof?business=${businessId}`);
        }}
        className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
      >
        Continue
      </button>
      {!canContinue && (
        <p className="text-center text-[12px] text-ink-soft">
          Rate the service overall, choose a service and month, and write at least a couple of
          sentences.
        </p>
      )}
    </div>
  );
}