/**
 * Lessons —— 记忆课：把 window.LESSONS 里的文字内容渲染成可读可听的课程页
 *
 * 每节课是一篇「文章」：讲解段落（中文朗读） + 单词卡片（先读泰语真人发音，
 * 紧跟着读中文讲解）。点「▶ 朗读整节课」会按顺序把这些片段拼成一条连续的
 * 播放列表，正在读的那一段会高亮 + 自动滚动到视野里，适合洗澡、走路、
 * 开车这种不方便看屏幕的场景——听就够了。
 *
 * 音频不是浏览器现读的机械语音，是提前用 edge-tts（免费、不用 API Key，
 * 调的是 Microsoft Edge 朗读功能背后的神经网络语音）合成好、存在
 * audio/lessons/ 下的真人感语音文件——文字改了要记得重跑一遍
 * scripts/generate-lesson-audio.py。播放器优先放这些文件，万一某个
 * 文件缺失（比如内容刚改还没来得及重新合成），会自动退回浏览器自带的
 * Web Speech API，不会卡住播不出声。
 *
 * 进度只记一件事：这节课「听完了 / 手动标了已学完」没有，存在 localStorage，
 * 换设备不会同步，就是个小小的打勾用来提醒自己学到哪了。
 */
window.Lessons = (() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS_DONE = 'tsl.lessonsDone';
  const LS_RATE = 'tsl.lessonsRate';
  const AUDIO_BASE = 'audio/lessons';

  let lessons = [];
  let done = {};
  let curLesson = null;
  let curIdx = -1;
  let queue = [];          // 播放队列：[{ bi, lang:'zh'|'th', text, kind, src, isTh? }]
  let playPos = -1;        // 队列里播到第几条了
  let loadedIdx = -1;      // player 里当前加载的是队列第几条——跟 playPos 相等时暂停/继续能接着播，不用从头来
  let playing = false;
  const player = new Audio();  // 顺序播放和「点一下听」共用这一个播放器，同一时刻只放一样东西

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
    return Math.max(0.7, Math.min(1.5, parseFloat(localStorage.getItem(LS_RATE)) || 1));
  }
  function saveRate(v) {
    try { localStorage.setItem(LS_RATE, v); } catch { /* 无痕模式存不了就算了 */ }
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
          <button class="lesson-word-th" data-act="speak-th" data-bi="${bi}" title="点一下听泰语真人发音">${esc(b.th)}</button>
          ${roLine}
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

  function audioSrc(lessonId, bi, kind) {
    return `${AUDIO_BASE}/${lessonId}/${bi}-${kind}.mp3`;
  }

  function buildQueue() {
    queue = [];
    curLesson.blocks.forEach((b, bi) => {
      if (b.type === 'p') {
        queue.push({ bi, kind: 'p', lang: 'zh', text: b.text, src: audioSrc(curLesson.id, bi, 'p') });
      } else {
        if (b.th) queue.push({ bi, kind: 'th', lang: 'th', text: b.th, isTh: true, src: audioSrc(curLesson.id, bi, 'th') });
        if (b.hook) queue.push({ bi, kind: 'hook', lang: 'zh', text: b.hook, src: audioSrc(curLesson.id, bi, 'hook') });
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

  /** 真人语音文件放不出来（还没合成、网络问题……）时的兜底：退回浏览器自带朗读 */
  function fallbackSpeak(item, onDone) {
    TTS.unlock();
    TTS.speak(item.text, {
      lang: item.lang,
      rate: item.isTh ? Math.max(0.4, rate() - 0.3) : rate(),
      onend: onDone,
      onerror: onDone,
    });
  }

  function playItem(item, onDone) {
    player.onended = null;
    player.onerror = null;
    player.pause();
    player.onended = onDone || null;
    player.onerror = () => fallbackSpeak(item, onDone);
    // 泰语词卡朗读得比中文讲解慢一点，听清楚每个音；播放速度靠 rate() 调
    player.playbackRate = item.isTh ? Math.max(0.6, rate() - 0.15) : rate();
    player.src = item.src;
    player.currentTime = 0;
    const p = player.play();
    if (p && p.catch) p.catch(() => fallbackSpeak(item, onDone));
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

    // 暂停后原地继续：还是同一段、播放器里也还加载着，直接 play() 接着放，
    // 不用重新加载文件、也不会从这一段的开头重来
    if (loadedIdx === qIdx && player.src.endsWith(item.src)) {
      const p = player.play();
      if (p && p.catch) p.catch(() => fallbackSpeak(item, () => { if (playing) playFrom(qIdx + 1); }));
      return;
    }
    loadedIdx = qIdx;
    playItem(item, () => { if (playing) playFrom(qIdx + 1); });
  }

  function startPlay() {
    if (!queue.length) buildQueue();
    playing = true;
    playFrom(playPos >= 0 && playPos < queue.length ? playPos : 0);
  }

  function pausePlay() {
    playing = false;
    player.pause();
    TTS.stop();
    updatePlayUI();
  }

  function stopPlay() {
    playing = false;
    player.pause();
    player.currentTime = 0;
    TTS.stop();
    playPos = -1;
    loadedIdx = -1;
    highlightBlock(null);
    updatePlayUI();
  }

  function togglePlay() {
    if (playing) pausePlay(); else startPlay();
  }

  /* ════════ 单独点某一段 / 某个词 ════════ */

  function findQueueItem(bi, kind) {
    return queue.find((q) => q.bi === bi && q.kind === kind);
  }

  function speakOnce(item) {
    if (!item) return;
    playing = false;
    loadedIdx = -1;
    playItem(item, null);
    updatePlayUI();
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
      if (thBtn) { speakOnce(findQueueItem(+thBtn.dataset.bi, 'th')); return; }
      const p = e.target.closest('[data-act="speak-p"]');
      if (p) { speakOnce(findQueueItem(+p.dataset.bi, 'p')); return; }
      const wordCard = e.target.closest('.lesson-word');
      if (wordCard) { speakOnce(findQueueItem(+wordCard.dataset.bi, 'hook')); }
    });

    const rateSlider = $('#lessonRate');
    if (rateSlider) {
      rateSlider.value = rate();
      $('#lessonRateVal').textContent = rate().toFixed(2) + '×';
      rateSlider.addEventListener('input', (e) => {
        saveRate(e.target.value);
        $('#lessonRateVal').textContent = rate().toFixed(2) + '×';
        if (playing) player.playbackRate = rate();
      });
    }
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
