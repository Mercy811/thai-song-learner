/**
 * แล้วเราจะได้รักกันไหม — Lena Lalina x Miu Natsha
 * เพลงประกอบซีรีส์ PLS Love รักได้ไหม (2026)
 *
 * 这是同名歌曲的 LenaMiu 重新演唱版。歌词、罗马音、中文谐音和逐词释义与曲库中
 * ณเดชน์ / ญาญ่า 版相同，因此从那首歌复制学习数据；本文件只维护这个新版 MV
 * 独有的演唱分段和时间轴。
 *
 * 时间轴取自官方 MV 的泰语逐词字幕，并按本项目的整句边界重新合并。
 */
window.SONGS = window.SONGS || {};

(() => {
  const source = window.SONGS['laeo-rao-cha-dai-rak-kan-mai'];
  if (!source) return;

  const TIMES = {
    lm1v: [14.64, 18.92, 28.36, 31.92],
    lm1p: [41.24, 48.00],
    lm1c: [56.72, 63.68, 71.64, 82.40],
    lm2v: [93.40, 96.96],
    lm2p: [106.40, 113.12],
    lm2c: [118.32, 125.40, 133.40, 144.20],
    lmf:  [166.44, 173.40, 181.40, 192.16, 200.68, 210.92],
  };

  const sectionSpecs = [
    ['lm1v', 0, '第一段主歌', 'Verse 1'],
    ['lm1p', 1, '第一段预副歌', 'Pre-chorus 1'],
    ['lm1c', 2, '第一遍副歌', 'Hook 1'],
    ['lm2v', 3, '第二段主歌', 'Verse 2'],
    ['lm2p', 4, '第二段预副歌', 'Pre-chorus 2'],
    ['lm2c', 5, '合唱副歌', 'Duet Hook'],
    ['lmf',  6, '尾声', 'Finale'],
  ];

  const sections = sectionSpecs.map(([prefix, sourceIndex, name, nameEn]) => ({
    name,
    nameEn,
    lines: source.sections[sourceIndex].lines.map((sourceLine, i) => ({
      ...sourceLine,
      words: sourceLine.words.map((word) => ({ ...word })),
      id: `${prefix}-${i + 1}`,
      start: TIMES[prefix][i],
    })),
  }));

  window.SONGS['laeo-rao-cha-dai-rak-kan-mai-lenamiu'] = {
    id: 'laeo-rao-cha-dai-rak-kan-mai-lenamiu',
    title: 'Laeo Rao Cha Dai Rak Kan Mai (LenaMiu)',
    titleTh: 'แล้วเราจะได้รักกันไหม',
    titleCn: '那么我们还能相爱吗（LenaMiu 版）',
    artist: 'Lena Lalina x Miu Natsha',
    album: 'เพลงประกอบซีรีส์ PLS Love รักได้ไหม',
    youtubeId: 'rwF5R3mkTAE',
    timeline: true,
    synced: true,
    timesStyle: 'grouped',
    sections,
  };
})();
