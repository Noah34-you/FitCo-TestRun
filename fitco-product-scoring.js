/* ============================================================
   FitCo — Product Scoring Layer (Phase 2)
   ------------------------------------------------------------
   Ranks real products WITHIN/near the fit archetype that
   calculateResults() already picked. Outputs tiers + plain-English
   reasons + caveats — never fake percentages.

   STATUS: standalone module. Not yet imported by quiz/index.html.
   Wire it into renderProducts() once the data path below is decided.

   Adapted from the provided spec to the LIVE quiz's actual inputs:
     - answers.productType  (jeans|chinos|technical|any)  -> treated as `category`
     - answers.priority     (cleanerSilhouette|balancedEveryday|maximumComfort)
     - answers.budgetMax / answers.stretch  -> not collected yet; paths no-op safely
   Measurements are NOT invented: every product below is scaffolded as
   unverified (measured:null, confidence:"spec-only"). Real numbers slot
   into PRODUCT_DATA when available.
   ============================================================ */
(function (root) {
  'use strict';

  /* ---- WEIGHTS (sum of active = 1.0). Budget & inseam are filters. ---- */
  var W = {
    fitMatch: 0.35,
    issueRelief: 0.30,
    preference: 0.15,
    accuracy: 0.15,
    priority: 0.05,
  };

  /* ---- Thigh-room bands (flat-lay inches, ref 32) per build ---- */
  var THIGH_TARGET = {
    slim:     { min: 11.0,  ideal: 11.75, max: 12.5 },
    average:  { min: 11.5,  ideal: 12.5,  max: 13.25 },
    athletic: { min: 12.75, ideal: 13.5,  max: 14.5 },
    broader:  { min: 13.25, ideal: 14.25, max: 15.5 },
  };

  /* ---- MEASUREMENT SCAFFOLD (honest placeholders, keyed by product id) ----
     Nothing here is a hand-measured claim. Replace nulls with verified
     numbers and flip `confidence` to "verified" as data lands. Until then
     every product is transparently flagged "spec-based, not hand-verified".
     sizingRun 0 = no KNOWN issue (neutral), not a verified "true to size". */
  var BLANK = function () {
    return {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null,           // elastane % — unknown until verified
      sizingRun: 0,               // -1 small · 0 unknown/neutral · +1 large
      fitAccuracyScore: null,     // null -> neutral 60 in scoring
      commonComplaints: [],
      confidence: 'spec-only',    // "verified" | "spec-only" | "community"
      lastVerified: null,
      sourceNotes: 'Scaffold — measurements pending verification.',
    };
  };
  var PRODUCT_DATA = {
    bonobos_swc_slim: BLANK(),        levis_512: BLANK(),                 lulu_abc_slim: BLANK(),
    bonobos_swc_straight: BLANK(),    jcrew_770: BLANK(),                 levis_505: BLANK(),
    bonobos_swc_athletic: BLANK(),    levis_541: BLANK(),                 lulu_abc_classic: BLANK(),
    vuori_meta_relaxed: BLANK(),      bonobos_ww_athletic: BLANK(),
    levis_550: BLANK(),               duer_nosweat_relaxed_taper: BLANK(),
    jcrew_giant: BLANK(),             levis_555: BLANK(),
  };

  /* Merge a catalog product with its measurement scaffold/data. */
  function withData(product) {
    var d = PRODUCT_DATA[product.id] || BLANK();
    var out = {};
    for (var k in product) out[k] = product[k];
    for (var j in d) out[j] = d[j];
    return out;
  }

  /* Normalize live-quiz answers into the keys this engine expects. */
  function normalizeAnswers(answers) {
    var a = {};
    for (var k in answers) a[k] = answers[k];
    // productType is the live field; the engine reads `category`.
    if (a.category == null && a.productType != null) a.category = a.productType;
    return a;
  }

  /* ------------------------------------------------------------
     SCORING
     ------------------------------------------------------------ */
  function scoreProduct(product, answers, recommendedFit) {
    var reasons = [];
    var flags = [];
    var dq = false;
    var m = product.measured || {};

    /* ---- HARD FILTERS ---- */
    if (answers.budgetMax && product.price > answers.budgetMax) dq = true;
    if (answers.category && answers.category !== 'any' && product.category !== answers.category) {
      flags.push('Outside your ' + answers.category + ' pick — fit geometry is right, category isn’t.');
    }
    if (needsInseamFilter(answers.height, product)) {
      flags.push('Limited inseam options for your height — expect hemming.');
    }
    if (dq) return null;

    /* ---- A. Fit match ---- */
    var fitScore, fitReason;
    if (product.primaryFit === recommendedFit) {
      fitScore = 100;
      fitReason = 'Cut specifically as ' + labelFit(recommendedFit) + ' — your recommended fit.';
    } else if ((product.secondaryFits || []).indexOf(recommendedFit) > -1) {
      fitScore = 72;
      fitReason = 'Not a dedicated ' + labelFit(recommendedFit) + ', but its geometry overlaps it.';
    } else if (sameFamily(product.primaryFit, recommendedFit)) {
      fitScore = 50;
      flags.push('Family fallback — we haven’t verified a closer match in this category yet.');
      fitReason = null;
    } else {
      return null; // wrong family entirely
    }
    if (fitReason) reasons.push(fitReason);

    /* ---- B. Issue relief (measured geometry vs stated problems) ---- */
    var issueScore = 70; // neutral when no measurement / no issue
    var band = THIGH_TARGET[answers.build];
    var fitWrong = answers.fitWrong || [];

    if (fitWrong.indexOf('tightThighsSeat') > -1 && m.thighFlat && band) {
      issueScore = bandScore(m.thighFlat, band);
      if (issueScore >= 85) {
        reasons.push('Measured ' + m.thighFlat + '" flat thigh — real room for a ' + answers.build + ' build, not just "athletic" on the label.');
      } else if (issueScore <= 40) {
        flags.push('Measured thigh (' + m.thighFlat + '") is tighter than its marketing suggests.');
      }
    }
    if (fitWrong.indexOf('tooMuchFabric') > -1 && m.legOpeningFlat) {
      var lo = m.legOpeningFlat;
      var loScore = lo <= 8 ? 95 : lo <= 8.75 ? 75 : 45;
      issueScore = (issueScore + loScore) / 2;
      if (loScore >= 90) reasons.push(lo + '" leg opening keeps the lower leg clean — addresses the excess-fabric issue you flagged.');
    }
    if (fitWrong.indexOf('waistGap') > -1 && product.stretchPct >= 2) {
      issueScore = Math.min(100, issueScore + 8);
      reasons.push('Stretch waistband fabric reduces the waist-gap problem you flagged.');
    }

    /* ---- C. Preference (legShape + stretch tolerance) ---- */
    var prefScore = 70;
    if (answers.stretch === 'rigid' && product.stretchPct > 1) {
      prefScore -= 30;
      flags.push('Contains stretch — you said you prefer rigid fabric.');
    } else if (answers.stretch === 'love' && product.stretchPct >= 2) {
      prefScore += 20;
      reasons.push(product.stretchPct + '% stretch matches your comfort preference.');
    }
    prefScore = clamp(prefScore + legShapeAffinity(answers.legShape, product), 0, 100);

    /* ---- D. Accuracy & sizing trust ---- */
    var accScore = product.fitAccuracyScore != null ? product.fitAccuracyScore : 60;
    if (product.sizingRun !== 0) {
      accScore -= 10;
      flags.push(product.sizingRun < 0 ? 'Runs small — consider sizing up.' : 'Runs large — consider sizing down.');
    }
    if (product.confidence !== 'verified') {
      accScore -= 15;
      flags.push('Spec-based data — we haven’t hand-verified this one yet.');
    }
    if (accScore <= 45 && product.fitAccuracyScore != null) {
      flags.push('Marketing and measurements disagree on this pant — read the caveats.');
    }

    /* ---- E. Priority nudge ---- */
    var priScore = priorityAffinity(answers.priority, product);

    var total =
      fitScore   * W.fitMatch +
      issueScore * W.issueRelief +
      prefScore  * W.preference +
      accScore   * W.accuracy +
      priScore   * W.priority;

    return {
      product: product,
      score: Math.round(total),
      tier: null,
      reasons: reasons.slice(0, 3),
      flags: flags,
      crossCategory: flags.some(function (f) { return f.indexOf('Outside your') === 0; }),
    };
  }

  /* ------------------------------------------------------------
     RANK + TIER
     ------------------------------------------------------------ */
  function rankProducts(catalog, rawAnswers, recommendedFit) {
    var answers = normalizeAnswers(rawAnswers);
    var scored = catalog
      .map(function (p) { return scoreProduct(withData(p), answers, recommendedFit); })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; });

    scored.forEach(function (r, i) {
      r.tier =
        (r.score >= 80 && i === 0) ? 'Best match' :
        (r.score >= 72)            ? 'Strong match' :
        (r.crossCategory)          ? 'Fit match, different category' :
                                     'Style alternative';
    });

    var inCategory = scored.filter(function (r) { return !r.crossCategory; });
    var notice = inCategory.length === 0
      ? 'We haven’t verified a great ' + labelFit(recommendedFit) + ' ' + (answers.category || '') + ' yet — these match your fit geometry in other categories.'
      : null;

    return { results: scored.slice(0, 4), notice: notice };
  }

  /* ------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------ */
  function bandScore(value, band) {
    if (value >= band.min && value <= band.max) {
      var d = Math.abs(value - band.ideal);
      return Math.round(100 - d * 12);
    }
    var overshoot = value < band.min ? band.min - value : value - band.max;
    return Math.max(15, Math.round(70 - overshoot * 35));
  }

  function sameFamily(a, b) {
    var fam = function (f) {
      return f.indexOf('athletic') === 0 ? 'athletic'
        : f.indexOf('relaxed') === 0 ? 'relaxed'
        : (f === 'slimTaper' || f === 'straightFit') ? 'trim' : f;
    };
    return fam(a) === fam(b);
  }

  function needsInseamFilter(height, product) {
    var ins = product.measured && product.measured.inseams;
    if (!ins || !ins.length) return false;
    if (height === 'under58' && Math.min.apply(null, ins) > 30) return true;
    if (height === '63plus' && Math.max.apply(null, ins) < 34) return true;
    return false;
  }

  function legShapeAffinity(legShape, product) {
    var taperFits = ['slimTaper', 'athleticTaper', 'relaxedTaper'];
    var straightFits = ['straightFit', 'athleticStraight'];
    if (legShape === 'tapered'  && taperFits.indexOf(product.primaryFit) > -1) return 10;
    if (legShape === 'straight' && straightFits.indexOf(product.primaryFit) > -1) return 10;
    if (legShape === 'relaxed'  && product.primaryFit.indexOf('relaxed') === 0) return 10;
    return 0;
  }

  // Live quiz priority values mapped onto the spec's comfort/style/versatility.
  function priorityAffinity(priority, product) {
    var comfort = (priority === 'comfort' || priority === 'maximumComfort');
    var style   = (priority === 'style'   || priority === 'cleanerSilhouette');
    if (comfort) return product.stretchPct >= 2 ? 90 : 55;
    if (style)   return (product.fitAccuracyScore != null ? product.fitAccuracyScore : 60) >= 80 ? 85 : 60;
    return 70; // balancedEveryday / versatility / default
  }

  function labelFit(f) {
    return ({
      slimTaper: 'Slim Taper', straightFit: 'Straight',
      athleticTaper: 'Athletic Taper', athleticStraight: 'Athletic Straight',
      relaxedTaper: 'Relaxed Taper', relaxedFit: 'Relaxed Fit',
    })[f] || f;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ------------------------------------------------------------
     EXPORTS
     UI contract for renderProducts:
       { results: [{ product, tier, reasons[], flags[] }], notice }
       - show `tier`, never `score`
       - show up to 3 `reasons` as "Why this pick"
       - show `flags` as fine-print caveats
       - if `notice`, render it above results verbatim
     ------------------------------------------------------------ */
  var API = {
    rankProducts: rankProducts,
    scoreProduct: scoreProduct,
    withData: withData,
    PRODUCT_DATA: PRODUCT_DATA,
    WEIGHTS: W,
    THIGH_TARGET: THIGH_TARGET,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.FCScore = API;
})(typeof window !== 'undefined' ? window : this);
