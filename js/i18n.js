/** Lightweight, dependency-free UI internationalisation. */
window.I18n = (() => {
  'use strict';

  const STORAGE_KEY = 'tsl.language';
  const supported = ['zh', 'en'];
  const saved = localStorage.getItem(STORAGE_KEY);
  const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  let language = supported.includes(saved) ? saved : (/^zh(?:-|$)/i.test(browserLanguage) ? 'zh' : 'en');

  const en = {
    '导航': 'Navigation', '站内导航': 'Site navigation', '关闭导航': 'Close navigation', '🎵 泰语歌学习': '🎵 Learn Thai with Songs',
    '唱歌练习': 'Song practice', '选一首歌，跟着练发音、学歌词': 'Choose a song to practise pronunciation and learn the lyrics',
    '词频总表': 'Vocabulary frequency', '全部歌曲的单词，按出现次数排序': 'Words from every song, ranked by frequency',
    '记忆课': 'Memory lessons', '7 节课，把常见词串成故事讲一遍，能听着学': 'Seven audio lessons that connect common words into memorable stories',
    '覆盖率曲线': 'Coverage curve', '学多少词能看懂多少歌词？一点小科普': 'How many words do you need to understand the lyrics?',
    '首页': 'Home', '回首页看所有歌': 'Back to all songs', '固定': 'Pin', '固定住这一栏，往下滑也不消失': 'Keep this bar visible while scrolling',
    '泰语歌逐句跟读': 'Thai Songs, Line by Line', '开始学习 →': 'Start learning →',
    '跟着喜欢的歌，听懂泰语': 'Understand Thai through songs you love',
    '逐句、逐词拆解泰语歌词 —— 泰文 + 罗马音 + 中文谐音 + 中文意思，点一个词就能听发音。挑一首歌，五分钟就能带走一句真正会唱的泰语。': 'Explore Thai lyrics line by line and word by word, with Thai script, romanization, English meanings, and tap-to-hear pronunciation. Choose a song and learn a line you can truly sing in five minutes.',
    '搜索歌名 / 歌手…': 'Search songs or artists…', '▶ 挑一首开始': '▶ Choose a song', '选一首歌开始': 'Choose a song to begin',
    '没有找到想学的歌？告诉我你想唱什么、想了解什么，或留下任何反馈。': 'Can’t find the song you want? Tell me what you’d like to sing or learn, or share any feedback.',
    '例如：我想学《歌名》；可以增加……吗？': 'For example: I’d love to learn [song title]. Could you add…?',
    '你的邮箱（选填，方便我回复）': 'Your email (optional, so I can reply)', '发送给我 →': 'Send to me →',
    '提交后，你的留言会通过邮件发送给网站作者。': 'Your message will be emailed to the site creator.', '正在发送…': 'Sending…',
    '已发送，谢谢你的留言！': 'Sent — thank you for your message!', '没能发送。请稍后再试，或发邮件到 xinyiye811@gmail.com。': 'Couldn’t send. Please try again later or email xinyiye811@gmail.com.',
    '没找到匹配的歌，换个关键词试试。': 'No matching songs. Try another search.', '上次在学': 'Continue',
    '练习模式': 'Practice mode', '练习 + KTV': 'Practice + KTV', '正在学': 'Learning now', '逐句逐词、发音跟读': 'Lyrics, vocabulary, and pronunciation', 'KTV 模式': 'KTV mode',
    '沉浸式跟唱，弹幕互动': 'Immersive sing-along with live comments', '单词测验': 'Vocabulary quiz', '四选一 + 双人对战': 'Multiple choice and two-player battle',
    '高频词串成故事讲一遍': 'Learn frequent words through stories', '从最常见的词学起': 'Start with the most frequent words', '学多少词能看懂多少': 'See how vocabulary unlocks lyrics',
    '📊 词频总表': '📊 Vocabulary Frequency',
    '全部歌曲的逐词卡片摊平去重，按出现次数从高到低排——从最常见的词学起，覆盖面最快': 'Every Thai word from every song, deduplicated and ranked by frequency. Start with the words that unlock the most lyrics.',
    '个不重复的词 · 来自 ': 'unique words · from ', ' 首歌': ' songs', '总出现 ': 'Total occurrences: ', ' 次 · 从最常见的词学起，覆盖面最快': ' · Learn the most useful words first',
    '📋 复制词表': '📋 Copy vocabulary', '已记住 ': 'Remembered ', '搜索泰语 / 罗马音 / 意思…': 'Search Thai, romanization, or meaning…',
    '出现最多在前': 'Most frequent first', '出现最少在前': 'Least frequent first', '泰语字母序': 'Thai alphabetical order', '状态': 'Status',
    '全部歌曲': 'All songs', '已记住': 'Remembered', '没记住': 'Not remembered', '记住': 'Remember', '记住了': 'Remembered', '标记这个词记住了没': 'Toggle remembered',
    '这份表把库里所有歌的逐词卡片按泰语文本去重、按出现次数排好——副歌重复几遍就算几次出现。点泰语听发音，点歌名跳去那首歌。': 'This table deduplicates Thai words across the whole library and ranks them by frequency. Repeated choruses count as repeated occurrences. Tap Thai to hear it, or a song title to open that song.',
    '🎓 记忆课': '🎓 Memory Lessons',
    '库里反复出现的词，按主题串成 7 节课的小故事——先认几个「基础词」，再看它们怎么拼成歌词里那些长句子。每节课都能整节朗读，洗澡、走路、开车的时候用耳朵学': 'Frequently recurring words are grouped into seven themed audio lessons. Learn a few building blocks, then see how they combine into longer lyric phrases.',
    '← 回课程列表': '← All lessons', '🎯 测验 / ⚔️ 对战': '🎯 Quiz / ⚔️ Battle', '标记为已学完': 'Mark complete', '▶ 朗读整节课': '▶ Play full lesson',
    '⏹ 停止': '⏹ Stop', '停止朗读，回到这节课开头': 'Stop playback and return to the beginning', '朗读范围': 'Playback range',
    '只读没学过的': 'Not learned only', '只读已学过的': 'Learned only', '语速 ': 'Speed ',
    '这 7 节课只挑了库里反复出现的词，一次性只出现过的长句留给「词频总表」和每首歌的「单词」模式当参考——那边搜得到、这边讲故事。': 'These seven lessons focus on recurring words. One-off phrases remain available in Vocabulary Frequency and each song’s Words mode.',
    '📈 词频覆盖率曲线': '📈 Vocabulary Coverage Curve',
    '这张图叫「累积覆盖率曲线」——学多少个高频词，能看懂库里歌词的百分之多少？鼠标移到曲线上任意一点都能看数字': 'This cumulative coverage curve shows how much of the lyric library you can understand as you learn high-frequency words. Hover anywhere on the curve for exact values.',
    '学习进度 → 内容覆盖率': 'Learning progress → Content coverage', '移动鼠标查看任意一点': 'Hover to inspect any point',
    '累计覆盖率（学到第 N 个高频词为止）': 'Cumulative coverage after learning the top N words', '为什么长这样，不是正态分布': 'Why this is a long-tail curve, not a normal distribution',
    '正态分布是「中间多两头少」的钟形；这条曲线不是钟形，是': 'A normal distribution is bell-shaped, with most values in the middle. This curve instead has a ',
    '前段陡、后段平的长尾曲线': 'steep beginning and a flat long tail',
    '因为泰语（和大部分语言一样）的用词频率服从': ' because Thai, like most languages, follows ',
    '齐夫定律（Zipf\'s Law）': 'Zipf’s law',
    '少数几个词（你、我、是、和这类虚词/代词）反复出现，绝大多数词只出现一两次就再没见过。': 'A small number of words—pronouns and function words such as you, I, is, and and—appear repeatedly, while most words appear only once or twice.',
    '按出现次数分层的完整表格': 'Full table grouped by occurrence count', '出现次数 ≥': 'Occurrences ≥', '学到这里，累计词数': 'Cumulative words', '占词表': 'Share of vocabulary', '累计覆盖率': 'Cumulative coverage',
    '选歌': 'Songs', '换一首歌': 'Choose a song', '练习': 'Practice', '练习模式：逐句逐词、发音、录音': 'Practice: lyrics, words, pronunciation and recording',
    '单词': 'Words', '单词模式：单词表 + 四选一测验': 'Words: vocabulary list and quiz', '发音': 'Voice', '发音设置': 'Voice settings',
    '校准': 'Sync', '校准歌词时间轴': 'Sync lyric timing', '切换深浅色': 'Toggle light/dark theme', '语言': 'Language',
    '显示：': 'Show:', '罗马音': 'Romanization', '中文谐音': 'Chinese phonetics', '中文意思': 'Meaning', '逐词卡片': 'Word cards',
    '🎸 尤克里里和弦': '🎸 Ukulele chords', '朗读语速 ': 'Speech speed ', '原曲速度': 'Song speed', '画面': 'Video',
    '只要声音': 'Audio only', '小窗': 'Small', '大窗': 'Large', '单句循环': 'Loop line', '歌词自动跟随': 'Auto-scroll lyrics',
    '上一句': 'Previous line', '下一句': 'Next line', '播放 / 暂停 (空格)': 'Play / pause (Space)',
    '📖 练习': '📖 Practice', '🃏 单词': '🃏 Words', '🎵 选歌': '🎵 Songs', '⏱ 校准': '⏱ Sync', '🔁 单句循环': '🔁 Loop line', '📍 自动跟随': '📍 Auto-scroll',
    '整句': 'Line', '原曲': 'Song', '循环': 'Loop', '跟读': 'Record', '掌握': 'Mastered', '已掌握': 'Mastered',
    '🔊 整句': '🔊 Line', '▶ 原曲': '▶ Song', '🔁 循环': '🔁 Loop', '🎙 跟读': '🎙 Record', '○ 掌握': '○ Master', '✓ 已掌握': '✓ Mastered',
    '个词已掌握 · 整体进度 ': 'words mastered · Overall progress ', '测验正确率 ': 'Quiz accuracy ', '还没开始测验': 'Not started yet',
    '🎯 开始测验': '🎯 Start quiz', '▶ 按顺序学习': '▶ Learn in song order', '⚔️ 双人对战': '⚔️ Two-player battle', '📋 复制单词表': '📋 Copy vocabulary', '↺ 重置进度': '↺ Reset progress',
    '今日学习': 'TODAY', '用 2 分钟，复习 6 个词': 'Review 6 words in 2 minutes', '学完下一句歌词': 'Complete the next lyric line', '根据已学歌词和掌握程度智能复习': 'Adaptive practice from completed lyric lines', '开始今日任务': 'Start today’s lesson',
    '今天已打卡，明天继续！': 'Today complete — see you tomorrow!', '再练一轮': 'Practice again',
    '🔥 今日任务完成，打卡成功': '🔥 Daily lesson complete', '游客': 'Guest', '账户': 'Account',
    '每天一点，泰语慢慢变熟': 'A little Thai, every day', '完成今日任务 →': 'Complete today’s lesson →',
    '今天再练一轮 →': 'Practice once more →', '连续打卡天数': 'Day streak', '今年已打卡': 'Days this year',
    '今天学习时间': 'Today’s study time', '今天还没打卡，花两分钟点亮它吧。': 'Two minutes will light up today’s square.',
    '今天还没完成，完成今日任务即可打卡。': 'Not complete yet. Finish today’s lesson to check in.',
    '已完成': 'Completed', '未完成': 'Not completed', '少': 'Less', '多': 'More', '过去一年的每日学习记录': 'Daily learning activity for the past year',
    '排序': 'Sort', '歌词顺序': 'Song order', '最不熟的在前': 'Weakest first', '出现最多的在前': 'Most frequent first',
    '只看': 'Filter', '全部': 'All', '还没掌握': 'Not mastered', '还没学过': 'New', '答错过的': 'Answered incorrectly', '遮住意思（自测）': 'Hide meanings (self-test)',
    '← 单词表': '← Vocabulary', '它是什么意思？': 'What does it mean?', '下一个 →': 'Next →', '再听一遍': 'Listen again', '🔊 听发音': '🔊 Listen',
    '提示': 'Hint', '💡 提示': '💡 Hint', '收起提示': 'Hide hint', '显示歌词意思': 'Show lyric meaning', '隐藏歌词意思': 'Hide lyric meaning',
    '歌词闯关': 'Lyric journey', '按时间顺序，一句一句学': 'Learn each lyric line in song order',
    '句子模式 · 把刚学过的词排成歌词': 'Sentence mode · Arrange the words you just learned', '🔊 听整句': '🔊 Hear the full line',
    '你的答案': 'Your answer', '可选单词': 'Word bank', '点击下面的词，组成完整歌词': 'Tap the words below to build the lyric line',
    '重新排列': 'Reset', '检查答案': 'Check answer', '先把所有词放进句子里': 'Place every word in the sentence first',
    '顺序还不对，再试一次。提示：可以点击上面的词撤回。': 'Not quite in order yet. Tap a word above to move it back and try again.',
    '继续下一句 →': 'Continue →', '组装这句话 →': 'Build this line →', '下一个词 →': 'Next word →',
    '学习下一句': 'Learn the next line', '看单词表': 'View vocabulary', '练习': 'Practice',
    '查看练习结果 →': 'View practice results →', '智能练习完成': 'Adaptive practice complete', '这轮需要加强的词': 'Words to strengthen', '这轮全部答对了 🎉': 'Perfect round 🎉',
    '先按顺序学完至少一句歌词，再来练习': 'Complete at least one lyric line in order before practising',
    '出题自动读一遍': 'Read each question aloud', '泰语声音': 'Thai voice', '🔊 试听「สวัสดี」': '🔊 Test “สวัสดี”', '🔊 试听第一句歌词': '🔊 Test the first lyric',
    '没有声音 / 发音不对怎么办？': 'No sound or incorrect pronunciation?', '歌词时间轴还没校准': 'Lyric timing has not been synced',
    '这台设备还没装泰语发音': 'Thai speech is not installed on this device', '下一句要标的是': 'Next line to mark',
    '🔊 先听听这句怎么念': '🔊 Hear this line first', '按这里 / 空格  →  标记这一句': 'Click here / Space  →  Mark this line',
    '↩ 退一句': '↩ Previous line', '重新开始': 'Start over', '✓ 保存时间轴': '✓ Save timing', '导出给别人用': 'Export for others',
    '导出时间轴': 'Export timing', '复制': 'Copy', '关闭': 'Close', '取消': 'Cancel', '保存': 'Save', '开始': 'Start',
    '主歌 A': 'Verse 1', '主歌 B': 'Verse 2', '预副歌': 'Pre-chorus', '副歌': 'Chorus', '桥段': 'Bridge', '尾声': 'Outro', '间奏': 'Instrumental',
    '英语': 'English', '泰语': 'Thai', '不支持': 'Not supported', '加载中…': 'Loading…', '加载中...': 'Loading...',
    '登录': 'Log in', '注册': 'Sign up', '退出登录': 'Log out', '邮箱': 'Email', '密码': 'Password', '或': 'or',
    '用 Google 账号登录': 'Continue with Google', '还没有账号？点这里注册': 'New here? Create an account', '已经有账号？点这里登录': 'Already have an account? Log in',
    '登录后，单词掌握程度会存到你的账号里，换设备登录也能接着学；不登录一样能用，进度只存在这台设备。': 'Log in to sync vocabulary progress across devices. You can also continue as a guest; progress will stay on this device.',
  };

  // Learning content uses Chinese as its source data. Keeping the English
  // meanings here lets every consumer (lyrics, word lists, quizzes and charts)
  // share one translation instead of carrying separate copies.
  Object.assign(en, {
    '🏠 首页': '🏠 Home', '📌 固定': '📌 Pin', '已收录': 'Library:', '首歌 ·': 'songs ·', '个泰语词 · 练习 / KTV / 单词测验三种模式': 'Thai words · Practice / KTV / Quiz',
    '个不重复的词 · 来自': 'unique words · from', '首歌': 'songs', '总出现': 'Total occurrences', '次 · 从最常见的词学起，覆盖面最快': '· Start with the most useful words', '个 ·': 'words ·',
    '语速': 'Speed', '朗读语速': 'Speech speed', '⚠️ 这台设备还没装泰语发音': '⚠️ Thai speech is not installed on this device',
    '🔥 连续': '🔥 Streak:', '天': 'days', '⏱ 今天': '⏱ Today', '个词已掌握 · 整体进度': 'words mastered · Overall progress', '测验正确率': 'Quiz accuracy',
    '← 返回这节课': '← Back to lesson', '第': 'Question', '题': '', '连对': 'Streak',
    '⚔️ 双人对战 · 抢答': '⚔️ Two-player Battle', '一道题出来，': 'Each question is open to ', '两个人同时抢': 'both players',
    '—— 谁先答对当场加一分，抢错的这道题就没份了。': '—the first correct answer earns a point. A wrong answer locks that player out for the question.',
    '开局各拍一张照片挂在记分牌上，比分一直在屏幕最上面。': 'Take one photo per player before the match; both stay on the scoreboard throughout.',
    '玩家 1 · 坐左边': 'Player 1 · Sit on the left', '玩家 2 · 坐右边': 'Player 2 · Sit on the right', '题数': 'Questions',
    '📷 用手势抢答': '📷 Answer with hand gestures', '没开': 'Off', '开摄像头': 'Enable camera', '玩家 1': 'Player 1', '玩家 2': 'Player 2',
    '一道题': 'Each question is open to ', '，先答对的当场': '; the first correct answer gets ', '分': 'point',
    '抢错就出局': 'A wrong answer locks you out', '：这道题剩下的时间只剩另一个人能答 —— 手快之前先想清楚': '; only the other player can answer for the rest of that question.',
    '手势：': 'Gestures: ', '比几根手指就是第几个选项': 'the number of raised fingers selects that answer', '（食指到小指，拇指不算）。': ' (index through little finger; thumbs do not count).',
    '左半边画面算玩家 1、右半边算玩家 2': 'The left half of the camera is Player 1; the right half is Player 2.',
    '键盘随时能用：玩家 1': 'Keyboard controls are always available: Player 1', '，玩家 2': '; Player 2',
    '答完一题，两个人': 'After each question, both players ', '一起比 ✊': 'make a fist ✊ together', '（或者按两下': ' (or press ', '空格': 'Space', '）进下一题': ' twice) for the next question.',
    '每题 20 秒，都没抢对就没人得分，直接公布答案': 'Each question lasts 20 seconds. If nobody answers correctly, no point is awarded and the answer is shown.',
    '照片和画面只在这台电脑的内存里，': 'Photos and video remain only in this device’s memory; they are ', '不上传也不存盘': 'never uploaded or saved', '，退出就没了': ' and disappear when you exit.',
    '对战': 'Battle mode ', '不改动': 'does not change ', '单词表里的掌握程度，朋友来玩不会搅乱你的进度': 'your vocabulary mastery, so playing with a friend will not affect your progress.',
    '⚔️ 开始对战': '⚔️ Start battle', '📸 先各拍一张': '📸 Take player photos', '两个人一起坐进画面 ——': 'Sit together in the frame—Player 1 on the ',
    '左边': 'left', '的是玩家 1，': ', Player 2 on the ', '右边': 'right', '的是玩家 2。': '.', '拍下来的这张整局都挂在记分牌上。': 'These photos will remain on the scoreboard for the whole match.',
    '浏览器不让直接写剪贴板，自己全选复制一下（已经帮你选中了）：': 'Your browser blocked clipboard access. The text is selected—copy it manually:', '关掉': 'Close',
    '逐词释义来自你自己的学习卡片 · 原曲由 YouTube 播放 · 发音使用设备内置语音合成': 'Word meanings come from the learning cards · Songs play through YouTube · Pronunciation uses your device’s built-in speech synthesis',
    '快捷键：': 'Shortcuts:', '播放/暂停 ·': 'Play/pause ·', '上/下一句': 'Previous/next line', '朗读当前句': 'Read current line',
    '✕ 退出': '✕ Exit', '🎸 和弦': '🎸 Chords', '🀄 中文': '🀄 Chinese phonetics', '发送': 'Send', '🎵 选一首歌': '🎵 Choose a song',
    '想加歌：照着': 'To add a song, copy an existing file in ', '里现成的文件复制一份，填好逐句逐词的内容，': ', fill in the line and word data, ',
    '再在': 'then add a ', '底部加一行': ' script import at the bottom of ', '引入，它就会出现在这个列表里。': '. It will appear in this list automatically.',
    '只想练歌词、不想标时间轴的话，把': 'For lyrics-only practice without timing, set ', '写成': ' to ', '就行。': '.',
    '⏱ 校准歌词时间轴': '⏱ Sync lyric timing', '原曲会从头播放。': 'The song will play from the beginning. ',
    '每一句唱到开头的那一瞬间，按一下空格（或点下面的大按钮）': 'At the instant each line begins, press Space (or the large button below).',
    '就把这句的时间点记下来了。按错了可以「退一句」重来。标完点「保存时间轴」。': 'That records the line’s timestamp. Use Previous line if you make a mistake, then save when finished.',
    '标累了可以中途保存，下次再点「⏱ 校准」会从没标的那一句接着标，不用从头来。': 'You can save partway through and continue from the first unmarked line next time.',
    '按这里 / 空格  →  标记这一句': 'Click here / Space → Mark this line',
    '把下面这段复制，按开头那行注释说的贴回': 'Copy the text below into this song’s file under ', '里这首歌的文件，': ' as described in the first comment. ',
    '提交上去之后，所有打开这个网站的人就都是校准好的时间轴了。': 'Once committed, everyone who opens the site will use the synced timing.',
    '跟着喜欢的歌，': 'Understand Thai ', '听懂': 'through ', '泰语': 'songs you love', '逐句': 'Line by Line', '泰语歌': 'Thai Songs', '跟读': 'Practice',
    '已收录 ': '', ' 个泰语词 · 练习 / KTV / 单词测验三种模式': ' Thai words · Practice / KTV / Quiz',
    '一': 'Mon', '三': 'Wed', '五': 'Fri', '0 秒': '0 sec',
    '我': 'I / me', '你': 'you', '我们': 'we / us', '你的': 'your', '我的': 'my', '它': 'it', '谁、任何人': 'who / anyone',
    '是': 'to be / is', '有': 'to have / there is', '在': 'at / in', '的': 'of / that', '说': 'say', '跟你': 'with you', '来自我': 'from me',
    '心': 'heart', '我的心': 'my heart', '心里的': 'in the heart', '心里': 'in my heart', '放在心里': 'keep in the heart',
    '知道': 'know', '知道了': 'now I know', '能知道': 'get to know', '觉得': 'feel / think', '真相': 'the truth', '每一天': 'every day',
    '爱': 'love', '喜欢': 'like', '因为': 'because', '因为你': 'because of you', '因为你就是': 'because you are', '我喜欢': 'I like',
    '喜欢自己': 'like myself', '我喜欢自己': 'I like myself', '也喜欢你': 'and I like you', '不喜欢': 'do not like',
    '待着': 'stay', '靠近': 'near / close', '靠近我': 'close to me', '这里': 'here', '哪里': 'where', '位置': 'location',
    '有时候': 'sometimes', '也许': 'maybe', '从今以后': 'from now on', '像以前': 'as before', '每一件事': 'everything', '每一样': 'everything',
    '不想': 'do not want to', '想要': 'want to', '会': 'will / can', '只要你': 'as long as I have you', '如果没有': 'without / if there is no',
    '孤单': 'alone / lonely', '不想孤单': 'do not want to be alone', '安全': 'safe', '别生气': 'do not be angry', '别惩罚': 'do not punish me',
    '原谅': 'forgive', '可以吗': 'can you?', '发誓': 'promise', '关心的': 'caring', '冷漠的': 'indifferent', '态度': 'attitude',
    '让': 'make / let', '告诉你': 'tell you', '做下去的': 'what I did', '用、以': 'with / by', '就是': 'is / means', '只会在': 'will stay only in',
    '标记、钉住': 'pin / mark', '每一天我都害怕得不得了': 'Every day I am terrified',
    '也许有时候会不小心犯错': 'Maybe sometimes I make mistakes without meaning to',
    '让你觉得我消失了': 'Making you feel as if I disappeared', '让你委屈，让你孤单': 'Making you feel hurt and lonely',
    '想要让你知道真相': 'I want you to know the truth', '想告诉你，我之所以那样做': 'I want to tell you why I did those things',
    '也许都不是真的，并不完全符合我的心意': 'Maybe none of it was true or matched what was in my heart',
    '别生气，别惩罚我': 'Please do not be angry or punish me', '知道自己不好，可以原谅我吗': 'I know I was wrong. Can you forgive me?',
    '你就是我的 Safe zone': 'You are my safe zone', '你是我身边最安全的地方': 'You are the safest place beside me',
    '因为你就是我身边最安全的地方': 'Because you are the safest place beside me', '如果没有你，我该在哪里': 'Without you, where would I be?',
    '我会在这里': 'I will be right here', '我们可以回到从前吗': 'Can we go back to how we were?',
    '因为你就是我身边那份牵挂': 'Because you are the one beside me who truly cares', '我发誓，从今以后': 'I promise that from now on',
    '只待在你心里的这片区域': 'I will stay only in this space in your heart', '是我把心钉住的那个位置': 'It is the place where I pinned my heart',
    '我会在': 'I will stay', '不小心犯错': 'make a mistake accidentally', '让你孤单': 'make you lonely', '不符合': 'does not match',
    '也许不是真的': 'may not be true', '用那种冷漠的态度': 'with that indifferent attitude', '在这片区域': 'in this area',
    '可不可以留下来，让我爱得长长久久': 'Could you stay and let me love you for a long, long time?',
    '愿能长长久久爱着你': 'May I keep loving you for a long, long time', '向成百上千颗星星许愿祈求': 'I make a wish upon hundreds and thousands of stars',
    '希望你能成为我最后的爱，可以吗': 'Could you be my last love?', '只要今天能爱、能有这份牵绊': 'As long as we can love and share this bond today',
    '剩下的人生会怎样，我也不知道': 'I do not know what the rest of life will bring', '只要我们彼此拥有，就没关系': 'As long as we have each other, everything will be okay',
    '可不可以就这样长长久久地在一起': 'Could we stay together like this for a long, long time?', '就这样长长久久地在一起吧': 'Let us stay together like this for a long, long time',
    '「永远」这种事真的存在吗': 'Does “forever” really exist?', '我在心里祈祷，希望这是真的': 'In my heart I pray that it is real',
    '每天都做着一样的事情': 'Doing the same things every day', '日子就这样一天天混着过': 'Letting one ordinary day drift into the next',
    '没有什么目标，什么都没有': 'No goal, nothing at all', '也没有什么美好的日子': 'No especially beautiful days either',
    '直到今天，你走进了我的生活': 'Until today, when you walked into my life', '你让我明白了': 'You made me understand',
    '懂得了从来不曾明白的事': 'I learned what I had never understood before', '这颗小小的心，只要懂得了爱': 'Once this little heart learned how to love',
    '就已经好过它自己想要的了': 'It became better than it ever imagined', '为了你，我什么都做得到': 'For you, I can do anything',
    '只要看见你是开心的': 'As long as I can see you happy', '能看见你的梦成真，那该有多好': 'How wonderful it would be to see your dreams come true',
    '能有你陪着我一起走': 'To have you walking beside me', '我答应会照顾你到最后一天': 'I promise to care for you until the final day',
    '无论是哪一天都一样': 'No matter which day it is', '一直待在这里，紧紧挨着你': 'I will stay right here, close beside you',
    '因为你就是我的幸福': 'Because you are my happiness', '求你相信我': 'Please believe me', '你可以相信我': 'You can trust me',
    '你不会孤单': 'You will not be alone', '害怕有一天你会突然消失': 'Afraid that one day you might suddenly disappear',
    '喜欢跟你在一起时的自己': 'I like who I am when I am with you', '我喜欢跟你在一起时的自己': 'I like myself when I am with you',
    '喜欢我们在一起的时光': 'I love the time we spend together', '我喜欢我们在一起的时光': 'I love our time together',
    '也喜欢跟我在一起时的你': 'And I like who you are when you are with me', '好像我变成了一个比原来更好的人': 'It feels like I have become a better person',
    '原来我能是个多好的人': 'I never knew I could be such a good person', '喜欢自己终于能够爱你这件事': 'I love that I am finally able to love you',
    '但是越见到你，越让我的心跳得又快又急': 'But the more I see you, the faster my heart races',
    '想假装不理你，但心却怦怦直跳个不停': 'I try to ignore you, but my heart will not stop pounding',
    '嘴上说别靠近，你却从来没走开过': 'I tell you not to come close, yet you never leave',
    '可你越把我推开，我越想把你拉近': 'The more you push me away, the more I want to pull you close',
    '你的眼神早就出卖你了，你自己心里清楚': 'Your eyes gave you away long ago, and you know it',
    '不管怎么藏表情都藏不住': 'No expression can hide it', '装作一副没事的样子，消息却还是照回': 'You act unaffected, yet still reply to every message',
    '你翻着白眼，却还是哪儿都没去': 'You roll your eyes, but you still do not go anywhere',
    '反正我们本来就互相不喜欢': 'After all, we supposedly dislike each other', '可每一个晚上还是待在一起': 'Yet we still spend every night together',
    '还是什么见不得光的暧昧，不是爱只是各取所需（哈哈）': 'Or is this a secret arrangement—not love, just mutual benefit? (Ha ha)',
    '酒啊，我恨你吗？': 'Oh, do I hate you?', '你到底讨厌我哪一点，我根本不知道': 'What exactly do you dislike about me? I have no idea',
    '这一面只演给我一个人看': 'You show this side only to me', '老实说，我是真的不太想承认啦，你懂的': 'Honestly, I really do not want to admit it—you know',
    '这种感觉到底是不是爱，是真的还是骗人的': 'Is this feeling love? Is it real or a lie?',
    '于是就得再测试一次，才知道我是爱你的': 'So I have to test it once more before I know that I love you',
    '不想说出爱，啦啦啦，爱你': 'I do not want to say love—la la la—I love you', '不需要有谁能理解': 'No one needs to understand',
    '不用让任何人知道': 'No one else needs to know', '但是我我我我，是的——因为它输给了心里的声音': 'But I, I, I—yes—because I lost to the voice in my heart',
    '但是你你你，就是因为你，偏偏闯进来让我坠入了爱河': 'But you, you, you—because you barged in and made me fall in love',
    '如果你知道了，那我们干脆相爱好不好': 'If you already know, why do we not just fall in love?',
    '心命令我爱你': 'My heart commands me to love you', '是心命令我爱你（歌名就是这句）': 'My heart commands me to love you',
    '它命令我必须爱你，还要这样掏心掏肺地付出': 'It commands me to love you and give you my whole heart',
    '它命令我一直为你做下去': 'It commands me to keep doing this for you', '是爱在指使我这么做': 'Love is what drives me to do this',
    '是因为我心甘情愿为你': 'Because I willingly do it for you', '没办法违抗心的命令': 'I cannot disobey my heart', '没办法停下心的命令': 'I cannot stop my heart’s command',
    '喜欢跟你在一起时我的样子': 'I like who I am when I am with you', '你，当你走进了我的生活': 'You—when you walked into my life',
    '你让一个没有心的人': 'You took someone who had no heart', '变成了一个懂得爱人的人': 'and turned me into someone who knows how to love',
    '也不知道这到底是真是假': 'I do not know whether any of this is real', '你～（不想说……）': 'You… (I do not want to say it…)',
    '你～': 'You…', '你～（但我是……）': 'You… (but I am…)',
    '想假装看不见、假装没感觉（其实早就有感觉了）': 'I try to look away and pretend I feel nothing (though I already do)',
    '说一句「求你恨我吧」': 'Say, “Please hate me”', '越是不许，就越……': 'The more it is forbidden, the more I…',
    '越想再往你身边靠一点': 'want to move a little closer to you', '我们说好「这是最后一次」': 'We agreed that “this is the last time”',
    '想一直守着': 'I want to stay by your side', '照顾你、牵挂你': 'to care for you and look after you',
    '这样对我这颗心来说就足够了': 'That alone is enough for my heart', '把它收下': 'Take it',
    '这份好意': 'this kindness', '而我自己': 'And as for me', '也硬撑不住了': 'I cannot keep holding on either',
    '我知道自己有多幸运': 'I know how lucky I am', '牵着我的手，静静地听我说': 'Hold my hand and quietly listen to me',
    '在我失望的日子里，你也不曾走开': 'Even on my darkest days, you never walked away',
    '只是想留住每一段时光、每一秒': 'I just want to hold on to every moment and every second',
    '拥有你这个人陪在身边的时光': 'the time I have you here beside me',
    '而且会一直爱你，爱到再也爱不了别人': 'And I will keep loving you until I can love no one else',
    '就是我对你做的每一件事': 'It is everything I do for you',
    '面对自己心里的那份真心': 'Facing the truth in my own heart', '曾经脾气急躁的人、曾经心肠不好的人': 'Someone once impatient and unkind',
    '有时候脾气急躁，有时候心肠不好': 'Sometimes impatient, sometimes unkind', '是一个没什么特别好的人': 'I was not a particularly good person',
    '是个普普通通的人': 'Just an ordinary person', '有些事真的很不像样': 'Some things I did were truly awful',
    '但是我我我我，是的——因为它输给了心里的声音': 'But I, I, I—yes—because I lost to the voice inside my heart',
    '安全区': 'safe zone', '一定': 'definitely', '必须': 'must', '从来不': 'never', '没有': 'none / does not have', '每一次': 'every time',
    '故意骗人': 'lie deliberately', '突然离开': 'leave suddenly', '慢慢忘记': 'slowly forget', '被': 'be (passive)', '给': 'give / to', '跟': 'with',
    '他': 'he / him', '希望': 'hope', '我回来了': 'I came back', '你消失了': 'you disappeared', '我累了': 'I am tired',
    '让你生气': 'make you angry', '让你担心': 'make you worry', '让你难过委屈': 'make you sad and hurt', '让你等太久': 'make you wait too long', '让你害怕': 'frighten you',
    '大笑': 'laugh', '叹气': 'sigh', '哭出声': 'cry aloud', '可以': 'can / may', '问你': 'ask you', '答应你': 'promise you', '听你说': 'listen to you',
    '能看见': 'can see', '想知道': 'want to know', '不知道': 'do not know', '谎话': 'a lie', '秘密': 'a secret', '梦': 'a dream', '不是': 'is not', '好像': 'seems like',
    '说出口的': 'what was said', '想过的': 'what was imagined', '答应过的': 'what was promised', '给你': 'for you', '为了你': 'for you / for your sake', '跟我': 'with me',
    '有些事': 'some things', '这件事': 'this matter', '每个人': 'everyone', '一定是真的': 'must be true', '也许是真的': 'may be true', '根本没发生': 'never happened',
    '正好合上': 'match exactly', '来自于': 'come from', '取决于': 'depend on', '你的心': 'your heart', '我的话': 'my words', '我这个人': 'the person I am',
    '有几样': 'a few things', '就这一样': 'only this one', '别难过': 'do not be sad', '别走': 'do not go', '别原谅': 'do not forgive', '别怪自己': 'do not blame yourself',
    '和、跟': 'and / with', '为了': 'for', '从': 'from', '表情': 'expression', '语气': 'tone', '心情': 'mood', '温柔的': 'gentle', '生气的': 'angry', '着急的': 'anxious',
    '忘了': 'forgot', '早就说过': 'said long ago', '很好呀': 'very good', '没关系': 'it is okay', '不要紧': 'no problem', '道歉': 'apologize', '责怪': 'blame', '忘掉': 'forget',
    '为什么呢': 'why?', '是吗': 'is that so?', '好了吗': 'is it ready?', '所以': 'so / therefore', '但是': 'but', '如果': 'if', '和': 'and',
    '危险': 'dangerous', '安静': 'quiet', '舒服': 'comfortable', '远离': 'far away', '在里面': 'inside', '路过': 'pass by', '因为有': 'because there is', '虽然有': 'although there is', '如果有': 'if there is',
    '我要走了': 'I am leaving', '你会在': 'you will be there', '我在哪儿': 'where am I?', '什么时候': 'when', '为什么': 'why', '危险区': 'danger zone', '存档点': 'save point', '休息站': 'rest stop',
    '不能': 'cannot', '不敢': 'do not dare', '自由': 'free', '难过': 'sad', '我们分开了': 'we separated', '你回来变成': 'you came back and became', '我们一直是': 'we have always been',
    '跟现在一样': 'same as now', '比以前更好': 'better than before', '不过': 'however', '讨厌的': 'hateful', '想念的': 'missed', '相信的': 'trusted',
    '离开我': 'leave me', '靠近你': 'close to you', '在我身后': 'behind me', '方向': 'direction', '路线': 'route', '距离': 'distance', '他的': 'his', '我们的': 'our',
    '擦掉': 'erase', '藏起来': 'hide', '打开': 'open', '说出口': 'say aloud', '忘在脑后': 'put out of mind', '拿出来': 'take out', '求你了': 'please / I beg you', '有点怀疑': 'a little doubtful',
    '听': 'listen', '想': 'think / want', '问': 'ask', '从前': 'in the past', '刚才': 'just now', '一直以来': 'all along', '再也不在': 'never stay again', '有时候在': 'sometimes stay', '想要在': 'want to stay',
    '在外面': 'outside', '在路上': 'on the way', '在旁边': 'beside', '头': 'head', '手': 'hand', '眼睛': 'eyes', '已经': 'already', '正在': 'currently', '不会': 'will not',
    '去': 'go', '来': 'come', '那里': 'there', '这时候': 'at this moment', '她': 'she / her', '你们': 'you (plural)', '大家': 'everyone', '大家的': 'everyone’s',
    '外面': 'outside', '里面': 'inside', '旁边': 'beside', '附近': 'nearby', '经常': 'often', '偶尔': 'occasionally', '总是': 'always', '现在': 'now', '以前': 'before', '将来': 'in the future', '一直': 'continuously',
    '开心': 'happy', '害怕': 'afraid', '担心': 'worried', '累了': 'tired', '失望': 'disappointed', '看': 'look', '答应': 'promise', '走': 'walk / leave', '留下': 'stay', '回来': 'return', '离开': 'leave', '等着': 'wait',
    '虽然': 'although', '而且': 'and / moreover', '不在': 'not there', '嘴': 'mouth', '脸': 'face', '温暖': 'warm', '能': 'can', '要': 'want / need', '真相': 'truth', '故事': 'story', '惩罚': 'punish',
    '你（拖长音）': 'you (sustained note)', '彼此、互相': 'each other', '面对、跟': 'with / facing', '反正、就': 'anyway / then', '说、是': 'say / that',
    '自己': 'oneself', '我自己': 'myself', '心的': 'of the heart', '全心全意付出': 'give wholeheartedly', '懂得了': 'came to understand', '理解、明白': 'understand',
    '（把动词/形容词变成名词的词头）': 'prefix that turns a verb or adjective into a noun', '真相、真心话': 'truth / honest words', '我的幸福': 'my happiness',
    '能够爱上你': 'be able to love you', '必须爱': 'must love', '让我坠入了爱河': 'made me fall in love', '而且会爱你': 'and will love you',
    '喜欢我自己': 'like myself', '喜欢我（变成）的样子': 'like the person I become', '输给了这个声音': 'lost to this voice', '偏偏闯了进来': 'unexpectedly barged in',
    '……的时候': 'when / at the time of', '跟你在一起的时候': 'when I am with you', '跟我在一起的时候': 'when you are with me', '我们相处的时光': 'the time we spend together',
    '每一段时光': 'every moment', '和每一秒': 'and every second', '靠近一点': 'come a little closer', '互相陪伴在身边': 'stay beside each other', '哪儿也不去': 'go nowhere',
    '长长久久': 'for a long, long time', '长长久久好不好': 'could it last a long time?', '永远': 'forever', '一直下去': 'keep going', '直到最后一天': 'until the final day',
    '直到再也没办法爱别人': 'until I can no longer love anyone else', '一个比原来更好的人': 'a better person than before', '命令': 'command', '命令、吩咐': 'command / order',
    '它命令我': 'it commands me', '它命令着': 'it keeps commanding', '违抗、顶回去': 'resist / defy', '硬撑着违抗': 'struggle to resist', '停下': 'stop',
    '禁止、不许': 'forbid / do not allow', '不必、不用': 'do not need to', '没办法': 'cannot / there is no way', '撑不住、做不到': 'cannot hold out / cannot do it', '并不想要': 'do not really want',
    '只是想留住': 'only want to keep', '答应会照顾': 'promise to care for', '真心为你好': 'genuinely want what is best for you', '承认啦': 'admit it', '老实说、直说了吧': 'honestly / to be direct',
    '希望成真': 'hope comes true', '真的存在吗': 'does it really exist?', '越是': 'the more', '遇见越': 'the more we meet', '但是越': 'but the more',
    '多少（跟前面连起来＝越怎样）': 'how much (forms “the more…” with the preceding phrase)', '再怎么藏也藏不住': 'cannot hide it no matter how hard you try',
    '能有多好': 'how good it could be', '但还是': 'but still', '藏起表情、情绪': 'hide an expression or emotion', '让我的心': 'make my heart', '你让我知道': 'you let me know',
    '干脆相爱好不好': 'why do we not just fall in love?',
    '不想说，但我是': 'Don’t Wanna Say It, But I Do', '喜欢跟你在一起时的自己': 'I Like Who I Am When I’m With You', '心命令我爱你': 'My Heart Commands Me to Love You',
    '点一下听泰语真人发音': 'Hear the Thai pronunciation', '标记为已经学过了': 'Mark as learned', '标记为还没学过': 'Mark as not learned',
    '✓ 学过': '✓ Learned', '✗ 没学过': '✗ Not learned', '✓ 已学完': '✓ Completed', '⏸ 暂停': '⏸ Pause', '▶ 继续朗读': '▶ Continue',
    '这个范围里没有词，换个朗读范围试试': 'There are no words in this range. Choose another playback range.',
    '还生疏': 'Needs practice', '刚见过': 'Just introduced', '眼熟': 'Recognizing', '会了': 'Learned', '熟练': 'Confident', '已掌握': 'Mastered',
    '没学过': 'Not learned', '生疏 / 没学过': 'Needs practice / Not learned',
    '想告诉': 'want to tell', '我所…的': 'what I…', '那样做': 'do that', '我啊': 'me / I', '心甘情愿': 'willingly', '紧紧靠近你': 'stay close to you',
    '无论': 'no matter', '哪一天': 'which day', '都一样': 'all the same', '守着、等着': 'stay and wait', '照顾': 'take care of', '牵挂、关心': 'care about',
    '做得到': 'can do it', '只要能看见': 'as long as I can see', '心里是快乐的': 'happy at heart', '就这样': 'just like this', '就已经足够': 'is already enough',
    '对这颗心': 'for this heart', '只要': 'as long as / only need', '收下': 'accept / take', '去（表示动作完成）': 'away / marks a completed action', '来自': 'come from',
    '做': 'do', '而、和': 'and / while', '也': 'also', '还有': 'and also', '这样地给出去': 'give in this way', '不需要': 'do not need', '有谁': 'anyone',
    '小小的一颗心': 'a little heart', '只要能': 'as long as it can', '懂得爱、认识爱': 'understand and know love', '就好得超过了': 'becomes better than', '心所…的': 'what the heart…',
    '只要今天': 'as long as today', '能够爱': 'can love', '牵绊、割不断的感情': 'an unbreakable bond', '看见': 'see', '你的梦': 'your dream', '成真': 'come true',
    '该有多好': 'how wonderful that would be', '那就是': 'that is', '支配、指使': 'direct / compel', '让我这么做下去': 'make me keep doing this', '我消失了': 'I disappeared',
    '语气吟唱': 'sung vocalization', '不好啦': 'oh no', '我们回来变成': 'we return to being', '让我触碰你': 'let me touch you', '看着我的眼睛': 'look into my eyes',
    '留下来陪着我': 'stay here with me', '因为你拯救了我': 'because you saved me', '也不知道': 'do not know either', '这是不是': 'whether this is', '是真是假': 'real or false',
    '这种感觉': 'this feeling', '这到底是不是爱': 'whether this is really love', '是真的还是': 'whether it is real or', '假的、骗人的': 'false / a lie',
    '还是什么秘密暧昧的事': 'or some secret affair', '不是爱只是': 'not love, only', '你情我愿地互相给予索取': 'a mutually willing exchange', '笑声语气词': 'laughing interjection',
    '于是就得': 'so I have to', '测试': 'test', '再一次': 'one more time', '直到才知道我爱你': 'until I know that I love you', '你懂的': 'you know',
    '它跳得好密好快': 'it beats so fast', '如果你知道': 'if you know', '那么': 'then', '不想说出「爱」这个字': 'do not want to say the word “love”', '啦啦啦': 'la la la',
    '爱你': 'love you', '但是我我我我，是的（我爱你）': 'but I, I, I—yes, I love you', '因为它、就是它': 'because it—that is it', '但是你 你 你': 'but you, you, you',
    '背景和声：不想说……': 'backing vocal: do not want to say it…', '背景和声：但我是（爱你的）': 'backing vocal: but I do love you', '想故意装作不看': 'try to pretend not to look',
    '假装没感觉': 'pretend to feel nothing', '（但其实早就有感觉了）': '(but the feeling was already there)', '想故意不理睬': 'try to deliberately ignore', '但是心却怦怦直跳': 'but my heart keeps pounding',
    '我知道': 'I know', '我很幸运': 'I am lucky', '有多少、多么': 'how much / how many', '能拥有你': 'can have you', '一起走': 'walk together', '在身边': 'by my side',
    '牵手': 'hold hands', '和、而且': 'and / moreover', '一直倾听': 'keep listening', '在失望的那些日子': 'on those disappointing days', '哪里都不去': 'go nowhere',
    '我害怕得过分': 'I am terribly afraid', '害怕有一天': 'afraid that one day', '我祈祷': 'I pray', '帮我留下来爱着': 'stay and let me love you', '帮我们就这样待着': 'let us stay like this',
    '我拥有你这个人': 'I have you', '就这样一起待着': 'stay together like this', '剩下的人生': 'the rest of life', '不知道会怎样': 'do not know what will happen',
    '只要我们拥有彼此': 'as long as we have each other', '就没关系': 'then everything is okay', '许愿祈求': 'make a wish and pray', '向成百上千颗星星': 'to hundreds and thousands of stars',
    '希望你是我最后的爱': 'hope you are my final love', '吻你那樱桃色的唇': 'kiss your cherry-colored lips', '来吧，像品酒那样啜饮我': 'come taste me like a sip of wine',
    '求你恨我吧': 'please hate me', '就越': 'the more', '再': 'again / more', '酒啊，我到底恨不恨你？（wine 和 why 谐音的双关）': 'Wine—why do I hate you? (a wine/why pun)',
    '讨厌、恨': 'dislike / hate', '哪一点、哪里': 'which part / where', '我根本不知道': 'I truly do not know', '推开、把人往外赶': 'push away', '我就越想把你拉近': 'the more I want to pull you close',
    '别靠过来': 'do not come closer', '但你': 'but you', '从来没有': 'never have', '走开': 'walk away', '眼神': 'the look in your eyes', '（它）全都招了、出卖了你': 'it confessed everything and gave you away',
    '你自己心里清楚': 'you know it in your heart', '那就干脆玩得开心点': 'then let us simply enjoy it', '因为我恨你啊': 'because I hate you', '表演、展示（英语 show 借词）': 'show / perform (English loanword)',
    '只、仅仅': 'only / merely', '给我': 'give me / for me', '各取所需的敌人 —— 明明互相看不顺眼，却又分不开': 'enemies with benefits—unable to stand each other, yet unable to separate',
    '你翻了个白眼': 'you rolled your eyes', '装作你没事': 'pretend you are unaffected', '回消息': 'reply to messages', '我们说': 'we said', '最后一次': 'the last time', '待在一起': 'stay together',
    '每天晚上': 'every night', '到头来还是并排躺在一起': 'end up lying side by side again', '好像我变成了': 'it seems I became', '是一个人': 'was a person',
    '一个没什么优点的人': 'a person with few good qualities', '平平凡凡的': 'ordinary', '有时候脾气急躁': 'sometimes impatient', '有时候心肠不好': 'sometimes unkind',
    '有些事情': 'some things', '就是很不成样子': 'were truly unacceptable', '一天天地过日子': 'live one day after another', '就这样继续下去': 'continue like this',
    '一天天做着什么': 'doing things day after day', '跟以前一样': 'the same as before', '根本没有目标': 'have no goal at all', '什么都没有': 'have nothing', '根本没有': 'there was never',
    '美好的日子': 'a beautiful day', '直到今天': 'until today', '你走了进来': 'you walked in', '我可以是个好人': 'I can be a good person', '你让': 'you made',
    '没有心的人': 'a person without a heart', '从没懂过的事': 'what I never understood', '曾经脾气急躁的人': 'someone who used to be impatient', '曾经心肠不好的人': 'someone who used to be unkind',
    '变成了': 'became', '一个懂得爱人的人': 'someone who knows how to love', '当你走了进来': 'when you walked in',
  });

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let applying = false;

  function translateText(value) {
    if (language === 'zh') return value;
    if (Object.prototype.hasOwnProperty.call(en, value)) return en[value];
    const trimmed = value.trim();
    if (Object.prototype.hasOwnProperty.call(en, trimmed)) return value.replace(trimmed, en[trimmed]);
    return value
      .replace(/^(\d+) 个词$/, '$1 words')
      .replace(/^第 (\d+) \/ (\d+) 题$/, 'Question $1 of $2')
      .replace(/^第 (\d+) 句$/, 'Line $1')
      .replace(/^歌词第 (\d+) 句$/, 'Lyric line $1')
      .replace(/^第 (\d+) 句：(.*)$/, 'Line $1: $2')
      .replace(/^(\d+) \/ (\d+) 句 · (\d+)%$/, '$1 of $2 lines · $3%')
      .replace(/^★ 完成第 (\d+) 句！$/, '★ Line $1 complete!')
      .replace(/^第 (\d+) 句已完成 · 单词正确率 (\d+)%$/, 'Line $1 complete · Word accuracy $2%')
      .replace(/^智能练习完成 · 正确率 (\d+)% · 最高连对 (\d+)$/, 'Adaptive practice complete · $1% accuracy · Best streak $2')
      .replace(/^智能练习完成 · 正确率 (\d+)%$/, 'Adaptive practice complete · $1% accuracy')
      .replace(/^(\d+) 次$/, '$1 times')
      .replace(/^(\d+) 句$/, '$1 lines')
      .replace(/^第 (\d+) 句 · (\d+) 次$/, 'Line $1 · $2 uses')
      .replace(/^已掌握 (\d+)$/, '$1 mastered')
      .replace(/^🔥 连续 (\d+) 天$/, '🔥 $1 day streak')
      .replace(/^⏱ 今天 (\d+) 秒$/, '⏱ Today $1 sec')
      .replace(/^⏱ 今天 (\d+) 分钟$/, '⏱ Today $1 min')
      .replace(/^本周 (\d+) \/ 7 天$/, '$1 / 7 days this week')
      .replace(/^(\d+) 秒$/, '$1 sec')
      .replace(/^(\d+) 分钟$/, '$1 min')
      .replace(/^找到 (\d+) \/ (\d+) 个词$/, '$1 of $2 words')
      .replace(/^连续第 (\d+) 天！$/, 'Day $1 in a row!')
      .replace(/^连续 (\d+) 天，今天也别断掉。$/, '$1-day streak—keep it going today.')
      .replace(/^今天已经点亮，连续第 (\d+) 天！$/, 'Today is complete—day $1 in a row!')
      .replace(/^第 (\d+) 词$/, 'Word $1')
      .replace(/^出现≥(\d+)次 · (\d+)词$/, '≥$1 uses · $2 words')
      .replace(/^覆盖 ([\d.]+)%$/, '$1% coverage')
      .replace(/^([\d.]+)% 覆盖率$/, '$1% coverage')
      .replace(/^学到第 (\d+) 个词（出现 (\d+) 次）$/, 'Word $1 · $2 occurrences')
      .replace(/^已学完 (\d+) \/ (\d+) 课$/, '$1 of $2 lessons completed')
      .replace(/^共 (\d+) 课，从第一课开始也行，挑感兴趣的先听也行$/, '$1 lessons · Start with Lesson 1 or choose any topic')
      .replace(/^共 (\d+) 个词 · 已学过 (\d+) · 没学过 (\d+) · 还没标记 (\d+)$/, '$1 words · $2 learned · $3 not learned · $4 unmarked')
      .replace(/^共 (\d+) 个词 · 已学过 (\d+) · 没学过 (\d+)$/, '$1 words · $2 learned · $3 not learned')
      .replace(/^第 (\d+) \/ (\d+) 段$/, 'Part $1 of $2');
  }

  function translateElement(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.parentElement && /^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentElement.tagName)) return;
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      const source = originalText.get(node);
      node.nodeValue = language === 'zh' ? source : translateText(source);
    });

    const elements = root.nodeType === 1 ? [root, ...root.querySelectorAll('*')] : [...document.querySelectorAll('*')];
    elements.forEach((el) => {
      ['title', 'placeholder', 'aria-label'].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        let attrs = originalAttrs.get(el);
        if (!attrs) { attrs = {}; originalAttrs.set(el, attrs); }
        if (!(attr in attrs)) attrs[attr] = el.getAttribute(attr);
        el.setAttribute(attr, language === 'zh' ? attrs[attr] : translateText(attrs[attr]));
      });
    });
  }

  function apply() {
    applying = true;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const page = document.body.dataset.page;
    const titles = { freq: ['词频总表 — 泰语歌逐句跟读', 'Vocabulary Frequency — Learn Thai Through Songs'], lessons: ['记忆课 — 泰语歌逐句跟读', 'Memory Lessons — Learn Thai Through Songs'], science: ['词频覆盖率曲线 — 泰语歌逐句跟读', 'Vocabulary Coverage — Learn Thai Through Songs'] };
    document.title = titles[page] ? titles[page][language === 'zh' ? 0 : 1] : (language === 'zh' ? '泰语歌逐句跟读' : 'Learn Thai Through Songs');
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === 'zh'
      ? '逐句、逐词学泰语歌：泰文 + 罗马音 + 中文谐音 + 中文意思，每个词点一下就能听发音。'
      : 'Learn Thai songs line by line and word by word with romanization, meanings, and pronunciation.';
    translateElement(document.body);
    document.querySelectorAll('[data-language-select]').forEach((select) => { select.value = language; });
    delete document.documentElement.dataset.i18nPending;
    applying = false;
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  }

  function setLanguage(next) {
    if (!supported.includes(next) || next === language) return;
    language = next;
    localStorage.setItem(STORAGE_KEY, language);
    apply();
  }

  function localize(value, field) {
    if (!value) return '';
    if (language === 'en' && value[field + 'En']) return value[field + 'En'];
    return value[field] || '';
  }

  function init() {
    const observer = new MutationObserver((records) => {
      if (applying) return;
      applying = true;
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === 1) translateElement(node);
        else if (node.nodeType === 3) {
          if (!originalText.has(node)) originalText.set(node, node.nodeValue);
          node.nodeValue = language === 'zh' ? originalText.get(node) : translateText(originalText.get(node));
        }
      }));
      applying = false;
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('[data-language-select]').forEach((select) => select.addEventListener('change', (event) => setLanguage(event.target.value)));
    apply();
  }

  return { init, apply, setLanguage, localize, t: translateText, get language() { return language; } };
})();
