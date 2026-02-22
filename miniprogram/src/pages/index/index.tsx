import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { storage, calculateStreak, getTodayString } from '../../utils/storage'
import './index.scss'

// 功能模块配置
const features = [
  {
    icon: '🎯',
    title: '年度计划',
    desc: 'KPT复盘 → SMART目标 → 拆解每日 → 月度追踪',
    path: '/pages/annual-plan/index',
    color: 'violet'
  },
  {
    icon: '📅',
    title: '每日复盘',
    desc: '睡前10分钟，核心问题助你成长',
    path: '/pages/daily-review/index',
    color: 'blue'
  },
  {
    icon: '🧠',
    title: '深度复盘',
    desc: '深度问题深度剖析，年度自我审视',
    path: '/pages/deep-review/index',
    color: 'orange'
  },
  {
    icon: '📈',
    title: '数据追踪',
    desc: '可视化进度，见证每一步成长',
    path: '/pages/tracking/index',
    color: 'emerald'
  },
  {
    icon: '⚙️',
    title: '问题设置',
    desc: '自定义复盘问题，打造专属成长方案',
    path: '/pages/settings/index',
    color: 'slate'
  }
]

export default function Index() {
  const [stats, setStats] = useState({
    dailyStreak: 0,
    totalDays: 0,
    hasPlan: false
  })

  useEffect(() => {
    const dailyRecords = storage.get<Array<{ date: string }>>('daily-review') || []
    const annualPlan = storage.get('annual-plan')
    
    const uniqueDates = [...new Set(dailyRecords.map(r => r.date))]
    
    setStats({
      dailyStreak: calculateStreak(uniqueDates),
      totalDays: uniqueDates.length,
      hasPlan: !!annualPlan
    })
  }, [])

  const navigateTo = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <View className='page'>
      {/* 头部区域 */}
      <View className='header'>
        <View className='header-content'>
          <View className='header-badge'>
            <Text className='header-badge-icon'>✨</Text>
            <Text className='header-badge-text'>2026 复盘计划助手</Text>
          </View>
          <Text className='header-title'>让计划真正落地</Text>
          <Text className='header-subtitle'>可落地的年计划方法，帮你实现高完成率</Text>
        </View>
      </View>

      {/* 统计卡片 */}
      <View className='stats-grid'>
        <View className='stat-card stat-card-blue'>
          <Text className='stat-value'>{stats.dailyStreak}</Text>
          <Text className='stat-label'>连续复盘</Text>
        </View>
        <View className='stat-card stat-card-violet'>
          <Text className='stat-value'>{stats.totalDays}</Text>
          <Text className='stat-label'>总记录</Text>
        </View>
        <View className='stat-card stat-card-emerald'>
          <Text className='stat-value'>{stats.hasPlan ? '✓' : '○'}</Text>
          <Text className='stat-label'>年度计划</Text>
        </View>
      </View>

      {/* 功能模块 */}
      <View className='features'>
        {features.map((feature, index) => (
          <View 
            key={index} 
            className={`feature-card feature-card-${feature.color}`}
            onClick={() => navigateTo(feature.path)}
          >
            <View className='feature-icon'>
              <Text className='feature-icon-text'>{feature.icon}</Text>
            </View>
            <View className='feature-content'>
              <Text className='feature-title'>{feature.title}</Text>
              <Text className='feature-desc'>{feature.desc}</Text>
            </View>
            <Text className='feature-arrow'>›</Text>
          </View>
        ))}
      </View>

      {/* 快速开始 */}
      <View className='quick-start card'>
        <Text className='card-title'>快速开始</Text>
        <Text className='card-desc'>今天想做点什么？</Text>
        
        <View 
          className='quick-btn'
          onClick={() => navigateTo('/pages/daily-review/index')}
        >
          <Text className='quick-btn-icon'>✓</Text>
          <Text className='quick-btn-text'>开始今日复盘</Text>
        </View>

        {!stats.hasPlan && (
          <View 
            className='quick-btn quick-btn-outline'
            onClick={() => navigateTo('/pages/annual-plan/index')}
          >
            <Text className='quick-btn-icon'>🎯</Text>
            <Text className='quick-btn-text'>制定年度计划</Text>
          </View>
        )}
      </View>

      {/* 版本信息 */}
      <View className='footer'>
        <Text className='footer-text'>v1.0.0 · 数据存储在本地</Text>
      </View>
    </View>
  )
}
