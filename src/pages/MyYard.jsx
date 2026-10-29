import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HorseCard from '@/components/yard/HorseCard';
import HorseDialog from '@/components/yard/HorseDialog';
import VisitDialog from '@/components/yard/VisitDialog';
import RideDialog from '@/components/yard/RideDialog';
import VisitRow from '@/components/yard/VisitRow';
import RideRow from '@/components/yard/RideRow';
import useAccess from '@/hooks/useAccess';
import UpgradeNotice from '@/components/upgrade/UpgradeNotice';
import { PLAN_LABELS } from '@/lib/plans';
import { splitTimeline } from '@/lib/yard';

export default function MyYard() {
  const [horses, setHorses] = useState([]);
  const [visits, setVisits] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [horseOpen, setHorseOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [rideOpen, setRideOpen] = useState(false);
  const access = useAccess();

  const load = useCallback(async () => {
    const [horsePage, visitPage, ridePage] = await Promise.all([
      base44.entities.Horse.list({ sort: 'name', limit: 50 }),
      base44.entities.CareVisit.list({ sort: 'date', limit: 200 }),
      base44.entities.RidePlan.list({ sort: 'date', limit: 200 }),
    ]);
    setHorses(horsePage.items || []);
    setVisits(visitPage.items || []);
    setRides(ridePage.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const care = splitTimeline(visits).upcoming;
  const planned = splitTimeline(rides).upcoming;

  return (
    <div className="space-y-7">
      <section>
        <h1 className="font-heading text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
          My Yard
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Your horses, their care and everything you have planned. Only you can see this.
        </p>
        {!access.loading && horses.length < access.horseLimit && (
          <>
            <button
              type="button"
              onClick={() => setHorseOpen(true)}
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 sm:w-auto"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Add a horse
            </button>
            <p className="mt-2 text-[12.5px] text-ink-soft">
              {PLAN_LABELS[access.plan]} plan ·{' '}
              {Number.isFinite(access.horseLimit)
                ? `${horses.length} of ${access.horseLimit} ${access.horseLimit === 1 ? 'horse' : 'horses'}`
                : 'no horse limit'}
            </p>
          </>
        )}
        {!access.loading && horses.length >= access.horseLimit && (
          <div className="mt-4">
            <UpgradeNotice
              plan="pro"
              title="Your yard is full"
              text={`Your ${PLAN_LABELS[access.plan].toLowerCase()} plan holds up to ${access.horseLimit} ${access.horseLimit === 1 ? 'horse' : 'horses'}. Pro holds 5 horses and opens the Learn library.`}
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-[18px] font-semibold text-ink">Your horses</h2>
        {loading && <p className="text-[14px] text-ink-soft">Opening the yard gate…</p>}
        {!loading && horses.length > 0 && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {horses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} />
            ))}
          </div>
        )}
        {!loading && horses.length === 0 && (
          <p className="rounded-2xl border border-dashed border-hairline bg-white px-4 py-6 text-center text-[14px] leading-relaxed text-ink-soft">
            No horses yet. Add your first to keep their details, care and rides in one place.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Upcoming care</h2>
          <Link
            to="/my-yard/care"
            className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-brand"
          >
            Care diary
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
        {!loading && care.length > 0 && (
          <div className="space-y-2">
            {care.slice(0, 3).map((visit) => (
              <VisitRow key={visit.id} visit={visit} />
            ))}
          </div>
        )}
        {!loading && care.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white px-4 py-4 text-[13.5px] leading-relaxed text-ink-soft">
            Nothing booked. Keep vet, physio, farrier and dentist visits here so nothing slips.
          </p>
        )}
        <button
          type="button"
          onClick={() => setVisitOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-white px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add care visit
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Planned rides</h2>
          <Link
            to="/my-yard/rides"
            className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-brand"
          >
            Ride planner
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
        {!loading && planned.length > 0 && (
          <div className="space-y-2">
            {planned.slice(0, 3).map((ride) => (
              <RideRow key={ride.id} ride={ride} />
            ))}
          </div>
        )}
        {!loading && planned.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white px-4 py-4 text-[13.5px] leading-relaxed text-ink-soft">
            Nothing planned. Add rides, lessons, clinics and shows as they come up.
          </p>
        )}
        <button
          type="button"
          onClick={() => setRideOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-white px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Plan a ride
        </button>
      </section>

      <HorseDialog open={horseOpen} onOpenChange={setHorseOpen} onSaved={load} />
      <VisitDialog
        open={visitOpen}
        onOpenChange={setVisitOpen}
        horses={horses}
        onSaved={load}
      />
      <RideDialog open={rideOpen} onOpenChange={setRideOpen} horses={horses} onSaved={load} />
    </div>
  );
}