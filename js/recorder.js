/**
 * Recorder —— 跟读录音
 *
 * 每一句可以录一段自己的声音，立刻回放跟原唱/TTS 对比。
 * 录音只存在当前页面的内存里，刷新就没了，不会上传到任何地方。
 */
const Recorder = (() => {
  let stream = null;
  let mediaRecorder = null;
  let chunks = [];
  let activeLineId = null;
  const takes = {}; // lineId -> objectURL

  const isSupported = () =>
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  async function ensureStream() {
    if (stream && stream.active) return stream;
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  }

  function pickMime() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
  }

  async function start(lineId) {
    if (!isSupported()) throw new Error('unsupported');
    await ensureStream();
    stop(); // 保证同时只有一个在录

    chunks = [];
    activeLineId = lineId;
    const mimeType = pickMime();
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    mediaRecorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      if (!chunks.length) return;
      const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
      if (takes[activeLineId]) URL.revokeObjectURL(takes[activeLineId]);
      takes[activeLineId] = URL.createObjectURL(blob);
      document.dispatchEvent(new CustomEvent('rec:saved', { detail: { lineId: activeLineId } }));
      activeLineId = null;
    };

    mediaRecorder.start();
    return true;
  }

  function stop() {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
  }

  function isRecording() { return !!mediaRecorder && mediaRecorder.state === 'recording'; }
  function currentLine() { return isRecording() ? activeLineId : null; }
  function getTake(lineId) { return takes[lineId] || null; }

  let audioEl = null;
  function playTake(lineId) {
    const url = takes[lineId];
    if (!url) return false;
    if (!audioEl) audioEl = new Audio();
    audioEl.src = url;
    audioEl.play();
    return true;
  }

  function release() {
    stop();
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }

  return { isSupported, start, stop, isRecording, currentLine, getTake, playTake, release };
})();
