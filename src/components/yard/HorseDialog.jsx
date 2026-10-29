import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import FileField from '@/components/FileField';
import YardField from '@/components/yard/YardField';
import { base44 } from '@/api/base44Client';
import { HORSE_SEXES, fieldClass } from '@/lib/yard';

const EMPTY = {
  name: '',
  breed: '',
  sex: '',
  date_of_birth: '',
  age: '',
  height_cm: '',
  colour: '',
  photo_uri: '',
  notes: '',
};

export default function HorseDialog({ open, onOpenChange, horse, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({ ...EMPTY, ...(horse || {}) });
  }, [open, horse]);

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Give your horse a name first.');
      return;
    }
    setBusy(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      breed: form.breed.trim() || undefined,
      sex: form.sex || undefined,
      date_of_birth: form.date_of_birth || undefined,
      age: form.age === '' ? undefined : Number(form.age),
      height_cm: form.height_cm === '' ? undefined : Number(form.height_cm),
      colour: form.colour.trim() || undefined,
      photo_uri: form.photo_uri || undefined,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (horse) await base44.entities.Horse.update(horse.id, payload);
      else await base44.entities.Horse.create(payload);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError('That horse could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[18px] text-ink">
            {horse ? 'Edit horse' : 'Add a horse'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <YardField label="Name">
            <Input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Rivendell's Promise"
              className={fieldClass}
            />
          </YardField>

          <div className="grid gap-4 sm:grid-cols-2">
            <YardField label="Breed">
              <Input
                value={form.breed}
                onChange={set('breed')}
                placeholder="e.g. Warmblood"
                className={fieldClass}
              />
            </YardField>
            <YardField label="Sex">
              <select value={form.sex} onChange={set('sex')} className={fieldClass}>
                <option value="">Not set</option>
                {HORSE_SEXES.map((sex) => (
                  <option key={sex} value={sex}>
                    {sex}
                  </option>
                ))}
              </select>
            </YardField>
            <YardField label="Date of birth">
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={set('date_of_birth')}
                className={fieldClass}
              />
            </YardField>
            <YardField label="Age (if date unknown)">
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.age}
                onChange={set('age')}
                placeholder="e.g. 9"
                className={fieldClass}
              />
            </YardField>
            <YardField label="Height (cm)">
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.height_cm}
                onChange={set('height_cm')}
                placeholder="e.g. 163"
                className={fieldClass}
              />
            </YardField>
            <YardField label="Colour">
              <Input
                value={form.colour}
                onChange={set('colour')}
                placeholder="e.g. Bay"
                className={fieldClass}
              />
            </YardField>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[12.5px] font-medium text-ink-soft">Photo</span>
            <FileField
              onChange={({ file_uri }) => setForm((current) => ({ ...current, photo_uri: file_uri }))}
              hint="A photo of your horse (stored privately)"
            />
          </div>

          <YardField label="Notes">
            <Textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              placeholder="Feed, quirks, shoeing notes, anything worth remembering."
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
              {busy ? 'Saving…' : 'Save horse'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}