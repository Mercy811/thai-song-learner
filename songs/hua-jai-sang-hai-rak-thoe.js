/**
 * หัวใจสั่งให้รักเธอ（心命令我爱你）
 *
 * 歌词文本：使用者自己提供的那份泰文歌词。
 * 逐词罗马音 / 中文谐音 / 中文意思：按 safe-near-me 那份卡片的同一套写法整理，
 * 常用词（ฉัน 禅、เธอ 特、หัวใจ 华猜、ที่ 替…）跟那首保持一致，学起来不用重新适应。
 *
 * ⚠️ 时间轴（下面的 TIMES）现在是「估算值」，不是跟着原曲一句句标出来的：
 *   这台机器连不上 YouTube，听不到歌，所以只能按每句的音节数和常见的抒情歌节奏推一份，
 *   前奏 18 秒起唱、副歌之间留间奏，整首大约 3 分半 —— 位置肯定会偏，只是让页面先能跟。
 *   要标准的时间轴：打开网页 → 右上角「⏱ 校准」，跟着歌每句按一下空格，一遍就好，
 *   结果自动存在浏览器里（会盖掉这里的估算值，换设备/清缓存才需要重标）。
 *   想把校准结果固化进这个文件：校准面板里点「导出给别人用」，把导出来的那一块贴回 TIMES，
 *   再把下面的 synced 改成 true，提示条就不会再出现了。
 *
 * 句子字段：th 泰文 / ro 罗马音 / cnRo 整句中文谐音 / cn 中文意思
 * 逐词字段：th 泰文 / ro 罗马音 / cn 中文谐音 / mean 中文意思
 *
 * 副歌、预副歌在歌里唱好几遍，这里用同一份数据复用，只是 id 前缀不同
 * （id 要唯一，「已掌握」的勾是按 id 存的）。
 */
window.SONGS = window.SONGS || {};

