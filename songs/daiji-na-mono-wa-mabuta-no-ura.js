/**
 * 大事なものは目蓋の裏 — KOKIA
 * 日语歌词与读音参考 UtaTen；时间轴来自与官方 5:09 音源匹配的公开同步歌词。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean, lang: 'ja' });
  const line = (th, ro, cnRo, cn, words) => ({ th, ro, cnRo, cn, words, lang: 'ja' });

  const LINES = [
    line('あなたの前に何が見える？', 'anata no mae ni nani ga mieru?', '阿那塔诺 马诶尼 那尼嘎 米诶鲁', '在你面前能看见什么？', [w('あなたの前に', 'anata no mae ni', '阿那塔诺马诶尼', '在你面前'), w('何が', 'nani ga', '那尼嘎', '什么'), w('見える', 'mieru', '米诶鲁', '看得见')]),
    line('色とりどりの魅力 溢れる世界？', 'iro toridori no miryoku afureru sekai?', '一罗多里多里诺 米辽库 阿夫来鲁 塞卡一', '是充满缤纷魅力的世界吗？', [w('色とりどりの', 'iro toridori no', '一罗多里多里诺', '五彩缤纷的'), w('魅力', 'miryoku', '米辽库', '魅力'), w('溢れる世界', 'afureru sekai', '阿夫来鲁塞卡一', '满溢的世界')]),
    line('大事なものは目蓋の裏', 'daiji na mono wa mabuta no ura', '呆几那摸诺哇 马布塔诺乌拉', '重要的东西就在眼睑之后', [w('大事なもの', 'daiji na mono', '呆几那摸诺', '重要的东西'), w('目蓋の裏', 'mabuta no ura', '马布塔诺乌拉', '眼睑之后')]),
    line('こうして閉じれば見えてくる', 'kou shite tojireba miete kuru', '口西帖 多几来巴 米诶帖库鲁', '像这样闭上眼睛，它便会浮现', [w('こうして', 'kou shite', '口西帖', '像这样'), w('閉じれば', 'tojireba', '多几来巴', '如果闭上'), w('見えてくる', 'miete kuru', '米诶帖库鲁', '逐渐看见')]),
    line('点滅してる光の中でも あなただけは消えなかった', 'tenmetsu shiteru hikari no naka demo anata dake wa kienakatta', '天咩次西帖鲁 西卡里诺那卡得摸 阿那塔达开哇 ki诶那卡塔', '即使在闪烁的光芒中，唯独你没有消失', [w('点滅してる光の中でも', 'tenmetsu shiteru hikari no naka demo', '天咩次西帖鲁西卡里诺那卡得摸', '即使在闪烁的光芒中'), w('あなただけは', 'anata dake wa', '阿那塔达开哇', '唯独你'), w('消えなかった', 'kienakatta', 'ki诶那卡塔', '没有消失')]),
    line('大事なものは目蓋の裏から そうして大事に覚えてる', 'daiji na mono wa mabuta no ura kara sou shite daiji ni oboeteru', '呆几那摸诺哇 马布塔诺乌拉卡拉 索西帖 呆几尼哦博诶帖鲁', '重要之物来自眼睑之后，我就这样珍重地记着', [w('大事なものは目蓋の裏から', 'daiji na mono wa mabuta no ura kara', '呆几那摸诺哇马布塔诺乌拉卡拉', '重要之物来自眼睑之后'), w('そうして', 'sou shite', '索西帖', '然后、就这样'), w('大事に覚えてる', 'daiji ni oboeteru', '呆几尼哦博诶帖鲁', '珍重地记着')]),
    line('私はここよ ここに居るの', 'watashi wa koko yo koko ni iru no', '哇塔西哇口口哟 口口尼一鲁诺', '我在这里，就在这里', [w('私はここよ', 'watashi wa koko yo', '哇塔西哇口口哟', '我在这里'), w('ここに居るの', 'koko ni iru no', '口口尼一鲁诺', '就在这里')]),
    line('厚い雲が すぐそこまで来てるわ', 'atsui kumo ga sugu soko made kiteru wa', '阿次一库摸嘎 斯古索口马得 ki帖鲁哇', '厚重的云已经来到近旁', [w('厚い雲が', 'atsui kumo ga', '阿次一库摸嘎', '厚重的云'), w('すぐそこまで', 'sugu soko made', '斯古索口马得', '直到近旁'), w('来てるわ', 'kiteru wa', 'ki帖鲁哇', '正到来')]),
    line('眠ってはだめ 眠ってはだめよ', 'nemutte wa dame nemutte wa dame yo', '内姆帖哇达咩 内姆帖哇达咩哟', '不能睡，千万不能睡', [w('眠ってはだめ', 'nemutte wa dame', '内姆帖哇达咩', '不能睡'), w('眠ってはだめよ', 'nemutte wa dame yo', '内姆帖哇达咩哟', '不要睡啊')]),
    line('虚ろな目がまばたきを始める 夢を見るにはまだ早いわ…', 'utsuro na me ga mabataki o hajimeru yume o miru ni wa mada hayai wa', '乌次罗那咩嘎 马巴塔ki哦 哈几咩鲁 优咩哦米鲁尼哇 马达哈雅一哇', '空洞的双眼开始眨动，现在做梦还太早……', [w('虚ろな目が', 'utsuro na me ga', '乌次罗那咩嘎', '空洞的眼睛'), w('まばたきを始める', 'mabataki o hajimeru', '马巴塔ki哦哈几咩鲁', '开始眨动'), w('夢を見るには', 'yume o miru ni wa', '优咩哦米鲁尼哇', '要做梦的话'), w('まだ早いわ', 'mada hayai wa', '马达哈雅一哇', '还太早')]),
    line('結局全ては信じること 離れることで近くなった', 'kekkyoku subete wa shinjiru koto hanareru koto de chikaku natta', '开kyoku 斯贝帖哇 新几鲁口多 哈那来鲁口多得 七卡库那塔', '到头来一切在于相信，因为分离反而变得更近', [w('結局全ては', 'kekkyoku subete wa', '开kyoku斯贝帖哇', '到头来一切'), w('信じること', 'shinjiru koto', '新几鲁口多', '在于相信'), w('離れることで', 'hanareru koto de', '哈那来鲁口多得', '因为分离'), w('近くなった', 'chikaku natta', '七卡库那塔', '变得更近')]),
    line('絆も今ははっきり見える 私だけが知ってる場所がある', 'kizuna mo ima wa hakkiri mieru watashi dake ga shitteru basho ga aru', 'ki祖那摸 一马哇哈ki里米诶鲁 哇塔西达开嘎 西帖鲁巴笑嘎阿鲁', '如今羁绊也清晰可见，有一个只有我知道的地方', [w('絆も今は', 'kizuna mo ima wa', 'ki祖那摸一马哇', '如今羁绊也'), w('はっきり見える', 'hakkiri mieru', '哈ki里米诶鲁', '清晰可见'), w('私だけが知ってる', 'watashi dake ga shitteru', '哇塔西达开嘎西帖鲁', '只有我知道'), w('場所がある', 'basho ga aru', '巴笑嘎阿鲁', '有一个地方')]),
    line('大事なものは目蓋の裏から 夢じゃない 今すぐに見つかる大事な場所', 'daiji na mono wa mabuta no ura kara yume janai ima sugu ni mitsukaru daiji na basho', '呆几那摸诺哇 马布塔诺乌拉卡拉 优咩加乃 一马斯古尼 米次卡鲁 呆几那巴笑', '重要之物来自眼睑之后，并非梦境，现在就能找到那珍贵之地', [w('大事なものは目蓋の裏から', 'daiji na mono wa mabuta no ura kara', '呆几那摸诺哇马布塔诺乌拉卡拉', '重要之物来自眼睑之后'), w('夢じゃない', 'yume janai', '优咩加乃', '不是梦'), w('今すぐに見つかる', 'ima sugu ni mitsukaru', '一马斯古尼米次卡鲁', '现在立刻就能找到'), w('大事な場所', 'daiji na basho', '呆几那巴笑', '重要的地方')]),
    line('私はここよ ここに居るの', 'watashi wa koko yo koko ni iru no', '哇塔西哇口口哟 口口尼一鲁诺', '我在这里，就在这里', [w('私はここよ', 'watashi wa koko yo', '哇塔西哇口口哟', '我在这里'), w('ここに居るの', 'koko ni iru no', '口口尼一鲁诺', '就在这里')]),
    line('一羽の鳥が弧を描いてゆくわ', 'ichiwa no tori ga ko o egaite yuku wa', '一七哇诺多里嘎 口哦 诶嘎一帖优库哇', '一只鸟划着弧线飞去', [w('一羽の鳥が', 'ichiwa no tori ga', '一七哇诺多里嘎', '一只鸟'), w('弧を描いて', 'ko o egaite', '口哦诶嘎一帖', '画出弧线'), w('ゆくわ', 'yuku wa', '优库哇', '离去')]),
    line('黙ってはだめ 黙ってはだめよ', 'damatte wa dame damatte wa dame yo', '达马帖哇达咩 达马帖哇达咩哟', '不能沉默，千万不能沉默', [w('黙ってはだめ', 'damatte wa dame', '达马帖哇达咩', '不能沉默'), w('黙ってはだめよ', 'damatte wa dame yo', '达马帖哇达咩哟', '不要沉默啊')]),
    line('夢のつづきは その目で見ればいい', 'yume no tsuzuki wa sono me de mireba ii', '优咩诺次祖ki哇 索诺咩得 米来巴一', '梦的后续，用那双眼睛去看就好', [w('夢のつづきは', 'yume no tsuzuki wa', '优咩诺次祖ki哇', '梦的后续'), w('その目で', 'sono me de', '索诺咩得', '用那双眼睛'), w('見ればいい', 'mireba ii', '米来巴一', '去看就好')]),
    line('迷子の私は出口を探して 我ム者ラに茨を歩く', 'maigo no watashi wa deguchi o sagashite gamushara ni ibara o aruku', '马一果诺哇塔西哇 得古七哦 萨嘎西帖 嘎姆夏拉尼 一巴拉哦阿鲁库', '迷途的我寻找出口，不顾一切地走过荆棘', [w('迷子の私は', 'maigo no watashi wa', '马一果诺哇塔西哇', '迷途的我'), w('出口を探して', 'deguchi o sagashite', '得古七哦萨嘎西帖', '寻找出口'), w('我ム者ラに', 'gamushara ni', '嘎姆夏拉尼', '不顾一切地'), w('茨を歩く', 'ibara o aruku', '一巴拉哦阿鲁库', '走过荆棘')]),
    line('流れるこの血は溢れた感情', 'nagareru kono chi wa afureta kanjou', '那嘎来鲁口诺七哇 阿夫来塔 干教', '流淌的鲜血是满溢的情感', [w('流れるこの血は', 'nagareru kono chi wa', '那嘎来鲁口诺七哇', '流淌的这鲜血'), w('溢れた感情', 'afureta kanjou', '阿夫来塔干教', '满溢的感情')]),
    line('どうしてこんなに焦っているの？', 'doushite konna ni asette iru no?', '多西帖 空那尼 阿塞帖一鲁诺', '为什么会如此焦急？', [w('どうして', 'doushite', '多西帖', '为什么'), w('こんなに', 'konna ni', '空那尼', '如此'), w('焦っているの', 'asette iru no', '阿塞帖一鲁诺', '正在焦急')]),
    line('私はここよ ここに居るの', 'watashi wa koko yo koko ni iru no', '哇塔西哇口口哟 口口尼一鲁诺', '我在这里，就在这里', [w('私はここよ', 'watashi wa koko yo', '哇塔西哇口口哟', '我在这里'), w('ここに居るの', 'koko ni iru no', '口口尼一鲁诺', '就在这里')]),
    line('厚い雲がすぐそこまで来てるわ', 'atsui kumo ga sugu soko made kiteru wa', '阿次一库摸嘎 斯古索口马得 ki帖鲁哇', '厚重的云已经来到近旁', [w('厚い雲が', 'atsui kumo ga', '阿次一库摸嘎', '厚重的云'), w('すぐそこまで', 'sugu soko made', '斯古索口马得', '直到近旁'), w('来てるわ', 'kiteru wa', 'ki帖鲁哇', '正到来')]),
    line('眠ってはだめ 眠ってはだめよ', 'nemutte wa dame nemutte wa dame yo', '内姆帖哇达咩 内姆帖哇达咩哟', '不能睡，千万不能睡', [w('眠ってはだめ', 'nemutte wa dame', '内姆帖哇达咩', '不能睡'), w('眠ってはだめよ', 'nemutte wa dame yo', '内姆帖哇达咩哟', '不要睡啊')]),
    line('虚ろな目がまばたきを始める', 'utsuro na me ga mabataki o hajimeru', '乌次罗那咩嘎 马巴塔ki哦 哈几咩鲁', '空洞的双眼开始眨动', [w('虚ろな目が', 'utsuro na me ga', '乌次罗那咩嘎', '空洞的眼睛'), w('まばたきを始める', 'mabataki o hajimeru', '马巴塔ki哦哈几咩鲁', '开始眨动')]),
    line('私はここよ ここに居るの', 'watashi wa koko yo koko ni iru no', '哇塔西哇口口哟 口口尼一鲁诺', '我在这里，就在这里', [w('私はここよ', 'watashi wa koko yo', '哇塔西哇口口哟', '我在这里'), w('ここに居るの', 'koko ni iru no', '口口尼一鲁诺', '就在这里')]),
    line('一羽の鳥が弧を描いてゆくわ', 'ichiwa no tori ga ko o egaite yuku wa', '一七哇诺多里嘎 口哦 诶嘎一帖优库哇', '一只鸟划着弧线飞去', [w('一羽の鳥が', 'ichiwa no tori ga', '一七哇诺多里嘎', '一只鸟'), w('弧を描いてゆくわ', 'ko o egaite yuku wa', '口哦诶嘎一帖优库哇', '划着弧线飞去')]),
    line('逝ってはダメよ 逝ってはダメよ', 'itte wa dame yo itte wa dame yo', '一帖哇达咩哟 一帖哇达咩哟', '不可以离世，不可以离开', [w('逝ってはダメよ', 'itte wa dame yo', '一帖哇达咩哟', '不可以死去')]),
    line('楽園なんてどこにもないわ 最後は目蓋を閉じる時…', 'rakuen nante doko ni mo nai wa saigo wa mabuta o tojiru toki', '拉库诶南帖 多口尼摸乃哇 赛果哇 马布塔哦多几鲁多ki', '乐园哪里都不存在，最后是闭上双眼之时……', [w('楽園なんて', 'rakuen nante', '拉库诶南帖', '所谓乐园'), w('どこにもないわ', 'doko ni mo nai wa', '多口尼摸乃哇', '哪里都没有'), w('最後は', 'saigo wa', '赛果哇', '最后'), w('目蓋を閉じる時', 'mabuta o tojiru toki', '马布塔哦多几鲁多ki', '闭上眼睛之时')]),
    line('ごめんなんて 謝る私を許して… 幸せに堕ちてゆく', 'gomen nante ayamaru watashi o yurushite shiawase ni ochite yuku', '果面南帖 阿雅马鲁哇塔西哦 优鲁西帖 西阿哇塞尼哦七帖优库', '请原谅那个说着抱歉的我……我正坠入幸福', [w('ごめんなんて', 'gomen nante', '果面南帖', '说着对不起'), w('謝る私を', 'ayamaru watashi o', '阿雅马鲁哇塔西哦', '道歉的我'), w('許して', 'yurushite', '优鲁西帖', '请原谅'), w('幸せに堕ちてゆく', 'shiawase ni ochite yuku', '西阿哇塞尼哦七帖优库', '坠入幸福')]),
  ];

  const TIMES = [18.05, 22.49, 29.68, 34.23, 41.46, 53.10, 64.67, 70.58, 76.51, 82.27,
    105.90, 117.45, 129.34, 140.96, 146.77, 152.68, 158.45, 199.47, 211.07, 216.98,
    224.23, 230.03, 236.08, 241.86, 247.72, 253.57, 259.42, 265.26, 283.00];
  const rows = LINES.map((row, i) => ({ ...row, id: `l-${i + 1}`, start: TIMES[i] }));

  window.SONGS['daiji-na-mono-wa-mabuta-no-ura'] = {
    id: 'daiji-na-mono-wa-mabuta-no-ura',
    title: 'Daiji na Mono wa Mabuta no Ura',
    titleTh: '大事なものは目蓋の裏',
    titleCn: '重要之物在眼睑之后',
    artist: 'KOKIA',
    album: 'Remember me',
    youtubeId: 'fIO-JbLc1cY',
    timeline: true,
    synced: true,
    language: 'ja',
    sections: [
      { name: '第一段', nameEn: 'Part 1', lines: rows.slice(0, 10) },
      { name: '第二段', nameEn: 'Part 2', lines: rows.slice(10, 17) },
      { name: '间奏后', nameEn: 'After Interlude', lines: rows.slice(17, 20) },
      { name: '尾声', nameEn: 'Finale', lines: rows.slice(20) },
    ],
  };
})();
