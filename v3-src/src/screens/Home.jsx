import { SiteHeader, SiteFooter, Btn } from '../ui.jsx';
import FitDetailPhoto from '../FitDetailPhoto.jsx';

const DETAILS = [
  ['thigh', 'Thigh', 'Determines how much room you have through the upper leg.'],
  ['seat', 'Seat', 'Controls how the pants sit through your hips and backside.'],
  ['rise', 'Rise', 'Changes where the waistband sits and how the upper half feels.'],
  ['knee', 'Knee', 'Affects how the leg starts to taper.'],
  ['opening', 'Opening', 'Changes the final silhouette around your shoe.'],
];

export default function Home({ onStart, hasReport, onReport }) {
  return (
    <main id="main" tabIndex={-1}>
      <SiteHeader onHome={() => window.scrollTo({ top: 0 })} onStart={onStart} onReport={hasReport ? onReport : undefined} />
      <section className="v1-hero v1-container" aria-labelledby="home-heading">
        <div className="v1-hero-copy">
          <h1 id="home-heading">Pants that complement your build.</h1>
          <p>Answer six questions about your build and preferences. Find the cuts and pants most likely to work with your proportions.</p>
          <Btn big onClick={onStart}>Find my fit</Btn>
          <p className="v1-reassurance">6 questions <span aria-hidden="true">·</span> No account required</p>
          {hasReport && <button type="button" className="v1-text-link" onClick={onReport}>Return to your results</button>}
        </div>
        <figure className="v1-hero-photo">
          <img src="/media/v1/hero.webp" alt="A man wearing tan trousers with a simple black knit top" width="1000" height="1250" fetchpriority="high" />
        </figure>
      </section>
      <section className="v1-education" aria-labelledby="fit-details-heading">
        <div className="v1-container">
          <div className="v1-section-heading">
            <h2 id="fit-details-heading">What changes the way pants fit?</h2>
            <p>There’s more to a good fit than the number on the waistband.</p>
          </div>
          <div className="fit-detail-grid">
            {DETAILS.map(([zone, name, description]) => (
              <article key={zone} className="v1-fit-detail">
                <FitDetailPhoto zone={zone} />
                <h3>{name}</h3><p>{description}</p>
              </article>
            ))}
          </div>
          <p className="v1-photo-credit">Photo-based fit guide. Backgrounds edited; markers are illustrative. <a href="/about/index.html#image-credits">Image credits</a></p>
        </div>
      </section>
      <section className="v1-method v1-container" aria-labelledby="method-heading">
        <div><h2 id="method-heading">How FitCo thinks about fit</h2>
          <a className="v1-text-link" href="/about/index.html">Read the method <span aria-hidden="true">↗</span></a>
        </div>
        <div className="v1-method-body">
          <div><h3>Start with your proportions.</h3>
            <p>Your build and usual fit problems help us work out where you need room. Your preferred leg shape helps narrow the choice.</p>
          </div>
          <div><h3>Then find pants worth a look.</h3>
            <p>We compare that shape with the cuts in our catalog. You’ll see a starting fit, the reason behind it, and products to explore at the retailer.</p>
          </div>
          <p className="v1-data-note">Product details come from published brand and retailer specifications. We haven’t hand-measured these pairs. FitCo has no paid placements or affiliate relationships today.</p>
        </div>
      </section>
      <section className="v1-close"><div className="v1-container">
        <h2>Never guess pants again.</h2><Btn big onClick={onStart}>Find my fit</Btn>
      </div></section>
      <SiteFooter />
    </main>
  );
}
