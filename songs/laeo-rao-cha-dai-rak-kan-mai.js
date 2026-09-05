/**
 * แล้วเราจะได้รักกันไหม — ณเดชน์ คูกิมิยะ feat. ญาญ่า อุรัสยา
 * เพลงประกอบละคร รอยฝันตะวันเดือด (2014)
 *
 * 歌词与演唱分段参考 ArtBangkok；罗马音参考 Deungdutjai，并统一为项目拼写。
 * 尚未逐句校准官方 MV，因此先只开放练习模式。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean });
  const line = (th, ro, cnRo, cn, words) => ({ th, ro, cnRo, cn, words });

  const NADECH_VERSE = [
    line('ทำไมไม่พูดดีดี', 'thammai mai phut di di', '探迈 埋普迪迪', '为什么不能好好说话', [
      w('ทำไม', 'thammai', '探迈', '为什么'), w('ไม่พูดดีดี', 'mai phut di di', '埋普迪迪', '不好好说话'),
    ]),
    line('ทำไมต้องแกล้งเธอให้ช้ำหัวใจ ทำไมต้องทำแบบนี้', 'thammai tong klaeng thoe hai cham huachai thammai tong tham baep ni', '探迈东格楞特 还掺华猜 探迈东探拜妮', '为什么非要捉弄你、伤你的心，为什么要这样做', [
      w('ทำไมต้องแกล้งเธอ', 'thammai tong klaeng thoe', '探迈东格楞特', '为什么非要捉弄你'),
      w('ให้ช้ำหัวใจ', 'hai cham huachai', '还掺华猜', '让心受伤'),
      w('ทำไมต้องทำแบบนี้', 'thammai tong tham baep ni', '探迈东探拜妮', '为什么非要这样做'),
    ]),
    line('ทำไมไม่พูดตรงตรง', 'thammai mai phut trong trong', '探迈 埋普东东', '为什么不能坦白地说', [
      w('ทำไม', 'thammai', '探迈', '为什么'), w('ไม่พูดตรงตรง', 'mai phut trong trong', '埋普东东', '不直说'),
    ]),
    line('ทั้งที่ก็หลงรักเธอทั้งหัวใจ ไม่รู้เพราะอะไร', 'thang thi ko long rak thoe thang huachai mai ru phro arai', '汤替戈隆拉特 汤华猜 埋如坡阿莱', '明明整颗心都已爱上你，却不知道为什么', [
      w('ทั้งที่ก็หลงรักเธอ', 'thang thi ko long rak thoe', '汤替戈隆拉特', '明明已经爱上你'),
      w('ทั้งหัวใจ', 'thang huachai', '汤华猜', '整颗心'), w('ไม่รู้เพราะอะไร', 'mai ru phro arai', '埋如坡阿莱', '不知道为什么'),
    ]),
  ];

  const NADECH_PRE = [
    line('อยากตบปากตัวเอง พูดจาอะไรไป', 'yak top pak tua-eng phutcha arai pai', '亚托巴杜阿英 普扎阿莱拍', '真想打自己的嘴，怎么会说出那些话', [
      w('อยากตบปากตัวเอง', 'yak top pak tua-eng', '亚托巴杜阿英', '想打自己的嘴'), w('พูดจาอะไรไป', 'phutcha arai pai', '普扎阿莱拍', '说了些什么出去'),
    ]),
    line('ทำให้เรื่องง่ายดายมันยากมันเย็นกว่าเดิม', 'thamhai rueang ngai-dai man yak man yen kwa doem', '探还良艾呆 曼亚曼烟 瓜登', '把本来简单的事弄得比以前更难', [
      w('ทำให้เรื่องง่ายดาย', 'thamhai rueang ngai-dai', '探还良艾呆', '让简单的事'), w('มันยากมันเย็นกว่าเดิม', 'man yak man yen kwa doem', '曼亚曼烟瓜登', '变得比以前更困难'),
    ]),
  ];

  const HOOK = [
    line('ทั้งที่ในใจมันร้อง บอกว่ารัก', 'thang thi nai chai man rong bok wa rak', '汤替乃猜曼隆 博哇拉', '明明心里一直呐喊着说爱你', [
      w('ทั้งที่ในใจมันร้อง', 'thang thi nai chai man rong', '汤替乃猜曼隆', '明明心里在呐喊'), w('บอกว่ารัก', 'bok wa rak', '博哇拉', '说爱你'),
    ]),
    line('แต่ฉันทำไมต้องเป็นคนแบบนี้ มันไม่เข้าใจ', 'tae chan thammai tong pen khon baep ni man mai khaochai', '代禅探迈东喷孔拜妮 曼埋靠猜', '可我为什么偏偏是这样的人，实在不明白', [
      w('แต่ฉันทำไม', 'tae chan thammai', '代禅探迈', '可我为什么'), w('ต้องเป็นคนแบบนี้', 'tong pen khon baep ni', '东喷孔拜妮', '非得是这样的人'), w('มันไม่เข้าใจ', 'man mai khaochai', '曼埋靠猜', '实在不明白'),
    ]),
    line('ปากกับใจเป็นอะไร ทำไมพูดไม่ตรงกันเลย', 'pak kap chai pen arai thammai phut mai trong kan loei', '巴噶猜喷阿莱 探迈普埋东甘勒', '嘴和心到底怎么了，为什么说的完全不一样', [
      w('ปากกับใจเป็นอะไร', 'pak kap chai pen arai', '巴噶猜喷阿莱', '嘴和心怎么了'), w('ทำไมพูดไม่ตรงกันเลย', 'thammai phut mai trong kan loei', '探迈普埋东甘勒', '为什么说的完全不一致'),
    ]),
    line('แล้วเราจะได้รักกันไหม', 'laeo rao cha dai rak kan mai', '辽劳扎呆拉甘埋', '那么我们还能相爱吗', [
      w('แล้วเรา', 'laeo rao', '辽劳', '那么我们'), w('จะได้รักกันไหม', 'cha dai rak kan mai', '扎呆拉甘埋', '能够相爱吗'),
    ]),
  ];

  const YAYA_VERSE = [
    line('แค่คำว่ารักคำเดียว', 'khae kham wa rak kham diao', '客康哇拉 康雕', '不过就是一句“爱”', [
      w('แค่', 'khae', '客', '只是'), w('คำว่ารัก', 'kham wa rak', '康哇拉', '“爱”这个词'), w('คำเดียว', 'kham diao', '康雕', '一个词、仅一句'),
    ]),
    line('ทำไมตัวฉันต้องปากแข็งไม่เข้าใจ เก็บไว้เพื่ออะไร', 'thammai tua chan tong pak khaeng mai khaochai kep wai phuea arai', '探迈杜阿禅东巴康 埋靠猜 给外普阿莱', '为什么我偏要嘴硬，真不懂藏着是为了什么', [
      w('ทำไมตัวฉันต้องปากแข็ง', 'thammai tua chan tong pak khaeng', '探迈杜阿禅东巴康', '为什么我非要嘴硬'), w('ไม่เข้าใจ', 'mai khaochai', '埋靠猜', '不明白'), w('เก็บไว้เพื่ออะไร', 'kep wai phuea arai', '给外普阿莱', '藏着是为了什么'),
    ]),
  ];

  const YAYA_PRE = [
    line('ได้แต่โกรธตัวเอง ที่ทำเป็นเย็นชา', 'dai tae krot tua-eng thi tham pen yencha', '呆代格罗杜阿英 替探喷烟察', '只能气自己，偏偏装得冷淡', [
      w('ได้แต่โกรธตัวเอง', 'dai tae krot tua-eng', '呆代格罗杜阿英', '只能生自己的气'), w('ที่ทำเป็นเย็นชา', 'thi tham pen yencha', '替探喷烟察', '因为装作冷淡'),
    ]),
    NADECH_PRE[1],
  ];

  const FINAL = [
    HOOK[0],
    HOOK[1],
    HOOK[2],
    HOOK[3],
    line('จะมีไหมสักวันที่ฉัน กล้าบอกคำคำนี้', 'cha mi mai sak wan thi chan kla bok kham kham ni', '扎米埋萨完替禅 格拉博康康妮', '会不会有一天，我终于敢说出这句话', [
      w('จะมีไหมสักวัน', 'cha mi mai sak wan', '扎米埋萨完', '会不会有一天'), w('ที่ฉันกล้า', 'thi chan kla', '替禅格拉', '我敢于'), w('บอกคำคำนี้', 'bok kham kham ni', '博康康妮', '说出这句话'),
    ]),
    line('ที่จริงฉันนั้นรัก รักเธอหมดใจ', 'thi ching chan nan rak rak thoe mot chai', '替京禅难拉 拉特莫猜', '其实我是爱你的，全心全意地爱你', [
      w('ที่จริงฉันนั้นรัก', 'thi ching chan nan rak', '替京禅难拉', '其实我是爱你的'), w('รักเธอหมดใจ', 'rak thoe mot chai', '拉特莫猜', '全心全意爱你'),
    ]),
  ];

  const withIds = (prefix, rows) => rows.map((row, i) => ({ ...row, id: `${prefix}-${i + 1}` }));

  window.SONGS['laeo-rao-cha-dai-rak-kan-mai'] = {
    id: 'laeo-rao-cha-dai-rak-kan-mai',
    title: 'Laeo Rao Cha Dai Rak Kan Mai',
    titleTh: 'แล้วเราจะได้รักกันไหม',
    titleCn: '那么我们还能相爱吗',
    artist: 'ณเดชน์ คูกิมิยะ feat. ญาญ่า อุรัสยา',
    album: 'เพลงประกอบละคร รอยฝันตะวันเดือด',
    youtubeId: 'Flnk4A69_4A',
    timeline: false,
    sections: [
      { name: '男声主歌', nameEn: 'Nadech Verse', lines: withIds('nv', NADECH_VERSE) },
      { name: '男声预副歌', nameEn: 'Nadech Pre-chorus', lines: withIds('np', NADECH_PRE) },
      { name: '副歌', nameEn: 'Hook', lines: withIds('c1', HOOK) },
      { name: '女声主歌', nameEn: 'Yaya Verse', lines: withIds('yv', YAYA_VERSE) },
      { name: '女声预副歌', nameEn: 'Yaya Pre-chorus', lines: withIds('yp', YAYA_PRE) },
      { name: '合唱副歌', nameEn: 'Duet Hook', lines: withIds('c2', HOOK) },
      { name: '尾声', nameEn: 'Finale', lines: withIds('out', FINAL) },
    ],
  };
})();
