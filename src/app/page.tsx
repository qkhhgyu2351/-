'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarDays, 
  Target, 
  Brain, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { useLocalStorage } from '@/hooks/use-local-storage';

const features = [
  {
    icon: Target,
    title: '年度计划',
    description: 'KPT复盘 → SMART目标 → 拆解每日 → 月度追踪',
    href: '/annual-plan',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
  },
  {
    icon: CalendarDays,
    title: '每日复盘',
    description: '睡前10分钟，核心问题助你成长',
    href: '/daily-review',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Brain,
    title: '深度复盘',
    description: '深度问题深度剖析，年度自我审视',
    href: '/deep-review',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: TrendingUp,
    title: '数据追踪',
    description: '可视化进度，见证每一步成长',
    href: '/tracking',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
];

export default function Home() {
  const [dailyRecords] = useLocalStorage('daily-review', []);
  const [annualPlan] = useLocalStorage('annual-plan', null);

  const stats = {
    dailyStreak: calculateStreak(dailyRecords),
    totalDays: dailyRecords.length,
    hasPlan: !!annualPlan,
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-blue-100 text-sm">2026 复盘计划助手</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">让计划真正落地</h1>
          <p className="text-blue-100 text-sm">
            可落地的年计划方法，帮你实现高完成率
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.dailyStreak}
              </div>
              <div className="text-xs text-blue-600/70 dark:text-blue-400/70">连续复盘</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {stats.totalDays}
              </div>
              <div className="text-xs text-violet-600/70 dark:text-violet-400/70">总记录</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-0">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.hasPlan ? '✓' : '○'}
              </div>
              <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">年度计划</div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className={`${feature.bgColor} border-0 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">快速开始</CardTitle>
            <CardDescription>今天想做点什么？</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/daily-review">
              <Button className="w-full justify-start gap-2" variant="outline">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                开始今日复盘
              </Button>
            </Link>
            {!stats.hasPlan && (
              <Link href="/annual-plan">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Target className="w-4 h-4 text-violet-500" />
                  制定年度计划
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

function calculateStreak(records: Array<{ date: string }>): number {
  if (!records || records.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedDates = records
    .map(r => new Date(r.date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 0;
  let currentDate = today;
  
  for (const date of sortedDates) {
    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = recordDate;
    } else {
      break;
    }
  }
  
  return streak;
}
