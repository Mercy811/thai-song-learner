/** Lightweight, dependency-free UI internationalisation. */
window.I18n = (() => {
  'use strict';

  const STORAGE_KEY = 'tsl.language';
  const supported = ['zh', 'en'];
  const saved = localStorage.getItem(STORAGE_KEY);
  const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  let language = supported.includes(saved) ? saved : (/^zh(?:-|$)/i.test(browserLanguage) ? 'zh' : 'en');

  const en = {
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
    '🎯 开始测验': '🎯 Start quiz', '⚔️ 双人对战': '⚔️ Two-player battle', '📋 复制单词表': '📋 Copy vocabulary', '↺ 重置进度': '↺ Reset progress',
    '今日学习': 'TODAY', '用 2 分钟，复习 6 个词': 'Review 6 words in 2 minutes', '开始今日任务': 'Start today’s lesson',
    '今天已打卡，明天继续！': 'Today complete — see you tomorrow!', '再练一轮': 'Practice again',
    '🔥 今日任务完成，打卡成功': '🔥 Daily lesson complete', '游客': 'Guest', '账户': 'Account',
    '每天一点，泰语慢慢变熟': 'A little Thai, every day', '完成今日任务 →': 'Complete today’s lesson →',
    '今天再练一轮 →': 'Practice once more →', '连续打卡天数': 'Day streak', '今年已打卡': 'Days this year',
    '今天学习时间': 'Today’s study time', '今天还没打卡，花两分钟点亮它吧。': 'Two minutes will light up today’s square.',
    '少': 'Less', '多': 'More', '过去一年的每日学习记录': 'Daily learning activity for the past year',
    '排序': 'Sort', '歌词顺序': 'Song order', '最不熟的在前': 'Weakest first', '出现最多的在前': 'Most frequent first',
    '只看': 'Filter', '全部': 'All', '还没掌握': 'Not mastered', '还没学过': 'New', '答错过的': 'Answered incorrectly', '遮住意思（自测）': 'Hide meanings (self-test)',
    '← 单词表': '← Vocabulary', '它是什么意思？': 'What does it mean?', '下一个 →': 'Next →', '再听一遍': 'Listen again', '🔊 听发音': '🔊 Listen',
    '出题自动读一遍': 'Read each question aloud', '泰语声音': 'Thai voice', '🔊 试听「สวัสดี」': '🔊 Test “สวัสดี”', '🔊 试听第一句歌词': '🔊 Test the first lyric',
    '没有声音 / 发音不对怎么办？': 'No sound or incorrect pronunciation?', '歌词时间轴还没校准': 'Lyric timing has not been synced',
    '这台设备还没装泰语发音': 'Thai speech is not installed on this device', '下一句要标的是': 'Next line to mark',
    '🔊 先听听这句怎么念': '🔊 Hear this line first', '按这里 / 空格  →  标记这一句': 'Click here / Space  →  Mark this line',
    '↩ 退一句': '↩ Previous line', '重新开始': 'Start over', '✓ 保存时间轴': '✓ Save timing', '导出给别人用': 'Export for others',
    '导出时间轴': 'Export timing', '复制': 'Copy', '关闭': 'Close', '取消': 'Cancel', '保存': 'Save', '开始': 'Start',
    '主歌 A': 'Verse 1', '主歌 B': 'Verse 2', '预副歌': 'Pre-chorus', '副歌': 'Chorus', '桥段': 'Bridge', '尾声': 'Outro', '间奏': 'Instrumental',
    '英语': 'English', '泰语': 'Thai', '不支持': 'Not supported', '加载中…': 'Loading…', '加载中...': 'Loading...',
  };

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let applying = false;

  function translateText(value) {
    if (language === 'zh') return value;
    const exact = en[value];
    if (exact) return exact;
    const trimmed = value.trim();
    if (en[trimmed]) return value.replace(trimmed, en[trimmed]);
    return value
      .replace(/^(\d+) 个词$/, '$1 words')
      .replace(/^第 (\d+) \/ (\d+) 题$/, 'Question $1 of $2')
      .replace(/^第 (\d+) 句$/, 'Line $1')
      .replace(/^(\d+) 次$/, '$1 times')
      .replace(/^🔥 连续 (\d+) 天$/, '🔥 $1 day streak')
      .replace(/^⏱ 今天 (\d+) 秒$/, '⏱ Today $1 sec')
      .replace(/^⏱ 今天 (\d+) 分钟$/, '⏱ Today $1 min')
      .replace(/^本周 (\d+) \/ 7 天$/, '$1 / 7 days this week');
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
    document.title = language === 'zh' ? '泰语歌逐句跟读' : 'Learn Thai Through Songs';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === 'zh'
      ? '逐句、逐词学泰语歌：泰文 + 罗马音 + 中文谐音 + 中文意思，每个词点一下就能听发音。'
      : 'Learn Thai songs line by line and word by word with romanization, meanings, and pronunciation.';
    translateElement(document.body);
    const select = document.getElementById('languageSelect');
    if (select) select.value = language;
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
    document.getElementById('languageSelect')?.addEventListener('change', (event) => setLanguage(event.target.value));
    apply();
  }

  return { init, apply, setLanguage, localize, t: translateText, get language() { return language; } };
})();
