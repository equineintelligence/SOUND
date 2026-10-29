import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import StatusPill from '@/components/StatusPill';
import { initials } from '@/lib/sound';

export default function ExistingProfileMatch({ matches }) {
  if (!matches.length) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-brand/25 bg-brand-soft/50 p-4">
      <p className="flex gap-2 text-[13px] leading-relaxed text-brand">
        <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
        This business is already on Sound. If one of these is yours, link to it instead of creating a
        duplicate profile.
      </p>

      <div className="space-y-2">
        {matches.map((b) => (
          <Link
            key={b.id}
            to={`/business/claim?business=${b.id}`}
            className="flex items-center gap-3 rounded-xl border border-hairline bg-white px-3 py-2.5 transition-colors duration-200 hover:border-brand/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-heading text-[13px] font-semibold text-brand">
              {initials(b.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading text-[14px] font-semibold text-ink">
                {b.name}
              </span>
              <span className="block truncate text-[12px] text-ink-soft">
                {(b.type || []).join(' · ')}
                {b.area ? ` · ${b.area}` : ''}
              </span>
              <StatusPill status={b.status} className="mt-1.5" />
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand">
              Link
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
          </Link>
        ))}
      </div>

      <p className="text-[12px] leading-relaxed text-ink-soft">
        Linking takes you to a short ownership check. The reviews already on the profile stay with it.
      </p>
    </div>
  );
}