import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import YardField from '@/components/yard/YardField';
import { base44 } from '@/api/base44Client';
import { RIDE_TYPES, fieldClass, todayKey } from '@/lib/yard';

const EMPTY = {
  title: '',
  type: 'Ride',
  horse: '',
  date: '',
  time: '',
  location: '',
  notes: '',
};

export default function RideDialog({ open, onOpenChange, ride, horses = [], presetHorse, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      ...EMPTY,
      date: todayKey(),
      horse: presetHorse || '',
      ...(ride || {}),
    });
  }, [open, ride, presetHorse]);

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Give this plan a name.');
      return;
    }
    if (!form.date) {
      setError('Pick the date.');
      return;
    }
    setBusy(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      type: form.type,
      horse: form.horse || undefined,
      horse_name: horses.find((h) => h.id === form.horse)?.name || undefined,
      date: form.date,
      time: form.time || undefined,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (ride) await base44.entities.RidePlan.update(ride.id, payload);
      else await base44.entities.RidePlan.create(payload);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError('That plan could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[18px] text-ink">
            {ride ? 'Edit plan' : 'Plan a ride'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <YardField label="What is it">
            <Input
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Dressage lesson with Anja"
              className={fieldClass}
            />
          </YardField>

          <div className="grid gap-4 sm:grid-cols-2">
            <YardField label="Type">
              <select value={form.type} onChange={set('type')} className={fieldClass}>
                {RIDE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </YardField>
            <YardField label="Horse">
              <select value={form.horse} onChange={set('horse')} className={fieldClass}>
                <option value="">Not set</option>
                {horses.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name}
                  </option>
                ))}
              </select>
            </YardField>
            <YardField label="Date">
              <Input type="date" value={form.date} onChange={set('date')} className={fieldClass} />
            </YardField>
            <YardField label="Time">
              <Input type="time" value={form.time} onChange={set('time')} className={fieldClass} />
            </YardField>
          </div>

          <YardField label="Where">
            <Input
              value={form.location}
              onChange={set('location')}
              placeholder="Yard, arena or showground"
              className={fieldClass}
            />
          </YardField>

          <YardField label="Notes">
            <Textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              placeholder="What you want to work on, entries, times."
              className={`${fieldClass} h-auto py-2.5`}
            />
          </YardField>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="h-11 flex-1 rounded-xl bg-brand text-white hover:bg-brand/90"
            >
              {busy ? 'Saving…' : 'Save plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}