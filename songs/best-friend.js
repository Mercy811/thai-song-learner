/**
 * Best Friend — 西野カナ
 * 歌词以 Uta-Net / JOYSOUND 为准；时间轴由公开同步歌词整体校准到官方 MV 音轨。
 * 本曲为日语，所有歌词行和词卡均显式标记 lang: 'ja'。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean, lang = 'ja') => ({ th, ro, cn, mean, lang });
  const line = (th, ro, cnRo, cn, words) => ({ th, ro, cnRo, cn, words, lang: 'ja' });

  const CHORUS = [
    line('ありがとう', 'arigatou', '阿里嘎多', '谢谢你', [w('ありがとう', 'arigatou', '阿里嘎多', '谢谢')]),
    line('君がいてくれて本当よかったよ', 'kimi ga ite kurete hontou yokatta yo', '奇米嘎一帖库来帖 红多哟卡塔哟', '真的很庆幸有你在', [w('君がいてくれて', 'kimi ga ite kurete', '奇米嘎一帖库来帖', '有你陪在身边'), w('本当', 'hontou', '红多', '真的'), w('よかったよ', 'yokatta yo', '哟卡塔哟', '太好了')]),
    line('どんな時だっていつも', 'donna toki datte itsumo', '多那多ki达帖 一次摸', '无论什么时候，总是如此', [w('どんな時だって', 'donna toki datte', '多那多ki达帖', '无论何时'), w('いつも', 'itsumo', '一次摸', '总是')]),
    line('笑っていられる', 'waratte irareru', '哇拉帖 一拉来鲁', '我都能保持笑容', [w('笑って', 'waratte', '哇拉帖', '笑着'), w('いられる', 'irareru', '一拉来鲁', '能够保持')]),
    line('例えば、離れていても 何年経っても', 'tatoeba hanarete itemo nannen tattemo', '塔多诶巴 哈那来帖一帖摸 南年塔帖摸', '即使分隔两地，即使过去很多年', [w('例えば', 'tatoeba', '塔多诶巴', '比如'), w('離れていても', 'hanarete itemo', '哈那来帖一帖摸', '即使分开'), w('何年経っても', 'nannen tattemo', '南年塔帖摸', '无论过了多少年')]),
    line('ずっと変わらないでしょ', 'zutto kawaranai deshou', '祖多 卡哇拉乃得笑', '我们永远不会改变，对吧', [w('ずっと', 'zutto', '祖多', '一直、永远'), w('変わらない', 'kawaranai', '卡哇拉乃', '不会改变'), w('でしょ', 'deshou', '得笑', '对吧')]),
    line('私たち Best Friend', 'watashitachi Best Friend', '哇塔西塔七 Best Friend', '我们是最好的朋友', [w('私たち', 'watashitachi', '哇塔西塔七', '我们'), w('Best Friend', 'Best Friend', 'Best Friend', '最好的朋友', 'en')]),
    line('好きだよ', 'suki da yo', '斯ki达哟', '喜欢你哦', [w('好きだよ', 'suki da yo', '斯ki达哟', '喜欢你')]),
    line('大好きだよ', 'daisuki da yo', '呆斯ki达哟', '最喜欢你了', [w('大好きだよ', 'daisuki da yo', '呆斯ki达哟', '最喜欢你')]),
  ];

  const V1 = [
    line('こんな遅い時間にゴメンね', 'konna osoi jikan ni gomen ne', '空那哦索一 几康尼 果面内', '这么晚了，对不起呀', [w('こんな遅い時間に', 'konna osoi jikan ni', '空那哦索一几康尼', '在这么晚的时间'), w('ゴメンね', 'gomen ne', '果面内', '对不起呀')]),
    line('一人じゃせっぱつまってきたの', 'hitori ja seppatsumatte kita no', '西多里加 塞帕次马帖ki塔诺', '一个人已经快撑不住了', [w('一人じゃ', 'hitori ja', '西多里加', '一个人的话'), w('せっぱつまってきたの', 'seppatsumatte kita no', '塞帕次马帖ki塔诺', '渐渐陷入窘境')]),
    line('君の声少し聞けたら', 'kimi no koe sukoshi kiketara', '奇米诺口诶 斯口西 ki开塔拉', '只要能听一会儿你的声音', [w('君の声', 'kimi no koe', '奇米诺口诶', '你的声音'), w('少し', 'sukoshi', '斯口西', '一点'), w('聞けたら', 'kiketara', 'ki开塔拉', '如果能听到')]),
    line('がんばれる', 'ganbareru', '甘巴来鲁', '我就能继续努力', [w('がんばれる', 'ganbareru', '甘巴来鲁', '能够努力、坚持')]),
    line('何でも打ち明けられる', 'nandemo uchiakerareru', '南得摸 乌七阿开拉来鲁', '什么都能向你倾诉', [w('何でも', 'nandemo', '南得摸', '什么都'), w('打ち明けられる', 'uchiakerareru', '乌七阿开拉来鲁', '能够坦白倾诉')]),
    line('ママにも言えないことも全部', 'mama ni mo ienai koto mo zenbu', '马马尼摸 一诶乃口多摸 森布', '连不能告诉妈妈的事也全都可以', [w('ママにも', 'mama ni mo', '马马尼摸', '连对妈妈也'), w('言えないことも', 'ienai koto mo', '一诶乃口多摸', '不能说的事也'), w('全部', 'zenbu', '森布', '全部')]),
    line('誰よりも分かってくれる', 'dare yori mo wakatte kureru', '达来哟里摸 哇卡帖库来鲁', '你比任何人都理解我', [w('誰よりも', 'dare yori mo', '达来哟里摸', '比任何人都'), w('分かってくれる', 'wakatte kureru', '哇卡帖库来鲁', '愿意理解我')]),
    line('嬉しい時は自分の事みたいに喜んでくれて', 'ureshii toki wa jibun no koto mitai ni yorokonde kurete', '乌来西多ki哇 几奔诺口多米塔一尼 哟罗空得库来帖', '开心时你会像是自己的事一样替我高兴', [w('嬉しい時は', 'ureshii toki wa', '乌来西多ki哇', '开心的时候'), w('自分の事みたいに', 'jibun no koto mitai ni', '几奔诺口多米塔一尼', '像自己的事一样'), w('喜んでくれて', 'yorokonde kurete', '哟罗空得库来帖', '为我高兴')]),
    line('ダメな時はちゃんと叱ってくれる存在', 'dame na toki wa chanto shikatte kureru sonzai', '达咩那多ki哇 强多西卡帖库来鲁 孙在', '做得不好时，你也是会认真批评我的存在', [w('ダメな時は', 'dame na toki wa', '达咩那多ki哇', '不行的时候'), w('ちゃんと叱ってくれる', 'chanto shikatte kureru', '强多西卡帖库来鲁', '会好好责备我'), w('存在', 'sonzai', '孙在', '存在')]),
  ];

  const V2 = [
    line('強がってもすぐにバレてる', 'tsuyogatte mo sugu ni bareteru', '次哟嘎帖摸 斯古尼 巴来帖鲁', '即使逞强也马上会被你看穿', [w('強がっても', 'tsuyogatte mo', '次哟嘎帖摸', '即使逞强'), w('すぐに', 'sugu ni', '斯古尼', '马上'), w('バレてる', 'bareteru', '巴来帖鲁', '被看穿')]),
    line('へこんでる時は', 'hekonderu toki wa', '嘿空得鲁多ki哇', '在我消沉的时候', [w('へこんでる', 'hekonderu', '嘿空得鲁', '消沉、沮丧'), w('時は', 'toki wa', '多ki哇', '当……时')]),
    line('真っ先にメールくれる優しさに', 'massaki ni meeru kureru yasashisa ni', '马萨ki尼 咩鲁库来鲁 雅萨西萨尼', '你总是第一时间发来邮件，这份温柔', [w('真っ先に', 'massaki ni', '马萨ki尼', '最先'), w('メールくれる', 'meeru kureru', '咩鲁库来鲁', '给我发邮件'), w('優しさに', 'yasashisa ni', '雅萨西萨尼', '因这份温柔')]),
    line('もう何度も救われて', 'mou nando mo sukuwarete', '摸 南多摸 斯库哇来帖', '已经一次又一次拯救了我', [w('もう', 'mou', '摸', '已经'), w('何度も', 'nando mo', '南多摸', '很多次'), w('救われて', 'sukuwarete', '斯库哇来帖', '被拯救')]),
    line('泣きたい時はおもいっきり泣けばいい', 'nakitai toki wa omoikkiri nakeba ii', '那ki塔一多ki哇 哦摸一ki里 那开巴一', '想哭的时候就尽情地哭吧', [w('泣きたい時は', 'nakitai toki wa', '那ki塔一多ki哇', '想哭的时候'), w('おもいっきり', 'omoikkiri', '哦摸一ki里', '尽情地'), w('泣けばいい', 'nakeba ii', '那开巴一', '哭出来就好')]),
    line('側にいるからって', 'soba ni iru kara tte', '索巴尼一鲁 卡拉帖', '因为我会在你身边', [w('側にいる', 'soba ni iru', '索巴尼一鲁', '在身边'), w('からって', 'kara tte', '卡拉帖', '因为、说是')]),
    line('誰よりも強い味方', 'dare yori mo tsuyoi mikata', '达来哟里摸 次哟一 米卡塔', '我是比任何人都可靠的伙伴', [w('誰よりも', 'dare yori mo', '达来哟里摸', '比任何人都'), w('強い味方', 'tsuyoi mikata', '次哟一米卡塔', '强大的伙伴')]),
    line('そんな君に私は何かしてあげられてるかな？', 'sonna kimi ni watashi wa nanika shite agerareteru kana', '孙那奇米尼 哇塔西哇 那尼卡西帖 阿给拉来帖鲁卡那', '对这样的你，我是否也为你做了些什么呢？', [w('そんな君に', 'sonna kimi ni', '孙那奇米尼', '对这样的你'), w('私は何か', 'watashi wa nanika', '哇塔西哇那尼卡', '我是否做了什么'), w('してあげられてるかな', 'shite agerareteru kana', '西帖阿给拉来帖鲁卡那', '有为你做到吗')]),
    line('何かあったらすぐに飛んでくから、絶対', 'nanika attara sugu ni tondeku kara zettai', '那尼卡阿塔拉 斯古尼通得库卡拉 泽太', '如果发生什么，我一定会马上飞奔到你身边', [w('何かあったら', 'nanika attara', '那尼卡阿塔拉', '如果发生什么'), w('すぐに飛んでくから', 'sugu ni tondeku kara', '斯古尼通得库卡拉', '会马上飞奔过去'), w('絶対', 'zettai', '泽太', '一定')]),
  ];

  const BRIDGE = [
    line('どんな時も祈っているよ', 'donna toki mo inotte iru yo', '多那多ki摸 一诺帖一鲁哟', '无论何时我都在祈愿', [w('どんな時も', 'donna toki mo', '多那多ki摸', '无论何时'), w('祈っているよ', 'inotte iru yo', '一诺帖一鲁哟', '一直在祈祷')]),
    line('世界で一番に幸せになってほしい', 'sekai de ichiban ni shiawase ni natte hoshii', '塞卡一得 一七班尼 西阿哇塞尼那帖厚西', '希望你成为世界上最幸福的人', [w('世界で一番に', 'sekai de ichiban ni', '塞卡一得一七班尼', '世界第一、最'), w('幸せになってほしい', 'shiawase ni natte hoshii', '西阿哇塞尼那帖厚西', '希望你获得幸福')]),
  ];

  // 公开同步歌词对应 5:20 音源；官方 MV 在歌曲前多 22.36 秒剧情，逐句整体校准后如下。
  const TIMES = {
    c0: [23.15, 24.77, 31.56, 35.78, 39.75, 48.02, 52.18, 55.49, 63.51],
    v1: [73.36, 77.57, 81.60, 85.76, 88.30, 92.89, 98.43, 105.07, 113.39],
    c1: [121.58, 123.09, 130.07, 134.20, 138.04, 146.46, 150.64, 153.94, 162.31],
    v2: [171.80, 175.95, 177.80, 181.77, 186.85, 193.31, 196.68, 203.58, 211.90],
    c2: [220.14, 221.60, 228.64, 232.80, 236.60, 245.05, 249.15, 252.51, 260.70],
    b1: [269.57, 277.19],
    c3: [285.52, 287.31, 294.31, 298.26, 302.12, 310.66, 314.75, 318.02, 326.24],
  };
  const withIds = (prefix, rows) => rows.map((row, i) => ({ ...row, id: `${prefix}-${i + 1}`, start: TIMES[prefix][i] }));

  window.SONGS['best-friend'] = {
    id: 'best-friend',
    title: 'Best Friend',
    titleTh: 'Best Friend',
    titleCn: '最好的朋友',
    artist: '西野カナ (Kana Nishino)',
    album: 'to LOVE',
    youtubeId: 'ZqRi4bqu60I',
    timeline: true,
    synced: true,
    timesStyle: 'grouped',
    language: 'ja',
    sections: [
      { name: '开场副歌', nameEn: 'Opening Chorus', lines: withIds('c0', CHORUS) },
      { name: '主歌 A', nameEn: 'Verse 1', lines: withIds('v1', V1) },
      { name: '副歌', nameEn: 'Chorus 1', lines: withIds('c1', CHORUS) },
      { name: '主歌 B', nameEn: 'Verse 2', lines: withIds('v2', V2) },
      { name: '副歌', nameEn: 'Chorus 2', lines: withIds('c2', CHORUS) },
      { name: '桥段', nameEn: 'Bridge', lines: withIds('b1', BRIDGE) },
      { name: '尾声副歌', nameEn: 'Final Chorus', lines: withIds('c3', CHORUS) },
    ],
  };
})();
