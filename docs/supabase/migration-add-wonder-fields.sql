-- Migration: Add production_cost, associated_civ_id, update civ_specific_unlock, create history table
-- Run this in Supabase SQL Editor after initial schema is created

-- Add production_cost to world_wonders
ALTER TABLE world_wonders 
ADD COLUMN IF NOT EXISTS production_cost INTEGER;

-- Add associated_civ_id to world_wonders
ALTER TABLE world_wonders 
ADD COLUMN IF NOT EXISTS associated_civ_id TEXT REFERENCES civilizations(id);

-- Change civ_specific_unlock from TEXT to JSONB
-- First, convert existing data if any
UPDATE world_wonders 
SET civ_specific_unlock = NULL 
WHERE civ_specific_unlock IS NOT NULL AND civ_specific_unlock != '';

-- Drop and recreate as JSONB
ALTER TABLE world_wonders 
DROP COLUMN IF EXISTS civ_specific_unlock;

ALTER TABLE world_wonders 
ADD COLUMN civ_specific_unlock JSONB;

-- Create wonder_ownership_history table
CREATE TABLE IF NOT EXISTS wonder_ownership_history (
  id SERIAL PRIMARY KEY,
  wonder_id TEXT REFERENCES world_wonders(id) ON DELETE CASCADE,
  game_id TEXT, -- References games table (will be added later)
  owner_role TEXT CHECK (owner_role IN ('Tiny', 'Steve', 'AI')),
  owner_leader_id TEXT REFERENCES leaders(id),
  owner_civ_id TEXT REFERENCES civilizations(id),
  age TEXT REFERENCES ages(id),
  is_abandoned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wonder_history_wonder_id ON wonder_ownership_history(wonder_id);
CREATE INDEX IF NOT EXISTS idx_wonder_history_game_id ON wonder_ownership_history(game_id);

