# Supabase Migration Checklist

Use this checklist to track your migration from localStorage to Supabase.

## Phase 1: Setup

- [ ] Read [`setup-guide.md`](./setup-guide.md)
- [ ] Create Supabase account (sign up with GitHub)
- [ ] Create new project named `civ7-tracker`
- [ ] Save database password (from project creation)
- [ ] Get API credentials (Project URL + anon key)
- [ ] Save credentials somewhere safe (text file, password manager)

## Phase 2: Database Creation

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Open `docs/supabase/database-schema.sql`
- [ ] Copy entire SQL file
- [ ] Paste into SQL Editor
- [ ] Click "Run" (or Ctrl+Enter)
- [ ] Verify success message
- [ ] Check Table Editor → should see all tables created

**Tables you should see:**

- ages
- ideologies  
- technologies
- civics
- world_wonders
- natural_wonders
- city_states
- civilizations
- leaders
- mementos
- ownership_history
- game_sessions

## Phase 3: Configuration

- [ ] Copy `js/supabase-config.example.js` to `js/supabase-config.js` (in same folder)
- [ ] Open `js/supabase-config.js` in text editor (Notepad++, VS Code, etc.)
- [ ] Find line 16: `url: 'https://your-project-id.supabase.co',`
  - [ ] Replace `'https://your-project-id.supabase.co'` with your actual Project URL (from Supabase)
- [ ] Find line 17: `anonKey: 'your-anon-public-key-here'`
  - [ ] Replace `'your-anon-public-key-here'` with your actual anon key (long string from Supabase)
- [ ] Save file
- [ ] Verify file is NOT committed to git (it's in `.gitignore`)

## Phase 4: Code Integration

- [ ] Read [`integration-guide.md`](./integration-guide.md) - Step 4
- [ ] Backup existing `data-wonders.html` (copy to `data-wonders.html.backup`)
- [ ] Open `data-wonders.html` in text editor
- [ ] Find the line: `<script src="js/store.js"></script>` (near bottom, around line 221)
- [ ] Replace that ONE line with these THREE lines:

  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-config.js"></script>
  <script src="js/store-supabase.js"></script>
  ```

- [ ] Keep the other script lines (`data-wonders.js` and `main.js`) unchanged
- [ ] Save file

## Phase 5: Testing

- [ ] Open `data-wonders.html` in browser
- [ ] Open browser console (F12)
- [ ] Check for errors (should be none)
- [ ] Try loading wonders (might be empty initially)
- [ ] Try adding a new wonder
- [ ] Check Supabase Table Editor → should see new wonder
- [ ] Try editing a wonder
- [ ] Verify changes appear in Supabase

## Phase 6: Multi-User Test

- [ ] Open site in Browser 1 (or device 1)
- [ ] Open site in Browser 2 (or device 2)  
- [ ] Browser 1: Add/edit a wonder
- [ ] Browser 2: Refresh page
- [ ] Browser 2: Should see Browser 1's changes ✅
- [ ] Test in reverse (Browser 2 makes change, Browser 1 sees it)

## Phase 7: Data Migration (If you have existing data)

- [ ] Open browser console on page with existing localStorage data
- [ ] Run: `JSON.stringify(JSON.parse(localStorage.getItem('civ7-tracker-data')), null, 2)`
- [ ] Copy the JSON output
- [ ] Use Import JSON feature in data-wonders.html
- [ ] Or manually add data via Supabase Table Editor
- [ ] Verify all data migrated correctly

## Phase 8: Cleanup (Optional)

- [ ] Remove old `store.js` (or keep as backup)
- [ ] Update other pages that use `store.js`
- [ ] Document any custom changes you made

## Troubleshooting

If something doesn't work:

1. **Check browser console** for error messages
2. **Verify API keys** in `supabase-config.js` are correct
3. **Check Supabase dashboard** for API errors
4. **Verify tables exist** in Table Editor
5. **Check RLS policies** - make sure they allow SELECT/INSERT/UPDATE/DELETE
6. **See [`integration-guide.md`](./integration-guide.md)** troubleshooting section

## Success Criteria

✅ Wonders load from Supabase (not localStorage)  
✅ Can add/edit/delete wonders  
✅ Changes persist across browser refreshes  
✅ Two browsers/devices see the same data  
✅ No console errors  

## Next Steps

After successful migration:

- [ ] Add real-time sync (optional, see Supabase subscriptions)
- [ ] Add other entities (civilizations, leaders, etc.)
- [ ] Create stats pages that query the database
- [ ] Consider adding user authentication (optional)

---

**Time Estimate:** 30-45 minutes for full setup and testing

**Difficulty:** Beginner-friendly (we'll guide you through each step)

**Need Help?** Check the other guides in this directory or Supabase docs: <https://supabase.com/docs>
