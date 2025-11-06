-- Migration: Add fields to technologies and civics tables
-- Date: 2025-11-03
-- Description: Add icon, effects, wonder unlock, social policies, and civ-specific unlock fields

-- Technologies table
ALTER TABLE technologies 
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS effects JSONB,
ADD COLUMN IF NOT EXISTS wonder_unlock TEXT,
ADD COLUMN IF NOT EXISTS social_policies JSONB,
ADD COLUMN IF NOT EXISTS civ_specific_unlock JSONB;

-- Civics table  
ALTER TABLE civics 
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS effects JSONB,
ADD COLUMN IF NOT EXISTS wonder_unlock TEXT,
ADD COLUMN IF NOT EXISTS social_policies JSONB,
ADD COLUMN IF NOT EXISTS civ_specific_unlock JSONB;

-- Add comments
COMMENT ON COLUMN technologies.icon_url IS 'URL or data URI for technology icon';
COMMENT ON COLUMN technologies.effects IS 'Array of bonus/effect strings';
COMMENT ON COLUMN technologies.wonder_unlock IS 'Wonder ID that this tech unlocks';
COMMENT ON COLUMN technologies.social_policies IS 'Array of social policy IDs';
COMMENT ON COLUMN technologies.civ_specific_unlock IS 'JSONB: { civId: string } for civ-specific variants';

COMMENT ON COLUMN civics.icon_url IS 'URL or data URI for civic icon';
COMMENT ON COLUMN civics.effects IS 'Array of bonus/effect strings';
COMMENT ON COLUMN civics.wonder_unlock IS 'Wonder ID that this civic unlocks';
COMMENT ON COLUMN civics.social_policies IS 'Array of social policy IDs';
COMMENT ON COLUMN civics.civ_specific_unlock IS 'JSONB: { civId: string } for civ-specific variants';

