-- Create the cake_session table (Singular)
create table if not exists public.cake_session (
  id uuid default gen_random_uuid() primary key,
  session_key text unique not null,
  boy_ready boolean default false not null,
  girl_ready boolean default false not null,
  boy_clicked_at timestamp with time zone,
  girl_clicked_at timestamp with time zone,
  cake_cut boolean default false not null,
  cut_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for the cake_session table
-- To enable realtime:
-- Go to Database -> Publications -> supabase_realtime -> Toggle public.cake_session active.
-- Or run this command:
alter publication supabase_realtime add table cake_session;

-- Allow anonymous select/insert/update
-- RLS policies can be customized as needed. For simplicity:
alter table public.cake_session enable row level security;

create policy "Allow all access to cake_session"
  on public.cake_session
  for all
  to anon
  using (true)
  with check (true);
