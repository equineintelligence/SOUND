import { useState } from 'react';
import { Paperclip, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FileField({ onChange, hint }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setName(file.name);
      onChange({ file_uri, file_name: file.name });
    } catch (err) {
      setError('That file could not be uploaded. Try a PDF, or a photo of the document.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-hairline bg-white px-4 py-3 transition-colors duration-200 hover:border-brand hover:bg-brand-soft/40">
        <Paperclip className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.9} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium text-ink">
            {name || (busy ? 'Uploading…' : 'Upload a document or photo')}
          </span>
          {hint && !name && <span className="block text-[12px] text-ink-soft">{hint}</span>}
        </span>
        {name && <Check className="h-5 w-5 shrink-0 text-brand" strokeWidth={2.2} />}
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files && e.target.files[0])}
        />
      </label>
      {error && <p className="mt-2 text-[13px] text-destructive">{error}</p>}
    </div>
  );
}