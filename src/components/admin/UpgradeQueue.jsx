import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { REQUEST_STATUS, invoiceDueDate, invoiceNumber, money } from '@/lib/plans';
import { fieldClass } from '@/lib/yard';

const today = () => new Date().toISOString().slice(0, 10);

export default function UpgradeQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amounts, setAmounts] = useState({});
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const page = await base44.entities.UpgradeRequest.list({ sort: '-created_date', limit: 100 });
    setRequests(page.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (request, changes) => {
    setBusy(request.id);
    await base44.entities.UpgradeRequest.update(request.id, changes);
    setBusy('');
    load();
  };

  const createInvoice = (request) => {
    const amount = Number(amounts[request.id]);
    if (!amount) return;
    return patch(request, {
      status: 'invoiced',
      invoice_number: invoiceNumber(),
      invoice_amount: amount,
      invoice_date: today(),
      invoice_due: invoiceDueDate(14),
    });
  };

  const activate = async (request) => {
    setBusy(request.id);
    const page = await base44.entities.Membership.filter({ user_id: request.user_id }, { limit: 1 });
    const existing = (page.items || [])[0];
    const details = {
      user_email: request.user_email,
      user_name: request.user_name,
      status: 'active',
    };
    if (existing) {
      const upgrade =
        request.request_type === 'pro' ? { plan: 'pro' } : { business_membership: true };
      await base44.entities.Membership.update(existing.id, { ...details, ...upgrade });
    } else {
      await base44.entities.Membership.create({
        user_id: request.user_id,
        ...details,
        plan: request.request_type === 'pro' ? 'pro' : 'free',
        business_membership: request.request_type === 'business',
        started_date: today(),
      });
    }
    await base44.entities.UpgradeRequest.update(request.id, { status: 'approved' });
    setBusy('');
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading requests…</p>;

  if (requests.length === 0) {
    return (
      <p className="rounded-2xl border border-hairline bg-white px-4 py-6 text-center text-[13.5px] text-ink-soft">
        No upgrade requests yet. Member requests land here for invoicing and approval.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request.id} className="rounded-2xl border border-hairline bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-heading text-[15px] font-semibold text-ink">{request.user_name}</p>
              <p className="truncate text-[12.5px] text-ink-soft">{request.user_email}</p>
            </div>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-[11.5px] font-semibold text-brand">
              {REQUEST_STATUS[request.status] || request.status}
            </span>
          </div>

          <p className="mt-2 text-[13px] font-medium text-ink">
            {request.request_type === 'pro' ? 'Pro membership' : 'Business membership'}
            {request.business_name ? ` · ${request.business_name}` : ''}
          </p>

          {request.message && (
            <p className="mt-1 rounded-xl bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-ink-soft">
              {request.message}
            </p>
          )}

          {request.invoice_number && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
              {request.invoice_number} · {money(request.invoice_amount)} · due{' '}
              {request.invoice_due}
              <Link to={`/invoice/${request.id}`} className="font-semibold text-brand">
                View invoice
              </Link>
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {request.status === 'submitted' && (
              <>
                <Input
                  type="number"
                  min="0"
                  value={amounts[request.id] || ''}
                  onChange={(e) =>
                    setAmounts((prev) => ({ ...prev, [request.id]: e.target.value }))
                  }
                  placeholder="Amount (R)"
                  className={`${fieldClass} h-10 w-32`}
                />
                <button
                  type="button"
                  disabled={busy === request.id}
                  onClick={() => createInvoice(request)}
                  className="inline-flex min-h-[40px] items-center rounded-xl bg-brand px-4 text-[13px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
                >
                  Create invoice
                </button>
              </>
            )}

            {request.status === 'invoiced' && (
              <button
                type="button"
                disabled={busy === request.id}
                onClick={() => patch(request, { status: 'paid' })}
                className="inline-flex min-h-[40px] items-center rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40 disabled:opacity-40"
              >
                Mark as paid
              </button>
            )}

            {(request.status === 'paid' || request.status === 'invoiced') && (
              <button
                type="button"
                disabled={busy === request.id}
                onClick={() => activate(request)}
                className="inline-flex min-h-[40px] items-center rounded-xl bg-brand px-4 text-[13px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
              >
                Activate access
              </button>
            )}

            {request.status !== 'approved' && request.status !== 'declined' && (
              <button
                type="button"
                disabled={busy === request.id}
                onClick={() => patch(request, { status: 'declined' })}
                className="inline-flex min-h-[40px] items-center rounded-xl px-3 text-[13px] font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/5 disabled:opacity-40"
              >
                Decline
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}