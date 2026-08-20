/**
 * Gesture —— 摄像头认手势（双人对战抢答用）
 *
 * 一台电脑、一个摄像头、两个人并排坐：**画面左边是玩家 1，右边是玩家 2**。
 * 画面按选自拍的习惯左右镜像显示，所以「你坐在屏幕左边」和「你在画面里出现在左边」是一回事，
 * 不用先在脑子里翻一道。手在哪半边，这只手就算谁的。
 *
 * 手势只认一件事：**竖起来几根手指**（0–4）。
 *   ✊ 0 根 = 拳头，两个人一起比就进下一题
 *   ☝ 1 根 / ✌ 2 根 / 3 根 / 4 根 = 抢答第几个选项
 *
 * 拇指一概不数 —— 比「1」有人竖食指有人竖拇指，比「3」有人是食中无名、有人是拇食中，
 * 只数食指/中指/无名指/小指这四根，人人比出来都一样，而且刚好四个选项。
 *
 * 认不出来不影响玩：这一整块是**加分项**，摄像头没开、模型没下下来、手没伸进画面，
 * 键盘那套（玩家 1 按 1234、玩家 2 按 7890）全程都在，坏了就用键盘。
 *
 * 画面只在这台机器的内存里转一圈：不上传、不存盘，退出对战立刻把摄像头关掉。
 * 手势模型是 Google MediaPipe 的 HandLandmarker，第一次用要从 CDN 下大约 8 MB，之后走浏览器缓存。
 */
