/**
 * ชอบตัวเองตอนอยู่กับเธอ (I Like Us) — BILLKIN
 * 频道：Billkin Entertainment（官方 MV）
 *
 * 歌词文本：使用者自己提供的那份泰文歌词。
 *
 * ⚠️ 时间轴（下面的 TIMES）是「估算值」，不是跟着原曲一句句标出来的：
 *   这台机器连不上 YouTube，听不到歌，只能按歌词句数和常见流行歌节奏推一份，
 *   前奏 12 秒起唱，整首大约 2 分半 —— 位置肯定会偏，只是让页面先能跟。
 *   要标准的时间轴：打开网页 → 右上角「⏱ 校准」，跟着歌每句按一下空格，一遍就好，
 *   结果自动存在浏览器里（会盖掉这里的估算值，换设备/清缓存才需要重标）。
 *   想把校准结果固化进这个文件：校准面板里点「导出给别人用」，把导出来的那一块贴回 TIMES，
 *   再把下面的 synced 改成 true，提示条就不会再出现了。
 *
 * 句子字段：th 泰文 / ro 罗马音 / cnRo 整句中文谐音 / cn 中文意思
 * 逐词字段：th 泰文 / ro 罗马音 / cn 中文谐音 / mean 中文意思
 *
 * 副歌唱了三遍（后两遍多一句尾巴）、结尾是副歌的缩短回声版，
 * 这里用同一份数据复用，只是 id 前缀不同（id 要唯一，「已掌握」的勾是按 id 存的）。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean });

  /* ── 副歌（6 句）── */
  const CHORUS = [
    {
      th: 'ฉันชอบตัวเองเวลาที่อยู่กับเธอ',
      ro: 'chan chop tua eng wela thi yu kap thoe',
      cnRo: '禅抽多英 威拉替优卡特',
      cn: '我喜欢跟你在一起时的自己',
      words: [
        w('ฉันชอบตัวเอง', 'chan chop tua eng', '禅抽多英', '我喜欢自己'),
        w('เวลาที่อยู่กับเธอ', 'wela thi yu kap thoe', '威拉替优卡特', '跟你在一起的时候'),
      ],
    },
    {
      th: 'ชอบที่ฉันเป็นตอนอยู่กับเธอ',
      ro: 'chop thi chan pen ton yu kap thoe',
      cnRo: '抽替禅喷 敦优卡特',
      cn: '喜欢跟你在一起时我的样子',
      words: [
        w('ชอบที่ฉันเป็น', 'chop thi chan pen', '抽替禅喷', '喜欢我（变成）的样子'),
        w('ตอนอยู่กับเธอ', 'ton yu kap thoe', '敦优卡特', '跟你在一起的时候'),
      ],
    },
    {
      th: 'เหมือนฉันได้กลายมาเป็นอีกคนที่ดีกว่าเดิม',
      ro: 'muean chan dai klai ma pen ik khon thi di kwa doem',
      cnRo: '门禅呆改马喷 义孔替迪瓜登',
      cn: '好像我变成了一个比原来更好的人',
      words: [
        w('เหมือนฉันได้กลายมาเป็น', 'muean chan dai klai ma pen', '门禅呆改马喷', '好像我变成了'),
        w('อีกคนที่ดีกว่าเดิม', 'ik khon thi di kwa doem', '义孔替迪瓜登', '一个比原来更好的人'),
      ],
    },
    {
      th: 'ชอบตัวเองเวลาที่อยู่กับเธอ',
      ro: 'chop tua eng wela thi yu kap thoe',
      cnRo: '抽多英 威拉替优卡特',
      cn: '喜欢跟你在一起时的自己',
      words: [
        w('ชอบตัวเอง', 'chop tua eng', '抽多英', '喜欢自己'),
        w('เวลาที่อยู่กับเธอ', 'wela thi yu kap thoe', '威拉替优卡特', '跟你在一起的时候'),
      ],
    },
    {
      th: 'และชอบตัวเธอตอนอยู่กับฉัน',
      ro: 'lae chop tua thoe ton yu kap chan',
      cnRo: '列抽多特 敦优卡禅',
      cn: '也喜欢跟我在一起时的你',
      words: [
        w('และชอบตัวเธอ', 'lae chop tua thoe', '列抽多特', '也喜欢你'),
        w('ตอนอยู่กับฉัน', 'ton yu kap chan', '敦优卡禅', '跟我在一起的时候'),
      ],
    },
    {
      th: 'ฉันชอบเวลาที่เรามีกัน',
      ro: 'chan chop wela thi rao mi kan',
      cnRo: '禅抽 威拉替劳米甘',
      cn: '我喜欢我们在一起的时光',
      words: [
        w('ฉันชอบ', 'chan chop', '禅抽', '我喜欢'),
        w('เวลาที่เรามีกัน', 'wela thi rao mi kan', '威拉替劳米甘', '我们相处的时光'),
      ],
    },
  ];

  /* ── 副歌唱到第二、三遍时多的尾巴一句 ── */
  const TAIL = {
    th: 'ชอบที่ฉันนั้นได้รักเธอ',
    ro: 'chop thi chan nan dai rak thoe',
    cnRo: '抽替禅难 呆拉特',
    cn: '喜欢自己终于能够爱你这件事',
    words: [
      w('ชอบที่ฉันนั้น', 'chop thi chan nan', '抽替禅难', '喜欢我自己'),
      w('ได้รักเธอ', 'dai rak thoe', '呆拉特', '能够爱上你'),
    ],
  };

  const chorusExt = () => [...CHORUS, TAIL];

  /* ── 主歌 A（8 句）── */
  const V1 = [
    {
      th: 'เป็นคน หนึ่งคนที่ไม่ได้ดีอะไร',
      ro: 'pen khon nueng khon thi mai dai di arai',
      cnRo: '喷孔 能孔替埋呆迪阿莱',
      cn: '是一个没什么特别好的人',
      words: [
        w('เป็นคน', 'pen khon', '喷孔', '是一个人'),
        w('หนึ่งคนที่ไม่ได้ดีอะไร', 'nueng khon thi mai dai di arai', '能孔替埋呆迪阿莱', '一个没什么优点的人'),
      ],
    },
    {
      th: 'เป็นคน ที่ธรรมดาทั่ว ๆ ไป',
      ro: 'pen khon thi thammada thua thua pai',
      cnRo: '喷孔 替探马达多多拍',
      cn: '是个普普通通的人',
      words: [
        w('เป็นคน', 'pen khon', '喷孔', '是一个人'),
        w('ที่ธรรมดาทั่ว ๆ ไป', 'thi thammada thua thua pai', '替探马达多多拍', '平平凡凡的'),
      ],
    },
    {
      th: 'บางทีก็ใจร้อน บางทีก็ใจร้าย',
      ro: 'bang thi ko chai ron bang thi ko chai rai',
      cnRo: '邦替戈猜龙 邦替戈猜来',
      cn: '有时候脾气急躁，有时候心肠不好',
      words: [
        w('บางทีก็ใจร้อน', 'bang thi ko chai ron', '邦替戈猜龙', '有时候脾气急躁'),
        w('บางทีก็ใจร้าย', 'bang thi ko chai rai', '邦替戈猜来', '有时候心肠不好'),
      ],
    },
    {
      th: 'บางเรื่องก็ไม่เอาไหนซะเลย',
      ro: 'bang rueang ko mai ao nai sa loei',
      cnRo: '邦良 戈埋奥奈萨类',
      cn: '有些事真的很不像样',
      words: [
        w('บางเรื่อง', 'bang rueang', '邦良', '有些事情'),
        w('ก็ไม่เอาไหนซะเลย', 'ko mai ao nai sa loei', '戈埋奥奈萨类', '就是很不成样子'),
      ],
    },
    {
      th: 'วัน ๆ ก็ใช้ชีวิตมันเรื่อยไป',
      ro: 'wan wan ko chai chiwit man rueai pai',
      cnRo: '完完戈猜器为 曼雷拍',
      cn: '日子就这样一天天混着过',
      words: [
        w('วัน ๆ ก็ใช้ชีวิต', 'wan wan ko chai chiwit', '完完戈猜器为', '一天天地过日子'),
        w('มันเรื่อยไป', 'man rueai pai', '曼雷拍', '就这样继续下去'),
      ],
    },
    {
      th: 'วัน ๆ ก็ทำอะไรเหมือนเคย ๆ',
      ro: 'wan wan ko tham arai muean khoei khoei',
      cnRo: '完完戈探阿莱 门柯柯',
      cn: '每天都做着一样的事情',
      words: [
        w('วัน ๆ ก็ทำอะไร', 'wan wan ko tham arai', '完完戈探阿莱', '一天天做着什么'),
        w('เหมือนเคย ๆ', 'muean khoei khoei', '门柯柯', '跟以前一样'),
      ],
    },
    {
      th: 'ไม่มีหรอกจุดหมาย ไม่มีอะไรเลย',
      ro: 'mai mi rok chutmai mai mi arai loei',
      cnRo: '埋米洛竹买 埋米阿莱类',
      cn: '没有什么目标，什么都没有',
      words: [
        w('ไม่มีหรอกจุดหมาย', 'mai mi rok chutmai', '埋米洛竹买', '根本没有目标'),
        w('ไม่มีอะไรเลย', 'mai mi arai loei', '埋米阿莱类', '什么都没有'),
      ],
    },
    {
      th: 'ไม่มีหรอกวันที่สวยงาม',
      ro: 'mai mi rok wan thi suai ngam',
      cnRo: '埋米洛 完替随岸',
      cn: '也没有什么美好的日子',
      words: [
        w('ไม่มีหรอก', 'mai mi rok', '埋米洛', '根本没有'),
        w('วันที่สวยงาม', 'wan thi suai ngam', '完替随岸', '美好的日子'),
      ],
    },
  ];

  const LINE_THOE_THAMHAI = {
    th: 'เธอทำให้ฉันรู้ว่า',
    ro: 'thoe thamhai chan ru wa',
    cnRo: '特探还禅如哇',
    cn: '你让我明白了',
    words: [w('เธอทำให้ฉันรู้ว่า', 'thoe thamhai chan ru wa', '特探还禅如哇', '你让我知道')],
  };

  const LINE_CHAN_PEN_KHON = {
    th: 'ฉันเป็นคนที่ดีได้มากแค่ไหน',
    ro: 'chan pen khon thi di dai mak khae nai',
    cnRo: '禅喷孔替迪呆 马客奈',
    cn: '原来我能是个多好的人',
    words: [
      w('ฉันเป็นคนที่ดีได้', 'chan pen khon thi di dai', '禅喷孔替迪呆', '我可以是个好人'),
      w('มากแค่ไหน', 'mak khae nai', '马客奈', '能有多好'),
    ],
  };

  /* ── 预副歌（3 句，第一句两遍不一样，用参数传进来）── */
  const pre = (firstLine) => [firstLine, LINE_THOE_THAMHAI, LINE_CHAN_PEN_KHON];

  const PRE1_L1 = {
    th: 'จนวันนี้ ที่เธอได้เดินเข้ามา',
    ro: 'chon wan ni thi thoe dai doen khaoma',
    cnRo: '中完妮 替特呆登靠马',
    cn: '直到今天，你走进了我的生活',
    words: [
      w('จนวันนี้', 'chon wan ni', '中完妮', '直到今天'),
      w('ที่เธอได้เดินเข้ามา', 'thi thoe dai doen khaoma', '替特呆登靠马', '你走了进来'),
    ],
  };

  const PRE2_L1 = {
    th: 'เธอ เมื่อเธอได้เดินเข้ามา',
    ro: 'thoe muea thoe dai doen khaoma',
    cnRo: '特 门特呆登靠马',
    cn: '你，当你走进了我的生活',
    words: [
      w('เธอ', 'thoe', '特', '你'),
      w('เมื่อเธอได้เดินเข้ามา', 'muea thoe dai doen khaoma', '门特呆登靠马', '当你走了进来'),
    ],
  };

  /* ── 主歌 B（4 句，比主歌 A 短）── */
  const V2 = [
    {
      th: 'เธอทำ ให้คนที่ไม่มีหัวใจ',
      ro: 'thoe tham hai khon thi mai mi huachai',
      cnRo: '特探还 孔替埋米华猜',
      cn: '你让一个没有心的人',
      words: [
        w('เธอทำให้', 'thoe tham hai', '特探还', '你让'),
        w('คนที่ไม่มีหัวใจ', 'khon thi mai mi huachai', '孔替埋米华猜', '没有心的人'),
      ],
    },
    {
      th: 'ได้รู้ ในเรื่องที่ไม่เคยเข้าใจ',
      ro: 'dai ru nai rueang thi mai khoei khaochai',
      cnRo: '呆如 乃良替埋柯靠猜',
      cn: '懂得了从来不曾明白的事',
      words: [
        w('ได้รู้', 'dai ru', '呆如', '懂得了'),
        w('ในเรื่องที่ไม่เคยเข้าใจ', 'nai rueang thi mai khoei khaochai', '乃良替埋柯靠猜', '从没懂过的事'),
      ],
    },
    {
      th: 'คนที่เคยใจร้อน คนที่เคยใจร้าย',
      ro: 'khon thi khoei chai ron khon thi khoei chai rai',
      cnRo: '孔替柯猜龙 孔替柯猜来',
      cn: '曾经脾气急躁的人、曾经心肠不好的人',
      words: [
        w('คนที่เคยใจร้อน', 'khon thi khoei chai ron', '孔替柯猜龙', '曾经脾气急躁的人'),
        w('คนที่เคยใจร้าย', 'khon thi khoei chai rai', '孔替柯猜来', '曾经心肠不好的人'),
      ],
    },
    {
      th: 'กลายเป็นอีกคนที่รักใครเป็น',
      ro: 'klai pen ik khon thi rak khrai pen',
      cnRo: '改喷 义孔替拉开喷',
      cn: '变成了一个懂得爱人的人',
      words: [
        w('กลายเป็น', 'klai pen', '改喷', '变成了'),
        w('อีกคนที่รักใครเป็น', 'ik khon thi rak khrai pen', '义孔替拉开喷', '一个懂得爱人的人'),
      ],
    },
  ];

  /* ── 结尾（副歌的缩短回声版，4 句）── */
  const OUTRO = [
    CHORUS[3],
    CHORUS[4],
    {
      th: 'ชอบเวลาที่เรามีกัน',
      ro: 'chop wela thi rao mi kan',
      cnRo: '抽 威拉替劳米甘',
      cn: '喜欢我们在一起的时光',
      words: [
        w('ชอบ', 'chop', '抽', '喜欢'),
        w('เวลาที่เรามีกัน', 'wela thi rao mi kan', '威拉替劳米甘', '我们相处的时光'),
      ],
    },
    TAIL,
  ];

  /* ── 时间轴（秒）── 每句开唱的时间，按段落分开写，顺序 = 段落里句子的顺序。
     副歌唱了三遍、结尾又回声了一遍，用同一份数据复用，但时间各不一样，
     所以时间不写在歌词里，放这里按段落前缀分开给。
     ⚠️ 这份是估算值，见文件顶部说明；用网页上的「⏱ 校准」标一遍就准了。 */
  const TIMES = {
    c1: [12, 15.3, 18.6, 21.9, 25.2, 28.5],
    v1: [32, 35, 38, 41, 44, 47, 50, 53],
    p1: [57, 60.5, 64],
    c2: [68, 71.3, 74.6, 77.9, 81.2, 84.5, 87.8],
    v2: [92, 95.2, 98.4, 101.6],
    p2: [106, 109.5, 113],
    c3: [117, 120.3, 123.6, 126.9, 130.2, 133.5, 136.8],
    o1: [141, 145, 149, 153],
  };

  // 补 id、lang 和 start：id 用「段落前缀-第几句」，全曲唯一；
  // start 从 TIMES[prefix] 里按顺序取（没给就留空，页面会当这句没时间轴）
  const withIds = (prefix, lines) =>
    lines.map((l, i) => Object.assign(
      { id: `${prefix}-${i + 1}`, lang: 'th', start: (TIMES[prefix] || [])[i] },
      l
    ));

  window.SONGS['chop-tua-eng-tawn-yu-kap-thoe'] = {
    id: 'chop-tua-eng-tawn-yu-kap-thoe',
    title: 'Chop Tua Eng Tawn Yu Kap Thoe (I Like Us)',
    titleTh: 'ชอบตัวเองตอนอยู่กับเธอ',
    titleCn: '喜欢跟你在一起时的自己',
    artist: 'BILLKIN',
    album: '',
    youtubeId: 'D-aCb9xsqTE',

    // 有逐句时间轴：页面跟着原曲自动高亮，KTV / 单句循环 / 自动跟随都能用。
    // synced: false = 上面 TIMES 里的秒数还是估算的，没跟着原曲标过 ——
    // 页面顶部会挂一条提示，点右上角「⏱ 校准」自己标一遍就行。
    synced: false,
    // 时间集中写在 TIMES 里（不是写在每句上），校准面板点「导出」就会按 TIMES 的格式给，
    // 整块贴回去即可
    timesStyle: 'grouped',

    sections: [
      { name: '副歌',   nameEn: 'Chorus 1',    lines: withIds('c1', CHORUS) },
      { name: '主歌 A', nameEn: 'Verse 1',     lines: withIds('v1', V1) },
      { name: '预副歌', nameEn: 'Pre-chorus 1', lines: withIds('p1', pre(PRE1_L1)) },
      { name: '副歌',   nameEn: 'Chorus 2',    lines: withIds('c2', chorusExt()) },
      { name: '主歌 B', nameEn: 'Verse 2',     lines: withIds('v2', V2) },
      { name: '预副歌', nameEn: 'Pre-chorus 2', lines: withIds('p2', pre(PRE2_L1)) },
      { name: '副歌',   nameEn: 'Chorus 3',    lines: withIds('c3', chorusExt()) },
      { name: '结尾',   nameEn: 'Outro',        lines: withIds('o1', OUTRO) },
    ],
  };
})();
