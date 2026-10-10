# Supabase setup — lesson progress

The /learn track persists "lesson completed" ticks to Supabase, keyed by the
user's Google email (NextAuth still owns sign-in). This is the only piece
of cross-device state in the site — confidence/notes/answers stay in
localStorage.

## One-time setup

### 1. Create a project

<https://supabase.com> → **New project**. Pick the closest region and the
free tier. Wait ~2 min for provisioning.

### 2. Create the table

Open **SQL Editor** in the Supabase dashboard, paste, run:

```sql
create table if not exists lesson_progress (
  user_email   text  not null,
  lesson_id    text  not null,
  completed_at timestamptz not null default now(),
  primary key (user_email, lesson_id)
);

create index if not exists lesson_progress_user_idx
  on lesson_progress (user_email);

-- RLS off; we gate on auth() server-side and write via service role
alter table lesson_progress disable row level security;
```

(Optional, if you want a public "this many people completed this lesson"
counter later, keep RLS off and read aggregates server-side.)

### 3. Grab the keys

In the dashboard: **Project Settings → API**

| Key                          | Where it goes                            |
|------------------------------|------------------------------------------|
| Project URL                  | `NEXT_PUBLIC_SUPABASE_URL`               |
| `anon` `public` key          | `NEXT_PUBLIC_SUPABASE_ANON_KEY`          |
| `service_role` `secret` key  | `SUPABASE_SERVICE_ROLE_KEY` (server-only)|

### 4. Add to `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

`NEXT_PUBLIC_` keys are intentionally inlined into the browser bundle —
they're public by design. The `service_role` key is server-only; never
prefix it with `NEXT_PUBLIC_` and never expose it through a route response.

## Behavior when env is missing

Both at dev time and in prod, if any of the three vars are unset, the
/learn pages still render — ticks just stay client-side and a small banner
warns "Progress is local only — set up Supabase to sync across devices."
