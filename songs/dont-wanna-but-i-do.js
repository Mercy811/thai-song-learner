/**
 * งั้นรักละ (Don't wanna, But I Do) — Jan, Jingjing / Ost. ลัลล์ไม่ชอบไว้นั้น (Enemies With Benefits)
 * 频道：GMMTV RECORDS
 *
 * 歌词文本：使用者自己提供的那份泰英混唱歌词。
 * 这首歌泰文、英文混着唱，句子里同时有泰文和英文的，句子整体按 lang:'th' 处理
 * （逐词卡片里英文单独标 lang:'en'，点它会用英文发音）；整句几乎全英文的
 * （比如副歌 "Don't wanna say Love..."），句子整体标 lang:'en'。
 *
 * ⚠️ 时间轴（下面的 TIMES）是「估算值」，不是跟着原曲一句句标出来的：
 *   这台机器连不上 YouTube，听不到歌，只能按歌词句数和常见流行歌节奏推一份，
 *   前奏 15 秒起唱，整首大约 2 分半 —— 位置肯定会偏，只是让页面先能跟。
 *   要标准的时间轴：打开网页 → 右上角「⏱ 校准」，跟着歌每句按一下空格，一遍就好，
 *   结果自动存在浏览器里（会盖掉这里的估算值，换设备/清缓存才需要重标）。
 *   想把校准结果固化进这个文件：校准面板里点「导出给别人用」，把导出来的那一块贴回 TIMES，
 *   再把下面的 synced 改成 true，提示条就不会再出现了。
 *
 * 句子字段：th 泰英混合文本 / ro 罗马音（英文部分照抄英文）/ cnRo 整句中文谐音 / cn 中文意思
 * 逐词字段：th / ro / cn / mean，英文词多一个 lang:'en'
 *
 * 副歌、预副歌、"เธอ~" 尾音在歌里唱好几遍，这里用同一份数据复用，只是 id 前缀不同
 * （id 要唯一，「已掌握」的勾是按 id 存的）。
 */
window.SONGS = window.SONGS || {};

