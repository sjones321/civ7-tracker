(function () {
  'use strict';

  var store = window.CivStore;
  var form = document.getElementById('wonder-form');
  var statusEl = document.getElementById('status-message');
  var tableBody = document.getElementById('wonders-table-body');
  var newButton = document.getElementById('new-wonder');
  var exportButton = document.getElementById('export-button');
  var importButton = document.getElementById('import-button');
  var jsonArea = document.getElementById('json-data');
  var historyList = document.getElementById('ownership-history');
  var summaryBody = document.getElementById('ownership-summary-body');
  var resetButton = document.getElementById('reset-form');
  var bonusField = document.getElementById('wonder-bonus');

  var ownerOptions = ['Tiny', 'Steve', 'AI'];
  var editingOriginalId = null;
  var currentHistory = [];

  function showStatus(message, tone) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.setAttribute('data-tone', tone || 'info');
  }

  function applyIconPlaceholders(value) {
    if (!value) {
      return '';
    }
    var map = {
      food: '[food]',
      production: '[production]',
      culture: '[culture]',
      science: '[science]'
    };
    return value.replace(/\b(food|production|culture|science)\b/gi, function (match) {
      var key = match.toLowerCase();
      return map[key] || match;
    });
  }

  function applyIconToElement(target, iconValue) {
    if (!target) {
      return;
    }
    target.textContent = '';
    var resolved = null;
    if (window.CivIconLibrary) {
      if (typeof window.CivIconLibrary.render === 'function') {
        resolved = window.CivIconLibrary.render(iconValue);
      } else if (typeof window.CivIconLibrary.getIcon === 'function') {
        resolved = window.CivIconLibrary.getIcon(iconValue);
      }
    }

    if (resolved && typeof resolved === 'object' && typeof resolved.nodeType === 'number') {
      target.appendChild(resolved);
      return;
    }
    if (typeof resolved === 'string' && resolved) {
      target.textContent = resolved;
      return;
    }
    if (iconValue) {
      target.textContent = iconValue;
    } else {
      target.textContent = '🏛️';
    }
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
      item.textContent = entry.owner + ' — ' + entry.timestamp;
      historyList.appendChild(item);
    });
  }

  function renderOwnershipSummary(wonders) {
    if (!summaryBody) {
      return;
    }
    var counts = {
      Tiny: 0,
      Steve: 0,
      AI: 0
    };

    wonders.forEach(function (wonder) {
      if (counts.hasOwnProperty(wonder.owner)) {
        counts[wonder.owner] += 1;
      }
    });

    summaryBody.innerHTML = '';
    ownerOptions.forEach(function (owner) {
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
    var wonders = store.getWorldWonders();
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

        var eraCell = document.createElement('td');
        eraCell.textContent = wonder.era;

        var ownerCell = document.createElement('td');
        ownerCell.textContent = wonder.owner;

        var bigTicketCell = document.createElement('td');
        bigTicketCell.textContent = wonder.bigTicket ? 'Yes' : 'No';

        var actionsCell = document.createElement('td');
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon-display';
        applyIconToElement(iconSpan, wonder.icon || '');
        iconSpan.setAttribute('aria-label', 'Icon placeholder for ' + wonder.name);

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
        row.appendChild(eraCell);
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
    if (wonder) {
      editingOriginalId = wonder.id;
      currentHistory = Array.isArray(wonder.ownershipHistory) ? wonder.ownershipHistory.slice() : [];
      form.elements.id.value = wonder.id;
      form.elements.name.value = wonder.name || '';
      form.elements.era.value = wonder.era || '';
      form.elements.icon.value = wonder.icon || '';
      form.elements.bonus.value = wonder.bonus || '';
      form.elements.owner.value = wonder.owner || '';
      form.elements.bigTicket.checked = Boolean(wonder.bigTicket);
      showStatus('Editing "' + wonder.name + '".', 'info');
    } else {
      showStatus('Ready to add a new World Wonder.', 'info');
      if (form.elements.owner) {
        form.elements.owner.selectedIndex = 0;
      }
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
    if (!data.era) {
      return 'An era is required.';
    }
    if (!data.owner) {
      return 'Please choose an owner.';
    }
    if (ownerOptions.indexOf(data.owner) === -1) {
      return 'Owner must be Tiny, Steve, or AI.';
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

    var wonders = store.getWorldWonders();
    var formData = {
      id: form.elements.id.value.trim(),
      name: form.elements.name.value.trim(),
      era: form.elements.era.value.trim(),
      icon: form.elements.icon.value.trim(),
      bonus: form.elements.bonus.value.trim(),
      owner: form.elements.owner.value,
      bigTicket: form.elements.bigTicket.checked
    };

    var error = validateFormData(formData, wonders);
    if (error) {
      showStatus(error, 'error');
      return;
    }

    formData.bonus = applyIconPlaceholders(formData.bonus);

    var history = [];
    var now = new Date().toISOString();

    if (editingOriginalId) {
      var original = store.getWorldWonderById(editingOriginalId);
      history = original && Array.isArray(original.ownershipHistory)
        ? original.ownershipHistory.slice()
        : [];
      if (!history.length && formData.owner) {
        history.push({ owner: formData.owner, timestamp: now });
      } else if (history.length && history[history.length - 1].owner !== formData.owner) {
        history.push({ owner: formData.owner, timestamp: now });
      }
    } else {
      if (formData.owner) {
        history.push({ owner: formData.owner, timestamp: now });
      }
    }

    formData.ownershipHistory = history;

    var savedWonder = store.saveWorldWonder(formData);

    if (editingOriginalId && editingOriginalId !== savedWonder.id) {
      store.deleteWorldWonder(editingOriginalId);
    }

    editingOriginalId = savedWonder.id;
    currentHistory = savedWonder.ownershipHistory ? savedWonder.ownershipHistory.slice() : [];

    renderWonderTable();
    renderOwnershipHistory(currentHistory);
    showStatus('Saved "' + savedWonder.name + '".', 'success');
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
      var wonder = store.getWorldWonderById(id);
      if (wonder) {
        resetForm(wonder);
      }
    } else if (action === 'delete') {
      var confirmed = window.confirm('Delete this World Wonder?');
      if (!confirmed) {
        return;
      }
      var removed = store.deleteWorldWonder(id);
      if (removed) {
        if (editingOriginalId === id) {
          resetForm(null);
        }
        renderWonderTable();
        showStatus('Deleted World Wonder.', 'success');
      }
    }
  }

  function handleExport() {
    var wonders = store.getWorldWonders();
    jsonArea.value = JSON.stringify(wonders, null, 2);
    jsonArea.focus();
    showStatus('Exported ' + wonders.length + ' World Wonder(s).', 'success');
  }

  function normalizeImportedWonder(item) {
    var normalized = {
      id: (item.id || '').trim(),
      name: (item.name || '').trim(),
      era: (item.era || '').trim(),
      icon: (item.icon || '').trim(),
      bonus: applyIconPlaceholders((item.bonus || '').trim()),
      owner: (item.owner || '').trim(),
      bigTicket: Boolean(item.bigTicket)
    };

    if (!normalized.id || !normalized.name || !normalized.era) {
      throw new Error('Imported items must include id, name, and era.');
    }
    if (ownerOptions.indexOf(normalized.owner) === -1) {
      throw new Error('Imported owner must be Tiny, Steve, or AI.');
    }

    var history = Array.isArray(item.ownershipHistory) ? item.ownershipHistory.slice() : [];
    normalized.ownershipHistory = history
      .filter(function (entry) {
        return entry && entry.owner && entry.timestamp;
      })
      .map(function (entry) {
        return {
          owner: entry.owner,
          timestamp: entry.timestamp
        };
      });

    if (!normalized.ownershipHistory.length) {
      normalized.ownershipHistory.push({ owner: normalized.owner, timestamp: new Date().toISOString() });
    }

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
        return normalized;
      });

      store.setWorldWonders(wonders);
      resetForm(null);
      renderWonderTable();
      showStatus('Imported ' + wonders.length + ' World Wonder(s).', 'success');
    } catch (err) {
      console.error(err);
      showStatus('Import failed: ' + err.message, 'error');
    }
  }

  function init() {
    if (!form || !tableBody || !newButton || !exportButton || !importButton || !jsonArea) {
      return;
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
    if (bonusField) {
      bonusField.addEventListener('input', function () {
        var field = bonusField;
        var caret = field.selectionStart;
        var original = field.value;
        var replaced = applyIconPlaceholders(original);
        if (replaced !== original) {
          var beforeCaret = original.slice(0, caret);
          var replacedBeforeCaret = applyIconPlaceholders(beforeCaret);
          var newCaret = replacedBeforeCaret.length;
          field.value = replaced;
          if (typeof field.setSelectionRange === 'function') {
            field.setSelectionRange(newCaret, newCaret);
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
