-- Migration: Add social_policies table
-- Description: Creates the social_policies table for tracking social policy cards

CREATE TABLE IF NOT EXISTS social_policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  age TEXT,
  effects JSONB,
  associated_civ_id TEXT,
  associated_leader_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE social_policies IS 'Social policy cards that can be adopted in the game';
COMMENT ON COLUMN social_policies.id IS 'Unique identifier for the social policy';
COMMENT ON COLUMN social_policies.name IS 'Display name of the social policy';
COMMENT ON COLUMN social_policies.icon_url IS 'URL or path to the policy icon';
COMMENT ON COLUMN social_policies.age IS 'Age when this policy is available (Antiquity, Exploration, Modern)';
COMMENT ON COLUMN social_policies.effects IS 'Array of effect/bonus strings';
COMMENT ON COLUMN social_policies.associated_civ_id IS 'Optional: Civilization-specific policy';
COMMENT ON COLUMN social_policies.associated_leader_id IS 'Optional: Leader-specific policy';

-- Create index for faster lookups by civ and leader
CREATE INDEX IF NOT EXISTS idx_social_policies_civ ON social_policies(associated_civ_id);
CREATE INDEX IF NOT EXISTS idx_social_policies_leader ON social_policies(associated_leader_id);
CREATE INDEX IF NOT EXISTS idx_social_policies_age ON social_policies(age);





