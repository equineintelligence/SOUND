import { cn } from '@/lib/utils';

const MAP = {
  pending: { label: 'Waiting for a moderator', className: 'bg-[#F3F5F1] text-[#5E6862]' },
  published: { label: 'Published', className: 'bg-[#EEF3EF] text-[#1E4D3A]' },
  returned: { label: 'Returned to you', className: 'bg-[#F7EFE5] text-[#A8692A]' },
  removed: { label: 'Removed', className: 'bg-[#F3F5F1] text-[#5E6862]' },
  expired: { label: 'Hidden after 36 months', className: 'bg-[#F3F5F1] text-[#5E6862]' },
  pending_check: { label: 'Waiting for approval', className: 'bg-[#F3F5F1] text-[#5E6862]' },
  unclaimed: { label: 'Not yet claimed', className: 'bg-[#F3F5F1] text-[#5E6862]' },
  claimed: { label: 'Profile managed by the business', className: 'bg-[#EEF3EF] text-[#1E4D3A]' },
  open: { label: 'Open', className: 'bg-[#F7EFE5] text-[#A8692A]' },
  resolved: { label: 'Resolved', className: 'bg-[#EEF3EF] text-[#1E4D3A]' },
  approved: { label: 'Approved', className: 'bg-[#EEF3EF] text-[#1E4D3A]' },
  rejected: { label: 'Not approved', className: 'bg-[#F3F5F1] text-[#5E6862]' },
  active: { label: 'Active', className: 'bg-[#EEF3EF] text-[#1E4D3A]' },
  withdrawn: { label: 'Withdrawn', className: 'bg-[#F3F5F1] text-[#5E6862]' },
};

export default function StatusPill({ status, className }) {
  const entry = MAP[status] || { label: status, className: 'bg-[#F3F5F1] text-[#5E6862]' };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium',
        entry.className,
        className
      )}
    >
      {entry.label}
    </span>
  );
}