// CIV7 Tracker - Autocomplete Component
//
// Reusable autocomplete/filterable input component for database entities
// Works with Supabase to provide as-you-type filtering
//
// Usage:
//   var autocomplete = window.CivAutocomplete.create({
//     input: document.getElementById('my-input'),
//     entityType: 'civilizations', // or 'leaders', 'technologies', etc.
//     displayField: 'name', // field to show in dropdown
//     valueField: 'id', // field to use as value
//     onSelect: function(item) { console.log('Selected:', item); }
//   });

(function (global) {
  'use strict';
  
  console.log('[autocomplete] Script loading...');

  // Entity type configuration - maps to Supabase table names and field names
  var ENTITY_CONFIG = {
    civilizations: {
      table: 'civilizations',
      displayField: 'name',
      valueField: 'id',
      searchField: 'name'
    },
    leaders: {
      table: 'leaders',
      displayField: 'name',
      valueField: 'id',
      searchField: 'name'
    },
    technologies: {
      table: 'technologies',
      displayField: 'name',
      valueField: 'id',
      searchField: 'name'
    },
    civics: {
      table: 'civics',
      displayField: 'name',
      valueField: 'id',
      searchField: 'name'
    },
    mementos: {
      table: 'mementos',
      displayField: 'name',
      valueField: 'id',
      searchField: 'name'
    }
  };

  // Check for Supabase
  function checkSupabase() {
    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
      console.error('[autocomplete] Supabase library not found');
      return false;
    }
    if (!global.SupabaseConfig || !global.SupabaseConfig.url || !global.SupabaseConfig.anonKey) {
      console.error('[autocomplete] Supabase config not found');
      return false;
    }
    return true;
  }

  // Get Supabase client (reuse existing one from store-supabase.js if available)
  function getSupabaseClient() {
    // Try to use shared client first (from store-supabase.js)
    if (global.supabaseClient) {
      return global.supabaseClient;
    }
    // Fallback: create our own client
    if (checkSupabase()) {
      return global.supabase.createClient(
        global.SupabaseConfig.url,
        global.SupabaseConfig.anonKey
      );
    }
    return null;
  }

  // Fetch items from Supabase with search filter
  function fetchItems(entityType, searchTerm, callback) {
    var config = ENTITY_CONFIG[entityType];
    if (!config) {
      console.error('[autocomplete] Unknown entity type:', entityType);
      callback([]);
      return;
    }

    var client = getSupabaseClient();
    if (!client) {
      console.error('[autocomplete] Supabase client not available');
      callback([]);
      return;
    }

    var query = client
      .from(config.table)
      .select('*')
      .order(config.displayField, { ascending: true })
      .limit(20); // Limit results for performance

    // Add search filter if search term provided
    if (searchTerm && searchTerm.trim().length > 0) {
      // Use ilike for case-insensitive partial matching
      query = query.ilike(config.searchField, '%' + searchTerm.trim() + '%');
    }

    console.log('[autocomplete] Fetching', entityType, 'with search:', searchTerm);
    query
      .then(function (response) {
        if (response.error) {
          console.error('[autocomplete] Fetch error:', response.error);
          callback([]);
          return;
        }
        console.log('[autocomplete] Received', (response.data || []).length, 'items');
        callback(response.data || []);
      })
      .catch(function (error) {
        console.error('[autocomplete] Fetch exception:', error);
        callback([]);
      });
  }

  // Create dropdown element
  function createDropdown() {
    var dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.id = 'autocomplete-dropdown-' + Date.now(); // Unique ID for debugging
    dropdown.style.cssText = 'position: absolute !important; background: white !important; border: 1px solid #ccc !important; max-height: 200px !important; overflow-y: auto !important; z-index: 10000 !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; display: none !important; visibility: visible !important;';
    dropdown.setAttribute('role', 'listbox');
    console.log('[autocomplete] Created dropdown element:', dropdown.id, dropdown);
    return dropdown;
  }

  // Create dropdown item
  function createDropdownItem(item, config, onSelect) {
    var itemEl = document.createElement('div');
    itemEl.className = 'autocomplete-item';
    itemEl.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #eee;';
    itemEl.textContent = item[config.displayField] || '';
    itemEl.setAttribute('role', 'option');
    itemEl.setAttribute('data-value', item[config.valueField] || '');
    
    // Highlight matching text
    var displayText = item[config.displayField] || '';
    if (displayText) {
      itemEl.textContent = displayText;
    }

    // Hover effect
    itemEl.addEventListener('mouseenter', function () {
      itemEl.style.backgroundColor = '#f0f0f0';
    });
    itemEl.addEventListener('mouseleave', function () {
      itemEl.style.backgroundColor = '';
    });

    // Click to select
    itemEl.addEventListener('click', function () {
      onSelect(item);
    });

    return itemEl;
  }

  // Position dropdown below input
  function positionDropdown(dropdown, input) {
    var rect = input.getBoundingClientRect();
    var top = (rect.bottom + window.scrollY) + 'px';
    var left = (rect.left + window.scrollX) + 'px';
    var width = rect.width + 'px';
    dropdown.style.top = top;
    dropdown.style.left = left;
    dropdown.style.width = width;
    console.log('[autocomplete] Positioned dropdown:', {
      top: top,
      left: left,
      width: width,
      inputRect: {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        width: rect.width
      }
    });
  }

  // Main autocomplete factory function
  function createAutocomplete(options) {
    console.log('[autocomplete] createAutocomplete called with:', options);
    var input = options.input;
    var entityType = options.entityType;
    var onSelect = options.onSelect || function () {};
    var displayField = options.displayField || ENTITY_CONFIG[entityType]?.displayField || 'name';
    var valueField = options.valueField || ENTITY_CONFIG[entityType]?.valueField || 'id';
    var placeholder = options.placeholder || 'Start typing...';

    if (!input) {
      console.error('[autocomplete] Input element required');
      return null;
    }
    console.log('[autocomplete] Input element found:', input.id || input.name);

    if (!ENTITY_CONFIG[entityType]) {
      console.error('[autocomplete] Unknown entity type:', entityType);
      return null;
    }
    console.log('[autocomplete] Entity type valid:', entityType);

    var config = ENTITY_CONFIG[entityType];
    var dropdown = createDropdown();
    
    // Find a suitable container - prefer parent, but ensure it can position relatively
    var container = input.parentElement;
    while (container && container !== document.body) {
      var computedPosition = window.getComputedStyle(container).position;
      if (computedPosition === 'relative' || computedPosition === 'absolute' || computedPosition === 'fixed') {
        break; // Found a positioned ancestor
      }
      // If parent is form or section, use it
      if (container.tagName === 'FORM' || container.tagName === 'SECTION' || container.tagName === 'DIV') {
        break;
      }
      container = container.parentElement;
    }
    if (!container || container === document.body) {
      container = input.parentElement || document.body;
    }
    
    console.log('[autocomplete] Container for dropdown:', container.tagName, container.className, container.id, 'position:', window.getComputedStyle(container).position);
    container.style.position = 'relative'; // For absolute positioning
    container.appendChild(dropdown);
    console.log('[autocomplete] Dropdown appended to container. Dropdown element:', dropdown, 'isConnected:', dropdown.isConnected);

    var debounceTimer = null;
    var selectedItem = null;

    // Show dropdown with items
    function showDropdown(items) {
      console.log('[autocomplete] showDropdown called with', items.length, 'items');
      dropdown.innerHTML = '';
      if (items.length === 0) {
        console.log('[autocomplete] No items, hiding dropdown');
        dropdown.style.display = 'none';
        return;
      }

      items.forEach(function (item) {
        var itemEl = createDropdownItem(item, config, function (selected) {
          selectedItem = selected;
          input.value = selected[displayField] || '';
          dropdown.style.display = 'none';
          onSelect(selected);
        });
        dropdown.appendChild(itemEl);
      });

      positionDropdown(dropdown, input);
      dropdown.style.display = 'block';
      dropdown.style.visibility = 'visible';
      console.log('[autocomplete] Dropdown displayed:', {
        display: dropdown.style.display,
        visibility: dropdown.style.visibility,
        top: dropdown.style.top,
        left: dropdown.style.left,
        width: dropdown.style.width,
        items: items.length,
        computedDisplay: window.getComputedStyle(dropdown).display,
        computedVisibility: window.getComputedStyle(dropdown).visibility,
        computedZIndex: window.getComputedStyle(dropdown).zIndex,
        parentElement: dropdown.parentElement?.tagName
      });
    }

    // Hide dropdown
    function hideDropdown() {
      dropdown.style.display = 'none';
    }

    // Handle input changes
    input.addEventListener('input', function () {
      console.log('[autocomplete] Input event fired, value:', input.value);
      clearTimeout(debounceTimer);
      var searchTerm = input.value.trim();

      // If input is cleared, hide dropdown and clear selection
      if (searchTerm.length === 0) {
        hideDropdown();
        selectedItem = null;
        input.removeAttribute('data-selected-id');
        input.removeAttribute('data-selected-name');
        return;
      }

      // If user is typing something different than the selected item, clear selection
      if (selectedItem && input.value !== selectedItem[displayField]) {
        selectedItem = null;
        input.removeAttribute('data-selected-id');
        input.removeAttribute('data-selected-name');
      }

      // Debounce search to avoid too many API calls
      debounceTimer = setTimeout(function () {
        fetchItems(entityType, searchTerm, function (items) {
          showDropdown(items);
        });
      }, 200); // 200ms debounce
    });

    // Handle focus - show all items if no selection yet
    input.addEventListener('focus', function () {
      console.log('[autocomplete] Focus event fired');
      if (!selectedItem && input.value.trim().length === 0) {
        console.log('[autocomplete] Showing all items on focus');
        fetchItems(entityType, '', function (items) {
          showDropdown(items);
        });
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function (event) {
      if (!input.contains(event.target) && !dropdown.contains(event.target)) {
        hideDropdown();
      }
    });

    // Handle keyboard navigation
    input.addEventListener('keydown', function (event) {
      var items = dropdown.querySelectorAll('.autocomplete-item');
      var currentIndex = -1;
      items.forEach(function (item, index) {
        if (item.style.backgroundColor === 'rgb(240, 240, 240)') {
          currentIndex = index;
        }
      });

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (items.length > 0) {
          currentIndex = (currentIndex + 1) % items.length;
          items[currentIndex].style.backgroundColor = '#f0f0f0';
          items[currentIndex].scrollIntoView({ block: 'nearest' });
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (items.length > 0) {
          currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          items[currentIndex].style.backgroundColor = '#f0f0f0';
          items[currentIndex].scrollIntoView({ block: 'nearest' });
        }
      } else if (event.key === 'Enter' && currentIndex >= 0) {
        event.preventDefault();
        items[currentIndex].click();
      } else if (event.key === 'Escape') {
        hideDropdown();
      }
    });

    // Set placeholder
    if (placeholder && !input.placeholder) {
      input.placeholder = placeholder;
    }

    // Helper to load item by ID and set the input value
    function loadItemById(itemId) {
      if (!itemId) {
        return;
      }
      // Try to fetch the specific item by ID
      var client = getSupabaseClient();
      if (!client) {
        return;
      }
      client
        .from(config.table)
        .select('*')
        .eq(config.valueField, itemId)
        .single()
        .then(function (response) {
          if (response.error || !response.data) {
            // If not found, just set the ID as the value
            input.value = itemId;
            return;
          }
          // Found it - set the display name and store selection
          selectedItem = response.data;
          input.value = response.data[displayField] || itemId;
          input.setAttribute('data-selected-id', itemId);
          input.setAttribute('data-selected-name', response.data[displayField] || '');
        })
        .catch(function (error) {
          // On error, just set the ID as the value
          console.warn('[autocomplete] Could not load item by ID:', itemId, error);
          input.value = itemId;
        });
    }

    // Return API for programmatic control
    return {
      setValue: function (value) {
        input.value = value;
        selectedItem = null;
        input.removeAttribute('data-selected-id');
        input.removeAttribute('data-selected-name');
      },
      setValueById: function (id) {
        // Load item by ID and display its name
        loadItemById(id);
      },
      getValue: function () {
        return selectedItem ? selectedItem[valueField] : input.value;
      },
      getSelectedItem: function () {
        return selectedItem;
      },
      destroy: function () {
        if (dropdown && dropdown.parentElement) {
          dropdown.parentElement.removeChild(dropdown);
        }
      }
    };
  }

  // Export to global scope
  if (!global.CivAutocomplete) {
    global.CivAutocomplete = {
      create: createAutocomplete,
      ENTITY_TYPES: Object.keys(ENTITY_CONFIG)
    };
    console.log('[autocomplete] CivAutocomplete initialized and available');
  } else {
    console.warn('[autocomplete] CivAutocomplete already exists');
  }

})(window);

