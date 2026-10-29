import { cn } from '@/lib/utils';

// The logo file lives in /public so the site no longer depends on Base44's
// image server.
const LOGO_SRC = `${import.meta.env.BASE_URL}sound-logo.png`;

// The supplied artwork is a square canvas with the mark sitting inside it, so
// the image is cropped to the mark's own proportions instead of shown whole.
const MARK_ASPECT = 1.59;
const MARK_CENTRE_Y = 0.462;

export default function SoundLogo({ height = 32, className }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Sound"
      className={cn('shrink-0 object-cover', className)}
      style={{
        height,
        width: Math.round(height * MARK_ASPECT),
        objectPosition: `50% ${MARK_CENTRE_Y * 100}%`,
      }}
    />
  );
}
