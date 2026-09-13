export default function Footer() {
  return (
    <footer className="border-t border-line overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-14 pb-8">
        <div className="flex flex-wrap justify-between gap-6 font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-smoke">
          <div className="flex gap-6">
            <a href="#problem" className="hover:text-acid transition-colors">The problem</a>
            <a href="#fitcheck" className="hover:text-acid transition-colors">Fit check</a>
            <a href="#lineup" className="hover:text-acid transition-colors">Lineup</a>
            <a href="/privacy/" className="hover:text-acid transition-colors">Privacy</a>
            <a href="/terms/" className="hover:text-acid transition-colors">Terms</a>
          </div>
          <span>Gen Z // FitCo</span>
        </div>

        <div
          className="mt-10 font-display uppercase text-outline-thin text-center leading-none select-none"
          style={{ fontSize: 'clamp(4rem, 18vw, 17rem)' }}
          aria-hidden="true"
        >
          FITCO®
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-4 font-mono text-[10px] tracking-[0.16em] uppercase text-smoke/70">
          <span>© 2026 FitCo — Pants, solved.</span>
          <span>Good pants. Your proportions. No guesswork.</span>
        </div>
      </div>
    </footer>
  )
}
