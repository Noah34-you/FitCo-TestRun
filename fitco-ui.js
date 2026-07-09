/* ==========================================================================
   FitCo UI — shared SVG sprite + helpers (Phase 2: visual system)
   --------------------------------------------------------------------------
   Injects one same-document SVG symbol sprite (fit-specific icons and
   pant-silhouette illustrations) and exposes small render helpers on
   window.FC. Everything is line-art placeholder artwork drawn in a single
   consistent style: currentColor strokes, rounded caps, no fills.

   Icons:          viewBox 0 0 24 24, stroke 1.7
   Illustrations:  viewBox 0 0 96 120 (pants) / 0 0 96 56 (comparisons), stroke 2
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- pant silhouette generator ---------------------------------
     Drawn as a fashion technical flat (front view): a thin outer outline
     (outseam + hem + inseam) plus lighter-weight construction details
     (waistband, belt loops, button, fly topstitch, 5-pocket openings,
     front creases, hem cuffs). One generator keeps every fit in the same
     style; per-fit geometry drives the silhouette. Line weights are varied
     per path and the left/right edges are intentionally a touch asymmetric
     so it reads hand-drawn, not mirrored.
     t/k/h = leg width (px) at thigh (y50), knee (y78), hem (y111).       */
  var pantGeo = {
    slimTaper:        { t: 12,   k: 9.5,  h: 7 },
    straightFit:      { t: 14,   k: 13,   h: 12.5 },
    athleticTaper:    { t: 17,   k: 12,   h: 8 },
    athleticStraight: { t: 17,   k: 15,   h: 14 },
    relaxedTaper:     { t: 16.5, k: 13.5, h: 10.5 },
    relaxedFit:       { t: 18,   k: 16,   h: 15 }
  };

  // Outer silhouette: outseam down each side, hem, inseam back up, soft crotch.
  function pantBodyPath(g) {
    var t = g.t, k = g.k, h = g.h;
    var oLt = 46 - t,   oLk = 45.6 - k,   oLh = 45.6 - h;   // outer-left x at thigh/knee/hem
    var oRt = 50 + t,   oRk = 50.4 + k,   oRh = 50.4 + h;   // outer-right x (0.2px asymmetry)
    return [
      'M30 15',
      'C29.4 26 ' + oLt + ' 36 ' + oLt + ' 50',            // seat eases into thigh
      'C' + oLt + ' 61 ' + oLk + ' 68 ' + oLk + ' 78',     // thigh into knee
      'L' + oLh + ' 111',                                   // knee tapers to hem (outer-left)
      'L45.6 111',                                          // hem across the left leg
      'C46 92 46.4 63 46.8 49.5',                           // inseam rises (inner-left)
      'Q48 45.4 49.2 49.5',                                 // soft crotch, no V-notch
      'C49.6 63 50 92 50.4 111',                            // inseam falls (inner-right)
      'L' + oRh + ' 111',                                   // hem across the right leg
      'L' + oRk + ' 78',
      'C' + oRk + ' 68 ' + oRt + ' 61 ' + oRt + ' 50',     // knee into thigh
      'C' + oRt + ' 36 66.6 26 66 15',                      // thigh/seat into waist (right)
      'Z'
    ].join(' ');
  }

  // Waistband + belt loops (shared by front & back); button is front-only.
  var PANT_BAND =
    '<path stroke-width="1.35" d="M30 15 V8.4 Q30 6 32.4 6 L63.6 6 Q66 6 66 8.4 V15"/>' +   // waistband U
    '<path stroke-width="0.95" d="M30.4 15.2 H65.6"/>' +                                     // waistband seam
    '<path stroke-width="1.05" d="M33 4.8 V8.8 M40.4 4.6 V8.9 M48 4.5 V9 M55.6 4.7 V8.8 M63 4.9 V8.7"/>'; // 5 belt loops
  var PANT_BUTTON = '<circle stroke-width="0.95" cx="47.7" cy="18.3" r="1.3"/>';

  // Fly J-topstitch — a clean hook to the right, no cartoon curl.
  var PANT_FLY =
    '<path stroke-width="0.95" d="M47.7 18.3 C46.5 25 46.3 34 47.2 41.4 C47.5 43 48.5 43.6 49.9 43.2"/>';

  // Angled front-pocket openings + coin pocket (5-pocket styling).
  var PANT_POCKETS =
    '<path stroke-width="1.05" d="M40.6 16 C37 18.4 32.8 20.8 30.7 27"/>' +
    '<path stroke-width="1.05" d="M55.4 16 C59 18.4 63.2 20.8 65.3 27"/>' +
    '<path stroke-width="0.85" d="M55.9 20.4 H60.5"/>';

  // Front crease + hem cuff, both following each leg's centreline for this geo.
  function pantFrontLines(g) {
    var lcT = ((46 - g.t) + 45.6) / 2, lcK = ((45.6 - g.k) + 45.6) / 2, lcH = ((45.6 - g.h) + 45.6) / 2;
    var rcT = ((50 + g.t) + 50.4) / 2, rcK = ((50.4 + g.k) + 50.4) / 2, rcH = ((50.4 + g.h) + 50.4) / 2;
    var oLh = 45.6 - g.h, oRh = 50.4 + g.h;
    return '<path stroke-width="0.8" d="M' + lcT.toFixed(1) + ' 31 C' + lcK.toFixed(1) + ' 56 ' + lcK.toFixed(1) + ' 82 ' + lcH.toFixed(1) + ' 105"/>' +
      '<path stroke-width="0.8" d="M' + rcT.toFixed(1) + ' 31 C' + rcK.toFixed(1) + ' 56 ' + rcK.toFixed(1) + ' 82 ' + rcH.toFixed(1) + ' 105"/>' +
      '<path stroke-width="1" d="M' + oLh.toFixed(1) + ' 106 H45.6 M50.4 106 H' + oRh.toFixed(1) + '"/>';
  }

  // Full front-view flat for a geo (outline + all construction).
  function pantSymbolContent(g, extras) {
    return '<path stroke-width="1.35" d="' + pantBodyPath(g) + '"/>' +
      PANT_BAND + PANT_BUTTON + PANT_POCKETS + PANT_FLY + pantFrontLines(g) + (extras || '');
  }

  // Back view: yoke seam, patch pockets, centre-back seam (no fly/button).
  var PANT_BACK_DETAILS =
    '<path stroke-width="0.95" d="M30 22 C40 25.5 56 25.5 66 22"/>' +          // yoke seam
    '<path stroke-width="0.95" d="M35 28 h9 v7.5 h-9 z M52 28 h9 v7.5 h-9 z"/>' + // patch pockets
    '<path stroke-width="0.8" d="M47.8 15.4 V44"/>';                           // centre-back seam

  /* ---------- sprite ----------------------------------------------------- */
  function sym(id, vb, content, sw) {
    return '<symbol id="' + id + '" viewBox="' + vb + '">' +
      '<g fill="none" stroke="currentColor" stroke-width="' + (sw || 1.7) +
      '" stroke-linecap="round" stroke-linejoin="round">' + content + '</g></symbol>';
  }
  function icon(id, content) { return sym(id, '0 0 24 24', content, 1.7); }
  function illo(id, content) { return sym(id, '0 0 96 120', content, 1.5); }
  function wide(id, content) { return sym(id, '0 0 96 56', content, 2); }

  var S = '';

  /* --- garment / measurement icons --- */
  S += icon('fc-ic-pants', '<path d="M7 3h10l1.5 18h-4.5L12 11.5 10 21H5.5L7 3z"/><path d="M7.4 6.5h9.2"/>');
  S += icon('fc-ic-denim', '<path d="M7 3h10l1.5 18h-4.5L12 11.5 10 21H5.5L7 3z"/><path d="M7.4 6.5h9.2"/><path d="M9.5 9.5c1.2 1.4 3.8 1.4 5 0" stroke-dasharray="1.6 1.8"/>');
  S += icon('fc-ic-crease', '<path d="M7 3h10l1.5 18h-4.5L12 11.5 10 21H5.5L7 3z"/><path d="M7.4 6.5h9.2"/><path d="M8.9 11.5l-.7 7M15.1 11.5l.7 7" stroke-dasharray="2 2.2"/>');
  S += icon('fc-ic-stretch', '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M4.5 12h-2M2.5 12l1.4-1.4M2.5 12l1.4 1.4M19.5 12h2M21.5 12l-1.4-1.4M21.5 12l1.4 1.4"/>');
  S += icon('fc-ic-waist', '<path d="M4 9h16v6H4z"/><path d="M8.5 9v2.2M15.5 9v2.2"/><circle cx="12" cy="12" r="1.1"/>');
  S += icon('fc-ic-seat', '<path d="M4.5 7h15"/><path d="M5.5 7v3c0 4 2.8 7 6.5 7s6.5-3 6.5-7V7"/>');
  S += icon('fc-ic-thigh', '<path d="M9 4l-1.6 16M15 4l1.6 16"/><path d="M7.8 9.5h8.4M9.4 7.8 7.8 9.5l1.6 1.7M14.6 7.8l1.6 1.7-1.6 1.7"/>');
  S += icon('fc-ic-calf', '<path d="M9.2 4c-.4 6 .4 10-.9 16M14.8 4c.4 6-.4 10 .9 16"/><path d="M9 16h6"/>');
  S += icon('fc-ic-taper', '<path d="M8 4v7l2.4 9M16 4v7l-2.4 9"/><path d="M10.6 20h2.8"/>');
  S += icon('fc-ic-opening', '<path d="M9 4v12M15 4v12"/><path d="M9 16h6"/><path d="M7 20h10M7 18.6v2.8M17 18.6v2.8"/>');
  S += icon('fc-ic-rise', '<path d="M5 5h14"/><path d="M12 7.5v8M10.6 8.9 12 7.5l1.4 1.4M10.6 14.1 12 15.5l1.4-1.4"/><path d="M8 19.5c1.6-2.4 6.4-2.4 8 0"/>');
  S += icon('fc-ic-inseam', '<path d="M7 3h10l1.5 18h-4.5L12 11.5 10 21H5.5L7 3z"/><path d="M12 12.5V21" stroke-dasharray="2 2"/>');
  S += icon('fc-ic-length', '<path d="M12 3v12M9.5 12.5 12 15l2.5-2.5"/><path d="M5 19h14"/>');
  S += icon('fc-ic-gap', '<path d="M5 8h14"/><path d="M7 8v2.5a5 5 0 0 0 10 0V8"/><path d="M9.8 15.5h4.4M11 14l-1.2 1.5L11 17M13 14l1.2 1.5L13 17"/>');
  S += icon('fc-ic-tight', '<path d="M9 4v16M15 4v16"/><path d="M4 12h3M20 12h-3M5.2 7.5l2 1.6M18.8 7.5l-2 1.6M5.2 16.5l2-1.6M18.8 16.5l-2-1.6"/>');
  S += icon('fc-ic-pool', '<path d="M9 4h6"/><path d="M9 4v9c0 3-1.5 4.5-3 7M15 4v9c0 3 1.5 4.5 3 7"/><path d="M6 20h12"/>');
  S += icon('fc-ic-break', '<path d="M9 3h6"/><path d="M9 3v8c0 2-.4 4-.8 6M15 3v8c0 2 .4 4 .8 6"/><path d="M8 17.5q4 2.4 8 0"/><path d="M5 21h14"/>');
  S += icon('fc-ic-fabric', '<path d="M4 8l8-4.5L20 8l-8 4.5L4 8z"/><path d="M4 8v7.5L12 20l8-4.5V8"/>');
  S += icon('fc-ic-hanger', '<path d="M12 3.2a1.9 1.9 0 1 1 1.9 1.9c-.9.4-1.9 1-1.9 2.1v1.2"/><path d="M12 8.4 3.4 15a1.6 1.6 0 0 0 1 2.9h15.2a1.6 1.6 0 0 0 1-2.9L12 8.4z"/>');
  S += icon('fc-ic-scissors', '<circle cx="6" cy="7" r="2.4"/><circle cx="6" cy="17" r="2.4"/><path d="M8.1 8.5 20 19M8.1 15.5 20 5"/>');
  S += icon('fc-ic-tape', '<circle cx="9" cy="12" r="6"/><circle cx="9" cy="12" r="1.5"/><path d="M15 12h6.5v3h-4.5"/>');
  S += icon('fc-ic-ruler', '<rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M7 9v3M11 9v3M15 9v3"/>');
  S += icon('fc-ic-pin', '<circle cx="6.5" cy="17.5" r="2"/><path d="M8 16 19 5M19 5l-.8 3.2M19 5l-3.2.8"/>');

  /* --- body / build icons --- */
  S += icon('fc-ic-body', '<circle cx="12" cy="6.5" r="3"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>');
  S += icon('fc-ic-build-slim', '<circle cx="12" cy="5.5" r="2.5"/><path d="M10.5 10.5h3l.8 10h-4.6l.8-10z"/>');
  S += icon('fc-ic-build-average', '<circle cx="12" cy="5.5" r="2.5"/><path d="M9.8 10.5h4.4l1 10H8.8l1-10z"/>');
  S += icon('fc-ic-build-athletic', '<circle cx="12" cy="5.5" r="2.5"/><path d="M8.5 10.5h7l-1.2 10H9.7l-1.2-10z"/>');
  S += icon('fc-ic-build-broader', '<circle cx="12" cy="5.5" r="2.5"/><path d="M9.5 10.5h5l2 10h-9l2-10z"/>');
  S += icon('fc-ic-height-1', '<path d="M12 20v-8M9.5 14.5 12 12l2.5 2.5"/><path d="M6 21h12"/>');
  S += icon('fc-ic-height-2', '<path d="M12 20V9M9.5 11.5 12 9l2.5 2.5"/><path d="M6 21h12"/>');
  S += icon('fc-ic-height-3', '<path d="M12 20V6M9.5 8.5 12 6l2.5 2.5"/><path d="M6 21h12"/>');
  S += icon('fc-ic-height-4', '<path d="M12 20V3M9.5 5.5 12 3l2.5 2.5"/><path d="M6 21h12"/>');
  S += icon('fc-ic-leg-tapered', '<path d="M7.5 4l3 16M16.5 4l-3 16"/>');
  S += icon('fc-ic-leg-balanced', '<path d="M8.5 4l1.5 16M15.5 4 14 20"/>');
  S += icon('fc-ic-leg-straight', '<path d="M9 4v16M15 4v16"/>');
  S += icon('fc-ic-leg-relaxed', '<path d="M9.5 4 8 20M14.5 4 16 20"/>');

  /* --- interface icons (fit-guide flavored) --- */
  S += icon('fc-ic-profile', '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9.5 2.5h5v3.5h-5z"/><path d="M9 11.5h6M9 15h4"/>');
  S += icon('fc-ic-recommend', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>');
  S += icon('fc-ic-compare', '<path d="M4.5 4v16M9 4v16"/><path d="M15 4l1.8 16M20.5 4l-1.7 16"/>');
  S += icon('fc-ic-shop', '<path d="M5 8h14l-1.2 13H6.2L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>');
  S += icon('fc-ic-bookmark', '<path d="M6.5 3h11v18l-5.5-3.8L6.5 21V3z"/>');
  S += icon('fc-ic-checklist', '<path d="M10 6h11M10 12h11M10 18h11"/><path d="M3 5.5 4.4 7 7 4.3M3 11.5 4.4 13 7 10.3M3 17.5 4.4 19 7 16.3"/>');
  S += icon('fc-ic-check', '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-5.2"/>');
  S += icon('fc-ic-sparkle', '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>');
  S += icon('fc-ic-balance', '<path d="M12 4v16M8 20h8"/><path d="M5 8h14"/><path d="M5 8l-2 4.5h4L5 8zM19 8l-2 4.5h4L19 8z"/>');
  S += icon('fc-ic-comfort', '<path d="M7 17h10a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7 10.6 3.5 3.5 0 0 0 7 17z"/>');
  S += icon('fc-ic-clock', '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>');
  S += icon('fc-ic-shield', '<path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>');
  S += icon('fc-ic-info', '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8v.5"/>');
  S += icon('fc-ic-warn', '<path d="M12 3.5 21 19H3L12 3.5z"/><path d="M12 9.5v4M12 16.5v.5"/>');
  S += icon('fc-ic-arrow', '<path d="M4 12h16M13 5l7 7-7 7"/>');

  /* --- pant illustrations (front / back / six fits) --- */
  S += illo('fc-il-pant-front', pantSymbolContent(pantGeo.straightFit));
  S += illo('fc-il-pant-back',
    '<path stroke-width="1.35" d="' + pantBodyPath(pantGeo.straightFit) + '"/>' + PANT_BAND + PANT_BACK_DETAILS);
  Object.keys(pantGeo).forEach(function (key) {
    S += illo('fc-il-fit-' + key, pantSymbolContent(pantGeo[key]));
  });

  /* --- problem illustrations (same garment style + annotation marks) --- */
  S += illo('fc-il-prob-thighs',
    pantSymbolContent({ t: 12, k: 10, h: 8 },
      '<path d="M31.5 42l-6-2.5M32.5 50l-6.5.5M32 58l-5.5 3M64.5 42l6-2.5M63.5 50l6.5.5M64 58l5.5 3"/>'));
  S += illo('fc-il-prob-calves',
    pantSymbolContent({ t: 15, k: 10.5, h: 7 },
      '<path d="M37 88l-5.5-1.5M37.5 96l-5.5 1M59 88l5.5-1.5M58.5 96l5.5 1"/>'));
  S += illo('fc-il-prob-waistgap',
    pantSymbolContent(pantGeo.straightFit,
      '<path d="M58 5.5v13" stroke-dasharray="2.5 2.5"/><path d="M59.5 12h5M60.8 10.5 59.5 12l1.3 1.5M63.2 10.5 64.5 12l-1.3 1.5"/>'));
  S += illo('fc-il-prob-length',
    pantSymbolContent(pantGeo.straightFit,
      '<path d="M34 102q6 3.2 12 0M50 102q6 3.2 12 0M35 106.5q5.5 3 10.5 0M50.5 106.5q5.5 3 10.5 0"/><path d="M20 118h56" stroke-dasharray="3 3"/>'));

  /* --- comparison diagrams (wide format) --- */
  S += wide('fc-il-rise-compare',
    '<path d="M10 20h28M58 10h28"/>' +
    '<path d="M24 20v18M21.8 35.8 24 38l2.2-2.2M72 10v28M69.8 35.8 72 38l2.2-2.2"/>' +
    '<path d="M6 44h84" stroke-dasharray="3 3"/>');
  S += wide('fc-il-opening-compare',
    '<path d="M28 8v28M42 8v28M24 44h22"/><path d="M28 40h14M29.5 38.5 28 40l1.5 1.5M40.5 38.5 42 40l-1.5 1.5"/>' +
    '<path d="M58 8v28M86 8v28M54 44h36"/><path d="M58 40h28M59.5 38.5 58 40l1.5 1.5M84.5 38.5 86 40l-1.5 1.5"/>');
  S += wide('fc-il-seat-compare',
    '<path d="M12 42a13 13 0 0 1 26 0"/><path d="M14 47h22"/>' +
    '<path d="M54 44a17 14 0 0 1 34 0"/><path d="M56 49h30"/>');

  var SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" id="fitco-sprite" style="display:none" aria-hidden="true">' + S + '</svg>';

  function inject() {
    if (document.getElementById('fitco-sprite')) return;
    var holder = document.createElement('div');
    holder.innerHTML = SPRITE;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }
  if (document.body) { inject(); }
  else { document.addEventListener('DOMContentLoaded', inject); }

  /* ---------- helpers ---------------------------------------------------- */
  var FC = {
    pantGeo: pantGeo,

    /* inline <use> reference to any sprite symbol */
    use: function (id, cls) {
      return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true"><use href="#' + id + '"/></svg>';
    },

    /* pant silhouette thumbnail for a fit key */
    pantSvg: function (fitKey, cls) {
      var id = pantGeo[fitKey] ? 'fc-il-fit-' + fitKey : 'fc-il-pant-front';
      return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 96 120" aria-hidden="true"><use href="#' + id + '"/></svg>';
    },

    /* 10-cell measurement bar (██████░░░░), value 0–10 */
    bar: function (value, opts) {
      opts = opts || {};
      var cls = 'fc-bar' + (opts.gold ? ' fc-bar-gold' : '') + (opts.sm ? ' fc-bar-sm' : '');
      var cells = '';
      for (var i = 1; i <= 10; i++) cells += '<i class="' + (i <= value ? 'on' : '') + '"></i>';
      return '<span class="' + cls + '" role="img" aria-label="' + value + ' of 10">' + cells + '</span>';
    }
  };

  window.FC = FC;
})();
