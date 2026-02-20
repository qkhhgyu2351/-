'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/bottom-nav';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  TrendingUp,
  CalendarDays,
  Target,
  Brain,
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export default function TrackingPage() {
  const [dailyRecords] = useLocalStorage<Array<{ date: string; answers: Record<string, string> }>>('daily-review', []);
  const [annualPlan] = useLocalStorage<{
    kpt: { keep: string; problem: string; try: string };
    goals: Array<{ id: string; title: string; quarter: string }>;
    monthlyTasks: Array<{ id: string; month: number; task: string; completed: boolean }>;
  } | null>('annual-plan', null);
  const [deepReviews] = useLocalStorage<Array<{ createdAt: string; answers: Array<{ answer: string }> }>>('deep-review', []);

  // 计算统计数据
  const stats = useMemo(() => {
    // 每日复盘统计
    const uniqueDates = [...new Set(dailyRecords.map((r) => r.date))];
    const streak = calculateStreak(uniqueDates);
    
    // 年度计划统计
    const totalGoals = annualPlan?.goals?.length || 0;
    const totalTasks = annualPlan?.monthlyTasks?.length || 0;
    const completedTasks = annualPlan?.monthlyTasks?.filter((t) => t.completed).length || 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 深度复盘统计
    const totalDeepReviews = deepReviews.length;
    const lastDeepReview = deepReviews[0];

    return {
      dailyStreak: streak,
      totalDailyRecords: uniqueDates.length,
      totalGoals,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalDeepReviews,
      hasAnnualPlan: !!annualPlan,
      lastDeepReviewDate: lastDeepReview
        ? new Date(lastDeepReview.createdAt).toLocaleDateString('zh-CN')
        : null,
    };
  }, [dailyRecords, annualPlan, deepReviews]);

  // 本月进度
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthTasks = annualPlan?.monthlyTasks?.filter((t) => t.month === currentMonth) || [];
  const currentMonthCompleted = currentMonthTasks.filter((t) => t.completed).length;
  const currentMonthRate = currentMonthTasks.length > 0
    ? Math.round((currentMonthCompleted / currentMonthTasks.length) * 100)
    : 0;

  // 年度目标分布
  const quarterlyGoals = useMemo(() => {
    if (!annualPlan?.goals) return { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    annualPlan.goals.forEach((g) => {
      if (g.quarter in counts) counts[g.quarter as keyof typeof counts]++;
    });
    return counts;
  }, [annualPlan]);

  // 每日复盘热力图数据
  const heatmapData = useMemo(() => {
    const today = new Date();
    const data: Array<{ date: string; hasRecord: boolean; intensity: number }> = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasRecord = dailyRecords.some((r) => r.date === dateStr);
      data.push({
        date: dateStr,
        hasRecord,
        intensity: hasRecord ? 1 : 0,
      });
    }
    return data;
  }, [dailyRecords]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 pt-8 pb-6 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            数据追踪
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            可视化进度，见证每一步成长
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 核心指标 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-orange-100 text-sm">连续复盘</span>
              </div>
              <div className="text-3xl font-bold">{stats.dailyStreak}</div>
              <div className="text-orange-100 text-xs mt-1">天</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500 to-purple-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-violet-100 text-sm">任务完成</span>
              </div>
              <div className="text-3xl font-bold">{stats.taskCompletionRate}%</div>
              <div className="text-violet-100 text-xs mt-1">
                {stats.completedTasks}/{stats.totalTasks}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 本月进度 */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              本月进度 ({currentMonth}月)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">已完成 {currentMonthCompleted} 项</span>
              <span className="text-slate-500">共 {currentMonthTasks.length} 项</span>
            </div>
            <Progress value={currentMonthRate} className="h-3" />
            <div className="mt-3 text-center">
              <span className="text-2xl font-bold text-emerald-600">{currentMonthRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* 每日复盘热力图 */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              复盘热力图
            </CardTitle>
            <CardDescription>最近30天复盘记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-1">
              {heatmapData.map((day) => (
                <div
                  key={day.date}
                  className={`aspect-square rounded-sm ${
                    day.hasRecord
                      ? 'bg-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  title={`${day.date} ${day.hasRecord ? '已复盘' : '未复盘'}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>30天前</span>
              <span>今天</span>
            </div>
          </CardContent>
        </Card>

        {/* 年度目标分布 */}
        {stats.hasAnnualPlan && (
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                年度目标分布
              </CardTitle>
              <CardDescription>共 {stats.totalGoals} 个目标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                  <div
                    key={q}
                    className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                      {quarterlyGoals[q]}
                    </div>
                    <div className="text-xs text-slate-500">{q}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 统计卡片组 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {stats.totalDailyRecords}
              </div>
              <div className="text-xs text-slate-500">每日复盘总数</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {stats.totalDeepReviews}
              </div>
              <div className="text-xs text-slate-500">深度复盘次数</div>
            </CardContent>
          </Card>
        </div>

        {/* 成就徽章 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              成就徽章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.dailyStreak >= 7 && (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  🔥 坚持一周
                </Badge>
              )}
              {stats.dailyStreak >= 30 && (
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                  ⭐ 坚持一月
                </Badge>
              )}
              {stats.totalDailyRecords >= 100 && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  💯 百日复盘
                </Badge>
              )}
              {stats.taskCompletionRate >= 50 && (
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  📈 行动派
                </Badge>
              )}
              {stats.hasAnnualPlan && (
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  🎯 有计划
                </Badge>
              )}
              {stats.totalDeepReviews >= 1 && (
                <Badge className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                  🧠 深度思考者
                </Badge>
              )}
              {stats.dailyStreak < 7 &&
                stats.totalDailyRecords < 100 &&
                !stats.hasAnnualPlan && (
                  <span className="text-sm text-slate-500">
                    继续努力，解锁更多成就！
                  </span>
                )}
            </div>
          </CardContent>
        </Card>

        {/* 数据统计说明 */}
        <Card className="mt-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="text-sm text-slate-500">
                <p className="mb-1">
                  <strong>数据存储：</strong>所有数据保存在本地浏览器中
                </p>
                <p>
                  <strong>建议：</strong>定期导出数据备份，避免数据丢失
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

// 计算连续天数
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (date.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
