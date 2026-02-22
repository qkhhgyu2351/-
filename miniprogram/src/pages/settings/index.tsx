import { View, Text, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { storage } from '../../utils/storage'
import {
  DEFAULT_DAILY_QUESTIONS,
  DEFAULT_DEEP_QUESTIONS,
  type DailyQuestionConfig,
  type DeepQuestionCategoryConfig,
  generateId,
} from '../../utils/question-config'
import './index.scss'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'deep'>('daily')
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestionConfig[]>(DEFAULT_DAILY_QUESTIONS)
  const [deepQuestions, setDeepQuestions] = useState<DeepQuestionCategoryConfig[]>(DEFAULT_DEEP_QUESTIONS)

  // 编辑状态
  const [editingDailyIndex, setEditingDailyIndex] = useState<number | null>(null)
  const [editingDaily, setEditingDaily] = useState<DailyQuestionConfig | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [editingCategory, setEditingCategory] = useState<DeepQuestionCategoryConfig | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<{ categoryId: string; questionIndex: number } | null>(null)

  useEffect(() => {
    // 加载保存的配置
    const savedDaily = storage.get<DailyQuestionConfig[]>('daily-questions-config')
    const savedDeep = storage.get<DeepQuestionCategoryConfig[]>('deep-questions-config')
    
    if (savedDaily) setDailyQuestions(savedDaily)
    if (savedDeep) setDeepQuestions(savedDeep)
  }, [])

  // 保存配置
  const saveConfigs = () => {
    storage.set('daily-questions-config', dailyQuestions)
    storage.set('deep-questions-config', deepQuestions)
  }

  const handleAddDailyQuestion = () => {
    const newQuestion: DailyQuestionConfig = {
      key: `q${Date.now()}`,
      question: '',
      placeholder: '请输入提示文字...',
    }
    setEditingDailyIndex(-1)
    setEditingDaily(newQuestion)
  }

  const handleSaveDailyQuestion = () => {
    if (!editingDaily) return
    if (editingDaily.key.trim() === '' || editingDaily.question.trim() === '') {
      Taro.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    
    let newQuestions: DailyQuestionConfig[]
    if (editingDailyIndex === -1) {
      newQuestions = [...dailyQuestions, editingDaily]
    } else if (editingDailyIndex !== null) {
      newQuestions = dailyQuestions.map((q, i) => (i === editingDailyIndex ? editingDaily : q))
    } else {
      newQuestions = dailyQuestions
    }
    
    setDailyQuestions(newQuestions)
    setEditingDaily(null)
    setEditingDailyIndex(null)
    saveConfigs()
  }

  const handleDeleteDailyQuestion = (index: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个问题吗？',
      success: (res) => {
        if (res.confirm) {
          setDailyQuestions(dailyQuestions.filter((_, i) => i !== index))
          saveConfigs()
        }
      }
    })
  }

  const handleAddCategory = () => {
    const newCategory: DeepQuestionCategoryConfig = {
      id: generateId(),
      name: '新分类',
      color: 'slate',
      bgColor: 'bg-slate-50',
      questions: [],
    }
    setEditingCategory(newCategory)
  }

  const handleSaveCategory = () => {
    if (!editingCategory || editingCategory.name.trim() === '') {
      Taro.showToast({ title: '请填写分类名称', icon: 'none' })
      return
    }
    const newDeepQuestions = [...deepQuestions, editingCategory]
    setDeepQuestions(newDeepQuestions)
    setExpandedCategories([...expandedCategories, editingCategory.id])
    setEditingCategory(null)
    saveConfigs()
  }

  const handleDeleteCategory = (categoryId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个分类及其所有问题吗？',
      success: (res) => {
        if (res.confirm) {
          setDeepQuestions(deepQuestions.filter((cat) => cat.id !== categoryId))
          saveConfigs()
        }
      }
    })
  }

  const handleAddQuestion = (categoryId: string) => {
    setEditingQuestion({
      categoryId,
      questionIndex: -1,
    })
  }

  const handleSaveQuestion = (categoryId: string, questionText: string, isNew: boolean) => {
    if (questionText.trim() === '') {
      Taro.showToast({ title: '请填写问题内容', icon: 'none' })
      return
    }

    const newDeepQuestions = deepQuestions.map((cat) => {
      if (cat.id !== categoryId) return cat

      if (isNew) {
        return {
          ...cat,
          questions: [...cat.questions, { id: generateId(), text: questionText }],
        }
      } else if (editingQuestion) {
        return {
          ...cat,
          questions: cat.questions.map((q, i) =>
            i === editingQuestion.questionIndex ? { ...q, text: questionText } : q
          ),
        }
      }
      return cat
    })

    setDeepQuestions(newDeepQuestions)
    setEditingQuestion(null)
    saveConfigs()
  }

  const handleDeleteQuestion = (categoryId: string, questionIndex: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个问题吗？',
      success: (res) => {
        if (res.confirm) {
          setDeepQuestions(
            deepQuestions.map((cat) =>
              cat.id === categoryId
                ? {
                    ...cat,
                    questions: cat.questions.filter((_, i) => i !== questionIndex),
                  }
                : cat
            )
          )
          saveConfigs()
        }
      }
    })
  }

  const handleResetAll = () => {
    Taro.showModal({
      title: '确认重置',
      content: '确定要重置所有问题为默认配置吗？',
      success: (res) => {
        if (res.confirm) {
          setDailyQuestions(DEFAULT_DAILY_QUESTIONS)
          setDeepQuestions(DEFAULT_DEEP_QUESTIONS)
          saveConfigs()
          Taro.showToast({ title: '已重置' })
        }
      }
    })
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <View className='settings-page'>
      <View className='header'>
        <Text className='header-title'>⚙️ 问题配置</Text>
        <Text className='header-subtitle'>自定义复盘问题，打造专属成长方案</Text>
      </View>

      <View className='tabs'>
        <View
          className={`tab ${activeTab === 'daily' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <Text className='tab-icon'>📅</Text>
          <Text className='tab-text'>每日复盘</Text>
        </View>
        <View
          className={`tab ${activeTab === 'deep' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('deep')}
        >
          <Text className='tab-icon'>🧠</Text>
          <Text className='tab-text'>深度复盘</Text>
        </View>
      </View>

      <View className='reset-btn' onClick={handleResetAll}>
        <Text className='reset-btn-text'>🔄 重置默认</Text>
      </View>

      {/* 每日复盘配置 */}
      {activeTab === 'daily' && (
        <View className='content'>
          <View className='section-title'>每日复盘问题</View>
          
          {dailyQuestions.map((q, index) => (
            <View key={index} className='question-card'>
              {editingDailyIndex === index && editingDaily ? (
                <View className='edit-form'>
                  <View className='form-item'>
                    <Text className='form-label'>问题标识:</Text>
                    <Input
                      value={editingDaily.key}
                      onInput={(e) => setEditingDaily({ ...editingDaily, key: e.detail.value })}
                    />
                  </View>
                  <View className='form-item'>
                    <Text className='form-label'>问题内容:</Text>
                    <Textarea
                      value={editingDaily.question}
                      onInput={(e) => setEditingDaily({ ...editingDaily, question: e.detail.value })}
                    />
                  </View>
                  <View className='form-item'>
                    <Text className='form-label'>提示文字:</Text>
                    <Textarea
                      value={editingDaily.placeholder}
                      onInput={(e) => setEditingDaily({ ...editingDaily, placeholder: e.detail.value })}
                    />
                  </View>
                  <View className='form-actions'>
                    <Button onClick={handleSaveDailyQuestion}>保存</Button>
                    <Button onClick={() => setEditingDaily(null)}>取消</Button>
                  </View>
                </View>
              ) : (
                <View className='question-content'>
                  <View className='question-badge'>{q.key}</View>
                  <Text className='question-text'>{q.question}</Text>
                  <Text className='question-placeholder'>{q.placeholder}</Text>
                  <View className='question-actions'>
                    <Text className='action-btn' onClick={() => { setEditingDailyIndex(index); setEditingDaily(q) }}>✏️</Text>
                    <Text className='action-btn delete' onClick={() => handleDeleteDailyQuestion(index)}>🗑️</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* 添加新问题 */}
          {editingDailyIndex === -1 && editingDaily && (
            <View className='question-card new-question'>
              <View className='edit-form'>
                <View className='form-item'>
                  <Text className='form-label'>问题标识:</Text>
                  <Input
                    value={editingDaily.key}
                    onInput={(e) => setEditingDaily({ ...editingDaily, key: e.detail.value })}
                  />
                </View>
                <View className='form-item'>
                  <Text className='form-label'>问题内容:</Text>
                  <Textarea
                    value={editingDaily.question}
                    onInput={(e) => setEditingDaily({ ...editingDaily, question: e.detail.value })}
                  />
                </View>
                <View className='form-item'>
                  <Text className='form-label'>提示文字:</Text>
                  <Textarea
                    value={editingDaily.placeholder}
                    onInput={(e) => setEditingDaily({ ...editingDaily, placeholder: e.detail.value })}
                  />
                </View>
                <View className='form-actions'>
                  <Button onClick={handleSaveDailyQuestion}>添加</Button>
                  <Button onClick={() => setEditingDaily(null)}>取消</Button>
                </View>
              </View>
            </View>
          )}

          <View className='add-btn' onClick={handleAddDailyQuestion}>
            <Text className='add-btn-text'>➕ 添加问题</Text>
          </View>
        </View>
      )}

      {/* 深度复盘配置 */}
      {activeTab === 'deep' && (
        <View className='content'>
          {/* 添加新分类 */}
          {editingCategory && (
            <View className='category-card new-category'>
              <View className='category-header'>
                <Text className='category-title'>添加新分类</Text>
              </View>
              <View className='edit-form'>
                <View className='form-item'>
                  <Text className='form-label'>分类名称:</Text>
                  <Input
                    value={editingCategory.name}
                    onInput={(e) => setEditingCategory({ ...editingCategory, name: e.detail.value })}
                  />
                </View>
                <View className='form-actions'>
                  <Button onClick={handleSaveCategory}>添加</Button>
                  <Button onClick={() => setEditingCategory(null)}>取消</Button>
                </View>
              </View>
            </View>
          )}

          {deepQuestions.map((category) => (
            <View key={category.id} className='category-card'>
              <View className='category-header' onClick={() => toggleCategory(category.id)}>
                <View className='category-title-row'>
                  <Text className='category-toggle'>
                    {expandedCategories.includes(category.id) ? '▼' : '▶'}
                  </Text>
                  <Text className='category-title'>{category.name}</Text>
                  <Text className='category-count'>{category.questions.length}个问题</Text>
                </View>
                <Text className='action-btn delete' onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id) }}>🗑️</Text>
              </View>

              {expandedCategories.includes(category.id) && (
                <View className='category-content'>
                  {category.questions.map((q, qIndex) => (
                    <View key={q.id} className='question-card'>
                      {editingQuestion?.categoryId === category.id &&
                      editingQuestion.questionIndex === qIndex ? (
                        <View className='edit-form'>
                          <View className='form-item'>
                            <Text className='form-label'>问题内容:</Text>
                            <Textarea
                              value={q.text}
                              onBlur={(e) => handleSaveQuestion(category.id, e.detail.value, false)}
                            />
                          </View>
                          <Button onClick={() => setEditingQuestion(null)}>完成</Button>
                        </View>
                      ) : (
                        <View className='question-content'>
                          <Text className='question-text'>{q.text}</Text>
                          <View className='question-actions'>
                            <Text className='action-btn' onClick={() => {
                              setEditingQuestion({ categoryId: category.id, questionIndex: qIndex })
                            }}>✏️</Text>
                            <Text className='action-btn delete' onClick={() => handleDeleteQuestion(category.id, qIndex)}>🗑️</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}

                  {/* 添加新问题 */}
                  {editingQuestion?.categoryId === category.id &&
                  editingQuestion.questionIndex === -1 ? (
                    <View className='question-card new-question'>
                      <View className='edit-form'>
                        <View className='form-item'>
                          <Text className='form-label'>新问题内容:</Text>
                          <Textarea
                            onBlur={(e) => handleSaveQuestion(category.id, e.detail.value, true)}
                          />
                        </View>
                        <Button onClick={() => setEditingQuestion(null)}>完成</Button>
                      </View>
                    </View>
                  ) : (
                    <View className='add-btn small' onClick={() => handleAddQuestion(category.id)}>
                      <Text className='add-btn-text'>➕ 添加问题</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}

          <View className='add-btn' onClick={handleAddCategory}>
            <Text className='add-btn-text'>➕ 添加分类</Text>
          </View>
        </View>
      )}
    </View>
  )
}
