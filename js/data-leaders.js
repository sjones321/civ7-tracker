(function () {
  'use strict';

  var store = window.CivStore;
  var form = document.getElementById('leader-form');
  var statusEl = document.getElementById('leaders-status-message');
  var tableBody = document.getElementById('leaders-table-body');
  var newButton = document.getElementById('leaders-new-button');
  var exportButton = document.getElementById('leaders-export-button');
  var importButton = document.getElementById('leaders-import-button');
  var clearAllButton = document.getElementById('leaders-clear-all');
  var jsonArea = document.getElementById('leaders-json-data');
  var resetButton = document.getElementById('leaders-reset-form');
  var iconUrlField = document.getElementById('leader-icon-url');
  var iconFileField = document.getElementById('leader-icon-file');
  var iconPreview = document.getElementById('leader-icon-preview');
  var tinyLevelField = document.getElementById('leader-tiny-level');
  var steveLevelField = document.getElementById('leader-steve-level');
  var effectsContainer = document.getElementById('leader-effects-container');
  var addEffectButton = document.getElementById('leaders-add-effect-button');
  var unlocksContainer = document.getElementById('leader-unlocks-container');
  var addUnlockButton = document.getElementById('leaders-add-unlock-button');

  var editingOriginalId = null;
  var effectCounter = 0;
  var unlockCounter = 0;

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
    input.placeholder = 'Enter ability description...';
    
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

  // Level unlocks builder functions
  function addUnlockInput(unlock) {
    if (!unlocksContainer) {
      return;
    }
    unlockCounter++;
    
    var unlockDiv = document.createElement('div');
    unlockDiv.className = 'unlock-input-row';
    
    var levelInput = document.createElement('input');
    levelInput.type = 'number';
    levelInput.className = 'unlock-level';
    levelInput.min = '1';
    levelInput.max = '10';
    levelInput.value = unlock && unlock.level ? unlock.level : '';
    levelInput.placeholder = 'Level';
    // Input styles are handled by CSS classes
    
    var typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.className = 'unlock-type';
    typeInput.value = unlock && unlock.type ? unlock.type : '';
    typeInput.placeholder = 'Type';
    
    var descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'unlock-description';
    descInput.value = unlock && unlock.description ? unlock.description : '';
    descInput.placeholder = 'Description';
    
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'secondary';
    removeButton.addEventListener('click', function () {
      unlockDiv.remove();
    });
    
    unlockDiv.appendChild(levelInput);
    unlockDiv.appendChild(typeInput);
    unlockDiv.appendChild(descInput);
    unlockDiv.appendChild(removeButton);
    unlocksContainer.appendChild(unlockDiv);
  }
  
  function getUnlocksArray() {
    if (!unlocksContainer) {
      return [];
    }
    var rows = unlocksContainer.querySelectorAll('.unlock-input-row');
    var unlocks = [];
    rows.forEach(function (row) {
      var level = parseInt(row.querySelector('.unlock-level').value, 10);
      var type = row.querySelector('.unlock-type').value.trim();
      var description = row.querySelector('.unlock-description').value.trim();
      if (level && type && description) {
        unlocks.push({ level: level, type: type, description: description });
      }
    });
    // Sort by level
    unlocks.sort(function (a, b) { return a.level - b.level; });
    return unlocks;
  }
  
  function clearUnlocksContainer() {
    if (unlocksContainer) {
      unlocksContainer.innerHTML = '';
      unlockCounter = 0;
    }
  }
  
  function loadUnlocksArray(unlocks) {
    clearUnlocksContainer();
    if (Array.isArray(unlocks) && unlocks.length > 0) {
      unlocks.forEach(function (unlock) {
        addUnlockInput(unlock);
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
      img.alt = 'Leader icon preview';
      img.loading = 'lazy';
      img.decoding = 'async';
      iconPreview.appendChild(img);
    } else {
      var placeholder = document.createElement('span');
      placeholder.textContent = 'No icon selected.';
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
      image.alt = (name || 'Leader') + ' icon';
      image.loading = 'lazy';
      image.decoding = 'async';
      target.appendChild(image);
    } else {
      target.textContent = '👤';
    }
  }

  function renderLeaderTable() {
    store.getLeadersAsync().then(function (leaders) {
      renderLeaderTableWithData(leaders);
    }).catch(function (err) {
      console.error('Failed to load leaders:', err);
      renderLeaderTableWithData([]);
    });
  }

  function renderLeaderTableWithData(leaders) {
    leaders.sort(function (a, b) {
      return (a.name || '').localeCompare(b.name || '');
    });

    tableBody.innerHTML = '';

    if (!leaders.length) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 4;
      emptyCell.textContent = 'No Leaders saved yet.';
      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
    } else {
      leaders.forEach(function (leader) {
        var row = document.createElement('tr');

        var nameCell = document.createElement('th');
        nameCell.scope = 'row';
        nameCell.textContent = leader.name;

        var tinyLevelCell = document.createElement('td');
        tinyLevelCell.textContent = leader.tinyLevel || 1;

        var steveLevelCell = document.createElement('td');
        steveLevelCell.textContent = leader.steveLevel || 1;

        var actionsCell = document.createElement('td');
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon-display';
        appendIconPreview(iconSpan, leader.iconUrl || '', leader.name || 'Leader');
        iconSpan.setAttribute('aria-label', 'Icon preview for ' + (leader.name || 'leader'));

        var editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'secondary';
        editButton.setAttribute('data-action', 'edit');
        editButton.setAttribute('data-id', leader.id);

        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'danger';
        deleteButton.setAttribute('data-action', 'delete');
        deleteButton.setAttribute('data-id', leader.id);

        actionsCell.appendChild(iconSpan);
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(tinyLevelCell);
        row.appendChild(steveLevelCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
      });
    }
  }

  function resetForm(leader) {
    form.reset();
    editingOriginalId = null;
    if (iconFileField) {
      iconFileField.value = '';
    }
    if (leader) {
      editingOriginalId = leader.id;
      form.elements.id.value = leader.id;
      form.elements.name.value = leader.name || '';
      if (iconUrlField) {
        iconUrlField.value = leader.iconUrl || '';
        updateIconPreview(leader.iconUrl || '');
      }
      if (tinyLevelField) {
        tinyLevelField.value = leader.tinyLevel || 1;
      }
      if (steveLevelField) {
        steveLevelField.value = leader.steveLevel || 1;
      }
      
      // Load effects
      if (leader.effects) {
        loadEffectsArray(leader.effects);
      } else {
        clearEffectsContainer();
      }
      
      // Load level unlocks
      if (leader.levelUnlocks) {
        loadUnlocksArray(leader.levelUnlocks);
      } else {
        clearUnlocksContainer();
      }
      
      showStatus('Editing "' + leader.name + '".', 'info');
    } else {
      if (iconUrlField) {
        iconUrlField.value = '';
        updateIconPreview('');
      }
      if (tinyLevelField) {
        tinyLevelField.value = 1;
      }
      if (steveLevelField) {
        steveLevelField.value = 1;
      }
      clearEffectsContainer();
      clearUnlocksContainer();
      showStatus('Ready to add a new Leader.', 'info');
    }
  }

  function validateFormData(data, leaders) {
    if (!data.id) {
      return 'An ID is required.';
    }
    if (!data.name) {
      return 'A name is required.';
    }
    if (data.tinyLevel < 1 || data.tinyLevel > 10) {
      return "Tiny's level must be between 1 and 10.";
    }
    if (data.steveLevel < 1 || data.steveLevel > 10) {
      return "Steve's level must be between 1 and 10.";
    }

    var duplicate = leaders.some(function (leader) {
      if (editingOriginalId && editingOriginalId === leader.id) {
        return false;
      }
      return leader.id === data.id;
    });

    if (duplicate) {
      return 'ID must be unique.';
    }

    return '';
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    store.getLeadersAsync().then(function (leaders) {
      var effectsArray = getEffectsArray();
      var unlocksArray = getUnlocksArray();

      var formData = {
        id: form.elements.id.value.trim(),
        name: form.elements.name.value.trim(),
        iconUrl: iconUrlField ? iconUrlField.value.trim() : '',
        tinyLevel: tinyLevelField ? parseInt(tinyLevelField.value, 10) || 1 : 1,
        steveLevel: steveLevelField ? parseInt(steveLevelField.value, 10) || 1 : 1,
        effects: effectsArray.length > 0 ? effectsArray : null,
        levelUnlocks: unlocksArray.length > 0 ? unlocksArray : null
      };

      var error = validateFormData(formData, leaders);
      if (error) {
        showStatus(error, 'error');
        return;
      }

      console.log('[data-leaders] Attempting to save leader:', formData);
      store.saveLeaderAsync(formData).then(function (savedLeader) {
        console.log('[data-leaders] Save promise resolved, savedLeader:', savedLeader);
        if (!savedLeader || !savedLeader.id) {
          console.error('[data-leaders] Saved leader is invalid:', savedLeader);
          showStatus('Failed to save leader.', 'error');
          return;
        }

        if (editingOriginalId && editingOriginalId !== savedLeader.id) {
          store.deleteLeaderAsync(editingOriginalId).catch(function (err) {
            console.warn('Failed to delete old leader:', err);
          });
        }

        editingOriginalId = savedLeader.id;
        renderLeaderTable();
        showStatus('Saved "' + (savedLeader.name || 'leader') + '".', 'success');
      }).catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Failed to save: ' + (err.message || err), 'error');
      });
    }).catch(function (err) {
      console.error('Failed to load leaders for validation:', err);
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
      showStatus('Loading leader details...', 'info');
      store.getLeaderByIdAsync(id).then(function (leader) {
        if (leader) {
          resetForm(leader);
          showStatus('Loaded "' + leader.name + '".', 'success');
        } else {
          showStatus('Leader not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to load leader:', err);
        showStatus('Failed to load leader: ' + (err.message || err), 'error');
      });
    } else if (action === 'delete') {
      var confirmed = window.confirm('Delete this Leader?');
      if (!confirmed) {
        return;
      }
      store.deleteLeaderAsync(id).then(function (removed) {
        if (removed) {
          if (editingOriginalId === id) {
            resetForm(null);
          }
          renderLeaderTable();
          showStatus('Deleted Leader.', 'success');
        } else {
          showStatus('Leader not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to delete leader:', err);
        showStatus('Failed to delete: ' + (err.message || err), 'error');
      });
    }
  }

  function handleExport() {
    store.getLeadersAsync().then(function (leaders) {
      jsonArea.value = JSON.stringify(leaders, null, 2);
      jsonArea.focus();
      showStatus('Exported ' + leaders.length + ' Leader(s).', 'success');
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
        showStatus('Icon loaded from file.', 'success');
      }
    };
    reader.onerror = function () {
      showStatus('Failed to read icon file.', 'error');
    };
    reader.readAsDataURL(file);
  }

  function handleClearAll() {
    var confirmed = window.confirm('This will remove all Leaders. Continue?');
    if (!confirmed) {
      return;
    }
    store.setLeadersAsync([]).then(function () {
      resetForm(null);
      renderLeaderTable();
      showStatus('Cleared all saved Leaders.', 'success');
    }).catch(function (err) {
      console.error('Failed to clear leaders:', err);
      showStatus('Failed to clear: ' + (err.message || err), 'error');
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
        throw new Error('JSON should describe an array of Leaders.');
      }
      var seenIds = Object.create(null);
      var leaders = parsed.map(function (item) {
        if (!item.id || !item.name) {
          throw new Error('Each leader must have an id and name.');
        }
        if (seenIds[item.id]) {
          throw new Error('Duplicate ID detected: ' + item.id);
        }
        seenIds[item.id] = true;
        return item;
      });

      store.setLeadersAsync(leaders).then(function () {
        resetForm(null);
        renderLeaderTable();
        showStatus('Imported ' + leaders.length + ' Leader(s).', 'success');
      }).catch(function (err) {
        console.error('Failed to save imported leaders:', err);
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

    // Handle Add Effect button
    if (addEffectButton) {
      addEffectButton.addEventListener('click', function () {
        addEffectInput('');
      });
    }

    // Handle Add Unlock button
    if (addUnlockButton) {
      addUnlockButton.addEventListener('click', function () {
        addUnlockInput(null);
      });
    }

    renderLeaderTable();
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
    if (clearAllButton) {
      clearAllButton.addEventListener('click', handleClearAll);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

