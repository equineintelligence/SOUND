import { Outlet } from 'react-router-dom';
import { Compass, PenLine, ClipboardList, User, Home, BookOpen } from 'lucide-react';
import SoundLogo from '@/components/SoundLogo';
import TabBar from '@/components/TabBar';
import SoundFooter from '@/components/SoundFooter';

const TABS = [
  { label: 'Discover', to: '/', icon: Compass },
  { label: 'My Yard', to: '/my-yard', icon: Home },
  { label: 'Learn', to: '/training', icon: BookOpen },
  { label: 'Write', to: '/write', icon: PenLine },
  { label: 'My reviews', to: '/my-reviews', icon: ClipboardList },
  { label: 'Account', to: '/account', icon: User },
];

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-hairline bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-5 py-3">
          <SoundLogo height={32} />
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