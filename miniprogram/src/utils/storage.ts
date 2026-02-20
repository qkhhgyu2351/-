import Taro from '@tarojs/taro'

// 本地存储封装
export const storage = {
  get<T>(key: string): T | null {
    try {
      const value = Taro.getStorageSync(key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      console.error('Storage get error:', e)
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      Taro.setStorageSync(key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },

  clear(): void {
    try {
      Taro.clearStorageSync()
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  }
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 获取今天的日期字符串
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// 计算连续天数
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const sortedDates = [...dates].sort().reverse()
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i])
    date.setHours(0, 0, 0, 0)
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)

    if (date.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// 导出数据到剪贴板
export async function exportToClipboard(data: unknown): Promise<boolean> {
  try {
    await Taro.setClipboardData({
      data: JSON.stringify(data, null, 2)
    })
    Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
    return true
  } catch (e) {
    Taro.showToast({ title: '导出失败', icon: 'error' })
    return false
  }
}
