'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/bottom-nav';
import { useLocalStorage, getTodayString, formatDate } from '@/hooks/use-local-storage';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  History,
  Flame,
  BookOpen,
  AlertCircle,
  Heart,
  Lightbulb,
} from 'lucide-react';
import { DEFAULT_DAILY_QUESTIONS, type DailyQuestionConfig } from '@/lib/question-config';

interface DailyRecord {
  id: string;
  date: string;
  answers: Record<string, string>;
  createdAt: string;
}

// 图标映射
const iconMap = {
  BookOpen,
  Lightbulb,
  AlertCircle,
  Heart,
  Sparkles,
};

// 颜色配置
const colorConfigs = [
  { color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-50 dark:bg-violet-950/30' },
  { color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  { color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  { color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { color: 'from-sky-500 to-blue-500', bgColor: 'bg-sky-50 dark:bg-sky-950/30' },
  { color: 'from-indigo-500 to-violet-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { color: 'from-teal-500 to-emerald-500', bgColor: 'bg-teal-50 dark:bg-teal-950/30' },
];

export default function DailyReviewPage() {
  const [records, setRecords] = useLocalStorage<DailyRecord[]>('daily-review', []);
  const [dailyQuestionConfig] = useLocalStorage<DailyQuestionConfig[]>('daily-questions-config', DEFAULT_DAILY_QUESTIONS);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showHistory, setShowHistory] = useState(false);

  const todayRecord = useMemo(() => {
    return records.find((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  // 从配置动态生成答案状态
  const initialAnswers = useMemo(() => {
    const ans: Record<string, string> = {};
    dailyQuestionConfig.forEach(q => {
      ans[q.key] = todayRecord?.answers[q.key] || '';
    });
    return ans;
  }, [todayRecord, dailyQuestionConfig]);

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);

  // 计算连续天数
  const streak = useMemo(() => {
    const sortedDates = [...new Set(records.map((r) => r.date))].sort().reverse();
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (date.getTime() === expectedDate.getTime()) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [records]);

  const handleSave = () => {
    const existingIndex = records.findIndex((r) => r.date === selectedDate);
    const newRecord: DailyRecord = {
      id: existingIndex >= 0 ? records[existingIndex].id : Date.now().toString(),
      date: selectedDate,
      answers,
      createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      setRecords(records.map((r, i) => (i === existingIndex ? newRecord : r)));
    } else {
      setRecords([newRecord, ...records]);
    }
  };

  const handleDateChange = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
    
    // 加载该日期的记录
    const record = records.find((r) => r.date === current.toISOString().split('T')[0]);
    if (record) {
      setAnswers(record.answers);
    } else {
      // 重置为空的答案对象
      const emptyAnswers: Record<string, string> = {};
      dailyQuestionConfig.forEach(q => {
        emptyAnswers[q.key] = '';
      });
      setAnswers(emptyAnswers);
    }
  };

  const isToday = selectedDate === getTodayString();

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 pt-8 pb-6 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            每日复盘
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            睡前10分钟，核心问题助你成长
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <Flame className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-orange-100 text-sm">连续复盘</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <History className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{records.length}</div>
                <div className="text-blue-100 text-sm">总记录</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 提示横幅 */}
        <Card className="mb-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  💡 你可以在「设置」中自定义这些问题
                </p>
              </div>
            </div>
            <Link href="/settings">
              <Button size="sm" variant="ghost" className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900">
                前往
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 日期选择器 */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDateChange(-1)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedDate)}
                </div>
                {isToday && (
                  <Badge className="bg-blue-500 text-white text-xs mt-1">今天</Badge>
                )}
                {!isToday && records.find((r) => r.date === selectedDate) && (
                  <Badge className="bg-green-500 text-white text-xs mt-1">已记录</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDateChange(1)}
                disabled={isToday}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 问题表单 */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📝</span> 今日复盘
            </CardTitle>
            <CardDescription className="text-blue-100">
              认真思考每一个问题，记录真实的自己
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {dailyQuestionConfig.map((q, index) => {
              // 循环使用图标和颜色配置
              const iconKey = Object.keys(iconMap)[index % Object.keys(iconMap).length] as keyof typeof iconMap;
              const IconComponent = iconMap[iconKey];
              const colorConfig = colorConfigs[index % colorConfigs.length];

              return (
                <div key={q.key} className="space-y-2">
                  <Label className={`flex items-center gap-2 p-2 rounded-lg ${colorConfig.bgColor}`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorConfig.color} flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {index + 1}. {q.question}
                    </span>
                  </Label>
                  <Textarea
                    placeholder={q.placeholder}
                    value={answers[q.key] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q.key]: e.target.value })
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12"
        >
          <Save className="w-4 h-4 mr-2" />
          保存今日复盘
        </Button>

        {/* 坚持效果提示 */}
        <Card className="mt-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              坚持复盘的效果
            </h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600 border-blue-300">1个月</Badge>
                <span>思路更清晰</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-violet-600 border-violet-300">3个月</Badge>
                <span>能明显感受到进步</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-emerald-600 border-emerald-300">1年</Badge>
                <span>整个人状态发生真实改变</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              💡 迷茫本质是缺少日常记录和复盘
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

// Label 组件
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
