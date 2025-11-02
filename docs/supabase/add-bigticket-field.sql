-- Add big_ticket field to world_wonders table
-- Run this in Supabase SQL Editor if the table already exists
-- (Only needed if you created tables before adding this field)

ALTER TABLE world_wonders 
ADD COLUMN IF NOT EXISTS big_ticket BOOLEAN DEFAULT FALSE;

