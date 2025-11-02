# Supabase Integration for CIV7 Tracker

This directory contains everything you need to integrate Supabase (cloud database) into CIV7 Tracker, replacing localStorage with centralized storage so Tiny and Steve can share the same data.

## Quick Start

1. **Read the setup guide:** [`setup-guide.md`](./setup-guide.md) - Step-by-step account creation
2. **Run the schema:** Copy [`database-schema.sql`](./database-schema.sql) into Supabase SQL Editor
3. **Create config:** Copy `js/supabase-config.example.js` to `js/supabase-config.js` and add your keys
4. **Follow integration:** [`integration-guide.md`](./integration-guide.md) - How to update your pages

## Files in This Directory

### Documentation

- **`README.md`** (this file) - Overview and quick start
- **`setup-guide.md`** - Beginner-friendly Supabase account setup
- **`integration-guide.md`** - Step-by-step integration instructions
- **`comparison-firebase-vs-supabase.md`** - Why we chose Supabase

### Database

- **`database-schema.sql`** - Complete SQL schema for all tables
  - Run this in Supabase SQL Editor to create all tables
  - Based on Lucy's data model brainstorming

## Project Files

These files are in the main project (not this docs folder):

- **`js/supabase-config.example.js`** - Template for your API keys (copy to `supabase-config.js`)
- **`js/store-supabase.js`** - New store implementation (replaces `store.js`)
- **`.gitignore`** - Updated to exclude your actual config file

## Architecture

```text
┌─────────────┐
│ HTML Pages  │  (data-wonders.html, etc.)
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ store-supabase.js   │  (API wrapper)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supabase API        │  (Auto-generated REST APIs)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ PostgreSQL Database  │  (Cloud-hosted)
└─────────────────────┘
```

## Benefits

✅ **Shared data** - Tiny and Steve see the same data in real-time  
✅ **No server needed** - Supabase handles everything  
✅ **Free tier** - More than enough for 2 users  
✅ **Auto-APIs** - No backend code to write  
✅ **Future-proof** - Easy to add more sites/projects  

## Cost

- **Free tier:** $0/month (500MB database, 2GB bandwidth)
- **Your usage:** ~200MB estimated → well within limits
- **If you outgrow:** $25/month Pro plan (unlikely for 2 users)

## Support

- **Supabase docs:** <https://supabase.com/docs>
- **SQL help:** Check `database-schema.sql` comments
- **Integration issues:** See troubleshooting in `integration-guide.md`

## Next Steps After Setup

1. ✅ Set up Supabase account
2. ✅ Create database tables
3. ✅ Integrate into pages
4. ⏭️ Test multi-user sync
5. ⏭️ Add other entities (civilizations, leaders, etc.)
6. ⏭️ Enable real-time subscriptions (optional)

Ready to start? Begin with [`setup-guide.md`](./setup-guide.md)!
