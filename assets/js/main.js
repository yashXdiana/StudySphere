/**
 * StudySphere — Common JavaScript Architecture (main.js)
 * Responsible for:
 *   - Theme Controller (Light / Dark) & LocalStorage Persistence
 *   - Font Size Controller (Small / Medium / Large) & LocalStorage Persistence
 *   - Donation Modal Controller (Mobile amount inputs vs Desktop QR)
 *   - Section Heading Smooth Scroll Anchor Interceptor
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
     3. Donation Modal Controller
     ========================================================================== */
  var donationModal = null;
  var thankYouModal = null;
  var selectedAmount = 50;
  var UPI_ID = 'vikram.joshi9089@oksbi';

  function isMobileDevice() {
    return window.innerWidth < 768;
  }

  function openDonationModal() {
    if (!donationModal) donationModal = document.getElementById('donationModal');
    if (!donationModal) return;

    var mobileSection = document.getElementById('donateMobileView');
    var desktopSection = document.getElementById('donateDesktopView');
    var isMobile = isMobileDevice();

    if (mobileSection && desktopSection) {
      if (isMobile) {
        mobileSection.style.display = 'block';
        desktopSection.style.display = 'none';
        resetMobileDonationForm();
      } else {
        mobileSection.style.display = 'none';
        desktopSection.style.display = 'block';
      }
    }

    donationModal.classList.add('active');
    donationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDonationModal() {
    if (!donationModal) donationModal = document.getElementById('donationModal');
    if (donationModal) {
      donationModal.classList.remove('active');
      donationModal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function resetMobileDonationForm() {
    selectedAmount = 50;
    var customInput = document.getElementById('customAmountInput');
    if (customInput) customInput.value = '';

    var errorMsg = document.getElementById('donateErrorMsg');
    if (errorMsg) errorMsg.classList.remove('visible');

    var presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(function (btn) {
      if (parseInt(btn.getAttribute('data-amount'), 10) === 50) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function openThankYouModal() {
    if (!thankYouModal) thankYouModal = document.getElementById('thankYouModal');
    if (thankYouModal) {
      thankYouModal.classList.add('active');
      thankYouModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeThankYouModal() {
    if (!thankYouModal) thankYouModal = document.getElementById('thankYouModal');
    if (thankYouModal) {
      thankYouModal.classList.remove('active');
      thankYouModal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function handlePayNow() {
    var customInput = document.getElementById('customAmountInput');
    var errorMsg = document.getElementById('donateErrorMsg');
    var amountToPay = selectedAmount;

    if (customInput && customInput.value.trim() !== '') {
      var rawVal = customInput.value.trim();
      var parsed = parseFloat(rawVal);

      if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0 || /[^0-9.]/.test(rawVal)) {
        if (errorMsg) {
          errorMsg.textContent = 'Please enter a valid positive amount (e.g. ₹50, ₹100).';
          errorMsg.classList.add('visible');
        }
        return;
      }
      amountToPay = Math.round(parsed);
    }

    if (errorMsg) errorMsg.classList.remove('visible');

    // Build the UPI intent URL (does NOT render UPI string into the visible popup DOM)
    var upiUrl = 'upi://pay?pa=' + encodeURIComponent(UPI_ID) +
                 '&pn=' + encodeURIComponent('StudySphere Support') +
                 '&am=' + encodeURIComponent(amountToPay) +
                 '&cu=INR&tn=' + encodeURIComponent('Support StudySphere Educational Platform');

    closeDonationModal();

    // Trigger external UPI app intent
    try {
      window.location.href = upiUrl;
    } catch (e) {}

    // Prepare appreciation modal upon returning
    setTimeout(function () {
      openThankYouModal();
    }, 1200);
  }

  /* ==========================================================================
     4. Initialization & Event Binding
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Initial synchronization
    var initialTheme = getStoredTheme();
    applyTheme(initialTheme);

    var initialSize = getStoredFontSize();
    applyFontSize(initialSize);

    // 2. Theme switch button
    var themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // 3. Font size button
    var fontBtn = document.getElementById('font-size-btn');
    if (fontBtn) {
      fontBtn.addEventListener('click', cycleFontSize);
    }

    // 4. Donation Buttons (Header, Drawer, Footer)
    var donateButtons = document.querySelectorAll('#donate-btn, #drawer-donate-btn, #footer-donate-btn');
    donateButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.StudySphere && window.StudySphere.nav && window.StudySphere.nav.closeDrawer) {
          window.StudySphere.nav.closeDrawer();
        }
        openDonationModal();
      });
    });

    // 5. Donation Modal close triggers
    var modalCloseBtn = document.getElementById('modalCloseBtn');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDonationModal);

    var donationBackdrop = document.getElementById('donationModal');
    if (donationBackdrop) {
      donationBackdrop.addEventListener('click', function (e) {
        if (e.target === donationBackdrop) closeDonationModal();
      });
    }

    // 6. Preset Amount Buttons
    var presetButtons = document.querySelectorAll('.btn-preset');
    var customInput = document.getElementById('customAmountInput');
    var errorMsg = document.getElementById('donateErrorMsg');

    presetButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        presetButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedAmount = parseInt(btn.getAttribute('data-amount'), 10);
        if (customInput) customInput.value = '';
        if (errorMsg) errorMsg.classList.remove('visible');
      });
    });

    if (customInput) {
      customInput.addEventListener('input', function () {
        presetButtons.forEach(function (b) { b.classList.remove('active'); });
        if (errorMsg) errorMsg.classList.remove('visible');
      });
    }

    // 7. Pay Now button
    var payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) payNowBtn.addEventListener('click', handlePayNow);

    // 8. Thank You Modal close triggers
    var thankYouCloseBtn = document.getElementById('thankYouCloseBtn');
    if (thankYouCloseBtn) thankYouCloseBtn.addEventListener('click', closeThankYouModal);

    var thankYouBackdrop = document.getElementById('thankYouModal');
    if (thankYouBackdrop) {
      thankYouBackdrop.addEventListener('click', function (e) {
        if (e.target === thankYouBackdrop) closeThankYouModal();
      });
    }

    // 9. Quick Section Navigation Buttons — scroll smoothly to SECTION HEADINGS
    var quickNavButtons = document.querySelectorAll('.btn-quick-nav');
    quickNavButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = btn.getAttribute('data-target');
        if (targetId) {
          var targetElem = document.getElementById(targetId);
          if (targetElem) {
            targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // 10. Escape key closes active modals
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDonationModal();
        closeThankYouModal();
      }
    });
  });

  /* ==========================================================================
     5. Public API Namespace Export
     ========================================================================== */
  window.StudySphere = window.StudySphere || {};
  window.StudySphere.theme = {
    get: getStoredTheme,
    set: applyTheme,
    toggle: toggleTheme
  };
  window.StudySphere.font = {
    get: getStoredFontSize,
    set: applyFontSize,
    cycle: cycleFontSize
  };
  window.StudySphere.donate = {
    open: openDonationModal,
    close: closeDonationModal
  };
})();
