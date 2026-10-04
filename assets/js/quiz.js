/**
 * StudySphere — Standalone Quiz Engine Controller (assets/js/quiz.js)
 * Final Major UX Flow Revision:
 *   1. Screen 1: Quiz Setup / Information Screen
 *      - Shows dynamic quiz metadata (Title, Subject, Chapter, Questions, Marks, Level, Negative).
 *      - Time Selection: Default Time, 10, 15, 20, 30 Mins, No Time Limit, Custom Time (validated 1-180m).
 *      - Font Size Selection: Small (default), Medium, Large.
 *      - Start Quiz action initialized only after confirmation.
 *   2. Screen 2: Active Quiz Runner Interface
 *      - Timer respects setup time mode (countdown or disabled for No Time Limit).
 *      - Strictly zero pre-selected answers on load.
 *      - Manual step progression (NO auto-next upon answer selection).
 *      - Manual step progression (NO auto-next upon Mark for Review).
 *      - Zero unwanted scrolling; pure white (#FFFFFF) unified box.
 *      - Left-side sliding mobile question palette (55vw).
 *   3. Screen 3: Redesigned "चाचणी विश्लेषण अहवाल" Performance Dashboard
 *      - Score Visual SVG Ring indicator (dynamic score, percentage).
 *      - Correct / Wrong / Unanswered breakdown bar.
 *      - Chapter-wise performance breakdown.
 *      - Per-question inspection and Google Sheets Question Reporting.
 */

