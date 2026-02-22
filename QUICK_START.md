# 快速同步完整代码到 GitHub

## 方法：使用 GitHub Desktop（不需要命令行）

### 第 1 步：克隆仓库到本地

1. 打开 GitHub Desktop
2. 点击 "File" → "Clone Repository"
3. 输入 URL: `https://github.com/qkhhgyu2351/-.git`
4. 选择一个文件夹（比如桌面）
5. 点击 "Clone"

### 第 2 步：删除现有文件

1. 在 GitHub Desktop 左侧，点击 "Open in Terminal"（打开终端）
2. 在终端中输入以下命令并回车：

```bash
rm -rf *
git add .
git commit -m "clear all files"
git push
```

### 第 3 步：下载完整代码

1. 访问这个链接下载代码包：
   `https://leaping-flax.vercel.app/review-planner.tar.gz`

2. 解压到刚才克隆的文件夹
3. 在 GitHub Desktop 中，你会看到很多新文件
4. 输入提交信息：`add full project`
5. 点击 "Commit"
6. 点击 "Push"

### 第 4 步：自动部署

- 代码推送到 GitHub 后，Vercel 会自动重新部署
- 等待 2-3 分钟
- 刷新你的网站，就能看到完整功能了！

## 如果不想用命令行...

### 替代方案：删除仓库重建

1. 在 GitHub 网页上删除当前仓库
2. 重新创建一个空仓库（名字叫 `-`）
3. 告诉我，我会用另一个方法帮你上传代码

---

需要帮助？随时截图给我！
