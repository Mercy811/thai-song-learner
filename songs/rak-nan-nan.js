/**
 * รักนานๆ（愿能长长久久爱着你）
 *
 * 歌词文本：使用者自己提供的那份泰文歌词，出处标注 siamzone.com/music/thailyric/31565
 * YouTube 链接放的是 LAMOON official 频道发的翻唱版（ลีน่า - หมิว cover），
 * 原唱是谁这台机器查不太准（搜出来的名字前后矛盾），先按翻唱版标，
 * 之后确认了原唱是谁可以把 artist 改回去。
 *
 * ⚠️ 时间轴（下面的 TIMES）是「估算值」，不是跟着原曲一句句标出来的：
 *   这台机器连不上 YouTube，听不到歌，只能按歌词句数和抒情慢歌节奏推一份，
 *   前奏 14 秒起唱，整首大约 3 分半 —— 位置肯定会偏，只是让页面先能跟。
 *   要标准的时间轴：打开网页 → 右上角「⏱ 校准」，跟着歌每句按一下空格，一遍就好，
 *   结果自动存在浏览器里（会盖掉这里的估算值，换设备/清缓存才需要重标）。
 *   想把校准结果固化进这个文件：校准面板里点「导出给别人用」，把导出来的那一块贴回 TIMES，
 *   再把下面的 synced 改成 true，提示条就不会再出现了。
 *
 * 句子字段：th 泰文 / ro 罗马音 / cnRo 整句中文谐音 / cn 中文意思
 * 逐词字段：th 泰文 / ro 罗马音 / cn 中文谐音 / mean 中文意思
 *
 * 副歌唱了三遍、主歌 A/B 后半两句歌词重复，这里用同一份数据复用，只是 id 前缀不同
 * （id 要唯一，「已掌握」的勾是按 id 存的）。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean });

  /* ── 主歌 A ── */
  const V1 = [
    {
      th: 'ฉันรู้ว่าฉันโชคดีเท่าไร',
      ro: 'chan ru wa chan chokdi thaorai',
      cnRo: '禅如哇 禅措迪 涛来',
      cn: '我知道自己有多幸运',
      words: [
        w('ฉันรู้ว่า', 'chan ru wa', '禅如哇', '我知道'),
        w('ฉันโชคดี', 'chan chokdi', '禅措迪', '我很幸运'),
        w('เท่าไร', 'thaorai', '涛来', '有多少、多么'),
      ],
    },
    {
      th: 'ที่ได้มีเธอร่วมเดินข้างกัน',
      ro: 'thi dai mi thoe ruam doen khang kan',
      cnRo: '替呆米特 拢登 康甘',
      cn: '能有你陪着我一起走',
      words: [
        w('ที่ได้มีเธอ', 'thi dai mi thoe', '替呆米特', '能拥有你'),
        w('ร่วมเดิน', 'ruam doen', '拢登', '一起走'),
        w('ข้างกัน', 'khang kan', '康甘', '在身边'),
      ],
    },
    {
      th: 'จับมือและคอยรับฟัง',
      ro: 'chapmue lae khoi rapfang',
      cnRo: '扎木 列 抠拉方',
      cn: '牵着我的手，静静地听我说',
      words: [
        w('จับมือ', 'chapmue', '扎木', '牵手'),
        w('และ', 'lae', '列', '和、而且'),
        w('คอยรับฟัง', 'khoi rapfang', '抠拉方', '一直倾听'),
      ],
    },
    {
      th: 'ในวันที่ผิดหวัง ไม่ไปไหน',
      ro: 'nai wan thi phitwang mai pai nai',
      cnRo: '乃完替皮网 埋拍奈',
      cn: '在我失望的日子里，你也不曾走开',
      words: [
        w('ในวันที่ผิดหวัง', 'nai wan thi phitwang', '乃完替皮网', '在失望的那些日子'),
        w('ไม่ไปไหน', 'mai pai nai', '埋拍奈', '哪里都不去'),
      ],
    },
  ];

  /* ── 主歌 A/B 结尾都会用到的两句 ── */
  const REPEAT_PAIR = [
    {
      th: 'ตลอดไปมีจริงไหม',
      ro: 'talotpai mi ching mai',
      cnRo: '达洛拍 米京埋',
      cn: '「永远」这种事真的存在吗',
      words: [
        w('ตลอดไป', 'talotpai', '达洛拍', '永远'),
        w('มีจริงไหม', 'mi ching mai', '米京埋', '真的存在吗'),
      ],
    },
    {
      th: 'ฉันภาวนา ให้เป็นเรื่องจริง',
      ro: 'chan phawana hai pen rueang ching',
      cnRo: '禅帕瓦纳 还喷良京',
      cn: '我在心里祈祷，希望这是真的',
      words: [
        w('ฉันภาวนา', 'chan phawana', '禅帕瓦纳', '我祈祷'),
        w('ให้เป็นเรื่องจริง', 'hai pen rueang ching', '还喷良京', '希望成真'),
      ],
    },
  ];

  /* ── 主歌 B ── */
  const V2 = [
    {
      th: 'ในทุกๆ วันฉันกลัวเหลือเกิน',
      ro: 'nai thuk thuk wan chan klua luea koen',
      cnRo: '乃秃秃完 禅刮略跟',
      cn: '每一天我都害怕得不得了',
      words: [
        w('ในทุกๆ วัน', 'nai thuk thuk wan', '乃秃秃完', '每一天'),
        w('ฉันกลัวเหลือเกิน', 'chan klua luea koen', '禅刮略跟', '我害怕得过分'),
      ],
    },
    {
      th: 'กลัวมีซักวันที่เธอหายไป',
      ro: 'klua mi sak wan thi thoe hai pai',
      cnRo: '刮米萨完替 特还拍',
      cn: '害怕有一天你会突然消失',
      words: [
        w('กลัวมีซักวันที่', 'klua mi sak wan thi', '刮米萨完替', '害怕有一天'),
        w('เธอหายไป', 'thoe hai pai', '特还拍', '你消失了'),
      ],
    },
    ...REPEAT_PAIR,
  ];

  /* ── 主歌 C（第三遍，歌词换了）── */
  const V3 = [
    {
      th: 'ชีวิตที่เหลือไม่รู้เป็นไง',
      ro: 'chiwit thi luea mai ru pen ngai',
      cnRo: '器为替略 埋如喷艾',
      cn: '剩下的人生会怎样，我也不知道',
      words: [
        w('ชีวิตที่เหลือ', 'chiwit thi luea', '器为替略', '剩下的人生'),
        w('ไม่รู้เป็นไง', 'mai ru pen ngai', '埋如喷艾', '不知道会怎样'),
      ],
    },
    {
      th: 'แค่เรามีกันก็ไม่เป็นไร',
      ro: 'khae rao mi kan ko mai pen rai',
      cnRo: '客劳米甘 戈埋喷来',
      cn: '只要我们彼此拥有，就没关系',
      words: [
        w('แค่เรามีกัน', 'khae rao mi kan', '客劳米甘', '只要我们拥有彼此'),
        w('ก็ไม่เป็นไร', 'ko mai pen rai', '戈埋喷来', '就没关系'),
      ],
    },
    ...REPEAT_PAIR,
  ];

  /* ── 副歌前半（4 句）── */
  const CH_A = [
    {
      th: 'ช่วยอยู่ให้ฉันรักนานๆ ได้ไหม',
      ro: 'chuai yu hai chan rak nan nan dai mai',
      cnRo: '帅优还禅拉 难难 呆埋',
      cn: '可不可以留下来，让我爱得长长久久',
      words: [
        w('ช่วยอยู่ให้ฉันรัก', 'chuai yu hai chan rak', '帅优还禅拉', '帮我留下来爱着'),
        w('นานๆ', 'nan nan', '难难', '长长久久'),
        w('ได้ไหม', 'dai mai', '呆埋', '可以吗'),
      ],
    },
    {
      th: 'ช่วยอยู่กันอย่างนี้นานๆ ได้ไหม',
      ro: 'chuai yu kan yang ni nan nan dai mai',
      cnRo: '帅优甘养妮 难难呆埋',
      cn: '可不可以就这样长长久久地在一起',
      words: [
        w('ช่วยอยู่กันอย่างนี้', 'chuai yu kan yang ni', '帅优甘养妮', '帮我们就这样待着'),
        w('นานๆ ได้ไหม', 'nan nan dai mai', '难难呆埋', '长长久久好不好'),
      ],
    },
    {
      th: 'แค่อยากจะเก็บทุกๆ เวลา และทุกวินาที',
      ro: 'khae yak cha kep thuk thuk wela lae thuk winathi',
      cnRo: '客亚扎给 秃秃威拉 列秃威纳提',
      cn: '只是想留住每一段时光、每一秒',
      words: [
        w('แค่อยากจะเก็บ', 'khae yak cha kep', '客亚扎给', '只是想留住'),
        w('ทุกๆ เวลา', 'thuk thuk wela', '秃秃威拉', '每一段时光'),
        w('และทุกวินาที', 'lae thuk winathi', '列秃威纳提', '和每一秒'),
      ],
    },
    {
      th: 'ที่ฉันมีเธอคนนี้ข้างๆ กัน',
      ro: 'thi chan mi thoe khon ni khang khang kan',
      cnRo: '替禅米特孔妮 康康甘',
      cn: '拥有你这个人陪在身边的时光',
      words: [
        w('ที่ฉันมีเธอคนนี้', 'thi chan mi thoe khon ni', '替禅米特孔妮', '我拥有你这个人'),
        w('ข้างๆ กัน', 'khang khang kan', '康康甘', '互相陪伴在身边'),
      ],
    },
  ];

  /* ── 副歌后半（5 句）── */
  const CH_B = [
    {
      th: 'ช่วยอยู่ให้ฉันรักนานๆ ได้ไหม',
      ro: 'chuai yu hai chan rak nan nan dai mai',
      cnRo: '帅优还禅拉 难难 呆埋',
      cn: '可不可以留下来，让我爱得长长久久',
      words: [
        w('ช่วยอยู่ให้ฉันรัก', 'chuai yu hai chan rak', '帅优还禅拉', '帮我留下来爱着'),
        w('นานๆ', 'nan nan', '难难', '长长久久'),
        w('ได้ไหม', 'dai mai', '呆埋', '可以吗'),
      ],
    },
    {
      th: 'ช่วยอยู่กันอย่างนี้นานๆ',
      ro: 'chuai yu kan yang ni nan nan',
      cnRo: '帅优甘养妮 难难',
      cn: '就这样长长久久地在一起吧',
      words: [
        w('ช่วยอยู่กันอย่างนี้', 'chuai yu kan yang ni', '帅优甘养妮', '就这样一起待着'),
        w('นานๆ', 'nan nan', '难难', '长长久久'),
      ],
    },
    {
      th: 'เพราะเธอนั้นคือ ความสุขของฉัน',
      ro: 'phro thoe nan khue khwam suk khong chan',
      cnRo: '坡特难科 宽素空禅',
      cn: '因为你就是我的幸福',
      words: [
        w('เพราะเธอนั้นคือ', 'phro thoe nan khue', '坡特难科', '因为你就是'),
        w('ความสุขของฉัน', 'khwam suk khong chan', '宽素空禅', '我的幸福'),
      ],
    },
    {
      th: 'สัญญาจะดูแลจนวันสุดท้าย',
      ro: 'sanya cha dulae chon wan sutthai',
      cnRo: '山雅扎杜列 中完素太',
      cn: '我答应会照顾你到最后一天',
      words: [
        w('สัญญาจะดูแล', 'sanya cha dulae', '山雅扎杜列', '答应会照顾'),
        w('จนวันสุดท้าย', 'chon wan sutthai', '中完素太', '直到最后一天'),
      ],
    },
    {
      th: 'และจะรักเธอ จนรักใครไม่ได้อีก',
      ro: 'lae cha rak thoe chon rak khrai mai dai ik',
      cnRo: '列扎拉特 中拉开埋呆义',
      cn: '而且会一直爱你，爱到再也爱不了别人',
      words: [
        w('และจะรักเธอ', 'lae cha rak thoe', '列扎拉特', '而且会爱你'),
        w('จนรักใครไม่ได้อีก', 'chon rak khrai mai dai ik', '中拉开埋呆义', '直到再也没办法爱别人'),
      ],
    },
  ];

  const chorus = () => [...CH_A, ...CH_B];

  /* ── 过渡段 ── */
  const BRIDGE = [
    {
      th: 'อธิษฐานวิงวอนกับดาวนับร้อยพัน',
      ro: 'athitthan wingwon kap dao nap roi phan',
      cnRo: '阿提坦温万 卡涛纳洛潘',
      cn: '向成百上千颗星星许愿祈求',
      words: [
        w('อธิษฐานวิงวอน', 'athitthan wingwon', '阿提坦温万', '许愿祈求'),
        w('กับดาวนับร้อยพัน', 'kap dao nap roi phan', '卡涛纳洛潘', '向成百上千颗星星'),
      ],
    },
    {
      th: 'ให้เธอนั้นเป็นรักสุดท้ายจะได้ไหม',
      ro: 'hai thoe nan pen rak sutthai cha dai mai',
      cnRo: '还特难喷拉素太 扎呆埋',
      cn: '希望你能成为我最后的爱，可以吗',
      words: [
        w('ให้เธอนั้นเป็นรักสุดท้าย', 'hai thoe nan pen rak sutthai', '还特难喷拉素太', '希望你是我最后的爱'),
        w('จะได้ไหม', 'cha dai mai', '扎呆埋', '可以吗'),
      ],
    },
  ];

  /* ── 时间轴（秒）── 每句开唱的时间，按段落分开写，顺序 = 段落里句子的顺序。
     副歌唱了三遍，用同一份数据复用，但时间各不一样，所以时间不写在歌词里，
     放这里按段落前缀分开给。
     ⚠️ 这份是估算值，见文件顶部说明；用网页上的「⏱ 校准」标一遍就准了。 */
  const TIMES = {
    v1: [14, 18, 22, 26],
    v2: [31, 35, 39, 43],
    c1: [48, 52.2, 56.4, 60.6, 64.8, 69, 73.2, 77.4, 81.6],
    v3: [92, 96, 100, 104],
    c2: [109, 113.2, 117.4, 121.6, 125.8, 130, 134.2, 138.4, 142.6],
    br: [148, 153],
    c3: [160, 164.2, 168.4, 172.6, 176.8, 181, 185.2, 189.4, 193.6],
  };

  // 补 id、lang 和 start：id 用「段落前缀-第几句」，全曲唯一；
  // start 从 TIMES[prefix] 里按顺序取（没给就留空，页面会当这句没时间轴）
  const withIds = (prefix, lines) =>
    lines.map((l, i) => Object.assign(
      { id: `${prefix}-${i + 1}`, lang: 'th', start: (TIMES[prefix] || [])[i] },
      l
    ));

  window.SONGS['rak-nan-nan'] = {
    id: 'rak-nan-nan',
    title: 'Rak Nan Nan',
    titleTh: 'รักนานๆ',
    titleCn: '愿能长长久久爱着你',
    // 原唱查不太准（这台机器连不上 YouTube，搜出来的名字前后矛盾），
    // 先按 YouTube 链接实际放的翻唱版标，确认了原唱是谁再填回来
    artist: 'ลีน่า - หมิว（LAMOON official 翻唱版）',
    album: '',
    youtubeId: '0pxTI4pe_8w',

    // 有逐句时间轴：页面跟着原曲自动高亮，KTV / 单句循环 / 自动跟随都能用。
    // synced: false = 上面 TIMES 里的秒数还是估算的，没跟着原曲标过 ——
    // 页面顶部会挂一条提示，点右上角「⏱ 校准」自己标一遍就行。
    synced: false,
    // 时间集中写在 TIMES 里（不是写在每句上），校准面板点「导出」就会按 TIMES 的格式给，
    // 整块贴回去即可
    timesStyle: 'grouped',

    sections: [
      { name: '主歌 A', nameEn: 'Verse 1',      lines: withIds('v1', V1) },
      { name: '主歌 B', nameEn: 'Verse 2',      lines: withIds('v2', V2) },
      { name: '副歌',   nameEn: 'Chorus 1',     lines: withIds('c1', chorus()) },
      { name: '主歌 C', nameEn: 'Verse 3',      lines: withIds('v3', V3) },
      { name: '副歌',   nameEn: 'Chorus 2',     lines: withIds('c2', chorus()) },
      { name: '过渡段', nameEn: 'Bridge',        lines: withIds('br', BRIDGE) },
      { name: '副歌（终）', nameEn: 'Final chorus', lines: withIds('c3', chorus()) },
    ],
  };
})();
