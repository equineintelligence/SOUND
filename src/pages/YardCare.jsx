import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VisitRow from '@/components/yard/VisitRow';
import VisitDialog from '@/components/yard/VisitDialog';
import { dayLabel, splitTimeline } from '@/lib/yard';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

export default function YardCare() {
  const [visits, setVisits] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const [visitPage, horsePage] = await Promise.all([
      base44.entities.CareVisit.list({ sort: 'date', limit: 200 }),
      base44.entities.Horse.list({ sort: 'name', limit: 50 }),
    ]);
    setVisits(visitPage.items || []);
    setHorses(horsePage.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { upcoming, past } = splitTimeline(visits);
  const shown = tab === 'upcoming' ? upcoming : past;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (visit) => {
    setEditing(visit);
    setDialogOpen(true);
  };

  const remove = async (visit) => {
    if (!window.confirm(`Delete the ${visit.type.toLowerCase()} visit on ${dayLabel(visit.date)}?`)) {
      return;
    }
    await base44.entities.CareVisit.delete(visit.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/my-yard"
          className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-ink-soft transition-colors duration-200 hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          My Yard
        </Link>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">Care diary</h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          Vet, physio, farrier, dentist and everything else your horse needs.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add visit
        </button>
      </div>

      <div className="inline-flex rounded-xl border border-hairline bg-white p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={
              tab === item.key
                ? 'min-h-[40px] rounded-lg bg-brand px-4 text-[13px] font-semibold text-white'
                : 'min-h-[40px] rounded-lg px-4 text-[13px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading && <p className="text-[14px] text-ink-soft">Loading your care diary…</p>}
        {!loading &&
          shown.map((visit) => (
            <VisitRow key={visit.id} visit={visit} onEdit={openEdit} onDelete={remove} />
          ))}
        {!loading && shown.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white px-4 py-6 text-center text-[13.5px] leading-relaxed text-ink-soft">
            {tab === 'upcoming'
              ? 'No visits booked yet. Add the next vet, farrier or physio appointment.'
              : 'No past visits recorded.'}
          </p>
        )}
      </div>

      <VisitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        visit={editing}
        horses={horses}
        onSaved={load}
      />
    </div>
  );
}