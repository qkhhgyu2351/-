// 每日复盘问题配置
export interface DailyQuestionConfig {
  key: string;
  question: string;
  placeholder: string;
}

// 深度复盘问题配置
export interface DeepQuestionConfig {
  id: string;
  text: string;
}

export interface DeepQuestionCategoryConfig {
  id: string;
  name: string;
  questions: DeepQuestionConfig[];
  color: string;
  bgColor: string;
}

// 默认每日复盘问题
export const DEFAULT_DAILY_QUESTIONS: DailyQuestionConfig[] = [
  {
    key: 'valuable',
    question: '今天做了什么有价值的事？',
    placeholder: '记录今天完成的重要工作、帮助他人的事、或任何让你感到有意义的行动...',
  },
  {
    key: 'learned',
    question: '今天学到了什么新东西？',
    placeholder: '新知识、新技能、新感悟，或者从错误中获得的教训...',
  },
  {
    key: 'mistakes',
    question: '今天犯了什么错误？',
    placeholder: '诚实地记录错误，这是成长的机会。不要责备自己，而是思考如何改进...',
  },
  {
    key: 'emotions',
    question: '今天有什么较大的情绪波动？',
    placeholder: '什么触发了你的情绪？开心、焦虑、愤怒还是平静？为什么？',
  },
  {
    key: 'opportunities',
    question: '今天遇到了什么机会？',
    placeholder: '可能是新的合作、学习机会、或者一个有趣的想法...',
  },
];

// 默认深度复盘问题配置
export const DEFAULT_DEEP_QUESTIONS: DeepQuestionCategoryConfig[] = [
  {
    id: 'reflection',
    name: '反思现状',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
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
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
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
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
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
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    questions: [
      { id: 'a1', text: '本周最该启动的具体小事是什么？' },
    ],
  },
];

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
