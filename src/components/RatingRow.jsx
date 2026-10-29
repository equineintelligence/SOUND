import Stars from '@/components/Stars';

export default function RatingRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[15px] text-ink">{label}</span>
      <Stars value={value} size={22} onRate={onChange} />
    </div>
  );
}