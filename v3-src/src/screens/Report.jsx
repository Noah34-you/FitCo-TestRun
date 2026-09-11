import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Wordmark, Btn, Kicker, Mono, rise, LegalFooter } from '../ui.jsx';
import { PantFlat, GEO, useConvergingGeo } from '../geometry.jsx';
import { computeScores, diagnose, rankProducts, FIT_LABEL, FIT_INFO, PRICES_AS_OF } from '../engine.js';
import { track, retailerOf } from '../analytics.js';

/* The report shows ranked cuts, product picks, and their limitations. */
export default function Report({ answers, onRetake, onHome }) {
  const { best, alt1, alt2, final } = useMemo(() => computeScores(answers), [answers]);
  const reduced = useReducedMotion();

  /* Preview any of the top three fits on the same drawing. */
  const [preview, setPreview] = useState(best);
  const [highlight, setHighlight] = useState(null);
  const flatRef = useRef(null);
  const g = useConvergingGeo(preview, reduced);
  const info = FIT_INFO[preview];
  const previewFit = (k, source) => {
    setPreview(k);
    if (k !== best) track('Alternate Previewed', { fit_archetype: k, source });
    if (source === 'alternates' && flatRef.current) flatRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  };
  const SPEC_DIM = { RISE: null, THIGH: 'THIGH', LEG: 'KNEE', OPENING: 'OPEN' };
  const why = useMemo(() => diagnose(answers, best), [answers, best]);
  const { results, notice } = useMemo(() => rankProducts(answers, best), [answers, best]);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  /* keep the rest of the FitCo ecosystem in sync */
  useEffect(() => {
    localStorage.setItem('fitco_quiz_completed', 'true');
    localStorage.setItem('fitco_fit_result', best);
    track('Report Viewed', {
      fit_archetype: best,
      fit_label: FIT_LABEL[best],
      score: +final[best].toFixed(3),
      margin_over_next: +(final[best] - final[alt1]).toFixed(3),
      product_count: results.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [best]);

  return (
    <main id="main" tabIndex={-1} className="min-h-svh">
      <div className="flex items-center justify-between h-16 px-5 sm:px-10 border-b border-hairline bg-paper/85 backdrop-blur-md sticky top-0 z-40">
        <Wordmark onClick={onHome} />
        <Mono className="hidden sm:block">FIT REPORT · {date}</Mono>
        <button onClick={onRetake} className="text-[13.5px] font-medium text-muted hover:text-ink transition-colors cursor-pointer">Retake</button>
      </div>

      {/* recommended fit */}
      <section className="grid-paper border-b border-hairline relative overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-10 py-14 grid lg:grid-cols-[46fr_54fr] gap-10 items-center">
          <motion.div variants={rise} initial="hidden" animate="show" custom={0} className="order-last lg:order-first">
            <div className="flex items-center gap-2 max-w-[440px] mx-auto lg:mx-0 mb-3" role="group" aria-label="Preview a fit on the drawing">
              {[[best, 'Your match'], [alt1, 'Alt 02'], [alt2, 'Alt 03']].map(([k, t]) => (
                <button key={k} onClick={() => previewFit(k, 'chips')} aria-pressed={preview === k}
                  className={`font-mono text-[10.5px] tracking-[.1em] uppercase px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer
                    ${preview === k ? 'border-sage bg-sagesoft text-sage' : 'border-line text-muted hover:border-ink-soft hover:text-ink'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div ref={flatRef} className="relative max-w-[440px] mx-auto lg:mx-0">
              <PantFlat g={g} highlight={highlight} className="w-full h-[54vh] min-h-[380px]" />
            </div>
            <div className="flex justify-between max-w-[440px] mt-1 mx-auto lg:mx-0">
              <Mono>{preview === best ? 'Your fit shape' : `${FIT_LABEL[preview]} · comparison`}</Mono>
              <Mono>Typical proportions</Mono>
            </div>
            <div className="max-w-[440px] mx-auto lg:mx-0 h-5 mt-1.5" aria-live="polite">
              {preview !== best && (
                <Mono className="!text-sage">Previewing an alternative. Your result is still {FIT_LABEL[best]}.</Mono>
              )}
            </div>
          </motion.div>
          <div>
            <motion.div variants={rise} initial="hidden" animate="show" custom={0}>
              <Kicker className="mb-5">Your strongest match</Kicker>
            </motion.div>
            <motion.h1 variants={rise} initial="hidden" animate="show" custom={1}
              className="font-disp font-semibold tracking-[-0.035em] leading-[0.98] text-[clamp(42px,5.6vw,80px)] mb-6">
              {FIT_LABEL[best]}
            </motion.h1>
            <motion.p variants={rise} initial="hidden" animate="show" custom={2} className="text-[16.5px] leading-relaxed text-ink-soft max-w-[520px] mb-7">{why}</motion.p>
            <motion.div variants={rise} initial="hidden" animate="show" custom={3}
              className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline border border-hairline max-w-[520px] mb-8">
              {[['RISE', info.rise], ['THIGH', info.thigh], ['LEG', info.leg], ['OPENING', info.open]].map(([k, v]) => (
                <button key={k} type="button"
                  onMouseEnter={() => setHighlight(SPEC_DIM[k])} onMouseLeave={() => setHighlight(null)}
                  onClick={() => setHighlight(h => h === SPEC_DIM[k] ? null : SPEC_DIM[k])}
                  className={`bg-paper px-4 py-3.5 text-left transition-colors duration-200 ${SPEC_DIM[k] ? 'cursor-pointer hover:bg-sagesoft/60' : 'cursor-default'} ${highlight && highlight === SPEC_DIM[k] ? 'bg-sagesoft/60' : ''}`}>
                  <Mono className={`!text-[9.5px] ${highlight && highlight === SPEC_DIM[k] ? '!text-sage' : ''}`}>{k}</Mono>
                  <div className="font-disp font-semibold text-[17px] mt-1">{v}</div>
                </button>
              ))}
            </motion.div>
            <motion.div variants={rise} initial="hidden" animate="show" custom={4}>
              <Mono className="!text-muted">Typical shape for this cut. Specific pants vary.</Mono>
            </motion.div>
          </div>
        </div>
      </section>

      {/* products */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 py-16">
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .4 }} className="flex items-end justify-between flex-wrap gap-3 mb-3">
          <h2 className="font-disp font-semibold tracking-[-0.03em] text-[clamp(26px,3vw,40px)]">Pants sold in this fit</h2>
          <Mono>Independent picks · links go to the retailer</Mono>
        </motion.div>
        {notice && (
          <motion.p variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-[14.5px] text-chalk font-medium mb-6 max-w-[640px]">{notice}</motion.p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {results.map((p, i) => (
            <motion.a key={p.id} href={p.link} target="_blank" rel="noopener"
              onClick={() => track('Recommended Product Clicked', {
                brand: p.brand, product_name: p.name, category: p.category, price: p.price,
                tier: p.tier, rank: i + 1, retailer: retailerOf(p.link), fit_archetype: best, source: 'report',
              })}
              variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .2 }} custom={i}
              className="group rounded-2xl border border-hairline bg-white/60 overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(22,21,15,.12)] transition-all duration-300">
              <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
                {/* Drafting placeholder shown when there is no verified photo,
                    or if a photo URL fails to load */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5" aria-hidden="true">
                  <PantFlat g={GEO[p.primaryFit]} detail={false} className="h-[68%]" fill="rgba(255,255,255,.65)" />
                  <Mono className="!text-[9px] text-center">{p.brand} · photo pending</Mono>
                </div>
                {p.img && (
                  <img src={p.img} alt={`${p.brand} ${p.name}`}
                    className="absolute inset-0 w-full h-full object-cover object-[center_25%] group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                )}
                <span className={`absolute top-3 left-3 font-mono text-[9.5px] tracking-[.12em] uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm
                  ${p.tier === 'Best match' ? 'bg-sage text-white border-sage' : 'bg-paper/90 text-ink-soft border-line'}`}>{p.tier}</span>
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <Mono className="!text-[10px]">{p.brand}</Mono>
                  <span className="font-disp font-semibold text-[15px]">${p.price}</span>
                </div>
                <div className="font-medium text-[14.5px] mt-1 leading-snug">{p.name}{p.variant ? ` · ${p.variant}` : ''}</div>
                <ul className="mt-3 space-y-1.5">
                  {p.reasons.slice(0, 2).map(r => (
                    <li key={r} className="text-[12.5px] leading-snug text-ink-soft flex gap-2">
                      <span className="text-sage mt-px shrink-0">✓</span>{r}
                    </li>
                  ))}
                </ul>
                <div className="text-[11px] text-muted border-t border-dashed border-hairline mt-3 pt-2.5">{p.flags[p.flags.length - 1]}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* alternates */}
      <section className="border-t border-hairline grid-paper">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-14">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .4 }}>
            <Kicker className="mb-8">Ranked second and third for your build</Kicker>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-[880px]">
            {[alt1, alt2].map((k, i) => (
              <motion.button key={k} type="button" onClick={() => previewFit(k, 'alternates')} aria-pressed={preview === k}
                variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .3 }} custom={i}
                className={`flex gap-5 items-center text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer
                  ${preview === k ? 'border-sage bg-sagesoft/50 shadow-[inset_0_0_0_1px_var(--color-sage)]' : 'border-hairline bg-white/50 hover:border-ink-soft hover:-translate-y-px'}`}>
                <PantFlat g={GEO[k]} className="w-16 h-24 shrink-0" detail={false} />
                <div>
                  <Mono className="!text-chalk">ALT {String(i + 2).padStart(2, '0')}</Mono>
                  <div className="font-disp font-semibold text-xl mt-1 mb-1">{FIT_LABEL[k]}</div>
                  <p className="text-[13px] leading-relaxed text-muted">{FIT_INFO[k].desc.split('. ')[0]}.</p>
                  <Mono className="!text-[9.5px] !text-sage block mt-2">{preview === k ? 'On the instrument above' : 'Tap to preview on the instrument'}</Mono>
                </div>
              </motion.button>
            ))}
          </div>
          <motion.p variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-[13px] text-muted mt-10 max-w-[560px] leading-relaxed">
            Links go directly to the retailer. FitCo has no affiliate relationships and earns no commission today. Product details come from published brand and retailer specifications; we have not hand-measured these pairs. Prices were checked on {PRICES_AS_OF}. Check the retailer for the current price.
          </motion.p>
          <div className="flex gap-3.5 mt-8 flex-wrap">
            <Btn onClick={onRetake}>Retake the fitting</Btn>
            <Btn ghost href="/shop/index.html">Browse your fit in the catalog</Btn>
          </div>
        </div>
      </section>
    
      <LegalFooter note="Independent recommendations" />
    </main>
  );
}
