import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SoundLogo from '@/components/SoundLogo';
import EmptyState from '@/components/EmptyState';
import ReviewQueue from '@/components/admin/ReviewQueue';
import BusinessQueue from '@/components/admin/BusinessQueue';
import ClaimQueue from '@/components/admin/ClaimQueue';
import FlagQueue from '@/components/admin/FlagQueue';
import ReplyQueue from '@/components/admin/ReplyQueue';
import UpgradeQueue from '@/components/admin/UpgradeQueue';
import AccountsTracker from '@/components/admin/AccountsTracker';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'reviews', label: 'Reviews' },
  { key: 'businesses', label: 'New businesses' },
  { key: 'claims', label: 'Claims' },
  { key: 'flags', label: 'Flags and disputes' },
  { key: 'replies', label: 'Replies' },
  { key: 'upgrades', label: 'Upgrade requests' },
  { key: 'accounts', label: 'Accounts' },
];

export default function AdminDesk() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reviews');

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await base44.auth.me();
      if (!active) return;
      setUser(me || null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="px-5 py-8 text-[14px] text-ink-soft">Loading the desk…</p>;

  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <EmptyState
          title="The moderation desk is for moderators"
          text="Ask a Sound administrator to give you the moderator role."
        >
          <Link
            to="/"
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
          >
            Back to Discover
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-hairline bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-5 py-3">
          <SoundLogo height={32} />
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-medium text-brand">
            Moderation
          </span>
          <Link
            to="/"
            className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Exit
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-6 px-5 py-6">
        <div>
          <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
            Moderation desk
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Judge whether a review follows the rules, not whether the reviewer or the business is
            right. Proof of custom and reviewer identity are visible only here.
          </p>
        </div>

        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'min-h-[44px] shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200',
                tab === t.key
                  ? 'border-brand bg-brand text-white'
                  : 'border-hairline bg-white text-ink-soft hover:border-brand/40'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'reviews' && <ReviewQueue />}
        {tab === 'businesses' && <BusinessQueue />}
        {tab === 'claims' && <ClaimQueue />}
        {tab === 'flags' && <FlagQueue />}
        {tab === 'replies' && <ReplyQueue />}
        {tab === 'upgrades' && <UpgradeQueue />}
        {tab === 'accounts' && <AccountsTracker />}
      </main>
    </div>
  );
}