/* Bounded regression checks; run from v3-src with node scripts/check-v1.cjs. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Module = require('node:module');
const { buildSync, transformSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const repo = path.resolve(root, '..');
function compile(code, name) {
  const m = new Module(path.join(root, name));
  m.filename = path.join(root, name);
  m.paths = Module._nodeModulePaths(root);
  m._compile(code, m.filename);
  return m.exports;
}
function load(file) {
  const result = buildSync({ entryPoints: [path.join(root, file)], bundle: true, write: false,
    format: 'cjs', platform: 'node', packages: 'external', jsx: 'automatic',
    loader: { '.css': 'empty' }, define: { 'import.meta.env': '{}' } });
  return compile(result.outputFiles[0].text, 'v1-check-module.cjs');
}
const current = load('src/engine.js');
const baselineSource = execFileSync('git', ['show', '9e0dd51:v3-src/src/engine.js'], { cwd: repo, encoding: 'utf8' });
const baseline = compile(transformSync(baselineSource, { format: 'cjs' }).code, 'v1-baseline.cjs');
const state = load('src/answer-state.js');
const fitting = load('src/screens/Fitting.jsx');
const render = (component, props = {}) => renderToStaticMarkup(React.createElement(component, props));
const problems = current.QUESTIONS[2].options.map(o => [o.v]);
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) problems.push([problems[i][0], problems[j][0]]);
let cases = 0;
for (const productType of ['jeans', 'chinos', 'technical', 'any'])
for (const build of ['slim', 'average', 'athletic', 'broader'])
for (const height of ['under58', '58to511', '60to62', '63plus'])
for (const legShape of ['tapered', 'balanced', 'straight', 'relaxed'])
for (const priority of ['cleanerSilhouette', 'balancedEveryday', 'maximumComfort'])
for (const fitWrong of problems) {
  const a = { productType, build, height, legShape, priority, fitWrong };
  assert.equal(state.completeAnswers(a), true);
  assert.deepEqual(current.computeScores(a), baseline.computeScores(a));
  assert.deepEqual(current.rankProducts(a, current.computeScores(a).best), baseline.rankProducts(a, baseline.computeScores(a).best));
  cases++;
}
const answers = { productType: 'jeans', build: 'athletic', fitWrong: ['tightThighsSeat'], height: '60to62', legShape: 'tapered', priority: 'balancedEveryday' };
for (const bad of [null, [], {}, { ...answers, build: 'unknown' }, { ...answers, fitWrong: [] },
  { ...answers, fitWrong: ['usuallyFine', 'waistGap'] }, { ...answers, fitWrong: ['waistGap', 'waistGap'] },
  { ...answers, fitWrong: ['waistGap', 'lengthOff', 'tooMuchFabric'] }]) assert.equal(state.completeAnswers(bad), false);
global.localStorage = { getItem: () => '{broken', setItem: () => { throw Error('storage blocked'); } };
assert.deepEqual(state.readSavedAnswers(), {});
assert.equal(state.saveLocally('test', 'value'), false);
const toggle = fitting.toggleFitProblem;
assert.deepEqual(toggle([], 'waistGap'), ['waistGap']);
assert.deepEqual(toggle(['waistGap'], 'usuallyFine'), ['usuallyFine']);
assert.deepEqual(toggle(['usuallyFine'], 'lengthOff'), ['lengthOff']);
assert.deepEqual(toggle(['waistGap', 'lengthOff'], 'tooMuchFabric'), ['waistGap', 'lengthOff']);
assert.deepEqual(toggle(['waistGap', 'lengthOff'], 'waistGap'), ['lengthOff']);
const initial = {};
for (const q of current.QUESTIONS) {
  const html = render(fitting.default, { initial: { ...initial } });
  assert.ok(html.includes(q.label.replaceAll('&', '&amp;')));
  assert.equal((html.match(/<input /g) || []).length, q.options.length);
  assert.ok(html.includes('<fieldset'));
  assert.ok(html.includes('type="submit" disabled=""'));
  initial[q.key] = answers[q.key];
}
const home = render(load('src/screens/Home.jsx').default, { hasReport: true });
assert.equal((home.match(/class="fit-detail-photo"/g) || []).length, 5);
assert.ok(home.includes('Return to your results'));
for (const fit of current.FIT_KEYS) {
  const svg = render(load('src/TrouserShape.jsx').default, { fit });
  assert.ok(!svg.includes('NaN'));
  assert.ok(svg.includes('Illustrative shape'));
}
const report = render(load('src/screens/Report.jsx').default, { answers });
assert.ok(report.indexOf('<h1') < report.indexOf('Pants to start with'));
assert.ok(report.indexOf('Pants to start with') < report.indexOf('A couple of other shapes'));
assert.equal((report.match(/class="v1-product"/g) || []).length, 4);
assert.ok(!report.includes('UPDATED FROM YOUR ANSWERS'));
for (const p of current.CATALOG.filter(p => p.img)) assert.ok(fs.existsSync(path.join(repo, p.img)), 'Missing product image ' + p.img);
for (const src of ['hero.webp', 'builds.webp', 'fit-problems.webp', 'fit-guide.webp']) {
  assert.ok(fs.statSync(path.join(root, 'public/media/v1', src)).size > 1000);
}
for (const file of ['about/index.html', 'shop/index.html', 'privacy/index.html', 'terms/index.html']) {
  const html = fs.readFileSync(path.join(repo, file), 'utf8');
  assert.ok(html.includes('/fitco-v1.css'));
  assert.ok(html.includes('/fitco-consent.js'));
}
console.log('PASS:', cases, 'answer combinations preserve scores and product ranking.');
console.log('PASS: invalid/blocked storage, exclusive issue choices, six question surfaces, five guide crops, report order, catalog/media references, static page wiring.');
console.log('These are logic and server-render checks, not interactive browser or visual QA.');
