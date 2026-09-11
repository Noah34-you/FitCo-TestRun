import { useEffect, useMemo, useRef, useState } from 'react';
import { Wordmark, Btn, SiteFooter } from '../ui.jsx';
import TrouserShape from '../TrouserShape.jsx';
import { computeScores, diagnose, rankProducts, FIT_LABEL, FIT_INFO, PRICES_AS_OF } from '../engine.js';
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

export default function Report({ answers, onRetake, onHome }) {
  const { best, alt1, alt2, final } = useMemo(() => computeScores(answers), [answers]);
  const { results, notice } = useMemo(() => rankProducts(answers, best), [answers, best]);
  const [preview, setPreview] = useState(best);
  const heading = useRef(null);
  const products = useRef(null);

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
        <details className="v1-result-why"><summary>Why this shape fits your answers</summary><p>{diagnose(answers, best)}</p></details>
      </div>
      <figure className="v1-result-figure">
        <TrouserShape fit={best} />
        <figcaption>A guide to the shape. Individual garments vary.</figcaption>
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
            <span className="v1-product-link">View at {p.brand} <span aria-hidden="true">↗</span></span>
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
        <div className="v1-comparison-figure">
          <TrouserShape fit={preview} />
          <div aria-live="polite"><h3>{FIT_LABEL[preview]}</h3><p>{FIT_INFO[preview].desc}</p>
            {preview !== best && <small>Your recommendation is still {FIT_LABEL[best]}.</small>}
          </div>
        </div>
      </div>
      <div className="v1-report-end"><Btn ghost onClick={onRetake}>Retake fitting</Btn><a className="v1-text-link" href="/shop/index.html">Browse your fit in the catalog ↗</a></div>
    </div></section>
    <SiteFooter />
  </main>;
}
