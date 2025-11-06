(function () {
  'use strict';

  var store = window.CivStore;
  var form = document.getElementById('item-form');
  var statusEl = document.getElementById('tech-civics-status-message');
  var tableBody = document.getElementById('items-table-body');
  var newButton = document.getElementById('tech-civics-new-button');
  var exportButton = document.getElementById('tech-civics-export-button');
  var importButton = document.getElementById('tech-civics-import-button');
  var clearAllButton = document.getElementById('tech-civics-clear-all');
  var jsonArea = document.getElementById('tech-civics-json-data');
  var resetButton = document.getElementById('tech-civics-reset-form');
  var typeFilterButtons = document.querySelectorAll('#type-filter button');
  var itemTypeField = document.getElementById('item-type');
  var iconUrlField = document.getElementById('item-icon-url');
  var iconFileField = document.getElementById('item-icon-file');
  var iconPreview = document.getElementById('item-icon-preview');
  var effectsContainer = document.getElementById('item-effects-container');
  var addEffectButton = document.getElementById('tech-civics-add-effect-button');
  var wonderUnlockField = document.getElementById('item-wonder-unlock');
  var policiesContainer = document.getElementById('item-policies-container');
  var addPolicyButton = document.getElementById('tech-civics-add-policy-button');
  var unitsContainer = document.getElementById('item-units-container');
  var addUnitButton = document.getElementById('tech-civics-add-unit-button');
  var buildingsContainer = document.getElementById('item-buildings-container');
  var addBuildingButton = document.getElementById('tech-civics-add-building-button');
  var civSpecificField = document.getElementById('item-civ-specific');
  var productionCostField = document.getElementById('item-production-cost');

  var editingOriginalId = null;
  var editingType = null;
  var effectCounter = 0;
  var policyCounter = 0;
  var unitCounter = 0;
  var buildingCounter = 0;
  var currentFilter = 'all';
  
  // Autocomplete instances
  var policyAutocompletes = [];
  var unitAutocompletes = [];
  var buildingAutocompletes = [];
  var wonderAutocomplete = null;
  var civSpecificAutocomplete = null;

  function showStatus(message, tone) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.setAttribute('data-tone', tone || 'info');
  }

  // Filter buttons
  function handleFilterClick(event) {
    var type = event.target.getAttribute('data-type');
    currentFilter = type;
    typeFilterButtons.forEach(function (btn) {
      btn.classList.remove('active');
      if (btn === event.target) {
        btn.classList.add('active');
      }
    });
    renderItemsTable();
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
    input.placeholder = 'Enter effect description...';
    
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

  // Social policies builder functions
  function addPolicyInput(policyId) {
    if (!policiesContainer) {
      return;
    }
    policyCounter++;
    var policyInputId = 'policy-' + policyCounter;
    
    var policyDiv = document.createElement('div');
    policyDiv.className = 'policy-input-row';
    
    var input = document.createElement('input');
    input.type = 'text';
    input.id = policyInputId;
    input.className = 'policy-input';
    input.value = policyId || '';
    input.placeholder = 'Enter policy name or ID...';
    
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'secondary';
    removeButton.addEventListener('click', function () {
      policyDiv.remove();
    });
    
    policyDiv.appendChild(input);
    policyDiv.appendChild(removeButton);
    policiesContainer.appendChild(policyDiv);
    
    return input;
  }
  
  function getPoliciesArray() {
    if (!policiesContainer) {
      return [];
    }
    var inputs = policiesContainer.querySelectorAll('.policy-input');
    var policies = [];
    inputs.forEach(function (input) {
      var value = input.value.trim();
      if (value) {
        policies.push(value);
      }
    });
    return policies;
  }
  
  function clearPoliciesContainer() {
    if (policiesContainer) {
      policiesContainer.innerHTML = '';
      policyCounter = 0;
      policyAutocompletes = [];
    }
  }
  
  function loadPoliciesArray(policies) {
    clearPoliciesContainer();
    if (Array.isArray(policies) && policies.length > 0) {
      policies.forEach(function (policy) {
        addPolicyInput(policy);
      });
    }
  }

  // Unit unlocks builder functions (similar to policies but with autocomplete)
  function addUnitInput(unitId) {
    if (!unitsContainer) {
      return;
    }
    unitCounter++;
    var unitInputId = 'unit-' + unitCounter;
    
    var unitDiv = document.createElement('div');
    unitDiv.className = 'unit-input-row';
    
    var inputWrapper = document.createElement('div');
    inputWrapper.className = 'autocomplete-wrapper';
    
    var input = document.createElement('input');
    input.type = 'text';
    input.id = unitInputId;
    input.className = 'unit-input';
    input.value = unitId || '';
    input.placeholder = 'Start typing unit name...';
    
    inputWrapper.appendChild(input);
    
    unitDiv.appendChild(inputWrapper);
    unitsContainer.appendChild(unitDiv);
    
    // Initialize autocomplete for units
    var unitAutocomplete = null;
    if (window.CivAutocomplete) {
      unitAutocomplete = window.CivAutocomplete.create({
        input: input,
        entityType: 'units',
        placeholder: 'Start typing unit name...',
        onSelect: function (item) {
          // Store the selected unit ID in a data attribute
          input.setAttribute('data-selected-id', item.id);
          input.setAttribute('data-selected-name', item.name);
        }
      });
      unitAutocompletes.push(unitAutocomplete);
    }
    
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'secondary';
    removeButton.style.marginLeft = '0';
    removeButton.addEventListener('click', function () {
      // Remove from autocompletes array
      if (unitAutocomplete) {
        var index = unitAutocompletes.indexOf(unitAutocomplete);
        if (index > -1) {
          unitAutocompletes.splice(index, 1);
        }
      }
      unitDiv.remove();
    });
    
    unitDiv.appendChild(removeButton);
    
    return input;
  }
  
  function getUnitsArray() {
    if (!unitsContainer) {
      return [];
    }
    var inputs = unitsContainer.querySelectorAll('.unit-input');
    var units = [];
    inputs.forEach(function (input) {
      var unitId = input.getAttribute('data-selected-id') || input.value.trim();
      if (unitId) {
        units.push(unitId);
      }
    });
    return units;
  }
  
  function clearUnitsContainer() {
    if (unitsContainer) {
      unitsContainer.innerHTML = '';
      unitCounter = 0;
      unitAutocompletes = [];
    }
  }
  
  function loadUnitsArray(units) {
    clearUnitsContainer();
    if (Array.isArray(units) && units.length > 0) {
      units.forEach(function (unitId) {
        addUnitInput(unitId);
      });
      // After all inputs are created, set their values by ID
      setTimeout(function () {
        var inputs = unitsContainer.querySelectorAll('.unit-input');
        inputs.forEach(function (input, index) {
          if (index < units.length && unitAutocompletes[index]) {
            var autocomplete = unitAutocompletes[index];
            if (autocomplete && autocomplete.setValueById) {
              autocomplete.setValueById(units[index]);
            }
          }
        });
      }, 0);
    }
  }

  // Building unlocks builder functions (similar to units)
  function addBuildingInput(buildingId) {
    if (!buildingsContainer) {
      return;
    }
    buildingCounter++;
    var buildingInputId = 'building-' + buildingCounter;
    
    var buildingDiv = document.createElement('div');
    buildingDiv.className = 'building-input-row';
    
    var inputWrapper = document.createElement('div');
    inputWrapper.className = 'autocomplete-wrapper';
    
    var input = document.createElement('input');
    input.type = 'text';
    input.id = buildingInputId;
    input.className = 'building-input';
    input.value = buildingId || '';
    input.placeholder = 'Start typing building name...';
    
    inputWrapper.appendChild(input);
    
    buildingDiv.appendChild(inputWrapper);
    buildingsContainer.appendChild(buildingDiv);
    
    // Initialize autocomplete for buildings
    var buildingAutocomplete = null;
    if (window.CivAutocomplete) {
      buildingAutocomplete = window.CivAutocomplete.create({
        input: input,
        entityType: 'buildings',
        placeholder: 'Start typing building name...',
        onSelect: function (item) {
          // Store the selected building ID in a data attribute
          input.setAttribute('data-selected-id', item.id);
          input.setAttribute('data-selected-name', item.name);
        }
      });
      buildingAutocompletes.push(buildingAutocomplete);
    }
    
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'secondary';
    removeButton.style.marginLeft = '0';
    removeButton.addEventListener('click', function () {
      // Remove from autocompletes array
      if (buildingAutocomplete) {
        var index = buildingAutocompletes.indexOf(buildingAutocomplete);
        if (index > -1) {
          buildingAutocompletes.splice(index, 1);
        }
      }
      buildingDiv.remove();
    });
    
    buildingDiv.appendChild(removeButton);
    
    return input;
  }
  
  function getBuildingsArray() {
    if (!buildingsContainer) {
      return [];
    }
    var inputs = buildingsContainer.querySelectorAll('.building-input');
    var buildings = [];
    inputs.forEach(function (input) {
      var buildingId = input.getAttribute('data-selected-id') || input.value.trim();
      if (buildingId) {
        buildings.push(buildingId);
      }
    });
    return buildings;
  }
  
  function clearBuildingsContainer() {
    if (buildingsContainer) {
      buildingsContainer.innerHTML = '';
      buildingCounter = 0;
      buildingAutocompletes = [];
    }
  }
  
  function loadBuildingsArray(buildings) {
    clearBuildingsContainer();
    if (Array.isArray(buildings) && buildings.length > 0) {
      buildings.forEach(function (buildingId) {
        addBuildingInput(buildingId);
      });
      // After all inputs are created, set their values by ID
      setTimeout(function () {
        var inputs = buildingsContainer.querySelectorAll('.building-input');
        inputs.forEach(function (input, index) {
          if (index < buildings.length && buildingAutocompletes[index]) {
            var autocomplete = buildingAutocompletes[index];
            if (autocomplete && autocomplete.setValueById) {
              autocomplete.setValueById(buildings[index]);
            }
          }
        });
      }, 0);
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
      img.alt = 'Icon preview';
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
      image.alt = (name || 'Item') + ' icon';
      image.loading = 'lazy';
      image.decoding = 'async';
      target.appendChild(image);
    } else {
      target.textContent = '🔬';
    }
  }

  function renderItemsTable() {
    var promises = [
      store.getTechnologiesAsync(),
      store.getCivicsAsync()
    ];
    
    Promise.all(promises).then(function (results) {
      var techs = results[0] || [];
      var civics = results[1] || [];
      var allItems = [];
      
      techs.forEach(function (tech) {
        allItems.push({ type: 'technologies', data: tech });
      });
      civics.forEach(function (civic) {
        allItems.push({ type: 'civics', data: civic });
      });
      
      // Apply filter
      if (currentFilter !== 'all') {
        allItems = allItems.filter(function (item) {
          return item.type === currentFilter;
        });
      }
      
      renderItemsTableWithData(allItems);
    }).catch(function (err) {
      console.error('Failed to load items:', err);
      renderItemsTableWithData([]);
    });
  }

  function renderItemsTableWithData(items) {
    items.sort(function (a, b) {
      return (a.data.name || '').localeCompare(b.data.name || '');
    });

    tableBody.innerHTML = '';

    if (!items.length) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 4;
      emptyCell.textContent = 'No items saved yet.';
      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
    } else {
      items.forEach(function (item) {
        var row = document.createElement('tr');

        var nameCell = document.createElement('th');
        nameCell.scope = 'row';
        nameCell.textContent = item.data.name;

        var typeCell = document.createElement('td');
        typeCell.textContent = item.type === 'technologies' ? 'Technology' : 'Civic';

        var ageCell = document.createElement('td');
        ageCell.textContent = item.data.age || '—';

        var actionsCell = document.createElement('td');
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon-display';
        appendIconPreview(iconSpan, item.data.iconUrl || '', item.data.name || 'Item');
        iconSpan.setAttribute('aria-label', 'Icon preview for ' + (item.data.name || 'item'));

        var editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'secondary';
        editButton.setAttribute('data-action', 'edit');
        editButton.setAttribute('data-id', item.data.id);
        editButton.setAttribute('data-type', item.type);

        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'danger';
        deleteButton.setAttribute('data-action', 'delete');
        deleteButton.setAttribute('data-id', item.data.id);
        deleteButton.setAttribute('data-type', item.type);

        actionsCell.appendChild(iconSpan);
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(typeCell);
        row.appendChild(ageCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
      });
    }
  }

  function resetForm(item, type) {
    form.reset();
    editingOriginalId = null;
    editingType = null;
    if (iconFileField) {
      iconFileField.value = '';
    }
    if (item && type) {
      editingOriginalId = item.id;
      editingType = type;
      itemTypeField.value = type;
      form.elements.id.value = item.id;
      form.elements.name.value = item.name || '';
      form.elements.age.value = item.age || '';
      
      if (productionCostField) {
        productionCostField.value = item.productionCost || '';
      }
      
      if (iconUrlField) {
        iconUrlField.value = item.iconUrl || '';
        updateIconPreview(item.iconUrl || '');
      }
      
      // Load effects
      if (item.effects) {
        loadEffectsArray(item.effects);
      } else {
        clearEffectsContainer();
      }
      
      // Wonder unlock
      if (wonderUnlockField && wonderAutocomplete && item.wonderUnlock) {
        wonderAutocomplete.setValueById(item.wonderUnlock);
      } else if (wonderUnlockField) {
        wonderUnlockField.value = item.wonderUnlock || '';
      }
      
      // Social policies
      if (item.socialPolicies) {
        loadPoliciesArray(item.socialPolicies);
      } else {
        clearPoliciesContainer();
      }
      
      // Unit unlocks
      if (item.unitUnlocks) {
        loadUnitsArray(item.unitUnlocks);
      } else {
        clearUnitsContainer();
      }
      
      // Building unlocks
      if (item.buildingUnlocks) {
        loadBuildingsArray(item.buildingUnlocks);
      } else {
        clearBuildingsContainer();
      }
      
      // Civ-specific
      if (civSpecificField && civSpecificAutocomplete && item.civSpecificUnlock && item.civSpecificUnlock.civId) {
        civSpecificAutocomplete.setValueById(item.civSpecificUnlock.civId);
      } else if (civSpecificField) {
        civSpecificField.value = '';
      }
      
      showStatus('Editing "' + item.name + '".', 'info');
    } else {
      if (iconUrlField) {
        iconUrlField.value = '';
        updateIconPreview('');
      }
      clearEffectsContainer();
      clearPoliciesContainer();
      clearUnitsContainer();
      clearBuildingsContainer();
      if (wonderUnlockField) {
        wonderUnlockField.value = '';
        wonderUnlockField.removeAttribute('data-selected-id');
        wonderUnlockField.removeAttribute('data-selected-name');
      }
      if (civSpecificField) {
        civSpecificField.value = '';
        civSpecificField.removeAttribute('data-selected-id');
        civSpecificField.removeAttribute('data-selected-name');
      }
      showStatus('Ready to add a new Technology or Civic.', 'info');
    }
  }

  function validateFormData(data) {
    if (!data.id) {
      return 'An ID is required.';
    }
    if (!data.name) {
      return 'A name is required.';
    }
    if (!data.age) {
      return 'An age is required.';
    }
    return '';
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    var effectsArray = getEffectsArray();
    var policiesArray = getPoliciesArray();
    var unitsArray = getUnitsArray();
    var buildingsArray = getBuildingsArray();
    
    var wonderId = wonderUnlockField ? (wonderUnlockField.getAttribute('data-selected-id') || wonderUnlockField.value.trim()) : '';
    var civId = civSpecificField ? (civSpecificField.getAttribute('data-selected-id') || civSpecificField.value.trim()) : '';
    
    var civSpecificJson = null;
    if (civId) {
      civSpecificJson = { civId: civId };
    }

    var formData = {
      id: form.elements.id.value.trim(),
      name: form.elements.name.value.trim(),
      age: form.elements.age.value,
      type: itemTypeField.value,
      iconUrl: iconUrlField ? iconUrlField.value.trim() : '',
      productionCost: productionCostField ? (parseInt(productionCostField.value, 10) || null) : null,
      effects: effectsArray.length > 0 ? effectsArray : null,
      wonderUnlock: wonderId || null,
      socialPolicies: policiesArray.length > 0 ? policiesArray : null,
      unitUnlocks: unitsArray.length > 0 ? unitsArray : null,
      buildingUnlocks: buildingsArray.length > 0 ? buildingsArray : null,
      civSpecificUnlock: civSpecificJson
    };

    var error = validateFormData(formData);
    if (error) {
      showStatus(error, 'error');
      return;
    }

    console.log('[data-tech-civics] Attempting to save item:', formData);
    var savePromise = formData.type === 'technologies' 
      ? store.saveTechnologyAsync(formData)
      : store.saveCivicAsync(formData);
    
    savePromise.then(function (savedItem) {
      console.log('[data-tech-civics] Save promise resolved, savedItem:', savedItem);
      if (!savedItem || !savedItem.id) {
        console.error('[data-tech-civics] Saved item is invalid:', savedItem);
        showStatus('Failed to save item.', 'error');
        return;
      }

      if (editingOriginalId && editingOriginalId !== savedItem.id) {
        var deletePromise = editingType === 'technologies'
          ? store.deleteTechnologyAsync(editingOriginalId)
          : store.deleteCivicAsync(editingOriginalId);
        deletePromise.catch(function (err) {
          console.warn('Failed to delete old item:', err);
        });
      }

      editingOriginalId = savedItem.id;
      editingType = formData.type;
      renderItemsTable();
      showStatus('Saved "' + (savedItem.name || 'item') + '".', 'success');
    }).catch(function (err) {
      console.error('Save failed:', err);
      showStatus('Failed to save: ' + (err.message || err), 'error');
    });
  }

  function handleTableClick(event) {
    var target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    var action = target.getAttribute('data-action');
    var id = target.getAttribute('data-id');
    var type = target.getAttribute('data-type');
    if (!action || !id || !type) {
      return;
    }
    if (action === 'edit') {
      showStatus('Loading item details...', 'info');
      var loadPromise = type === 'technologies'
        ? store.getTechnologyByIdAsync(id)
        : store.getCivicByIdAsync(id);
      
      loadPromise.then(function (item) {
        if (item) {
          resetForm(item, type);
          showStatus('Loaded "' + item.name + '".', 'success');
        } else {
          showStatus('Item not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to load item:', err);
        showStatus('Failed to load item: ' + (err.message || err), 'error');
      });
    } else if (action === 'delete') {
      var confirmed = window.confirm('Delete this ' + (type === 'technologies' ? 'Technology' : 'Civic') + '?');
      if (!confirmed) {
        return;
      }
      var deletePromise = type === 'technologies'
        ? store.deleteTechnologyAsync(id)
        : store.deleteCivicAsync(id);
      
      deletePromise.then(function (removed) {
        if (removed) {
          if (editingOriginalId === id) {
            resetForm(null, null);
          }
          renderItemsTable();
          showStatus('Deleted ' + (type === 'technologies' ? 'Technology' : 'Civic') + '.', 'success');
        } else {
          showStatus('Item not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to delete item:', err);
        showStatus('Failed to delete: ' + (err.message || err), 'error');
      });
    }
  }

  function handleExport() {
    var promises = [
      store.getTechnologiesAsync(),
      store.getCivicsAsync()
    ];
    
    Promise.all(promises).then(function (results) {
      var techs = results[0] || [];
      var civics = results[1] || [];
      var allItems = {
        technologies: techs,
        civics: civics
      };
      jsonArea.value = JSON.stringify(allItems, null, 2);
      jsonArea.focus();
      showStatus('Exported ' + techs.length + ' Technology(ies) and ' + civics.length + ' Civic(s).', 'success');
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
    var confirmed = window.confirm('This will remove all Technologies and Civics. Continue?');
    if (!confirmed) {
      return;
    }
    Promise.all([
      store.setTechnologiesAsync([]),
      store.setCivicsAsync([])
    ]).then(function () {
      resetForm(null, null);
      renderItemsTable();
      showStatus('Cleared all items.', 'success');
    }).catch(function (err) {
      console.error('Failed to clear items:', err);
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
      if (!parsed.technologies && !parsed.civics) {
        throw new Error('JSON should contain technologies and/or civics arrays.');
      }
      
      var techPromises = [];
      var civPromises = [];
      
      if (parsed.technologies && Array.isArray(parsed.technologies)) {
        techPromises.push(store.setTechnologiesAsync(parsed.technologies));
      }
      if (parsed.civics && Array.isArray(parsed.civics)) {
        civPromises.push(store.setCivicsAsync(parsed.civics));
      }
      
      Promise.all(techPromises.concat(civPromises)).then(function () {
        resetForm(null, null);
        renderItemsTable();
        showStatus('Imported items.', 'success');
      }).catch(function (err) {
        console.error('Failed to save imported items:', err);
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
    if (wonderUnlockField && window.CivAutocomplete) {
      wonderAutocomplete = window.CivAutocomplete.create({
        input: wonderUnlockField,
        entityType: 'world_wonders',
        placeholder: 'Start typing wonder name...',
        onSelect: function (item) {
          wonderUnlockField.setAttribute('data-selected-id', item.id);
          wonderUnlockField.setAttribute('data-selected-name', item.name);
        }
      });
    }

    if (civSpecificField && window.CivAutocomplete) {
      civSpecificAutocomplete = window.CivAutocomplete.create({
        input: civSpecificField,
        entityType: 'civilizations',
        placeholder: 'Start typing civilization name...',
        onSelect: function (item) {
          civSpecificField.setAttribute('data-selected-id', item.id);
          civSpecificField.setAttribute('data-selected-name', item.name);
        }
      });
    }

    // Handle Add Effect button
    if (addEffectButton) {
      addEffectButton.addEventListener('click', function () {
        addEffectInput('');
      });
    }

    // Handle Add Policy button
    if (addPolicyButton) {
      addPolicyButton.addEventListener('click', function () {
        addPolicyInput('');
      });
    }

    // Handle Add Unit button
    if (addUnitButton) {
      addUnitButton.addEventListener('click', function () {
        addUnitInput('');
      });
    }

    // Handle Add Building button
    if (addBuildingButton) {
      addBuildingButton.addEventListener('click', function () {
        addBuildingInput('');
      });
    }

    // Handle type filter buttons
    typeFilterButtons.forEach(function (btn) {
      btn.addEventListener('click', handleFilterClick);
    });

    renderItemsTable();
    resetForm(null, null);

    form.addEventListener('submit', handleFormSubmit);
    tableBody.addEventListener('click', handleTableClick);
    newButton.addEventListener('click', function () {
      resetForm(null, null);
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        resetForm(null, null);
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

