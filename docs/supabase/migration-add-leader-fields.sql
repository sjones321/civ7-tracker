-- Migration: Add level tracking and effects to leaders table
-- Date: 2025-11-03
-- Description: Add columns for player-specific level tracking, effects, and level unlocks

-- Add new columns to leaders table
ALTER TABLE leaders 
ADD COLUMN IF NOT EXISTS tiny_level INTEGER DEFAULT 1 CHECK (tiny_level >= 1 AND tiny_level <= 10),
ADD COLUMN IF NOT EXISTS steve_level INTEGER DEFAULT 1 CHECK (steve_level >= 1 AND steve_level <= 10),
ADD COLUMN IF NOT EXISTS effects JSONB,
ADD COLUMN IF NOT EXISTS level_unlocks JSONB;

-- Create leader game history table
CREATE TABLE IF NOT EXISTS leader_game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id TEXT REFERENCES leaders(id) ON DELETE CASCADE,
  game_id TEXT,
  player_role TEXT NOT NULL CHECK (player_role IN ('Tiny', 'Steve')),
  civ_id TEXT REFERENCES civilizations(id),
  age_reached TEXT,
  is_abandoned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_leader_game_history_leader 
ON leader_game_history(leader_id);

CREATE INDEX IF NOT EXISTS idx_leader_game_history_player 
ON leader_game_history(player_role);

-- Add comments for documentation
COMMENT ON COLUMN leaders.tiny_level IS 'Current level (1-10) for player Tiny';
COMMENT ON COLUMN leaders.steve_level IS 'Current level (1-10) for player Steve';
COMMENT ON COLUMN leaders.effects IS 'Array of leader abilities/bonuses as JSONB';
COMMENT ON COLUMN leaders.level_unlocks IS 'Array of level unlock entries: [{level, type, description}]';
COMMENT ON TABLE leader_game_history IS 'Tracks each game played with a leader';

