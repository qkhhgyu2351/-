import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '复盘计划助手',
    template: '%s | 复盘计划助手',
  },
  description: '可落地的年计划工具，帮你实现高完成率的目标管理',
  keywords: ['复盘', '计划', '目标管理', 'KPT复盘', 'SMART目标', '个人成长'],
  authors: [{ name: 'Review Planner' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
