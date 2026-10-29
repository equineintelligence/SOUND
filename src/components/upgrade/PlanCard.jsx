import { useState } from 'react';
import UpgradeRequestDialog from '@/components/upgrade/UpgradeRequestDialog';
import { PLAN_LABELS, planSummary } from '@/lib/plans';

export default function PlanCard({ access }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-hairline bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-[16px] font-semibold text-ink">Your plan</h2>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-semibold text-brand">
          {PLAN_LABELS[access.plan]}
        </span>
      </div>

      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
        Reviews stay free on every plan, and your yard holds {planSummary(access.plan)}.
        {access.canLearn
          ? ' The full Learn library is open to you.'
          : ' The Learn library is part of Pro.'}
      </p>

      {access.membership?.business_membership && (
        <p className="mt-2 text-[13px] font-medium text-brand">Business membership active</p>
      )}

      {access.plan === 'free' && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Upgrade to Pro
        </button>
      )}

      <UpgradeRequestDialog open={open} onOpenChange={setOpen} requestType="pro" />
    </section>
  );
}