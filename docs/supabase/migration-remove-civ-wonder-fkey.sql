-- Migration: Remove foreign key constraint on civilizations.production_bonus_for_wonder
-- Date: 2025-11-03
-- Description: Remove FK constraint to allow text storage of wonder IDs without strict references

-- Remove foreign key constraint
ALTER TABLE civilizations 
DROP CONSTRAINT IF EXISTS civilizations_production_bonus_for_wonder_fkey;

COMMENT ON COLUMN civilizations.production_bonus_for_wonder IS 'Wonder ID (text, not FK) that gives this civ +30% production bonus';

