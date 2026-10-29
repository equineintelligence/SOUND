import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Rosette from '@/components/Rosette';

export default function RosetteGuideBanner() {
  return (
    <Link
      to="/how-rosettes-work"
      className="flex items-center gap-3.5 rounded-2xl border border-hairline bg-brand-soft/50 px-4 py-3 transition-colors duration-200 hover:bg-brand-soft"
    >
      <Rosette size={40} tone="blue" className="shrink-0">
        <span className="font-heading text-[10px] font-bold leading-none">4.8</span>
      </Rosette>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[14px] font-semibold text-ink">
          How rosettes work
        </span>
        <span className="block text-[13px] leading-relaxed text-ink-soft">
          Earned from verified reviews, and coloured by score: blue over 4.5, red over 4, yellow
          over 3.5, green below.
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
    </Link>
  );
}