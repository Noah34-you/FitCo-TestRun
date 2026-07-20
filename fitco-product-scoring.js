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
  /* July 2026 research pass. Brand-published circumference measurements
     (Levi's/J.Crew quote knee & leg opening around the garment) are halved
     to the flat-lay inches this engine expects. Confidence stays
     "spec-only" throughout — "verified" is reserved for hand-measurement.
     Unknowns stay null; nothing below is inferred. */
  var PRODUCT_DATA = {
    levis_541: {
      measured: { thighFlat: null, kneeFlat: 8.875, legOpeningFlat: 7.875, frontRise: 10.375, inseams: null, referenceSize: '32x32' },
      stretchPct: null,           // composition varies by wash (99/1 up to 87/11/2) — no single value
      sizingRun: 0,               // matches its published spec (community consensus)
      fitAccuracyScore: null,
      commonComplaints: [],
      confidence: 'spec-only',
      lastVerified: null,         // spec relayed from brand page via research pass; levi.com blocks automated re-fetch
      sourceNotes: 'Brand-published size-32 spec (front rise 10 3/8", knee 17 3/4", leg opening 15 3/4" circumference; halved to flat). 15.75" opening is only moderately tapered — borders Athletic Straight, which our secondaryFits already covers. Research pass cites style 181810069; catalog links wash 181810629 — both 541 washes, confirm preferred wash manually. Affiliate: Rakuten (unconfirmed).',
    },
    jcrew_770: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: 7.5, frontRise: 11, inseams: null, referenceSize: '32x32' },
      stretchPct: 3,              // brand-published 97% cotton / 3% elastane
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: ['Season-to-season sizing drift (community-documented)'],
      confidence: 'spec-only',
      lastVerified: null,         // jcrew.com blocks automated re-fetch
      sourceNotes: 'Brand publishes front rise 11" and 15" leg opening (circumference; halved to flat). Brand confirms slight below-knee taper despite the "Straight" name. Research pass saw $68.50 vs catalog $89-90 — J.Crew discounts constantly; re-check before publishing price. Affiliate: CJ (unconfirmed).',
    },
    lulu_abc_slim: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null,           // Warpstreme poly/elastane warp-knit — % not published
      sizingRun: 0,               // true-to-size (strong community consensus)
      fitAccuracyScore: null,
      commonComplaints: [],
      confidence: 'spec-only',
      lastVerified: null,         // lululemon.com blocks automated re-fetch
      sourceNotes: 'No numeric geometry published. Naming trap confirmed: ABC line is athletic-branded but the Slim variant is genuinely slim — our Slim Taper mapping stands. Research pass saw $138 vs catalog $148 — re-check. Shape retention across 100+ washes widely reported. Affiliate: Awin (unconfirmed).',
    },
    lulu_abc_classic: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null,
      sizingRun: 0,               // true-to-size (community consensus)
      fitAccuracyScore: null,
      commonComplaints: [],
      confidence: 'spec-only',
      lastVerified: null,
      sourceNotes: 'No numeric geometry published. MAPPING FLAG: research (description-level evidence only) reads Classic as roomier seat/thigh with a STRAIGHTER leg — closer to Athletic Straight than our athleticTaper primary. Not changed: evidence is Medium, no published numbers. Re-map only after a tape measure. Research pass saw $138 vs catalog $128 — re-check.',
    },
    duer_nosweat_relaxed_taper: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null,           // blend stretch comes from T400+spandex, not a single elastane %
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: [],
      confidence: 'spec-only',
      lastVerified: '2026-07-20', // live page fetched this pass
      sourceNotes: 'VERIFIED LIVE 2026-07-20: URL resolves, Shopify id 1538930507820 (matches research SKU MFNR1002). Brand is RENAMING this pant "No Sweat Athletic Taper" — same cut/fabric per brand notice; expect the product title and possibly slug to change. Fabric (brand): 62% cotton / 34% TENCEL / 3% LYCRA T400 / 1% spandex. Price $129 consistent across catalog + research. Affiliate: Impact.com (research-confirmed).',
    },
    vuori_meta_relaxed: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null,           // VersaLife 4-way stretch knit — % not published
      sizingRun: 0,               // TTS, runs slightly long (community)
      fitAccuracyScore: null,
      commonComplaints: ['Runs slightly long (community-reported)'],
      confidence: 'spec-only',
      lastVerified: '2026-07-20', // live page fetched this pass
      sourceNotes: 'VERIFIED LIVE 2026-07-20: canonical URL resolves; $118 confirmed in page JSON-LD (matches catalog); some colorway variants out of stock. No numeric geometry published. Research pass covered the Meta Slim and Ease cuts, not this Relaxed cut — its notes do not transfer. Affiliate: Awin/AvantLink (unconfirmed).',
    },
    bonobos_swc_slim: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null,
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: [],
      confidence: 'spec-only',
      lastVerified: '2026-07-20',
      sourceNotes: 'VERIFIED LIVE 2026-07-20: URL resolves to Stretch Washed Chino (all three fit variants share the page). Price loads via JS — not machine-verifiable here; catalog $99 unconfirmed. Bonobos publishes no measurements directly; numeric specs exist only via Nordstrom wholesale listings (research). Affiliate: Pepperjam/Ascend (unconfirmed).',
    },
    bonobos_swc_straight: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: '2026-07-20',
      sourceNotes: 'Same page/fetch as bonobos_swc_slim — see that entry.',
    },
    bonobos_swc_athletic: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: '2026-07-20',
      sourceNotes: 'Same page/fetch as bonobos_swc_slim — see that entry.',
    },
    bonobos_ww_athletic: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: '2026-07-20',
      sourceNotes: 'VERIFIED LIVE 2026-07-20: URL resolves to Stretch Weekday Warrior dress pants. Price JS-loaded — catalog $129 unconfirmed. No published measurements (see bonobos_swc_slim).',
    },
    levis_550: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: null,
      sourceNotes: 'CAUTION: research pass captured the plain 550 Relaxed (straight leg, rise 11", opening 16.5" @ size 33, ~$59.50, 100% cotton) — our catalog item is the 550 Relaxed TAPERED variant; those numbers do NOT apply and were deliberately not entered. Levi\'s publishes per-page specs — capture ours when accessible.',
    },
    levis_512: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: null,
      sourceNotes: 'Not covered by the July 2026 research pass. Levi\'s publishes rise/knee/opening on every product page — capture pending (site blocks automated access).',
    },
    levis_505: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: null,
      sourceNotes: 'Not covered by the July 2026 research pass. Levi\'s publishes per-page specs — capture pending.',
    },
    levis_555: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: null,
      sourceNotes: 'Not covered by the July 2026 research pass. Catalog URL style number (000LO0001) looks placeholder-like — manually confirm the canonical 555 page before launch.',
    },
    jcrew_giant: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: null, sizingRun: 0, fitAccuracyScore: null, commonComplaints: [],
      confidence: 'spec-only', lastVerified: null,
      sourceNotes: 'Not covered by the July 2026 research pass. J.Crew publishes front rise + leg opening — capture pending (site blocks automated access). Same season-to-season drift caveat as jcrew_770.',
    },

    /* ---- Stage-1 additions (July 2026 research pass) ---- */
    jcrew_484: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: 7, frontRise: 10.5, inseams: null, referenceSize: '32x32' },
      stretchPct: 3,
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: ['Season-to-season sizing drift (community-documented)'],
      confidence: 'spec-only',
      lastVerified: null,
      sourceNotes: 'Brand publishes front rise 10.5" and 14" leg opening (circumference; halved to flat). 97/3 cotton/elastane. Research price $69.50; catalog rounds to $70 per existing convention. Site blocks automated re-fetch. No publicly retrievable official image — img left blank.',
    },
    jcrew_1040: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: 7.25, frontRise: 11, inseams: null, referenceSize: '32x32' },
      stretchPct: 3,
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: ['Season-to-season sizing drift (community-documented)'],
      confidence: 'spec-only',
      lastVerified: null,
      sourceNotes: 'Research reference anchor for Athletic Taper. Brand publishes rise 11" and 14.5" opening (circumference; halved to flat) — narrower opening than the 770 despite a roomier thigh is geometric proof of taper. Price seen $69.50-$84.99; catalog stores the $85 ceiling so the budget filter never under-gates. Site blocks bots; img blank.',
    },
    toddsnyder_slim_5pocket: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: 7, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: 2,
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: ['Heavy twill runs warm in summer (reviewer-noted)'],
      confidence: 'spec-only',
      lastVerified: null,
      sourceNotes: 'Brand publishes 14" leg-opening circumference (halved to flat). 90/8/2 cotton/poly/Lycra garment-dyed twill. True to size, praised for consistency. SKU JE037785. Page sits behind Cloudflare (403 to bots) — link taken from research, confirm manually; img blank.',
    },
    flint_tinder_365_tapered: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: 2,
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: [],
      confidence: 'spec-only',
      lastVerified: null,
      sourceNotes: 'Huckberry publishes garment measurements per fit, but the Tapered fit\'s rise VARIES BY WAIST (10.5" up to 13" at W38 per Dappered) — no single size-32 number entered rather than a misleading one. 98/2 cotton/spandex, 8 oz, preshrunk. Price moved $98 to $108 (research). Huckberry SKU 62339. Page bot-walled; img blank.',
    },
    proof_rover_athletic_tapered: {
      measured: { thighFlat: 12.875, kneeFlat: null, legOpeningFlat: 7, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: 2,
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: ['Fabric is stiff before break-in (reviewer consensus)'],
      confidence: 'spec-only',
      lastVerified: null,
      sourceNotes: 'Garment measurements published by Huckberry, relayed via Men\'s Journal: ~25.75" thigh and ~14" opening circumference (halved to flat) — relay chain noted, spot-check against the live size chart when accessible. 73% cotton / 25% REPREVE / 2% Lycra; gusseted crotch. Huckberry SKU 89516. Page bot-walled; img blank.',
    },
    state_liberty_athletic_dress: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: 7,
      sizingRun: -1,
      fitAccuracyScore: null,
      commonComplaints: ['Runs small — size up (well-documented)'],
      confidence: 'spec-only',
      lastVerified: '2026-07-20',
      sourceNotes: 'VERIFIED LIVE 2026-07-20: page resolves, $150, official brand image retrieved from their public CDN (og:image, 800px). 56% nylon / 37% rayon / 7% spandex. No numeric geometry published. Shopify id 1362150096977.',
    },
    carhartt_rigby_relaxed: {
      measured: { thighFlat: null, kneeFlat: null, legOpeningFlat: null, frontRise: null, inseams: null, referenceSize: '32x32' },
      stretchPct: 2,
      sizingRun: 0,
      fitAccuracyScore: null,
      commonComplaints: [],
      confidence: 'spec-only',
      lastVerified: null,
      sourceNotes: 'Renamed from "Rugged Flex Rigby Dungaree" — product id 102291 is stable, URL slugs are not; re-check the link periodically. 98/2 cotton/spandex canvas, 8-8.5 oz. Price $54.99-$59.99; catalog stores the $60 ceiling. Site blocks bots; img blank.',
    },
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
