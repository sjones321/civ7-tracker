-- CIV7 Tracker - Sample Data for Testing
-- Run this in Supabase SQL Editor to populate test data
-- This data is for testing autocomplete and basic functionality

-- ============================================
-- Ages (reference data) - Already in schema.sql, but including for completeness
-- ============================================
-- Note: Ages are already inserted in database-schema.sql
-- This is here just for reference

-- ============================================
-- Ideologies (reference data)
-- ============================================
INSERT INTO ideologies (id, label, description) VALUES
  ('militaristic', 'Militaristic', 'Focus on military strength and conquest'),
  ('economic', 'Economic', 'Focus on trade and commerce'),
  ('scientific', 'Scientific', 'Focus on research and technology'),
  ('cultural', 'Cultural', 'Focus on arts and culture'),
  ('diplomatic', 'Diplomatic', 'Focus on diplomacy and alliances'),
  ('expansionist', 'Expansionist', 'Focus on territorial expansion')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Civilizations (sample data for testing)
-- ============================================
INSERT INTO civilizations (id, name, age, enduring_capable, passive_bonuses, unique_units, unique_buildings_or_quarters, created_at, updated_at) VALUES
  ('civ:rome', 'Rome', 'antiquity', false, '["Production bonus to wonders"]', '["Legion"]', '["Forum"]', NOW(), NOW()),
  ('civ:egypt', 'Egypt', 'antiquity', false, '["Bonus to wonder construction"]', '[]', '["Pyramid"]', NOW(), NOW()),
  ('civ:greece', 'Greece', 'antiquity', false, '["Cultural bonuses"]', '["Hoplite"]', '["Acropolis"]', NOW(), NOW()),
  ('civ:china', 'China', 'antiquity', true, '["Great Wall bonus"]', '["Chu-Ko-Nu"]', '["Great Wall"]', NOW(), NOW()),
  ('civ:spain', 'Spain', 'exploration', false, '["Colonial bonuses"]', '["Conquistador"]', '["Mission"]', NOW(), NOW()),
  ('civ:england', 'England', 'exploration', false, '["Naval bonuses"]', '["Ship of the Line"]', '["Royal Navy Dockyard"]', NOW(), NOW()),
  ('civ:france', 'France', 'exploration', true, '["Cultural and diplomatic bonuses"]', '["Garde Impériale"]', '["Château"]', NOW(), NOW()),
  ('civ:america', 'America', 'modern', false, '["Expansion bonuses"]', '["P-51 Mustang"]', '["Film Studio"]', NOW(), NOW()),
  ('civ:russia', 'Russia', 'modern', false, '["Territory and production bonuses"]', '["Cossack"]', '["Lavra"]', NOW(), NOW()),
  ('civ:germany', 'Germany', 'modern', true, '["Production and military bonuses"]', '["U-Boat"]', '["Hansa"]', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  age = EXCLUDED.age,
  updated_at = NOW();

-- ============================================
-- Leaders (sample data for testing)
-- ============================================
INSERT INTO leaders (id, name, civ_id, picture_url, bonuses, levels, level_progress, created_at, updated_at) VALUES
  ('leader:caesar', 'Julius Caesar', 'civ:rome', NULL, '["Military and expansion bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:cleopatra', 'Cleopatra', 'civ:egypt', NULL, '["Diplomatic and trade bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:pericles', 'Pericles', 'civ:greece', NULL, '["Cultural bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:wukong', 'Wukong', 'civ:china', NULL, '["Wonder construction bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:isabella', 'Isabella', 'civ:spain', NULL, '["Natural wonder bonuses", "Religious bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:elizabeth', 'Elizabeth I', 'civ:england', NULL, '["Naval and exploration bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:napoleon', 'Napoleon', 'civ:france', NULL, '["Military and expansion bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:teddy', 'Teddy Roosevelt', 'civ:america', NULL, '["National park bonuses", "Diplomatic bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:jfk', 'John F. Kennedy', 'civ:america', NULL, '["Space race bonuses", "Cultural bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:catherine', 'Catherine the Great', 'civ:russia', NULL, '["Cultural and territorial bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('leader:bismarck', 'Otto von Bismarck', 'civ:germany', NULL, '["Production and diplomatic bonuses"]', 10, '{"Tiny": 0, "Steve": 0}', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  civ_id = EXCLUDED.civ_id,
  updated_at = NOW();

-- ============================================
-- Technologies (sample data for testing)
-- ============================================
INSERT INTO technologies (id, name, era, unlocks, created_at, updated_at) VALUES
  ('tech:pottery', 'Pottery', 'antiquity', '[]', NOW(), NOW()),
  ('tech:writing', 'Writing', 'antiquity', '[]', NOW(), NOW()),
  ('tech:mathematics', 'Mathematics', 'antiquity', '[]', NOW(), NOW()),
  ('tech:engineering', 'Engineering', 'antiquity', '[]', NOW(), NOW()),
  ('tech:astronomy', 'Astronomy', 'exploration', '[]', NOW(), NOW()),
  ('tech:navigation', 'Navigation', 'exploration', '[]', NOW(), NOW()),
  ('tech:gunpowder', 'Gunpowder', 'exploration', '[]', NOW(), NOW()),
  ('tech:printing', 'Printing Press', 'exploration', '[]', NOW(), NOW()),
  ('tech:steam', 'Steam Power', 'modern', '[]', NOW(), NOW()),
  ('tech:electricity', 'Electricity', 'modern', '[]', NOW(), NOW()),
  ('tech:flight', 'Flight', 'modern', '[]', NOW(), NOW()),
  ('tech:computers', 'Computers', 'modern', '[]', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  era = EXCLUDED.era,
  updated_at = NOW();

-- ============================================
-- Civics (sample data for testing)
-- ============================================
INSERT INTO civics (id, name, era, unlocks, created_at, updated_at) VALUES
  ('civic:code-of-laws', 'Code of Laws', 'antiquity', '[]', NOW(), NOW()),
  ('civic:philosophy', 'Philosophy', 'antiquity', '[]', NOW(), NOW()),
  ('civic:drama', 'Drama and Poetry', 'antiquity', '[]', NOW(), NOW()),
  ('civic:theology', 'Theology', 'antiquity', '[]', NOW(), NOW()),
  ('civic:exploration', 'Exploration', 'exploration', '[]', NOW(), NOW()),
  ('civic:humanism', 'Humanism', 'exploration', '[]', NOW(), NOW()),
  ('civic:mercantilism', 'Mercantilism', 'exploration', '[]', NOW(), NOW()),
  ('civic:enlightenment', 'The Enlightenment', 'exploration', '[]', NOW(), NOW()),
  ('civic:ideology', 'Ideology', 'modern', '[]', NOW(), NOW()),
  ('civic:conservation', 'Conservation', 'modern', '[]', NOW(), NOW()),
  ('civic:mass-media', 'Mass Media', 'modern', '[]', NOW(), NOW()),
  ('civic:globalization', 'Globalization', 'modern', '[]', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  era = EXCLUDED.era,
  updated_at = NOW();

-- ============================================
-- Mementos (sample data for testing)
-- ============================================
INSERT INTO mementos (id, name, icon_url, bonus, unlock_condition, unlock_description, times_used_by, created_at, updated_at) VALUES
  ('memento:warrior-king', 'Warrior King', NULL, '+2 [production] when building military units', 'byLeaderLevel', 'Unlocked at leader level 3', '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('memento:scholar-queen', 'Scholar Queen', NULL, '+1 [science] from libraries', 'byLeaderLevel', 'Unlocked at leader level 5', '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('memento:master-builder', 'Master Builder', NULL, '+15% [production] towards wonders', 'byLeaderLevel', 'Unlocked at leader level 7', '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('memento:trade-empire', 'Trade Empire', NULL, '+2 [culture] from trade routes', 'byAchievement', 'Complete 10 trade routes', '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('memento:conqueror', 'Conqueror', NULL, '+1 [production] per captured city', 'byAchievement', 'Capture 5 cities', '{"Tiny": 0, "Steve": 0}', NOW(), NOW()),
  ('memento:explorer', 'Explorer', NULL, '+2 [science] from natural wonder discoveries', 'byAchievement', 'Discover 3 natural wonders', '{"Tiny": 0, "Steve": 0}', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bonus = EXCLUDED.bonus,
  updated_at = NOW();

-- ============================================
-- Sample World Wonder (for testing)
-- ============================================
INSERT INTO world_wonders (id, name, summary_bonus, icon_url, unlock_tech, unlock_civic, civ_specific_unlock, requirements, effects, civ_production_bonus, big_ticket, last_owner_role, last_owner_age, created_at, updated_at) VALUES
  ('wonder:pyramids', 'Pyramids', '+2 [culture], provides additional [culture] per era', NULL, 'tech:engineering', NULL, NULL, '{"tile": "desert", "era": "antiquity"}'::jsonb, '["culture_bonus", "era_culture"]'::jsonb, NULL, false, NULL, 'antiquity', NOW(), NOW()),
  ('wonder:great-library', 'Great Library', '+2 [science], provides [science] for each technology researched', NULL, 'tech:writing', 'civic:philosophy', NULL, '{"adjacency": "district:campus"}'::jsonb, '["science_bonus", "tech_science"]'::jsonb, NULL, false, NULL, 'antiquity', NOW(), NOW()),
  ('wonder:battersea', 'Battersea Power Station', '+1 wildcard policy slot', NULL, 'tech:electricity', NULL, NULL, '{"tile": "river", "era": "modern"}'::jsonb, '["wildcard_policy"]'::jsonb, NULL, true, NULL, 'modern', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

