import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepProgress from '@/components/StepProgress';
import { REFERRAL_TOPICS, TOPICS } from '@/lib/sound';
import { writeDraft } from '@/lib/draft';
import { cn } from '@/lib/utils';

const STEPS = ['Topic', 'Rating', 'Proof'];

export default function ChooseTopic() {
  const navigate = useNavigate();
  const businessId = new URLSearchParams(window.location.search).get('business');
  const [topic, setTopic] = useState('');

  const choose = (value) => {
    if (REFERRAL_TOPICS.some((t) => t.value === value)) {
      navigate(`/write/referral?business=${businessId}`);
      return;
    }
    setTopic(value);
  };

  const option = (value, label) => {
    const selected = topic === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => choose(value)}
        className={cn(
          'flex min-h-[52px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[14px] transition-colors duration-200',
          selected ? 'border-brand bg-brand-soft/60 text-ink' : 'border-hairline bg-white text-ink hover:bg-brand-soft/40'
        )}
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            selected ? 'border-brand' : 'border-hairline'
          )}
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
        </span>
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <StepProgress step={1} labels={STEPS} />

      <div>
        <h1 className="font-heading text-[24px] font-bold leading-tight text-ink">
          What is your review about?
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Pick the closest fit. Your review stays about the service you used.
        </p>
      </div>

      <div className="space-y-2">{TOPICS.map((t) => option(t.value, t.label))}</div>

      <div className="space-y-2">
        <h2 className="font-heading text-[16px] font-semibold text-ink">Something more serious</h2>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          These are not reviews. We will point you to the right authority instead.
        </p>
        {REFERRAL_TOPICS.map((t) => option(t.value, t.label))}
      </div>

      <p className="rounded-2xl border border-hairline bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
        Reviews are about a business and its service. They cannot be about private individuals or
        money someone owes you.
      </p>

      <button
        type="button"
        disabled={!topic}
        onClick={() => {
          writeDraft({ topic });
          navigate(`/write/rate?business=${businessId}`);
        }}
        className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}