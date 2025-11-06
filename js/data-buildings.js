// CIV7 Tracker - Buildings Data Editor
// Handles form interactions and data editing for buildings

(function () {
  'use strict';

  console.log('[data-buildings] Initializing...');

  // DOM Elements
  var form = document.getElementById('building-form');
  var buildingIdField = document.getElementById('building-id');
  var buildingNameField = document.getElementById('building-name');
  var buildingAgeField = document.getElementById('building-age');
  var buildingLocationTypeField = document.getElementById('building-location-type');
  var buildingProductionCostField = document.getElementById('building-production-cost');
  var buildingIconField = document.getElementById('building-icon-url');
  var buildingPlacementRequirementsField = document.getElementById('building-placement-requirements');
  var buildingIsWarehouseField = document.getElementById('building-is-warehouse');
  var buildingUnlockMethodField = document.getElementById('building-unlock-method');
  var buildingAssociatedCivField = document.getElementById('building-associated-civ');
  var effectsContainer = document.getElementById('building-effects-container');
  var addEffectButton = document.getElementById('buildings-add-effect-button');
  var resetFormButton = document.getElementById('buildings-reset-form');
  var newBuildingButton = document.getElementById('buildings-new-button');
  var statusMessage = document.getElementById('buildings-status-message');
  var buildingsTableBody = document.getElementById('buildings-table-body');
  var iconPreview = document.getElementById('building-icon-preview');
  var iconFileField = document.getElementById('building-icon-file');
  var exportButton = document.getElementById('buildings-export-button');
  var importButton = document.getElementById('buildings-import-button');
  var clearAllButton = document.getElementById('buildings-clear-all');
  var jsonDataField = document.getElementById('buildings-json-data');

  // State
  var isEditMode = false;
  var currentBuildingId = null;
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
    console.log('[data-buildings] Form submitted');

    // Get associated civ ID from autocomplete state or field data attribute
    var civId = selectedAssociatedCivId;
    if (!civId && buildingAssociatedCivField) {
      civId = buildingAssociatedCivField.getAttribute('data-selected-id') || null;
      if (civId) {
        selectedAssociatedCivId = civId;
      }
    }

    // Get unlock method ID from autocomplete state or field data attribute
    var unlockId = selectedUnlockMethodId;
    if (!unlockId && buildingUnlockMethodField) {
      unlockId = buildingUnlockMethodField.getAttribute('data-selected-id');
      if (unlockId && unlockId !== 'age_start') {
        selectedUnlockMethodId = unlockId;
      }
    }

    var formData = {
      id: buildingIdField.value.trim(),
      name: buildingNameField.value.trim(),
      age: buildingAgeField.value,
      locationType: buildingLocationTypeField.value,
      productionCost: buildingProductionCostField.value ? parseInt(buildingProductionCostField.value, 10) : null,
      iconUrl: buildingIconField.value.trim(),
      placementRequirements: buildingPlacementRequirementsField.value.trim(),
      isWarehouse: buildingIsWarehouseField.checked,
      unlockMethod: unlockId || buildingUnlockMethodField.value.trim() || 'age_start',
      associatedCivId: civId,
      effects: getEffectsArray()
    };

    console.log('[data-buildings] Attempting to save building:', formData);

    if (!validateFormData(formData)) {
      showStatus('Please fill in all required fields (ID, Name, Age, Location Type).', 'error');
      return;
    }

    window.CivStore.saveBuildingAsync(formData)
      .then(function (saved) {
        showStatus('Saved: ' + saved.name, 'success');
        resetForm();
        return window.CivStore.getBuildingsAsync();
      })
      .then(function (buildings) {
        renderBuildingsTable(buildings);
      })
      .catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Save failed: ' + err.message, 'error');
      });
  }

  function resetForm() {
    form.reset();
    isEditMode = false;
    currentBuildingId = null;
    buildingIdField.disabled = false;
    if (iconFileField) {
      iconFileField.value = '';
    }
    selectedAssociatedCivId = null;
    selectedUnlockMethodId = null;
    
    if (buildingAssociatedCivField) {
      if (associatedCivAutocomplete) {
        associatedCivAutocomplete.setValue('');
      } else {
        buildingAssociatedCivField.value = '';
        buildingAssociatedCivField.removeAttribute('data-selected-id');
        buildingAssociatedCivField.removeAttribute('data-selected-name');
      }
    }
    
    if (buildingUnlockMethodField) {
      if (unlockMethodAutocomplete) {
        unlockMethodAutocomplete.setValue('');
      } else {
        buildingUnlockMethodField.value = '';
        buildingUnlockMethodField.removeAttribute('data-selected-id');
        buildingUnlockMethodField.removeAttribute('data-selected-name');
      }
    }
    
    clearEffectsContainer();
    addEffectInput('');
    updateIconPreview('');
    showStatus('Ready to add a new Building.', 'info');
  }

  function validateFormData(data) {
    return data.id && data.name && data.age && data.locationType;
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
    img.alt = 'Building Icon';
    img.onerror = function () {
      iconPreview.innerHTML = '<span style="color:#c62828;">Failed to load icon.</span>';
    };
    iconPreview.innerHTML = '';
    iconPreview.appendChild(img);
  }

  // ========================================
  // TABLE RENDERING
  // ========================================
  function renderBuildingsTable(buildings) {
    console.log('[data-buildings] Rendering', buildings.length, 'buildings');
    if (!buildings || buildings.length === 0) {
      buildingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#52606d;">No buildings yet. Add one above.</td></tr>';
      return;
    }

    buildingsTableBody.innerHTML = '';
    for (var i = 0; i < buildings.length; i++) {
      var building = buildings[i];
      var row = document.createElement('tr');

      var nameCell = document.createElement('td');
      nameCell.textContent = building.name || '—';

      var ageCell = document.createElement('td');
      ageCell.textContent = building.age || '—';

      var locationTypeCell = document.createElement('td');
      locationTypeCell.textContent = building.locationType || '—';

      var productionCostCell = document.createElement('td');
      productionCostCell.textContent = building.productionCost || '—';

      var isWarehouseCell = document.createElement('td');
      isWarehouseCell.textContent = building.isWarehouse ? 'Yes' : 'No';

      var actionsCell = document.createElement('td');
      var iconSpan = document.createElement('span');
      iconSpan.className = 'icon-display';
      if (building.iconUrl) {
        var iconImg = document.createElement('img');
        iconImg.src = building.iconUrl;
        iconImg.alt = building.name;
        iconSpan.appendChild(iconImg);
      } else {
        iconSpan.textContent = '—';
      }

      var editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.className = 'secondary';
      editButton.style.marginLeft = '0';
      editButton.addEventListener('click', (function (b) {
        return function () {
          editBuilding(b);
        };
      })(building));

      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'danger';
      deleteButton.addEventListener('click', (function (b) {
        return function () {
          deleteBuilding(b);
        };
      })(building));

      actionsCell.appendChild(iconSpan);
      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);

      row.appendChild(nameCell);
      row.appendChild(ageCell);
      row.appendChild(locationTypeCell);
      row.appendChild(productionCostCell);
      row.appendChild(isWarehouseCell);
      row.appendChild(actionsCell);
      buildingsTableBody.appendChild(row);
    }
  }

  // ========================================
  // EDIT / DELETE
  // ========================================
  function editBuilding(building) {
    console.log('[data-buildings] Editing building:', building);
    isEditMode = true;
    currentBuildingId = building.id;

    buildingIdField.value = building.id || '';
    buildingIdField.disabled = true;
    buildingNameField.value = building.name || '';
    buildingAgeField.value = building.age || '';
    buildingLocationTypeField.value = building.locationType || '';
    buildingProductionCostField.value = building.productionCost || '';
    buildingIconField.value = building.iconUrl || '';
    buildingPlacementRequirementsField.value = building.placementRequirements || '';
    buildingIsWarehouseField.checked = Boolean(building.isWarehouse);
    updateIconPreview(building.iconUrl);

    // Handle unlock method - could be tech/civic ID or "age_start"
    if (building.unlockMethod && building.unlockMethod !== 'age_start') {
      selectedUnlockMethodId = building.unlockMethod;
      if (unlockMethodAutocomplete) {
        unlockMethodAutocomplete.setValueById(building.unlockMethod);
      } else {
        buildingUnlockMethodField.value = building.unlockMethod;
      }
    } else {
      buildingUnlockMethodField.value = '';
      selectedUnlockMethodId = null;
    }

    selectedAssociatedCivId = building.associatedCivId || null;
    if (buildingAssociatedCivField) {
      if (associatedCivAutocomplete && building.associatedCivId) {
        associatedCivAutocomplete.setValueById(building.associatedCivId);
      } else if (associatedCivAutocomplete) {
        associatedCivAutocomplete.setValue('');
      } else {
        buildingAssociatedCivField.value = '';
        buildingAssociatedCivField.removeAttribute('data-selected-id');
        buildingAssociatedCivField.removeAttribute('data-selected-name');
      }
    }

    loadEffectsArray(building.effects);

    showStatus('Editing: ' + building.name, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteBuilding(building) {
    if (!confirm('Delete "' + building.name + '"? This cannot be undone.')) {
      return;
    }
    console.log('[data-buildings] Deleting building:', building.id);
    window.CivStore.deleteBuildingAsync(building.id)
      .then(function (success) {
        if (success) {
          showStatus('Deleted: ' + building.name, 'success');
          if (currentBuildingId === building.id) {
            resetForm();
          }
          return window.CivStore.getBuildingsAsync();
        } else {
          showStatus('Failed to delete building.', 'error');
        }
      })
      .then(function (buildings) {
        if (buildings) {
          renderBuildingsTable(buildings);
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
    window.CivStore.getBuildingsAsync()
      .then(function (buildings) {
        jsonDataField.value = JSON.stringify(buildings, null, 2);
        showStatus('Exported ' + buildings.length + ' buildings to JSON.', 'success');
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
      var buildings = JSON.parse(jsonText);
      if (!Array.isArray(buildings)) {
        throw new Error('JSON must be an array of buildings');
      }
      if (!confirm('Import ' + buildings.length + ' buildings? This will replace all existing buildings.')) {
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
    if (!confirm('Delete ALL buildings? This cannot be undone.')) {
      return;
    }
    window.CivStore.getBuildingsAsync()
      .then(function (buildings) {
        var deletePromises = buildings.map(function (building) {
          return window.CivStore.deleteBuildingAsync(building.id);
        });
        return Promise.all(deletePromises);
      })
      .then(function () {
        showStatus('Deleted all buildings.', 'success');
        resetForm();
        return window.CivStore.getBuildingsAsync();
      })
      .then(function (buildings) {
        renderBuildingsTable(buildings);
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

  newBuildingButton.addEventListener('click', function () {
    resetForm();
  });

  addEffectButton.addEventListener('click', function () {
    addEffectInput('');
  });

  buildingIconField.addEventListener('input', function () {
    updateIconPreview(buildingIconField.value.trim());
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
      if (typeof result === 'string' && buildingIconField) {
        buildingIconField.value = result;
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
    console.log('[data-buildings] Initializing autocompletes and loading data...');

    // Initialize autocomplete for unlock method (technologies)
    if (window.CivAutocomplete && buildingUnlockMethodField) {
      unlockMethodAutocomplete = window.CivAutocomplete.create({
        input: buildingUnlockMethodField,
        entityType: 'technologies',
        placeholder: 'Start typing tech/civic name...',
        onSelect: function (item) {
          selectedUnlockMethodId = item ? item.id : null;
          console.log('[data-buildings] Unlock method selected:', selectedUnlockMethodId);
        }
      });
    }

    // Initialize autocomplete for associated civ
    if (window.CivAutocomplete && buildingAssociatedCivField) {
      console.log('[data-buildings] Initializing associated civ autocomplete...');
      associatedCivAutocomplete = window.CivAutocomplete.create({
        input: buildingAssociatedCivField,
        entityType: 'civilizations',
        onSelect: function (item) {
          selectedAssociatedCivId = item ? item.id : null;
          console.log('[data-buildings] Associated civ selected:', selectedAssociatedCivId, item);
        }
      });
      console.log('[data-buildings] Associated civ autocomplete initialized:', associatedCivAutocomplete);
    } else {
      console.warn('[data-buildings] Cannot initialize civ autocomplete - CivAutocomplete:', !!window.CivAutocomplete, 'Field:', !!buildingAssociatedCivField);
    }

    // Initialize form with one empty effect input
    addEffectInput('');

    // Load and render buildings
    window.CivStore.getBuildingsAsync()
      .then(function (buildings) {
        renderBuildingsTable(buildings);
        showStatus('Loaded ' + buildings.length + ' buildings.', 'success');
      })
      .catch(function (err) {
        console.error('[data-buildings] Failed to load buildings:', err);
        showStatus('Failed to load buildings: ' + err.message, 'error');
        buildingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#c62828;">Error loading data.</td></tr>';
      });
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

