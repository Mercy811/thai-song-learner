/**
 * Auth —— 登录注册（邮箱 + 密码，以及 Google 一键登录），基于 Supabase Auth。
 *
 * js/config.js 里没填真的 Supabase 项目信息时，整个模块自动降级：
 * 不报错，登录入口点了给个提示，网站其它功能（游客模式）完全不受影响。
 */
window.Auth = (() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  const cfg = window.SUPABASE_CONFIG || {};
  const configured = !!(cfg.url && cfg.anonKey && !cfg.url.includes('YOUR-PROJECT'));
  const client = configured && window.supabase
    ? window.supabase.createClient(cfg.url, cfg.anonKey)
    : null;

  let user = null;
  const listeners = [];
  const notify = () => listeners.forEach((fn) => fn(user));

  function isLoggedIn() { return !!user; }
  function currentUser() { return user; }
  /** 登录状态变化（登录/登出/刚恢复 session）时会被调用一次，给 vocab.js 这类模块订阅用 */
  function onChange(fn) { listeners.push(fn); }

  async function signUp(email, password) {
    if (!client) throw new Error('还没配置 Supabase，登录注册暂时用不了');
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }
  async function signIn(email, password) {
    if (!client) throw new Error('还没配置 Supabase，登录注册暂时用不了');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
  }
  async function signInWithGoogle() {
    if (!client) throw new Error('还没配置 Supabase，登录注册暂时用不了');
    // OAuth 令牌会被 Supabase 放在 URL fragment（#access_token=...）里。
    // 不能用完整的 location.href 作为下次回调地址，否则会把旧令牌嵌进新地址，
    // 变成 ##access_token=...#access_token=...。保留 ?song=... 这类页面状态即可。
    const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
  }

  function clearAuthFragment() {
    const hash = window.location.hash;
    if (!/(?:access_token|refresh_token|error(?:_description)?)=/.test(hash)) return;
    history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
  }

  /* ════════ 登录注册面板 ════════ */

  let mode = 'signin'; // signin 登录 | signup 注册

  function renderModal() {
    $('#authModalTitle').textContent = mode === 'signin' ? '登录' : '注册';
    $('#authSubmit').textContent = mode === 'signin' ? '登录' : '注册';
    $('#authSwitch').textContent = mode === 'signin' ? '还没有账号？点这里注册' : '已经有账号？点这里登录';
    $('#authError').textContent = '';
  }

  function openModal() {
    if (!configured) {
      alert('还没配置 Supabase（js/config.js 里填一下项目地址和 anon key），登录注册功能暂时用不了，游客模式不受影响。');
      return;
    }
    mode = 'signin';
    renderModal();
    $('#authModal').classList.remove('hidden');
    $('#authEmail').focus();
  }

  function updateAccountBtn() {
    const btn = $('#btnAccount');
    if (!btn) return;
    btn.textContent = user ? `👤 ${user.email} · 退出` : '👤 登录 / 注册';
  }

  function bind() {
    // 登录入口在导航抽屉里，首页/歌曲页/词频页/记忆课/覆盖率页都能点到，
    // 但只有歌曲页才会去初始化那一整套「点弹窗外面关掉 / Esc 关掉」的通用逻辑，
    // 所以这个弹窗自己管自己的关闭，不指望别的页面帮它接好
    const modal = $('#authModal');
    modal?.querySelector('[data-close]')?.addEventListener('click', () => modal.classList.add('hidden'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    $('#btnAccount')?.addEventListener('click', () => {
      if (user) {
        if (confirm(`退出 ${user.email} 的登录？`)) signOut();
      } else {
        openModal();
      }
    });

    $('#authSwitch')?.addEventListener('click', () => {
      mode = mode === 'signin' ? 'signup' : 'signin';
      renderModal();
    });

    $('#authGoogle')?.addEventListener('click', async () => {
      const errEl = $('#authError');
      errEl.textContent = '';
      try {
        await signInWithGoogle();
      } catch (err) {
        errEl.textContent = err.message || '出错了，再试一次';
      }
    });

    $('#authForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#authEmail').value.trim();
      const password = $('#authPassword').value;
      const errEl = $('#authError');
      const submitBtn = $('#authSubmit');
      errEl.textContent = '';
      submitBtn.disabled = true;
      try {
        if (mode === 'signin') {
          await signIn(email, password);
          $('#authModal').classList.add('hidden');
          $('#authForm').reset();
        } else {
          await signUp(email, password);
          errEl.textContent = '注册成功，正在给你登录…';
          setTimeout(() => {
            $('#authModal').classList.add('hidden');
            $('#authForm').reset();
          }, 1200);
        }
      } catch (err) {
        errEl.textContent = err.message || '出错了，再试一次';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  function init() {
    bind();
    updateAccountBtn();
    if (!configured) return;
    client.auth.onAuthStateChange((_event, session) => {
      user = session?.user || null;
      updateAccountBtn();
      notify();
      // createClient 已在这个回调前从 fragment 恢复 session，现在可以安全清掉地址栏里的令牌。
      clearAuthFragment();
    });
  }

  return {
    init, isLoggedIn, currentUser, onChange,
    client: () => client, configured: () => configured,
  };
})();
