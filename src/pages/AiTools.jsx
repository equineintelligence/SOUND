import { useEffect, useState } from 'react';
import { Sparkles, MessageCircle, Loader2, Info } from 'lucide-react';
import { AI_TOOLS } from '@/lib/aiTools';
import { loadBotpress, openBotpress, setBotpressVisible } from '@/lib/botpress';

export default function AiTools() {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  // The chat window is only shown while this page is open.
  useEffect(() => {
    setBotpressVisible(true);
    return () => setBotpressVisible(false);
  }, []);

  const openTool = async (tool) => {
    setError('');
    setBusyId(tool.id);
    try {
      if (tool.kind === 'botpress') {
        await loadBotpress(tool);
        openBotpress();
      }
    } catch (err) {
      setError(err.message || 'That tool could not be opened. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">AI Tools</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Assistants that answer your equestrian questions in plain language. Pick a tool and start
          a chat.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-hairline bg-white px-4 py-3 text-[13px] text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {AI_TOOLS.map((tool) => (
          <section key={tool.id} className="rounded-2xl border border-hairline bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft">
                <Sparkles className="h-5 w-5 text-brand" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-[17px] font-semibold text-ink">{tool.name}</h2>
                {tool.tagline && <p className="text-[13px] text-ink-soft">{tool.tagline}</p>}
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-ink">{tool.description}</p>
            <button
              type="button"
              onClick={() => openTool(tool)}
              disabled={busyId === tool.id}
              className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-brand px-5 text-[14px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
            >
              {busyId === tool.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
              )}
              {busyId === tool.id ? 'Opening…' : 'Start a chat'}
            </button>
            {tool.note && (
              <p className="mt-3 flex gap-2 text-[12px] leading-relaxed text-ink-soft">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                {tool.note}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
