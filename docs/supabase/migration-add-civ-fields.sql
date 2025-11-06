-- Migration: Add icon and unique civics to civilizations table
-- Date: 2025-11-03
-- Description: Add icon_url column and unique_civics JSONB array for civilization-specific civics

-- Add new columns to civilizations table
ALTER TABLE civilizations 
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS unique_civics JSONB;

-- Add comments for documentation
COMMENT ON COLUMN civilizations.icon_url IS 'URL or data URI for civilization icon/flag';
COMMENT ON COLUMN civilizations.unique_civics IS 'Array of civic IDs that are unique to this civilization';

