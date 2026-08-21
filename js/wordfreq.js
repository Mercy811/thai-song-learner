/**
 * WordFreq —— 词频总表
 *
 * 跟 Vocab 一样是从歌词摊出来的，只是不止摊一首：把 window.SONGS 里所有歌的
 * 逐词卡片都摊平、按泰语文本去重、数每个词出现了几次（副歌重复几遍就算几次），
 * 按出现次数从高到低排。用来知道该先学哪些词——最常出现的先学，覆盖面最快。
 *
 * 跟 Vocab 的单词表是两回事：这里不记掌握程度，纯粹是一份「频率参考表」。
 */
window.WordFreq = (() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let words = [];        // { th, ro, cn, mean, lang, count, songIds:[...], lines:[...], no }
  let maxCount = 1;
  let songTitle = {};     // songId -> 中文标题
  let onJump = null;      // 点歌名跳过去，由 app.js 传进来

  const state = { search: '', sort: 'count-desc', songId: '' };

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ════════ 建表：摊平全部歌曲的逐词卡片 ════════ */

  function build() {
    const byTh = new Map();
    songTitle = {};
    Object.values(window.SONGS || {}).forEach((song) => {
      songTitle[song.id] = song.titleCn || song.title || song.id;
      song.sections.forEach((sec) => {
        sec.lines.forEach((line) => {
          (line.words || []).forEach((w) => {
            // 只留泰语词：英文这边只是穿插借用的短语，不是要学的泰语词汇
            if (!w.th || w.lang === 'en') return;
            let e = byTh.get(w.th);
            if (!e) {
              e = {
                th: w.th, ro: w.ro || '', cn: w.cn || '', mean: w.mean || '',
                lang: 'th',
                count: 0, songIds: new Set(), lines: [],
              };
              byTh.set(w.th, e);
            }
            e.count++;
            e.songIds.add(song.id);
            // 同一句里这个词出现两次也只记一遍句子，句子列表是给「在哪句」看的，不是数出现次数
            if (!e.lines.some((l) => l.songId === song.id && l.id === line.id)) {
              e.lines.push({ songId: song.id, id: line.id, th: line.th, cn: line.cn });
            }
          });
        });
      });
    });
    words = [...byTh.values()].sort((a, b) => b.count - a.count || a.th.localeCompare(b.th));
    words.forEach((w, i) => { w.no = i + 1; w.songIds = [...w.songIds]; });
    maxCount = words.length ? words[0].count : 1;
  }

  /* ════════ 排序 / 筛选 ════════ */

  function sortWords(list) {
    const arr = [...list];
    if (state.sort === 'count-asc') arr.sort((a, b) => a.count - b.count || a.no - b.no);
    else if (state.sort === 'alpha') arr.sort((a, b) => a.th.localeCompare(b.th, 'th'));
    else arr.sort((a, b) => b.count - a.count || a.no - b.no);
    return arr;
  }

  function matches(w) {
    if (state.songId && !w.songIds.includes(state.songId)) return false;
    if (!state.search) return true;
    const q = state.search;
    return w.th.toLowerCase().includes(q)
        || w.ro.toLowerCase().includes(q)
        || w.mean.toLowerCase().includes(q);
  }

  /* ════════ 发音 ════════ */

  function speak(text, lang, el) {
    TTS.unlock();
    $$('.speaking').forEach((n) => n.classList.remove('speaking'));
    if (el) el.classList.add('speaking');
    const rate = Math.max(0.4, (parseFloat(localStorage.getItem('tsl.ttsRate')) || 0.7) - 0.05);
    TTS.speak(text, {
      lang: lang === 'en' ? 'en' : 'th',
      rate,
      onend: () => el && el.classList.remove('speaking'),
      onerror: () => el && el.classList.remove('speaking'),
    });
  }

  /* ════════ 渲染 ════════ */

  function rowHtml(w) {
    const barPct = Math.max(4, Math.round((w.count / maxCount) * 100));
    const linesHtml = w.lines.map((l) => `
      <div class="frow-line">
        <button class="frow-line-song" data-song="${esc(l.songId)}" title="跳去《${esc(songTitle[l.songId] || l.songId)}》">${esc(songTitle[l.songId] || l.songId)}</button>
        <div class="frow-line-th">${esc(l.th)}</div>
        ${l.cn ? `<div class="frow-line-cn">${esc(l.cn)}</div>` : ''}
      </div>`).join('');
    return `
      <div class="frow" data-th="${esc(w.th)}">
        <span class="wrow-no">${w.no}</span>
        <div class="wrow-word">
          <button class="wrow-th${w.lang === 'en' ? ' en' : ''}" data-act="speak" title="点一下听发音">${esc(w.th)}</button>
          ${w.ro ? `<span class="wrow-ro">${esc(w.ro)}</span>` : ''}
          ${w.cn ? `<span class="wrow-cn">${esc(w.cn)}</span>` : ''}
        </div>
        <div class="wrow-mean"><span>${esc(w.mean)}</span></div>
        <div class="frow-count">
          <b>${w.count}</b><span> 次</span>
          <div class="frow-bar"><i style="width:${barPct}%"></i></div>
        </div>
        <button class="frow-toggle" data-act="toggle" aria-expanded="false">▸ ${w.lines.length} 句</button>
      </div>
      <div class="frow-lines hidden">${linesHtml}</div>`;
  }

  function render() {
    const list = sortWords(words.filter(matches));
    const root = $('#freqList');
    root.innerHTML = list.length
      ? list.map(rowHtml).join('')
      : `<div class="study-empty">没找到匹配的词，换个关键词试试 🙂</div>`;
    $('#freqListCount').textContent = state.search || state.songId
      ? `找到 ${list.length} / ${words.length} 个词`
      : `${list.length} 个词`;
  }

  function renderHead() {
    const totalOcc = words.reduce((a, w) => a + w.count, 0);
    $('#freqStatWords').textContent = words.length;
    $('#freqStatSongs').textContent = Object.keys(songTitle).length;
    $('#freqStatOcc').textContent = totalOcc;
  }

  function fillSongFilter() {
    const sel = $('#freqSongFilter');
    const ids = Object.keys(songTitle).sort((a, b) => songTitle[a].localeCompare(songTitle[b], 'zh'));
    sel.innerHTML = '<option value="">全部歌曲</option>' +
      ids.map((id) => `<option value="${esc(id)}">${esc(songTitle[id])}</option>`).join('');
    sel.value = state.songId;
  }

  /** 制表符分隔，贴进 Excel / Notion / Anki 都能用 */
  function toTSV() {
    const head = ['#', '泰语', '罗马音', '中文谐音', '意思', '出现次数', '出自'];
    const rows = words.map((w) => [
      w.no, w.th, w.ro, w.cn, w.mean, w.count,
      w.songIds.map((id) => songTitle[id] || id).join('、'),
    ].join('\t'));
    return [head.join('\t'), ...rows].join('\n');
  }

  /* ════════ 事件 ════════ */

  function bind() {
    $('#freqSearch').addEventListener('input', (e) => {
      state.search = e.target.value.trim().toLowerCase();
      render();
    });
    $('#freqSort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
    $('#freqSongFilter').addEventListener('change', (e) => { state.songId = e.target.value; render(); });

    $('#freqList').addEventListener('click', (e) => {
      // 展开面板里点歌名 = 跳去那首歌
      const songBtn = e.target.closest('.frow-line-song');
      if (songBtn) { onJump && onJump(songBtn.dataset.song); return; }

      const row = e.target.closest('.frow');
      if (!row) return;
      const w = words.find((x) => x.th === row.dataset.th);
      if (!w) return;

      const toggle = e.target.closest('[data-act="toggle"]');
      if (toggle) {
        const panel = row.nextElementSibling;
        const open = panel.classList.toggle('hidden') === false;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = `${open ? '▾' : '▸'} ${w.lines.length} 句`;
        return;
      }
      if (e.target.closest('[data-act="speak"]')) {
        speak(w.th, w.lang, e.target.closest('[data-act]'));
        return;
      }
      // 点空白处也念一下，跟单词模式手感一致
      speak(w.th, w.lang, row.querySelector('.wrow-th'));
    });

    $('#freqCopy').addEventListener('click', async () => {
      const tsv = toTSV();
      try {
        await navigator.clipboard.writeText(tsv);
        Study.note ? Study.note('词频表已复制 ✓ 贴进表格就是一张表') : null;
      } catch {
        $('#studyExport').classList.remove('hidden');
        $('#studyExportText').value = tsv;
        $('#studyExportText').select();
      }
    });
  }

  /* ════════ 启动 ════════ */

  function init(jumpToSong) {
    onJump = jumpToSong;
    build();
    fillSongFilter();
    renderHead();
    bind();
    render();
  }

  return { init };
})();
