import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useMemo } from 'react'
import { storage, generateId, exportToClipboard } from '../../utils/storage'
import { DEFAULT_DEEP_QUESTIONS, type DeepQuestionCategoryConfig } from '../../utils/question-config'
import './index.scss'

// 图标配置
const iconConfig = ['👁️', '🎯', '📈', '🚀', '💡', '🌟', '⚡', '🔥']

interface DeepReviewAnswer {
  questionId: string
  answer: string
}

interface DeepReviewRecord {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  answers: DeepReviewAnswer[]
}

export default function DeepReview() {
  const [records, setRecords] = useState<DeepReviewRecord[]>([])
  const [deepQuestionConfig, setDeepQuestionConfig] = useState<DeepQuestionCategoryConfig[]>(DEFAULT_DEEP_QUESTIONS)
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedRecords = storage.get<DeepReviewRecord[]>('deep-review') || []
    const savedConfig = storage.get<DeepQuestionCategoryConfig[]>('deep-questions-config')
    setRecords(savedRecords)
    if (savedConfig) {
      setDeepQuestionConfig(savedConfig)
    }
  }, [])

  // 当前记录
  const currentRecord = useMemo(() => {
    return records.find(r => r.id === currentRecordId)
  }, [records, currentRecordId])

  // 总问题数
  const totalQuestions = deepQuestionConfig.reduce((sum, cat) => sum + cat.questions.length, 0)

  // 计算完成进度
  const answeredCount = Object.values(answers).filter(a => a.trim()).length
  const progress = Math.round((answeredCount / totalQuestions) * 100)

  // 更新回答
  const updateAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  // 新建复盘
  const handleNewReview = () => {
    const newRecord: DeepReviewRecord = {
      id: generateId(),
      title: `${new Date().getFullYear()}年深度复盘`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: []
    }
    const newRecords = [newRecord, ...records]
    setRecords(newRecords)
    storage.set('deep-review', newRecords)
    setCurrentRecordId(newRecord.id)
    setAnswers({})
    setExpandedCategories(['reflection'])
  }

  // 加载历史记录
  const handleLoadRecord = (record: DeepReviewRecord) => {
    setCurrentRecordId(record.id)
    const answerMap: Record<string, string> = {}
    record.answers.forEach(a => {
      answerMap[a.questionId] = a.answer
    })
    setAnswers(answerMap)
  }

  // 保存
  const handleSave = () => {
    if (!currentRecordId) return

    const answerArray: DeepReviewAnswer[] = Object.entries(answers).map(
      ([questionId, answer]) => ({ questionId, answer })
    )

    const newRecords = records.map(r =>
      r.id === currentRecordId
        ? { ...r, answers: answerArray, updatedAt: new Date().toISOString() }
        : r
    )
    setRecords(newRecords)
    storage.set('deep-review', newRecords)
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  // 导出
  const handleExport = () => {
    const exportData = {
      title: currentRecord?.title || '深度复盘',
      date: new Date().toISOString(),
      categories: deepQuestionConfig.map(cat => ({
        name: cat.name,
        questions: cat.questions.map(q => ({
          question: q.text,
          answer: answers[q.id] || ''
        }))
      }))
    }
    exportToClipboard(exportData)
  }

  // 重置
  const handleReset = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空当前回答吗？',
      success: (res) => {
        if (res.confirm) {
          setAnswers({})
        }
      }
    })
  }

  // 返回列表
  const handleBack = () => {
    setCurrentRecordId(null)
  }

  // 切换分类展开
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // 获取分类完成情况
  const getCategoryProgress = (questions: Array<{ id: string }>) => {
    const answered = questions.filter(q => answers[q.id]?.trim()).length
    return { answered, total: questions.length }
  }

  return (
    <View className='page'>
      {/* 头部 */}
      <View className='header'>
        <Text className='header-title'>🧠 深度复盘</Text>
        <Text className='header-subtitle'>深度问题深度剖析，年度自我审视</Text>
      </View>

      {!currentRecordId ? (
        // 选择/创建页面
        <View className='content'>
          <View className='new-btn' onClick={handleNewReview}>
            <Text className='new-btn-icon'>✨</Text>
            <Text className='new-btn-text'>开始新的深度复盘</Text>
          </View>

          {/* 提示横幅 */}
          <View className='tip-banner tip-banner-orange'>
            <View className='tip-content'>
              <Text className='tip-icon'>✨</Text>
              <Text className='tip-text'>可在「设置」中自定义问题</Text>
            </View>
            <View className='tip-btn' onClick={() => Taro.navigateTo({ url: '/pages/settings/index' })}>
              <Text className='tip-btn-text'>前往</Text>
            </View>
          </View>

          {records.length > 0 && (
            <View className='history-card'>
              <Text className='history-title'>历史记录</Text>
              <Text className='history-desc'>点击继续编辑</Text>
              {records.slice(0, 5).map(record => (
                <View
                  key={record.id}
                  className='history-item'
                  onClick={() => handleLoadRecord(record)}
                >
                  <Text className='history-item-title'>{record.title}</Text>
                  <Text className='history-item-date'>
                    {new Date(record.createdAt).toLocaleDateString('zh-CN')} · 
                    已回答 {record.answers.filter(a => a.answer).length}/{totalQuestions} 问
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        // 填写页面
        <ScrollView scrollY className='content'>
          {/* 进度条 */}
          <View className='progress-card'>
            <View className='progress-header'>
              <Text className='progress-label'>完成进度</Text>
              <Text className='progress-value'>{answeredCount}/{totalQuestions} 问</Text>
            </View>
            <View className='progress-bar'>
              <View className='progress-fill' style={{ width: `${progress}%` }} />
            </View>
            <View className='progress-categories'>
              {deepQuestionConfig.map(cat => {
                const { answered, total } = getCategoryProgress(cat.questions)
                return (
                  <Text 
                    key={cat.id} 
                    className={`progress-cat ${answered === total ? 'complete' : ''}`}
                  >
                    {cat.name.slice(0, 2)} {answered}/{total}
                  </Text>
                )
              })}
            </View>
          </View>

          {/* 问题分类 */}
          <View className='categories'>
            {deepQuestionConfig.map((category, index) => {
              const icon = iconConfig[index % iconConfig.length]
              const { answered, total } = getCategoryProgress(category.questions)
              const isExpanded = expandedCategories.includes(category.id)

              return (
                <View key={category.id} className='category-card'>
                  <View 
                    className={`category-header category-header-${category.color}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <View className='category-left'>
                      <View className={`category-icon category-icon-${category.color}`}>
                        <Text className='icon-text'>{icon}</Text>
                      </View>
                      <View className='category-info'>
                        <Text className='category-name'>{category.name}</Text>
                        <Text className='category-count'>{answered}/{total} 问</Text>
                      </View>
                    </View>
                    <Text className='category-arrow'>{isExpanded ? '▲' : '▼'}</Text>
                  </View>

                  {isExpanded && (
                    <View className='questions-list'>
                      {category.questions.map((question, index) => (
                        <View key={question.id} className='question-item'>
                          <View className='question-header'>
                            <View className='question-number'>
                              <Text className='number-text'>{index + 1}</Text>
                            </View>
                            <Text className='question-text'>{question.text}</Text>
                          </View>
                          <Textarea
                            className='question-textarea'
                            placeholder='写下你的思考...'
                            value={answers[question.id] || ''}
                            onInput={(e) => updateAnswer(question.id, e.detail.value)}
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          {/* 操作按钮 */}
          <View className='action-row'>
            <View className='btn-primary' onClick={handleSave}>
              <Text className='btn-primary-text'>💾 保存</Text>
            </View>
            <View className='btn-icon' onClick={handleExport}>
              <Text className='btn-icon-text'>📤</Text>
            </View>
            <View className='btn-icon btn-icon-danger' onClick={handleReset}>
              <Text className='btn-icon-text'>🔄</Text>
            </View>
          </View>

          {/* 返回按钮 */}
          <View className='back-btn' onClick={handleBack}>
            <Text className='back-text'>返回列表</Text>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
