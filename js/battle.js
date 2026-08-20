/**
 * Battle —— 双人对战测验：两个人用同一台电脑，轮流答同一套题
 *
 * 流程：摆阵势（填名字、选题数）→ 玩家 1 一口气答完 → 交接屏 → 玩家 2 答同一套 → 一起揭晓。
 *
 * 「第二个人看不到第一个人的答案」是这个模式的地基，靠三件事保证：
 *   1. 答题时**不判对错**，也不显示分数 —— 屏幕上根本没有「答案」这个东西可看；
 *   2. 换人之间插一块交接屏，上一个人的题目和选项全部从 DOM 里清掉，翻不出来；
 *   3. 全程只在内存里记，不写 localStorage，谁也没法翻历史。
 *
 * 公平也一样要保证：两个人拿到的是**同一批题、同样的选项顺序**（题目在开局时一次性生成好），
 * 答对数打平就比总用时。
 *
 * 出题借单词表那套（级别越低越容易被抽中），但对战**不写掌握程度** ——
 * 朋友在你电脑上玩一局，不该把你的学习进度搅乱。
 */
window.Battle = (() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS = 'tsl.battle';           // 只存名字/题数这些偏好，不存任何答案
  const PICK_DELAY = 260;            // 选完停一下再翻页，让人看清自己点的是哪个
  const MAX_MS = 60000;              // 每题最多计 60 秒：中途去倒杯水不该决定胜负
  const COUNTS = [5, 10, 15, 20];
  const DEFAULT_NAMES = ['玩家 1', '玩家 2'];

  let hooks = { exit() {} };
  let pool = 0;                      // 这首歌有多少个能出题的词

  const B = {
    on: false,
    phase: 'setup',                  // setup | ready | play | result
    names: [...DEFAULT_NAMES],
    count: 10,
    autoSpeak: true,
    qs: [],                          // 两个人共用的同一套题
    turn: 0,                         // 0 = 先答的人，1 = 后答的人
    step: 0,
    answers: [[], []],               // 每人 [{ mean, ok, ms }]
    locked: false,                   // 选完到翻页之间，挡住手快点第二下
    qStart: 0,
    result: null,
    wins: [0, 0],                    // 一场里打了好几轮，累计比分
    rounds: 0,
  };

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const ttsRate = () => parseFloat(localStorage.getItem('tsl.ttsRate')) || 0.7;

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

  function fmtMs(ms) {
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)} 秒`;
    const m = Math.floor(s / 60);
    return `${m} 分 ${Math.round(s - m * 60)} 秒`;
  }

  const nameOf = (i) => B.names[i] || DEFAULT_NAMES[i];

  /* ════════ 偏好（只有名字和题数，不含任何答案） ════════ */

  function loadPrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(LS) || '{}');
      if (Array.isArray(p.names)) B.names = [p.names[0] || '', p.names[1] || ''];
      if (COUNTS.includes(p.count)) B.count = p.count;
      if (typeof p.autoSpeak === 'boolean') B.autoSpeak = p.autoSpeak;
    } catch { /* 存坏了就用默认值 */ }
  }
  function savePrefs() {
    try {
      localStorage.setItem(LS, JSON.stringify({ names: B.names, count: B.count, autoSpeak: B.autoSpeak }));
    } catch { /* 无痕模式 */ }
  }

  /* ════════ 出题 ════════
     开局一次性生成好，两个人拿到的题目和选项顺序完全一样 —— 后答的人不会因为
     选项被重新洗过而变难或变简单。 */

  function buildQuestions(n) {
    const used = [];
    const qs = [];
    for (let i = 0; i < n; i++) {
      const th = Vocab.pick(used);
      if (!th || used.includes(th)) break;   // 词不够了就少出几道，不重复出同一个
      used.push(th);
      const q = Vocab.makeQuestion(th);
      if (q) qs.push(q);
    }
    return qs;
  }

  /* ════════ 各屏 ════════ */

  function show(phase) {
    B.phase = phase;
    $('#battleSetup').classList.toggle('hidden', phase !== 'setup');
    $('#battleReady').classList.toggle('hidden', phase !== 'ready');
    $('#battlePlay').classList.toggle('hidden', phase !== 'play');
    $('#battleResultView').classList.toggle('hidden', phase !== 'result');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ── ① 摆阵势 ── */

  function renderSetup() {
    const sel = $('#battleCount');
    const opts = COUNTS.filter((n) => n <= pool);
    if (!opts.length) opts.push(pool);                 // 词特别少的歌：有几个考几个
    if (!opts.includes(B.count)) B.count = opts[Math.min(1, opts.length - 1)];
    sel.innerHTML = opts.map((n) => `<option value="${n}">${n} 题</option>`).join('');
    sel.value = String(B.count);

    $('#battleName1').value = B.names[0] === DEFAULT_NAMES[0] ? '' : B.names[0];
    $('#battleName2').value = B.names[1] === DEFAULT_NAMES[1] ? '' : B.names[1];
    $('#battleAutoSpeak').checked = B.autoSpeak;
    $('#battlePoolNote').textContent = `这首歌一共 ${pool} 个词可以出题`;
    show('setup');
  }

  function readSetup() {
    B.names = [
      ($('#battleName1').value || '').trim() || DEFAULT_NAMES[0],
      ($('#battleName2').value || '').trim() || DEFAULT_NAMES[1],
    ];
    if (B.names[0] === B.names[1]) B.names[1] += ' ②';   // 重名了分不清谁是谁
    B.count = parseInt($('#battleCount').value, 10) || 10;
    B.autoSpeak = $('#battleAutoSpeak').checked;
    savePrefs();
  }

  /** 开一整场（比分从 0:0 起算） */
  function startMatch() {
    readSetup();
    B.wins = [0, 0];
    B.rounds = 0;
    startRound();
  }

  /** 开新一轮：重新出题，先答的人从头开始 */
  function startRound(swapOrder) {
    if (swapOrder) {                       // 比分是跟着人走的，换位子要一起搬
      B.names = [B.names[1], B.names[0]];
      B.wins  = [B.wins[1], B.wins[0]];
    }
    B.qs = buildQuestions(B.count);
    B.answers = [[], []];
    B.result = null;
    B.turn = 0;
    if (!B.qs.length) {                                  // 理论上不会发生，兜一下
      renderSetup();
      window.Study && Study.note('这首歌还没有可以出题的词');
      return;
    }
    renderReady();
  }

  /* ── ② 交接屏 ── */

  function renderReady() {
    const me = nameOf(B.turn);
    const other = nameOf(1 - B.turn);
    const first = B.turn === 0;
    $('#battleReady').innerHTML = `
      <div class="br-card">
        <div class="brd-badge p${B.turn + 1}">${esc([...me].slice(0, 2).join(''))}</div>
        <div class="brd-title">轮到 <b class="p${B.turn + 1}">${esc(me)}</b> 了</div>
        <div class="brd-sub">${first
          ? `${esc(other)} 先别看屏幕，${esc(me)} 一口气答完 ${B.qs.length} 题`
          : `请把电脑交给 ${esc(me)} —— ${esc(other)} 的答案已经收起来了，谁也翻不到`}</div>
        <div class="brd-meta">共 ${B.qs.length} 题 · 答完自动交回 · 全程不显示对错</div>
        <button class="btn primary big" id="battleGo">我是 ${esc(me)}，开始答题</button>
        <div class="brd-hint">键盘敲 <kbd>Enter</kbd> 也行</div>
      </div>`;
    show('ready');
    $('#battleGo').focus();
  }

  /* ── ③ 答题 ── */

  function beginTurn() {
    B.step = 0;
    show('play');
    nextQuestion();
  }

  function nextQuestion() {
    if (!B.on) return;                     // 中途退出了：路上的定时器直接作废
    if (B.step >= B.qs.length) return finishTurn();
    const q = B.qs[B.step];
    B.step++;
    B.locked = false;

    const w = q.word;
    $('#battleWho').innerHTML = `<i class="p${B.turn + 1}"></i>${esc(nameOf(B.turn))} 答题中`;
    $('#battleStep').textContent = B.step;
    $('#battleTotal').textContent = B.qs.length;
    $('#battleDots').innerHTML = B.qs.map((_, i) =>
      `<i class="${i < B.step - 1 ? 'done' : i === B.step - 1 ? 'cur' : ''} p${B.turn + 1}"></i>`).join('');

    $('#battleTh').textContent = w.th;
    $('#battleTh').classList.toggle('en', w.lang === 'en');
    $('#battleRo').textContent = w.ro || '';
    $('#battleRo').classList.toggle('hidden', !w.ro);
    $('#battleOpts').innerHTML = q.options.map((m, i) =>
      `<button class="qopt" data-mean="${esc(m)}"><b>${i + 1}</b><span>${esc(m)}</span></button>`).join('');

    B.qStart = performance.now();
    if (B.autoSpeak) setTimeout(() => speak(w.th, w.lang, $('#battleSpeak')), 220);
  }

  function answer(mean, btn) {
    if (B.locked || B.phase !== 'play') return;
    B.locked = true;
    const q = B.qs[B.step - 1];
    // 记下来就完了：对不对留到最后一起揭晓，屏幕上不给任何暗示
    B.answers[B.turn].push({
      mean,
      ok: mean === q.answer,
      ms: Math.min(MAX_MS, performance.now() - B.qStart),
    });
    $$('#battleOpts .qopt').forEach((b) => { b.disabled = true; });
    if (btn) btn.classList.add('picked');
    TTS.stop();
    setTimeout(nextQuestion, PICK_DELAY);
  }

  function finishTurn() {
    if (!B.on) return;
    // 这个人的题目和选项立刻从 DOM 里清掉，交接的时候翻不出任何痕迹
    $('#battleOpts').innerHTML = '';
    $('#battleTh').textContent = '';
    $('#battleRo').textContent = '';
    TTS.stop();
    if (B.turn === 0) { B.turn = 1; renderReady(); }
    else renderResult();
  }

  /* ── ④ 揭晓 ── */

  function judge() {
    const right = [0, 1].map((i) => B.answers[i].filter((a) => a.ok).length);
    const time  = [0, 1].map((i) => B.answers[i].reduce((s, a) => s + a.ms, 0));
    let win = -1, by = 'tie';
    if (right[0] !== right[1]) { win = right[0] > right[1] ? 0 : 1; by = 'score'; }
    else if (Math.round(time[0]) !== Math.round(time[1])) { win = time[0] < time[1] ? 0 : 1; by = 'time'; }
    return { right, time, win, by };
  }

  function verdictHtml(r) {
    if (r.win < 0) return `🤝 <b>平局</b>　答对数和用时都一模一样`;
    const w = esc(nameOf(r.win));
    if (r.by === 'score') {
      const d = Math.abs(r.right[0] - r.right[1]);
      const all = r.right[r.win] === B.qs.length ? '全对，' : '';
      return `🏆 <b class="p${r.win + 1}">${w}</b> 赢了　${all}多对 ${d} 题`;
    }
    const d = fmtMs(Math.abs(r.time[0] - r.time[1]));
    const all = r.right[0] === B.qs.length ? '两个人全对，' : '答对数打平，';
    return `🏆 <b class="p${r.win + 1}">${w}</b> 险胜　${all}用时快了 ${d}`;
  }

  function qRowHtml(q, i) {
    const w = q.word;
    const line = w.lines[0];
    const pick = (p) => {
      const a = B.answers[p][i];
      if (!a) return `<span class="brq-pick p${p + 1} miss">${esc(nameOf(p))} 没答</span>`;
      return `<span class="brq-pick p${p + 1} ${a.ok ? 'ok' : 'bad'}">
        <i>${a.ok ? '✓' : '✗'}</i><em>${esc(nameOf(p))}</em>${esc(a.mean)}</span>`;
    };
    const both = B.answers[0][i] && B.answers[1][i] && B.answers[0][i].ok === B.answers[1][i].ok;
    return `
      <div class="brq${both && B.answers[0][i].ok ? ' same-ok' : both ? ' same-bad' : ''}" data-th="${esc(w.th)}">
        <div class="brq-head">
          <span class="brq-no">${i + 1}</span>
          <button class="brq-th${w.lang === 'en' ? ' en' : ''}" data-act="speak" title="点一下听发音">${esc(w.th)}</button>
          <span class="brq-ro">${esc(w.ro)}</span>
          <span class="brq-ans">${esc(q.answer)}</span>
        </div>
        <div class="brq-picks">${pick(0)}${pick(1)}</div>
        <div class="brq-line"><span class="brq-lineno">第 ${line.idx + 1} 句</span><b>${esc(line.th)}</b><span>${esc(line.cn)}</span></div>
      </div>`;
  }

  function renderResult() {
    if (!B.result) {                       // 一轮只结算一次，重画不会重复加分
      B.result = judge();
      B.rounds++;
      if (B.result.win >= 0) B.wins[B.result.win]++;
    }
    const r = B.result;
    const side = (i) => `
      <div class="brs-side p${i + 1}${r.win === i ? ' win' : ''}">
        <div class="brs-name">${esc(nameOf(i))}${i === 0 ? '<em>先答</em>' : '<em>后答</em>'}</div>
        <div class="brs-num">${r.right[i]}</div>
        <div class="brs-time">用时 ${fmtMs(r.time[i])}</div>
      </div>`;

    $('#battleResultView').innerHTML = `
      <div class="brs-head">⚔️ 揭晓</div>
      <div class="brs">${side(0)}<div class="brs-mid"><div class="brs-vs">VS</div><div class="brs-of">共 ${B.qs.length} 题</div></div>${side(1)}</div>
      <div class="brs-verdict">${verdictHtml(r)}</div>
      ${B.rounds > 1 ? `<div class="brs-tally">打了 ${B.rounds} 轮　总比分
        <b class="p1">${B.wins[0]}</b> : <b class="p2">${B.wins[1]}</b>
        <span>（${esc(nameOf(0))} : ${esc(nameOf(1))}）</span></div>` : ''}
      <div class="brs-listh">逐题对照　<span>点泰语听发音</span></div>
      <div class="brs-list">${B.qs.map(qRowHtml).join('')}</div>
      <div class="brs-actions">
        <button class="btn primary big" id="battleAgain">⚔️ 再来一轮</button>
        <button class="btn ghost" id="battleSwap" title="这次换 ${esc(nameOf(1))} 先答">🔄 换先手再来</button>
        <button class="btn ghost" id="battleToSetup">⚙️ 改名字 / 题数</button>
        <button class="btn ghost" id="battleDone">← 单词表</button>
      </div>`;
    show('result');
    $('#battleAgain').focus();
  }

  /* ════════ 事件 ════════ */

  function bind() {
    $('#battleStart').addEventListener('click', startMatch);
    $('#battleExit').addEventListener('click', () => hooks.exit());

    $('#battleReady').addEventListener('click', (e) => {
      if (e.target.closest('#battleGo')) beginTurn();
    });

    $('#battleOpts').addEventListener('click', (e) => {
      const b = e.target.closest('.qopt');
      if (b && !b.disabled) answer(b.dataset.mean, b);
    });
    $('#battleSpeak').addEventListener('click', () => {
      const q = B.qs[B.step - 1];
      if (B.phase === 'play' && q) speak(q.word.th, q.word.lang, $('#battleSpeak'));
    });

    $('#battleResultView').addEventListener('click', (e) => {
      if (e.target.closest('#battleAgain'))    return startRound(false);
      if (e.target.closest('#battleSwap'))     return startRound(true);
      if (e.target.closest('#battleToSetup'))  return renderSetup();
      if (e.target.closest('#battleDone'))     return hooks.exit();
      const row = e.target.closest('.brq');
      if (row && e.target.closest('[data-act="speak"]')) {
        const w = Vocab.get(row.dataset.th);
        if (w) speak(w.th, w.lang, row.querySelector('.brq-th'));
      }
    });

    // ── 快捷键（只在对战里管用；输入名字的时候让开）──
    document.addEventListener('keydown', (e) => {
      if (!B.on) return;
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
        if (e.code === 'Enter' && B.phase === 'setup') { e.preventDefault(); startMatch(); }
        return;
      }
      if (B.phase === 'setup') {
        if (e.code === 'Enter') { e.preventDefault(); startMatch(); }
        return;
      }
      if (B.phase === 'ready') {
        if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); beginTurn(); }
        return;
      }
      if (B.phase === 'play') {
        const n = ({ Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 })[e.code];
        if (n !== undefined) {
          e.preventDefault();
          const b = $$('#battleOpts .qopt')[n];
          if (b && !b.disabled) answer(b.dataset.mean, b);
          return;
        }
        if (e.code === 'KeyS') { e.preventDefault(); $('#battleSpeak').click(); return; }
        if (e.code === 'Escape' && confirm('这局不打了？已经答的都不算。')) renderSetup();
        return;
      }
      if (B.phase === 'result') {
        if (e.code === 'Enter') { e.preventDefault(); startRound(false); }
        if (e.code === 'Escape') hooks.exit();
      }
    });
  }

  /* ════════ 对外 ════════ */

  /** 进对战：每次都从摆阵势那一屏重新开始 */
  function open() {
    if (B.on) return;
    B.on = true;
    B.result = null;
    B.answers = [[], []];
    B.qs = [];
    pool = Vocab.list().filter((w) => w.mean).length;
    renderSetup();
  }

  /** 出对战：手上这局直接作废，不留任何痕迹 */
  function close() {
    if (!B.on) return;
    B.on = false;
    B.phase = 'setup';
    B.locked = false;
    TTS.stop();
    B.qs = [];
    B.answers = [[], []];
    B.result = null;
    $('#battleOpts').innerHTML = '';
    $('#battleReady').innerHTML = '';
    $('#battleResultView').innerHTML = '';
  }

  function init(_song, h) {
    hooks = Object.assign(hooks, h || {});
    loadPrefs();
    bind();
  }

  return { init, open, close, isOn: () => B.on };
})();
