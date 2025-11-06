-- Migration: Add units table
-- Date: 2025-11-03
-- Description: Create units table for tracking all unit types (military, civilian, support)

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  age TEXT REFERENCES ages(id),
  description TEXT,
  effects JSONB,
  combat_strength INTEGER,
  ranged_strength INTEGER,
  bombard_strength INTEGER,
  movement INTEGER,
  unlock_method TEXT, -- tech/civic ID or "age_start"
  associated_civ_id TEXT REFERENCES civilizations(id),
  unit_type TEXT NOT NULL CHECK (unit_type IN ('Land', 'Air', 'Naval', 'Civilian', 'Support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE units IS 'All unit types in Civilization VII (military, civilian, support)';
COMMENT ON COLUMN units.id IS 'Unique identifier for the unit';
COMMENT ON COLUMN units.name IS 'Display name of the unit';
COMMENT ON COLUMN units.icon_url IS 'URL or data URI for unit icon';
COMMENT ON COLUMN units.age IS 'Age when this unit is available';
COMMENT ON COLUMN units.description IS 'Text description of the unit';
COMMENT ON COLUMN units.effects IS 'Array of special effect strings';
COMMENT ON COLUMN units.combat_strength IS 'Base combat strength (nullable for non-combat units)';
COMMENT ON COLUMN units.ranged_strength IS 'Ranged attack strength (nullable for non-ranged units)';
COMMENT ON COLUMN units.bombard_strength IS 'Bombard/siege strength (nullable)';
COMMENT ON COLUMN units.movement IS 'Movement points per turn';
COMMENT ON COLUMN units.unlock_method IS 'Tech/civic ID that unlocks this unit, or "age_start" for default units';
COMMENT ON COLUMN units.associated_civ_id IS 'Optional: Civilization that has this as a unique unit';
COMMENT ON COLUMN units.unit_type IS 'Category: Land, Air, Naval, Civilian, or Support';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_units_civ ON units(associated_civ_id);
CREATE INDEX IF NOT EXISTS idx_units_age ON units(age);
CREATE INDEX IF NOT EXISTS idx_units_type ON units(unit_type);
CREATE INDEX IF NOT EXISTS idx_units_unlock ON units(unlock_method);

