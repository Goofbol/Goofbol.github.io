/* =============================================
   NIHAAN MOHAMMED — PORTFOLIO V3
   Shared behavior across all five pages.
   ============================================= */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------
     BLUEPRINT TOGGLE — persisted across pages via localStorage
     ----------------------------------------------- */
  var BP_KEY = 'nm-blueprint';
  var toggle = document.getElementById('bp-toggle');
  var body = document.body;

  function setBlueprint(on) {
    body.classList.toggle('blueprint', on);
    if (toggle) toggle.setAttribute('aria-checked', String(on));
    try { localStorage.setItem(BP_KEY, on ? '1' : '0'); } catch (e) {}
  }

  (function initBlueprint() {
    var stored = null;
    try { stored = localStorage.getItem(BP_KEY); } catch (e) {}
    if (stored === '1') setBlueprint(true);
  })();

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = toggle.getAttribute('aria-checked') !== 'true';
      setBlueprint(next);
    });
  }

  /* -----------------------------------------------
     SCROLL / VISIBILITY REVEAL
     ----------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* -----------------------------------------------
     CONTACT REVEAL — emails assembled at runtime, never in markup
     ----------------------------------------------- */
  var contactBtn = document.getElementById('contact-btn');
  var contactReveal = document.getElementById('contact-reveal');
  var contactLinks = document.getElementById('contact-links');
  var revealed = false;

  function revealContact() {
    if (revealed || !contactBtn || !contactReveal || !contactLinks) return;
    revealed = true;
    contactBtn.setAttribute('aria-expanded', 'true');

    var email = ['reachme', '@', 'nihaanmohammed', '.', 'com'].join('');
    var linkedin = 'https://linkedin.com/in/nihaan-mohammed';
    var github = 'https://github.com/Goofbol';

    var rows = [
      { label: 'Email', value: email, href: 'mailto:' + email },
      { label: 'LinkedIn', value: 'nihaan-mohammed', href: linkedin },
      { label: 'GitHub', value: 'Goofbol', href: github }
    ];

    contactLinks.innerHTML = rows.map(function (r) {
      return '<div class="contact-row">' +
        '<span class="contact-label">' + r.label + '</span>' +
        '<span class="contact-value"><a href="' + r.href + '" target="_blank" rel="noopener noreferrer">' + r.value + '</a></span>' +
        '</div>';
    }).join('');

    contactReveal.classList.add('visible');
    contactReveal.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  if (contactBtn) contactBtn.addEventListener('click', revealContact);
  window.__revealContact = revealContact;

  /* -----------------------------------------------
     CASE FILES — expand/collapse toggle (work.html)
     ----------------------------------------------- */
  var caseCards = Array.prototype.slice.call(document.querySelectorAll('.case-card:not(.ghost)'));
  var caseFocusIdx = -1;

  function toggleCase(btn) {
    var panelId = btn.getAttribute('aria-controls');
    var panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    var isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all other case panels (single-open pattern for clean keyboard nav)
    caseCards.forEach(function (c) {
      if (c !== btn) {
        c.setAttribute('aria-expanded', 'false');
        var otherPanel = document.getElementById(c.getAttribute('aria-controls'));
        if (otherPanel) otherPanel.hidden = true;
      }
    });
    var next = !isOpen;
    btn.setAttribute('aria-expanded', String(next));
    panel.hidden = !next;
  }

  caseCards.forEach(function (btn) {
    btn.addEventListener('click', function () { toggleCase(btn); });
  });

  function setCaseFocus(idx) {
    if (!caseCards.length) return;
    caseFocusIdx = (idx + caseCards.length) % caseCards.length;
    caseCards.forEach(function (c, i) { c.classList.toggle('is-focused', i === caseFocusIdx); });
    caseCards[caseFocusIdx].focus();
  }

  /* -----------------------------------------------
     SHORTCUT OVERLAY (?)
     ----------------------------------------------- */
  var overlay = document.getElementById('shortcut-overlay');

  function openOverlay() {
    if (overlay) overlay.classList.add('visible');
  }
  function closeOverlay() {
    if (overlay) overlay.classList.remove('visible');
  }
  function overlayOpen() {
    return !!(overlay && overlay.classList.contains('visible'));
  }
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });
  }

  document.querySelectorAll('[data-overlay-open]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openOverlay();
    });
  });

  /* -----------------------------------------------
     KEYBOARD MODEL (global, single keys, no chords)
     H home · R route · W work · A about · E resume · C contact
     B blueprint · ? overlay · Esc close · arrows/enter in lists
     Inert when a text field is focused.
     ----------------------------------------------- */
  var PAGE_MAP = {
    H: 'index.html',
    R: 'route.html',
    W: 'work.html',
    A: 'about.html',
    L: 'library.html',
    E: 'resume.html'
  };

  function isTextInput(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  document.addEventListener('keydown', function (e) {
    if (isTextInput(document.activeElement)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    var key = e.key;

    if (key === 'Escape') {
      if (overlayOpen()) { closeOverlay(); e.preventDefault(); return; }
      var openCase = caseCards.filter(function (c) { return c.getAttribute('aria-expanded') === 'true'; });
      if (openCase.length) { toggleCase(openCase[0]); e.preventDefault(); return; }
      var cr = document.getElementById('contact-reveal');
      if (cr && cr.classList.contains('visible')) { /* contact reveal stays, no destructive close needed */ }
      return;
    }

    if (key === '?') {
      openOverlay();
      e.preventDefault();
      return;
    }

    if (overlayOpen()) return; // only Esc acts while overlay open

    var upper = key.length === 1 ? key.toUpperCase() : key;

    if (upper === 'B') {
      if (toggle) toggle.click();
      e.preventDefault();
      return;
    }

    if (upper === 'C') {
      revealContact();
      var wrap = document.querySelector('.contact-wrap') || document.getElementById('contact-btn');
      if (wrap) wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      e.preventDefault();
      return;
    }

    if (PAGE_MAP[upper]) {
      var current = (location.pathname.split('/').pop() || 'index.html');
      if (current !== PAGE_MAP[upper]) {
        window.location.href = PAGE_MAP[upper];
      }
      e.preventDefault();
      return;
    }

    // Case-file list navigation (work.html)
    if (caseCards.length) {
      if (key === 'ArrowDown' || key === 'ArrowRight') {
        setCaseFocus(caseFocusIdx < 0 ? 0 : caseFocusIdx + 1);
        e.preventDefault();
        return;
      }
      if (key === 'ArrowUp' || key === 'ArrowLeft') {
        setCaseFocus(caseFocusIdx < 0 ? 0 : caseFocusIdx - 1);
        e.preventDefault();
        return;
      }
      if (key === 'Enter' && document.activeElement && document.activeElement.classList.contains('case-card')) {
        toggleCase(document.activeElement);
        e.preventDefault();
        return;
      }
    }

    // Route chapter navigation (route.html) — delegated to page-level handler if present
    if (window.__routeNav) {
      if (key === 'ArrowRight') { window.__routeNav.next(); e.preventDefault(); return; }
      if (key === 'ArrowLeft') { window.__routeNav.prev(); e.preventDefault(); return; }
    }
  });

  /* -----------------------------------------------
     ACTIVE NAV LINK — mark current page in topbar
     ----------------------------------------------- */
  (function markActiveNav() {
    var current = (location.pathname.split('/').pop() || 'index.html');
    document.querySelectorAll('.nav-link').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === current) a.classList.add('active');
    });
  })();
})();
