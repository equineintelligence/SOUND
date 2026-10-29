import { useState } from 'react';
import { Lock } from 'lucide-react';
import UpgradeRequestDialog from '@/components/upgrade/UpgradeRequestDialog';

export default function UpgradeNotice({ plan = 'pro', title, text, business }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-hairline bg-white p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          {plan === 'business' ? 'Business membership' : 'Pro membership'}
        </span>
        <h2 className="mt-3 font-heading text-[18px] font-semibold leading-snug text-ink">{title}</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{text}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Request access
        </button>
      </div>

      <UpgradeRequestDialog
        open={open}
        onOpenChange={setOpen}
        requestType={plan}
        business={business}
      />
    </>
  );
}