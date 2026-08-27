-- 建好 Supabase 项目后，去 SQL Editor 里整段粘贴执行一次即可。
-- 登录注册用的是 Supabase 内置的 auth.users，不用自己建表。
--
-- 这个文件可以放心重复执行——已经跑过一次的话，表会因为 `if not exists` 跳过，
-- policy 先 drop 再 create 不会报「已存在」。以后加新的数据类型，
-- 照着下面的样子在文件末尾追加一段，再把整个文件重新跑一遍就行。

-- ════════ 单词掌握程度（每首歌一份） ════════
create table if not exists vocab_progress (
  user_id    uuid references auth.users(id) on delete cascade not null,
  song_id    text not null,
  stats      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, song_id)
);
alter table vocab_progress enable row level security;

drop policy if exists "用户只读自己的单词进度" on vocab_progress;
create policy "用户只读自己的单词进度"
  on vocab_progress for select using (auth.uid() = user_id);

drop policy if exists "用户只能写自己的单词进度" on vocab_progress;
create policy "用户只能写自己的单词进度"
  on vocab_progress for insert with check (auth.uid() = user_id);

drop policy if exists "用户只能改自己的单词进度" on vocab_progress;
create policy "用户只能改自己的单词进度"
  on vocab_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════ 歌词句子「已掌握」打勾（每首歌一份） ════════
create table if not exists line_done (
  user_id    uuid references auth.users(id) on delete cascade not null,
  song_id    text not null,
  done_ids   jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, song_id)
);
alter table line_done enable row level security;

drop policy if exists "用户只读自己的句子进度" on line_done;
create policy "用户只读自己的句子进度"
  on line_done for select using (auth.uid() = user_id);

drop policy if exists "用户只能写自己的句子进度" on line_done;
create policy "用户只能写自己的句子进度"
  on line_done for insert with check (auth.uid() = user_id);

drop policy if exists "用户只能改自己的句子进度" on line_done;
create policy "用户只能改自己的句子进度"
  on line_done for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════ 歌词时间轴校准结果（每首歌 + 每个音源一份） ════════
create table if not exists timeline_calib (
  user_id    uuid references auth.users(id) on delete cascade not null,
  song_id    text not null,
  youtube_id text not null,
  times      jsonb not null default '{}'::jsonb,
  marked     jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, song_id, youtube_id)
);
alter table timeline_calib enable row level security;

drop policy if exists "用户只读自己的时间轴校准" on timeline_calib;
create policy "用户只读自己的时间轴校准"
  on timeline_calib for select using (auth.uid() = user_id);

drop policy if exists "用户只能写自己的时间轴校准" on timeline_calib;
create policy "用户只能写自己的时间轴校准"
  on timeline_calib for insert with check (auth.uid() = user_id);

drop policy if exists "用户只能改自己的时间轴校准" on timeline_calib;
create policy "用户只能改自己的时间轴校准"
  on timeline_calib for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════ 词频总表「记住了」标记（全站范围，不分歌，每个用户一行） ════════
create table if not exists freq_learned (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  words      jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table freq_learned enable row level security;

drop policy if exists "用户只读自己的记住标记" on freq_learned;
create policy "用户只读自己的记住标记"
  on freq_learned for select using (auth.uid() = user_id);

drop policy if exists "用户只能写自己的记住标记" on freq_learned;
create policy "用户只能写自己的记住标记"
  on freq_learned for insert with check (auth.uid() = user_id);

drop policy if exists "用户只能改自己的记住标记" on freq_learned;
create policy "用户只能改自己的记住标记"
  on freq_learned for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════ 记忆课进度：哪几课学完了 + 单词卡「学过/没学过」（每个用户一行） ════════
create table if not exists lesson_progress (
  user_id     uuid references auth.users(id) on delete cascade primary key,
  done        jsonb not null default '{}'::jsonb,
  word_status jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table lesson_progress enable row level security;

drop policy if exists "用户只读自己的记忆课进度" on lesson_progress;
create policy "用户只读自己的记忆课进度"
  on lesson_progress for select using (auth.uid() = user_id);

drop policy if exists "用户只能写自己的记忆课进度" on lesson_progress;
create policy "用户只能写自己的记忆课进度"
  on lesson_progress for insert with check (auth.uid() = user_id);

drop policy if exists "用户只能改自己的记忆课进度" on lesson_progress;
create policy "用户只能改自己的记忆课进度"
  on lesson_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════ 每日学习记录：打卡 + 每天学习时长（每个用户一行） ════════
create table if not exists daily_activity (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  days       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table daily_activity enable row level security;

-- 新版项目不会自动把新表暴露给 Data API；这里只开放前端同步实际需要的权限。
revoke all on table daily_activity from anon, authenticated;
grant select, insert, update on table daily_activity to authenticated;

drop policy if exists "用户只读自己的每日记录" on daily_activity;
create policy "用户只读自己的每日记录"
  on daily_activity for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "用户只能写自己的每日记录" on daily_activity;
create policy "用户只能写自己的每日记录"
  on daily_activity for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "用户只能改自己的每日记录" on daily_activity;
create policy "用户只能改自己的每日记录"
  on daily_activity for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
