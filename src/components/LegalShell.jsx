import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LegalShell({ title, updated, children }) {
  return (
    <div className="space-y-5">
      <Link
        to="/"
        className="inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-brand"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to Sound
      </Link>
      <div>
        <h1 className="font-heading text-[28px] font-bold leading-tight text-ink">{title}</h1>
        {updated && <p className="mt-1.5 text-[13px] text-ink-soft">Last updated {updated}</p>}
      </div>
      <div className="space-y-5 rounded-2xl border border-hairline bg-white p-5 text-[14px] leading-relaxed text-ink">
        {children}
      </div>
      <p className="text-[12px] leading-relaxed text-ink-soft">
        This page sets out the Sound community rules in plain language. The final wording is being
        reviewed by a South African attorney before launch.
      </p>
    </div>
  );
}