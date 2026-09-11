import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function Calibrating({ onDone }) {
  const reduced = useReducedMotion();
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => {
    const timer = setTimeout(onDone, reduced ? 100 : 350);
    return () => clearTimeout(timer);
  }, [reduced, onDone]);
  return <main id="main" tabIndex={-1} className="v1-transition">
    <h1 ref={heading} tabIndex={-1}>Your fit is ready.</h1>
    <p>Here’s where to start.</p>
  </main>;
}
