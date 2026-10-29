import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StepProgress from '@/components/StepProgress';
import CheckRow from '@/components/CheckRow';
import FileField from '@/components/FileField';
import { displayName, screenText } from '@/lib/sound';
import { clearDraft, readDraft } from '@/lib/draft';

const STEPS = ['Topic', 'Rating', 'Proof'];
const TWELVE_MONTHS = 365 * 24 * 60 * 60 * 1000;

export default function ProofDeclaration() {
  const navigate = useNavigate();
  const businessId = new URLSearchParams(window.location.search).get('business');
  const draft = readDraft();

  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [proof, setProof] = useState(null);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [existing, setExisting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const [me, record] = await Promise.all([
        base44.auth.me(),
        base44.entities.Business.get(businessId),
      ]);
      if (!active) return;
      setUser(me || null);
      setBusiness(record || null);
      if (me) {
        const page = await base44.entities.Review.filter(
          { reviewer: me.id, business: businessId },
          { limit: 10 }
        );
        if (!active) return;
        const blocked = (page.items || []).find(
          (r) =>
            (r.status === 'pending' || r.status === 'published') &&
            new Date(r.created_date).getTime() >= Date.now() - TWELVE_MONTHS
        );
        setExisting(blocked || null);
      }
    })();
    return () => {
      active = false;
    };
  }, [businessId]);

  const allTicked = checks.every(Boolean);
  const canSubmit = Boolean(proof && proof.file_uri) && allTicked && !busy && !existing;

  const toggle = (index) => (value) =>
    setChecks((prev) => prev.map((c, i) => (i === index ? value : c)));

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const screening = screenText(draft.text);
      const review = await base44.entities.Review.create({
        business: businessId,
        business_name: business ? business.name : '',
        reviewer: user.id,
        display_name: displayName(user),
        overall_rating: draft.overall_rating || 0,
        criterion_horse_care: draft.criterion_horse_care || 0,
        criterion_communication: draft.criterion_communication || 0,
        criterion_value: draft.criterion_value || 0,
        criterion_professionalism: draft.criterion_professionalism || 0,
        criterion_facilities: draft.criterion_facilities || 0,
        topic: draft.topic || '',
        service_used: draft.service_used || '',
        month_of_service: draft.month_of_service || '',
        text: draft.text || '',
        status: 'pending',
        declaration_accepted: true,
        senior_review: screening.senior,
        screening_notes: screening.notes,
        proof_uri: proof.file_uri,
        proof_name: proof.file_name,
      });
      await base44.entities.ProofOfCustom.create({
        review: review.id,
        business: businessId,
        file_uri: proof.file_uri,
        file_name: proof.file_name,
        month_of_service: draft.month_of_service || '',
      });
      clearDraft();
      navigate('/write/done');
    } catch (err) {
      setError('That could not be submitted. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepProgress step={3} labels={STEPS} />

      <div>
        <h1 className="font-heading text-[24px] font-bold leading-tight text-ink">
          Proof and declaration
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          The last step. This is what makes your review trusted.
        </p>
      </div>

      {existing ? (
        <div className="space-y-3 rounded-2xl border border-hairline bg-surface p-5">
          <p className="font-heading text-[16px] font-semibold text-ink">
            You have already reviewed this business
          </p>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            You can write one review per business every 12 months. You can edit the review you
            already wrote from My reviews.
          </p>
          <Link
            to="/my-reviews"
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white"
          >
            Go to My reviews
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-heading text-[16px] font-semibold text-ink">Proof of custom</h2>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              An invoice, receipt, booking confirmation or livery agreement from the last 24 months.
            </p>
            <FileField onChange={setProof} hint="PDF or photo · stored privately" />
            <p className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.9} />
              Only our moderators see this document. It is never shown to the business or other
              users.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-[16px] font-semibold text-ink">Your display name</h2>
            <div className="rounded-2xl border border-hairline bg-white px-4 py-3">
              <p className="font-heading text-[15px] font-semibold text-ink">
                {displayName(user)}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                This is what other riders see. Your full name and contact details stay private.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-[16px] font-semibold text-ink">Declaration</h2>
            <CheckRow checked={checks[0]} onChange={toggle(0)}>
              I used this service myself in the last 24 months.
            </CheckRow>
            <CheckRow checked={checks[1]} onChange={toggle(1)}>
              This is my honest opinion, and the facts in it are true.
            </CheckRow>
            <CheckRow checked={checks[2]} onChange={toggle(2)}>
              I have no connection to this business and was not paid or rewarded for this review.
            </CheckRow>
            <CheckRow checked={checks[3]} onChange={toggle(3)}>
              I understand I am responsible for what I have written.
            </CheckRow>
          </section>

          <p className="rounded-2xl border border-hairline bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
            The business may recognise you from the details of your review.
          </p>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="min-h-[52px] w-full rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'Submitting…' : 'Submit my review'}
          </button>
          {!proof && <p className="text-center text-[12px] text-ink-soft">Add your proof of custom to submit.</p>}
        </>
      )}
    </div>
  );
}