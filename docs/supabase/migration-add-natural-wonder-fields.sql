-- Migration: Add effects and tile ownership tracking to natural_wonders table
-- Date: 2025-11-03
-- Description: Add effects JSONB array and tiles_owned_by JSONB for tracking split ownership

-- Add new columns to natural_wonders table
ALTER TABLE natural_wonders 
ADD COLUMN IF NOT EXISTS effects JSONB,
ADD COLUMN IF NOT EXISTS tiles_owned_by JSONB;

-- Add comments for documentation
COMMENT ON COLUMN natural_wonders.effects IS 'Array of bonus/effect strings for this natural wonder';
COMMENT ON COLUMN natural_wonders.tiles_owned_by IS 'JSONB object tracking tile ownership: { Tiny: number, Steve: number, AI: number }';





