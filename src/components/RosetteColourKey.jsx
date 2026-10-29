import Rosette from '@/components/Rosette';

const TIERS = [
  { tone: 'blue', sample: '4.8', label: 'Blue', range: 'Over 4.5' },
  { tone: 'red', sample: '4.2', label: 'Red', range: 'Over 4' },
  { tone: 'yellow', sample: '3.8', label: 'Yellow', range: 'Over 3.5' },
  { tone: 'green', sample: '3.4', label: 'Green', range: '3.5 or lower' },
];

export default function RosetteColourKey() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TIERS.map((t) => (
        <div
          key={t.tone}
          className="flex flex-col items-center rounded-2xl border border-hairline bg-white p-4 text-center"
        >
          <Rosette size={64} tone={t.tone}>
            <span className="font-heading text-[15px] font-bold leading-none">{t.sample}</span>
          </Rosette>
          <p className="mt-3 font-heading text-[14px] font-semibold text-ink">{t.label}</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">{t.range}</p>
        </div>
      ))}
    </div>
  );
}