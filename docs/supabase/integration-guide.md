# Supabase Integration Guide - CIV7 Tracker

This guide walks you through integrating Supabase into your existing CIV7 Tracker site.

## Overview

We're replacing `localStorage` with Supabase API calls. The good news: **we're keeping the same API**, so most of your existing code doesn't need to change!

## Architecture

```text
[HTML Pages] → [store-supabase.js] → [Supabase API] → [PostgreSQL Database]
     ↑                ↑                      ↑
  Same calls    Same functions         New backend
```

Your HTML/JS code still calls `CivStore.getWorldWonders()`, but now it talks to Supabase instead of localStorage.

## Step-by-Step Integration

### Step 1: Get Supabase Credentials

Follow the [Setup Guide](./setup-guide.md) to:

1. Create Supabase account
2. Create project
3. Get API keys (URL + anon key)

### Step 2: Run Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Open `docs/supabase/database-schema.sql`
3. Copy the entire file
4. Paste into SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Verify tables were created (check Table Editor)

**Expected:** You should see tables like `world_wonders`, `civilizations`, etc.

### Step 3: Create Config File

1. **Copy the example file:**
   - Copy `js/supabase-config.example.js`
   - Paste it as `js/supabase-config.js` (same folder)

2. **Open `js/supabase-config.js` in a text editor** (Notepad++, VS Code, etc.)

3. **Find these two lines** (around lines 16-17):

   ```javascript
   url: 'https://your-project-id.supabase.co',
   anonKey: 'your-anon-public-key-here'
   ```

4. **Replace the placeholder values:**
   - Replace `'https://your-project-id.supabase.co'` with your actual Project URL from Supabase
   - Replace `'your-anon-public-key-here'` with your actual anon key (the long string starting with `eyJ...`)

   **Example after replacing:**

   ```javascript
   url: 'https://abcdefghijklmnop.supabase.co',
   anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODU2Nzg5MCwiZXhwIjoxOTU0MTQzODkwfQ.xyz123...'
   ```

5. **Save the file**

6. **Verify:** The file `js/supabase-config.js` should NOT be in git (it's in `.gitignore` - safe!)

### Step 4: Update HTML Pages

For each page that uses `CivStore` (like `data-wonders.html`):

**Find this section near the bottom of `data-wonders.html`:**

```html
<script src="js/store.js"></script>
<script src="js/data-wonders.js"></script>
<script src="js/main.js"></script>
```

**Replace the first line** with these THREE lines:

```html
<!-- Supabase JS library (loads first) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- Your config file (contains API keys) -->
<script src="js/supabase-config.js"></script>
<!-- Supabase store (replaces store.js) -->
<script src="js/store-supabase.js"></script>
<!-- Your page code (unchanged) -->
<script src="js/data-wonders.js"></script>
<script src="js/main.js"></script>
```

**Important:**

- Load scripts in this exact order (Supabase → Config → Store → Your code)
- The order matters because each script depends on the previous one
- Don't remove the other script tags (`data-wonders.js` and `main.js` stay the same)

### Step 5: Update JavaScript Code (Optional)

The store API is the same, so **most code works without changes**. However, since Supabase is async, you might want to update some calls:

**Old (sync):**

```javascript
var wonders = CivStore.getWorldWonders();
```

**New (async - recommended):**

```javascript
CivStore.getWorldWondersAsync().then(function(wonders) {
  // Use wonders here
});
```

**Or use async/await (if supported):**

```javascript
var wonders = await CivStore.getWorldWondersAsync();
```

### Step 6: Test Locally

1. Open `data-wonders.html` in browser
2. Open browser console (F12)
3. Check for errors
4. Try loading wonders (should come from Supabase now)
5. Try saving a wonder
6. Check Supabase Table Editor - you should see the data!

### Step 7: Test Multi-User

1. Open site in two different browsers (or devices)
2. Browser 1: Add/edit a wonder
3. Browser 2: Refresh page - should see the change!
4. ✅ Multi-user sync is working!

## Migration from localStorage

If you have existing data in localStorage:

1. **Export current data:**
   - Use existing export feature (if available)
   - Or open browser console and run:

     ```javascript
     var data = localStorage.getItem('civ7-tracker-data');
     console.log(JSON.stringify(JSON.parse(data), null, 2));
     ```

2. **Import to Supabase:**
   - Use the Import JSON feature in data-wonders.html
   - Or use Supabase Table Editor to insert manually

## API Reference

### Synchronous Methods (Cache-Based)

These return immediately but may return stale data:

- `CivStore.getWorldWonders()` - Returns cached array
- `CivStore.getWorldWonderById(id)` - Returns cached wonder or null

### Asynchronous Methods (Recommended)

These return Promises with fresh data:

- `CivStore.getWorldWondersAsync()` - Returns Promise of Array
- `CivStore.getWorldWonderByIdAsync(id)` - Returns Promise of Wonder or null
- `CivStore.saveWorldWonderAsync(wonder)` - Returns Promise of Wonder
- `CivStore.deleteWorldWonderAsync(id)` - Returns Promise of boolean
- `CivStore.setWorldWondersAsync(list)` - Returns Promise of Array
- `CivStore.exportStateAsync()` - Returns Promise of Object

## Error Handling

The store includes error handling:

- **Network errors:** Logged to console, user sees error message
- **Validation errors:** Thrown as errors (invalid data, missing ID, etc.)
- **Not found:** Returns `null` (not an error)

## Troubleshooting

### "Supabase client not found"

- Make sure Supabase JS library loads before `store-supabase.js`
- Check browser console for script load errors

### "Config not found"

- Make sure `js/supabase-config.js` exists
- Check that values are filled in (not placeholders)

### "Table doesn't exist"

- Run the SQL schema script in Supabase SQL Editor
- Check Table Editor to verify tables exist

### "Permission denied"

- Check Row Level Security (RLS) policies in Supabase
- Make sure policies allow SELECT/INSERT/UPDATE/DELETE

### "CORS error"

- Supabase handles CORS automatically
- If you see CORS errors, check API key is correct

### Data not syncing

- Check browser console for errors
- Verify API keys in config file
- Check Supabase dashboard for API usage/errors

## Next Steps

Once basic integration works:

1. **Add real-time sync:** Enable Supabase subscriptions
2. **Add authentication:** User login (optional)
3. **Optimize queries:** Add indexes, optimize SQL
4. **Add other entities:** Civilizations, leaders, etc. (same pattern)

## File Checklist

✅ `docs/supabase/setup-guide.md` - Account setup  
✅ `docs/supabase/database-schema.sql` - Database structure  
✅ `docs/supabase/integration-guide.md` - This file  
✅ `js/supabase-config.example.js` - Template for config  
✅ `js/supabase-config.js` - Your actual config (create from example)  
✅ `js/store-supabase.js` - New store implementation  
✅ `.gitignore` - Updated to exclude config file  

## Questions?

- **Schema questions:** Check `database-schema.sql` comments
- **API questions:** Check Supabase docs: <https://supabase.com/docs>
- **Store questions:** Check `store-supabase.js` comments
