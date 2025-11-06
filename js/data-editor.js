// CIV7 Tracker - Unified Data Editor Tab Controller
// Manages tab switching and coordinates between different entity editors

(function () {
  'use strict';

  // Tab configuration - maps tab IDs to entity types and their JS modules
  var TAB_CONFIG = {
    'wonders': {
      name: 'World Wonders',
      module: 'data-wonders',
      listPanel: 'wonders-list-panel',
      formPanel: 'wonders-form-panel'
    },
    'leaders': {
      name: 'Leaders',
      module: 'data-leaders',
      listPanel: 'leaders-list-panel',
      formPanel: 'leaders-form-panel'
    },
    'civilizations': {
      name: 'Civilizations',
      module: 'data-civilizations',
      listPanel: 'civs-list-panel',
      formPanel: 'civs-form-panel'
    },
    'tech-civics': {
      name: 'Tech/Civics',
      module: 'data-tech-civics',
      listPanel: 'tech-civics-list-panel',
      formPanel: 'tech-civics-form-panel'
    },
    'natural-wonders': {
      name: 'Natural Wonders',
      module: 'data-natural-wonders',
      listPanel: 'natural-wonders-list-panel',
      formPanel: 'natural-wonders-form-panel'
    },
    'mementos': {
      name: 'Mementos',
      module: 'data-mementos',
      listPanel: 'mementos-list-panel',
      formPanel: 'mementos-form-panel'
    },
    'social-policies': {
      name: 'Social Policies',
      module: 'data-social-policies',
      listPanel: 'social-policies-list-panel',
      formPanel: 'social-policies-form-panel'
    },
    'units': {
      name: 'Units',
      module: 'data-units',
      listPanel: 'units-list-panel',
      formPanel: 'units-form-panel'
    },
    'buildings': {
      name: 'Buildings',
      module: 'data-buildings',
      listPanel: 'buildings-list-panel',
      formPanel: 'buildings-form-panel'
    }
  };

  var currentTab = null;
  var initializedModules = {};

  // Initialize tab controller
  function init() {
    // Set up tab buttons
    var tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        var tabId = this.getAttribute('data-tab');
        switchTab(tabId);
      });
    });

    // Handle hash-based deep linking
    function handleHashChange() {
      var hash = window.location.hash.slice(1); // Remove #
      if (hash && TAB_CONFIG[hash]) {
        switchTab(hash);
      } else {
        // Default to first tab
        var firstTab = Object.keys(TAB_CONFIG)[0];
        switchTab(firstTab);
      }
    }

    // Handle initial load and hash changes
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  }

  // Switch to a specific tab
  function switchTab(tabId) {
    if (!TAB_CONFIG[tabId]) {
      console.error('[data-editor] Unknown tab:', tabId);
      return;
    }

    // Update URL hash
    if (window.location.hash !== '#' + tabId) {
      window.location.hash = tabId;
    }

    // Hide all tab contents
    var allTabContents = document.querySelectorAll('.tab-content');
    allTabContents.forEach(function(content) {
      content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    var allTabButtons = document.querySelectorAll('.tab-button');
    allTabButtons.forEach(function(button) {
      button.classList.remove('active');
    });

    // Show selected tab content
    var selectedContent = document.getElementById('tab-content-' + tabId);
    var selectedButton = document.querySelector('[data-tab="' + tabId + '"]');
    
    if (selectedContent) {
      selectedContent.classList.add('active');
    }
    
    if (selectedButton) {
      selectedButton.classList.add('active');
    }

    // Initialize module if not already initialized
    var config = TAB_CONFIG[tabId];
    if (!initializedModules[tabId] && typeof window[config.module] !== 'undefined') {
      // Module scripts are loaded globally, they should auto-initialize
      // But we can trigger a refresh if needed
      initializedModules[tabId] = true;
    }

    currentTab = tabId;
  }

  // Public API
  window.DataEditor = {
    init: init,
    switchTab: switchTab,
    getCurrentTab: function() { return currentTab; }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

