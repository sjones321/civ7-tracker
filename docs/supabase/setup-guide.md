# Supabase Setup Guide - Beginner Friendly

This guide will walk you through setting up Supabase for CIV7 Tracker step-by-step. Even if you've never used a database before, we'll go through it together.

## What You'll Need

- A GitHub account (to sign up for Supabase)
- About 15 minutes
- A text editor or notes app (to save your API keys)

## Step 1: Create Supabase Account

1. **Go to Supabase:** Open <https://supabase.com> in your browser

2. **Click "Start your project"** (top right) or **"Sign in"**

3. **Sign up with GitHub:**
   - Click the "Continue with GitHub" button
   - This is easiest because:
     - No separate password to remember
     - Fast signup
     - Links to your GitHub account (which you already use)

4. **Authorize Supabase:**
   - GitHub will ask if you want to authorize Supabase
   - Click "Authorize supabase"
   - This just lets Supabase see your GitHub profile (for login)

5. **Complete profile (if asked):**
   - You might be asked for organization name
   - Just use your GitHub username or a simple name like "my-projects"
   - This doesn't affect anything, just organization

**You're now logged in!** You should see the Supabase dashboard.

---

## Step 2: Create a New Project

1. **Click "New Project"** (green button, usually top right or center)

2. **Fill in project details:**
   - **Name:** `civ7-tracker` (or whatever you prefer)
     - This is just for you to identify it
     - You can change it later
   - **Database Password:**
     - Click "Generate a strong password" (recommended)
     - **SAVE THIS PASSWORD!**
     - Copy it to a text file or password manager
     - You'll need it if you ever connect directly to the database
     - You can also reset it later, but saving is easier
   - **Region:**
     - Choose the region closest to you
     - For US: `US East (N. Virginia)` or `US West (Oregon)`
     - For Europe: `West EU (Ireland)` or `Central EU (Frankfurt)`
     - Closer = faster, but not critical for small projects

3. **Review pricing:**
   - Make sure it shows "Free" plan (it should by default)
   - This gives you:
     - 500MB database
     - 2GB bandwidth/month
     - More than enough for your needs

4. **Click "Create new project"**
   - Wait 2-3 minutes
   - Supabase is setting up your database server
   - You'll see a progress screen

**Project created!** You'll see the project dashboard.

---

## Step 3: Get Your API Keys

This is the most important step - you'll use these keys to connect your website to Supabase.

1. **Go to Project Settings:**
   - Click the gear icon (⚙️) in the left sidebar
   - Click "API" in the settings menu

2. **Find your keys:**
   - You'll see several sections:
     - **Project URL** - Save this!
     - **anon public** key - This is what we'll use
     - **service_role** key - Keep this secret (we won't use it initially)

3. **Copy and save these values:**
   - **Project URL:** Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`

   **Save them in a text file or notes app** - you'll need them in the code.

4. **Understanding the keys:**
   - **Project URL:** Where to send API requests
   - **anon public key:** Safe to use in frontend code (it's meant to be public)
   - **service_role key:** Keep secret (we'll ignore this for now)

**Important:** These keys are safe to put in your frontend code because Supabase has Row Level Security (we'll set that up). The `anon` key is meant to be public.

---

## Step 4: Test Your Connection (Optional)

Let's verify everything works:

1. **Go to Table Editor:**
   - Click "Table Editor" in the left sidebar
   - You'll see it's empty (no tables yet)
   - This is normal!

2. **Go to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - You can run SQL commands here
   - We'll use this later to create tables

3. **Check API docs:**
   - Click "API" in the left sidebar
   - You'll see auto-generated API docs
   - This shows all the APIs Supabase creates for you (once we add tables)

**Everything looks good!** Your Supabase project is ready.

---

## Step 5: Security Setup (Quick Overview)

Supabase uses "Row Level Security" (RLS) to control who can read/write data. For now:

1. **We'll create tables first** (next step)
2. **Then enable RLS** with simple rules (allow all for 2 users)

For CIV7 Tracker:

- Simple setup: Allow read/write for anyone with the API key
- Later: Add user authentication if needed
- Your data isn't sensitive (game tracking), so simple is fine

---

## What's Next?

Now that Supabase is set up:

1. ✅ You have API credentials saved
2. ✅ Project is ready
3. ⏭️ Next: Create database tables (we'll do this together)
4. ⏭️ Then: Connect your frontend code

## Troubleshooting

### "I can't find the API keys"

- Make sure you're in Project Settings (gear icon) → API
- Different from Account Settings

### "Project creation is stuck"

- Refresh the page
- Sometimes it takes longer
- If it's been 10+ minutes, create a new project

### "I forgot my database password"

- Go to Project Settings → Database
- Click "Reset database password"
- Save the new one!

### "Which region should I choose?"

- Pick the closest to you
- It doesn't matter much for small projects
- You can't change it later, but it's not critical

---

## Quick Reference

**Your Supabase Project:**

- Dashboard: <https://app.supabase.com>
- Find your project in the dashboard
- Settings: Gear icon → various sections

**Important URLs:**

- Project URL: `https://[your-project-id].supabase.co`
- API docs: Dashboard → API (left sidebar)
- SQL Editor: Dashboard → SQL Editor (left sidebar)

**Keys to save:**

- Project URL
- anon public key

You're all set! Ready to create the database tables next.
