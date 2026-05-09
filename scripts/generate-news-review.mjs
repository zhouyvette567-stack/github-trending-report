/**
 * generate-news-review.mjs
 * 调用 GitHub Models API 对 AI 新闻进行中文锐评
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const TODAY_FILE = join(DATA_DIR, 'today.json');
const HISTORY_FILE = join(DATA_DIR, 'history.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const API_URL = 'https://models.github.ai/inference/chat/completions';
const MODEL = process.env.AI_MODEL || 'deepseek/deepseek-v3';

/**
 * 调用 GitHub Models API
 */
async function callGitHubModels(messages, maxTokens = 2000) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.85,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub Models API 错误 ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 为单条新闻生成锐评
 */
async function reviewSingleNews(news) {
  const prompt = `你是一个毒舌但专业的AI行业评论员，请对以下AI新闻进行犀利有趣的中文锐评。

新闻标题：${news.title}
新闻摘要：${news.description || '无摘要'}
来源：${news.source}

要求：
1. 用2-3句话点评这条新闻，风格幽默犀利
2. 分析这条新闻对AI行业的影响或槽点
3. 适当使用网络流行语和emoji
4. 最后给一句话总结（用【】括起来）
5. 严格控制在120字以内

请直接输出锐评内容，不要任何前缀。`;

  try {
    const review = await callGitHubModels([
      { role: 'system', content: '你是一个毒舌但专业的AI行业评论员，擅长用幽默犀利的中文点评科技新闻。' },
      { role: 'user', content: prompt },
    ], 250);

    return review.trim();
  } catch (error) {
    console.warn(`  [警告] 新闻锐评失败: ${error.message}`);
    return `这条新闻值得关注，反映了AI行业的最新动态。【持续关注】`;
  }
}

/**
 * 生成每日热点总评
 */
async function generateDailySummary(newsList) {
  const titles = newsList.map(n => `#${n.rank} ${n.title}`).join('\n');

  const prompt = `你是AI行业观察员。以下是今日机器之心的AI新闻头条：

${titles}

请用3-4句中文总结今日AI行业热点，包括：
1. 今日最重磅的新闻
2. 整体趋势判断
3. 一个有趣的观察或吐槽

风格：轻松幽默，带点毒舌，使用emoji。控制在150字以内。直接输出内容。`;

  try {
    return await callGitHubModels([
      { role: 'system', content: '你是AI行业观察员，擅长用幽默犀利的中文总结科技趋势。' },
      { role: 'user', content: prompt },
    ], 400);
  } catch (error) {
    console.warn(`[警告] 每日总评生成失败: ${error.message}`);
    return '今日AI行业依然精彩纷呈，各大厂商你追我赶！';
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('  AI 新闻锐评生成中...');
  console.log('========================================\n');

  if (!GITHUB_TOKEN) {
    console.error('[错误] 未设置 GITHUB_TOKEN 环境变量');
    process.exit(1);
  }

  const todayData = JSON.parse(readFileSync(TODAY_FILE, 'utf-8'));
  const news = todayData.news;

  console.log(`[信息] 使用模型: ${MODEL}`);
  console.log(`[信息] 待锐评新闻数: ${news.length}\n`);

  // 逐个生成锐评
  for (let i = 0; i < news.length; i++) {
    const item = news[i];
    console.log(`[${i + 1}/${news.length}] 正在锐评: ${item.title.slice(0, 40)}...`);

    item.review = await reviewSingleNews(item);
    console.log(`  ✅ ${item.review.slice(0, 40)}...`);

    if (i < news.length - 1) {
      console.log('  ⏳ 等待4秒...\n');
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }

  // 生成每日总评
  console.log('\n[总结] 正在生成今日热点总评...');
  todayData.summary = await generateDailySummary(news);
  console.log(`  ✅ ${todayData.summary.slice(0, 50)}...\n`);

  // 保存
  writeFileSync(TODAY_FILE, JSON.stringify(todayData, null, 2), 'utf-8');

  // 更新历史
  let history = { reports: [] };
  try {
    history = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
  } catch {}

  const existingIndex = history.reports.findIndex((r) => r.date === todayData.date);
  if (existingIndex >= 0) {
    history.reports[existingIndex] = todayData;
  } else {
    history.reports.push(todayData);
  }

  history.reports.sort((a, b) => b.date.localeCompare(a.date));
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');

  console.log('========================================');
  console.log('  AI 新闻锐评生成完成！');
  console.log(`  历史报告总数: ${history.reports.length}`);
  console.log('========================================');
}

main().catch((err) => {
  console.error('运行出错:', err);
  process.exit(1);
});