import { useEffect, useRef, useState } from 'react';
import './hero-explorer.css';

// Add or replace hero assets here. Null keeps the empty-preview fallback.
export const HERO_CUTS = [
  { id: 'slim', label: 'Slim', media: {
    video: '/media/slim.mp4', poster: '/media/slim.jpg',
    alt: 'A man wearing light taupe slim-cut pants with a white shirt and white slip-on shoes',
    videoLabel: 'Slim-cut pants in motion',
  } },
  { id: 'straight', label: 'Straight', media: {
    video: '/media/v1/straight-walk.mp4', poster: '/media/v1/straight-poster.webp',
    alt: 'A man walking across a city crosswalk in navy straight-cut pants, a gray sweatshirt and white sneakers',
    videoLabel: 'Straight-cut pants in motion', priority: true,
  } },
  { id: 'relaxed', label: 'Relaxed', media: {
    video: '/media/relaxed.mp4', poster: '/media/relaxed.jpg',
    alt: 'A man walking across a city crosswalk in black relaxed-cut pants, a gray sweatshirt and white sneakers',
    videoLabel: 'Relaxed-cut pants in motion',
  } },
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
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
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
    if (paused || detail || !visible || videoFailed) player.pause();
    else player.play().catch(() => setPlaying(false));
  }, [cut, paused, detail, visible, videoFailed, reduced]);

  function selectCut(id) {
    setCut(id);
    setDetail(null);
    setPlaying(false);
    setVideoFailed(false);
    setImageFailed(false);
  }
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
    <div className={`fit-explorer-stage ${media && !imageFailed ? '' : 'is-empty'}`}>
      <div className="fit-explorer-heading">
        <h1 id="home-heading">Good pants.<br />Your proportions.</h1>
        <p className="fit-explorer-intro">Find pants that complement your build.</p>
      </div>
      <div className="fit-explorer-panel" role="tabpanel" id="cut-preview" aria-labelledby={`cut-${cut}`} tabIndex={0}>
        {media && !imageFailed ? <div className="fit-explorer-media" key={cut}>
          <img src={media.poster} alt={media.alt} width="510" height="682"
            loading={media.priority ? 'eager' : 'lazy'} fetchpriority={media.priority ? 'high' : 'auto'}
            onError={() => { setImageFailed(true); setPlaying(false); }} />
          {media.video && !videoFailed && <video ref={video} src={media.video} poster={media.poster}
            className={detail ? 'is-inspecting' : ''} muted loop playsInline
            preload={media.priority && !reduced ? 'metadata' : 'none'}
            aria-label={media.videoLabel} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onError={() => { setVideoFailed(true); setPlaying(false); }} />}
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
          {media.video && !videoFailed && <button type="button" className="fit-video-control"
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
