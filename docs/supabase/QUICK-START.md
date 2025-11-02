# Supabase Quick Start - TL;DR Version

**Too long? Here's the 5-minute version:**

## 1. Sign Up (2 min)

1. Go to <https://supabase.com>
2. Click "Start your project"
3. Sign in with GitHub
4. Done ✅

## 2. Create Project (2 min)

1. Click "New Project"
2. Name: `civ7-tracker`
3. Generate password (SAVE IT!)
4. Choose region (closest to you)
5. Click "Create new project"
6. Wait 2-3 minutes ✅

## 3. Get Keys (1 min)

1. Click gear icon (⚙️) → "API"
2. Copy **Project URL** (looks like `https://xxx.supabase.co`)
3. Copy **anon public** key (long string)
4. Save both somewhere ✅

## 4. Create Tables (2 min)

1. Click "SQL Editor" (left sidebar)
2. Open `docs/supabase/database-schema.sql`
3. Copy ALL the SQL
4. Paste into SQL Editor
5. Click "Run"
6. Done ✅

## 5. Add Config (1 min)

1. Copy `js/supabase-config.example.js` to `js/supabase-config.js`
2. Open `js/supabase-config.js` in a text editor (Notepad++, VS Code, etc.)
3. Find these two lines:

   ```javascript
   url: 'https://your-project-id.supabase.co',
   anonKey: 'your-anon-public-key-here'
   ```

4. Replace `'https://your-project-id.supabase.co'` with your actual Project URL
5. Replace `'your-anon-public-key-here'` with your actual anon key (the long string)
6. Save the file ✅

## 6. Update HTML (2 min)

1. Open `data-wonders.html` in your text editor
2. Find the line near the bottom that says:

   ```html
   <script src="js/store.js"></script>
   ```

3. Replace it with these THREE lines (in this exact order):

   ```html
   <!-- Load Supabase library first -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <!-- Load your config (with API keys) -->
   <script src="js/supabase-config.js"></script>
   <!-- Load the store that uses Supabase -->
   <script src="js/store-supabase.js"></script>
   ```

4. Save the file ✅

**Important:** The order matters! Supabase library → Config → Store

## 7. Test (1 min)

1. Open `data-wonders.html` in browser
2. Check console (F12) - should be no errors
3. Try adding a wonder
4. Check Supabase Table Editor - see your data! ✅

**Done!** Your site now uses Supabase instead of localStorage.

## Need More Detail?

- Full setup: [`setup-guide.md`](./setup-guide.md)
- Full integration: [`integration-guide.md`](./integration-guide.md)
- Troubleshooting: See integration guide

**Total time:** ~10 minutes for full setup
