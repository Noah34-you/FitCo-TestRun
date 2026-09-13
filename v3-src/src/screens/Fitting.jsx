import { useEffect, useRef, useState } from 'react';
import { Wordmark, Btn, LegalFooter } from '../ui.jsx';
import { QUESTIONS } from '../engine.js';
import { track } from '../analytics.js';

const BUILD_PANEL = { slim: 0, average: 1, athletic: 2, broader: 3 };
const PROBLEM_PANEL = { tightThighsSeat: 0, waistGap: 1, tooMuchFabric: 2, lengthOff: 3 };
const LEG_SHAPE_IMAGES = {
  tapered: '/images/quiz-leg-shapes/tapered.jpg',
  balanced: '/images/quiz-leg-shapes/balanced.jpg',
  straight: '/images/quiz-leg-shapes/straight.jpg',
  relaxed: '/images/quiz-leg-shapes/relaxed.jpg',
};

function PhotoPanel({ src, panel }) {
  return <span className="v1-photo-panel" style={{ '--panel': panel }}>
    <img src={src} alt="" aria-hidden="true" width="1774" height="887" decoding="async" />
  </span>;
}

function ChoiceVisual({ qkey, value }) {
  if (qkey === 'productType' && value !== 'any')
    return <img src={'/images/quiz-q1-' + value + '.png'} alt="" width="600" height="600" />;
  if (qkey === 'build')
    return <PhotoPanel src="/media/v1/builds.webp" panel={BUILD_PANEL[value]} />;
  if (qkey === 'fitWrong' && value !== 'usuallyFine')
    return <PhotoPanel src="/media/v1/fit-problems.webp" panel={PROBLEM_PANEL[value]} />;
  if (qkey === 'legShape')
    return <img src={LEG_SHAPE_IMAGES[value]} alt="" width="600" height="469" aria-hidden="true" />;
  return null;
}

// A no-problem answer is exclusive; real problems can be combined up to two.
export function toggleFitProblem(current, value) {
  if (current.includes(value)) return current.filter(v => v !== value);
  if (value === 'usuallyFine') return [value];
  const issues = current.filter(v => v !== 'usuallyFine');
  return issues.length < 2 ? [...issues, value] : issues;
}

export default function Fitting({ onExit, onComplete, initial = {} }) {
  const [qi, setQi] = useState(() => Math.max(0, QUESTIONS.findIndex(q => !(q.key in initial))));
  const [answers, setAnswers] = useState(initial);
  const heading = useRef(null);
  const viewedAt = useRef(Date.now());
  const q = QUESTIONS[qi];
  const value = answers[q.key];
  const canContinue = q.multi ? Array.isArray(value) && value.length > 0 : q.options.some(o => o.v === value);

  useEffect(() => {
    viewedAt.current = Date.now();
    track('Question Viewed', { question_number: qi + 1, question_id: q.key });
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [qi, q.key]);

  const select = (v) => setAnswers(prev => ({
    ...prev, [q.key]: q.multi ? toggleFitProblem(prev[q.key] || [], v) : v,
  }));

  const submit = (e) => {
    e.preventDefault();
    if (!canContinue) return;
    track('Question Answered', {
      question_number: qi + 1, question_id: q.key,
      answer: Array.isArray(value) ? value.join(',') : value,
      elapsed_ms: Date.now() - viewedAt.current,
    });
    if (qi === QUESTIONS.length - 1) onComplete(answers);
    else setQi(n => n + 1);
  };

  const choices = <fieldset className={'v1-choices v1-choices-' + q.key}>
    <legend className="sr-only">{q.label}</legend>
    {q.options.map(opt => {
      const wide = opt.v === 'any' || opt.v === 'usuallyFine';
      const visual = ['productType', 'build', 'fitWrong', 'legShape'].includes(q.key) && !wide;
      const checked = q.multi ? (value || []).includes(opt.v) : value === opt.v;
      return <label className={'v1-choice' + (wide ? ' v1-choice-wide' : '')} key={opt.v}>
        <input type={q.multi ? 'checkbox' : 'radio'} name={q.key} value={opt.v}
          disabled={!!(q.multi && !checked && opt.v !== 'usuallyFine' && value?.length >= q.multi)}
          checked={checked} onChange={() => select(opt.v)} aria-describedby={q.key + '-' + opt.v + '-description'} />
        {visual && <span className="v1-choice-visual"><ChoiceVisual qkey={q.key} value={opt.v} /></span>}
        <span className="v1-choice-copy"><strong>{opt.t}</strong>
          <small id={q.key + '-' + opt.v + '-description'}>{opt.s}</small>
        </span>
      </label>;
    })}
  </fieldset>;

  return <main id="main" tabIndex={-1} className="v1-quiz">
    <header className="v1-quiz-header">
      <Wordmark onClick={onExit} />
      <div className="v1-quiz-progress" role="progressbar" aria-label="Fitting progress"
        aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={qi + 1} aria-valuetext={'Question ' + (qi + 1) + ' of ' + QUESTIONS.length}>
        <span style={{ width: ((qi + 1) / QUESTIONS.length * 100) + '%' }} />
      </div>
      <button type="button" className="v1-quiet-button" onClick={onExit}>Exit fitting</button>
    </header>
    <form className="v1-quiz-body" onSubmit={submit}>
      <div className="v1-question-head">
        <span className="v1-question-step">Question {qi + 1} of {QUESTIONS.length}</span>
        <h1 ref={heading} tabIndex={-1}>{q.label}</h1><p>{q.sub}</p>
      </div>
      {q.key === 'height' ? <div className="v1-height-layout">
        <div className="v1-height-ruler" aria-hidden="true"><span>160 cm</span><span>170 cm</span><span>180 cm</span><span>190 cm</span><span>200 cm</span></div>
        {choices}
      </div> : choices}
      {q.multi && <p className="v1-selection-note" role="status">{value?.length === q.multi ? 'Two selected. Deselect one to choose a different problem.' : 'You can choose one or two problems, or “Usually fit fine”.'}</p>}
      {['build', 'fitWrong'].includes(q.key) && <p className="v1-selection-note">AI-created examples to help you compare. Real bodies and garments vary.</p>}
      <div className="v1-quiz-actions">
        <button type="button" className="v1-quiet-button" onClick={() => qi ? setQi(n => n - 1) : onExit()}>← Back</button>
        <Btn type="submit" disabled={!canContinue}>{qi === QUESTIONS.length - 1 ? 'See my fit' : 'Continue'}</Btn>
      </div>
    </form>
    <LegalFooter note="Your results are saved on this device." />
  </main>;
}
