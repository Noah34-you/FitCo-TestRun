import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SiteHeader, SiteFooter, Btn, ArrowUpRight } from '../ui.jsx';
import FitDetailPhoto from '../FitDetailPhoto.jsx';
import HeroExplorer from '../HeroExplorer.jsx';

const DETAILS = [
  ['thigh', 'Thigh', 'Determines how much room you have through the upper leg.'],
  ['seat', 'Seat', 'Controls how the pants sit through your hips and backside.'],
  ['rise', 'Rise', 'Changes where the waistband sits and how the upper half feels.'],
  ['knee', 'Knee', 'Affects how the leg starts to taper.'],
  ['opening', 'Opening', 'Changes the final silhouette around your shoe.'],
];

const METHOD_STEPS = [
  {
    number: '01',
    tab: 'Your proportions',
    title: 'Start with your proportions.',
    copy: 'Your build, usual fit problems, and preferred leg shape tell us where you need room and where you want a cleaner line.',
    tags: ['Build', 'Fit problems', 'Leg shape'],
    image: '/media/v1/method-proportions.webp',
    alt: 'Close view of khaki trousers showing room through the seat and thighs.',
  },
  {
    number: '02',
    tab: 'Your matches',
    title: 'Then find pants worth a look.',
    copy: 'We compare that profile with published cuts in the catalog, then show a starting shape, nearby alternatives, and products to inspect.',
    tags: ['Starting shape', 'Alternatives', 'Products'],
    image: '/media/v1/method-matches.webp',
    alt: 'Two men wearing differently shaped khaki trousers for comparison.',
  },
];

function MethodExplorer() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const step = METHOD_STEPS[active];

  return <div className="v1-method-explorer">
    <div className="v1-method-tabs" role="tablist" aria-label="How FitCo works">
      {METHOD_STEPS.map((item, index) => <button type="button" role="tab" key={item.number}
        id={`method-tab-${index}`} aria-selected={active === index} aria-controls="method-panel"
        onClick={() => setActive(index)}>
        <span>{item.number}</span>{item.tab}
      </button>)}
    </div>
    <div className="v1-method-stage" id="method-panel" role="tabpanel" aria-labelledby={`method-tab-${active}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step.number} className="v1-method-step"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: .24, ease: 'easeOut' }}>
          <div className="v1-method-image"><img src={step.image} alt={step.alt} width="1200" height="800" loading="lazy" /></div>
          <div className="v1-method-copy">
            <p className="v1-method-step-number">Step {step.number}</p>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
            <ul aria-label={`${step.tab} includes`}>{step.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>;
}

export default function Home({ onStart, hasReport, onReport }) {
  const reduceMotion = useReducedMotion();
  return (
    <main id="main" tabIndex={-1} className="fit-home">
      <SiteHeader onHome={() => window.scrollTo({ top: 0 })} onStart={onStart} onReport={hasReport ? onReport : undefined} />
      <HeroExplorer />
      <section className="fit-hero-cta v1-container" aria-labelledby="hero-cta-heading">
        <h2 id="hero-cta-heading">Find pants that complement your build.</h2>
        <div className="fit-hero-cta-actions">
          <Btn big className="v1-button-metallic" onClick={onStart}><span>Find my fit</span><ArrowUpRight /></Btn>
          <p className="v1-reassurance">6 questions <span aria-hidden="true">·</span> No account required</p>
          {hasReport && <button type="button" className="v1-text-link" onClick={onReport}>Return to your results</button>}
        </div>
      </section>
      <section className="v1-education" aria-labelledby="fit-details-heading">
        <div className="v1-container">
          <div className="v1-section-heading">
            <h2 id="fit-details-heading">Small details. Better fit.</h2>
            <p>There’s more to a good fit than the number on the waistband.</p>
          </div>
          <div className="fit-detail-grid">
            {DETAILS.map(([zone, name, description]) => (
              <article key={zone} className="v1-fit-detail">
                <FitDetailPhoto zone={zone} />
                <h3>{name}</h3><p>{description}</p>
              </article>
            ))}
          </div>
          <p className="v1-photo-credit">Photo-based fit guide. Backgrounds edited; markers are illustrative. <a href="/about/index.html#image-credits">Image credits</a></p>
        </div>
      </section>
      <motion.section className="v1-method v1-container" aria-labelledby="method-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: .18 }} transition={{ duration: .48, ease: 'easeOut' }}>
        <div><h2 id="method-heading">How FitCo thinks about fit</h2>
          <a className="v1-text-link" href="/about/index.html">Read the method <ArrowUpRight /></a>
        </div>
        <div className="v1-method-body">
          <MethodExplorer />
          <p className="v1-data-note">Product details come from published brand and retailer specifications. We haven’t hand-measured these pairs. FitCo has no paid placements or affiliate relationships today.</p>
        </div>
      </motion.section>
      <section className="v1-close"><div className="v1-container">
        <h2>Never guess pants again.</h2><Btn big onClick={onStart}>Find my fit</Btn>
      </div></section>
      <SiteFooter />
    </main>
  );
}
