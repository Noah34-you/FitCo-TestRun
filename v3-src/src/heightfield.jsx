/* ============================================================
   FitCo — the report's signature visual. A procedural
   heightfield rendered as drifting survey contours (marching
   squares over a sum of plane waves). The pointer raises the
   terrain beneath it, like a scan in progress; scroll advances
   the survey on touch devices. Adaptive resolution keeps the
   frame budget honest; prefers-reduced-motion gets one static
   frame. No dependencies.
   ============================================================ */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const WAVES = [
  [1.9, 0.7, 0.110, 0.0, 0.42],
  [0.8, -1.6, -0.072, 2.1, 0.30],
  [-1.3, 1.1, 0.056, 4.2, 0.18],
  [0.5, 2.3, -0.091, 1.3, 0.10],
];
const LEVELS = [-0.52, -0.31, -0.10, 0.10, 0.31, 0.52];
const SAGE_LEVEL = 3;
const SCALE = 0.013; // css px -> field units

const field = (x, y, t) => {
  let v = 0;
  for (let i = 0; i < 4; i++) {
    const w = WAVES[i];
    v += w[4] * Math.sin(w[0] * x + w[1] * y + w[2] * t + w[3]);
  }
  return v;
};

export default function Heightfield({ className = '' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    let raf = 0, alive = true, visible = true;
    let cell = 11, gw = 0, gh = 0, vals = null;
    let W = 0, H = 0, ink = '#16150F';
    const ptr = { x: 0.5, y: 0.4, a: 0, tx: 0.5, ty: 0.4, ta: 0 };
    let scrollT = 0, ema = 6;

    const grid = () => { gw = Math.ceil(W / cell) + 1; gh = Math.ceil(H / cell) + 1; vals = new Float32Array(gw * gh); };
    const resize = () => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ink = getComputedStyle(canvas).color;
      grid();
      if (reduced) draw(0);
    };

    function draw(tms) {
      const t = tms * 0.001 + scrollT;
      ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06; ptr.a += (ptr.ta - ptr.a) * 0.05;
      const px = ptr.x * W, py = ptr.y * H;
      const sig2 = 2 * Math.pow(Math.min(W, H) * 0.22, 2);
      const bump = ptr.a > 0.01;
      for (let j = 0; j < gh; j++) {
        const y = j * cell;
        for (let i = 0; i < gw; i++) {
          const x = i * cell;
          let v = field(x * SCALE, y * SCALE, t);
          if (bump) { const dx = x - px, dy = y - py; v += ptr.a * 0.55 * Math.exp(-(dx * dx + dy * dy) / sig2); }
          vals[j * gw + i] = v;
        }
      }
      ctx.clearRect(0, 0, W, H);
      for (let li = 0; li < LEVELS.length; li++) {
        const L = LEVELS[li];
        ctx.beginPath();
        for (let j = 0; j < gh - 1; j++) {
          for (let i = 0; i < gw - 1; i++) {
            const a = vals[j * gw + i], b = vals[j * gw + i + 1], c = vals[(j + 1) * gw + i + 1], d = vals[(j + 1) * gw + i];
            const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            const x = i * cell, y = j * cell;
            const txv = x + cell * ((L - a) / (b - a)), ryv = y + cell * ((L - b) / (c - b));
            const bxv = x + cell * ((L - d) / (c - d)), lyv = y + cell * ((L - a) / (d - a));
            switch (idx) {
              case 1: case 14: ctx.moveTo(x, lyv); ctx.lineTo(bxv, y + cell); break;
              case 2: case 13: ctx.moveTo(bxv, y + cell); ctx.lineTo(x + cell, ryv); break;
              case 3: case 12: ctx.moveTo(x, lyv); ctx.lineTo(x + cell, ryv); break;
              case 4: case 11: ctx.moveTo(txv, y); ctx.lineTo(x + cell, ryv); break;
              case 6: case 9: ctx.moveTo(txv, y); ctx.lineTo(bxv, y + cell); break;
              case 7: case 8: ctx.moveTo(x, lyv); ctx.lineTo(txv, y); break;
              case 5: ctx.moveTo(x, lyv); ctx.lineTo(txv, y); ctx.moveTo(bxv, y + cell); ctx.lineTo(x + cell, ryv); break;
              case 10: ctx.moveTo(txv, y); ctx.lineTo(x + cell, ryv); ctx.moveTo(x, lyv); ctx.lineTo(bxv, y + cell); break;
            }
          }
        }
        if (li === SAGE_LEVEL) { ctx.strokeStyle = 'rgba(60,107,60,.30)'; ctx.lineWidth = 1.3; ctx.stroke(); }
        else { ctx.strokeStyle = ink; ctx.globalAlpha = 0.14; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1; }
      }
    }

    const loop = (tms) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const t0 = performance.now();
      draw(tms);
      const cost = performance.now() - t0;
      ema = ema * 0.9 + cost * 0.1;
      if (ema > 11 && cell < 24) { cell += 3; grid(); }     // degrade gracefully
      else if (ema < 4.5 && cell > 11) { cell -= 1; grid(); } // recover
    };

    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      ptr.tx = (e.clientX - r.left) / r.width; ptr.ty = (e.clientY - r.top) / r.height; ptr.ta = 1;
    };
    const onLeave = () => { ptr.ta = 0; };
    const onTouch = (e) => { const t0 = e.touches && e.touches[0]; if (t0) { onMove(t0); ptr.ta = 0.8; } };
    const onScroll = () => { scrollT = window.scrollY * 0.0022; };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    if (!reduced) {
      const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
      io.observe(host);
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
      host.addEventListener('touchmove', onTouch, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      raf = requestAnimationFrame(loop);
      return () => {
        alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
        host.removeEventListener('touchmove', onTouch);
        window.removeEventListener('scroll', onScroll);
      };
    }
    return () => { alive = false; ro.disconnect(); };
  }, [reduced]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
