(function () {
  'use strict';

  var store = window.CivStore;
  var form = document.getElementById('memento-form');
  var statusEl = document.getElementById('mementos-status-message');
  var tableBody = document.getElementById('mementos-table-body');
  var newButton = document.getElementById('mementos-new-button');
  var exportButton = document.getElementById('mementos-export-button');
  var importButton = document.getElementById('mementos-import-button');
  var clearAllButton = document.getElementById('mementos-clear-all');
  var jsonArea = document.getElementById('mementos-json-data');
  var resetButton = document.getElementById('mementos-reset-form');
  var iconUrlField = document.getElementById('memento-icon-url');
  var iconFileField = document.getElementById('memento-icon-file');
  var iconPreview = document.getElementById('memento-icon-preview');
  var unlockDescriptionField = document.getElementById('memento-unlock-description');
  var effectsContainer = document.getElementById('memento-effects-container');
  var addEffectButton = document.getElementById('mementos-add-effect-button');

  var editingOriginalId = null;
  var effectCounter = 0;

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
      img.alt = 'Memento icon preview';
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
      image.alt = (name || 'Memento') + ' icon';
      image.loading = 'lazy';
      image.decoding = 'async';
      target.appendChild(image);
    } else {
      target.textContent = '🎖️';
    }
  }

  function renderMementoTable() {
    store.getMementosAsync().then(function (mementos) {
      renderMementoTableWithData(mementos);
    }).catch(function (err) {
      console.error('Failed to load mementos:', err);
      renderMementoTableWithData([]);
    });
  }

  function renderMementoTableWithData(mementos) {
    mementos.sort(function (a, b) {
      return (a.name || '').localeCompare(b.name || '');
    });

    tableBody.innerHTML = '';

    if (!mementos.length) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 3;
      emptyCell.textContent = 'No Mementos saved yet.';
      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
    } else {
      mementos.forEach(function (memento) {
        var row = document.createElement('tr');

        var nameCell = document.createElement('th');
        nameCell.scope = 'row';
        nameCell.textContent = memento.name;

        var unlockCell = document.createElement('td');
        unlockCell.textContent = memento.unlockDescription || '—';

        var actionsCell = document.createElement('td');
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon-display';
        appendIconPreview(iconSpan, memento.iconUrl || '', memento.name || 'Memento');
        iconSpan.setAttribute('aria-label', 'Icon preview for ' + (memento.name || 'memento'));

        var editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'secondary';
        editButton.setAttribute('data-action', 'edit');
        editButton.setAttribute('data-id', memento.id);

        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'danger';
        deleteButton.setAttribute('data-action', 'delete');
        deleteButton.setAttribute('data-id', memento.id);

        actionsCell.appendChild(iconSpan);
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(unlockCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
      });
    }
  }

  function resetForm(memento) {
    form.reset();
    editingOriginalId = null;
    if (iconFileField) {
      iconFileField.value = '';
    }
    if (memento) {
      editingOriginalId = memento.id;
      form.elements.id.value = memento.id;
      form.elements.name.value = memento.name || '';
      
      if (iconUrlField) {
        iconUrlField.value = memento.iconUrl || '';
        updateIconPreview(memento.iconUrl || '');
      }
      
      if (unlockDescriptionField) {
        unlockDescriptionField.value = memento.unlockDescription || '';
      }
      
      // Load effects
      if (memento.effects) {
        loadEffectsArray(memento.effects);
      } else {
        clearEffectsContainer();
      }
      
      showStatus('Editing "' + memento.name + '".', 'info');
    } else {
      if (iconUrlField) {
        iconUrlField.value = '';
        updateIconPreview('');
      }
      clearEffectsContainer();
      showStatus('Ready to add a new Memento.', 'info');
    }
  }

  function validateFormData(data, mementos) {
    if (!data.id) {
      return 'An ID is required.';
    }
    if (!data.name) {
      return 'A name is required.';
    }

    var duplicate = mementos.some(function (memento) {
      if (editingOriginalId && editingOriginalId === memento.id) {
        return false;
      }
      return memento.id === data.id;
    });

    if (duplicate) {
      return 'ID must be unique.';
    }

    return '';
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    store.getMementosAsync().then(function (mementos) {
      var effectsArray = getEffectsArray();

      var formData = {
        id: form.elements.id.value.trim(),
        name: form.elements.name.value.trim(),
        iconUrl: iconUrlField ? iconUrlField.value.trim() : '',
        unlockDescription: unlockDescriptionField ? unlockDescriptionField.value.trim() : '',
        effects: effectsArray.length > 0 ? effectsArray : null
      };

      var error = validateFormData(formData, mementos);
      if (error) {
        showStatus(error, 'error');
        return;
      }

      console.log('[data-mementos] Attempting to save memento:', formData);
      store.saveMementoAsync(formData).then(function (savedMemento) {
        console.log('[data-mementos] Save promise resolved, savedMemento:', savedMemento);
        if (!savedMemento || !savedMemento.id) {
          console.error('[data-mementos] Saved memento is invalid:', savedMemento);
          showStatus('Failed to save memento.', 'error');
          return;
        }

        if (editingOriginalId && editingOriginalId !== savedMemento.id) {
          store.deleteMementoAsync(editingOriginalId).catch(function (err) {
            console.warn('Failed to delete old memento:', err);
          });
        }

        editingOriginalId = savedMemento.id;
        renderMementoTable();
        showStatus('Saved "' + (savedMemento.name || 'memento') + '".', 'success');
      }).catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Failed to save: ' + (err.message || err), 'error');
      });
    }).catch(function (err) {
      console.error('Failed to load mementos for validation:', err);
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
      showStatus('Loading memento details...', 'info');
      store.getMementoByIdAsync(id).then(function (memento) {
        if (memento) {
          resetForm(memento);
          showStatus('Loaded "' + memento.name + '".', 'success');
        } else {
          showStatus('Memento not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to load memento:', err);
        showStatus('Failed to load memento: ' + (err.message || err), 'error');
      });
    } else if (action === 'delete') {
      var confirmed = window.confirm('Delete this Memento?');
      if (!confirmed) {
        return;
      }
      store.deleteMementoAsync(id).then(function (removed) {
        if (removed) {
          if (editingOriginalId === id) {
            resetForm(null);
          }
          renderMementoTable();
          showStatus('Deleted Memento.', 'success');
        } else {
          showStatus('Memento not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to delete memento:', err);
        showStatus('Failed to delete: ' + (err.message || err), 'error');
      });
    }
  }

  function handleExport() {
    store.getMementosAsync().then(function (mementos) {
      jsonArea.value = JSON.stringify(mementos, null, 2);
      jsonArea.focus();
      showStatus('Exported ' + mementos.length + ' Memento(s).', 'success');
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
    var confirmed = window.confirm('This will remove all Mementos. Continue?');
    if (!confirmed) {
      return;
    }
    store.setMementosAsync([]).then(function () {
      resetForm(null);
      renderMementoTable();
      showStatus('Cleared all saved Mementos.', 'success');
    }).catch(function (err) {
      console.error('Failed to clear mementos:', err);
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
        throw new Error('JSON should describe an array of Mementos.');
      }
      var seenIds = Object.create(null);
      var mementos = parsed.map(function (item) {
        if (!item.id || !item.name) {
          throw new Error('Each memento must have an id and name.');
        }
        if (seenIds[item.id]) {
          throw new Error('Duplicate ID detected: ' + item.id);
        }
        seenIds[item.id] = true;
        return item;
      });

      store.setMementosAsync(mementos).then(function () {
        resetForm(null);
        renderMementoTable();
        showStatus('Imported ' + mementos.length + ' Memento(s).', 'success');
      }).catch(function (err) {
        console.error('Failed to save imported mementos:', err);
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

    renderMementoTable();
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

