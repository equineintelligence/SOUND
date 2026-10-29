import { Link, useNavigate } from 'react-router-dom';
import { Phone, ExternalLink } from 'lucide-react';

export default function Referral() {
  const navigate = useNavigate();
  const businessId = new URLSearchParams(window.location.search).get('business');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
          This needs to go to the right people
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Sound does not publish allegations of crime, cruelty or professional misconduct. These are
          handled by the authorities, who can act on them properly.
        </p>
      </div>

      <section className="rounded-2xl border border-hairline bg-white p-5">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Theft or fraud</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          Report it to the South African Police Service. Open a case at your nearest station, or call
          the national number.
        </p>
        <a
          href="tel:10111"
          className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          <Phone className="h-4 w-4" strokeWidth={2} />
          Call SAPS on 10111
        </a>
      </section>

      <section className="rounded-2xl border border-hairline bg-white p-5">
        <h2 className="font-heading text-[17px] font-semibold text-ink">
          A horse being neglected or mistreated
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          Contact the National Council of SPCAs or your local SPCA. Keep any photographs, dates and
          names of witnesses.
        </p>
        <a
          href="https://nspca.co.za"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-brand px-5 text-[14px] font-semibold text-brand transition-colors duration-200 hover:bg-brand-soft"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
          Find your local SPCA
        </a>
      </section>

      <section className="rounded-2xl border border-hairline bg-white p-5">
        <h2 className="font-heading text-[17px] font-semibold text-ink">Concerns about a vet</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          Professional misconduct by a veterinary professional is handled by the South African
          Veterinary Council.
        </p>
        <a
          href="https://savc.org.za"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-brand px-5 text-[14px] font-semibold text-brand transition-colors duration-200 hover:bg-brand-soft"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
          Contact the SA Veterinary Council
        </a>
      </section>

      <div className="space-y-3 rounded-2xl border border-hairline bg-surface p-5">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          If what you want to say is about the service you received, and leaves the allegation out,
          you can write a service review instead.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/write/topic?business=${businessId}`)}
          className="inline-flex min-h-[48px] items-center rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Write a service review instead
        </button>
      </div>

      <Link to="/" className="block text-[14px] font-medium text-brand">
        Back to Discover
      </Link>
    </div>
  );
}