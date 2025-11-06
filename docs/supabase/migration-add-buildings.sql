-- Migration: Add buildings table
-- Date: 2025-11-03
-- Description: Create buildings table for tracking all building types

CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  age TEXT REFERENCES ages(id),
  effects JSONB,
  production_cost INTEGER,
  placement_requirements TEXT,
  location_type TEXT NOT NULL CHECK (location_type IN ('Urban', 'Rural')),
  is_warehouse BOOLEAN DEFAULT FALSE,
  unlock_method TEXT, -- tech/civic ID or "age_start"
  associated_civ_id TEXT REFERENCES civilizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE buildings IS 'All building types in Civilization VII (urban and rural)';
COMMENT ON COLUMN buildings.id IS 'Unique identifier for the building';
COMMENT ON COLUMN buildings.name IS 'Display name of the building';
COMMENT ON COLUMN buildings.icon_url IS 'URL or data URI for building icon';
COMMENT ON COLUMN buildings.age IS 'Age when this building is available';
COMMENT ON COLUMN buildings.effects IS 'Array of special effect strings';
COMMENT ON COLUMN buildings.production_cost IS 'Production cost to build this building';
COMMENT ON COLUMN buildings.placement_requirements IS 'Text description of placement requirements';
COMMENT ON COLUMN buildings.location_type IS 'Category: Urban or Rural';
COMMENT ON COLUMN buildings.is_warehouse IS 'Whether this building is a warehouse';
COMMENT ON COLUMN buildings.unlock_method IS 'Tech/civic ID that unlocks this building, or "age_start" for default buildings';
COMMENT ON COLUMN buildings.associated_civ_id IS 'Optional: Civilization that has this as a unique building';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_buildings_civ ON buildings(associated_civ_id);
CREATE INDEX IF NOT EXISTS idx_buildings_age ON buildings(age);
CREATE INDEX IF NOT EXISTS idx_buildings_location_type ON buildings(location_type);
CREATE INDEX IF NOT EXISTS idx_buildings_unlock ON buildings(unlock_method);

