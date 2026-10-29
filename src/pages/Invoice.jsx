import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Printer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import InvoiceSheet from '@/components/invoice/InvoiceSheet';

export default function Invoice() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const record = await base44.entities.UpgradeRequest.get(id);
        if (active) setRequest(record);
      } catch (err) {
        if (active) setRequest(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const back = (
    <Link
      to="/account"
      className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-ink-soft transition-colors duration-200 hover:text-brand"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      Account
    </Link>
  );

  if (loading) return <p className="py-6 text-[14px] text-ink-soft">Loading the invoice…</p>;

  if (!request || !request.invoice_number) {
    return (
      <div className="space-y-4">
        {back}
        <p className="rounded-2xl border border-hairline bg-white px-4 py-6 text-center text-[13.5px] text-ink-soft">
          This invoice is not available yet. The Sound team issues it once your request is processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {back}
      <InvoiceSheet request={request} />
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-hairline bg-white px-5 text-[14px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
      >
        <Printer className="h-4 w-4" strokeWidth={2} />
        Print or save as PDF
      </button>
    </div>
  );
}