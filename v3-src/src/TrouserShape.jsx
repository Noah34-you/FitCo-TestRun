import { useId } from 'react';
import { FIT_LABEL } from './engine.js';

// Shared waist, seat, rise and leg centers make the quiz comparisons fair.
// Values below are drawing coordinates, never product measurements.
const SHAPES = {
  slimTaper: { thigh: 99, knee: 28, hem: 22 },
  straightFit: { thigh: 108, knee: 40, hem: 39 },
  athleticTaper: { thigh: 119, knee: 34, hem: 27 },
  athleticStraight: { thigh: 119, knee: 43, hem: 42 },
  relaxedTaper: { thigh: 120, knee: 38, hem: 31 },
  relaxedFit: { thigh: 123, knee: 49, hem: 48 },
};

export default function TrouserShape({ fit = 'straightFit', uniformTop = false, decorative = false }) {
  const titleId = useId();
  const s = SHAPES[fit] || SHAPES.straightFit;
  const thigh = uniformTop ? 112 : s.thigh;
  const hip = uniformTop ? 108 : 104 + (thigh - 99) * .3;
  const leftOuter = 230 - thigh, leftInner = 220;
  const outerKnee = 166 - s.knee, innerKnee = 166 + s.knee;
  const outerHem = 165 - s.hem, innerHem = 165 + s.hem;
  const mirror = x => 460 - x;
  const outline = [
    'M140 52 Q138 85', 230 - hip, '122 Q', 228 - hip, '158', leftOuter, '186',
    'C', leftOuter, '238', outerKnee, '290', outerKnee, '340',
    'C', outerKnee, '404', outerHem, '452', outerHem, '508 H', innerHem,
    'C', innerHem, '452', innerKnee, '404', innerKnee, '340',
    'C', innerKnee, '288', leftInner - 4, '224', leftInner, '186',
    'Q224 174 230 174 Q236 174', mirror(leftInner), '186',
    'C', mirror(leftInner - 4), '224', mirror(innerKnee), '288', mirror(innerKnee), '340',
    'C', mirror(innerKnee), '404', mirror(innerHem), '452', mirror(innerHem), '508 H', mirror(outerHem),
    'C', mirror(outerHem), '452', mirror(outerKnee), '404', mirror(outerKnee), '340',
    'C', mirror(outerKnee), '290', mirror(leftOuter), '238', mirror(leftOuter), '186',
    'Q', mirror(228 - hip), '158', mirror(230 - hip), '122 Q322 85 320 52 Z',
  ].join(' ');
  return <svg className="v1-shape" viewBox="80 20 300 510"
    role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined}
    aria-labelledby={decorative ? undefined : titleId}>
    {!decorative && <title id={titleId}>{FIT_LABEL[fit] + ' trouser silhouette. Illustrative shape, not scale measurements.'}</title>}
    <path d={outline} fill="#D9DCD3" stroke="#414B42" strokeWidth="2" strokeLinejoin="round" />
    <path d="M140 52 V38 Q140 30 148 30 H312 Q320 30 320 38 V52 Z" fill="#C9CEC3" stroke="#414B42" strokeWidth="2" />
    <path d="M156 31 V59 M194 31 V54 M267 31 V54 M305 31 V59 M177 53 Q163 84 139 97 M283 53 Q297 84 321 97 M232 54 V139 Q232 157 218 164" fill="none" stroke="#606C5E" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="230" cy="42" r="3.1" fill="#414B42" />
    <path d={'M' + outerHem + ' 496 H' + innerHem + ' M' + mirror(innerHem) + ' 496 H' + mirror(outerHem)} stroke="#606C5E" strokeWidth="1.2" />
  </svg>;
}
