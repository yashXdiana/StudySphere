/**
 * StudySphere — Common Navigation Architecture (navigation.js)
 * Responsible for:
 *   - Mobile Right-Side Drawer (Open, Close, Overlay Backdrop)
 *   - Body Scroll Locking during Mobile Drawer Display
 *   - Keyboard Accessibility (Escape key interceptor & focus trapping)
 *   - Explicit Anchor Scrolling to Section Headings
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

    if (drawerElement) {
      drawerElement.classList.add('active');
      drawerElement.setAttribute('aria-hidden', 'false');
    }
    if (overlayElement) {
      overlayElement.classList.add('active');
      overlayElement.setAttribute('aria-hidden', 'false');
    }

    var toggleBtn = document.getElementById('mobile-drawer-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    document.body.style.overflow = 'hidden';
    isDrawerOpen = true;

    // Accessibility: Focus first interactive control inside the drawer
    if (drawerElement) {
      var firstFocusable = drawerElement.querySelector('button, [href], input, [tabindex="0"]');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  function closeDrawer() {
    if (!drawerElement) drawerElement = document.getElementById('drawerMenu');
    if (!overlayElement) overlayElement = document.getElementById('drawerOverlay');

    if (drawerElement) {
      drawerElement.classList.remove('active');
      drawerElement.setAttribute('aria-hidden', 'true');
    }
    if (overlayElement) {
      overlayElement.classList.remove('active');
      overlayElement.setAttribute('aria-hidden', 'true');
    }

    var toggleBtn = document.getElementById('mobile-drawer-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    document.body.style.overflow = '';
    isDrawerOpen = false;
  }

  function toggleDrawer(e) {
    if (e && e.preventDefault) e.preventDefault();
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
     3. Event Binding & Initialization (Safe for all document states)
     ========================================================================== */
  function initNavigation() {
    drawerElement = document.getElementById('drawerMenu');
    overlayElement = document.getElementById('drawerOverlay');

    // Toggle button in header
    var mobileToggleBtn = document.getElementById('mobile-drawer-toggle');
    if (mobileToggleBtn) {
      // Remove any existing duplicate listeners by replacing with fresh handler
      mobileToggleBtn.onclick = toggleDrawer;
    }

    // Close button inside drawer
    var drawerCloseBtn = document.getElementById('mobile-drawer-close');
    if (drawerCloseBtn) {
      drawerCloseBtn.onclick = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        closeDrawer();
      };
    }

    // Backdrop overlay click closes drawer
    if (overlayElement) {
      overlayElement.onclick = function (e) {
        if (e && e.preventDefault) e.preventDefault();
        closeDrawer();
      };
    }

    // Close drawer when any internal navigation link is tapped
    if (drawerElement) {
      var drawerLinks = drawerElement.querySelectorAll('a');
      drawerLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          closeDrawer();
        });
      });
    }

    // Keyboard support: Escape closes active drawer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }

  /* ==========================================================================
     4. Public API Namespace Export
     ========================================================================== */
  window.StudySphere = window.StudySphere || {};
  window.StudySphere.nav = {
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    toggleDrawer: toggleDrawer,
    scrollToSection: scrollToSection
  };
})();
