/**
 * Enemies with Benefits
 *
 * 歌词文本：使用者自己提供的那份泰英混唱歌词。
 * 逐词罗马音 / 中文谐音 / 中文意思：沿用 safe-near-me、hua-jai 那两首的同一套写法，
 * 常用词（เธอ 特、ฉัน 禅、ไม่ 埋、แต่ 代、ก็ 戈、ใกล้ 盖、รู้ 如、ให้ 还、อยู่ 优…）
 * 跟前两首保持一致，学起来不用重新适应。
 *
 * 这首歌泰语和英语是混在同一句里唱的，所以：
 *   - 整句都是英语的，写 lang: 'en'（朗读走英语发音，words 留空，不拆词卡）；
 *   - 泰英混的句子按泰语句处理（lang 默认 'th'），句子里的英语部分单独做成
 *     lang: 'en' 的词卡，点它读英语、点泰语词读泰语。
 *
 * ⚠️ 时间轴（下面的 TIMES）现在是「估算值」，不是跟着原曲一句句标出来的：
 *   这台机器连不上 YouTube，听不到歌，只能按每句的音节数和常见流行歌节奏推一份，
 *   前奏 6 秒起唱、整首约 2 分 25 秒 —— 位置肯定会偏，只是让页面先能跟。
 *   要准的时间轴：打开网页 → 右上角「⏱ 校准」，跟着歌每句按一下空格，一遍就好，
 *   结果存在浏览器里（会盖掉这里的估算值）。想固化进文件：校准面板点「导出给别人用」，
 *   把导出的那一块贴回 TIMES，再把下面的 synced 改成 true，顶部提示条就不再出现。
 *
 * 句子字段：th 泰文（英语句就是英文本身）/ ro 罗马音 / cnRo 整句中文谐音 / cn 中文意思
 * 逐词字段：th / ro / cn 谐音 / mean 意思 /（英语词额外带 lang: 'en'）
 *
 * Hook 在歌里唱三遍、副歌 B 唱两遍，这里用同一份数据复用，只是 id 前缀不同
 * （id 要唯一，「已掌握」的勾是按 id 存的）。
 *
 * 歌手 / 频道名没查到（这台机器连不上 YouTube），确认后填回 artist 就会显示在标题下面。
 */
window.SONGS = window.SONGS || {};

