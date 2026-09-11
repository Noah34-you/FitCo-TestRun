import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Mono } from '../ui.jsx';
import { PantFlat, GEO } from '../geometry.jsx';
import { computeScores } from '../engine.js';

/* A short transition keeps the route change legible without pretending that
   the site is measuring the visitor or running a lengthy calibration. */
export default function Calibrating({ answers, onDone }) {
  const reduced = useReducedMotion();
  const best = computeScores(answers).best;
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, []);

  useEffect(() => {
    const done = setTimeout(onDone, reduced ? 150 : 650);
    return () => clearTimeout(done);
  }, [reduced, onDone]);

  return (
    <main id="main" tabIndex={-1} className="min-h-svh grid-paper flex flex-col items-center justify-center px-6">
      <h1 ref={headingRef} tabIndex={-1} className="sr-only">
        Finding your matches
      </h1>
      <div>
        <PantFlat g={GEO[best]} className="w-[240px] h-[300px]" />
      </div>
      <div className="mt-8 h-5" aria-live="polite">
        <Mono className="!text-sage">FINDING YOUR MATCHES</Mono>
      </div>
      <p className="mt-2 text-sm text-muted">Comparing your answers with the current catalog.</p>
    </main>
  );
}
