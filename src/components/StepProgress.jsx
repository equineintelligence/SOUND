import { cn } from '@/lib/utils';

export default function StepProgress({ step, labels }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {labels.map((label, i) => (
          <span
            key={label}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i < step ? 'bg-brand' : 'bg-surface'
            )}
          />
        ))}
      </div>
      <p className="text-[12px] font-medium text-ink-soft">
        Step {step} of {labels.length} · {labels[step - 1]}
      </p>
    </div>
  );
}