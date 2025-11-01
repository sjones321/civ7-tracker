(function (global) {
  'use strict';

  var STORAGE_KEY = 'civ7-tracker-data';
  var DEFAULT_STATE = { worldWonders: [] };
  var stateCache = null;
  var storageAvailable = true;

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function readFromStorage() {
    if (!storageAvailable) {
      return cloneState(DEFAULT_STATE);
    }

    try {
      var stored = global.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return cloneState(DEFAULT_STATE);
      }
      var parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') {
        return cloneState(DEFAULT_STATE);
      }
      if (!Array.isArray(parsed.worldWonders)) {
        parsed.worldWonders = [];
      }
      return parsed;
    } catch (err) {
      storageAvailable = false;
      console.warn('[store] Falling back to in-memory state because localStorage failed.', err);
      return cloneState(DEFAULT_STATE);
    }
  }

  function writeToStorage(state) {
    if (!storageAvailable) {
      return;
    }

    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      storageAvailable = false;
      console.warn('[store] Failed to persist state. Further changes will be in-memory only.', err);
    }
  }

  function ensureState() {
    if (!stateCache) {
      stateCache = readFromStorage();
    }
    if (!stateCache.worldWonders) {
      stateCache.worldWonders = [];
    }
    return stateCache;
  }

  function getWorldWonders() {
    return cloneState(ensureState().worldWonders || []);
  }

  function getWorldWonderById(id) {
    var wonders = ensureState().worldWonders || [];
    for (var i = 0; i < wonders.length; i += 1) {
      if (wonders[i].id === id) {
        return cloneState(wonders[i]);
      }
    }
    return null;
  }

  function saveWorldWonder(wonder) {
    if (!wonder || typeof wonder !== 'object') {
      throw new Error('World Wonder must be an object.');
    }
    if (!wonder.id) {
      throw new Error('World Wonder requires an id.');
    }

    var state = ensureState();
    var wonders = state.worldWonders;
    var found = false;

    for (var i = 0; i < wonders.length; i += 1) {
      if (wonders[i].id === wonder.id) {
        wonders[i] = cloneState(wonder);
        found = true;
        break;
      }
    }

    if (!found) {
      wonders.push(cloneState(wonder));
    }

    writeToStorage(state);
    return cloneState(wonder);
  }

  function deleteWorldWonder(id) {
    var state = ensureState();
    var wonders = state.worldWonders;
    var next = [];
    var removed = false;

    for (var i = 0; i < wonders.length; i += 1) {
      if (wonders[i].id === id) {
        removed = true;
        continue;
      }
      next.push(wonders[i]);
    }

    if (removed) {
      state.worldWonders = next;
      writeToStorage(state);
    }
    return removed;
  }

  function setWorldWonders(list) {
    if (!Array.isArray(list)) {
      throw new Error('World Wonders payload must be an array.');
    }

    var normalized = [];
    for (var i = 0; i < list.length; i += 1) {
      var item = list[i];
      if (!item || typeof item !== 'object' || !item.id) {
        throw new Error('Each World Wonder requires an id.');
      }
      normalized.push(cloneState(item));
    }

    var state = ensureState();
    state.worldWonders = normalized;
    writeToStorage(state);
    return getWorldWonders();
  }

  function exportState() {
    return cloneState(ensureState());
  }

  global.CivStore = {
    getWorldWonders: getWorldWonders,
    getWorldWonderById: getWorldWonderById,
    saveWorldWonder: saveWorldWonder,
    deleteWorldWonder: deleteWorldWonder,
    setWorldWonders: setWorldWonders,
    exportState: exportState
  };
})(window);
