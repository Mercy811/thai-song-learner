/** 全局词汇修订 + 管理员身份。正文仍在 songs/*.js，Supabase 只保存覆盖层。 */
window.WordAdmin = (() => {
  'use strict';

  let overrides = new Map();
  let admin = false;
  let loaded = false;
  let loading = null;
  const listeners = [];

  const client = () => window.Auth?.configured() ? window.Auth.client() : null;
  const notify = () => listeners.forEach((fn) => fn());

  async function load() {
    if (loading) return loading;
    loading = (async () => {
      const c = client();
      if (!c) { loaded = true; return; }
      const { data, error } = await c
        .from('word_overrides')
        .select('original_th,th,ro,cn,mean,hidden,updated_at');
      if (error) console.warn('[WordAdmin] 加载词汇修订失败；请确认已执行最新 schema.sql', error);
      else overrides = new Map((data || []).map((row) => [row.original_th, row]));
      loaded = true;
      notify();
    })().finally(() => { loading = null; });
    return loading;
  }

  async function checkAdmin() {
    admin = false;
    const c = client();
    const uid = window.Auth?.currentUser()?.id;
    if (c && uid) {
      const { data, error } = await c.from('admin_users').select('user_id').eq('user_id', uid).maybeSingle();
      if (error) console.warn('[WordAdmin] 检查管理员身份失败', error);
      admin = !!data;
    }
    notify();
    return admin;
  }

  function apply(word) {
    const key = word.originalTh || word.th;
    const row = overrides.get(key);
    return row ? { ...word, originalTh: key, th: row.th, ro: row.ro, cn: row.cn, mean: row.mean, hidden: row.hidden, overridden: true }
      : { ...word, originalTh: key, hidden: false, overridden: false };
  }

  async function save(originalTh, values) {
    if (!admin) throw new Error('这个账号没有管理员权限');
    const c = client();
    const uid = window.Auth.currentUser().id;
    const row = {
      original_th: originalTh,
      th: values.th.trim(), ro: values.ro.trim(), cn: values.cn.trim(), mean: values.mean.trim(),
      hidden: !!values.hidden, updated_by: uid, updated_at: new Date().toISOString(),
    };
    if (!row.th) throw new Error('泰语词不能为空');
    const { error } = await c.from('word_overrides').upsert(row, { onConflict: 'original_th' });
    if (error) throw error;
    overrides.set(originalTh, row);
    notify();
  }

  async function reset(originalTh) {
    if (!admin) throw new Error('这个账号没有管理员权限');
    const { error } = await client().from('word_overrides').delete().eq('original_th', originalTh);
    if (error) throw error;
    overrides.delete(originalTh);
    notify();
  }

  if (window.Auth) window.Auth.onChange(() => { checkAdmin(); load(); });
  queueMicrotask(() => load());

  return {
    load, checkAdmin, apply, save, reset,
    isAdmin: () => admin, isLoaded: () => loaded,
    get: (originalTh) => overrides.get(originalTh) || null,
    onChange: (fn) => listeners.push(fn),
  };
})();
