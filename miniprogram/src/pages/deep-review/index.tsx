import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useMemo } from 'react'
import { storage, generateId, exportToClipboard } from '../../utils/storage'
import './index.scss'

// 问题分类配置
const questionCategories = [
  {
    id: 'reflection',
    name: '反思现状',
    count: 7,
    icon: '👁️',
    color: 'blue',
    questions: [
      { id: 'r1', text: '当下最让我内耗的事是什么？' },
      { id: 'r2', text: '我投入时间的事里，哪些是无效忙碌？' },
      { id: 'r3', text: '我的优势是什么？' },
      { id: 'r4', text: '人际关系中，谁在消耗我？谁在滋养我？' },
      { id: 'r5', text: '现在的生活状态是否满意？' },
      { id: 'r6', text: '最近一次成就感来自哪里？' },
      { id: 'r7', text: '我有目标和方向吗？' }
    ]
  },
  {
    id: 'planning',
    name: '未来规划',
    count: 11,
    icon: '🎯',
    color: 'violet',
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
      { id: 'p11', text: '希望别人如何形容你？' }
    ]
  },
  {
    id: 'growth',
    name: '自我提升',
    count: 8,
    icon: '📈',
    color: 'orange',
    questions: [
      { id: 'g1', text: '目前阻碍我成长的最大短板是什么？' },
      { id: 'g2', text: '我需要学习哪些新技能？' },
      { id: 'g3', text: '哪些坏习惯正在消耗我？' },
      { id: 'g4', text: '我想培养的优质习惯是什么？' },
      { id: 'g5', text: '我需要向哪些人学习？' },
      { id: 'g6', text: '我的认知盲区可能在哪里？' },
      { id: 'g7', text: '如何更好地管理情绪？' },
      { id: 'g8', text: '如何提升「执行力」？' }
    ]
  },
  {
    id: 'action',
    name: '立即行动',
    count: 1,
    icon: '🚀',
    color: 'emerald',
    questions: [
      { id: 'a1', text: '本周最该启动的具体小事是什么？' }
    ]
  }
]

// 总问题数
const totalQuestions = questionCategories.reduce((sum, cat) => sum + cat.questions.length, 0)

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
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['reflection'])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedRecords = storage.get<DeepReviewRecord[]>('deep-review') || []
    setRecords(savedRecords)
  }, [])

  // 当前记录
  const currentRecord = useMemo(() => {
    return records.find(r => r.id === currentRecordId)
  }, [records, currentRecordId])

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
      categories: questionCategories.map(cat => ({
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
        <Text className='header-subtitle'>26问深度剖析，年度自我审视</Text>
      </View>

      {!currentRecordId ? (
        // 选择/创建页面
        <View className='content'>
          <View className='new-btn' onClick={handleNewReview}>
            <Text className='new-btn-icon'>✨</Text>
            <Text className='new-btn-text'>开始新的深度复盘</Text>
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
              {questionCategories.map(cat => {
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
            {questionCategories.map(category => {
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
                        <Text className='icon-text'>{category.icon}</Text>
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
