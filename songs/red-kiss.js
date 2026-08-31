/**
 * Red Kiss — EMIBONNIE
 * 歌词来自 RISER MUSIC 官方 MV 的 YouTube 简介。
 * 时间轴以官方英文字幕时间戳为主，并用分离人声后的 Whisper 识别交叉校验。
 */
window.SONGS = window.SONGS || {};

(() => {
  const w = (th, ro, cn, mean, lang) => (lang ? { th, ro, cn, mean, lang } : { th, ro, cn, mean });
  const line = (th, ro, cnRo, cn, words, lang) => (lang
    ? { th, ro, cnRo, cn, words, lang }
    : { th, ro, cnRo, cn, words });

  const V1 = [
    line('ที่เธอสัมผัส กันในคืนนี้', 'thi thoe samphat kan nai khuen ni', '替特桑帕 甘乃苦恩妮', '今晚你这样触碰我', [
      w('ที่เธอสัมผัส', 'thi thoe samphat', '替特桑帕', '你触碰的时候'),
      w('กัน', 'kan', '甘', '彼此、我'),
      w('ในคืนนี้', 'nai khuen ni', '乃苦恩妮', '在今晚'),
    ]),
    line('ทำให้รู้สึก มากขึ้นทุกที', 'thamhai rusuek mak khuen thukthi', '探还如涑 马康秃吐替', '让我的感觉一次比一次强烈', [
      w('ทำให้รู้สึก', 'thamhai rusuek', '探还如涑', '让我感觉到'),
      w('มากขึ้น', 'mak khuen', '马康秃', '更多、更强烈'),
      w('ทุกที', 'thukthi', '吐替', '每一次'),
    ]),
    line('ยิ่งเธอใกล้กัน จนได้ยิน Heartbeat', 'ying thoe klai kan chon dai yin Heartbeat', '英特格莱甘 中呆引 Heartbeat', '你越靠近，近到我能听见心跳', [
      w('ยิ่งเธอใกล้กัน', 'ying thoe klai kan', '英特格莱甘', '你越靠近'),
      w('จนได้ยิน', 'chon dai yin', '中呆引', '直到能听见'),
      w('Heartbeat', 'Heartbeat', 'Heartbeat', '心跳', 'en'),
    ]),
    line('มันทำให้ทั้งหัวใจฉันเต้นถี่', 'man thamhai thang huachai chan ten thi', '曼探还汤华猜禅典替', '让我整颗心都快速跳动', [
      w('มันทำให้', 'man thamhai', '曼探还', '它让'),
      w('ทั้งหัวใจฉัน', 'thang huachai chan', '汤华猜禅', '我整颗心'),
      w('เต้นถี่', 'ten thi', '典替', '跳得很快很密'),
    ]),
  ];

  const PRE = [
    line('You tell me ห้ามไม่ให้ฉันจูบ', 'You tell me ham mai hai chan chup', 'You tell me 哈埋还禅朱', '你告诉我，不许我吻你', [
      w('You tell me', 'You tell me', 'You tell me', '你告诉我', 'en'),
      w('ห้ามไม่ให้', 'ham mai hai', '哈埋还', '禁止、不许'),
      w('ฉันจูบ', 'chan chup', '禅朱', '我吻你'),
    ]),
    line('กลัวว่าใจ dangerous', 'klua wa chai dangerous', '刮哇猜 dangerous', '怕这颗心会陷入危险', [
      w('กลัวว่า', 'klua wa', '刮哇', '害怕会'),
      w('ใจ', 'chai', '猜', '心'),
      w('dangerous', 'dangerous', 'dangerous', '危险的', 'en'),
    ]),
    line('ยิ่งห้ามยิ่งเหมือนยิ่งสั่งให้ lose control', 'ying ham ying muean ying sang hai lose control', '英哈英闷英桑还 lose control', '越是禁止，越像在命令我失去控制', [
      w('ยิ่งห้าม', 'ying ham', '英哈', '越是禁止'),
      w('ยิ่งเหมือน', 'ying muean', '英闷', '越像是'),
      w('ยิ่งสั่งให้', 'ying sang hai', '英桑还', '越是命令我'),
      w('lose control', 'lose control', 'lose control', '失去控制', 'en'),
    ]),
  ];

  const HOOK = [
    line('ให้ทุกจังหวะของเธอกับฉัน', 'hai thuk changwa khong thoe kap chan', '还秃将哇空特噶禅', '让你和我的每个节拍', [w('ให้ทุกจังหวะ', 'hai thuk changwa', '还秃将哇', '让每个节拍'), w('ของเธอกับฉัน', 'khong thoe kap chan', '空特噶禅', '属于你和我')]),
    line('นั้นไปพร้อมกัน ให้ใจได้เคลื่อนไหว', 'nan pai phrom kan hai chai dai khlueanwai', '难拍彭甘 还猜呆克伦怀', '同步前行，让心自由跳动', [w('นั้นไปพร้อมกัน', 'nan pai phrom kan', '难拍彭甘', '那就一起同步'), w('ให้ใจได้เคลื่อนไหว', 'hai chai dai khlueanwai', '还猜呆克伦怀', '让心得以跳动')]),
    line('เข้าใกล้เท่าไหร่ Don’t kiss ไม่ไหว', 'khao klai thaorai Don’t kiss mai wai', '靠格莱涛来 Don’t kiss 埋怀', '靠得越近，越无法忍住不吻你', [w('เข้าใกล้เท่าไหร่', 'khao klai thaorai', '靠格莱涛来', '靠得越近'), w('Don’t kiss', 'Don’t kiss', 'Don’t kiss', '不去吻', 'en'), w('ไม่ไหว', 'mai wai', '埋怀', '无法忍受')]),
    line('แค่ทำตามหัวใจ ก็พอ My Red Kiss', 'khae tham tam huachai ko pho My Red Kiss', '客探达姆华猜 戈坡 My Red Kiss', '只要跟随内心就好，我的 Red Kiss', [w('แค่ทำตามหัวใจ', 'khae tham tam huachai', '客探达姆华猜', '只要跟随内心'), w('ก็พอ', 'ko pho', '戈坡', '就足够了'), w('My Red Kiss', 'My Red Kiss', 'My Red Kiss', '我的红吻', 'en')]),
    line('ให้เป็นจังหวะของเธอกับฉัน', 'hai pen changwa khong thoe kap chan', '还喷将哇空特噶禅', '让这成为你和我的节拍', [w('ให้เป็นจังหวะ', 'hai pen changwa', '还喷将哇', '让它成为节拍'), w('ของเธอกับฉัน', 'khong thoe kap chan', '空特噶禅', '属于你和我')]),
    line('Ohh (Red Red Red Red)', 'Ohh (Red Red Red Red)', 'Ohh (Red Red Red Red)', '哦（Red Red Red Red）', [w('Ohh', 'Ohh', 'Ohh', '感叹声', 'en'), w('(Red Red Red Red)', 'Red Red Red Red', 'Red Red Red Red', '红、炽热的', 'en')], 'en'),
    line('ยิ่งใกล้เท่าไหร่ Don’t kiss ไม่ไหว', 'ying klai thaorai Don’t kiss mai wai', '英格莱涛来 Don’t kiss 埋怀', '越靠近，越无法忍住不吻你', [w('ยิ่งใกล้เท่าไหร่', 'ying klai thaorai', '英格莱涛来', '越靠近'), w('Don’t kiss', 'Don’t kiss', 'Don’t kiss', '不去吻', 'en'), w('ไม่ไหว', 'mai wai', '埋怀', '无法忍受')]),
    line('แค่ทำตามหัวใจ ก็พอ My Red Kiss', 'khae tham tam huachai ko pho My Red Kiss', '客探达姆华猜 戈坡 My Red Kiss', '只要跟随内心就好，我的 Red Kiss', [w('แค่ทำตามหัวใจ', 'khae tham tam huachai', '客探达姆华猜', '只要跟随内心'), w('ก็พอ', 'ko pho', '戈坡', '就足够了'), w('My Red Kiss', 'My Red Kiss', 'My Red Kiss', '我的红吻', 'en')]),
    line('Red Kiss me right now right now', 'Red Kiss me right now right now', 'Red Kiss me right now right now', '现在就给我一个 Red Kiss', [w('Red Kiss me', 'Red Kiss me', 'Red Kiss me', '给我一个红吻', 'en'), w('right now right now', 'right now right now', 'right now right now', '就是现在', 'en')], 'en'),
    line('Red Kiss me right now', 'Red Kiss me right now', 'Red Kiss me right now', '现在就吻我', [w('Red Kiss me', 'Red Kiss me', 'Red Kiss me', '给我一个红吻', 'en'), w('right now', 'right now', 'right now', '现在', 'en')], 'en'),
  ];

  const V2 = [
    line('จะเป็น One night, two nights, last night, tonight', 'cha pen One night, two nights, last night, tonight', '扎喷 One night, two nights, last night, tonight', '不管是一晚、两晚、最后一晚还是今晚', [w('จะเป็น', 'cha pen', '扎喷', '将会是'), w('One night, two nights, last night, tonight', 'One night, two nights, last night, tonight', 'One night, two nights, last night, tonight', '一晚、两晚、最后一晚、今晚', 'en')]),
    line('จะยังไงก็ไม่ติด Gonna do this right', 'cha yang ngai ko mai tit Gonna do this right', '扎养艾戈埋滴 Gonna do this right', '怎样我都不介意，我会把这件事做对', [w('จะยังไงก็ไม่ติด', 'cha yang ngai ko mai tit', '扎养艾戈埋滴', '无论如何都不介意'), w('Gonna do this right', 'Gonna do this right', 'Gonna do this right', '会把这件事做对', 'en')]),
    line('ถ้ามันห้ามไม่ไหว เข้ามาเลยได้ไหม', 'tha man ham mai wai khaoma loei dai mai', '塔曼哈埋怀 靠马类呆埋', '如果实在忍不住，可以直接靠近我吗', [w('ถ้ามันห้ามไม่ไหว', 'tha man ham mai wai', '塔曼哈埋怀', '如果实在禁止不了'), w('เข้ามาเลยได้ไหม', 'khaoma loei dai mai', '靠马类呆埋', '可以直接进来吗')]),
    line('Try my kiss ท่ามกลางไฟค่ำคืนนี้ขอแค่เธอกับฉัน', 'Try my kiss thamklang fai khamkhuen ni kho khae thoe kap chan', 'Try my kiss 探格郎发堪苦恩妮 扣客特噶禅', '试试我的吻，今晚灯火中只要你和我', [w('Try my kiss', 'Try my kiss', 'Try my kiss', '试试我的吻', 'en'), w('ท่ามกลางไฟค่ำคืนนี้', 'thamklang fai khamkhuen ni', '探格郎发堪苦恩妮', '在今晚的灯火之中'), w('ขอแค่เธอกับฉัน', 'kho khae thoe kap chan', '扣客特噶禅', '只求有你和我')]),
    line('You can take your time', 'You can take your time', 'You can take your time', '你可以慢慢来', [w('You can take your time', 'You can take your time', 'You can take your time', '你可以慢慢来', 'en')], 'en'),
    line('แลกรักที่มีแค่เรา แค่เราที่รู้กัน', 'laek rak thi mi khae rao khae rao thi ru kan', '莱拉替米客劳 客劳替如甘', '交换只属于我们、只有我们知道的爱', [w('แลกรัก', 'laek rak', '莱拉', '交换爱意'), w('ที่มีแค่เรา', 'thi mi khae rao', '替米客劳', '只属于我们的'), w('แค่เราที่รู้กัน', 'khae rao thi ru kan', '客劳替如甘', '只有我们彼此知道')]),
  ];

  const TIMES = {
    v1: [7.12, 11.20, 15.52, 19.40],
    p1: [23.38, 26.20, 28.30],
    c1: [32.20, 37.00, 41.00, 45.50, 49.00, 56.00, 57.50, 61.00, 71.50, 79.70],
    v2: [81.60, 84.00, 86.00, 89.00, 93.90, 95.00],
    p2: [97.80, 99.20, 101.20],
    c2: [106.10, 111.00, 114.20, 118.60, 122.10, 129.00, 130.00, 134.90, 144.60, 152.60],
    c3: [171.00, 176.00, 179.30, 183.00, 187.00, 194.00, 195.00, 200.00, 209.00, 217.80],
  };

  const withIds = (prefix, rows) => rows.map((row, i) => ({ ...row, id: `${prefix}-${i + 1}`, start: TIMES[prefix][i] }));

  window.SONGS['red-kiss'] = {
    id: 'red-kiss',
    title: 'Red Kiss',
    titleTh: 'Red Kiss',
    titleCn: '红吻',
    artist: 'EMIBONNIE',
    album: 'Red Kiss - Single',
    youtubeId: 'jad-V_nyvaY',
    timeline: true,
    synced: true,
    timesStyle: 'grouped',
    sections: [
      { name: '主歌 A', nameEn: 'Verse 1', lines: withIds('v1', V1) },
      { name: '预副歌', nameEn: 'Pre-chorus', lines: withIds('p1', PRE) },
      { name: '副歌', nameEn: 'Hook', lines: withIds('c1', HOOK) },
      { name: '主歌 B', nameEn: 'Verse 2', lines: withIds('v2', V2) },
      { name: '预副歌', nameEn: 'Pre-chorus', lines: withIds('p2', PRE) },
      { name: '副歌', nameEn: 'Hook', lines: withIds('c2', HOOK) },
      { name: '副歌', nameEn: 'Final Hook', lines: withIds('c3', HOOK) },
    ],
  };
})();
