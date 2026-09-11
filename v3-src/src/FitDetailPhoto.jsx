import './fit-detail-photo.css';

const PHOTO = '/media/v1/fit-guide.webp';
// Crops and markers use the same source coordinates, so they stay aligned.
// These identify regions, not verified or to-scale garment measurements.
const ZONES = {
  thigh: { label: 'Thigh', view: '65 140 470 588', line: 'M135 380 L360 380 M135 369 V391 M360 369 V391', detail: 'A short line across the upper leg on the front of the jeans.' },
  seat: { label: 'Seat', view: '785 20 645 806', line: 'M885 270 L1345 270 M885 258 V282 M1345 258 V282', detail: 'A short line across the hips on the rear of the jeans.' },
  rise: { label: 'Rise', view: '165 15 425 531', line: 'M410 90 V300 M399 90 H421 M399 300 H421', detail: 'A vertical line from the front waistband to the crotch seam.' },
  knee: { label: 'Knee', view: '0 295 470 588', line: 'M80 570 L307 570 M80 559 V581 M307 559 V581', detail: 'A short line across one leg near knee height.' },
  opening: { label: 'Opening', view: '0 535 450 562', line: 'M25 946 L247 974 M26 935 L24 957 M248 963 L246 985', detail: 'A short line along the hem of one leg.' },
};
export default function FitDetailPhoto({ zone }) {
  const detail = ZONES[zone];
  if (!detail) return null;
  return <div className="fit-detail-photo" role="img" aria-label={detail.label + ': ' + detail.detail + ' Illustrative, not to scale.'}>
    <svg viewBox={detail.view} aria-hidden="true" focusable="false">
      <image href={PHOTO} width="1448" height="1086" />
      <path className="fit-detail-photo__marker" d={detail.line} />
    </svg>
  </div>;
}
