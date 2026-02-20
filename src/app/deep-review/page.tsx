'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/bottom-nav';
import { useLocalStorage, exportToJSON, generateId } from '@/hooks/use-local-storage';
import {
  Brain,
  Save,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  TrendingUp,
  Rocket,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DeepReviewAnswer {
  questionId: string;
  answer: string;
}

interface DeepReviewRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  answers: DeepReviewAnswer[];
}

const questionCategories = [
  {
    id: 'reflection',
    name: '反思现状',
    count: 7,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Eye,
    questions: [
      { id: 'r1', text: '当下最让我内耗的事是什么？' },
      { id: 'r2', text: '我投入时间的事里，哪些是无效忙碌？' },
      { id: 'r3', text: '我的优势是什么？' },
      { id: 'r4', text: '人际关系中，谁在消耗我？谁在滋养我？' },
      { id: 'r5', text: '现在的生活状态是否满意？' },
      { id: 'r6', text: '最近一次成就感来自哪里？' },
      { id: 'r7', text: '我有目标和方向吗？' },
    ],
  },
  {
    id: 'planning',
    name: '未来规划',
    count: 11,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    icon: Target,
    questions: [
      { id: 'p1', text: '3年后，我想成为什么样的人？' },
      { id: 'p2', text: '未来1年，最想达成的目标是什么？' },
      { id: 'p3', text: '为了实现目标，我必须放弃哪些事？' },
      { id: 'p4', text: '5年后，我希望拥有的核心能力是什么？现在的差距多大？' },
      { id: 'p5', text: '理想的生活节奏是什么样的？' },
      { id: 'p6', text: '我想为家人创造什么价值？' },
      { id: 'p7', text: '未来可能遇到的最大风险是什么？' },
      { id: 'p8', text: '哪些人/平台/机会能帮我更快接近目标？' },
      { id: 'p9', text: '我最想避免的人生遗憾是什么？' },
      { id: 'p10', text: '财务上，未来1-3年的目标是什么？' },
      { id: 'p11', text: '希望别人如何形容你？' },
    ],
  },
  {
    id: 'growth',
    name: '自我提升',
    count: 8,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: TrendingUp,
    questions: [
      { id: 'g1', text: '目前阻碍我成长的最大短板是什么？' },
      { id: 'g2', text: '我需要学习哪些新技能？' },
      { id: 'g3', text: '哪些坏习惯正在消耗我？' },
      { id: 'g4', text: '我想培养的优质习惯是什么？' },
      { id: 'g5', text: '我需要向哪些人学习？' },
      { id: 'g6', text: '我的认知盲区可能在哪里？' },
      { id: 'g7', text: '如何更好地管理情绪？' },
      { id: 'g8', text: '如何提升「执行力」？' },
    ],
  },
  {
    id: 'action',
    name: '立即行动',
    count: 1,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: Rocket,
    questions: [
      { id: 'a1', text: '本周最该启动的具体小事是什么？' },
    ],
  },
];

export default function DeepReviewPage() {
  const [records, setRecords] = useLocalStorage<DeepReviewRecord[]>('deep-review', []);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['reflection']);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentRecord = useMemo(() => {
    return records.find((r) => r.id === currentRecordId);
  }, [records, currentRecordId]);

  // 计算完成进度
  const totalQuestions = questionCategories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNewReview = () => {
    const newRecord: DeepReviewRecord = {
      id: generateId(),
      title: `${new Date().getFullYear()}年深度复盘`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: [],
    };
    setRecords([newRecord, ...records]);
    setCurrentRecordId(newRecord.id);
    setAnswers({});
  };

  const handleSave = () => {
    if (!currentRecordId) return;

    const answerArray: DeepReviewAnswer[] = Object.entries(answers).map(
      ([questionId, answer]) => ({ questionId, answer })
    );

    setRecords(
      records.map((r) =>
        r.id === currentRecordId
          ? { ...r, answers: answerArray, updatedAt: new Date().toISOString() }
          : r
      )
    );
  };

  const handleExport = () => {
    const exportData = {
      title: currentRecord?.title || '深度复盘',
      date: new Date().toISOString(),
      categories: questionCategories.map((cat) => ({
        name: cat.name,
        questions: cat.questions.map((q) => ({
          question: q.text,
          answer: answers[q.id] || '',
        })),
      })),
    };
    exportToJSON(exportData, `深度复盘-${new Date().getFullYear()}`);
  };

  const handleLoadRecord = (record: DeepReviewRecord) => {
    setCurrentRecordId(record.id);
    const answerMap: Record<string, string> = {};
    record.answers.forEach((a) => {
      answerMap[a.questionId] = a.answer;
    });
    setAnswers(answerMap);
  };

  const handleReset = () => {
    if (confirm('确定要清空当前回答吗？')) {
      setAnswers({});
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 pt-8 pb-6 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            深度复盘
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            26问深度剖析，年度自我审视
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {!currentRecordId ? (
          // 选择/创建复盘页面
          <div className="space-y-4">
            <Button
              onClick={handleNewReview}
              className="w-full h-16 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              开始新的深度复盘
            </Button>

            {records.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">历史记录</CardTitle>
                  <CardDescription>点击继续编辑</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {records.slice(0, 5).map((record) => (
                    <button
                      key={record.id}
                      onClick={() => handleLoadRecord(record)}
                      className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {record.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(record.createdAt).toLocaleDateString('zh-CN')} · 
                        已回答 {record.answers.filter(a => a.answer).length}/{totalQuestions} 问
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // 填写复盘页面
          <>
            {/* 进度条 */}
            <Card className="mb-6 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    完成进度
                  </span>
                  <span className="text-sm text-slate-500">
                    {answeredCount}/{totalQuestions} 问
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-3 text-xs text-slate-500">
                  {questionCategories.map((cat) => {
                    const catAnswered = cat.questions.filter(
                      (q) => answers[q.id]?.trim()
                    ).length;
                    return (
                      <span key={cat.id} className={catAnswered === cat.count ? 'text-green-600' : ''}>
                        {cat.name.slice(0, 2)} {catAnswered}/{cat.count}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 问题分类 */}
            <div className="space-y-4">
              {questionCategories.map((category) => (
                <Card key={category.id} className="border-0 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full p-4 flex items-center justify-between ${category.bgColor}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                      >
                        <category.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {category.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {category.questions.filter((q) => answers[q.id]?.trim()).length}/
                          {category.count} 问
                        </div>
                      </div>
                    </div>
                    {expandedCategories.includes(category.id) ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {expandedCategories.includes(category.id) && (
                    <CardContent className="p-4 space-y-4">
                      {category.questions.map((question, index) => (
                        <div key={question.id} className="space-y-2">
                          <label className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 shrink-0">
                              {index + 1}
                            </span>
                            <span>{question.text}</span>
                          </label>
                          <Textarea
                            placeholder="写下你的思考..."
                            value={answers[question.id] || ''}
                            onChange={(e) =>
                              handleAnswerChange(question.id, e.target.value)
                            }
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-red-500 hover:text-red-600"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* 返回按钮 */}
            <Button
              variant="ghost"
              onClick={() => setCurrentRecordId(null)}
              className="w-full mt-4"
            >
              返回列表
            </Button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
