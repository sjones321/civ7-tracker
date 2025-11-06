# Supabase Database Migrations

This directory contains SQL migration scripts for the Civ 7 Tracker database.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard at <https://supabase.com/dashboard>
2. Click on your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the contents of the migration file you want to run
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Check the Results panel for any errors

### Option 2: Supabase CLI (For advanced users)

If you have the Supabase CLI installed:

```bash
supabase db push
```

Or run a specific migration:

```bash
supabase db execute --file docs/supabase/migration-add-leader-fields.sql
```

## Migrations List

### `migration-add-wonder-fields.sql`

- Adds production cost and associated civilization fields to world_wonders table
- Creates wonder_ownership_history table for tracking game history
- **Status**: Applied

### `migration-add-leader-fields.sql`

- Adds level tracking (tiny_level, steve_level) to leaders table
- Adds effects and level_unlocks JSONB columns
- Creates leader_game_history table for tracking games played
- **Status**: Ready to apply

## Migration Order

Run migrations in the order they appear in this list. Each migration is designed to be idempotent (safe to run multiple times).

## Troubleshooting

### "relation already exists"

This is normal if you're re-running a migration. The `IF NOT EXISTS` clauses prevent errors.

### "permission denied"

Make sure you're logged in to the correct Supabase project and have admin access.

### "syntax error"

Double-check that you copied the entire migration file, including all semicolons.

## Best Practices

1. Always backup your data before running migrations
2. Test migrations on a development/staging database first
3. Run migrations during low-traffic periods
4. Keep this README updated with migration status
