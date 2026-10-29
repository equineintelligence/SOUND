import { cn } from '@/lib/utils';
import { ROSETTE_TONES } from '@/lib/sound';

/**
 * The Sound signature element: a show-ring rosette.
 * Coloured by the rating it stands for: over 4.5 blue, over 4 red, over 3.5 yellow,
 * otherwise the Sound brand green. Dashed white ring, dark ribbon tails.
 */
export default function Rosette({ size = 96, tone = 'green', children, className }) {
  const { disc, tail } = ROSETTE_TONES[tone] || ROSETTE_TONES.green;
  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill={tail}>
          <path d="M46 62 L26 97 L39 93 L45 76 Z" />
          <path d="M54 62 L74 97 L61 93 L55 76 Z" />
        </g>
        <circle cx="50" cy="44" r="41" fill={disc} />
        <circle
          cx="50"
          cy="44"
          r="34"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeDasharray="3.4 3.4"
          opacity="0.9"
        />
      </svg>
      <div
        className="relative flex flex-col items-center justify-center text-center text-white"
        style={{ transform: `translateY(${-size * 0.06}px)` }}
      >
        {children}
      </div>
    </div>
  );
}