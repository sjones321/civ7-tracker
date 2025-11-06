// CIV7 Tracker - Social Policies Data Editor
// Handles form interactions and data editing for social policies

(function () {
  'use strict';

  console.log('[data-social-policies] Initializing...');

  // DOM Elements
  var form = document.getElementById('policy-form');
  var policyIdField = document.getElementById('policy-id');
  var policyNameField = document.getElementById('policy-name');
  var policyIconField = document.getElementById('policy-icon');
  var policyAgeField = document.getElementById('policy-age');
  var effectsContainer = document.getElementById('policy-effects-container');
  var addEffectButton = document.getElementById('social-policies-add-effect-button');
  var associatedCivField = document.getElementById('policy-associated-civ');
  var associatedLeaderField = document.getElementById('policy-associated-leader');
  var cancelEditButton = document.getElementById('social-policies-cancel-edit');
  var newPolicyButton = document.getElementById('social-policies-new-button');
  var statusRegion = document.getElementById('status-region');
  var statusMessage = document.getElementById('social-policies-status-message');
  var policiesTableBody = document.getElementById('policies-table-body');
  var formHeading = document.getElementById('form-heading');
  var iconPreview = document.getElementById('policy-icon-preview');
  var iconFileField = document.getElementById('policy-icon-file');

  // State
  var isEditMode = false;
  var currentPolicyId = null;
  var associatedCivAutocomplete = null;
  var associatedLeaderAutocomplete = null;
  var selectedAssociatedCivId = null;
  var selectedAssociatedLeaderId = null;
  var effectAutocompletes = [];
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

    // Initialize autocomplete for social policies
    if (window.CivAutocomplete) {
      var autocomplete = window.CivAutocomplete.create({
        input: input,
        entityType: 'social_policies',
        placeholder: 'Start typing policy name...',
        onSelect: function (item) {
          // When a policy is selected, you might want to use its name or ID
          // For now, just let the user type freely and use autocomplete as a helper
        }
      });
      effectAutocompletes.push(autocomplete);
    }

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.className = 'danger';
    removeButton.addEventListener('click', function () {
      effectsContainer.removeChild(row);
      // Remove from autocompletes array
      var index = effectAutocompletes.indexOf(autocomplete);
      if (index > -1) {
        effectAutocompletes.splice(index, 1);
      }
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
      effectAutocompletes = [];
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
    console.log('[data-social-policies] Form submitted');

    var formData = {
      id: policyIdField.value.trim(),
      name: policyNameField.value.trim(),
      iconUrl: policyIconField.value.trim(),
      age: policyAgeField.value.trim(),
      effects: getEffectsArray(),
      associatedCivId: selectedAssociatedCivId,
      associatedLeaderId: selectedAssociatedLeaderId
    };

    console.log('[data-social-policies] Attempting to save policy:', formData);

    if (!validateFormData(formData)) {
      showStatus('Please fill in all required fields (ID, Name).', 'error');
      return;
    }

    window.CivStore.saveSocialPolicyAsync(formData)
      .then(function (saved) {
        showStatus('Saved: ' + saved.name, 'success');
        resetForm();
        return window.CivStore.getSocialPoliciesAsync();
      })
      .then(function (policies) {
        renderPoliciesTable(policies);
      })
      .catch(function (err) {
        console.error('Save failed:', err);
        showStatus('Save failed: ' + err.message, 'error');
      });
  }

  function resetForm() {
    form.reset();
    isEditMode = false;
    currentPolicyId = null;
    formHeading.textContent = 'Add / Edit Social Policy';
    cancelEditButton.style.display = 'none';
    selectedAssociatedCivId = null;
    selectedAssociatedLeaderId = null;
    if (iconFileField) {
      iconFileField.value = '';
    }
    if (associatedCivField) {
      if (associatedCivAutocomplete) {
        associatedCivAutocomplete.setValue('');
      } else {
        associatedCivField.value = '';
        associatedCivField.removeAttribute('data-selected-id');
        associatedCivField.removeAttribute('data-selected-name');
      }
    }
    if (associatedLeaderField) {
      if (associatedLeaderAutocomplete) {
        associatedLeaderAutocomplete.setValue('');
      } else {
        associatedLeaderField.value = '';
        associatedLeaderField.removeAttribute('data-selected-id');
        associatedLeaderField.removeAttribute('data-selected-name');
      }
    }
    clearEffectsContainer();
    addEffectInput('');
    updateIconPreview('');
    showStatus('Ready to add or edit a social policy.', 'info');
  }

  function validateFormData(data) {
    return data.id && data.name;
  }

  function showStatus(message, tone) {
    statusMessage.textContent = message;
    statusRegion.setAttribute('data-tone', tone || 'info');
  }

  function updateIconPreview(iconUrl) {
    if (!iconUrl) {
      iconPreview.innerHTML = '<span>No icon yet.</span>';
      return;
    }
    var img = document.createElement('img');
    img.src = iconUrl;
    img.alt = 'Policy Icon';
    img.onerror = function () {
      iconPreview.innerHTML = '<span style="color:#c62828;">Failed to load icon.</span>';
    };
    iconPreview.innerHTML = '';
    iconPreview.appendChild(img);
  }

  // ========================================
  // TABLE RENDERING
  // ========================================
  function renderPoliciesTable(policies) {
    console.log('[data-social-policies] Rendering', policies.length, 'policies');
    if (!policies || policies.length === 0) {
      policiesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#52606d;">No policies yet. Add one above.</td></tr>';
      return;
    }

    policiesTableBody.innerHTML = '';
    for (var i = 0; i < policies.length; i++) {
      var policy = policies[i];
      var row = document.createElement('tr');

      var nameCell = document.createElement('td');
      nameCell.textContent = policy.name || '—';

      var ageCell = document.createElement('td');
      ageCell.textContent = policy.age || '—';

      var effectsCell = document.createElement('td');
      if (Array.isArray(policy.effects) && policy.effects.length > 0) {
        effectsCell.textContent = policy.effects.length + ' effect(s)';
      } else {
        effectsCell.textContent = '—';
      }

      var associatedCell = document.createElement('td');
      var associations = [];
      if (policy.associatedCivId) associations.push('Civ: ' + policy.associatedCivId);
      if (policy.associatedLeaderId) associations.push('Leader: ' + policy.associatedLeaderId);
      associatedCell.textContent = associations.length > 0 ? associations.join(', ') : '—';

      var actionsCell = document.createElement('td');
      var editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.className = 'secondary';
      editButton.style.marginLeft = '0';
      editButton.addEventListener('click', (function (p) {
        return function () {
          editPolicy(p);
        };
      })(policy));

      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'danger';
      deleteButton.addEventListener('click', (function (p) {
        return function () {
          deletePolicy(p);
        };
      })(policy));

      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);

      row.appendChild(nameCell);
      row.appendChild(ageCell);
      row.appendChild(effectsCell);
      row.appendChild(associatedCell);
      row.appendChild(actionsCell);
      policiesTableBody.appendChild(row);
    }
  }

  // ========================================
  // EDIT / DELETE
  // ========================================
  function editPolicy(policy) {
    console.log('[data-social-policies] Editing policy:', policy);
    isEditMode = true;
    currentPolicyId = policy.id;
    formHeading.textContent = 'Edit Social Policy: ' + policy.name;
    cancelEditButton.style.display = 'inline-block';

    policyIdField.value = policy.id || '';
    policyIdField.disabled = true;
    policyNameField.value = policy.name || '';
    policyIconField.value = policy.iconUrl || '';
    policyAgeField.value = policy.age || '';
    updateIconPreview(policy.iconUrl);

    loadEffectsArray(policy.effects);

    selectedAssociatedCivId = policy.associatedCivId || null;
    selectedAssociatedLeaderId = policy.associatedLeaderId || null;

    if (associatedCivField) {
      if (associatedCivAutocomplete && policy.associatedCivId) {
        associatedCivAutocomplete.setValueById(policy.associatedCivId);
      } else if (associatedCivAutocomplete) {
        associatedCivAutocomplete.setValue('');
      } else {
        associatedCivField.value = '';
        associatedCivField.removeAttribute('data-selected-id');
        associatedCivField.removeAttribute('data-selected-name');
      }
    }

    if (associatedLeaderField) {
      if (associatedLeaderAutocomplete && policy.associatedLeaderId) {
        associatedLeaderAutocomplete.setValueById(policy.associatedLeaderId);
      } else if (associatedLeaderAutocomplete) {
        associatedLeaderAutocomplete.setValue('');
      } else {
        associatedLeaderField.value = '';
        associatedLeaderField.removeAttribute('data-selected-id');
        associatedLeaderField.removeAttribute('data-selected-name');
      }
    }

    showStatus('Editing: ' + policy.name, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deletePolicy(policy) {
    if (!confirm('Delete "' + policy.name + '"? This cannot be undone.')) {
      return;
    }
    console.log('[data-social-policies] Deleting policy:', policy.id);
    window.CivStore.deleteSocialPolicyAsync(policy.id)
      .then(function (success) {
        if (success) {
          showStatus('Deleted: ' + policy.name, 'success');
          if (currentPolicyId === policy.id) {
            resetForm();
          }
          return window.CivStore.getSocialPoliciesAsync();
        } else {
          showStatus('Failed to delete policy.', 'error');
        }
      })
      .then(function (policies) {
        if (policies) {
          renderPoliciesTable(policies);
        }
      })
      .catch(function (err) {
        console.error('Delete failed:', err);
        showStatus('Delete failed: ' + err.message, 'error');
      });
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================
  form.addEventListener('submit', handleFormSubmit);

  cancelEditButton.addEventListener('click', function () {
    resetForm();
  });

  newPolicyButton.addEventListener('click', function () {
    resetForm();
  });

  addEffectButton.addEventListener('click', function () {
    addEffectInput('');
  });

  policyIconField.addEventListener('input', function () {
    updateIconPreview(policyIconField.value.trim());
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
      if (typeof result === 'string' && policyIconField) {
        policyIconField.value = result;
        updateIconPreview(result);
        showStatus('Icon loaded from file.', 'success');
      }
    };
    reader.onerror = function () {
      showStatus('Failed to read icon file.', 'error');
    };
    reader.readAsDataURL(file);
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  function init() {
    console.log('[data-social-policies] Initializing autocompletes and loading data...');

    // Initialize autocomplete for associated civ
    if (window.CivAutocomplete && associatedCivField) {
      associatedCivAutocomplete = window.CivAutocomplete.create({
        input: associatedCivField,
        entityType: 'civilizations',
        onSelect: function (item) {
          selectedAssociatedCivId = item ? item.id : null;
          console.log('[data-social-policies] Associated civ selected:', selectedAssociatedCivId);
        }
      });
    }

    // Initialize autocomplete for associated leader
    if (window.CivAutocomplete && associatedLeaderField) {
      associatedLeaderAutocomplete = window.CivAutocomplete.create({
        input: associatedLeaderField,
        entityType: 'leaders',
        onSelect: function (item) {
          selectedAssociatedLeaderId = item ? item.id : null;
          console.log('[data-social-policies] Associated leader selected:', selectedAssociatedLeaderId);
        }
      });
    }

    // Initialize form with one empty effect input
    addEffectInput('');

    // Load and render policies
    window.CivStore.getSocialPoliciesAsync()
      .then(function (policies) {
        renderPoliciesTable(policies);
        showStatus('Loaded ' + policies.length + ' social policies.', 'success');
      })
      .catch(function (err) {
        console.error('[data-social-policies] Failed to load policies:', err);
        showStatus('Failed to load policies: ' + err.message, 'error');
        policiesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#c62828;">Error loading data.</td></tr>';
      });
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


