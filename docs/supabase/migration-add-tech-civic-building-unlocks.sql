-- Migration: Add building_unlocks to technologies and civics tables
-- Date: 2025-11-03
-- Description: Add building_unlocks JSONB array field for variable number of buildings unlocked by tech/civic

-- Add building_unlocks to technologies table
ALTER TABLE technologies 
ADD COLUMN IF NOT EXISTS building_unlocks JSONB;

-- Add building_unlocks to civics table
ALTER TABLE civics 
ADD COLUMN IF NOT EXISTS building_unlocks JSONB;

-- Add comments for documentation
COMMENT ON COLUMN technologies.building_unlocks IS 'Array of building IDs that this technology unlocks';
COMMENT ON COLUMN civics.building_unlocks IS 'Array of building IDs that this civic unlocks';

