// Supabase Configuration
// 
// This file contains the Supabase API credentials for CIV7 Tracker.
// It's committed to the repo because:
// 1. GitHub Pages needs it to serve the live site
// 2. The anon key is safe to be public - designed for client-side use
// 3. Row Level Security (RLS) policies protect the database
//
// Get your credentials from: Supabase Dashboard → Settings → API

(function (global) {
  'use strict';

  // Replace these with your actual Supabase project credentials
  // Get them from: Supabase Dashboard → Settings → API
  
  global.SupabaseConfig = {
    url: 'https://sikaqswroyqsmyhezscr.supabase.co',  // Your Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpa2Fxc3dyb3lxc215aGV6c2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDQ4NzIsImV4cCI6MjA3NzY4MDg3Mn0.sjNgkoBY0OCewn35Vxml83m4MsXZp9GCfG_tTJTfX7o'          // Your anon public key
  };

  // Example of what real values look like:
  // url: 'https://abcdefghijklmnop.supabase.co'
  // anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' (very long string)

})(window);

