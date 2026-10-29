import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SearchField from '@/components/SearchField';
import StatusPill from '@/components/StatusPill';
import FileField from '@/components/FileField';
import Rosette from '@/components/Rosette';
import UpgradeNotice from '@/components/upgrade/UpgradeNotice';
import useAccess from '@/hooks/useAccess';
import { initials, matchBusinesses } from '@/lib/sound';

export default function ClaimBusiness() {
  const preselect = new URLSearchParams(window.location.search).get('business');
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ contact_name: '', contact_email: '', role_at_business: '' });
  const [proof, setProof] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const access = useAccess();

  useEffect(() => {
    let active = true;
    (async () => {
      const page = await base44.entities.Business.filter(
        { status: { $in: ['unclaimed', 'claimed', 'pending_check'] } },
        { sort: 'name', limit: 200 }
      );
      if (!active) return;
      const items = page.items || [];
      setBusinesses(items);
      if (preselect) setSelected(items.find((b) => b.id === preselect) || null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [preselect]);

  const results = useMemo(() => matchBusinesses(businesses, query).slice(0, 12), [businesses, query]);

  const canSubmit =
    selected && form.contact_name.trim() && form.contact_email.trim() && proof && !busy;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await base44.entities.BusinessClaim.create({
        business: selected.id,
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        role_at_business: form.role_at_business.trim(),
        proof_uri: proof.file_uri,
        proof_name: proof.file_name,
        status: 'pending',
      });
      setDone(true);
    } catch (err) {
      setError('That could not be sent. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!access.loading && !access.businessActive) {
    return (
      <div className="space-y-5">
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
          Claim your profile
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-soft">
          Claiming or creating a business profile is part of a business membership. Leaving reviews
          on other businesses stays free.
        </p>
        <UpgradeNotice
          plan="business"
          title="Business membership needed"
          text="Request a business membership and we will send you an invoice. Claiming opens as soon as it is paid."
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center pt-6 text-center">
        <Rosette size={112}>
          <Check className="h-10 w-10" strokeWidth={2.6} />
        </Rosette>
        <h1 className="mt-5 font-heading text-[25px] font-bold leading-tight text-ink">
          Your claim is with a moderator
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
          We check your proof of ownership, usually within 3 business days. Once approved, the profile
          becomes yours and you can reply to reviews.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-2xl bg-brand px-6 text-[15px] font-semibold text-white"
        >
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
          Claim your profile
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Find your business, then show us proof that it is yours. Ownership is verified before a
          profile goes live.
        </p>
      </div>

      {!selected && (
        <>
          <SearchField value={query} onChange={setQuery} placeholder="Search for your business" />
          <div className="space-y-2.5">
            {loading && <p className="text-[14px] text-ink-soft">Looking through the directory…</p>}
            {!loading &&
              results.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(b)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-hairline bg-white px-4 py-3.5 text-left transition-colors duration-200 hover:bg-brand-soft/40"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft font-heading text-[15px] font-semibold text-brand">
                    {initials(b.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-[15px] font-semibold text-ink">
                      {b.name}
                    </span>
                    <span className="block truncate text-[13px] text-ink-soft">
                      {(b.type || []).join(' · ')}
                      {b.area ? ` · ${b.area}` : ''}
                    </span>
                  </span>
                  <StatusPill status={b.status} />
                </button>
              ))}
            {!loading && query.trim() && results.length === 0 && (
              <p className="rounded-2xl border border-hairline bg-surface px-4 py-6 text-center text-[14px] text-ink-soft">
                We cannot find that name. You can{' '}
                <Link to="/business/create" className="font-semibold text-brand">
                  create a new profile
                </Link>{' '}
                instead.
              </p>
            )}
          </div>
        </>
      )}

      {selected && (
        <>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-brand-soft/50 p-4">
            <div className="min-w-0">
              <p className="truncate font-heading text-[15px] font-semibold text-ink">
                {selected.name}
              </p>
              <p className="truncate text-[13px] text-ink-soft">
                {(selected.type || []).join(' · ')}
                {selected.area ? ` · ${selected.area}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="min-h-[44px] shrink-0 rounded-xl px-3 text-[13px] font-semibold text-brand"
            >
              Change
            </button>
          </div>

          {selected.status === 'claimed' && (
            <p className="rounded-2xl border border-hairline bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
              This profile is already managed by the business. If that is you and you have lost
              access, contact the Sound information officer through the app.
            </p>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-ink" htmlFor="claim-name">
                Your name
              </label>
              <input
                id="claim-name"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-ink" htmlFor="claim-email">
                Business email
              </label>
              <input
                id="claim-email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-ink" htmlFor="claim-role">
                Your role at the business
              </label>
              <input
                id="claim-role"
                value={form.role_at_business}
                onChange={(e) => setForm({ ...form, role_at_business: e.target.value })}
                placeholder="Owner, manager, practice principal"
                className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[14px] font-medium text-ink">Proof of ownership</p>
            <FileField onChange={setProof} hint="Business registration, VAT certificate, letterhead invoice · stored privately" />
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Only our moderators see this document.
            </p>
          </div>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <button
            type="button"
            disabled={!canSubmit || selected.status === 'claimed'}
            onClick={submit}
            className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'Sending…' : 'Send my claim for checking'}
          </button>
        </>
      )}
    </div>
  );
}