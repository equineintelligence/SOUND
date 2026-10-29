import { Outlet, Link } from 'react-router-dom';
import { Home, MessageSquare, Store, Compass } from 'lucide-react';
import SoundLogo from '@/components/SoundLogo';
import TabBar from '@/components/TabBar';
import SoundFooter from '@/components/SoundFooter';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Home', to: '/business', icon: Home },
  { label: 'Reviews', to: '/business/reviews', icon: MessageSquare },
  { label: 'Profile', to: '/business/profile', icon: Store },
];

export default function BusinessLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-hairline bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-5 py-3">
          <SoundLogo height={32} />
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-medium text-brand">
            Business
          </span>
          <Link
            to="/"
            className={cn(
              'ml-auto inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-ink-soft',
              'transition-colors duration-200 hover:text-ink'
            )}
          >
            <Compass className="h-4 w-4" strokeWidth={1.9} />
            Rider view
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-40 pt-5">
        <Outlet />
      </main>
      <SoundFooter />
      <TabBar items={TABS} />
    </div>
  );
}