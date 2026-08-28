/**
 * Study —— 单词模式：单词表 + 四选一测验
 *
 * 三个页面来回切：
 *   单词表  这首歌所有词（从歌词自动摊出来的），每个词一条，右边是掌握程度
 *   测验    一次一张词卡（泰语 + 罗马音），下面四个中文意思，选对选错都记进掌握程度
 *   对战    两个人同时抢答同一道题（比手势或按键盘），那一整块界面归 battle.js 管
 *
 * 数据和算法都在 Vocab 里，这个文件只管画界面和收事件。
 */
window.Study = (() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS_OPTS = 'tsl.study.opts';
  const ROUND = 10;                 // 一轮多少题
  const DAILY_ROUND = 6;
  const LS_DAILY = 'tsl.daily';
  const RECENT = 6;                 // 最近考过的几个词不重复出

  // init() 现在可能被叫不止一次（记忆课那边每换一节课就重新 init 一次
  // 换上那节课的词），事件监听和 Player.tick 订阅只该挂一次，不然会重复触发
  let bound = false;
  let tickWatched = false;
  let dailyInitialized = false;
  let lastActivity = Date.now();
  let dailyPushTimer = null;

  const state = {
    on: false,
    page: 'list',                   // list 单词表 | quiz 一个人测验 | battle 双人对战
    sort: 'song',                   // song 歌词顺序 | weak 最不熟 | freq 出现最多
    filter: 'all',                  // all | todo | done | wrong | new
    mask: false,                    // 遮住意思，自己先想
    showRo: true,
    showCn: false,
    autoSpeak: true,
    quiz: null,
  };

  const ttsRate = () => parseFloat(localStorage.getItem('tsl.ttsRate')) || 0.7;

  const dayKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  function loadDaily() {
    try { return JSON.parse(localStorage.getItem(LS_DAILY) || '{}') || {}; }
    catch { return {}; }
  }
  function saveDaily(days, push = true) {
    try { localStorage.setItem(LS_DAILY, JSON.stringify(days)); } catch { /* 无痕模式 */ }
    if (push && window.Auth?.isLoggedIn() && window.Sync) {
      clearTimeout(dailyPushTimer);
      dailyPushTimer = setTimeout(() => Sync.pushDailyActivity(days), 700);
    }
  }
  function mergeDaily(local, cloud) {
    const merged = { ...local };
    Object.entries(cloud || {}).forEach(([day, remote]) => {
      const here = merged[day] || {};
      merged[day] = {
        ...here, ...remote,
        seconds: Math.max(here.seconds || 0, remote.seconds || 0),
        completed: !!(here.completed || remote.completed),
        completedAt: Math.max(here.completedAt || 0, remote.completedAt || 0) || undefined,
      };
    });
    return merged;
  }
  async function syncDailyFromCloud(user) {
    if (!user || !window.Sync) { renderDaily(); return; }
    const local = loadDaily();
    const cloud = await Sync.pullDailyActivity();
    // 首次登录会把游客期间的本地记录带进账号；已有云端记录则逐日安全合并。
    const merged = mergeDaily(local, cloud || {});
    saveDaily(merged, false);
    await Sync.pushDailyActivity(merged);
    renderDaily();
  }
  function dailyStats() {
    const data = loadDaily();
    const today = dayKey();
    let streak = 0;
    const cursor = new Date();
    if (!data[today]?.completed) cursor.setDate(cursor.getDate() - 1);
    while (data[dayKey(cursor)]?.completed) { streak++; cursor.setDate(cursor.getDate() - 1); }
    let week = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (data[dayKey(d)]?.completed) week++;
    }
    return { data, today, entry: data[today] || {}, streak, week };
  }
  function renderDaily() {
    const d = dailyStats();
    const seconds = d.entry.seconds || 0;
    if ($('#dailyCard')) {
      $('#dailyStreak').textContent = d.streak;
      $('#dailyMinutes').textContent = seconds < 60 ? `${seconds} 秒` : `${Math.max(1, Math.round(seconds / 60))} 分钟`;
      $('#dailyWeek').textContent = `本周 ${d.week} / 7 天`;
      $('#dailyTitle').textContent = d.entry.completed ? '今天已打卡，明天继续！' : '根据已学歌词和掌握程度智能复习';
      $('#dailyStart').textContent = '练习';
      $('#dailyCard').classList.toggle('completed', !!d.entry.completed);
    }
    renderHomeHeatmap(d);
  }
  function renderHomeHeatmap(d) {
    const root = $('#homeHeatmap');
    if (!root) return;
    const seconds = d.entry.seconds || 0;
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const cells = [];
    const monthLabels = [];
    let lastMonth = -1;
    let yearDays = 0;
    let column = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = dayKey(cursor);
      const entry = d.data[key];
      const completed = cursor <= today && !!entry?.completed;
      if (entry?.completed && cursor.getFullYear() === today.getFullYear()) yearDays++;
      if (cursor.getDay() === 0) {
        column++;
        if (cursor.getMonth() !== lastMonth) {
          monthLabels.push(`<span style="grid-column:${column}">${cursor.toLocaleDateString('zh-CN', { month: 'short' })}</span>`);
          lastMonth = cursor.getMonth();
        }
      }
      const future = cursor > today;
      const label = `${key}：${completed ? '已完成' : '未完成'}`;
      cells.push(`<i${completed ? ' data-completed' : ''}${future ? ' data-future' : ''} title="${label}" aria-label="${label}"></i>`);
      cursor.setDate(cursor.getDate() + 1);
    }
    root.innerHTML = cells.join('');
    $('#homeHeatmapMonths').innerHTML = monthLabels.join('');
    $('#homeStreakDays').textContent = d.streak;
    $('#homeYearDays').textContent = yearDays;
    $('#homeTodayTime').textContent = seconds < 60 ? `${seconds} 秒` : `${Math.max(1, Math.round(seconds / 60))} 分钟`;
    $('#homeStreakMessage').textContent = d.entry.completed
      ? `今天已经完成，连续第 ${d.streak} 天！`
      : d.streak ? `连续 ${d.streak} 天，今天也别断掉。` : '今天还没完成，完成今日任务即可打卡。';
    $('#homeDailyStart').textContent = d.entry.completed ? '今天再练一轮 →' : '完成今日任务 →';
  }
  function addStudySecond() {
    if (document.hidden || Date.now() - lastActivity > 60000) return;
    const d = dailyStats();
    const entry = d.data[d.today] || (d.data[d.today] = {});
    entry.seconds = (entry.seconds || 0) + 1;
    entry.updatedAt = Date.now();
    saveDaily(d.data, entry.seconds % 10 === 0);
    if (entry.seconds % 10 === 0) renderDaily();
  }

  /* ── 播放原句要用的东西 ──
     SONG 里每句的 start 摊平存一份，用来算「这句唱到哪儿结束」（= 下一句的开头）。
     没时间轴的歌（timeline: false）这份是空的，🎵 会退回朗读整句。 */
  let hasTimeline = true;
  let lineStarts = [];
  let songId = '';
  let lessonLines = [];
  let lineProgress = new Set();

  const lineProgressKey = () => `tsl.lines.${songId}`;
  function loadLineProgress() {
    try { lineProgress = new Set(JSON.parse(localStorage.getItem(lineProgressKey()) || '[]')); }
    catch { lineProgress = new Set(); }
  }
  function saveLineProgress() {
    try { localStorage.setItem(lineProgressKey(), JSON.stringify([...lineProgress])); } catch { /* 无痕模式 */ }
  }

  function lineEndOf(idx) {
    const next = lineStarts[idx + 1];
    if (typeof next === 'number') return next;
    const d = Player.getDuration();
    const start = lineStarts[idx] || 0;
    return d > 0 ? Math.min(start + 8, d) : start + 8;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const isEnglishUi = () => window.I18n?.language === 'en';
  const lyricMeaning = (line) => {
    if (!isEnglishUi()) return line.cn || '';
    return line.cnEn || (window.I18n ? I18n.t(line.cn || '') : line.cn || '');
  };
  const showMeaningLabel = () => isEnglishUi() ? 'Show lyric meaning' : '显示歌词意思';
  const hideMeaningLabel = () => isEnglishUi() ? 'Hide lyric meaning' : '隐藏歌词意思';

  function loadOpts() {
    try {
      Object.assign(state, JSON.parse(localStorage.getItem(LS_OPTS) || '{}'));
    } catch { /* 存坏了就用默认值 */ }
    state.on = false;
    state.page = 'list';
    state.quiz = null;
  }
  function saveOpts() {
    const { sort, filter, mask, showRo, showCn, autoSpeak } = state;
    try {
      localStorage.setItem(LS_OPTS, JSON.stringify({ sort, filter, mask, showRo, showCn, autoSpeak }));
    } catch { /* 无痕模式 */ }
  }

  function speak(text, lang, el) {
    TTS.unlock();
    $$('.speaking').forEach((n) => n.classList.remove('speaking'));
    if (el) el.classList.add('speaking');
    TTS.speak(text, {
      lang: lang === 'en' ? 'en' : 'th',
      rate: Math.max(0.4, ttsRate() - 0.05),
      onend: () => el && el.classList.remove('speaking'),
      onerror: () => el && el.classList.remove('speaking'),
    });
  }

  /* ── 播放原句 ──
     跟练习模式的「▶ 原曲」一样直接放原曲，只是放到这句结束就停下 ——
     单词表这边没有歌词跟着滚，让它一路放下去只会吵。
     Player 只有 on 没有 off，所以固定挂一个 tick，靠 playUntil 决定要不要收。 */
  let playUntil = null;
  let playingRow = null;
  let sentenceDrag = null;
  let suppressSentenceClick = false;

  function stopLinePlay(alsoPause) {
    playUntil = null;
    if (alsoPause) Player.pause();
    if (playingRow) { playingRow.classList.remove('playing'); playingRow = null; }
  }

  function playLine(w, btn) {
    const line = w.lines[0];
    // 三种情况放不出原句，都退回朗读整句（就是练习模式那个「🔊 整句」）：
    //   没时间轴的歌 / 这句没标 start / YouTube 还没加载好（网差或被挡）
    // 最后这条尤其要挡：不挡的话点了没声音，那一行还一直亮着停不下来。
    if (!hasTimeline || typeof line.start !== 'number' || !Player.isReady()) {
      speak(line.th, w.lang, btn);
      return;
    }
    stopLinePlay(false);
    TTS.stop();                       // 别跟正在念的词撞车
    playingRow = btn && btn.closest('.wrow');
    if (playingRow) playingRow.classList.add('playing');
    playUntil = lineEndOf(line.idx);
    Player.seek(line.start, true);
  }

  function watchLineEnd() {
    if (tickWatched) return;
    tickWatched = true;
    Player.on('tick', (t) => {
      if (playUntil === null) return;
      if (t >= playUntil) stopLinePlay(true);          // 唱完这句，收
      else if (t < playUntil - 30) stopLinePlay(false); // 被别处拖走了，别再管
    });
  }

  /* ════════ 顶部总览 ════════ */

  function renderHead() {
    const s = Vocab.summary();
    $('#studyStatMastered').textContent = s.mastered;
    $('#studyStatTotal').textContent = s.total;
    $('#studyStatPct').textContent = Math.round(s.progress * 100) + '%';
    $('#studyStatAcc').textContent = s.right + s.wrong
      ? `${Math.round(s.accuracy * 100)}%（答对 ${s.right} · 答错 ${s.wrong}）`
      : '还没开始测验';

    // 六段进度条：每一段是这个级别有多少词
    $('#studyBar').innerHTML = s.byLevel.map((n, lv) =>
      n ? `<i data-lv="${lv}" style="flex:${n}" title="${esc(Vocab.LEVELS[lv])} ${n} 个"></i>` : ''
    ).join('');

    $('#studyLegend').innerHTML = s.byLevel.map((n, lv) =>
      `<span class="lg${n ? '' : ' off'}"><i data-lv="${lv}"></i>${esc(lv === 0 ? '生疏 / 没学过' : Vocab.LEVELS[lv])} ${n}</span>`
    ).join('');

    renderLineJourney();
  }

  function renderLineJourney() {
    const root = $('#lineJourney');
    if (!root || !lessonLines.length) return;
    const done = lessonLines.filter((line) => lineProgress.has(line.idx)).length;
    const pct = Math.round(done / lessonLines.length * 100);
    const next = lessonLines.find((line) => !lineProgress.has(line.idx));
    root.innerHTML = `
      <div class="journey-head">
        <div><b>歌词闯关</b><span>按时间顺序，一句一句学</span></div>
        <strong>${done} / ${lessonLines.length} 句 · ${pct}%</strong>
      </div>
      <div class="journey-track" style="--journey:${pct}%"><i></i></div>
      <div class="journey-nodes">
        ${lessonLines.map((line) => `<button class="journey-node${lineProgress.has(line.idx) ? ' done' : line === next ? ' current' : ''}" data-line="${line.idx}" title="第 ${line.idx + 1} 句：${esc(line.th)}"><span>${lineProgress.has(line.idx) ? '★' : line.idx + 1}</span></button>`).join('')}
      </div>`;
  }

  /* ════════ 单词表 ════════ */

  function sortedWords() {
    const list = Vocab.list().filter((w) => {
      const st = Vocab.stat(w.th);
      const tried = st.r + st.w;
      if (state.filter === 'todo')  return st.lv < Vocab.MAX_LV;
      if (state.filter === 'done')  return st.lv === Vocab.MAX_LV;
      if (state.filter === 'wrong') return st.w > 0;
      if (state.filter === 'new')   return tried === 0 && st.lv === 0;
      return true;
    });
    const by = {
      song: (a, b) => a.no - b.no,
      weak: (a, b) => Vocab.stat(a.th).lv - Vocab.stat(b.th).lv || a.no - b.no,
      freq: (a, b) => b.count - a.count || a.no - b.no,
    };
    return list.sort(by[state.sort] || by.song);
  }

  function dotsHtml(lv) {
    let h = '';
    for (let i = 1; i <= Vocab.MAX_LV; i++) h += `<i class="${i <= lv ? 'on' : ''}"></i>`;
    return `<span class="lvdots" data-lv="${lv}">${h}</span>`;
  }

  function rowHtml(w) {
    const st = Vocab.stat(w.th);
    const tried = st.r + st.w;
    const first = w.lines[0];
    const hintLines = w.lines.filter((line, i, lines) =>
      lines.findIndex((other) => other.th === line.th && other.ro === line.ro && other.cn === line.cn) === i
    );
    return `
      <div class="wrow" data-th="${esc(w.th)}" data-lv="${st.lv}">
        <span class="wrow-no">${w.no}</span>
        <div class="wrow-word">
          <button class="wrow-th${w.lang === 'en' ? ' en' : ''}" data-act="speak" title="点一下听发音">${esc(w.th)}</button>
          ${w.ro ? `<span class="wrow-ro">${esc(w.ro)}</span>` : ''}
          ${w.cn ? `<span class="wrow-cn">${esc(w.cn)}</span>` : ''}
        </div>
        <div class="wrow-mean${state.mask ? ' masked' : ''}" data-act="reveal" title="${state.mask ? '点一下看答案' : ''}">
          <span>${esc(w.mean)}</span>
        </div>
        <div class="wrow-lv">
          ${dotsHtml(st.lv)}
          <span class="lvname">${esc(Vocab.levelLabel(w.th))}</span>
          <span class="lvstat">${tried ? `✓${st.r} ✗${st.w}` : `第 ${first.idx + 1} 句${w.count > 1 ? ` · ${w.count} 次` : ''}`}</span>
        </div>
        <div class="wrow-tools">
          <button class="wbtn" data-act="hint" aria-expanded="false" title="显示这个词在歌曲中出现的原句">提示</button>
          <button class="wbtn" data-act="goto" title="放这个词所在的原句（唱完这句自动停）">🎵</button>
          <button class="wbtn" data-act="jump" title="到歌词里看这个词在哪句">📖</button>
          <button class="wbtn" data-act="known" title="我已经会了，直接标满">✓</button>
          <button class="wbtn" data-act="relearn" title="清掉这个词的进度，重新学">↺</button>
        </div>
        <div class="wrow-hint hidden">
          ${hintLines.map((line) => `
            <div class="wrow-hint-line">
              <div class="wrow-hint-source">${esc(line.th)}</div>
              ${line.ro ? `<div class="wrow-hint-ro">${esc(line.ro)}</div>` : ''}
              ${line.cn ? `<div class="wrow-hint-cn hidden">${esc(lyricMeaning(line))}</div>` : ''}
            </div>`).join('')}
          ${hintLines.some((line) => line.cn) ? `<button class="wbtn wrow-hint-cn-toggle" data-act="hint-cn" aria-expanded="false">${showMeaningLabel()}</button>` : ''}
        </div>
      </div>`;
  }

  function renderList() {
    const list = sortedWords();
    const root = $('#wordList');
    root.innerHTML = list.length
      ? list.map(rowHtml).join('')
      : `<div class="study-empty">这个筛选下没有词。换一个筛选看看 🙂</div>`;
    $('#wordListCount').textContent = `${list.length} 个词`;
    $('#studySort').value = state.sort;
    $('#studyFilter').value = state.filter;
    $('#studyMask').checked = state.mask;
    renderHead();
  }

  /* ════════ 测验 ════════ */

  function startRound(daily = false) {
    const firstIncomplete = lessonLines.find((line) => !lineProgress.has(line.idx)) || lessonLines[0];
    if (!firstIncomplete) return note('这首歌还没有可学习的逐词歌词');
    startLine(firstIncomplete.idx, daily);
  }

  function learnedWordPool() {
    const seen = new Set();
    const pool = [];
    lessonLines.filter((line) => lineProgress.has(line.idx)).forEach((line) => {
      line.words.forEach((raw) => {
        const word = Vocab.get(raw.th);
        if (!word?.mean || seen.has(word.th)) return;
        seen.add(word.th);
        pool.push(word);
      });
    });
    return pool;
  }

  function pickPracticeWord(pool, recent) {
    const available = pool.filter((word) => !recent.includes(word.th));
    const choices = available.length ? available : pool;
    const weights = choices.map((word) => {
      const st = Vocab.stat(word.th);
      let weight = Math.pow(Vocab.MAX_LV + 1 - st.lv, 2);
      if (st.r + st.w === 0) weight *= 1.3;
      if (st.w > 0 && st.streak === 0) weight *= 1.55;
      return weight;
    });
    let cursor = Math.random() * weights.reduce((sum, weight) => sum + weight, 0);
    for (let i = 0; i < choices.length; i++) {
      cursor -= weights[i];
      if (cursor <= 0) return choices[i];
    }
    return choices[choices.length - 1];
  }

  function makePracticeQuestion(word, pool) {
    const learnedMeans = [...new Set(pool.map((item) => item.mean).filter((mean) => mean && mean !== word.mean))];
    for (let i = learnedMeans.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [learnedMeans[i], learnedMeans[j]] = [learnedMeans[j], learnedMeans[i]];
    }
    const wrong = learnedMeans.slice(0, 3);
    Vocab.distractorsFor(word).forEach((mean) => {
      if (wrong.length < 3 && mean !== word.mean && !wrong.includes(mean)) wrong.push(mean);
    });
    const options = [word.mean, ...wrong];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { word, answer: word.mean, options };
  }

  function practiceLineFor(word) {
    const source = word.lines.find((line) => lineProgress.has(line.idx)) || word.lines[0];
    return lessonLines.find((line) => line.idx === source?.idx) || source;
  }

  function hintLinesFor(word, quiz = state.quiz) {
    if (quiz?.kind !== 'practice') return word.lines;
    const learned = word.lines.filter((line) => lineProgress.has(line.idx));
    return learned.length ? learned : word.lines.slice(0, 1);
  }

  function startPractice(daily = true) {
    const pool = learnedWordPool();
    if (!pool.length) return note('先按顺序学完至少一句歌词，再来练习');
    state.quiz = {
      kind: 'practice', phase: 'words', step: 0, total: ROUND, daily,
      right: 0, wrong: 0, streak: 0, best: 0, q: null, answered: false,
      missed: [], recent: [], pool, currentLine: null,
    };
    state.page = 'quiz';
    applyPage();
    window.scrollTo({ top: 0, behavior: 'auto' });
    nextQuestion();
  }

  function startLine(lineIdx, daily = false) {
    const line = lessonLines.find((item) => item.idx === lineIdx);
    if (!line) return;
    const words = line.words.map((raw) => Vocab.get(raw.th)).filter((w) => w && w.mean);
    state.quiz = { kind: 'ordered', step: 0, total: words.length, daily, right: 0, wrong: 0, streak: 0, best: 0, q: null, answered: false, missed: [], line, words, phase: 'words', placed: [], bank: [] };
    state.page = 'quiz';
    applyPage();
    window.scrollTo({ top: 0, behavior: 'auto' });
    nextQuestion();
  }

  function nextQuestion() {
    const q = state.quiz;
    if (q.step >= q.total) return q.kind === 'practice' ? finishPracticeRound() : startSentence();
    if (q.kind === 'practice') {
      const word = pickPracticeWord(q.pool, q.recent);
      if (!word) return finishPracticeRound();
      q.recent = [word.th, ...q.recent].slice(0, Math.min(RECENT, Math.max(0, q.pool.length - 1)));
      q.currentLine = practiceLineFor(word);
      q.q = makePracticeQuestion(word, q.pool);
    } else {
      const word = q.words[q.step];
      if (!word) return startSentence();
      q.q = Vocab.makeQuestion(word.th);
    }
    q.answered = false;
    q.step++;

    renderQuestion();
    if (state.autoSpeak) setTimeout(() => speak(q.q.word.th, q.q.word.lang, $('#quizSpeak')), 220);
  }

  function renderQuestion() {
    const { q } = state.quiz;
    const w = q.word;
    const st = Vocab.stat(w.th);

    $('#quizDone').classList.add('hidden');
    $('#sentenceCard').classList.add('hidden');
    $('#quizCard').classList.remove('hidden');
    renderQuizProgress();
    $('#quizRight').textContent = state.quiz.right;
    $('#quizWrong').textContent = state.quiz.wrong;
    $('#quizStreak').textContent = state.quiz.streak;

    $('#quizTh').textContent = w.th;
    $('#quizTh').classList.toggle('en', w.lang === 'en');
    $('#quizRo').textContent = w.ro || '';
    $('#quizCn').textContent = w.cn || '';
    $('#quizRo').classList.toggle('hidden', !state.showRo || !w.ro);
    $('#quizCn').classList.toggle('hidden', !state.showCn || !w.cn);
    $('#quizLv').innerHTML = `${dotsHtml(st.lv)}<span>${esc(Vocab.levelLabel(w.th))}</span>`;

    // 提示每道题都重新收起：先只给原歌词，需要时再单独显示中文歌词。
    const hintLines = hintLinesFor(w, state.quiz).filter((line, i, lines) =>
      lines.findIndex((other) => other.th === line.th && other.ro === line.ro && other.cn === line.cn) === i
    );
    $('#quizHintLines').innerHTML = hintLines.map((line) => `
      <div class="quiz-hint-line">
        <div class="quiz-hint-source">${esc(line.th)}</div>
        ${line.ro ? `<div class="quiz-hint-ro">${esc(line.ro)}</div>` : ''}
        ${line.cn ? `<div class="quiz-hint-cn hidden">${esc(lyricMeaning(line))}</div>` : ''}
      </div>`).join('');
    $('#quizHint').classList.add('hidden');
    $('#quizHintToggle').textContent = '💡 提示';
    $('#quizHintToggle').setAttribute('aria-expanded', 'false');
    const hasChineseHint = hintLines.some((line) => line.cn);
    $('#quizHintCnToggle').classList.toggle('hidden', !hasChineseHint);
    $('#quizHintCnToggle').textContent = showMeaningLabel();
    $('#quizHintCnToggle').setAttribute('aria-expanded', 'false');

    $('#quizOpts').innerHTML = q.options.map((m, i) =>
      `<button class="qopt" data-mean="${esc(m)}"><b>${i + 1}</b><span>${esc(m)}</span></button>`
    ).join('');

    $('#quizFeedback').className = 'quiz-feedback hidden';
    $('#quizFeedback').innerHTML = '';
    $('#quizNext').classList.add('hidden');
    $('#quizNext').textContent = state.quiz.step === state.quiz.total
      ? (state.quiz.kind === 'practice' ? '查看练习结果 →' : '组装这句话 →')
      : '下一个词 →';
    renderStudyHint();
  }

  function answer(mean, btn) {
    const q = state.quiz;
    if (q.answered || !q.q) return;
    q.answered = true;

    const w = q.q.word;
    const ok = mean === q.q.answer;
    const st = Vocab.record(w.th, ok);

    if (ok) { q.right++; q.streak++; q.best = Math.max(q.best, q.streak); }
    else { q.wrong++; q.streak = 0; q.missed.push(w); }

    $$('#quizOpts .qopt').forEach((b) => {
      b.disabled = true;
      if (b.dataset.mean === q.q.answer) b.classList.add('right');
    });
    if (!ok && btn) btn.classList.add('wrong');

    $('#quizRight').textContent = q.right;
    $('#quizWrong').textContent = q.wrong;
    $('#quizStreak').textContent = q.streak;

    // 答完显示正在学习的歌词句，所有词完成后进入组句题。
    const line = q.kind === 'practice' ? q.currentLine : q.line;
    const fb = $('#quizFeedback');
    fb.className = 'quiz-feedback ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = `
      <div class="fb-head">${ok ? '✓ 对了' : `✗ 是「${esc(q.q.answer)}」`}
        <span class="fb-lv">${esc(Vocab.levelLabel(w.th))}${ok ? ' ↑' : ' ↓'}</span>
      </div>
      <div class="fb-line">
        <span class="fb-no">第 ${line.idx + 1} 句</span>
        <b>${esc(line.th)}</b>
        <span class="fb-cn">${esc(line.cn)}</span>
      </div>`;
    $('#quizNext').classList.remove('hidden');
    $('#quizNext').focus();     // 对错都停在这儿等人点「下一题」，顺手能直接敲回车
  }

  function startSentence() {
    const q = state.quiz;
    $('#quizCard').classList.add('hidden');
    $('#quizDone').classList.add('hidden');
    $('#sentenceCard').classList.remove('hidden');
    q.phase = 'sentence';
    q.placed = [];
    q.bank = q.line.words.map((word, i) => ({ ...word, tokenId: i }));
    for (let i = q.bank.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q.bank[i], q.bank[j]] = [q.bank[j], q.bank[i]];
    }
    if (q.bank.length > 1 && q.bank.every((word, i) => word.tokenId === i)) q.bank.reverse();
    renderQuizProgress();
    $('#sentenceMeaning').textContent = lyricMeaning(q.line);
    $('#sentenceCheck').dataset.done = '';
    $('#sentenceCheck').textContent = '检查答案';
    $('#sentenceFeedback').className = 'sentence-feedback hidden';
    renderSentence();
    renderStudyHint();
  }

  function renderQuizProgress() {
    const q = state.quiz;
    if (!q) return;
    if (q.kind === 'practice') {
      $('#quizProgress').innerHTML = isEnglishUi()
        ? `Adaptive practice · <b>${q.step}</b> of ${q.total}`
        : `智能练习 · 第 <b>${q.step}</b> / ${q.total} 题`;
    } else {
      $('#quizProgress').innerHTML = isEnglishUi()
        ? `Word <b>${q.step}</b> of ${q.total} · Lyric line ${q.line.idx + 1}`
        : `第 <b>${q.step}</b> / ${q.total} 词 · 歌词第 ${q.line.idx + 1} 句`;
    }
  }

  function renderSentence() {
    const q = state.quiz;
    const token = (word, where) => `<button class="sentence-token" data-token="${word.tokenId}" data-where="${where}"><b>${esc(word.th)}</b>${state.showRo && word.ro ? `<small>${esc(word.ro)}</small>` : ''}</button>`;
    $('#sentenceAnswer').innerHTML = q.placed.length ? q.placed.map((w) => token(w, 'answer')).join('') : '<span>点击下面的词，组成完整歌词</span>';
    $('#sentenceBank').innerHTML = q.bank.map((w) => token(w, 'bank')).join('');
  }

  function beginSentenceDrag(e) {
    const token = e.target.closest('.sentence-token[data-where="answer"]');
    if (!token || e.button !== 0 || $('#sentenceCheck').dataset.done === '1') return;
    sentenceDrag = {
      token, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, active: false,
    };
    token.setPointerCapture?.(e.pointerId);
  }

  function moveSentenceDrag(e) {
    const drag = sentenceDrag;
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (!drag.active && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 7) return;
    if (!drag.active) {
      drag.active = true;
      suppressSentenceClick = true;
      drag.token.classList.add('dragging');
      $('#sentenceAnswer').classList.add('drag-active');
    }
    e.preventDefault();
    const answer = $('#sentenceAnswer');
    const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('.sentence-token[data-where="answer"]');
    if (hit && hit !== drag.token && answer.contains(hit)) {
      const rect = hit.getBoundingClientRect();
      const sameRow = e.clientY >= rect.top && e.clientY <= rect.bottom;
      const before = e.clientY < rect.top + rect.height / 2 || (sameRow && e.clientX < rect.left + rect.width / 2);
      answer.insertBefore(drag.token, before ? hit : hit.nextSibling);
    } else if (document.elementFromPoint(e.clientX, e.clientY) === answer) {
      answer.appendChild(drag.token);
    }
  }

  function endSentenceDrag(e) {
    const drag = sentenceDrag;
    if (!drag || e.pointerId !== drag.pointerId) return;
    sentenceDrag = null;
    drag.token.releasePointerCapture?.(e.pointerId);
    drag.token.classList.remove('dragging');
    $('#sentenceAnswer').classList.remove('drag-active');
    if (!drag.active) return;
    const order = [...$('#sentenceAnswer').querySelectorAll('.sentence-token')].map((token) => Number(token.dataset.token));
    const byId = new Map(state.quiz.placed.map((word) => [word.tokenId, word]));
    state.quiz.placed = order.map((id) => byId.get(id)).filter(Boolean);
    $('#sentenceFeedback').className = 'sentence-feedback hidden';
    renderSentence();
    setTimeout(() => { suppressSentenceClick = false; }, 80);
  }

  function checkSentence() {
    const q = state.quiz;
    if (q.placed.length !== q.line.words.length) return note('先把所有词放进句子里');
    const ok = q.placed.every((word, i) => word.th === q.line.words[i].th);
    const fb = $('#sentenceFeedback');
    fb.className = `sentence-feedback ${ok ? 'ok' : 'bad'}`;
    if (!ok) {
      fb.textContent = '顺序还不对，再试一次。提示：可以点击上面的词撤回。';
      return;
    }
    fb.innerHTML = `<b>★ 完成第 ${q.line.idx + 1} 句！</b><span>${esc(q.line.th)}</span>`;
    lineProgress.add(q.line.idx);
    saveLineProgress();
    $('#sentenceCheck').textContent = '继续下一句 →';
    $('#sentenceCheck').dataset.done = '1';
    renderLineJourney();
  }

  function finishRound() {
    const q = state.quiz;
    const pct = q.step ? Math.round((q.right / q.step) * 100) : 0;
    $('#sentenceCard').classList.add('hidden');
    $('#quizCard').classList.add('hidden');
    $('#quizDone').classList.remove('hidden');
    if (q.daily) {
      const d = dailyStats();
      const entry = d.data[d.today] || (d.data[d.today] = {});
      Object.assign(entry, { completed: true, completedAt: Date.now(), right: q.right, total: q.step });
      saveDaily(d.data);
    }
    $('#quizDone').innerHTML = `
      ${q.daily ? '<div class="qd-daily">🔥 今日任务完成，打卡成功</div>' : ''}
      <div class="qd-score">★</div>
      <div class="qd-word">第 ${q.line.idx + 1} 句已完成 · 单词正确率 ${pct}%</div>
      <div class="qd-clean">${esc(q.line.th)}<br>${esc(lyricMeaning(q.line))}</div>
      <div class="qd-actions">
        <button class="btn primary" id="quizAgain">学习下一句</button>
        <button class="btn ghost" id="quizToList">看单词表</button>
      </div>`;
    renderHead();
    renderDaily();
  }

  function finishPracticeRound() {
    const q = state.quiz;
    const pct = q.step ? Math.round(q.right / q.step * 100) : 0;
    $('#sentenceCard').classList.add('hidden');
    $('#quizCard').classList.add('hidden');
    $('#quizDone').classList.remove('hidden');
    if (q.daily) {
      const d = dailyStats();
      const entry = d.data[d.today] || (d.data[d.today] = {});
      Object.assign(entry, { completed: true, completedAt: Date.now(), right: q.right, total: q.step });
      saveDaily(d.data);
    }
    const missed = [...new Map(q.missed.map((word) => [word.th, word])).values()];
    $('#quizDone').innerHTML = `
      ${q.daily ? '<div class="qd-daily">🔥 今日任务完成，打卡成功</div>' : ''}
      <div class="qd-score"><b>${q.right}</b> / ${q.step}</div>
      <div class="qd-word">智能练习完成 · 正确率 ${pct}%${q.best > 1 ? ` · 最高连对 ${q.best}` : ''}</div>
      ${missed.length ? `<div class="qd-missed">
        <div class="qd-missed-h">这轮需要加强的词</div>
        ${missed.map((word) => `<div class="qd-miss" data-th="${esc(word.th)}">
          <button class="qd-miss-th" data-act="speak">${esc(word.th)}</button>
          <span class="qd-miss-ro">${esc(word.ro)}</span>
          <span class="qd-miss-mean">${esc(word.mean)}</span>
        </div>`).join('')}
      </div>` : '<div class="qd-clean">这轮全部答对了 🎉</div>'}
      <div class="qd-actions">
        <button class="btn primary" id="quizAgain">再练一轮</button>
        <button class="btn ghost" id="quizToList">看单词表</button>
      </div>`;
    renderHead();
    renderDaily();
    renderStudyHint();
  }

  /* ════════ 页面切换 ════════ */

  function applyPage() {
    const quiz = state.page === 'quiz';
    const battle = state.page === 'battle';
    const solo = !quiz && !battle;
    // 做题时把上面那块总览收起来：屏幕全留给词卡和四个选项，不用往下滚
    $('#studyHead').classList.toggle('hidden', !solo);
    $('#studyList').classList.toggle('hidden', !solo);
    $('#studyQuiz').classList.toggle('hidden', !quiz);
    $('#studyBattle').classList.toggle('hidden', !battle);
    if (!quiz) $('#sentenceCard').classList.add('hidden');
    renderStudyHint();
    // 对战自己管自己那一块界面，这里只负责把它叫起来 / 收干净
    if (battle) Battle.open(); else Battle.close();
    if (solo) renderList();
  }

  function renderStudyHint() {
    const quiz = state.page === 'quiz';
    const battle = state.page === 'battle';
    if (quiz && state.quiz?.phase === 'sentence') {
      $('#studyHint').innerHTML = isEnglishUi()
        ? 'Drag placed words to reorder · Tap to move one back · <kbd>Enter</kbd> check'
        : '拖动已放入的词调整顺序 · 点击可撤回 · <kbd>Enter</kbd> 检查';
    } else if (quiz && state.quiz?.kind === 'practice') {
      $('#studyHint').innerHTML = isEnglishUi()
        ? 'Questions adapt to mastery using words from completed lyric lines · <kbd>1</kbd>–<kbd>4</kbd> answer'
        : '只练已完成歌词中的词，并根据掌握程度动态出题 · <kbd>1</kbd>–<kbd>4</kbd> 选答案';
    } else if (quiz) {
      $('#studyHint').innerHTML = isEnglishUi()
        ? 'Shortcuts: <kbd>1</kbd>–<kbd>4</kbd> answer · <kbd>Enter</kbd> next · <kbd>Esc</kbd> vocabulary'
        : '快捷键：<kbd>1</kbd>–<kbd>4</kbd> 选答案 · <kbd>Enter</kbd> 下一个 · <kbd>Esc</kbd> 回单词表';
    } else if (battle) {
      $('#studyHint').textContent = isEnglishUi()
        ? 'Both players answer at once with gestures or keyboard (1234 / 7890); the first correct answer scores.'
        : '一道题出来两个人同时抢：比手势或者按键盘（1234 / 7890），先答对的当场加一分';
    } else {
      $('#studyHint').textContent = isEnglishUi()
        ? 'This list comes from the song’s word cards · Tap Thai to hear it · 🎵 opens that lyric line'
        : '这份单词表是从歌词里的逐词卡片自动摊出来去重的 · 点泰语听发音 · 🎵 跳到歌里那一句';
    }
  }

  /** 单词表 →「⚔️ 双人对战」 */
  function startBattle() {
    stopLinePlay(true);
    TTS.stop();
    state.quiz = null;
    state.page = 'battle';
    applyPage();
  }

  /** 进 / 出单词模式，由 app.js 的模式切换调用 */
  function setActive(on) {
    state.on = on;
    if (on) {
      state.page = 'list';
      state.quiz = null;
      applyPage();
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      TTS.stop();
      stopLinePlay(true);     // 走的时候别把原句留在那儿响
      Battle.close();         // 打到一半切走就算了，别留在后台
    }
  }

  /* ════════ 事件 ════════ */

  function bind() {
    if (bound) return;
    bound = true;
    // ── 单词表 ──
    $('#wordList').addEventListener('click', (e) => {
      const row = e.target.closest('.wrow');
      if (!row) return;
      const th = row.dataset.th;
      const w = Vocab.get(th);
      const act = (e.target.closest('[data-act]') || {}).dataset?.act;

      if (act === 'speak') { speak(w.th, w.lang, e.target.closest('[data-act]')); return; }
      if (act === 'reveal') { row.querySelector('.wrow-mean').classList.remove('masked'); return; }
      if (act === 'hint') {
        const hint = row.querySelector('.wrow-hint');
        const btn = e.target.closest('[data-act]');
        const show = hint.classList.contains('hidden');
        hint.classList.toggle('hidden', !show);
        btn.setAttribute('aria-expanded', String(show));
        btn.textContent = show ? '收起提示' : '提示';
        return;
      }
      if (act === 'hint-cn') {
        const btn = e.target.closest('[data-act]');
        const lines = $$('.wrow-hint-cn', row);
        const show = lines.some((line) => line.classList.contains('hidden'));
        lines.forEach((line) => line.classList.toggle('hidden', !show));
        btn.setAttribute('aria-expanded', String(show));
        btn.textContent = show ? hideMeaningLabel() : showMeaningLabel();
        return;
      }
      if (act === 'goto') {
        playLine(w, e.target.closest('[data-act]'));
        return;
      }
      if (act === 'jump') {
        document.dispatchEvent(new CustomEvent('study:goto', { detail: { idx: w.lines[0].idx, th: w.th } }));
        return;
      }
      if (act === 'known')   { Vocab.setLevel(th, Vocab.MAX_LV); renderList(); return; }
      if (act === 'relearn') { Vocab.setLevel(th, 0); renderList(); return; }

      // 没点到具体按钮 = 点在卡片空白处：跟练习模式点词一样，念这个词
      speak(w.th, w.lang, row.querySelector('.wrow-th'));
    });

    $('#studySort').addEventListener('change', (e) => { state.sort = e.target.value; saveOpts(); renderList(); });
    $('#studyFilter').addEventListener('change', (e) => { state.filter = e.target.value; saveOpts(); renderList(); });
    $('#studyMask').addEventListener('change', (e) => { state.mask = e.target.checked; saveOpts(); renderList(); });

    $('#lineJourney').addEventListener('click', (e) => {
      const node = e.target.closest('.journey-node');
      if (node) startLine(Number(node.dataset.line));
    });

    $('#dailyStart').addEventListener('click', () => { stopLinePlay(true); startPractice(true); });
    $('#studyStart').addEventListener('click', () => { stopLinePlay(true); startRound(false); });
    $('#studyBattle2p').addEventListener('click', startBattle);
    $('#quizBack').addEventListener('click', () => { stopLinePlay(true); state.page = 'list'; state.quiz = null; applyPage(); });

    // 复制成制表符分隔，贴进 Excel / Notion / Anki 都能用
    $('#studyCopy').addEventListener('click', async () => {
      const tsv = Vocab.toTSV();
      try {
        await navigator.clipboard.writeText(tsv);
        note('单词表已复制 ✓ 贴进表格就是一张表');
      } catch {
        $('#studyExport').classList.remove('hidden');
        $('#studyExportText').value = tsv;
        $('#studyExportText').select();
      }
    });
    $('#studyExportClose').addEventListener('click', () => $('#studyExport').classList.add('hidden'));

    $('#studyReset').addEventListener('click', () => {
      if (!confirm('把这首歌的单词掌握程度和歌词行进度全部清零，重新开始？')) return;
      Vocab.reset();
      lineProgress.clear();
      saveLineProgress();
      renderList();
      note('进度已清零');
    });

    // ── 测验 ──
    $('#quizOpts').addEventListener('click', (e) => {
      const b = e.target.closest('.qopt');
      if (b) answer(b.dataset.mean, b);
    });
    $('#quizSpeak').addEventListener('click', () => {
      const q = state.quiz && state.quiz.q;
      if (q) speak(q.word.th, q.word.lang, $('#quizSpeak'));
    });
    $('#quizHintToggle').addEventListener('click', () => {
      const hint = $('#quizHint');
      const show = hint.classList.contains('hidden');
      hint.classList.toggle('hidden', !show);
      $('#quizHintToggle').textContent = show ? '收起提示' : '💡 提示';
      $('#quizHintToggle').setAttribute('aria-expanded', String(show));
    });
    $('#quizHintCnToggle').addEventListener('click', () => {
      const lines = $$('.quiz-hint-cn', $('#quizHint'));
      const show = lines.some((line) => line.classList.contains('hidden'));
      lines.forEach((line) => line.classList.toggle('hidden', !show));
      $('#quizHintCnToggle').textContent = show ? hideMeaningLabel() : showMeaningLabel();
      $('#quizHintCnToggle').setAttribute('aria-expanded', String(show));
    });
    $('#quizNext').addEventListener('click', nextQuestion);
    $('#sentenceBank').addEventListener('click', (e) => {
      const btn = e.target.closest('.sentence-token');
      if (!btn) return;
      const q = state.quiz;
      const i = q.bank.findIndex((word) => word.tokenId === Number(btn.dataset.token));
      if (i >= 0) q.placed.push(q.bank.splice(i, 1)[0]);
      renderSentence();
    });
    $('#sentenceAnswer').addEventListener('click', (e) => {
      if (suppressSentenceClick) return;
      const btn = e.target.closest('.sentence-token');
      if (!btn) return;
      const q = state.quiz;
      const i = q.placed.findIndex((word) => word.tokenId === Number(btn.dataset.token));
      if (i >= 0) q.bank.push(q.placed.splice(i, 1)[0]);
      renderSentence();
    });
    $('#sentenceAnswer').addEventListener('pointerdown', beginSentenceDrag);
    document.addEventListener('pointermove', moveSentenceDrag, { passive: false });
    document.addEventListener('pointerup', endSentenceDrag);
    document.addEventListener('pointercancel', endSentenceDrag);
    $('#sentenceReset').addEventListener('click', () => {
      const q = state.quiz;
      q.bank.push(...q.placed.splice(0));
      $('#sentenceFeedback').className = 'sentence-feedback hidden';
      renderSentence();
    });
    $('#sentenceSpeak').addEventListener('click', () => speak(state.quiz.line.th, 'th', $('#sentenceSpeak')));
    $('#sentenceCheck').addEventListener('click', (e) => {
      if (e.currentTarget.dataset.done === '1') {
        e.currentTarget.dataset.done = '';
        e.currentTarget.textContent = '检查答案';
        return finishRound();
      }
      checkSentence();
    });
    $('#quizDone').addEventListener('click', (e) => {
      if (e.target.closest('#quizAgain')) return state.quiz?.kind === 'practice' ? startPractice(true) : startRound();
      if (e.target.closest('#quizToList')) { state.page = 'list'; state.quiz = null; return applyPage(); }
      const miss = e.target.closest('.qd-miss');
      if (miss) { const w = Vocab.get(miss.dataset.th); speak(w.th, w.lang, miss.querySelector('.qd-miss-th')); }
    });

    [['#quizShowRo', 'showRo'], ['#quizShowCn', 'showCn'], ['#quizAutoSpeak', 'autoSpeak']]
      .forEach(([sel, k]) => {
        $(sel).checked = state[k];
        $(sel).addEventListener('change', (e) => {
          state[k] = e.target.checked;
          saveOpts();
          if (state.page === 'quiz' && state.quiz && state.quiz.q) {
            const w = state.quiz.q.word;
            $('#quizRo').classList.toggle('hidden', !state.showRo || !w.ro);
            $('#quizCn').classList.toggle('hidden', !state.showCn || !w.cn);
            if (state.quiz.phase === 'sentence') renderSentence();
          }
        });
      });

    // ── 快捷键（只在单词模式下管用）──
    document.addEventListener('keydown', (e) => {
      if (!state.on) return;
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (!$('#studyExport').classList.contains('hidden')) return;
      if (state.page === 'battle') return;      // 对战的快捷键在 battle.js 里

      if (state.page !== 'quiz') {
        if (e.code === 'Enter') { e.preventDefault(); startRound(); }
        return;
      }
      if (e.code === 'Escape') { state.page = 'list'; state.quiz = null; applyPage(); return; }

      const q = state.quiz;
      const n = ({ Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 })[e.code];
      if (n !== undefined) {
        e.preventDefault();
        const b = $$('#quizOpts .qopt')[n];
        if (b && !b.disabled) answer(b.dataset.mean, b);
        return;
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (!$('#quizDone').classList.contains('hidden')) {
          if (q?.kind === 'practice') startPractice(true); else startRound();
        }
        else if (q?.phase === 'sentence') checkSentence();
        else if (q && q.answered) nextQuestion();
      }
      if (e.code === 'KeyS' && q && q.q) speak(q.q.word.th, q.q.word.lang, $('#quizSpeak'));
    });
  }

  // 小提示条：跟 app.js 里的 toast 长一个样，这里单独留一份省得互相依赖
  let noteTimer;
  function note(msg) {
    let el = $('#studyNote');
    if (!el) {
      el = document.createElement('div');
      el.id = 'studyNote';
      el.className = 'study-note';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => el.classList.remove('show'), 2100);
  }

  function init(song) {
    Vocab.init(song);
    Battle.init(song, { exit: () => { state.page = 'list'; state.quiz = null; applyPage(); } });
    hasTimeline = song.timeline !== false;
    songId = song.id;
    lessonLines = song.sections.flatMap((sec) => sec.lines).map((line, idx) => ({ ...line, idx })).filter((line) => line.words?.length);
    lineStarts = song.sections.flatMap((sec) => sec.lines.map((l) => l.start));
    loadLineProgress();
    loadOpts();
    bind();
    watchLineEnd();
    renderList();
    initDaily();
  }

  // 首页不会初始化某一首歌的 Vocab / Battle，但每日足迹和云端同步仍然要启动。
  function initDaily() {
    renderDaily();
    if (!dailyInitialized) {
      dailyInitialized = true;
      ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((eventName) =>
        document.addEventListener(eventName, () => { lastActivity = Date.now(); }, { passive: true }));
      setInterval(addStudySecond, 1000);
      if (window.Auth) Auth.onChange(syncDailyFromCloud);
      $('#homeDailyStart')?.addEventListener('click', () => {
        localStorage.setItem('tsl.mode', 'study');
        const songId = localStorage.getItem('tsl.song') || Object.keys(window.SONGS || {})[0];
        location.href = `?song=${encodeURIComponent(songId)}`;
      });
    }
  }

  // 登录以后云端数据是异步拉回来的，回来的时候如果单词表正开着就重新画一遍，
  // 不然界面会一直停在刚打开页面那一刻的本地数据上
  if (window.Vocab) Vocab.onUpdate(() => { if (state.on && state.page === 'list') { renderHead(); renderList(); } });

  // 切换中/英文时，提示里的歌词意思也要立即跟着换；已答题的反馈保持原样。
  window.addEventListener('languagechange', () => {
    if (!state.on) return;
    renderStudyHint();
    if (state.page === 'list') return renderList();
    if (state.page !== 'quiz' || !state.quiz?.q) return;
    renderQuizProgress();
    if (state.quiz.phase === 'sentence') {
      $('#sentenceMeaning').textContent = lyricMeaning(state.quiz.line);
      renderSentence();
    }
    const lines = hintLinesFor(state.quiz.q.word, state.quiz).filter((line, i, all) =>
      all.findIndex((other) => other.th === line.th && other.ro === line.ro && other.cn === line.cn) === i
    );
    $$('.quiz-hint-cn', $('#quizHint')).forEach((el, i) => { el.textContent = lyricMeaning(lines[i]); });
    const btn = $('#quizHintCnToggle');
    btn.textContent = btn.getAttribute('aria-expanded') === 'true' ? hideMeaningLabel() : showMeaningLabel();
  });

  return { init, initDaily, setActive, isOn: () => state.on, note };
})();
