import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ProofLink from '@/components/admin/ProofLink';

export default function BusinessQueue() {
  const [pending, setPending] = useState([]);
  const [targets, setTargets] = useState([]);
  const [mergeChoice, setMergeChoice] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = async () => {
    const [pendingPage, allPage] = await Promise.all([
      base44.entities.Business.filter({ status: 'pending_check' }, { sort: 'created_date', limit: 50 }),
      base44.entities.Business.filter(
        { status: { $in: ['unclaimed', 'claimed'] } },
        { sort: 'name', limit: 200 }
      ),
    ]);
    setPending(pendingPage.items || []);
    setTargets(allPage.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (business) => {
    setBusyId(business.id);
    await base44.entities.Business.update(business.id, {
      status: business.source === 'owner' ? 'claimed' : 'unclaimed',
      claimed_by: business.source === 'owner' ? business.created_by_id : '',
    });
    if (business.source === 'customer') {
      try {
        await base44.functions.invoke('notifyBusiness', {
          kind: 'claim_invite',
          business_id: business.id,
        });
      } catch (err) {
        /* the listing notice is best effort */
      }
    }
    setBusyId(null);
    load();
  };

  const reject = async (business) => {
    setBusyId(business.id);
    await base44.entities.Business.delete(business.id);
    setBusyId(null);
    setConfirmId(null);
    load();
  };

  const merge = async (business) => {
    const targetId = mergeChoice[business.id];
    if (!targetId) return;
    setBusyId(business.id);
    const target = await base44.entities.Business.get(targetId);
    const reviews = await base44.entities.Review.filter({ business: business.id }, { limit: 200 });
    for (const review of reviews.items || []) {
      await base44.entities.Review.update(review.id, {
        business: targetId,
        business_name: target ? target.name : review.business_name,
      });
    }
    await base44.entities.Business.delete(business.id);
    setBusyId(null);
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading the business queue…</p>;
  if (!pending.length) return <p className="text-[14px] text-ink-soft">Nothing waiting for approval.</p>;

  return (
    <div className="space-y-4">
      {pending.map((b) => (
        <article key={b.id} className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
          <div>
            <p className="font-heading text-[16px] font-semibold text-ink">{b.name}</p>
            <p className="text-[13px] text-ink-soft">
              {(b.type || []).join(' · ')}
              {b.area ? ` · ${b.area}` : ''}
            </p>
            <p className="mt-1 text-[12px] text-ink-soft">
              Added by the {b.source === 'owner' ? 'business (claims ownership)' : 'customer'}
              {b.website ? ` · ${b.website}` : ''}
              {b.contact_email ? ` · ${b.contact_email}` : ''}
            </p>
          </div>

          {b.description && (
            <p className="rounded-xl bg-surface p-4 text-[14px] leading-relaxed text-ink">
              {b.description}
            </p>
          )}

          {(b.photos || []).length > 0 && (
            <p className="text-[13px] text-ink-soft">{b.photos.length} photo(s) attached</p>
          )}

          <ProofLink fileUri={b.ownership_proof} label="Open ownership proof" />

          <label className="block space-y-1.5">
            <span className="text-[13px] text-ink-soft">Merge into an existing listing</span>
            <select
              value={mergeChoice[b.id] || ''}
              onChange={(e) => setMergeChoice({ ...mergeChoice, [b.id]: e.target.value })}
              className="h-[48px] w-full rounded-xl border border-hairline bg-white px-4 text-[14px] outline-none focus:border-brand"
            >
              <option value="">Choose a listing</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.area ? ` · ${t.area}` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busyId === b.id}
              onClick={() => approve(b)}
              className="min-h-[44px] rounded-xl bg-brand px-4 text-[13px] font-semibold text-white disabled:opacity-40"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busyId === b.id || !mergeChoice[b.id]}
              onClick={() => merge(b)}
              className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink disabled:opacity-40"
            >
              Merge and remove duplicate
            </button>
            {confirmId === b.id ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2">
                <span className="text-[13px] text-ink">Delete this profile permanently?</span>
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => reject(b)}
                  className="min-h-[44px] rounded-xl bg-destructive px-4 text-[13px] font-semibold text-destructive-foreground disabled:opacity-40"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busyId === b.id}
                onClick={() => setConfirmId(b.id)}
                className="min-h-[44px] rounded-xl border border-destructive/40 px-4 text-[13px] font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/5 disabled:opacity-40"
              >
                Reject and delete
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}