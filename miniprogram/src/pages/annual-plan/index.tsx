import { View, Text, Textarea, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { storage, generateId, exportToClipboard } from '../../utils/storage'
import './index.scss'

// 步骤配置
const steps = [
  { id: 1, title: 'KPT复盘', desc: '10分钟回顾去年', icon: '📊' },
  { id: 2, title: 'SMART目标', desc: '制定年度目标', icon: '🎯' },
  { id: 3, title: '拆解每日', desc: '生成行动计划', icon: '📅' },
  { id: 4, title: '月度追踪', desc: '追踪完成进度', icon: '📈' }
]

// 季度配置
const quarters = ['Q1', 'Q2', 'Q3', 'Q4']

// 月份数组
const months = Array.from({ length: 12 }, (_, i) => i + 1)

interface KPTData {
  keep: string
  problem: string
  try: string
}

interface SMARTGoal {
  id: string
  title: string
  specific: string
  measurable: string
  achievable: string
  relevant: string
  timeBound: string
  quarter: string
}

interface MonthlyTask {
  id: string
  goalId: string
  month: number
  task: string
  completed: boolean
}

interface AnnualPlan {
  kpt: KPTData
  goals: SMARTGoal[]
  monthlyTasks: MonthlyTask[]
  createdAt: string
  updatedAt: string
}

export default function AnnualPlan() {
  const [currentStep, setCurrentStep] = useState(1)
  const [plan, setPlan] = useState<AnnualPlan>({
    kpt: { keep: '', problem: '', try: '' },
    goals: [],
    monthlyTasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  // 新目标表单
  const [newGoal, setNewGoal] = useState<Partial<SMARTGoal>>({
    title: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
    quarter: 'Q1'
  })

  useEffect(() => {
    const savedPlan = storage.get<AnnualPlan>('annual-plan')
    if (savedPlan) {
      setPlan(savedPlan)
    }
  }, [])

  const progress = (currentStep / steps.length) * 100

  // 保存数据
  const savePlan = () => {
    const updatedPlan = {
      ...plan,
      updatedAt: new Date().toISOString()
    }
    setPlan(updatedPlan)
    storage.set('annual-plan', updatedPlan)
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  // 更新KPT
  const updateKPT = (field: keyof KPTData, value: string) => {
    setPlan({
      ...plan,
      kpt: { ...plan.kpt, [field]: value }
    })
  }

  // 添加目标
  const addGoal = () => {
    if (!newGoal.title?.trim()) {
      Taro.showToast({ title: '请输入目标名称', icon: 'none' })
      return
    }

    const goal: SMARTGoal = {
      id: generateId(),
      title: newGoal.title,
      specific: newGoal.specific || '',
      measurable: newGoal.measurable || '',
      achievable: newGoal.achievable || '',
      relevant: newGoal.relevant || '',
      timeBound: newGoal.timeBound || '',
      quarter: newGoal.quarter || 'Q1'
    }

    setPlan({
      ...plan,
      goals: [...plan.goals, goal]
    })

    // 重置表单
    setNewGoal({
      title: '',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
      quarter: 'Q1'
    })

    Taro.showToast({ title: '添加成功', icon: 'success' })
  }

  // 删除目标
  const removeGoal = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个目标吗？',
      success: (res) => {
        if (res.confirm) {
          setPlan({
            ...plan,
            goals: plan.goals.filter(g => g.id !== id)
          })
        }
      }
    })
  }

  // 添加月度任务
  const addMonthlyTask = (month: number, goalId: string) => {
    Taro.showModal({
      title: `添加${month}月任务`,
      editable: true,
      placeholderText: '请输入任务内容',
      success: (res) => {
        if (res.confirm && res.content) {
          const task: MonthlyTask = {
            id: generateId(),
            goalId,
            month,
            task: res.content,
            completed: false
          }
          setPlan({
            ...plan,
            monthlyTasks: [...plan.monthlyTasks, task]
          })
        }
      }
    })
  }

  // 切换任务完成状态
  const toggleTask = (taskId: string) => {
    setPlan({
      ...plan,
      monthlyTasks: plan.monthlyTasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    })
  }

  // 删除任务
  const removeTask = (taskId: string) => {
    setPlan({
      ...plan,
      monthlyTasks: plan.monthlyTasks.filter(t => t.id !== taskId)
    })
  }

  // 导出数据
  const handleExport = () => {
    exportToClipboard(plan)
  }

  // 重置数据
  const handleReset = () => {
    Taro.showModal({
      title: '确认重置',
      content: '确定要重置所有数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          const emptyPlan: AnnualPlan = {
            kpt: { keep: '', problem: '', try: '' },
            goals: [],
            monthlyTasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setPlan(emptyPlan)
          storage.set('annual-plan', emptyPlan)
          setCurrentStep(1)
          Taro.showToast({ title: '已重置', icon: 'success' })
        }
      }
    })
  }

  // 下一步
  const nextStep = () => {
    savePlan()
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  // 上一步
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 获取月份任务
  const getTasksByMonth = (month: number) => {
    return plan.monthlyTasks.filter(t => t.month === month)
  }

  // 计算完成率
  const completedTasks = plan.monthlyTasks.filter(t => t.completed).length
  const totalTasks = plan.monthlyTasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const currentMonth = new Date().getMonth() + 1

  return (
    <View className='page'>
      {/* 头部 */}
      <View className='header'>
        <Text className='header-title'>🎯 年度计划工作台</Text>
        <Text className='header-subtitle'>四步法制定可落地的高完成率计划</Text>
      </View>

      {/* 进度条 */}
      <View className='progress-card'>
        <View className='progress-header'>
          <Text className='progress-label'>进度</Text>
          <Text className='progress-value'>{Math.round(progress)}%</Text>
        </View>
        <View className='progress-bar'>
          <View className='progress-fill' style={{ width: `${progress}%` }} />
        </View>
        <View className='steps-row'>
          {steps.map(step => (
            <View 
              key={step.id} 
              className={`step-item ${currentStep >= step.id ? 'active' : ''}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <View className={`step-circle ${currentStep === step.id ? 'current' : currentStep > step.id ? 'done' : ''}`}>
                {currentStep > step.id ? '✓' : step.icon}
              </View>
              <Text className='step-text'>{step.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY className='content'>
        {/* Step 1: KPT复盘 */}
        {currentStep === 1 && (
          <View className='step-content'>
            <View className='section-header section-header-green'>
              <Text className='section-icon'>📊</Text>
              <View className='section-header-text'>
                <Text className='section-title'>KPT 复盘法</Text>
                <Text className='section-desc'>回顾{new Date().getFullYear() - 1}年，为新的一年做准备</Text>
              </View>
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-green'>K - Keep</View>
                <Text className='label-text'>去年坚持的、做得好的事</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='例如：坚持每周运动3次、完成了XX项目学习...'
                value={plan.kpt.keep}
                onInput={(e) => updateKPT('keep', e.detail.value)}
              />
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-orange'>P - Problem</View>
                <Text className='label-text'>遇到的问题、不足之处</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='例如：经常拖延、时间管理不够好...'
                value={plan.kpt.problem}
                onInput={(e) => updateKPT('problem', e.detail.value)}
              />
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-blue'>T - Try</View>
                <Text className='label-text'>新的一年要尝试的改进方法</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='例如：使用番茄工作法、每天早上规划当日任务...'
                value={plan.kpt.try}
                onInput={(e) => updateKPT('try', e.detail.value)}
              />
            </View>

            <View className='tip-box tip-box-blue'>
              <Text className='tip-icon'>💡</Text>
              <Text className='tip-text'>可以借助 AI 帮你梳理痛点和方案。每个问题都想一想，不用太长，关键是真实。</Text>
            </View>
          </View>
        )}

        {/* Step 2: SMART目标 */}
        {currentStep === 2 && (
          <View className='step-content'>
            {/* 已添加的目标 */}
            {plan.goals.length > 0 && (
              <View className='goals-list'>
                <Text className='list-title'>已设定的目标 ({plan.goals.length})</Text>
                {plan.goals.map((goal, index) => (
                  <View key={goal.id} className='goal-item'>
                    <View className='goal-header'>
                      <View className='goal-badge'>{goal.quarter}</View>
                      <Text className='goal-title'>目标 {index + 1}: {goal.title}</Text>
                    </View>
                    <Text className='goal-desc'>{goal.specific}</Text>
                    <View className='goal-actions'>
                      <Text className='goal-delete' onClick={() => removeGoal(goal.id)}>删除</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 添加新目标 */}
            <View className='section-header section-header-violet'>
              <Text className='section-icon'>🎯</Text>
              <View className='section-header-text'>
                <Text className='section-title'>SMART 目标设定</Text>
                <Text className='section-desc'>用 SMART 原则把模糊想法变成可执行目标</Text>
              </View>
            </View>

            <View className='form-group'>
              <Text className='label'>目标名称</Text>
              <Input
                className='input'
                placeholder='例如：学会 Python 编程'
                value={newGoal.title}
                onInput={(e) => setNewGoal({ ...newGoal, title: e.detail.value })}
              />
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-red'>S</View>
                <Text className='label-text'>具体的 (Specific)</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='具体要做什么？例如：完成 Python 基础课程，能独立写小型项目'
                value={newGoal.specific}
                onInput={(e) => setNewGoal({ ...newGoal, specific: e.detail.value })}
              />
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-orange'>M</View>
                <Text className='label-text'>可衡量 (Measurable)</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='如何衡量完成？例如：完成30个练习题，做出3个小项目'
                value={newGoal.measurable}
                onInput={(e) => setNewGoal({ ...newGoal, measurable: e.detail.value })}
              />
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-yellow'>A</View>
                <Text className='label-text'>可实现 (Achievable)</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='为什么可以做到？例如：有编程基础，每周可以投入10小时学习'
                value={newGoal.achievable}
                onInput={(e) => setNewGoal({ ...newGoal, achievable: e.detail.value })}
              />
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-green'>R</View>
                <Text className='label-text'>相关性 (Relevant)</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='与你的大目标有什么关系？例如：有助于职业转型，提升技术能力'
                value={newGoal.relevant}
                onInput={(e) => setNewGoal({ ...newGoal, relevant: e.detail.value })}
              />
            </View>

            <View className='form-group'>
              <View className='label-row'>
                <View className='badge badge-blue'>T</View>
                <Text className='label-text'>有时限 (Time-bound)</Text>
              </View>
              <Textarea
                className='textarea'
                placeholder='什么时候完成？例如：2026年3月底前完成基础课程'
                value={newGoal.timeBound}
                onInput={(e) => setNewGoal({ ...newGoal, timeBound: e.detail.value })}
              />
            </View>

            <View className='form-group'>
              <Text className='label'>季度分配</Text>
              <View className='quarter-row'>
                {quarters.map(q => (
                  <View
                    key={q}
                    className={`quarter-btn ${newGoal.quarter === q ? 'active' : ''}`}
                    onClick={() => setNewGoal({ ...newGoal, quarter: q })}
                  >
                    <Text className='quarter-text'>{q}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className='btn-add' onClick={addGoal}>
              <Text className='btn-add-text'>添加目标</Text>
            </View>
          </View>
        )}

        {/* Step 3: 拆解每日 */}
        {currentStep === 3 && (
          <View className='step-content'>
            <View className='section-header section-header-blue'>
              <Text className='section-icon'>📅</Text>
              <View className='section-header-text'>
                <Text className='section-title'>拆解到每月</Text>
                <Text className='section-desc'>把目标拆成每月的关键任务</Text>
              </View>
            </View>

            {plan.goals.length === 0 ? (
              <View className='empty-state'>
                <Text className='empty-icon'>📅</Text>
                <Text className='empty-text'>请先在第二步添加目标</Text>
              </View>
            ) : (
              <View className='months-grid'>
                {months.map(month => {
                  const monthTasks = getTasksByMonth(month)
                  return (
                    <View key={month} className='month-card'>
                      <View className='month-header'>
                        <Text className='month-title'>{month}月</Text>
                        <View className='month-actions'>
                          {plan.goals.map(goal => (
                            <View
                              key={goal.id}
                              className='add-task-btn'
                              onClick={() => addMonthlyTask(month, goal.id)}
                            >
                              <Text className='add-task-text'>+ {goal.title.slice(0, 4)}...</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <View className='month-tasks'>
                        {monthTasks.length === 0 ? (
                          <Text className='no-tasks'>点击上方按钮添加任务</Text>
                        ) : (
                          monthTasks.map(task => (
                            <View key={task.id} className='task-item'>
                              <View
                                className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                onClick={() => toggleTask(task.id)}
                              >
                                {task.completed && <Text className='task-check'>✓</Text>}
                              </View>
                              <Text className={`task-text ${task.completed ? 'done' : ''}`}>
                                {task.task}
                              </Text>
                              <Text className='task-delete' onClick={() => removeTask(task.id)}>×</Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            )}

            <View className='tip-box tip-box-blue'>
              <Text className='tip-icon'>💡</Text>
              <Text className='tip-text'>每月设置 2-3 个关键任务即可，不要贪多。点击目标名称可快速添加任务。</Text>
            </View>
          </View>
        )}

        {/* Step 4: 月度追踪 */}
        {currentStep === 4 && (
          <View className='step-content'>
            {/* 总览统计 */}
            <View className='stats-card stats-card-green'>
              <View className='stats-row'>
                <View className='stats-item'>
                  <Text className='stats-label'>总体完成率</Text>
                  <Text className='stats-value'>{completionRate}%</Text>
                </View>
                <View className='stats-item'>
                  <Text className='stats-label'>已完成 / 总任务</Text>
                  <Text className='stats-value-sm'>{completedTasks} / {totalTasks}</Text>
                </View>
              </View>
              <View className='progress-bar'>
                <View className='progress-fill' style={{ width: `${completionRate}%` }} />
              </View>
            </View>

            {/* 月度追踪表 */}
            <View className='tracking-card'>
              <Text className='tracking-title'>📈 月度追踪表</Text>
              <Text className='tracking-desc'>点击任务标记完成状态</Text>

              <View className='tracking-grid'>
                {months.map(month => {
                  const monthTasks = getTasksByMonth(month)
                  const completed = monthTasks.filter(t => t.completed).length
                  const rate = monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0
                  const isCurrentMonth = month === currentMonth
                  const isComplete = rate === 100 && monthTasks.length > 0

                  return (
                    <View
                      key={month}
                      className={`tracking-cell ${isCurrentMonth ? 'current' : ''} ${isComplete ? 'complete' : ''}`}
                    >
                      <Text className='tracking-month'>{month}月</Text>
                      <Text className={`tracking-rate ${isComplete ? 'complete' : ''}`}>
                        {monthTasks.length > 0 ? `${rate}%` : '-'}
                      </Text>
                      {monthTasks.length > 0 && (
                        <Text className='tracking-count'>{completed}/{monthTasks.length}</Text>
                      )}
                    </View>
                  )
                })}
              </View>

              {/* 本月任务 */}
              <View className='current-month-tasks'>
                <Text className='current-month-title'>本月任务 ({currentMonth}月)</Text>
                {getTasksByMonth(currentMonth).length === 0 ? (
                  <Text className='no-tasks'>本月暂无任务，请在第三步添加</Text>
                ) : (
                  getTasksByMonth(currentMonth).map(task => (
                    <View
                      key={task.id}
                      className={`current-task-item ${task.completed ? 'done' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <View className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed && <Text className='task-check'>✓</Text>}
                      </View>
                      <Text className={`task-text ${task.completed ? 'done' : ''}`}>
                        {task.task}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* 使用提示 */}
            <View className='usage-tip'>
              <Text className='usage-title'>使用方法</Text>
              <Text className='usage-item'>1. 每月初查看本月任务清单</Text>
              <Text className='usage-item'>2. 完成一项，点击标记完成</Text>
              <Text className='usage-item'>3. 每月底回顾完成情况</Text>
              <Text className='usage-item'>4. 仅需一晚整理 + 每日1分钟</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='bottom-bar'>
        {currentStep > 1 && (
          <View className='btn-secondary' onClick={prevStep}>
            <Text className='btn-secondary-text'>上一步</Text>
          </View>
        )}
        {currentStep < 4 ? (
          <View className='btn-primary' onClick={nextStep}>
            <Text className='btn-primary-text'>下一步</Text>
          </View>
        ) : (
          <View className='btn-row'>
            <View className='btn-primary flex-1' onClick={savePlan}>
              <Text className='btn-primary-text'>保存计划</Text>
            </View>
            <View className='btn-icon' onClick={handleExport}>
              <Text className='btn-icon-text'>📤</Text>
            </View>
          </View>
        )}
      </View>

      {/* 重置按钮 */}
      <View className='reset-btn' onClick={handleReset}>
        <Text className='reset-text'>重置所有数据</Text>
      </View>
    </View>
  )
}
