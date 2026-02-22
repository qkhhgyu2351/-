'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/bottom-nav';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  CalendarDays,
  Brain,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  DEFAULT_DAILY_QUESTIONS,
  DEFAULT_DEEP_QUESTIONS,
  type DailyQuestionConfig,
  type DeepQuestionCategoryConfig,
  generateId,
} from '@/lib/question-config';

export default function SettingsPage() {
  const [dailyQuestions, setDailyQuestions] = useLocalStorage<DailyQuestionConfig[]>('daily-questions-config', DEFAULT_DAILY_QUESTIONS);
  const [deepQuestions, setDeepQuestions] = useLocalStorage<DeepQuestionCategoryConfig[]>('deep-questions-config', DEFAULT_DEEP_QUESTIONS);
  const [activeTab, setActiveTab] = useState<'daily' | 'deep'>('daily');

  // 每日复盘编辑状态
  const [editingDailyIndex, setEditingDailyIndex] = useState<number | null>(null);
  const [editingDaily, setEditingDaily] = useState<DailyQuestionConfig | null>(null);

  // 深度复盘编辑状态
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<DeepQuestionCategoryConfig | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{ categoryId: string; questionIndex: number } | null>(null);

  const handleAddDailyQuestion = () => {
    const newQuestion: DailyQuestionConfig = {
      key: `q${Date.now()}`,
      question: '',
      placeholder: '请输入提示文字...',
    };
    setEditingDailyIndex(-1);
    setEditingDaily(newQuestion);
  };

  const handleSaveDailyQuestion = () => {
    if (!editingDaily) return;
    if (editingDaily.key.trim() === '' || editingDaily.question.trim() === '') {
      alert('请填写问题内容和唯一标识');
      return;
    }
    
    if (editingDailyIndex === -1) {
      setDailyQuestions([...dailyQuestions, editingDaily]);
    } else if (editingDailyIndex !== null) {
      setDailyQuestions(dailyQuestions.map((q, i) => (i === editingDailyIndex ? editingDaily : q)));
    }
    
    setEditingDaily(null);
    setEditingDailyIndex(null);
  };

  const handleDeleteDailyQuestion = (index: number) => {
    if (confirm('确定要删除这个问题吗？')) {
      setDailyQuestions(dailyQuestions.filter((_, i) => i !== index));
    }
  };

  const handleAddCategory = () => {
    const newCategory: DeepQuestionCategoryConfig = {
      id: generateId(),
      name: '新分类',
      color: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-50 dark:bg-slate-950/30',
      questions: [],
    };
    setEditingCategory(newCategory);
  };

  const handleSaveCategory = () => {
    if (!editingCategory || editingCategory.name.trim() === '') {
      alert('请填写分类名称');
      return;
    }
    setDeepQuestions([...deepQuestions, editingCategory]);
    setEditingCategory(null);
    setExpandedCategories([...expandedCategories, editingCategory.id]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('确定要删除这个分类及其所有问题吗？')) {
      setDeepQuestions(deepQuestions.filter((cat) => cat.id !== categoryId));
    }
  };

  const handleAddQuestion = (categoryId: string) => {
    setEditingQuestion({
      categoryId,
      questionIndex: -1,
    });
  };

  const handleSaveQuestion = (categoryId: string, questionText: string, isNew: boolean) => {
    if (questionText.trim() === '') {
      alert('请填写问题内容');
      return;
    }

    const newQuestions = deepQuestions.map((cat) => {
      if (cat.id !== categoryId) return cat;

      if (isNew) {
        return {
          ...cat,
          questions: [...cat.questions, { id: generateId(), text: questionText }],
        };
      } else if (editingQuestion) {
        return {
          ...cat,
          questions: cat.questions.map((q, i) =>
            i === editingQuestion.questionIndex ? { ...q, text: questionText } : q
          ),
        };
      }
      return cat;
    });

    setDeepQuestions(newQuestions);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (categoryId: string, questionIndex: number) => {
    if (confirm('确定要删除这个问题吗？')) {
      setDeepQuestions(
        deepQuestions.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                questions: cat.questions.filter((_, i) => i !== questionIndex),
              }
            : cat
        )
      );
    }
  };

  const handleResetAll = () => {
    if (confirm('确定要重置所有问题为默认配置吗？这将清除所有自定义内容。')) {
      setDailyQuestions(DEFAULT_DAILY_QUESTIONS);
      setDeepQuestions(DEFAULT_DEEP_QUESTIONS);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 pt-8 pb-6 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            问题配置
          </h1>
          <p className="text-slate-200 text-sm mt-1">自定义复盘问题，打造专属成长方案</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'daily' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setActiveTab('daily')}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            每日复盘
          </Button>
          <Button
            variant={activeTab === 'deep' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setActiveTab('deep')}
          >
            <Brain className="w-4 h-4 mr-2" />
            深度复盘
          </Button>
        </div>

        {/* Reset Button */}
        <div className="mb-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleResetAll}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置默认
          </Button>
        </div>

        {/* 每日复盘配置 */}
        {activeTab === 'daily' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">每日复盘问题</CardTitle>
                <CardDescription>配置每日复盘的核心问题</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyQuestions.map((q, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white dark:bg-slate-900">
                    {editingDailyIndex === index && editingDaily ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="问题标识 (英文, 如: valuable)"
                          value={editingDaily.key}
                          onChange={(e) => setEditingDaily({ ...editingDaily, key: e.target.value })}
                        />
                        <Textarea
                          placeholder="问题内容"
                          value={editingDaily.question}
                          onChange={(e) => setEditingDaily({ ...editingDaily, question: e.target.value })}
                        />
                        <Textarea
                          placeholder="提示文字"
                          value={editingDaily.placeholder}
                          onChange={(e) => setEditingDaily({ ...editingDaily, placeholder: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveDailyQuestion}>
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingDaily(null)}>
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <Badge className="mb-2">{q.key}</Badge>
                            <p className="font-medium">{q.question}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{q.placeholder}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingDailyIndex(index);
                                setEditingDaily(q);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteDailyQuestion(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 添加新问题 */}
                {editingDailyIndex === -1 && editingDaily && (
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
                    <div className="space-y-3">
                      <Input
                        placeholder="问题标识 (英文, 如: valuable)"
                        value={editingDaily.key}
                        onChange={(e) => setEditingDaily({ ...editingDaily, key: e.target.value })}
                      />
                      <Textarea
                        placeholder="问题内容"
                        value={editingDaily.question}
                        onChange={(e) => setEditingDaily({ ...editingDaily, question: e.target.value })}
                      />
                      <Textarea
                        placeholder="提示文字"
                        value={editingDaily.placeholder}
                        onChange={(e) => setEditingDaily({ ...editingDaily, placeholder: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveDailyQuestion}>
                          <Save className="w-4 h-4 mr-1" />
                          添加
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingDaily(null)}>
                          取消
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Button className="w-full" variant="outline" onClick={handleAddDailyQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加问题
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 深度复盘配置 */}
        {activeTab === 'deep' && (
          <div className="space-y-4">
            {/* 添加新分类 */}
            {editingCategory && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-base">添加新分类</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      placeholder="分类名称"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveCategory}>
                        <Save className="w-4 h-4 mr-1" />
                        添加
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                        取消
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {deepQuestions.map((category) => (
              <Card key={category.id}>
                <CardHeader
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  onClick={() => {
                    setExpandedCategories((prev) =>
                      prev.includes(category.id)
                        ? prev.filter((id) => id !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {expandedCategories.includes(category.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                      {category.name}
                      <Badge variant="secondary">{category.questions.length}个问题</Badge>
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {expandedCategories.includes(category.id) && (
                  <CardContent className="space-y-3">
                    {category.questions.map((q, qIndex) => (
                      <div
                        key={q.id}
                        className="border rounded-lg p-4 bg-white dark:bg-slate-900"
                      >
                        {editingQuestion?.categoryId === category.id &&
                        editingQuestion.questionIndex === qIndex ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="问题内容"
                              defaultValue={q.text}
                              onBlur={(e) =>
                                handleSaveQuestion(category.id, e.target.value, false)
                              }
                            />
                            <Button size="sm" onClick={() => setEditingQuestion(null)}>
                              完成
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <p className="flex-1">{q.text}</p>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingQuestion({ categoryId: category.id, questionIndex: qIndex });
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteQuestion(category.id, qIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 添加新问题 */}
                    {editingQuestion?.categoryId === category.id &&
                    editingQuestion.questionIndex === -1 ? (
                      <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
                        <Textarea
                          placeholder="新问题内容"
                          onBlur={(e) => handleSaveQuestion(category.id, e.target.value, true)}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => setEditingQuestion(null)}>
                            完成
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddQuestion(category.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        添加问题
                      </Button>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            <Button className="w-full" variant="outline" onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              添加分类
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
