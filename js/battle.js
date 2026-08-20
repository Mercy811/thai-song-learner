/**
 * Battle —— 双人对战抢答：一道题出来，两个人同时抢
 *
 * 流程：摆阵势（名字 / 题数 / 摄像头）→ 各拍一张开场照 → 一道题一道题抢 → 揭晓。
 * 不再是「你答完换我答」：题目对两个人同时亮出来，**谁先答对当场 +1**，
 * 抢错的人这道题就出局了，剩下的时间只剩另一个人能答 —— 手快之前得先想清楚。
 *
 * 两种输入一直并存，没有「模式」之分：
 *   · 摄像头开着 → **比几根手指就是第几个选项**（食指到小指，拇指不算）。
 *     画面左半边算玩家 1、右半边算玩家 2，两个人各管各的半边，抢起来互不打架。
 *   · 键盘 → 玩家 1 按 <kbd>1234</kbd>，玩家 2 按 <kbd>7890</kbd>。
 * 键盘那套**任何时候都好使**：手势没认出来、模型没下下来、摄像头压根没开，都还能打完这局。
 *
 * 「比赛感」靠记分牌撑着：开局各拍一张照片，两张脸、两个名字、两个分数从第一题挂到最后一题，
 * 谁领先、谁刚抢错、谁这题出局了，抬头就看得见，不用记在脑子里。
 *
 * 一题结束要两个人**一起比 ✊**（或者按两下空格）才进下一题 —— 一个人点不动，
 * 得等另一个看完答案，没人会被拖着走。
 *
 * 出题借单词表那套（级别越低越容易被抽中），但对战**不写掌握程度** ——
 * 朋友在你电脑上玩一局，不该把你的学习进度搅乱。
 * 照片、画面、答题记录全都只在内存里，不写 localStorage，退出就没了。
 */
