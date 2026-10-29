import { useEffect, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import YardField from '@/components/yard/YardField';
import { base44 } from '@/api/base44Client';
import { fieldClass } from '@/lib/yard';
import { ACCEPTED_FILES, LIBRARY_AUDIENCES, LIBRARY_BUCKET, LIBRARY_CATEGORIES } from '@/lib/library';

const EMPTY = {
  title: '',
  category: LIBRARY_CATEGORIES[0],
  description: '',
  audience: 'all',
  version: '',
};

// Admins add or edit a library document here.
export default function LibraryDocDialog({ open, onOpenChange, doc, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setFile(null);
    setForm({ ...EMPTY, ...(doc || {}) });
  }, [open, doc]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Give the document a title.');
      return;
    }
    if (!doc && !file) {
      setError('Choose the file to upload.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        audience: form.audience,
        version: form.version.trim(),
      };
      if (file) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file, bucket: LIBRARY_BUCKET });
        Object.assign(payload, {
          file_uri,
          file_name: file.name,
          file_type: file.type || '',
          file_size: file.size,
        });
      }
      if (doc) {
        await base44.entities.LibraryDocument.update(doc.id, payload);
        if (file && doc.file_uri) {
          // Replace the old file once the new one is saved.
          base44.integrations.Core.DeleteFile({ file_uri: doc.file_uri, bucket: LIBRARY_BUCKET }).catch(() => {});
        }
      } else {
        await base44.entities.LibraryDocument.create(payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError('That document could not be saved. Check the file and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[18px] text-ink">
            {doc ? 'Edit document' : 'Add a document'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <YardField label="Title">
            <Input value={form.title} onChange={set('title')} placeholder="e.g. Full livery agreement" className={fieldClass} />
          </YardField>

          <YardField label="Category">
            <select value={form.category} onChange={set('category')} className={fieldClass}>
              {LIBRARY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </YardField>

          <YardField label="Who it's for">
            <select value={form.audience} onChange={set('audience')} className={fieldClass}>
              {LIBRARY_AUDIENCES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </YardField>

          <YardField label="Short description">
            <Textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="What it covers and when to use it."
              className={fieldClass}
            />
          </YardField>

          <YardField label="Version or date (optional)">
            <Input value={form.version} onChange={set('version')} placeholder="e.g. v1.0, Nov 2026" className={fieldClass} />
          </YardField>

          <div className="space-y-1.5">
            <span className="block text-[12.5px] font-medium text-ink-soft">
              {doc ? 'Replace the file (optional)' : 'File'}
            </span>
            <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-dashed border-hairline bg-surface px-4 py-3 text-[13.5px] text-ink-soft hover:border-brand/40">
              {file ? <FileText className="h-5 w-5 text-brand" /> : <Upload className="h-5 w-5 text-brand" />}
              <span className="min-w-0 flex-1 truncate">
                {file ? file.name : doc?.file_name || 'Word, PDF or Excel file · stored privately'}
              </span>
              <input
                type="file"
                accept={ACCEPTED_FILES}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
