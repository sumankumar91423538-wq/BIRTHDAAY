-- ═══════════════════════════════════════════════════════
-- Cake Session Table (uses session_name column)
-- ═══════════════════════════════════════════════════════

create table if not exists public.cake_session (
  id uuid default gen_random_uuid() primary key,
  session_name text unique not null,
  boy_ready boolean default false not null,
  girl_ready boolean default false not null,
  boy_clicked_at timestamp with time zone,
  girl_clicked_at timestamp with time zone,
  cake_cut boolean default false not null,
  cut_at timestamp with time zone,
  waiting_message text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.cake_session enable row level security;

-- RLS Policies
create policy "Allow all access to cake_session"
  on public.cake_session
  for all
  to anon
  using (true)
  with check (true);

create policy "Allow authenticated access to cake_session"
  on public.cake_session
  for all
  to authenticated
  using (true)
  with check (true);

-- Enable Realtime
alter publication supabase_realtime add table cake_session;

-- Insert initial row
insert into public.cake_session (session_name, boy_ready, girl_ready, cake_cut, updated_at)
values ('main_birthday_cake', false, false, false, now())
on conflict (session_name) do nothing;

-- ═══════════════════════════════════════════════════════
-- RPC: set_cake_ready(input_role text)
-- Atomic server-side cake ready update with 10s window
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_cake_ready(input_role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  v_boy_ready boolean;
  v_girl_ready boolean;
  v_boy_clicked_at timestamptz;
  v_girl_clicked_at timestamptz;
  v_cake_cut boolean;
  v_now timestamptz := now();
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT boy_ready, girl_ready, boy_clicked_at, girl_clicked_at, cake_cut
  INTO v_boy_ready, v_girl_ready, v_boy_clicked_at, v_girl_clicked_at, v_cake_cut
  FROM public.cake_session
  WHERE session_name = 'main_birthday_cake'
  FOR UPDATE;

  -- If no row found, create it
  IF NOT FOUND THEN
    INSERT INTO public.cake_session (session_name, boy_ready, girl_ready, cake_cut, updated_at)
    VALUES ('main_birthday_cake', false, false, false, v_now);

    SELECT boy_ready, girl_ready, boy_clicked_at, girl_clicked_at, cake_cut
    INTO v_boy_ready, v_girl_ready, v_boy_clicked_at, v_girl_clicked_at, v_cake_cut
    FROM public.cake_session
    WHERE session_name = 'main_birthday_cake'
    FOR UPDATE;
  END IF;

  -- If already cut, return current state
  IF v_cake_cut THEN
    SELECT row_to_json(t) INTO result
    FROM (SELECT boy_ready, girl_ready, cake_cut, boy_clicked_at, girl_clicked_at, cut_at, updated_at
          FROM public.cake_session WHERE session_name = 'main_birthday_cake') t;
    RETURN result;
  END IF;

  -- Set the ready flag for the input role
  IF input_role = 'boy' THEN
    v_boy_ready := true;
    v_boy_clicked_at := v_now;
  ELSIF input_role = 'girl' THEN
    v_girl_ready := true;
    v_girl_clicked_at := v_now;
  END IF;

  -- Check if both are now ready within 10-second window
  IF v_boy_ready AND v_girl_ready THEN
    IF v_boy_clicked_at IS NOT NULL AND v_girl_clicked_at IS NOT NULL
       AND ABS(EXTRACT(EPOCH FROM (v_boy_clicked_at - v_girl_clicked_at))) <= 10 THEN
      -- Both ready within window → CUT!
      UPDATE public.cake_session
      SET boy_ready = true, girl_ready = true,
          boy_clicked_at = v_boy_clicked_at, girl_clicked_at = v_girl_clicked_at,
          cake_cut = true, cut_at = v_now, updated_at = v_now
      WHERE session_name = 'main_birthday_cake';
    ELSE
      -- Other side expired, reset them, keep current side
      IF input_role = 'boy' THEN
        UPDATE public.cake_session
        SET boy_ready = true, boy_clicked_at = v_now,
            girl_ready = false, girl_clicked_at = NULL,
            updated_at = v_now
        WHERE session_name = 'main_birthday_cake';
      ELSE
        UPDATE public.cake_session
        SET girl_ready = true, girl_clicked_at = v_now,
            boy_ready = false, boy_clicked_at = NULL,
            updated_at = v_now
        WHERE session_name = 'main_birthday_cake';
      END IF;
    END IF;
  ELSE
    -- Only one side ready
    UPDATE public.cake_session
    SET boy_ready = v_boy_ready, girl_ready = v_girl_ready,
        boy_clicked_at = v_boy_clicked_at, girl_clicked_at = v_girl_clicked_at,
        updated_at = v_now
    WHERE session_name = 'main_birthday_cake';
  END IF;

  -- Return updated state
  SELECT row_to_json(t) INTO result
  FROM (SELECT boy_ready, girl_ready, cake_cut, boy_clicked_at, girl_clicked_at, cut_at, updated_at
        FROM public.cake_session WHERE session_name = 'main_birthday_cake') t;
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.set_cake_ready(text) TO anon;
GRANT EXECUTE ON FUNCTION public.set_cake_ready(text) TO authenticated;
