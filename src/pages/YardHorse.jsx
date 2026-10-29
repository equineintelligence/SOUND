import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import YardPhoto from '@/components/yard/YardPhoto';
import HorseDialog from '@/components/yard/HorseDialog';
import VisitDialog from '@/components/yard/VisitDialog';
import RideDialog from '@/components/yard/RideDialog';
import VisitRow from '@/components/yard/VisitRow';
import RideRow from '@/components/yard/RideRow';
import { ageLabel, initials, splitTimeline } from '@/lib/yard';

export default function YardHorse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [horse, setHorse] = useState(null);
  const [visits, setVisits] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [rideOpen, setRideOpen] = useState(false);

  const load = useCallback(async () => {
    const record = await base44.entities.Horse.get(id).catch(() => null);
    setHorse(record);
    if (record) {
      const [visitPage, ridePage] = await Promise.all([
        base44.entities.CareVisit.filter({ horse: id }, { sort: 'date', limit: 100 }),
        base44.entities.RidePlan.filter({ horse: id }, { sort: 'date', limit: 100 }),
      ]);
      setVisits(visitPage.items || []);
      setRides(ridePage.items || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    if (!window.confirm(`Remove ${horse.name} from your yard?`)) return;
    await base44.entities.Horse.delete(horse.id);
    navigate('/my-yard');
  };

  if (loading) {
    return <p className="py-10 text-center text-[14px] text-ink-soft">Loading…</p>;
  }

  if (!horse) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-[14px] text-ink-soft">That horse is not in your yard.</p>
        <Link to="/my-yard" className="text-[14px] font-semibold text-brand">
          Back to My Yard
        </Link>
      </div>
    );
  }

  const care = splitTimeline(visits);
  const planned = splitTimeline(rides);
  const facts = [
    horse.breed,
    horse.sex,
    ageLabel(horse),
    horse.height_cm ? `${horse.height_cm} cm` : null,
    horse.colour,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Link
        to="/my-yard"
        className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-ink-soft transition-colors duration-200 hover:text-brand"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        My Yard
      </Link>

      <YardPhoto
        fileUri={horse.photo_uri}
        alt={horse.name}
        fallback={initials(horse.name)}
        className="h-52 w-full rounded-2xl"
      />

      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">{horse.name}</h1>
        <p className="mt-1 text-[14px] text-ink-soft">
          {facts.length > 0 ? facts.join(' · ') : 'Add breed, age and height'}
        </p>
        {horse.date_of_birth && (
          <p className="mt-1 text-[13px] text-ink-soft">Born {horse.date_of_birth}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-white px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
          Edit
        </button>
        <button
          type="button"
          onClick={remove}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-white px-4 text-[13px] font-semibold text-destructive transition-colors duration-200 hover:bg-destructive/5"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
          Remove
        </button>
      </div>

      {horse.notes && (
        <section className="space-y-1.5 rounded-2xl border border-hairline bg-white p-4">
          <h2 className="font-heading text-[15px] font-semibold text-ink">Notes</h2>
          <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink-soft">
            {horse.notes}
          </p>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Care</h2>
          <button
            type="button"
            onClick={() => setVisitOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-white px-3 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add
          </button>
        </div>

        {care.upcoming.length > 0 && (
          <div className="space-y-2">
            {care.upcoming.map((visit) => (
              <VisitRow key={visit.id} visit={visit} hideHorse />
            ))}
          </div>
        )}
        {care.upcoming.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white px-4 py-4 text-[13.5px] text-ink-soft">
            No care booked for {horse.name} yet.
          </p>
        )}

        {care.past.length > 0 && (
          <div className="space-y-2 pt-1">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
              Past visits
            </h3>
            {care.past.map((visit) => (
              <VisitRow key={visit.id} visit={visit} hideHorse />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-[18px] font-semibold text-ink">Rides</h2>
          <button
            type="button"
            onClick={() => setRideOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-white px-3 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add
          </button>
        </div>

        {planned.upcoming.length > 0 && (
          <div className="space-y-2">
            {planned.upcoming.map((ride) => (
              <RideRow key={ride.id} ride={ride} hideHorse />
            ))}
          </div>
        )}
        {planned.upcoming.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white px-4 py-4 text-[13.5px] text-ink-soft">
            Nothing planned for {horse.name} yet.
          </p>
        )}

        {planned.past.length > 0 && (
          <div className="space-y-2 pt-1">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
              Past plans
            </h3>
            {planned.past.map((ride) => (
              <RideRow key={ride.id} ride={ride} hideHorse />
            ))}
          </div>
        )}
      </section>

      <HorseDialog open={editOpen} onOpenChange={setEditOpen} horse={horse} onSaved={load} />
      <VisitDialog
        open={visitOpen}
        onOpenChange={setVisitOpen}
        horses={[horse]}
        presetHorse={horse.id}
        onSaved={load}
      />
      <RideDialog
        open={rideOpen}
        onOpenChange={setRideOpen}
        horses={[horse]}
        presetHorse={horse.id}
        onSaved={load}
      />
    </div>
  );
}