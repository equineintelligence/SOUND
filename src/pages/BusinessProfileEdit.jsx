import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ImagePlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/EmptyState';
import { Image } from '@/components/ui/image';
import { BUSINESS_TYPES, SERVICES } from '@/lib/sound';
import { cn } from '@/lib/utils';

export default function BusinessProfileEdit() {
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await base44.auth.me();
      if (!active || !me) return;
      const owned = await base44.entities.Business.filter({ claimed_by: me.id }, { limit: 1 });
      const record = (owned.items || [])[0] || null;
      if (!active) return;
      setBusiness(record);
      if (record) {
        setForm({
          name: record.name || '',
          type: record.type || [],
          area: record.area || '',
          description: record.description || '',
          phone: record.phone || '',
          website: record.website || '',
          opening_hours: record.opening_hours || '',
          contact_email: record.contact_email || '',
          services: record.services || [],
          photos: record.photos || [],
        });
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

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
      setForm((prev) => ({ ...prev, photos: [...prev.photos, file_url] }));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setBusy(true);
    await base44.entities.Business.update(business.id, {
      ...form,
      description: form.description.slice(0, 400),
    });
    setSaved(true);
    setBusy(false);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading || !form) {
    return loading ? (
      <p className="text-[14px] text-ink-soft">Loading your profile…</p>
    ) : (
      <EmptyState
        title="No business profile linked to you yet"
        text="Create a free profile, or claim one that a customer already added."
      >
        <Link
          to="/business/list"
          className="inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
        >
          Get started
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">Your profile</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          You are responsible for the accuracy of everything here.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-ink" htmlFor="e-name">
            Business name
          </label>
          <input
            id="e-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </div>

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
          <label className="text-[14px] font-medium text-ink" htmlFor="e-desc">
            About your business
          </label>
          <textarea
            id="e-desc"
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
            <label className="text-[14px] font-medium text-ink" htmlFor="e-area">
              Town or area
            </label>
            <input
              id="e-area"
              value={form.area}
              onChange={(e) => set('area', e.target.value)}
              className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-ink" htmlFor="e-phone">
              Phone
            </label>
            <input
              id="e-phone"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-ink" htmlFor="e-email">
              Business email
            </label>
            <input
              id="e-email"
              type="email"
              value={form.contact_email}
              onChange={(e) => set('contact_email', e.target.value)}
              className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-ink" htmlFor="e-web">
              Website
            </label>
            <input
              id="e-web"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-[14px] font-medium text-ink" htmlFor="e-hours">
              Opening hours
            </label>
            <input
              id="e-hours"
              value={form.opening_hours}
              onChange={(e) => set('opening_hours', e.target.value)}
              placeholder="Mon to Fri 7am to 5pm"
              className="h-[52px] w-full rounded-2xl border border-hairline bg-white px-4 text-[15px] outline-none focus:border-brand"
            />
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

        <div className="space-y-3">
          <p className="text-[14px] font-medium text-ink">Photos</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {form.photos.map((p) => (
              <span key={p} className="relative block">
                <Image src={p} className="h-32 w-full rounded-2xl" fittingType="fill" />
                <button
                  type="button"
                  onClick={() => set('photos', form.photos.filter((x) => x !== p))}
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
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="min-h-[52px] flex-1 rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
        >
          {busy ? 'Saving…' : 'Save profile'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
            <Plus className="h-4 w-4 rotate-45" strokeWidth={2.4} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}