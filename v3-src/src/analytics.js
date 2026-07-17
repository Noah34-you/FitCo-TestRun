/* ============================================================
   FitCo analytics — one PostHog init for the whole app.
   Explicit events only: no autocapture, no session recording,
   no PII. Every call is a safe no-op when no key is configured
   (key comes from VITE_PUBLIC_POSTHOG_KEY at build time, or
   /posthog-config.js at runtime — the key is publishable).
   ============================================================ */
import posthog from 'posthog-js';

let ready = false;

export function initAnalytics() {
  if (ready) return;
  const cfg = (typeof window !== 'undefined' && window.__FITCO_PH__) || {};
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || cfg.key || '';
  const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || cfg.host || 'https://us.i.posthog.com';
  if (!key) return;
  posthog.init(key, {
    api_host: host,
    capture_pageview: false,        // hash-routed SPA — views are explicit events
    autocapture: false,             // autocapture can pick up on-screen text; we send named events only
    disable_session_recording: true,
    person_profiles: 'identified_only',
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
  if (!ready) return;
  try { posthog.capture(event, props); } catch { /* analytics must never break the product */ }
}

export const retailerOf = (link) => {
  try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return undefined; }
};
