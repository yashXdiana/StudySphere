/**
 * StudySphere — Common JavaScript Architecture (main.js)
 * Responsible for:
 *   - Theme Controller (Light / Dark) & LocalStorage Persistence
 *   - Font Size Controller (Small / Medium / Large) & LocalStorage Persistence
 *   - Common Modal Management Shell (Donation Dialog)
 */

(function () {
  'use strict';

  var root = document.documentElement;

  /* ==========================================================================
     1. Theme Management (Light / Dark)
     ========================================================================== */
  var THEME_STORAGE_KEY = 'studysphere_theme';
  var VALID_THEMES = ['light', 'dark'];

  function getStoredTheme() {
    try {
      var saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && VALID_THEMES.indexOf(saved) !== -1) {
        return saved;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }

  function applyTheme(theme) {
    if (VALID_THEMES.indexOf(theme) === -1) theme = 'light';
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}

    // Dispatch custom event for any listening UI elements
    window.dispatchEvent(new CustomEvent('studysphere:themechange', { detail: { theme: theme } }));
  }

  function toggleTheme() {
    var current = root.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  /* ==========================================================================
     2. Font Size Management (Small / Medium / Large)
     ========================================================================== */
  var FONT_STORAGE_KEY = 'studysphere_font_size';
  var FONT_TIERS = ['small', 'medium', 'large'];

  function getStoredFontSize() {
    try {
      var saved = localStorage.getItem(FONT_STORAGE_KEY);
      if (saved && FONT_TIERS.indexOf(saved) !== -1) {
        return saved;
      }
    } catch (e) {}
    return 'medium';
  }

  function applyFontSize(size) {
    if (FONT_TIERS.indexOf(size) === -1) size = 'medium';
    root.setAttribute('data-font-size', size);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, size);
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('studysphere:fontsizechange', { detail: { size: size } }));
  }

  function cycleFontSize() {
    var current = root.getAttribute('data-font-size') || 'medium';
    var currentIndex = FONT_TIERS.indexOf(current);
    var nextIndex = (currentIndex + 1) % FONT_TIERS.length;
    applyFontSize(FONT_TIERS[nextIndex]);
  }

  /* ==========================================================================
     3. Immediate Execution (Zero-Flicker Guarantee)
     ========================================================================== */
  applyTheme(getStoredTheme());
  applyFontSize(getStoredFontSize());

  /* ==========================================================================
     4. Public API Namespace Export
     ========================================================================== */
  window.StudySphere = window.StudySphere || {};
  window.StudySphere.theme = {
    get: function () { return root.getAttribute('data-theme') || 'light'; },
    apply: applyTheme,
    toggle: toggleTheme
  };
  window.StudySphere.font = {
    get: function () { return root.getAttribute('data-font-size') || 'medium'; },
    apply: applyFontSize,
    cycle: cycleFontSize
  };
})();