(() => {
  // 每句只写内容，id 和 lang(默认 th) 由下面的 withIds 统一补上；某句要标 en 就在这句自己写 lang:'en' 覆盖掉
  const w = (th, ro, cn, mean, lang) => (lang ? { th, ro, cn, mean, lang } : { th, ro, cn, mean });

  /* ── 主歌（Verse）── */
  const V1 = [
    {
      th: 'ก็ไม่รู้ว่านี่ Real or Fake',
      ro: 'ko mai ru wa ni Real or Fake',
      cnRo: '戈埋如 哇妮 Real or Fake',
      cn: '也不知道这到底是真是假',
      words: [
        w('ก็ไม่รู้', 'ko mai ru', '戈埋如', '也不知道'),
        w('ว่านี่', 'wa ni', '哇妮', '这是不是'),
        w('Real or Fake', 'Real or Fake', 'Real or Fake', '是真是假', 'en'),
      ],
    },
    {
      th: 'This feeling นี้มันใช่รักไหม จริงหรือ Cake',
      ro: 'This feeling ni man chai rak mai ching rue Cake',
      cnRo: 'This feeling 妮曼菜拉埋 京勒 Cake',
      cn: '这种感觉到底是不是爱，是真的还是骗人的',
      words: [
        w('This feeling', 'This feeling', 'This feeling', '这种感觉', 'en'),
        w('นี้มันใช่รักไหม', 'ni man chai rak mai', '妮曼菜拉埋', '这到底是不是爱'),
        w('จริงหรือ', 'ching rue', '京勒', '是真的还是'),
        w('Cake', 'Cake', 'Cake', '假的、骗人的', 'en'),
      ],
    },
    {
      th: 'หรือเรื่องลับลับ ไม่รักแต่แค่ Give or take (Ha Ha)',
      ro: 'rue rueang lap lap mai rak tae khae Give or take (Ha Ha)',
      cnRo: '勒 良拉拉 埋拉带客 Give or take (哈哈)',
      cn: '还是什么见不得光的暧昧，不是爱只是各取所需（哈哈）',
      words: [
        w('หรือเรื่องลับลับ', 'rue rueang lap lap', '勒 良拉拉', '还是什么秘密暧昧的事'),
        w('ไม่รักแต่แค่', 'mai rak tae khae', '埋拉带客', '不是爱只是'),
        w('Give or take', 'Give or take', 'Give or take', '你情我愿地互相给予索取', 'en'),
        w('(Ha Ha)', 'Ha Ha', '哈哈', '笑声语气词', 'en'),
      ],
    },
    {
      th: 'ก็เลยต้อง Test อีกที จนรู้ว่าฉันรักเธอ',
      ro: 'ko loei tong Test ik thi chon ru wa chan rak thoe',
      cnRo: '戈类东 Test 义提 中如哇禅拉特',
      cn: '于是就得再测试一次，才知道我是爱你的',
      words: [
        w('ก็เลยต้อง', 'ko loei tong', '戈类东', '于是就得'),
        w('Test', 'Test', 'Test', '测试', 'en'),
        w('อีกที', 'ik thi', '义提', '再一次'),
        w('จนรู้ว่าฉันรักเธอ', 'chon ru wa chan rak thoe', '中如哇禅拉特', '直到才知道我爱你'),
      ],
    },
  ];

  /* ── 预副歌（Pre-chorus）── */
  const PRE = [
    {
      th: 'บอกเลย ไม่ได้ อยากที่ จะยอมรับหรอก you know',
      ro: 'bok loei mai dai yak thi cha yomrap rok you know',
      cnRo: '波类 埋呆亚替扎 用拉洛 you know',
      cn: '老实说，我是真的不太想承认啦，你懂的',
      words: [
        w('บอกเลย', 'bok loei', '波类', '老实说、直说了吧'),
        w('ไม่ได้อยากที่จะ', 'mai dai yak thi cha', '埋呆亚替扎', '并不想要'),
        w('ยอมรับหรอก', 'yomrap rok', '用拉洛', '承认啦'),
        w('you know', 'you know', 'you know', '你懂的', 'en'),
      ],
    },
    {
      th: 'แต่ยิ่ง เจอยิ่ง ทำให้ใจของฉันมันเต้นถี่',
      ro: 'tae ying choe ying thamhai chai khong chan man ten thi',
      cnRo: '带英 遮英 探还猜空禅 曼典替',
      cn: '但是越见到你，越让我的心跳得又快又急',
      words: [
        w('แต่ยิ่ง', 'tae ying', '带英', '但是越'),
        w('เจอยิ่ง', 'choe ying', '遮英', '遇见越'),
        w('ทำให้ใจของฉัน', 'thamhai chai khong chan', '探还猜空禅', '让我的心'),
        w('มันเต้นถี่', 'man ten thi', '曼典替', '它跳得好密好快'),
      ],
    },
    {
      th: 'เก็บอาการเท่าไหร่ก็ไม่อยู่',
      ro: 'kep akan thaorai ko mai yu',
      cnRo: '给阿甘 涛来戈埋优',
      cn: '不管怎么藏表情都藏不住',
      words: [
        w('เก็บอาการ', 'kep akan', '给阿甘', '藏起表情、情绪'),
        w('เท่าไหร่ก็ไม่อยู่', 'thaorai ko mai yu', '涛来戈埋优', '再怎么藏也藏不住'),
      ],
    },
    {
      th: 'ถ้าเธอรู้งั้นรักกันเลยดีไหม',
      ro: 'tha thoe ru ngan rak kan loei di mai',
      cnRo: '塔特如 岸 拉甘类迪埋',
      cn: '如果你知道了，那我们干脆相爱好不好',
      words: [
        w('ถ้าเธอรู้', 'tha thoe ru', '塔特如', '如果你知道'),
        w('งั้น', 'ngan', '岸', '那么'),
        w('รักกันเลยดีไหม', 'rak kan loei di mai', '拉甘类迪埋', '干脆相爱好不好'),
      ],
    },
  ];

  /* ── 副歌（Chorus，4 句一组，第 1/3 句几乎全英文，句子整体标 lang:'en'）── */
  const CHORUS = [
    {
      th: "Don't wanna say Love La La La Love You",
      ro: "Don't wanna say Love La La La Love You",
      cnRo: "Don't wanna say Love La La La Love You",
      cn: '不想说出爱，啦啦啦，爱你',
      lang: 'en',
      words: [
        w("Don't wanna say Love", "Don't wanna say Love", "Don't wanna say Love", '不想说出「爱」这个字', 'en'),
        w('La La La', 'La La La', '啦啦啦', '啦啦啦', 'en'),
        w('Love You', 'Love You', 'Love You', '爱你', 'en'),
      ],
    },
    {
      th: 'But I I I I Do ก็มันแพ้เสียงในหัวใจ',
      ro: 'But I I I I Do ko man phae siang nai huachai',
      cnRo: 'But I I I I Do 戈曼 拍香 乃华猜',
      cn: '但是我我我我，是的——因为它输给了心里的声音',
      words: [
        w('But I I I I Do', 'But I I I I Do', 'But I I I I Do', '但是我我我我，是的（我爱你）', 'en'),
        w('ก็มัน', 'ko man', '戈曼', '因为它、就是它'),
        w('แพ้เสียง', 'phae siang', '拍香', '输给了这个声音'),
        w('ในหัวใจ', 'nai huachai', '乃华猜', '心里的'),
      ],
    },
    {
      th: "Don't wanna say Love La La La Love You",
      ro: "Don't wanna say Love La La La Love You",
      cnRo: "Don't wanna say Love La La La Love You",
      cn: '不想说出爱，啦啦啦，爱你',
      lang: 'en',
      words: [
        w("Don't wanna say Love", "Don't wanna say Love", "Don't wanna say Love", '不想说出「爱」这个字', 'en'),
        w('La La La', 'La La La', '啦啦啦', '啦啦啦', 'en'),
        w('Love You', 'Love You', 'Love You', '爱你', 'en'),
      ],
    },
    {
      th: 'แต่เธอ เธอ เธอ เพราะเธอ ดันเข้ามาทำให้ฉันตกหลุกรัก',
      ro: 'tae thoe thoe thoe phro thoe dan khaoma thamhai chan tok lum rak',
      cnRo: '带特特特 坡特 丹靠马 探还禅斗伦拉',
      cn: '但是你你你，就是因为你，偏偏闯进来让我坠入了爱河',
      words: [
        w('แต่เธอ เธอ เธอ', 'tae thoe thoe thoe', '带特特特', '但是你 你 你'),
        w('เพราะเธอ', 'phro thoe', '坡特', '因为你'),
        w('ดันเข้ามา', 'dan khaoma', '丹靠马', '偏偏闯了进来'),
        w('ทำให้ฉันตกหลุมรัก', 'thamhai chan tok lum rak', '探还禅斗伦拉', '让我坠入了爱河'),
      ],
    },
  ];

  /* ── 尾音（Hook，"เธอ~" 拖长音，括号里是背景和声的英文歌词片段）── */
  const HOOK = [
    {
      th: 'เธออออ~ (Don\'t wanna..)',
      ro: 'thoe~ (Don\'t wanna..)',
      cnRo: '特~ (Don\'t wanna..)',
      cn: '你～（不想说……）',
      words: [
        w('เธออออ', 'thoe', '特', '你（拖长音）'),
        w("(Don't wanna..)", "Don't wanna..", "Don't wanna..", '背景和声：不想说……', 'en'),
      ],
    },
    {
      th: 'เธออออ~',
      ro: 'thoe~',
      cnRo: '特~',
      cn: '你～',
      words: [w('เธออออ', 'thoe', '特', '你（拖长音）')],
    },
    {
      th: 'เธออออ~ (But I do )',
      ro: 'thoe~ (But I do)',
      cnRo: '特~ (But I do)',
      cn: '你～（但我是……）',
      words: [
        w('เธออออ', 'thoe', '特', '你（拖长音）'),
        w('(But I do )', 'But I do', 'But I do', '背景和声：但我是（爱你的）', 'en'),
      ],
    },
    {
      th: 'เธออออ~',
      ro: 'thoe~',
      cnRo: '特~',
      cn: '你～',
      words: [w('เธออออ', 'thoe', '特', '你（拖长音）')],
    },
  ];

  /* ── 主歌 B / 过渡段（Bridge）── */
  const V2 = [
    {
      th: 'อยากแกล้งทำไม่มอง แกล้งไม่รู้สึก ( แต่มันรู้สึกไปแล้ว )',
      ro: 'yak klaeng tham mai mong klaeng mai rusuek (tae man rusuek pai laeo)',
      cnRo: '亚扛探埋孟 扛埋如涑 (带曼如涑拍烙)',
      cn: '想假装看不见、假装没感觉（其实早就有感觉了）',
      words: [
        w('อยากแกล้งทำไม่มอง', 'yak klaeng tham mai mong', '亚扛探埋孟', '想故意装作不看'),
        w('แกล้งไม่รู้สึก', 'klaeng mai rusuek', '扛埋如涑', '假装没感觉'),
        w('(แต่มันรู้สึกไปแล้ว)', 'tae man rusuek pai laeo', '带曼如涑拍烙', '（但其实早就有感觉了）'),
      ],
    },
    {
      th: 'อยากแกล้งเมินแต่ใจมันตึกตึก',
      ro: 'yak klaeng moen tae chai man tuek tuek',
      cnRo: '亚扛门 带猜曼特特',
      cn: '想假装不理你，但心却怦怦直跳个不停',
      words: [
        w('อยากแกล้งเมิน', 'yak klaeng moen', '亚扛门', '想故意不理睬'),
        w('แต่ใจมันตึกตึก', 'tae chai man tuek tuek', '带猜曼特特', '但是心却怦怦直跳'),
      ],
    },
  ];

  /* ── 时间轴（秒）── 每句开唱的时间，按段落分开写，顺序 = 段落里句子的顺序。
     副歌/预副歌/尾音是复用同一份数据的，但唱了好几遍、时间各不一样，
     所以时间不写在歌词里，放这里按段落前缀分开给。
     ⚠️ 这份是估算值，见文件顶部说明；用网页上的「⏱ 校准」标一遍就准了。 */
  const TIMES = {
    v1: [15, 18.6, 22.2, 25.8],
    p1: [29.4, 32.6, 35.8, 39],
    c1: [42.2, 46.2, 50.2, 54.2],
    h1: [58.2, 60.7, 63.2, 65.7],
    v2: [68.2, 72.2],
    p2: [76.2, 79.4, 82.6, 85.8],
    c2: [89, 93, 97, 101],
    h2: [105, 107.5, 110, 112.5],
    c3: [115, 119, 123, 127],
    c4: [131, 135, 139, 143],
    h3: [147, 149.5, 152, 154.5],
  };

  // 补 id、lang(默认 th，句子自带的会覆盖) 和 start：id 用「段落前缀-第几句」，全曲唯一；
  // start 从 TIMES[prefix] 里按顺序取（没给就留空，页面会当这句没时间轴）
  const withIds = (prefix, lines) =>
    lines.map((l, i) => Object.assign(
      { id: `${prefix}-${i + 1}`, lang: 'th', start: (TIMES[prefix] || [])[i] },
      l
    ));

  window.SONGS['dont-wanna-but-i-do'] = {
    id: 'dont-wanna-but-i-do',
    title: "Ngan Rak La (Don't Wanna, But I Do)",
    titleTh: 'งั้นรักละ',
    titleCn: '不想说，但我是（那就爱了吧）',
    artist: 'Jan, Jingjing',
    album: 'Ost. ลัลล์ไม่ชอบไว้นั้น (Enemies With Benefits)',
    youtubeId: 'xWvhq6bsde8',

    // 有逐句时间轴：页面跟着原曲自动高亮，KTV / 单句循环 / 自动跟随都能用。
    // synced: false = 上面 TIMES 里的秒数还是估算的，没跟着原曲标过 ——
    // 页面顶部会挂一条提示，点右上角「⏱ 校准」自己标一遍就行。
    synced: false,
    // 时间集中写在 TIMES 里（不是写在每句上），校准面板点「导出」就会按 TIMES 的格式给，
    // 整块贴回去即可
    timesStyle: 'grouped',

    sections: [
      { name: '主歌',       nameEn: 'Verse',        lines: withIds('v1', V1) },
      { name: '预副歌',     nameEn: 'Pre-chorus',   lines: withIds('p1', PRE) },
      { name: '副歌',       nameEn: 'Chorus 1',     lines: withIds('c1', CHORUS) },
      { name: '尾音',       nameEn: 'Hook 1',        lines: withIds('h1', HOOK) },
      { name: '过渡段',     nameEn: 'Bridge',        lines: withIds('v2', V2) },
      { name: '预副歌',     nameEn: 'Pre-chorus 2', lines: withIds('p2', PRE) },
      { name: '副歌',       nameEn: 'Chorus 2',     lines: withIds('c2', CHORUS) },
      { name: '尾音',       nameEn: 'Hook 2',        lines: withIds('h2', HOOK) },
      { name: '副歌（连唱）', nameEn: 'Chorus 3',     lines: withIds('c3', CHORUS) },
      { name: '副歌（连唱）', nameEn: 'Chorus 4',     lines: withIds('c4', CHORUS) },
      { name: '尾音（终）',  nameEn: 'Final hook',    lines: withIds('h3', HOOK) },
    ],
  };
})();
