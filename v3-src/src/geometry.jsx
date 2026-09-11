/* ============================================================
   FitCo V3 — parametric pant geometry (the instrument).
   One drawing system renders every fit; a smooth-converge hook
   makes the silhouette physically move toward the leading fit
   as the user answers. Reference geometry, 32×32 flat.

   Drafting geometry now lives in garment-paths.js and is shared
   verbatim with the measurement illustrations. Coordinates describe
   an illustrative flat, not verified product measurements.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import {
  C,
  BAND_T,
  BAND_B,
  outlinePath,
  bandPath,
  detailPaths,
  hemPath,
  dimensionRows,
} from './garment-paths.js';

/* Compatibility re-exports: older imports of the garment constants and
   path builders from this module keep working against the shared geometry. */
export {
  C,
  WA,
  BAND_T,
  BAND_B,
  Y_SEAT,
  Y_CROTCH,
  Y_T,
  Y_K,
  Y_H,
  landmarks,
  outlinePath,
  bandPath,
  detailPaths,
  hemPath,
  dimensionRows,
} from './garment-paths.js';

export const GEO = {
  slimTaper:        { wt: 70, wk: 52, wh: 42, thigh: 11.75, knee: 8.9,  open: 6.75 },
  straightFit:      { wt: 78, wk: 70, wh: 64, thigh: 12.5,  knee: 9.8,  open: 7.5 },
  athleticTaper:    { wt: 86, wk: 64, wh: 50, thigh: 13.5,  knee: 9.4,  open: 7.0 },
  athleticStraight: { wt: 88, wk: 76, wh: 68, thigh: 13.75, knee: 10.2, open: 7.75 },
  relaxedTaper:     { wt: 86, wk: 72, wh: 60, thigh: 14.0,  knee: 10.4, open: 7.75 },
  relaxedFit:       { wt: 92, wk: 82, wh: 74, thigh: 14.5,  knee: 11.2, open: 8.25 },
};

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
        const t = target.current;
        /* Already snapped to target: return the same reference so React
           bails out of re-rendering. The loop keeps ticking cheaply and
           resumes the moment the target changes. */
        let atTarget = true;
        for (const k in t) if (prev[k] !== t[k]) { atTarget = false; break; }
        if (atTarget) return prev;
        const next = {}; let done = true;
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

/* The full garment: outline, waistband, and construction details.
   Shared by the fit silhouettes and the measurement cards. */
export function Garment({
  g,
  stroke = 'currentColor',
  fill = 'rgba(255,255,255,.5)',
  detail = true,
}) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path
        d={outlinePath(g)}
        fill={fill}
        stroke={stroke}
        strokeWidth="2.6"
      />
      <path
        d={bandPath}
        fill={fill}
        stroke={stroke}
        strokeWidth="2.2"
      />
      {detail && <>
        <path
          d={detailPaths()}
          fill="none"
          stroke={stroke}
          strokeWidth="1.45"
          opacity=".72"
        />
        <circle
          cx={C + 8}
          cy={(BAND_T + BAND_B) / 2}
          r="2.8"
          fill="none"
          stroke={stroke}
          strokeWidth="1.45"
        />
        <path
          d={hemPath(g)}
          fill="none"
          stroke={stroke}
          strokeWidth="1.35"
          opacity=".65"
        />
      </>}
    </g>
  );
}

export function PantFlat({
  g,
  dims = false,
  highlight = null,
  className = '',
  stroke = 'var(--color-ink)',
  fill = 'rgba(255,255,255,.5)',
  detail = true,
}) {
  const dimRows = dimensionRows(g);
  return (
    <svg
      viewBox="0 -18 460 596"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <Garment g={g} stroke={stroke} fill={fill} detail={detail} />
      {dims && dimRows.map(d => {
        const active = highlight === d.label;
        const line = active
          ? 'var(--color-sage)'
          : 'var(--color-chalkline)';
        const lw = active ? 2.4 : 1.5;
        return (
          <g
            key={d.label}
            opacity={highlight && !active ? .3 : 1}
            style={{ transition: 'opacity .25s' }}
          >
            <line
              x1={d.x1}
              y1={d.y}
              x2={d.x2}
              y2={d.y}
              stroke={line}
              strokeWidth={lw}
            />
            <line
              x1={d.x1}
              y1={d.y - 6}
              x2={d.x1}
              y2={d.y + 6}
              stroke={line}
              strokeWidth={lw}
            />
            <line
              x1={d.x2}
              y1={d.y - 6}
              x2={d.x2}
              y2={d.y + 6}
              stroke={line}
              strokeWidth={lw}
            />
            <text
              x={d.x1 - 14}
              y={d.y + 4.5}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="12.5"
              fill={active ? 'var(--color-sage)' : 'var(--color-chalk)'}
              letterSpacing=".06em"
            >
              {d.label}{' '}
              <tspan
                fill={active ? 'var(--color-sage)' : 'var(--color-ink)'}
                fontWeight="500"
              >
                {d.val.toFixed(2)}″
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}