window.Gesture = (() => {
  'use strict';

  // 版本钉死：CDN 上的 latest 指着一个 2022 年的老包，跟这里用的 API 对不上
  const LIB   = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

  const FPS_MS    = 45;   // 约 22 帧/秒：抢答够跟手，也不会把风扇吹起来
  const NEED_HOLD = 3;    // 连着 3 帧读到同一个手势才作数，手挥过去不会误触发
  const NEED_GONE = 7;    // 手「消失」要多等几帧：识别偶尔漏一帧，不该当成把手放下了

  // 一根手指的三个关节点：[掌指关节, 第二指节, 指尖]（食指、中指、无名指、小指）
  const FINGERS = [[5, 6, 8], [9, 10, 12], [13, 14, 16], [17, 18, 20]];

  let stream = null;
  let video = null;                  // 离屏的那个真正在解码的 <video>，识别读的是它
  let landmarker = null;
  let loading = null;                // 模型加载中的那个 Promise，避免开两遍
  let raf = 0;
  let lastAt = 0;
  let lastFrame = -1;

  const S = { camera: 'off', model: 'off', error: '' };   // off | loading | on | error
  const seats = [seat(), seat()];
  const listeners = { status: [], gesture: [] };

  function seat() { return { raw: null, n: 0, val: null, size: 0 }; }

  function on(evt, cb)  { (listeners[evt] || (listeners[evt] = [])).push(cb); }
  function emit(evt, d) { (listeners[evt] || []).forEach((cb) => { try { cb(d); } catch { /* 一个监听炸了不该带塌别的 */ } }); }

  const status = () => ({ ...S });
  const seatOf = (i) => seats[i].val;
  const ready  = () => S.camera === 'on' && S.model === 'on';

  function supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /** 摄像头只在 https 或 localhost 下能开，用 file:// 直接双击打开的页面是拿不到的 */
  function secure() { return window.isSecureContext !== false; }

  function setStatus(patch) {
    Object.assign(S, patch);
    emit('status', status());
  }

  /* ════════ 开 / 关 ════════ */

  /**
   * 开摄像头。画面先出来，模型在后台接着下 —— 8 MB 要等几秒，
   * 这几秒里人已经能看见自己、把位置坐好了。
   */
  async function start() {
    if (!supported()) throw new Error('这台设备没有摄像头，或者浏览器不给用');
    if (!secure())    throw new Error('用 http:// 或直接打开的本地文件拿不到摄像头，换 https 或 localhost');
    if (stream && stream.active) { loadModel(); return; }

    setStatus({ camera: 'loading', error: '' });
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: 'user' },
        audio: false,
      });
    } catch (e) {
      const msg = e && e.name === 'NotAllowedError'
        ? '摄像头被拒绝了 —— 在地址栏左边把权限改成允许，再点一次'
        : e && e.name === 'NotFoundError'
          ? '这台设备上没找到摄像头'
          : '摄像头打不开：' + (e && e.message ? e.message : e);
      setStatus({ camera: 'error', error: msg });
      throw new Error(msg);
    }

    if (!video) {
      video = document.createElement('video');
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('playsinline', '');   // iOS Safari 认这个属性，不认属性名的驼峰写法
    }
    video.srcObject = stream;
    await video.play().catch(() => { /* 自动播放被拦了也没关系，下面 readyState 会兜住 */ });
    setStatus({ camera: 'on' });

    loadModel();
    loop();
  }

  /** 关摄像头：灯灭掉，画面断干净。模型留在内存里，再进来一次就不用重下了 */
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    if (video) video.srcObject = null;
    lastFrame = -1;
    seats.forEach((s, i) => { Object.assign(s, seat()); emit('gesture', { seat: i, count: null, prev: null }); });
    setStatus({ camera: 'off' });
  }

  /** 把画面挂到页面上某个 <video> 上（预览、拍照、比赛记分牌各挂各的，共用同一路流） */
  function mirrorTo(el) {
    if (!el) return;
    el.playsInline = true;
    el.muted = true;
    el.setAttribute('playsinline', '');
    el.srcObject = stream;
    if (stream) el.play().catch(() => {});
  }

  /** 这一屏不用了就把画面摘下来，别让它在后台白解码 */
  function detach(el) { if (el) el.srcObject = null; }

  /* ════════ 模型 ════════ */

  function loadModel() {
    if (landmarker || loading) return loading;
    setStatus({ model: 'loading' });
    loading = (async () => {
      const vision = await import(/* webpackIgnore: true */ `${LIB}/vision_bundle.mjs`);
      const files = await vision.FilesetResolver.forVisionTasks(`${LIB}/wasm`);
      landmarker = await vision.HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 2,                    // 一人一只手；两只手都伸进来只认最靠前的那只
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      setStatus({ model: 'on' });
    })().catch((e) => {
      landmarker = null;
      console.warn('[Gesture] 手势模型加载失败', e);      // 原始报错留给控制台，界面上说人话就行
      setStatus({ model: 'error', error: '手势模型没下下来（断网，或者被网络挡了）—— 照片照拍，抢答改用键盘：玩家 1 按 1234、玩家 2 按 7890。' });
    }).finally(() => { loading = null; });
    return loading;
  }

  /* ════════ 每帧 ════════ */

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!landmarker || !video || video.readyState < 2) return;
    const now = performance.now();
    if (now - lastAt < FPS_MS) return;
    if (video.currentTime === lastFrame) return;   // 还是上一帧，重算一遍纯属浪费
    lastAt = now;
    lastFrame = video.currentTime;
    let res;
    try { res = landmarker.detectForVideo(video, now); } catch { return; }
    read(res);
  }

  function read(res) {
    // 归一化坐标里 x、y 各自铺满 0–1，画面不是正方形的话 x 会被拉长，
    // 先按宽高比把 x 拉回来，后面量的距离才是画面上真实的距离
    const aspect = (video.videoWidth || 16) / (video.videoHeight || 9);
    const best = [null, null];

    (res.landmarks || []).forEach((lm) => {
      let sx = 0, x0 = 1, x1 = 0, y0 = 1, y1 = 0;
      lm.forEach((p) => {
        sx += p.x;
        if (p.x < x0) x0 = p.x;
        if (p.x > x1) x1 = p.x;
        if (p.y < y0) y0 = p.y;
        if (p.y > y1) y1 = p.y;
      });
      const mx = 1 - sx / lm.length;                 // 画面镜像显示，坐标也跟着翻
      const i = mx < 0.5 ? 0 : 1;                    // 左半边算玩家 1，右半边算玩家 2
      const size = Math.hypot((x1 - x0) * aspect, y1 - y0);
      // 同一边伸进来两只手（比如把另一只搭在桌上）：只认画面里最大的那只，那是真正在比的手
      if (!best[i] || size > best[i].size) best[i] = { size, count: count(lm, aspect) };
    });

    [0, 1].forEach((i) => settle(i, best[i] ? best[i].count : null));
  }

  /**
   * 数竖起来几根手指（0–4，拇指不算）。
   *
   * 一根手指伸没伸，要两条证据都过：
   *   ① 指尖离手腕比第二指节远 —— 手指蜷回来时指尖会缩向手腕这边；
   *   ② 指节是直的 —— 掌指→指节、指尖→指节这两段向量几乎反向。
   * 两条都跟手的朝向无关，手横着比、斜着比都读得对。
   */
  function count(lm, aspect) {
    const P = (i) => [lm[i].x * aspect, lm[i].y];
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const w = P(0);
    let n = 0;
    for (const [mcp, pip, tip] of FINGERS) {
      const m = P(mcp), p = P(pip), t = P(tip);
      if (d(w, t) < d(w, p) * 1.05) continue;        // ① 指尖缩回来了
      const a = [m[0] - p[0], m[1] - p[1]];
      const b = [t[0] - p[0], t[1] - p[1]];
      const len = Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]);
      if (len && (a[0] * b[0] + a[1] * b[1]) / len < -0.2) n++;   // ② 指节够直（夹角 > 约 100°）
    }
    return n;
  }

  /**
   * 手势要**稳住**才算数：连着几帧读到同一个数才认，中间抖一下不算。
   * 只有从一个手势变成另一个手势时才发事件 —— 一直举着不放不会连着抢好几次。
   */
  function settle(i, raw) {
    const s = seats[i];
    if (raw === s.raw) s.n++;
    else { s.raw = raw; s.n = 1; }
    if (s.n < (raw === null ? NEED_GONE : NEED_HOLD) || raw === s.val) return;
    const prev = s.val;
    s.val = raw;
    emit('gesture', { seat: i, count: raw, prev });
  }

  /* ════════ 拍照 ════════ */

  /**
   * 拍一张，当场从中间切两半：画面左半边给玩家 1，右半边给玩家 2。
   * 切的就是预览里看得见的那半边画面（**不是**再裁一个方框）——
   * 预览看到什么，拍下来就是什么，头像框显示成方的那一步交给 CSS 去裁。
   * 跟预览一样左右镜像，拍出来才是照镜子看到的自己。
   * 返回两张 JPEG 的 data URL，只在内存里传，不写盘也不上传。
   */
  function snapshot(w = 320) {
    if (!video || !video.videoWidth) return [null, null];
    const vw = video.videoWidth, vh = video.videoHeight;
    const half = Math.floor(vw / 2);
    const h = Math.round((w * vh) / half);

    return [0, 1].map((i) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d');
      // 镜像显示的左半边，对应原始帧的右半边（反过来也一样）
      g.translate(w, 0);
      g.scale(-1, 1);
      g.drawImage(video, i === 0 ? half : 0, 0, half, vh, 0, 0, w, h);
      return c.toDataURL('image/jpeg', 0.82);
    });
  }

  return { supported, secure, start, stop, mirrorTo, detach, snapshot, on, status, seatOf, ready };
})();
