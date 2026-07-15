import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Wordmark, Btn, Mono } from '../ui.jsx';
import { PantFlat, useConvergingGeo } from '../geometry.jsx';
import { QUESTIONS, computeScores, FIT_LABEL, FIT_KEYS } from '../engine.js';

/* THE FITTING — a full-screen instrument that converges on you.
   Every answer re-runs the real engine; the silhouette physically
   reshapes toward the current leader. */
export default function Fitting({ onExit, onComplete, initial = {} }) {
  const reduced = useReducedMotion();
  const firstOpen = Math.max(0, QUESTIONS.findIndex(qq => !(qq.key in initial)));
  const [qi, setQi] = useState(firstOpen);
  const [answers, setAnswers] = useState(initial);
  const [multi, setMulti] = useState([]);
  const advancing = useRef(false);
  const q = QUESTIONS[qi];

  /* advance to the next question that hasn't been answered (seeded
     answers from the hero are skipped, not re-asked) */
  const advanceFrom = (fromIdx, withAnswers) => {
    const nextIdx = QUESTIONS.findIndex((qq, i) => i > fromIdx && !(qq.key in withAnswers));
    if (nextIdx === -1) onComplete(withAnswers);
    else setQi(nextIdx);
  };

  const partial = useMemo(() => ({ ...answers, ...(q.multi && multi.length ? { [q.key]: multi } : {}) }), [answers, multi, q]);
  const { ranked, best } = useMemo(() => computeScores(partial), [partial]);
  const answeredMeaningful = !!(partial.build || (partial.fitWrong && partial.fitWrong.length) || partial.legShape);
  const leader = answeredMeaningful ? best : 'straightFit';
  const g = useConvergingGeo(leader, reduced);

  const pick = (opt) => {
    if (advancing.current) return;
    if (q.multi) {
      setMulti(m => m.includes(opt.v) ? m.filter(x => x !== opt.v) : (m.length >= q.multi ? m : [...m, opt.v]));
      return;
    }
    advancing.current = true;
    const next = { ...answers, [q.key]: opt.v };
    setAnswers(next);
    setTimeout(() => {
      advancing.current = false;
      advanceFrom(qi, next);
    }, 420);
  };

  const continueMulti = () => {
    if (!multi.length) return;
    const next = { ...answers, [q.key]: multi };
    setAnswers(next); setMulti([]);
    advanceFrom(qi, next);
  };

  const back = () => {
    if (qi === 0) { onExit(); return; }
    const prev = QUESTIONS[qi - 1];
    const rest = { ...answers }; delete rest[prev.key]; delete rest[q.key];
    setAnswers(rest); setMulti([]); setQi(qi - 1);
  };

  /* keyboard: 1-5 select, Enter continue (multi), Esc back */
  useEffect(() => {
    const onKey = (e) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= q.options.length) pick(q.options[n - 1]);
      else if (e.key === 'Enter' && q.multi) continueMulti();
      else if (e.key === 'Escape') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selected = (v) => q.multi ? multi.includes(v) : answers[q.key] === v;
  const top3 = ranked.slice(0, 3);
  const scores = useMemo(() => computeScores(partial).final, [partial]);
  const maxScore = Math.max(...top3.map(k => scores[k]), 1);

  return (
    <main className="min-h-svh grid-paper flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between h-16 px-5 sm:px-10 border-b border-hairline bg-paper/85 backdrop-blur-md">
        <Wordmark onClick={onExit} />
        <div className="flex items-center gap-2" aria-label={`Question ${qi + 1} of ${QUESTIONS.length}`}>
          {QUESTIONS.map((qq, i) => (
            <span key={i} className={`h-[3px] rounded-full transition-all duration-400 ${i === qi ? 'w-9 bg-ink' : (qq.key in answers) ? 'w-6 bg-sage' : 'w-6 bg-line'}`} />
          ))}
        </div>
        <div className="flex items-center gap-5">
          <Mono className="hidden sm:block">CAL {String(qi + 1).padStart(2, '0')}/0{QUESTIONS.length}</Mono>
          <button onClick={onExit} className="text-[13px] font-medium text-muted hover:text-ink transition-colors cursor-pointer">Exit</button>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-[42fr_58fr] max-w-[1400px] w-full mx-auto items-center gap-6 px-5 sm:px-10 py-8">
        {/* instrument — converges live */}
        <div className="relative order-first lg:order-none">
          <div className="hidden lg:block">
            <div className="flex items-baseline justify-between mb-1 max-w-[430px]">
              <Mono className="!text-sage">Current reading</Mono>
              <Mono>{answeredMeaningful ? 'CONVERGING' : 'AWAITING INPUT'}</Mono>
            </div>
            <div className="font-mono text-[14px] font-medium tracking-[.1em] mb-3">
              {FIT_LABEL[leader].toUpperCase()}<span className="inline-block w-[7px] h-[13px] bg-sage align-[-2px] ml-1.5 animate-pulse" />
            </div>
            <PantFlat g={g} dims className="w-full max-w-[430px] h-[52vh] min-h-[340px]" />
            {/* convergence bars — relative, unlabeled: honest */}
            <div className="mt-4 max-w-[430px] space-y-1.5" aria-hidden="true">
              {top3.map(k => (
                <div key={k} className="flex items-center gap-3">
                  <span className={`font-mono text-[9.5px] tracking-[.08em] uppercase w-36 shrink-0 ${k === leader ? 'text-sage' : 'text-muted'}`}>{FIT_LABEL[k]}</span>
                  <div className="flex-1 h-[3px] bg-line/60 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${k === leader ? 'bg-sage' : 'bg-chalkline/70'}`}
                      animate={{ width: `${(scores[k] / maxScore) * 100}%` }} transition={{ duration: .6, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* mobile mini-reading */}
          <div className="lg:hidden flex items-center gap-4 rounded-2xl border border-hairline bg-white/55 p-3.5">
            <PantFlat g={g} className="w-14 h-20 shrink-0" detail={false} />
            <div>
              <Mono className="!text-sage block mb-0.5">Current reading</Mono>
              <div className="font-mono text-[13px] font-medium tracking-[.08em]">{FIT_LABEL[leader].toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* question */}
        <div className="max-w-[640px] w-full lg:pl-4 pb-8 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={qi}
              initial={{ opacity: 0, x: 34 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }}
              transition={{ duration: .38, ease: [0.22, 0.7, 0.3, 1] }}>
              <Mono className="!text-chalk">Question {String(qi + 1).padStart(2, '0')} · {q.cat}</Mono>
              <h1 className="font-disp font-semibold tracking-[-0.03em] leading-[1.05] text-[clamp(28px,3.6vw,44px)] mt-3 mb-2">{q.label}</h1>
              <p className={`text-[15px] mb-7 ${q.multi ? 'text-sage font-medium' : 'text-muted'}`}>{q.sub}</p>
              <div className="space-y-2.5" role={q.multi ? 'group' : 'radiogroup'} aria-label={q.label}>
                {q.options.map((opt, i) => (
                  <motion.button key={opt.v}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: .05 + i * 0.05, duration: .35, ease: 'easeOut' }}
                    onClick={() => pick(opt)}
                    role={q.multi ? 'checkbox' : 'radio'} aria-checked={selected(opt.v)}
                    className={`w-full flex items-center gap-4 text-left rounded-xl border px-5 py-4 transition-all duration-200 cursor-pointer group
                      ${selected(opt.v)
                        ? 'border-sage bg-sagesoft shadow-[inset_0_0_0_1px_var(--color-sage)]'
                        : 'border-line bg-white/55 hover:border-ink-soft hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(22,21,15,.06)]'}`}>
                    <span className={`font-mono text-[11px] w-5 shrink-0 ${selected(opt.v) ? 'text-sage' : 'text-muted/70'}`}>{i + 1}</span>
                    <span className="flex-1">
                      <span className="block font-medium text-[15.5px]">{opt.t}</span>
                      <span className="block text-[13px] text-muted mt-0.5">{opt.s}</span>
                    </span>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all
                      ${selected(opt.v) ? 'bg-sage border-sage text-white' : 'border-line group-hover:border-muted text-transparent'}`}>
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none"><path d="M3 6l2.5 2.5L9 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </motion.button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-7">
                <button onClick={back} className="text-[13.5px] font-medium text-muted hover:text-ink transition-colors cursor-pointer">← Back</button>
                {q.multi && <Btn onClick={continueMulti} className={multi.length ? '' : 'opacity-35 pointer-events-none'}>Continue</Btn>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
