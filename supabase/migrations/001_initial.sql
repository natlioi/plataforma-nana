-- Plataforma Nana — initial schema
-- Apply this to your Supabase project when wiring real persistence.

create table if not exists profiles (
  id text primary key,
  role text not null check (role in ('admin', 'student')),
  name text not null,
  email text unique not null,
  initials text,
  avatar_tone text default 'lavender',
  created_at timestamptz default now()
);

create table if not exists student_meta (
  profile_id text primary key references profiles(id) on delete cascade,
  cohort text default '',
  payment_status text default 'active',
  is_active boolean default true,
  notes text default '',
  target_lang text default 'English',
  teacher text default 'Natália',
  level text default 'A1',
  pct integer default 0,
  xp integer default 0,
  xp_today integer default 0,
  focus_for_next_class text default '',
  daily_unlocked_date date,
  daily_just_unlocked boolean default false
);

create table if not exists words (
  id text primary key,
  owner_id text not null references profiles(id) on delete cascade,
  word text not null,
  pos text,
  native_def text,
  target_def text,
  example text,
  status text default 'new' check (status in ('new', 'learning', 'mastered')),
  level text,
  flag text,
  class_label text,
  created_at timestamptz default now()
);

create table if not exists homework (
  id text primary key,
  student_id text not null references profiles(id) on delete cascade,
  created_by text not null references profiles(id),
  title text not null,
  brief text default '',
  pdf_path text,
  pdf_name text,
  fields jsonb default '[]',
  status text default 'assigned' check (status in ('assigned', 'in_progress', 'submitted', 'graded')),
  due_at date,
  minutes integer default 15,
  grade numeric,
  feedback text,
  submitted_at timestamptz,
  graded_at timestamptz,
  answers jsonb default '{}',
  comments jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists materials (
  id text primary key,
  uploaded_by text not null references profiles(id),
  scope text default 'global' check (scope in ('global', 'student')),
  student_id text references profiles(id) on delete set null,
  kind text not null,
  title text not null,
  unit text default '',
  size_label text default '',
  tone text default 'lavender',
  icon text default 'paper',
  file_path text,
  file_name text,
  external_url text,
  fav_by text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists classes (
  id text primary key,
  owner_id text not null references profiles(id) on delete cascade,
  title text not null,
  date date not null,
  time text,
  duration integer default 60,
  focus text default '',
  status text default 'scheduled' check (status in ('scheduled', 'done', 'cancelled')),
  meet_url text
);

create table if not exists flashcard_reviews (
  word_id text primary key references words(id) on delete cascade,
  correct integer default 0,
  wrong integer default 0,
  last_seen timestamptz
);

-- RLS (enable per-table after wiring Supabase Auth)
-- alter table profiles enable row level security;
-- alter table homework enable row level security;
-- etc.
