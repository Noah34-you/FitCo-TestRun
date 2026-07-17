import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wordmark, Btn, Kicker, Mono, rise } from '../ui.jsx';
import { PantFlat, GEO } from '../geometry.jsx';
import { computeScores, diagnose, rankProducts, FIT_LABEL, FIT_INFO } from '../engine.js';
import { track, retailerOf } from '../analytics.js';

/* THE FIT REPORT — a dated document, not a sales page.
   Tiers and reasons; caveats in plain sight. */
export default function Report({ answers, onRetake, onHome }) {
  const { best, alt1, alt2, final } = useMemo(() => computeScores(answers), [answers]);
  const g = GEO[best];
  const info = FIT_INFO[best];
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
    <main className="min-h-svh">
      <div className="flex items-center justify-between h-16 px-5 sm:px-10 border-b border-hairline bg-paper/85 backdrop-blur-md sticky top-0 z-40">
        <Wordmark onClick={onHome} />
        <Mono className="hidden sm:block">FIT REPORT — {date}</Mono>
        <button onClick={onRetake} className="text-[13.5px] font-medium text-muted hover:text-ink transition-colors cursor-pointer">Retake</button>
      </div>

      {/* verdict */}
      <section className="grid-paper border-b border-hairline">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-14 grid lg:grid-cols-[46fr_54fr] gap-10 items-center">
          <motion.div variants={rise} initial="hidden" animate="show" custom={0} className="order-last lg:order-first">
            <PantFlat g={g} dims className="w-full max-w-[440px] h-[54vh] min-h-[380px] mx-auto lg:mx-0" />
            <div className="flex justify-between max-w-[440px] mt-1 mx-auto lg:mx-0">
              <Mono>FIG. 02 — Your geometry</Mono>
              <Mono>REF 32×32</Mono>
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
              {[['RISE', info.rise], ['THIGH', `${g.thigh.toFixed(2)}″`], ['KNEE', `${g.knee.toFixed(2)}″`], ['OPENING', `${g.open.toFixed(2)}″`]].map(([k, v]) => (
                <div key={k} className="bg-paper px-4 py-3.5">
                  <Mono className="!text-[9.5px]">{k}</Mono>
                  <div className="font-disp font-semibold text-[17px] mt-1">{v}</div>
                </div>
              ))}
            </motion.div>
            <motion.div variants={rise} initial="hidden" animate="show" custom={4}>
              <Mono className="!text-muted">Reference geometry · not garment-specific</Mono>
            </motion.div>
          </div>
        </div>
      </section>

      {/* products */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 py-16">
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .4 }} className="flex items-end justify-between flex-wrap gap-3 mb-3">
          <h2 className="font-disp font-semibold tracking-[-0.03em] text-[clamp(26px,3vw,40px)]">Pants that agree with it</h2>
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
                <img src={p.img} alt={`${p.brand} ${p.name}`} className="w-full h-full object-cover object-[center_25%] group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
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
              <motion.div key={k} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .3 }} custom={i}
                className="flex gap-5 items-center rounded-2xl border border-hairline bg-white/50 p-5">
                <PantFlat g={GEO[k]} className="w-16 h-24 shrink-0" detail={false} />
                <div>
                  <Mono className="!text-chalk">ALT {String(i + 2).padStart(2, '0')}</Mono>
                  <div className="font-disp font-semibold text-xl mt-1 mb-1">{FIT_LABEL[k]}</div>
                  <p className="text-[13px] leading-relaxed text-muted">{FIT_INFO[k].desc.split('. ')[0]}.</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-[13px] text-muted mt-10 max-w-[560px] leading-relaxed">
            FitCo doesn't sell these products — links go straight to the retailer, and rankings never touch affiliate status. Spec-based data; hand-verification in progress.
          </motion.p>
          <div className="flex gap-3.5 mt-8 flex-wrap">
            <Btn onClick={onRetake}>Retake the fitting</Btn>
            <Btn ghost href="/shop/index.html">Browse your fit in the catalog</Btn>
          </div>
        </div>
      </section>
    </main>
  );
}
