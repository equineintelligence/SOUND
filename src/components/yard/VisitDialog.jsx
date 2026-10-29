import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import YardField from '@/components/yard/YardField';
import { base44 } from '@/api/base44Client';
import { CARE_TYPES, fieldClass, todayKey } from '@/lib/yard';

const EMPTY = {
  type: 'Vet',
  provider: '',
  horse: '',
  date: '',
  time: '',
  cost: '',
  notes: '',
};

export default function VisitDialog({ open, onOpenChange, visit, horses = [], presetHorse, onSaved }) {
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
      ...(visit || {}),
    });
  }, [open, visit, presetHorse]);

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.date) {
      setError('Pick the date of the visit.');
      return;
    }
    setBusy(true);
    setError('');
    const payload = {
      type: form.type,
      provider: form.provider.trim() || undefined,
      horse: form.horse || undefined,
      horse_name: horses.find((h) => h.id === form.horse)?.name || undefined,
      date: form.date,
      time: form.time || undefined,
      cost: form.cost === '' ? undefined : Number(form.cost),
      notes: form.notes.trim() || undefined,
    };
    try {
      if (visit) await base44.entities.CareVisit.update(visit.id, payload);
      else await base44.entities.CareVisit.create(payload);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError('That visit could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[18px] text-ink">
            {visit ? 'Edit visit' : 'Add a care visit'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <YardField label="Care">
              <select value={form.type} onChange={set('type')} className={fieldClass}>
                {CARE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </YardField>
            <YardField label="Horse">
              <select value={form.horse} onChange={set('horse')} className={fieldClass}>
                <option value="">Whole yard</option>
                {horses.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name}
                  </option>
                ))}
              </select>
            </YardField>
          </div>

          <YardField label="Provider">
            <Input
              value={form.provider}
              onChange={set('provider')}
              placeholder="e.g. Dr Naidoo, or your farrier's name"
              className={fieldClass}
            />
          </YardField>

          <div className="grid gap-4 sm:grid-cols-3">
            <YardField label="Date">
              <Input type="date" value={form.date} onChange={set('date')} className={fieldClass} />
            </YardField>
            <YardField label="Time">
              <Input type="time" value={form.time} onChange={set('time')} className={fieldClass} />
            </YardField>
            <YardField label="Cost (R)">
              <Input
                type="number"
                min="0"
                inputMode="decimal"
                value={form.cost}
                onChange={set('cost')}
                placeholder="0"
                className={fieldClass}
              />
            </YardField>
          </div>

          <YardField label="Notes">
            <Textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              placeholder="What it was for, what was done, next due date."
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
              {busy ? 'Saving…' : 'Save visit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}