(() => {
  // 泰语词卡；英语词卡用 e()，会带上 lang: 'en'
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean });
  const e = (th, mean) => ({ th, ro: th.toLowerCase(), cn: '（英语）', mean, lang: 'en' });
  // 整句都是英语的句子
  const en = (th, cn) => ({ lang: 'en', th, ro: '', cn, words: [] });

  /* ── Hook（开头那段，全曲唱三遍）── */
  const HOOK = [
    en('Kiss your cherry lips', '吻你那樱桃色的唇'),
    en('Come sip me like a wine', '来吧，像品酒那样啜饮我'),
    {
      th: 'พูดว่า Hate me please',
      ro: 'phut wa / hate me please',
      cnRo: '蒲哇 Hate me please',
      cn: '说一句「求你恨我吧」',
      words: [
        w('พูดว่า', 'phut wa', '蒲哇', '说'),
        e('Hate me please', '求你恨我吧'),
      ],
    },
    {
      th: 'ยิ่งห้ามเท่าไรยิ่ง',
      ro: 'ying ham thaorai ying',
      cnRo: '影 汉 陶来 影',
      cn: '越是不许，就越……',
      words: [
        w('ยิ่ง', 'ying', '影', '越是'),
        w('ห้าม', 'ham', '汉', '禁止、不许'),
        w('เท่าไร', 'thaorai', '陶来', '多少（跟前面连起来＝越怎样）'),
        w('ยิ่ง', 'ying', '影', '就越'),
      ],
    },
    {
      th: 'อยากเข้าใกล้ๆอีก',
      ro: 'yak khao klai klai ik',
      cnRo: '啊呀 考盖盖 意',
      cn: '越想再往你身边靠一点',
      words: [
        w('อยาก', 'yak', '啊呀', '想要'),
        w('เข้าใกล้ๆ', 'khao klai klai', '考盖盖', '靠近一点'),
        w('อีก', 'ik', '意', '再'),
      ],
    },
    en('Wine I hate you?', '酒啊，我到底恨不恨你？（wine 和 why 谐音的双关）'),
    en('Kiss your cherry lips', '吻你那樱桃色的唇'),
  ];

  /* ── 主歌 A ── */
  const V1 = [
    {
      th: 'เธอเกลียดฉันตรงไหน I don’t even know',
      ro: 'thoe kliat chan trong nai / I don’t even know',
      cnRo: '特 格利呀 禅 中乃 I don’t even know',
      cn: '你到底讨厌我哪一点，我根本不知道',
      words: [
        w('เธอ', 'thoe', '特', '你'),
        w('เกลียด', 'kliat', '格利呀', '讨厌、恨'),
        w('ฉัน', 'chan', '禅', '我'),
        w('ตรงไหน', 'trong nai', '中乃', '哪一点、哪里'),
        e('I don’t even know', '我根本不知道'),
      ],
    },
    {
      th: 'แต่ยิ่งเธอผลักไส I wanna pull you close',
      ro: 'tae ying thoe phlak sai / I wanna pull you close',
      cnRo: '代 影 特 拍赛 I wanna pull you close',
      cn: '可你越把我推开，我越想把你拉近',
      words: [
        w('แต่', 'tae', '代', '但是'),
        w('ยิ่ง', 'ying', '影', '越是'),
        w('เธอ', 'thoe', '特', '你'),
        w('ผลักไส', 'phlak sai', '拍赛', '推开、把人往外赶'),
        e('I wanna pull you close', '我就越想把你拉近'),
      ],
    },
    {
      th: 'บอกว่าอย่ามาใกล้ แต่เธอไม่เคย go',
      ro: 'bok wa ya ma klai / tae thoe mai khoei go',
      cnRo: '波哇 亚妈盖 代 特 埋科伊 go',
      cn: '嘴上说别靠近，你却从来没走开过',
      words: [
        w('บอกว่า', 'bok wa', '波哇', '说'),
        w('อย่ามาใกล้', 'ya ma klai', '亚妈盖', '别靠过来'),
        w('แต่เธอ', 'tae thoe', '代特', '但你'),
        w('ไม่เคย', 'mai khoei', '埋科伊', '从来没有'),
        e('go', '走开'),
      ],
    },
    {
      th: 'สายตาเธอมันฟ้อง you already know',
      ro: 'saita thoe man fong / you already know',
      cnRo: '赛达 特 曼丰 you already know',
      cn: '你的眼神早就出卖你了，你自己心里清楚',
      words: [
        w('สายตา', 'saita', '赛达', '眼神'),
        w('เธอ', 'thoe', '特', '你的'),
        w('มันฟ้อง', 'man fong', '曼丰', '（它）全都招了、出卖了你'),
        e('you already know', '你自己心里清楚'),
      ],
    },
  ];

  /* ── 副歌 B（唱两遍）── */
  const HATE = [
    {
      th: 'ก็เราไม่ชอบกัน',
      ro: 'ko rao mai chop kan',
      cnRo: '戈 绕 埋桥 甘',
      cn: '反正我们本来就互相不喜欢',
      words: [
        w('ก็', 'ko', '戈', '反正、就'),
        w('เรา', 'rao', '绕', '我们'),
        w('ไม่ชอบ', 'mai chop', '埋桥', '不喜欢'),
        w('กัน', 'kan', '甘', '彼此、互相'),
      ],
    },
    en('Then let’s just have fun', '那就干脆玩得开心点'),
    en('Cuz I hate you', '因为我恨你啊'),
    {
      th: 'โชว์แค่ให้ฉันดู',
      ro: 'cho khae hai chan du',
      cnRo: '秋 开 还禅 度',
      cn: '这一面只演给我一个人看',
      words: [
        w('โชว์', 'cho', '秋', '表演、展示（英语 show 借词）'),
        w('แค่', 'khae', '开', '只、仅仅'),
        w('ให้ฉัน', 'hai chan', '还禅', '给我'),
        w('ดู', 'du', '度', '看'),
      ],
    },
    {
      th: 'ไม่ต้องให้ใครรู้',
      ro: 'mai tong hai khrai ru',
      cnRo: '埋东 还 开 如',
      cn: '不用让任何人知道',
      words: [
        w('ไม่ต้อง', 'mai tong', '埋东', '不必、不用'),
        w('ให้', 'hai', '还', '让'),
        w('ใคร', 'khrai', '开', '谁、任何人'),
        w('รู้', 'ru', '如', '知道'),
      ],
    },
    en('Enemies with benefits', '各取所需的敌人 —— 明明互相看不顺眼，却又分不开'),
  ];

  /* ── 主歌 B ── */
  const V2 = [
    {
      th: 'You roll your eyes แต่ก็ยังไม่ไปไหน',
      ro: 'you roll your eyes / tae ko yang mai pai nai',
      cnRo: 'You roll your eyes 代戈杨 埋拜乃',
      cn: '你翻着白眼，却还是哪儿都没去',
      words: [
        e('You roll your eyes', '你翻了个白眼'),
        w('แต่ก็ยัง', 'tae ko yang', '代戈杨', '但还是'),
        w('ไม่ไปไหน', 'mai pai nai', '埋拜乃', '哪儿也不去'),
      ],
    },
    {
      th: 'Act like you‘re fine แต่ก็ยัง reply',
      ro: 'act like you’re fine / tae ko yang reply',
      cnRo: 'Act like you’re fine 代戈杨 reply',
      cn: '装作一副没事的样子，消息却还是照回',
      words: [
        e('Act like you’re fine', '装作你没事'),
        w('แต่ก็ยัง', 'tae ko yang', '代戈杨', '但还是'),
        e('reply', '回消息'),
      ],
    },
    {
      th: 'We say ครั้งสุดท้าย',
      ro: 'we say / khrang sutthai',
      cnRo: 'We say 康素台',
      cn: '我们说好「这是最后一次」',
      words: [
        e('We say', '我们说'),
        w('ครั้งสุดท้าย', 'khrang sutthai', '康素台', '最后一次'),
      ],
    },
    {
      th: 'แต่อยู่ด้วยกัน every night',
      ro: 'tae yu duai kan / every night',
      cnRo: '代 优对甘 every night',
      cn: '可每一个晚上还是待在一起',
      words: [
        w('แต่', 'tae', '代', '但是'),
        w('อยู่ด้วยกัน', 'yu duai kan', '优对甘', '待在一起'),
        e('every night', '每天晚上'),
      ],
    },
    en('end up side by side', '到头来还是并排躺在一起'),
  ];

  /* ── 时间轴（估算值，不是跟着原曲标的）──
     数是这么推的：前奏 6 秒起唱；hook 每句 3–3.5 秒，主歌每句 4 秒左右，
     副歌 B 每句 2.5 秒；段落之间留 0.5–2 秒过门。整首收在 2 分 25 秒上下。
     校准一遍就会被浏览器里的真实值盖掉。 */
  const TIMES = {
    h1: [6.0, 9.0, 12.5, 15.5, 18.5, 21.5, 24.5],
    v1: [29.0, 33.0, 37.0, 41.0],
    b1: [45.5, 48.0, 50.5, 53.0, 55.5, 58.0],
    h2: [62.0, 65.0, 68.5, 71.5, 74.5, 77.5, 80.5],
    v2: [86.0, 90.0, 94.0, 96.5, 99.5],
    b2: [103.5, 106.0, 108.5, 111.0, 113.5, 116.0],
    h3: [120.5, 123.5, 127.0, 130.0, 133.0, 136.0, 139.0],
  };

  // id 用「段落前缀 + 句号」，lang 默认泰语（句子自己写了 lang 的以自己的为准）
  const withIds = (prefix, lines) =>
    lines.map((l, i) => Object.assign(
      { id: `${prefix}-${i + 1}`, lang: 'th', start: (TIMES[prefix] || [])[i] },
      l
    ));

  window.SONGS['enemies-with-benefits'] = {
    id: 'enemies-with-benefits',
    title: 'Enemies with Benefits',
    titleTh: '',
    titleCn: '各取所需的敌人',
    artist: '',
    album: '',
    youtubeId: 'MeEqOOH-2eE',

    // 时间轴是估算的：页面顶部会挂提示条，点「⏱ 校准」标一遍就准了
    synced: false,

    sections: [
      { name: 'Hook',     nameEn: 'Hook 1',   lines: withIds('h1', HOOK) },
      { name: '主歌 A',    nameEn: 'Verse 1',  lines: withIds('v1', V1) },
      { name: '副歌',      nameEn: 'Chorus 1', lines: withIds('b1', HATE) },
      { name: 'Hook',     nameEn: 'Hook 2',   lines: withIds('h2', HOOK) },
      { name: '主歌 B',    nameEn: 'Verse 2',  lines: withIds('v2', V2) },
      { name: '副歌',      nameEn: 'Chorus 2', lines: withIds('b2', HATE) },
      { name: 'Hook（尾）', nameEn: 'Hook 3',  lines: withIds('h3', HOOK) },
    ],
  };
})();
