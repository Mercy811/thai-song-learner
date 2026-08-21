/**
 * Supabase 项目配置。
 *
 * 去 supabase.com 建好项目后（Settings → API），把下面两个值换成自己项目的：
 *   url     Project URL，形如 https://xxxxxxxx.supabase.co
 *   anonKey anon / public key（新版 Supabase 叫 publishable key，格式是 sb_publishable_...；
 *           不管新旧格式，都不是 service_role / secret key —— 那个绝对不能放前端）
 *
 * 这个 key 设计上就是给前端公开用的——真正的访问控制在 Supabase 的
 * Row Level Security policy 里（每个用户只能读写自己的数据），不是靠隐藏这个 key，
 * 所以可以放心提交到仓库、部署到 Vercel。
 *
 * 没填的话（还是占位值），登录注册功能会自动关闭、点了给个提示，
 * 网站其它功能（游客模式，数据存在本地浏览器）完全不受影响。
 */
window.SUPABASE_CONFIG = {
  url: 'https://akaimfyahiphpsdyzfwy.supabase.co',
  anonKey: 'sb_publishable_z913ZcCLq_EqN4NSzb78qg_h4XE-Z36',
};
