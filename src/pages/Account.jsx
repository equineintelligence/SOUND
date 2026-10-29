import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PlanCard from '@/components/upgrade/PlanCard';
import useAccess from '@/hooks/useAccess';

export default function Account() {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const access = useAccess();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!active) return;
        setUser(me || null);
        if (me) {
          const owned = await base44.entities.Business.filter({ claimed_by: me.id }, { limit: 1 });
          if (!active) return;
          setBusiness((owned.items || [])[0] || null);
        }
      } catch (err) {
        console.error('Could not load your account', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="text-[14px] text-ink-soft">Loading your account…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">Account</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Sound is login-only during the pilot, so every review comes from a verified rider.
        </p>
      </div>

      <section className="rounded-2xl border border-hairline bg-white p-5">
        <p className="font-heading text-[16px] font-semibold text-ink">
          {user ? user.full_name : 'Signed in'}
        </p>
        <p className="mt-0.5 text-[13px] text-ink-soft">{user ? user.email : ''}</p>
      </section>

      {!access.loading && <PlanCard access={access} />}

      <section className="space-y-2">
        <h2 className="font-heading text-[16px] font-semibold text-ink">For businesses</h2>
        {business ? (
          <Link
            to="/business"
            className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3 transition-colors duration-200 hover:bg-brand-soft/40"
          >
            <Store className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.9} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-ink">Business dashboard</span>
              <span className="block truncate text-[12px] text-ink-soft">{business.name}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={2} />
          </Link>
        ) : (
          <>
            <Link
              to="/business/list"
              className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3 transition-colors duration-200 hover:bg-brand-soft/40"
            >
              <Store className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.9} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">
                  Create a business profile
                </span>
                <span className="block text-[12px] text-ink-soft">
                  Business membership, billed by invoice
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={2} />
            </Link>
            <Link
              to="/business/claim"
              className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3 transition-colors duration-200 hover:bg-brand-soft/40"
            >
              <ShieldCheck className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.9} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">
                  Already listed? Claim your profile
                </span>
                <span className="block text-[12px] text-ink-soft">
                  Business membership · verify ownership to manage it
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={2} />
            </Link>
          </>
        )}
      </section>

      {user && user.role === 'admin' && (
        <section className="space-y-2">
          <h2 className="font-heading text-[16px] font-semibold text-ink">Moderation</h2>
          <Link
            to="/admin"
            className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3 transition-colors duration-200 hover:bg-brand-soft/40"
          >
            <ShieldCheck className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.9} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-ink">Moderation desk</span>
              <span className="block text-[12px] text-ink-soft">
                Reviews, businesses, claims, flags and replies
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={2} />
          </Link>
        </section>
      )}

      <button
        type="button"
        onClick={() => base44.auth.logout()}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-hairline px-5 text-[15px] font-semibold text-ink transition-colors duration-200 hover:bg-surface"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} />
        Log out
      </button>
    </div>
  );
}