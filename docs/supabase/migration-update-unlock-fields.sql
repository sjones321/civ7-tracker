-- Migration: Update world_wonders unlock fields to use JSONB format
-- Run this in Supabase SQL Editor after previous migrations

-- Add unlock_data column as JSONB to store name + iconUrl
ALTER TABLE world_wonders 
ADD COLUMN IF NOT EXISTS unlock_data JSONB;

-- Note: unlock_tech and unlock_civic columns are kept for now for backward compatibility
-- They will be deprecated in the future

