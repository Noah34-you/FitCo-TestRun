/* ============================================================
   FitCo analytics, with one PostHog init for the whole app.
   Explicit events only: no autocapture, no session recording,
   no PII. Every call is a safe no-op when no key is configured
   (key comes from VITE_PUBLIC_POSTHOG_KEY at build time, or
   /posthog-config.js at runtime. The key is publishable).

   Nothing initialises until the visitor has granted consent via
   window.FitCoConsent (/fitco-consent.js), which also treats
   Global Privacy Control and Do Not Track as a standing opt-out.
   ============================================================ */
import posthog from 'posthog-js';

let ready = false;

function consentGranted() {
  const c = typeof window !== 'undefined' && window.FitCoConsent;
  return c ? c.granted() : false;   // absent gate = no tracking
}

export function initAnalytics() {
  if (ready) return;
  const cfg = (typeof window !== 'undefined' && window.__FITCO_PH__) || {};
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || cfg.key || '';
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || cfg.host || 'https://us.i.posthog.com';
  if (!key) return;
  if (!consentGranted()) {
    /* Start only if consent is granted later in this page view. */
    if (typeof window !== 'undefined' && window.FitCoConsent && !initAnalytics._bound) {
      initAnalytics._bound = true;
      window.FitCoConsent.onChange((ok) => { if (ok) initAnalytics(); });
    }
    return;
  }
  posthog.init(key, {
    api_host: host,
    capture_pageview: false,        // Hash-routed SPA; views are explicit events.
    autocapture: false,             // autocapture can pick up on-screen text; we send named events only
    disable_session_recording: true,
    person_profiles: 'identified_only',
    respect_dnt: true,
    disable_surveys: true,
  });
  ready = true;
  window.addEventListener('error', (e) =>
    track('Client Error', { view: window.location.hash || '#/', message: String(e.message || '').slice(0, 300) }));
  window.addEventListener('unhandledrejection', (e) =>
    track('Client Error', { view: window.location.hash || '#/', message: String((e.reason && e.reason.message) || e.reason || '').slice(0, 300) }));
}

/* Ring buffer (window.__fitcoEvents) so events can be inspected in the
   console with or without a key configured. */
export function track(event, props = {}) {
  if (typeof window !== 'undefined') {
    const log = (window.__fitcoEvents = window.__fitcoEvents || []);
    log.push({ event, ...props });
    if (log.length > 100) log.shift();
  }
  if (!ready || !consentGranted()) return;
  try { posthog.capture(event, props); } catch { /* analytics must never break the product */ }
}

export const retailerOf = (link) => {
  try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return undefined; }
};
