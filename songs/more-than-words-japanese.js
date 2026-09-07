/**
 * More Than Words (Japanese Version) — Emi Thasorn
 * 日语歌词参考公开歌词整理页；时间轴按 YouTube Music 官方音源逐词转写校准。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean, lang = 'ja') => ({ th, ro, cn, mean, lang });
  const line = (th, ro, cnRo, cn, words) => ({ th, ro, cnRo, cn, words, lang: 'ja' });

  const V1 = [
    line('ねぇ 気づいてる？', 'nee kizuiteru?', '内 气兹一帖鲁', '呐，你注意到了吗？', [w('ねぇ', 'nee', '内', '呐、喂'), w('気づいてる', 'kizuiteru', '气兹一帖鲁', '注意到了')]),
    line('この一瞬さえ', 'kono isshun sae', '口诺 一旬萨诶', '就连这一瞬间', [w('この', 'kono', '口诺', '这个'), w('一瞬', 'isshun', '一旬', '一瞬间'), w('さえ', 'sae', '萨诶', '甚至、连……也')]),
    line('二人しかいないこの世界', 'futari shika inai kono sekai', '夫塔里 西卡一乃 口诺塞卡一', '这个世界仿佛只有我们两个人', [w('二人', 'futari', '夫塔里', '两个人'), w('しかいない', 'shika inai', '西卡一乃', '只有'), w('この世界', 'kono sekai', '口诺塞卡一', '这个世界')]),
    line('出会った日から', 'deatta hi kara', '得阿塔 西卡拉', '从相遇的那天起', [w('出会った日', 'deatta hi', '得阿塔西', '相遇的那天'), w('から', 'kara', '卡拉', '从……起')]),
    line('「恋しさ」が溢れ出していく', 'koishisa ga afuredashite iku', '口一西萨嘎 阿夫来达西帖一库', '思恋之情不断满溢出来', [w('恋しさ', 'koishisa', '口一西萨', '思恋'), w('溢れ出していく', 'afuredashite iku', '阿夫来达西帖一库', '不断满溢出来')]),
    line('やっと分かったんだ 「愛」の意味', 'yatto wakattanda ai no imi', '雅多 哇卡探达 爱诺一米', '终于懂得了“爱”的含义', [w('やっと', 'yatto', '雅多', '终于'), w('分かったんだ', 'wakattanda', '哇卡探达', '明白了'), w('愛の意味', 'ai no imi', '爱诺一米', '爱的含义')]),
  ];

  const PRE = [
    line('偶然じゃない', 'guuzen janai', '古真加乃', '这不是偶然', [w('偶然', 'guuzen', '古真', '偶然'), w('じゃない', 'janai', '加乃', '不是')]),
    line('あなたが教えてくれたの', 'anata ga oshiete kureta no', '阿那塔嘎 哦西诶帖库来塔诺', '是你教会了我', [w('あなたが', 'anata ga', '阿那塔嘎', '你'), w('教えてくれたの', 'oshiete kureta no', '哦西诶帖库来塔诺', '教会了我')]),
    line('愛することを', 'aisuru koto o', '爱斯鲁口多哦', '如何去爱', [w('愛する', 'aisuru', '爱斯鲁', '爱'), w('ことを', 'koto o', '口多哦', '这件事')]),
  ];

  const HOOK = [
    line('伝えたい ティーラック', 'tsutaetai thirak', '次塔诶太 提拉', '想告诉你，亲爱的', [w('伝えたい', 'tsutaetai', '次塔诶太', '想传达、想告诉'), w('ティーラック', 'thirak', '提拉', '亲爱的（泰语）', 'th')]),
    line('愛してるの ティーラック', 'aishiteru no thirak', '爱西帖鲁诺 提拉', '我爱你，亲爱的', [w('愛してるの', 'aishiteru no', '爱西帖鲁诺', '我爱你'), w('ティーラック', 'thirak', '提拉', '亲爱的（泰语）', 'th')]),
    line('言葉以上に', 'kotoba ijou ni', '口多巴 一教尼', '远胜过言语', [w('言葉', 'kotoba', '口多巴', '言语'), w('以上に', 'ijou ni', '一教尼', '比……更多')]),
    line('目があった瞬間に', 'me ga atta shunkan ni', '咩嘎阿塔 旬干尼', '在目光交会的瞬间', [w('目があった', 'me ga atta', '咩嘎阿塔', '目光相遇'), w('瞬間に', 'shunkan ni', '旬干尼', '在瞬间')]),
    line('時が止まったようで', 'toki ga tomatta you de', '多ki嘎 多马塔哟得', '仿佛时间停止了', [w('時が', 'toki ga', '多ki嘎', '时间'), w('止まったようで', 'tomatta you de', '多马塔哟得', '仿佛停止了')]),
    line('ティーラック 愛おしい人', 'thirak itooshii hito', '提拉 一多哦西一西多', '亲爱的，我深爱的人', [w('ティーラック', 'thirak', '提拉', '亲爱的（泰语）', 'th'), w('愛おしい人', 'itooshii hito', '一多哦西一西多', '深爱的人')]),
    line('どこにいても', 'doko ni itemo', '多口尼一帖摸', '无论身在何处', [w('どこにいても', 'doko ni itemo', '多口尼一帖摸', '无论在哪里')]),
    line("I'll be with you oh", 'I will be with you oh', '爱欧 比 威兹 优 欧', '我都会陪着你', [w("I'll be with you", 'I will be with you', '爱欧比威兹优', '我会陪着你', 'en'), w('oh', 'oh', '欧', '吟唱', 'en')]),
    line('抱きしめて離さないからね', 'dakishimete hanasanai kara ne', '达ki西咩帖 哈那萨乃卡拉内', '我会抱紧你，不会放手', [w('抱きしめて', 'dakishimete', '达ki西咩帖', '抱紧'), w('離さないからね', 'hanasanai kara ne', '哈那萨乃卡拉内', '因为不会放手')]),
    line('My ティーラック', 'my thirak', '麦 提拉', '我的亲爱的', [w('My', 'my', '麦', '我的', 'en'), w('ティーラック', 'thirak', '提拉', '亲爱的（泰语）', 'th')]),
  ];

  const V2 = [
    line('見上げた空', 'miageta sora', '米阿给塔 索拉', '抬头仰望的天空', [w('見上げた', 'miageta', '米阿给塔', '抬头仰望'), w('空', 'sora', '索拉', '天空')]),
    line('もう怖くないの', 'mou kowakunai no', '摸哦 口哇库乃诺', '已经不再害怕', [w('もう', 'mou', '摸哦', '已经'), w('怖くないの', 'kowakunai no', '口哇库乃诺', '不害怕了')]),
    line('いつもそばにいて離れないで', 'itsumo soba ni ite hanarenaide', '一次摸 索巴尼一帖 哈那来乃得', '请一直陪在我身边，不要离开', [w('いつも', 'itsumo', '一次摸', '一直'), w('そばにいて', 'soba ni ite', '索巴尼一帖', '陪在身边'), w('離れないで', 'hanarenaide', '哈那来乃得', '不要离开')]),
  ];

  const BRIDGE = [
    line('ティーラック', 'thirak', '提拉', '亲爱的', [w('ティーラック', 'thirak', '提拉', '亲爱的（泰语）', 'th')]),
    line('言葉にできない', 'kotoba ni dekinai', '口多巴尼 得ki乃', '无法用言语表达', [w('言葉に', 'kotoba ni', '口多巴尼', '用言语'), w('できない', 'dekinai', '得ki乃', '做不到、无法')]),
    line('いつまでも all for you', 'itsumademo all for you', '一次马得摸 奥 佛 优', '永远都全部为你', [w('いつまでも', 'itsumademo', '一次马得摸', '永远'), w('all for you', 'all for you', '奥佛优', '全部为你', 'en')]),
  ];

  const TIMES = {
    v1: [21.20, 27.25, 30.97, 37.65, 41.59, 47.49],
    p1: [52.21, 55.21, 61.05],
    c1: [65.29, 67.43, 71.15, 73.27, 77.03, 80.01, 83.55, 86.17, 89.85, 93.53],
    v2: [107.22, 111.02, 114.06],
    p2: [121.38, 124.88, 130.26],
    c2: [134.86, 137.30, 140.96, 142.92, 146.58, 149.48, 153.18, 155.72, 159.28, 162.88],
    b1: [166.54, 168.70, 173.60],
    c3: [190.23, 193.21, 196.37, 198.39, 201.87, 205.21, 208.81, 211.31, 215.03, 218.71],
    c4: [220.52, 224.36, 227.18, 230.06, 233.10, 236.72, 239.66, 242.00, 246.58],
  };
  const withIds = (prefix, rows) => rows.map((row, i) => ({ ...row, id: `${prefix}-${i + 1}`, start: TIMES[prefix][i] }));

  window.SONGS['more-than-words-japanese'] = {
    id: 'more-than-words-japanese',
    title: 'More Than Words (Japanese Version)',
    titleTh: 'More Than Words 日本語版',
    titleCn: '不只是亲爱的（日语版）',
    artist: 'Emi Thasorn',
    album: 'BEST OF GMMTV VOL. 2',
    youtubeId: 'KJr33oe982I',
    timeline: true,
    synced: true,
    timesStyle: 'grouped',
    language: 'ja',
    sections: [
      { name: '主歌 A', nameEn: 'Verse 1', lines: withIds('v1', V1) },
      { name: '预副歌', nameEn: 'Pre-chorus', lines: withIds('p1', PRE) },
      { name: '副歌', nameEn: 'Chorus 1', lines: withIds('c1', HOOK) },
      { name: '主歌 B', nameEn: 'Verse 2', lines: withIds('v2', V2) },
      { name: '预副歌', nameEn: 'Pre-chorus', lines: withIds('p2', PRE) },
      { name: '副歌', nameEn: 'Chorus 2', lines: withIds('c2', HOOK) },
      { name: '桥段', nameEn: 'Bridge', lines: withIds('b1', BRIDGE) },
      { name: '副歌', nameEn: 'Final Chorus', lines: withIds('c3', HOOK) },
      { name: '尾声副歌', nameEn: 'Outro Chorus', lines: withIds('c4', HOOK.slice(1)) },
    ],
  };
})();
