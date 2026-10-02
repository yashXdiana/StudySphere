/**
 * StudySphere — Common Navigation Architecture (navigation.js)
 * Responsible for:
 *   - Mobile Right-Side Drawer (Open, Close, Overlay Backdrop)
 *   - Escape Key Accessibility Interceptor
 *   - Explicit Anchor Scrolling to Section Headings (e.g. Explore Subjects)
 */

(function () {
  'use strict';

  var drawerElement = null;
  var overlayElement = null;
  var isDrawerOpen = false;

  /* ==========================================================================
     1. Mobile Drawer Controller
     ========================================================================== */
  function openDrawer() {
    if (!drawerElement) drawerElement = document.getElementById('drawerMenu');
    if (!overlayElement) overlayElement = document.getElementById('drawerOverlay');

    if (drawerElement) drawerElement.classList.add('active');
    if (overlayElement) overlayElement.classList.add('active');

    document.body.style.overflow = 'hidden';
    isDrawerOpen = true;

    // Accessibility: Focus first focusable element inside drawer
    if (drawerElement) {
      var firstFocusable = drawerElement.querySelector('button, [href], input');
      if (firstFocusable) firstFocusable.focus();
    }
  }

  function closeDrawer() {
    if (!drawerElement) drawerElement = document.getElementById('drawerMenu');
    if (!overlayElement) overlayElement = document.getElementById('drawerOverlay');

    if (drawerElement) drawerElement.classList.remove('active');
    if (overlayElement) overlayElement.classList.remove('active');

    document.body.style.overflow = '';
    isDrawerOpen = false;
  }

  function toggleDrawer() {
    if (isDrawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  /* ==========================================================================
     2. Explicit Section Heading Smooth Scroll
     ========================================================================== */
  function scrollToSection(headingId) {
    if (!headingId) return;
    var target = document.getElementById(headingId);
    if (target) {
      closeDrawer();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ==========================================================================
     3. Global Keyboard and Window Listeners
     ========================================================================== */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeDrawer();
    }
  });

  // Export to global namespace
  window.StudySphere = window.StudySphere || {};
  window.StudySphere.nav = {
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    toggleDrawer: toggleDrawer,
    scrollToSection: scrollToSection
  };
})();