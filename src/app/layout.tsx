import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "复盘计划助手",
  description: "可落地的年计划方法",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
