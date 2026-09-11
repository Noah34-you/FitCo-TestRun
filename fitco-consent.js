/* ============================================================
   FitCo consent gate.

   Analytics must not run before the visitor agrees. This file is
   the single source of truth for that decision and is loaded on
   every page ahead of any analytics code.

   Behaviour:
   - Global Privacy Control and Do Not Track are treated as a
     standing opt-out. We never prompt over them and never track.
   - Otherwise the choice is stored in localStorage under
     `fitco_consent` ("granted" | "denied") and nothing is
     captured until it reads "granted".
   - The banner is shown ONLY when analytics is actually
     configured (a PostHog key exists). Asking for cookie consent
     on a site that sets no cookies would itself be misleading.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'fitco_consent';
  var listeners = [];

  function signalledOptOut() {
    try {
      if (navigator.globalPrivacyControl === true) return true;
      var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
      return dnt === '1' || dnt === 'yes';
    } catch (e) { return false; }
  }

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function analyticsConfigured() {
    var cfg = window.__FITCO_PH__ || {};
    return !!cfg.key;
  }

  var C = {
    /* The only question the rest of the site should ask. */
    granted: function () {
      if (signalledOptOut()) return false;
      return stored() === 'granted';
    },
    optedOutBySignal: signalledOptOut,
    state: function () {
      if (signalledOptOut()) return 'signal-opt-out';
      return stored() || 'unset';
    },
    set: function (v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      listeners.forEach(function (fn) { try { fn(v === 'granted'); } catch (e) {} });
      render();
    },
    grant: function () { C.set('granted'); },
    deny:  function () { C.set('denied'); },
    /* Called when consent changes, so analytics can start without a reload. */
    onChange: function (fn) { listeners.push(fn); },
  };

  /* ---------- banner ---------- */
  function render() {
    var existing = document.getElementById('fitco-consent');
    if (existing) existing.remove();
    if (!analyticsConfigured()) return;      // nothing to consent to
    if (signalledOptOut()) return;           // respect the signal silently
    if (stored()) return;                    // already answered

    var bar = document.createElement('div');
    bar.id = 'fitco-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Analytics consent');
    bar.innerHTML =
      '<p>We’d like to use privacy-friendly analytics to see which parts of FitCo get used. ' +
      'No advertising, no session recording, no selling your data. ' +
      '<a href="/privacy/index.html">Privacy Policy</a></p>' +
      '<div class="fitco-consent-actions">' +
      '<button type="button" data-a="deny">Decline</button>' +
      '<button type="button" data-a="grant">Allow analytics</button>' +
      '</div>';
    document.body.appendChild(bar);
    bar.querySelector('[data-a="grant"]').addEventListener('click', function () { C.grant(); });
    bar.querySelector('[data-a="deny"]').addEventListener('click', function () { C.deny(); });
    var first = bar.querySelector('button');
    if (first) first.focus();
  }

  window.FitCoConsent = C;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
