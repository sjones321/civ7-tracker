-- CIV7 Tracker Database Schema
-- Run this in Supabase SQL Editor to create all tables
-- Based on data model from Lucy brainstorming session

-- Enable UUID extension (for IDs if we want)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Reference Tables (Static/Small)
-- ============================================

-- Ages enumeration
CREATE TABLE IF NOT EXISTS ages (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

INSERT INTO ages (id, display_name, sort_order) VALUES
  ('Antiquity', 'Antiquity', 1),
  ('Exploration', 'Exploration', 2),
  ('Modern', 'Modern', 3)
ON CONFLICT (id) DO NOTHING;

-- Ideologies enumeration (6 types)
CREATE TABLE IF NOT EXISTS ideologies (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL
);

INSERT INTO ideologies (id, label, description, sort_order) VALUES
  ('militaristic', 'Militaristic', 'Focus on military strength and conquest', 1),
  ('economic', 'Economic', 'Focus on trade and commerce', 2),
  ('scientific', 'Scientific', 'Focus on research and technology', 3),
  ('cultural', 'Cultural', 'Focus on culture and arts', 4),
  ('diplomatic', 'Diplomatic', 'Focus on diplomacy and alliances', 5),
  ('expansionist', 'Expansionist', 'Focus on territorial expansion', 6)
ON CONFLICT (id) DO NOTHING;

-- Technologies catalog
CREATE TABLE IF NOT EXISTS technologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  era TEXT REFERENCES ages(id),
  unlocks JSONB, -- Array of IDs this tech unlocks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Civics catalog
CREATE TABLE IF NOT EXISTS civics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  era TEXT REFERENCES ages(id),
  unlocks JSONB, -- Array of IDs this civic unlocks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Core Entity Tables
-- ============================================

-- World Wonders
CREATE TABLE IF NOT EXISTS world_wonders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  summary_bonus TEXT, -- Human-readable text with yield keywords
  icon_url TEXT,
  
  -- Unlock requirements
  unlock_tech TEXT REFERENCES technologies(id),
  unlock_civic TEXT REFERENCES civics(id),
  civ_specific_unlock TEXT, -- Optional civ ID for unique variants
  
  -- Placement requirements
  requirements JSONB, -- { era, tile, adjacency, etc. }
  
  -- Effects and bonuses
  effects JSONB, -- Array of effect IDs or strings
  civ_production_bonus TEXT, -- Civ ID that gets bonus production
  big_ticket BOOLEAN DEFAULT FALSE, -- Big Ticket Wonder flag
  
  -- Current ownership (denormalized for quick access)
  last_owner_role TEXT CHECK (last_owner_role IN ('Tiny', 'Steve', 'AI')),
  last_owner_leader_id TEXT,
  last_owner_civ_id TEXT,
  last_owner_age TEXT REFERENCES ages(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Natural Wonders
CREATE TABLE IF NOT EXISTS natural_wonders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  summary_bonus TEXT,
  icon_url TEXT,
  tile_count INTEGER CHECK (tile_count >= 1 AND tile_count <= 6),
  terrain_type TEXT, -- mountain, desert, coast, etc.
  
  -- Discovery/ownership
  continent TEXT,
  discovered_age TEXT REFERENCES ages(id),
  
  -- Current ownership
  last_controller_role TEXT CHECK (last_controller_role IN ('Tiny', 'Steve', 'AI')),
  last_controller_leader_id TEXT,
  last_controller_civ_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- City-States
CREATE TABLE IF NOT EXISTS city_states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  
  -- Per-game assignment (can change between games)
  ideology TEXT REFERENCES ideologies(id),
  
  -- Game tracking
  spawn_age TEXT REFERENCES ages(id),
  
  -- Current ownership
  last_controller_role TEXT CHECK (last_controller_role IN ('Tiny', 'Steve', 'AI')),
  last_controller_leader_id TEXT,
  last_controller_civ_id TEXT,
  last_controller_age TEXT REFERENCES ages(id),
  
  -- Optional flavor
  started_hostile BOOLEAN DEFAULT FALSE,
  homeland_continent TEXT,
  is_overseas BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Civilizations
CREATE TABLE IF NOT EXISTS civilizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age TEXT REFERENCES ages(id) NOT NULL,
  enduring_capable BOOLEAN DEFAULT FALSE,
  
  -- Bonuses & uniques
  passive_bonuses JSONB, -- Array of bonus strings
  unique_units JSONB, -- Array of unit IDs
  unique_buildings_or_quarters JSONB, -- Array of building IDs
  
  -- Production bonus for specific wonder
  production_bonus_for_wonder TEXT REFERENCES world_wonders(id),
  
  -- Unlock metadata for uniques (stored as JSONB for flexibility)
  unique_unlocks JSONB, -- { unitId: { unlockedBy: techId|civicId }, ... }
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaders
CREATE TABLE IF NOT EXISTS leaders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  civ_id TEXT REFERENCES civilizations(id),
  picture_url TEXT,
  bonuses JSONB, -- Array of bonus strings
  
  -- Leveling (Tiny & Steve only)
  levels INTEGER DEFAULT 10 CHECK (levels >= 1 AND levels <= 10),
  level_progress JSONB, -- { Tiny: number, Steve: number }
  unlock_notes JSONB, -- { level: text } or array of notes
  used_this_game JSONB, -- { Tiny: boolean, Steve: boolean }
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mementos
CREATE TABLE IF NOT EXISTS mementos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  bonus TEXT, -- Supports yield keywords
  unlock_condition TEXT, -- default, byAchievement, byLeaderLevel, other
  unlock_description TEXT,
  
  -- Usage stats
  times_used_by JSONB, -- { Tiny: number, Steve: number }
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Ownership History (For all entities that change hands)
-- ============================================

-- Unified ownership history table (works for wonders, natural wonders, city-states)
CREATE TABLE IF NOT EXISTS ownership_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('world_wonder', 'natural_wonder', 'city_state')),
  entity_id TEXT NOT NULL,
  player_role TEXT NOT NULL CHECK (player_role IN ('Tiny', 'Steve', 'AI')),
  leader_id TEXT REFERENCES leaders(id),
  civ_id TEXT REFERENCES civilizations(id),
  age TEXT REFERENCES ages(id),
  event_type TEXT CHECK (event_type IN ('built', 'captured', 'discovered', 'acquired')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id, timestamp)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ownership_history_entity ON ownership_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ownership_history_timestamp ON ownership_history(timestamp DESC);

-- ============================================
-- Game Sessions
-- ============================================

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date DATE NOT NULL,
  age_mode TEXT NOT NULL CHECK (age_mode IN ('standard', 'enduring')),
  
  -- Players (JSONB for flexibility)
  players JSONB NOT NULL, -- { Tiny: { leaderId, civId, mementos: [id, id] }, Steve: {...}, AI: [...] }
  
  -- Per-age snapshots (stored as JSONB for flexibility)
  age_snapshots JSONB, -- { Antiquity: { legacyProgress: {...}, events: [...] }, ... }
  
  -- Outcome
  winner TEXT CHECK (winner IN ('Tiny', 'Steve', 'AI')),
  victory_type TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_date ON game_sessions(start_date DESC);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_world_wonders_updated_at BEFORE UPDATE ON world_wonders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_natural_wonders_updated_at BEFORE UPDATE ON natural_wonders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_city_states_updated_at BEFORE UPDATE ON city_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_civilizations_updated_at BEFORE UPDATE ON civilizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaders_updated_at BEFORE UPDATE ON leaders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mementos_updated_at BEFORE UPDATE ON mementos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE ages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE civics ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_wonders ENABLE ROW LEVEL SECURITY;
ALTER TABLE natural_wonders ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE civilizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mementos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Simple policies: Allow all operations for authenticated/anonymous users
-- For 2-user setup, we can use anonymous access with API key
-- For better security later, add user authentication

-- Reference tables: Read-only for everyone
CREATE POLICY "Anyone can read ages" ON ages FOR SELECT USING (true);
CREATE POLICY "Anyone can read ideologies" ON ideologies FOR SELECT USING (true);

-- Core tables: Allow all operations (we'll refine this later)
CREATE POLICY "Anyone can read technologies" ON technologies FOR SELECT USING (true);
CREATE POLICY "Anyone can modify technologies" ON technologies FOR ALL USING (true);

CREATE POLICY "Anyone can read civics" ON civics FOR SELECT USING (true);
CREATE POLICY "Anyone can modify civics" ON civics FOR ALL USING (true);

CREATE POLICY "Anyone can read world_wonders" ON world_wonders FOR SELECT USING (true);
CREATE POLICY "Anyone can modify world_wonders" ON world_wonders FOR ALL USING (true);

CREATE POLICY "Anyone can read natural_wonders" ON natural_wonders FOR SELECT USING (true);
CREATE POLICY "Anyone can modify natural_wonders" ON natural_wonders FOR ALL USING (true);

CREATE POLICY "Anyone can read city_states" ON city_states FOR SELECT USING (true);
CREATE POLICY "Anyone can modify city_states" ON city_states FOR ALL USING (true);

CREATE POLICY "Anyone can read civilizations" ON civilizations FOR SELECT USING (true);
CREATE POLICY "Anyone can modify civilizations" ON civilizations FOR ALL USING (true);

CREATE POLICY "Anyone can read leaders" ON leaders FOR SELECT USING (true);
CREATE POLICY "Anyone can modify leaders" ON leaders FOR ALL USING (true);

CREATE POLICY "Anyone can read mementos" ON mementos FOR SELECT USING (true);
CREATE POLICY "Anyone can modify mementos" ON mementos FOR ALL USING (true);

CREATE POLICY "Anyone can read ownership_history" ON ownership_history FOR SELECT USING (true);
CREATE POLICY "Anyone can modify ownership_history" ON ownership_history FOR ALL USING (true);

CREATE POLICY "Anyone can read game_sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can modify game_sessions" ON game_sessions FOR ALL USING (true);

-- ============================================
-- Notes
-- ============================================

-- This schema:
-- 1. Creates all tables based on Lucy's data model
-- 2. Sets up relationships (foreign keys)
-- 3. Adds indexes for performance
-- 4. Enables RLS with simple "allow all" policies (can refine later)
-- 5. Auto-updates timestamps
-- 
-- To use:
-- 1. Copy this entire file
-- 2. Go to Supabase SQL Editor
-- 3. Paste and run
-- 4. Tables will be created automatically

