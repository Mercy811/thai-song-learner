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
  const LS_STATUS = 'tsl.lessonsWordStatus';
  const LS_FILTER = 'tsl.lessonsPlayFilter';
  const AUDIO_BASE = 'audio/lessons';

  let lessons = [];
  let done = {};
  let wordStatus = {};     // { [lessonId]: { [bi]: 'known' | 'unknown' } } —— 单词卡自己标的「学过 / 没学过」，没标的算未标记
  let playFilter = 'all';  // 'all' | 'known' | 'unknown' —— 「朗读整节课」读哪个范围的词
  let curLesson = null;
  let curIdx = -1;
  let queue = [];          // 完整队列（不受朗读范围筛选）：[{ bi, lang:'zh'|'th', text, kind, src, isTh? }]，点单个词/段落用这个查
  let playQueue = [];      // 朗读整节课实际会顺序播放的子集——按 playFilter 从 queue 里挑出来的
  let playPos = -1;        // playQueue 里播到第几条了
  let loadedIdx = -1;      // player 里当前加载的是 playQueue 第几条——跟 playPos 相等时暂停/继续能接着播，不用从头来
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
    pushProgress();
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

  /* ════════ 单词「学过 / 没学过」状态 ════════ */

  function loadWordStatus() {
    try { wordStatus = JSON.parse(localStorage.getItem(LS_STATUS) || '{}') || {}; } catch { wordStatus = {}; }
  }
  function saveWordStatus() {
    try { localStorage.setItem(LS_STATUS, JSON.stringify(wordStatus)); } catch { /* 无痕模式存不了就算了 */ }
    pushProgress();
  }

  /** 登录了就把「哪几课学完了 + 单词学过/没学过」传一份到云端，异步、不等结果 */
  function pushProgress() {
    if (window.Sync) window.Sync.pushLessonProgress(done, wordStatus);
  }

  /** 登录用户：把课程进度跟云端对一次。
      云端有 → 云端说了算（换设备/浏览器登录进来看到同一份进度）；
      云端还没有、本地倒是有 → 第一次登录，把本地这份传上去。 */
  async function syncProgressFromCloud() {
    if (!window.Sync || !window.Auth || !window.Auth.isLoggedIn()) return;
    const cloud = await window.Sync.pullLessonProgress();
    const cloudHasData = cloud && (Object.keys(cloud.done || {}).length || Object.keys(cloud.word_status || {}).length);
    if (cloudHasData) {
      done = cloud.done || {};
      wordStatus = cloud.word_status || {};
      try {
        localStorage.setItem(LS_DONE, JSON.stringify(done));
        localStorage.setItem(LS_STATUS, JSON.stringify(wordStatus));
      } catch { /* 无痕模式 */ }
      renderList();
      if (curLesson) renderArticle();
    } else if (Object.keys(done).length || Object.keys(wordStatus).length) {
      pushProgress();
    }
  }
  function getWordStatus(bi) {
    return wordStatus[curLesson.id] && wordStatus[curLesson.id][bi];
  }
  /** 点「学过」/「没学过」：再点一下同一个取消，变回未标记 */
  function toggleWordStatus(bi, val) {
    const cur = wordStatus[curLesson.id] || (wordStatus[curLesson.id] = {});
    if (cur[bi] === val) delete cur[bi]; else cur[bi] = val;
    if (!Object.keys(cur).length) delete wordStatus[curLesson.id];
    saveWordStatus();
    refreshWordCard(bi);
    updateStatusSummary();
    if (!playing) buildPlayQueue();
  }

  function loadPlayFilter() {
    const v = localStorage.getItem(LS_FILTER);
    playFilter = (v === 'known' || v === 'unknown') ? v : 'all';
  }
  function savePlayFilter(v) {
    playFilter = (v === 'known' || v === 'unknown') ? v : 'all';
    try { localStorage.setItem(LS_FILTER, playFilter); } catch { /* 无痕模式存不了就算了 */ }
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
    const st = getWordStatus(bi);
    const cardCls = st === 'known' ? ' is-known' : st === 'unknown' ? ' is-unknown' : '';
    return `
      <div class="lesson-word${cardCls}" data-bi="${bi}">
        <div class="lesson-word-head">
          <button class="lesson-word-th" data-act="speak-th" data-bi="${bi}" title="点一下听泰语真人发音">${esc(b.th)}</button>
          ${roLine}
          <span class="lesson-word-mean" data-act="speak-zh" data-bi="${bi}" title="点一下听中文讲解">${esc(b.mean)}</span>
        </div>
        <div class="lesson-word-hook" data-act="speak-zh" data-bi="${bi}" title="点一下听中文讲解">${esc(b.hook)}</div>
        ${tagLine}
        <div class="lesson-word-status">
          <button class="lw-status-btn lw-known${st === 'known' ? ' active' : ''}" data-act="mark-known" data-bi="${bi}" title="标记为已经学过了">✓ 学过</button>
          <button class="lw-status-btn lw-unknown${st === 'unknown' ? ' active' : ''}" data-act="mark-unknown" data-bi="${bi}" title="标记为还没学过">✗ 没学过</button>
        </div>
      </div>`;
  }

  /** 点了「学过/没学过」之后只刷新这一张卡，不动别的（比如正在播的高亮） */
  function refreshWordCard(bi) {
    const card = $(`.lesson-word[data-bi="${bi}"]`);
    if (!card) return;
    const st = getWordStatus(bi);
    card.classList.toggle('is-known', st === 'known');
    card.classList.toggle('is-unknown', st === 'unknown');
    const knownBtn = $('[data-act="mark-known"]', card);
    const unknownBtn = $('[data-act="mark-unknown"]', card);
    if (knownBtn) knownBtn.classList.toggle('active', st === 'known');
    if (unknownBtn) unknownBtn.classList.toggle('active', st === 'unknown');
  }

  function updateStatusSummary() {
    const el = $('#lessonStatusSummary');
    if (!el || !curLesson) return;
    let total = 0, known = 0, unknown = 0;
    curLesson.blocks.forEach((b, bi) => {
      if (b.type !== 'word') return;
      total++;
      const st = getWordStatus(bi);
      if (st === 'known') known++;
      else if (st === 'unknown') unknown++;
    });
    const neutral = total - known - unknown;
    el.textContent = `共 ${total} 个词 · 已学过 ${known} · 没学过 ${unknown}${neutral ? ` · 还没标记 ${neutral}` : ''}`;
  }

  function renderArticle() {
    const l = curLesson;
    $('#lessonArticleTitle').textContent = `${l.emoji} ${l.title}`;
    $('#lessonArticleSub').textContent = l.subtitle;
    $('#lessonBlocks').innerHTML = l.blocks.map(blockHtml).join('');
    updateDoneBtn();
    const filterSel = $('#lessonPlayFilter');
    if (filterSel) filterSel.value = playFilter;
    buildQueue();
    updatePlayUI();
    updateStatusSummary();
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
    buildPlayQueue();
  }

  /** 从完整队列里按 playFilter 挑出「朗读整节课」实际要播的那部分：
   *  选了只读某个范围的词时，讲解段落先跳过，专心过词；单个词点听不受这个筛选影响。 */
  function buildPlayQueue() {
    playQueue = playFilter === 'all'
      ? queue.slice()
      : queue.filter((item) => {
          if (item.kind === 'p') return false;
          const st = getWordStatus(item.bi) || 'unknown';
          return st === playFilter;
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
    const empty = playQueue.length === 0;
    btn.disabled = empty;
    btn.textContent = playing ? '⏸ 暂停' : (playPos >= 0 && playPos < playQueue.length ? '▶ 继续朗读' : '▶ 朗读整节课');
    btn.classList.toggle('on', playing);
    $('#lessonPlayProgress').textContent = empty
      ? '这个范围里没有词，换个朗读范围试试'
      : (playPos >= 0 ? `第 ${Math.min(playPos + 1, playQueue.length)} / ${playQueue.length} 段` : '');
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
    if (qIdx >= playQueue.length) {
      stopPlay();
      // 只读了部分范围（比如「只读没学过的」）不代表整节课都听完了，只有读全部才算学完
      if (playFilter === 'all') {
        setDone(curLesson.id, true);
        updateDoneBtn();
        renderList();
      }
      return;
    }
    playPos = qIdx;
    const item = playQueue[qIdx];
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
    if (!playQueue.length) buildPlayQueue();
    if (!playQueue.length) { updatePlayUI(); return; }
    playing = true;
    playFrom(playPos >= 0 && playPos < playQueue.length ? playPos : 0);
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

  /* ════════ 测验 / 对战：把这节课的词喂给 Study 模块 ════════
     Study/Vocab/Battle 那一整套本来是给「一首歌的单词表」用的，
     字段对上了就能直接拿来用——没必要另外写一遍测验和对战。
     把这节课的词条拼成一个假「歌」：每个词条当一句歌词，
     词条本身的讲解（hook）顶「这句歌词的中文」用，四选一出题、干扰项、
     掌握程度、对战抢答，全部照旧走 Vocab/Battle 原来那套逻辑。 */

  function lessonSong(lesson) {
    const lines = lesson.blocks
      .filter((b) => b.type === 'word')
      .map((b, i) => ({
        id: `${lesson.id}-${i}`,
        th: b.th,
        cn: b.hook || b.mean,
        start: undefined,
        words: [{ th: b.th, ro: b.ro, cn: b.cn, mean: b.mean, lang: 'th' }],
      }));
    return { id: 'lesson-' + lesson.id, timeline: false, sections: [{ name: lesson.title, lines }] };
  }

  function openStudy() {
    if (!curLesson) return;
    stopPlay();
    Study.init(lessonSong(curLesson));
    Study.setActive(true);
    $('#lessonsPageView').classList.add('hidden');
    $('#studyView').classList.remove('hidden');
    $('#studyBackToLesson').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function closeStudy() {
    Study.setActive(false);
    $('#studyView').classList.add('hidden');
    $('#studyBackToLesson').classList.add('hidden');
    $('#lessonsPageView').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
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

  /** 点整张单词卡：先读泰语原音，读完接着读中文讲解，跟顺序播放里同一张卡的顺序一致 */
  function speakSequence(items) {
    items = items.filter(Boolean);
    if (!items.length) return;
    playing = false;
    loadedIdx = -1;
    updatePlayUI();
    const playAt = (i) => { if (i < items.length) playItem(items[i], () => playAt(i + 1)); };
    playAt(0);
  }

  /* ════════ 事件 ════════ */

  function bind() {
    $('#lessonGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.lesson-card');
      if (!card) return;
      openLesson(+card.dataset.idx);
    });

    $('#lessonBack').addEventListener('click', closeLesson);
    $('#lessonQuizBtn').addEventListener('click', openStudy);
    $('#studyBackToLesson').addEventListener('click', closeStudy);
    $('#lessonPlayBtn').addEventListener('click', togglePlay);
    $('#lessonStopBtn').addEventListener('click', stopPlay);
    $('#lessonDoneBtn').addEventListener('click', () => {
      setDone(curLesson.id, !done[curLesson.id]);
      updateDoneBtn();
    });

    $('#lessonBlocks').addEventListener('click', (e) => {
      const statusBtn = e.target.closest('[data-act="mark-known"], [data-act="mark-unknown"]');
      if (statusBtn) {
        toggleWordStatus(+statusBtn.dataset.bi, statusBtn.dataset.act === 'mark-known' ? 'known' : 'unknown');
        return;
      }
      const thBtn = e.target.closest('[data-act="speak-th"]');
      if (thBtn) { speakOnce(findQueueItem(+thBtn.dataset.bi, 'th')); return; }
      const zh = e.target.closest('[data-act="speak-zh"]');
      if (zh) { speakOnce(findQueueItem(+zh.dataset.bi, 'hook')); return; }
      const p = e.target.closest('[data-act="speak-p"]');
      if (p) { speakOnce(findQueueItem(+p.dataset.bi, 'p')); return; }
      const wordCard = e.target.closest('.lesson-word');
      if (wordCard) {
        const bi = +wordCard.dataset.bi;
        speakSequence([findQueueItem(bi, 'th'), findQueueItem(bi, 'hook')]);
      }
    });

    const filterSel = $('#lessonPlayFilter');
    if (filterSel) {
      filterSel.value = playFilter;
      filterSel.addEventListener('change', (e) => {
        savePlayFilter(e.target.value);
        stopPlay();
        buildPlayQueue();
        updatePlayUI();
      });
    }

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
    loadWordStatus();
    loadPlayFilter();
    bind();
    renderList();
    syncProgressFromCloud();   // 异步，不等——先用本地数据把界面画出来，云端数据回来了再补
  }

  // 登录状态变化（刚登录、换了账号、退出）时，跟云端重新对一次
  if (window.Auth) window.Auth.onChange(() => syncProgressFromCloud());

  return { init };
})();
