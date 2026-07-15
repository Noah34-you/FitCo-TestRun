import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mono } from '../ui.jsx';
import { PantFlat, GEO } from '../geometry.jsx';
import { computeScores, FIT_LABEL } from '../engine.js';

const STEPS = ['MEASURING SEAT', 'CHECKING RISE', 'SETTING TAPER', 'MATCHING CATALOG'];

/* Brief, honest theater: the geometry locks, a scan confirms it.
   (The computation itself is instant — this is the reveal.) */
export default function Calibrating({ answers, onDone }) {
  const reduced = useReducedMotion();
  const best = computeScores(answers).best;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) { const t = setTimeout(onDone, 350); return () => clearTimeout(t); }
    const iv = setInterval(() => setStep(s => s + 1), 480);
    const done = setTimeout(onDone, 480 * STEPS.length + 500);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [reduced, onDone]);

  return (
    <main className="min-h-svh grid-paper flex flex-col items-center justify-center px-6">
      <div className="relative">
        <PantFlat g={GEO[best]} className="w-[240px] h-[300px]" />
        {!reduced && (
          <motion.div className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent, var(--color-chalkline) 15%, var(--color-chalkline) 85%, transparent)', boxShadow: '0 0 16px rgba(195,154,69,.6)' }}
            initial={{ left: '8%' }} animate={{ left: ['8%', '92%', '8%'] }}
            transition={{ duration: 1.9, ease: 'easeInOut' }} />
        )}
      </div>
      <div className="mt-8 h-5" aria-live="polite">
        <Mono className="!text-sage">{STEPS[Math.min(step, STEPS.length - 1)]}<span className="inline-block w-[6px] h-[11px] bg-sage align-[-1px] ml-1.5 animate-pulse" /></Mono>
      </div>
      <Mono className="mt-2 !text-muted">LOCKING · {FIT_LABEL[best].toUpperCase()}</Mono>
    </main>
  );
}
