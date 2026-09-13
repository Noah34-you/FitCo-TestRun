export function LogoMark({ className = 'w-5 h-5' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <rect x="3.5" y="4" width="17" height="3.4" rx="1" />
    <rect x="3.5" y="9.4" width="12" height="3.4" rx="1" />
    <rect x="3.5" y="9.4" width="4.4" height="11.1" rx="1" />
  </svg>;
}
export function ArrowUpRight({ className = 'v1-arrow-icon' }) {
  return <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true" focusable="false">
    <path d="M5 15 15 5M7 5h8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
export function Wordmark({ onClick }) {
  return <button type="button" onClick={onClick} className="v1-wordmark" aria-label="FitCo home"><LogoMark />FitCo</button>;
}
export function Btn({ children, onClick, href, ghost = false, big = false, disabled = false, type = 'button', className = '' }) {
  const cls = ['v1-button', ghost && 'v1-button-ghost', big && 'v1-button-big', className].filter(Boolean).join(' ');
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}
export function SiteHeader({ onHome, onStart, onReport }) {
  return <header className="v1-header"><div className="v1-container v1-header-inner">
    <Wordmark onClick={onHome} />
    <nav aria-label="Main" className="v1-main-nav">
      <a href="/about/index.html">The method</a><a href="/shop/index.html">The catalog</a>
      {onReport && <button type="button" onClick={onReport}>Your results</button>}
    </nav>
    {onStart && <Btn onClick={onStart}>Find my fit</Btn>}
  </div></header>;
}
export function SiteFooter() {
  return <footer className="v1-footer v1-container">
    <a className="v1-footer-brand" href="/">FitCo</a>
    <nav aria-label="Footer"><a href="/about/index.html">The method</a><a href="/shop/index.html">The catalog</a><a href="/privacy/index.html">Privacy</a><a href="/terms/index.html">Terms</a></nav>
    <p>Independent recommendations.</p>
  </footer>;
}
export function LegalFooter({ note }) {
  return <footer className="v1-legal-footer">
    <nav aria-label="Legal"><a href="/privacy/index.html">Privacy</a><a href="/terms/index.html">Terms</a></nav>
    {note && <p>{note}</p>}
  </footer>;
}
