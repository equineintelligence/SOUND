import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

/**
 * Shows a photo kept in private storage, signing a temporary link for it.
 */
export default function YardPhoto({ fileUri, alt, fallback, className }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let active = true;
    if (!fileUri) {
      setSrc(null);
      return () => {};
    }
    if (/^https?:/i.test(fileUri)) {
      setSrc(fileUri);
      return () => {};
    }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 })
      .then(({ signed_url }) => {
        if (active) setSrc(signed_url);
      })
      .catch(() => {
        if (active) setSrc(null);
      });
    return () => {
      active = false;
    };
  }, [fileUri]);

  return (
    <div className={cn('overflow-hidden bg-brand-soft', className)}>
      {src ? (
        <Image src={src} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-heading text-[15px] font-semibold text-brand">
          {fallback}
        </div>
      )}
    </div>
  );
}