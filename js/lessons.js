/**
 * Lessons —— 记忆课：把 window.LESSONS 里的文字内容渲染成可读可听的课程页
 *
 * 每节课是一篇「文章」：讲解段落（中文朗读） + 单词卡片（先读泰语，
 * 紧跟着读中文意思和联想）。点「▶ 朗读整节课」会按顺序把这些片段
 * 拼成一条连续的语音播放列表，正在读的那一段会高亮 + 自动滚动到视野里，
 * 适合洗澡、走路、开车这种不方便看屏幕的场景——听就够了。
 *
 * 进度只记一件事：这节课「听完了 / 手动标了已学完」没有，存在 localStorage，
 * 换设备不会同步，就是个小小的打勾用来提醒自己学到哪了。
 */
window.Lessons = (() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS_DONE = 'tsl.lessonsDone';
  const LS_RATE = 'tsl.ttsRate';

  let lessons = [];
  let done = {};
  let curLesson = null;
  let curIdx = -1;
  let queue = [];          // 播放队列：[{ bi, lang:'zh'|'th', text, isTh? }]
  let playPos = -1;        // 队列里播到第几条了
  let playing = false;

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ════════ 进度存取 ════════ */

  function loadDone() {
    try { done = JSON.parse(localStorage.getItem(LS_DONE) || '{}') || {}; } catch { done = {}; }
  }
  function saveDone() {
    try { localStorage.setItem(LS_DONE, JSON.stringify(done)); } catch { /* 无痕模式存不了就算了 */ }
  }
  function setDone(id, val) {
    if (val) done[id] = true; else delete done[id];
    saveDone();
  }

  function rate() {
    return Math.max(0.4, parseFloat(localStorage.getItem(LS_RATE)) || 0.7);
  }

  /* ════════ 课程列表 ════════ */

  function renderList() {
    const root = $('#lessonGrid');
    if (!root) return;
    const doneCount = lessons.filter((l) => done[l.id]).length;
    $('#lessonProgressText').textContent = doneCount
      ? `已学完 ${doneCount} / ${lessons.length} 课`
      : `共 ${lessons.length} 课，从第一课开始也行，挑感兴趣的先听也行`;
    root.innerHTML = lessons.map((l, i) => `
      <button class="lesson-card${done[l.id] ? ' done' : ''}" data-idx="${i}">
        ${done[l.id] ? '<span class="lesson-card-check">✓</span>' : ''}
        <span class="lesson-card-emoji">${l.emoji}</span>
        <span class="lesson-card-title">${esc(l.title)}</span>
        <span class="lesson-card-sub">${esc(l.subtitle)}</span>
        <span class="lesson-card-meta">🎧 约 ${l.minutes} 分钟</span>
      </button>`).join('');
  }

  /* ════════ 课程详情 ════════ */

  function blockHtml(b, bi) {
    if (b.type === 'p') {
      return `<p class="lesson-p" data-bi="${bi}" data-act="speak-p" title="点一下听这段">${esc(b.text)}</p>`;
    }
    const roLine = b.ro ? `<span class="lesson-word-ro">${esc(b.ro)}</span>` : '';
    const tagLine = b.tag ? `<div class="lesson-word-tag">🎵 出自《${esc(b.tag)}》</div>` : '';
    return `
      <div class="lesson-word" data-bi="${bi}">
        <div class="lesson-word-head">
          <button class="lesson-word-th" data-act="speak-th" data-bi="${bi}" title="点一下听泰语发音">${esc(b.th)}</button>
          ${roLine}
          <span class="lesson-word-cn">${esc(b.cn)}</span>
          <span class="lesson-word-mean">${esc(b.mean)}</span>
        </div>
        <div class="lesson-word-hook">${esc(b.hook)}</div>
        ${tagLine}
      </div>`;
  }

  function renderArticle() {
    const l = curLesson;
    $('#lessonArticleTitle').textContent = `${l.emoji} ${l.title}`;
    $('#lessonArticleSub').textContent = l.subtitle;
    $('#lessonBlocks').innerHTML = l.blocks.map(blockHtml).join('');
    updateDoneBtn();
    buildQueue();
    updatePlayUI();
  }

  function updateDoneBtn() {
    const btn = $('#lessonDoneBtn');
    const isDone = !!done[curLesson.id];
    btn.classList.toggle('on', isDone);
    btn.textContent = isDone ? '✓ 已学完' : '标记为已学完';
  }

  function openLesson(idx) {
    curIdx = idx;
    curLesson = lessons[idx];
    stopPlay();
    $('#lessonList').classList.add('hidden');
    $('#lessonArticle').classList.remove('hidden');
    $('#lessonArticle').scrollIntoView({ block: 'start' });
    renderArticle();
  }

  function closeLesson() {
    stopPlay();
    $('#lessonArticle').classList.add('hidden');
    $('#lessonList').classList.remove('hidden');
    renderList();
  }

  /* ════════ 播放队列：讲解段落整段读，单词卡先读泰语再读中文联想 ════════ */

  function buildQueue() {
    queue = [];
    curLesson.blocks.forEach((b, bi) => {
      if (b.type === 'p') {
        queue.push({ bi, lang: 'zh', text: b.text });
      } else {
        if (b.th) queue.push({ bi, lang: 'th', text: b.th, isTh: true });
        if (b.hook) queue.push({ bi, lang: 'zh', text: b.hook });
      }
    });
    playPos = -1;
  }

  function highlightBlock(bi) {
    $$('.lesson-p.playing, .lesson-word.playing').forEach((el) => el.classList.remove('playing'));
    if (bi == null) return;
    const el = $(`.lesson-p[data-bi="${bi}"], .lesson-word[data-bi="${bi}"]`);
    if (el) {
      el.classList.add('playing');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function updatePlayUI() {
    const btn = $('#lessonPlayBtn');
    btn.textContent = playing ? '⏸ 暂停' : (playPos >= 0 && playPos < queue.length ? '▶ 继续朗读' : '▶ 朗读整节课');
    btn.classList.toggle('on', playing);
    $('#lessonPlayProgress').textContent = (queue.length && playPos >= 0)
      ? `第 ${Math.min(playPos + 1, queue.length)} / ${queue.length} 段`
      : '';
  }

  function playFrom(qIdx) {
    if (qIdx >= queue.length) {
      stopPlay();
      setDone(curLesson.id, true);
      updateDoneBtn();
      renderList();
      return;
    }
    playPos = qIdx;
    const item = queue[qIdx];
    highlightBlock(item.bi);
    updatePlayUI();
    TTS.unlock();
    TTS.speak(item.text, {
      lang: item.lang,
      rate: item.isTh ? Math.max(0.4, rate() - 0.1) : rate(),
      onend: () => { if (playing) playFrom(qIdx + 1); },
      onerror: () => { if (playing) playFrom(qIdx + 1); },
    });
  }

  function startPlay() {
    if (!queue.length) buildQueue();
    playing = true;
    playFrom(playPos >= 0 && playPos < queue.length ? playPos : 0);
  }

  function pausePlay() {
    playing = false;
    TTS.stop();
    updatePlayUI();
  }

  function stopPlay() {
    playing = false;
    TTS.stop();
    playPos = -1;
    highlightBlock(null);
    updatePlayUI();
  }

  function togglePlay() {
    if (playing) pausePlay(); else startPlay();
  }

  /* ════════ 单独点某一段 / 某个词 ════════ */

  function speakOnce(text, lang) {
    playing = false;
    TTS.unlock();
    TTS.speak(text, { lang, rate: lang === 'th' ? Math.max(0.4, rate() - 0.1) : rate() });
  }

  /* ════════ 事件 ════════ */

  function bind() {
    $('#lessonGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.lesson-card');
      if (!card) return;
      openLesson(+card.dataset.idx);
    });

    $('#lessonBack').addEventListener('click', closeLesson);
    $('#lessonPlayBtn').addEventListener('click', togglePlay);
    $('#lessonStopBtn').addEventListener('click', stopPlay);
    $('#lessonDoneBtn').addEventListener('click', () => {
      setDone(curLesson.id, !done[curLesson.id]);
      updateDoneBtn();
    });

    $('#lessonBlocks').addEventListener('click', (e) => {
      const thBtn = e.target.closest('[data-act="speak-th"]');
      if (thBtn) { speakOnce(thBtn.textContent.trim(), 'th'); return; }
      const p = e.target.closest('[data-act="speak-p"]');
      if (p) { speakOnce(p.textContent.trim(), 'zh'); return; }
      const wordCard = e.target.closest('.lesson-word');
      if (wordCard) {
        const hookEl = wordCard.querySelector('.lesson-word-hook');
        if (hookEl) speakOnce(hookEl.textContent.trim(), 'zh');
      }
    });
  }

  /* ════════ 启动 ════════ */

  function init() {
    lessons = window.LESSONS || [];
    loadDone();
    bind();
    renderList();
  }

  return { init };
})();
