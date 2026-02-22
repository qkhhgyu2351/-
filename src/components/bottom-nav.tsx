'use client';

import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, ClipboardList, Home, Target, Brain, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: '首页', path: '/' },
  { icon: Target, label: '年度计划', path: '/annual-plan' },
  { icon: CalendarDays, label: '每日复盘', path: '/daily-review' },
  { icon: Brain, label: '深度复盘', path: '/deep-review' },
  { icon: ClipboardList, label: '追踪', path: '/tracking' },
  { icon: Settings, label: '设置', path: '/settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-1', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
