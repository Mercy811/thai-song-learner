/**
 * 从 songs/*.js 和 js/lessons-data.js 生成可抓取的静态页。
 * 互动播放器仍是原来的 index.html（?song= / ?page= 都继续可用）。
 * 图文页只放关键词和最多四句关键句，不放完整歌词。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'https://thai-song-learner.vercel.app';
const BASE_DESC = '用中文逐句、逐词学泰语歌：泰文、罗马音和中文意思，点一个词就能听发音。';
const EXCERPT_LIMIT = 4;

const FAQ = [
  {
    q: 'How do I learn Thai through song lyrics?',
    a: '打开首页，选一首歌，进入互动课。每一句都有泰文、罗马音和中文意思，点一个词就能听发音，也可以跟读和做测验。也可以先打开这首歌的图文介绍（网址形如 /songs/歌名），那里有关键词和最多四句关键句，用来预习。图文页不含完整歌词。',
  },
  {
    q: '这些页面会放完整歌词吗？',
    a: '不会。图文介绍只摘录关键词和少量关键句，方便搜索和预习。逐句跟读留在互动课里，供个人学习，不能当成歌词全文。',
  },
  {
    q: '记忆课、词频总表和覆盖率曲线是什么？',
    a: '记忆课把曲库里反复出现的词按主题串成 7 节小故事。词频总表按出现次数排列这些词。覆盖率曲线说明先学多少高频词，能覆盖歌词里多少用词。这三块都有可以直接阅读的页面，也有带搜索、朗读或图表的互动版。',
  },
  {
    q: '必须登录吗？',
    a: '不用。不登录也可以练习，进度存在这台浏览器里。登录之后，单词掌握程度可以跟账号同步。这是非商业的学习项目。',
  },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function xml(value) {
  return esc(value);
}

function jsonLdScript(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

function write(rel, contents) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

function songOrder(html) {
  const ids = [];
  const re = /<script src="songs\/([^"]+)\.js"/g;
  let match;
  while ((match = re.exec(html))) ids.push(match[1]);
  assert(ids.length > 0, 'index.html 里没有歌曲脚本');
  return ids;
}

function loadSongs(ids) {
  const window = { SONGS: {} };
  const context = vm.createContext({ window, console });
  for (const id of ids) {
    const file = path.join(ROOT, 'songs', `${id}.js`);
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: `${id}.js` });
    assert(window.SONGS[id], `没有读到歌曲 ${id}`);
    assert(window.SONGS[id].id === id, `${id} 的 id 和文件名不一致`);
  }
  return ids.map((id) => window.SONGS[id]);
}

function loadLessons() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/lessons-data.js'), 'utf8'), { window, console }, {
    filename: 'lessons-data.js',
  });
  assert(Array.isArray(window.LESSONS) && window.LESSONS.length > 0, '没有读到记忆课');
  return window.LESSONS;
}

function flattenLines(song) {
  const out = [];
  for (const sec of song.sections || []) {
    for (const line of sec.lines || []) {
      out.push({
        th: line.th || '',
        ro: line.ro || '',
        cn: line.cn || '',
        lang: line.lang || '',
        words: line.words || [],
        section: sec.name || '',
        sectionEn: sec.nameEn || '',
      });
    }
  }
  return out;
}

function isExcerptLine(line) {
  return Boolean(line.th) && line.lang !== 'en';
}

function keyLines(song) {
  const lines = flattenLines(song).filter(isExcerptLine);
  const chorus = lines.filter((line) => {
    if (/副歌/.test(line.section)) return true;
    return /\bchorus\b/i.test(line.sectionEn) && !/pre[-\s]?chorus/i.test(line.sectionEn);
  });
  const pool = chorus.length >= 2 ? chorus : lines;
  const seen = new Set();
  const picked = [];
  for (const line of pool) {
    if (seen.has(line.th)) continue;
    seen.add(line.th);
    picked.push(line);
    if (picked.length >= EXCERPT_LIMIT) break;
  }
  return picked;
}

function keyVocab(song, lines) {
  const blocked = new Set(flattenLines(song).filter(isExcerptLine).map((line) => line.th));
  for (const line of lines) blocked.delete(line.th);
  const items = [];
  const seen = new Set();
  const add = (word) => {
    if (!word || !word.th || word.lang === 'en') return;
    if (seen.has(word.th) || blocked.has(word.th)) return;
    if (!word.ro && !word.mean && !word.cn) return;
    seen.add(word.th);
    items.push({
      th: word.th,
      ro: word.ro || '',
      cn: word.cn || '',
      mean: word.mean || '',
    });
  };
  for (const line of lines) (line.words || []).forEach(add);
  if (items.length < 8) {
    const counts = new Map();
    const first = new Map();
    for (const line of flattenLines(song)) {
      for (const word of line.words || []) {
        if (!word.th || word.lang === 'en') continue;
        counts.set(word.th, (counts.get(word.th) || 0) + 1);
        if (!first.has(word.th)) first.set(word.th, word);
      }
    }
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    for (const [th] of ranked) {
      add(first.get(th));
      if (items.length >= 10) break;
    }
  }
  return items.slice(0, 10);
}

function buildFreq(songs) {
  const byTh = new Map();
  for (const song of songs) {
    for (const line of flattenLines(song)) {
      for (const word of line.words || []) {
        if (!word.th || word.lang === 'en') continue;
        let entry = byTh.get(word.th);
        if (!entry) {
          entry = { th: word.th, ro: word.ro || '', cn: word.cn || '', mean: word.mean || '', count: 0, songIds: [] };
          byTh.set(word.th, entry);
        }
        entry.count += 1;
        if (!entry.ro && word.ro) entry.ro = word.ro;
        if (!entry.cn && word.cn) entry.cn = word.cn;
        if (!entry.mean && word.mean) entry.mean = word.mean;
        if (!entry.songIds.includes(song.id)) entry.songIds.push(song.id);
      }
    }
  }
  return [...byTh.values()].sort((a, b) => b.count - a.count || a.th.localeCompare(b.th));
}

function computeCoverage(words) {
  const totalOcc = words.reduce((sum, word) => sum + word.count, 0);
  const totalWords = words.length;
  let cum = 0;
  const rows = words.map((word, index) => {
    cum += word.count;
    return { rank: index + 1, count: word.count, cumOccPct: totalOcc ? +(cum / totalOcc * 100).toFixed(2) : 0 };
  });
  const distinct = [...new Set(words.map((word) => word.count))].sort((a, b) => b - a);
  const thresholds = distinct.map((count) => {
    let last = -1;
    rows.forEach((row, index) => { if (row.count === count) last = index; });
    const row = rows[last];
    return {
      count,
      cumWords: row.rank,
      cumWordsPct: +(row.rank / totalWords * 100).toFixed(1),
      cumOccPct: row.cumOccPct,
    };
  });
  const firstAtLeast = (pct) => thresholds.find((row) => Math.round(row.cumOccPct) >= pct) || thresholds[thresholds.length - 1];
  return { totalOcc, totalWords, thresholds, mid: firstAtLeast(50), high: firstAtLeast(80) };
}

function names(song) {
  const title = song.title || song.id;
  const cn = song.titleCn || title;
  return { title, cn, th: song.titleTh || '' };
}

function h1Text(song) {
  const { title, cn } = names(song);
  return cn && cn !== title ? `${title} · ${cn}` : title;
}

function songLang(song) {
  return song.language === 'ja' ? 'ja' : 'th';
}

function songLangName(song) {
  return song.language === 'ja' ? '日语' : '泰语';
}

function songIntro(song) {
  const { title, cn, th } = names(song);
  const bits = [`《${cn}》`];
  if (title && title !== cn) bits.push(`英文名 ${title}`);
  if (th && th !== title && th !== cn) bits.push(`原文歌名 ${th}`);
  let credit = '';
  if (song.artist && song.album) credit = `演唱者是 ${song.artist}，出自 ${song.album}。`;
  else if (song.artist) credit = `演唱者是 ${song.artist}。`;
  else if (song.album) credit = `出自 ${song.album}。`;
  const n = flattenLines(song).length;
  return `${bits.join('，')}。${credit}这是一首用中文来学的${songLangName(song)}歌，曲库里有 ${n} 句可以逐句跟读。这一页只预习关键词和最多四句关键句，方便搜索和认识歌里的说法，不收录完整歌词。发音、跟读和测验在互动课里。`;
}

function songBlurb(song) {
  const { cn } = names(song);
  const who = song.artist ? `${song.artist} 的` : '';
  return `${who}${songLangName(song)}歌《${cn}》的学习介绍：关键词和少量关键句，不含完整歌词。`;
}

function crumbs(items) {
  const html = items.map((item, index) => {
    if (index === items.length - 1) return `<span>${esc(item.name)}</span>`;
    return `<a href="${esc(item.href)}">${esc(item.name)}</a>`;
  }).join(' / ');
  return `<p class="crumbs">${html}</p>`;
}

function breadcrumbLd(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : ORIGIN + item.href,
    })),
  };
}

function layout({ path: pagePath, title, description, image, json, main }) {
  const url = ORIGIN + pagePath;
  const imageTags = image
    ? `<meta property="og:image" content="${esc(image)}" />\n<meta name="twitter:image" content="${esc(image)}" />\n<meta name="twitter:card" content="summary_large_image" />`
    : '<meta name="twitter:card" content="summary" />';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="泰语歌逐句跟读" />
<meta property="og:locale" content="zh_CN" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
${imageTags}
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎵</text></svg>" />
<link rel="stylesheet" href="/css/content.css" />
${jsonLdScript(json)}
</head>
<body>
<div class="wrap">
<header class="site">
  <a class="brand" href="/">泰语歌逐句跟读</a>
  <nav class="site" aria-label="站点">
    <a href="/songs">歌曲</a>
    <a href="/lessons">记忆课</a>
    <a href="/freq">词频</a>
    <a href="/science">覆盖率</a>
    <a href="/faq">问答</a>
  </nav>
</header>
<main>
${main}
</main>
<footer>
  <p>非商业学习项目。图文页只摘录关键词和少量关键句，不含完整歌词。</p>
</footer>
</div>
</body>
</html>
`;
}

function vocabTable(words, lang) {
  if (!words.length) return '<p class="note">关键词表在互动课的单词模式里。</p>';
  const rows = words.map((word) => `<tr>
    <td class="orig" lang="${esc(lang)}">${esc(word.th)}</td>
    <td>${esc(word.ro)}</td>
    <td>${esc(word.cn)}</td>
    <td>${esc(word.mean)}</td>
  </tr>`).join('\n');
  return `<div class="table-scroll"><table>
    <caption>关键词</caption>
    <thead><tr><th>原文</th><th>罗马音</th><th>中文谐音</th><th>意思</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function songPage(song) {
  const lines = keyLines(song);
  const vocab = keyVocab(song, lines);
  const intro = songIntro(song);
  const heading = h1Text(song);
  const pagePath = `/songs/${song.id}`;
  const url = ORIGIN + pagePath;
  const trail = [
    { name: '首页', href: '/' },
    { name: '歌曲', href: '/songs' },
    { name: heading, href: pagePath },
  ];
  const credit = [song.artist, song.album].filter(Boolean).join(' · ');
  const excerpts = lines.map((line) => {
    const lang = line.lang === 'ja' || song.language === 'ja' ? 'ja' : 'th';
    return `<blockquote class="excerpt excerpt-line">
      <p class="orig" lang="${lang}">${esc(line.th)}</p>
      ${line.ro ? `<p class="ro">${esc(line.ro)}</p>` : ''}
      ${line.cn ? `<p class="cn">${esc(line.cn)}</p>` : ''}
    </blockquote>`;
  }).join('\n');
  const image = song.youtubeId ? `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg` : '';
  const description = intro.length > 150 ? `${intro.slice(0, 147)}…` : intro;
  const html = layout({
    path: pagePath,
    title: `${heading} — 泰语歌逐句跟读`,
    description,
    image,
    json: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LearningResource',
          '@id': `${url}#resource`,
          name: heading,
          description: intro,
          url,
          inLanguage: song.language === 'ja' ? ['zh-CN', 'ja'] : ['zh-CN', 'th'],
          learningResourceType: 'lesson',
          educationalLevel: 'Beginner',
          isAccessibleForFree: true,
          teaches: song.language === 'ja'
            ? 'Japanese vocabulary through a song, explained in Chinese'
            : 'Thai vocabulary and pronunciation through a song, explained in Chinese',
          isPartOf: { '@id': `${ORIGIN}/#course` },
          about: heading,
        },
        breadcrumbLd(trail),
      ],
    },
    main: `${crumbs(trail)}
<h1>${esc(heading)}</h1>
${credit ? `<p class="by">${esc(credit)}</p>` : ''}
${song.titleTh ? `<p class="orig" lang="${songLang(song)}">${esc(song.titleTh)}</p>` : ''}
<p>${esc(intro)}</p>
<p><a class="cta" href="/?song=${encodeURIComponent(song.id)}">打开互动课，逐句跟读</a></p>
<section>
  <h2>关键词</h2>
  ${vocabTable(vocab, songLang(song))}
</section>
<section>
  <h2>关键句</h2>
  <p class="note">只摘录最多四句，用来认识这首歌里的说法。这里不是完整歌词。</p>
  ${excerpts || '<p class="note">关键句请到互动课里逐句看。</p>'}
</section>`,
  });
  assertNoExtraLyrics(song, html, lines);
  return html;
}

function assertNoExtraLyrics(song, html, shownLines) {
  const shown = new Set(shownLines.map((line) => line.th));
  const shownText = [...shown].join('\n');
  const titles = new Set([song.title, song.titleTh, song.titleCn].filter(Boolean));
  for (const line of flattenLines(song).filter(isExcerptLine)) {
    if (shown.has(line.th) || titles.has(line.th) || line.th.length < 8) continue;
    if (shownText.includes(line.th)) continue;
    if (html.includes(line.th)) throw new Error(`歌词整句被写进了 ${song.id} 的图文页：${line.th}`);
  }
  const excerpts = html.match(/class="excerpt excerpt-line"/g) || [];
  assert(excerpts.length <= EXCERPT_LIMIT, `${song.id} 的关键句超过 ${EXCERPT_LIMIT} 句`);
  assert(excerpts.length < flattenLines(song).filter(isExcerptLine).length || excerpts.length <= EXCERPT_LIMIT, `${song.id} 摘录检查失败`);
}

function cardHtml(song) {
  const { cn, th, title } = names(song);
  const by = [song.artist, song.album].filter(Boolean).join(' · ');
  const thumb = song.youtubeId
    ? `<img src="https://img.youtube.com/vi/${esc(song.youtubeId)}/hqdefault.jpg" alt="${esc(cn)}" loading="lazy" width="480" height="270">`
    : '';
  return `<a class="home-card" href="/songs/${song.id}">
        <span class="home-card-thumb">
          ${thumb}
          <span class="home-card-play">▶</span>
        </span>
        <span class="home-card-body">
          <span class="home-card-th">${esc(th || title)}</span>
          <span class="home-card-cn">${esc(cn)}</span>
          ${by ? `<span class="home-card-by">${esc(by)}</span>` : ''}
        </span>
      </a>`;
}

function songLinks(songs, className) {
  return `<ul class="${className}">
    ${songs.map((song) => {
      const { cn, title } = names(song);
      const label = cn !== title ? `${title} · ${cn}` : title;
      const by = song.artist ? ` — ${song.artist}` : '';
      return `<li><a href="/songs/${song.id}">${esc(label)}</a>${esc(by)}</li>`;
    }).join('\n')}
  </ul>`;
}

function faqHtml(headingTag, headingText, headingId) {
  const items = FAQ.map((item) => `<h3>${esc(item.q)}</h3>\n<p>${esc(item.a)}</p>`).join('\n');
  return `<section class="home-faq" id="${headingId}" aria-labelledby="${headingId}-title">
  <${headingTag} id="${headingId}-title">${esc(headingText)}</${headingTag}>
  ${items}
</section>`;
}

function faqLd(id) {
  return {
    '@type': 'FAQPage',
    '@id': id,
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

function patchHome(html, songs, wordCount, description) {
  const tokens = ['<!--GEO:JSONLD-->', '<!--GEO:NOSCRIPT-->', '<!--GEO:READLIST-->', '<!--GEO:FAQ-->', '<div class="home-grid" id="homeGrid"></div>'];
  for (const token of tokens) assert(html.includes(token), `首页缺少标记 ${token}`);
  assert(html.split(BASE_DESC).length === 4, '首页简介没有出现在三处 meta 里');

  const homeLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${ORIGIN}/#org`,
        name: '泰语歌逐句跟读',
        url: `${ORIGIN}/`,
      },
      {
        '@type': 'WebSite',
        '@id': `${ORIGIN}/#website`,
        name: '泰语歌逐句跟读',
        url: `${ORIGIN}/`,
        description,
        inLanguage: 'zh-CN',
        publisher: { '@id': `${ORIGIN}/#org` },
      },
      {
        '@type': ['Course', 'LearningResource'],
        '@id': `${ORIGIN}/#course`,
        name: '跟着歌曲学泰语',
        description,
        url: `${ORIGIN}/`,
        provider: { '@id': `${ORIGIN}/#org` },
        isAccessibleForFree: true,
        inLanguage: ['zh-CN', 'th'],
        educationalLevel: 'Beginner',
        teaches: 'Thai vocabulary, pronunciation, and reading through song lyrics',
        hasPart: songs.map((song) => ({
          '@type': 'LearningResource',
          name: h1Text(song),
          url: `${ORIGIN}/songs/${song.id}`,
        })),
      },
      faqLd(`${ORIGIN}/#faq`),
    ],
  };

  html = html.replace('<!--GEO:JSONLD-->', jsonLdScript(homeLd));
  html = html.split(BASE_DESC).join(description);
  html = html.replace(/id="homeStatSongs">\d+</, `id="homeStatSongs">${songs.length}<`);
  html = html.replace(/id="homeStatWords">\d+</, `id="homeStatWords">${wordCount}<`);
  html = html.replace('<div class="home-grid" id="homeGrid"></div>', `<div class="home-grid" id="homeGrid">\n${songs.map(cardHtml).join('\n')}\n</div>`);
  html = html.replace('<!--GEO:READLIST-->', `<nav class="home-read" aria-label="图文介绍">
      <h2>每首歌的图文介绍</h2>
      <p>这些链接打开可以阅读的介绍页：关键词和最多四句关键句。上面的卡片在打开脚本后进入互动跟读。</p>
      ${songLinks(songs, 'plain-list')}
    </nav>`);
  html = html.replace('<!--GEO:NOSCRIPT-->', `<noscript>
      <div class="noscript-fallback">
        <p>脚本没有运行。曲库可以直接阅读：已收录 ${songs.length} 首歌、${wordCount} 个词。下面是图文页，不含完整歌词。</p>
        ${songLinks(songs, 'plain-list')}
        <p><a href="/lessons">记忆课</a> · <a href="/freq">词频总表</a> · <a href="/science">覆盖率曲线</a> · <a href="/faq">常见问题</a></p>
      </div>
    </noscript>`);
  html = html.replace('<!--GEO:FAQ-->', faqHtml('h2', '常见问题', 'homeFaq'));
  return html;
}

function contentPages(songs, lessons, freq, coverage) {
  const songItems = songs.map((song) => {
    const { cn, title } = names(song);
    const label = cn !== title ? `${title} · ${cn}` : title;
    const by = song.artist ? `${song.artist}。` : '';
    return `<li><a href="/songs/${song.id}">${esc(label)}</a> ${esc(by)}${esc(songBlurb(song))}</li>`;
  }).join('\n');
  write('songs/index.html', layout({
    path: '/songs',
    title: '歌曲介绍 — 泰语歌逐句跟读',
    description: `已收录 ${songs.length} 首歌的中文学习介绍。每页有关键词和少量关键句，不含完整歌词。`,
    json: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${ORIGIN}/songs#page`,
          name: '歌曲介绍',
          url: `${ORIGIN}/songs`,
          isPartOf: { '@id': `${ORIGIN}/#website` },
          inLanguage: 'zh-CN',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: songs.map((song, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: h1Text(song),
              url: `${ORIGIN}/songs/${song.id}`,
            })),
          },
        },
        breadcrumbLd([{ name: '首页', href: '/' }, { name: '歌曲', href: '/songs' }]),
      ],
    },
    main: `${crumbs([{ name: '首页', href: '/' }, { name: '歌曲', href: '/songs' }])}
<h1>歌曲介绍</h1>
<p class="lede">每首歌一页，用中文列出关键词和最多四句关键句。完整跟读、发音和测验从各页进入互动课。</p>
<ul class="song-list">${songItems}</ul>`,
  }));

  for (const song of songs) write(`songs/${song.id}/index.html`, songPage(song));

  const lessonTrail = [{ name: '首页', href: '/' }, { name: '记忆课', href: '/lessons' }];
  const lessonArticles = lessons.map((lesson) => {
    const paras = (lesson.blocks || []).filter((block) => block.type === 'p')
      .map((block) => `<p>${esc(block.text)}</p>`).join('\n');
    const words = (lesson.blocks || []).filter((block) => block.type === 'word');
    return `<article class="lesson" id="${esc(lesson.id)}">
      <h2>${esc(`${lesson.emoji || ''} ${lesson.title}`.trim())}</h2>
      <p class="by">${esc(lesson.subtitle || '')}${lesson.minutes ? ` · 大约 ${Number(lesson.minutes)} 分钟` : ''}</p>
      ${paras}
      ${vocabTable(words.map((word) => ({ th: word.th, ro: word.ro, cn: word.cn, mean: word.mean })), 'th')}
    </article>`;
  }).join('\n');
  write('lessons/index.html', layout({
    path: '/lessons',
    title: '记忆课 — 泰语歌逐句跟读',
    description: `用 7 节小故事记住曲库里反复出现的泰语词。每节课列出原文、罗马音、中文谐音和意思。`,
    json: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LearningResource',
          '@id': `${ORIGIN}/lessons#resource`,
          name: '记忆课',
          description: '把反复出现的泰语词按主题串成 7 节小故事。',
          url: `${ORIGIN}/lessons`,
          inLanguage: ['zh-CN', 'th'],
          learningResourceType: 'lesson plan',
          isAccessibleForFree: true,
          teaches: 'High-frequency Thai words from the song library',
          isPartOf: { '@id': `${ORIGIN}/#course` },
        },
        breadcrumbLd(lessonTrail),
      ],
    },
    main: `${crumbs(lessonTrail)}
<h1>记忆课</h1>
<p class="lede">把曲库里反复出现的泰语词按主题串成 7 节小故事：先认基础词，再看它们怎么拼成更长的说法。下面是每节课的讲解和词汇。朗读、标记学过和测验在互动课里。</p>
<p><a class="cta" href="/?page=lessons">打开互动记忆课</a></p>
${lessonArticles}`,
  }));

  const top = freq.slice(0, 40);
  const freqRows = top.map((word) => {
    const links = word.songIds.slice(0, 3).map((id) => {
      const song = songs.find((item) => item.id === id);
      return `<a href="/songs/${id}">${esc(song ? names(song).cn : id)}</a>`;
    }).join('、');
    return `<tr>
      <td class="orig" lang="th">${esc(word.th)}</td>
      <td>${esc(word.ro)}</td>
      <td>${esc(word.mean)}</td>
      <td>${word.count}</td>
      <td>${links}</td>
    </tr>`;
  }).join('\n');
  const freqTrail = [{ name: '首页', href: '/' }, { name: '词频总表', href: '/freq' }];
  write('freq/index.html', layout({
    path: '/freq',
    title: '词频总表 — 泰语歌逐句跟读',
    description: `曲库里 ${freq.length} 个不重复的词，按出现次数排列。这一页列出出现最多的 ${top.length} 个。`,
    json: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LearningResource',
          '@id': `${ORIGIN}/freq#resource`,
          name: '词频总表',
          description: `按出现次数排列曲库里的 ${freq.length} 个词。`,
          url: `${ORIGIN}/freq`,
          inLanguage: ['zh-CN', 'th'],
          learningResourceType: 'reference',
          isAccessibleForFree: true,
          teaches: 'Which Thai words appear most often in the song library',
          isPartOf: { '@id': `${ORIGIN}/#course` },
        },
        breadcrumbLd(freqTrail),
      ],
    },
    main: `${crumbs(freqTrail)}
<h1>词频总表</h1>
<p class="lede">把全部歌曲的逐词卡片按原文去重，副歌重复几遍就计几次。先学出现最多的词，覆盖面最快。这里是出现最多的 ${top.length} 个，全部 ${freq.length} 个可以在互动页里搜索。</p>
<p><a class="cta" href="/?page=freq">打开可搜索的词频总表</a></p>
<div class="table-scroll"><table>
  <caption>出现最多的 ${top.length} 个词</caption>
  <thead><tr><th>原文</th><th>罗马音</th><th>意思</th><th>次数</th><th>出现在</th></tr></thead>
  <tbody>${freqRows}</tbody>
</table></div>`,
  }));

  const restWords = coverage.totalWords - coverage.high.cumWords;
  const restPct = Math.max(0, Math.round(100 - coverage.high.cumOccPct));
  const scienceText = `库里现在有 ${coverage.totalWords} 个不重复的词，一共出现 ${coverage.totalOcc} 次。出现至少 ${coverage.mid.count} 次的 ${coverage.mid.cumWords} 个词（约占词表 ${coverage.mid.cumWordsPct}%）已经覆盖大约 ${coverage.mid.cumOccPct}% 的用词；学到出现至少 ${coverage.high.count} 次的 ${coverage.high.cumWords} 个词，覆盖率大约到 ${coverage.high.cumOccPct}%。剩下 ${restWords} 个低频词只再增加大约 ${restPct}% 的覆盖。`;
  const thresholdRows = coverage.thresholds.slice(0, 8).map((row) => `<tr>
    <td>${row.count}</td><td>${row.cumWords}</td><td>${row.cumWordsPct}%</td><td>${row.cumOccPct}%</td>
  </tr>`).join('\n');
  const scienceTrail = [{ name: '首页', href: '/' }, { name: '覆盖率曲线', href: '/science' }];
  write('science/index.html', layout({
    path: '/science',
    title: '词频覆盖率曲线 — 泰语歌逐句跟读',
    description: scienceText,
    json: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LearningResource',
          '@id': `${ORIGIN}/science#resource`,
          name: '词频覆盖率曲线',
          description: scienceText,
          url: `${ORIGIN}/science`,
          inLanguage: 'zh-CN',
          learningResourceType: 'explanation',
          isAccessibleForFree: true,
          teaches: 'How many high-frequency words cover the song library',
          isPartOf: { '@id': `${ORIGIN}/#course` },
        },
        breadcrumbLd(scienceTrail),
      ],
    },
    main: `${crumbs(scienceTrail)}
<h1>词频覆盖率曲线</h1>
<p>${esc(scienceText)}</p>
<p>曲线前陡后平，是因为用词大致服从齐夫定律：少数词反复出现，大多数词只出现一两次。互动页可以把鼠标移到曲线上，看任意一点的数字。</p>
<p><a class="cta" href="/?page=science">打开互动曲线</a></p>
<div class="table-scroll"><table>
  <caption>从最高频开始的几档</caption>
  <thead><tr><th>出现次数至少</th><th>累计词数</th><th>占词表</th><th>累计覆盖率</th></tr></thead>
  <tbody>${thresholdRows}</tbody>
</table></div>`,
  }));

  const faqTrail = [{ name: '首页', href: '/' }, { name: '常见问题', href: '/faq' }];
  write('faq/index.html', layout({
    path: '/faq',
    title: '常见问题 — 泰语歌逐句跟读',
    description: FAQ[0].a,
    json: {
      '@context': 'https://schema.org',
      '@graph': [
        faqLd(`${ORIGIN}/faq#faq`),
        breadcrumbLd(faqTrail),
      ],
    },
    main: `${crumbs(faqTrail)}
${faqHtml('h1', '常见问题', 'faqPage')}`,
  }));
}

function writeDiscovery(songs, description) {
  const bots = ['*', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'bingbot'];
  const robots = `${bots.map((bot) => `User-agent: ${bot}\nAllow: /\n`).join('\n')}\nSitemap: ${ORIGIN}/sitemap.xml\n`;
  write('robots.txt', robots);

  const urls = ['/', '/songs', '/lessons', '/freq', '/science', '/faq', ...songs.map((song) => `/songs/${song.id}`)];
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = urls.map((url) => `  <url><loc>${xml(ORIGIN + url)}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);

  const songLines = songs.map((song) => {
    const { title, cn } = names(song);
    const label = cn !== title ? `${title} · ${cn}` : title;
    return `- [${label}](${ORIGIN}/songs/${song.id}): ${songBlurb(song)}`;
  });
  const pages = [
    `- [首页](${ORIGIN}/): 曲库、歌曲数量和常见问题`,
    `- [歌曲介绍](${ORIGIN}/songs): 全部歌曲的图文页目录`,
    `- [记忆课](${ORIGIN}/lessons): 7 节主题课和词汇`,
    `- [词频总表](${ORIGIN}/freq): 跨歌曲的高频词`,
    `- [覆盖率曲线](${ORIGIN}/science): 学多少词能覆盖多少用词`,
    `- [常见问题](${ORIGIN}/faq): 怎样用歌曲学泰语，以及页面为什么不放完整歌词`,
  ];
  const summary = `${description}非商业学习项目。图文页在 /songs/<歌名>，只含关键词和最多四句关键句，不含完整歌词。互动跟读从每首歌页面上的链接进入。`;
  write('llms.txt', `# 泰语歌逐句跟读\n\n> ${summary}\n\n## 页面\n\n${pages.join('\n')}\n\n## 歌曲\n\n${songLines.join('\n')}\n`);

  const details = songs.map((song) => {
    const vocab = keyVocab(song, keyLines(song)).map((word) => `${word.th} (${word.ro}) ${word.mean}`).join('；');
    return `### ${h1Text(song)}\n\n${ORIGIN}/songs/${song.id}\n\n${songIntro(song)}\n\n关键词：${vocab || '见该页'}\n`;
  }).join('\n');
  write('llms-full.txt', `# 泰语歌逐句跟读\n\n> ${summary}\n\n完整歌词不在这些文件里。下面每首歌一行链接，随后是简介和关键词。\n\n## 歌曲\n\n${songLines.join('\n')}\n\n## 分歌简介\n\n${details}`);
}

function copySite() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  for (const entry of fs.readdirSync(ROOT)) {
    if (['dist', '.git', 'node_modules', '.cursor'].includes(entry)) continue;
    fs.cpSync(path.join(ROOT, entry), path.join(DIST, entry), { recursive: true });
  }
}

function verify(songs) {
  const read = (rel) => fs.readFileSync(path.join(DIST, rel), 'utf8');
  const h1count = (html) => (html.match(/<h1\b/g) || []).length;
  const home = read('index.html');
  assert(h1count(home) === 1, `首页 H1 数量是 ${h1count(home)}`);
  assert(!home.includes('<h1 id="songTitle"'), '播放器标题仍是 H1');
  assert(home.includes(`id="homeStatSongs">${songs.length}<`), '首页歌曲数没有写进 HTML');
  assert(!home.includes('id="homeStatSongs">0<'), '首页歌曲数仍是 0');
  assert(home.includes('id="homeStatWords">') && !home.includes('id="homeStatWords">0<'), '首页词数仍是 0');
  assert(home.includes('<noscript>'), '首页缺少 noscript');
  assert(home.includes('href="/songs/safe-near-me"'), '首页没有 Safe Near Me 的图文链接');
  assert(home.includes('"@type":"WebSite"') || home.includes('"@type": "WebSite"'), '首页缺少 WebSite');
  assert(home.includes('LearningResource'), '首页缺少 LearningResource');
  assert(home.includes('FAQPage'), '首页缺少 FAQPage');
  assert(home.includes('How do I learn Thai through song lyrics?'), '首页缺少示例问题');
  assert(home.includes('rel="canonical" href="https://thai-song-learner.vercel.app/"'), '首页 canonical 不对');
  assert(home.includes('lang="zh-CN"'), '首页语言不是 zh-CN');

  const songHtml = read('songs/safe-near-me/index.html');
  assert(h1count(songHtml) === 1, '歌曲页 H1 不是一个');
  assert(songHtml.includes('Safe Near Me'), '歌曲页缺少标题');
  assert(songHtml.includes('ปลอดภัย'), '歌曲页缺少关键词');
  assert(songHtml.includes('LearningResource') && songHtml.includes('BreadcrumbList'), '歌曲页缺少 JSON-LD');
  assert(songHtml.includes('rel="canonical" href="https://thai-song-learner.vercel.app/songs/safe-near-me"'), '歌曲页 canonical 不对');
  assert(songHtml.includes('lang="zh-CN"'), '歌曲页语言不是 zh-CN');
  assert(!songHtml.includes('เรากลับมาเป็นเหมือนเดิมได้ไหม'), '歌曲页放进了未摘录的歌词');
  assert((songHtml.match(/excerpt-line/g) || []).length <= EXCERPT_LIMIT, '歌曲页关键句太多');

  const robots = read('robots.txt');
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'bingbot', 'User-agent: *']) {
    assert(robots.includes(bot), `robots.txt 缺少 ${bot}`);
  }
  assert(robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`), 'robots.txt 没有指向 sitemap');

  const sitemap = read('sitemap.xml');
  for (const url of ['/', '/songs/safe-near-me', '/lessons', '/freq', '/science', '/faq']) {
    assert(sitemap.includes(`<loc>${ORIGIN}${url}</loc>`), `sitemap 缺少 ${url}`);
  }
  for (const song of songs) assert(sitemap.includes(`${ORIGIN}/songs/${song.id}`), `sitemap 缺少 ${song.id}`);
  assert(!sitemap.includes('?song='), 'sitemap 含有 ?song=');

  const llms = read('llms.txt');
  const full = read('llms-full.txt');
  assert(llms.startsWith('# 泰语歌逐句跟读'), 'llms.txt 缺少站点摘要标题');
  assert(full.includes('不含完整歌词'), 'llms-full.txt 缺少说明');
  for (const song of songs) {
    const url = `${ORIGIN}/songs/${song.id}`;
    assert(llms.includes(url), `llms.txt 缺少 ${url}`);
    assert(full.includes(url), `llms-full.txt 缺少 ${url}`);
  }
  assert(!llms.includes('?song='), 'llms.txt 不应列出 ?song= 地址');

  for (const rel of ['songs/index.html', 'lessons/index.html', 'freq/index.html', 'science/index.html', 'faq/index.html']) {
    const html = read(rel);
    assert(h1count(html) === 1, `${rel} 的 H1 数量不是 1`);
    assert(html.includes('rel="canonical"'), `${rel} 缺少 canonical`);
    assert(html.includes('lang="zh-CN"'), `${rel} 语言不是 zh-CN`);
  }
  assert(read('faq/index.html').includes('FAQPage'), '问答页缺少 FAQPage');
  assert(read('lessons/index.html').includes('ฉัน'), '记忆课页面缺少例词');
  assert(read('science/index.html').includes('齐夫定律'), '覆盖率页面缺少说明');
}

function main() {
  const source = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const ids = songOrder(source);
  const songs = loadSongs(ids);
  const lessons = loadLessons();
  const freq = buildFreq(songs);
  const coverage = computeCoverage(freq);
  const description = `用中文逐句、逐词学泰语歌：泰文、罗马音和中文意思。已收录 ${songs.length} 首歌、${freq.length} 个词。`;
  copySite();
  const home = patchHome(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8'), songs, freq.length, description);
  fs.writeFileSync(path.join(DIST, 'index.html'), home);
  contentPages(songs, lessons, freq, coverage);
  writeDiscovery(songs, description);
  verify(songs);
  console.log(`static pages: ${songs.length} songs, ${freq.length} words, ${lessons.length} lessons -> ${DIST}`);
}

main();
