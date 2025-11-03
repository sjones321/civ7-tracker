// CIV7 Tracker Store - Supabase Backend
// 
// This replaces localStorage with Supabase API calls
// Same public API as store.js, so existing code doesn't need changes
//
// Setup:
// 1. Include Supabase JS library: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// 2. Include config: <script src="js/supabase-config.js"></script>
// 3. Include this file: <script src="js/store-supabase.js"></script>

(function (global) {
  'use strict';

  // Check for Supabase library and config
  if (!global.supabase || typeof global.supabase.createClient !== 'function') {
    console.error('[store-supabase] Supabase library not found. Make sure to include:');
    console.error('  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    console.error('  BEFORE this script in your HTML');
    return;
  }

  if (!global.SupabaseConfig || !global.SupabaseConfig.url || !global.SupabaseConfig.anonKey) {
    console.error('[store-supabase] Supabase config not found. Make sure to:');
    console.error('  1. Copy js/supabase-config.example.js to js/supabase-config.js');
    console.error('  2. Add your actual Project URL and anon key to the config file');
    console.error('  3. Include the config file BEFORE this script in your HTML');
    return;
  }

  // Initialize Supabase client (expose globally for reuse)
  var supabaseClient = global.supabase.createClient(
    global.SupabaseConfig.url,
    global.SupabaseConfig.anonKey
  );
  // Expose globally for other scripts to reuse
  global.supabaseClient = supabaseClient;

  var TABLE_NAME = 'world_wonders';
  var cache = null;
  var lastFetchTime = null;
  var CACHE_DURATION = 5000; // 5 seconds cache to reduce API calls

  // Error handler
  function handleError(operation, error) {
    console.error('[store-supabase]', operation, 'failed:', error);
    // In production, you might show a user-friendly message
    throw new Error(operation + ' failed: ' + (error.message || error));
  }

  // Clone helper (deep copy)
  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  // Fetch all wonders from Supabase
  function fetchWorldWonders() {
    var now = Date.now();
    
    // Use cache if recent
    if (cache && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      return Promise.resolve(cache);
    }

    return supabaseClient
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Fetch error:', response.error);
          handleError('fetchWorldWonders', response.error);
          return [];
        }
        
        // Convert database rows to wonder objects
        var wonders = (response.data || []).map(function (row) {
          return convertFromDb(row);
        });
        
        console.log('[store-supabase] Loaded', wonders.length, 'wonders from Supabase');
        cache = wonders;
        lastFetchTime = now;
        return wonders;
      });
  }

  // Convert database row to wonder object (matching localStorage format)
  function convertFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      age: row.last_owner_age || '',
      iconUrl: row.icon_url || '',
      bonus: row.summary_bonus || '',
      productionCost: row.production_cost || 0,
      associatedCiv: row.associated_civ_id || '',
      ownerType: row.last_owner_role || '',
      ownerLeader: row.last_owner_leader_id || '',
      ownerCiv: row.last_owner_civ_id || '',
      bigTicket: Boolean(row.big_ticket),
      unlockCivic: row.unlock_civic || '',
      civSpecificUnlock: row.civ_specific_unlock || null, // JSONB object {civId, civicId}
      placement: row.requirements && row.requirements.placement ? row.requirements.placement : (typeof row.requirements === 'string' ? row.requirements : ''),
      effects: row.effects || null, // JSONB array
      civProductionBonus: row.civ_production_bonus || '',
      ownershipHistory: [] // Will be fetched separately from ownership_history table if needed
    };
  }

  // Convert wonder object to database row format
  function convertToDb(wonder) {
    // Build requirements JSONB (store placement as part of requirements for now)
    var requirementsJson = null;
    if (wonder.placement) {
      requirementsJson = { placement: wonder.placement };
    } else if (wonder.requirements) {
      requirementsJson = typeof wonder.requirements === 'string' ? JSON.parse(wonder.requirements) : wonder.requirements;
    }

    return {
      id: wonder.id,
      name: wonder.name,
      summary_bonus: wonder.bonus || '',
      icon_url: wonder.iconUrl || '',
      production_cost: wonder.productionCost || null,
      associated_civ_id: wonder.associatedCiv || null,
      last_owner_age: wonder.age || '',
      last_owner_role: wonder.ownerType || '',
      last_owner_leader_id: wonder.ownerLeader || '',
      last_owner_civ_id: wonder.ownerCiv || '',
      big_ticket: Boolean(wonder.bigTicket),
      unlock_civic: wonder.unlockCivic || null,
      civ_specific_unlock: wonder.civSpecificUnlock || null, // JSONB object {civId, civicId}
      requirements: requirementsJson,
      effects: Array.isArray(wonder.effects) ? wonder.effects : (wonder.effects || null), // JSONB array
      civ_production_bonus: wonder.civProductionBonus || null
    };
  }

  // Get all world wonders
  function getWorldWonders() {
    // This is async, but we maintain sync API for compatibility
    // In real usage, you'd want to make this async or use callbacks
    // For now, return empty array and let async operations handle it
    if (cache) {
      return cloneState(cache);
    }
    return [];
  }

  // Get all world wonders (async version)
  function getWorldWondersAsync() {
    return fetchWorldWonders();
  }

  // Get a wonder by ID
  function getWorldWonderById(id) {
    if (!id) {
      return null;
    }

    return supabaseClient
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') {
            // Not found
            return null;
          }
          handleError('getWorldWonderById', response.error);
          return null;
        }
        
        return convertFromDb(response.data);
      });
  }

  // Save a world wonder (insert or update)
  function saveWorldWonder(wonder) {
    if (!wonder || typeof wonder !== 'object') {
      throw new Error('World Wonder must be an object.');
    }
    if (!wonder.id) {
      throw new Error('World Wonder requires an id.');
    }

    var dbRow = convertToDb(wonder);

    // Try to upsert (insert or update)
    return supabaseClient
      .from(TABLE_NAME)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Save error:', response.error);
          handleError('saveWorldWonder', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        
        console.log('[store-supabase] Saved wonder:', wonder.id, wonder.name);
        
        // Invalidate cache
        cache = null;
        lastFetchTime = null;
        
        // Fetch the saved record to return
        return getWorldWonderById(wonder.id);
      });
  }

  // Delete a world wonder
  function deleteWorldWonder(id) {
    if (!id) {
      return Promise.resolve(false);
    }

    return supabaseClient
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteWorldWonder', response.error);
          return false;
        }
        
        // Invalidate cache
        cache = null;
        lastFetchTime = null;
        
        return (response.data && response.data.length > 0);
      });
  }

  // Set all world wonders (replace entire list)
  function setWorldWonders(list) {
    if (!Array.isArray(list)) {
      throw new Error('World Wonders payload must be an array.');
    }

    // Validate all items
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) {
        throw new Error('Each World Wonder requires an id.');
      }
      normalized.push(convertToDb(item));
    }

    // Delete all existing, then insert new ones
    // (Simpler than trying to diff - for small datasets this is fine)
    return supabaseClient
      .from(TABLE_NAME)
      .delete()
      .neq('id', '') // Delete all
      .then(function () {
        if (normalized.length === 0) {
          cache = [];
          lastFetchTime = Date.now();
          return Promise.resolve([]);
        }

        return supabaseClient
          .from(TABLE_NAME)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setWorldWonders', response.error);
              throw new Error('Failed to set wonders: ' + response.error.message);
            }
            
            // Invalidate cache
            cache = null;
            lastFetchTime = null;
            
            return fetchWorldWonders();
          });
      });
  }

  // Export current state (for backup/export feature)
  function exportState() {
    return fetchWorldWonders().then(function (wonders) {
      return { worldWonders: wonders };
    });
  }

  // Public API - matches store.js interface
  global.CivStore = {
    // Sync versions (may return empty initially until async completes)
    getWorldWonders: getWorldWonders,
    getWorldWonderById: getWorldWonderById,
    saveWorldWonder: saveWorldWonder,
    deleteWorldWonder: deleteWorldWonder,
    setWorldWonders: setWorldWonders,
    exportState: exportState,
    
    // Async versions (recommended)
    getWorldWondersAsync: getWorldWondersAsync,
    getWorldWonderByIdAsync: getWorldWonderById,
    saveWorldWonderAsync: saveWorldWonder,
    deleteWorldWonderAsync: deleteWorldWonder,
    setWorldWondersAsync: setWorldWonders,
    exportStateAsync: exportState
  };

  // Auto-fetch on load (so sync methods work)
  fetchWorldWonders().catch(function (error) {
    console.warn('[store-supabase] Initial fetch failed:', error);
    cache = [];
  });

})(window);

