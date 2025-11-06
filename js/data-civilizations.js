(function () {
  'use strict';

  var store = window.CivStore;
  var form = document.getElementById('civ-form');
  var statusEl = document.getElementById('civs-status-message');
  var tableBody = document.getElementById('civs-table-body');
  var newButton = document.getElementById('civs-new-button');
  var exportButton = document.getElementById('civs-export-button');
  var importButton = document.getElementById('civs-import-button');
  var clearAllButton = document.getElementById('civs-clear-all');
  var jsonArea = document.getElementById('civs-json-data');
  var resetButton = document.getElementById('civs-reset-form');
  var iconUrlField = document.getElementById('civ-icon-url');
  var iconFileField = document.getElementById('civ-icon-file');
  var iconPreview = document.getElementById('civ-icon-preview');
  var isQuarterCheckbox = document.getElementById('is-quarter');
  var buildingFields = document.getElementById('building-fields');
  var quarterFields = document.getElementById('quarter-fields');
  var effectsContainer = document.getElementById('civ-effects-container');
  var addEffectButton = document.getElementById('civs-add-effect-button');
  var civicsContainer = document.getElementById('civ-civics-container');
  var addCivicButton = document.getElementById('civs-add-civic-button');
  var wonderField = document.getElementById('civ-wonder');
  var unitMilitary1Field = document.getElementById('civ-unit-military-1');
  var unitMilitary2Field = document.getElementById('civ-unit-military-2');
  var unitCivilianField = document.getElementById('civ-unit-civilian');
  var buildingField = document.getElementById('civ-building');
  var quarterBuilding1Field = document.getElementById('civ-quarter-building-1');
  var quarterBuilding2Field = document.getElementById('civ-quarter-building-2');

  var editingOriginalId = null;
  var effectCounter = 0;
  var civicCounter = 0;
  
  // Autocomplete instances
  var civicAutocompletes = [];
  var wonderAutocomplete = null;
  var unitMilitary1Autocomplete = null;
  var unitMilitary2Autocomplete = null;
  var unitCivilianAutocomplete = null;
  var buildingAutocomplete = null;
  var quarterBuilding1Autocomplete = null;
  var quarterBuilding2Autocomplete = null;

  function showStatus(message, tone) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.setAttribute('data-tone', tone || 'info');
  }

  // Toggle building/quarter fields
  function toggleBuildingQuarter() {
    if (!isQuarterCheckbox || !buildingFields || !quarterFields) {
      return;
    }
    if (isQuarterCheckbox.checked) {
      buildingFields.style.display = 'none';
      quarterFields.style.display = 'block';
    } else {
      buildingFields.style.display = 'block';
      quarterFields.style.display = 'none';
    }
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

  // Unique civics builder functions (with autocomplete)
  function addCivicInput(civicId) {
    if (!civicsContainer) {
      return;
    }
    civicCounter++;
    var civicInputId = 'civic-' + civicCounter;
    
    var civicDiv = document.createElement('div');
    civicDiv.className = 'civic-input-row';
    civicDiv.style.cssText = 'display: flex; gap: 8px; align-items: center; margin-bottom: 8px;';
    
    var input = document.createElement('input');
    input.type = 'text';
    input.id = civicInputId;
    input.className = 'civic-input';
    input.value = civicId || '';
    input.style.cssText = 'flex: 1; padding: 8px; border: 1px solid #bcccdc; border-radius: 4px;';
    input.placeholder = 'Start typing civic name...';
    
    // Initialize autocomplete for this input
    if (window.CivAutocomplete) {
      var autocomplete = window.CivAutocomplete.create({
        input: input,
        entityType: 'civics',
        placeholder: 'Start typing civic name...',
        onSelect: function (item) {
          input.setAttribute('data-selected-id', item.id);
          input.setAttribute('data-selected-name', item.name);
        }
      });
      civicAutocompletes.push(autocomplete);
      
      // Load initial value if provided
      if (civicId) {
        autocomplete.setValueById(civicId);
      }
    }
    
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'secondary';
    removeButton.addEventListener('click', function () {
      civicDiv.remove();
    });
    
    civicDiv.appendChild(input);
    civicDiv.appendChild(removeButton);
    civicsContainer.appendChild(civicDiv);
    
    return input;
  }
  
  function getUniqueCivicsArray() {
    if (!civicsContainer) {
      return [];
    }
    var inputs = civicsContainer.querySelectorAll('.civic-input');
    var civics = [];
    inputs.forEach(function (input) {
      var civicId = input.getAttribute('data-selected-id') || input.value.trim();
      if (civicId) {
        civics.push(civicId);
      }
    });
    return civics;
  }
  
  function clearCivicsContainer() {
    if (civicsContainer) {
      civicsContainer.innerHTML = '';
      civicCounter = 0;
      civicAutocompletes = [];
    }
  }
  
  function loadUniqueCivicsArray(civics) {
    clearCivicsContainer();
    if (Array.isArray(civics) && civics.length > 0) {
      civics.forEach(function (civic) {
        addCivicInput(civic);
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
      img.alt = 'Civilization icon preview';
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
      image.alt = (name || 'Civilization') + ' icon';
      image.loading = 'lazy';
      image.decoding = 'async';
      target.appendChild(image);
    } else {
      target.textContent = '🏛️';
    }
  }

  function renderCivTable() {
    store.getCivilizationsAsync().then(function (civs) {
      renderCivTableWithData(civs);
    }).catch(function (err) {
      console.error('Failed to load civilizations:', err);
      renderCivTableWithData([]);
    });
  }

  function renderCivTableWithData(civs) {
    civs.sort(function (a, b) {
      return (a.name || '').localeCompare(b.name || '');
    });

    tableBody.innerHTML = '';

    if (!civs.length) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 3;
      emptyCell.textContent = 'No Civilizations saved yet.';
      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
    } else {
      civs.forEach(function (civ) {
        var row = document.createElement('tr');

        var nameCell = document.createElement('th');
        nameCell.scope = 'row';
        nameCell.textContent = civ.name;

        var ageCell = document.createElement('td');
        ageCell.textContent = civ.age || '—';

        var actionsCell = document.createElement('td');
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon-display';
        appendIconPreview(iconSpan, civ.iconUrl || '', civ.name || 'Civilization');
        iconSpan.setAttribute('aria-label', 'Icon preview for ' + (civ.name || 'civilization'));

        var editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'secondary';
        editButton.setAttribute('data-action', 'edit');
        editButton.setAttribute('data-id', civ.id);

        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'danger';
        deleteButton.setAttribute('data-action', 'delete');
        deleteButton.setAttribute('data-id', civ.id);

        actionsCell.appendChild(iconSpan);
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(ageCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
      });
    }
  }

  function resetForm(civ) {
    form.reset();
    editingOriginalId = null;
    if (iconFileField) {
      iconFileField.value = '';
    }
    if (civ) {
      editingOriginalId = civ.id;
      form.elements.id.value = civ.id;
      form.elements.name.value = civ.name || '';
      form.elements.age.value = civ.age || '';
      
      if (iconUrlField) {
        iconUrlField.value = civ.iconUrl || '';
        updateIconPreview(civ.iconUrl || '');
      }
      
      // Unique units - use autocomplete if available
      if (civ.uniqueUnits && Array.isArray(civ.uniqueUnits)) {
        if (unitMilitary1Autocomplete && civ.uniqueUnits[0]) {
          unitMilitary1Autocomplete.setValueById(civ.uniqueUnits[0]);
        } else if (unitMilitary1Field) {
          unitMilitary1Field.value = civ.uniqueUnits[0] || '';
        }
        if (unitMilitary2Autocomplete && civ.uniqueUnits[1]) {
          unitMilitary2Autocomplete.setValueById(civ.uniqueUnits[1]);
        } else if (unitMilitary2Field) {
          unitMilitary2Field.value = civ.uniqueUnits[1] || '';
        }
        if (unitCivilianAutocomplete && civ.uniqueUnits[2]) {
          unitCivilianAutocomplete.setValueById(civ.uniqueUnits[2]);
        } else if (unitCivilianField) {
          unitCivilianField.value = civ.uniqueUnits[2] || '';
        }
      } else {
        // Clear unit fields
        if (unitMilitary1Autocomplete) {
          unitMilitary1Autocomplete.setValue('');
        } else if (unitMilitary1Field) {
          unitMilitary1Field.value = '';
        }
        if (unitMilitary2Autocomplete) {
          unitMilitary2Autocomplete.setValue('');
        } else if (unitMilitary2Field) {
          unitMilitary2Field.value = '';
        }
        if (unitCivilianAutocomplete) {
          unitCivilianAutocomplete.setValue('');
        } else if (unitCivilianField) {
          unitCivilianField.value = '';
        }
      }
      
      // Buildings/Quarter - use autocomplete if available
      if (civ.uniqueBuildingsOrQuarters) {
        if (civ.uniqueBuildingsOrQuarters.isQuarter) {
          isQuarterCheckbox.checked = true;
          document.getElementById('civ-quarter-name').value = civ.uniqueBuildingsOrQuarters.quarterName || '';
          if (quarterBuilding1Autocomplete && civ.uniqueBuildingsOrQuarters.building1) {
            quarterBuilding1Autocomplete.setValueById(civ.uniqueBuildingsOrQuarters.building1);
          } else if (quarterBuilding1Field) {
            quarterBuilding1Field.value = civ.uniqueBuildingsOrQuarters.building1 || '';
          }
          if (quarterBuilding2Autocomplete && civ.uniqueBuildingsOrQuarters.building2) {
            quarterBuilding2Autocomplete.setValueById(civ.uniqueBuildingsOrQuarters.building2);
          } else if (quarterBuilding2Field) {
            quarterBuilding2Field.value = civ.uniqueBuildingsOrQuarters.building2 || '';
          }
        } else {
          isQuarterCheckbox.checked = false;
          if (buildingAutocomplete && civ.uniqueBuildingsOrQuarters.building) {
            buildingAutocomplete.setValueById(civ.uniqueBuildingsOrQuarters.building);
          } else if (buildingField) {
            buildingField.value = civ.uniqueBuildingsOrQuarters.building || '';
          }
        }
      } else {
        // Clear building fields
        isQuarterCheckbox.checked = false;
        if (buildingAutocomplete) {
          buildingAutocomplete.setValue('');
        } else if (buildingField) {
          buildingField.value = '';
        }
        if (quarterBuilding1Autocomplete) {
          quarterBuilding1Autocomplete.setValue('');
        } else if (quarterBuilding1Field) {
          quarterBuilding1Field.value = '';
        }
        if (quarterBuilding2Autocomplete) {
          quarterBuilding2Autocomplete.setValue('');
        } else if (quarterBuilding2Field) {
          quarterBuilding2Field.value = '';
        }
      }
      toggleBuildingQuarter();
      
      // Load effects
      if (civ.passiveBonuses) {
        loadEffectsArray(civ.passiveBonuses);
      } else {
        clearEffectsContainer();
      }
      
      // Load unique civics
      if (civ.uniqueCivics) {
        loadUniqueCivicsArray(civ.uniqueCivics);
      } else {
        clearCivicsContainer();
      }
      
      // Associated wonder
      if (wonderField && wonderAutocomplete && civ.productionBonusForWonder) {
        wonderAutocomplete.setValueById(civ.productionBonusForWonder);
      } else if (wonderField) {
        wonderField.value = civ.productionBonusForWonder || '';
      }
      
      showStatus('Editing "' + civ.name + '".', 'info');
    } else {
      if (iconUrlField) {
        iconUrlField.value = '';
        updateIconPreview('');
      }
      isQuarterCheckbox.checked = false;
      toggleBuildingQuarter();
      clearEffectsContainer();
      clearCivicsContainer();
      
      // Clear wonder field
      if (wonderField && wonderAutocomplete) {
        wonderAutocomplete.setValue('');
      } else if (wonderField) {
        wonderField.value = '';
        wonderField.removeAttribute('data-selected-id');
        wonderField.removeAttribute('data-selected-name');
      }
      
      // Clear unit fields
      if (unitMilitary1Autocomplete) {
        unitMilitary1Autocomplete.setValue('');
      } else if (unitMilitary1Field) {
        unitMilitary1Field.value = '';
        unitMilitary1Field.removeAttribute('data-selected-id');
        unitMilitary1Field.removeAttribute('data-selected-name');
      }
      if (unitMilitary2Autocomplete) {
        unitMilitary2Autocomplete.setValue('');
      } else if (unitMilitary2Field) {
        unitMilitary2Field.value = '';
        unitMilitary2Field.removeAttribute('data-selected-id');
        unitMilitary2Field.removeAttribute('data-selected-name');
      }
      if (unitCivilianAutocomplete) {
        unitCivilianAutocomplete.setValue('');
      } else if (unitCivilianField) {
        unitCivilianField.value = '';
        unitCivilianField.removeAttribute('data-selected-id');
        unitCivilianField.removeAttribute('data-selected-name');
      }
      
      // Clear building fields
      if (buildingAutocomplete) {
        buildingAutocomplete.setValue('');
      } else if (buildingField) {
        buildingField.value = '';
        buildingField.removeAttribute('data-selected-id');
        buildingField.removeAttribute('data-selected-name');
      }
      if (quarterBuilding1Autocomplete) {
        quarterBuilding1Autocomplete.setValue('');
      } else if (quarterBuilding1Field) {
        quarterBuilding1Field.value = '';
        quarterBuilding1Field.removeAttribute('data-selected-id');
        quarterBuilding1Field.removeAttribute('data-selected-name');
      }
      if (quarterBuilding2Autocomplete) {
        quarterBuilding2Autocomplete.setValue('');
      } else if (quarterBuilding2Field) {
        quarterBuilding2Field.value = '';
        quarterBuilding2Field.removeAttribute('data-selected-id');
        quarterBuilding2Field.removeAttribute('data-selected-name');
      }
      
      showStatus('Ready to add a new Civilization.', 'info');
    }
  }

  function validateFormData(data, civs) {
    if (!data.id) {
      return 'An ID is required.';
    }
    if (!data.name) {
      return 'A name is required.';
    }
    if (!data.age) {
      return 'An age is required.';
    }

    var duplicate = civs.some(function (civ) {
      if (editingOriginalId && editingOriginalId === civ.id) {
        return false;
      }
      return civ.id === data.id;
    });

    if (duplicate) {
      return 'ID must be unique.';
    }

    return '';
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    store.getCivilizationsAsync().then(function (civs) {
      var effectsArray = getEffectsArray();
      var uniqueCivicsArray = getUniqueCivicsArray();
      
      // Collect unique units (use data-selected-id from autocomplete if available)
      var uniqueUnits = [];
      var unit1 = unitMilitary1Field ? (unitMilitary1Field.getAttribute('data-selected-id') || unitMilitary1Field.value.trim()) : '';
      var unit2 = unitMilitary2Field ? (unitMilitary2Field.getAttribute('data-selected-id') || unitMilitary2Field.value.trim()) : '';
      var unit3 = unitCivilianField ? (unitCivilianField.getAttribute('data-selected-id') || unitCivilianField.value.trim()) : '';
      if (unit1) uniqueUnits.push(unit1);
      if (unit2) uniqueUnits.push(unit2);
      if (unit3) uniqueUnits.push(unit3);
      
      // Collect buildings/quarter (use data-selected-id from autocomplete if available)
      var buildingsOrQuarters = null;
      if (isQuarterCheckbox.checked) {
        var building1 = quarterBuilding1Field ? (quarterBuilding1Field.getAttribute('data-selected-id') || quarterBuilding1Field.value.trim()) : '';
        var building2 = quarterBuilding2Field ? (quarterBuilding2Field.getAttribute('data-selected-id') || quarterBuilding2Field.value.trim()) : '';
        buildingsOrQuarters = {
          isQuarter: true,
          quarterName: document.getElementById('civ-quarter-name').value.trim(),
          building1: building1,
          building2: building2
        };
      } else {
        var building = buildingField ? (buildingField.getAttribute('data-selected-id') || buildingField.value.trim()) : '';
        if (building) {
          buildingsOrQuarters = {
            isQuarter: false,
            building: building
          };
        }
      }
      
      var wonderId = wonderField ? (wonderField.getAttribute('data-selected-id') || wonderField.value.trim()) : '';

      var formData = {
        id: form.elements.id.value.trim(),
        name: form.elements.name.value.trim(),
        age: form.elements.age.value,
        iconUrl: iconUrlField ? iconUrlField.value.trim() : '',
        uniqueUnits: uniqueUnits.length > 0 ? uniqueUnits : null,
        uniqueBuildingsOrQuarters: buildingsOrQuarters,
        passiveBonuses: effectsArray.length > 0 ? effectsArray : null,
        uniqueCivics: uniqueCivicsArray.length > 0 ? uniqueCivicsArray : null,
        productionBonusForWonder: wonderId || null
      };

      var error = validateFormData(formData, civs);
      if (error) {
        showStatus(error, 'error');
        return;
      }

      console.log('[data-civilizations] Attempting to save civilization:', formData);
      store.saveCivilizationAsync(formData).then(function (savedCiv) {
        console.log('[data-civilizations] Save promise resolved, savedCiv:', savedCiv);
        if (!savedCiv || !savedCiv.id) {
          console.error('[data-civilizations] Saved civilization is invalid:', savedCiv);
          showStatus('Failed to save civilization.', 'error');
          return;
        }

        if (editingOriginalId && editingOriginalId !== savedCiv.id) {
          store.deleteCivilizationAsync(editingOriginalId).catch(function (err) {
            console.warn('Failed to delete old civilization:', err);
          });
        }

        editingOriginalId = savedCiv.id;
        renderCivTable();
        showStatus('Saved "' + (savedCiv.name || 'civilization') + '".', 'success');
      }).catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Failed to save: ' + (err.message || err), 'error');
      });
    }).catch(function (err) {
      console.error('Failed to load civilizations for validation:', err);
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
      showStatus('Loading civilization details...', 'info');
      store.getCivilizationByIdAsync(id).then(function (civ) {
        if (civ) {
          resetForm(civ);
          showStatus('Loaded "' + civ.name + '".', 'success');
        } else {
          showStatus('Civilization not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to load civilization:', err);
        showStatus('Failed to load civilization: ' + (err.message || err), 'error');
      });
    } else if (action === 'delete') {
      var confirmed = window.confirm('Delete this Civilization?');
      if (!confirmed) {
        return;
      }
      store.deleteCivilizationAsync(id).then(function (removed) {
        if (removed) {
          if (editingOriginalId === id) {
            resetForm(null);
          }
          renderCivTable();
          showStatus('Deleted Civilization.', 'success');
        } else {
          showStatus('Civilization not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to delete civilization:', err);
        showStatus('Failed to delete: ' + (err.message || err), 'error');
      });
    }
  }

  function handleExport() {
    store.getCivilizationsAsync().then(function (civs) {
      jsonArea.value = JSON.stringify(civs, null, 2);
      jsonArea.focus();
      showStatus('Exported ' + civs.length + ' Civilization(s).', 'success');
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
    var confirmed = window.confirm('This will remove all Civilizations. Continue?');
    if (!confirmed) {
      return;
    }
    store.setCivilizationsAsync([]).then(function () {
      resetForm(null);
      renderCivTable();
      showStatus('Cleared all saved Civilizations.', 'success');
    }).catch(function (err) {
      console.error('Failed to clear civilizations:', err);
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
        throw new Error('JSON should describe an array of Civilizations.');
      }
      var seenIds = Object.create(null);
      var civs = parsed.map(function (item) {
        if (!item.id || !item.name) {
          throw new Error('Each civilization must have an id and name.');
        }
        if (seenIds[item.id]) {
          throw new Error('Duplicate ID detected: ' + item.id);
        }
        seenIds[item.id] = true;
        return item;
      });

      store.setCivilizationsAsync(civs).then(function () {
        resetForm(null);
        renderCivTable();
        showStatus('Imported ' + civs.length + ' Civilization(s).', 'success');
      }).catch(function (err) {
        console.error('Failed to save imported civilizations:', err);
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

    // Initialize wonder autocomplete
    if (wonderField && window.CivAutocomplete) {
      wonderAutocomplete = window.CivAutocomplete.create({
        input: wonderField,
        entityType: 'world_wonders',
        placeholder: 'Start typing wonder name...',
        onSelect: function (item) {
          wonderField.setAttribute('data-selected-id', item.id);
          wonderField.setAttribute('data-selected-name', item.name);
        }
      });
    }

    // Initialize unit autocompletes
    if (unitMilitary1Field && window.CivAutocomplete) {
      unitMilitary1Autocomplete = window.CivAutocomplete.create({
        input: unitMilitary1Field,
        entityType: 'units',
        placeholder: 'Start typing unit name...',
        onSelect: function (item) {
          unitMilitary1Field.setAttribute('data-selected-id', item.id);
          unitMilitary1Field.setAttribute('data-selected-name', item.name);
        }
      });
    }
    if (unitMilitary2Field && window.CivAutocomplete) {
      unitMilitary2Autocomplete = window.CivAutocomplete.create({
        input: unitMilitary2Field,
        entityType: 'units',
        placeholder: 'Start typing unit name...',
        onSelect: function (item) {
          unitMilitary2Field.setAttribute('data-selected-id', item.id);
          unitMilitary2Field.setAttribute('data-selected-name', item.name);
        }
      });
    }
    if (unitCivilianField && window.CivAutocomplete) {
      unitCivilianAutocomplete = window.CivAutocomplete.create({
        input: unitCivilianField,
        entityType: 'units',
        placeholder: 'Start typing unit name...',
        onSelect: function (item) {
          unitCivilianField.setAttribute('data-selected-id', item.id);
          unitCivilianField.setAttribute('data-selected-name', item.name);
        }
      });
    }

    // Initialize building autocompletes
    if (buildingField && window.CivAutocomplete) {
      buildingAutocomplete = window.CivAutocomplete.create({
        input: buildingField,
        entityType: 'buildings',
        placeholder: 'Start typing building name...',
        onSelect: function (item) {
          buildingField.setAttribute('data-selected-id', item.id);
          buildingField.setAttribute('data-selected-name', item.name);
        }
      });
    }
    if (quarterBuilding1Field && window.CivAutocomplete) {
      quarterBuilding1Autocomplete = window.CivAutocomplete.create({
        input: quarterBuilding1Field,
        entityType: 'buildings',
        placeholder: 'Start typing building name...',
        onSelect: function (item) {
          quarterBuilding1Field.setAttribute('data-selected-id', item.id);
          quarterBuilding1Field.setAttribute('data-selected-name', item.name);
        }
      });
    }
    if (quarterBuilding2Field && window.CivAutocomplete) {
      quarterBuilding2Autocomplete = window.CivAutocomplete.create({
        input: quarterBuilding2Field,
        entityType: 'buildings',
        placeholder: 'Start typing building name...',
        onSelect: function (item) {
          quarterBuilding2Field.setAttribute('data-selected-id', item.id);
          quarterBuilding2Field.setAttribute('data-selected-name', item.name);
        }
      });
    }

    // Handle Add Effect button
    if (addEffectButton) {
      addEffectButton.addEventListener('click', function () {
        addEffectInput('');
      });
    }

    // Handle Add Civic button
    if (addCivicButton) {
      addCivicButton.addEventListener('click', function () {
        addCivicInput('');
      });
    }

    // Handle building/quarter toggle
    if (isQuarterCheckbox) {
      isQuarterCheckbox.addEventListener('change', toggleBuildingQuarter);
    }

    renderCivTable();
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

