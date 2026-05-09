# 🤖 AI新闻锐评日报

> AI锐评每日机器之心AI新闻，聚焦大模型/AI公司动态

🌐 **在线访问**: https://zhouyvette567-stack.github.io/ai-news-report/

## ✨ 功能特性

- 📰 **每日自动获取** 机器之心AI新闻
- 🤖 **AI中文锐评** — 使用GitHub Models API免费生成犀利点评
- 📊 **今日热点** — 每日总评 + 每条新闻独立锐评
- 📅 **历史存档** — 所有历史报告随时回顾
- ⏰ **全自动化** — GitHub Actions每天北京时间8:00自动运行

## 数据源

- [机器之心](https://www.jiqizhixin.com/) RSS

## 🚀 部署步骤

1. 创建GitHub仓库并推送代码
2. 仓库Settings → Pages → Source选择GitHub Actions
3. 创建Personal Access Token（需要`models:read`权限）
4. 仓库Settings → Secrets → Actions中添加`GITHUB_TOKEN`
5. 手动触发一次Actions workflow

## 📄 License

MIT