/* ============================================================
   FitCo — spot illustrations. Same drafting language as the
   pant flats: ink outlines, chalk dimension callouts, sage
   highlights. Each coordinate diagram is a cropped detail view
   of the reference garment (straight fit, 32×32).
   ============================================================ */
import { GEO, outlinePath, bandPath, detailPaths, C, WA, BAND_T, BAND_B, Y_T, Y_K, Y_H } from './geometry.jsx';

const g = GEO.straightFit;
const HIP = Math.max(WA, g.wt) + 7;

const SAGE = 'var(--color-sage)';
const CHALK = 'var(--color-chalkline)';
const BAND_FILL = 'rgba(60,107,60,.10)';

/* chalk dimension line with end ticks */
function Dim({ x1, x2, y, color = CHALK }) {
  return (
    <g stroke={color} strokeWidth="2">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 7} x2={x1} y2={y + 7} />
      <line x1={x2} y1={y - 7} x2={x2} y2={y + 7} />
    </g>
  );
}

/* the reference garment, drawn once; crops select the detail */
function Garment() {
  return (
    <g>
      <path d={outlinePath(g)} fill="rgba(255,255,255,.4)" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" opacity=".55" />
      <path d={bandPath} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".45" />
      <circle cx={C} cy={BAND_B + 9} r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".45" />
      <path d={detailPaths()} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".45" />
    </g>
  );
}

const ZONES = {
  thigh: {
    view: '128 138 204 168',
    overlay: (
      <g>
        <rect x={C - g.wt} y={Y_T - 15} width={g.wt - 14} height="30" fill={BAND_FILL} />
        <Dim x1={C - g.wt} x2={C - 14} y={Y_T} color={SAGE} />
      </g>
    ),
  },
  seat: {
    view: '128 34 204 190',
    overlay: (
      <g fill="none" stroke={SAGE} strokeWidth="2.5" strokeLinecap="round">
        <path d={`M${C - WA},${BAND_B + 4} C${C - HIP},96 ${C - HIP},148 ${C - g.wt},${Y_T - 4}`} />
        <path d={`M${C - WA - 6},${BAND_B + 14} l6,-10 l6,10`} strokeWidth="2" />
        <path d={`M${C - g.wt - 8},${Y_T - 16} l8,12 l8,-12`} strokeWidth="2" transform={`translate(0,-2)`} />
      </g>
    ),
  },
  rise: {
    view: '150 28 160 252',
    overlay: (
      <g stroke={SAGE} strokeWidth="2">
        <line x1={C - 1} y1={BAND_T + 4} x2={C - 1} y2={238} strokeDasharray="7 6" />
        <line x1={C - 11} y1={BAND_T + 4} x2={C + 9} y2={BAND_T + 4} />
        <line x1={C - 11} y1={238} x2={C + 9} y2={238} />
      </g>
    ),
  },
  knee: {
    view: '128 262 204 160',
    overlay: (
      <g>
        <rect x={C - g.wk} y={Y_K - 15} width={g.wk - 14} height="30" fill={BAND_FILL} />
        <Dim x1={C - g.wk} x2={C - 14} y={Y_K} color={SAGE} />
      </g>
    ),
  },
  opening: {
    view: '128 402 204 152',
    overlay: (
      <g>
        <rect x={C - g.wh} y={Y_H - 32} width={g.wh - 14} height="32" fill={BAND_FILL} />
        <Dim x1={C - g.wh} x2={C - 14} y={Y_H - 14} color={SAGE} />
        <line x1={C - g.wh - 18} y1={Y_H + 12} x2={C + g.wh + 18} y2={Y_H + 12} stroke={CHALK} strokeWidth="1.5" strokeDasharray="3 6" opacity=".8" />
      </g>
    ),
  },
};

export function CoordDiagram({ zone, className = '' }) {
  const z = ZONES[zone];
  if (!z) return null;
  return (
    <svg viewBox={z.view} className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <Garment />
      {z.overlay}
    </svg>
  );
}

/* small line icons for the Standard rules — geometric, single weight */
const RULE_ICONS = [
  /* no padded catalog: one real entry, filler struck through */
  <g key="0">
    <rect x="5" y="4" width="18" height="5" rx="1.2" />
    <rect x="5" y="11.5" width="18" height="5" rx="1.2" strokeDasharray="2.5 2.5" opacity=".55" />
    <rect x="5" y="19" width="18" height="5" rx="1.2" strokeDasharray="2.5 2.5" opacity=".55" />
  </g>,
  /* no commission rankings: coin, struck out */
  <g key="1">
    <circle cx="14" cy="14" r="8.5" />
    <line x1="14" y1="10" x2="14" y2="18" opacity=".7" />
    <line x1="5.5" y1="22.5" x2="22.5" y2="5.5" />
  </g>,
  /* no invented precision: percent sign, struck out */
  <g key="2">
    <circle cx="9.5" cy="9.5" r="2.8" />
    <circle cx="18.5" cy="18.5" r="2.8" />
    <line x1="19.5" y1="7" x2="8.5" y2="21" opacity=".7" />
    <line x1="5" y1="5" x2="23" y2="23" />
  </g>,
  /* no hidden gaps: dashed boundary, the gap marked in plain sight */
  <g key="3">
    <rect x="4.5" y="4.5" width="19" height="19" rx="3" strokeDasharray="3.5 3" />
    <circle cx="14" cy="14" r="2.2" fill="currentColor" stroke="none" />
  </g>,
];

export function RuleIcon({ n, className = '' }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {RULE_ICONS[n]}
    </svg>
  );
}
