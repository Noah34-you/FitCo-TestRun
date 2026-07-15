import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './screens/Home.jsx';
import Fitting from './screens/Fitting.jsx';
import Calibrating from './screens/Calibrating.jsx';
import Report from './screens/Report.jsx';

/* View state machine: home → fitting → calibrating → report.
   Hash-synced so refresh / share keeps your place. */
export default function App() {
  const initial = () => {
    const h = window.location.hash;
    if (h === '#/report' && localStorage.getItem('fitco_v3_answers')) return 'report';
    if (h === '#/fitting') return 'fitting';
    return 'home';
  };
  const [view, setView] = useState(initial);
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fitco_v3_answers') || '{}'); } catch { return {}; }
  });
  const [seed, setSeed] = useState({});
  const [session, setSession] = useState(0);

  const go = useCallback((v) => {
    setView(v);
    window.location.hash = v === 'home' ? '/' : `/${v === 'calibrating' ? 'fitting' : v}`;
    window.scrollTo(0, 0);
  }, []);

  /* Start the fitting — optionally seeded with an answer given right
     in the hero (zero-distance fitting). */
  const startFitting = useCallback((seedAnswers) => {
    setSeed(seedAnswers && typeof seedAnswers === 'object' ? seedAnswers : {});
    setSession(s => s + 1);
    go('fitting');
  }, [go]);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash;
      if (h === '#/' || h === '') setView('home');
      else if (h === '#/fitting') setView(v => (v === 'fitting' || v === 'calibrating') ? v : 'fitting');
      else if (h === '#/report') setView('report');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const onFittingComplete = (a) => {
    setAnswers(a);
    localStorage.setItem('fitco_v3_answers', JSON.stringify(a));
    setView('calibrating');
  };

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: .45, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: .3, ease: 'easeIn' } },
  };

  return (
    <div className="grain min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" {...fade}><Home onStart={startFitting} hasReport={!!answers.build} onReport={() => go('report')} /></motion.div>
        )}
        {view === 'fitting' && (
          <motion.div key={`fitting-${session}`} {...fade}><Fitting initial={seed} onExit={() => go('home')} onComplete={onFittingComplete} /></motion.div>
        )}
        {view === 'calibrating' && (
          <motion.div key="cal" {...fade}><Calibrating answers={answers} onDone={() => go('report')} /></motion.div>
        )}
        {view === 'report' && (
          <motion.div key="report" {...fade}><Report answers={answers} onRetake={() => go('fitting')} onHome={() => go('home')} /></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
