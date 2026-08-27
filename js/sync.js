/**
 * Sync —— 登录用户的数据云端读写（Supabase）。
 *
 * 接了这几类数据（各自对应 Supabase 里的一张表）：
 *   单词掌握程度         vocab_progress   （vocab.js）
 *   歌词句子「已掌握」    line_done        （app.js）
 *   时间轴校准结果        timeline_calib   （app.js）
 *   词频总表「记住了」    freq_learned     （wordfreq.js）
 *   记忆课进度            lesson_progress  （lessons.js）
 *
 * 没接的（朗读语速、选的音色、深浅色、固定栏这些）是纯粹的「这台设备」偏好，
 * 不是「我学到哪了」这种该跟着账号走的东西，所以留在本地，不用同步。
 *
 * 没登录、或者压根没配置 Supabase 的时候，下面这些函数直接跟没发生一样返回空 /
 * 什么也不做，调用方该怎么用 localStorage 还怎么用，不受影响。
 */
window.Sync = (() => {
  'use strict';

  function client() {
    return window.Auth && window.Auth.configured() ? window.Auth.client() : null;
  }
  function userId() {
    const u = window.Auth && window.Auth.currentUser();
    return u ? u.id : null;
  }

  /** 通用单行拉取：按 match 里的条件查一行，没登录 / 没有就返回 null */
  async function pullRow(table, match, columns) {
    const c = client();
    const uid = userId();
    if (!c || !uid) return null;
    let q = c.from(table).select(columns).eq('user_id', uid);
    Object.entries(match).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q.maybeSingle();
    if (error) { console.warn(`[Sync] 拉取 ${table} 失败`, error); return null; }
    return data;
  }

  /** 通用单行写回：没登录就什么也不做，静默跳过、不报错 */
  async function pushRow(table, row, onConflict) {
    const c = client();
    const uid = userId();
    if (!c || !uid) return;
    const { error } = await c
      .from(table)
      .upsert({ ...row, user_id: uid, updated_at: new Date().toISOString() }, { onConflict });
    if (error) console.warn(`[Sync] 保存 ${table} 失败`, error);
  }

  /* ── 单词掌握程度 ── */
  const pullVocabProgress = (songId) =>
    pullRow('vocab_progress', { song_id: songId }, 'stats').then((d) => (d ? d.stats : null));
  const pushVocabProgress = (songId, stats) =>
    pushRow('vocab_progress', { song_id: songId, stats }, 'user_id,song_id');

  /* ── 歌词句子「已掌握」 ── */
  const pullLineDone = (songId) =>
    pullRow('line_done', { song_id: songId }, 'done_ids').then((d) => (d ? d.done_ids : null));
  const pushLineDone = (songId, doneIds) =>
    pushRow('line_done', { song_id: songId, done_ids: doneIds }, 'user_id,song_id');

  /* ── 时间轴校准 ── */
  const pullTimelineCalib = (songId, youtubeId) =>
    pullRow('timeline_calib', { song_id: songId, youtube_id: youtubeId }, 'times,marked');
  const pushTimelineCalib = (songId, youtubeId, times, marked) =>
    pushRow('timeline_calib', { song_id: songId, youtube_id: youtubeId, times, marked }, 'user_id,song_id,youtube_id');

  /* ── 词频总表「记住了」（全站范围，不分歌，一个用户一行） ── */
  const pullFreqLearned = () =>
    pullRow('freq_learned', {}, 'words').then((d) => (d ? d.words : null));
  const pushFreqLearned = (words) =>
    pushRow('freq_learned', { words }, 'user_id');

  /* ── 记忆课进度（一个用户一行） ── */
  const pullLessonProgress = () =>
    pullRow('lesson_progress', {}, 'done,word_status');
  const pushLessonProgress = (done, wordStatus) =>
    pushRow('lesson_progress', { done, word_status: wordStatus }, 'user_id');

  /* ── 每日学习：打卡、学习秒数、正确率（一个用户一行） ── */
  const pullDailyActivity = () =>
    pullRow('daily_activity', {}, 'days').then((d) => (d ? d.days : null));
  const pushDailyActivity = (days) =>
    pushRow('daily_activity', { days }, 'user_id');

  return {
    pullVocabProgress, pushVocabProgress,
    pullLineDone, pushLineDone,
    pullTimelineCalib, pushTimelineCalib,
    pullFreqLearned, pushFreqLearned,
    pullLessonProgress, pushLessonProgress,
    pullDailyActivity, pushDailyActivity,
  };
})();
