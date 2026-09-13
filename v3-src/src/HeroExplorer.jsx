import { useEffect, useRef, useState } from 'react';
import './hero-explorer.css';

// Each cut owns its motion, inspection image and fixed inspection markers.
export const HERO_CUTS = [
  { id: 'slim', label: 'Slim', media: {
    video: '/media/slim.mp4', still: '/media/slim.jpg',
    alt: 'A man wearing light taupe slim-cut pants with a white shirt and white slip-on shoes',
    videoLabel: 'Slim-cut pants in motion',
    hotspots: { thigh: { x: '50%', y: '42%' }, leg: { x: '51%', y: '65%' } },
  } },
  { id: 'straight', label: 'Straight', media: {
    video: '/media/v1/straight-walk.mp4', still: '/media/v1/straight-still.jpeg',
    alt: 'A man walking across a city crosswalk in navy straight-cut pants, a gray sweatshirt and white sneakers',
    videoLabel: 'Straight-cut pants in motion', priority: true,
    hotspots: { thigh: { x: '45%', y: '42%' }, leg: { x: '39%', y: '64%' } },
  } },
  { id: 'relaxed', label: 'Relaxed', media: {
    video: '/media/relaxed.mp4', still: '/media/relaxed.jpg',
    alt: 'A man walking across a city crosswalk in black relaxed-cut pants, a gray sweatshirt and white sneakers',
    videoLabel: 'Relaxed-cut pants in motion',
    hotspots: { thigh: { x: '54%', y: '42%' }, leg: { x: '56%', y: '64%' } },
  } },
];
const DETAILS = {
  thigh: { title: 'Room through the thigh', body: 'Look for enough room to move, with fabric that falls smoothly instead of pulling.' },
  leg: { title: 'A straighter line', body: 'A straighter cut keeps a similar width from knee to hem. Notice how it falls over the shoe.' },
};

export default function HeroExplorer() {
  const [cut, setCut] = useState('straight');
  const [mode, setMode] = useState('video');
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
    const update = () => {
      setReduced(preference.matches);
      setPaused(preference.matches);
      if (preference.matches) setMode('explore');
    };
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
    if (mode !== 'video' || paused || !visible || videoFailed) player.pause();
    else player.play().catch(() => setPlaying(false));
  }, [cut, mode, paused, visible, videoFailed, reduced]);

  function selectCut(id) {
    setCut(id);
    setMode(reduced ? 'explore' : 'video');
    setDetail(null);
    setPlaying(false);
    setVideoFailed(false);
    setImageFailed(false);
  }
  function explore(id) {
    setDetail(current => current === id ? null : id);
  }
  function enterExplore() {
    // Markers only exist on the still image, where they stay attached to the pants.
    if (video.current) video.current.pause();
    setDetail(null);
    setMode('explore');
  }
  function returnToVideo() {
    setDetail(null);
    setPaused(false);
    setMode('video');
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
        {media && !imageFailed ? <div className={`fit-explorer-media is-${mode}-mode`} key={cut}
          style={{ '--hotspot-thigh-x': media.hotspots.thigh.x, '--hotspot-thigh-y': media.hotspots.thigh.y,
            '--hotspot-leg-x': media.hotspots.leg.x, '--hotspot-leg-y': media.hotspots.leg.y }}>
          <img src={media.still} alt={media.alt} width="1152" height="1536"
            loading={media.priority ? 'eager' : 'lazy'} fetchpriority={media.priority ? 'high' : 'auto'}
            onError={() => { setImageFailed(true); setPlaying(false); }} />
          {media.video && !videoFailed && <video ref={video} src={media.video} poster={media.still}
            muted loop playsInline preload={media.priority && !reduced ? 'metadata' : 'none'}
            aria-label={media.videoLabel} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onError={() => { setVideoFailed(true); setPlaying(false); setMode('explore'); }} />}
          <button type="button" className="fit-mode-toggle" onClick={mode === 'video' ? enterExplore : returnToVideo}
            aria-label={mode === 'video' ? 'Explore the fit details' : 'Return to the moving video'} />
          <span className="fit-explorer-shade" aria-hidden="true" />
          {mode === 'video' && <p className="fit-explorer-hint">Tap to explore the fit
            <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="M6 22 22 6M10 6h12v12" /></svg>
          </p>}
          {mode === 'explore' && Object.entries(DETAILS).map(([id, content]) => <button type="button" key={id}
            className={`fit-hotspot fit-hotspot-${id}`} aria-label={content.title} aria-expanded={detail === id}
            aria-controls={detail === id ? 'fit-detail-callout' : undefined} onClick={() => explore(id)}>
            <span aria-hidden="true">{detail === id ? '−' : '+'}</span>
          </button>)}
          {mode === 'explore' && detail && <div className={`fit-callout fit-callout-${detail}`} id="fit-detail-callout" role="status">
            <h2>{DETAILS[detail].title}</h2><p>{DETAILS[detail].body}</p>
            <button type="button" aria-label="Close fit detail" onClick={() => setDetail(null)}>×</button>
          </div>}
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
