'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/bottom-nav';
import { useLocalStorage, generateId } from '@/hooks/use-local-storage';
import { 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  Calendar, 
  CheckCircle2,
  Sparkles,
  Save,
  Download,
  RotateCcw
} from 'lucide-react';

interface KPTData {
  keep: string;
  problem: string;
  try: string;
}

interface SMARTGoal {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

interface MonthlyTask {
  id: string;
  goalId: string;
  month: number;
  task: string;
  completed: boolean;
}

interface AnnualPlan {
  kpt: KPTData;
  goals: SMARTGoal[];
  monthlyTasks: MonthlyTask[];
  createdAt: string;
  updatedAt: string;
}

const steps = [
  { id: 1, title: 'KPT复盘', description: '10分钟回顾去年', icon: '📊' },
  { id: 2, title: 'SMART目标', description: '制定年度目标', icon: '🎯' },
  { id: 3, title: '拆解每日', description: '生成行动计划', icon: '📅' },
  { id: 4, title: '月度追踪', description: '追踪完成进度', icon: '📈' },
];

export default function AnnualPlanPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [plan, setPlan] = useLocalStorage<AnnualPlan>('annual-plan', {
    kpt: { keep: '', problem: '', try: '' },
    goals: [],
    monthlyTasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const progress = (currentStep / steps.length) * 100;

  const handleSave = () => {
    setPlan({
      ...plan,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `年度计划-${new Date().getFullYear()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
      setPlan({
        kpt: { keep: '', problem: '', try: '' },
        goals: [],
        monthlyTasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 pt-8 pb-6 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            年度计划工作台
          </h1>
          <p className="text-violet-100 text-sm mt-1">
            四步法制定可落地的高完成率计划
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">进度</span>
              <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-3">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center transition-all ${
                    currentStep >= step.id
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 ${
                      currentStep === step.id
                        ? 'bg-violet-600 text-white'
                        : currentStep > step.id
                        ? 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.icon}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1KPT kpt={plan.kpt} onUpdate={(kpt) => setPlan({ ...plan, kpt })} />
        )}
        {currentStep === 2 && (
          <Step2SMART goals={plan.goals} onUpdate={(goals) => setPlan({ ...plan, goals })} />
        )}
        {currentStep === 3 && (
          <Step3DailyTasks goals={plan.goals} tasks={plan.monthlyTasks} onUpdate={(tasks) => setPlan({ ...plan, monthlyTasks: tasks })} />
        )}
        {currentStep === 4 && (
          <Step4Tracking plan={plan} onUpdate={setPlan} />
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
          )}
          {currentStep < 4 ? (
            <Button
              onClick={() => {
                handleSave();
                setCurrentStep(currentStep + 1);
              }}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-2 flex-1">
              <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600">
                <Save className="w-4 h-4 mr-2" />
                保存计划
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <Button
          variant="ghost"
          onClick={handleReset}
          className="w-full mt-4 text-slate-500 hover:text-red-500"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          重置所有数据
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}

// Step 1: KPT 复盘
function Step1KPT({ kpt, onUpdate }: { kpt: KPTData; onUpdate: (kpt: KPTData) => void }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <span>📊</span> KPT 复盘法
        </CardTitle>
        <CardDescription className="text-emerald-100">
          回顾{new Date().getFullYear() - 1}年，为新的一年做准备
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keep" className="flex items-center gap-2">
            <Badge className="bg-emerald-500">K - Keep</Badge>
            去年坚持的、做得好的事
          </Label>
          <Textarea
            id="keep"
            placeholder="例如：坚持每周运动3次、完成了XX项目学习..."
            value={kpt.keep}
            onChange={(e) => onUpdate({ ...kpt, keep: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="problem" className="flex items-center gap-2">
            <Badge className="bg-orange-500">P - Problem</Badge>
            遇到的问题、不足之处
          </Label>
          <Textarea
            id="problem"
            placeholder="例如：经常拖延、时间管理不够好..."
            value={kpt.problem}
            onChange={(e) => onUpdate({ ...kpt, problem: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="try" className="flex items-center gap-2">
            <Badge className="bg-blue-500">T - Try</Badge>
            新的一年要尝试的改进方法
          </Label>
          <Textarea
            id="try"
            placeholder="例如：使用番茄工作法、每天早上规划当日任务..."
            value={kpt.try}
            onChange={(e) => onUpdate({ ...kpt, try: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <strong>提示：</strong>可以借助 AI 帮你梳理痛点和方案。每个问题都想一想，不用太长，关键是真实。
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 2: SMART 目标设定
function Step2SMART({ goals, onUpdate }: { goals: SMARTGoal[]; onUpdate: (goals: SMARTGoal[]) => void }) {
  const [newGoal, setNewGoal] = useState<Partial<SMARTGoal>>({
    title: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
    quarter: 'Q1',
  });

  const addGoal = () => {
    if (!newGoal.title) return;
    onUpdate([
      ...goals,
      {
        id: generateId(),
        title: newGoal.title || '',
        specific: newGoal.specific || '',
        measurable: newGoal.measurable || '',
        achievable: newGoal.achievable || '',
        relevant: newGoal.relevant || '',
        timeBound: newGoal.timeBound || '',
        quarter: newGoal.quarter || 'Q1',
      },
    ]);
    setNewGoal({
      title: '',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
      quarter: 'Q1',
    });
  };

  const removeGoal = (id: string) => {
    onUpdate(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 已添加的目标 */}
      {goals.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">已设定的目标 ({goals.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((goal, index) => (
              <div
                key={goal.id}
                className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-violet-600 border-violet-300">
                        {goal.quarter}
                      </Badge>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        目标 {index + 1}: {goal.title}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {goal.specific}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(goal.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 添加新目标 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span> SMART 目标设定
          </CardTitle>
          <CardDescription className="text-violet-100">
            用 SMART 原则把模糊想法变成可执行目标
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">目标名称</Label>
            <Input
              id="goal-title"
              placeholder="例如：学会 Python 编程"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Badge className="bg-red-500">S</Badge> 具体的 (Specific)
            </Label>
            <Textarea
              placeholder="具体要做什么？例如：完成 Python 基础课程，能独立写小型项目"
              value={newGoal.specific}
              onChange={(e) => setNewGoal({ ...newGoal, specific: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Badge className="bg-orange-500">M</Badge> 可衡量 (Measurable)
            </Label>
            <Textarea
              placeholder="如何衡量完成？例如：完成30个练习题，做出3个小项目"
              value={newGoal.measurable}
              onChange={(e) => setNewGoal({ ...newGoal, measurable: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Badge className="bg-yellow-500">A</Badge> 可实现 (Achievable)
            </Label>
            <Textarea
              placeholder="为什么可以做到？例如：有编程基础，每周可以投入10小时学习"
              value={newGoal.achievable}
              onChange={(e) => setNewGoal({ ...newGoal, achievable: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Badge className="bg-green-500">R</Badge> 相关性 (Relevant)
            </Label>
            <Textarea
              placeholder="与你的大目标有什么关系？例如：有助于职业转型，提升技术能力"
              value={newGoal.relevant}
              onChange={(e) => setNewGoal({ ...newGoal, relevant: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Badge className="bg-blue-500">T</Badge> 有时限 (Time-bound)
            </Label>
            <Textarea
              placeholder="什么时候完成？例如：2026年3月底前完成基础课程，6月底前完成项目"
              value={newGoal.timeBound}
              onChange={(e) => setNewGoal({ ...newGoal, timeBound: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>季度分配</Label>
            <div className="flex gap-2">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <Button
                  key={q}
                  variant={newGoal.quarter === q ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewGoal({ ...newGoal, quarter: q })}
                  className={newGoal.quarter === q ? 'bg-violet-600' : ''}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={addGoal}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
            disabled={!newGoal.title}
          >
            添加目标
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 3: 拆解每日任务
function Step3DailyTasks({
  goals,
  tasks,
  onUpdate,
}: {
  goals: SMARTGoal[];
  tasks: MonthlyTask[];
  onUpdate: (tasks: MonthlyTask[]) => void;
}) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getTasksByMonth = (month: number) => {
    return tasks.filter((t) => t.month === month);
  };

  const addTask = (month: number, goalId: string) => {
    const taskText = prompt(`请输入${month}月的关键任务：`);
    if (taskText) {
      onUpdate([
        ...tasks,
        {
          id: generateId(),
          goalId,
          month,
          task: taskText,
          completed: false,
        },
      ]);
    }
  };

  const toggleTask = (taskId: string) => {
    onUpdate(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = (taskId: string) => {
    onUpdate(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <span>📅</span> 拆解到每月
        </CardTitle>
        <CardDescription className="text-blue-100">
          把目标拆成每月的关键任务
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>请先在第二步添加目标</p>
          </div>
        ) : (
          <div className="space-y-4">
            {months.map((month) => (
              <div key={month} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {month}月
                  </span>
                  <div className="flex gap-1">
                    {goals.map((goal) => (
                      <Button
                        key={goal.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => addTask(month, goal.id)}
                        className="h-7 text-xs"
                      >
                        + {goal.title.slice(0, 6)}...
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {getTasksByMonth(month).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded p-2"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          task.completed
                            ? 'text-slate-400 line-through'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {task.task}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                        className="text-red-500 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {getTasksByMonth(month).length === 0 && (
                    <p className="text-xs text-slate-400 py-2">点击上方按钮添加任务</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <strong>提示：</strong>可以点击目标名称，将目标拆解为每月的关键任务。每月设置 2-3 个关键任务即可，不要贪多。
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 4: 月度追踪
function Step4Tracking({
  plan,
  onUpdate,
}: {
  plan: AnnualPlan;
  onUpdate: (plan: AnnualPlan) => void;
}) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentMonth = new Date().getMonth() + 1;

  const completedTasks = plan.monthlyTasks.filter((t) => t.completed).length;
  const totalTasks = plan.monthlyTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getMonthCompletion = (month: number) => {
    const monthTasks = plan.monthlyTasks.filter((t) => t.month === month);
    const completed = monthTasks.filter((t) => t.completed).length;
    return {
      total: monthTasks.length,
      completed,
      rate: monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0,
    };
  };

  const toggleTask = (taskId: string) => {
    onUpdate({
      ...plan,
      monthlyTasks: plan.monthlyTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {/* 总览统计 */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-100 text-sm">总体完成率</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-sm">已完成 / 总任务</p>
              <p className="text-xl font-semibold">
                {completedTasks} / {totalTasks}
              </p>
            </div>
          </div>
          <Progress value={completionRate} className="h-2 mt-3 bg-emerald-600" />
        </CardContent>
      </Card>

      {/* 月度追踪表 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📈</span> 月度追踪表
          </CardTitle>
          <CardDescription>点击任务标记完成状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {months.map((month) => {
              const { completed, total, rate } = getMonthCompletion(month);
              const isCurrentMonth = month === currentMonth;
              return (
                <div
                  key={month}
                  className={`text-center p-2 rounded-lg ${
                    isCurrentMonth
                      ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500'
                      : total > 0
                      ? rate === 100
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-slate-100 dark:bg-slate-800'
                      : 'bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <div className="text-xs text-slate-500">{month}月</div>
                  <div className={`text-lg font-bold ${rate === 100 && total > 0 ? 'text-green-600' : ''}`}>
                    {total > 0 ? `${rate}%` : '-'}
                  </div>
                  {total > 0 && (
                    <div className="text-xs text-slate-400">
                      {completed}/{total}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 当前月份任务 */}
          <div className="border rounded-lg p-3">
            <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300">
              本月任务 ({currentMonth}月)
            </h4>
            {plan.monthlyTasks.filter((t) => t.month === currentMonth).length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                本月暂无任务，请在第三步添加
              </p>
            ) : (
              <div className="space-y-2">
                {plan.monthlyTasks
                  .filter((t) => t.month === currentMonth)
                  .map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`w-full text-left p-2 rounded flex items-center gap-2 transition-all ${
                        task.completed
                          ? 'bg-green-50 dark:bg-green-900/30'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span
                        className={`flex-1 text-sm ${
                          task.completed ? 'text-slate-400 line-through' : ''
                        }`}
                      >
                        {task.task}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 使用提示 */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-3">
            <p className="text-sm text-violet-700 dark:text-violet-300">
              <strong>使用方法：</strong>
              <br />
              1. 每月初查看本月任务清单
              <br />
              2. 完成一项，点击标记完成
              <br />
              3. 每月底回顾完成情况
              <br />
              4. 仅需一晚整理 + 每日1分钟，大幅提升计划完成率
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