(() => {
  // 每句只写内容，id 和 lang 由下面的 withIds 统一补上
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean });

  /* ── 主歌 A ── */
  const V1 = [
    {
      th: 'อยากบอกเธอ ที่ฉันทำอย่างนั้น',
      ro: 'yak bok thoe thi chan tham yang nan',
      cnRo: '亚波 特 替禅 探养难',
      cn: '想告诉你，我之所以那样做',
      words: [
        w('อยากบอก', 'yak bok', '亚波', '想告诉'),
        w('เธอ', 'thoe', '特', '你'),
        w('ที่ฉัน', 'thi chan', '替禅', '我所…的'),
        w('ทำอย่างนั้น', 'tham yang nan', '探养难', '那样做'),
      ],
    },
    {
      th: 'เพราะฉันนั้นเต็มใจให้เธอ',
      ro: 'phro chan nan temchai hai thoe',
      cnRo: '坡 禅难 登猜 还特',
      cn: '是因为我心甘情愿为你',
      words: [
        w('เพราะ', 'phro', '坡', '因为'),
        w('ฉันนั้น', 'chan nan', '禅难', '我啊'),
        w('เต็มใจ', 'temchai', '登猜', '心甘情愿'),
        w('ให้เธอ', 'hai thoe', '还特', '给你'),
      ],
    },
    {
      th: 'อยู่ตรงนี้ใกล้ใกล้เธอเสมอ',
      ro: 'yu trong ni klai klai thoe samoe',
      cnRo: '优 中妮 盖盖特 撒摸',
      cn: '一直待在这里，紧紧挨着你',
      words: [
        w('อยู่', 'yu', '优', '待着'),
        w('ตรงนี้', 'trong ni', '中妮', '这里'),
        w('ใกล้ใกล้เธอ', 'klai klai thoe', '盖盖特', '紧紧靠近你'),
        w('เสมอ', 'samoe', '撒摸', '总是'),
      ],
    },
    {
      th: 'ไม่ว่าจะวันใดก็ตาม',
      ro: 'mai wa cha wan dai ko tam',
      cnRo: '埋哇扎 完呆 戈丹',
      cn: '无论是哪一天都一样',
      words: [
        w('ไม่ว่าจะ', 'mai wa cha', '埋哇扎', '无论'),
        w('วันใด', 'wan dai', '完呆', '哪一天'),
        w('ก็ตาม', 'ko tam', '戈丹', '都一样'),
      ],
    },
    {
      th: 'อยากจะคอย',
      ro: 'yak cha khoi',
      cnRo: '亚扎 阔伊',
      cn: '想一直守着',
      words: [
        w('อยากจะ', 'yak cha', '亚扎', '想要'),
        w('คอย', 'khoi', '阔伊', '守着、等着'),
      ],
    },
    {
      th: 'ดูแลและห่วงใย',
      ro: 'dulae lae huangyai',
      cnRo: '杜列 列 环牙',
      cn: '照顾你、牵挂你',
      words: [
        w('ดูแล', 'dulae', '杜列', '照顾'),
        w('และ', 'lae', '列', '和'),
        w('ห่วงใย', 'huangyai', '环牙', '牵挂、关心'),
      ],
    },
    {
      th: 'เพื่อเธอฉันทำได้ทุกอย่าง',
      ro: 'phuea thoe chan tham dai thuk yang',
      cnRo: '蒲特 禅 探呆 秃央',
      cn: '为了你，我什么都做得到',
      words: [
        w('เพื่อเธอ', 'phuea thoe', '蒲特', '为了你'),
        w('ฉัน', 'chan', '禅', '我'),
        w('ทำได้', 'tham dai', '探呆', '做得到'),
        w('ทุกอย่าง', 'thuk yang', '秃央', '每一样'),
      ],
    },
    {
      th: 'แค่ได้เห็นว่าเธอเป็นสุขใจ',
      ro: 'khae dai hen wa thoe pen sukchai',
      cnRo: '客呆汉 哇 特 喷素猜',
      cn: '只要看见你是开心的',
      words: [
        w('แค่ได้เห็น', 'khae dai hen', '客呆汉', '只要能看见'),
        w('ว่า', 'wa', '哇', '说、是'),
        w('เธอ', 'thoe', '特', '你'),
        w('เป็นสุขใจ', 'pen sukchai', '喷素猜', '心里是快乐的'),
      ],
    },
    {
      th: 'แค่นี้ก็มากพอกับใจของฉัน',
      ro: 'khae ni ko mak pho kap chai khong chan',
      cnRo: '客妮 戈马坡 卡猜 空禅',
      cn: '这样对我这颗心来说就足够了',
      words: [
        w('แค่นี้', 'khae ni', '客妮', '就这样'),
        w('ก็มากพอ', 'ko mak pho', '戈马坡', '就已经足够'),
        w('กับใจ', 'kap chai', '卡猜', '对这颗心'),
        w('ของฉัน', 'khong chan', '空禅', '我的'),
      ],
    },
  ];

  /* ── 预副歌 ── */
  const PRE = [
    {
      th: 'เพียงแค่เธอ',
      ro: 'phiang khae thoe',
      cnRo: '篇客 特',
      cn: '只要你',
      words: [
        w('เพียงแค่', 'phiang khae', '篇客', '只要'),
        w('เธอ', 'thoe', '特', '你'),
      ],
    },
    {
      th: 'รับมันไป',
      ro: 'rap man pai',
      cnRo: '拉 曼 拍',
      cn: '把它收下',
      words: [
        w('รับ', 'rap', '拉', '收下'),
        w('มัน', 'man', '曼', '它'),
        w('ไป', 'pai', '拍', '去（表示动作完成）'),
      ],
    },
    {
      th: 'ความหวังดี',
      ro: 'khwam wangdi',
      cnRo: '宽 王迪',
      cn: '这份好意',
      words: [
        w('ความ', 'khwam', '宽', '（把动词/形容词变成名词的词头）'),
        w('หวังดี', 'wangdi', '王迪', '真心为你好'),
      ],
    },
    {
      th: 'จากฉัน',
      ro: 'chak chan',
      cnRo: '扎 禅',
      cn: '来自我',
      words: [
        w('จาก', 'chak', '扎', '来自'),
        w('ฉัน', 'chan', '禅', '我'),
      ],
    },
  ];

  /* ── 副歌 ──
     第 2 句在最后一遍副歌里换成「มันคือความรักบงการให้ทำไป」，
     所以副歌写成一个函数，把那句作为参数传进来。 */
  const CHORUS_L2 = {
    th: 'ที่สั่งให้ทำเพื่อเธอเรื่อยไป',
    ro: 'thi sang hai tham phuea thoe rueai pai',
    cnRo: '替商还 探 蒲特 雷拍',
    cn: '它命令我一直为你做下去',
    words: [
      w('ที่สั่งให้', 'thi sang hai', '替商还', '它命令着'),
      w('ทำ', 'tham', '探', '做'),
      w('เพื่อเธอ', 'phuea thoe', '蒲特', '为了你'),
      w('เรื่อยไป', 'rueai pai', '雷拍', '一直下去'),
    ],
  };

  const CHORUS_L2_LAST = {
    th: 'มันคือความรักบงการให้ทำไป',
    ro: 'man khue khwam rak bongkan hai tham pai',
    cnRo: '曼科 宽拉 崩甘 还探拍',
    cn: '是爱在指使我这么做',
    words: [
      w('มันคือ', 'man khue', '曼科', '那就是'),
      w('ความรัก', 'khwam rak', '宽拉', '爱'),
      w('บงการ', 'bongkan', '崩甘', '支配、指使'),
      w('ให้ทำไป', 'hai tham pai', '还探拍', '让我这么做下去'),
    ],
  };

  const chorus = (secondLine) => [
    {
      th: 'ไม่อาจจะหยุดคำสั่งของหัวใจ',
      ro: 'mai at cha yut kham sang khong huachai',
      cnRo: '埋啊扎 尤 康商 空华猜',
      cn: '没办法停下心的命令',
      words: [
        w('ไม่อาจจะ', 'mai at cha', '埋啊扎', '没办法'),
        w('หยุด', 'yut', '尤', '停下'),
        w('คำสั่ง', 'kham sang', '康商', '命令'),
        w('ของหัวใจ', 'khong huachai', '空华猜', '心的'),
      ],
    },
    secondLine,
    {
      th: 'และฉันเอง',
      ro: 'lae chan eng',
      cnRo: '列 禅英',
      cn: '而我自己',
      words: [
        w('และ', 'lae', '列', '而、和'),
        w('ฉันเอง', 'chan eng', '禅英', '我自己'),
      ],
    },
    {
      th: 'ก็ฝืนไม่ไหว',
      ro: 'ko fuen mai wai',
      cnRo: '戈 分 埋歪',
      cn: '也硬撑不住了',
      words: [
        w('ก็', 'ko', '戈', '也'),
        w('ฝืน', 'fuen', '分', '硬撑着违抗'),
        w('ไม่ไหว', 'mai wai', '埋歪', '撑不住、做不到'),
      ],
    },
    {
      th: 'กับความจริงในใจตัวเอง',
      ro: 'kap khwam ching nai chai tua eng',
      cnRo: '卡 宽京 乃猜 多英',
      cn: '面对自己心里的那份真心',
      words: [
        w('กับ', 'kap', '卡', '面对、跟'),
        w('ความจริง', 'khwam ching', '宽京', '真相、真心话'),
        w('ในใจ', 'nai chai', '乃猜', '心里'),
        w('ตัวเอง', 'tua eng', '多英', '自己'),
      ],
    },
    {
      th: 'ไม่อาจจะขัดคำสั่งของหัวใจ',
      ro: 'mai at cha khat kham sang khong huachai',
      cnRo: '埋啊扎 卡 康商 空华猜',
      cn: '没办法违抗心的命令',
      words: [
        w('ไม่อาจจะ', 'mai at cha', '埋啊扎', '没办法'),
        w('ขัด', 'khat', '卡', '违抗、顶回去'),
        w('คำสั่ง', 'kham sang', '康商', '命令'),
        w('ของหัวใจ', 'khong huachai', '空华猜', '心的'),
      ],
    },
    {
      th: 'ที่สั่งให้ฉันต้องรักและทุ่มเทใจให้อย่างนี้',
      ro: 'thi sang hai chan tong rak lae thumthe chai hai yang ni',
      cnRo: '替商还禅 东拉 列 通贴猜 还养妮',
      cn: '它命令我必须爱你，还要这样掏心掏肺地付出',
      words: [
        w('ที่สั่งให้ฉัน', 'thi sang hai chan', '替商还禅', '它命令我'),
        w('ต้องรัก', 'tong rak', '东拉', '必须爱'),
        w('และ', 'lae', '列', '还有'),
        w('ทุ่มเทใจ', 'thumthe chai', '通贴猜', '全心全意付出'),
        w('ให้อย่างนี้', 'hai yang ni', '还养妮', '这样地给出去'),
      ],
    },
    {
      th: 'ไม่ต้องมีใครเข้าใจ',
      ro: 'mai tong mi khrai khaochai',
      cnRo: '埋东 米开 靠猜',
      cn: '不需要有谁能理解',
      words: [
        w('ไม่ต้อง', 'mai tong', '埋东', '不需要'),
        w('มีใคร', 'mi khrai', '米开', '有谁'),
        w('เข้าใจ', 'khaochai', '靠猜', '理解、明白'),
      ],
    },
    {
      th: 'หัวใจสั่งให้รักเธอ',
      ro: 'huachai sang hai rak thoe',
      cnRo: '华猜 商还 拉 特',
      cn: '是心命令我爱你（歌名就是这句）',
      words: [
        w('หัวใจ', 'huachai', '华猜', '心'),
        w('สั่งให้', 'sang hai', '商还', '命令、吩咐'),
        w('รัก', 'rak', '拉', '爱'),
        w('เธอ', 'thoe', '特', '你'),
      ],
    },
  ];

  /* ── 主歌 B ── */
  const V2 = [
    {
      th: 'ใจเล็กเล็กแค่ได้รู้จักรัก',
      ro: 'chai lek lek khae dai ruchak rak',
      cnRo: '猜勒勒 客呆 如扎拉',
      cn: '这颗小小的心，只要懂得了爱',
      words: [
        w('ใจเล็กเล็ก', 'chai lek lek', '猜勒勒', '小小的一颗心'),
        w('แค่ได้', 'khae dai', '客呆', '只要能'),
        w('รู้จักรัก', 'ruchak rak', '如扎拉', '懂得爱、认识爱'),
      ],
    },
    {
      th: 'ก็ดีเกินที่ใจต้องการ',
      ro: 'ko di koen thi chai tongkan',
      cnRo: '戈迪根 替猜 东甘',
      cn: '就已经好过它自己想要的了',
      words: [
        w('ก็ดีเกิน', 'ko di koen', '戈迪根', '就好得超过了'),
        w('ที่ใจ', 'thi chai', '替猜', '心所…的'),
        w('ต้องการ', 'tongkan', '东甘', '想要'),
      ],
    },
    {
      th: 'แค่วันนี้ได้รักและผูกพัน',
      ro: 'khae wanni dai rak lae phukphan',
      cnRo: '客完妮 呆拉 列 蒲潘',
      cn: '只要今天能爱、能有这份牵绊',
      words: [
        w('แค่วันนี้', 'khae wanni', '客完妮', '只要今天'),
        w('ได้รัก', 'dai rak', '呆拉', '能够爱'),
        w('และ', 'lae', '列', '和'),
        w('ผูกพัน', 'phukphan', '蒲潘', '牵绊、割不断的感情'),
      ],
    },
    {
      th: 'เห็นฝันเธอเป็นจริงก็ดีแค่ไหน',
      ro: 'hen fan thoe pen ching ko di khae nai',
      cnRo: '汉 反特 喷京 戈迪客奈',
      cn: '能看见你的梦成真，那该有多好',
      words: [
        w('เห็น', 'hen', '汉', '看见'),
        w('ฝันเธอ', 'fan thoe', '反特', '你的梦'),
        w('เป็นจริง', 'pen ching', '喷京', '成真'),
        w('ก็ดีแค่ไหน', 'ko di khae nai', '戈迪客奈', '该有多好'),
      ],
    },
  ];

  /* ── 时间轴（秒）── 每句开唱的时间，按段落分开写，顺序 = 段落里句子的顺序。
     副歌/预副歌的歌词是复用同一份数据的，但唱了好几遍、时间各不一样，
     所以时间不写在歌词里，放这里按段落前缀分开给。
     ⚠️ 这份是估算值，见文件顶部说明；用网页上的「⏱ 校准」标一遍就准了。 */
  const TIMES = {
    v1: [18, 22.1, 25.8, 30, 33.6, 35.9, 38.7, 42.4, 46.5],
    p1: [52.6, 54.9, 57.2, 59.5],
    c1: [62.8, 67.4, 71.5, 73.8, 76.2, 79.8, 84.4, 90.8, 94.1],
    v2: [101.3, 105.4, 109.1, 113.3],
    p2: [119.3, 121.6, 123.9, 126.2],
    c2: [129.5, 134.1, 138.3, 140.6, 142.9, 146.6, 151.2, 157.6, 160.8],
    c3: [175, 179.6, 184.2, 186.5, 188.8, 192.5, 197.1, 203.5, 206.7],
  };

  // 补 id、lang 和 start：id 用「段落前缀-第几句」，全曲唯一；
  // start 从 TIMES[prefix] 里按顺序取（没给就留空，页面会当这句没时间轴）
  const withIds = (prefix, lines) =>
    lines.map((l, i) => Object.assign(
      { id: `${prefix}-${i + 1}`, lang: 'th', start: (TIMES[prefix] || [])[i] },
      l
    ));

  window.SONGS['hua-jai-sang-hai-rak-thoe'] = {
    id: 'hua-jai-sang-hai-rak-thoe',
    title: 'Hua Jai Sang Hai Rak Thoe',
    titleTh: 'หัวใจสั่งให้รักเธอ',
    titleCn: '心命令我爱你',
    // 频道/歌手名没查到（这台机器连不上 YouTube），确认后填回来就会显示在标题下面
    artist: '',
    album: '',
    youtubeId: 'BbP3SrEA5iU',

    // 有逐句时间轴：页面跟着原曲自动高亮，KTV / 单句循环 / 自动跟随都能用。
    // synced: false = 上面 TIMES 里的秒数还是估算的，没跟着原曲标过 ——
    // 页面顶部会挂一条提示，点右上角「⏱ 校准」自己标一遍就行。
    synced: false,
    // 时间集中写在 TIMES 里（不是写在每句上），校准面板点「导出」就会按 TIMES 的格式给，
    // 整块贴回去即可
    timesStyle: 'grouped',

    sections: [
      { name: '主歌 A',   nameEn: 'Verse 1',     lines: withIds('v1', V1) },
      { name: '预副歌',   nameEn: 'Pre-chorus',  lines: withIds('p1', PRE) },
      { name: '副歌',     nameEn: 'Chorus 1',    lines: withIds('c1', chorus(CHORUS_L2)) },
      { name: '主歌 B',   nameEn: 'Verse 2',     lines: withIds('v2', V2) },
      { name: '预副歌',   nameEn: 'Pre-chorus',  lines: withIds('p2', PRE) },
      { name: '副歌',     nameEn: 'Chorus 2',    lines: withIds('c2', chorus(CHORUS_L2)) },
      { name: '副歌（尾）', nameEn: 'Final chorus', note: '第 2 句换词了', lines: withIds('c3', chorus(CHORUS_L2_LAST)) },
    ],
  };
})();
