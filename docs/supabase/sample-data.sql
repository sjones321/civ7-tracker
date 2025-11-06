-- CIV7 Tracker - Sample Data for Testing
-- Run this in Supabase SQL Editor to populate test data
-- This data is for testing autocomplete and basic functionality

-- ============================================
-- Ages (reference data) - Already in schema.sql, but including for completeness
-- ============================================
-- Note: Ages are already inserted in database-schema.sql
-- This is here just for reference

-- ============================================
-- Ideologies (reference data) - Already in schema.sql
-- ============================================
-- Note: Ideologies are already inserted in database-schema.sql
-- This is here just for reference

-- ============================================
-- Civilizations (sample data for testing)
-- ============================================
INSERT INTO civilizations (id, name, age, enduring_capable, passive_bonuses, unique_units, unique_buildings_or_quarters, created_at, updated_at) VALUES
  ('civ:rome', 'Rome', 'Antiquity', false, '["Production bonus to wonders"]', '["Legion"]', '["Forum"]', NOW(), NOW()),
  ('civ:egypt', 'Egypt', 'Antiquity', false, '["Bonus to wonder construction"]', '[]', '["Pyramid"]', NOW(), NOW()),
  ('civ:greece', 'Greece', 'Antiquity', false, '["Cultural bonuses"]', '["Hoplite"]', '["Acropolis"]', NOW(), NOW()),
  ('civ:china', 'China', 'Antiquity', true, '["Great Wall bonus"]', '["Chu-Ko-Nu"]', '["Great Wall"]', NOW(), NOW()),
  ('civ:spain', 'Spain', 'Exploration', false, '["Colonial bonuses"]', '["Conquistador"]', '["Mission"]', NOW(), NOW()),
  ('civ:england', 'England', 'Exploration', false, '["Naval bonuses"]', '["Ship of the Line"]', '["Royal Navy Dockyard"]', NOW(), NOW()),
  ('civ:france', 'France', 'Exploration', true, '["Cultural and diplomatic bonuses"]', '["Garde Impériale"]', '["Château"]', NOW(), NOW()),
  ('civ:america', 'America', 'Modern', false, '["Expansion bonuses"]', '["P-51 Mustang"]', '["Film Studio"]', NOW(), NOW()),
  ('civ:russia', 'Russia', 'Modern', false, '["Territory and production bonuses"]', '["Cossack"]', '["Lavra"]', NOW(), NOW()),
  ('civ:germany', 'Germany', 'Modern', true, '["Production and military bonuses"]', '["U-Boat"]', '["Hansa"]', NOW(), NOW())
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
  ('tech:pottery', 'Pottery', 'Antiquity', '[]', NOW(), NOW()),
  ('tech:writing', 'Writing', 'Antiquity', '[]', NOW(), NOW()),
  ('tech:mathematics', 'Mathematics', 'Antiquity', '[]', NOW(), NOW()),
  ('tech:engineering', 'Engineering', 'Antiquity', '[]', NOW(), NOW()),
  ('tech:astronomy', 'Astronomy', 'Exploration', '[]', NOW(), NOW()),
  ('tech:navigation', 'Navigation', 'Exploration', '[]', NOW(), NOW()),
  ('tech:gunpowder', 'Gunpowder', 'Exploration', '[]', NOW(), NOW()),
  ('tech:printing', 'Printing Press', 'Exploration', '[]', NOW(), NOW()),
  ('tech:steam', 'Steam Power', 'Modern', '[]', NOW(), NOW()),
  ('tech:electricity', 'Electricity', 'Modern', '[]', NOW(), NOW()),
  ('tech:flight', 'Flight', 'Modern', '[]', NOW(), NOW()),
  ('tech:computers', 'Computers', 'Modern', '[]', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  era = EXCLUDED.era,
  updated_at = NOW();

-- ============================================
-- Civics (sample data for testing)
-- ============================================
INSERT INTO civics (id, name, era, unlocks, created_at, updated_at) VALUES
  ('civic:code-of-laws', 'Code of Laws', 'Antiquity', '[]', NOW(), NOW()),
  ('civic:philosophy', 'Philosophy', 'Antiquity', '[]', NOW(), NOW()),
  ('civic:drama', 'Drama and Poetry', 'Antiquity', '[]', NOW(), NOW()),
  ('civic:theology', 'Theology', 'Antiquity', '[]', NOW(), NOW()),
  ('civic:exploration', 'Exploration', 'Exploration', '[]', NOW(), NOW()),
  ('civic:humanism', 'Humanism', 'Exploration', '[]', NOW(), NOW()),
  ('civic:mercantilism', 'Mercantilism', 'Exploration', '[]', NOW(), NOW()),
  ('civic:enlightenment', 'The Enlightenment', 'Exploration', '[]', NOW(), NOW()),
  ('civic:ideology', 'Ideology', 'Modern', '[]', NOW(), NOW()),
  ('civic:conservation', 'Conservation', 'Modern', '[]', NOW(), NOW()),
  ('civic:mass-media', 'Mass Media', 'Modern', '[]', NOW(), NOW()),
  ('civic:globalization', 'Globalization', 'Modern', '[]', NOW(), NOW())
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
  ('wonder:pyramids', 'Pyramids', '+2 [culture], provides additional [culture] per era', NULL, 'tech:engineering', NULL, NULL, '{"tile": "desert", "era": "Antiquity"}'::jsonb, '["culture_bonus", "era_culture"]'::jsonb, NULL, false, NULL, 'Antiquity', NOW(), NOW()),
  ('wonder:great-library', 'Great Library', '+2 [science], provides [science] for each technology researched', NULL, 'tech:writing', 'civic:philosophy', NULL, '{"adjacency": "district:campus"}'::jsonb, '["science_bonus", "tech_science"]'::jsonb, NULL, false, NULL, 'Antiquity', NOW(), NOW()),
  ('wonder:battersea', 'Battersea Power Station', '+1 wildcard policy slot', NULL, 'tech:electricity', NULL, NULL, '{"tile": "river", "era": "Modern"}'::jsonb, '["wildcard_policy"]'::jsonb, NULL, true, NULL, 'Modern', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- ============================================
-- Natural Wonders (sample data for testing)
-- ============================================
INSERT INTO natural_wonders (id, name, summary_bonus, icon_url, tile_count, terrain_type, continent, discovered_age, last_controller_role, last_controller_leader_id, last_controller_civ_id, effects, tiles_owned_by, created_at, updated_at) VALUES
  ('natural:grand-canyon', 'Grand Canyon', 'Provides [culture] and [tourism] bonuses', NULL, 2, 'Desert', 'North America', 'Exploration', NULL, NULL, NULL, '["+2 culture per tile", "+1 tourism per tile"]'::jsonb, NULL, NOW(), NOW()),
  ('natural:mount-fuji', 'Mount Fuji', 'Provides [culture] and [faith] bonuses', NULL, 1, 'Mountain', 'Asia', 'Antiquity', NULL, NULL, NULL, '["+3 culture", "+2 faith"]'::jsonb, NULL, NOW(), NOW()),
  ('natural:great-barrier-reef', 'Great Barrier Reef', 'Provides [science] and [food] bonuses', NULL, 3, 'Coast', 'Australia', 'Exploration', NULL, NULL, NULL, '["+2 science per tile", "+1 food per tile"]'::jsonb, NULL, NOW(), NOW()),
  ('natural:kilimanjaro', 'Mount Kilimanjaro', 'Provides [culture] and [science] bonuses', NULL, 2, 'Mountain', 'Africa', 'Exploration', NULL, NULL, NULL, '["+2 culture per tile", "+1 science per tile"]'::jsonb, NULL, NOW(), NOW()),
  ('natural:dead-sea', 'Dead Sea', 'Provides [gold] bonuses', NULL, 1, 'Desert', 'Asia', 'Antiquity', NULL, NULL, NULL, '["+4 gold"]'::jsonb, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- ============================================
-- Social Policies (sample data for testing)
-- ============================================
INSERT INTO social_policies (id, name, icon_url, age, effects, associated_civ_id, associated_leader_id, created_at, updated_at) VALUES
  -- Universal Policies - Antiquity
  ('policy:agrarian-society', 'Agrarian Society', NULL, 'Antiquity', '["+1 food from farms", "+1 food from pastures"]'::jsonb, NULL, NULL, NOW(), NOW()),
  ('policy:military-tradition', 'Military Tradition', NULL, 'Antiquity', '["+1 combat strength for land units", "+25% experience gained by units"]'::jsonb, NULL, NULL, NOW(), NOW()),
  ('policy:republican-legacy', 'Republican Legacy', NULL, 'Antiquity', '["+1 culture per city", "+1 production per city"]'::jsonb, NULL, NULL, NOW(), NOW()),
  
  -- Universal Policies - Exploration
  ('policy:merchant-navy', 'Merchant Navy', NULL, 'Exploration', '["+2 gold from trade routes", "+1 production for harbors"]'::jsonb, NULL, NULL, NOW(), NOW()),
  ('policy:colonial-settlements', 'Colonial Settlements', NULL, 'Exploration', '["+15% production toward settlers", "Settlers gain +2 movement"]'::jsonb, NULL, NULL, NOW(), NOW()),
  
  -- Universal Policies - Modern
  ('policy:democracy', 'Democracy', NULL, 'Modern', '["+1 amenity per city", "+10% production toward buildings"]'::jsonb, NULL, NULL, NOW(), NOW()),
  ('policy:free-market', 'Free Market', NULL, 'Modern', '["+2 gold per trade route", "+1 gold per district"]'::jsonb, NULL, NULL, NOW(), NOW()),
  
  -- Civ-Specific Policies
  ('policy:roman-engineering', 'Roman Engineering', NULL, 'Antiquity', '["+15% production toward wonders", "+1 production for all cities"]'::jsonb, 'civ:rome', NULL, NOW(), NOW()),
  ('policy:egyptian-monumentalism', 'Egyptian Monumentalism', NULL, 'Antiquity', '["+20% production toward wonders", "+2 culture per wonder"]'::jsonb, 'civ:egypt', NULL, NOW(), NOW()),
  ('policy:greek-democracy', 'Greek Democracy', NULL, 'Antiquity', '["+1 culture per specialist", "+2 culture per district"]'::jsonb, 'civ:greece', NULL, NOW(), NOW()),
  
  -- Leader-Specific Policies
  ('policy:caesars-legion', 'Caesar''s Legion', NULL, 'Antiquity', '["+2 combat strength for melee units", "+1 movement for legions"]'::jsonb, NULL, 'leader:caesar', NOW(), NOW()),
  ('policy:cleopatras-diplomacy', 'Cleopatra''s Diplomacy', NULL, 'Antiquity', '["+2 gold per trade route", "+1 diplomatic favor per turn"]'::jsonb, NULL, 'leader:cleopatra', NOW(), NOW()),
  ('policy:napoleonic-code', 'Napoleonic Code', NULL, 'Exploration', '["+1 production per city", "+10% production toward military units"]'::jsonb, NULL, 'leader:napoleon', NOW(), NOW()),
  ('policy:teddy-conservation', 'Conservation Act', NULL, 'Modern', '["+2 culture from national parks", "+1 amenity per natural wonder"]'::jsonb, NULL, 'leader:teddy', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  age = EXCLUDED.age,
  updated_at = NOW();

-- ============================================
-- Units (sample data for testing)
-- ============================================
INSERT INTO units (id, name, icon_url, age, description, effects, combat_strength, ranged_strength, bombard_strength, movement, unlock_method, associated_civ_id, unit_type, created_at, updated_at) VALUES
  -- Land Units - Antiquity
  ('unit:warrior', 'Warrior', NULL, 'Antiquity', 'Basic melee unit', '[]'::jsonb, 20, NULL, NULL, 2, 'age_start', NULL, 'Land', NOW(), NOW()),
  ('unit:spearman', 'Spearman', NULL, 'Antiquity', 'Anti-cavalry melee unit', '[]'::jsonb, 25, NULL, NULL, 2, 'age_start', NULL, 'Land', NOW(), NOW()),
  ('unit:archer', 'Archer', NULL, 'Antiquity', 'Ranged unit', '[]'::jsonb, 7, 15, NULL, 2, 'age_start', NULL, 'Land', NOW(), NOW()),
  ('unit:scout', 'Scout', NULL, 'Antiquity', 'Exploration unit', '[]'::jsonb, NULL, NULL, NULL, 3, 'age_start', NULL, 'Civilian', NOW(), NOW()),
  
  -- Civ-Specific Units - Antiquity
  ('unit:legion', 'Legion', NULL, 'Antiquity', 'Unique Roman melee unit', '["Can build roads", "+5 combat strength vs cities"]'::jsonb, 40, NULL, NULL, 2, 'age_start', 'civ:rome', 'Land', NOW(), NOW()),
  ('unit:immortal', 'Immortal', NULL, 'Antiquity', 'Unique Persian melee unit', '["Heals at end of turn"]'::jsonb, 30, NULL, NULL, 2, 'age_start', 'civ:persia', 'Land', NOW(), NOW()),
  
  -- Naval Units - Antiquity
  ('unit:galley', 'Galley', NULL, 'Antiquity', 'Early naval unit', '[]'::jsonb, 25, NULL, NULL, 3, 'age_start', NULL, 'Naval', NOW(), NOW()),
  
  -- Land Units - Exploration
  ('unit:musketman', 'Musketman', NULL, 'Exploration', 'Gunpowder infantry', '[]'::jsonb, 55, NULL, NULL, 2, 'tech:gunpowder', NULL, 'Land', NOW(), NOW()),
  ('unit:cannon', 'Cannon', NULL, 'Exploration', 'Siege unit', '[]'::jsonb, NULL, NULL, 50, 2, 'tech:gunpowder', NULL, 'Support', NOW(), NOW()),
  
  -- Naval Units - Exploration
  ('unit:caravel', 'Caravel', NULL, 'Exploration', 'Exploration ship', '[]'::jsonb, 35, NULL, NULL, 4, 'tech:astronomy', NULL, 'Naval', NOW(), NOW()),
  ('unit:frigate', 'Frigate', NULL, 'Exploration', 'Warship', '[]'::jsonb, 55, 60, NULL, 4, 'tech:navigation', NULL, 'Naval', NOW(), NOW()),
  
  -- Land Units - Modern
  ('unit:infantry', 'Infantry', NULL, 'Modern', 'Modern infantry', '[]'::jsonb, 70, NULL, NULL, 2, 'tech:steam', NULL, 'Land', NOW(), NOW()),
  ('unit:tank', 'Tank', NULL, 'Modern', 'Armored unit', '[]'::jsonb, 80, NULL, NULL, 4, 'tech:electricity', NULL, 'Land', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  age = EXCLUDED.age,
  updated_at = NOW();

-- ============================================
-- Buildings (sample data for testing)
-- ============================================
INSERT INTO buildings (id, name, icon_url, age, effects, production_cost, placement_requirements, location_type, is_warehouse, unlock_method, associated_civ_id, created_at, updated_at) VALUES
  -- Urban Buildings - Antiquity
  ('building:granary', 'Granary', NULL, 'Antiquity', '["+2 food"]'::jsonb, 60, 'Must be built in a city', 'Urban', false, 'age_start', NULL, NOW(), NOW()),
  ('building:library', 'Library', NULL, 'Antiquity', '["+2 science"]'::jsonb, 75, 'Must be built in a city', 'Urban', false, 'tech:writing', NULL, NOW(), NOW()),
  ('building:monument', 'Monument', NULL, 'Antiquity', '["+1 culture"]'::jsonb, 40, 'Must be built in a city', 'Urban', false, 'age_start', NULL, NOW(), NOW()),
  ('building:warehouse', 'Warehouse', NULL, 'Antiquity', '["+2 production", "Stores resources"]'::jsonb, 100, 'Must be built in a city', 'Urban', true, 'age_start', NULL, NOW(), NOW()),
  
  -- Rural Buildings - Antiquity
  ('building:pasture', 'Pasture', NULL, 'Antiquity', '["+1 food from livestock"]'::jsonb, 50, 'Must be built on a tile with livestock', 'Rural', false, 'age_start', NULL, NOW(), NOW()),
  ('building:mine', 'Mine', NULL, 'Antiquity', '["+2 production from resources"]'::jsonb, 60, 'Must be built on a tile with mining resources', 'Rural', false, 'age_start', NULL, NOW(), NOW()),
  
  -- Urban Buildings - Exploration
  ('building:university', 'University', NULL, 'Exploration', '["+4 science", "+1 science per specialist"]'::jsonb, 200, 'Must be built in a city with a library', 'Urban', false, 'tech:astronomy', NULL, NOW(), NOW()),
  ('building:market', 'Market', NULL, 'Exploration', '["+3 gold", "+1 trade route capacity"]'::jsonb, 150, 'Must be built in a city', 'Urban', false, 'age_start', NULL, NOW(), NOW()),
  ('building:warehouse-exploration', 'Warehouse (Exploration)', NULL, 'Exploration', '["+3 production", "Stores resources"]'::jsonb, 180, 'Must be built in a city', 'Urban', true, 'tech:engineering', NULL, NOW(), NOW()),
  
  -- Rural Buildings - Exploration
  ('building:plantation', 'Plantation', NULL, 'Exploration', '["+2 food", "+1 gold from plantations"]'::jsonb, 120, 'Must be built on a tile with plantation resources', 'Rural', false, 'tech:navigation', NULL, NOW(), NOW()),
  
  -- Urban Buildings - Modern
  ('building:factory', 'Factory', NULL, 'Modern', '["+5 production", "+1 production per specialist"]'::jsonb, 300, 'Must be built in a city', 'Urban', false, 'tech:steam', NULL, NOW(), NOW()),
  ('building:research-lab', 'Research Lab', NULL, 'Modern', '["+6 science", "+2 science per specialist"]'::jsonb, 350, 'Must be built in a city with a university', 'Urban', false, 'tech:electricity', NULL, NOW(), NOW()),
  
  -- Civ-Specific Buildings - Antiquity
  ('building:roman-forum', 'Forum', NULL, 'Antiquity', '["+2 culture", "+1 production", "+1 trade route"]'::jsonb, 100, 'Must be built in a city', 'Urban', false, 'age_start', 'civ:rome', NOW(), NOW()),
  ('building:egyptian-temple', 'Temple of Amun', NULL, 'Antiquity', '["+3 culture", "+1 faith per turn"]'::jsonb, 90, 'Must be built in a city', 'Urban', false, 'age_start', 'civ:egypt', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  age = EXCLUDED.age,
  updated_at = NOW();

