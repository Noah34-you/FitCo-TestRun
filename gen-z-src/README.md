# FitCo Gen Z edition

This is the source for the audience-specific FitCo experience served at `/gen-z/`.
It is intentionally separate from the general FitCo source in `v3-src/`, while living
in the same repository so shared hosting, legal pages and analytics remain intact.

## Commands

```bash
npm ci
npm run build
npm run check
```

The build writes production files to the repository's `gen-z/` directory. The general
homepage at `/` is not modified by this build.

## Current limitations

- The four-item lineup is a concept display, not a verified retailer catalog.
- The Gen Z quiz is an early independent scoring prototype and does not yet use the
  general FitCo recommendation engine.
- The route is marked `noindex` until Noah approves it for launch and its remaining
  content, accessibility and product-data work is complete.

## Asset provenance

The initial React prototype and five image assets were supplied by Noah on 13 September
2026 in `OKComputer_FitCoV2截图.zip`. Retailer identity, product pricing and product-level
measurement claims are not assigned to these concept images.
