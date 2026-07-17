/* PostHog project config for all FitCo pages.
   Paste your Project API key (starts with "phc_") from
   PostHog -> Project Settings -> Project API key.
   This key is publishable by design: it can only ingest
   events, never read data. Leave key empty to disable
   analytics site-wide. */
window.__FITCO_PH__ = {
  key: '',
  host: 'https://us.i.posthog.com',
};
