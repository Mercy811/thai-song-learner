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
  let editingOriginalTh = '';

  const state = { search: '', sort: 'count-desc', songId: '', learned: '' };

  // 「记住了」标记：全站范围，跟哪首歌无关，按泰语文本存
  const LS_LEARNED = 'tsl.freqLearned';
  let learned = new Set();

  function loadLearned() {
    try { learned = new Set(JSON.parse(localStorage.getItem(LS_LEARNED) || '[]')); }
    catch { learned = new Set(); }
  }
  function saveLearned() {
    try { localStorage.setItem(LS_LEARNED, JSON.stringify([...learned])); } catch { /* 无痕模式，存不了就算了 */ }
    if (window.Sync) window.Sync.pushFreqLearned([...learned]);
  }
  function toggleLearned(th) {
    if (learned.has(th)) learned.delete(th); else learned.add(th);
    saveLearned();
  }

  /** 登录用户：跟云端对一次「记住了」标记，逻辑跟 vocab.js 的 syncFromCloud 一样——
      云端有就用云端的（换设备/浏览器登录看到同一份），云端还没有、本地有就当第一次登录，把本地这份传上去。 */
  async function syncLearnedFromCloud() {
    if (!window.Sync || !window.Auth || !window.Auth.isLoggedIn()) return;
    const cloud = await window.Sync.pullFreqLearned();
    if (cloud && cloud.length) {
      learned = new Set(cloud);
      try { localStorage.setItem(LS_LEARNED, JSON.stringify(cloud)); } catch { /* 无痕模式 */ }
      renderHead();
      render();
    } else if (learned.size) {
      window.Sync.pushFreqLearned([...learned]);
    }
  }

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
            const effective = window.WordAdmin ? WordAdmin.apply({ ...w, originalTh: w.th }) : { ...w, originalTh: w.th };
            const groupKey = effective.th;
            let e = byTh.get(groupKey);
            if (!e) {
              e = {
                originalTh: effective.originalTh,
                th: effective.th, ro: effective.ro || '', cn: effective.cn || '', mean: effective.mean || '',
                lang: 'th',
                hidden: !!effective.hidden, overridden: !!effective.overridden,
                count: 0, songIds: new Set(), lines: [],
              };
              byTh.set(groupKey, e);
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
    if (w.hidden && !window.WordAdmin?.isAdmin()) return false;
    if (state.songId && !w.songIds.includes(state.songId)) return false;
    if (state.learned === 'learned' && !learned.has(w.th)) return false;
    if (state.learned === 'unlearned' && learned.has(w.th)) return false;
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
    const english = window.I18n?.language === 'en';
    const barPct = Math.max(4, Math.round((w.count / maxCount) * 100));
    const isLearned = learned.has(w.th);
    const linesHtml = w.lines.map((l) => `
      <div class="frow-line">
        <button class="frow-line-song" data-song="${esc(l.songId)}" title="跳去《${esc(songTitle[l.songId] || l.songId)}》">${esc(songTitle[l.songId] || l.songId)}</button>
        <div class="frow-line-th">${esc(l.th)}</div>
        ${l.cn ? `<div class="frow-line-cn">${esc(window.I18n ? I18n.t(l.cn) : l.cn)}</div>` : ''}
      </div>`).join('');
    return `
      <div class="frow${w.hidden ? ' admin-hidden-word' : ''}"${isLearned ? ' data-learned="1"' : ''} data-th="${esc(w.th)}">
        <span class="wrow-no">${w.no}</span>
        <div class="wrow-word">
          <button class="wrow-th${w.lang === 'en' ? ' en' : ''}" data-act="speak" title="点一下听发音">${esc(w.th)}</button>
          ${w.ro ? `<span class="wrow-ro">${esc(w.ro)}</span>` : ''}
          ${w.cn && !english ? `<span class="wrow-cn">${esc(w.cn)}</span>` : ''}
        </div>
        <div class="wrow-mean"><span>${esc(window.I18n ? I18n.t(w.mean) : w.mean)}</span></div>
        <div class="frow-count">
          <b>${w.count}</b><span> 次</span>
          <div class="frow-bar"><i style="width:${barPct}%"></i></div>
        </div>
        <div class="frow-actions">
          ${window.WordAdmin?.isAdmin() ? `<button class="frow-edit" data-act="edit" title="修改后所有用户都会看到">${w.hidden ? '已隐藏 · 编辑' : '编辑'}</button>` : ''}
          <button class="frow-mark${isLearned ? ' on' : ''}" data-act="mark" aria-pressed="${isLearned}" title="标记这个词记住了没">${isLearned ? '✅ 记住了' : '⬜ 记住'}</button>
          <button class="frow-toggle" data-act="toggle" aria-expanded="false">▸ ${w.lines.length} 句</button>
        </div>
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
    const visible = words.filter((w) => !w.hidden);
    const totalOcc = visible.reduce((a, w) => a + w.count, 0);
    $('#freqStatWords').textContent = visible.length;
    $('#freqStatSongs').textContent = Object.keys(songTitle).length;
    $('#freqStatOcc').textContent = totalOcc;

    const learnedCount = visible.filter((w) => learned.has(w.th)).length;
    const pct = visible.length ? Math.round((learnedCount / visible.length) * 100) : 0;
    $('#freqStatLearned').textContent = learnedCount;
    $('#freqStatTotal').textContent = visible.length;
    $('#freqAdminBadge')?.classList.toggle('hidden', !window.WordAdmin?.isAdmin());
    $('#freqProgressPct').textContent = pct + '%';
    $('#freqProgressFill').style.width = pct + '%';
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
    const rows = words.filter((w) => !w.hidden).map((w) => [
      w.no, w.th, w.ro, w.cn, w.mean, w.count,
      w.songIds.map((id) => songTitle[id] || id).join('、'),
    ].join('\t'));
    return [head.join('\t'), ...rows].join('\n');
  }

  /* ════════ 事件 ════════ */

  function openEditor(w) {
    editingOriginalTh = w.originalTh;
    const original = WordAdmin.get(editingOriginalTh);
    $('#adminOriginalTh').textContent = editingOriginalTh;
    $('#adminWordTh').value = w.th;
    $('#adminWordRo').value = w.ro;
    $('#adminWordCn').value = w.cn;
    $('#adminWordMean').value = w.mean;
    $('#adminWordHidden').checked = !!w.hidden;
    $('#adminWordReset').classList.toggle('hidden', !original);
    $('#adminWordError').textContent = '';
    $('#wordAdminModal').classList.remove('hidden');
    $('#adminWordTh').focus();
  }

  function bind() {
    $('#freqSearch').addEventListener('input', (e) => {
      state.search = e.target.value.trim().toLowerCase();
      render();
    });
    $('#freqSort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
    $('#freqSongFilter').addEventListener('change', (e) => { state.songId = e.target.value; render(); });
    $('#freqLearnedFilter').addEventListener('change', (e) => { state.learned = e.target.value; render(); });

    $('#freqList').addEventListener('click', (e) => {
      // 展开面板里点歌名 = 跳去那首歌
      const songBtn = e.target.closest('.frow-line-song');
      if (songBtn) { onJump && onJump(songBtn.dataset.song); return; }

      const row = e.target.closest('.frow');
      if (!row) return;
      const w = words.find((x) => x.th === row.dataset.th);
      if (!w) return;

      if (e.target.closest('[data-act="edit"]')) { openEditor(w); return; }

      const toggle = e.target.closest('[data-act="toggle"]');
      if (toggle) {
        const panel = row.nextElementSibling;
        const open = panel.classList.toggle('hidden') === false;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = `${open ? '▾' : '▸'} ${w.lines.length} 句`;
        return;
      }
      const markBtn = e.target.closest('[data-act="mark"]');
      if (markBtn) {
        toggleLearned(w.th);
        const nowLearned = learned.has(w.th);
        if (nowLearned) row.dataset.learned = '1'; else delete row.dataset.learned;
        markBtn.classList.toggle('on', nowLearned);
        markBtn.setAttribute('aria-pressed', String(nowLearned));
        markBtn.textContent = nowLearned ? '✅ 记住了' : '⬜ 记住';
        renderHead();
        // 当前筛的是「已记住/没记住」，标记完这行可能不该再留在列表里，重排一下
        if (state.learned) render();
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

    const modal = $('#wordAdminModal');
    modal.querySelector('[data-close]').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    $('#wordAdminForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const button = $('#adminWordSave');
      button.disabled = true;
      $('#adminWordError').textContent = '';
      try {
        await WordAdmin.save(editingOriginalTh, {
          th: $('#adminWordTh').value, ro: $('#adminWordRo').value,
          cn: $('#adminWordCn').value, mean: $('#adminWordMean').value,
          hidden: $('#adminWordHidden').checked,
        });
        modal.classList.add('hidden');
      } catch (err) { $('#adminWordError').textContent = err.message || '保存失败'; }
      finally { button.disabled = false; }
    });
    $('#adminWordReset').addEventListener('click', async () => {
      if (!confirm('恢复成歌曲文件里的原始数据？')) return;
      try { await WordAdmin.reset(editingOriginalTh); modal.classList.add('hidden'); }
      catch (err) { $('#adminWordError').textContent = err.message || '恢复失败'; }
    });
  }

  /* ════════ 启动 ════════ */

  function init(jumpToSong) {
    onJump = jumpToSong;
    loadLearned();
    build();
    fillSongFilter();
    renderHead();
    bind();
    render();
    window.addEventListener('languagechange', () => { fillSongFilter(); render(); });
    syncLearnedFromCloud();   // 异步，不等——先用本地数据把界面画出来，云端数据回来了再补
    if (window.WordAdmin) WordAdmin.onChange(() => {
      build(); fillSongFilter(); renderHead(); render();
    });
  }

  // 登录状态变化（刚登录、换了账号、退出）时，跟云端重新对一次
  if (window.Auth) window.Auth.onChange(() => syncLearnedFromCloud());

  // build/list 单独导出：科普页（Science）要用同一份聚合数据画覆盖率曲线，
  // 不用再摊一遍全部歌曲——但科普页不一定先逛过词频页，所以自己也能单独调 build()
  return { init, build, list: () => words.filter((w) => !w.hidden), songCount: () => Object.keys(songTitle).length };
})();
