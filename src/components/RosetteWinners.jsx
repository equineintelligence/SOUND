import { Link } from 'react-router-dom';
import Rosette from '@/components/Rosette';
import { rosetteTone } from '@/lib/sound';

export default function RosetteWinners({ winners }) {
  if (!winners.length) return null;
  return (
    <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
      {winners.map((w) => (
        <Link
          key={w.id}
          to={`/business/${w.id}`}
          className="w-[168px] shrink-0 rounded-2xl border border-hairline bg-white p-4 transition-colors duration-200 hover:bg-brand-soft/40"
        >
          <Rosette size={64} tone={rosetteTone(w.rating)}>
            <span className="font-heading text-[15px] font-bold leading-none">{w.rating}</span>
          </Rosette>
          <p className="mt-3 line-clamp-2 font-heading text-[14px] font-semibold leading-snug text-ink">
            {w.name}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-soft">{w.rosette_label}</p>
        </Link>
      ))}
    </div>
  );
}