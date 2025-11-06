# Adding Sample Data to Supabase

This guide shows you how to add sample data to your Supabase database for testing autocomplete and other features.

## Quick Steps

1. **Open Supabase Dashboard**
   - Go to <https://supabase.com/dashboard>
   - Select your `civ7-tracker` project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste Sample Data**
   - Open `docs/supabase/sample-data.sql` from your project
   - Copy the entire file contents
   - Paste into the SQL Editor

4. **Run the Query**
   - Click "Run" (or press `Ctrl+Enter`)
   - You should see success messages

5. **Verify Data**
   - Click "Table Editor" in the left sidebar
   - You should see data in:
     - `ages` (3 entries)
     - `ideologies` (6 entries)
     - `civilizations` (10 entries)
     - `leaders` (11 entries)
     - `technologies` (12 entries)
     - `civics` (12 entries)
     - `mementos` (6 entries)
     - `world_wonders` (3 entries)

## What This Data Includes

### Civilizations

- 10 civilizations across all ages (Antiquity, Exploration, Modern)
- Examples: Rome, Egypt, Greece, China, Spain, England, France, America, Russia, Germany

### Leaders

- 11 leaders matching the civilizations
- Examples: Julius Caesar, Cleopatra, Pericles, Wukong, Isabella, Elizabeth I, Napoleon, Teddy Roosevelt, JFK, Catherine the Great, Bismarck
- Some leaders have multiple namesakes (e.g., Napoleon for France)

### Technologies & Civics

- 12 technologies (Pottery, Writing, Mathematics, etc.)
- 12 civics (Code of Laws, Philosophy, Drama, etc.)
- Useful for testing autocomplete in unlock fields

### Mementos

- 6 sample mementos with different unlock conditions
- Examples: Warrior King, Scholar Queen, Master Builder, Trade Empire, Conqueror, Explorer

### World Wonders

- 3 sample wonders including Battersea Power Station (big ticket item)
- Shows how unlock fields work with autocomplete

## Testing Autocomplete

Once you've added this data, you can:

1. Open `data-wonders.html` in your browser
2. Try typing in Owner Civ field: "Nap" should show multiple options
3. Try typing in Owner Leader field: "Nap" should filter leaders
4. Try typing in unlock_tech field: "math" should show Mathematics

## Notes

- The sample data uses `ON CONFLICT DO NOTHING` so running it multiple times is safe
- IDs follow the pattern: `civ:name`, `leader:name`, `tech:name`, etc.
- Some fields are JSONB (arrays/objects) - that's normal
- You can edit or add more data later through the data editors we're building!

## Troubleshooting

**"Relation does not exist" error:**

- Make sure you ran `database-schema.sql` first to create the tables

**"Duplicate key" errors:**

- The script handles conflicts, but if you see errors, some data might already exist
- You can safely ignore or manually delete existing data first

**Can't see data in Table Editor:**

- Refresh the page
- Make sure you selected the correct table from the dropdown
- Check that the query actually ran (look for success messages)
