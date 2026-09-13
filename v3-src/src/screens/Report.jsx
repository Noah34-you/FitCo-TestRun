import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Wordmark, Btn, SiteFooter, ArrowUpRight } from '../ui.jsx';
import FitShapeImage from '../FitShapeImage.jsx';
import { computeScores, rankProducts, FIT_LABEL, FIT_INFO, PRICES_AS_OF } from '../engine.js';
import { track, retailerOf } from '../analytics.js';
import { saveLocally } from '../answer-state.js';

function ProductPhoto({ product, badge }) {
  const [failed, setFailed] = useState(false);
  return <div className="v1-product-photo">
    {product.img && !failed
      ? <img src={product.img} alt={product.brand + ' ' + product.name} width="600" height="750" loading="lazy" onError={() => setFailed(true)} />
      : <p>Photo unavailable.<br />See this pair at {product.brand}.</p>}
    {badge && <span className="v1-best-match">Best match</span>}
  </div>;
}

const ROOM = {
  close: { label: 'Close to the body', copy: 'You prefer the seat and thighs to follow your shape without feeling skin-tight.' },
  some: { label: 'Some room', copy: 'You prefer some breathing room through the upper leg while keeping visible definition.' },
  plenty: { label: 'Plenty of room', copy: 'You prefer an easier seat and thigh with space to move.' },
};
const LEG = {
  tapered: { label: 'Tapered', copy: 'You prefer noticeable narrowing from the knee to the ankle.' },
  balanced: { label: 'Balanced', copy: 'You prefer a gentle taper that sits between narrow and straight.' },
  straight: { label: 'Straight', copy: 'You prefer little narrowing below the knee.' },
  relaxed: { label: 'Relaxed', copy: 'You prefer extra room to continue down the leg.' },
};
const PROBLEM = {
  tightThighsSeat: { label: 'Watch the upper leg', copy: 'Check the thigh measurement and look for pulling across the seat before buying.' },
  waistGap: { label: 'Check waist and seat together', copy: 'A leg shape cannot solve a waistband gap by itself, so compare both published measurements.' },
  tooMuchFabric: { label: 'Watch the lower leg', copy: 'Check the knee, hem opening, and product photos for excess fabric below the knee.' },
  lengthOff: { label: 'Confirm the inseam', copy: 'Inseams vary by brand and cut. Compare the listed inseam with a pair whose length works for you.' },
  usuallyFine: { label: 'Verify the garment', copy: 'Use the recommendation as a starting shape, then check the retailer’s measurements and return policy.' },
};

function resultInsights(answers, best) {
  const room = ROOM[answers.thighRoom] || ROOM.some;
  const leg = LEG[answers.legShape] || LEG.balanced;
  const concerns = (answers.fitWrong?.length ? answers.fitWrong : ['usuallyFine'])
    .map(problem => PROBLEM[problem] || PROBLEM.usuallyFine);
  const concernLabel = concerns.length > 1 ? 'Your two fit checks' : concerns[0].label;
  const concernCopy = concerns.map(concern => concern.copy).join(' ');
  return [
    { id: 'room', tab: 'Seat & thigh', value: room.label, copy: `${room.copy} ${FIT_LABEL[best]} starts with ${FIT_INFO[best].thigh.toLowerCase()} room through the thigh.` },
    { id: 'leg', tab: 'Leg shape', value: leg.label, copy: `${leg.copy} This recommendation uses a ${FIT_INFO[best].leg.toLowerCase()} lower leg and a ${FIT_INFO[best].open.toLowerCase()} opening.` },
    { id: 'check', tab: 'Check before buying', value: concernLabel, copy: concernCopy },
  ];
}

