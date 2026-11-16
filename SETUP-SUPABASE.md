# Supabase setup (about 10 minutes, free plan is enough)

1. Go to supabase.com, sign up, click **New project** (any name, pick a region near you, e.g. Singapore). Wait 1-2 minutes.
2. **Create your admin login:** Authentication > Users > **Add user** > *Create new user*. Use your email and a strong password. Tick "Auto Confirm User".
3. **Block strangers from signing up:** Authentication > Sign In / Providers (or "Providers" > Email) > turn **off** "Allow new users to sign up".
4. **Create the table:** open **SQL Editor** > New query > paste everything below > **Run**.
   Change `penhvong46@gmail.com` to the email you used in step 2 (keep it exactly the same).

```sql
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  interest text,
  message text not null,
  status text not null default 'new' check (status in ('new','done'))
);

alter table public.messages enable row level security;

-- Only YOUR login can read, update or delete. Visitors cannot read anything.
-- (The website saves new messages from the server with the service key, which skips these rules.)
create policy "owner reads"   on public.messages for select to authenticated
  using ((auth.jwt() ->> 'email') = 'penhvong46@gmail.com');
create policy "owner updates" on public.messages for update to authenticated
  using ((auth.jwt() ->> 'email') = 'penhvong46@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'penhvong46@gmail.com');
create policy "owner deletes" on public.messages for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'penhvong46@gmail.com');
```

5. **Copy 3 values** from Project Settings > API (or "API Keys"):
   - **Project URL** -> `SUPABASE_URL` in `.env` AND `url` in `admin-config.js`
   - **anon public key** -> `anonKey` in `admin-config.js` (safe to be public)
   - **service_role key** -> `SUPABASE_SERVICE_KEY` in `.env` (SECRET: never put it in admin-config.js or any browser file)
6. On Netlify, add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Site settings > Environment variables, then redeploy.
7. Open `/admin.html` on your site and log in.

If the service_role key is ever shown in a chat, screenshot or public repo, reset it in Project Settings > API.
