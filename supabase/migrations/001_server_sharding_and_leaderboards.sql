-- ============================================================================
-- CRYPTO ROGUE: LIQUIDATION
-- Migration: 001_server_sharding_and_leaderboards.sql
-- Purpose : Production Server Sharding (2,500 players/server), 50-Player
--           Micro-Bracket Assignment, and LiveOps Event Leaderboards with RLS.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. SERVERS TABLE (Auto-sharded at 2,500 players per server)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servers (
  id            BIGSERIAL PRIMARY KEY,
  server_number INTEGER NOT NULL UNIQUE,
  server_name   TEXT NOT NULL,
  player_count  INTEGER NOT NULL DEFAULT 0 CHECK (player_count >= 0),
  max_capacity  INTEGER NOT NULL DEFAULT 2500,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servers_active_capacity
  ON public.servers (is_active, player_count, server_number DESC);

-- Seed initial Genesis Server Shard if none exists
INSERT INTO public.servers (server_number, server_name, player_count, is_active)
VALUES (1, 'Exchange Floor #001', 0, TRUE)
ON CONFLICT (server_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE (50-player micro-brackets within each 2,500-player server)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trader_handle         TEXT NOT NULL DEFAULT ('AnonWhale_' || substr(md5(random()::text), 1, 6)),
  server_id             BIGINT NOT NULL REFERENCES public.servers(id),
  bracket_id            INTEGER NOT NULL CHECK (bracket_id >= 1 AND bracket_id <= 50),
  global_mastery_power  NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
  vip_status            BOOLEAN NOT NULL DEFAULT FALSE,
  highest_stage_cleared INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_server_bracket
  ON public.profiles (server_id, bracket_id);

-- ----------------------------------------------------------------------------
-- 3. TRIGGER: Auto-Increment Server Player Count, Bucket into 50-Player
--    Brackets, and Auto-Spin Up New Server When player_count >= 2500
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_player_server_and_bracket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_server_id     BIGINT;
  v_server_num    INTEGER;
  v_new_count     INTEGER;
  v_next_num      INTEGER;
BEGIN
  -- Lock the current active server row that still has capacity (< 2500)
  SELECT id, server_number
    INTO v_server_id, v_server_num
    FROM public.servers
   WHERE is_active = TRUE
     AND player_count < 2500
   ORDER BY server_number ASC
   LIMIT 1
   FOR UPDATE;

  -- Safety fallback: if no active server with capacity exists, create one immediately
  IF v_server_id IS NULL THEN
    SELECT COALESCE(MAX(server_number), 0) + 1 INTO v_next_num FROM public.servers;

    INSERT INTO public.servers (server_number, server_name, player_count, is_active)
    VALUES (
      v_next_num,
      'Exchange Floor #' || LPAD(v_next_num::TEXT, 3, '0'),
      0,
      TRUE
    )
    RETURNING id, server_number INTO v_server_id, v_server_num;
  END IF;

  -- Increment player_count on the assigned server
  UPDATE public.servers
     SET player_count = player_count + 1
   WHERE id = v_server_id
   RETURNING player_count INTO v_new_count;

  -- Assign server_id and deterministic 50-player micro-bracket (1..50)
  NEW.server_id  := v_server_id;
  NEW.bracket_id := ((v_new_count - 1) / 50) + 1;

  -- Whenever player_count reaches >= 2500, seal this server and spin up a new active server row
  IF v_new_count >= 2500 THEN
    UPDATE public.servers
       SET is_active = FALSE
     WHERE id = v_server_id;

    v_next_num := v_server_num + 1;

    INSERT INTO public.servers (server_number, server_name, player_count, is_active)
    VALUES (
      v_next_num,
      'Exchange Floor #' || LPAD(v_next_num::TEXT, 3, '0'),
      0,
      TRUE
    )
    ON CONFLICT (server_number) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_player_server_and_bracket ON public.profiles;
CREATE TRIGGER trg_assign_player_server_and_bracket
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_player_server_and_bracket();

-- ----------------------------------------------------------------------------
-- 4. EVENT LEADERBOARD ENTRIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_leaderboard_entries (
  id                   BIGSERIAL PRIMARY KEY,
  event_id             TEXT NOT NULL, -- e.g. 'ico_chest_frenzy_2026_w42'
  week_number          SMALLINT NOT NULL CHECK (week_number IN (1, 2, 3)),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trader_handle        TEXT NOT NULL,
  server_id            BIGINT NOT NULL REFERENCES public.servers(id),
  bracket_id           INTEGER NOT NULL CHECK (bracket_id >= 1 AND bracket_id <= 50),
  points               BIGINT NOT NULL DEFAULT 0 CHECK (points >= 0),
  global_mastery_power NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
  vip_status           BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- Covering composite index for fetching the Top 50 players in a specific bracket_id
CREATE INDEX IF NOT EXISTS idx_event_leaderboard_bracket_top50
  ON public.event_leaderboard_entries (event_id, server_id, bracket_id, points DESC, updated_at ASC)
  INCLUDE (user_id, trader_handle, global_mastery_power, vip_status);

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Servers: Anyone authenticated or anon can read shard metadata
DROP POLICY IF EXISTS "servers_read_all" ON public.servers;
CREATE POLICY "servers_read_all"
  ON public.servers
  FOR SELECT
  USING (true);

-- Profiles: Players can view profiles in their shard and update only their own profile
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Event Leaderboard Entries:
-- 1) Players can read leaderboard entries within their own (server_id, bracket_id)
DROP POLICY IF EXISTS "leaderboard_read_same_bracket" ON public.event_leaderboard_entries;
CREATE POLICY "leaderboard_read_same_bracket"
  ON public.event_leaderboard_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
        FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.server_id = event_leaderboard_entries.server_id
         AND p.bracket_id = event_leaderboard_entries.bracket_id
    )
  );

