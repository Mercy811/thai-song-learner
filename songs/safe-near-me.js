/**
 * Safe Near Me (ที่ปลอดภัยใกล้ฉัน) — Lena Lalina / Ost. My Safe Zone
 *
 * 逐词数据来源：用户提供的《Safe_Zone_泰语逐句跟读_完整版.pdf》学习卡片
 *   th   = 泰文
 *   ro   = 罗马音（拼读）
 *   cn   = 中文谐音
 *   mean = 中文意思
 *
 * 时间轴说明：
 *   下面的 start 已经用原曲逐句校准过（synced: true），单位是秒。
 *   如果之后觉得某几句偏了，打开网页 → 右上角「⏱ 校准时间轴」重新标一遍，
 *   校准结果会存在浏览器里覆盖这里的值；点「导出」可以把新数字贴回来分享给别人。
 */
window.SONGS = window.SONGS || {};

window.SONGS['safe-near-me'] = {
  id: 'safe-near-me',
  title: 'Safe Near Me',
  titleTh: 'ที่ปลอดภัยใกล้ฉัน',
  titleCn: '你是我身边最安全的地方',
  artist: 'Lena Lalina',
  album: 'Ost. My Safe Zone',
  youtubeId: 'YuKjzwzTewI',

  // 时间轴是否已经用真实音频校准过
  synced: true,

  sections: [
    {
      name: '主歌 A',
      nameEn: 'Verse 1',
      lines: [
        {
          id: 'v1-1',
          lang: 'th',
          start: 15.34,
          th: 'อาจจะมีบางทีที่เผลอพลาดไป',
          ro: 'at cha mi bangthi thi phloe phlat pai',
          cn: '也许有时候会不小心犯错',
          words: [
            { th: 'อาจจะ', ro: 'at cha', cn: '啊扎', mean: '也许' },
            { th: 'มี', ro: 'mi', cn: '米', mean: '有' },
            { th: 'บางที', ro: 'bangthi', cn: '邦替', mean: '有时候' },
            { th: 'ที่เผลอพลาดไป', ro: 'thi phloe phlat pai', cn: '替拽拍拍', mean: '不小心犯错' },
          ],
        },
        {
          id: 'v1-2',
          lang: 'th',
          start: 18.6,
          th: 'ทำให้เธอรู้สึกว่าฉันหายไป',
          ro: 'thamhai thoe rusuek wa chan hai pai',
          cn: '让你觉得我消失了',
          words: [
            { th: 'ทำให้', ro: 'thamhai', cn: '探还', mean: '让' },
            { th: 'เธอ', ro: 'thoe', cn: '特', mean: '你' },
            { th: 'รู้สึกว่า', ro: 'rusuek wa', cn: '如涑哇', mean: '觉得' },
            { th: 'ฉันหายไป', ro: 'chan hai pai', cn: '禅还拍', mean: '我消失了' },
          ],
        },
        {
          id: 'v1-3',
          lang: 'th',
          start: 21.89,
          th: 'ทำเธอน้อยใจ ทำให้เธอเหงา',
          ro: 'tham thoe noichai thamhai thoe ngao',
          cn: '让你委屈，让你孤单',
          words: [
            { th: 'ทำเธอน้อยใจ', ro: 'tham thoe noichai', cn: '探特挪猜', mean: '让你难过委屈' },
            { th: 'ทำให้เธอเหงา', ro: 'thamhai thoe ngao', cn: '探还特熬', mean: '让你孤单' },
          ],
        },
      ],
    },

    {
      name: '主歌 B',
      nameEn: 'Verse 2',
      lines: [
        {
          id: 'v2-1',
          lang: 'th',
          start: 28.81,
          th: 'อยากจะบอกให้เธอได้รู้ความจริง',
          ro: 'ayak cha bok hai thoe dai ru khwam ching',
          cn: '想要让你知道真相',
          words: [
            { th: 'อยากจะ', ro: 'ayak cha', cn: '啊呀扎', mean: '想要' },
            { th: 'บอกให้เธอ', ro: 'bok hai thoe', cn: '波还特', mean: '告诉你' },
            { th: 'ได้รู้', ro: 'dai ru', cn: '呆如', mean: '能知道' },
            { th: 'ความจริง', ro: 'khwam ching', cn: '宽京', mean: '真相' },
          ],
        },
        {
          id: 'v2-2',
          lang: 'th',
          start: 31.77,
          th: 'ว่าที่ทำลงไปกับเธอทุกสิ่ง',
          ro: 'wathi tham long pai kap thoe thuk sing',
          cn: '就是我对你做的每一件事',
          words: [
            { th: 'ว่าที่', ro: 'wathi', cn: '哇替', mean: '就是' },
            { th: 'ทำลงไป', ro: 'tham long pai', cn: '探隆拍', mean: '做下去的' },
            { th: 'กับเธอ', ro: 'kap thoe', cn: '卡特', mean: '跟你' },
            { th: 'ทุกสิ่ง', ro: 'thuk sing', cn: '秃兴', mean: '每一件事' },
          ],
        },
        {
          id: 'v2-3',
          lang: 'th',
          start: 34.7,
          th: 'อาจจะไม่จริง ไม่ตรงกับใจฉันทุกอย่าง',
          ro: 'at cha mai ching mai trong kap chai chan thuk yang',
          cn: '也许都不是真的，并不完全符合我的心意',
          words: [
            { th: 'อาจจะไม่จริง', ro: 'at cha mai ching', cn: '啊扎埋京', mean: '也许不是真的' },
            { th: 'ไม่ตรงกับ', ro: 'mai trong kap', cn: '埋中卡', mean: '不符合' },
            { th: 'ใจฉัน', ro: 'chai chan', cn: '猜禅', mean: '我的心' },
            { th: 'ทุกอย่าง', ro: 'thuk yang', cn: '秃央', mean: '每一样' },
          ],
        },
      ],
    },

    {
      name: '过渡段',
      nameEn: 'Pre-chorus',
      lines: [
        {
          id: 'pc-1',
          lang: 'th',
          start: 41.47,
          th: 'อย่าโกรธ อย่าลงโทษฉัน',
          ro: 'aya krot aya longthot chan',
          cn: '别生气，别惩罚我',
          words: [
            { th: 'อย่าโกรธ', ro: 'aya krot', cn: '啊亚罗', mean: '别生气' },
            { th: 'อย่าลงโทษ', ro: 'aya longthot', cn: '啊亚隆透', mean: '别惩罚' },
            { th: 'ฉัน', ro: 'chan', cn: '禅', mean: '我' },
          ],
        },
        {
          id: 'pc-2',
          lang: 'th',
          start: 44.72,
          th: 'ด้วยท่าทางที่เฉยเมย',
          ro: 'duai thathang thi choeimei',
          cn: '用那种冷漠的态度',
          words: [
            { th: 'ด้วย', ro: 'duai', cn: '堆', mean: '用、以' },
            { th: 'ท่าทาง', ro: 'thathang', cn: '他堂', mean: '态度' },
            { th: 'ที่เฉยเมย', ro: 'thi choeimei', cn: '替拽妹', mean: '冷漠的' },
          ],
        },
        {
          id: 'pc-3',
          lang: 'th',
          start: 47.95,
          th: 'รู้แล้วว่าไม่ดีเลย อภัยได้ไหม',
          ro: 'ru laeo wa mai di loei aphai dai haimai',
          cn: '知道自己不好，可以原谅我吗',
          words: [
            { th: 'รู้แล้วว่า', ro: 'ru laeo wa', cn: '如廖哇', mean: '知道了' },
            { th: 'ไม่ดีเลย', ro: 'mai di loei', cn: '埋弟类', mean: '不好啦' },
            { th: 'อภัย', ro: 'aphai', cn: '啊拍', mean: '原谅' },
            { th: 'ได้ไหม', ro: 'dai haimai', cn: '呆还埋', mean: '可以吗' },
          ],
        },
      ],
    },

    {
      name: '副歌 1',
      nameEn: 'Chorus 1',
      lines: [
        {
          id: 'c1-1',
          lang: 'th',
          start: 54.37,
          th: 'ก็เพราะว่าเธอคือที่ปลอดภัยใกล้ฉัน',
          ro: 'ko phro wa thoe khue thi plotphai klai chan',
          cn: '因为你就是我身边最安全的地方',
          words: [
            { th: 'ก็เพราะว่า', ro: 'ko phro wa', cn: '戈坡哇', mean: '因为' },
            { th: 'เธอ', ro: 'thoe', cn: '特', mean: '你' },
            { th: 'คือ', ro: 'khue', cn: '科', mean: '是' },
            { th: 'ที่', ro: 'thi', cn: '替', mean: '的' },
            { th: 'ปลอดภัย', ro: 'plotphai', cn: '波拍', mean: '安全' },
            { th: 'ใกล้', ro: 'klai', cn: '盖', mean: '靠近' },
            { th: 'ฉัน', ro: 'chan', cn: '禅', mean: '我' },
          ],
        },
        {
          id: 'c1-2',
          lang: 'th',
          start: 57.54,
          th: 'ถ้าไม่มีเธอ ฉันจะอยู่ที่ไหน',
          ro: 'tha mai mi thoe chan cha yu thi nai',
          cn: '如果没有你，我该在哪里',
          words: [
            { th: 'ถ้าไม่มี', ro: 'tha mai mi', cn: '他埋米', mean: '如果没有' },
            { th: 'เธอ', ro: 'thoe', cn: '特', mean: '你' },
            { th: 'ฉันจะอยู่', ro: 'chan cha yu', cn: '禅杂优', mean: '我会在' },
            { th: 'ที่ไหน', ro: 'thi nai', cn: '替奈', mean: '哪里' },
          ],
        },
        {
          id: 'c1-3',
          lang: 'th',
          start: 61.49,
          th: 'เธอคือ Save zone',
          ro: 'thoe khue save zone',
          cn: '你就是我的 Safe zone',
          words: [
            { th: 'เธอ', ro: 'thoe', cn: '特', mean: '你' },
            { th: 'คือ', ro: 'khue', cn: '科', mean: '是' },
            { th: 'Save zone', ro: 'save zone', cn: '（英语直接读）', mean: 'Save zone', lang: 'en' },
          ],
        },
        {
          id: 'c1-4',
          lang: 'th',
          start: 62.9,
          th: 'ไม่อยาก Alone',
          ro: 'mai ayak alone',
          cn: '不想孤单',
          words: [
            { th: 'ไม่อยาก', ro: 'mai ayak', cn: '埋啊呀', mean: '不想' },
            { th: 'Alone', ro: 'alone', cn: '（英语）', mean: '孤单', lang: 'en' },
          ],
        },
        {
          id: 'c1-5',
          lang: 'th',
          start: 64.91,
          th: 'เรากลับมาเป็นเหมือนเดิมได้ไหม',
          ro: 'rao klap ma pen muean doem dai haimai',
          cn: '我们可以回到从前吗',
          words: [
            { th: 'เรากลับมาเป็น', ro: 'rao klap ma pen', cn: '绕卡普妈喷', mean: '我们回来变成' },
            { th: 'เหมือนเดิม', ro: 'muean doem', cn: '棉登', mean: '像以前' },
            { th: 'ได้ไหม', ro: 'dai haimai', cn: '呆还埋', mean: '可以吗' },
          ],
        },
      ],
    },

    {
      name: '副歌 2',
      nameEn: 'Chorus 2',
      lines: [
        {
          id: 'c2-1',
          lang: 'th',
          start: 68.41,
          th: 'เพราะว่าเธอคือที่ห่วงใยใกล้ฉัน',
          ro: 'phro wa thoe khue thi huangyai klai chan',
          cn: '因为你就是我身边那份牵挂',
          words: [
            { th: 'เพราะว่า', ro: 'phro wa', cn: '坡哇', mean: '因为' },
            { th: 'เธอ', ro: 'thoe', cn: '特', mean: '你' },
            { th: 'คือ', ro: 'khue', cn: '科', mean: '是' },
            { th: 'ที่ห่วงใย', ro: 'thi huangyai', cn: '替环牙', mean: '关心的' },
            { th: 'ใกล้ฉัน', ro: 'klai chan', cn: '盖禅', mean: '靠近我' },
          ],
        },
        {
          id: 'c2-2',
          lang: 'th',
          start: 71.73,
          th: 'Location ที่ฉันปักหมุดใจเอาไว้',
          ro: 'location thi chan pak mut chai ao wai',
          cn: '是我把心钉住的那个位置',
          words: [
            { th: 'Location', ro: 'location', cn: '（英语）', mean: '位置', lang: 'en' },
            { th: 'ที่ฉัน', ro: 'thi chan', cn: '替禅', mean: '我的' },
            { th: 'ปักหมุด', ro: 'pak mut', cn: '帕木', mean: '标记、钉住' },
            { th: 'ใจเอาไว้', ro: 'chai ao wai', cn: '猜凹歪', mean: '放在心里' },
          ],
        },
        {
          id: 'c2-3',
          lang: 'th',
          start: 75.94,
          th: 'สัญญาเลยว่า จากนี้ไป',
          ro: 'sanya loei wa chak ni pai',
          cn: '我发誓，从今以后',
          words: [
            { th: 'สัญญาเลย', ro: 'sanya loei', cn: '散雅类', mean: '发誓' },
            { th: 'ว่า', ro: 'wa', cn: '哇', mean: '说' },
            { th: 'จากนี้ไป', ro: 'chak ni pai', cn: '扎妮拍', mean: '从今以后' },
          ],
        },
        {
          id: 'c2-4',
          lang: 'th',
          start: 79.23,
          th: 'จะอยู่แต่ในพื้นที่หัวใจของเธอ',
          ro: 'cha yu tae nai phuenthi huachai khong thoe',
          cn: '只待在你心里的这片区域',
          words: [
            { th: 'จะอยู่แต่', ro: 'cha yu tae', cn: '杂优代', mean: '只会在' },
            { th: 'ในพื้นที่', ro: 'nai phuenthi', cn: '乃喷替', mean: '在这片区域' },
            { th: 'หัวใจ', ro: 'huachai', cn: '华猜', mean: '心' },
            { th: 'ของเธอ', ro: 'khong thoe', cn: '空特', mean: '你的' },
          ],
        },
      ],
    },

    {
      name: '英文桥段',
      nameEn: 'Bridge',
      note: '这一段基本是英语，只有第 5 句是泰语',
      lines: [
        {
          id: 'br-1', lang: 'en', start: 96.9,
          th: 'You can trust me', ro: '', cn: '你可以相信我', words: [],
        },
        {
          id: 'br-2', lang: 'en', start: 98.58,
          th: 'Please you can trust me', ro: '', cn: '求你相信我', words: [],
        },
        {
          id: 'br-3', lang: 'en', start: 99.32,
          th: 'Let me touch ur body', ro: '', cn: '让我触碰你', words: [],
        },
        {
          id: 'br-4', lang: 'en', start: 100.55,
          th: 'Look in my eyes', ro: '', cn: '看着我的眼睛', words: [],
        },
        {
          id: 'br-5',
          lang: 'th',
          start: 102.31,
          th: 'ฉันจะอยู่ตรงนี้',
          ro: 'chan cha yu trong ni',
          cn: '我会在这里',
          words: [
            { th: 'ฉัน', ro: 'chan', cn: '禅', mean: '我' },
            { th: 'จะ', ro: 'cha', cn: '杂', mean: '会' },
            { th: 'อยู่', ro: 'yu', cn: '优', mean: '在' },
            { th: 'ตรงนี้', ro: 'trong ni', cn: '中妮', mean: '这里' },
          ],
        },
        {
          id: 'br-6', lang: 'en', start: 103.61,
          th: 'Come on stay with me', ro: '', cn: '留下来陪着我', words: [],
        },
        {
          id: 'br-7', lang: 'en', start: 105.4,
          th: "You won't be lonely", ro: '', cn: '你不会孤单', words: [],
        },
        {
          id: 'br-8', lang: 'en', start: 107.11,
          th: 'Come on Baby Cause you save me', ro: '', cn: '因为你拯救了我', words: [],
        },
      ],
    },
  ],
};
