-- Migration: Add production_cost to technologies and civics tables
-- Date: 2025-11-03
-- Description: Add production_cost field for science (techs) and culture (civics) cost tracking

-- Add production_cost to technologies table
ALTER TABLE technologies 
ADD COLUMN IF NOT EXISTS production_cost INTEGER;

-- Add production_cost to civics table
ALTER TABLE civics 
ADD COLUMN IF NOT EXISTS production_cost INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN technologies.production_cost IS 'Science cost to research this technology';
COMMENT ON COLUMN civics.production_cost IS 'Culture cost to research this civic';



