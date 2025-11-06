// CIV7 Tracker - Units Data Editor
// Handles form interactions and data editing for units

(function () {
  'use strict';

  console.log('[data-units] Initializing...');

  // DOM Elements
  var form = document.getElementById('unit-form');
  var unitIdField = document.getElementById('unit-id');
  var unitNameField = document.getElementById('unit-name');
  var unitAgeField = document.getElementById('unit-age');
  var unitTypeField = document.getElementById('unit-type');
  var unitIconField = document.getElementById('unit-icon-url');
  var unitDescriptionField = document.getElementById('unit-description');
  var unitCombatStrengthField = document.getElementById('unit-combat-strength');
  var unitRangedStrengthField = document.getElementById('unit-ranged-strength');
  var unitBombardStrengthField = document.getElementById('unit-bombard-strength');
  var unitMovementField = document.getElementById('unit-movement');
  var unitUnlockMethodField = document.getElementById('unit-unlock-method');
  var unitAssociatedCivField = document.getElementById('unit-associated-civ');
  var effectsContainer = document.getElementById('unit-effects-container');
  var addEffectButton = document.getElementById('units-add-effect-button');
  var resetFormButton = document.getElementById('units-reset-form');
  var newUnitButton = document.getElementById('units-new-button');
  var statusMessage = document.getElementById('units-status-message');
  var unitsTableBody = document.getElementById('units-table-body');
  var iconPreview = document.getElementById('unit-icon-preview');
  var iconFileField = document.getElementById('unit-icon-file');
  var exportButton = document.getElementById('units-export-button');
  var importButton = document.getElementById('units-import-button');
  var clearAllButton = document.getElementById('units-clear-all');
  var jsonDataField = document.getElementById('units-json-data');

  // State
  var isEditMode = false;
  var currentUnitId = null;
  var unlockMethodAutocomplete = null;
  var associatedCivAutocomplete = null;
  var selectedAssociatedCivId = null;
  var selectedUnlockMethodId = null;
  var effectCounter = 0;

  // ========================================
  // EFFECTS BUILDER
  // ========================================
  function addEffectInput(value) {
    if (!effectsContainer) {
      return;
    }
    effectCounter++;
    var effectId = 'effect-' + effectCounter;
    
    var row = document.createElement('div');
    row.className = 'effect-input-row';
    row.style.cssText = 'display: flex; gap: 8px; align-items: center; margin-bottom: 8px;';

    var input = document.createElement('input');
    input.type = 'text';
    input.id = effectId;
    input.className = 'effect-input';
    input.placeholder = 'Enter effect description...';
    input.value = value || '';
    input.style.cssText = 'flex: 1; padding: 8px; border: 1px solid #bcccdc; border-radius: 4px;';

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'danger';
    removeButton.style.marginLeft = '0';
    removeButton.addEventListener('click', function () {
      effectsContainer.removeChild(row);
    });

    row.appendChild(input);
    row.appendChild(removeButton);
    effectsContainer.appendChild(row);
    
    return input;
  }

  function getEffectsArray() {
    if (!effectsContainer) {
      return [];
    }
    var inputs = effectsContainer.querySelectorAll('.effect-input');
    var effects = [];
    for (var i = 0; i < inputs.length; i++) {
      var val = inputs[i].value.trim();
      if (val) {
        effects.push(val);
      }
    }
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
      for (var i = 0; i < effects.length; i++) {
        addEffectInput(effects[i]);
      }
    } else {
      addEffectInput('');
    }
  }

  // ========================================
  // FORM HANDLERS
  // ========================================
  function handleFormSubmit(event) {
    event.preventDefault();
    console.log('[data-units] Form submitted');

    // Get associated civ ID from autocomplete state or field data attribute
    var civId = selectedAssociatedCivId;
    if (!civId && unitAssociatedCivField) {
      civId = unitAssociatedCivField.getAttribute('data-selected-id') || null;
      if (civId) {
        selectedAssociatedCivId = civId;
      }
    }

    // Get unlock method ID from autocomplete state or field data attribute
    var unlockId = selectedUnlockMethodId;
    if (!unlockId && unitUnlockMethodField) {
      unlockId = unitUnlockMethodField.getAttribute('data-selected-id');
      if (unlockId && unlockId !== 'age_start') {
        selectedUnlockMethodId = unlockId;
      }
    }

    var formData = {
      id: unitIdField.value.trim(),
      name: unitNameField.value.trim(),
      age: unitAgeField.value,
      unitType: unitTypeField.value,
      iconUrl: unitIconField.value.trim(),
      description: unitDescriptionField.value.trim(),
      combatStrength: unitCombatStrengthField.value ? parseInt(unitCombatStrengthField.value, 10) : null,
      rangedStrength: unitRangedStrengthField.value ? parseInt(unitRangedStrengthField.value, 10) : null,
      bombardStrength: unitBombardStrengthField.value ? parseInt(unitBombardStrengthField.value, 10) : null,
      movement: unitMovementField.value ? parseInt(unitMovementField.value, 10) : null,
      unlockMethod: unlockId || unitUnlockMethodField.value.trim() || 'age_start',
      associatedCivId: civId,
      effects: getEffectsArray()
    };

    console.log('[data-units] Attempting to save unit:', formData);

    if (!validateFormData(formData)) {
      showStatus('Please fill in all required fields (ID, Name, Age, Unit Type).', 'error');
      return;
    }

    window.CivStore.saveUnitAsync(formData)
      .then(function (saved) {
        showStatus('Saved: ' + saved.name, 'success');
        resetForm();
        return window.CivStore.getUnitsAsync();
      })
      .then(function (units) {
        renderUnitsTable(units);
      })
      .catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Save failed: ' + err.message, 'error');
      });
  }

  function resetForm() {
    form.reset();
    isEditMode = false;
    currentUnitId = null;
    unitIdField.disabled = false;
    if (iconFileField) {
      iconFileField.value = '';
    }
    selectedAssociatedCivId = null;
    selectedUnlockMethodId = null;
    
    if (unitAssociatedCivField) {
      if (associatedCivAutocomplete) {
        associatedCivAutocomplete.setValue('');
      } else {
        unitAssociatedCivField.value = '';
        unitAssociatedCivField.removeAttribute('data-selected-id');
        unitAssociatedCivField.removeAttribute('data-selected-name');
      }
    }
    
    if (unitUnlockMethodField) {
      if (unlockMethodAutocomplete) {
        unlockMethodAutocomplete.setValue('');
      } else {
        unitUnlockMethodField.value = '';
        unitUnlockMethodField.removeAttribute('data-selected-id');
        unitUnlockMethodField.removeAttribute('data-selected-name');
      }
    }
    
    clearEffectsContainer();
    addEffectInput('');
    updateIconPreview('');
    showStatus('Ready to add a new Unit.', 'info');
  }

  function validateFormData(data) {
    return data.id && data.name && data.age && data.unitType;
  }

  function showStatus(message, tone) {
    statusMessage.textContent = message;
    statusMessage.parentElement.setAttribute('data-tone', tone || 'info');
  }

  function updateIconPreview(iconUrl) {
    if (!iconPreview) return;
    if (!iconUrl) {
      iconPreview.innerHTML = '<span>No icon yet.</span>';
      return;
    }
    var img = document.createElement('img');
    img.src = iconUrl;
    img.alt = 'Unit Icon';
    img.onerror = function () {
      iconPreview.innerHTML = '<span style="color:#c62828;">Failed to load icon.</span>';
    };
    iconPreview.innerHTML = '';
    iconPreview.appendChild(img);
  }

  // ========================================
  // TABLE RENDERING
  // ========================================
  function renderUnitsTable(units) {
    console.log('[data-units] Rendering', units.length, 'units');
    if (!units || units.length === 0) {
      unitsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#52606d;">No units yet. Add one above.</td></tr>';
      return;
    }

    unitsTableBody.innerHTML = '';
    for (var i = 0; i < units.length; i++) {
      var unit = units[i];
      var row = document.createElement('tr');

      var nameCell = document.createElement('td');
      nameCell.textContent = unit.name || '—';

      var ageCell = document.createElement('td');
      ageCell.textContent = unit.age || '—';

      var typeCell = document.createElement('td');
      typeCell.textContent = unit.unitType || '—';

      var combatCell = document.createElement('td');
      combatCell.textContent = unit.combatStrength || '—';

      var actionsCell = document.createElement('td');
      var iconSpan = document.createElement('span');
      iconSpan.className = 'icon-display';
      if (unit.iconUrl) {
        var iconImg = document.createElement('img');
        iconImg.src = unit.iconUrl;
        iconImg.alt = unit.name;
        iconSpan.appendChild(iconImg);
      } else {
        iconSpan.textContent = '—';
      }

      var editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.className = 'secondary';
      editButton.style.marginLeft = '0';
      editButton.addEventListener('click', (function (u) {
        return function () {
          editUnit(u);
        };
      })(unit));

      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'danger';
      deleteButton.addEventListener('click', (function (u) {
        return function () {
          deleteUnit(u);
        };
      })(unit));

      actionsCell.appendChild(iconSpan);
      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);

      row.appendChild(nameCell);
      row.appendChild(ageCell);
      row.appendChild(typeCell);
      row.appendChild(combatCell);
      row.appendChild(actionsCell);
      unitsTableBody.appendChild(row);
    }
  }

  // ========================================
  // EDIT / DELETE
  // ========================================
  function editUnit(unit) {
    console.log('[data-units] Editing unit:', unit);
    isEditMode = true;
    currentUnitId = unit.id;

    unitIdField.value = unit.id || '';
    unitIdField.disabled = true;
    unitNameField.value = unit.name || '';
    unitAgeField.value = unit.age || '';
    unitTypeField.value = unit.unitType || '';
    unitIconField.value = unit.iconUrl || '';
    unitDescriptionField.value = unit.description || '';
    unitCombatStrengthField.value = unit.combatStrength || '';
    unitRangedStrengthField.value = unit.rangedStrength || '';
    unitBombardStrengthField.value = unit.bombardStrength || '';
    unitMovementField.value = unit.movement || '';
    updateIconPreview(unit.iconUrl);

    // Handle unlock method - could be tech/civic ID or "age_start"
    if (unit.unlockMethod && unit.unlockMethod !== 'age_start') {
      selectedUnlockMethodId = unit.unlockMethod;
      if (unlockMethodAutocomplete) {
        unlockMethodAutocomplete.setValueById(unit.unlockMethod);
      } else {
        unitUnlockMethodField.value = unit.unlockMethod;
      }
    } else {
      unitUnlockMethodField.value = '';
      selectedUnlockMethodId = null;
    }

    selectedAssociatedCivId = unit.associatedCivId || null;
    if (unitAssociatedCivField) {
      if (associatedCivAutocomplete && unit.associatedCivId) {
        associatedCivAutocomplete.setValueById(unit.associatedCivId);
      } else if (associatedCivAutocomplete) {
        associatedCivAutocomplete.setValue('');
      } else {
        unitAssociatedCivField.value = '';
        unitAssociatedCivField.removeAttribute('data-selected-id');
        unitAssociatedCivField.removeAttribute('data-selected-name');
      }
    }

    loadEffectsArray(unit.effects);

    showStatus('Editing: ' + unit.name, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteUnit(unit) {
    if (!confirm('Delete "' + unit.name + '"? This cannot be undone.')) {
      return;
    }
    console.log('[data-units] Deleting unit:', unit.id);
    window.CivStore.deleteUnitAsync(unit.id)
      .then(function (success) {
        if (success) {
          showStatus('Deleted: ' + unit.name, 'success');
          if (currentUnitId === unit.id) {
            resetForm();
          }
          return window.CivStore.getUnitsAsync();
        } else {
          showStatus('Failed to delete unit.', 'error');
        }
      })
      .then(function (units) {
        if (units) {
          renderUnitsTable(units);
        }
      })
      .catch(function (err) {
        console.error('Delete failed:', err);
        showStatus('Delete failed: ' + err.message, 'error');
      });
  }

  // ========================================
  // EXPORT / IMPORT
  // ========================================
  function handleExport() {
    window.CivStore.getUnitsAsync()
      .then(function (units) {
        jsonDataField.value = JSON.stringify(units, null, 2);
        showStatus('Exported ' + units.length + ' units to JSON.', 'success');
      })
      .catch(function (err) {
        console.error('Export failed:', err);
        showStatus('Export failed: ' + err.message, 'error');
      });
  }

  function handleImport() {
    var jsonText = jsonDataField.value.trim();
    if (!jsonText) {
      showStatus('Please paste JSON data first.', 'error');
      return;
    }
    try {
      var units = JSON.parse(jsonText);
      if (!Array.isArray(units)) {
        throw new Error('JSON must be an array of units');
      }
      if (!confirm('Import ' + units.length + ' units? This will replace all existing units.')) {
        return;
      }
      // Import logic would go here - for now just show message
      showStatus('Import functionality coming soon.', 'info');
    } catch (err) {
      console.error('Import failed:', err);
      showStatus('Import failed: ' + err.message, 'error');
    }
  }

  function handleClearAll() {
    if (!confirm('Delete ALL units? This cannot be undone.')) {
      return;
    }
    window.CivStore.getUnitsAsync()
      .then(function (units) {
        var deletePromises = units.map(function (unit) {
          return window.CivStore.deleteUnitAsync(unit.id);
        });
        return Promise.all(deletePromises);
      })
      .then(function () {
        showStatus('Deleted all units.', 'success');
        resetForm();
        return window.CivStore.getUnitsAsync();
      })
      .then(function (units) {
        renderUnitsTable(units);
      })
      .catch(function (err) {
        console.error('Clear all failed:', err);
        showStatus('Clear all failed: ' + err.message, 'error');
      });
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================
  form.addEventListener('submit', handleFormSubmit);

  resetFormButton.addEventListener('click', function () {
    resetForm();
  });

  newUnitButton.addEventListener('click', function () {
    resetForm();
  });

  addEffectButton.addEventListener('click', function () {
    addEffectInput('');
  });

  unitIconField.addEventListener('input', function () {
    updateIconPreview(unitIconField.value.trim());
  });

  if (iconFileField) {
    iconFileField.addEventListener('change', handleIconFileChange);
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
      if (typeof result === 'string' && unitIconField) {
        unitIconField.value = result;
        updateIconPreview(result);
        showStatus('Icon loaded from file.', 'success');
      }
    };
    reader.onerror = function () {
      showStatus('Failed to read icon file.', 'error');
    };
    reader.readAsDataURL(file);
  }

  if (exportButton) {
    exportButton.addEventListener('click', handleExport);
  }

  if (importButton) {
    importButton.addEventListener('click', handleImport);
  }

  if (clearAllButton) {
    clearAllButton.addEventListener('click', handleClearAll);
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  function init() {
    console.log('[data-units] Initializing autocompletes and loading data...');

    // Initialize autocomplete for unlock method (technologies and civics)
    // Note: We'll need to handle both techs and civics in the autocomplete
    if (window.CivAutocomplete && unitUnlockMethodField) {
      // For now, we'll search technologies - could be enhanced to search both
      unlockMethodAutocomplete = window.CivAutocomplete.create({
        input: unitUnlockMethodField,
        entityType: 'technologies',
        placeholder: 'Start typing tech/civic name...',
        onSelect: function (item) {
          selectedUnlockMethodId = item ? item.id : null;
          console.log('[data-units] Unlock method selected:', selectedUnlockMethodId);
        }
      });
    }

    // Initialize autocomplete for associated civ
    if (window.CivAutocomplete && unitAssociatedCivField) {
      console.log('[data-units] Initializing associated civ autocomplete...');
      associatedCivAutocomplete = window.CivAutocomplete.create({
        input: unitAssociatedCivField,
        entityType: 'civilizations',
        onSelect: function (item) {
          selectedAssociatedCivId = item ? item.id : null;
          console.log('[data-units] Associated civ selected:', selectedAssociatedCivId, item);
        }
      });
      console.log('[data-units] Associated civ autocomplete initialized:', associatedCivAutocomplete);
    } else {
      console.warn('[data-units] Cannot initialize civ autocomplete - CivAutocomplete:', !!window.CivAutocomplete, 'Field:', !!unitAssociatedCivField);
    }

    // Initialize form with one empty effect input
    addEffectInput('');

    // Load and render units
    window.CivStore.getUnitsAsync()
      .then(function (units) {
        renderUnitsTable(units);
        showStatus('Loaded ' + units.length + ' units.', 'success');
      })
      .catch(function (err) {
        console.error('[data-units] Failed to load units:', err);
        showStatus('Failed to load units: ' + err.message, 'error');
        unitsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#c62828;">Error loading data.</td></tr>';
      });
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

