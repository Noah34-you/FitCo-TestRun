import { FIT_LABEL } from './engine.js';

const FIT_IMAGE = {
  slimTaper: 'tapered',
  straightFit: 'straight',
  athleticTaper: 'tapered',
  athleticStraight: 'straight',
  relaxedTaper: 'balanced',
  relaxedFit: 'relaxed',
};

const SHAPE_LABEL = {
  tapered: 'tapered', balanced: 'gently tapered', straight: 'straight', relaxed: 'relaxed',
};

export default function FitShapeImage({ fit, decorative = false }) {
  const shape = FIT_IMAGE[fit] || 'straight';
  return <img className="v1-fit-shape-image" src={`/images/quiz-leg-shapes/${shape}.jpg`}
    width="600" height="469" aria-hidden={decorative || undefined}
    alt={decorative ? '' : `${FIT_LABEL[fit]} shown with a ${SHAPE_LABEL[shape]} leg-shape illustration.`} />;
}
