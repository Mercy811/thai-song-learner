/**
 * Chords —— 尤克里里和弦图 + 钢琴左右手提示
 *
 * 调弦按标准的 GCEA。一个和弦就是四根弦各按第几品，0 = 空弦不按；
 * 数组顺序是 G C E A，也就是从最粗那根排到最细那根，跟看着琴颈从左到右一致。
 */
window.Chords = (() => {
  'use strict';

  const SHAPES = {
    'C':   [0, 0, 0, 3],
    'D':   [2, 2, 2, 0],
    'Em':  [0, 4, 3, 2],
    'F#m': [2, 1, 2, 0],
    'G':   [0, 2, 3, 2],
    'A':   [2, 1, 0, 0],
    'B':   [4, 3, 2, 2],
    'Bm':  [4, 2, 2, 2],
  };

  // 钢琴采用容易连接、适合初学者的开放排列。右手的 notes 按从低到高排列，
  // 页面上的箭头就是轻轻依次弹过去的顺序；不是要求同时重重按下。
  const PIANO = {
    Dmaj7: { left: 'D + A', right: ['F♯', 'A', 'C♯'], fingers: '1–2–5' },
    D:     { left: 'D + A', right: ['F♯', 'A', 'D'],  fingers: '1–2–5' },
    Bm7:   { left: 'B + F♯', right: ['F♯', 'A', 'B', 'D'], fingers: '1–2–3–5' },
    Em7:   { left: 'E + B', right: ['G', 'B', 'D'], fingers: '1–3–5' },
    A:     { left: 'A + E', right: ['C♯', 'E', 'A'], fingers: '1–2–5' },
    A7:    { left: 'A + E', right: ['G', 'A', 'C♯', 'E'], fingers: '1–2–3–5' },
    Gmaj7: { left: 'G + D', right: ['F♯', 'B', 'D'], fingers: '1–3–5' },
    'F#m7': { left: 'F♯ + C♯', right: ['E', 'F♯', 'A', 'C♯'], fingers: '1–2–3–5' },
  };

  const FRETS = 4;                  // 图上画四品，这首歌的按法都在里面
  const XS = [5, 14, 23, 32];       // 四根弦的横坐标
  const TOP = 10, GAP = 9;          // 上弦枕的高度、每一品的间距
  const H = TOP + GAP * FRETS + 2;

  const shape = (name) => SHAPES[name] || null;

  // 窗口从第几品开始：都在 1~4 品之内就从上弦枕画起，
  // 万一以后有更高的按法，就把窗口整体挪下去，左边标一下起始品
  function baseFret(frets) {
    const used = frets.filter((f) => f > 0);
    if (!used.length) return 1;
    return Math.max(...used) <= FRETS ? 1 : Math.min(...used);
  }

  function diagram(name) {
    const frets = shape(name);
    if (!frets) return '';
    const base = baseFret(frets);
    const p = [];

    // 上弦枕：从第 1 品画起时是一条粗线，挪下去之后就跟普通品丝一样
    p.push(`<line class="cd-fret${base === 1 ? ' nut' : ''}" x1="${XS[0]}" y1="${TOP}" x2="${XS[3]}" y2="${TOP}"/>`);
    for (let i = 1; i <= FRETS; i++) {
      const y = TOP + GAP * i;
      p.push(`<line class="cd-fret" x1="${XS[0]}" y1="${y}" x2="${XS[3]}" y2="${y}"/>`);
    }
    XS.forEach((x) => p.push(`<line class="cd-str" x1="${x}" y1="${TOP}" x2="${x}" y2="${TOP + GAP * FRETS}"/>`));

    frets.forEach((f, i) => {
      if (f === 0) p.push(`<circle class="cd-open" cx="${XS[i]}" cy="${TOP - 5.5}" r="2.1"/>`);
      else p.push(`<circle class="cd-dot" cx="${XS[i]}" cy="${TOP + GAP * (f - base + 0.5)}" r="3.3"/>`);
    });
    if (base > 1) p.push(`<text class="cd-base" x="0" y="${TOP + GAP * 0.85}">${base}</text>`);

    return `<svg class="chord-dia" viewBox="0 0 37 ${H}" aria-hidden="true">${p.join('')}</svg>`;
  }

  function pianoDiagram(name) {
    const v = PIANO[name];
    if (!v) return '';
    return `<span class="piano-voicing">
      <span><b>左手</b> ${v.left}</span>
      <span><b>右手</b> ${v.right.join('<i>→</i>')}</span>
      <small>右手指法 ${v.fingers} · 从低到高轻轻顺弹</small>
    </span>`;
  }

  return { diagram, pianoDiagram, shape, names: () => Object.keys(SHAPES) };
})();
