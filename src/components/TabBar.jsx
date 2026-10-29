import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function TabBar({ items }) {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-3xl items-stretch justify-around px-2">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors duration-200',
                isActive ? 'text-brand' : 'text-ink-soft hover:text-ink'
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} />
            <span className="leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}