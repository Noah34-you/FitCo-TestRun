# FitCo trouser diagrams

Editable SVG exports of the five measurement diagrams (`thigh`, `seat`,
`rise`, `knee`, `opening`) plus `all-fits.svg`, a contact sheet of the six
fit silhouettes.

- Editable Figma reference: https://www.figma.com/design/Sx7lQQCMv4DPSlC8EHfQDN
- Regenerate from the actual React components (single source of truth —
  do not maintain a second drawing):

  ```
  cd v3-src
  node scripts/export-diagrams.mjs
  ```

  Brand color tokens are inlined as hex values during export; if the tokens
  in `v3-src/src/index.css` change, update the color map in the script.

These are illustrative fit diagrams. Their coordinates are not verified
product measurements or scale sewing patterns.
