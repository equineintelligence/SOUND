import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Paperclip } from 'lucide-react';

export default function ProofLink({ fileUri, label = 'Open proof document' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!fileUri) return null;

  const open = async () => {
    setBusy(true);
    setError('');
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri });
      window.open(signed_url, '_blank', 'noopener');
    } catch (err) {
      setError('Could not open that document.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={open}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-hairline px-4 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-brand-soft/40"
      >
        <Paperclip className="h-4 w-4" strokeWidth={2} />
        {busy ? 'Opening…' : label}
      </button>
      {error && <span className="text-[12px] text-destructive">{error}</span>}
    </span>
  );
}