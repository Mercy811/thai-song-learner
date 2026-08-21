-- 建好 Supabase 项目后，去 SQL Editor 里整段粘贴执行一次即可。
-- 登录注册用的是 Supabase 内置的 auth.users，不用自己建表；
-- 这里只需要一张表，存「哪个用户 · 哪首歌 · 单词掌握程度」。

create table if not exists vocab_progress (
  user_id    uuid references auth.users(id) on delete cascade not null,
  song_id    text not null,
  stats      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

alter table vocab_progress enable row level security;

-- 每个用户只能看到 / 改动自己的行，跟别人的数据完全隔离
create policy "用户只读自己的单词进度"
  on vocab_progress for select
  using (auth.uid() = user_id);

create policy "用户只能写自己的单词进度"
  on vocab_progress for insert
  with check (auth.uid() = user_id);

create policy "用户只能改自己的单词进度"
  on vocab_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
