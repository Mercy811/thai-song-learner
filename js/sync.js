/**
 * Sync —— 登录用户的数据云端读写（Supabase）。
 *
 * 现在只接了单词掌握程度这一类数据（对应 Supabase 里的 vocab_progress 表），
 * 其它 localStorage 里的数据（时间轴校准、已学标记、朗读设置……）还是纯本地，
 * 以后要接的话照这个文件的样子加一对 pull/push 函数就行。
 *
 * 没登录、或者压根没配置 Supabase 的时候，这些函数直接跟没发生一样返回空 /
 * 什么也不做，调用方（vocab.js）该怎么用 localStorage 还怎么用，不受影响。
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

  /** 拉这首歌云端存的单词进度；没登录 / 云端还没有就返回 null */
  async function pullVocabProgress(songId) {
    const c = client();
    const uid = userId();
    if (!c || !uid) return null;
    const { data, error } = await c
      .from('vocab_progress')
      .select('stats')
      .eq('user_id', uid)
      .eq('song_id', songId)
      .maybeSingle();
    if (error) { console.warn('[Sync] 拉取单词进度失败', error); return null; }
    return data ? data.stats : null;
  }

  /** 把这首歌的单词进度写回云端；没登录就什么也不做，静默跳过、不报错 */
  async function pushVocabProgress(songId, stats) {
    const c = client();
    const uid = userId();
    if (!c || !uid) return;
    const { error } = await c
      .from('vocab_progress')
      .upsert(
        { user_id: uid, song_id: songId, stats, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,song_id' }
      );
    if (error) console.warn('[Sync] 保存单词进度失败', error);
  }

  return { pullVocabProgress, pushVocabProgress };
})();
