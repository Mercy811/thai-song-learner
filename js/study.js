/**
 * Study —— 单词模式：单词表 + 四选一测验
 *
 * 三个页面来回切：
 *   单词表  这首歌所有词（从歌词自动摊出来的），每个词一条，右边是掌握程度
 *   测验    一次一张词卡（泰语 + 罗马音），下面四个中文意思，选对选错都记进掌握程度
 *   对战    两个人用同一台电脑，每道题轮流答同一套题，那一整块界面归 battle.js 管
 *
 * 数据和算法都在 Vocab 里，这个文件只管画界面和收事件。
 */
window.Study = (() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS_OPTS = 'tsl.study.opts';
  const ROUND = 10;                 // 一轮多少题
  const RECENT = 6;                 // 最近考过的几个词不重复出

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

  /* ── 播放原句要用的东西 ──
     SONG 里每句的 start 摊平存一份，用来算「这句唱到哪儿结束」（= 下一句的开头）。
     没时间轴的歌（timeline: false）这份是空的，🎵 会退回朗读整句。 */
  let hasTimeline = true;
  let lineStarts = [];

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
          <button class="wbtn" data-act="goto" title="放这个词所在的原句（唱完这句自动停）">🎵</button>
          <button class="wbtn" data-act="jump" title="到歌词里看这个词在哪句">📖</button>
          <button class="wbtn" data-act="known" title="我已经会了，直接标满">✓</button>
          <button class="wbtn" data-act="relearn" title="清掉这个词的进度，重新学">↺</button>
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

  function startRound() {
    state.quiz = { step: 0, right: 0, wrong: 0, streak: 0, best: 0, recent: [], q: null, answered: false, missed: [] };
    state.page = 'quiz';
    applyPage();
    window.scrollTo({ top: 0, behavior: 'auto' });
    nextQuestion();
  }

  function nextQuestion() {
    const q = state.quiz;
    if (q.step >= ROUND) return finishRound();

    const th = Vocab.pick(q.recent);
    if (!th) return finishRound();
    q.recent = [th, ...q.recent].slice(0, RECENT);
    q.q = Vocab.makeQuestion(th);
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
    $('#quizCard').classList.remove('hidden');
    $('#quizStep').textContent = state.quiz.step;
    $('#quizTotal').textContent = ROUND;
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

    $('#quizOpts').innerHTML = q.options.map((m, i) =>
      `<button class="qopt" data-mean="${esc(m)}"><b>${i + 1}</b><span>${esc(m)}</span></button>`
    ).join('');

    $('#quizFeedback').className = 'quiz-feedback hidden';
    $('#quizFeedback').innerHTML = '';
    $('#quizNext').classList.add('hidden');
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

    // 答完给这个词在歌里的原句，顺便记住它是怎么用的
    const line = w.lines[0];
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

  function finishRound() {
    const q = state.quiz;
    const pct = q.step ? Math.round((q.right / q.step) * 100) : 0;
    const word = pct === 100 ? '全对！' : pct >= 80 ? '不错' : pct >= 50 ? '再来一轮' : '这几个词还得练';

    $('#quizCard').classList.add('hidden');
    $('#quizDone').classList.remove('hidden');
    $('#quizDone').innerHTML = `
      <div class="qd-score"><b>${q.right}</b> / ${q.step}</div>
      <div class="qd-word">${esc(word)}　正确率 ${pct}%${q.best > 1 ? `　最高连对 ${q.best}` : ''}</div>
      ${q.missed.length ? `
        <div class="qd-missed">
          <div class="qd-missed-h">这轮错的（已经掉了一级，下轮还会出）</div>
          ${q.missed.map((w) => `
            <div class="qd-miss" data-th="${esc(w.th)}">
              <button class="qd-miss-th" data-act="speak">${esc(w.th)}</button>
              <span class="qd-miss-ro">${esc(w.ro)}</span>
              <span class="qd-miss-mean">${esc(w.mean)}</span>
            </div>`).join('')}
        </div>` : '<div class="qd-clean">这一轮一个没错 🎉</div>'}
      <div class="qd-actions">
        <button class="btn primary" id="quizAgain">再来一轮</button>
        <button class="btn ghost" id="quizToList">看单词表</button>
      </div>`;
    renderHead();
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
    $('#studyHint').innerHTML = quiz
      ? '快捷键：<kbd>1</kbd>–<kbd>4</kbd> 选答案 · <kbd>Enter</kbd> 下一个 · <kbd>Esc</kbd> 回单词表'
      : battle
        ? '每道题两个人轮流答，答完这题才一起进下一题 · 答题过程中不判对错，全部答完一起揭晓'
        : '这份单词表是从歌词里的逐词卡片自动摊出来去重的 · 点泰语听发音 · 🎵 跳到歌里那一句';
    // 对战自己管自己那一块界面，这里只负责把它叫起来 / 收干净
    if (battle) Battle.open(); else Battle.close();
    if (solo) renderList();
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
    // ── 单词表 ──
    $('#wordList').addEventListener('click', (e) => {
      const row = e.target.closest('.wrow');
      if (!row) return;
      const th = row.dataset.th;
      const w = Vocab.get(th);
      const act = (e.target.closest('[data-act]') || {}).dataset?.act;

      if (act === 'speak') { speak(w.th, w.lang, e.target.closest('[data-act]')); return; }
      if (act === 'reveal') { row.querySelector('.wrow-mean').classList.remove('masked'); return; }
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

    $('#studyStart').addEventListener('click', () => { stopLinePlay(true); startRound(); });
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
      if (!confirm('把这首歌所有词的掌握程度清零，重新开始？')) return;
      Vocab.reset();
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
    $('#quizNext').addEventListener('click', nextQuestion);
    $('#quizDone').addEventListener('click', (e) => {
      if (e.target.closest('#quizAgain')) return startRound();
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
        if (!$('#quizDone').classList.contains('hidden')) startRound();
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
    lineStarts = song.sections.flatMap((sec) => sec.lines.map((l) => l.start));
    loadOpts();
    bind();
    watchLineEnd();
    renderList();
  }

  return { init, setActive, isOn: () => state.on, note };
})();
