import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ResourceCard from '@/components/training/ResourceCard';
import ResourceDialog from '@/components/training/ResourceDialog';
import UpgradeNotice from '@/components/upgrade/UpgradeNotice';
import useAccess from '@/hooks/useAccess';
import { TRAINING_FILTERS } from '@/lib/training';
import { cn } from '@/lib/utils';

export default function TrainingLibrary() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const access = useAccess();

  useEffect(() => {
    let active = true;
    base44.auth
      .me()
      .then((me) => {
        if (active) setIsAdmin(me?.role === 'admin');
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const page =
      kind === 'all'
        ? await base44.entities.TrainingResource.list({ sort: '-created_date', limit: 60 })
        : await base44.entities.TrainingResource.filter(
            { kind },
            { sort: '-created_date', limit: 60 }
          );
    setResources(page.items || []);
    setLoading(false);
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (resource) => {
    setEditing(resource);
    setDialogOpen(true);
  };

  const remove = async (resource) => {
    if (!window.confirm(`Remove “${resource.title}” from the training library?`)) return;
    await base44.entities.TrainingResource.delete(resource.id);
    load();
  };

  if (!access.loading && !access.canLearn) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
            Training library
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            Articles, short video tips and exercises from the Sound team, for every rider.
          </p>
        </div>
        <UpgradeNotice
          plan="pro"
          title="The Learn library is part of Pro"
          text="Upgrade to open every article, video tip and exercise. Reviews stay free on every plan."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-[26px] font-bold leading-tight text-ink">
          Training library
        </h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
          Articles, short video tips and exercises from the Sound team, for every rider.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {TRAINING_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setKind(item.key)}
              className={cn(
                'min-h-[40px] shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200',
                kind === item.key
                  ? 'border-brand bg-brand text-white'
                  : 'border-hairline bg-white text-ink-soft hover:border-brand/40'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openAdd}
            className="ml-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white transition-opacity duration-200 hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Add resource
          </button>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {loading && <p className="text-[14px] text-ink-soft">Opening the library…</p>}
        {!loading &&
          resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={remove}
            />
          ))}
        {!loading && resources.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white px-4 py-6 text-center text-[13.5px] leading-relaxed text-ink-soft sm:col-span-2">
            Nothing here yet. Training resources will appear as the team publishes them.
          </p>
        )}
      </div>

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={editing}
        onSaved={load}
      />
    </div>
  );
}