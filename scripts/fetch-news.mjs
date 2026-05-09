/**
 * fetch-news.mjs
 * 从机器之心 RSS 获取 AI 新闻
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const TODAY_FILE = join(DATA_DIR, 'today.json');

const RSS_URL = 'https://www.jiqizhixin.com/rss';

// AI 关键词过滤
const AI_KEYWORDS = [
  'OpenAI', 'ChatGPT', 'GPT', 'Claude', 'Anthropic',
  'Google', 'Gemini', 'Bard', 'DeepMind',
  'Meta', 'LLaMA', 'Llama',
  'Microsoft', 'Copilot', 'Azure',
  '大模型', 'AI', '人工智能', '机器学习', '深度学习',
  '神经网络', '多模态', 'AGI', 'AIGC', '生成式'
];

/**
 * 判断是否为 AI 相关新闻
 */
function isAINews(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  return AI_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
}

/**
 * 获取机器之心 RSS
 */
async function fetchRSS() {
  console.log(`[抓取] 正在获取 ${RSS_URL} ...`);

  const response = await fetch(RSS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NewsBot)',
      'Accept': 'application/rss+xml, application/xml, text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const xml = await response.text();
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  
  const result = parser.parse(xml);
  return result.rss?.channel?.item || [];
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('  AI 新闻数据获取');
  console.log(`  时间: ${new Date().toISOString()}`);
  console.log('========================================\n');

  let items = [];
  
  try {
    items = await fetchRSS();
    console.log(`[成功] 获取到 ${items.length} 条新闻\n`);
  } catch (error) {
    console.error(`[错误] 获取 RSS 失败: ${error.message}`);
    process.exit(1);
  }

  // 筛选 AI 相关新闻，取前 10 条
  const newsItems = items
    .filter(item => isAINews(item.title, item.description))
    .slice(0, 10)
    .map((item, index) => ({
      rank: index + 1,
      title: item.title,
      description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
      link: item.link,
      pubDate: item.pubDate,
      source: '机器之心',
    }));

  if (newsItems.length === 0) {
    console.warn('[警告] 未找到 AI 相关新闻');
  }

  // 构建今日数据
  const todayData = {
    date: new Date().toISOString().split('T')[0],
    fetchedAt: new Date().toISOString(),
    source: '机器之心 RSS',
    sourceUrl: 'https://www.jiqizhixin.com/',
    news: newsItems,
  };

  writeFileSync(TODAY_FILE, JSON.stringify(todayData, null, 2), 'utf-8');

  // 打印结果
  console.log('今日 AI 新闻 Top 10:');
  console.log('─'.repeat(60));
  newsItems.forEach((news) => {
    console.log(`#${String(news.rank).padStart(2, ' ')} ${news.title.slice(0, 50)}${news.title.length > 50 ? '...' : ''}`);
  });
  console.log('─'.repeat(60));
  console.log(`\n数据已保存到 ${TODAY_FILE}`);
}

main().catch((err) => {
  console.error('运行出错:', err);
  process.exit(1);
});