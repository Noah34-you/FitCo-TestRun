// Export the actual React diagrams for Figma; do not maintain a second drawing.
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = path.resolve(root, '../design/trouser-diagrams');
const result = await build({
  stdin: {
    contents: `export { CoordDiagram } from './src/illustrations.jsx';
      export { PantFlat, GEO } from './src/geometry.jsx';
      export { createElement } from 'react';
      export { renderToStaticMarkup } from 'react-dom/server';`,
    resolveDir: root,
    loader: 'jsx',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  write: false,
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(process.cwd() + '/package.json');",
  },
});
const { CoordDiagram, PantFlat, GEO, createElement, renderToStaticMarkup } =
  await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
  );
const colors = {
  'var(--color-sage)': '#3C6B3C',
  'var(--color-ink-soft)': '#45423A',
  'var(--color-ink)': '#16150F',
  'var(--color-chalkline)': '#C39A45',
};
function standalone(element, prefix) {
  let svg = renderToStaticMarkup(element, { identifierPrefix: prefix });
  for (const [variable, color] of Object.entries(colors)) {
    svg = svg.replaceAll(variable, color);
  }
  return svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ') + '\n';
}
await mkdir(output, { recursive: true });
for (const zone of ['thigh', 'seat', 'rise', 'knee', 'opening']) {
  await writeFile(
    path.join(output, `${zone}.svg`),
    standalone(createElement(CoordDiagram, { zone }), `fitco-${zone}`)
  );
}
const flats = Object.entries(GEO).map(([key, g], index) => {
  const svg = standalone(createElement(PantFlat, { g }), `fitco-${key}`)
    .replace(
      '<svg ',
      `<svg x="${index * 210}" y="40" width="210" height="280" `
    );
  return `${svg}<text x="${index * 210 + 105}" y="345" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#45423A">${key}</text>`;
});
await writeFile(
  path.join(output, 'all-fits.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 370"><rect width="1260" height="370" fill="#F3F0E8"/>${flats.join('')}</svg>\n`
);
console.log('Exported five measurement diagrams and the six-fit contact sheet.');
