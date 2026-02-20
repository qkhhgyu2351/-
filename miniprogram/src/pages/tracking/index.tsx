import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect, useMemo } from 'react'
import { storage, calculateStreak } from '../../utils/storage'
import './index.scss'

export default function Tracking() {
  const [dailyRecords, setDailyRecords] = useState<Array<{ date: string }>>([])
  const [annualPlan, setAnnualPlan] = useState<{
    goals: Array<{ id: string; title: string; quarter: string }>
    monthlyTasks: Array<{ id: string; month: number; task: string; completed: boolean }>
  } | null>(null)
  const [deepReviews, setDeepReviews] = useState<Array<{ createdAt: string }>>([])

  useEffect(() => {
    const savedDaily = storage.get<Array<{ date: string }>>('daily-review') || []
    const savedPlan = storage.get<{
      goals: Array<{ id: string; title: string; quarter: string }>
      monthlyTasks: Array<{ id: string; month: number; task: string; completed: boolean }>
    }>('annual-plan')
    const savedDeep = storage.get<Array<{ createdAt: string }>>('deep-review') || []

    setDailyRecords(savedDaily)
    setAnnualPlan(savedPlan)
    setDeepReviews(savedDeep)
  }, [])

  // 统计数据
  const stats = useMemo(() => {
    const uniqueDates = [...new Set(dailyRecords.map(r => r.date))]
    const streak = calculateStreak(uniqueDates)

    const totalGoals = annualPlan?.goals?.length || 0
    const totalTasks = annualPlan?.monthlyTasks?.length || 0
    const completedTasks = annualPlan?.monthlyTasks?.filter(t => t.completed).length || 0
    const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const totalDeepReviews = deepReviews.length

    return {
      streak,
      totalDays: uniqueDates.length,
      totalGoals,
      totalTasks,
      completedTasks,
      taskRate,
      totalDeepReviews,
      hasPlan: !!annualPlan
    }
  }, [dailyRecords, annualPlan, deepReviews])

  // 本月进度
  const currentMonth = new Date().getMonth() + 1
  const currentMonthTasks = annualPlan?.monthlyTasks?.filter(t => t.month === currentMonth) || []
  const currentMonthCompleted = currentMonthTasks.filter(t => t.completed).length
  const currentMonthRate = currentMonthTasks.length > 0
    ? Math.round((currentMonthCompleted / currentMonthTasks.length) * 100)
    : 0

  // 季度目标分布
  const quarterlyGoals = useMemo(() => {
    if (!annualPlan?.goals) return { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
    const counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
    annualPlan.goals.forEach(g => {
      if (g.quarter in counts) counts[g.quarter as keyof typeof counts]++
    })
    return counts
  }, [annualPlan])

  // 热力图数据
  const heatmapData = useMemo(() => {
    const today = new Date()
    const data: Array<{ date: string; hasRecord: boolean }> = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const hasRecord = dailyRecords.some(r => r.date === dateStr)
      data.push({ date: dateStr, hasRecord })
    }
    return data
  }, [dailyRecords])

  // 成就徽章
  const achievements = useMemo(() => {
    const badges = []
    if (stats.streak >= 7) {
      badges.push({ icon: '🔥', text: '坚持一周', color: 'orange' })
    }
    if (stats.streak >= 30) {
      badges.push({ icon: '⭐', text: '坚持一月', color: 'violet' })
    }
    if (stats.totalDays >= 100) {
      badges.push({ icon: '💯', text: '百日复盘', color: 'emerald' })
    }
    if (stats.taskRate >= 50) {
      badges.push({ icon: '📈', text: '行动派', color: 'blue' })
    }
    if (stats.hasPlan) {
      badges.push({ icon: '🎯', text: '有计划', color: 'pink' })
    }
    if (stats.totalDeepReviews >= 1) {
      badges.push({ icon: '🧠', text: '深度思考者', color: 'indigo' })
    }
    return badges
  }, [stats])

  return (
    <View className='page'>
      {/* 头部 */}
      <View className='header'>
        <Text className='header-title'>📈 数据追踪</Text>
        <Text className='header-subtitle'>可视化进度，见证每一步成长</Text>
      </View>

      <ScrollView scrollY className='content'>
        {/* 核心指标 */}
        <View className='stats-row'>
          <View className='stat-card stat-card-orange'>
            <View className='stat-icon-wrap'>
              <Text className='stat-icon'>🔥</Text>
            </View>
            <View className='stat-info'>
              <Text className='stat-label'>连续复盘</Text>
              <Text className='stat-value'>{stats.streak}</Text>
              <Text className='stat-unit'>天</Text>
            </View>
          </View>
          <View className='stat-card stat-card-violet'>
            <View className='stat-icon-wrap'>
              <Text className='stat-icon'>🎯</Text>
            </View>
            <View className='stat-info'>
              <Text className='stat-label'>任务完成</Text>
              <Text className='stat-value'>{stats.taskRate}%</Text>
              <Text className='stat-unit'>{stats.completedTasks}/{stats.totalTasks}</Text>
            </View>
          </View>
        </View>

        {/* 本月进度 */}
        <View className='month-card'>
          <View className='month-header'>
            <Text className='month-icon'>📅</Text>
            <Text className='month-title'>本月进度 ({currentMonth}月)</Text>
          </View>
          <View className='month-progress'>
            <View className='month-bar'>
              <View className='month-fill' style={{ width: `${currentMonthRate}%` }} />
            </View>
            <Text className='month-rate'>{currentMonthRate}%</Text>
          </View>
          <View className='month-stats'>
            <Text className='month-stat'>已完成 {currentMonthCompleted} 项</Text>
            <Text className='month-stat'>共 {currentMonthTasks.length} 项</Text>
          </View>
        </View>

        {/* 热力图 */}
        <View className='heatmap-card'>
          <View className='heatmap-header'>
            <Text className='heatmap-icon'>📊</Text>
            <Text className='heatmap-title'>复盘热力图</Text>
          </View>
          <Text className='heatmap-desc'>最近30天复盘记录</Text>
          <View className='heatmap-grid'>
            {heatmapData.map((day, index) => (
              <View
                key={index}
                className={`heatmap-cell ${day.hasRecord ? 'active' : ''}`}
              />
            ))}
          </View>
          <View className='heatmap-legend'>
            <Text className='legend-text'>30天前</Text>
            <Text className='legend-text'>今天</Text>
          </View>
        </View>

        {/* 年度目标分布 */}
        {stats.hasPlan && (
          <View className='goals-card'>
            <View className='goals-header'>
              <Text className='goals-icon'>🏆</Text>
              <Text className='goals-title'>年度目标分布</Text>
            </View>
            <Text className='goals-total'>共 {stats.totalGoals} 个目标</Text>
            <View className='goals-grid'>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                <View key={q} className='goals-item'>
                  <Text className='goals-quarter'>{q}</Text>
                  <Text className='goals-count'>{quarterlyGoals[q as keyof typeof quarterlyGoals]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 统计卡片 */}
        <View className='summary-row'>
          <View className='summary-card'>
            <Text className='summary-icon'>✓</Text>
            <Text className='summary-value'>{stats.totalDays}</Text>
            <Text className='summary-label'>每日复盘总数</Text>
          </View>
          <View className='summary-card'>
            <Text className='summary-icon'>🧠</Text>
            <Text className='summary-value'>{stats.totalDeepReviews}</Text>
            <Text className='summary-label'>深度复盘次数</Text>
          </View>
        </View>

        {/* 成就徽章 */}
        <View className='achievements-card'>
          <View className='achievements-header'>
            <Text className='achievements-icon'>🏆</Text>
            <Text className='achievements-title'>成就徽章</Text>
          </View>
          <View className='achievements-list'>
            {achievements.length > 0 ? (
              achievements.map((badge, index) => (
                <View key={index} className={`badge badge-${badge.color}`}>
                  <Text className='badge-icon'>{badge.icon}</Text>
                  <Text className='badge-text'>{badge.text}</Text>
                </View>
              ))
            ) : (
              <Text className='no-achievements'>继续努力，解锁更多成就！</Text>
            )}
          </View>
        </View>

        {/* 数据说明 */}
        <View className='info-card'>
          <Text className='info-icon'>⏰</Text>
          <View className='info-content'>
            <Text className='info-title'>数据存储</Text>
            <Text className='info-text'>所有数据保存在本地设备中</Text>
            <Text className='info-title'>建议</Text>
            <Text className='info-text'>定期导出数据备份，避免数据丢失</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