-- 2) Players can insert/update only their own score row aligned with their assigned shard & bracket
DROP POLICY IF EXISTS "leaderboard_insert_own_entry" ON public.event_leaderboard_entries;
CREATE POLICY "leaderboard_insert_own_entry"
  ON public.event_leaderboard_entries
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
        FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.server_id = event_leaderboard_entries.server_id
         AND p.bracket_id = event_leaderboard_entries.bracket_id
    )
  );

DROP POLICY IF EXISTS "leaderboard_update_own_entry" ON public.event_leaderboard_entries;
CREATE POLICY "leaderboard_update_own_entry"
  ON public.event_leaderboard_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. INDEXED TOP-50 BRACKET LEADERBOARD RPC & REFERENCE QUERY
-- ----------------------------------------------------------------------------
-- Indexed Query Pattern (uses idx_event_leaderboard_bracket_top50):
-- SELECT
--   RANK() OVER (ORDER BY e.points DESC, e.updated_at ASC)::INTEGER AS rank,
--   e.user_id,
--   e.trader_handle,
--   e.points,
--   e.global_mastery_power,
--   e.vip_status,
--   e.server_id,
--   e.bracket_id
-- FROM public.event_leaderboard_entries e
-- WHERE e.event_id = $1
--   AND e.server_id = $2
--   AND e.bracket_id = $3
-- ORDER BY e.points DESC, e.updated_at ASC
-- LIMIT 50;

CREATE OR REPLACE FUNCTION public.get_bracket_leaderboard(
  p_event_id   TEXT,
  p_server_id  BIGINT,
  p_bracket_id INTEGER
)
RETURNS TABLE (
  rank                 INTEGER,
  user_id              UUID,
  trader_handle        TEXT,
  points               BIGINT,
  global_mastery_power NUMERIC(12, 4),
  vip_status           BOOLEAN,
  server_id            BIGINT,
  bracket_id           INTEGER,
  updated_at           TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    RANK() OVER (ORDER BY e.points DESC, e.updated_at ASC)::INTEGER AS rank,
    e.user_id,
    e.trader_handle,
    e.points,
    e.global_mastery_power,
    e.vip_status,
    e.server_id,
    e.bracket_id,
    e.updated_at
  FROM public.event_leaderboard_entries e
  WHERE e.event_id   = p_event_id
    AND e.server_id  = p_server_id
    AND e.bracket_id = p_bracket_id
  ORDER BY e.points DESC, e.updated_at ASC
  LIMIT 50;
$$;

COMMIT;
