/**
 * TTS —— 泰语发音引擎
 *
 * 用浏览器自带的 Web Speech API 朗读泰文，不需要联网 API、不需要密钥。
 * 难点在于「系统里到底有没有泰语声音」，这里做了：
 *   1. 异步等待声音列表加载（Chrome 首次是空的）
 *   2. 宽松匹配 th / th-TH / th_TH
 *   3. 没有泰语声音时给出分平台的安装指引，而不是静默失败
 *   4. iOS Safari 的 speechSynthesis 卡死处理
 */
const TTS = (() => {
  let voices = [];
  let thaiVoices = [];
  let enVoices = [];
  let chosenThaiVoiceURI = localStorage.getItem('tsl.voiceURI') || null;
  let ready = false;
  const readyCallbacks = [];

  const normLang = (l) => (l || '').toLowerCase().replace('_', '-');
  const isThai = (v) => normLang(v.lang).startsWith('th');
  const isEnglish = (v) => normLang(v.lang).startsWith('en');

  function loadVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    thaiVoices = voices.filter(isThai);
    enVoices = voices.filter(isEnglish);

    if (voices.length > 0 && !ready) {
      ready = true;
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
    }
    return thaiVoices;
  }

  function onReady(cb) {
    if (ready) cb();
    else readyCallbacks.push(cb);
  }

  function init() {
    if (!window.speechSynthesis) return;
    loadVoices();
    // Chrome 第一次调用返回空数组，要等这个事件
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
      document.dispatchEvent(new CustomEvent('tts:voiceschanged'));
    };
    // 兜底：某些浏览器不触发 onvoiceschanged
    let tries = 0;
    const poll = setInterval(() => {
      if (voices.length > 0 || tries++ > 20) {
        clearInterval(poll);
        if (voices.length > 0) document.dispatchEvent(new CustomEvent('tts:voiceschanged'));
      } else {
        loadVoices();
      }
    }, 250);
  }

  function getThaiVoices() { return thaiVoices; }
  function getSelectedThaiVoice() {
    if (!thaiVoices.length) return null;
    if (chosenThaiVoiceURI) {
      const m = thaiVoices.find((v) => v.voiceURI === chosenThaiVoiceURI);
      if (m) return m;
    }
    // 优先本地声音（离线、延迟低），否则用第一个
    return thaiVoices.find((v) => v.localService) || thaiVoices[0];
  }
  function selectThaiVoice(uri) {
    chosenThaiVoiceURI = uri;
    localStorage.setItem('tsl.voiceURI', uri);
  }

  function hasThai() { return thaiVoices.length > 0; }
  function isSupported() { return !!window.speechSynthesis && !!window.SpeechSynthesisUtterance; }

  function stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /**
   * 朗读一段文本
   * @param {string} text
   * @param {{lang?:'th'|'en', rate?:number, onend?:Function, onerror?:Function}} opts
   */
  function speak(text, opts = {}) {
    if (!isSupported() || !text) return false;
    const lang = opts.lang === 'en' ? 'en' : 'th';

    stop();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = clamp(opts.rate ?? 0.7, 0.1, 2);
    u.pitch = 1;
    u.volume = 1;

    if (lang === 'th') {
      const v = getSelectedThaiVoice();
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'th-TH';
    } else {
      const v = enVoices.find((x) => x.localService) || enVoices[0];
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'en-US';
    }

    if (opts.onend) u.onend = opts.onend;
    u.onerror = (e) => {
      // iOS/Safari 在被 cancel() 打断时也会触发 error，这类不算失败
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[TTS] error:', e.error);
        if (opts.onerror) opts.onerror(e);
      }
    };

    window.speechSynthesis.speak(u);
    keepAlive();
    return true;
  }

  // Chrome/iOS 长时间不用会把 speechSynthesis 挂起，这里定期 resume
  let keepAliveTimer = null;
  function keepAlive() {
    clearInterval(keepAliveTimer);
    keepAliveTimer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAliveTimer);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 5000);
  }

  // iOS 要求首次朗读发生在用户手势里，用一段静音「解锁」
  let unlocked = false;
  function unlock() {
    if (unlocked || !isSupported()) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    unlocked = true;
  }

  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

  /** 当前平台没有泰语声音时，给出的安装指引 */
  function installHint() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isMac = /Macintosh/.test(ua) && !isIOS;
    const isWin = /Windows/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      return {
        platform: 'iPhone / iPad',
        steps: [
          '打开「设置」→「辅助功能」',
          '→「朗读内容」→「声音」',
          '→ 找到「ไทย / Thai」，点右边的下载按钮',
          '下载完回到这个网页刷新一下就能发音了',
        ],
      };
    }
    if (isMac) {
      return {
        platform: 'Mac',
        steps: [
          '打开「系统设置」→「辅助功能」',
          '→「朗读内容」→「系统声音」右边的 ⓘ / 「管理声音」',
          '→ 语言里找到「泰语 / Thai」，勾选 Kanya 并下载',
          '下载完刷新这个网页',
          '小提示：用 Chrome 打开本站通常自带在线泰语声音，可以直接用',
        ],
      };
    }
    if (isWin) {
      return {
        platform: 'Windows',
        steps: [
          '打开「设置」→「时间和语言」→「语言和区域」',
          '→ 添加语言 → 搜索「ไทย / Thai」并安装（勾上语音选项）',
          '→ 再到「辅助功能」→「讲述人」确认泰语语音已装好',
          '装完刷新这个网页',
          '小提示：用 Chrome 打开本站通常自带在线泰语声音，可以直接用',
        ],
      };
    }
    if (isAndroid) {
      return {
        platform: 'Android',
        steps: [
          '打开「设置」→「常规管理 / 系统」→「文字转语音输出」',
          '→ 选 Google 文字转语音引擎 →「安装语音数据」',
          '→ 找到「ไทย / Thai」下载',
          '装完刷新这个网页',
        ],
      };
    }
    return {
      platform: '你的设备',
      steps: [
        '推荐用电脑版 Chrome 打开本站，它自带在线泰语语音',
        '或在系统的「文字转语音 / 朗读内容」设置里下载泰语语音包',
      ],
    };
  }

  return {
    init, speak, stop, unlock, onReady,
    hasThai, isSupported, installHint,
    getThaiVoices, getSelectedThaiVoice, selectThaiVoice,
    get allVoices() { return voices; },
  };
})();
