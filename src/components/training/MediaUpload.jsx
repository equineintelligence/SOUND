import { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MediaUpload({ label, accept, hint, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } catch (err) {
      setError('That file could not be uploaded. Try a smaller file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="block text-[12.5px] font-medium text-ink-soft">{label}</span>
      <label className="mt-1.5 flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-hairline bg-white px-4 py-3 transition-colors duration-200 hover:border-brand hover:bg-brand-soft/40">
        <Upload className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.9} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium text-ink">
            {value ? 'Uploaded — replace' : busy ? 'Uploading…' : 'Choose a file'}
          </span>
          {hint && <span className="block text-[12px] text-ink-soft">{hint}</span>}
        </span>
        {value && <Check className="h-5 w-5 shrink-0 text-brand" strokeWidth={2.2} />}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files && e.target.files[0])}
        />
      </label>
      {error && <p className="mt-2 text-[13px] text-destructive">{error}</p>}
    </div>
  );
}