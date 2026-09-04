/**
 * มากกว่าที่รัก (More Than Words) — Emi Thasorn / Ost. Us รักของเรา
 * 歌词来自 GMMTV RECORDS 官方 MV 简介；时间轴来自官方泰语字幕。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean) => ({ th, ro, cn, mean });
  const line = (th, ro, cnRo, cn, words) => ({ th, ro, cnRo, cn, words });

  const V1 = [
    line('รู้สึกเหมือนกันใช่ไหม', 'rusuek muean kan chai mai', '如瑟 闷甘 菜埋', '你也有同样的感觉，对吗？', [w('รู้สึก', 'rusuek', '如瑟', '感觉'), w('เหมือนกัน', 'muean kan', '闷甘', '同样'), w('ใช่ไหม', 'chai mai', '菜埋', '对吗')]),
    line('ทุกช่วงเวลาที่ผ่านไป', 'thuk chuang wela thi phan pai', '突 创威拉 提潘拜', '每一段流逝的时光', [w('ทุก', 'thuk', '突', '每一'), w('ช่วงเวลา', 'chuang wela', '创威拉', '一段时间'), w('ที่ผ่านไป', 'thi phan pai', '提潘拜', '流逝的')]),
    line('สำหรับฉันมันถูกใช้ให้เพียงแค่เธอ', 'samrap chan man thuk chai hai phiang khae thoe', '三拉参 曼图菜 海平凯特', '对我而言，都只为你而度过', [w('สำหรับฉัน', 'samrap chan', '三拉参', '对我而言'), w('มันถูกใช้', 'man thuk chai', '曼图菜', '它被用来'), w('ให้เพียงแค่เธอ', 'hai phiang khae thoe', '海平凯特', '只给你')]),
    line('ตั้งแต่วันที่เราได้พบ', 'tangtae wan thi rao dai phop', '当代 万提劳 戴坡', '从我们相遇的那天起', [w('ตั้งแต่', 'tangtae', '当代', '从'), w('วันที่', 'wan thi', '万提', '那一天'), w('เราได้พบ', 'rao dai phop', '劳戴坡', '我们相遇')]),
    line('ก็ได้รู้ว่าความคิดถึงมันเป็นอย่างไร', 'ko dai ru wa khwam khitthueng man pen yangrai', '郭戴如哇 宽肯腾 曼奔央莱', '我才知道思念是什么滋味', [w('ก็ได้รู้ว่า', 'ko dai ru wa', '郭戴如哇', '才知道'), w('ความคิดถึง', 'khwam khitthueng', '宽肯腾', '思念'), w('มันเป็นอย่างไร', 'man pen yangrai', '曼奔央莱', '是什么样')]),
    line('เข้าใจคำว่ารักเพราะในวันนี้ฉันมีเธอ', 'khaochai kham wa rak phro nai wan ni chan mi thoe', '靠斋 康哇拉 泼乃万尼 参米特', '因为今天有你，我才懂得“爱”这个字', [w('เข้าใจ', 'khaochai', '靠斋', '理解'), w('คำว่ารัก', 'kham wa rak', '康哇拉', '“爱”这个词'), w('เพราะในวันนี้', 'phro nai wan ni', '泼乃万尼', '因为今天'), w('ฉันมีเธอ', 'chan mi thoe', '参米特', '我有你')]),
  ];

  const PRE = [
    line('และมันไม่ใช่เรื่องบังเอิญ', 'lae man mai chai rueang bang-oen', '莱曼埋菜 亮邦恩', '而这并不是偶然', [w('และมัน', 'lae man', '莱曼', '而这'), w('ไม่ใช่', 'mai chai', '埋菜', '不是'), w('เรื่องบังเอิญ', 'rueang bang-oen', '亮邦恩', '偶然的事')]),
    line('ที่ใครจะมาแทนความหมายของคำว่ารัก', 'thi khrai cha ma thaen khwam mai khong kham wa rak', '提开 扎玛滩 宽麦空康哇拉', '不是任何人都能替代“爱”的含义', [w('ที่ใครจะมาแทน', 'thi khrai cha ma thaen', '提开扎玛滩', '谁能来取代'), w('ความหมาย', 'khwam mai', '宽麦', '含义'), w('ของคำว่ารัก', 'khong kham wa rak', '空康哇拉', '“爱”这个词的')]),
    line('แต่มันต้องเป็นเธอเท่านั้น', 'tae man tong pen thoe thaonan', '代曼东奔特 套难', '那个人只能是你', [w('แต่มันต้องเป็น', 'tae man tong pen', '代曼东奔', '但必须是'), w('เธอ', 'thoe', '特', '你'), w('เท่านั้น', 'thaonan', '套难', '只有、仅仅')]),
  ];

  const HOOK = [
    line('มันมากกว่าคำว่าที่รัก', 'man mak kwa kham wa thirak', '曼玛瓜 康哇提拉', '它比一句“亲爱的”更多', [w('มันมากกว่า', 'man mak kwa', '曼玛瓜', '它超过'), w('คำว่า', 'kham wa', '康哇', '这个词'), w('ที่รัก', 'thirak', '提拉', '亲爱的')]),
    line('ที่ฉันยกให้เธอน่ะที่รัก', 'thi chan yok hai thoe na thirak', '提参哟海特纳 提拉', '我把它献给你，亲爱的', [w('ที่ฉันยกให้เธอ', 'thi chan yok hai thoe', '提参哟海特', '我献给你的'), w('น่ะ', 'na', '纳', '语气词'), w('ที่รัก', 'thirak', '提拉', '亲爱的')]),
    line('แค่เราได้เจอ เพียงได้สบตาก็รู้ว่าคำนี้', 'khae rao dai choe phiang dai sopta ko ru wa kham ni', '凯劳戴哲 平戴梭达 郭如哇康尼', '只要我们相遇、四目相接，就知道这个词', [w('แค่เราได้เจอ', 'khae rao dai choe', '凯劳戴哲', '只要我们相遇'), w('เพียงได้สบตา', 'phiang dai sopta', '平戴梭达', '只要四目相接'), w('ก็รู้ว่า', 'ko ru wa', '郭如哇', '就知道'), w('คำนี้', 'kham ni', '康尼', '这个词')]),
    line('ยังเป็นของฉันและเธอเสมอ', 'yang pen khong chan lae thoe samoe', '央奔空参 莱特萨么', '永远都属于我和你', [w('ยังเป็น', 'yang pen', '央奔', '仍然是'), w('ของฉันและเธอ', 'khong chan lae thoe', '空参莱特', '属于我和你'), w('เสมอ', 'samoe', '萨么', '永远、一向')]),
    line('ที่รัก ทุกครั้งที่ได้ยินคำว่ารัก', 'thirak thuk khrang thi dai yin kham wa rak', '提拉 突康提戴音 康哇拉', '亲爱的，每次听见“爱”这个字', [w('ที่รัก', 'thirak', '提拉', '亲爱的'), w('ทุกครั้งที่ได้ยิน', 'thuk khrang thi dai yin', '突康提戴音', '每次听见'), w('คำว่ารัก', 'kham wa rak', '康哇拉', '“爱”这个词')]),
    line('ในใจมันนึกถึงเพียงแค่เธอ', 'nai chai man nuek thueng phiang khae thoe', '乃斋曼尼腾 平凯特', '心里想到的只有你', [w('ในใจ', 'nai chai', '乃斋', '在心里'), w('มันนึกถึง', 'man nuek thueng', '曼尼腾', '会想起'), w('เพียงแค่เธอ', 'phiang khae thoe', '平凯特', '只有你')]),
    line('อยากให้รู้เอาไว้ว่า', 'yak hai ru ao wai wa', '雅海如 奥外哇', '想让你知道', [w('อยากให้', 'yak hai', '雅海', '想让'), w('รู้เอาไว้ว่า', 'ru ao wai wa', '如奥外哇', '记住、知道')]),
    line('อ้อมกอดนี้เป็นของเธอนะที่รัก', 'omkot ni pen khong thoe na thirak', '奥郭尼奔空特纳 提拉', '这个拥抱属于你，亲爱的', [w('อ้อมกอดนี้', 'omkot ni', '奥郭尼', '这个拥抱'), w('เป็นของเธอ', 'pen khong thoe', '奔空特', '属于你'), w('นะที่รัก', 'na thirak', '纳提拉', '亲爱的')]),
  ];

  const V2 = [
    line('เมื่อไหร่ที่มองบนฟ้า', 'muearai thi mong bon fa', '么莱提芒 奔发', '每当仰望天空', [w('เมื่อไหร่', 'muearai', '么莱', '什么时候、每当'), w('ที่มอง', 'thi mong', '提芒', '看'), w('บนฟ้า', 'bon fa', '奔发', '天空上')]),
    line('รู้ไหมฉันไม่เคยกลัว', 'ru mai chan mai khoei klua', '如埋 参埋科瓜', '你知道吗，我从未害怕', [w('รู้ไหม', 'ru mai', '如埋', '你知道吗'), w('ฉันไม่เคย', 'chan mai khoei', '参埋科', '我从未'), w('กลัว', 'klua', '瓜', '害怕')]),
    line('เพราะไม่ว่ากี่วันคืนเปลี่ยนผัน', 'phro mai wa ki wan khuen plian phan', '泼埋哇 给万困 变潘', '因为无论多少日夜变迁', [w('เพราะไม่ว่า', 'phro mai wa', '泼埋哇', '因为无论'), w('กี่วันคืน', 'ki wan khuen', '给万困', '多少日夜'), w('เปลี่ยนผัน', 'plian phan', '变潘', '变迁')]),
    line('จะยังมีเธออยู่ข้างฉัน', 'cha yang mi thoe yu khang chan', '扎央米特 尤康参', '你仍会在我身边', [w('จะยังมีเธอ', 'cha yang mi thoe', '扎央米特', '仍会有你'), w('อยู่ข้างฉัน', 'yu khang chan', '尤康参', '在我身边')]),
  ];

  const BRIDGE = [
    line('ที่รัก', 'thirak', '提拉', '亲爱的', [w('ที่รัก', 'thirak', '提拉', '亲爱的')]),
    line('คำนี้ให้เพียงแค่เธอ', 'kham ni hai phiang khae thoe', '康尼海 平凯特', '这个词只给你', [w('คำนี้', 'kham ni', '康尼', '这个词'), w('ให้เพียงแค่เธอ', 'hai phiang khae thoe', '海平凯特', '只给你')]),
    line('ยังเป็นของฉันและเธอเสมอ', 'yang pen khong chan lae thoe samoe', '央奔空参 莱特萨么', '永远都属于我和你', [w('ยังเป็น', 'yang pen', '央奔', '仍然是'), w('ของฉันและเธอ', 'khong chan lae thoe', '空参莱特', '属于我和你'), w('เสมอ', 'samoe', '萨么', '永远')]),
  ];

  const TIMES = {
    v1: [18.12, 21.56, 24.98, 32.04, 35.48, 42.02],
    p1: [46.40, 49.58, 55.48],
    c1: [59.22, 61.78, 65.48, 70.68, 74.16, 79.18, 83.64, 85.32],
    v2: [102.04, 105.02, 108.32, 111.94],
    p2: [115.80, 119.14, 125.06],
    c2: [128.80, 131.36, 134.96, 140.26, 143.70, 148.74, 153.30, 154.98],
    b1: [160.58, 162.64, 167.82],
    c3: [184.42, 186.98, 190.60, 195.94, 199.38, 204.40, 208.94, 210.58],
    o1: [236.72, 238.44],
  };
  const withIds = (prefix, rows) => rows.map((row, i) => ({ ...row, id: `${prefix}-${i + 1}`, start: TIMES[prefix][i] }));

  window.SONGS['more-than-words'] = {
    id: 'more-than-words',
    title: 'More Than Words',
    titleTh: 'มากกว่าที่รัก',
    titleCn: '不只是亲爱的',
    artist: 'Emi Thasorn',
    album: 'Ost. Us รักของเรา',
    youtubeId: 'ID_pd9Ni3nk',
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
      { name: '桥段', nameEn: 'Bridge', lines: withIds('b1', BRIDGE) },
      { name: '副歌', nameEn: 'Final Chorus', lines: withIds('c3', HOOK) },
      { name: '尾声', nameEn: 'Outro', lines: withIds('o1', HOOK.slice(6)) },
    ],
  };
})();
