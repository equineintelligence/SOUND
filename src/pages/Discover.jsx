import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SearchField from '@/components/SearchField';
import CategoryChips from '@/components/CategoryChips';
import RosetteWinners from '@/components/RosetteWinners';
import BusinessRow from '@/components/BusinessRow';
import RosetteGuideBanner from '@/components/RosetteGuideBanner';
import { DISCOVER_CATEGORIES, matchBusinesses } from '@/lib/sound';

const CATEGORY_KEYWORDS = {
  'Yards and livery': ['livery', 'yard', 'schooling', 'riding school', 'stabling'],
  Coaches: ['coach', 'trainer', 'instructor', 'lesson', 'schooling'],
  Farriers: ['farrier', 'trim', 'shoe', 'hoof'],
  Vets: ['vet', 'veterinary'],
  'Tack and feed': ['tack', 'feed', 'shop', 'saddle'],
  Transport: ['transport', 'float', 'horsebox'],
};

export default function Discover() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [businesses, setBusinesses] = useState([]);
  const [rosettes, setRosettes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [businessPage, rosettePage] = await Promise.all([
        base44.entities.Business.filter(
          { status: { $in: ['unclaimed', 'claimed'] } },
          { sort: '-rating_overall', limit: 100 }
        ),
        base44.entities.Rosette.filter({ status: 'active' }, { limit: 50 }),
      ]);
      if (!active) return;
      setBusinesses(businessPage.items || []);
      setRosettes(rosettePage.items || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // One card per business, showing its strongest rosette.
  const winners = useMemo(() => {
    const byBusiness = new Map();
    [...rosettes]
      .sort((a, b) => (b.average || 0) - (a.average || 0))
      .forEach((r) => {
        const b = businesses.find((x) => x.id === r.business);
        if (!b || byBusiness.has(b.id)) return;
        byBusiness.set(b.id, {
          id: b.id,
          name: b.name,
          rating: b.rating_overall ? b.rating_overall.toFixed(1) : (r.average || 0).toFixed(1),
          rosette_label: `${r.category_label || 'Community'} rosette ${r.year}`,
        });
      });
    return [...byBusiness.values()];
  }, [rosettes, businesses]);

  const list = useMemo(() => {
    const keywords = CATEGORY_KEYWORDS[category] || [];
    const byCategory =
      category === 'All'
        ? businesses
        : businesses.filter((b) =>
            (b.type || []).some((t) => keywords.some((k) => t.toLowerCase().includes(k)))
          );
    return matchBusinesses(byCategory, query);
  }, [businesses, category, query]);

  return (
    <div className="space-y-8">
      <RosetteGuideBanner />

      <section className="pt-2">
        <h1 className="font-heading text-[28px] font-bold leading-[1.15] text-ink sm:text-[34px]">
          Find the yards, coaches and farriers riders love
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Honest reviews from riders who used the service, so good businesses get seen and poor
          service gets found early.
        </p>
      </section>

      <section className="space-y-4">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by name, service or area"
        />
        <CategoryChips items={DISCOVER_CATEGORIES} value={category} onChange={setCategory} />
      </section>

      {winners.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Rosette winners</h2>
          <RosetteWinners winners={winners} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-[18px] font-semibold text-ink">Near you</h2>
        <div className="space-y-2.5">
          {loading && <p className="text-[14px] text-ink-soft">Looking through the directory…</p>}
          {!loading && list.map((b) => <BusinessRow key={b.id} business={b.rating_overall ? { ...b, rating: b.rating_overall, review_count: b.review_count } : b} />)}
          {!loading && list.length === 0 && (
            <p className="rounded-2xl border border-hairline bg-surface px-4 py-6 text-center text-[14px] text-ink-soft">
              No businesses match yet. Try a different spelling, or add the business when you write
              a review.
            </p>
          )}
        </div>
      </section>

      <section className="flex gap-3 rounded-2xl border border-hairline bg-brand-soft/60 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={1.8} />
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Every review comes from a verified customer with proof they used the service. Businesses
          can reply to every review.
        </p>
      </section>

      <section className="rounded-2xl border border-hairline bg-white p-5">
        <h2 className="font-heading text-[17px] font-semibold text-ink">
          Run an equestrian business?
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          Create a free profile, get found by riders nearby, and earn community rosettes.
        </p>
        <Link
          to="/business/list"
          className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          Create a free profile
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </section>
    </div>
  );
}