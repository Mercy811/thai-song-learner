/**
 * App —— 主逻辑
 * 渲染歌词、驱动逐句高亮、发音、单句循环、跟读录音、时间轴校准
 */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const LS_SONG  = 'tsl.song';
  const LS_THEME = 'tsl.theme';
  // 顶栏 / 播放器要不要吸顶是全局偏好，跟主题一样不分歌
  const LS_PIN_TOPBAR = 'tsl.pinTopbar';
  const LS_PIN_DECK   = 'tsl.pinDeck';
  const SONG_IDS = Object.keys(window.SONGS || {});
  const displaySongTitle = (song) => I18n.language === 'en' ? (song.title || song.titleCn) : (song.titleCn || song.title);

  // 主题在首页、歌曲页、词频页、覆盖率页共用，都要先套上，别等进了某个页面才生效
  document.documentElement.dataset.theme = localStorage.getItem(LS_THEME)
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function toggleTheme() {
    const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = cur;
    localStorage.setItem(LS_THEME, cur);
  }

  // 换到某首歌：首页卡片、词频表点歌名跳转都用这个
  function gotoSong(id) {
    if (!window.SONGS[id]) return;
    localStorage.setItem(LS_SONG, id);
    location.href = location.pathname + '?song=' + encodeURIComponent(id);
  }

  /* ── 站内导航抽屉 ──
     跟具体在看哪首歌无关，每个页面（首页/歌曲页/词频页/覆盖率页）都挂着同一个，
     点汉堡图标弹出来，三个入口之间随便跳，都是整页跳转（改 URL），不是页内切换。 */
  function bindDrawer() {
    const overlay = $('#drawerOverlay');
    const drawer = $('#drawer');
    const fab = $('#btnNav');
    if (!overlay || !drawer || !fab) return;

    const open = () => {
      overlay.classList.remove('hidden');
      drawer.classList.remove('hidden');
      requestAnimationFrame(() => drawer.classList.add('open'));
      fab.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      drawer.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
      setTimeout(() => {
        overlay.classList.add('hidden');
        drawer.classList.add('hidden');
      }, 200);
    };

    fab.addEventListener('click', open);
    overlay.addEventListener('click', close);
    $('#drawerClose').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && drawer.classList.contains('open')) close();
    });
  }
  bindDrawer();

  // 登录注册跟具体在哪个页面无关（首页/歌曲页/词频页/覆盖率页/记忆课都有登录入口），
  // 所以跟导航抽屉一样在页面分流之前就初始化
  if (window.Auth) Auth.init();

  /* ── 顶层路由：首页 / 某首歌 / 词频总表 / 覆盖率曲线 ──
     后两个是全站范围的东西，跟哪首歌无关，所以跟首页一样是独立页面
     （靠 URL 上的 ?page= 区分，不是挂在某首歌的模式栏下面），
     每次跳转都是整页刷新，各自管自己的 DOM，互不依赖。 */
  const params = new URLSearchParams(location.search);
  const pageParam = params.get('page');
  const explicitId = params.get('song');

  document.body.dataset.page = pageParam === 'freq' ? 'freq'
    : pageParam === 'science' ? 'science'
    : pageParam === 'lessons' ? 'lessons'
    : (explicitId && window.SONGS[explicitId]) ? 'song' : 'home';

  // 词频页 / 覆盖率页共用的收尾：把歌曲页那一整套（播放器、歌词、页脚……）和首页都收起来
  function hideForStandalonePage() {
    $('.topbar').classList.add('hidden');
    $('.stickydeck').classList.add('hidden');
    $('.viewbar').classList.add('hidden');
    $('#lyrics').classList.add('hidden');
    $('.foot').classList.add('hidden');
    $('#homeView').classList.add('hidden');
  }

  if (pageParam === 'freq') {
    document.title = '词频总表 — 泰语歌逐句跟读';
    hideForStandalonePage();
    $('#freqPageView').classList.remove('hidden');
    $('#btnThemeFreq').addEventListener('click', toggleTheme);
    WordFreq.init(gotoSong);
    return;
  }
  if (pageParam === 'science') {
    document.title = '词频覆盖率曲线 — 泰语歌逐句跟读';
    hideForStandalonePage();
    $('#sciencePageView').classList.remove('hidden');
    $('#btnThemeScience').addEventListener('click', toggleTheme);
    Science.init();
    return;
  }
  if (pageParam === 'lessons') {
    document.title = '记忆课 — 泰语歌逐句跟读';
    hideForStandalonePage();
    $('#lessonsPageView').classList.remove('hidden');
    $('#btnThemeLessons').addEventListener('click', toggleTheme);
    TTS.init();
    Lessons.init();
    return;
  }

  /* ── 首页：曲库一览 ──
     一进站先看到所有支持的歌，每首一张卡（YouTube 封面当预览），
     点进去才走 ?song=id 加载那一首。只有带着 ?song= 打开才直接进某首歌
     （分享链接、或从某首歌切到另一首）。 */
  if (!explicitId || !window.SONGS[explicitId]) {
    initHome();
    return;
  }

  /* ── 当前是哪首歌 ──
     songs/ 下每个文件往 window.SONGS 里塞一首，index.html 里的引入顺序 = 选歌列表顺序。
     选中的歌记在 localStorage，方便首页把「上次在学」标出来。 */
  const SONG = window.SONGS[explicitId];
  localStorage.setItem(LS_SONG, SONG.id);

  // 有的歌只做练习模式（timeline: false）：没有逐句时间轴，
  // 不自动跟随、不做 KTV、不做校准，歌词自己手动往下滑。
  const HAS_TIMELINE = SONG.timeline !== false;

  const LS = {
    // 时间轴是跟着音源走的：换了音源，浏览器里存的旧校准就不该再盖上来，
    // 所以 key 带上视频 id（旧的那份还在，只是不再生效）
    times:  'tsl.times.' + SONG.id + '.' + SONG.youtubeId,
    // 上面存的是每句的秒数（没标到的句子沿用文件里的估算值），
    // 这里单独记「哪些句子是真的跟着歌标过的」，好知道还剩多少没标
    marked: 'tsl.marked.' + SONG.id + '.' + SONG.youtubeId,
    done:   'tsl.done.' + SONG.id,
    view:   'tsl.view',
    ttsRate:'tsl.ttsRate',
    videoSize:'tsl.videoSize',
    mode:   'tsl.mode',
    ktvBg:  'tsl.ktvBg',
  };

  // 把所有段落里的句子摊平成一维，方便上一句/下一句
  const LINES = SONG.sections.flatMap((sec) =>
    sec.lines.map((l) => ({ ...l, section: I18n.language === 'en' ? (sec.nameEn || sec.name) : sec.name }))
  );

  const state = {
    // 记住上次用的模式：KTV 得有时间轴才给进；
    // 单词模式跟时间轴没关系，哪首歌都能进
    mode: (() => {
      const saved = localStorage.getItem(LS.mode);
      if (saved === 'study') return 'study';
      return HAS_TIMELINE && saved === 'ktv' ? 'ktv' : 'practice';
    })(),
    activeIdx: -1,
    follow: true,
    loopOn: false,
    ttsRate: parseFloat(localStorage.getItem(LS.ttsRate)) || 0.7,
    // uku（尤克里里和弦）默认关着：不弹琴的人不需要多这一行
    view: Object.assign(
      // 罗马音默认开、中文谐音默认关——跟网站其它地方（单词测验等）的默认一致，
      // 中文谐音现在不够好懂，想看的人自己勾选
      { ro: true, cn: false, mean: true, words: true, uku: false },
      JSON.parse(localStorage.getItem(LS.view) || '{}')
    ),
    done: new Set(JSON.parse(localStorage.getItem(LS.done) || '[]')),
    calib: { on: false, idx: 0, marks: [] },
    // 顶栏默认不固定（原本的设计：滚走把屏幕留给歌词），播放器默认固定（原本一直吸顶）
    pinTopbar: localStorage.getItem(LS_PIN_TOPBAR) === '1',
    pinDeck: localStorage.getItem(LS_PIN_DECK) !== '0',
    // KTV 背景放不放 MV，默认放
    ktvBg: localStorage.getItem(LS.ktvBg) !== '0',
  };

  /* ════════ 时间轴 ════════ */

  // 本地校准过的时间优先于文件里的估算值。
  // LINES 是 SONG 摊平出来的副本，两边都要写：单词模式的「🎵 放原句」和校准面板的
  // 「导出」读的是 SONG，只写 LINES 的话，刷新之后那两处又会退回文件里的估算值。
  function loadTimes() {
    const saved = JSON.parse(localStorage.getItem(LS.times) || 'null');
    if (!saved) return false;
    const apply = (l) => { if (typeof saved[l.id] === 'number') l.start = saved[l.id]; };
    LINES.forEach(apply);
    SONG.sections.forEach((sec) => sec.lines.forEach(apply));
    return true;
  }
  function saveTimes() {
    const map = {};
    // 没时间的句子（歌词文件里漏了 start、又还没标到）先跳过，别写个 null 进去
    LINES.forEach((l) => { if (typeof l.start === 'number') map[l.id] = +l.start.toFixed(2); });
    localStorage.setItem(LS.times, JSON.stringify(map));
    return map;
  }
  // 标过的句子（校准面板里按过一次的那些），中途保存也不会丢
  const loadMarked = () => new Set(JSON.parse(localStorage.getItem(LS.marked) || '[]'));

  /** 登录用户：这首歌的时间轴校准结果跟云端对一次。
      云端有 → 云端说了算（换设备/浏览器登录进来看到同一份校准结果）；
      云端还没有、本地倒是标过 → 第一次登录，把本地这份传上去。 */
  async function syncCalibFromCloud() {
    if (!window.Sync || !window.Auth || !window.Auth.isLoggedIn() || !HAS_TIMELINE) return;
    const cloud = await window.Sync.pullTimelineCalib(SONG.id, SONG.youtubeId);
    if (cloud && cloud.times && Object.keys(cloud.times).length) {
      try {
        localStorage.setItem(LS.times, JSON.stringify(cloud.times));
        localStorage.setItem(LS.marked, JSON.stringify(cloud.marked || []));
      } catch { /* 无痕模式 */ }
      loadTimes();
      render();
      renderSeekMarks();
    } else {
      const localTimes = JSON.parse(localStorage.getItem(LS.times) || 'null');
      if (localTimes && Object.keys(localTimes).length) {
        const localMarked = JSON.parse(localStorage.getItem(LS.marked) || '[]');
        window.Sync.pushTimelineCalib(SONG.id, SONG.youtubeId, localTimes, localMarked);
      }
    }
  }

  /** 登录用户：这首歌「已掌握」的句子跟云端对一次，逻辑跟上面一样 */
  async function syncDoneFromCloud() {
    if (!window.Sync || !window.Auth || !window.Auth.isLoggedIn()) return;
    const cloud = await window.Sync.pullLineDone(SONG.id);
    if (cloud && cloud.length) {
      state.done = new Set(cloud);
      try { localStorage.setItem(LS.done, JSON.stringify(cloud)); } catch { /* 无痕模式 */ }
      render();
    } else if (state.done.size) {
      window.Sync.pushLineDone(SONG.id, [...state.done]);
    }
  }

  function syncProgressFromCloud() {
    syncCalibFromCloud();
    syncDoneFromCloud();
  }
  // 登录状态变化（刚登录、换了账号、退出）时，跟云端重新对一次
  if (window.Auth) window.Auth.onChange(syncProgressFromCloud);

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
          <h2>${esc(I18n.language === 'en' ? (sec.nameEn || sec.name) : sec.name)}</h2>
          ${I18n.language === 'en' ? '' : `<span class="en">${esc(sec.nameEn || '')}</span>`}
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
          ${chordRowHtml(line)}
          <p class="line-th">${esc(line.th)}</p>
          ${line.ro ? `<p class="line-ro" data-f="ro">${esc(line.ro)}</p>` : ''}
          ${cnRoOf(line) ? `<p class="line-cnro" data-f="cn">${esc(cnRoOf(line))}</p>` : ''}
          <p class="line-cn" data-f="mean">${esc(line.cn)}</p>
        </div>
        <div class="line-tools">
          <button class="lbtn" data-act="speak" title="朗读整句">🔊 整句</button>
          ${HAS_TIMELINE ? `<button class="lbtn" data-act="jump" title="跳到原曲这一句">▶ 原曲</button>
          <button class="lbtn" data-act="loop" title="单句循环这一句">🔁 循环</button>` : ''}
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

  /* ── 尤克里里和弦 ──
     练习模式给「和弦名 + 按法图」，KTV 那两块地方只给和弦名：
     字号本来就大，再塞指法图会把歌词挤没。 */
  const chordText = (line) => (line && line.uku ? line.uku.join('  ') : '');

  function chordRowHtml(line) {
    if (!line.uku || !line.uku.length) return '';
    const chips = line.uku.map((c) =>
      `<span class="chord-chip"><b class="chord-name">${esc(c)}</b>${Chords.diagram(c)}</span>`
    ).join('');
    return `<div class="line-chords" data-f="uku">${chips}</div>`;
  }

  // 和弦说明条：调性、用到哪几个和弦、按法图是怎么读的
  function renderUkuHint() {
    const u = SONG.ukulele;
    // 没配和弦的歌，视图栏那个开关也一并收起来
    $('#showUku').closest('.chip').classList.toggle('hidden', !u);
    if (!u) { state.view.uku = false; return; }
    $('#ukuHint').innerHTML = `
      <b>🎸 ${esc(u.key)} 调</b>
      <span>${u.capo ? `夹 ${u.capo} 品 · ` : '不用变调夹 · '}${esc(u.tuning)} 标准调弦</span>
      <span>图上从左到右是 ${esc(u.tuning.split('').join(' '))} 四根弦，○ = 空弦不按，● = 按在那一品</span>
      <span class="uku-hint-note">和弦按每句的时长分到句子上，段落交界处准，句内换和弦的时机以听感为准</span>`;
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
    const map = { ro: '#showRo', cn: '#showCn', mean: '#showMean', words: '#showWords', uku: '#showUku' };
    Object.entries(map).forEach(([k, sel]) => {
      $(sel).checked = state.view[k];
      $$(`[data-f="${k}"]`).forEach((n) => n.classList.toggle('hidden', !state.view[k]));
    });
    // 和弦、中文谐音在 KTV 沉浸模式里也能开关，那边用的是右上角的胶囊按钮，状态跟这里同一份
    $('#ktvChordToggle').classList.toggle('on', state.view.uku);
    $('#ktvCnToggle').classList.toggle('on', state.view.cn);
    // 开了和弦歌词区更高，弹幕的飞行区跟着往上让一让，别糊在和弦上
    $('#ktvView').classList.toggle('chords-on', state.view.uku);
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
    renderKtvView();
    highlightMark(idx);
    // 拖进度条的过程中不要重设单句循环，否则会被循环区间拽回去
    if (state.loopOn && idx >= 0 && !seek.dragging) Player.setLoop(LINES[idx].start, lineEnd(idx));
  }

  function scrollToLine(idx) {
    $(`.line[data-idx="${idx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function scrollToActive() {
    if (!state.follow || state.activeIdx < 0) return;
    $(`.line[data-idx="${state.activeIdx}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ════════ KTV 沉浸模式：全屏，只留背景 + 当前句/下一句 ════════
     跟顶部的双行槽位用的是同一套逻辑：单数句永远在槽 0，双数句永远在槽 1，
     位置从不跳动，换的只是哪个槽亮（正在唱）。 */
  function setMode(mode) {
    // 没时间轴就没法做 KTV 逐句跟唱；单词模式不看时间轴，照进不误
    if (!HAS_TIMELINE && mode === 'ktv') mode = 'practice';
    state.mode = mode;
    document.body.classList.toggle('mode-ktv', mode === 'ktv');
    document.body.classList.toggle('mode-study', mode === 'study');
    $('#ktvView').classList.toggle('hidden', mode !== 'ktv');
    $('#studyView').classList.toggle('hidden', mode !== 'study');
    $('#btnModePractice').classList.toggle('active', mode === 'practice');
    $('#btnModeKtv').classList.toggle('active', mode === 'ktv');
    $('#btnModeStudy').classList.toggle('active', mode === 'study');
    localStorage.setItem(LS.mode, mode);
    if (mode === 'ktv') {
      renderKtvView();
      // 逐字着色要比 100ms 的 tick 细，所以单独跑一个 rAF，退出模式自己停
      if (!ktvRaf) ktvRaf = requestAnimationFrame(ktvKaraokeLoop);
    } else {
      $('#ktvDanmakuForm').classList.add('hidden');
      $('#ktvBtnDanmaku').classList.remove('on');
    }
    // 背单词时原曲别在旁边响着，不然点词听发音听不清
    if (mode === 'study') Player.pause();
    Study.setActive(mode === 'study');
  }

  // KTV 背景要不要露出 MV 画面。音源就是这支 MV，所以背景不是另一路视频，
  // 而是把练习模式那个播放器原地撑满全屏（样式的事，全在 CSS 里）。
  function applyKtvBg() {
    document.body.classList.toggle('ktv-bg-video', state.ktvBg);
    $('#ktvView').classList.toggle('bg-video', state.ktvBg);
    $('#ktvBgToggle').classList.toggle('on', state.ktvBg);
  }

  /* ── 逐字着色 ──
     没唱到的字是白的，唱过去的换成高亮色，一个字一个字往右推。
     手上只有每句的开始时间，没有逐字时间轴，所以一句里的字按字数均分。 */

  // 泰语的元音符号/声调符号是独立码点，得跟着辅音一起亮，所以按字素簇切
  const GRAPHEMES = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter('th', { granularity: 'grapheme' })
    : null;
  function graphemes(s) {
    if (!s) return [];
    if (GRAPHEMES) return Array.from(GRAPHEMES.segment(s), (g) => g.segment);
    return Array.from(s);
  }

  // 一句唱多久：默认到下一句开始，但间奏那种十几秒的空档要封顶，
  // 不然字会一直慢慢爬，跟人实际唱到哪儿差得越来越远。
  const SEC_PER_CHAR = 0.34;
  const singDur = [];
  function lineSingDur(i) {
    if (singDur[i] != null) return singDur[i];
    const gap = lineEnd(i) - LINES[i].start;
    const est = Math.max(1.2, graphemes(LINES[i].th).length * SEC_PER_CHAR);
    const d = Math.max(0.6, Math.min(gap, est));
    // 最后一句的 lineEnd 依赖视频时长，播放器还没就绪时别把错的值存下来
    if (i < LINES.length - 1) singDur[i] = d;
    return d;
  }

  // 逐词表里的每个词，按顺序去整句字符里找它占的那一段（字素下标，不是字符串下标）。
  // 找不齐（英文夹词、词表跟整句对不上）就放弃，调用方会退回整句一条百分比的老逻辑。
  function findWordSpans(chars, wordTexts) {
    const bounds = [];
    let cursor = 0;
    for (const w of wordTexts) {
      const wChars = graphemes(w || '');
      if (!wChars.length) return null;
      let idx = -1;
      for (let i = cursor; i <= chars.length - wChars.length; i++) {
        if (wChars.every((c, j) => chars[i + j] === c)) { idx = i; break; }
      }
      if (idx < 0) return null;
      bounds.push([idx, idx + wChars.length]);
      cursor = idx + wChars.length;
    }
    return bounds;
  }

  // 一个字一个 span，这样换行照旧，也不用 background-clip:text
  // （那样文字投影会盖在渐变上面，糊成一团）
  // wordTexts 给了的话，会按词分组记下每个词占的字素区间（见 findWordSpans）——
  // 泰文行、中文谐音行各自的字数差很多，光按整句字符数算百分比会导致两行进度对不上、
  // 一个词唱完了另一行同一个词还只亮一半；有逐词表就按「唱到第几个词」推进，两行才能同步。
  function buildKaraokeRow(node, text, wordTexts) {
    if (node._ktext === text) return;
    node._ktext = text;
    node.textContent = '';
    const chars = graphemes(text);
    node._kchars = chars.map((ch) => {
      const sp = document.createElement('span');
      sp.className = 'kchar';
      sp.textContent = ch;
      node.appendChild(sp);
      return sp;
    });
    node._kwordBounds = wordTexts && wordTexts.length > 1 ? findWordSpans(chars, wordTexts) : null;
    node._kn = 0;
  }

  // p = 这句唱到了百分之几；只动状态变了的那几个字，别每帧刷一整行
  function paintKaraokeRow(node, p) {
    const chars = node._kchars || [];
    const bounds = node._kwordBounds;
    let n;
    if (bounds) {
      const wp = Math.max(0, Math.min(bounds.length, p * bounds.length));
      const fullWords = Math.min(bounds.length, Math.floor(wp));
      if (fullWords >= bounds.length) n = chars.length;
      else {
        const [ws, we] = bounds[fullWords];
        n = ws + Math.floor((wp - fullWords) * (we - ws));
      }
    } else {
      n = Math.min(chars.length, Math.floor(p * chars.length));
    }
    if (node._kn === n) return;
    if (n > node._kn) for (let k = node._kn; k < n; k++) chars[k].classList.add('sung');
    else for (let k = n; k < node._kn; k++) chars[k].classList.remove('sung');
    node._kn = n;
  }

  function paintKtvSlot(el, p) {
    paintKaraokeRow(el.querySelector('.ktv-vline-th'), p);
    paintKaraokeRow(el.querySelector('.ktv-vline-ro'), p);
    paintKaraokeRow(el.querySelector('.ktv-vline-cnro'), p);
  }

  let ktvRaf = 0;
  function ktvKaraokeLoop() {
    if (state.mode !== 'ktv') { ktvRaf = 0; return; }
    ktvRaf = requestAnimationFrame(ktvKaraokeLoop);
    const i = state.activeIdx;
    if (i < 0) return;
    const el = $('#ktvSlot' + (i % 2));
    if (!el.classList.contains('live')) return;
    const p = (Player.getTime() - LINES[i].start) / lineSingDur(i);
    paintKtvSlot(el, Math.max(0, Math.min(1, p)));
  }

  // 罗马音每个词都有；中文谐音只有整句的逐词表里每个词都有一份干净的（没有英文夹词、
  // 没有说明性占位）时才按词同步高亮——碰上对不整齐的句子，那一行退回整句一条百分比，不硬凑。
  function ktvWordTexts(line) {
    if (!line || !line.words || line.words.length < 2) return null;
    const cn = line.words.map((w) => (w.lang === 'en' ? null : w.cn));
    return {
      th: line.words.map((w) => w.th),
      ro: line.words.map((w) => w.ro),
      cn: cn.some((s) => !s || /^[（(]/.test(s)) ? null : cn,
    };
  }

  function fillKtvViewSlot(el, line, isLive) {
    el.querySelector('.ktv-vline-chords').textContent = chordText(line);
    const wt = ktvWordTexts(line);
    buildKaraokeRow(el.querySelector('.ktv-vline-th'), line ? line.th : '🎉 这一轮唱完了', wt && wt.th);
    buildKaraokeRow(el.querySelector('.ktv-vline-ro'), line ? (line.ro || '') : '', wt && wt.ro);
    buildKaraokeRow(el.querySelector('.ktv-vline-cnro'), line ? cnRoOf(line) : '', wt && wt.cn);
    el.classList.toggle('en-slot', !!line && line.lang === 'en');
    el.classList.toggle('live', isLive);
    // 待唱的那句从头白起；正在唱的那句交给 rAF 下一帧填
    if (!isLive) paintKtvSlot(el, 0);
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
      const COUNT = 16;
      for (let i = 0; i < COUNT; i++) {
        const el = document.createElement('div');
        el.className = 'ktv-effect';
        el.textContent = emoji;
        el.style.setProperty('--x', (4 + Math.random() * 92) + '%');
        el.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
        el.style.setProperty('--r', (Math.random() * 50 - 25) + 'deg');
        el.style.setProperty('--dur', (2.4 + Math.random() * 1.6) + 's');
        el.style.setProperty('--delay', (Math.random() * 0.9) + 's');
        el.style.setProperty('--size', Math.round(32 + Math.random() * 30) + 'px');
        effectsLayer.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
      }
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
    if (dur <= 0 || !HAS_TIMELINE) return;
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
    // 之前标过的先填回来，从第一句还没标的接着标；一句没标过就是从头开始。
    // 48 句一口气标完挺累的，分几次标不用重来。
    const marked = loadMarked();
    const marks = LINES.map((l) => (marked.has(l.id) ? l.start : undefined));
    let idx = 0;
    while (idx < LINES.length && typeof marks[idx] === 'number') idx++;
    state.calib = { on: true, idx, marks };
    $('#calibModal').classList.remove('hidden');
    renderCalib();
    Player.clearLoop();
    // 接着标的时候从上一句（已经标准了的那句）的开头起播，听着好接上
    Player.seek(idx > 0 ? Math.max(0, LINES[idx - 1].start || 0) : 0, true);
    if (idx > 0) toast(`接着上次标：从第 ${idx + 1} 句开始`);
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
    // 标过的句子累加：这次没标到的，之前标过的照样算数，可以分几次标完
    const marked = loadMarked();
    let applied = 0;
    c.marks.forEach((t, i) => {
      if (typeof t === 'number') { LINES[i].start = t; marked.add(LINES[i].id); applied++; }
    });
    if (!applied) { alert('还没有标记任何一句。'); return; }
    // 同步回原始 SONG 对象，导出和单词模式的「🎵 放原句」用得上
    let k = 0;
    SONG.sections.forEach((s) => s.lines.forEach((l) => { l.start = LINES[k++].start; }));
    singDur.length = 0;         // 时间变了，KTV 逐字变色缓存的每句时长要重算
    const timesMap = saveTimes();
    const markedArr = [...marked];
    localStorage.setItem(LS.marked, JSON.stringify(markedArr));
    if (window.Sync) window.Sync.pushTimelineCalib(SONG.id, SONG.youtubeId, timesMap, markedArr);
    closeCalib();
    const left = LINES.length - LINES.filter((l) => marked.has(l.id)).length;
    renderSeekMarks();          // 刻度按新时间轴重画
    state.activeIdx = -1;
    setActive(indexAt(Player.getTime()));
    toast(left
      ? `已保存 ${applied} 句 ✓ 还有 ${left} 句是估算的，下次接着标`
      : `已保存 ${applied} 句的时间轴 ✓ 全曲标完了`);
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

  // 导出成能直接贴回歌词文件的样子。歌词文件有两种写法，按 SONG.timesStyle 走：
  //   不写（默认）= 每句的 start 写在句子里（safe-near-me 那种），导出「id + start」逐句列表；
  //   'grouped'   = 时间集中放在文件顶部的 TIMES 里（副歌复用同一份歌词的歌只能这么写），
  //                 导出「段落前缀: [秒, 秒…]」，整块贴回 TIMES 就行。
  function exportTimes() {
    const grouped = SONG.timesStyle === 'grouped';
    const at = (i) => (typeof LINES[i].start === 'number' ? LINES[i].start : 0);
    const out = [];
    let k = 0;
    SONG.sections.forEach((sec) => {
      if (grouped) {
        // 段落前缀 = 句子 id 去掉末尾的「-第几句」
        const first = sec.lines[0];
        const prefix = (first.id.match(/^(.*)-\d+$/) || [, first.id])[1];
        const ts = sec.lines.map(() => at(k++).toFixed(2));
        out.push(`    ${prefix}: [${ts.join(', ')}],   // ${sec.name}`);
      } else {
        out.push(`// ${sec.name}`);
        sec.lines.forEach((l) => {
          out.push(`  ${l.id.padEnd(8)} start: ${at(k++).toFixed(2)},`);
        });
      }
    });
    $('#exportText').value =
      (grouped
        ? `// 把这一整块贴回 songs/${SONG.id}.js 里的 TIMES\n`
        : `// 把这些 start 值填回 songs/${SONG.id}.js 对应的句子里\n`) +
      `// 并把顶部的 synced 改成 true\n\n` + out.join('\n');
    $('#exportModal').classList.remove('hidden');
  }

  /* ════════ 首页 ════════
     一进站看到的就是曲库里所有歌，每首一张卡：YouTube 封面当预览图，
     标题 + 歌手 + 句数 + 时间轴状态。点哪张卡就整页跳到 ?song=id 打开那首。
     只在没带 ?song= 参数时渲染（HTML 里其余内容——播放器/歌词/底栏——保持原样待命，
     这里只是把它们先藏起来，换成这块）。 */
  function initHome() {
    document.title = '泰语歌逐句跟读';
    $('.topbar').classList.add('hidden');
    $('.stickydeck').classList.add('hidden');
    $('.viewbar').classList.add('hidden');
    $('#lyrics').classList.add('hidden');
    $('.foot').classList.add('hidden');
    $('#homeView').classList.remove('hidden');
    Study.initDaily();

    const lastId = localStorage.getItem(LS_SONG);
    const ids = Object.keys(window.SONGS || {});

    $('#homeGrid').innerHTML = ids.map((id) => {
      const s = window.SONGS[id];
      const by = [s.artist, s.album].filter(Boolean).join(' · ');
      return `<a class="home-card" href="?song=${encodeURIComponent(id)}" data-song="${esc(id)}">
        <span class="home-card-thumb">
          <img src="https://img.youtube.com/vi/${esc(s.youtubeId)}/hqdefault.jpg" alt="" loading="lazy">
          <span class="home-card-play">▶</span>
          ${id === lastId ? '<span class="home-card-badge">上次在学</span>' : ''}
        </span>
        <span class="home-card-body">
          <span class="home-card-th">${esc(s.titleTh || s.title)}</span>
          <span class="home-card-cn">${esc(displaySongTitle(s))}</span>
          ${by ? `<span class="home-card-by">${esc(by)}</span>` : ''}
        </span>
      </a>`;
    }).join('');

    $('#homeGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.home-card');
      if (!card) return;
      e.preventDefault();
      localStorage.setItem(LS_SONG, card.dataset.song);
      location.href = card.getAttribute('href');
    });

    $('#btnThemeHome').addEventListener('click', toggleTheme);

    // 顶栏的「开始学习」会接着上次学的歌，没有就跳去挑歌区
    const goStart = () => {
      if (lastId && window.SONGS[lastId]) { location.href = `?song=${encodeURIComponent(lastId)}`; return; }
      $('#homeLibrary').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    $('#btnHomeStart').addEventListener('click', goStart);

    // 静态网站没有自己的邮件服务器，交给 FormSubmit 转发到站长邮箱。
    const requestForm = $('#homeRequestForm');
    requestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submit = requestForm.querySelector('[type="submit"]');
      const status = $('#homeRequestStatus');
      submit.disabled = true;
      status.className = 'home-request-status';
      status.textContent = I18n.t('正在发送…');

      try {
        const response = await fetch('https://formsubmit.co/ajax/xinyiye811@gmail.com', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(requestForm),
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        requestForm.reset();
        status.classList.add('success');
        status.textContent = I18n.t('已发送，谢谢你的留言！');
      } catch (error) {
        status.classList.add('error');
        status.textContent = I18n.t('没能发送。请稍后再试，或发邮件到 xinyiye811@gmail.com。');
      } finally {
        submit.disabled = false;
      }
    });

    // 顶部小字：歌曲数 + 去重后的泰语词总数
    $('#homeStatSongs').textContent = ids.length;
    const thSet = new Set();
    ids.forEach((id) => {
      window.SONGS[id].sections.forEach((sec) => {
        sec.lines.forEach((line) => (line.words || []).forEach((w) => {
          if (w.th && w.lang !== 'en') thSet.add(w.th);
        }));
      });
    });
    $('#homeStatWords').textContent = thSet.size;
  }

  /* ════════ 选歌 ════════
     列表就是 window.SONGS 里的全部歌曲，顺序 = index.html 里 <script> 的引入顺序。
     换歌走整页重载（?song=id）：播放器、歌词、时间轴、掌握进度都是按歌走的，
     重载一次最省事也最不容易出错。 */

  function songMeta(song) {
    const n = song.sections.reduce((a, sec) => a + sec.lines.length, 0);
    const done = new Set(JSON.parse(localStorage.getItem('tsl.done.' + song.id) || '[]'));
    return { count: n, done: done.size };
  }

  function renderSongPicker() {
    $('#songList').innerHTML = SONG_IDS.map((id) => {
      const s2 = window.SONGS[id];
      const m = songMeta(s2);
      const by = [s2.artist, s2.album].filter(Boolean).join(' · ');
      return `<button class="song-card${id === SONG.id ? ' on' : ''}" data-song="${esc(id)}">
        <span class="song-card-th">${esc(s2.titleTh || s2.title)}</span>
        <span class="song-card-cn">${esc(displaySongTitle(s2))}</span>
        ${by ? `<span class="song-card-by">${esc(by)}</span>` : ''}
        <span class="song-card-meta">
          <span>${esc(I18n.t(`${m.count} 句`))}</span>
          ${m.done ? `<span>${esc(I18n.t(`已掌握 ${m.done}`))}</span>` : ''}
          <span>${esc(I18n.t(s2.timeline === false ? '练习模式' : '练习 + KTV'))}</span>
        </span>
        ${id === SONG.id ? `<span class="song-card-now">${esc(I18n.t('正在学'))}</span>` : ''}
      </button>`;
    }).join('');
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

    // 练习 / KTV / 单词 三种模式切换
    $('#btnModePractice').addEventListener('click', () => setMode('practice'));
    $('#btnModeKtv').addEventListener('click', () => setMode('ktv'));
    $('#btnModeStudy').addEventListener('click', () => setMode('study'));
    $('#ktvExit').addEventListener('click', () => setMode('practice'));
    $('#ktvPlayPause').addEventListener('click', () => Player.toggle());
    $('#ktvBg').addEventListener('click', () => Player.toggle());

    // 背景画面开关
    $('#ktvBgToggle').addEventListener('click', () => {
      state.ktvBg = !state.ktvBg;
      localStorage.setItem(LS.ktvBg, state.ktvBg ? '1' : '0');
      applyKtvBg();
    });

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
    $('#btnPinTopbar').addEventListener('click', () => {
      state.pinTopbar = !state.pinTopbar;
      localStorage.setItem(LS_PIN_TOPBAR, state.pinTopbar ? '1' : '0');
      applyPins();
    });
    $('#btnPinDeck').addEventListener('click', () => {
      state.pinDeck = !state.pinDeck;
      localStorage.setItem(LS_PIN_DECK, state.pinDeck ? '1' : '0');
      applyPins();
    });

    // 视图开关
    [['#showRo', 'ro'], ['#showCn', 'cn'], ['#showMean', 'mean'], ['#showWords', 'words'], ['#showUku', 'uku']]
      .forEach(([sel, key]) => {
        $(sel).addEventListener('change', (e) => { state.view[key] = e.target.checked; applyView(); });
      });

    // KTV 沉浸模式里的和弦、中文谐音开关：跟视图栏那两个复选框共用同一份 state.view，
    // 在哪边开都是两种模式一起生效
    $('#ktvChordToggle').addEventListener('click', () => {
      state.view.uku = !state.view.uku;
      applyView();
      toast(state.view.uku ? '🎸 和弦已打开' : '和弦已关掉');
    });
    $('#ktvCnToggle').addEventListener('click', () => {
      state.view.cn = !state.view.cn;
      applyView();
      toast(state.view.cn ? '🀄 中文谐音已打开' : '中文谐音已关掉');
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

    // 选歌
    $('#btnSong').addEventListener('click', () => {
      renderSongPicker();
      $('#songModal').classList.remove('hidden');
    });
    $('#songList').addEventListener('click', (e) => {
      const card = e.target.closest('.song-card');
      if (card) gotoSong(card.dataset.song);
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
    $('#btnTheme').addEventListener('click', toggleTheme);

    // 回首页看所有歌
    $('#btnHome').addEventListener('click', () => { location.href = location.pathname; });

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

      // 单词模式那边有自己一套（1–4 选答案、Enter 下一题），这套全让开
      if (state.mode === 'study') return;

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

    // 单词表里点 🎵：回练习模式，跳到这个词出现的第一句，并让那个词闪一下
    document.addEventListener('study:goto', (e) => {
      const { idx, th } = e.detail;
      setMode('practice');
      setActive(idx, { scroll: false });
      // 有时间轴的歌顺便把原曲定位过去（只定位，不自动播）；没有的就单纯选中
      if (HAS_TIMELINE) Player.seek(LINES[idx].start, false);
      const node = $(`.line[data-idx="${idx}"]`);
      if (!node) return;
      scrollToLine(idx);
      const w = $$('.word', node).find((b) => b.dataset.th === th);
      if (w) { w.classList.add('flash'); setTimeout(() => w.classList.remove('flash'), 1800); }
    });

    document.addEventListener('tts:voiceschanged', refreshVoiceUI);
    document.addEventListener('rec:saved', (e) => renderTake(e.detail.lineId));
  }

  function jumpTo(idx) {
    // 没有时间轴的歌，"跳到这一句" 只是把它选中（←→ 翻句、S 朗读都还能用），
    // 不去动原曲的播放位置。滚动单独做，这样点已经选中的那句也会滚回视野中间。
    if (!HAS_TIMELINE) {
      setActive(idx, { scroll: false });
      scrollToLine(idx);
      return;
    }
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
    if (window.Sync) window.Sync.pushLineDone(SONG.id, [...state.done]);
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

  // 顶栏 / 播放器 / 视图栏三层吸顶区各自的实际高度，供下面算 sticky 偏移量、
  // .line 的 scroll-margin-top 用。谁固定了才算进偏移量，没固定就当 0 高。
  const stickyH = { topbar: 0, deck: 0, viewbar: 0 };
  function updateStickyVars() {
    const effTopbar = state.pinTopbar ? stickyH.topbar : 0;
    const effDeck = state.pinDeck ? stickyH.deck : 0;
    const root = document.documentElement.style;
    root.setProperty('--eff-topbar-h', effTopbar + 'px');
    root.setProperty('--eff-deck-h', effDeck + 'px');
    root.setProperty('--sticky-total-h', (effTopbar + effDeck + stickyH.viewbar) + 'px');
  }
  // 高度会随「画面」档位、窗口宽度、歌词长短变化，所以用 ResizeObserver 持续跟。
  function watchStickyLayout() {
    const map = { topbar: $('.topbar'), deck: $('.stickydeck'), viewbar: $('.viewbar') };
    Object.entries(map).forEach(([key, el]) => {
      if (!el) return;
      const measure = () => {
        stickyH[key] = Math.round(el.getBoundingClientRect().height);
        updateStickyVars();
      };
      measure();
      if (window.ResizeObserver) new ResizeObserver(measure).observe(el);
    });
    window.addEventListener('resize', updateStickyVars);
  }

  // 「📌 固定」按钮：顶栏、播放器各自独立开关，按了哪个哪个就吸顶
  function applyPins() {
    $('.topbar').classList.toggle('pinned', state.pinTopbar);
    $('.stickydeck').classList.toggle('pinned', state.pinDeck);
    $('#btnPinTopbar').classList.toggle('active', state.pinTopbar);
    $('#btnPinDeck').classList.toggle('active', state.pinDeck);
    updateStickyVars();
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
    // 标题
    $('#songTitle').textContent = displaySongTitle(SONG);
    $('#songTitleTh').textContent = SONG.titleTh || '';
    $('#songArtist').textContent = [SONG.artist, SONG.album].filter(Boolean).join(' · ');
    // 没填歌手/专辑时，把中间那个分隔点也一起收掉，别在标题下面孤零零挂一个「·」
    const hasBy = !!(SONG.artist || SONG.album);
    $('#songArtist').classList.toggle('hidden', !hasBy);
    $('#songTitleSep').classList.toggle('hidden', !hasBy);
    document.title = `${displaySongTitle(SONG)} — ThaiCue`;

    // 只做练习模式的歌：KTV / 校准 / 单句循环 / 自动跟随这些靠时间轴的东西全收起来
    document.body.classList.toggle('no-timeline', !HAS_TIMELINE);
    $('#btnSong').classList.toggle('hidden', SONG_IDS.length < 2);

    loadTimes();
    renderUkuHint();
    render();
    initSeek();
    bind();
    applyKtvBg();
    Study.init(SONG);       // 单词表从歌词里摊出来，要赶在 setMode 之前
    setMode(state.mode);
    initKtvInteractions();
    applyPins();
    watchStickyLayout();

    syncProgressFromCloud();   // 异步，不等——先用本地数据把界面画出来，云端数据回来了再补

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
      if (!state.calib.on && HAS_TIMELINE) setActive(indexAt(t));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
