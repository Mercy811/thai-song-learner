/**
 * App —— 主逻辑
 * 渲染歌词、驱动逐句高亮、发音、单句循环、跟读录音、时间轴校准
 */
(() => {
  'use strict';

  const SONG = window.SONGS['safe-near-me'];
  const LS = {
    times:  'tsl.times.' + SONG.id,
    done:   'tsl.done.' + SONG.id,
    view:   'tsl.view',
    theme:  'tsl.theme',
    ttsRate:'tsl.ttsRate',
    videoSize:'tsl.videoSize',
    mode:   'tsl.mode',
  };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // 把所有段落里的句子摊平成一维，方便上一句/下一句
  const LINES = SONG.sections.flatMap((sec) =>
    sec.lines.map((l) => ({ ...l, section: sec.name }))
  );

  const state = {
    mode: localStorage.getItem(LS.mode) === 'ktv' ? 'ktv' : 'practice',
    activeIdx: -1,
    follow: true,
    loopOn: false,
    ttsRate: parseFloat(localStorage.getItem(LS.ttsRate)) || 0.7,
    view: Object.assign(
      { ro: true, cn: true, mean: true, words: true },
      JSON.parse(localStorage.getItem(LS.view) || '{}')
    ),
    done: new Set(JSON.parse(localStorage.getItem(LS.done) || '[]')),
    calib: { on: false, idx: 0, marks: [] },
  };

  /* ════════ 时间轴 ════════ */

  // 本地校准过的时间优先于文件里的估算值
  function loadTimes() {
    const saved = JSON.parse(localStorage.getItem(LS.times) || 'null');
    if (saved) {
      LINES.forEach((l) => { if (typeof saved[l.id] === 'number') l.start = saved[l.id]; });
      return true;
    }
    return false;
  }
  function saveTimes() {
    const map = {};
    LINES.forEach((l) => { map[l.id] = +l.start.toFixed(2); });
    localStorage.setItem(LS.times, JSON.stringify(map));
  }
  // 补了新歌词之后，浏览器里存的旧时间轴只覆盖一部分句子；
  // 只有每一句都有时间才算校准过，否则仍然提示去校准。
  const isCalibrated = () => {
    if (SONG.synced) return true;
    const saved = JSON.parse(localStorage.getItem(LS.times) || 'null');
    return !!saved && LINES.every((l) => typeof saved[l.id] === 'number');
  };

  // 一句的结束时间 = 下一句的开始
  function lineEnd(i) {
    if (i < LINES.length - 1) return LINES[i + 1].start;
    const d = Player.getDuration();
    return d > 0 ? Math.min(LINES[i].start + 8, d) : LINES[i].start + 8;
  }

  function indexAt(t) {
    let idx = -1;
    for (let i = 0; i < LINES.length; i++) {
      if (t >= LINES[i].start - 0.15) idx = i; else break;
    }
    // 超过最后一句的结束时间就当没有当前句
    if (idx === LINES.length - 1 && t > lineEnd(idx) + 1) return -1;
    return idx;
  }

  /* ════════ 渲染 ════════ */

  function render() {
    const root = $('#lyrics');
    root.innerHTML = '';
    let n = 0;

    SONG.sections.forEach((sec) => {
      const secEl = document.createElement('section');
      secEl.className = 'section';
      secEl.innerHTML = `
        <div class="section-head">
          <h2>${esc(sec.name)}</h2>
          <span class="en">${esc(sec.nameEn || '')}</span>
          ${sec.note ? `<span class="note">${esc(sec.note)}</span>` : ''}
        </div>`;

      sec.lines.forEach((line) => {
        const i = n++;
        secEl.appendChild(lineEl(line, i));
      });
      root.appendChild(secEl);
    });
    applyView();
  }

  function lineEl(line, i) {
    const el = document.createElement('article');
    el.className = 'line' + (line.lang === 'en' ? ' en-line' : '');
    el.id = 'line-' + line.id;
    el.dataset.idx = i;
    if (state.done.has(line.id)) el.classList.add('done');

    const hasWords = line.words && line.words.length > 0;

    el.innerHTML = `
      <div class="line-head">
        <button class="line-no" title="跳到这一句">${i + 1}</button>
        <div class="line-main">
          <p class="line-th">${esc(line.th)}</p>
          ${line.ro ? `<p class="line-ro" data-f="ro">${esc(line.ro)}</p>` : ''}
          ${cnRoOf(line) ? `<p class="line-cnro" data-f="cn">${esc(cnRoOf(line))}</p>` : ''}
          <p class="line-cn" data-f="mean">${esc(line.cn)}</p>
        </div>
        <div class="line-tools">
          <button class="lbtn" data-act="speak" title="朗读整句">🔊 整句</button>
          <button class="lbtn" data-act="jump" title="跳到原曲这一句">▶ 原曲</button>
          <button class="lbtn" data-act="loop" title="单句循环这一句">🔁 循环</button>
          ${Recorder.isSupported() ? `<button class="lbtn" data-act="rec" title="录下自己的跟读">🎙 跟读</button>` : ''}
          <button class="lbtn" data-act="done" title="标记已掌握">${state.done.has(line.id) ? '✓ 已掌握' : '○ 掌握'}</button>
        </div>
      </div>
      ${hasWords ? `<div class="words" data-f="words">${line.words.map(wordHtml).join('')}</div>` : ''}
      <div class="take-row hidden" data-take></div>
    `;
    return el;
  }

  // 整句中文谐音：数据里写好的优先；没写就拿逐词的谐音拼起来。
  // 英文词的谐音位写的是「（英语）」这类说明，拼整句时用词本身代替。
  function cnRoOf(line) {
    if (line.cnRo) return line.cnRo;
    if (!line.words || !line.words.length) return '';
    const parts = line.words
      .map((w) => (w.lang === 'en' ? w.th : w.cn))
      .filter((s) => s && !/^[（(]/.test(s));
    return parts.length ? parts.join(' ') : '';
  }

  function wordHtml(w) {
    const isEn = w.lang === 'en';
    return `
      <button class="word${isEn ? ' en-word' : ''}" data-th="${esc(w.th)}" data-lang="${isEn ? 'en' : 'th'}" title="点一下听这个词">
        <div class="w-th">${esc(w.th)}</div>
        ${w.ro ? `<div class="w-ro" data-f="ro">${esc(w.ro)}</div>` : ''}
        ${w.cn ? `<div class="w-cn" data-f="cn">${esc(w.cn)}</div>` : ''}
        ${w.mean ? `<div class="w-mean" data-f="mean">${esc(w.mean)}</div>` : ''}
      </button>`;
  }

  function applyView() {
    const map = { ro: '#showRo', cn: '#showCn', mean: '#showMean', words: '#showWords' };
    Object.entries(map).forEach(([k, sel]) => {
      $(sel).checked = state.view[k];
      $$(`[data-f="${k}"]`).forEach((n) => n.classList.toggle('hidden', !state.view[k]));
    });
    localStorage.setItem(LS.view, JSON.stringify(state.view));
  }

  /* ════════ 高亮同步 ════════ */

  function setActive(idx, { scroll = true } = {}) {
    if (idx === state.activeIdx) return;
    const prev = $(`.line[data-idx="${state.activeIdx}"]`);
    if (prev) prev.classList.remove('active');

    state.activeIdx = idx;
    const cur = idx >= 0 ? $(`.line[data-idx="${idx}"]`) : null;
    if (cur) {
      cur.classList.add('active');
      if (scroll && state.follow) {
        cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    renderKtv();
    renderKtvView();
    highlightMark(idx);
    // 拖进度条的过程中不要重设单句循环，否则会被循环区间拽回去
    if (state.loopOn && idx >= 0 && !seek.dragging) Player.setLoop(LINES[idx].start, lineEnd(idx));
  }

  function scrollToActive() {
    if (!state.follow || state.activeIdx < 0) return;
    $(`.line[data-idx="${state.activeIdx}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ════════ KTV 双行显示 ════════
     槽位由句子序号决定：第 1/3/5… 句永远在槽 0（左），第 2/4/6… 句永远在槽 1（右）。
     所以正在唱的那句位置从不移动；换的永远是另一边，提前铺好下下句。
       唱第 1 句 → 左:1(亮)  右:2
       唱第 2 句 → 左:3      右:2(亮)   ← 左边换成 3
       唱第 3 句 → 左:3(亮)  右:4       ← 右边换成 4
  */
  const slotShowing = [null, null];

  function renderKtv() {
    const c = state.activeIdx;
    const base = c < 0 ? 0 : c;          // 还没开唱时先摆好第 1、2 句
    const activeSlot = base % 2;

    const want = [];
    want[activeSlot] = base;
    want[1 - activeSlot] = base + 1;

    want.forEach((lineIdx, slot) => fillSlot(slot, lineIdx, c >= 0 && lineIdx === c));
  }

  // 视图开关用的是 .hidden 类，这里只动 display，两边互不干扰
  function setRow(root, sel, text) {
    const n = root.querySelector(sel);
    n.textContent = text;
    n.style.display = text ? '' : 'none';
  }

  function fillSlot(slot, lineIdx, isLive) {
    const el = $('#slot' + slot);
    const l = LINES[lineIdx];
    const changed = slotShowing[slot] !== lineIdx;

    if (changed) {
      slotShowing[slot] = lineIdx;
      el.querySelector('.ktv-no').textContent  = l ? lineIdx + 1 : '—';
      el.querySelector('.ktv-th').textContent  = l ? l.th : '🎉 这一轮唱完了';
      // 罗马音 / 中文谐音 / 中文意思：空的那行直接收起来，别留一道空白
      setRow(el, '.ktv-ro',   l ? (l.ro || '') : '');
      setRow(el, '.ktv-cnro', l ? cnRoOf(l) : '');
      setRow(el, '.ktv-cn',   l ? (l.cn || '') : '');
      el.classList.toggle('empty', !l);
      el.classList.toggle('en-slot', !!l && l.lang === 'en');
      el.dataset.idx = l ? lineIdx : '';

      // 待唱那边换了新句子就闪一下提示；正在唱的那边不闪，免得干扰
      if (!isLive && l) {
        el.classList.remove('swapped');
        void el.offsetWidth;            // 强制重排，让动画能重播
        el.classList.add('swapped');
      }
    }

    el.querySelector('.ktv-state').textContent =
      isLive ? '正在唱' : (l ? (lineIdx === state.activeIdx + 1 ? '下一句' : '准备') : '');
    el.classList.toggle('live', isLive);
    el.classList.toggle('idle', !isLive);
  }

  /* ════════ KTV 沉浸模式：全屏，只留背景 + 当前句/下一句 ════════
     跟顶部的双行槽位用的是同一套逻辑：单数句永远在槽 0，双数句永远在槽 1，
     位置从不跳动，换的只是哪个槽亮（正在唱）。 */
  function setMode(mode) {
    state.mode = mode;
    document.body.classList.toggle('mode-ktv', mode === 'ktv');
    $('#ktvView').classList.toggle('hidden', mode !== 'ktv');
    $('#btnModePractice').classList.toggle('active', mode === 'practice');
    $('#btnModeKtv').classList.toggle('active', mode === 'ktv');
    localStorage.setItem(LS.mode, mode);
    if (mode === 'ktv') {
      renderKtvView();
    } else {
      $('#ktvDanmakuForm').classList.add('hidden');
      $('#ktvBtnDanmaku').classList.remove('on');
    }
  }

  function fillKtvViewSlot(el, line, isLive) {
    const thEl = el.querySelector('.ktv-vline-th');
    const cnroEl = el.querySelector('.ktv-vline-cnro');
    thEl.textContent = line ? line.th : '🎉 这一轮唱完了';
    cnroEl.textContent = line ? cnRoOf(line) : '';
    el.classList.toggle('en-slot', !!line && line.lang === 'en');
    el.classList.toggle('live', isLive);
  }

  function renderKtvView() {
    if (state.mode !== 'ktv') return;
    const c = state.activeIdx;
    const base = c < 0 ? 0 : c;
    const activeSlot = base % 2;

    const want = [];
    want[activeSlot] = base;
    want[1 - activeSlot] = base + 1;

    want.forEach((lineIdx, slot) => {
      fillKtvViewSlot($('#ktvSlot' + slot), LINES[lineIdx], c >= 0 && lineIdx === c);
    });
  }

  /* ════════ KTV 弹幕 + 反应特效 ════════
     没有账号系统，谁打开这个页面都能发。纯前端本地效果——
     这是个静态网站没有后端，所以弹幕只在发的人自己屏幕上飞，
     不会同步给同时在看的其他人。 */
  function initKtvInteractions() {
    const danmakuLayer = $('#ktvDanmakuLayer');
    const LANES = 6;
    let laneCursor = 0;

    function sendDanmaku(text) {
      text = text.trim();
      if (!text) return;
      const el = document.createElement('div');
      el.className = 'ktv-danmaku-item';
      el.textContent = text;
      const laneH = danmakuLayer.clientHeight / LANES;
      const lane = laneCursor % LANES;
      laneCursor++;
      el.style.top = Math.round(lane * laneH + laneH * 0.12) + 'px';
      const dur = Math.max(6, Math.min(11, 5 + text.length * 0.25));
      el.style.animationDuration = dur + 's';
      danmakuLayer.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }

    $('#ktvDanmakuForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#ktvDanmakuInput');
      sendDanmaku(input.value);
      input.value = '';
      input.focus();
    });

    $('#ktvBtnDanmaku').addEventListener('click', () => {
      const form = $('#ktvDanmakuForm');
      const willShow = form.classList.contains('hidden');
      form.classList.toggle('hidden', !willShow);
      $('#ktvBtnDanmaku').classList.toggle('on', willShow);
      if (willShow) $('#ktvDanmakuInput').focus();
    });

    const EFFECT_EMOJI = { clap: '👏', flower: '💐', slipper: '🩴', egg: '🥚' };
    const effectsLayer = $('#ktvEffectsLayer');

    function spawnEffect(kind) {
      const emoji = EFFECT_EMOJI[kind];
      if (!emoji) return;
      const el = document.createElement('div');
      el.className = 'ktv-effect';
      el.textContent = emoji;
      el.style.setProperty('--x', (18 + Math.random() * 64) + '%');
      el.style.setProperty('--y', (18 + Math.random() * 55) + '%');
      el.style.setProperty('--r', (Math.random() * 30 - 15) + 'deg');
      effectsLayer.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }

    $$('.ktv-tbtn[data-effect]').forEach((b) => {
      b.addEventListener('click', () => spawnEffect(b.dataset.effect));
    });
  }

  /* ════════ 整首歌的进度条 ════════
     点一下跳过去，按住拖着走。拖的过程中：
       · 时间、KTV、歌词高亮跟着预览，能看到会落到哪一句
       · 只在已缓冲范围内试听（seekTo 的 allowSeekAhead=false），松手才真正定位
       · 先解掉单句循环，免得刚拖出去就被循环区间拽回来，松手后按新位置重设 */
  const seek = {
    dragging: false,
    wasPlaying: false,
    scaleReady: false,   // 拿到时长之前，刻度和拖动都还不能用
    pendingTime: 0,
    raf: 0,
    markEls: [],
    activeMark: null,
  };

  function initSeek() {
    seek.el     = $('#seek');
    seek.track  = $('#seekTrack');
    seek.fill   = $('#seekFill');
    seek.buffer = $('#seekBuffer');
    seek.loopEl = $('#seekLoop');
    seek.marks  = $('#seekMarks');
    seek.thumb  = $('#seekThumb');
    seek.tip    = $('#seekTip');
    bindSeek();
  }

  // 时长要等 YouTube 播放器就绪才拿得到，拿到之后才画刻度、才让拖动生效
  function setupSeekScale() {
    const dur = Player.getDuration();
    if (dur <= 0) return;
    seek.scaleReady = true;
    $('#durTime').textContent = fmt(dur);
    seek.el.setAttribute('aria-valuemax', Math.round(dur));
    seek.el.classList.remove('disabled');
    renderSeekMarks();
    paintSeek(Player.getTime());
  }

  // 每一句一根竖线；段落第一句的更高一点
  function renderSeekMarks() {
    const dur = Player.getDuration();
    seek.marks.innerHTML = '';
    seek.markEls = [];
    seek.activeMark = null;
    if (dur <= 0) return;
    LINES.forEach((l, i) => {
      const m = document.createElement('i');
      const isSecHead = i === 0 || l.section !== LINES[i - 1].section;
      m.className = 'seek-mark' + (isSecHead ? ' sec' : '');
      m.style.left = Math.min(100, Math.max(0, (l.start / dur) * 100)) + '%';
      seek.marks.appendChild(m);
      seek.markEls.push(m);
    });
    highlightMark(state.activeIdx);
  }

  function highlightMark(idx) {
    if (!seek.markEls.length) return;
    if (seek.activeMark) seek.activeMark.classList.remove('on');
    seek.activeMark = idx >= 0 ? seek.markEls[idx] : null;
    if (seek.activeMark) seek.activeMark.classList.add('on');
  }

  function paintSeek(t) {
    const dur = Player.getDuration();
    const pct = dur > 0 ? Math.min(100, Math.max(0, (t / dur) * 100)) : 0;
    seek.fill.style.width = pct + '%';
    seek.thumb.style.left = pct + '%';
    $('#curTime').textContent = fmt(t);
    seek.el.setAttribute('aria-valuenow', Math.round(t));
    seek.el.setAttribute('aria-valuetext', `${fmt(t)} / ${fmt(dur)}`);

    seek.buffer.style.width = (Player.getLoadedFraction() * 100) + '%';

    // 单句循环的区间
    const lp = Player.getLoop();
    seek.loopEl.classList.toggle('hidden', !lp || dur <= 0);
    if (lp && dur > 0) {
      seek.loopEl.style.left  = ((lp.start / dur) * 100) + '%';
      seek.loopEl.style.width = (Math.max(0, lp.end - lp.start) / dur * 100) + '%';
    }
  }

  function timeAtX(clientX) {
    const r = seek.track.getBoundingClientRect();
    if (r.width <= 0) return 0;
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return ratio * Player.getDuration();
  }

  function showSeekTip(clientX) {
    if (!seek.scaleReady) return;
    const r = seek.track.getBoundingClientRect();
    const t = timeAtX(clientX);
    const i = indexAt(t);
    const l = LINES[i];
    $('#seekTipTime').textContent = fmt(t);
    $('#seekTipText').textContent = l ? `第 ${i + 1} 句 · ${l.cn || l.th}` : '';
    seek.tip.classList.remove('hidden');
    // 贴着边缘时别让气泡飞出播放器
    const x = Math.min(Math.max(clientX - r.left, 52), Math.max(52, r.width - 52));
    seek.tip.style.left = x + 'px';
  }
  const hideSeekTip = () => seek.tip.classList.add('hidden');

  // 拖动过程中的预览：画面跟手，音频在缓冲范围内试听
  function previewSeek(clientX) {
    const t = timeAtX(clientX);
    paintSeek(t);
    showSeekTip(clientX);
    setActive(indexAt(t), { scroll: false });

    seek.pendingTime = t;
    if (!seek.raf) {
      seek.raf = requestAnimationFrame(() => {
        seek.raf = 0;
        if (seek.dragging) Player.seek(seek.pendingTime, false, false);
      });
    }
  }

  // 真正落到某个时间点：定位 + 让歌词、KTV、循环区间都跟着对上
  function applySeek(t, andPlay) {
    Player.seek(t, andPlay, true);
    const idx = indexAt(t);
    setActive(idx, { scroll: false });
    if (state.loopOn && idx >= 0) Player.setLoop(LINES[idx].start, lineEnd(idx));
    paintSeek(t);          // 放在最后：循环区间变了，进度条要照新的画
    scrollToActive();
  }

  function endSeek(clientX) {
    if (!seek.dragging) return;
    seek.dragging = false;
    seek.el.classList.remove('dragging');
    hideSeekTip();
    // 松手前是在放就接着放，本来暂停着就还暂停着
    applySeek(timeAtX(clientX), seek.wasPlaying);
  }

  function bindSeek() {
    seek.el.addEventListener('pointerdown', (e) => {
      if (!seek.scaleReady) return;
      e.preventDefault();
      seek.el.focus();
      // 捕获指针，手指/鼠标滑出进度条也能继续拖
      try { seek.el.setPointerCapture(e.pointerId); } catch { /* 个别浏览器不支持就算了 */ }
      seek.dragging = true;
      seek.wasPlaying = Player.isPlaying();
      seek.el.classList.add('dragging');
      Player.clearLoop();
      previewSeek(e.clientX);
    });

    seek.el.addEventListener('pointermove', (e) => {
      if (seek.dragging) previewSeek(e.clientX);
      else showSeekTip(e.clientX);
    });

    seek.el.addEventListener('pointerup', (e) => endSeek(e.clientX));
    seek.el.addEventListener('pointercancel', (e) => endSeek(e.clientX));
    seek.el.addEventListener('pointerleave', () => { if (!seek.dragging) hideSeekTip(); });

    // 进度条上按 ←/→ 是快退快进 5 秒，不走全局的「上一句/下一句」
    seek.el.addEventListener('keydown', (e) => {
      const dur = Player.getDuration();
      if (!seek.scaleReady || dur <= 0) return;
      const now = Player.getTime();
      let t;
      if (e.code === 'ArrowLeft' || e.code === 'ArrowDown')  t = now - 5;
      else if (e.code === 'ArrowRight' || e.code === 'ArrowUp') t = now + 5;
      else if (e.code === 'Home') t = 0;
      else if (e.code === 'End')  t = Math.max(0, dur - 1);
      else return;
      e.preventDefault();
      e.stopPropagation();
      applySeek(Math.min(dur, Math.max(0, t)), Player.isPlaying());
    });
  }

  /* ════════ 发音 ════════ */

  let speakingEl = null;
  function markSpeaking(el) {
    if (speakingEl) speakingEl.classList.remove('speaking');
    speakingEl = el || null;
    if (speakingEl) speakingEl.classList.add('speaking');
  }

  function speakLine(line, btn) {
    TTS.unlock();
    markSpeaking(btn);
    TTS.speak(line.th, {
      lang: line.lang === 'en' ? 'en' : 'th',
      rate: state.ttsRate,
      onend: () => markSpeaking(null),
      onerror: () => markSpeaking(null),
    });
  }

  function speakWord(text, lang, el) {
    TTS.unlock();
    markSpeaking(el);
    TTS.speak(text, {
      lang,
      rate: Math.max(0.4, state.ttsRate - 0.05),
      onend: () => markSpeaking(null),
      onerror: () => markSpeaking(null),
    });
  }

  function refreshVoiceUI() {
    const dot = $('#voiceDot');
    const has = TTS.hasThai();
    dot.className = 'dot ' + (!TTS.isSupported() ? 'bad' : has ? 'ok' : 'warn');

    // 声音下拉
    const sel = $('#voiceSel');
    sel.innerHTML = '';
    const list = TTS.getThaiVoices();
    if (!list.length) {
      sel.innerHTML = '<option>（未检测到泰语声音）</option>';
      sel.disabled = true;
    } else {
      sel.disabled = false;
      const cur = TTS.getSelectedThaiVoice();
      list.forEach((v) => {
        const o = document.createElement('option');
        o.value = v.voiceURI;
        o.textContent = `${v.name} (${v.lang})${v.localService ? ' · 本地' : ' · 在线'}`;
        if (cur && v.voiceURI === cur.voiceURI) o.selected = true;
        sel.appendChild(o);
      });
    }

    // 状态卡
    const st = $('#voiceStatus');
    if (!TTS.isSupported()) {
      st.className = 'voice-status bad';
      st.innerHTML = '这个浏览器不支持语音合成。建议换 <b>Chrome</b>、<b>Edge</b> 或 <b>Safari</b> 打开。';
    } else if (has) {
      st.className = 'voice-status ok';
      st.innerHTML = `✅ 检测到 <b>${list.length}</b> 个泰语声音，可以正常发音。点歌词里的 🔊 或任意单词就能听。`;
    } else {
      st.className = 'voice-status bad';
      st.innerHTML = '⚠️ 没有检测到泰语声音，点 🔊 可能没声音或读成别的语言。按下面的步骤装一次就好了。';
    }

    // 安装指引
    const hint = TTS.installHint();
    const helpHtml = `
      <h4>${esc(hint.platform)}</h4>
      <ol>${hint.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <h4>其他办法</h4>
      <ol>
        <li>电脑上用 <b>Chrome</b> 打开本站，它自带在线泰语语音，通常不用额外装</li>
        <li>装好之后要<b>刷新页面</b>才会被检测到</li>
      </ol>`;
    $('#voiceHelp').innerHTML = helpHtml;
    $('#voiceBannerText').textContent = `在${hint.platform}上这样装泰语语音：`;
    $('#voiceBannerSteps').innerHTML = hint.steps.map((s) => `<li>${esc(s)}</li>`).join('');

    const dismissed = sessionStorage.getItem('tsl.voiceBannerHidden');
    $('#voiceBanner').classList.toggle('hidden', has || !!dismissed || !TTS.isSupported());
  }

  /* ════════ 校准 ════════ */

  function openCalib() {
    state.calib = { on: true, idx: 0, marks: [] };
    $('#calibModal').classList.remove('hidden');
    renderCalib();
    Player.clearLoop();
    Player.seek(0, true);
  }
  function closeCalib() {
    state.calib.on = false;
    $('#calibModal').classList.add('hidden');
  }

  function calibMark() {
    const c = state.calib;
    if (c.idx >= LINES.length) return;
    c.marks[c.idx] = Math.max(0, Player.getTime());
    c.idx++;
    renderCalib();
    if (c.idx >= LINES.length) Player.pause();
  }
  function calibBack() {
    const c = state.calib;
    if (c.idx > 0) { c.idx--; c.marks[c.idx] = undefined; renderCalib(); }
  }
  function calibRestart() {
    state.calib.idx = 0; state.calib.marks = [];
    Player.seek(0, true);
    renderCalib();
  }
  function calibSave() {
    const c = state.calib;
    let applied = 0;
    c.marks.forEach((t, i) => {
      if (typeof t === 'number') { LINES[i].start = t; applied++; }
    });
    if (!applied) { alert('还没有标记任何一句。'); return; }
    // 同步回原始 SONG 对象，导出时用得上
    let k = 0;
    SONG.sections.forEach((s) => s.lines.forEach((l) => { l.start = LINES[k++].start; }));
    saveTimes();
    closeCalib();
    $('#syncBanner').classList.add('hidden');
    renderSeekMarks();          // 刻度按新时间轴重画
    state.activeIdx = -1;
    setActive(indexAt(Player.getTime()));
    toast(`已保存 ${applied} 句的时间轴 ✓`);
  }

  function renderCalib() {
    const c = state.calib;
    const next = LINES[c.idx];
    const done = c.idx >= LINES.length;

    // 当前要标的句子：泰文 + 罗马音 + 中文，三行都给
    $('#calibNext').textContent = done ? '🎉 全部标完了，点「保存时间轴」' : next.th;
    $('#calibNext').style.fontFamily = (done || next.lang === 'en') ? 'inherit' : 'var(--thai-font)';
    $('#calibNextRo').textContent   = done ? '' : (next.ro || '');
    $('#calibNextCnRo').textContent = done ? '' : cnRoOf(next);
    $('#calibNextCn').textContent   = done ? '' : (next.cn || '');
    $('#calibListen').classList.toggle('hidden', done);

    // 预告再下一句，好提前准备
    const after = LINES[c.idx + 1];
    $('#calibUpcoming').innerHTML = (!done && after)
      ? `<span class="u-label">接下来 →</span>
         <span class="u-th"${after.lang === 'en' ? ' style="font-family:inherit;font-style:italic"' : ''}>${esc(after.th)}</span>
         <span class="u-cn">（${esc(after.cn)}）</span>`
      : '';

    $('#calibProgress').textContent = `${c.idx} / ${LINES.length}`;
    $('#calibTap').disabled = done;

    $('#calibList').innerHTML = LINES.map((l, i) => {
      const t = c.marks[i];
      const cls = i === c.idx ? 'next' : (typeof t === 'number' ? 'marked' : 'pending');
      const sub = [l.ro, l.cn].filter(Boolean).join(' · ');
      return `<div class="calib-row ${cls}${l.lang === 'en' ? ' en-row' : ''}">
        <span class="t">${typeof t === 'number' ? fmt(t) : '—'}</span>
        <span class="body">
          <span class="x">${esc(l.th)}</span>
          <span class="y">${esc(sub)}</span>
        </span>
      </div>`;
    }).join('');
    const nextRow = $('#calibList .calib-row.next');
    if (nextRow) nextRow.scrollIntoView({ block: 'nearest' });
  }

  function exportTimes() {
    const lines = [];
    let k = 0;
    SONG.sections.forEach((sec) => {
      lines.push(`// ${sec.name}`);
      sec.lines.forEach((l) => {
        lines.push(`  ${l.id.padEnd(8)} start: ${LINES[k].start.toFixed(2)},`);
        k++;
      });
    });
    $('#exportText').value =
      `// 把这些 start 值填回 songs/safe-near-me.js 对应的句子里\n` +
      `// 并把顶部的 synced 改成 true\n\n` + lines.join('\n');
    $('#exportModal').classList.remove('hidden');
  }

  /* ════════ 事件 ════════ */

  function bind() {
    // 歌词区事件委托
    $('#lyrics').addEventListener('click', (e) => {
      const wordBtn = e.target.closest('.word');
      if (wordBtn) {
        speakWord(wordBtn.dataset.th, wordBtn.dataset.lang, wordBtn);
        return;
      }
      const lineNode = e.target.closest('.line');
      if (!lineNode) return;
      const idx = +lineNode.dataset.idx;
      const line = LINES[idx];

      if (e.target.closest('.line-no')) { jumpTo(idx); return; }

      const btn = e.target.closest('.lbtn');
      if (!btn) return;
      const act = btn.dataset.act;

      if (act === 'speak') speakLine(line, btn);
      else if (act === 'jump') jumpTo(idx);
      else if (act === 'loop') { setActive(idx, { scroll: false }); toggleLoop(true); jumpTo(idx); }
      else if (act === 'done') toggleDone(line, lineNode, btn);
      else if (act === 'rec') toggleRec(line, lineNode, btn);
    });

    // KTV 面板：点喇叭读这句，点面板跳到这句
    $$('.ktv-speak').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = +b.closest('.ktv-slot').dataset.idx;
      if (LINES[idx]) speakLine(LINES[idx], b);
    }));
    $$('.ktv-slot').forEach((s) => s.addEventListener('click', () => {
      const idx = +s.dataset.idx;
      if (LINES[idx]) jumpTo(idx);
    }));

    // 练习 / KTV 模式切换
    $('#btnModePractice').addEventListener('click', () => setMode('practice'));
    $('#btnModeKtv').addEventListener('click', () => setMode('ktv'));
    $('#ktvExit').addEventListener('click', () => setMode('practice'));
    $('#ktvPlayPause').addEventListener('click', () => Player.toggle());
    $('#ktvBg').addEventListener('click', () => Player.toggle());

    // 画面大小：只要声音 / 小窗 / 大窗
    const vs = $('#videoSize');
    const savedSize = localStorage.getItem(LS.videoSize) || 'off';
    vs.value = savedSize;
    $('#videoBox').dataset.size = savedSize;
    vs.addEventListener('change', (e) => {
      $('#videoBox').dataset.size = e.target.value;
      localStorage.setItem(LS.videoSize, e.target.value);
    });

    // 播放控制
    $('#btnPlay').addEventListener('click', () => Player.toggle());
    $('#btnPrev').addEventListener('click', () => step(-1));
    $('#btnNext').addEventListener('click', () => step(1));
    $('#rateSel').addEventListener('change', (e) => Player.setRate(parseFloat(e.target.value)));
    $('#btnLoop').addEventListener('click', () => toggleLoop());
    $('#btnFollow').addEventListener('click', () => {
      state.follow = !state.follow;
      $('#btnFollow').classList.toggle('active', state.follow);
      scrollToActive();
    });

    // 视图开关
    [['#showRo', 'ro'], ['#showCn', 'cn'], ['#showMean', 'mean'], ['#showWords', 'words']]
      .forEach(([sel, key]) => {
        $(sel).addEventListener('change', (e) => { state.view[key] = e.target.checked; applyView(); });
      });

    // 朗读语速
    const rate = $('#ttsRate');
    rate.value = state.ttsRate;
    $('#ttsRateVal').textContent = state.ttsRate.toFixed(2).replace(/0$/, '');
    rate.addEventListener('input', (e) => {
      state.ttsRate = parseFloat(e.target.value);
      $('#ttsRateVal').textContent = state.ttsRate.toFixed(2).replace(/0$/, '');
      localStorage.setItem(LS.ttsRate, state.ttsRate);
    });

    // 弹窗
    $('#btnVoice').addEventListener('click', () => { refreshVoiceUI(); $('#voiceModal').classList.remove('hidden'); });
    $('#btnCalib').addEventListener('click', openCalib);
    $$('[data-close]').forEach((b) => b.addEventListener('click', () => {
      const m = b.closest('.modal');
      if (m.id === 'calibModal') closeCalib(); else m.classList.add('hidden');
    }));
    $$('.modal').forEach((m) => m.addEventListener('click', (e) => {
      if (e.target === m) { if (m.id === 'calibModal') closeCalib(); else m.classList.add('hidden'); }
    }));

    $('#voiceSel').addEventListener('change', (e) => TTS.selectThaiVoice(e.target.value));
    $('#btnTestVoice').addEventListener('click', () => { TTS.unlock(); TTS.speak('สวัสดีค่ะ', { lang: 'th', rate: state.ttsRate }); });
    $('#btnTestLine').addEventListener('click', () => { TTS.unlock(); TTS.speak(LINES[0].th, { lang: 'th', rate: state.ttsRate }); });

    $('#voiceBannerClose').addEventListener('click', () => {
      $('#voiceBanner').classList.add('hidden');
      sessionStorage.setItem('tsl.voiceBannerHidden', '1');
    });
    $('#syncBannerClose').addEventListener('click', () => $('#syncBanner').classList.add('hidden'));

    // 校准
    $('#calibTap').addEventListener('click', calibMark);
    $('#calibListen').addEventListener('click', () => {
      const l = LINES[state.calib.idx];
      if (l) speakLine(l, $('#calibListen'));
    });
    $('#calibBack').addEventListener('click', calibBack);
    $('#calibRestart').addEventListener('click', calibRestart);
    $('#calibSave').addEventListener('click', calibSave);
    $('#calibExport').addEventListener('click', () => {
      // 先把当前标记应用上再导出
      state.calib.marks.forEach((t, i) => { if (typeof t === 'number') LINES[i].start = t; });
      exportTimes();
    });
    $('#btnCopyExport').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText($('#exportText').value);
        toast('已复制 ✓');
      } catch { $('#exportText').select(); }
    });

    // 主题
    $('#btnTheme').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = cur;
      localStorage.setItem(LS.theme, cur);
    });

    // 快捷键
    document.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      if (typing) return;

      if (state.calib.on) {
        if (e.code === 'Space') { e.preventDefault(); calibMark(); }
        else if (e.code === 'Backspace') { e.preventDefault(); calibBack(); }
        else if (e.code === 'Escape') closeCalib();
        return;
      }

      switch (e.code) {
        case 'Space':      e.preventDefault(); Player.toggle(); break;
        case 'ArrowLeft':  e.preventDefault(); step(-1); break;
        case 'ArrowRight': e.preventDefault(); step(1); break;
        case 'KeyR':       toggleLoop(); break;
        case 'KeyS': {
          const l = LINES[state.activeIdx];
          if (l) speakLine(l, $(`.line[data-idx="${state.activeIdx}"] [data-act="speak"]`));
          break;
        }
        case 'Escape':
          if (state.mode === 'ktv') setMode('practice');
          $$('.modal').forEach((m) => m.classList.add('hidden'));
          break;
      }
    });

    document.addEventListener('tts:voiceschanged', refreshVoiceUI);
    document.addEventListener('rec:saved', (e) => renderTake(e.detail.lineId));
  }

  function jumpTo(idx) {
    setActive(idx, { scroll: false });
    Player.seek(LINES[idx].start, true);
    if (state.loopOn) Player.setLoop(LINES[idx].start, lineEnd(idx));
  }

  function step(d) {
    const cur = state.activeIdx < 0 ? 0 : state.activeIdx;
    const next = Math.min(LINES.length - 1, Math.max(0, cur + d));
    jumpTo(next);
  }

  function toggleLoop(force) {
    state.loopOn = force !== undefined ? force : !state.loopOn;
    $('#btnLoop').classList.toggle('active', state.loopOn);
    if (state.loopOn) {
      const i = state.activeIdx >= 0 ? state.activeIdx : 0;
      Player.setLoop(LINES[i].start, lineEnd(i));
    } else {
      Player.clearLoop();
    }
  }

  function toggleDone(line, node, btn) {
    if (state.done.has(line.id)) { state.done.delete(line.id); btn.textContent = '○ 掌握'; }
    else { state.done.add(line.id); btn.textContent = '✓ 已掌握'; }
    node.classList.toggle('done', state.done.has(line.id));
    localStorage.setItem(LS.done, JSON.stringify([...state.done]));
  }

  async function toggleRec(line, node, btn) {
    if (Recorder.isRecording()) {
      Recorder.stop();
      $$('.lbtn.rec').forEach((b) => { b.classList.remove('rec'); b.textContent = '🎙 跟读'; });
      return;
    }
    try {
      await Recorder.start(line.id);
      btn.classList.add('rec');
      btn.textContent = '⏹ 停止';
    } catch (err) {
      alert('拿不到麦克风权限，没法录音。\n浏览器地址栏点一下麦克风图标允许一下，或者换用 Chrome / Safari。');
    }
  }

  function renderTake(lineId) {
    $$('.lbtn.rec').forEach((b) => { b.classList.remove('rec'); b.textContent = '🎙 跟读'; });
    const node = $('#line-' + lineId);
    if (!node) return;
    const row = node.querySelector('[data-take]');
    row.classList.remove('hidden');
    row.innerHTML = `
      <button class="lbtn" data-play-take>▶ 听我刚才读的</button>
      <span>录音只存在这个页面，刷新就没了</span>`;
    row.querySelector('[data-play-take]').addEventListener('click', () => Recorder.playTake(lineId));
  }

  /* ════════ 工具 ════════ */

  // 把吸顶区的实际高度写进 CSS 变量，供 .line 的 scroll-margin-top 用。
  // 高度会随「画面」档位、窗口宽度、歌词长短变化，所以用 ResizeObserver 持续跟。
  function watchDeckHeight() {
    const deck = $('.stickydeck');
    if (!deck) return;
    const apply = () => {
      const h = Math.round(deck.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--deck-h', h + 'px');
    };
    apply();
    if (window.ResizeObserver) new ResizeObserver(apply).observe(deck);
    window.addEventListener('resize', apply);
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmt(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  let toastTimer;
  function toast(msg) {
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = `position:fixed;left:50%;bottom:28px;transform:translateX(-50%);
        background:var(--text);color:var(--bg);padding:11px 20px;border-radius:999px;
        font-size:13.5px;z-index:200;box-shadow:var(--shadow-lg);pointer-events:none;
        transition:opacity .25s;`;
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 1900);
  }

  /* ════════ 启动 ════════ */

  function init() {
    // 主题
    const savedTheme = localStorage.getItem(LS.theme);
    document.documentElement.dataset.theme = savedTheme
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    // 标题
    $('#songTitle').textContent = SONG.title;
    $('#songTitleTh').textContent = SONG.titleTh;
    $('#songArtist').textContent = `${SONG.artist} · ${SONG.album}`;
    document.title = `${SONG.title} — 泰语逐句跟读`;

    loadTimes();
    render();
    initSeek();
    bind();
    renderKtv();
    setMode(state.mode);
    initKtvInteractions();
    watchDeckHeight();

    if (!isCalibrated()) $('#syncBanner').classList.remove('hidden');

    TTS.init();
    setTimeout(refreshVoiceUI, 100);
    setTimeout(refreshVoiceUI, 900);

    Player.load(SONG.youtubeId, 'ytplayer');
    Player.on('ready', setupSeekScale);
    Player.on('state', (s) => {
      const icon = s === 1 ? '⏸' : '▶';
      $('#btnPlay').textContent = icon;
      $('#ktvPlayPause').textContent = icon;
      // 有些情况下 onReady 时还拿不到时长，换视频状态后再补一次
      if (!seek.scaleReady) setupSeekScale();
    });
    Player.on('tick', (t) => {
      if (!seek.scaleReady) setupSeekScale();
      if (seek.dragging) return;      // 拖动时以手指为准，别被播放器的旧时间盖回去
      paintSeek(t);
      if (!state.calib.on) setActive(indexAt(t));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
