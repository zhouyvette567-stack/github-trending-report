/**
 * build-site.mjs
 * 生成 AI 新闻网站 HTML
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const TODAY_FILE = join(DATA_DIR, 'today.json');
const HISTORY_FILE = join(DATA_DIR, 'history.json');
const DOCS_DIR = join(__dirname, '..', 'docs');

if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

const todayData = JSON.parse(readFileSync(TODAY_FILE, 'utf-8'));
const historyData = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
const reports = historyData.reports || [];

const SITE_NAME = 'AI新闻锐评日报';
const SITE_DESC = 'AI锐评每日机器之心AI新闻';

function renderHead(title, currentPage = '') {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${SITE_NAME}</title>
  <meta name="description" content="${SITE_DESC}">
  <style>
    :root {
      --bg: #0d1117;
      --bg-card: #161b22;
      --bg-hover: #1c2128;
      --border: #30363d;
      --text: #e6edf3;
      --text-secondary: #8b949e;
      --accent: #f0883e;
      --accent2: #58a6ff;
      --green: #3fb950;
      --purple: #a371f7;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }
    a { color: var(--accent2); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .nav {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-brand span { color: var(--purple); }
    .nav-links { display: flex; gap: 24px; }
    .nav-links a {
      color: var(--text-secondary);
      font-size: 14px;
      padding: 4px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-links a:hover { color: var(--text); text-decoration: none; }
    .nav-links a.active { color: var(--purple); border-bottom-color: var(--purple); }

    .container { max-width: 960px; margin: 0 auto; padding: 24px 16px; }

    .date-header {
      text-align: center;
      margin: 32px 0 24px;
    }
    .date-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .date-header .meta {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .summary-card {
      background: linear-gradient(135deg, #1a1e2e 0%, #161b22 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      font-size: 16px;
      line-height: 1.8;
    }
    .summary-card .label {
      font-size: 12px;
      color: var(--purple);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .news-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    .news-card:hover {
      border-color: var(--purple);
    }
    .news-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;
    }
    .news-rank {
      font-size: 24px;
      font-weight: 800;
      color: var(--purple);
      min-width: 36px;
    }
    .news-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      line-height: 1.4;
    }
    .news-title a { color: inherit; }
    .news-title a:hover { color: var(--accent2); text-decoration: none; }
    
    .news-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 8px;
    }

    .review-box {
      background: rgba(163, 113, 247, 0.08);
      border-left: 3px solid var(--purple);
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      margin-top: 12px;
      font-size: 14px;
      line-height: 1.7;
    }
    .review-label {
      font-size: 11px;
      color: var(--purple);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .source-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(88, 166, 255, 0.1);
      color: var(--accent2);
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 20px;
      margin-top: 8px;
    }

    .history-list { list-style: none; }
    .history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 10px;
    }
    .history-date {
      font-size: 18px;
      font-weight: 600;
      min-width: 120px;
    }
    .history-link {
      font-size: 14px;
      color: var(--accent2);
    }

    .footer {
      text-align: center;
      padding: 32px 16px;
      color: var(--text-secondary);
      font-size: 13px;
      border-top: 1px solid var(--border);
      margin-top: 48px;
    }

    @media (max-width: 640px) {
      .nav { flex-direction: column; gap: 12px; }
      .news-header { flex-direction: column; }
      .container { padding: 16px 12px; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-brand">🤖 <span>AI</span> 新闻锐评日报</div>
    <div class="nav-links">
      <a href="index.html" class="${currentPage === 'home' ? 'active' : ''}">📰 今日热点</a>
      <a href="history.html" class="${currentPage === 'history' ? 'active' : ''}">📅 历史存档</a>
    </div>
  </nav>
  <div class="container">`;
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `  </div>
  <footer class="footer">
    <p>🤖 ${SITE_NAME} · 数据来源 <a href="https://www.jiqizhixin.com/" target="_blank">机器之心</a> · AI锐评由 <a href="https://github.com/marketplace/models" target="_blank">GitHub Models</a> 生成</p>
    <p style="margin-top:4px;">© ${year} · 每日自动更新</p>
  </footer>
</body>
</html>`;
}

function renderNewsCard(news) {
  const reviewHtml = news.review
    ? `<div class="review-box">
        <div class="review-label">🤖 AI锐评</div>
        <div>${news.review}</div>
      </div>`
    : '';

  return `    <div class="news-card">
      <div class="news-header">
        <div class="news-rank">#${news.rank}</div>
        <div>
          <div class="news-title"><a href="${news.link}" target="_blank">${news.title}</a></div>
          <div class="news-meta">
            <span>📰 ${news.source}</span>
            <span>🕐 ${new Date(news.pubDate).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>
      ${news.description ? `<div style="color:var(--text-secondary);font-size:14px;margin-bottom:12px;">${news.description}</div>` : ''}
      ${reviewHtml}
    </div>`;
}
function buildIndexPage() {
  const { date, fetchedAt, source, sourceUrl, news, summary } = todayData;

  let html = renderHead(`📰 ${date}`, 'home');

  html += `
    <div class="date-header">
      <h1>📰 今日 AI 热点</h1>
      <div class="meta">
        📅 ${date} · 数据更新于 ${new Date(fetchedAt).toLocaleString('zh-CN')}
      </div>
      <div class="source-badge" style="margin-top:12px;">
        🔗 数据来源：<a href="${sourceUrl}" target="_blank">机器之心</a>
      </div>
    </div>`;

  if (summary) {
    html += `
    <div class="summary-card">
      <div class="label">📝 今日热点总评</div>
      <div>${summary}</div>
    </div>`;
  }

  news.forEach((item) => {
    html += renderNewsCard(item);
  });

  html += renderFooter();

  writeFileSync(join(DOCS_DIR, 'index.html'), html, 'utf-8');
  console.log('✅ 首页生成完成');
}

function buildHistoryPage() {
  let html = renderHead('📅 历史存档', 'history');

  html += `
    <div class="date-header">
      <h1>📅 历史存档</h1>
      <div class="meta">共 ${reports.length} 份报告</div>
    </div>`;

  if (reports.length === 0) {
    html += `
    <div style="text-align:center;padding:64px 24px;color:var(--text-secondary);">
      <div style="font-size:48px;margin-bottom:16px;">📭</div>
      <p>还没有历史报告</p>
    </div>`;
  } else {
    html += '<ul class="history-list">';
    reports.forEach((report) => {
      const summaryText = report.summary?.slice(0, 60) || `共 ${report.news?.length || 0} 条新闻`;
      html += `
      <li class="history-item">
        <div class="history-date">📅 ${report.date}</div>
        <div style="flex:1;color:var(--text-secondary);font-size:14px;margin:0 16px;">${summaryText}...</div>
        <a class="history-link" href="report-${report.date}.html">查看详情 →</a>
      </li>`;
    });
    html += '</ul>';
  }

  html += renderFooter();

  writeFileSync(join(DOCS_DIR, 'history.html'), html, 'utf-8');
  console.log('✅ 历史存档页生成完成');
}

function buildReportPages() {
  reports.forEach((report) => {
    const { date, fetchedAt, source, sourceUrl, news, summary } = report;
    let html = renderHead(`📰 ${date}`, '');

    html += `
      <div class="date-header">
        <h1>📰 ${date} AI新闻</h1>
        <div class="meta">
          📅 ${date} · 数据更新于 ${fetchedAt ? new Date(fetchedAt).toLocaleString('zh-CN') : '未知'}
        </div>
        <div class="source-badge" style="margin-top:12px;">
          🔗 数据来源：<a href="${sourceUrl || 'https://www.jiqizhixin.com/'}" target="_blank">机器之心</a>
        </div>
        <div style="margin-top:12px;">
          <a href="history.html" style="color:var(--text-secondary);font-size:14px;">← 返回历史列表</a>
        </div>
      </div>`;

    if (summary) {
      html += `
      <div class="summary-card">
        <div class="label">📝 当日总评</div>
        <div>${summary}</div>
      </div>`;
    }

    (news || []).forEach((item) => {
      html += renderNewsCard(item);
    });

    html += renderFooter();

    writeFileSync(join(DOCS_DIR, `report-${date}.html`), html, 'utf-8');
  });

  console.log(`✅ ${reports.length} 份历史报告详情页生成完成`);
}

function main() {
  console.log('========================================');
  console.log('  网站生成中...');
  console.log('========================================\n');

  buildIndexPage();
  buildHistoryPage();
  buildReportPages();

  console.log('\n========================================');
  console.log('  网站生成完成！');
  console.log(`  页面数量: ${2 + reports.length}`);
  console.log('========================================');
}

main();