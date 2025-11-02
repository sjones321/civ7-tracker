// Supabase Configuration - Example File
// 
// INSTRUCTIONS:
// 1. Copy this file to: js/supabase-config.js
// 2. Replace the placeholder values with your actual Supabase credentials
// 3. Get your credentials from: Supabase Dashboard → Settings → API
// 4. NEVER commit js/supabase-config.js to git (it's in .gitignore)

(function (global) {
  'use strict';

  // Replace these with your actual Supabase project credentials
  // Get them from: Supabase Dashboard → Settings → API
  
  global.SupabaseConfig = {
    url: 'https://your-project-id.supabase.co',  // Your Project URL
    anonKey: 'your-anon-public-key-here'          // Your anon public key
  };

  // Example of what real values look like:
  // url: 'https://abcdefghijklmnop.supabase.co'
  // anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' (very long string)

})(window);

