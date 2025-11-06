-- Migration: Add unit_unlocks to technologies and civics tables
-- Date: 2025-11-03
-- Description: Add unit_unlocks JSONB array field for variable number of units unlocked by tech/civic

-- Add unit_unlocks to technologies table
ALTER TABLE technologies 
ADD COLUMN IF NOT EXISTS unit_unlocks JSONB;

-- Add unit_unlocks to civics table
ALTER TABLE civics 
ADD COLUMN IF NOT EXISTS unit_unlocks JSONB;

-- Add comments for documentation
COMMENT ON COLUMN technologies.unit_unlocks IS 'Array of unit IDs that this technology unlocks';
COMMENT ON COLUMN civics.unit_unlocks IS 'Array of unit IDs that this civic unlocks';

