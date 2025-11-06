-- Migration: Add effects array to mementos table
-- Date: 2025-11-03
-- Description: Add effects JSONB array for variable bonuses

-- Add new column to mementos table
ALTER TABLE mementos 
ADD COLUMN IF NOT EXISTS effects JSONB;

-- Add comment
COMMENT ON COLUMN mementos.effects IS 'Array of bonus/effect strings (alternative to single bonus field)';





