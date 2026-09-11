import './fit-detail-photo.css';

const jeansSrc = `${import.meta.env.BASE_URL}media/fit-guide-jeans.webp`;

/* These are illustrative regions of one photo, not scale measurements.
   Keep all paths in the original image's 1148 × 1371 coordinate system so
   the highlights stay aligned at every responsive size. */
const ZONES = {
  waist: {
    label: 'Waist',
    description: 'The waistband is highlighted in green.',
    path: 'M331 64 Q555 92 782 59 L786 109 Q572 145 330 103 Z',
  },
  rise: {
    label: 'Rise',
    description: 'The front rise is highlighted from the top of the waistband to the crotch seam.',
    path: 'M539 66 L579 65 L577 251 Q574 354 513 410 L483 392 Q535 351 536 260 Z',
  },
  thigh: {
    label: 'Thigh',
    description: 'The upper part of one leg is highlighted just below the crotch.',
    path: 'M272 427 L516 445 L519 516 L262 498 Z',
  },
  opening: {
    label: 'Leg opening',
    description: 'The hem at the bottom of one leg is highlighted.',
    path: 'M200 1205 L458 1219 L454 1262 L193 1249 Z',
  },
};

export default function FitDetailPhoto({ zone, className = '' }) {
  const detail = ZONES[zone];
  if (!detail) return null;

  return (
    <div
      className={`fit-detail-photo ${className}`}
      role="img"
      aria-label={`${detail.label}: ${detail.description} Shown on the same complete pair of blue jeans; illustrative, not a scale measurement.`}
    >
      <img
        src={jeansSrc}
        alt=""
        aria-hidden="true"
        width="1148"
        height="1371"
        loading="lazy"
        decoding="async"
        className="fit-detail-photo__image"
      />
      <svg
        className="fit-detail-photo__overlay"
        viewBox="0 0 1148 1371"
        aria-hidden="true"
        focusable="false"
      >
        <path className="fit-detail-photo__highlight" d={detail.path} />
      </svg>
    </div>
  );
}
