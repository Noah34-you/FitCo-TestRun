import { useEffect, useRef, useState } from 'react';
import './hero-explorer.css';

// Add each future asset here. Null means an intentionally empty preview.
export const HERO_CUTS = [
  { id: 'slim', label: 'Slim', media: null },
  { id: 'straight', label: 'Straight', media: {
    video: '/media/v1/straight-walk.mp4', poster: '/media/v1/straight-poster.webp',
    alt: 'A man walking across a city crosswalk in navy straight-cut pants, a gray sweatshirt and white sneakers',
  } },
  { id: 'relaxed', label: 'Relaxed', media: null },
];
const DETAILS = {
  thigh: { title: 'Room through the thigh', body: 'Look for enough room to move, with fabric that falls smoothly instead of pulling.' },
  leg: { title: 'A straighter line', body: 'A straighter cut keeps a similar width from knee to hem. Notice how it falls over the shoe.' },
};

export default function HeroExplorer() {
  const [cut, setCut] = useState('straight');
  const [detail, setDetail] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  const video = useRef(null);
  const stage = useRef(null);
  const tabs = useRef([]);
  const media = HERO_CUTS.find(item => item.id === cut).media;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(preference.matches); setPaused(preference.matches); };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    observer.observe(stage.current);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    if (paused || detail || !visible || failed) player.pause();
    else player.play().catch(() => setPlaying(false));
  }, [cut, paused, detail, visible, failed, reduced]);

  function selectCut(id) { setCut(id); setDetail(null); setFailed(false); }
  function explore(id) {
    // Show the first frame while inspecting: fixed markers must not chase a moving leg.
    if (video.current) video.current.pause();
    setDetail(current => current === id ? null : id);
  }
  function moveTab(event, index) {
    const keys = { ArrowRight: (index + 1) % 3, ArrowLeft: (index + 2) % 3, Home: 0, End: 2 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = keys[event.key];
    selectCut(HERO_CUTS[next].id);
    tabs.current[next].focus();
  }

  return <section className="fit-explorer" aria-labelledby="home-heading" ref={stage}>
    <div className={`fit-explorer-stage ${media ? '' : 'is-empty'}`}>
      <div className="fit-explorer-heading">
        <h1 id="home-heading">Good pants.<br />Your proportions.</h1>
        <p className="fit-explorer-intro">Find pants that complement your build.</p>
      </div>
      <div className="fit-explorer-panel" role="tabpanel" id="cut-preview" aria-labelledby={`cut-${cut}`} tabIndex={0}>
        {media ? <div className="fit-explorer-media">
          <img src={media.poster} alt={media.alt} width="510" height="682" fetchpriority="high" />
          {media.video && !failed && <video ref={video} src={media.video} poster={media.poster}
            className={detail ? 'is-inspecting' : ''} muted loop playsInline preload={reduced ? 'none' : 'metadata'}
            aria-label="Straight-cut pants in motion" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onError={() => { setFailed(true); setPlaying(false); }} />}
          <span className="fit-explorer-shade" aria-hidden="true" />
          <p className="fit-explorer-hint">Tap to explore the fit <span aria-hidden="true">↗</span></p>
          {Object.entries(DETAILS).map(([id, content]) => <button type="button" key={id}
            className={`fit-hotspot fit-hotspot-${id}`} aria-label={content.title} aria-expanded={detail === id}
            aria-controls={detail === id ? 'fit-detail-callout' : undefined} onClick={() => explore(id)}>
            <span aria-hidden="true">{detail === id ? '−' : '+'}</span>
          </button>)}
          {detail && <div className={`fit-callout fit-callout-${detail}`} id="fit-detail-callout" role="status">
            <h2>{DETAILS[detail].title}</h2><p>{DETAILS[detail].body}</p>
            <button type="button" aria-label="Close fit detail" onClick={() => setDetail(null)}>×</button>
          </div>}
          {media.video && !failed && <button type="button" className="fit-video-control"
            onClick={() => { setDetail(null); setPaused(playing); if (!playing) video.current?.play().catch(() => setPlaying(false)); }}
            aria-label={playing ? 'Pause video' : 'Play video'}>
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>{playing ? 'Pause' : 'Play'}
          </button>}
        </div> : <div className="fit-explorer-empty" role="status"><span>{HERO_CUTS.find(item => item.id === cut).label}</span><p>Preview coming soon</p></div>}
      </div>
      <div className="fit-cut-tabs" role="tablist" aria-label="Explore pant cuts">
        {HERO_CUTS.map((item, index) => <button type="button" role="tab" key={item.id} id={`cut-${item.id}`}
          ref={node => { tabs.current[index] = node; }} aria-selected={cut === item.id} aria-controls="cut-preview"
          tabIndex={cut === item.id ? 0 : -1} onKeyDown={event => moveTab(event, index)} onClick={() => selectCut(item.id)}>
          {item.label}
        </button>)}
      </div>
    </div>
  </section>;
}
