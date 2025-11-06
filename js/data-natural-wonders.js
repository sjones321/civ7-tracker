(function () {
  'use strict';

  var store = window.CivStore;
  var form = document.getElementById('natural-wonder-form');
  var statusEl = document.getElementById('natural-wonders-status-message');
  var tableBody = document.getElementById('natural-wonders-table-body');
  var newButton = document.getElementById('natural-wonders-new-button');
  var exportButton = document.getElementById('natural-wonders-export-button');
  var importButton = document.getElementById('natural-wonders-import-button');
  var clearAllButton = document.getElementById('natural-wonders-clear-all');
  var clearAllStatsButton = document.getElementById('natural-wonders-clear-all-stats');
  var clearStatsButton = document.getElementById('natural-wonders-clear-stats');
  var jsonArea = document.getElementById('natural-wonders-json-data');
  var resetButton = document.getElementById('natural-wonders-reset-form');
  var iconUrlField = document.getElementById('natural-wonder-icon-url');
  var iconFileField = document.getElementById('natural-wonder-icon-file');
  var iconPreview = document.getElementById('natural-wonder-icon-preview');
  var tileCountField = document.getElementById('natural-wonder-tile-count');
  var terrainTypeField = document.getElementById('natural-wonder-terrain-type');
  var continentField = document.getElementById('natural-wonder-continent');
  var discoveredAgeField = document.getElementById('natural-wonder-discovered-age');
  var controllerRoleField = document.getElementById('natural-wonder-controller-role');
  var controllerLeaderField = document.getElementById('natural-wonder-controller-leader');
  var controllerCivField = document.getElementById('natural-wonder-controller-civ');
  var tilesTinyField = document.getElementById('natural-wonder-tiles-tiny');
  var tilesSteveField = document.getElementById('natural-wonder-tiles-steve');
  var tilesAiField = document.getElementById('natural-wonder-tiles-ai');
  var effectsContainer = document.getElementById('natural-wonder-effects-container');
  var addEffectButton = document.getElementById('natural-wonders-add-effect-button');

  var editingOriginalId = null;
  var effectCounter = 0;
  
  // Autocomplete instances
  var leaderAutocomplete = null;
  var civAutocomplete = null;

  function showStatus(message, tone) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.setAttribute('data-tone', tone || 'info');
  }

  // Effects array builder functions
  function addEffectInput(value) {
    if (!effectsContainer) {
      return;
    }
    effectCounter++;
    var effectId = 'effect-' + effectCounter;
    
    var effectDiv = document.createElement('div');
    effectDiv.className = 'effect-input-row';
    
    var input = document.createElement('input');
    input.type = 'text';
    input.id = effectId;
    input.className = 'effect-input';
    input.value = value || '';
    input.placeholder = 'Enter bonus description...';
    
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'secondary';
    removeButton.addEventListener('click', function () {
      effectDiv.remove();
    });
    
    effectDiv.appendChild(input);
    effectDiv.appendChild(removeButton);
    effectsContainer.appendChild(effectDiv);
    
    return input;
  }
  
  function getEffectsArray() {
    if (!effectsContainer) {
      return [];
    }
    var inputs = effectsContainer.querySelectorAll('.effect-input');
    var effects = [];
    inputs.forEach(function (input) {
      var value = input.value.trim();
      if (value) {
        effects.push(value);
      }
    });
    return effects;
  }
  
  function clearEffectsContainer() {
    if (effectsContainer) {
      effectsContainer.innerHTML = '';
      effectCounter = 0;
    }
  }
  
  function loadEffectsArray(effects) {
    clearEffectsContainer();
    if (Array.isArray(effects) && effects.length > 0) {
      effects.forEach(function (effect) {
        var value = typeof effect === 'string' ? effect : JSON.stringify(effect);
        addEffectInput(value);
      });
    }
  }

  function updateIconPreview(url) {
    if (!iconPreview) {
      return;
    }
    iconPreview.innerHTML = '';
    if (url) {
      var img = document.createElement('img');
      img.src = url;
      img.alt = 'Natural Wonder icon preview';
      img.loading = 'lazy';
      img.decoding = 'async';
      iconPreview.appendChild(img);
    } else {
      var placeholder = document.createElement('span');
      placeholder.textContent = 'No screenshot uploaded yet.';
      iconPreview.appendChild(placeholder);
    }
  }

  function appendIconPreview(target, iconUrl, name) {
    if (!target) {
      return;
    }
    target.textContent = '';
    if (iconUrl) {
      var image = document.createElement('img');
      image.src = iconUrl;
      image.alt = (name || 'Natural Wonder') + ' icon';
      image.loading = 'lazy';
      image.decoding = 'async';
      target.appendChild(image);
    } else {
      target.textContent = '⛰️';
    }
  }

  function formatControllerLabel(role, leader, civ) {
    var parts = [];
    if (role) {
      parts.push(role);
    }
    if (leader) {
      parts.push(leader);
    }
    if (civ) {
      parts.push(civ);
    }
    return parts.join(' · ');
  }

  function renderWonderTable() {
    store.getNaturalWondersAsync().then(function (wonders) {
      renderWonderTableWithData(wonders);
    }).catch(function (err) {
      console.error('Failed to load natural wonders:', err);
      renderWonderTableWithData([]);
    });
  }

  function renderWonderTableWithData(wonders) {
    wonders.sort(function (a, b) {
      return (a.name || '').localeCompare(b.name || '');
    });

    tableBody.innerHTML = '';

    if (!wonders.length) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 5;
      emptyCell.textContent = 'No Natural Wonders saved yet.';
      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
    } else {
      wonders.forEach(function (wonder) {
        var row = document.createElement('tr');

        var nameCell = document.createElement('th');
        nameCell.scope = 'row';
        nameCell.textContent = wonder.name;

        var tilesCell = document.createElement('td');
        tilesCell.textContent = wonder.tileCount || '—';

        var terrainCell = document.createElement('td');
        terrainCell.textContent = wonder.terrainType || '—';

        var controllerCell = document.createElement('td');
        controllerCell.textContent = formatControllerLabel(wonder.controllerRole, wonder.controllerLeader, wonder.controllerCiv) || '—';

        var actionsCell = document.createElement('td');
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon-display';
        appendIconPreview(iconSpan, wonder.iconUrl || '', wonder.name || 'Natural Wonder');
        iconSpan.setAttribute('aria-label', 'Icon preview for ' + (wonder.name || 'natural wonder'));

        var editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'secondary';
        editButton.setAttribute('data-action', 'edit');
        editButton.setAttribute('data-id', wonder.id);

        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'danger';
        deleteButton.setAttribute('data-action', 'delete');
        deleteButton.setAttribute('data-id', wonder.id);

        actionsCell.appendChild(iconSpan);
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(tilesCell);
        row.appendChild(terrainCell);
        row.appendChild(controllerCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
      });
    }
  }

  function resetForm(wonder) {
    form.reset();
    editingOriginalId = null;
    if (iconFileField) {
      iconFileField.value = '';
    }
    if (wonder) {
      editingOriginalId = wonder.id;
      form.elements.id.value = wonder.id;
      form.elements.name.value = wonder.name || '';
      
      if (iconUrlField) {
        iconUrlField.value = wonder.iconUrl || '';
        updateIconPreview(wonder.iconUrl || '');
      }
      
      if (tileCountField) {
        tileCountField.value = wonder.tileCount || 1;
      }
      
      if (terrainTypeField) {
        terrainTypeField.value = wonder.terrainType || '';
      }
      
      if (continentField) {
        continentField.value = wonder.continent || '';
      }
      
      if (discoveredAgeField) {
        discoveredAgeField.value = wonder.discoveredAge || '';
      }
      
      if (controllerRoleField) {
        controllerRoleField.value = wonder.controllerRole || '';
      }
      
      if (controllerLeaderField && leaderAutocomplete && wonder.controllerLeader) {
        leaderAutocomplete.setValueById(wonder.controllerLeader);
      } else if (controllerLeaderField) {
        controllerLeaderField.value = wonder.controllerLeader || '';
        controllerLeaderField.removeAttribute('data-selected-id');
        controllerLeaderField.removeAttribute('data-selected-name');
      }
      
      if (controllerCivField && civAutocomplete && wonder.controllerCiv) {
        civAutocomplete.setValueById(wonder.controllerCiv);
      } else if (controllerCivField) {
        controllerCivField.value = wonder.controllerCiv || '';
        controllerCivField.removeAttribute('data-selected-id');
        controllerCivField.removeAttribute('data-selected-name');
      }
      
      // Tile ownership
      if (tilesTinyField) {
        tilesTinyField.value = (wonder.tilesOwnedBy && wonder.tilesOwnedBy.Tiny) || 0;
      }
      if (tilesSteveField) {
        tilesSteveField.value = (wonder.tilesOwnedBy && wonder.tilesOwnedBy.Steve) || 0;
      }
      if (tilesAiField) {
        tilesAiField.value = (wonder.tilesOwnedBy && wonder.tilesOwnedBy.AI) || 0;
      }
      
      // Effects
      if (wonder.effects) {
        loadEffectsArray(wonder.effects);
      } else {
        clearEffectsContainer();
      }
      
      showStatus('Editing "' + wonder.name + '".', 'info');
    } else {
      if (iconUrlField) {
        iconUrlField.value = '';
        updateIconPreview('');
      }
      if (tileCountField) {
        tileCountField.value = 1;
      }
      if (tilesTinyField) tilesTinyField.value = 0;
      if (tilesSteveField) tilesSteveField.value = 0;
      if (tilesAiField) tilesAiField.value = 0;
      clearEffectsContainer();
      if (controllerLeaderField) {
        controllerLeaderField.value = '';
        controllerLeaderField.removeAttribute('data-selected-id');
        controllerLeaderField.removeAttribute('data-selected-name');
      }
      if (controllerCivField) {
        controllerCivField.value = '';
        controllerCivField.removeAttribute('data-selected-id');
        controllerCivField.removeAttribute('data-selected-name');
      }
      showStatus('Ready to add a new Natural Wonder.', 'info');
    }
  }

  function validateFormData(data, wonders) {
    if (!data.id) {
      return 'An ID is required.';
    }
    if (!data.name) {
      return 'A name is required.';
    }
    if (!data.tileCount) {
      return 'A tile count is required.';
    }
    if (data.tileCount < 1 || data.tileCount > 6) {
      return 'Tile count must be between 1 and 6.';
    }

    var duplicate = wonders.some(function (wonder) {
      if (editingOriginalId && editingOriginalId === wonder.id) {
        return false;
      }
      return wonder.id === data.id;
    });

    if (duplicate) {
      return 'ID must be unique.';
    }

    return '';
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    store.getNaturalWondersAsync().then(function (wonders) {
      var effectsArray = getEffectsArray();
      
      var selectedLeaderId = controllerLeaderField ? (controllerLeaderField.getAttribute('data-selected-id') || controllerLeaderField.value.trim()) : '';
      var selectedCivId = controllerCivField ? (controllerCivField.getAttribute('data-selected-id') || controllerCivField.value.trim()) : '';
      
      // Build tiles ownership object
      var tilesOwnedBy = null;
      var tinyTiles = parseInt(tilesTinyField.value, 10) || 0;
      var steveTiles = parseInt(tilesSteveField.value, 10) || 0;
      var aiTiles = parseInt(tilesAiField.value, 10) || 0;
      if (tinyTiles > 0 || steveTiles > 0 || aiTiles > 0) {
        tilesOwnedBy = {
          Tiny: tinyTiles,
          Steve: steveTiles,
          AI: aiTiles
        };
      }

      var formData = {
        id: form.elements.id.value.trim(),
        name: form.elements.name.value.trim(),
        iconUrl: iconUrlField ? iconUrlField.value.trim() : '',
        summaryBonus: '', // Legacy field
        tileCount: parseInt(tileCountField.value, 10) || 1,
        terrainType: terrainTypeField ? terrainTypeField.value.trim() : '',
        continent: continentField ? continentField.value.trim() : '',
        discoveredAge: discoveredAgeField ? discoveredAgeField.value : '',
        effects: effectsArray.length > 0 ? effectsArray : null,
        controllerRole: controllerRoleField ? controllerRoleField.value : '',
        controllerLeader: selectedLeaderId,
        controllerCiv: selectedCivId,
        tilesOwnedBy: tilesOwnedBy
      };

      var error = validateFormData(formData, wonders);
      if (error) {
        showStatus(error, 'error');
        return;
      }

      console.log('[data-natural-wonders] Attempting to save natural wonder:', formData);
      store.saveNaturalWonderAsync(formData).then(function (savedWonder) {
        console.log('[data-natural-wonders] Save promise resolved, savedWonder:', savedWonder);
        if (!savedWonder || !savedWonder.id) {
          console.error('[data-natural-wonders] Saved natural wonder is invalid:', savedWonder);
          showStatus('Failed to save natural wonder.', 'error');
          return;
        }

        if (editingOriginalId && editingOriginalId !== savedWonder.id) {
          store.deleteNaturalWonderAsync(editingOriginalId).catch(function (err) {
            console.warn('Failed to delete old natural wonder:', err);
          });
        }

        editingOriginalId = savedWonder.id;
        renderWonderTable();
        showStatus('Saved "' + (savedWonder.name || 'natural wonder') + '".', 'success');
      }).catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Failed to save: ' + (err.message || err), 'error');
      });
    }).catch(function (err) {
      console.error('Failed to load natural wonders for validation:', err);
      showStatus('Error loading data. Please refresh the page.', 'error');
    });
  }

  function handleTableClick(event) {
    var target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    var action = target.getAttribute('data-action');
    var id = target.getAttribute('data-id');
    if (!action || !id) {
      return;
    }
    if (action === 'edit') {
      showStatus('Loading natural wonder details...', 'info');
      store.getNaturalWonderByIdAsync(id).then(function (wonder) {
        if (wonder) {
          resetForm(wonder);
          showStatus('Loaded "' + wonder.name + '".', 'success');
        } else {
          showStatus('Natural wonder not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to load natural wonder:', err);
        showStatus('Failed to load natural wonder: ' + (err.message || err), 'error');
      });
    } else if (action === 'delete') {
      var confirmed = window.confirm('Delete this Natural Wonder?');
      if (!confirmed) {
        return;
      }
      store.deleteNaturalWonderAsync(id).then(function (removed) {
        if (removed) {
          if (editingOriginalId === id) {
            resetForm(null);
          }
          renderWonderTable();
          showStatus('Deleted Natural Wonder.', 'success');
        } else {
          showStatus('Natural wonder not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to delete natural wonder:', err);
        showStatus('Failed to delete: ' + (err.message || err), 'error');
      });
    }
  }

  function handleExport() {
    store.getNaturalWondersAsync().then(function (wonders) {
      jsonArea.value = JSON.stringify(wonders, null, 2);
      jsonArea.focus();
      showStatus('Exported ' + wonders.length + ' Natural Wonder(s).', 'success');
    }).catch(function (err) {
      console.error('Failed to export:', err);
      showStatus('Failed to export: ' + (err.message || err), 'error');
    });
  }

  function handleIconUrlInput() {
    if (!iconUrlField) {
      return;
    }
    updateIconPreview(iconUrlField.value.trim());
  }

  function handleIconFileChange() {
    if (!iconFileField || !iconFileField.files || !iconFileField.files.length) {
      return;
    }
    var file = iconFileField.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function (event) {
      var result = event && event.target ? event.target.result : null;
      if (typeof result === 'string' && iconUrlField) {
        iconUrlField.value = result;
        updateIconPreview(result);
        showStatus('Screenshot loaded from file.', 'success');
      }
    };
    reader.onerror = function () {
      showStatus('Failed to read icon file.', 'error');
    };
    reader.readAsDataURL(file);
  }

  function handleClearStats() {
    var confirmed = window.confirm('Clear all game statistics for this Natural Wonder? This will remove current controller, tile ownership, and discovery data, but keep the base wonder details.');
    if (!confirmed) {
      return;
    }
    
    // Reset game stats fields
    if (discoveredAgeField) {
      discoveredAgeField.value = '';
    }
    if (controllerRoleField) {
      controllerRoleField.value = '';
    }
    if (controllerLeaderField) {
      controllerLeaderField.value = '';
      controllerLeaderField.removeAttribute('data-selected-id');
      controllerLeaderField.removeAttribute('data-selected-name');
    }
    if (controllerCivField) {
      controllerCivField.value = '';
      controllerCivField.removeAttribute('data-selected-id');
      controllerCivField.removeAttribute('data-selected-name');
    }
    if (tilesTinyField) {
      tilesTinyField.value = 0;
    }
    if (tilesSteveField) {
      tilesSteveField.value = 0;
    }
    if (tilesAiField) {
      tilesAiField.value = 0;
    }
    
    showStatus('Game stats cleared. Click Save to apply changes.', 'info');
  }

  function handleClearAll() {
    var confirmed = window.confirm('This will remove all Natural Wonders. Continue?');
    if (!confirmed) {
      return;
    }
    store.setNaturalWondersAsync([]).then(function () {
      resetForm(null);
      renderWonderTable();
      showStatus('Cleared all saved Natural Wonders.', 'success');
    }).catch(function (err) {
      console.error('Failed to clear natural wonders:', err);
      showStatus('Failed to clear: ' + (err.message || err), 'error');
    });
  }

  function handleClearAllStats() {
    var confirmed = window.confirm('Clear all game statistics for ALL Natural Wonders? This will remove current controllers, tile ownership, and discovery data for all wonders, but keep the base wonder details.');
    if (!confirmed) {
      return;
    }
    
    store.getNaturalWondersAsync().then(function (wonders) {
      var updated = wonders.map(function (wonder) {
        var updatedWonder = Object.assign({}, wonder);
        updatedWonder.discoveredAge = null;
        updatedWonder.controllerRole = null;
        updatedWonder.controllerLeader = null;
        updatedWonder.controllerCiv = null;
        updatedWonder.tilesOwnedBy = null;
        return updatedWonder;
      });
      
      return store.setNaturalWondersAsync(updated).then(function () {
        if (editingOriginalId) {
          var currentWonder = updated.find(function (w) { return w.id === editingOriginalId; });
          if (currentWonder) {
            resetForm(currentWonder);
          } else {
            resetForm(null);
          }
        }
        renderWonderTable();
        showStatus('Cleared all game statistics for ' + updated.length + ' Natural Wonder(s).', 'success');
      });
    }).catch(function (err) {
      console.error('Failed to clear all stats:', err);
      showStatus('Failed to clear stats: ' + (err.message || err), 'error');
    });
  }

  function handleImport() {
    var raw = jsonArea.value.trim();
    if (!raw) {
      showStatus('Paste JSON data to import.', 'error');
      return;
    }
    try {
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON should describe an array of Natural Wonders.');
      }
      var seenIds = Object.create(null);
      var wonders = parsed.map(function (item) {
        if (!item.id || !item.name) {
          throw new Error('Each natural wonder must have an id and name.');
        }
        if (seenIds[item.id]) {
          throw new Error('Duplicate ID detected: ' + item.id);
        }
        seenIds[item.id] = true;
        return item;
      });

      store.setNaturalWondersAsync(wonders).then(function () {
        resetForm(null);
        renderWonderTable();
        showStatus('Imported ' + wonders.length + ' Natural Wonder(s).', 'success');
      }).catch(function (err) {
        console.error('Failed to save imported natural wonders:', err);
        showStatus('Import failed: ' + (err.message || err), 'error');
      });
    } catch (err) {
      console.error(err);
      showStatus('Import failed: ' + err.message, 'error');
    }
  }

  function init() {
    if (!form || !tableBody || !newButton || !exportButton || !importButton || !jsonArea) {
      return;
    }

    // Initialize autocomplete
    if (controllerLeaderField && window.CivAutocomplete) {
      leaderAutocomplete = window.CivAutocomplete.create({
        input: controllerLeaderField,
        entityType: 'leaders',
        placeholder: 'Start typing leader name...',
        onSelect: function (item) {
          controllerLeaderField.setAttribute('data-selected-id', item.id);
          controllerLeaderField.setAttribute('data-selected-name', item.name);
        }
      });
    }

    if (controllerCivField && window.CivAutocomplete) {
      civAutocomplete = window.CivAutocomplete.create({
        input: controllerCivField,
        entityType: 'civilizations',
        placeholder: 'Start typing civilization name...',
        onSelect: function (item) {
          controllerCivField.setAttribute('data-selected-id', item.id);
          controllerCivField.setAttribute('data-selected-name', item.name);
        }
      });
    }

    // Handle Add Effect button
    if (addEffectButton) {
      addEffectButton.addEventListener('click', function () {
        addEffectInput('');
      });
    }

    renderWonderTable();
    resetForm(null);

    form.addEventListener('submit', handleFormSubmit);
    tableBody.addEventListener('click', handleTableClick);
    newButton.addEventListener('click', function () {
      resetForm(null);
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        resetForm(null);
      });
    }
    exportButton.addEventListener('click', handleExport);
    importButton.addEventListener('click', handleImport);
    if (iconUrlField) {
      iconUrlField.addEventListener('input', handleIconUrlInput);
    }
    if (iconFileField) {
      iconFileField.addEventListener('change', handleIconFileChange);
    }
    if (clearStatsButton) {
      clearStatsButton.addEventListener('click', handleClearStats);
    }
    if (clearAllButton) {
      clearAllButton.addEventListener('click', handleClearAll);
    }
    if (clearAllStatsButton) {
      clearAllStatsButton.addEventListener('click', handleClearAllStats);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();





