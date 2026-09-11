/* Shared drafting geometry. Coordinates describe an illustrative flat,
   not a scale sewing pattern or verified product measurements. */
export const C = 230, WA = 90, BAND_T = 36, BAND_B = 54;
export const Y_SEAT = 122, Y_CROTCH = 174, Y_T = 186, Y_K = 340, Y_H = 508;
export function landmarks(g) {
  const hip = 109 + (g.wt - 78) * .35;
  const thigh = 108 + (g.wt - 78) * .6;
  return {
    hip, thigh,
    thighOuter: C - thigh, thighInner: C - 10,
    kneeOuter: C - 61 - g.wk / 2, kneeInner: C - 61 + g.wk / 2,
    hemOuter: C - 65 - g.wh / 2, hemInner: C - 65 + g.wh / 2,
  };
}
export function outlinePath(g) {
  const p = landmarks(g);
  // A continuous crotch joins two distinct legs. Each leg has its own
  // centerline, so changing the fit changes leg width rather than hip shape.
  return `M${C - WA},${BAND_B}
    Q${C - WA - 1},84 ${C - p.hip},${Y_SEAT}
    Q${C - p.hip - 2},151 ${p.thighOuter},${Y_T}
    C${p.thighOuter + 2},238 ${p.kneeOuter},292 ${p.kneeOuter},${Y_K}
    C${p.kneeOuter},398 ${p.hemOuter},454 ${p.hemOuter},${Y_H}
    H${p.hemInner}
    C${p.hemInner},454 ${p.kneeInner},398 ${p.kneeInner},${Y_K}
    C${p.kneeInner},290 ${p.thighInner - 4},226 ${p.thighInner},${Y_T}
    Q${C - 6},${Y_CROTCH} ${C},${Y_CROTCH}
    Q${C + 6},${Y_CROTCH} ${2 * C - p.thighInner},${Y_T}
    C${2 * C - p.thighInner + 4},226 ${2 * C - p.kneeInner},290 ${2 * C - p.kneeInner},${Y_K}
    C${2 * C - p.kneeInner},398 ${2 * C - p.hemInner},454 ${2 * C - p.hemInner},${Y_H}
    H${2 * C - p.hemOuter}
    C${2 * C - p.hemOuter},454 ${2 * C - p.kneeOuter},398 ${2 * C - p.kneeOuter},${Y_K}
    C${2 * C - p.kneeOuter},292 ${2 * C - p.thighOuter - 2},238 ${2 * C - p.thighOuter},${Y_T}
    Q${C + p.hip + 2},151 ${C + p.hip},${Y_SEAT}
    Q${C + WA + 1},84 ${C + WA},${BAND_B} Z`;
}
export const bandPath = `M${C - WA},${BAND_B} V${BAND_T + 3}
  Q${C - WA},${BAND_T} ${C - WA + 3},${BAND_T}
  H${C + WA - 3} Q${C + WA},${BAND_T} ${C + WA},${BAND_T + 3}
  V${BAND_B} Z`;
export function detailPaths() {
  const loops = [C - 72, C - 36, C + 36, C + 72]
    .map(x => `M${x},${BAND_T - 2} h4 v${BAND_B - BAND_T + 4} h-4 Z`).join(' ');
  return `${loops}
    M${C + 2},${BAND_B} V144 Q${C + 2},162 ${C},${Y_CROTCH}
    M${C + 12},${BAND_B + 5} V139 Q${C + 12},155 ${C + 2},156
    M${C - WA + 37},${BAND_B + 2} Q${C - WA + 18},87 ${C - 102},111
    M${C + WA - 37},${BAND_B + 2} Q${C + WA - 18},87 ${C + 102},111`;
}
export function hemPath(g) {
  const p = landmarks(g);
  return `M${p.hemOuter},${Y_H - 8} H${p.hemInner}
    M${2 * C - p.hemInner},${Y_H - 8} H${2 * C - p.hemOuter}`;
}
export function dimensionRows(g) {
  const p = landmarks(g);
  return [
    { y: Y_T, x1: p.thighOuter, x2: p.thighInner, label: 'THIGH', val: g.thigh },
    { y: Y_K, x1: p.kneeOuter, x2: p.kneeInner, label: 'KNEE', val: g.knee },
    { y: Y_H, x1: p.hemOuter, x2: p.hemInner, label: 'OPEN', val: g.open },
  ];
}