window.Battle = (() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS = 'tsl.battle';           // 只存名字/题数/开不开摄像头，不存照片也不存答案
  const COUNTS = [5, 10, 15, 20];
  const DEFAULT_NAMES = ['玩家 1', '玩家 2'];

  const READY_MS  = 900;             // 出题前的「准备」：两个人同时看见题目，不然先看到的那个占便宜
  const LIMIT_MS  = 20000;           // 每题 20 秒，都没抢对就公布答案，局不会卡住
  const FIST_MS   = 300;             // 两个人的拳头要一起稳住这么久才翻页，免得比划的时候误翻
  const REVEAL_LOCK_MS = 450;        // 刚揭晓这一下：手上还残着上一个手势，先别急着收「进下一题」

  // 键盘：一个人左手边四个键，一个人右手边四个键，中间隔开互不误按
  const KEYS = [
    { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 },
    { Digit7: 0, Digit8: 1, Digit9: 2, Digit0: 3 },
  ];
  const HANDS = ['✊', '☝️', '✌️', '🤟', '🖖'];   // 0–4 根手指

  let hooks = { exit() {} };
  let pool = 0;                      // 这首歌有多少个能出题的词
  let bound = false;

  const B = {
    on: false,
    phase: 'setup',                  // setup | photo | play | result
    stage: 'ready',                  // play 里的小状态：ready 准备 | race 抢答 | reveal 揭晓
    names: [...DEFAULT_NAMES],
    count: 10,
    autoSpeak: true,
    useCam: false,                   // 用户想不想用摄像头（跟摄像头实际开没开是两回事）
    photos: [null, null],            // 开场照，只在内存里
    shot: false,                     // 这一轮的照片拍过没有（摄像头断了拍出来是空的，也算拍过）
    qs: [],
    qi: 0,
    score: [0, 0],
    out: [false, false],             // 这道题谁抢错出局了
    picks: [null, null],             // 这道题各自抢了什么 { i, mean, ok, ms }
    log: [],                         // 逐题记录，揭晓时用
    winner: -1,                      // 这道题谁抢到的
    why: '',                         // buzz 抢对了 | miss 都抢错 | timeout 超时
    qStart: 0,
    timers: { ready: 0, limit: 0, fist: 0, speak: 0 },
    taps: 0,                         // 空格按了几下（要两下）
    revealAt: 0,
    wins: [0, 0],                    // 一场里打好几轮，累计比分
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
  /** 摆阵势那一屏上名字还在改：预览里的标签跟着输入框走，别等开打了才对上号 */
  const typedName = (i) => ($(`#battleName${i + 1}`).value || '').trim() || DEFAULT_NAMES[i];
  const initial = (i) => [...nameOf(i)].slice(0, 2).join('');
  const camLive = () => B.useCam && Gesture.status().camera === 'on';
  const camReads = () => camLive() && Gesture.ready();

  function clearTimers() {
    Object.keys(B.timers).forEach((k) => { clearTimeout(B.timers[k]); B.timers[k] = 0; });
  }

  /* ════════ 偏好（名字、题数、要不要摄像头 —— 没有照片，也没有答案） ════════ */

  function loadPrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(LS) || '{}');
      if (Array.isArray(p.names)) B.names = [p.names[0] || '', p.names[1] || ''];
      if (COUNTS.includes(p.count)) B.count = p.count;
      if (typeof p.autoSpeak === 'boolean') B.autoSpeak = p.autoSpeak;
      if (typeof p.useCam === 'boolean') B.useCam = p.useCam;
    } catch { /* 存坏了就用默认值 */ }
  }
  function savePrefs() {
    try {
      localStorage.setItem(LS, JSON.stringify({
        names: B.names, count: B.count, autoSpeak: B.autoSpeak, useCam: B.useCam,
      }));
    } catch { /* 无痕模式 */ }
  }

  /* ════════ 出题 ════════ */

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

  /* ════════ 屏幕切换 ════════ */

  function show(phase) {
    B.phase = phase;
    $('#battleSetup').classList.toggle('hidden', phase !== 'setup');
    $('#battlePhoto').classList.toggle('hidden', phase !== 'photo');
    $('#battlePlay').classList.toggle('hidden', phase !== 'play');
    $('#battleResultView').classList.toggle('hidden', phase !== 'result');
    // 画面只挂在当前这一屏上，别的 <video> 摘下来，不让它在后台白解码
    if (camLive()) {
      (phase === 'setup' ? Gesture.mirrorTo : Gesture.detach)($('#battleSetupCam'));
      (phase === 'photo' ? Gesture.mirrorTo : Gesture.detach)($('#battlePhotoCam'));
      (phase === 'play'  ? Gesture.mirrorTo : Gesture.detach)($('#battleHudCam'));
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ── ① 摆阵势 ── */

  function renderSetup() {
    clearTimers();
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
    paintCam();
    show('setup');
  }

  /** 摄像头那一块的现状：开没开、模型下没下完、两只手认出来没有 */
  function paintCam() {
    const s = Gesture.status();
    const box = $('#battleCamBox');
    const on = s.camera === 'on';
    box.classList.toggle('live', on);

    const state = !Gesture.supported() ? '这台设备用不了'
      : s.camera === 'loading' ? '正在开…'
      : s.camera === 'error'   ? '打不开'
      : !on                    ? '没开'
      : s.model === 'loading'  ? '画面好了，模型下载中…'
      : s.model === 'error'    ? '只能拍照，认不了手势'
      : '手势可以用了 ✓';
    $('#battleCamState').textContent = state;
    $('#battleCamState').className = 'bs-cam-state' + (on && s.model === 'on' ? ' ok' : s.camera === 'error' || s.model === 'error' ? ' bad' : '');

    $('#battleCamBtn').textContent = on ? '关掉' : '开摄像头';
    $('#battleCamBtn').disabled = !Gesture.supported() || s.camera === 'loading';

    $('#battleCamNote').innerHTML = s.error ? esc(s.error)
      : !Gesture.supported() ? '这个浏览器拿不到摄像头 —— 用键盘照样打：玩家 1 按 <kbd>1234</kbd>，玩家 2 按 <kbd>7890</kbd>。'
      : on && s.model === 'loading' ? '第一次要下大约 8 MB 的手势模型，下完浏览器会记住。这期间先坐好位置，键盘也能直接开打。'
      : on && s.model === 'on' ? '把手伸进自己那半边画面，<b>比几根手指就是第几个选项</b>（拇指不算）。'
      : '开了就能<b>比手势抢答</b>，顺便拍开场照。不开也能打，用键盘：玩家 1 <kbd>1234</kbd>、玩家 2 <kbd>7890</kbd>。';

    $('#battleCamPrev').classList.toggle('hidden', !on);
    $('#battleCamTag1').textContent = typedName(0);
    $('#battleCamTag2').textContent = typedName(1);
    if (on) [0, 1].forEach((i) => paintChip($(`#battleCamChip${i + 1}`), Gesture.seatOf(i)));
  }

  /** 一个人此刻比的手势：认不到就是「—」 */
  function paintChip(el, n) {
    if (!el) return;
    const has = n !== null && n !== undefined;
    el.textContent = has ? (n === 0 ? `${HANDS[0]} 拳头` : `${HANDS[n]} ${n} → 第 ${n} 个`) : '— 没看到手';
    el.classList.toggle('off', !has);
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

  async function toggleCam() {
    if (Gesture.status().camera === 'on') {
      B.useCam = false;
      savePrefs();
      Gesture.stop();
      paintCam();
      return;
    }
    B.useCam = true;
    savePrefs();
    paintCam();
    try {
      await Gesture.start();
      if (!B.on) return Gesture.stop();
      Gesture.mirrorTo($('#battleSetupCam'));
    } catch { /* 出错的话 status 事件已经把话说清楚了 */ }
    paintCam();
  }

  /** 之前已经允许过摄像头的话，进来就自动开上，不用每次都点一遍 */
  async function autoCam() {
    if (!B.useCam || !Gesture.supported() || Gesture.status().camera !== 'off') return;
    try {
      const q = await navigator.permissions.query({ name: 'camera' });
      if (q.state !== 'granted') return;                 // 还没授权就别弹权限框吓人一跳
    } catch { return; }                                  // 有的浏览器查不了，那就等用户自己点
    if (!B.on || B.phase !== 'setup') return;
    try {
      await Gesture.start();
      if (!B.on) return Gesture.stop();         // 开的这几百毫秒里人已经切走了
      Gesture.mirrorTo($('#battleSetupCam'));
    } catch { /* 同上 */ }
    paintCam();
  }

  /* ── ② 开场照 ── */

  /** 开一整场（比分从 0:0 起算）：开着摄像头就先去拍照 */
  function startMatch() {
    readSetup();
    B.wins = [0, 0];
    B.rounds = 0;
    B.photos = [null, null];
    if (camLive()) renderPhoto();
    else startRound();
  }

  function renderPhoto() {
    clearTimers();
    B.photos = [null, null];
    B.shot = false;
    $('#battlePhotoTag1').textContent = nameOf(0);
    $('#battlePhotoTag2').textContent = nameOf(1);
    $('#battlePhotoCount').classList.add('hidden');
    $('#battlePhotoShots').classList.add('hidden');
    $('#battlePhotoShots').innerHTML = '';
    $('#battlePhotoActions').innerHTML = `
      <button class="btn primary big" id="battleShoot">📸 一起拍（3 秒后）</button>
      <button class="btn ghost" id="battlePhotoSkip">不拍了，直接开打</button>
      <div class="bph-hint">两个人<b>一起比 ✊</b> 也能开拍 · <kbd>Enter</kbd> 也行</div>`;
    show('photo');
  }

  function shoot() {
    if (B.phase !== 'photo' || B.timers.ready) return;
    const el = $('#battlePhotoCount');
    el.classList.remove('hidden');
    $('#battlePhotoActions').innerHTML = '<div class="bph-hint">摆好姿势 —— 一张照片切两半，各拿各的那半边</div>';
    let n = 3;
    el.textContent = n;
    const step = () => {
      if (B.phase !== 'photo') return;
      n--;
      if (n > 0) {
        el.textContent = n;
        B.timers.ready = setTimeout(step, 800);
        return;
      }
      el.textContent = '📸';
      B.timers.ready = setTimeout(() => {
        B.timers.ready = 0;
        if (B.phase !== 'photo') return;
        B.shot = true;
        B.photos = Gesture.snapshot();
        el.classList.add('hidden');
        renderShots();
      }, 420);
    };
    B.timers.ready = setTimeout(step, 800);
  }

  function renderShots() {
    const box = $('#battlePhotoShots');
    box.classList.remove('hidden');
    box.innerHTML = [0, 1].map((i) => `
      <div class="bph-shot p${i + 1}">
        <div class="bph-shot-img">${B.photos[i]
          ? `<img src="${B.photos[i]}" alt="${esc(nameOf(i))}">`
          : `<span>${esc(initial(i))}</span>`}</div>
        <div class="bph-shot-name">${esc(nameOf(i))}</div>
      </div>`).join('');
    $('#battlePhotoActions').innerHTML = `
      <button class="btn primary big" id="battleFight">⚔️ 开打</button>
      <button class="btn ghost" id="battleReshoot">📸 重拍</button>
      <div class="bph-hint">拍歪了就重拍 · 照片只在这台电脑的内存里，不上传也不存盘</div>`;
  }

  /* ── ③ 抢答 ── */

  /** 开新一轮：重新出题，比分清零（整场累计比分留着） */
  function startRound() {
    B.qs = buildQuestions(B.count);
    B.log = [];
    B.qi = 0;
    B.score = [0, 0];
    if (!B.qs.length) {                                  // 理论上不会发生，兜一下
      renderSetup();
      window.Study && Study.note('这首歌还没有可以出题的词');
      return;
    }
    buildHud();
    show('play');
    nextQuestion(true);
  }

  /** 记分牌：整局挂在上面不动，只有分数和状态在变 */
  function buildHud() {
    [0, 1].forEach((i) => {
      const face = $(`#battleFace${i + 1}`);
      face.innerHTML = B.photos[i]
        ? `<img src="${B.photos[i]}" alt="${esc(nameOf(i))}">`
        : `<span>${esc(initial(i))}</span>`;
      face.classList.toggle('nophoto', !B.photos[i]);
      $(`#battleHudName${i + 1}`).textContent = nameOf(i);
    });
    $('#battleHud').classList.toggle('cam', camLive());
    $('#battleCamWrap').classList.toggle('hidden', !camLive());
    if (camLive()) Gesture.mirrorTo($('#battleHudCam'));
    paintHud();
  }

  function paintHud() {
    [0, 1].forEach((i) => {
      $(`#battleScore${i + 1}`).textContent = B.score[i];
      const p = $(`#battleHudP${i + 1}`);
      p.classList.toggle('out', B.stage !== 'ready' && B.out[i]);
      p.classList.toggle('lead', B.score[i] > B.score[1 - i]);
      p.classList.toggle('hit', B.stage === 'reveal' && B.winner === i);
      // 摄像头认得动就显示此刻比的手势，认不动就把这个人的键位摆出来
      const cue = $(`#battleCue${i + 1}`);
      if (camReads()) paintChip(cue, Gesture.seatOf(i));
      else {
        cue.textContent = i === 0 ? '按 1 2 3 4' : '按 7 8 9 0';
        cue.classList.add('off');
      }
    });
    $('#battleHudNote').textContent = B.stage === 'race'
      ? `第 ${B.qi + 1} / ${B.qs.length} 题`
      : B.stage === 'reveal' ? '等两个人比 ✊' : 'VS';
  }

  /** 下一题：先给一拍「准备」，让两个人同时看见题面 */
  function nextQuestion(first) {
    clearTimers();
    if (!B.on) return;
    if (!first) B.qi++;
    if (B.qi >= B.qs.length) return renderResult();

    B.stage = 'ready';
    B.out = [false, false];
    B.picks = [null, null];
    B.winner = -1;
    B.why = '';
    B.taps = 0;
    TTS.stop();

    $('#battleStage').innerHTML = `
      <div class="bready">
        <div class="bready-no">第 ${B.qi + 1} / ${B.qs.length} 题</div>
        <div class="bready-go">准备</div>
        <div class="bready-sub">谁先答对，谁 +1</div>
      </div>`;
    paintHud();
    paintFoot();
    B.timers.ready = setTimeout(() => { B.timers.ready = 0; race(); }, READY_MS);
  }

  /** 题目亮出来，两个人同时开抢 */
  function race() {
    if (!B.on || B.phase !== 'play') return;
    B.stage = 'race';
    const q = B.qs[B.qi];
    const w = q.word;

    $('#battleStage').innerHTML = `
      <div class="quiz-card brace">
        <div class="brace-bar"><i id="battleBar"></i></div>
        <div class="quiz-word">
          <div class="quiz-th${w.lang === 'en' ? ' en' : ''}" id="battleTh">${esc(w.th)}</div>
          ${w.ro ? `<div class="quiz-ro">${esc(w.ro)}</div>` : ''}
          <button class="quiz-speak" id="battleSpeak" title="再听一遍">🔊 听发音</button>
        </div>
        <div class="quiz-ask">它是什么意思？<b>谁先答对算谁的</b></div>
        <div class="quiz-opts" id="battleOpts">
          ${q.options.map((m, i) =>
            `<button class="qopt" data-i="${i}" data-mean="${esc(m)}"><b>${i + 1}</b><span>${esc(m)}</span></button>`).join('')}
        </div>
      </div>`;

    B.qStart = performance.now();
    // 进度条从满到空跑 20 秒：交给 CSS 过渡，比每帧用 JS 画省事也顺滑
    const bar = $('#battleBar');
    bar.style.width = '100%';
    requestAnimationFrame(() => {
      if (B.stage !== 'race') return;
      bar.style.transition = `width ${LIMIT_MS}ms linear`;
      bar.style.width = '0%';
    });
    B.timers.limit = setTimeout(() => { B.timers.limit = 0; finish(-1, 'timeout'); }, LIMIT_MS);

    paintHud();
    paintFoot();

    if (B.autoSpeak) {
      const at = B.qi;                                     // 手快的人一秒内就抢完了，
      B.timers.speak = setTimeout(() => {                  // 那这一声不该落到下一屏上去读
        B.timers.speak = 0;
        if (B.on && B.stage === 'race' && B.qi === at) speak(w.th, w.lang, $('#battleSpeak'));
      }, 200);
    }
  }

  /**
   * 有人抢答了。
   * 答对 → 当场 +1，这题结束；答错 → 这个人出局，剩下的时间只剩另一个人能答。
   * 两个人都抢错就直接公布答案 —— 谁也别等了。
   */
  function buzz(seat, i) {
    if (B.stage !== 'race' || B.out[seat] || B.picks[seat]) return;
    const q = B.qs[B.qi];
    const mean = q.options[i];
    if (mean === undefined) return;

    const ok = mean === q.answer;
    B.picks[seat] = { i, mean, ok, ms: performance.now() - B.qStart };

    const btn = $(`#battleOpts .qopt[data-i="${i}"]`);
    if (btn) {
      btn.classList.add('picked', `p${seat + 1}`, ok ? 'right' : 'wrong');
      btn.disabled = true;
    }

    if (ok) {
      B.score[seat]++;                    // 答对了立刻加分，不等这一轮打完
      return finish(seat, 'buzz');
    }
    B.out[seat] = true;
    paintHud();
    paintFoot();
    if (B.out[0] && B.out[1]) finish(-1, 'miss');
  }

  /** 这道题收尾：停表、公布答案、等两个人一起比拳头 */
  function finish(winner, why) {
    if (B.stage !== 'race') return;
    clearTimeout(B.timers.limit); B.timers.limit = 0;
    clearTimeout(B.timers.speak); B.timers.speak = 0;
    B.stage = 'reveal';
    B.winner = winner;
    B.why = why;
    B.revealAt = performance.now();
    TTS.stop();

    const q = B.qs[B.qi];
    B.log.push({ q, picks: [B.picks[0], B.picks[1]], winner, why });

    const bar = $('#battleBar');
    if (bar) { bar.style.transition = 'none'; bar.style.width = getComputedStyle(bar).width; }

    $$('#battleOpts .qopt').forEach((b) => {
      b.disabled = true;
      if (b.dataset.mean === q.answer) b.classList.add('right');
    });

    const head = winner >= 0
      ? `<b class="p${winner + 1}">${esc(nameOf(winner))}</b> 抢到了　<em class="plus p${winner + 1}">+1</em>`
      : why === 'timeout' ? '⏱ 时间到，谁都没抢对' : '两个人都抢错了';
    const sub = winner >= 0
      ? `${fmtMs(B.picks[winner].ms)}　${B.picks[1 - winner] ? `${esc(nameOf(1 - winner))} 先抢错了一个` : `${esc(nameOf(1 - winner))} 没来得及`}`
      : `答案是 <b>${esc(q.answer)}</b>`;

    const card = $('#battleStage .quiz-card');
    if (card) card.insertAdjacentHTML('beforeend', `
      <div class="breveal ${winner >= 0 ? 'win' : 'none'}">
        <div class="brv-head">${winner >= 0 ? '🎉' : why === 'timeout' ? '⏱' : '😐'} ${head}</div>
        <div class="brv-sub">${sub}</div>
        <div class="brv-line"><b>${esc(q.word.lines[0].th)}</b><span>${esc(q.word.lines[0].cn)}</span></div>
        <div class="brv-next" id="battleNext">
          ${camReads()
            ? '两个人<b>一起比 ✊</b> 进下一题　<i>或者按两下空格</i>'
            : '按<b>两下空格</b>进下一题'}
          <span class="brv-taps" id="battleTaps"></span>
        </div>
      </div>`);

    paintHud();
    paintFoot();
    paintTaps();
    fistWatch();
  }

  /** 空格按到第几下了：两下才走，一个人按一下刚好 */
  function paintTaps() {
    const el = $('#battleTaps');
    if (el) el.innerHTML = `<i class="${B.taps > 0 ? 'on' : ''}"></i><i class="${B.taps > 1 ? 'on' : ''}"></i>`;
  }

  function tapSpace() {
    if (B.stage !== 'reveal') return;
    B.taps++;
    paintTaps();
    if (B.taps >= 2) nextQuestion();
  }

  /**
   * 两个人是不是**同时**握着拳。
   * 手势事件只在手势变了的时候来，所以每次一变就查一遍两边现在的状态：
   * 两边同时是拳头，再一起稳住 300ms 才翻页 —— 比划的过程中路过一下不算数。
   */
  function fistWatch() {
    if (B.stage !== 'reveal' || !camReads()) return;
    const both = Gesture.seatOf(0) === 0 && Gesture.seatOf(1) === 0;
    const next = $('#battleNext');
    if (!both) {
      clearTimeout(B.timers.fist); B.timers.fist = 0;
      if (next) next.classList.remove('armed');
      return;
    }
    // 刚公布答案那一下，手上多半还残着抢答的手势，先让人看清答案再说
    if (performance.now() - B.revealAt < REVEAL_LOCK_MS || B.timers.fist) return;
    if (next) next.classList.add('armed');
    B.timers.fist = setTimeout(() => {
      B.timers.fist = 0;
      if (B.stage === 'reveal' && Gesture.seatOf(0) === 0 && Gesture.seatOf(1) === 0) nextQuestion();
    }, FIST_MS);
  }

  function paintFoot() {
    const keys = `${esc(nameOf(0))} <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> · ${esc(nameOf(1))} <kbd>7</kbd><kbd>8</kbd><kbd>9</kbd><kbd>0</kbd>`;
    const hand = camReads() ? '比几根手指 = 第几个选项 · ' : '';
    $('#battleFoot').innerHTML = B.stage === 'reveal'
      ? `${camReads() ? '一起比 ✊ · ' : ''}两下 <kbd>空格</kbd> 进下一题 · <kbd>Esc</kbd> 退出`
      : `${hand}${keys} · 点选项也行（左半边算${esc(nameOf(0))}、右半边算${esc(nameOf(1))}） · <kbd>S</kbd> 再听一遍 · <kbd>Esc</kbd> 退出`;
  }

  /* ── ④ 揭晓 ── */

  function judge() {
    const win = B.score[0] === B.score[1] ? -1 : (B.score[0] > B.score[1] ? 0 : 1);
    // 抢答速度只算「抢对的那几下」：抢错的快没有意义
    const speed = [0, 1].map((i) => {
      const hits = B.log.filter((r) => r.winner === i);
      return hits.length ? hits.reduce((s, r) => s + r.picks[i].ms, 0) / hits.length : 0;
    });
    const missed = B.log.filter((r) => r.winner < 0).length;
    return { win, speed, missed };
  }

  function qRowHtml(rec, i) {
    const { q, picks, winner, why } = rec;
    const w = q.word;
    const line = w.lines[0];
    const pick = (p) => {
      const a = picks[p];
      if (!a) return `<span class="brq-pick p${p + 1} miss"><em>${esc(nameOf(p))}</em>没抢</span>`;
      return `<span class="brq-pick p${p + 1} ${a.ok ? 'ok' : 'bad'}">
        <i>${a.ok ? '✓' : '✗'}</i><em>${esc(nameOf(p))}</em>${esc(a.mean)}<u>${(a.ms / 1000).toFixed(1)}s</u></span>`;
    };
    return `
      <div class="brq${winner >= 0 ? ` won p${winner + 1}` : ' nobody'}" data-th="${esc(w.th)}">
        <div class="brq-head">
          <span class="brq-no">${i + 1}</span>
          <button class="brq-th${w.lang === 'en' ? ' en' : ''}" data-act="speak" title="点一下听发音">${esc(w.th)}</button>
          <span class="brq-ro">${esc(w.ro)}</span>
          <span class="brq-ans">${esc(q.answer)}</span>
        </div>
        <div class="brq-picks">${pick(0)}${pick(1)}${winner < 0
          ? `<span class="brq-none">${why === 'timeout' ? '超时没人答对' : '两个人都错'}</span>` : ''}</div>
        <div class="brq-line"><span class="brq-lineno">第 ${line.idx + 1} 句</span><b>${esc(line.th)}</b><span>${esc(line.cn)}</span></div>
      </div>`;
  }

  function renderResult() {
    clearTimers();
    B.stage = 'ready';                     // 这一轮的「等拳头」到此为止
    const r = judge();
    B.rounds++;
    if (r.win >= 0) B.wins[r.win]++;
    TTS.stop();

    const face = (i) => B.photos[i]
      ? `<img src="${B.photos[i]}" alt="${esc(nameOf(i))}">`
      : `<span>${esc(initial(i))}</span>`;
    const side = (i) => `
      <div class="brs-side p${i + 1}${r.win === i ? ' win' : ''}">
        <div class="brs-face${B.photos[i] ? '' : ' nophoto'}">${face(i)}${r.win === i ? '<b class="brs-crown">👑</b>' : ''}</div>
        <div class="brs-name">${esc(nameOf(i))}</div>
        <div class="brs-num">${B.score[i]}</div>
        <div class="brs-time">${r.speed[i] ? `平均 ${(r.speed[i] / 1000).toFixed(1)} 秒抢到` : '这轮没抢到题'}</div>
      </div>`;

    const verdict = r.win < 0
      ? `🤝 <b>平局</b>　${B.score[0]} : ${B.score[1]}`
      : `🏆 <b class="p${r.win + 1}">${esc(nameOf(r.win))}</b> 赢了　多抢到 ${Math.abs(B.score[0] - B.score[1])} 题`;

    $('#battleResultView').innerHTML = `
      <div class="brs-head">⚔️ 打完了</div>
      <div class="brs">${side(0)}<div class="brs-mid"><div class="brs-vs">VS</div><div class="brs-of">共 ${B.qs.length} 题</div></div>${side(1)}</div>
      <div class="brs-verdict">${verdict}</div>
      ${r.missed ? `<div class="brs-missed">有 ${r.missed} 题两个人都没抢对</div>` : ''}
      ${B.rounds > 1 ? `<div class="brs-tally">打了 ${B.rounds} 轮　总比分
        <b class="p1">${B.wins[0]}</b> : <b class="p2">${B.wins[1]}</b>
        <span>（${esc(nameOf(0))} : ${esc(nameOf(1))}）</span></div>` : ''}
      <div class="brs-listh">逐题对照　<span>点泰语听发音</span></div>
      <div class="brs-list">${B.log.map(qRowHtml).join('')}</div>
      <div class="brs-actions">
        <button class="btn primary big" id="battleAgain">⚔️ 再来一轮</button>
        ${camLive() ? '<button class="btn ghost" id="battleRephoto">📸 重拍照片</button>' : ''}
        <button class="btn ghost" id="battleToSetup">⚙️ 改名字 / 题数</button>
        <button class="btn ghost" id="battleDone">← 单词表</button>
      </div>`;
    show('result');
    $('#battleAgain').focus();
  }

  /* ════════ 事件 ════════ */

  function bind() {
    if (bound) return;
    bound = true;

    $('#battleStart').addEventListener('click', startMatch);
    $('#battleExit').addEventListener('click', () => hooks.exit());
    $('#battleCamBtn').addEventListener('click', toggleCam);
    [1, 2].forEach((n) => $(`#battleName${n}`).addEventListener('input', () => {
      $(`#battleCamTag${n}`).textContent = typedName(n - 1);
    }));

    $('#battlePhotoActions').addEventListener('click', (e) => {
      if (e.target.closest('#battleShoot'))      return shoot();
      if (e.target.closest('#battleReshoot'))    return renderPhoto();
      if (e.target.closest('#battleFight'))      return startRound();
      if (e.target.closest('#battlePhotoSkip'))  { B.photos = [null, null]; return startRound(); }
    });

    $('#battleStage').addEventListener('click', (e) => {
      const b = e.target.closest('.qopt');
      if (b && B.stage === 'race' && !b.disabled) {
        // 鼠标 / 触屏也能抢，还是「左边是玩家 1、右边是玩家 2」那套：
        // 点在这一条的左半边算玩家 1，右半边算玩家 2 —— 跟摄像头分左右是同一个道理
        const r = b.getBoundingClientRect();
        return buzz(e.clientX - r.left < r.width / 2 ? 0 : 1, parseInt(b.dataset.i, 10));
      }
      if (e.target.closest('#battleSpeak')) {
        const q = B.qs[B.qi];
        if (q && (B.stage === 'race' || B.stage === 'reveal')) speak(q.word.th, q.word.lang, $('#battleSpeak'));
      }
    });

    $('#battleResultView').addEventListener('click', (e) => {
      if (e.target.closest('#battleAgain'))    return startRound();
      if (e.target.closest('#battleRephoto'))  return renderPhoto();
      if (e.target.closest('#battleToSetup'))  return renderSetup();
      if (e.target.closest('#battleDone'))     return hooks.exit();
      const row = e.target.closest('.brq');
      if (row && e.target.closest('[data-act="speak"]')) {
        const w = Vocab.get(row.dataset.th);
        if (w) speak(w.th, w.lang, row.querySelector('.brq-th'));
      }
    });

    // ── 摄像头 ──
    Gesture.on('status', () => {
      if (!B.on) return;
      if (Gesture.status().camera !== 'on') {
        ['#battleSetupCam', '#battlePhotoCam', '#battleHudCam'].forEach((s) => Gesture.detach($(s)));
      }
      if (B.phase === 'setup') paintCam();
      if (B.phase === 'play') {
        $('#battleHud').classList.toggle('cam', camLive());
        $('#battleCamWrap').classList.toggle('hidden', !camLive());
        paintHud(); paintFoot();
      }
    });

    Gesture.on('gesture', ({ seat, count }) => {
      if (!B.on) return;
      if (B.phase === 'setup') return paintChip($(`#battleCamChip${seat + 1}`), count);
      // 拍照前两个人一起握拳 = 开拍（倒数已经开始了就别再触发一次）
      if (B.phase === 'photo') {
        if (!B.timers.ready && !B.shot && count === 0
            && Gesture.seatOf(0) === 0 && Gesture.seatOf(1) === 0) shoot();
        return;
      }
      if (B.phase !== 'play') return;
      paintHud();
      if (B.stage === 'race' && count >= 1 && count <= 4) buzz(seat, count - 1);
      else if (B.stage === 'reveal') fistWatch();
    });

    // ── 键盘：手势那套坏了、没开、认不出来，这一套永远都在 ──
    document.addEventListener('keydown', (e) => {
      if (!B.on || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
        if (e.code === 'Enter' && B.phase === 'setup') { e.preventDefault(); startMatch(); }
        return;
      }
      if (B.phase === 'setup') {
        if (e.code === 'Enter') { e.preventDefault(); startMatch(); }
        return;
      }
      if (B.phase === 'photo') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          if (e.repeat) return;
          if (B.shot) startRound(); else if (!B.timers.ready) shoot();
        }
        if (e.code === 'Escape') renderSetup();
        return;
      }
      if (B.phase === 'play') {
        if (e.code === 'Space') {
          e.preventDefault();
          if (!e.repeat) tapSpace();                 // 按住不放不算连按两下
          return;
        }
        if (B.stage === 'race') {
          for (let seat = 0; seat < 2; seat++) {
            const i = KEYS[seat][e.code];
            if (i !== undefined) { e.preventDefault(); buzz(seat, i); return; }
          }
        }
        if (e.code === 'KeyS') { e.preventDefault(); const b = $('#battleSpeak'); if (b) b.click(); return; }
        if (e.code === 'Escape' && confirm('这局不打了？已经抢到的分都不算。')) renderSetup();
        return;
      }
      if (B.phase === 'result') {
        if (e.code === 'Enter') { e.preventDefault(); startRound(); }
        if (e.code === 'Escape') hooks.exit();
      }
    });
  }

  /* ════════ 对外 ════════ */

  /** 进对战：每次都从摆阵势那一屏重新开始 */
  function open() {
    if (B.on) return;
    B.on = true;
    B.qs = [];
    B.log = [];
    B.qi = 0;
    B.score = [0, 0];
    B.photos = [null, null];
    pool = Vocab.list().filter((w) => w.mean).length;
    renderSetup();
    autoCam();
  }

  /** 出对战：这局直接作废，摄像头当场关掉，照片跟着一起没 */
  function close() {
    if (!B.on) return;
    B.on = false;
    B.phase = 'setup';
    B.stage = 'ready';
    clearTimers();
    TTS.stop();
    Gesture.stop();
    B.qs = [];
    B.log = [];
    B.photos = [null, null];
    B.qi = 0;
    B.score = [0, 0];
    $('#battleStage').innerHTML = '';
    $('#battleResultView').innerHTML = '';
    $('#battlePhotoShots').innerHTML = '';
    ['#battleSetupCam', '#battlePhotoCam', '#battleHudCam'].forEach((s) => Gesture.detach($(s)));
  }

  function init(_song, h) {
    hooks = Object.assign(hooks, h || {});
    loadPrefs();
    bind();
  }

  return { init, open, close, isOn: () => B.on };
})();
