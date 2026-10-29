import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, X, ImagePlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ExistingProfileMatch from '@/components/business/ExistingProfileMatch';
import StepProgress from '@/components/StepProgress';
import FileField from '@/components/FileField';
import Rosette from '@/components/Rosette';
import { Image } from '@/components/ui/image';
import { BUSINESS_TYPES, SERVICES, matchBusinesses } from '@/lib/sound';
import UpgradeNotice from '@/components/upgrade/UpgradeNotice';
import useAccess from '@/hooks/useAccess';
import { cn } from '@/lib/utils';

const STEPS = ['Details', 'Photos and services', 'Verification'];

export default function CreateProfile() {
  const [step, setStep] = useState(1);
  const access = useAccess();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [proof, setProof] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: [],
    area: '',
    description: '',
    phone: '',
    website: '',
    opening_hours: '',
    contact_email: '',
    services: [],
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const page = await base44.entities.Business.filter(
        { status: { $in: ['unclaimed', 'claimed', 'pending_check'] } },
        { sort: 'name', limit: 200 }
      );
      if (!active) return;
      setBusinesses(page.items || []);
    })();
    return () => {
      active = false;
    };
  }, []);

  // A rider may already have added this business when reviewing it, so offer that profile to link to.
  const matches = useMemo(
    () => (form.name.trim().length < 2 ? [] : matchBusinesses(businesses, form.name).slice(0, 4)),
    [businesses, form.name]
  );

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggle = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((x) => x !== value) : [...prev[key], value],
    }));

  const addPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setPhotos((prev) => [...prev, file_url]);
    } catch (err) {
      setError('That photo could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const me = await base44.auth.me();
      await base44.entities.Business.create({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        area: form.area.trim(),
        photos,
        ownership_proof: proof ? proof.file_uri : '',
        status: 'pending_check',
        source: 'owner',
        claimed_by: me.id,
        review_count: 0,
      });
      setDone(true);
    } catch (err) {
      setError('That could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!access.loading && !access.businessActive) {
    return (
      <div className="space-y-5">
        <h1 className="font-heading text-[25px] font-bold leading-tight text-ink">
          Create your business profile
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-soft">
          A business membership covers your profile, review replies and rosettes. Leaving reviews on
          other businesses stays free.
        </p>
        <UpgradeNotice
          plan="business"
          title="Business membership needed"
          text="Request a business membership and we will send you an invoice. Your profile form opens as soon as it is paid."
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
          Your profile is with a moderator
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
          We verify ownership before a profile goes live, usually within 3 business days. You will be
          able to reply to reviews and share your rosettes once it is approved.
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
      <StepProgress step={step} labels={STEPS} />

      {step === 1 && (
        <>
          <h1 className="font-heading text-[25px] font-bold leading-tight text-ink">
            Tell riders about your business
          </h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-ink" htmlFor="p-name">
                Business name
              </label>
              <input
                id="p-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>

            <ExistingProfileMatch matches={matches} />

            <div className="space-y-2">
              <p className="text-[14px] font-medium text-ink">Type of business</p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_TYPES.map((t) => {
                  const active = form.type.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggle('type', t)}
                      className={cn(
                        'min-h-[44px] rounded-full border px-4 text-[13px] font-medium transition-colors duration-200',
                        active
                          ? 'border-brand bg-brand text-white'
                          : 'border-hairline bg-white text-ink-soft hover:border-brand/40'
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-ink" htmlFor="p-area">
                Town or area
              </label>
              <input
                id="p-area"
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
                className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-ink" htmlFor="p-desc">
                About your business
              </label>
              <textarea
                id="p-desc"
                rows={4}
                maxLength={400}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full rounded-2xl border border-hairline bg-white p-4 text-[15px] leading-relaxed outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
              <p className="text-right text-[12px] text-ink-soft">{form.description.length} / 400</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-ink" htmlFor="p-phone">
                  Phone
                </label>
                <input
                  id="p-phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-ink" htmlFor="p-email">
                  Business email
                </label>
                <input
                  id="p-email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => set('contact_email', e.target.value)}
                  className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-ink" htmlFor="p-web">
                  Website
                </label>
                <input
                  id="p-web"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                  className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-ink" htmlFor="p-hours">
                  Opening hours
                </label>
                <input
                  id="p-hours"
                  value={form.opening_hours}
                  onChange={(e) => set('opening_hours', e.target.value)}
                  placeholder="Mon to Fri 7am to 5pm"
                  className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={form.name.trim().length < 2 || form.type.length === 0}
            onClick={() => setStep(2)}
            className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="font-heading text-[25px] font-bold leading-tight text-ink">
            Photos and services
          </h1>

          <div className="space-y-3">
            <p className="text-[14px] font-medium text-ink">Photos of your yard or work</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.map((p) => (
                <span key={p} className="relative block">
                  <Image src={p} className="h-32 w-full rounded-2xl" fittingType="fill" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((x) => x !== p))}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                </span>
              ))}
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-hairline bg-white text-ink-soft transition-colors duration-200 hover:border-brand hover:bg-brand-soft/40">
                <ImagePlus className="h-5 w-5" strokeWidth={2} />
                <span className="text-[12px] font-medium">{uploading ? 'Uploading…' : 'Add a photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => addPhoto(e.target.files && e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[14px] font-medium text-ink">Services you offer</p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => {
                const active = form.services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle('services', s)}
                    className={cn(
                      'min-h-[44px] rounded-full border px-4 text-[13px] font-medium transition-colors duration-200',
                      active
                        ? 'border-brand bg-brand text-white'
                        : 'border-hairline bg-white text-ink-soft hover:border-brand/40'
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[52px] flex-1 rounded-2xl border border-hairline px-5 text-[15px] font-semibold text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="min-h-[52px] flex-1 rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="font-heading text-[25px] font-bold leading-tight text-ink">
            Prove it is your business
          </h1>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            A business registration document, VAT certificate or an invoice on your business
            letterhead. Only our moderators see it.
          </p>

          <FileField onChange={setProof} hint="PDF or photo · stored privately" />

          <p className="rounded-2xl border border-hairline bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
            Your profile goes live only after a moderator approves it. You are responsible for the
            accuracy of everything on your profile.
          </p>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[52px] flex-1 rounded-2xl border border-hairline px-5 text-[15px] font-semibold text-ink"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!proof || busy}
              onClick={submit}
              className="min-h-[52px] flex-1 rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
            >
              {busy ? 'Sending…' : 'Submit profile'}
            </button>
          </div>
          {!proof && (
            <p className="flex items-center justify-center gap-2 text-center text-[12px] text-ink-soft">
              <Plus className="h-3 w-3" strokeWidth={3} /> Add your proof of ownership to submit
            </p>
          )}
        </>
      )}
    </div>
  );
}