import SoundLogo from '@/components/SoundLogo';
import { money, REQUEST_TYPES } from '@/lib/plans';

export default function InvoiceSheet({ request }) {
  const typeLabel =
    REQUEST_TYPES.find((item) => item.key === request.request_type)?.label || 'Membership';
  const lineItem =
    request.request_type === 'business'
      ? `Business membership${request.business_name ? ` — ${request.business_name}` : ''}`
      : 'Pro membership';

  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <div className="flex items-start justify-between gap-4 border-b border-hairline pb-5">
        <SoundLogo height={34} />
        <div className="text-right">
          <p className="font-heading text-[19px] font-bold leading-none text-ink">Invoice</p>
          <p className="mt-1 text-[12.5px] text-ink-soft">{request.invoice_number || 'Not issued'}</p>
        </div>
      </div>

      <div className="grid gap-4 py-5 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-soft">Billed to</p>
          <p className="mt-1 text-[13.5px] font-semibold text-ink">{request.user_name}</p>
          <p className="text-[12.5px] text-ink-soft">{request.user_email}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-soft">Issued</p>
          <p className="mt-1 text-[13.5px] text-ink">{request.invoice_date || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-soft">Due</p>
          <p className="mt-1 text-[13.5px] text-ink">{request.invoice_due || '—'}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-hairline bg-surface px-4 py-2.5 text-[11px] uppercase tracking-wide text-ink-soft">
          <span>Item</span>
          <span>Amount</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
          <div>
            <p className="text-[14px] font-semibold text-ink">{lineItem}</p>
            <p className="text-[12.5px] text-ink-soft">Sound {typeLabel}</p>
          </div>
          <p className="text-[14px] font-semibold text-ink">{money(request.invoice_amount)}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <p className="font-heading text-[16px] font-bold text-ink">
          Total {money(request.invoice_amount)}
        </p>
      </div>

      <p className="mt-5 border-t border-hairline pt-4 text-[12px] leading-relaxed text-ink-soft">
        Access opens on the member's account once this invoice is paid and an administrator approves
        the request. Please use the invoice number as your payment reference.
      </p>
    </div>
  );
}