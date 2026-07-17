/* ============================================================
   FitCo — spot illustrations. Same drafting language as the
   pant flats: ink outlines, chalk dimension callouts, sage
   highlights. Each coordinate diagram is a cropped detail view
   of the reference garment (straight fit, 32×32).
   ============================================================ */
import { GEO, PantFlat, outlinePath, bandPath, detailPaths, C, WA, BAND_T, BAND_B, Y_T, Y_K, Y_H } from './geometry.jsx';

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

/* ============================================================
   Option illustrations for the fitting — one glyph per answer,
   drawn in the same drafting language. Leg shapes reuse the
   real pant geometry (PantFlat) rather than a second drawing.
   ============================================================ */
const STRAIN = 'var(--color-strain)';

const OPTION_ILLOS = {
  productType: {
    jeans: (
      <g>
        <path d="M7,10 H41 M7,15 H41" />
        <path d="M11,8 v6.5 M24,8 v6.5 M37,8 v6.5" opacity=".5" />
        <path d="M7,15 C13,24 20,25 24,15.5" opacity=".85" />
        <path d="M31,15 C33,20 39,20 41,15" opacity=".65" />
        <circle cx="10.5" cy="18.5" r="1.3" /><circle cx="23" cy="18.5" r="1.3" />
        <path d="M24,15.5 V40" strokeDasharray="2 3" opacity=".45" />
        <path d="M7,15 V40 M41,15 V40" />
      </g>
    ),
    chinos: (
      <g>
        <path d="M15,6 H33 M15,10.5 H33" />
        <path d="M15,10.5 L17,42 M33,10.5 L31,42 M17,42 H31" />
        <path d="M24,13 L23.6,42" opacity=".8" />
      </g>
    ),
    technical: (
      <g>
        <path d="M16,6 H32 M16,6 L14,42 M32,6 L30,42" />
        <path d="M19,14 L28,25" />
        <path d="M20.8,14.6 l-1.6,1.6 M23.4,17.2 l-1.6,1.6 M26,19.8 l-1.6,1.6" opacity=".6" />
        <circle cx="29.4" cy="26.8" r="1.6" />
        <path d="M19,33 h9 M20,37.5 h9" opacity=".5" strokeDasharray="3 3" />
      </g>
    ),
    any: (
      <g>
        <path d="M12,10 H32 M12,10 L9,40 H17 L21.5,22 L26.5,40 H35 L32,10" />
        <g stroke="var(--color-sage)"><path d="M39,4.5 V13 M34.8,8.75 H43.2" /></g>
      </g>
    ),
  },
  build: {
    slim: (
      <g>
        <circle cx="24" cy="8" r="3.6" />
        <path d="M17.5,14.5 H30.5 C31,20.5 30.5,24.5 30.5,28 L29.3,44 H26.3 L25.3,31 H22.7 L21.7,44 H18.7 L17.5,28 C17.5,24.5 17,20.5 17.5,14.5 Z" />
      </g>
    ),
    average: (
      <g>
        <circle cx="24" cy="8" r="3.6" />
        <path d="M16.5,14.5 H31.5 C32,20.5 31.7,24.5 31.7,28 L30.3,44 H27 L25.6,31 H22.4 L21,44 H17.7 L16.3,28 C16.3,24.5 16,20.5 16.5,14.5 Z" />
      </g>
    ),
    athletic: (
      <g>
        <circle cx="24" cy="8" r="3.6" />
        <path d="M14.5,14.5 H33.5 C34,20 33,23.5 32.8,26.5 C33.6,31 32.8,37 31,44 H27.2 L25.8,31.5 H22.2 L20.8,44 H17 C15.2,37 14.4,31 15.2,26.5 C15,23.5 14,20 14.5,14.5 Z" />
      </g>
    ),
    broader: (
      <g>
        <circle cx="24" cy="8" r="3.6" />
        <path d="M15.5,14.5 H32.5 C34.5,20 35.2,25 34.6,29 L32.2,44 H28.4 L26,32 H22 L19.6,44 H15.8 L13.4,29 C12.8,25 13.5,20 15.5,14.5 Z" />
      </g>
    ),
  },
  fitWrong: {
    tightThighsSeat: (
      <g>
        <path d="M18,6 C15,18 15,30 17,42 M30,6 C33,18 33,30 31,42 M18,6 H30" />
        <g stroke={STRAIN} strokeWidth="1.6">
          <path d="M9.5,16 l4.5,2 M8.5,24 l5,.5 M9.5,32 l4.5,-2" />
          <path d="M38.5,16 l-4.5,2 M39.5,24 l-5,.5 M38.5,32 l-4.5,-2" />
        </g>
      </g>
    ),
    waistGap: (
      <g>
        <path d="M9,10.5 Q24,4 39,10.5 M9,15.5 Q24,9 39,15.5" />
        <path d="M9,15.5 Q24,22 39,15.5" />
        <path d="M9,15.5 L11.5,42 M39,15.5 L36.5,42" opacity=".55" />
        <g stroke={STRAIN} strokeWidth="1.6"><path d="M24,11.5 V17.5 M21.8,15.4 L24,17.7 L26.2,15.4" /></g>
      </g>
    ),
    tooMuchFabric: (
      <g>
        <path d="M16,6 L15,42 M32,6 L33,42 M15,42 H33 M16,6 H32" />
        <path d="M18.5,24 q3,2.6 6,0 t6,0 M18.5,31 q3,2.6 6,0 t6,0 M18.5,38 q3,2.6 6,0 t6,0" opacity=".55" />
      </g>
    ),
    lengthOff: (
      <g>
        <path d="M18,6 V28 M30,6 V28 M18,6 H30" />
        <path d="M17,31 q7,3.2 14,0 M16,35.5 q8,3.2 16,0 M17,40 q7,3.2 14,0" opacity=".7" />
        <path d="M10,44.5 H38" stroke="var(--color-chalkline)" strokeDasharray="3 4" />
      </g>
    ),
    usuallyFine: (
      <g stroke="var(--color-sage)">
        <circle cx="24" cy="24" r="11" />
        <path d="M18.5,24.5 L22.5,28.5 L30,19.5" />
      </g>
    ),
  },
  height: (() => {
    const fig = (yTop) => (
      <g>
        <path d="M12,5 V43" />
        <path d="M12,9 h4 M12,15 h3 M12,21 h4 M12,27 h3 M12,33 h4 M12,39 h3" opacity=".6" />
        <path d={`M12,${yTop} H36`} stroke="var(--color-chalkline)" strokeDasharray="3 3" />
        <circle cx="30" cy={yTop + 4.2} r="3.4" />
        <path d={`M30,${yTop + 7.6} V39 M25,42.5 H36`} />
      </g>
    );
    return { under58: fig(20), '58to511': fig(16), '60to62': fig(11), '63plus': fig(6) };
  })(),
  priority: {
    cleanerSilhouette: (
      <g>
        <path d="M15,8 L24,22 M33,8 L24,22 M24,22 L19.8,30.2 M24,22 L28.2,30.2" />
        <circle cx="17.5" cy="33" r="3.4" /><circle cx="30.5" cy="33" r="3.4" />
        <circle cx="24" cy="22" r="1.2" fill="currentColor" stroke="none" />
      </g>
    ),
    balancedEveryday: (
      <g>
        <path d="M24,10.5 V36 M12,14 H36" />
        <circle cx="24" cy="8.5" r="1.8" />
        <path d="M12,14 L8,24 M12,14 L16,24 M7.5,24 C9,29 15,29 16.5,24" />
        <path d="M36,14 L32,24 M36,14 L40,24 M31.5,24 C33,29 39,29 40.5,24" />
        <path d="M17,40 H31 M24,36 V40" />
      </g>
    ),
    maximumComfort: (
      <g>
        <rect x="10" y="22" width="28" height="13" rx="6.5" />
        <path d="M17,17 q2.2,-2.6 0,-5.4 M24,18 q2.2,-2.6 0,-5.4 M31,17 q2.2,-2.6 0,-5.4" opacity=".55" />
      </g>
    ),
  },
};

const LEG_SHAPE_GEO = { tapered: 'slimTaper', balanced: 'relaxedTaper', straight: 'straightFit', relaxed: 'relaxedFit' };

export function OptionIllo({ qkey, v, className = '' }) {
  if (qkey === 'legShape') {
    const geo = GEO[LEG_SHAPE_GEO[v]];
    return geo ? <PantFlat g={geo} detail={false} className={className} /> : null;
  }
  const node = OPTION_ILLOS[qkey] && OPTION_ILLOS[qkey][v];
  if (!node) return null;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {node}
    </svg>
  );
}