export default function Report({ answers, onRetake, onHome }) {
  const { best, alt1, alt2, final } = useMemo(() => computeScores(answers), [answers]);
  const { results, notice } = useMemo(() => rankProducts(answers, best), [answers, best]);
  const [preview, setPreview] = useState(best);
  const [activeInsight, setActiveInsight] = useState('room');
  const reduceMotion = useReducedMotion();
  const heading = useRef(null);
  const products = useRef(null);
  const insights = useMemo(() => resultInsights(answers, best), [answers, best]);
  const insight = insights.find(item => item.id === activeInsight) || insights[0];

  useEffect(() => {
    saveLocally('fitco_quiz_completed', 'true');
    saveLocally('fitco_fit_result', best);
    heading.current?.focus({ preventScroll: true });
    track('Report Viewed', {
      fit_archetype: best, fit_label: FIT_LABEL[best], score: final[best],
      margin_over_next: final[best] - final[alt1], product_count: results.length,
    });
  }, [best, alt1, final, results.length]);

  const compare = (fit) => {
    setPreview(fit);
    if (fit !== best) track('Alternate Previewed', { fit_archetype: fit, source: 'alternates' });
  };
  return <main id="main" tabIndex={-1} className="v1-report">
    <header className="v1-header"><div className="v1-header-inner v1-container">
      <Wordmark onClick={onHome} /><button type="button" className="v1-quiet-button" onClick={onRetake}>Retake fitting</button>
    </div></header>
    <section className="v1-report-hero v1-container">
      <div>
        <p className="v1-report-intro">Your best starting shape</p>
        <h1 ref={heading} tabIndex={-1}>{FIT_LABEL[best]}</h1>
        <p className="v1-result-description">{FIT_INFO[best].desc}</p>
        <Btn onClick={() => products.current?.scrollIntoView({ block: 'start' })}>See recommended pants</Btn>
        <div className="v1-fit-inspector">
          <p className="v1-fit-inspector-title">Why this works for you</p>
          <div className="v1-fit-inspector-tabs" role="tablist" aria-label="Explore your fit reasoning">
            {insights.map(item => <button type="button" role="tab" key={item.id}
              id={`fit-insight-tab-${item.id}`}
              aria-selected={activeInsight === item.id} aria-controls="fit-insight-panel"
              onClick={() => setActiveInsight(item.id)}>{item.tab}</button>)}
          </div>
          <div className="v1-fit-insight" id="fit-insight-panel" role="tabpanel"
            aria-labelledby={`fit-insight-tab-${insight.id}`} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={insight.id} initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: .18 }}>
                <strong>{insight.value}</strong><p>{insight.copy}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <figure className="v1-result-figure" data-focus={activeInsight}>
        <div className="v1-result-shape-stage"><FitShapeImage fit={best} /><span className="v1-result-focus" aria-hidden="true" /></div>
        <figcaption>The illustration shows leg shape. Use the explanation to check room and measurements.</figcaption>
      </figure>
    </section>
    <section className="v1-products" ref={products} style={{ scrollMarginTop: '100px' }} aria-labelledby="products-heading">
      <div className="v1-container">
        <h2 id="products-heading">Pants to start with</h2>
        <p className="v1-products-note">Prices checked {PRICES_AS_OF}. Check the retailer for current prices and sizes.</p>
        {notice && <p className="v1-catalog-notice">{notice}</p>}
        <div className="v1-product-grid">
          {results.map((p, i) => <a className="v1-product" key={p.id} href={p.link} target="_blank" rel="noopener noreferrer"
            aria-label={p.brand + ' ' + p.name + (p.variant ? ', ' + p.variant : '') + '. View at retailer (opens a new tab)'}
            onClick={() => track('Recommended Product Clicked', {
              brand: p.brand, product_name: p.name, category: p.category, price: p.price,
              tier: p.tier, rank: i + 1, retailer: retailerOf(p.link), fit_archetype: best, source: 'report',
            })}>
            <ProductPhoto product={p} badge={i === 0 && p.tier === 'Best match'} />
            <p className="v1-product-brand">{p.brand}</p>
            <h3>{p.name}{p.variant ? ' · ' + p.variant : ''}</h3>
            <p className="v1-product-price">${p.price}</p>
            <p className="v1-product-reason">{p.benefit}{p.tier === 'Fit match, other category' ? ' A shape match in another category.' : ''}</p>
            <span className="v1-product-link">View at {p.brand} <ArrowUpRight /></span>
          </a>)}
        </div>
        <p className="v1-products-note" style={{ marginTop: 32, marginBottom: 0 }}>These picks use published brand and retailer specifications. We haven’t hand-measured these pairs. Links go directly to the retailer; FitCo earns no commission today.</p>
      </div>
    </section>
    <section className="v1-alternatives"><div className="v1-container">
      <h2>A couple of other shapes to consider</h2>
      <div className="v1-comparison">
        <div className="v1-comparison-controls" role="group" aria-label="Compare fit shapes">
          {[best, alt1, alt2].map(fit => <button type="button" key={fit} onClick={() => compare(fit)} aria-pressed={preview === fit}>
            <span>{FIT_LABEL[fit]}</span>{fit === best && <small>Your starting shape</small>}
          </button>)}
        </div>
        <div className="v1-comparison-figure" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="v1-comparison-preview" key={preview}
              initial={reduceMotion ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -6 }} transition={{ duration: .2 }}>
              <FitShapeImage fit={preview} />
              <div><h3>{FIT_LABEL[preview]}</h3><p>{FIT_INFO[preview].desc}</p>
                <dl className="v1-fit-specs"><div><dt>Thigh</dt><dd>{FIT_INFO[preview].thigh}</dd></div><div><dt>Lower leg</dt><dd>{FIT_INFO[preview].leg}</dd></div><div><dt>Opening</dt><dd>{FIT_INFO[preview].open}</dd></div></dl>
                {preview !== best && <small>Your recommendation is still {FIT_LABEL[best]}.</small>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="v1-report-end"><Btn ghost onClick={onRetake}>Retake fitting</Btn><a className="v1-text-link" href="/shop/index.html">Browse your fit in the catalog <ArrowUpRight /></a></div>
    </div></section>
    <SiteFooter />
  </main>;
}
