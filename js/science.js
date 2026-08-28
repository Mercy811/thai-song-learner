/**
 * Science —— 覆盖率曲线科普页
 *
 * 拿 WordFreq 已经摊好的全站泰语词表（按出现次数从高到低排好序），
 * 算一条「累积覆盖率曲线」：学到第 N 个词为止，这些词一共占了全部
 * 用词次数的百分之多少。背后是齐夫定律（Zipf's Law）——少数高频词
 * 反复出现，大多数词只出现一两次，这也是这张图长成长尾形、不是钟形
 * 正态分布的原因。数字全部现算，不是写死的，歌加多了这页自动跟着变。
 */
window.Science = (() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const english = () => window.I18n?.language === 'en';
  const meaning = (s) => english() && window.I18n ? I18n.t(s || '') : (s || '');

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ════════ 算累积覆盖率 ════════ */

  function computeCoverage() {
    const words = [...WordFreq.list()].sort((a, b) => b.count - a.count || a.th.localeCompare(b.th));
    const totalOcc = words.reduce((a, w) => a + w.count, 0);
    const totalWords = words.length;

    let cum = 0;
    const rows = words.map((w, i) => {
      cum += w.count;
      return { rank: i + 1, th: w.th, mean: w.mean, count: w.count, cumOccPct: +(cum / totalOcc * 100).toFixed(2) };
    });

    const distinctCounts = [...new Set(words.map((w) => w.count))].sort((a, b) => b - a);
    const thresholds = distinctCounts.map((c) => {
      let lastIdx = -1;
      rows.forEach((r, i) => { if (r.count === c) lastIdx = i; });
      const r = rows[lastIdx];
      return { count: c, cumWords: r.rank, cumWordsPct: +(r.rank / totalWords * 100).toFixed(1), cumOccPct: r.cumOccPct };
    });

    return { totalOcc, totalWords, rows, thresholds };
  }

  /* ════════ 统计块 + 解说文字里的动态数字 ════════ */

  function renderStats(data) {
    // 找「累计覆盖率第一次 ≥ 阈值」的那一档，用来在统计块和解说文字里报数字——
    // 不写死具体出现几次，歌库变了这两个点自动跟着挪。四舍五入了再比，
    // 不然像 79.94% 这种卡在整数边上的会被 80% 那档漏掉，跳到下一档去
    const firstAtLeast = (pct) => data.thresholds.find((t) => Math.round(t.cumOccPct) >= pct) || data.thresholds[data.thresholds.length - 1];
    const mid = firstAtLeast(50);
    const high = firstAtLeast(80);

    $('#sciStats').innerHTML = english() ? `
      <div class="sci-stat"><b>${data.totalWords}</b><span>unique Thai words</span></div>
      <div class="sci-stat"><b>${data.totalOcc}</b><span>total occurrences</span></div>
      <div class="sci-stat"><b>${mid.cumWords}</b><span>words cover over half (used ≥${mid.count} times)</span></div>
      <div class="sci-stat"><b>${high.cumWords}</b><span>words cover ${Math.round(high.cumOccPct)}% (used ≥${high.count} times)</span></div>
    ` : `
      <div class="sci-stat"><b>${data.totalWords}</b><span>不重复的泰语词</span></div>
      <div class="sci-stat"><b>${data.totalOcc}</b><span>总出现次数</span></div>
      <div class="sci-stat"><b>${mid.cumWords}</b><span>词，覆盖过半（出现≥${mid.count}次）</span></div>
      <div class="sci-stat"><b>${high.cumWords}</b><span>词，覆盖到 ${Math.round(high.cumOccPct)}%（出现≥${high.count}次）</span></div>
    `;

    const restWords = data.totalWords - high.cumWords;
    const restPct = +(100 - high.cumOccPct).toFixed(0);
    $('#sciExplainNums').innerHTML = english() ? `
      In the current library of ${data.totalWords} Thai words, <b>${mid.cumWords} words used at least ${mid.count} times
      (${mid.cumWordsPct}% of the vocabulary) already cover ${mid.cumOccPct}% of all word occurrences.</b>
      Learning the ${high.cumWords} words used at least ${high.count} times (${high.cumWordsPct}%) raises coverage to ${high.cumOccPct}%.
      The remaining ${restWords} low-frequency words make up ${(100 - high.cumWordsPct).toFixed(0)}% of the vocabulary but add only ${restPct}% coverage.
      This is the <b>Pareto principle (the 80/20 rule)</b>: high-frequency words give the greatest return first.
    ` : `
      具体到库里现在这 ${data.totalWords} 个泰语词：<b>出现 ≥${mid.count} 次的 ${mid.cumWords} 个词
      （占词表 ${mid.cumWordsPct}%）已经覆盖了 ${mid.cumOccPct}% 的用词量</b>；
      再往下学到「出现 ≥${high.count} 次」的 ${high.cumWords} 个词（${high.cumWordsPct}%），
      覆盖率涨到 ${high.cumOccPct}%；但剩下那 ${restWords} 个只出现一两次的词
      （${(100 - high.cumWordsPct).toFixed(0)}% 的词表），只再换来 ${restPct}% 的覆盖率——
      这也是语言学习里常说的<b>帕累托法则（80/20 法则）</b>在起作用：优先学高频词，性价比最高。
    `;
  }

  function renderTable(data) {
    $('#sciThBody').innerHTML = data.thresholds.map((t) => `
      <tr>
        <td class="hl">${t.count}${english() ? ' times' : ' 次'}</td>
        <td>${t.cumWords}${english() ? ' words' : ' 个'}</td>
        <td>${t.cumWordsPct}%</td>
        <td class="hl">${t.cumOccPct}%</td>
      </tr>`).join('');
  }

  /* ════════ 图表 ════════ */

  function renderChart(data) {
    const rows = data.rows;
    const n = rows.length;
    const svg = $('#sciChart');
    svg.innerHTML = '';

    const W = 860, H = 380;
    const PAD = { top: 14, right: 20, bottom: 34, left: 44 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const x = (rank) => PAD.left + ((rank - 1) / (n - 1)) * plotW;
    const y = (pct) => PAD.top + (1 - pct / 100) * plotH;

    function el(tag, attrs) {
      const e = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
      return e;
    }

    // 网格 + y 轴
    [0, 25, 50, 80, 100].forEach((pct) => {
      const yy = y(pct);
      svg.appendChild(el('line', { class: pct === 0 ? 'sci-baseline' : 'sci-gridline', x1: PAD.left, x2: W - PAD.right, y1: yy, y2: yy }));
      const t = el('text', { class: 'sci-axis-label', x: PAD.left - 8, y: yy + 3, 'text-anchor': 'end' });
      t.textContent = pct + '%';
      svg.appendChild(t);
    });

    // x 轴刻度
    [1, Math.round(n * .25), Math.round(n * .5), Math.round(n * .75), n].forEach((rank) => {
      const xx = x(rank);
      const anchor = rank === n ? 'end' : (rank === 1 ? 'start' : 'middle');
      const t = el('text', { class: 'sci-axis-label', x: xx, y: H - PAD.bottom + 18, 'text-anchor': anchor });
      t.textContent = english() ? `Word ${rank}` : `第 ${rank} 词`;
      svg.appendChild(t);
    });
    const xCaption = el('text', { class: 'sci-axis-label', x: PAD.left + plotW / 2, y: H - 4, 'text-anchor': 'middle' });
    xCaption.textContent = english() ? 'Words learned (highest frequency first)' : '学到第几个词（按出现次数从高到低）';
    svg.appendChild(xCaption);

    // 80% 参考线
    const ref80y = y(80);
    svg.appendChild(el('line', { class: 'sci-ref-line', x1: PAD.left, x2: W - PAD.right, y1: ref80y, y2: ref80y }));
    const ref80Label = el('text', { class: 'sci-ref-label', x: W - PAD.right, y: ref80y - 5, 'text-anchor': 'end' });
    ref80Label.textContent = english() ? '80% coverage reference' : '覆盖 80% 参考线';
    svg.appendChild(ref80Label);

    // 面积 + 曲线
    const pathPts = rows.map((r) => `${x(r.rank)},${y(r.cumOccPct)}`).join(' L ');
    svg.appendChild(el('path', { class: 'sci-area-fill', d: `M ${x(1)},${y(0)} L ${pathPts} L ${x(n)},${y(0)} Z` }));
    svg.appendChild(el('path', { class: 'sci-curve-line', d: `M ${pathPts}` }));

    // 标注点：从大到小挑几个有代表性的出现次数门槛
    const distinctCounts = data.thresholds.map((t) => t.count);
    const pick = [];
    [Math.max(2, distinctCounts[Math.floor(distinctCounts.length * 0.35)]), 3, 2, 1].forEach((c) => {
      if (distinctCounts.includes(c) && !pick.includes(c)) pick.push(c);
    });
    pick.slice(0, 4).forEach((c, i) => {
      const t = data.thresholds.find((th) => th.count === c);
      if (!t) return;
      const r = rows[t.cumWords - 1];
      const cx = x(r.rank), cy = y(r.cumOccPct);
      svg.appendChild(el('circle', { class: 'sci-mk-dot', cx, cy, r: 4.5 }));

      const label = english() ? `≥${c} uses · ${t.cumWords} words` : `出现≥${c}次 · ${t.cumWords}词`;
      const sub = english() ? `${t.cumOccPct}% coverage` : `覆盖 ${t.cumOccPct}%`;
      const labelAbove = i % 2 === 0;
      const ly = labelAbove ? cy - 34 : cy + 20;
      const anchor = cx > W - PAD.right - 90 ? 'end' : (cx < PAD.left + 70 ? 'start' : 'middle');
      const lx = anchor === 'end' ? cx + 4 : (anchor === 'start' ? cx - 4 : cx);

      svg.appendChild(el('rect', { class: 'sci-mk-label-bg', x: lx - (anchor === 'end' ? 84 : anchor === 'start' ? 4 : 42), y: ly - 12, width: 88, height: 28, rx: 6 }));
      const t1 = el('text', { class: 'sci-mk-label', x: lx, y: ly, 'text-anchor': anchor });
      t1.textContent = label;
      svg.appendChild(t1);
      const t2 = el('text', { class: 'sci-mk-label-sub', x: lx, y: ly + 12, 'text-anchor': anchor });
      t2.textContent = sub;
      svg.appendChild(t2);
    });

    // hover：十字线 + 圆点 + 提示框
    const crosshair = el('line', { class: 'sci-crosshair', x1: 0, x2: 0, y1: PAD.top, y2: H - PAD.bottom });
    svg.appendChild(crosshair);
    const hoverDot = el('circle', { class: 'sci-hover-dot', r: 4.5 });
    svg.appendChild(hoverDot);
    const hitRect = el('rect', { class: 'sci-hit-rect', x: PAD.left, y: PAD.top, width: plotW, height: plotH });
    svg.appendChild(hitRect);

    const tooltip = $('#sciTooltip');
    const chartPos = $('#sciChartPos');

    function handleMove(evt) {
      const rect = svg.getBoundingClientRect();
      const scale = W / rect.width;
      const px = (evt.clientX - rect.left) * scale;
      const frac = Math.min(1, Math.max(0, (px - PAD.left) / plotW));
      const rank = Math.round(frac * (n - 1)) + 1;
      const r = rows[rank - 1];
      const cx = x(r.rank), cy = y(r.cumOccPct);

      crosshair.setAttribute('x1', cx); crosshair.setAttribute('x2', cx);
      crosshair.style.opacity = 1;
      hoverDot.setAttribute('cx', cx); hoverDot.setAttribute('cy', cy);
      hoverDot.style.opacity = 1;

      const posRect = chartPos.getBoundingClientRect();
      const svgScaleX = rect.width / W;
      const tx = rect.left - posRect.left + cx * svgScaleX;
      const ty = rect.top - posRect.top + cy * svgScaleX * (rect.height / (H * (rect.width / W)));
      tooltip.style.left = Math.min(tx + 14, posRect.width - 190) + 'px';
      tooltip.style.top = Math.max(ty - 60, 4) + 'px';
      tooltip.innerHTML = `<b>${r.cumOccPct}%</b> ${english() ? 'coverage' : '覆盖率'}<br>
        <span class="sci-tt-sub">${english() ? `Word ${r.rank} (${r.count} occurrences)` : `学到第 ${r.rank} 个词（出现 ${r.count} 次）`}</span>
        <div class="sci-tt-word">${esc(r.th)}</div>
        <div class="sci-tt-sub">${esc(meaning(r.mean))}</div>`;
      tooltip.style.opacity = 1;
    }

    hitRect.addEventListener('pointermove', handleMove);
    hitRect.addEventListener('pointerleave', () => {
      crosshair.style.opacity = 0;
      hoverDot.style.opacity = 0;
      tooltip.style.opacity = 0;
    });
  }

  /* ════════ 启动 ════════ */

  function init() {
    WordFreq.build();
    const data = computeCoverage();
    if (!data.totalWords) return;
    renderStats(data);
    renderChart(data);
    renderTable(data);
    const explain = $('.sci-explain p:not(#sciExplainNums)');
    if (explain && english()) explain.innerHTML = `A normal distribution is bell-shaped, with most values in the middle. This curve instead has a <b>steep beginning and a flat long tail</b>. Thai, like most languages, follows <b>Zipf’s law</b>: a small number of common pronouns and function words appear repeatedly, while most words appear only once or twice.`;
    const initialLanguage = window.I18n?.language;
    window.addEventListener('languagechange', (event) => {
      if (event.detail?.language !== initialLanguage) location.reload();
    });
  }

  return { init };
})();
