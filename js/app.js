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
  };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // 把所有段落里的句子摊平成一维，方便上一句/下一句
  const LINES = SONG.sections.flatMap((sec) =>
    sec.lines.map((l) => ({ ...l, section: sec.name }))
  );

  const state = {
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
  const isCalibrated = () => SONG.synced || !!localStorage.getItem(LS.times);

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
    updateNowLine();
    if (state.loopOn && idx >= 0) Player.setLoop(LINES[idx].start, lineEnd(idx));
  }

  function updateNowLine() {
    const box = $('#nowLine');
    const l = LINES[state.activeIdx];
    if (!l) {
      box.innerHTML = '<span class="placeholder">按播放，歌词会跟着走 →</span>';
      return;
    }
    box.innerHTML = `
      <div class="nl-th"${l.lang === 'en' ? ' style="font-family:inherit;font-style:italic"' : ''}>${esc(l.th)}</div>
      <div class="nl-sub">${esc(l.ro ? l.ro + ' · ' : '')}${esc(l.cn)}</div>`;
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
    state.activeIdx = -1;
    setActive(indexAt(Player.getTime()));
    toast(`已保存 ${applied} 句的时间轴 ✓`);
  }

  function renderCalib() {
    const c = state.calib;
    const next = LINES[c.idx];
    $('#calibNext').textContent = next ? next.th : '🎉 全部标完了，点「保存时间轴」';
    $('#calibNext').style.fontFamily = next && next.lang === 'en' ? 'inherit' : 'var(--thai-font)';
    $('#calibProgress').textContent = `${c.idx} / ${LINES.length}`;
    $('#calibTap').disabled = c.idx >= LINES.length;

    $('#calibList').innerHTML = LINES.map((l, i) => {
      const t = c.marks[i];
      const cls = i === c.idx ? 'next' : (typeof t === 'number' ? 'marked' : 'pending');
      return `<div class="calib-row ${cls}">
        <span class="t">${typeof t === 'number' ? fmt(t) : '—'}</span>
        <span class="x">${esc(l.th)}</span>
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

    // 播放控制
    $('#btnPlay').addEventListener('click', () => Player.toggle());
    $('#btnPrev').addEventListener('click', () => step(-1));
    $('#btnNext').addEventListener('click', () => step(1));
    $('#rateSel').addEventListener('change', (e) => Player.setRate(parseFloat(e.target.value)));
    $('#btnLoop').addEventListener('click', () => toggleLoop());
    $('#btnFollow').addEventListener('click', () => {
      state.follow = !state.follow;
      $('#btnFollow').classList.toggle('active', state.follow);
      if (state.follow && state.activeIdx >= 0) {
        $(`.line[data-idx="${state.activeIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
        case 'Escape': $$('.modal').forEach((m) => m.classList.add('hidden')); break;
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
    bind();

    if (!isCalibrated()) $('#syncBanner').classList.remove('hidden');

    TTS.init();
    setTimeout(refreshVoiceUI, 100);
    setTimeout(refreshVoiceUI, 900);

    Player.load(SONG.youtubeId, 'ytplayer');
    Player.on('ready', () => {
      $('#durTime').textContent = fmt(Player.getDuration());
    });
    Player.on('state', (s) => {
      $('#btnPlay').textContent = s === 1 ? '⏸' : '▶';
    });
    Player.on('tick', (t) => {
      $('#curTime').textContent = fmt(t);
      if (!state.calib.on) setActive(indexAt(t));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
