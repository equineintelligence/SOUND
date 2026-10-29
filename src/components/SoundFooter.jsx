import { Link } from 'react-router-dom';
import SoundLogo from '@/components/SoundLogo';

const LINKS = [
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Privacy Notice', to: '/privacy' },
  { label: 'Content Policy', to: '/content-policy' },
  { label: 'How rosettes work', to: '/how-rosettes-work' },
];

export default function SoundFooter() {
  return (
    <footer className="mt-14 border-t border-hairline bg-surface">
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        <SoundLogo height={26} />
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          Find sound yards, coaches and farriers.
        </p>
        <nav className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex min-h-[44px] items-center text-[13px] font-medium text-brand underline-offset-4 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-5 text-[12px] leading-relaxed text-ink-soft">
          Reviews are written by verified customers about businesses offering equestrian services to
          the public. Reading reviews requires a Sound account during the pilot.
        </p>
      </div>
    </footer>
  );
}