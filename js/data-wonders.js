(function () {
  'use strict';

  var store = window.CivStore;
  var form = document.getElementById('wonder-form');
  var statusEl = document.getElementById('status-message');
  var tableBody = document.getElementById('wonders-table-body');
  var newButton = document.getElementById('new-wonder');
  var exportButton = document.getElementById('export-button');
  var importButton = document.getElementById('import-button');
  var loadSampleButton = document.getElementById('load-sample');
  var clearAllButton = document.getElementById('clear-all');
  var jsonArea = document.getElementById('json-data');
  var historyList = document.getElementById('ownership-history');
  var summaryBody = document.getElementById('ownership-summary-body');
  var resetButton = document.getElementById('reset-form');
  var bonusField = document.getElementById('wonder-bonus');
  var ageSelect = document.getElementById('wonder-age');
  var iconUrlField = document.getElementById('wonder-icon-url');
  var iconFileField = document.getElementById('wonder-icon-file');
  var iconPreview = document.getElementById('wonder-icon-preview');
  var ownerTypeField = document.getElementById('wonder-owner-type');
  var ownerLeaderField = document.getElementById('wonder-owner-leader');
  var ownerCivField = document.getElementById('wonder-owner-civ');
  var logOwnerButton = document.getElementById('log-owner');
  
  // Autocomplete instances (will be created in init)
  var leaderAutocomplete = null;
  var civAutocomplete = null;

  var ownerTypes = ['Tiny', 'Steve', 'AI'];
  var DEFAULT_AGES = ['Antiquity', 'Exploration', 'Modern'];
  var ageOptions = DEFAULT_AGES.slice();
  var editingOriginalId = null;
  var currentHistory = [];

  function showStatus(message, tone) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.setAttribute('data-tone', tone || 'info');
  }

  function refreshAgeSelect(selectedValue) {
    if (!ageSelect) {
      return;
    }

    var desiredValue = typeof selectedValue === 'string' ? selectedValue : ageSelect.value;

    while (ageSelect.firstChild) {
      ageSelect.removeChild(ageSelect.firstChild);
    }

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.textContent = 'Select age';
    placeholder.defaultSelected = true;
    ageSelect.appendChild(placeholder);

    ageOptions.forEach(function (age) {
      var option = document.createElement('option');
      option.value = age;
      option.textContent = age;
      ageSelect.appendChild(option);
    });

    if (desiredValue && ageOptions.indexOf(desiredValue) === -1) {
      var extraOption = document.createElement('option');
      extraOption.value = desiredValue;
      extraOption.textContent = desiredValue;
      ageSelect.appendChild(extraOption);
    }

    if (desiredValue) {
      ageSelect.value = desiredValue;
      if (ageSelect.value !== desiredValue) {
        placeholder.selected = true;
      }
    } else {
      placeholder.selected = true;
    }
  }

  function ensureAgeOption(age) {
    if (!age) {
      return;
    }
    if (ageOptions.indexOf(age) === -1) {
      ageOptions.push(age);
    }
  }

  function loadAgeOptions() {
    if (!window.fetch) {
      refreshAgeSelect();
      return;
    }
    window.fetch('docs/data/enums.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (data && Array.isArray(data.ages) && data.ages.length) {
          ageOptions = data.ages.slice();
          refreshAgeSelect();
        }
      })
      .catch(function () {
        refreshAgeSelect();
      });
  }

  function applyIconPlaceholders(value) {
    if (!value) {
      return '';
    }
    // If value already contains bracketed versions, don't process again
    // Check if any yield keywords are already in bracket format
    if (/\[(food|production|culture|science)\]/gi.test(value)) {
      // Already has bracketed keywords, just return as-is
      return value;
    }
    
    var map = {
      food: '[food]',
      production: '[production]',
      culture: '[culture]',
      science: '[science]'
    };
    // Replace plain words with bracketed versions
    return value.replace(/\b(food|production|culture|science)\b/gi, function (match) {
      var key = match.toLowerCase();
      return map[key] || match;
    });
  }

  function updateIconPreview(url) {
    if (!iconPreview) {
      return;
    }
    iconPreview.innerHTML = '';
    if (url) {
      var img = document.createElement('img');
      img.src = url;
      img.alt = 'Wonder icon preview';
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
      image.alt = (name || 'Wonder') + ' icon';
      image.loading = 'lazy';
      image.decoding = 'async';
      target.appendChild(image);
    } else {
      target.textContent = '🏛️';
    }
  }

  function formatOwnerLabel(ownerType, ownerLeader, ownerCiv) {
    var parts = [];
    if (ownerType) {
      parts.push(ownerType);
    }
    if (ownerLeader) {
      parts.push(ownerLeader);
    }
    if (ownerCiv) {
      parts.push(ownerCiv);
    }
    return parts.join(' · ');
  }

  function normalizeHistoryEntries(history, fallbackType, fallbackLeader, fallbackCiv) {
    var list = Array.isArray(history) ? history : [];
    var result = [];
    for (var i = 0; i < list.length; i += 1) {
      var entry = list[i];
      if (!entry || !entry.timestamp) {
        continue;
      }
      var type = (entry.ownerType || entry.owner || '').trim();
      var leader = (entry.ownerLeader || entry.leader || '').trim();
      var civ = (entry.ownerCiv || entry.civ || '').trim();
      if (!type && fallbackType) {
        type = fallbackType;
      }
      if (!type) {
        continue;
      }
      if (ownerTypes.indexOf(type) === -1) {
        continue;
      }
      result.push({
        ownerType: type,
        ownerLeader: leader || fallbackLeader || '',
        ownerCiv: civ || fallbackCiv || '',
        timestamp: entry.timestamp
      });
    }
    return result;
  }

  function migrateWorldWonder(wonder) {
    var next = wonder ? JSON.parse(JSON.stringify(wonder)) : {};
    var changed = false;

    if (next.era && !next.age) {
      next.age = next.era;
      changed = true;
    }
    if (typeof next.era !== 'undefined') {
      delete next.era;
      changed = true;
    }

    if (next.icon && !next.iconUrl) {
      next.iconUrl = next.icon;
      changed = true;
    }
    if (typeof next.icon !== 'undefined') {
      delete next.icon;
      changed = true;
    }

    if (next.owner && !next.ownerType) {
      next.ownerType = next.owner;
      changed = true;
    }
    if (typeof next.owner !== 'undefined') {
      delete next.owner;
      changed = true;
    }

    var trimmedAge = typeof next.age === 'string' ? next.age.trim() : '';
    if (trimmedAge !== (next.age || '')) {
      changed = true;
    }
    next.age = trimmedAge;

    var trimmedIcon = typeof next.iconUrl === 'string' ? next.iconUrl.trim() : '';
    if (trimmedIcon !== (next.iconUrl || '')) {
      changed = true;
    }
    next.iconUrl = trimmedIcon;

    var trimmedOwnerType = typeof next.ownerType === 'string' ? next.ownerType.trim() : '';
    if (trimmedOwnerType && ownerTypes.indexOf(trimmedOwnerType) === -1) {
      trimmedOwnerType = '';
    }
    if (trimmedOwnerType !== (next.ownerType || '')) {
      changed = true;
    }
    next.ownerType = trimmedOwnerType;

    var trimmedLeader = typeof next.ownerLeader === 'string' ? next.ownerLeader.trim() : '';
    if (trimmedLeader !== (next.ownerLeader || '')) {
      changed = true;
    }
    next.ownerLeader = trimmedLeader;

    var trimmedCiv = typeof next.ownerCiv === 'string' ? next.ownerCiv.trim() : '';
    if (trimmedCiv !== (next.ownerCiv || '')) {
      changed = true;
    }
    next.ownerCiv = trimmedCiv;

    var normalizedHistory = normalizeHistoryEntries(
      next.ownershipHistory,
      next.ownerType,
      next.ownerLeader,
      next.ownerCiv
    );
    if (JSON.stringify(normalizedHistory) !== JSON.stringify(Array.isArray(next.ownershipHistory) ? next.ownershipHistory : [])) {
      changed = true;
    }
    next.ownershipHistory = normalizedHistory;

    return { value: next, changed: changed };
  }

  function migrateStoredWonders() {
    // Migration is async now - load from Supabase
    store.getWorldWondersAsync().then(function (wonders) {
      var updated = [];
      var hasChanges = false;
      for (var i = 0; i < wonders.length; i += 1) {
        var migrated = migrateWorldWonder(wonders[i]);
        if (migrated.changed) {
          hasChanges = true;
        }
        updated.push(migrated.value);
      }
      if (hasChanges) {
        store.setWorldWondersAsync(updated).catch(function (err) {
          console.warn('Migration save failed (non-critical):', err);
        });
      }
    }).catch(function (err) {
      console.warn('Migration load failed (non-critical):', err);
      // If migration fails, just continue - not critical
    });
  }

  function renderOwnershipHistory(history) {
    if (!historyList) {
      return;
    }
    historyList.innerHTML = '';
    if (!history || !history.length) {
      var emptyItem = document.createElement('li');
      emptyItem.textContent = 'No ownership changes recorded yet.';
      historyList.appendChild(emptyItem);
      return;
    }

    history.forEach(function (entry) {
      var item = document.createElement('li');
      var label = formatOwnerLabel(entry.ownerType, entry.ownerLeader, entry.ownerCiv);
      item.textContent = (label || 'Unknown owner') + ' — ' + entry.timestamp;
      historyList.appendChild(item);
    });
  }

  function renderOwnershipSummary(wonders) {
    if (!summaryBody) {
      return;
    }
    var counts = { Tiny: 0, Steve: 0, AI: 0 };

    wonders.forEach(function (wonder) {
      if (counts.hasOwnProperty(wonder.ownerType)) {
        counts[wonder.ownerType] += 1;
      }
    });

    summaryBody.innerHTML = '';
    ownerTypes.forEach(function (owner) {
      var row = document.createElement('tr');
      var ownerCell = document.createElement('th');
      ownerCell.scope = 'row';
      ownerCell.textContent = owner;
      var countCell = document.createElement('td');
      countCell.textContent = String(counts[owner] || 0);
      row.appendChild(ownerCell);
      row.appendChild(countCell);
      summaryBody.appendChild(row);
    });
  }

  function renderWonderTable() {
    // Use async version to get fresh data
    store.getWorldWondersAsync().then(function (wonders) {
      renderWonderTableWithData(wonders);
    }).catch(function (err) {
      console.error('Failed to load wonders:', err);
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
      emptyCell.textContent = 'No World Wonders saved yet.';
      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
    } else {
      wonders.forEach(function (wonder) {
        var row = document.createElement('tr');

        var nameCell = document.createElement('th');
        nameCell.scope = 'row';
        nameCell.textContent = wonder.name;

        var ageCell = document.createElement('td');
        ageCell.textContent = wonder.age || '—';

        var ownerCell = document.createElement('td');
        ownerCell.textContent = formatOwnerLabel(wonder.ownerType, wonder.ownerLeader, wonder.ownerCiv) || '—';

        var bigTicketCell = document.createElement('td');
        bigTicketCell.textContent = wonder.bigTicket ? 'Yes' : 'No';

        var actionsCell = document.createElement('td');
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon-display';
        appendIconPreview(iconSpan, wonder.iconUrl || '', wonder.name || 'Wonder');
        iconSpan.setAttribute('aria-label', 'Icon preview for ' + (wonder.name || 'wonder'));

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
        row.appendChild(ageCell);
        row.appendChild(ownerCell);
        row.appendChild(bigTicketCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
      });
    }

    renderOwnershipSummary(wonders);
  }

  function resetForm(wonder) {
    form.reset();
    editingOriginalId = null;
    currentHistory = [];
    refreshAgeSelect();
    if (iconFileField) {
      iconFileField.value = '';
    }
    if (wonder) {
      editingOriginalId = wonder.id;
      currentHistory = Array.isArray(wonder.ownershipHistory) ? wonder.ownershipHistory.slice() : [];
      form.elements.id.value = wonder.id;
      form.elements.name.value = wonder.name || '';
      ensureAgeOption(wonder.age);
      refreshAgeSelect(wonder.age || '');
      if (ageSelect) {
        ageSelect.value = wonder.age || '';
        if (!ageSelect.value) {
          ageSelect.selectedIndex = 0;
        }
      }
      if (iconUrlField) {
        iconUrlField.value = wonder.iconUrl || '';
        updateIconPreview(wonder.iconUrl || '');
      }
      if (bonusField) {
        bonusField.value = wonder.bonus || '';
      }
      if (ownerTypeField) {
        ownerTypeField.value = wonder.ownerType || '';
        if (!ownerTypeField.value) {
          ownerTypeField.selectedIndex = 0;
        }
      }
      if (ownerLeaderField && leaderAutocomplete && wonder.ownerLeader) {
        // Use autocomplete to load and display the leader name by ID
        leaderAutocomplete.setValueById(wonder.ownerLeader);
      } else if (ownerLeaderField) {
        ownerLeaderField.value = wonder.ownerLeader || '';
        ownerLeaderField.removeAttribute('data-selected-id');
        ownerLeaderField.removeAttribute('data-selected-name');
      }
      if (ownerCivField && civAutocomplete && wonder.ownerCiv) {
        // Use autocomplete to load and display the civ name by ID
        civAutocomplete.setValueById(wonder.ownerCiv);
      } else if (ownerCivField) {
        ownerCivField.value = wonder.ownerCiv || '';
        ownerCivField.removeAttribute('data-selected-id');
        ownerCivField.removeAttribute('data-selected-name');
      }
      form.elements.bigTicket.checked = Boolean(wonder.bigTicket);
      showStatus('Editing "' + wonder.name + '".', 'info');
    } else {
      if (ageSelect) {
        ageSelect.selectedIndex = 0;
      }
      if (iconUrlField) {
        iconUrlField.value = '';
        updateIconPreview('');
      }
      if (ownerTypeField) {
        ownerTypeField.selectedIndex = 0;
      }
      if (ownerLeaderField) {
        ownerLeaderField.value = '';
        ownerLeaderField.removeAttribute('data-selected-id');
        ownerLeaderField.removeAttribute('data-selected-name');
      }
      if (ownerCivField) {
        ownerCivField.value = '';
        ownerCivField.removeAttribute('data-selected-id');
        ownerCivField.removeAttribute('data-selected-name');
      }
      if (bonusField) {
        bonusField.value = '';
      }
      showStatus('Ready to add a new World Wonder.', 'info');
    }
    renderOwnershipHistory(currentHistory);
  }

  function validateFormData(data, wonders) {
    if (!data.id) {
      return 'An ID is required.';
    }
    if (!data.name) {
      return 'A name is required.';
    }
    if (!data.age) {
      return 'An age is required.';
    }
    if (!data.ownerType) {
      return 'Please choose an owner type.';
    }
    if (ownerTypes.indexOf(data.ownerType) === -1) {
      return 'Owner type must be Tiny, Steve, or AI.';
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

    // Get wonders async first for validation
    store.getWorldWondersAsync().then(function (wonders) {
      // Get selected IDs from autocomplete if available, otherwise use typed value
      var selectedLeaderId = ownerLeaderField ? (ownerLeaderField.getAttribute('data-selected-id') || ownerLeaderField.value.trim()) : '';
      var selectedCivId = ownerCivField ? (ownerCivField.getAttribute('data-selected-id') || ownerCivField.value.trim()) : '';

      var formData = {
        id: form.elements.id.value.trim(),
        name: form.elements.name.value.trim(),
        age: ageSelect ? ageSelect.value : '',
        iconUrl: iconUrlField ? iconUrlField.value.trim() : '',
        bonus: form.elements.bonus.value.trim(),
        ownerType: ownerTypeField ? ownerTypeField.value : '',
        ownerLeader: selectedLeaderId, // Use ID from autocomplete or typed value
        ownerCiv: selectedCivId, // Use ID from autocomplete or typed value
        bigTicket: form.elements.bigTicket.checked
      };

      var error = validateFormData(formData, wonders);
      if (error) {
        showStatus(error, 'error');
        return;
      }

      formData.bonus = applyIconPlaceholders(formData.bonus);
      if (bonusField) {
        bonusField.value = formData.bonus;
      }

      var history = currentHistory.slice();
      var now = new Date().toISOString();
      var snapshot = {
        ownerType: formData.ownerType,
        ownerLeader: formData.ownerLeader,
        ownerCiv: formData.ownerCiv,
        timestamp: now
      };

      var lastEntry = history.length ? history[history.length - 1] : null;
      if (
        !lastEntry ||
        lastEntry.ownerType !== snapshot.ownerType ||
        lastEntry.ownerLeader !== snapshot.ownerLeader ||
        lastEntry.ownerCiv !== snapshot.ownerCiv
      ) {
        history.push(snapshot);
      }

      formData.ownershipHistory = history;

      // Save async and handle the promise
      store.saveWorldWonderAsync(formData).then(function (savedWonder) {
        if (!savedWonder || !savedWonder.id) {
          showStatus('Failed to save wonder.', 'error');
          return;
        }

        if (editingOriginalId && editingOriginalId !== savedWonder.id) {
          store.deleteWorldWonderAsync(editingOriginalId).catch(function (err) {
            console.warn('Failed to delete old wonder:', err);
          });
        }

        editingOriginalId = savedWonder.id;
        currentHistory = savedWonder.ownershipHistory ? savedWonder.ownershipHistory.slice() : [];

        ensureAgeOption(savedWonder.age);
        renderWonderTable();
        renderOwnershipHistory(currentHistory);
        showStatus('Saved "' + (savedWonder.name || 'wonder') + '".', 'success');
      }).catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Failed to save: ' + (err.message || err), 'error');
      });
    }).catch(function (err) {
      console.error('Failed to load wonders for validation:', err);
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
      // Show loading state
      showStatus('Loading wonder details...', 'info');
      store.getWorldWonderByIdAsync(id).then(function (wonder) {
        if (wonder) {
          resetForm(wonder);
          showStatus('Loaded "' + wonder.name + '".', 'success');
        } else {
          showStatus('Wonder not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to load wonder:', err);
        showStatus('Failed to load wonder: ' + (err.message || err), 'error');
      });
    } else if (action === 'delete') {
      var confirmed = window.confirm('Delete this World Wonder?');
      if (!confirmed) {
        return;
      }
      store.deleteWorldWonderAsync(id).then(function (removed) {
        if (removed) {
          if (editingOriginalId === id) {
            resetForm(null);
          }
          renderWonderTable();
          showStatus('Deleted World Wonder.', 'success');
        } else {
          showStatus('Wonder not found.', 'error');
        }
      }).catch(function (err) {
        console.error('Failed to delete wonder:', err);
        showStatus('Failed to delete: ' + (err.message || err), 'error');
      });
    }
  }

  function handleExport() {
    store.getWorldWondersAsync().then(function (wonders) {
      jsonArea.value = JSON.stringify(wonders, null, 2);
      jsonArea.focus();
      showStatus('Exported ' + wonders.length + ' World Wonder(s).', 'success');
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

  function logCurrentOwnerSnapshot() {
    if (!ownerTypeField) {
      return;
    }
    var ownerType = ownerTypeField.value;
    if (!ownerType) {
      showStatus('Select an owner type before logging history.', 'error');
      return;
    }
    if (ownerTypes.indexOf(ownerType) === -1) {
      showStatus('Owner type must be Tiny, Steve, or AI.', 'error');
      return;
    }
    var entry = {
      ownerType: ownerType,
      ownerLeader: ownerLeaderField ? ownerLeaderField.value.trim() : '',
      ownerCiv: ownerCivField ? ownerCivField.value.trim() : '',
      timestamp: new Date().toISOString()
    };
    currentHistory = currentHistory.slice();
    currentHistory.push(entry);
    renderOwnershipHistory(currentHistory);
    showStatus('Logged current owner snapshot.', 'success');
  }

  function handleClearAll() {
    var confirmed = window.confirm('This will remove all World Wonders. Continue?');
    if (!confirmed) {
      return;
    }
    store.setWorldWondersAsync([]).then(function () {
      currentHistory = [];
      resetForm(null);
      renderWonderTable();
      showStatus('Cleared all saved World Wonders.', 'success');
    }).catch(function (err) {
      console.error('Failed to clear wonders:', err);
      showStatus('Failed to clear: ' + (err.message || err), 'error');
    });
  }

  function handleLoadSample() {
    if (!window.fetch) {
      showStatus('Sample loading requires fetch support.', 'error');
      return;
    }
    window.fetch('docs/data/worldWonders-sample.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) {
          throw new Error('Sample JSON must be an array.');
        }
        var seenIds = Object.create(null);
        var wonders = data.map(function (item) {
          var normalized = normalizeImportedWonder(item);
          if (seenIds[normalized.id]) {
            throw new Error('Duplicate ID detected: ' + normalized.id);
          }
          seenIds[normalized.id] = true;
          ensureAgeOption(normalized.age);
          return normalized;
        });
        store.setWorldWondersAsync(wonders).then(function () {
          resetForm(null);
          renderWonderTable();
          refreshAgeSelect();
          showStatus('Loaded sample World Wonders.', 'success');
        }).catch(function (err) {
          console.error('Failed to save sample wonders:', err);
          showStatus('Failed to load sample: ' + (err.message || err), 'error');
        });
      })
      .catch(function (err) {
        console.error(err);
        showStatus('Failed to load sample data: ' + err.message, 'error');
      });
  }

  function normalizeImportedWonder(item) {
    var normalized = {
      id: (item.id || '').trim(),
      name: (item.name || '').trim(),
      age: ((item.age || item.era || '')).trim(),
      iconUrl: ((item.iconUrl || item.icon || '')).trim(),
      bonus: applyIconPlaceholders((item.bonus || '').trim()),
      ownerType: ((item.ownerType || item.owner || '')).trim(),
      ownerLeader: (item.ownerLeader || item.leader || '').trim(),
      ownerCiv: (item.ownerCiv || item.civ || '').trim(),
      bigTicket: Boolean(item.bigTicket)
    };

    if (!normalized.id || !normalized.name || !normalized.age) {
      throw new Error('Imported items must include id, name, and age.');
    }
    if (ownerTypes.indexOf(normalized.ownerType) === -1) {
      throw new Error('Imported owner type must be Tiny, Steve, or AI.');
    }

    var history = normalizeHistoryEntries(
      item.ownershipHistory,
      normalized.ownerType,
      normalized.ownerLeader,
      normalized.ownerCiv
    );

    if (!history.length) {
      history.push({
        ownerType: normalized.ownerType,
        ownerLeader: normalized.ownerLeader,
        ownerCiv: normalized.ownerCiv,
        timestamp: new Date().toISOString()
      });
    }

    normalized.ownershipHistory = history;

    return normalized;
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
        throw new Error('JSON should describe an array of World Wonders.');
      }
      var seenIds = Object.create(null);
      var wonders = parsed.map(function (item) {
        var normalized = normalizeImportedWonder(item);
        if (seenIds[normalized.id]) {
          throw new Error('Duplicate ID detected: ' + normalized.id);
        }
        seenIds[normalized.id] = true;
        ensureAgeOption(normalized.age);
        return normalized;
      });

      store.setWorldWondersAsync(wonders).then(function () {
        resetForm(null);
        renderWonderTable();
        refreshAgeSelect();
        showStatus('Imported ' + wonders.length + ' World Wonder(s).', 'success');
      }).catch(function (err) {
        console.error('Failed to save imported wonders:', err);
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

    // Initialize autocomplete for Owner Leader and Owner Civ fields FIRST
    // (needed for resetForm to use them)
    if (ownerLeaderField && window.CivAutocomplete) {
      leaderAutocomplete = window.CivAutocomplete.create({
        input: ownerLeaderField,
        entityType: 'leaders',
        placeholder: 'Start typing leader name...',
        onSelect: function (item) {
          // Store the selected leader ID in a data attribute for form submission
          ownerLeaderField.setAttribute('data-selected-id', item.id);
          ownerLeaderField.setAttribute('data-selected-name', item.name);
        }
      });
    }
    if (ownerCivField && window.CivAutocomplete) {
      civAutocomplete = window.CivAutocomplete.create({
        input: ownerCivField,
        entityType: 'civilizations',
        placeholder: 'Start typing civilization name...',
        onSelect: function (item) {
          // Store the selected civ ID in a data attribute for form submission
          ownerCivField.setAttribute('data-selected-id', item.id);
          ownerCivField.setAttribute('data-selected-name', item.name);
        }
      });
    }

    migrateStoredWonders();
    refreshAgeSelect();
    loadAgeOptions();
    // Load wonders from Supabase on page load
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
    if (bonusField) {
      bonusField.addEventListener('blur', function () {
        var original = bonusField.value.trim();
        var replaced = applyIconPlaceholders(original);
        if (replaced !== original) {
          bonusField.value = replaced;
        }
      });
    }
    if (iconUrlField) {
      iconUrlField.addEventListener('input', handleIconUrlInput);
    }
    if (iconFileField) {
      iconFileField.addEventListener('change', handleIconFileChange);
    }
    if (logOwnerButton) {
      logOwnerButton.addEventListener('click', logCurrentOwnerSnapshot);
    }
    if (loadSampleButton) {
      loadSampleButton.addEventListener('click', handleLoadSample);
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
