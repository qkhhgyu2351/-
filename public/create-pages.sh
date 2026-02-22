#!/bin/bash

# 创建所有页面文件的脚本
# 在 GitHub Desktop 的仓库根目录运行此脚本

echo "开始创建所有页面文件..."

# 创建每日复盘页面
mkdir -p src/app/daily-review
cat > src/app/daily-review/page.tsx << 'ENDOFFILE'
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronLeft, ChevronRight, Save, Flame, History } from 'lucide-react';
import { useLocalStorage, getTodayString, formatDate } from '@/hooks/use-local-storage';
import { DEFAULT_DAILY_QUESTIONS } from '@/lib/question-config';

interface DailyRecord {
  id: string;
  date: string;
  answers: Record<string, string>;
  createdAt: string;
}

export default function DailyReviewPage() {
  const [records, setRecords] = useLocalStorage<DailyRecord[]>('daily-review', []);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const todayRecord = useMemo(() => {
    return records.find((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  const initialAnswers = useMemo(() => {
    const ans: Record<string, string> = {};
    DEFAULT_DAILY_QUESTIONS.forEach(q => {
      ans[q.key] = todayRecord?.answers[q.key] || '';
    });
    return ans;
  }, [todayRecord]);

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);

  const streak = useMemo(() => {
    if (!records || records.length === 0) return 0;
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
    alert('保存成功！');
  };

  const handleDateChange = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);

    const record = records.find((r) => r.date === current.toISOString().split('T')[0]);
    if (record) {
      setAnswers(record.answers);
    } else {
      const emptyAnswers: Record<string, string> = {};
      DEFAULT_DAILY_QUESTIONS.forEach(q => {
        emptyAnswers[q.key] = '';
      });
      setAnswers(emptyAnswers);
    }
  };

  const isToday = selectedDate === getTodayString();

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 pt-8 pb-6">
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

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => handleDateChange(-1)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <div className="font-semibold text-slate-800">
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

        <div className="space-y-4 mb-20">
          {DEFAULT_DAILY_QUESTIONS.map((q) => (
            <Card key={q.key}>
              <CardContent className="p-4">
                <label className="block font-medium text-slate-800 mb-2">
                  {q.question}
                </label>
                <Textarea
                  value={answers[q.key] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                  placeholder={q.placeholder}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="w-5 h-5 mr-2" />
              保存复盘
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
ENDOFFILE

echo "✅ 每日复盘页面创建完成"

# 创建深度复盘页面
mkdir -p src/app/deep-review
cat > src/app/deep-review/page.tsx << 'ENDOFFILE'
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Brain, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DEFAULT_DEEP_QUESTIONS } from '@/lib/question-config';

interface DeepReviewRecord {
  id: string;
  date: string;
  answers: Record<string, string>;
  createdAt: string;
}

export default function DeepReviewPage() {
  const [records, setRecords] = useLocalStorage<DeepReviewRecord[]>('deep-review', []);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['reflection']);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = () => {
    const newRecord: DeepReviewRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      answers,
      createdAt: new Date().toISOString(),
    };
    setRecords([newRecord, ...records]);
    alert('保存成功！');
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            深度复盘
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            深度问题深度剖析，年度自我审视
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-4 mb-20">
          {DEFAULT_DEEP_QUESTIONS.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            return (
              <Card key={category.id} className={`${category.bgColor} border-0`}>
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                        <span className="text-white font-bold">
                          {category.name[0]}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-800">
                        {category.name}
                      </span>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                        {category.questions.length}问
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {category.questions.map((q) => (
                        <div key={q.id}>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {q.text}
                          </label>
                          <Textarea
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            placeholder="输入你的答案..."
                            className="min-h-[80px]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="w-5 h-5 mr-2" />
              保存深度复盘
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
ENDOFFILE

echo "✅ 深度复盘页面创建完成"

# 创建年度计划页面
mkdir -p src/app/annual-plan
cat > src/app/annual-plan/page.tsx << 'ENDOFFILE'
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Target, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface AnnualPlan {
  id: string;
  kpt: {
    keep: string;
    problem: string;
    try: string;
  };
  smartGoals: string;
  createdAt: string;
}

export default function AnnualPlanPage() {
  const [plans, setPlans] = useLocalStorage<AnnualPlan[]>('annual-plan', []);
  const [currentPlan, setCurrentPlan] = useState<AnnualPlan | null>(plans[0] || null);

  const handleSave = () => {
    if (!currentPlan) return;

    const newPlan: AnnualPlan = {
      ...currentPlan,
      createdAt: new Date().toISOString(),
    };

    if (plans.length === 0) {
      setPlans([newPlan]);
    } else {
      setPlans([newPlan, ...plans.slice(1)]);
    }
    alert('保存成功！');
  };

  const handleKPTChange = (field: 'keep' | 'problem' | 'try', value: string) => {
    setCurrentPlan({
      ...currentPlan!,
      kpt: { ...currentPlan!.kpt, [field]: value },
    });
  };

  if (!currentPlan && plans.length === 0) {
    setCurrentPlan({
      id: Date.now().toString(),
      kpt: { keep: '', problem: '', try: '' },
      smartGoals: '',
      createdAt: new Date().toISOString(),
    });
  }

  if (!currentPlan) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            年度计划
          </h1>
          <p className="text-violet-100 text-sm mt-1">
            KPT复盘 → SMART目标 → 拆解每日
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 text-slate-800">KPT 复盘</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-green-600 mb-1">Keep（保持）</label>
                <Textarea
                  value={currentPlan.kpt.keep}
                  onChange={(e) => handleKPTChange('keep', e.target.value)}
                  placeholder="过去一年做得好的地方..."
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="block font-medium text-red-600 mb-1">Problem（问题）</label>
                <Textarea
                  value={currentPlan.kpt.problem}
                  onChange={(e) => handleKPTChange('problem', e.target.value)}
                  placeholder="过去一年遇到的困难和挑战..."
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="block font-medium text-blue-600 mb-1">Try（尝试）</label>
                <Textarea
                  value={currentPlan.kpt.try}
                  onChange={(e) => handleKPTChange('try', e.target.value)}
                  placeholder="新的一年想要尝试的改变..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4 text-slate-800">SMART 目标</h2>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                明年的核心目标
              </label>
              <Textarea
                value={currentPlan.smartGoals}
                onChange={(e) => setCurrentPlan({ ...currentPlan, smartGoals: e.target.value })}
                placeholder="Specific（具体的）&nbsp;&nbsp;Measurable（可衡量的）&nbsp;&nbsp;Achievable（可实现的）&nbsp;&nbsp;Relevant（相关的）&nbsp;&nbsp;Time-bound（有时限的）"
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="max-w-lg mx-auto">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="w-5 h-5 mr-2" />
              保存年度计划
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
ENDOFFILE

echo "✅ 年度计划页面创建完成"

# 创建设置页面
mkdir -p src/app/settings
cat > src/app/settings/page.tsx << 'ENDOFFILE'
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Plus, Trash2, Save, CalendarDays, Brain } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DEFAULT_DAILY_QUESTIONS, DEFAULT_DEEP_QUESTIONS } from '@/lib/question-config';

export default function SettingsPage() {
  const [dailyQuestions, setDailyQuestions] = useLocalStorage('daily-questions-config', DEFAULT_DAILY_QUESTIONS);
  const [deepQuestions, setDeepQuestions] = useLocalStorage('deep-questions-config', DEFAULT_DEEP_QUESTIONS);
  const [activeTab, setActiveTab] = useState<'daily' | 'deep'>('daily');
  const [newDailyQuestion, setNewDailyQuestion] = useState({ key: '', question: '', placeholder: '' });

  const handleAddDailyQuestion = () => {
    if (newDailyQuestion.key && newDailyQuestion.question) {
      setDailyQuestions([...dailyQuestions, { ...newDailyQuestion }]);
      setNewDailyQuestion({ key: '', question: '', placeholder: '' });
    }
  };

  const handleDeleteDailyQuestion = (index: number) => {
    setDailyQuestions(dailyQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            设置
          </h1>
          <p className="text-slate-200 text-sm mt-1">
            自定义复盘问题
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('daily')}
            variant={activeTab === 'daily' ? 'default' : 'outline'}
            className="flex-1"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            每日复盘
          </Button>
          <Button
            onClick={() => setActiveTab('deep')}
            variant={activeTab === 'deep' ? 'default' : 'outline'}
            className="flex-1"
          >
            <Brain className="w-4 h-4 mr-2" />
            深度复盘
          </Button>
        </div>

        {activeTab === 'daily' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">添加新问题</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="唯一标识（如：mood）"
                    value={newDailyQuestion.key}
                    onChange={(e) => setNewDailyQuestion({ ...newDailyQuestion, key: e.target.value })}
                  />
                  <Input
                    placeholder="问题内容"
                    value={newDailyQuestion.question}
                    onChange={(e) => setNewDailyQuestion({ ...newDailyQuestion, question: e.target.value })}
                  />
                  <Textarea
                    placeholder="提示文字"
                    value={newDailyQuestion.placeholder}
                    onChange={(e) => setNewDailyQuestion({ ...newDailyQuestion, placeholder: e.target.value })}
                    className="min-h-[60px]"
                  />
                  <Button onClick={handleAddDailyQuestion} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    添加问题
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {dailyQuestions.map((q, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{q.question}</div>
                        <div className="text-sm text-slate-500 mt-1">{q.placeholder}</div>
                        <div className="text-xs text-slate-400 mt-1">key: {q.key}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDailyQuestion(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deep' && (
          <Card>
            <CardContent className="p-4">
              <p className="text-slate-600">
                深度复盘问题暂不支持自定义，包含 {DEFAULT_DEEP_QUESTIONS.length} 个分类，共 {DEFAULT_DEEP_QUESTIONS.reduce((sum, cat) => sum + cat.questions.length, 0)} 个问题。
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
ENDOFFILE

echo "✅ 设置页面创建完成"

# 创建追踪页面
mkdir -p src/app/tracking
cat > src/app/tracking/page.tsx << 'ENDOFFILE'
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Flame, TrendingUp } from 'lucide-react';

interface DailyRecord {
  id: string;
  date: string;
  answers: Record<string, string>;
  createdAt: string;
}

export default function TrackingPage() {
  const [dailyRecords] = useLocalStorage<DailyRecord[]>('daily-review', []);

  const streak = (() => {
    if (!dailyRecords || dailyRecords.length === 0) return 0;
    const sortedDates = [...new Set(dailyRecords.map((r) => r.date))].sort().reverse();
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
  })();

  const totalWords = dailyRecords.reduce((sum, record) => {
    return sum + Object.values(record.answers).join('').length;
  }, 0);

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 pt-8 pb-6">
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
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-slate-800">{streak}</div>
              <div className="text-xs text-slate-500">连续天数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-slate-800">{dailyRecords.length}</div>
              <div className="text-xs text-slate-500">总记录</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold text-slate-800">{totalWords}</div>
              <div className="text-xs text-slate-500">总字数</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4 text-slate-800">使用提示</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• 坚持每日复盘，培养自我反思习惯</li>
              <li>• 定期进行深度复盘，审视长期目标</li>
              <li>• 每年初制定年度计划，年底回顾</li>
              <li>• 所有数据保存在本地，注意备份</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
ENDOFFILE

echo "✅ 追踪页面创建完成"

echo ""
echo "🎉 所有页面创建完成！"
echo ""
echo "下一步："
echo "1. 回到 GitHub Desktop"
echo "2. 你会看到所有新文件"
echo "3. 输入提交信息：add all pages"
echo "4. 点击 Commit"
echo "5. 点击 Push"
echo ""
echo "完成后等待 Vercel 自动部署（2-3 分钟）"
