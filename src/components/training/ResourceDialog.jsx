import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import MediaUpload from '@/components/training/MediaUpload';
import YardField from '@/components/yard/YardField';
import { base44 } from '@/api/base44Client';
import { TRAINING_KINDS } from '@/lib/training';
import { fieldClass } from '@/lib/yard';

const EMPTY = {
  title: '',
  kind: 'article',
  summary: '',
  body: '',
  video_url: '',
  cover_url: '',
  duration: '',
};

export default function ResourceDialog({ open, onOpenChange, resource, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({ ...EMPTY, ...(resource || {}) });
  }, [open, resource]);

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Give the resource a title first.');
      return;
    }
    if (!form.body.trim() && !form.video_url) {
      setError('Add the written content, a video, or both.');
      return;
    }
    setBusy(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      kind: form.kind,
      summary: form.summary.trim() || undefined,
      body: form.body.trim() || undefined,
      video_url: form.video_url || undefined,
      cover_url: form.cover_url || undefined,
      duration: form.duration.trim() || undefined,
    };
    try {
      if (resource) await base44.entities.TrainingResource.update(resource.id, payload);
      else await base44.entities.TrainingResource.create(payload);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError('That resource could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[18px] text-ink">
            {resource ? 'Edit resource' : 'Add a training resource'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <YardField label="Title">
            <Input
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Warming up before a dressage test"
              className={fieldClass}
            />
          </YardField>

          <div className="grid gap-4 sm:grid-cols-2">
            <YardField label="Type">
              <select value={form.kind} onChange={set('kind')} className={fieldClass}>
                {TRAINING_KINDS.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </YardField>
            <YardField label="Length (optional)">
              <Input
                value={form.duration}
                onChange={set('duration')}
                placeholder="e.g. 3 min read"
                className={fieldClass}
              />
            </YardField>
          </div>

          <YardField label="Short summary">
            <Textarea
              value={form.summary}
              onChange={set('summary')}
              rows={2}
              placeholder="One or two lines shown on the library card."
              className={`${fieldClass} h-auto py-2.5`}
            />
          </YardField>

          <YardField label="Article or exercise steps">
            <Textarea
              value={form.body}
              onChange={set('body')}
              rows={7}
              placeholder="Write the guidance here. Leave a blank line between paragraphs."
              className={`${fieldClass} h-auto py-2.5`}
            />
          </YardField>

          <YardField label="Video link (optional)">
            <Input
              value={form.video_url}
              onChange={set('video_url')}
              placeholder="YouTube or Vimeo link"
              className={fieldClass}
            />
          </YardField>

          <MediaUpload
            label="Or upload a short video"
            accept="video/*"
            hint="MP4 or WebM, kept short (stored publicly — anyone with the link can open it)"
            value={form.video_url && form.video_url.startsWith('http') && !/youtu|vimeo/i.test(form.video_url) ? form.video_url : ''}
            onChange={(url) => setForm((current) => ({ ...current, video_url: url }))}
          />

          <MediaUpload
            label="Cover image (optional)"
            accept="image/*"
            hint="A photo or graphic for the card (stored publicly — anyone with the link can open it)"
            value={form.cover_url}
            onChange={(url) => setForm((current) => ({ ...current, cover_url: url }))}
          />

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
              {busy ? 'Saving…' : resource ? 'Save changes' : 'Publish resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}