/* FitCo V3 — design-system atoms */
import { motion } from 'framer-motion';

export function LogoMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="3.4" rx="1" />
      <rect x="3.5" y="9.4" width="12" height="3.4" rx="1" />
      <rect x="3.5" y="9.4" width="4.4" height="11.1" rx="1" />
    </svg>
  );
}

export function Wordmark({ onClick, dark = false }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2.5 font-disp font-semibold text-[19px] tracking-tight cursor-pointer ${dark ? 'text-paper' : 'text-ink'}`} aria-label="FitCo home">
      <span className="text-sage"><LogoMark /></span>FitCo
    </button>
  );
}

export function Btn({ children, onClick, href, ghost = false, big = false, className = '' }) {
  const cls = `inline-flex items-center gap-2.5 rounded-full font-medium transition-all duration-200 cursor-pointer group
    ${big ? 'px-8 py-4 text-base' : 'px-5.5 py-3 text-sm'}
    ${ghost
      ? 'text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)] bg-transparent'
      : 'bg-ink text-paper hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(22,21,15,.18)]'}
    ${className}`;
  const arrow = <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>;
  if (href) return <a href={href} className={cls}>{children}{!ghost && arrow}</a>;
  return <button onClick={onClick} className={cls}>{children}{!ghost && arrow}</button>;
}

export function Kicker({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-3 font-mono text-[11px] font-medium tracking-[.22em] uppercase text-sage ${className}`}>
      <span className="w-6.5 h-[1.5px] bg-sage inline-block" aria-hidden="true" />{children}
    </span>
  );
}

export function Mono({ children, className = '' }) {
  return <span className={`font-mono text-[11px] tracking-[.12em] uppercase text-muted ${className}`}>{children}</span>;
}

/* Gold scanline that sweeps a container. Decorative. */
export function Scanline({ duration = 7, className = '' }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 bottom-0 w-px ${className}`}
      style={{ background: 'linear-gradient(180deg, transparent, var(--color-chalkline) 18%, var(--color-chalkline) 82%, transparent)', boxShadow: '0 0 14px rgba(195,154,69,.55)' }}
      initial={{ left: '4%', opacity: 0 }}
      animate={{ left: ['4%', '96%'], opacity: [0, .8, .8, 0] }}
      transition={{ duration, times: [0, .08, .92, 1], repeat: Infinity, ease: 'linear', repeatDelay: 2.2 }}
    />
  );
}

export const rise = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: .7, delay: i * 0.09, ease: [0.22, 0.7, 0.3, 1] } }),
};
