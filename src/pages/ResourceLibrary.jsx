import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FileText, Lock, Pencil, Plus, Trash2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useAccess from '@/hooks/useAccess';
import SearchField from '@/components/SearchField';
import CategoryChips from '@/components/CategoryChips';
import UpgradeNotice from '@/components/upgrade/UpgradeNotice';
import LibraryDocDialog from '@/components/library/LibraryDocDialog';
import { LIBRARY_BUCKET, LIBRARY_CATEGORIES, fileLabel } from '@/lib/library';

export default function ResourceLibrary() {
  const access = useAccess();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [dialog, setDialog] = useState({ open: false, doc: null });
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const page = await base44.entities.LibraryDocument.list({ sort: 'title', limit: 500 });
      setDocs(page.items || []);
    } catch (err) {
      setError('The library could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => ['All', ...LIBRARY_CATEGORIES.filter((c) => docs.some((d) => d.category === c))],
    [docs]
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter(
      (d) =>
        (category === 'All' || d.category === category) &&
        (!q || `${d.title} ${d.description || ''} ${d.category}`.toLowerCase().includes(q))
    );
  }, [docs, category, query]);

  const canDownload = access.canDownloadLibrary;
  const isAdmin = access.isAdmin;

  const download = async (doc) => {
    setError('');
    setBusyId(doc.id);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: doc.file_uri,
        bucket: LIBRARY_BUCKET,
        expires_in: 120,
        download: doc.file_name || `${doc.title}`,
      });
      window.location.href = signed_url;
    } catch (err) {
      setError('That file could not be downloaded. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (doc) => {
    if (!window.confirm(`Remove “${doc.title}” from the library?`)) return;
    await base44.entities.LibraryDocument.delete(doc.id);
    base44.integrations.Core.DeleteFile({ file_uri: doc.file_uri, bucket: LIBRARY_BUCKET }).catch(() => {});
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">Resource library</h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            Templates and guides for running a yard or equestrian business: livery and lease agreements,
            employment contracts, workplace discipline and more.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setDialog({ open: true, doc: null })}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add
          </button>
        )}
      </div>

      {!access.loading && !canDownload && (
        <UpgradeNotice
          plan="pro"
          title="Downloads are for paying members"
          text="Pro members and Business members can download every template and guide in the library. Browse the list below to see what's included."
        />
      )}

      <div className="space-y-4">
        <SearchField value={query} onChange={setQuery} placeholder="Search templates and guides" />
        {categories.length > 2 && <CategoryChips items={categories} value={category} onChange={setCategory} />}
      </div>

      {error && (
        <p className="rounded-2xl border border-hairline bg-white px-4 py-3 text-[13px] text-destructive">{error}</p>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2">
        {loading && <p className="text-[14px] text-ink-soft">Opening the library…</p>}
        {!loading &&
          list.map((doc) => (
            <article key={doc.id} className="flex flex-col rounded-2xl border border-hairline bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
                  <FileText className="h-5 w-5 text-brand" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-soft">{doc.category}</p>
                  <h2 className="font-heading text-[15.5px] font-semibold leading-snug text-ink">{doc.title}</h2>
                </div>
              </div>
              {doc.description && (
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{doc.description}</p>
              )}
              <p className="mt-2 text-[12px] text-ink-soft">
                {fileLabel(doc)}
                {doc.version ? ` · ${doc.version}` : ''}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-3">
                {canDownload ? (
                  <button
                    type="button"
                    onClick={() => download(doc)}
                    disabled={busyId === doc.id}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand px-4 text-[13.5px] font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
                  >
                    {busyId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download
                  </button>
                ) : (
                  <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-hairline px-4 text-[13px] font-medium text-ink-soft">
                    <Lock className="h-4 w-4" />
                    Members only
                  </span>
                )}
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDialog({ open: true, doc })}
                      aria-label={`Edit ${doc.title}`}
                      className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hairline text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(doc)}
                      aria-label={`Remove ${doc.title}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hairline text-ink-soft hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        {!loading && list.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white px-4 py-6 text-center text-[13.5px] leading-relaxed text-ink-soft sm:col-span-2">
            {docs.length
              ? 'Nothing matches that search.'
              : 'No documents yet. Templates and guides will appear here as the Sound team adds them.'}
          </p>
        )}
      </div>

      <p className="text-[12px] leading-relaxed text-ink-soft">
        Templates are general guides, not legal advice. Adapt each one to your situation and have important
        agreements checked by a qualified professional.
      </p>

      <LibraryDocDialog
        open={dialog.open}
        doc={dialog.doc}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onSaved={load}
      />
    </div>
  );
}
