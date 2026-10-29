import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PLAN_LABELS, REQUEST_STATUS } from '@/lib/plans';

export default function AccountsTracker() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [users, memberships, requests] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.Membership.list({ sort: '-created_date', limit: 200 }),
      base44.entities.UpgradeRequest.list({ sort: '-created_date', limit: 200 }),
    ]);

    const memberByUser = (memberships.items || []).reduce((acc, item) => {
      if (!acc[item.user_id]) acc[item.user_id] = item;
      return acc;
    }, {});
    const requestByUser = (requests.items || []).reduce((acc, item) => {
      if (!acc[item.user_id]) acc[item.user_id] = item;
      return acc;
    }, {});

    setRows(
      (users || []).map((user) => ({
        user,
        membership: memberByUser[user.id],
        request: requestByUser[user.id],
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-[14px] text-ink-soft">Loading accounts…</p>;

  const proCount = rows.filter((row) => row.membership?.plan === 'pro').length;
  const businessCount = rows.filter((row) => row.membership?.business_membership).length;
  const pendingCount = rows.filter(
    (row) => row.request && !['approved', 'declined'].includes(row.request.status)
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Pro members', value: proCount },
          { label: 'Businesses', value: businessCount },
          { label: 'Open requests', value: pendingCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-hairline bg-white px-3 py-3 text-center"
          >
            <p className="font-heading text-[20px] font-bold leading-none text-ink">{stat.value}</p>
            <p className="mt-1 text-[11.5px] text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-hairline bg-surface px-4 py-2.5 text-[11px] uppercase tracking-wide text-ink-soft">
          <span>Account</span>
          <span>Plan</span>
        </div>
        {rows.map(({ user, membership, request }) => (
          <div
            key={user.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-hairline px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-ink">{user.full_name}</p>
              <p className="truncate text-[12px] text-ink-soft">{user.email}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11.5px] text-ink-soft">
                {user.role === 'admin' && <span className="font-semibold text-brand">Admin</span>}
                {membership?.business_membership && <span>Business member</span>}
                {request && <span>Request: {REQUEST_STATUS[request.status]}</span>}
              </p>
            </div>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-semibold text-brand">
              {user.role === 'admin'
                ? PLAN_LABELS.admin
                : PLAN_LABELS[membership?.plan === 'pro' ? 'pro' : 'free']}
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-[13px] text-ink-soft">No accounts yet.</p>
        )}
      </div>
    </div>
  );
}