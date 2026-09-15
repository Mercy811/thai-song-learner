/**
 * เพลงรักที่ยังไม่ลืม (Glitch) — Emi Thasorn / Ost. เงาใต้พระจันทร์ Moonshadow
 * 歌词与时间轴均来自 RISER MUSIC 官方 MV 的泰语字幕。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean });
  const line = (th, ro, cnRo, cn, words) => ({ th, ro, cnRo, cn, words, lang: 'th' });

  const V1 = [
    line('อยากจะลบคำว่ารักเธอออกจากใจ', 'yak cha lop kham wa rak thoe ok chak chai', '雅扎 洛 康哇拉特 奥加猜', '想把“爱你”这句话从心里抹去', [w('อยากจะลบ', 'yak cha lop', '雅扎洛', '想抹去'), w('คำว่ารักเธอ', 'kham wa rak thoe', '康哇拉特', '“爱你”这句话'), w('ออกจากใจ', 'ok chak chai', '奥加猜', '从心里出去')]),
    line('ไม่อยากต้องเสียใจถ้าวันไหน', 'mai yak tong siachai tha wan nai', '麦雅 东西呀猜 塔万乃', '不想在某一天不得不伤心', [w('ไม่อยากต้อง', 'mai yak tong', '麦雅东', '不想不得不'), w('เสียใจ', 'siachai', '西呀猜', '伤心'), w('ถ้าวันไหน', 'tha wan nai', '塔万乃', '如果有一天')]),
    line('ที่เธอนั้นหายไป', 'thi thoe nan hai pai', '替特南 海拜', '当你消失不见', [w('ที่เธอนั้น', 'thi thoe nan', '替特南', '当你'), w('หายไป', 'hai pai', '海拜', '消失')]),
    line('และทิ้งฉันไว้ลำพัง', 'lae thing chan wai lamphang', '莱听参 外蓝旁', '把我独自留下', [w('และ', 'lae', '莱', '并且'), w('ทิ้งฉันไว้', 'thing chan wai', '听参外', '把我留下'), w('ลำพัง', 'lamphang', '蓝旁', '独自一人')]),
    line('แต่วันนี้ดันเผลอใช้ใจไปกับเธอ', 'tae wan ni dan phloe chai chai pai kap thoe', '代万尼 丹泼 菜猜拜卡特', '可今天偏偏不小心对你动了心', [w('แต่วันนี้', 'tae wan ni', '代万尼', '但今天'), w('ดันเผลอ', 'dan phloe', '丹泼', '偏偏不小心'), w('ใช้ใจไปกับเธอ', 'chai chai pai kap thoe', '菜猜拜卡特', '对你付出了真心')]),
    line('ความรู้สึกที่ข้างในมันหวั่นไหว', 'khwam rusuek thi khang nai man wanwai', '宽如瑟 替康乃 曼弯歪', '内心的感觉开始动摇', [w('ความรู้สึก', 'khwam rusuek', '宽如瑟', '感觉'), w('ที่ข้างใน', 'thi khang nai', '替康乃', '在内心里'), w('มันหวั่นไหว', 'man wanwai', '曼弯歪', '它动摇、心动')]),
    line('เพราะทุกทีที่พบเธอ', 'phro thuk thi thi phop thoe', '泼秃替 替坡特', '因为每一次遇见你', [w('เพราะ', 'phro', '泼', '因为'), w('ทุกทีที่', 'thuk thi thi', '秃替替', '每一次'), w('พบเธอ', 'phop thoe', '坡特', '遇见你')]),
    line('ก็เหมือนฉันได้พบเจอกับรัก', 'ko muean chan dai phop choe kap rak', '郭闷参 戴坡哲 卡拉', '就像我终于遇见了爱情', [w('ก็เหมือน', 'ko muean', '郭闷', '就像'), w('ฉันได้พบเจอ', 'chan dai phop choe', '参戴坡哲', '我得以遇见'), w('กับรัก', 'kap rak', '卡拉', '爱情')]),
  ];

  const PRE = [
    line('แม้ว่าพยายามจะไม่รัก พยายามไม่รู้สึก', 'mae wa phayayam cha mai rak phayayam mai rusuek', '妹哇 帕雅央 扎麦拉 帕雅央 麦如瑟', '即使努力不去爱，努力不去感受', [w('แม้ว่า', 'mae wa', '妹哇', '即使'), w('พยายามจะไม่รัก', 'phayayam cha mai rak', '帕雅央扎麦拉', '努力不去爱'), w('พยายามไม่รู้สึก', 'phayayam mai rusuek', '帕雅央麦如瑟', '努力不去感受')]),
    line('สุดท้ายแพ้ใจมันสั่งให้รักเธอ', 'sutthai phae chai man sang hai rak thoe', '素泰 佩猜 曼桑海拉特', '最后还是输给了命令我爱你的心', [w('สุดท้าย', 'sutthai', '素泰', '最后'), w('แพ้ใจ', 'phae chai', '佩猜', '败给自己的心'), w('มันสั่งให้รักเธอ', 'man sang hai rak thoe', '曼桑海拉特', '它命令我爱你')]),
  ];

  const HOOK = [
    line('ทั้งหัวใจยังคิดถึงเธออย่างนี้', 'thang huachai yang khitthueng thoe yang ni', '汤华猜 央肯腾特 央尼', '整颗心依然这样想念你', [w('ทั้งหัวใจ', 'thang huachai', '汤华猜', '整颗心'), w('ยังคิดถึงเธอ', 'yang khitthueng thoe', '央肯腾特', '依然想念你'), w('อย่างนี้', 'yang ni', '央尼', '这样')]),
    line('เหมือนเธอคือเพลงรักที่ฉันยังฟังไม่ลืมสักที', 'muean thoe khue phleng rak thi chan yang fang mai luem sakthi', '闷特 科平拉 替参央方 麦冷萨替', '你好像一首我怎么听也忘不了的情歌', [w('เหมือนเธอคือ', 'muean thoe khue', '闷特科', '你好像是'), w('เพลงรัก', 'phleng rak', '平拉', '情歌'), w('ที่ฉันยังฟัง', 'thi chan yang fang', '替参央方', '我仍在听的'), w('ไม่ลืมสักที', 'mai luem sakthi', '麦冷萨替', '始终忘不了')]),
    line('ยังได้ยินแต่เสียงของเธอในทุกนาที', 'yang dai yin tae siang khong thoe nai thuk nathi', '央戴音 代香空特 乃秃纳替', '每一分钟仍只听见你的声音', [w('ยังได้ยิน', 'yang dai yin', '央戴音', '仍然听见'), w('แต่เสียงของเธอ', 'tae siang khong thoe', '代香空特', '只有你的声音'), w('ในทุกนาที', 'nai thuk nathi', '乃秃纳替', '在每一分钟')]),
    line('ภาพเธอไม่หายไป', 'phap thoe mai hai pai', '帕特 麦海拜', '你的身影从未消失', [w('ภาพเธอ', 'phap thoe', '帕特', '你的身影'), w('ไม่หายไป', 'mai hai pai', '麦海拜', '没有消失')]),
    line('ต่อให้พยายามลบเธอเท่าไร', 'to hai phayayam lop thoe thaorai', '多海 帕雅央洛特 套莱', '无论怎样努力把你抹去', [w('ต่อให้', 'to hai', '多海', '即使、无论'), w('พยายามลบเธอ', 'phayayam lop thoe', '帕雅央洛特', '努力把你抹去'), w('เท่าไร', 'thaorai', '套莱', '多少、怎样')]),
    line('เพราะหัวใจยังคิดถึงเธออย่างนี้', 'phro huachai yang khitthueng thoe yang ni', '泼华猜 央肯腾特 央尼', '因为这颗心依然这样想念你', [w('เพราะ', 'phro', '泼', '因为'), w('หัวใจ', 'huachai', '华猜', '心'), w('ยังคิดถึงเธอ', 'yang khitthueng thoe', '央肯腾特', '依然想念你'), w('อย่างนี้', 'yang ni', '央尼', '这样')]),
    line('เหมือนเธอคือเพลงรักที่ฉันยังฟังไม่ลืมสักที', 'muean thoe khue phleng rak thi chan yang fang mai luem sakthi', '闷特 科平拉 替参央方 麦冷萨替', '你好像一首我怎么听也忘不了的情歌', [w('เหมือนเธอคือ', 'muean thoe khue', '闷特科', '你好像是'), w('เพลงรัก', 'phleng rak', '平拉', '情歌'), w('ที่ฉันยังฟัง', 'thi chan yang fang', '替参央方', '我仍在听的'), w('ไม่ลืมสักที', 'mai luem sakthi', '麦冷萨替', '始终忘不了')]),
    line('มันยังวนซ้ำ ๆ ทุกท่วงทำนอง ไม่เคยจางหายไป', 'man yang won sam sam thuk thuang tham-nong mai khoei chang hai pai', '曼央温 萨姆萨姆 秃通塔农 麦科章海拜', '每一段旋律仍不断循环，从未淡去', [w('มันยังวนซ้ำ ๆ', 'man yang won sam sam', '曼央温萨姆萨姆', '它仍反复循环'), w('ทุกท่วงทำนอง', 'thuk thuang tham-nong', '秃通塔农', '每一段旋律'), w('ไม่เคยจางหายไป', 'mai khoei chang hai pai', '麦科章海拜', '从未淡去')]),
    line('อยากจะหนีให้ไกลเท่าไร', 'yak cha ni hai klai thaorai', '雅扎尼 海盖套莱', '无论多想逃得远远的', [w('อยากจะหนี', 'yak cha ni', '雅扎尼', '想逃走'), w('ให้ไกล', 'hai klai', '海盖', '去得很远'), w('เท่าไร', 'thaorai', '套莱', '多么、多少')]),
    line('แต่ว่าหัวใจมันรักเธอ', 'tae wa huachai man rak thoe', '代哇 华猜曼拉特', '可是这颗心爱着你', [w('แต่ว่า', 'tae wa', '代哇', '可是'), w('หัวใจ', 'huachai', '华猜', '心'), w('มันรักเธอ', 'man rak thoe', '曼拉特', '它爱着你')]),
  ];

  const V2 = [
    line('ก็ความรักอาจเป็นเรื่องของหัวใจ', 'ko khwam rak at pen rueang khong huachai', '郭宽拉 阿奔亮空华猜', '爱情或许本来就是心的事情', [w('ก็ความรัก', 'ko khwam rak', '郭宽拉', '爱情'), w('อาจเป็น', 'at pen', '阿奔', '也许是'), w('เรื่องของหัวใจ', 'rueang khong huachai', '亮空华猜', '心的事情')]),
    line('ต่อให้ฉันจะใช้สมองเท่าไร ไม่อาจฝืนได้เลย', 'to hai chan cha chai samong thaorai mai at fuen dai loei', '多海参 扎菜萨蒙套莱 麦阿芬戴类', '无论我怎样动脑，也完全无法违抗', [w('ต่อให้ฉัน', 'to hai chan', '多海参', '即使我'), w('จะใช้สมองเท่าไร', 'cha chai samong thaorai', '扎菜萨蒙套莱', '怎样用理智思考'), w('ไม่อาจฝืนได้เลย', 'mai at fuen dai loei', '麦阿芬戴类', '完全无法勉强违抗')]),
    line('อยากจะลบเธอแต่ทำไม่ได้', 'yak cha lop thoe tae tham mai dai', '雅扎洛特 代探麦戴', '想抹去你，却做不到', [w('อยากจะลบเธอ', 'yak cha lop thoe', '雅扎洛特', '想抹去你'), w('แต่ทำไม่ได้', 'tae tham mai dai', '代探麦戴', '但做不到')]),
  ];

  const TIMES = {
    v1: [7.66, 16.02, 21.294, 24.29, 29.41, 37.02, 42.01, 44.71],
    p1: [50.36, 56.63],
    c1: [63.60, 67.69, 73.01, 77.665, 80.67, 85.00, 89.00, 94.34, 101.71, 105.37],
    v2: [112.02, 117.35, 125.36],
    p2: [133.01, 139.27],
    c2: [143.66, 147.70, 153.00, 157.68, 160.68, 164.97, 169.00, 174.33, 181.67, 185.36],
    c3: [207.57, 211.70, 217.00, 221.672, 224.67, 228.94, 233.01, 238.35, 245.67, 249.35],
  };
  const withIds = (prefix, rows) => rows.map((row, i) => ({ ...row, id: `${prefix}-${i + 1}`, start: TIMES[prefix][i] }));

  window.SONGS['phleng-rak-thi-yang-mai-luem'] = {
    id: 'phleng-rak-thi-yang-mai-luem',
    title: 'Glitch',
    titleTh: 'เพลงรักที่ยังไม่ลืม',
    titleCn: '仍未忘记的情歌',
    artist: 'Emi Thasorn',
    album: 'Ost. เงาใต้พระจันทร์ Moonshadow',
    youtubeId: 'TNbvfhxCBtQ',
    timeline: true,
    synced: true,
    timesStyle: 'grouped',
    sections: [
      { name: '主歌 A', nameEn: 'Verse 1', lines: withIds('v1', V1) },
      { name: '预副歌', nameEn: 'Pre-chorus', lines: withIds('p1', PRE) },
      { name: '副歌', nameEn: 'Chorus 1', lines: withIds('c1', HOOK) },
      { name: '主歌 B', nameEn: 'Verse 2', lines: withIds('v2', V2) },
      { name: '预副歌', nameEn: 'Pre-chorus', lines: withIds('p2', PRE) },
      { name: '副歌', nameEn: 'Chorus 2', lines: withIds('c2', HOOK) },
      { name: '最终副歌', nameEn: 'Final Chorus', lines: withIds('c3', HOOK) },
    ],
  };
})();
