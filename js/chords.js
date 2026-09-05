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
    Dmaj7: { left: 'D + A', right: ['F♯', 'A', 'C♯'], leftKeys: [38, 45], rightKeys: [54, 57, 61], fingers: '1–2–5' },
    D:     { left: 'D + A', right: ['F♯', 'A', 'D'],  leftKeys: [38, 45], rightKeys: [54, 57, 62], fingers: '1–2–5' },
    Bm7:   { left: 'B + F♯', right: ['F♯', 'A', 'B', 'D'], leftKeys: [35, 42], rightKeys: [54, 57, 59, 62], fingers: '1–2–3–5' },
    Em7:   { left: 'E + B', right: ['G', 'B', 'D'], leftKeys: [40, 47], rightKeys: [55, 59, 62], fingers: '1–3–5' },
    A:     { left: 'A + E', right: ['A', 'C♯', 'E'], leftKeys: [45, 52], rightKeys: [57, 61, 64], fingers: '1–2–5' },
    A7:    { left: 'A + E', right: ['G', 'A', 'C♯', 'E'], leftKeys: [45, 52], rightKeys: [55, 57, 61, 64], fingers: '1–2–3–5' },
    Gmaj7: { left: 'G + D', right: ['F♯', 'B', 'D'], leftKeys: [43, 50], rightKeys: [54, 59, 62], fingers: '1–3–5' },
    'F#m7': { left: 'F♯ + C♯', right: ['E', 'F♯', 'A', 'C♯'], leftKeys: [42, 49], rightKeys: [52, 54, 57, 61], fingers: '1–2–3–5' },
  };

  const PIANO_START = 35; // B1
  const PIANO_END = 64;   // E4
  const WHITE_NOTES = new Set([0, 2, 4, 5, 7, 9, 11]);
  const PIANO_WHITE_W = 14;
  const PIANO_WHITE_H = 70;

  function pianoKeyboard(v, name) {
    const whites = [];
    const blacks = [];
    const whiteX = {};
    let whiteIndex = 0;
    for (let midi = PIANO_START; midi <= PIANO_END; midi++) {
      if (WHITE_NOTES.has(midi % 12)) {
        const x = whiteIndex * PIANO_WHITE_W;
        whiteX[midi] = x;
        whites.push(`<rect class="pk-white" x="${x}" y="1" width="${PIANO_WHITE_W}" height="${PIANO_WHITE_H}" rx="1"/>`);
        whiteIndex++;
      }
    }
    for (let midi = PIANO_START; midi <= PIANO_END; midi++) {
      if (WHITE_NOTES.has(midi % 12)) continue;
      let previous = midi - 1;
      while (!WHITE_NOTES.has(previous % 12)) previous--;
      const x = (whiteX[previous] ?? 0) + PIANO_WHITE_W * .68;
      blacks.push(`<rect class="pk-black" x="${x}" y="1" width="9" height="42" rx="1.5"/>`);
    }
    const dots = (keys, hand) => keys.map((midi) => {
      const black = !WHITE_NOTES.has(midi % 12);
      let x;
      if (black) {
        let previous = midi - 1;
        while (!WHITE_NOTES.has(previous % 12)) previous--;
        x = (whiteX[previous] ?? 0) + PIANO_WHITE_W * .68 + 4.5;
      } else {
        x = (whiteX[midi] ?? 0) + PIANO_WHITE_W / 2;
      }
      return `<circle class="pk-dot pk-${hand}" cx="${x}" cy="${black ? 29 : 57}" r="4.2"/>`;
    }).join('');
    const width = whiteIndex * PIANO_WHITE_W;
    return `<svg class="piano-keyboard" viewBox="0 0 ${width} 72" role="img" aria-label="${name} 钢琴键位；橙色是左手，绿色是右手">
      ${whites.join('')}${blacks.join('')}${dots(v.leftKeys, 'left')}${dots(v.rightKeys, 'right')}
    </svg>`;
  }

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
      ${pianoKeyboard(v, name)}
      <span class="piano-legend"><i class="pk-legend-left"></i><b>左手</b> ${v.left}<i class="pk-legend-right"></i><b>右手</b> ${v.right.join(' → ')}</span>
      <small>右手指法 ${v.fingers} · 从低到高轻轻顺弹</small>
    </span>`;
  }

  return { diagram, pianoDiagram, shape, names: () => Object.keys(SHAPES) };
})();
