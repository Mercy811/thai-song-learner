/**
 * Vocab —— 单词表 + 掌握程度
 *
 * 单词表不是另外抄一份，是直接从歌词里的逐词卡片摊出来去重的：
 * 歌改了词，单词表跟着变，不会对不上。
 *
 * 掌握程度用 Leitner 盒子（0–5 级）：
 *   答对 → 升一级（封顶 5）    答错 → 掉一级（保底 0）
 * 一路答对最快 5 次到「已掌握」；错一次只掉一格，不会一夜回到解放前。
 * 出题时级别越低抽中概率越大 —— 不熟的词自己会反复冒出来。
 *
 * 存在 localStorage，key 带歌名，每首歌一份自己的进度。
 */
window.Vocab = (() => {
  'use strict';

  const LEVELS = ['还生疏', '刚见过', '眼熟', '会了', '熟练', '已掌握'];
  const MAX_LV = LEVELS.length - 1;

  let song = null;
  let key = 'tsl.vocab';
  let words = [];              // 去重后的单词表
  let byTh = new Map();        // 泰文 → 单词
  let stats = {};              // 泰文 → { r 对, w 错, lv 级别, streak 连对, last 上次时间 }

  const cfg = () => window.VOCAB_QUIZ || { wrong: {}, groups: [], meanOverride: {} };

  /* ════════ 建表 ════════ */

  function build() {
    words = [];
    byTh = new Map();
    let n = 0;
    song.sections.forEach((sec) => {
      sec.lines.forEach((line) => {
        const i = n++;
        (line.words || []).forEach((w) => {
          if (!w.th) return;
          let e = byTh.get(w.th);
          if (!e) {
            e = {
              th: w.th,
              ro: w.ro || '',
              cn: w.cn || '',                                     // 中文谐音
              mean: cfg().meanOverride[w.th] || w.mean || '',      // 中文意思（测验的正确答案）
              lang: w.lang === 'en' ? 'en' : 'th',
              section: sec.name,
              lines: [],
            };
            byTh.set(w.th, e);
            words.push(e);
          }
          // 同一个词在同一句里出现两次就不重复记了
          if (!e.lines.some((r) => r.idx === i)) {
            e.lines.push({ idx: i, id: line.id, th: line.th, cn: line.cn });
          }
        });
      });
    });
    // 顺手编个号，单词表按歌词顺序显示时用
    words.forEach((w, i) => { w.no = i + 1; w.count = w.lines.length; });
  }

  /* ════════ 进度存取 ════════ */

  const blank = () => ({ r: 0, w: 0, lv: 0, streak: 0, last: 0 });
  const stat = (th) => stats[th] || blank();
  const attempts = (th) => { const s = stat(th); return s.r + s.w; };

  function load() {
    try {
      stats = JSON.parse(localStorage.getItem(key) || '{}') || {};
    } catch { stats = {}; }
    // 歌词改过之后，表里可能留着已经不存在的词，清掉免得统计不对
    Object.keys(stats).forEach((th) => { if (!byTh.has(th)) delete stats[th]; });
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(stats)); } catch { /* 无痕模式，存不了就算了 */ }
  }

  /** 记一次答题结果 */
  function record(th, correct) {
    const s = stats[th] || (stats[th] = blank());
    if (correct) { s.r++; s.streak++; s.lv = Math.min(MAX_LV, s.lv + 1); }
    else         { s.w++; s.streak = 0; s.lv = Math.max(0, s.lv - 1); }
    s.last = Date.now();
    save();
    return s;
  }

  /** 手动改级别：单词表上直接点「标记为已掌握 / 重学」用 */
  function setLevel(th, lv) {
    const s = stats[th] || (stats[th] = blank());
    s.lv = Math.max(0, Math.min(MAX_LV, lv));
    if (s.lv === 0 && !s.r && !s.w) delete stats[th];   // 归零就当没学过
    else s.last = Date.now();
    save();
  }

  function reset() { stats = {}; save(); }

  /** 级别名：一次没考过、级别也还在 0 的叫「没学过」，跟答错掉回 0 级的「还生疏」区分开。
      单词表上手动点「✓ 我已经会了」的词没考过但级别是满的，走下面这条正常显示。 */
  function levelLabel(th) {
    const s = stat(th);
    return s.r + s.w === 0 && s.lv === 0 ? '没学过' : LEVELS[s.lv];
  }

  function summary() {
    const byLevel = [0, 0, 0, 0, 0, 0];
    let touched = 0, r = 0, w = 0;
    words.forEach((word) => {
      const s = stat(word.th);
      byLevel[s.lv]++;
      if (s.r + s.w) touched++;
      r += s.r; w += s.w;
    });
    const untouched = words.length - touched;
    return {
      total: words.length,
      byLevel,
      untouched,
      touched,
      mastered: byLevel[MAX_LV],
      right: r,
      wrong: w,
      accuracy: r + w ? r / (r + w) : 0,
      // 进度条按级别加权：全部 5 级才算 100%
      progress: words.length ? words.reduce((a, x) => a + stat(x.th).lv, 0) / (words.length * MAX_LV) : 0,
    };
  }

  /* ════════ 出题 ════════ */

  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /**
   * 挑三个「意思相近但确实不对」的干扰项。
   * 先用手写的，不够就从同类词堆里补，再不够才从歌里别的词借。
   */
  function distractorsFor(word) {
    const answer = word.mean;
    const out = [];
    const take = (arr) => {
      arr.forEach((m) => {
        if (out.length >= 3) return;
        if (!m || m === answer || out.includes(m)) return;
        out.push(m);
      });
    };

    take(cfg().wrong[word.th] || []);

    if (out.length < 3) {
      // 同类词堆：找到正确答案所在的那一堆，从里面挑同类的
      const pool = cfg().groups.filter((g) => g.includes(answer)).flat();
      take(shuffle([...new Set(pool)]));
    }
    if (out.length < 3) {
      // 最后兜底：借歌里别的词的意思，优先挑长度接近的，看着不容易一眼排除
      const others = words
        .filter((x) => x.mean && x.mean !== answer)
        .map((x) => x.mean);
      take(shuffle([...new Set(others)])
        .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length)));
    }
    return out;
  }

  /** 组一道题：一个词 + 四个中文选项 */
  function makeQuestion(th) {
    const word = byTh.get(th);
    if (!word) return null;
    const options = shuffle([word.mean, ...distractorsFor(word)]);
    return { word, options, answer: word.mean };
  }

  /**
   * 挑下一个要考的词：级别越低抽中概率越大。
   * exclude 是刚考过的几个词，避免连着出同一个。
   */
  function pick(exclude = []) {
    const pool = words.filter((w) => w.mean && !exclude.includes(w.th));
    const list = pool.length ? pool : words.filter((w) => w.mean);
    if (!list.length) return null;

    const weights = list.map((w) => {
      const s = stat(w.th);
      let x = Math.pow(MAX_LV + 1 - s.lv, 2);        // 0 级 36 分，5 级 1 分
      if (s.r + s.w === 0) x *= 1.3;                 // 还没见过的先安排上
      if (s.streak === 0 && s.w > 0) x *= 1.5;       // 上次刚答错的多考几遍
      return x;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let t = Math.random() * total;
    for (let i = 0; i < list.length; i++) {
      t -= weights[i];
      if (t <= 0) return list[i].th;
    }
    return list[list.length - 1].th;
  }

  /* ════════ 导出 ════════ */

  /** 制表符分隔，贴进 Excel / Notion / Anki 都能直接用 */
  function toTSV() {
    const head = ['#', '泰语', '罗马音', '中文谐音', '意思', '出现次数', '掌握程度', '答对', '答错'];
    const rows = words.map((w) => {
      const s = stat(w.th);
      return [w.no, w.th, w.ro, w.cn, w.mean, w.count, levelLabel(w.th), s.r, s.w].join('\t');
    });
    return [head.join('\t'), ...rows].join('\n');
  }

  /* ════════ 启动 ════════ */

  function init(s) {
    song = s;
    key = 'tsl.vocab.' + song.id;
    build();
    load();
    return words;
  }

  return {
    init, list: () => words, get: (th) => byTh.get(th),
    stat, attempts, levelLabel, setLevel, record, reset, summary,
    makeQuestion, pick, distractorsFor, toTSV,
    LEVELS, MAX_LV,
  };
})();
