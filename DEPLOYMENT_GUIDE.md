# 复盘计划助手 - Vercel 部署指南

## 方案一：通过 GitHub + Vercel 部署（推荐，5分钟）

### 步骤 1：在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 填写以下信息：
   - **Repository name**：review-planner（或你喜欢的名称）
   - **Description**：复盘计划助手 - 可落地的年计划方法
   - **Public/Private**：选择 Private（私有）或 Public（公开）
3. 点击 "Create repository"

### 步骤 2：将项目推送到 GitHub

在终端中运行以下命令（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
cd /workspace/projects
git add .
git commit -m "Initial commit: 复盘计划助手完整功能"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/review-planner.git
git push -u origin main
```

### 步骤 3：在 Vercel 上导入项目

1. 访问 https://vercel.com/signup
2. 使用 GitHub 账号登录（如果还没有 Vercel 账号）
3. 登录后，点击 "Add New Project"
4. 选择你的 GitHub 仓库（review-planner）
5. 点击 "Import"

### 步骤 4：配置 Vercel 项目

在导入页面，填写以下配置：

**Project Settings**：
- **Project Name**：review-planner（自动生成，可以修改）
- **Framework Preset**：Next.js（自动检测）
- **Root Directory**：./（默认）

**Build & Development Settings**：
- **Build Command**：`pnpm run build`（自动检测）
- **Output Directory**：`.next`（自动检测）
- **Install Command**：`pnpm install`（自动检测）
- **Environment Variables**：无需添加

保持默认设置，点击 "Deploy"

### 步骤 5：等待部署完成

- Vercel 会自动构建和部署
- 通常需要 1-2 分钟
- 部署完成后，你会获得一个类似 `https://review-planner.vercel.app` 的链接

### 步骤 6：访问你的网站

- 点击部署完成后的链接
- 测试所有功能是否正常

---

## 方案二：通过 Vercel CLI 部署（备选方案）

如果方案一不可用，可以使用 Vercel CLI：

### 步骤 1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2：登录 Vercel

```bash
vercel login
```

根据提示登录你的 Vercel 账号

### 步骤 3：部署项目

```bash
cd /workspace/projects
vercel
```

根据提示配置：
- Set up and deploy? Y
- Which scope? 选择你的账户
- Link to existing project? N
- Project name: review-planner
- Build Command: pnpm run build
- Output Directory: .next
- Want to modify settings? N

### 步骤 4：等待部署完成

部署完成后，你会获得一个类似 `https://review-planner.vercel.app` 的链接

---

## 部署后检查清单

部署完成后，请检查以下内容：

- [ ] 网站可以正常访问
- [ ] 首页显示正常
- [ ] 每日复盘功能正常
- [ ] 深度复盘功能正常
- [ ] 年度计划功能正常
- [ ] 数据追踪功能正常
- [ ] 设置页面功能正常
- [ ] 数据可以正常保存

---

## 常见问题

### 1. 构建失败

**原因**：依赖安装失败

**解决**：
- 确保使用 pnpm 作为包管理器
- 检查 `package.json` 中的 `packageManager` 字段
- 在 Vercel 项目设置中，确保 `Package Manager` 设置为 `pnpm`

### 2. 部署后无法访问

**原因**：构建成功但运行失败

**解决**：
- 检查 Vercel 部署日志
- 查看是否有运行时错误
- 确认 `package.json` 中的 `start` 脚本正确

### 3. 数据无法保存

**原因**：浏览器 localStorage 问题

**解决**：
- 这是正常的，localStorage 存储在用户浏览器中
- 不同设备的数据无法互通
- 如果需要跨设备，可以考虑添加数据库（需要额外开发）

### 4. 更新后看不到新功能

**原因**：缓存问题

**解决**：
- 清除浏览器缓存
- 使用无痕模式测试
- Vercel 会自动清理旧版本

---

## 后续优化建议

### 1. 添加自定义域名

在 Vercel 项目设置中：
1. 点击 "Domains"
2. 添加你的域名（如 `review.yourdomain.com`）
3. 按照提示配置 DNS 记录

### 2. 启用 HTTPS

Vercel 默认启用 HTTPS，无需额外配置

### 3. 配置环境变量

如果需要添加环境变量（如 API 密钥）：
1. 在 Vercel 项目设置中
2. 点击 "Environment Variables"
3. 添加变量

### 4. 设置自动部署

每次推送到 GitHub 的 main 分支，Vercel 会自动部署新版本

---

## 成功标志

当你看到以下内容，说明部署成功：

✅ 网站可以正常访问（https://review-planner.vercel.app）
✅ 所有功能正常工作
✅ 没有控制台错误
✅ 数据可以正常保存

---

## 联系支持

如果遇到问题：
- 查看部署日志
- 检查 Vercel 文档：https://vercel.com/docs
- 搜索相关问题
