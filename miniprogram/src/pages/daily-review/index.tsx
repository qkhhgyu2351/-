import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useMemo } from 'react'
import { storage, formatDate, getTodayString, calculateStreak } from '../../utils/storage'
import { DEFAULT_DAILY_QUESTIONS, type DailyQuestionConfig } from '../../utils/question-config'
import './index.scss'

interface DailyRecord {
  id: string
  date: string
  answers: Record<string, string>
  createdAt: string
}

// 图标和颜色配置
const iconConfig = ['📚', '💡', '⚠️', '❤️', '✨', '🎯', '🔥', '💪']
const colorConfig = ['blue', 'violet', 'orange', 'pink', 'emerald', 'sky', 'indigo', 'teal']

export default function DailyReview() {
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [dailyQuestionConfig, setDailyQuestionConfig] = useState<DailyQuestionConfig[]>(DEFAULT_DAILY_QUESTIONS)
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedRecords = storage.get<DailyRecord[]>('daily-review') || []
    const savedConfig = storage.get<DailyQuestionConfig[]>('daily-questions-config')
    setRecords(savedRecords)
    if (savedConfig) {
      setDailyQuestionConfig(savedConfig)
    }
  }, [])

  // 当前日期的记录
  const currentRecord = useMemo(() => {
    return records.find(r => r.date === selectedDate)
  }, [records, selectedDate])

  useEffect(() => {
    if (currentRecord) {
      setAnswers(currentRecord.answers)
    } else {
      // 初始化空的答案对象
      const emptyAnswers: Record<string, string> = {}
      dailyQuestionConfig.forEach(q => {
        emptyAnswers[q.key] = ''
      })
      setAnswers(emptyAnswers)
    }
  }, [currentRecord, dailyQuestionConfig])

  // 统计数据
  const stats = useMemo(() => {
    const uniqueDates = [...new Set(records.map(r => r.date))]
    return {
      streak: calculateStreak(uniqueDates),
      totalDays: uniqueDates.length
    }
  }, [records])

  // 是否是今天
  const isToday = selectedDate === getTodayString()

  // 更新回答
  const updateAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  // 保存记录
  const handleSave = () => {
    const existingIndex = records.findIndex(r => r.date === selectedDate)
    const newRecord: DailyRecord = {
      id: existingIndex >= 0 ? records[existingIndex].id : Date.now().toString(),
      date: selectedDate,
      answers,
      createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : new Date().toISOString()
    }

    let newRecords: DailyRecord[]
    if (existingIndex >= 0) {
      newRecords = records.map((r, i) => i === existingIndex ? newRecord : r)
    } else {
      newRecords = [newRecord, ...records]
    }

    setRecords(newRecords)
    storage.set('daily-review', newRecords)
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  // 切换日期
  const changeDate = (days: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + days)
    const newDate = current.toISOString().split('T')[0]
    setSelectedDate(newDate)
  }

  return (
    <View className='page'>
      {/* 头部 */}
      <View className='header'>
        <Text className='header-title'>📅 每日复盘</Text>
        <Text className='header-subtitle'>睡前10分钟，5个核心问题助你成长</Text>
      </View>

      {/* 统计卡片 */}
      <View className='stats-row'>
        <View className='stat-card stat-card-orange'>
          <Text className='stat-icon'>🔥</Text>
          <View className='stat-content'>
            <Text className='stat-value'>{stats.streak}</Text>
            <Text className='stat-label'>连续复盘</Text>
          </View>
        </View>
        <View className='stat-card stat-card-blue'>
          <Text className='stat-icon'>📊</Text>
          <View className='stat-content'>
            <Text className='stat-value'>{stats.totalDays}</Text>
            <Text className='stat-label'>总记录</Text>
          </View>
        </View>
      </View>

      {/* 日期选择器 */}
      <View className='date-picker'>
        <View className='date-btn' onClick={() => changeDate(-1)}>
          <Text className='date-arrow'>‹</Text>
        </View>
        <View className='date-info'>
          <Text className='date-text'>{formatDate(selectedDate)}</Text>
          {isToday && (
            <View className='date-badge date-badge-blue'>
              <Text className='badge-text'>今天</Text>
            </View>
          )}
          {!isToday && currentRecord && (
            <View className='date-badge date-badge-green'>
              <Text className='badge-text'>已记录</Text>
            </View>
          )}
        </View>
        <View 
          className={`date-btn ${isToday ? 'disabled' : ''}`}
          onClick={() => !isToday && changeDate(1)}
        >
          <Text className='date-arrow'>›</Text>
        </View>
      </View>

      <ScrollView scrollY className='content'>
        {/* 问题表单 */}
        <View className='questions-card'>
          <View className='questions-header'>
            <Text className='questions-title'>📝 今日复盘</Text>
            <Text className='questions-desc'>认真思考每一个问题，记录真实的自己</Text>
          </View>

          <View className='questions-list'>
            {dailyQuestionConfig.map((q, index) => {
              const icon = iconConfig[index % iconConfig.length]
              const color = colorConfig[index % colorConfig.length]
              
              return (
                <View key={q.key} className='question-item'>
                  <View className={`question-label question-label-${color}`}>
                    <View className={`question-icon question-icon-${color}`}>
                      <Text className='icon-text'>{icon}</Text>
                    </View>
                    <Text className='question-text'>
                      {index + 1}. {q.question}
                    </Text>
                  </View>
                  <Textarea
                    className='question-textarea'
                    placeholder={q.placeholder}
                    value={answers[q.key] || ''}
                    onInput={(e) => updateAnswer(q.key, e.detail.value)}
                  />
                </View>
              )
            })}
          </View>
        </View>

        {/* 保存按钮 */}
        <View className='save-btn' onClick={handleSave}>
          <Text className='save-btn-text'>💾 保存今日复盘</Text>
        </View>

        {/* 坚持效果 */}
        <View className='effects-card'>
          <Text className='effects-title'>✨ 坚持复盘的效果</Text>
          <View className='effects-list'>
            <View className='effect-item'>
              <View className='effect-badge effect-badge-blue'>1个月</View>
              <Text className='effect-text'>思路更清晰</Text>
            </View>
            <View className='effect-item'>
              <View className='effect-badge effect-badge-violet'>3个月</View>
              <Text className='effect-text'>能明显感受到进步</Text>
            </View>
            <View className='effect-item'>
              <View className='effect-badge effect-badge-emerald'>1年</View>
              <Text className='effect-text'>整个人状态发生真实改变</Text>
            </View>
          </View>
          <Text className='effects-tip'>💡 迷茫本质是缺少日常记录和复盘</Text>
        </View>
      </ScrollView>
    </View>
  )
}
