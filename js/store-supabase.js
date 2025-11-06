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

    var dbRow = {
      id: wonder.id,
      name: wonder.name,
      summary_bonus: wonder.bonus || '',
      icon_url: wonder.iconUrl || '',
      production_cost: wonder.productionCost || null,
      associated_civ_id: wonder.associatedCiv || null,
      last_owner_age: wonder.age || '',
      last_owner_role: (wonder.ownerType && wonder.ownerType.trim()) ? wonder.ownerType : null,
      last_owner_leader_id: wonder.ownerLeader || null,
      last_owner_civ_id: wonder.ownerCiv || null,
      big_ticket: Boolean(wonder.bigTicket),
      unlock_civic: wonder.unlockCivic || null,
      civ_specific_unlock: wonder.civSpecificUnlock || null, // JSONB object {civId, civicId}
      requirements: requirementsJson,
      effects: Array.isArray(wonder.effects) ? wonder.effects : (wonder.effects || null), // JSONB array
      civ_production_bonus: wonder.civProductionBonus || null
    };
    
    console.log('[store-supabase] Converting wonder to DB format:', wonder.id, dbRow);
    return dbRow;
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

  // ========================================
  // LEADERS API
  // ========================================
  
  var LEADERS_TABLE = 'leaders';
  var leadersCache = null;
  var leadersLastFetchTime = null;

  // Fetch all leaders from Supabase
  function fetchLeaders() {
    var now = Date.now();
    
    // Use cache if recent
    if (leadersCache && leadersLastFetchTime && (now - leadersLastFetchTime) < CACHE_DURATION) {
      return Promise.resolve(leadersCache);
    }

    return supabaseClient
      .from(LEADERS_TABLE)
      .select('*')
      .order('name', { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Leaders fetch error:', response.error);
          handleError('fetchLeaders', response.error);
          return [];
        }
        
        // Convert database rows to leader objects
        var leaders = (response.data || []).map(function (row) {
          return convertLeaderFromDb(row);
        });
        
        console.log('[store-supabase] Loaded', leaders.length, 'leaders from Supabase');
        leadersCache = leaders;
        leadersLastFetchTime = now;
        return leaders;
      });
  }

  // Convert database row to leader object
  function convertLeaderFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      iconUrl: row.picture_url || (row.icon_url || ''),
      tinyLevel: row.tiny_level || 1,
      steveLevel: row.steve_level || 1,
      effects: row.effects || null,
      levelUnlocks: row.level_unlocks || null
    };
  }

  // Convert leader object to database row format
  function convertLeaderToDb(leader) {
    return {
      id: leader.id,
      name: leader.name,
      picture_url: leader.iconUrl || '',
      tiny_level: leader.tinyLevel || 1,
      steve_level: leader.steveLevel || 1,
      effects: Array.isArray(leader.effects) ? leader.effects : null,
      level_unlocks: Array.isArray(leader.levelUnlocks) ? leader.levelUnlocks : null
    };
  }

  // Get all leaders (async)
  function getLeadersAsync() {
    return fetchLeaders();
  }

  // Get a leader by ID
  function getLeaderById(id) {
    if (!id) {
      return Promise.resolve(null);
    }

    return supabaseClient
      .from(LEADERS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') {
            return null;
          }
          handleError('getLeaderById', response.error);
          return null;
        }
        
        return convertLeaderFromDb(response.data);
      });
  }

  // Save a leader (insert or update)
  function saveLeader(leader) {
    if (!leader || typeof leader !== 'object') {
      throw new Error('Leader must be an object.');
    }
    if (!leader.id) {
      throw new Error('Leader requires an id.');
    }

    var dbRow = convertLeaderToDb(leader);

    return supabaseClient
      .from(LEADERS_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Leader save error:', response.error);
          handleError('saveLeader', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        
        console.log('[store-supabase] Saved leader:', leader.id, leader.name);
        
        // Invalidate cache
        leadersCache = null;
        leadersLastFetchTime = null;
        
        // Fetch the saved record to return
        return getLeaderById(leader.id);
      });
  }

  // Delete a leader
  function deleteLeader(id) {
    if (!id) {
      return Promise.resolve(false);
    }

    return supabaseClient
      .from(LEADERS_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteLeader', response.error);
          return false;
        }
        
        // Invalidate cache
        leadersCache = null;
        leadersLastFetchTime = null;
        
        return true;
      });
  }

  // Set all leaders (replace entire list)
  function setLeaders(list) {
    if (!Array.isArray(list)) {
      throw new Error('Leaders payload must be an array.');
    }

    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) {
        throw new Error('Each Leader requires an id.');
      }
      normalized.push(convertLeaderToDb(item));
    }

    return supabaseClient
      .from(LEADERS_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          leadersCache = [];
          leadersLastFetchTime = Date.now();
          return Promise.resolve([]);
        }

        return supabaseClient
          .from(LEADERS_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setLeaders', response.error);
              throw new Error('Failed to set leaders: ' + response.error.message);
            }
            
            // Invalidate cache
            leadersCache = null;
            leadersLastFetchTime = null;
            
            return fetchLeaders();
          });
      });
  }

  // ========================================
  // CIVILIZATIONS API
  // ========================================
  
  var CIVILIZATIONS_TABLE = 'civilizations';
  var civsCache = null;
  var civsLastFetchTime = null;

  // Fetch all civilizations from Supabase
  function fetchCivilizations() {
    var now = Date.now();
    
    if (civsCache && civsLastFetchTime && (now - civsLastFetchTime) < CACHE_DURATION) {
      return Promise.resolve(civsCache);
    }

    return supabaseClient
      .from(CIVILIZATIONS_TABLE)
      .select('*')
      .order('name', { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Civilizations fetch error:', response.error);
          handleError('fetchCivilizations', response.error);
          return [];
        }
        
        var civs = (response.data || []).map(function (row) {
          return convertCivFromDb(row);
        });
        
        console.log('[store-supabase] Loaded', civs.length, 'civilizations from Supabase');
        civsCache = civs;
        civsLastFetchTime = now;
        return civs;
      });
  }

  // Convert database row to civilization object
  function convertCivFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      age: row.age || '',
      iconUrl: row.icon_url || '',
      uniqueUnits: row.unique_units || null,
      uniqueBuildingsOrQuarters: row.unique_buildings_or_quarters || null,
      passiveBonuses: row.passive_bonuses || null,
      uniqueCivics: row.unique_civics || null,
      productionBonusForWonder: row.production_bonus_for_wonder || null,
      enduringCapable: Boolean(row.enduring_capable)
    };
  }

  // Convert civilization object to database row format
  function convertCivToDb(civ) {
    return {
      id: civ.id,
      name: civ.name,
      age: civ.age || 'Antiquity',
      icon_url: civ.iconUrl || '',
      unique_units: Array.isArray(civ.uniqueUnits) ? civ.uniqueUnits : null,
      unique_buildings_or_quarters: civ.uniqueBuildingsOrQuarters || null,
      passive_bonuses: Array.isArray(civ.passiveBonuses) ? civ.passiveBonuses : null,
      unique_civics: Array.isArray(civ.uniqueCivics) ? civ.uniqueCivics : null,
      production_bonus_for_wonder: civ.productionBonusForWonder || null,
      enduring_capable: Boolean(civ.enduringCapable)
    };
  }

  // Get all civilizations (async)
  function getCivilizationsAsync() {
    return fetchCivilizations();
  }

  // Get a civilization by ID
  function getCivilizationById(id) {
    if (!id) {
      return Promise.resolve(null);
    }

    return supabaseClient
      .from(CIVILIZATIONS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') {
            return null;
          }
          handleError('getCivilizationById', response.error);
          return null;
        }
        
        return convertCivFromDb(response.data);
      });
  }

  // Save a civilization (insert or update)
  function saveCivilization(civ) {
    if (!civ || typeof civ !== 'object') {
      throw new Error('Civilization must be an object.');
    }
    if (!civ.id) {
      throw new Error('Civilization requires an id.');
    }

    var dbRow = convertCivToDb(civ);

    return supabaseClient
      .from(CIVILIZATIONS_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Civilization save error:', response.error);
          handleError('saveCivilization', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        
        console.log('[store-supabase] Saved civilization:', civ.id, civ.name);
        
        civsCache = null;
        civsLastFetchTime = null;
        
        return getCivilizationById(civ.id);
      });
  }

  // Delete a civilization
  function deleteCivilization(id) {
    if (!id) {
      return Promise.resolve(false);
    }

    return supabaseClient
      .from(CIVILIZATIONS_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteCivilization', response.error);
          return false;
        }
        
        civsCache = null;
        civsLastFetchTime = null;
        
        return true;
      });
  }

  // Set all civilizations (replace entire list)
  function setCivilizations(list) {
    if (!Array.isArray(list)) {
      throw new Error('Civilizations payload must be an array.');
    }

    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) {
        throw new Error('Each Civilization requires an id.');
      }
      normalized.push(convertCivToDb(item));
    }

    return supabaseClient
      .from(CIVILIZATIONS_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          civsCache = [];
          civsLastFetchTime = Date.now();
          return Promise.resolve([]);
        }

        return supabaseClient
          .from(CIVILIZATIONS_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setCivilizations', response.error);
              throw new Error('Failed to set civilizations: ' + response.error.message);
            }
            
            civsCache = null;
            civsLastFetchTime = null;
            
            return fetchCivilizations();
          });
      });
  }

  // ========================================
  // TECHNOLOGIES API
  // ========================================
  
  var TECHNOLOGIES_TABLE = 'technologies';
  var techsCache = null;
  var techsLastFetchTime = null;

  function fetchTechnologies() {
    var now = Date.now();
    if (techsCache && techsLastFetchTime && (now - techsLastFetchTime) < CACHE_DURATION) {
      return Promise.resolve(techsCache);
    }

    return supabaseClient
      .from(TECHNOLOGIES_TABLE)
      .select('*')
      .order('name', { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Technologies fetch error:', response.error);
          handleError('fetchTechnologies', response.error);
          return [];
        }
        
        var techs = (response.data || []).map(function (row) {
          return convertTechFromDb(row);
        });
        
        console.log('[store-supabase] Loaded', techs.length, 'technologies from Supabase');
        techsCache = techs;
        techsLastFetchTime = now;
        return techs;
      });
  }

  function convertTechFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      age: row.era || row.age || '',
      iconUrl: row.icon_url || '',
      productionCost: row.production_cost || null,
      effects: row.effects || null,
      wonderUnlock: row.wonder_unlock || null,
      socialPolicies: row.social_policies || null,
      unitUnlocks: row.unit_unlocks || null,
      buildingUnlocks: row.building_unlocks || null,
      civSpecificUnlock: row.civ_specific_unlock || null
    };
  }

  function convertTechToDb(tech) {
    return {
      id: tech.id,
      name: tech.name,
      era: tech.age || '',
      icon_url: tech.iconUrl || '',
      production_cost: tech.productionCost || null,
      effects: Array.isArray(tech.effects) ? tech.effects : null,
      wonder_unlock: tech.wonderUnlock || null,
      social_policies: Array.isArray(tech.socialPolicies) ? tech.socialPolicies : null,
      unit_unlocks: Array.isArray(tech.unitUnlocks) ? tech.unitUnlocks : null,
      building_unlocks: Array.isArray(tech.buildingUnlocks) ? tech.buildingUnlocks : null,
      civ_specific_unlock: tech.civSpecificUnlock || null
    };
  }

  function getTechnologiesAsync() { return fetchTechnologies(); }

  function getTechnologyById(id) {
    if (!id) return Promise.resolve(null);
    return supabaseClient
      .from(TECHNOLOGIES_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') return null;
          handleError('getTechnologyById', response.error);
          return null;
        }
        return convertTechFromDb(response.data);
      });
  }

  function saveTechnology(tech) {
    if (!tech || typeof tech !== 'object') throw new Error('Technology must be an object.');
    if (!tech.id) throw new Error('Technology requires an id.');
    var dbRow = convertTechToDb(tech);
    return supabaseClient
      .from(TECHNOLOGIES_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Technology save error:', response.error);
          handleError('saveTechnology', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        console.log('[store-supabase] Saved technology:', tech.id, tech.name);
        techsCache = null;
        techsLastFetchTime = null;
        return getTechnologyById(tech.id);
      });
  }

  function deleteTechnology(id) {
    if (!id) return Promise.resolve(false);
    return supabaseClient
      .from(TECHNOLOGIES_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteTechnology', response.error);
          return false;
        }
        techsCache = null;
        techsLastFetchTime = null;
        return true;
      });
  }

  function setTechnologies(list) {
    if (!Array.isArray(list)) throw new Error('Technologies payload must be an array.');
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) throw new Error('Each Technology requires an id.');
      normalized.push(convertTechToDb(item));
    }
    return supabaseClient
      .from(TECHNOLOGIES_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          techsCache = [];
          techsLastFetchTime = Date.now();
          return Promise.resolve([]);
        }
        return supabaseClient
          .from(TECHNOLOGIES_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setTechnologies', response.error);
              throw new Error('Failed to set technologies: ' + response.error.message);
            }
            techsCache = null;
            techsLastFetchTime = null;
            return fetchTechnologies();
          });
      });
  }

  // ========================================
  // CIVICS API
  // ========================================
  
  var CIVICS_TABLE = 'civics';
  var civicsCache = null;
  var civicsLastFetchTime = null;

  function fetchCivics() {
    var now = Date.now();
    if (civicsCache && civicsLastFetchTime && (now - civicsLastFetchTime) < CACHE_DURATION) {
      return Promise.resolve(civicsCache);
    }

    return supabaseClient
      .from(CIVICS_TABLE)
      .select('*')
      .order('name', { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Civics fetch error:', response.error);
          handleError('fetchCivics', response.error);
          return [];
        }
        
        var civics = (response.data || []).map(function (row) {
          return convertCivicFromDb(row);
        });
        
        console.log('[store-supabase] Loaded', civics.length, 'civics from Supabase');
        civicsCache = civics;
        civicsLastFetchTime = now;
        return civics;
      });
  }

  function convertCivicFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      age: row.era || row.age || '',
      iconUrl: row.icon_url || '',
      productionCost: row.production_cost || null,
      effects: row.effects || null,
      wonderUnlock: row.wonder_unlock || null,
      socialPolicies: row.social_policies || null,
      unitUnlocks: row.unit_unlocks || null,
      buildingUnlocks: row.building_unlocks || null,
      civSpecificUnlock: row.civ_specific_unlock || null
    };
  }

  function convertCivicToDb(civic) {
    return {
      id: civic.id,
      name: civic.name,
      era: civic.age || '',
      icon_url: civic.iconUrl || '',
      production_cost: civic.productionCost || null,
      effects: Array.isArray(civic.effects) ? civic.effects : null,
      wonder_unlock: civic.wonderUnlock || null,
      social_policies: Array.isArray(civic.socialPolicies) ? civic.socialPolicies : null,
      unit_unlocks: Array.isArray(civic.unitUnlocks) ? civic.unitUnlocks : null,
      building_unlocks: Array.isArray(civic.buildingUnlocks) ? civic.buildingUnlocks : null,
      civ_specific_unlock: civic.civSpecificUnlock || null
    };
  }

  function getCivicsAsync() { return fetchCivics(); }

  function getCivicById(id) {
    if (!id) return Promise.resolve(null);
    return supabaseClient
      .from(CIVICS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') return null;
          handleError('getCivicById', response.error);
          return null;
        }
        return convertCivicFromDb(response.data);
      });
  }

  function saveCivic(civic) {
    if (!civic || typeof civic !== 'object') throw new Error('Civic must be an object.');
    if (!civic.id) throw new Error('Civic requires an id.');
    var dbRow = convertCivicToDb(civic);
    return supabaseClient
      .from(CIVICS_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Civic save error:', response.error);
          handleError('saveCivic', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        console.log('[store-supabase] Saved civic:', civic.id, civic.name);
        civicsCache = null;
        civicsLastFetchTime = null;
        return getCivicById(civic.id);
      });
  }

  function deleteCivic(id) {
    if (!id) return Promise.resolve(false);
    return supabaseClient
      .from(CIVICS_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteCivic', response.error);
          return false;
        }
        civicsCache = null;
        civicsLastFetchTime = null;
        return true;
      });
  }

  function setCivics(list) {
    if (!Array.isArray(list)) throw new Error('Civics payload must be an array.');
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) throw new Error('Each Civic requires an id.');
      normalized.push(convertCivicToDb(item));
    }
    return supabaseClient
      .from(CIVICS_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          civicsCache = [];
          civicsLastFetchTime = Date.now();
          return Promise.resolve([]);
        }
        return supabaseClient
          .from(CIVICS_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setCivics', response.error);
              throw new Error('Failed to set civics: ' + response.error.message);
            }
            civicsCache = null;
            civicsLastFetchTime = null;
            return fetchCivics();
          });
      });
  }

  // ========================================
  // NATURAL WONDERS API
  // ========================================
  
  var NATURAL_WONDERS_TABLE = 'natural_wonders';
  var natWondersCache = null;
  var natWondersLastFetchTime = null;

  function fetchNaturalWonders() {
    var now = Date.now();
    if (natWondersCache && natWondersLastFetchTime && (now - natWondersLastFetchTime) < CACHE_DURATION) {
      return Promise.resolve(natWondersCache);
    }

    return supabaseClient
      .from(NATURAL_WONDERS_TABLE)
      .select('*')
      .order('name', { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Natural Wonders fetch error:', response.error);
          handleError('fetchNaturalWonders', response.error);
          return [];
        }
        
        var wonders = (response.data || []).map(function (row) {
          return convertNatWonderFromDb(row);
        });
        
        console.log('[store-supabase] Loaded', wonders.length, 'natural wonders from Supabase');
        natWondersCache = wonders;
        natWondersLastFetchTime = now;
        return wonders;
      });
  }

  function convertNatWonderFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      iconUrl: row.icon_url || '',
      summaryBonus: row.summary_bonus || '',
      tileCount: row.tile_count || 1,
      terrainType: row.terrain_type || '',
      continent: row.continent || '',
      discoveredAge: row.discovered_age || '',
      effects: row.effects || null,
      controllerRole: row.last_controller_role || '',
      controllerLeader: row.last_controller_leader_id || '',
      controllerCiv: row.last_controller_civ_id || '',
      tilesOwnedBy: row.tiles_owned_by || null
    };
  }

  function convertNatWonderToDb(wonder) {
    return {
      id: wonder.id,
      name: wonder.name,
      icon_url: wonder.iconUrl || '',
      summary_bonus: wonder.summaryBonus || '',
      tile_count: wonder.tileCount || 1,
      terrain_type: wonder.terrainType || '',
      continent: wonder.continent || '',
      discovered_age: wonder.discoveredAge || '',
      effects: Array.isArray(wonder.effects) ? wonder.effects : null,
      last_controller_role: (wonder.controllerRole && wonder.controllerRole.trim()) ? wonder.controllerRole : null,
      last_controller_leader_id: wonder.controllerLeader || null,
      last_controller_civ_id: wonder.controllerCiv || null,
      tiles_owned_by: wonder.tilesOwnedBy || null
    };
  }

  function getNaturalWondersAsync() { return fetchNaturalWonders(); }

  function getNaturalWonderById(id) {
    if (!id) return Promise.resolve(null);
    return supabaseClient
      .from(NATURAL_WONDERS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') return null;
          handleError('getNaturalWonderById', response.error);
          return null;
        }
        return convertNatWonderFromDb(response.data);
      });
  }

  function saveNaturalWonder(wonder) {
    if (!wonder || typeof wonder !== 'object') throw new Error('Natural Wonder must be an object.');
    if (!wonder.id) throw new Error('Natural Wonder requires an id.');
    var dbRow = convertNatWonderToDb(wonder);
    return supabaseClient
      .from(NATURAL_WONDERS_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Natural Wonder save error:', response.error);
          handleError('saveNaturalWonder', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        console.log('[store-supabase] Saved natural wonder:', wonder.id, wonder.name);
        natWondersCache = null;
        natWondersLastFetchTime = null;
        return getNaturalWonderById(wonder.id);
      });
  }

  function deleteNaturalWonder(id) {
    if (!id) return Promise.resolve(false);
    return supabaseClient
      .from(NATURAL_WONDERS_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteNaturalWonder', response.error);
          return false;
        }
        natWondersCache = null;
        natWondersLastFetchTime = null;
        return true;
      });
  }

  function setNaturalWonders(list) {
    if (!Array.isArray(list)) throw new Error('Natural Wonders payload must be an array.');
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) throw new Error('Each Natural Wonder requires an id.');
      normalized.push(convertNatWonderToDb(item));
    }
    return supabaseClient
      .from(NATURAL_WONDERS_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          natWondersCache = [];
          natWondersLastFetchTime = Date.now();
          return Promise.resolve([]);
        }
        return supabaseClient
          .from(NATURAL_WONDERS_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setNaturalWonders', response.error);
              throw new Error('Failed to set natural wonders: ' + response.error.message);
            }
            natWondersCache = null;
            natWondersLastFetchTime = null;
            return fetchNaturalWonders();
          });
      });
  }

  // ========================================
  // MEMENTOS API
  // ========================================
  
  var MEMENTOS_TABLE = 'mementos';
  var mementosCache = null;
  var mementosLastFetchTime = null;

  function fetchMementos() {
    var now = Date.now();
    if (mementosCache && mementosLastFetchTime && (now - mementosLastFetchTime) < CACHE_DURATION) {
      return Promise.resolve(mementosCache);
    }

    return supabaseClient
      .from(MEMENTOS_TABLE)
      .select('*')
      .order('name', { ascending: true })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Mementos fetch error:', response.error);
          handleError('fetchMementos', response.error);
          return [];
        }
        
        var mementos = (response.data || []).map(function (row) {
          return convertMementoFromDb(row);
        });
        
        console.log('[store-supabase] Loaded', mementos.length, 'mementos from Supabase');
        mementosCache = mementos;
        mementosLastFetchTime = now;
        return mementos;
      });
  }

  function convertMementoFromDb(row) {
    return {
      id: row.id,
      name: row.name,
      iconUrl: row.icon_url || '',
      unlockDescription: row.unlock_description || '',
      effects: row.effects || null,
      timesUsedBy: row.times_used_by || null
    };
  }

  function convertMementoToDb(memento) {
    return {
      id: memento.id,
      name: memento.name,
      icon_url: memento.iconUrl || '',
      unlock_description: memento.unlockDescription || '',
      effects: Array.isArray(memento.effects) ? memento.effects : null,
      times_used_by: memento.timesUsedBy || null
    };
  }

  function getMementosAsync() { return fetchMementos(); }

  function getMementoById(id) {
    if (!id) return Promise.resolve(null);
    return supabaseClient
      .from(MEMENTOS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') return null;
          handleError('getMementoById', response.error);
          return null;
        }
        return convertMementoFromDb(response.data);
      });
  }

  function saveMemento(memento) {
    if (!memento || typeof memento !== 'object') throw new Error('Memento must be an object.');
    if (!memento.id) throw new Error('Memento requires an id.');
    var dbRow = convertMementoToDb(memento);
    return supabaseClient
      .from(MEMENTOS_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Memento save error:', response.error);
          handleError('saveMemento', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        console.log('[store-supabase] Saved memento:', memento.id, memento.name);
        mementosCache = null;
        mementosLastFetchTime = null;
        return getMementoById(memento.id);
      });
  }

  function deleteMemento(id) {
    if (!id) return Promise.resolve(false);
    return supabaseClient
      .from(MEMENTOS_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteMemento', response.error);
          return false;
        }
        mementosCache = null;
        mementosLastFetchTime = null;
        return true;
      });
  }

  function setMementos(list) {
    if (!Array.isArray(list)) throw new Error('Mementos payload must be an array.');
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) throw new Error('Each Memento requires an id.');
      normalized.push(convertMementoToDb(item));
    }
    return supabaseClient
      .from(MEMENTOS_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          mementosCache = [];
          mementosLastFetchTime = Date.now();
          return Promise.resolve([]);
        }
        return supabaseClient
          .from(MEMENTOS_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setMementos', response.error);
              throw new Error('Failed to set mementos: ' + response.error.message);
            }
            mementosCache = null;
            mementosLastFetchTime = null;
            return fetchMementos();
          });
      });
  }

  // ========================================
  // SOCIAL POLICIES API
  // ========================================
  var SOCIAL_POLICIES_TABLE = 'social_policies';
  var socialPoliciesCache = null;
  var socialPoliciesLastFetchTime = null;

  function fetchSocialPolicies() {
    var now = Date.now();
    if (socialPoliciesCache && socialPoliciesLastFetchTime && (now - socialPoliciesLastFetchTime < CACHE_DURATION)) {
      return Promise.resolve(socialPoliciesCache);
    }
    return supabaseClient
      .from(SOCIAL_POLICIES_TABLE)
      .select('*')
      .order('name')
      .then(function (response) {
        if (response.error) {
          handleError('fetchSocialPolicies', response.error);
          return [];
        }
        var policies = (response.data || []).map(convertSocialPolicyFromDb);
        socialPoliciesCache = policies;
        socialPoliciesLastFetchTime = now;
        console.log('[store-supabase] Loaded', policies.length, 'social policies from Supabase');
        return policies;
      });
  }

  function convertSocialPolicyFromDb(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name || '',
      iconUrl: row.icon_url || '',
      age: row.age || '',
      effects: Array.isArray(row.effects) ? row.effects : [],
      associatedCivId: row.associated_civ_id || null,
      associatedLeaderId: row.associated_leader_id || null
    };
  }

  function convertSocialPolicyToDb(policy) {
    return {
      id: policy.id,
      name: policy.name || '',
      icon_url: policy.iconUrl || '',
      age: policy.age || '',
      effects: Array.isArray(policy.effects) ? policy.effects : null,
      associated_civ_id: policy.associatedCivId || null,
      associated_leader_id: policy.associatedLeaderId || null
    };
  }

  function getSocialPoliciesAsync() { return fetchSocialPolicies(); }

  function getSocialPolicyById(id) {
    if (!id) return Promise.resolve(null);
    return supabaseClient
      .from(SOCIAL_POLICIES_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') return null;
          handleError('getSocialPolicyById', response.error);
          return null;
        }
        return convertSocialPolicyFromDb(response.data);
      });
  }

  function saveSocialPolicy(policy) {
    if (!policy || typeof policy !== 'object') throw new Error('Social policy must be an object.');
    if (!policy.id) throw new Error('Social policy requires an id.');
    var dbRow = convertSocialPolicyToDb(policy);
    return supabaseClient
      .from(SOCIAL_POLICIES_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Social policy save error:', response.error);
          handleError('saveSocialPolicy', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        console.log('[store-supabase] Saved social policy:', policy.id, policy.name);
        socialPoliciesCache = null;
        socialPoliciesLastFetchTime = null;
        return getSocialPolicyById(policy.id);
      });
  }

  function deleteSocialPolicy(id) {
    if (!id) return Promise.resolve(false);
    return supabaseClient
      .from(SOCIAL_POLICIES_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteSocialPolicy', response.error);
          return false;
        }
        socialPoliciesCache = null;
        socialPoliciesLastFetchTime = null;
        return true;
      });
  }

  function setSocialPolicies(list) {
    if (!Array.isArray(list)) throw new Error('Social policies payload must be an array.');
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) throw new Error('Each social policy requires an id.');
      normalized.push(convertSocialPolicyToDb(item));
    }
    return supabaseClient
      .from(SOCIAL_POLICIES_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          socialPoliciesCache = [];
          socialPoliciesLastFetchTime = Date.now();
          return Promise.resolve([]);
        }
        return supabaseClient
          .from(SOCIAL_POLICIES_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setSocialPolicies', response.error);
              throw new Error('Failed to set social policies: ' + response.error.message);
            }
            socialPoliciesCache = null;
            socialPoliciesLastFetchTime = null;
            return fetchSocialPolicies();
          });
      });
  }

  // ========================================
  // UNITS API
  // ========================================
  var UNITS_TABLE = 'units';
  var unitsCache = null;
  var unitsLastFetchTime = null;

  function fetchUnits() {
    var now = Date.now();
    if (unitsCache && unitsLastFetchTime && (now - unitsLastFetchTime < CACHE_DURATION)) {
      return Promise.resolve(unitsCache);
    }
    return supabaseClient
      .from(UNITS_TABLE)
      .select('*')
      .order('name')
      .then(function (response) {
        if (response.error) {
          handleError('fetchUnits', response.error);
          return [];
        }
        var units = (response.data || []).map(convertUnitFromDb);
        unitsCache = units;
        unitsLastFetchTime = now;
        console.log('[store-supabase] Loaded', units.length, 'units from Supabase');
        return units;
      });
  }

  function convertUnitFromDb(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name || '',
      iconUrl: row.icon_url || '',
      age: row.age || '',
      description: row.description || '',
      effects: Array.isArray(row.effects) ? row.effects : [],
      combatStrength: row.combat_strength || null,
      rangedStrength: row.ranged_strength || null,
      bombardStrength: row.bombard_strength || null,
      movement: row.movement || null,
      unlockMethod: row.unlock_method || 'age_start',
      associatedCivId: row.associated_civ_id || null,
      unitType: row.unit_type || ''
    };
  }

  function convertUnitToDb(unit) {
    return {
      id: unit.id,
      name: unit.name || '',
      icon_url: unit.iconUrl || '',
      age: unit.age || '',
      description: unit.description || '',
      effects: Array.isArray(unit.effects) && unit.effects.length > 0 ? unit.effects : null,
      combat_strength: unit.combatStrength || null,
      ranged_strength: unit.rangedStrength || null,
      bombard_strength: unit.bombardStrength || null,
      movement: unit.movement || null,
      unlock_method: unit.unlockMethod || 'age_start',
      associated_civ_id: unit.associatedCivId || null,
      unit_type: unit.unitType || ''
    };
  }

  function getUnitsAsync() { return fetchUnits(); }

  function getUnitById(id) {
    if (!id) return Promise.resolve(null);
    return supabaseClient
      .from(UNITS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') return null;
          handleError('getUnitById', response.error);
          return null;
        }
        return convertUnitFromDb(response.data);
      });
  }

  function saveUnit(unit) {
    if (!unit || typeof unit !== 'object') throw new Error('Unit must be an object.');
    if (!unit.id) throw new Error('Unit requires an id.');
    var dbRow = convertUnitToDb(unit);
    return supabaseClient
      .from(UNITS_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Unit save error:', response.error);
          handleError('saveUnit', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        console.log('[store-supabase] Saved unit:', unit.id, unit.name);
        unitsCache = null;
        unitsLastFetchTime = null;
        return getUnitById(unit.id);
      });
  }

  function deleteUnit(id) {
    if (!id) return Promise.resolve(false);
    return supabaseClient
      .from(UNITS_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteUnit', response.error);
          return false;
        }
        unitsCache = null;
        unitsLastFetchTime = null;
        return true;
      });
  }

  function setUnits(list) {
    if (!Array.isArray(list)) throw new Error('Units payload must be an array.');
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) throw new Error('Each unit requires an id.');
      normalized.push(convertUnitToDb(item));
    }
    return supabaseClient
      .from(UNITS_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          unitsCache = [];
          unitsLastFetchTime = Date.now();
          return Promise.resolve([]);
        }
        return supabaseClient
          .from(UNITS_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setUnits', response.error);
              throw new Error('Failed to set units: ' + response.error.message);
            }
            unitsCache = null;
            unitsLastFetchTime = null;
            return fetchUnits();
          });
      });
  }

  // ========================================
  // BUILDINGS API
  // ========================================
  var BUILDINGS_TABLE = 'buildings';
  var buildingsCache = null;
  var buildingsLastFetchTime = null;

  function fetchBuildings() {
    var now = Date.now();
    if (buildingsCache && buildingsLastFetchTime && (now - buildingsLastFetchTime < CACHE_DURATION)) {
      return Promise.resolve(buildingsCache);
    }
    return supabaseClient
      .from(BUILDINGS_TABLE)
      .select('*')
      .order('name')
      .then(function (response) {
        if (response.error) {
          handleError('fetchBuildings', response.error);
          return [];
        }
        var buildings = (response.data || []).map(convertBuildingFromDb);
        buildingsCache = buildings;
        buildingsLastFetchTime = now;
        console.log('[store-supabase] Loaded', buildings.length, 'buildings from Supabase');
        return buildings;
      });
  }

  function convertBuildingFromDb(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name || '',
      iconUrl: row.icon_url || '',
      age: row.age || '',
      effects: Array.isArray(row.effects) ? row.effects : [],
      productionCost: row.production_cost || null,
      placementRequirements: row.placement_requirements || '',
      locationType: row.location_type || '',
      isWarehouse: Boolean(row.is_warehouse),
      unlockMethod: row.unlock_method || 'age_start',
      associatedCivId: row.associated_civ_id || null
    };
  }

  function convertBuildingToDb(building) {
    return {
      id: building.id,
      name: building.name || '',
      icon_url: building.iconUrl || '',
      age: building.age || '',
      effects: Array.isArray(building.effects) && building.effects.length > 0 ? building.effects : null,
      production_cost: building.productionCost || null,
      placement_requirements: building.placementRequirements || '',
      location_type: building.locationType || '',
      is_warehouse: Boolean(building.isWarehouse),
      unlock_method: building.unlockMethod || 'age_start',
      associated_civ_id: building.associatedCivId || null
    };
  }

  function getBuildingsAsync() { return fetchBuildings(); }

  function getBuildingById(id) {
    if (!id) return Promise.resolve(null);
    return supabaseClient
      .from(BUILDINGS_TABLE)
      .select('*')
      .eq('id', id)
      .single()
      .then(function (response) {
        if (response.error) {
          if (response.error.code === 'PGRST116') return null;
          handleError('getBuildingById', response.error);
          return null;
        }
        return convertBuildingFromDb(response.data);
      });
  }

  function saveBuilding(building) {
    if (!building || typeof building !== 'object') throw new Error('Building must be an object.');
    if (!building.id) throw new Error('Building requires an id.');
    var dbRow = convertBuildingToDb(building);
    return supabaseClient
      .from(BUILDINGS_TABLE)
      .upsert(dbRow, { onConflict: 'id' })
      .then(function (response) {
        if (response.error) {
          console.error('[store-supabase] Building save error:', response.error);
          handleError('saveBuilding', response.error);
          throw new Error('Failed to save: ' + response.error.message);
        }
        console.log('[store-supabase] Saved building:', building.id, building.name);
        buildingsCache = null;
        buildingsLastFetchTime = null;
        return getBuildingById(building.id);
      });
  }

  function deleteBuilding(id) {
    if (!id) return Promise.resolve(false);
    return supabaseClient
      .from(BUILDINGS_TABLE)
      .delete()
      .eq('id', id)
      .then(function (response) {
        if (response.error) {
          handleError('deleteBuilding', response.error);
          return false;
        }
        buildingsCache = null;
        buildingsLastFetchTime = null;
        return true;
      });
  }

  function setBuildings(list) {
    if (!Array.isArray(list)) throw new Error('Buildings payload must be an array.');
    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) throw new Error('Each building requires an id.');
      normalized.push(convertBuildingToDb(item));
    }
    return supabaseClient
      .from(BUILDINGS_TABLE)
      .delete()
      .neq('id', '')
      .then(function () {
        if (normalized.length === 0) {
          buildingsCache = [];
          buildingsLastFetchTime = Date.now();
          return Promise.resolve([]);
        }
        return supabaseClient
          .from(BUILDINGS_TABLE)
          .insert(normalized)
          .then(function (response) {
            if (response.error) {
              handleError('setBuildings', response.error);
              throw new Error('Failed to set buildings: ' + response.error.message);
            }
            buildingsCache = null;
            buildingsLastFetchTime = null;
            return fetchBuildings();
          });
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
    exportStateAsync: exportState,
    
    // Leaders API
    getLeadersAsync: getLeadersAsync,
    getLeaderByIdAsync: getLeaderById,
    saveLeaderAsync: saveLeader,
    deleteLeaderAsync: deleteLeader,
    setLeadersAsync: setLeaders,
    
    // Civilizations API
    getCivilizationsAsync: getCivilizationsAsync,
    getCivilizationByIdAsync: getCivilizationById,
    saveCivilizationAsync: saveCivilization,
    deleteCivilizationAsync: deleteCivilization,
    setCivilizationsAsync: setCivilizations,
    
    // Technologies API
    getTechnologiesAsync: getTechnologiesAsync,
    getTechnologyByIdAsync: getTechnologyById,
    saveTechnologyAsync: saveTechnology,
    deleteTechnologyAsync: deleteTechnology,
    setTechnologiesAsync: setTechnologies,
    
    // Civics API
    getCivicsAsync: getCivicsAsync,
    getCivicByIdAsync: getCivicById,
    saveCivicAsync: saveCivic,
    deleteCivicAsync: deleteCivic,
    setCivicsAsync: setCivics,
    
    // Natural Wonders API
    getNaturalWondersAsync: getNaturalWondersAsync,
    getNaturalWonderByIdAsync: getNaturalWonderById,
    saveNaturalWonderAsync: saveNaturalWonder,
    deleteNaturalWonderAsync: deleteNaturalWonder,
    setNaturalWondersAsync: setNaturalWonders,
    
    // Mementos API
    getMementosAsync: getMementosAsync,
    getMementoByIdAsync: getMementoById,
    saveMementoAsync: saveMemento,
    deleteMementoAsync: deleteMemento,
    setMementosAsync: setMementos,
    
    // Social Policies API
    getSocialPoliciesAsync: getSocialPoliciesAsync,
    getSocialPolicyByIdAsync: getSocialPolicyById,
    saveSocialPolicyAsync: saveSocialPolicy,
    deleteSocialPolicyAsync: deleteSocialPolicy,
    setSocialPoliciesAsync: setSocialPolicies,
    
    // Units API
    getUnitsAsync: getUnitsAsync,
    getUnitByIdAsync: getUnitById,
    saveUnitAsync: saveUnit,
    deleteUnitAsync: deleteUnit,
    setUnitsAsync: setUnits,
    
    // Buildings API
    getBuildingsAsync: getBuildingsAsync,
    getBuildingByIdAsync: getBuildingById,
    saveBuildingAsync: saveBuilding,
    deleteBuildingAsync: deleteBuilding,
    setBuildingsAsync: setBuildings
  };

  // Auto-fetch on load (so sync methods work)
  fetchWorldWonders().catch(function (error) {
    console.warn('[store-supabase] Initial fetch failed:', error);
    cache = [];
  });

})(window);

