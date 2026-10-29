import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function TabBar({ items }) {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-3xl items-stretch justify-around px-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-[58px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2 font-medium transition-colors duration-200',
                items.length > 6 ? 'text-[10px]' : 'text-[11px]',
                isActive ? 'text-brand' : 'text-ink-soft hover:text-ink'
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} />
            <span className="max-w-full truncate leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}