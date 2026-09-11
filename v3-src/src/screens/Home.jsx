import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Wordmark, Btn, Kicker, Mono, Scanline, rise } from '../ui.jsx';
import { PantFlat, useConvergingGeo } from '../geometry.jsx';
import { RuleIcon } from '../illustrations.jsx';
import FitDetailPhoto from '../FitDetailPhoto.jsx';
import { FIT_KEYS, FIT_LABEL } from '../engine.js';

const heroImg = `${import.meta.env.BASE_URL}media/hero-fabric.jpg`;

function useCycler(interval = 2600) {
  const [i, setI] = useState(2);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % FIT_KEYS.length), interval);
    return () => clearInterval(t);
  }, [interval]);
  return FIT_KEYS[i];
}

/* The first fitting question can be answered from the homepage. */
const BUILDS = [['slim', 'Slim'], ['average', 'Average'], ['athletic', 'Athletic'], ['broader', 'Broader']];

function ReadingCard({ reduced, onStart }) {
  const key = useCycler();
  const g = useConvergingGeo(reduced ? 'athleticTaper' : key, reduced);
  const shown = reduced ? 'athleticTaper' : key;
  return (
    <div className="relative rounded-2xl border border-hairline bg-paper/78 backdrop-blur-md shadow-[0_24px_70px_rgba(22,21,15,.16)] p-5 w-[250px] sm:w-[286px]">
      <div className="flex items-baseline justify-between mb-1">
        <Mono className="!text-sage">Fit preview</Mono>
        <Mono>Six common cuts</Mono>
      </div>
      <div className="font-mono text-[13px] font-medium tracking-[.1em] text-ink mb-2">{FIT_LABEL[shown].toUpperCase()}<span className="inline-block w-[7px] h-[13px] bg-sage align-[-2px] ml-1 animate-pulse" /></div>
      <PantFlat g={g} className="w-full h-[196px]" />
      <p className="text-[12px] leading-relaxed text-muted mt-2">The drawing changes as your answers narrow the match.</p>
      <div className="border-t border-hairline mt-3.5 pt-3">
        <Mono className="!text-[9.5px] !text-sage block mb-2">Choose your build to start</Mono>
        <div className="grid grid-cols-2 gap-1.5">
          {BUILDS.map(([v, t]) => (
            <button key={v} onClick={() => onStart({ build: v })}
              className="font-mono text-[11px] tracking-[.05em] uppercase px-2.5 py-2 rounded-lg border border-line bg-white/60 text-ink-soft hover:border-sage hover:text-sage hover:bg-sagesoft transition-all duration-150 cursor-pointer">
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const FIT_DETAILS = [
  ['01', 'Waist', 'How snugly the waistband sits.', 'waist'],
  ['02', 'Rise', 'From the crotch seam to the top of the waistband.', 'rise'],
  ['03', 'Thigh', 'Room through the upper leg.', 'thigh'],
  ['04', 'Leg opening', 'The hem width changes how pants sit over your shoes.', 'opening'],
];

const RULES = [
  ['A focused catalog', 'The current catalog has 22 pants. Each one is included for a clear fit reason.'],
  ['Independent picks', 'FitCo has no affiliate relationships or paid placements today.'],
  ['Plain-language results', 'You get a recommended cut, alternatives, and the reason behind each pick.'],
  ['Visible data limits', 'Product specs come from brands and retailers. Hand verification is still in progress.'],
];

export default function Home({ onStart, hasReport, onReport }) {
  const reduced = useReducedMotion();
  return (
    <main id="main" tabIndex={-1}>
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-16 px-5 sm:px-10 bg-paper/85 backdrop-blur-md border-b border-hairline/70">
        <Wordmark onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-ink-soft">
          <a className="inline-flex items-center min-h-[24px] py-1 hover:text-ink transition-colors" href="/about/index.html">The Method</a>
          <a className="inline-flex items-center min-h-[24px] py-1 hover:text-ink transition-colors" href="/shop/index.html">The Catalog</a>
          {hasReport && <button className="hover:text-ink transition-colors cursor-pointer" onClick={onReport}>Your Report</button>}
        </nav>
        <Btn onClick={onStart}>Start the fitting</Btn>
      </header>

      {/* HERO */}
      <section className="relative min-h-svh flex items-center overflow-hidden">
        <motion.img
          src={heroImg} alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.06, x: 0 }}
          animate={reduced ? {} : { scale: [1.06, 1.13, 1.06], x: [0, -24, 0] }}
          transition={{ duration: 46, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, var(--color-paper) 0%, rgba(243,240,232,.94) 34%, rgba(243,240,232,.55) 58%, rgba(243,240,232,.18) 100%)' }} />
        <div className="absolute inset-x-0 top-0 h-24" style={{ background: 'linear-gradient(180deg, rgba(243,240,232,.9), transparent)' }} />
        {!reduced && <Scanline />}

        <div className="relative z-10 w-full px-5 sm:px-10 pt-24 pb-16 grid lg:grid-cols-[54fr_46fr] items-center gap-10 max-w-[1400px] mx-auto">
          <div className="max-w-[620px]">
            <motion.div variants={rise} initial="hidden" animate="show" custom={0}>
              <Kicker className="mb-7">Men's pants, matched by build</Kicker>
            </motion.div>
            <h1 className="font-disp font-semibold tracking-[-0.035em] leading-[0.98] text-[clamp(46px,7vw,96px)] mb-7">
              {['Never guess', 'pants again.'].map((line, i) => (
                <motion.span key={line} className="block" variants={rise} initial="hidden" animate="show" custom={i + 1}>{line}</motion.span>
              ))}
            </h1>
            <motion.p variants={rise} initial="hidden" animate="show" custom={3} className="text-[clamp(16px,1.35vw,19px)] leading-relaxed text-ink-soft max-w-[460px] mb-9">
              Answer six questions about your build, common fit problems, and the shape you like. FitCo suggests a cut and shows you pants sold in that fit.
            </motion.p>
            <motion.div variants={rise} initial="hidden" animate="show" custom={4} className="flex items-center gap-3.5 flex-wrap mb-11">
              <Btn big onClick={onStart}>Find your fit</Btn>
              <Btn ghost href="/about/index.html">How it works</Btn>
            </motion.div>
            <motion.div variants={rise} initial="hidden" animate="show" custom={5} className="flex gap-6 flex-wrap">
              {['Six questions', 'No account required'].map(f => (
                <Mono key={f} className="flex items-center gap-2"><i className="w-[5px] h-[5px] rounded-full bg-chalkline inline-block" />{f}</Mono>
              ))}
            </motion.div>
          </div>
          <motion.div className="hidden lg:flex justify-end pr-4" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55, duration: .8, ease: [0.22, 0.7, 0.3, 1] }}>
            <ReadingCard reduced={reduced} onStart={onStart} />
          </motion.div>
        </div>

        <div className="absolute bottom-5 inset-x-0 flex justify-between px-5 sm:px-10 z-10">
          <Mono>How pants are shaped</Mono>
          <Mono className="hidden sm:inline-block bg-paper/75 backdrop-blur-sm rounded-full px-3 py-1">Six fit profiles</Mono>
        </div>
      </section>

      {/* FOUR FIT DETAILS — ONE REUSABLE PHOTO */}
      <section className="grid-paper border-y border-hairline" aria-labelledby="fit-details-heading">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-10 py-16 sm:py-24">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .4 }}>
            <Kicker className="mb-4">Where fit is won or lost</Kicker>
            <h2 id="fit-details-heading" className="font-disp font-semibold tracking-[-0.03em] text-[clamp(28px,3.4vw,48px)] mb-8 sm:mb-12">What changes the way pants fit</h2>
          </motion.div>
          <div className="fit-detail-grid gap-px bg-hairline border border-hairline">
            {FIT_DETAILS.map(([n, name, d, zone], i) => (
              <motion.article key={zone} className="bg-paper min-w-0 p-4 sm:p-7" variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .25 }} custom={i}>
                <Mono className="!text-chalk !text-xs">{n}</Mono>
                <FitDetailPhoto zone={zone} className="mt-3 mb-5" />
                <h3 className="font-disp font-semibold text-lg sm:text-2xl mb-2">{name}</h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted max-w-[32ch]">{d}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* THE STANDARD */}
      <section className="bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-24">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .4 }}>
            <Kicker className="mb-4 !text-chalkline">How recommendations work</Kicker>
            <h2 className="font-disp font-semibold tracking-[-0.03em] text-[clamp(28px,3.4vw,48px)] mb-12 max-w-[720px]">Clear picks, with the limits shown</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-paper/15 border border-paper/15">
            {RULES.map(([t, d], i) => (
              <motion.div key={t} className="bg-ink p-7" variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .3 }} custom={i}>
                <div className="flex items-start justify-between mb-4">
                  <Mono className="!text-chalkline">RULE {String(i + 1).padStart(2, '0')}</Mono>
                  <RuleIcon n={i} className="w-7 h-7 text-chalkline/80" />
                </div>
                <div className="font-disp font-semibold text-lg mb-2">{t}</div>
                <p className="text-[13.5px] leading-relaxed text-paper/60">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSE */}
      <section className="grid-paper">
        <div className="max-w-[900px] mx-auto px-5 sm:px-10 py-28 text-center">
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: .5 }}>
            <Mono className="!text-sage">The fitting · 60 seconds</Mono>
            <h2 className="font-disp font-semibold tracking-[-0.035em] leading-[1.0] text-[clamp(36px,5.4vw,76px)] my-6 text-balance">See which cuts fit your build.</h2>
            <Btn big onClick={onStart} className="mt-2">Start the fitting</Btn>
            <div className="mt-10"><Mono>Free · No account required</Mono></div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-hairline px-5 sm:px-10 py-7 flex items-center justify-between gap-4 flex-wrap">
        <Wordmark onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <nav className="flex gap-5 text-[13px] text-muted">
          <a className="inline-flex items-center min-h-[24px] py-1 hover:text-ink transition-colors" href="/about/index.html">Method</a>
          <a className="inline-flex items-center min-h-[24px] py-1 hover:text-ink transition-colors" href="/shop/index.html">Catalog</a>
          <a className="inline-flex items-center min-h-[24px] py-1 hover:text-ink transition-colors" href="/privacy/index.html">Privacy</a>
          <a className="inline-flex items-center min-h-[24px] py-1 hover:text-ink transition-colors" href="/terms/index.html">Terms</a>
        </nav>
        <Mono>Independent recommendations</Mono>
      </footer>
    </main>
  );
}
