/* ============================================================
   FitCo V3 — parametric pant geometry (the instrument).
   One drawing system renders every fit; a smooth-converge hook
   makes the silhouette physically move toward the leading fit
   as the user answers. Reference geometry, 32×32 flat.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';

export const GEO = {
  slimTaper:        { wt: 70, wk: 52, wh: 42, thigh: 11.75, knee: 8.9,  open: 6.75 },
  straightFit:      { wt: 78, wk: 70, wh: 64, thigh: 12.5,  knee: 9.8,  open: 7.5 },
  athleticTaper:    { wt: 86, wk: 64, wh: 50, thigh: 13.5,  knee: 9.4,  open: 7.0 },
  athleticStraight: { wt: 88, wk: 76, wh: 68, thigh: 13.75, knee: 10.2, open: 7.75 },
  relaxedTaper:     { wt: 86, wk: 72, wh: 60, thigh: 14.0,  knee: 10.4, open: 7.75 },
  relaxedFit:       { wt: 92, wk: 82, wh: 74, thigh: 14.5,  knee: 11.2, open: 8.25 },
};

const C = 230, WA = 84, BAND_T = 36, BAND_B = 62;
export const Y_T = 210, Y_K = 340, Y_H = 508;

export function outlinePath(g) {
  const hip = Math.max(WA, g.wt) + 7;
  const oLT = C - g.wt, oLK = C - g.wk, oLH = C - g.wh;
  const oRT = C + g.wt + 1.5, oRK = C + g.wk + 1.5, oRH = C + g.wh + 1.5;
  const inL = C - 14, inR = C + 14;
  return `M${C - WA},${BAND_B}
    C${C - hip},96 ${C - hip},148 ${oLT},${Y_T}
    C${oLT},262 ${oLK},298 ${oLK},${Y_K}
    C${oLK},402 ${oLH},452 ${oLH},${Y_H}
    L${inL},${Y_H}
    C${inL + 2},430 ${C - 5},308 ${C - 3.5},242
    Q${C},226 ${C + 3.5},242
    C${C + 5},308 ${inR - 2},430 ${inR},${Y_H}
    L${oRH},${Y_H}
    C${oRH},452 ${oRK},402 ${oRK},${Y_K}
    C${oRK},298 ${oRT},262 ${oRT},${Y_T}
    C${C + hip + 1.5},148 ${C + hip + 1.5},96 ${C + WA},${BAND_B} Z`;
}
const bandPath = `M${C - WA},${BAND_B} V${BAND_T + 8} Q${C - WA},${BAND_T} ${C - WA + 8},${BAND_T} H${C + WA - 8} Q${C + WA},${BAND_T} ${C + WA},${BAND_T + 8} V${BAND_B}`;
function detailPaths() {
  const loops = [C - WA + 12, C - WA * 0.5, C - 2, C + WA * 0.5 - 4, C + WA - 16]
    .map(x => `M${x},${BAND_T - 3} v${BAND_B - BAND_T - 8}`).join(' ');
  return `M${C - WA + 2},${BAND_B + 0.5} H${C + WA - 2} ${loops}
    M${C - 2},${BAND_B + 8} C${C - 8},120 ${C - 8},176 ${C - 4},214 C${C - 3},224 ${C + 4},227 ${C + 10},225
    M${C - WA + 38},${BAND_B + 2} C${C - WA + 18},82 ${C - WA + 8},102 ${C - WA + 4},136
    M${C + WA - 38},${BAND_B + 2} C${C + WA - 18},82 ${C + WA - 8},102 ${C + WA - 4},136
    M${C + WA - 34},${BAND_B + 14} c6,7 16,7 21,1`;
}
function hemPath(g) {
  const oLH = C - g.wh, oRH = C + g.wh + 1.5;
  return `M${oLH},${Y_H - 16} H${C - 14} M${C + 14},${Y_H - 16} H${oRH}`;
}

/* Exponential smoothing toward a target geometry — the convergence. */
export function useConvergingGeo(targetKey, reduced) {
  const [g, setG] = useState({ ...GEO[targetKey] });
  const target = useRef(GEO[targetKey]);
  target.current = GEO[targetKey];
  useEffect(() => {
    if (reduced) { setG({ ...GEO[targetKey] }); return; }
    let raf, last = performance.now(), alive = true;
    const tick = (now) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      setG(prev => {
        const t = target.current; const next = {}; let done = true;
        for (const k in t) {
          const v = prev[k] + (t[k] - prev[k]) * Math.min(1, dt * 5.2);
          next[k] = v;
          if (Math.abs(t[k] - v) > 0.01) done = false;
        }
        return done ? { ...t } : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [reduced, targetKey === null]); // eslint-disable-line
  return g;
}

export function PantFlat({ g, dims = false, className = '', stroke = 'var(--color-ink)', fill = 'rgba(255,255,255,.5)', detail = true }) {
  const dimRows = [
    { y: Y_T, x1: C - g.wt, label: 'THIGH', val: g.thigh },
    { y: Y_K, x1: C - g.wk, label: 'KNEE', val: g.knee },
    { y: Y_H - 2, x1: C - g.wh, label: 'OPEN', val: g.open },
  ];
  return (
    <svg viewBox="0 -18 460 596" className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <line x1={C} y1={20} x2={C} y2={545} stroke={stroke} strokeWidth="1" strokeDasharray="3 7" opacity=".22" />
      <path d={outlinePath(g)} fill={fill} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      {detail && <>
        <path d={bandPath} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity=".85" />
        <circle cx={C} cy={BAND_B + 9} r="3.6" fill="none" stroke={stroke} strokeWidth="1.5" opacity=".85" />
        <path d={detailPaths()} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
        <path d={hemPath(g)} fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" opacity=".6" />
      </>}
      {dims && dimRows.map(d => (
        <g key={d.label}>
          <line x1={d.x1 + 4} y1={d.y} x2={C - 5} y2={d.y} stroke="var(--color-chalkline)" strokeWidth="1.5" />
          <line x1={d.x1 + 4} y1={d.y - 6} x2={d.x1 + 4} y2={d.y + 6} stroke="var(--color-chalkline)" strokeWidth="1.5" />
          <line x1={C - 5} y1={d.y - 6} x2={C - 5} y2={d.y + 6} stroke="var(--color-chalkline)" strokeWidth="1.5" />
          <text x={d.x1 - 14} y={d.y + 4.5} textAnchor="end" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--color-chalk)" letterSpacing=".06em">
            {d.label} <tspan fill="var(--color-ink)" fontWeight="500">{d.val.toFixed(2)}″</tspan>
          </text>
        </g>
      ))}
    </svg>
  );
}
