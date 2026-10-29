import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ProofLink from '@/components/admin/ProofLink';

export default function ClaimQueue() {
  const [claims, setClaims] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const [claimPage, businessPage] = await Promise.all([
      base44.entities.BusinessClaim.filter({ status: 'pending' }, { sort: 'created_date', limit: 50 }),
      base44.entities.Business.list({ limit: 200 }),
    ]);
    setClaims(claimPage.items || []);
    setBusinesses(businessPage.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (claim) => {
    setBusyId(claim.id);
    await base44.entities.Business.update(claim.business, {
      status: 'claimed',
      claimed_by: claim.created_by_id,
    });
    await base44.entities.BusinessClaim.update(claim.id, { status: 'approved' });
    setBusyId(null);
    load();
  };

  const reject = async (claim) => {
    setBusyId(claim.id);
    await base44.entities.BusinessClaim.update(claim.id, {
      status: 'rejected',
      moderator_note: 'Ownership could not be verified.',
    });
    setBusyId(null);
    load();
  };

  if (loading) return <p className="text-[14px] text-ink-soft">Loading claims…</p>;
  if (!claims.length) return <p className="text-[14px] text-ink-soft">No claims waiting.</p>;

  return (
    <div className="space-y-4">
      {claims.map((c) => {
        const business = businesses.find((b) => b.id === c.business);
        return (
          <article key={c.id} className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
            <div>
              <p className="font-heading text-[16px] font-semibold text-ink">
                {business ? business.name : 'Business removed'}
              </p>
              <p className="text-[13px] text-ink-soft">
                {c.contact_name} · {c.contact_email}
                {c.role_at_business ? ` · ${c.role_at_business}` : ''}
              </p>
            </div>
            <ProofLink fileUri={c.proof_uri} label="Open ownership proof" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => approve(c)}
                className="min-h-[44px] rounded-xl bg-brand px-4 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                Approve claim
              </button>
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => reject(c)}
                className="min-h-[44px] rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink-soft disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}