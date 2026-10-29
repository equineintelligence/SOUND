import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import YardPhoto from '@/components/yard/YardPhoto';
import { ageLabel, initials } from '@/lib/yard';

export default function HorseCard({ horse }) {
  const details = [horse.breed, ageLabel(horse)].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/my-yard/horse/${horse.id}`}
      className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-3 transition-colors duration-200 hover:bg-brand-soft/40"
    >
      <YardPhoto
        fileUri={horse.photo_uri}
        alt={horse.name}
        fallback={initials(horse.name)}
        className="h-14 w-14 shrink-0 rounded-xl"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[15px] font-semibold text-ink">
          {horse.name}
        </span>
        <span className="block truncate text-[13px] text-ink-soft">
          {details || 'Add breed and age'}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={2} />
    </Link>
  );
}