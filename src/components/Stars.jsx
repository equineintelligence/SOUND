import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Stars({ value = 0, size = 16, onRate, className }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const icon = (
          <Star
            style={{ width: size, height: size }}
            className={filled ? 'text-tan' : 'text-hairline'}
            fill={filled ? 'currentColor' : 'none'}
            strokeWidth={1.7}
          />
        );
        return onRate ? (
          <button
            key={n}
            type="button"
            onClick={() => onRate(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="tap flex items-center justify-center"
          >
            {icon}
          </button>
        ) : (
          <span key={n} className="flex">{icon}</span>
        );
      })}
    </div>
  );
}