(function () {
  'use strict';

  // Configured Google Apps Script Web App Endpoint for StudySphere Question Reports
  var REPORT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXR7L9lMGyh7NTj-dEzI_OcudYEHg_a12VZNkA8RVIpSZV_oRSFkZpSYlIzeDDx6vRPQ/exec';

  // State Store
  var quizData = null;
  var currentQuestionIndex = 0;
  var selectedAnswers = {}; // { questionId: "A" } — strictly empty on load
  var markedQuestions = {}; // { questionId: true }
  var visitedQuestions = {}; // { questionId: true }
  
  // Time and Mode Configuration
  var isNoTimeLimit = false;
  var configuredDurationMinutes = 5;
  var remainingSeconds = 0;
  var timerInterval = null;
  var isSubmitted = false;
  var currentFontSize = 'small'; // Default: small

  // Setup Screen State
  var selectedTimeMode = 'default'; // 'default' | '10' | '15' | '20' | '30' | 'notime' | 'custom'
  var customTimeValue = '';
  var selectedSetupFont = 'small';

  // Real per-question time tracking
  var questionTimeSpent = {}; // { questionId: seconds }
  var lastQuestionTimestamp = 0;

  // Question Reporting State
  var reportedQuestions = {}; // { questionId: true }
  var activeReportPayload = null;
  var isSubmittingReport = false;

  var FONT_SIZES = ['small', 'medium', 'large'];
  var STORAGE_KEY_PREFIX = 'studysphere_quiz_state_v4_';
  var FONT_STORAGE_KEY = 'studysphere_quiz_font_size';

  // DOM Elements Cache
  var els = {};

  function initElements() {
    els.app = document.getElementById('quizAppRoot');
    
    // Views
    els.setupView = document.getElementById('quizSetupView');
    els.activeRunnerView = document.getElementById('quizActiveRunnerView');
    els.resultContainer = document.getElementById('quizResultContainer');

    // Setup Screen Elements
    els.setupTitle = document.getElementById('setupTitle');
    els.setupContext = document.getElementById('setupContext');
    els.setupExamTag = document.getElementById('setupExamTag');
    els.setupTypeTag = document.getElementById('setupTypeTag');
    els.setupMetaQuestions = document.getElementById('setupMetaQuestions');
    els.setupMetaMarks = document.getElementById('setupMetaMarks');
    els.setupMetaNegative = document.getElementById('setupMetaNegative');
    els.setupMetaDifficulty = document.getElementById('setupMetaDifficulty');
    els.labelDefaultPreset = document.getElementById('labelDefaultPreset');
    els.subLabelDefaultPreset = document.getElementById('subLabelDefaultPreset');
    els.timePresetsContainer = document.getElementById('timePresetsContainer');
    els.setupCustomTimeRow = document.getElementById('setupCustomTimeRow');
    els.setupCustomMinutesInput = document.getElementById('setupCustomMinutesInput');
    els.setupTimeValidationError = document.getElementById('setupTimeValidationError');
    els.btnSetupBack = document.getElementById('btnSetupBack');
    els.btnSetupStartQuiz = document.getElementById('btnSetupStartQuiz');

    // Active Quiz Header Elements
    els.titleMain = document.getElementById('quizHeaderTitle');
    els.subBadge = document.getElementById('quizHeaderSub');
    els.counterCenter = document.getElementById('quizProgressCenter');
    els.mobileTitle = document.getElementById('mobileQuizTitle');
    els.mobileContext = document.getElementById('mobileQuizContext');
    els.mobileCounter = document.getElementById('mobileProgressCounter');
    els.timerPill = document.getElementById('quizTimerPill');
    els.timerText = document.getElementById('quizTimerText');
    els.mobileTimerPill = document.getElementById('mobileTimerPill');
    els.mobileTimerText = document.getElementById('mobileTimerText');
    els.exitBtn = document.getElementById('quizExitBtn');
    els.mobileExitBtn = document.getElementById('mobileExitBtn');
    
    // Font Toggle Elements
    els.fontToggleBtn = document.getElementById('quizFontToggleBtn');
    els.fontCurrentVal = document.getElementById('quizFontCurrentVal');
    els.mobileFontToggleBtn = document.getElementById('mobileFontToggleBtn');
    els.mobileFontCurrentVal = document.getElementById('mobileFontCurrentVal');

    // Workspace & Palette
    els.workspace = document.getElementById('quizWorkspace');
    els.questionViewport = document.getElementById('quizQuestionViewport');
    els.questionContent = document.getElementById('questionScrollContent');
    els.desktopPaletteGrid = document.getElementById('desktopPaletteGrid');
    els.desktopPaletteTotalCount = document.getElementById('desktopPaletteTotalCount');
    els.mobilePaletteGrid = document.getElementById('mobilePaletteGrid');
    els.mobilePaletteOverlay = document.getElementById('mobilePaletteOverlay');
    els.mobilePaletteDrawer = document.getElementById('mobilePaletteDrawer');
    els.mobilePaletteToggle = document.getElementById('mobilePaletteToggle');
    els.mobilePaletteClose = document.getElementById('mobilePaletteClose');

    // Bottom Navigation Bar
    els.controlBar = document.getElementById('quizBottomControlBar');
    els.prevBtn = document.getElementById('btnNavPrev');
    els.nextBtn = document.getElementById('btnNavNext');
    els.submitBtn = document.getElementById('btnNavSubmit');
    els.markReviewBtn = document.getElementById('btnToggleMarkReview');
    els.markReviewStar = document.getElementById('markReviewStarIcon');
    els.markReviewText = document.getElementById('markReviewText');

    // Modals
    els.exitModal = document.getElementById('exitConfirmModal');
    els.submitModal = document.getElementById('submitConfirmModal');
    els.reportModal = document.getElementById('reportQuestionModal');
  }

  /* ==========================================================================
     1. Data Loading & Initialization
     ========================================================================== */
  function getQueryParam(param) {
    var searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
  }

  function loadQuiz() {
    var quizId = getQueryParam('quiz') || 'H-CH01-001';
    var questionFile = '../quizzes/pre/history/questions/quiz-001.json';

    fetch(questionFile)
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load quiz questions JSON');
        return res.json();
      })
      .then(function (data) {
        quizData = data;
        initFontSizeState();
        initSetupScreenData();
      })
      .catch(function (err) {
        console.error('Quiz loading error:', err);
        if (els.setupTitle) {
          els.setupTitle.textContent = 'चाचणी लोड करताना अडचण आली';
        }
        if (els.setupContext) {
          els.setupContext.innerHTML = '<span style="color:var(--status-wrong);">' + err.message + '</span>';
        }
      });
  }

  /* ==========================================================================
     2. Quiz Setup Screen Controller
     ========================================================================== */
  function initSetupScreenData() {
    if (!quizData) return;

    var title = quizData.titleMr || quizData.title;
    var contextText = 'MPSC Group C 2026 • Prelims • ' + (quizData.subjectNameMr || quizData.subject || 'इतिहास') + ' • ' + (quizData.chapterNameMr || 'आधुनिक भारताचा इतिहास');

    if (els.setupTitle) els.setupTitle.textContent = title;
    if (els.setupContext) els.setupContext.textContent = contextText;

    var qCount = quizData.questions ? quizData.questions.length : (quizData.totalQuestions || 5);
    var tMarks = quizData.totalMarks || qCount;
    var negRate = quizData.negativeMarkingPerWrong !== undefined ? quizData.negativeMarkingPerWrong : 0.25;
    var defaultDur = quizData.durationMinutes || 5;
    configuredDurationMinutes = defaultDur;

    if (els.setupMetaQuestions) els.setupMetaQuestions.textContent = qCount;
    if (els.setupMetaMarks) els.setupMetaMarks.textContent = tMarks;
    if (els.setupMetaNegative) els.setupMetaNegative.textContent = negRate > 0 ? ('-' + negRate) : '0';
    if (els.setupMetaDifficulty) els.setupMetaDifficulty.textContent = quizData.difficulty || 'Medium';

    if (els.subLabelDefaultPreset) {
      els.subLabelDefaultPreset.textContent = defaultDur + ' Min';
    }

    // Set font preset to current active size
    selectedSetupFont = currentFontSize;
    updateSetupFontPills();

    // Ensure setup view is displayed
    if (els.setupView) els.setupView.style.display = 'flex';
    if (els.activeRunnerView) els.activeRunnerView.style.display = 'none';
    if (els.resultContainer) els.resultContainer.style.display = 'none';
  }

  function handleTimePresetSelect(btn) {
    var mode = btn.getAttribute('data-time-mode');
    selectedTimeMode = mode;

    var allPresets = document.querySelectorAll('.btn-time-preset');
    allPresets.forEach(function (b) {
      b.classList.remove('is-selected');
      b.setAttribute('aria-checked', 'false');
    });

    btn.classList.add('is-selected');
    btn.setAttribute('aria-checked', 'true');

    if (mode === 'custom') {
      if (els.setupCustomTimeRow) els.setupCustomTimeRow.style.display = 'flex';
      if (els.setupCustomMinutesInput) els.setupCustomMinutesInput.focus();
    } else {
      if (els.setupCustomTimeRow) els.setupCustomTimeRow.style.display = 'none';
      if (els.setupTimeValidationError) els.setupTimeValidationError.style.display = 'none';
    }
  }

  function handleSetupFontSelect(btn) {
    var font = btn.getAttribute('data-font');
    selectedSetupFont = font;
    updateSetupFontPills();
  }

  function updateSetupFontPills() {
    var allFontBtns = document.querySelectorAll('.btn-setup-font');
    allFontBtns.forEach(function (b) {
      var f = b.getAttribute('data-font');
      if (f === selectedSetupFont) {
        b.classList.add('is-selected');
        b.setAttribute('aria-checked', 'true');
      } else {
        b.classList.remove('is-selected');
        b.setAttribute('aria-checked', 'false');
      }
    });
  }

  function validateAndStartQuiz() {
    if (!quizData) return;

    var finalDuration = configuredDurationMinutes;
    isNoTimeLimit = false;

    // Validate Selected Time
    if (selectedTimeMode === 'default') {
      finalDuration = quizData.durationMinutes || 5;
    } else if (selectedTimeMode === 'notime') {
      isNoTimeLimit = true;
      finalDuration = 0;
    } else if (selectedTimeMode === 'custom') {
      var rawVal = els.setupCustomMinutesInput ? els.setupCustomMinutesInput.value.trim() : '';
      if (!rawVal) {
        showSetupTimeError('Please enter custom minutes.');
        return;
      }
      var parsed = Number(rawVal);
      if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 180) {
        showSetupTimeError('Please enter a valid whole number between 1 and 180 minutes.');
        return;
      }
      finalDuration = parsed;
    } else {
      var presetNum = parseInt(selectedTimeMode, 10);
      if (!isNaN(presetNum) && presetNum > 0) {
        finalDuration = presetNum;
      }
    }

    if (els.setupTimeValidationError) {
      els.setupTimeValidationError.style.display = 'none';
    }

    // Apply selected font size
    applyFontSize(selectedSetupFont);

    // Launch Active Quiz Runner
    launchActiveQuiz(finalDuration, isNoTimeLimit);
  }

  function showSetupTimeError(msg) {
    if (els.setupTimeValidationError) {
      els.setupTimeValidationError.textContent = msg;
      els.setupTimeValidationError.style.display = 'block';
    }
    if (els.setupCustomMinutesInput) {
      els.setupCustomMinutesInput.focus();
    }
  }

  /* ==========================================================================
     3. Active Quiz Launch & State Management
     ========================================================================== */
  function launchActiveQuiz(durationMinutes, noLimit) {
    var quizId = quizData.quizId || 'H-CH01-001';

    // Switch viewports
    if (els.setupView) els.setupView.style.display = 'none';
    if (els.activeRunnerView) els.activeRunnerView.style.display = 'flex';
    if (els.resultContainer) els.resultContainer.style.display = 'none';

    // Fresh initialization: Strictly zero pre-selected answers
    currentQuestionIndex = 0;
    selectedAnswers = {};
    markedQuestions = {};
    visitedQuestions = {};
    questionTimeSpent = {};
    reportedQuestions = {};

    isNoTimeLimit = noLimit;
    if (isNoTimeLimit) {
      remainingSeconds = 0;
    } else {
      remainingSeconds = durationMinutes * 60;
    }

    if (quizData.questions && quizData.questions[0]) {
      visitedQuestions[quizData.questions[0].questionId] = true;
    }

    renderHeaderInfo();
    lastQuestionTimestamp = Date.now();
    startTimer();
    renderQuestion(0);
    renderPaletteGrids();
  }

  function getStorageKey() {
    return STORAGE_KEY_PREFIX + (quizData ? quizData.quizId : 'active');
  }

  function persistState() {
    if (isSubmitted || !quizData) return;
    recordCurrentQuestionTime();
    var state = {
      quizId: quizData.quizId,
      currentQuestionIndex: currentQuestionIndex,
      selectedAnswers: selectedAnswers,
      markedQuestions: markedQuestions,
      visitedQuestions: visitedQuestions,
      questionTimeSpent: questionTimeSpent,
      reportedQuestions: reportedQuestions,
      remainingSeconds: remainingSeconds,
      isNoTimeLimit: isNoTimeLimit,
      isSubmitted: false
    };
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (e) {}
  }

  function recordCurrentQuestionTime() {
    if (!quizData || !quizData.questions[currentQuestionIndex]) return;
    var qId = quizData.questions[currentQuestionIndex].questionId;
    var now = Date.now();
    var elapsedSeconds = Math.round((now - lastQuestionTimestamp) / 1000);
    if (elapsedSeconds > 0) {
      questionTimeSpent[qId] = (questionTimeSpent[qId] || 0) + elapsedSeconds;
    }
    lastQuestionTimestamp = now;
  }

  function clearActiveState() {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (e) {}
  }

  /* ==========================================================================
     4. Font Size Management (Small [Default] / Medium / Large)
     ========================================================================== */
  function initFontSizeState() {
    try {
      var saved = localStorage.getItem(FONT_STORAGE_KEY);
      if (saved && FONT_SIZES.indexOf(saved) !== -1) {
        currentFontSize = saved;
      } else {
        currentFontSize = 'small'; // Strict default: Small
      }
    } catch (e) {
      currentFontSize = 'small';
    }
    applyFontSize(currentFontSize);
  }

  function applyFontSize(size) {
    currentFontSize = size;
    document.documentElement.setAttribute('data-quiz-font-size', size);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, size);
    } catch (e) {}

    var cap = size.charAt(0).toUpperCase() + size.slice(1);
    if (els.fontCurrentVal) els.fontCurrentVal.textContent = cap;
    if (els.mobileFontCurrentVal) els.mobileFontCurrentVal.textContent = cap;

    if (els.fontToggleBtn) {
      els.fontToggleBtn.setAttribute('title', 'Font Size: ' + cap + ' (click to toggle)');
    }
  }

  function cycleFontSize() {
    var curIdx = FONT_SIZES.indexOf(currentFontSize);
    var nextIdx = (curIdx + 1) % FONT_SIZES.length;
    applyFontSize(FONT_SIZES[nextIdx]);
  }

  /* ==========================================================================
     5. Header Context & Timer
     ========================================================================== */
  function renderHeaderInfo() {
    var title = quizData.titleMr || quizData.title;
    var contextText = 'MPSC Group C 2026 • Prelims • ' + (quizData.subjectNameMr || 'इतिहास') + ' • ' + (quizData.chapterNameMr || 'आधुनिक भारताचा इतिहास');

    if (els.titleMain) els.titleMain.textContent = title;
    if (els.subBadge) els.subBadge.textContent = contextText;

    if (els.mobileTitle) els.mobileTitle.textContent = title;
    if (els.mobileContext) els.mobileContext.textContent = contextText;

    if (els.desktopPaletteTotalCount) {
      els.desktopPaletteTotalCount.textContent = quizData.questions.length + ' Questions';
    }
  }

  function updateCounters() {
    var total = quizData.questions.length;
    var currentDisplay = (currentQuestionIndex + 1 < 10 ? '0' : '') + (currentQuestionIndex + 1);
    var totalDisplay = (total < 10 ? '0' : '') + total;
    var text = 'Q ' + currentDisplay + ' / ' + totalDisplay;

    if (els.counterCenter) els.counterCenter.textContent = text;
    if (els.mobileCounter) els.mobileCounter.textContent = text;
  }

  function startTimer() {
    clearInterval(timerInterval);

    if (isNoTimeLimit) {
      if (els.timerText) els.timerText.textContent = 'No Limit';
      if (els.mobileTimerText) els.mobileTimerText.textContent = 'No Limit';
      if (els.timerPill) els.timerPill.classList.remove('warning');
      if (els.mobileTimerPill) els.mobileTimerPill.classList.remove('warning');
      return;
    }

    updateTimerDisplay();
    timerInterval = setInterval(function () {
      remainingSeconds--;
      updateTimerDisplay();
      persistState();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        handleAutoSubmit();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (isNoTimeLimit) return;

    var mins = Math.floor(Math.max(0, remainingSeconds) / 60);
    var secs = Math.max(0, remainingSeconds) % 60;
    var str = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

    if (els.timerText) els.timerText.textContent = str;
    if (els.mobileTimerText) els.mobileTimerText.textContent = str;

    var isWarn = remainingSeconds <= 60;
    if (els.timerPill) {
      if (isWarn) els.timerPill.classList.add('warning');
      else els.timerPill.classList.remove('warning');
    }
    if (els.mobileTimerPill) {
      if (isWarn) els.mobileTimerPill.classList.add('warning');
      else els.mobileTimerPill.classList.remove('warning');
    }
  }

  /* ==========================================================================
     6. Unified Question & Options Rendering (Clean Pure White Background)
     ========================================================================== */
  function renderQuestion(index) {
    if (!quizData || !quizData.questions[index]) return;
    recordCurrentQuestionTime();
    currentQuestionIndex = index;
    var q = quizData.questions[index];

    visitedQuestions[q.questionId] = true;
    updateCounters();
    updateNavigationControls();
    updateFooterMarkReviewState(q.questionId);
    persistState();

    var total = quizData.questions.length;
    var qNumFormatted = (index + 1 < 10 ? '0' : '') + (index + 1);
    var currentAnswer = selectedAnswers[q.questionId];

    // Construct ONE Common Pure White Card Box (#FFFFFF)
    var html = '';
    html += '<div class="quiz-unified-box">';

    // Question Header Meta with In-Quiz Report Trigger
    html += '  <div class="question-header-meta">';
    html += '    <span class="question-number-tag">प्रश्न ' + qNumFormatted + ' / ' + total + '</span>';
    html += '    <div style="display:flex; align-items:center; gap:8px;">';
    html += '      <span class="marks-pill-tag">गुण: ' + (q.marks || 1) + ' | उणे: ' + (quizData.negativeMarkingPerWrong || 0.25) + '</span>';
    html += '      <button type="button" class="btn-report-active-q ' + (reportedQuestions[q.questionId] ? 'is-reported' : '') + '" id="btnReportActiveQuestion" title="Report This Question">';
    html += '        <span>🚩</span> <span>' + (reportedQuestions[q.questionId] ? 'Reported' : 'Report') + '</span>';
    html += '      </button>';
    html += '    </div>';
    html += '  </div>';

    // Question Texts
    html += '  <div class="question-text-group">';
    html += '    <div class="question-text-mr">' + q.question.mr + '</div>';
    if (q.question.en) {
      html += '    <div class="question-text-en">' + q.question.en + '</div>';
    }
    html += '  </div>';

    // Statement Block (if questionType === 'statement')
    if (q.questionType === 'statement' && q.statements && q.statements.length) {
      html += '  <div class="statements-block">';
      q.statements.forEach(function (st) {
        html += '    <div class="statement-row">';
        html += '      <span class="statement-index">(' + st.index + ')</span>';
        html += '      <div class="statement-body">';
        html += '        <span class="statement-mr">' + st.mr + '</span>';
        if (st.en) html += '        <span class="statement-en">' + st.en + '</span>';
        html += '      </div>';
        html += '    </div>';
      });
      html += '  </div>';

      if (q.questionPrompt) {
        html += '  <div class="statement-prompt-row">' + q.questionPrompt.mr + '</div>';
        if (q.questionPrompt.en) {
          html += '  <div class="question-text-en">' + q.questionPrompt.en + '</div>';
        }
      }
    }

    // Options List inside the SAME common container
    html += '  <div class="options-list-wrap" role="radiogroup" aria-label="पर्याय (Options)">';
    q.options.forEach(function (opt) {
      var isSelected = currentAnswer === opt.id;
      html += '    <div class="option-card-row ' + (isSelected ? 'is-selected' : '') + '" data-option-id="' + opt.id + '" role="radio" aria-checked="' + isSelected + '">';
      html += '      <div class="option-radio-ring">';
      html += '        <div class="option-radio-inner-dot"></div>';
      html += '      </div>';
      html += '      <div class="option-content-col">';
      html += '        <div class="option-top-row">';
      html += '          <span class="option-label-letter">' + opt.id + '.</span>';
      html += '          <span class="option-text-mr">' + opt.text.mr + '</span>';
      html += '        </div>';
      if (opt.text.en) {
        html += '        <div class="option-text-en">' + opt.text.en + '</div>';
      }
      html += '      </div>';
      html += '    </div>';
    });
    html += '  </div>';

    html += '</div>'; // End quiz-unified-box

    els.questionContent.innerHTML = html;

    // Reset only internal content scroll without moving document window
    if (els.questionViewport) {
      els.questionViewport.scrollTop = 0;
    }

    // Bind Option Selection — MANUAL PROGRESSION (Remains on same question)
    var optionCards = els.questionContent.querySelectorAll('.option-card-row');
    optionCards.forEach(function (card) {
      function choose(e) {
        if (e && e.preventDefault) e.preventDefault();
        var optId = card.getAttribute('data-option-id');
        handleOptionSelectManual(q.questionId, optId, card);
      }
      card.addEventListener('click', choose);
    });

    // Bind Active Question Report Button
    var btnActiveReport = document.getElementById('btnReportActiveQuestion');
    if (btnActiveReport) {
      btnActiveReport.addEventListener('click', function () {
        triggerReportForQuestion(index);
      });
    }

    renderPaletteGrids();
  }

  /* ==========================================================================
     7. Manual Answer Selection & Mark for Review (NO AUTO-NEXT)
     ========================================================================== */
  function handleOptionSelectManual(questionId, optionId, cardElement) {
    selectedAnswers[questionId] = optionId;
    persistState();

    // Visual immediate tactile selection update
    var allCards = els.questionContent.querySelectorAll('.option-card-row');
    allCards.forEach(function (c) {
      c.classList.remove('is-selected');
      c.setAttribute('aria-checked', 'false');
    });

    if (cardElement) {
      cardElement.classList.add('is-selected');
      cardElement.setAttribute('aria-checked', 'true');
    }

    // Update Palette immediately to 'Answered'
    renderPaletteGrids();
    updateNavigationControls();
  }

  function updateFooterMarkReviewState(questionId) {
    if (!els.markReviewBtn) return;
    var isMarked = !!markedQuestions[questionId];

    if (isMarked) {
      els.markReviewBtn.classList.add('is-marked');
      if (els.markReviewStar) els.markReviewStar.textContent = '★';
      if (els.markReviewText) els.markReviewText.textContent = 'Marked for Review';
    } else {
      els.markReviewBtn.classList.remove('is-marked');
      if (els.markReviewStar) els.markReviewStar.textContent = '☆';
      if (els.markReviewText) els.markReviewText.textContent = 'Mark for Review';
    }
  }

  function toggleCurrentMarkReviewManual() {
    if (!quizData || !quizData.questions[currentQuestionIndex]) return;
    var qId = quizData.questions[currentQuestionIndex].questionId;

    if (markedQuestions[qId]) {
      delete markedQuestions[qId];
    } else {
      markedQuestions[qId] = true;
    }

    updateFooterMarkReviewState(qId);
    persistState();
    renderPaletteGrids();
  }

  /* ==========================================================================
     8. Question Palette (Desktop Right + Mobile 55vw Left Drawer)
     ========================================================================== */
  function getQuestionStatus(qId) {
    var isAns = !!selectedAnswers[qId];
    var isMrk = !!markedQuestions[qId];
    var isVis = !!visitedQuestions[qId];

    if (isAns && isMrk) return 'answered-marked';
    if (isMrk) return 'marked';
    if (isAns) return 'answered';
    return isVis ? 'not-visited' : 'not-visited';
  }

  function renderPaletteGrids() {
    if (!quizData) return;
    var questions = quizData.questions;

    function buildButtonsHtml() {
      var html = '';
      questions.forEach(function (q, idx) {
        var status = getQuestionStatus(q.questionId);
        var isCurr = idx === currentQuestionIndex;
        var numStr = (idx + 1 < 10 ? '0' : '') + (idx + 1);

        html += '<button type="button" class="palette-btn-num ' + status + ' ' + (isCurr ? 'is-current' : '') + '" data-goto="' + idx + '" aria-label="Question ' + (idx + 1) + ', ' + status + '">';
        html += numStr;
        html += '</button>';
      });
      return html;
    }

    var btnsHtml = buildButtonsHtml();

    if (els.desktopPaletteGrid) els.desktopPaletteGrid.innerHTML = btnsHtml;
    if (els.mobilePaletteGrid) els.mobilePaletteGrid.innerHTML = btnsHtml;

    // Attach listeners
    var allPaletteBtns = document.querySelectorAll('.palette-btn-num');
    allPaletteBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetIndex = parseInt(btn.getAttribute('data-goto'), 10);
        closeMobilePalette();
        renderQuestion(targetIndex);
      });
    });
  }

  function openMobilePalette() {
    if (els.mobilePaletteOverlay && els.mobilePaletteDrawer) {
      els.mobilePaletteOverlay.classList.add('is-open');
      els.mobilePaletteDrawer.classList.add('is-open');
    }
  }

  function closeMobilePalette() {
    if (els.mobilePaletteOverlay && els.mobilePaletteDrawer) {
      els.mobilePaletteOverlay.classList.remove('is-open');
      els.mobilePaletteDrawer.classList.remove('is-open');
    }
  }

  /* ==========================================================================
     9. Navigation Controls & Modals
     ========================================================================== */
  function updateNavigationControls() {
    var total = quizData.questions.length;
    var isFirst = currentQuestionIndex === 0;
    var isLast = currentQuestionIndex === total - 1;

    if (els.prevBtn) els.prevBtn.disabled = isFirst;

    if (isLast) {
      if (els.nextBtn) els.nextBtn.style.display = 'none';
      if (els.submitBtn) els.submitBtn.style.display = 'inline-flex';
    } else {
      if (els.nextBtn) els.nextBtn.style.display = 'inline-flex';
      if (els.submitBtn) els.submitBtn.style.display = 'none';
    }
  }

  function goPrev() {
    if (currentQuestionIndex > 0) {
      renderQuestion(currentQuestionIndex - 1);
    }
  }

  function goNext() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      renderQuestion(currentQuestionIndex + 1);
    }
  }

  // Exit Modal
  function openExitModal() {
    if (els.exitModal) els.exitModal.classList.add('is-open');
  }

  function closeExitModal() {
    if (els.exitModal) els.exitModal.classList.remove('is-open');
  }

  function confirmExit() {
    clearActiveState();
    window.location.href = '../subjects/prelims/history.html';
  }

  // Submit Modal
  function openSubmitModal() {
    if (!els.submitModal || !quizData) return;

    var total = quizData.questions.length;
    var answered = 0;
    var marked = 0;

    quizData.questions.forEach(function (q) {
      if (selectedAnswers[q.questionId]) answered++;
      if (markedQuestions[q.questionId]) marked++;
    });

    var unanswered = total - answered;

    var valAns = document.getElementById('statValAnswered');
    var valUnans = document.getElementById('statValUnanswered');
    var valMark = document.getElementById('statValMarked');

    if (valAns) valAns.textContent = answered;
    if (valUnans) valUnans.textContent = unanswered;
    if (valMark) valMark.textContent = marked;

    els.submitModal.classList.add('is-open');
  }

  function closeSubmitModal() {
    if (els.submitModal) els.submitModal.classList.remove('is-open');
  }

  function handleAutoSubmit() {
    closeExitModal();
    closeSubmitModal();
    executeSubmission(true);
  }

  /* ==========================================================================
     10. Redesigned "चाचणी विश्लेषण अहवाल" MPSC Performance Dashboard
     ========================================================================== */
  function executeSubmission(wasTimeout) {
    recordCurrentQuestionTime();
    clearInterval(timerInterval);
    isSubmitted = true;
    clearActiveState();

    var totalQuestions = quizData.questions.length;
    var totalMarks = quizData.totalMarks || totalQuestions;
    var negRate = quizData.negativeMarkingPerWrong || 0.25;

    var correctCount = 0;
    var wrongCount = 0;
    var unansweredCount = 0;

    // Track chapter performance
    var chapterStats = {};

    quizData.questions.forEach(function (q) {
      var chId = q.chapterId || quizData.chapterId || 'H-01';
      var chName = quizData.chapterNameMr || 'आधुनिक भारताचा इतिहास';

      if (!chapterStats[chId]) {
        chapterStats[chId] = {
          name: chName,
          total: 0,
          attempted: 0,
          correct: 0,
          wrong: 0
        };
      }
      chapterStats[chId].total++;

      var userAns = selectedAnswers[q.questionId];
      if (!userAns) {
        unansweredCount++;
      } else if (userAns === q.correctAnswer) {
        correctCount++;
        chapterStats[chId].attempted++;
        chapterStats[chId].correct++;
      } else {
        wrongCount++;
        chapterStats[chId].attempted++;
        chapterStats[chId].wrong++;
      }
    });

    var grossMarks = correctCount * 1.0;
    var negativeMarksTotal = wrongCount * negRate;
    var finalScore = Math.max(0, grossMarks - negativeMarksTotal);
    finalScore = Math.round(finalScore * 100) / 100;

    var accuracy = (correctCount + wrongCount > 0)
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;

    var percentage = Math.round((finalScore / totalMarks) * 100);

    // Calculate time taken
    var timeTakenFormatted = '—';
    var totalSecondsAllocated = configuredDurationMinutes * 60;
    var timeTakenSeconds = 0;

    if (!isNoTimeLimit) {
      timeTakenSeconds = Math.max(0, totalSecondsAllocated - remainingSeconds);
      var minsTaken = Math.floor(timeTakenSeconds / 60);
      var secsTaken = timeTakenSeconds % 60;
      timeTakenFormatted = minsTaken + ' min ' + (secsTaken < 10 ? '0' : '') + secsTaken + ' sec';
    } else {
      // Sum question time spent
      Object.keys(questionTimeSpent).forEach(function (k) {
        timeTakenSeconds += (questionTimeSpent[k] || 0);
      });
      var m = Math.floor(timeTakenSeconds / 60);
      var s = timeTakenSeconds % 60;
      timeTakenFormatted = m + ' min ' + (s < 10 ? '0' : '') + s + ' sec (No Limit)';
    }

    var avgTimePerQ = (totalQuestions > 0)
      ? Math.round(timeTakenSeconds / totalQuestions)
      : 0;

    renderResultScreen({
      score: finalScore,
      totalMarks: totalMarks,
      percentage: percentage,
      correct: correctCount,
      wrong: wrongCount,
      unanswered: unansweredCount,
      accuracy: accuracy,
      negativeDeduction: negativeMarksTotal,
      timeTaken: timeTakenFormatted,
      avgTimePerQ: avgTimePerQ,
      chapterStats: chapterStats,
      wasTimeout: wasTimeout
    });
  }

  function renderResultScreen(results) {
    if (els.setupView) els.setupView.style.display = 'none';
    if (els.activeRunnerView) els.activeRunnerView.style.display = 'none';

    var totalQ = quizData.questions.length;
    var pctCorrect = totalQ > 0 ? ((results.correct / totalQ) * 100) : 0;
    var pctWrong = totalQ > 0 ? ((results.wrong / totalQ) * 100) : 0;
    var pctUnans = totalQ > 0 ? ((results.unanswered / totalQ) * 100) : 0;

    // SVG Score Ring Calculations (radius 40, circ = 251.32)
    var circ = 251.32;
    var ringOffset = circ - ((results.percentage / 100) * circ);

    var html = '';
    html += '<div class="result-viewport-scroll">';
    html += '  <div class="result-card-container">';

    // =========================================================================
    // 1. REDESIGNED: "चाचणी विश्लेषण अहवाल" HERO BOX
    // =========================================================================
    html += '    <div class="score-hero-card">';
    html += '      <div class="score-hero-header-row">';
    html += '        <h2 class="score-hero-main-title">चाचणी विश्लेषण अहवाल</h2>';
    html += '        <span class="score-hero-subtag">MPSC Group C 2026</span>';
    html += '      </div>';

    // Dashboard Core: SVG Ring + Trio Metrics
    html += '      <div class="score-hero-dashboard-core">';
    
    // SVG Circular Score Ring Indicator
    html += '        <div class="score-ring-wrap">';
    html += '          <svg class="score-ring-svg" viewBox="0 0 100 100">';
    html += '            <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--quiz-border)" stroke-width="10"></circle>';
    html += '            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2E7D32" stroke-width="10" stroke-dasharray="' + circ + '" stroke-dashoffset="' + ringOffset + '" stroke-linecap="round"></circle>';
    html += '          </svg>';
    html += '          <div class="score-ring-center">';
    html += '            <span class="score-ring-val">' + results.score + '</span>';
    html += '            <span class="score-ring-total">/ ' + results.totalMarks + '</span>';
    html += '            <span class="score-ring-pct">' + results.percentage + '%</span>';
    html += '          </div>';
    html += '        </div>';

    // Trio Metrics (Correct, Wrong, Unanswered)
    html += '        <div class="hero-trio-metrics">';
    html += '          <div class="hero-trio-box"><span class="hero-trio-num correct">' + results.correct + '</span><span class="hero-trio-lbl">बरोबर</span></div>';
    html += '          <div class="hero-trio-box"><span class="hero-trio-num wrong">' + results.wrong + '</span><span class="hero-trio-lbl">चुकीचे</span></div>';
    html += '          <div class="hero-trio-box"><span class="hero-trio-num unans">' + results.unanswered + '</span><span class="hero-trio-lbl">सोडवले नाही</span></div>';
    html += '        </div>';
    html += '      </div>';

    // Compact Visual Breakdown Bar
    html += '      <div class="hero-stacked-bar-wrap">';
    html += '        <div class="hero-stacked-bar-head">';
    html += '          <span>कामगिरी प्रमाण (Distribution)</span>';
    html += '          <span>अचूकता: ' + results.accuracy + '%</span>';
    html += '        </div>';
    html += '        <div class="hero-stacked-bar">';
    if (pctCorrect > 0) html += '  <div class="stacked-segment correct" style="width:' + pctCorrect + '%;" title="Correct: ' + results.correct + '"></div>';
    if (pctWrong > 0)   html += '  <div class="stacked-segment wrong" style="width:' + pctWrong + '%;" title="Wrong: ' + results.wrong + '"></div>';
    if (pctUnans > 0)   html += '  <div class="stacked-segment unans" style="width:' + pctUnans + '%;" title="Unanswered: ' + results.unanswered + '"></div>';
    html += '        </div>';
    html += '      </div>';

    // Analytics Summary Grid
    html += '      <div class="result-analytics-grid">';
    html += '        <div class="analytics-card"><span class="analytics-val">' + totalQ + '</span><span class="analytics-lbl">एकूण प्रश्न</span></div>';
    html += '        <div class="analytics-card"><span class="analytics-val">' + (results.correct + results.wrong) + '</span><span class="analytics-lbl">सोडवलेले</span></div>';
    html += '        <div class="analytics-card"><span class="analytics-val">' + results.accuracy + '%</span><span class="analytics-lbl">अचूकता (Accuracy)</span></div>';
    html += '        <div class="analytics-card"><span class="analytics-val" style="color:var(--status-wrong);">- ' + results.negativeDeduction + '</span><span class="analytics-lbl">उणे गुण</span></div>';
    html += '        <div class="analytics-card"><span class="analytics-val">' + results.timeTaken + '</span><span class="analytics-lbl">घेतलेला वेळ</span></div>';
    html += '        <div class="analytics-card"><span class="analytics-val">' + results.avgTimePerQ + 's</span><span class="analytics-lbl">सरासरी वेळ / प्रश्न</span></div>';
    html += '      </div>';

    // Top Action Buttons
    html += '      <div class="result-actions-bar">';
    html += '        <button type="button" class="btn-result-action btn-review-answers" id="btnScrollToReview">तपशीलवार उत्तर पत्रिका (Review Answers) ↓</button>';
    html += '        <a href="../subjects/prelims/history.html" class="btn-result-action btn-back-subject">इतिहास विषयाकडे परत जा</a>';
    html += '      </div>';
    html += '    </div>'; // End score-hero-card

    // =========================================================================
    // 2. Chapter-wise Performance
    // =========================================================================
    html += '    <div class="analysis-section-card">';
    html += '      <h3 class="analysis-section-title"><span>घटकनिहाय कामगिरी (Chapter-wise Performance)</span><span style="font-size:0.75rem; color:var(--quiz-text-muted);">अभ्यास विश्लेषण</span></h3>';
    html += '      <div class="chapter-perf-list">';

    Object.keys(results.chapterStats).forEach(function (chKey) {
      var ch = results.chapterStats[chKey];
      var chAcc = ch.attempted > 0 ? Math.round((ch.correct / ch.attempted) * 100) : 0;
      html += '        <div class="chapter-perf-row">';
      html += '          <div class="chapter-perf-header">';
      html += '            <span class="chapter-perf-name">' + ch.name + '</span>';
      html += '            <span class="chapter-perf-score">' + ch.correct + '/' + ch.total + ' बरोबर (' + chAcc + '%)</span>';
      html += '          </div>';
      html += '          <div class="chapter-perf-progress">';
      html += '            <div class="chapter-perf-fill" style="width:' + chAcc + '%;"></div>';
      html += '          </div>';
      html += '        </div>';
    });

    html += '      </div>';
    html += '    </div>';

    // =========================================================================
    // 3. Question Performance Quick Grid
    // =========================================================================
    html += '    <div class="analysis-section-card">';
    html += '      <h3 class="analysis-section-title"><span>प्रश्न स्थिती तालिका (Question Performance)</span><span style="font-size:0.75rem; color:var(--quiz-text-muted);">तपासण्यासाठी क्लिक करा</span></h3>';
    html += '      <div class="question-pills-grid">';

    quizData.questions.forEach(function (q, idx) {
      var userAns = selectedAnswers[q.questionId];
      var isCorrect = userAns === q.correctAnswer;
      var isUnanswered = !userAns;
      var numStr = (idx + 1 < 10 ? '0' : '') + (idx + 1);

      var pillClass = isCorrect ? 'is-correct' : (isUnanswered ? 'is-unanswered' : 'is-wrong');
      var icon = isCorrect ? '✓' : (isUnanswered ? '—' : '✕');

      html += '        <button type="button" class="q-status-pill-btn ' + pillClass + '" data-scroll-q="' + idx + '">';
      html += numStr + ' ' + icon;
      html += '        </button>';
    });

    html += '      </div>';
    html += '    </div>';

    // =========================================================================
    // 4. Detailed Answer Review Section
    // =========================================================================
    html += '    <div class="review-questions-section" id="reviewQuestionsSection">';
    html += '      <h3 style="font-size:1.1rem; font-weight:800; color:var(--quiz-text); margin:0.4rem 0 0;">तपशीलवार उत्तर पत्रिका व स्पष्टीकरण (Detailed Review)</h3>';

    quizData.questions.forEach(function (q, idx) {
      var userAns = selectedAnswers[q.questionId];
      var isCorrect = userAns === q.correctAnswer;
      var isUnanswered = !userAns;

      var cardClass = isCorrect ? 'is-correct-card' : (isUnanswered ? 'is-unanswered-card' : 'is-wrong-card');
      var statusClass = isCorrect ? 'correct' : (isUnanswered ? 'unanswered' : 'wrong');
      var statusLabel = isCorrect ? '✓ बरोबर (+1.0)' : (isUnanswered ? '— सोडवले नाही (0.0)' : '✗ चुकीचे (-' + (quizData.negativeMarkingPerWrong || 0.25) + ')');

      var userAnsText = '—';
      var correctAnsText = '—';

      q.options.forEach(function (opt) {
        if (opt.id === userAns) userAnsText = opt.id + '. ' + opt.text.mr;
        if (opt.id === q.correctAnswer) correctAnsText = opt.id + '. ' + opt.text.mr;
      });

      var isReported = !!reportedQuestions[q.questionId];

      html += '      <div class="review-item-card ' + cardClass + '" id="review-card-item-' + idx + '">';
      html += '        <div style="display:flex; justify-content:space-between; align-items:center;">';
      html += '          <span style="font-size:0.8rem; font-weight:800; color:var(--quiz-primary);">प्रश्न ' + (idx + 1) + '</span>';
      html += '          <span class="review-status-badge ' + statusClass + '">' + statusLabel + '</span>';
      html += '        </div>';

      html += '        <div style="font-size:0.98rem; font-weight:700; color:var(--quiz-text);">' + q.question.mr + '</div>';
      if (q.question.en) {
        html += '        <div style="font-size:0.85rem; color:var(--quiz-text-muted);">' + q.question.en + '</div>';
      }

      // Review answers summary box
      html += '        <div class="review-options-summary">';
      html += '          <div><strong>आपले उत्तर:</strong> <span style="color:' + (isCorrect ? '#2E7D32' : (isUnanswered ? 'inherit' : '#C62828')) + ';">' + userAnsText + '</span></div>';
      html += '          <div><strong>योग्य उत्तर:</strong> <span style="color:#2E7D32; font-weight:700;">' + correctAnsText + '</span></div>';
      html += '        </div>';

      // Explanation box
      if (q.explanation) {
        html += '        <div class="review-explanation-box">';
        html += '          <div><strong>स्पष्टीकरण:</strong> ' + q.explanation.mr + '</div>';
        if (q.explanation.en) {
          html += '          <div style="margin-top:4px; font-size:0.8rem; color:var(--quiz-text-muted);">' + q.explanation.en + '</div>';
        }
        html += '        </div>';
      }

      // Footer with individual Report This Question button
      html += '        <div class="review-card-footer">';
      html += '          <span>घटक: ' + (quizData.chapterNameMr || 'इतिहास') + '</span>';
      html += '          <button type="button" class="btn-report-question ' + (isReported ? 'is-reported' : '') + '" data-report-qidx="' + idx + '" id="btnReportReviewQ_' + q.questionId + '">';
      html += '            <span>🚩</span> <span>' + (isReported ? 'Reported' : 'Report This Question') + '</span>';
      html += '          </button>';
      html += '        </div>';

      html += '      </div>'; // End review-item-card
    });

    html += '    </div>'; // End review section
    html += '  </div>';
    html += '</div>';

    if (els.resultContainer) {
      els.resultContainer.innerHTML = html;
      els.resultContainer.style.display = 'flex';
    }

    var scrollToRevBtn = document.getElementById('btnScrollToReview');
    if (scrollToRevBtn) {
      scrollToRevBtn.addEventListener('click', function () {
        var revSec = document.getElementById('reviewQuestionsSection');
        if (revSec) revSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Bind Quick Navigation Pills
    var quickNavPills = document.querySelectorAll('.q-status-pill-btn');
    quickNavPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var targetQ = pill.getAttribute('data-scroll-q');
        var card = document.getElementById('review-card-item-' + targetQ);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    // Bind individual Report Question Buttons in Review
    var reportBtns = document.querySelectorAll('.btn-report-question');
    reportBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qIdx = parseInt(btn.getAttribute('data-report-qidx'), 10);
        triggerReportForQuestion(qIdx);
      });
    });
  }

  /* ==========================================================================
     11. FINAL Question Reporting System (Google Apps Script Web App)
     ========================================================================== */
  function triggerReportForQuestion(questionIdx) {
    if (!quizData || !quizData.questions[questionIdx]) return;
    var targetQ = quizData.questions[questionIdx];

    openReportModal({
      quizId: quizData.quizId || 'H-CH01-001',
      questionId: targetQ.questionId,
      questionNumber: questionIdx + 1,
      subject: quizData.subjectNameMr || quizData.subject || 'इतिहास',
      chapter: targetQ.chapterId || quizData.chapterId || 'H-01',
      question: targetQ.question.mr || targetQ.question.en || ''
    });
  }

  function openReportModal(payload) {
    activeReportPayload = payload;
    if (!els.reportModal) return;

    var reportInfoBox = document.getElementById('reportTargetInfo');
    if (reportInfoBox) {
      var questionSnippet = payload.question.length > 90
        ? payload.question.substring(0, 90) + '...'
        : payload.question;

      reportInfoBox.innerHTML = 
        '<div><strong>Quiz ID:</strong> ' + payload.quizId + ' • <strong>Question:</strong> #' + payload.questionNumber + ' (' + payload.questionId + ')</div>' +
        '<div><strong>Chapter:</strong> ' + payload.chapter + ' • <strong>Subject:</strong> ' + payload.subject + '</div>' +
        '<div style="margin-top:4px; color:var(--quiz-text-muted); font-style:italic;">"' + questionSnippet + '"</div>';
    }

    // Reset form elements
    var issueSelect = document.getElementById('reportIssueSelect');
    var detailsTextarea = document.getElementById('reportDetailsTextarea');
    var errorEl = document.getElementById('reportValidationError');
    var submitBtn = document.getElementById('btnSubmitReport');

    if (issueSelect) {
      issueSelect.value = '';
      issueSelect.classList.remove('has-error');
    }
    if (detailsTextarea) {
      detailsTextarea.value = '';
    }
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = 'Please select an issue.';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    }

    isSubmittingReport = false;
    els.reportModal.classList.add('is-open');

    if (issueSelect) {
      setTimeout(function () {
        issueSelect.focus();
      }, 50);
    }
  }

  function closeReportModal() {
    if (els.reportModal) els.reportModal.classList.remove('is-open');
    activeReportPayload = null;
    isSubmittingReport = false;
  }

  function executeReportSubmission() {
    if (!activeReportPayload || isSubmittingReport) return;

    var issueSelect = document.getElementById('reportIssueSelect');
    var detailsTextarea = document.getElementById('reportDetailsTextarea');
    var errorEl = document.getElementById('reportValidationError');
    var submitBtn = document.getElementById('btnSubmitReport');

    var issueValue = issueSelect ? issueSelect.value.trim() : '';

    // Validation: Issue dropdown is REQUIRED
    if (!issueValue) {
      if (errorEl) {
        errorEl.textContent = 'Please select an issue.';
        errorEl.style.display = 'block';
      }
      if (issueSelect) {
        issueSelect.classList.add('has-error');
        issueSelect.focus();
      }
      return;
    }

    if (errorEl) errorEl.style.display = 'none';
    if (issueSelect) issueSelect.classList.remove('has-error');

    var additionalDetailsValue = detailsTextarea ? detailsTextarea.value.trim() : '';

    var payload = {
      quizId: activeReportPayload.quizId,
      questionId: activeReportPayload.questionId,
      questionNumber: activeReportPayload.questionNumber,
      subject: activeReportPayload.subject,
      chapter: activeReportPayload.chapter,
      question: activeReportPayload.question,
      issue: issueValue,
      additionalDetails: additionalDetailsValue
    };

    var reportedQId = activeReportPayload.questionId;

    // Duplicate submission protection
    isSubmittingReport = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    // Send data to Google Apps Script Web App
    fetch(REPORT_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
      .then(function () {
        reportedQuestions[reportedQId] = true;
        persistState();
        updateReportButtonsState(reportedQId);
        showToast('Report submitted successfully.');
        closeReportModal();
      })
      .catch(function (err) {
        console.error('Google Sheets report error:', err);
        isSubmittingReport = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Report';
        }
        if (errorEl) {
          errorEl.textContent = 'Failed to submit report. Please check your connection and try again.';
          errorEl.style.display = 'block';
        }
      });
  }

  function updateReportButtonsState(questionId) {
    var btnActive = document.getElementById('btnReportActiveQuestion');
    if (btnActive && quizData && quizData.questions[currentQuestionIndex] && quizData.questions[currentQuestionIndex].questionId === questionId) {
      btnActive.classList.add('is-reported');
      btnActive.innerHTML = '<span>🚩</span> <span>Reported</span>';
    }

    var btnReview = document.getElementById('btnReportReviewQ_' + questionId);
    if (btnReview) {
      btnReview.classList.add('is-reported');
      btnReview.innerHTML = '<span>🚩</span> <span>Reported</span>';
    }
  }

  function showToast(message) {
    var existingToast = document.querySelector('.quiz-toast-notification');
    if (existingToast && existingToast.parentNode) {
      existingToast.parentNode.removeChild(existingToast);
    }

    var toast = document.createElement('div');
    toast.className = 'quiz-toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('is-visible');
    }, 20);

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  /* ==========================================================================
     12. Event Listeners & Binding
     ========================================================================== */
  function bindEvents() {
    // Setup Screen Controls
    var timePresetBtns = document.querySelectorAll('.btn-time-preset');
    timePresetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleTimePresetSelect(btn);
      });
    });

    var fontPresetBtns = document.querySelectorAll('.btn-setup-font');
    fontPresetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleSetupFontSelect(btn);
      });
    });

    if (els.btnSetupStartQuiz) {
      els.btnSetupStartQuiz.addEventListener('click', validateAndStartQuiz);
    }

    if (els.btnSetupBack) {
      els.btnSetupBack.addEventListener('click', function () {
        window.location.href = '../subjects/prelims/history.html';
      });
    }

    // Active Quiz Navigation controls
    if (els.prevBtn) els.prevBtn.addEventListener('click', goPrev);
    if (els.nextBtn) els.nextBtn.addEventListener('click', goNext);
    if (els.submitBtn) els.submitBtn.addEventListener('click', openSubmitModal);
    if (els.exitBtn) els.exitBtn.addEventListener('click', openExitModal);
    if (els.mobileExitBtn) els.mobileExitBtn.addEventListener('click', openExitModal);

    // Font Toggle in Header (Desktop & Mobile)
    if (els.fontToggleBtn) els.fontToggleBtn.addEventListener('click', cycleFontSize);
    if (els.mobileFontToggleBtn) els.mobileFontToggleBtn.addEventListener('click', cycleFontSize);

    // Mark for Review (Manual Toggle — Remains on current question)
    if (els.markReviewBtn) els.markReviewBtn.addEventListener('click', toggleCurrentMarkReviewManual);

    // Mobile Left Palette Drawer Toggle
    if (els.mobilePaletteToggle) els.mobilePaletteToggle.addEventListener('click', openMobilePalette);
    if (els.mobilePaletteClose) els.mobilePaletteClose.addEventListener('click', closeMobilePalette);
    if (els.mobilePaletteOverlay) els.mobilePaletteOverlay.addEventListener('click', closeMobilePalette);

    // Exit Modal Buttons
    var btnCancelExit = document.getElementById('btnCancelExit');
    var btnConfirmExit = document.getElementById('btnConfirmExit');
    if (btnCancelExit) btnCancelExit.addEventListener('click', closeExitModal);
    if (btnConfirmExit) btnConfirmExit.addEventListener('click', confirmExit);

    // Submit Modal Buttons
    var btnCancelSubmit = document.getElementById('btnCancelSubmit');
    var btnConfirmSubmit = document.getElementById('btnConfirmSubmit');
    if (btnCancelSubmit) btnCancelSubmit.addEventListener('click', closeSubmitModal);
    if (btnConfirmSubmit) btnConfirmSubmit.addEventListener('click', function () {
      closeSubmitModal();
      executeSubmission(false);
    });

    // Report Modal Controls (English only action buttons)
    var btnCancelReport = document.getElementById('btnCancelReport');
    var btnSubmitReport = document.getElementById('btnSubmitReport');
    var btnCloseReportX = document.getElementById('btnCloseReportX');
    var issueSelect = document.getElementById('reportIssueSelect');

    if (btnCancelReport) btnCancelReport.addEventListener('click', closeReportModal);
    if (btnCloseReportX) btnCloseReportX.addEventListener('click', closeReportModal);
    if (btnSubmitReport) btnSubmitReport.addEventListener('click', executeReportSubmission);

    if (issueSelect) {
      issueSelect.addEventListener('change', function () {
        var errorEl = document.getElementById('reportValidationError');
        if (issueSelect.value.trim()) {
          issueSelect.classList.remove('has-error');
          if (errorEl) errorEl.style.display = 'none';
        }
      });
    }

    // Keyboard ESC to close open modals or left palette
    document.addEventListener('keydown', function (e) {
      if (isSubmitted && (!els.reportModal || !els.reportModal.classList.contains('is-open'))) return;
      if (e.key === 'Escape') {
        closeMobilePalette();
        closeExitModal();
        closeSubmitModal();
        closeReportModal();
      }
    });

    // Prevent accidental reload during active quiz
    window.addEventListener('beforeunload', function (e) {
      if (!isSubmitted && els.activeRunnerView && els.activeRunnerView.style.display === 'flex') {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  /* ==========================================================================
     13. Engine Entry
     ========================================================================== */
  function init() {
    initElements();
    bindEvents();
    loadQuiz();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();