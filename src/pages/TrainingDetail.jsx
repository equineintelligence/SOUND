import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import UpgradeNotice from '@/components/upgrade/UpgradeNotice';
import useAccess from '@/hooks/useAccess';
import TrainingVideo from '@/components/training/TrainingVideo';
import { KIND_LABELS } from '@/lib/training';

export default function TrainingDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const access = useAccess();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const record = await base44.entities.TrainingResource.get(id);
        if (active) setResource(record);
      } catch (err) {
        if (active) setResource(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const backLink = (
    <Link
      to="/training"
      className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-ink-soft transition-colors duration-200 hover:text-brand"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      Training library
    </Link>
  );

  if (loading || access.loading) {
    return <p className="px-1 py-6 text-[14px] text-ink-soft">Loading…</p>;
  }

  if (!access.canLearn) {
    return (
      <div className="space-y-4">
        {backLink}
        <UpgradeNotice
          plan="pro"
          title="The Learn library is part of Pro"
          text="Upgrade to open every article, video tip and exercise. Reviews stay free on every plan."
        />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="space-y-4">
        {backLink}
        <p className="rounded-2xl border border-hairline bg-white px-4 py-6 text-center text-[13.5px] text-ink-soft">
          That resource could not be found. It may have been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {backLink}

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          {KIND_LABELS[resource.kind] || 'Resource'}
          {resource.duration && <span className="font-medium normal-case"> · {resource.duration}</span>}
        </span>
        <h1 className="mt-1 font-heading text-[26px] font-bold leading-tight text-ink">
          {resource.title}
        </h1>
        {resource.summary && (
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{resource.summary}</p>
        )}
      </div>

      {resource.cover_url && (
        <Image
          src={resource.cover_url}
          alt=""
          className="h-48 w-full rounded-2xl sm:h-64"
          fittingType="fill"
        />
      )}

      <TrainingVideo resource={resource} />

      {resource.body && (
        <div className="space-y-3 rounded-2xl border border-hairline bg-white p-5">
          {resource.body
            .split(/\n+/)
            .filter((line) => line.trim())
            .map((paragraph, index) => (
              <p key={index} className="text-[14.5px] leading-relaxed text-ink">
                {paragraph}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}