/**
 * Player —— YouTube IFrame API 封装
 *
 * 用官方播放器直接放原曲（不下载、不转存音频），
 * 通过 getCurrentTime() 轮询来驱动歌词高亮和单句循环。
 */
const Player = (() => {
  let yt = null;
  let ready = false;
  let videoId = null;
  const listeners = { ready: [], state: [], tick: [] };

  let tickTimer = null;
  let loop = null; // { start, end } 单句循环区间

  function on(evt, cb) { (listeners[evt] || (listeners[evt] = [])).push(cb); }
  function emit(evt, payload) { (listeners[evt] || []).forEach((cb) => cb(payload)); }

  function load(id, mountEl) {
    videoId = id;
    // 注入 YouTube IFrame API
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => create(mountEl);
    } else {
      create(mountEl);
    }
  }

  function create(mountEl) {
    yt = new YT.Player(mountEl, {
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          ready = true;
          startTicking();
          emit('ready');
        },
        onStateChange: (e) => {
          emit('state', e.data);
          if (e.data === YT.PlayerState.PLAYING) startTicking();
        },
        onError: (e) => console.warn('[Player] YouTube error', e.data),
      },
    });
  }

  function startTicking() {
    clearInterval(tickTimer);
    // 100ms 足够跟上逐句高亮，又不会太耗电
    tickTimer = setInterval(() => {
      if (!ready || !yt.getCurrentTime) return;
      const t = yt.getCurrentTime();

      // 单句循环：越过终点就跳回起点
      if (loop && t >= loop.end) {
        yt.seekTo(loop.start, true);
        emit('tick', loop.start);
        return;
      }
      emit('tick', t);
    }, 100);
  }

  const isReady = () => ready;
  const getTime = () => (ready && yt.getCurrentTime ? yt.getCurrentTime() : 0);
  const getDuration = () => (ready && yt.getDuration ? yt.getDuration() : 0);
  const getState = () => (ready && yt.getPlayerState ? yt.getPlayerState() : -1);
  const isPlaying = () => getState() === 1;

  function play() { if (ready) yt.playVideo(); }
  function pause() { if (ready) yt.pauseVideo(); }
  function toggle() { isPlaying() ? pause() : play(); }
  // allowSeekAhead=false：拖进度条的过程中只在已缓冲的范围里跳，
  // 不去请求新的分片，松手时再用 true 真正定位。
  function seek(sec, andPlay = true, allowSeekAhead = true) {
    if (!ready) return;
    yt.seekTo(Math.max(0, sec), allowSeekAhead);
    if (andPlay) yt.playVideo();
  }
  // 已缓冲比例 0~1，用来在进度条上画出「已经加载到哪儿」
  const getLoadedFraction = () =>
    (ready && yt.getVideoLoadedFraction ? yt.getVideoLoadedFraction() : 0);
  function nudge(delta) { seek(getTime() + delta, false); }
  function setRate(r) { if (ready && yt.setPlaybackRate) yt.setPlaybackRate(r); }
  function getRate() { return ready && yt.getPlaybackRate ? yt.getPlaybackRate() : 1; }
  function availableRates() {
    return ready && yt.getAvailablePlaybackRates
      ? yt.getAvailablePlaybackRates()
      : [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  }

  function setLoop(start, end) {
    loop = { start, end };
    if (getTime() < start || getTime() > end) seek(start, true);
  }
  function clearLoop() { loop = null; }
  function getLoop() { return loop; }

  return {
    load, on, isReady, getTime, getDuration, getState, isPlaying,
    getLoadedFraction,
    play, pause, toggle, seek, nudge,
    setRate, getRate, availableRates,
    setLoop, clearLoop, getLoop,
  };
})();
