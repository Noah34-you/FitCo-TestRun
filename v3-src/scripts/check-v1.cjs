/* Bounded regression checks; run from v3-src with node scripts/check-v1.cjs. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { buildSync } = require('esbuild');
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
for (const thighRoom of ['close', 'some', 'plenty'])
for (const fitWrong of problems) {
  const a = { productType, build, height, legShape, thighRoom, fitWrong };
  assert.equal(state.completeAnswers(a), true);
  const score = current.computeScores(a);
  assert.ok(current.FIT_KEYS.includes(score.best));
  assert.equal(new Set(score.ranked).size, current.FIT_KEYS.length);
  assert.ok(current.rankProducts(a, score.best).results.length <= 4);
  cases++;
}
const answers = { productType: 'jeans', build: 'athletic', fitWrong: ['tightThighsSeat'], height: '60to62', legShape: 'tapered', thighRoom: 'some' };
for (const bad of [null, [], {}, { ...answers, build: 'unknown' }, { ...answers, fitWrong: [] },
  { ...answers, fitWrong: ['usuallyFine', 'waistGap'] }, { ...answers, fitWrong: ['waistGap', 'waistGap'] },
  { ...answers, fitWrong: ['waistGap', 'lengthOff', 'tooMuchFabric'] }, { ...answers, thighRoom: 'unknown' }]) assert.equal(state.completeAnswers(bad), false);
const closeScores = current.computeScores({ ...answers, build: 'average', fitWrong: ['usuallyFine'], thighRoom: 'close' }).final;
const roomyScores = current.computeScores({ ...answers, build: 'average', fitWrong: ['usuallyFine'], thighRoom: 'plenty' }).final;
assert.ok(closeScores.slimTaper > roomyScores.slimTaper);
assert.ok(roomyScores.relaxedFit > closeScores.relaxedFit);
const legacy = { ...answers, priority: 'balancedEveryday' };
delete legacy.thighRoom;
global.localStorage = { getItem: () => JSON.stringify(legacy), setItem: () => {} };
assert.equal(state.readSavedAnswers().thighRoom, 'some');
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
assert.ok(home.includes('Your proportions'));
assert.ok(!home.includes('↗'));
for (const fit of current.FIT_KEYS) {
  const image = render(load('src/FitShapeImage.jsx').default, { fit });
  assert.ok(image.includes('/images/quiz-leg-shapes/'));
  assert.ok(!image.includes('<svg'));
}
const report = render(load('src/screens/Report.jsx').default, { answers });
assert.ok(report.indexOf('<h1') < report.indexOf('Pants to start with'));
assert.ok(report.indexOf('Pants to start with') < report.indexOf('A couple of other shapes'));
assert.equal((report.match(/class="v1-product"/g) || []).length, 4);
assert.ok(!report.includes('UPDATED FROM YOUR ANSWERS'));
assert.ok(report.includes('Why this works for you'));
assert.ok(report.includes('Seat &amp; thigh'));
assert.ok(!report.includes('↗'));
for (const p of current.CATALOG.filter(p => p.img)) assert.ok(fs.existsSync(path.join(repo, p.img)), 'Missing product image ' + p.img);
for (const src of ['hero.webp', 'builds.webp', 'fit-problems.webp', 'fit-guide.webp']) {
  assert.ok(fs.statSync(path.join(root, 'public/media/v1', src)).size > 1000);
}
for (const src of ['jeans.webp', 'chinos.webp', 'technical.webp']) {
  assert.ok(fs.statSync(path.join(root, 'public/images/quiz-categories', src)).size > 5000);
}
for (const src of ['tapered.jpg', 'balanced.jpg', 'straight.jpg', 'relaxed.jpg']) {
  assert.ok(fs.statSync(path.join(root, 'public/images/quiz-leg-shapes', src)).size > 5000);
}
for (const file of ['about/index.html', 'shop/index.html', 'privacy/index.html', 'terms/index.html']) {
  const html = fs.readFileSync(path.join(repo, file), 'utf8');
  assert.ok(html.includes('/fitco-v1.css'));
  assert.ok(html.includes('/fitco-consent.js'));
}
console.log('PASS:', cases, 'answer combinations produce valid fit and product rankings with the new upper-leg room input.');
console.log('PASS: preference sensitivity, saved-answer migration, invalid/blocked storage, exclusive issue choices, six question surfaces, five guide crops, interactive report, catalog/media references, static page wiring.');
console.log('These are logic and server-render checks, not interactive browser or visual QA.');
