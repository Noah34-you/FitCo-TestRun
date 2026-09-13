import { useEffect, useState } from 'react'

const links = [
  { label: 'THE PROBLEM', href: '#problem' },
  { label: 'THE FIT CHECK', href: '#fitcheck' },
  { label: 'THE LINEUP', href: '#lineup' },
]

export default function Header({ onRunCheck }: { onRunCheck: () => void }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 ${
        scrolled ? 'bg-ink/90 backdrop-blur-md border-line' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-baseline gap-2 group">
          <span className="font-display text-xl tracking-wide text-paper group-hover:text-acid transition-colors">
            FITCO<span className="text-acid">®</span>
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-smoke tracking-widest uppercase">
            Pants, solved
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] tracking-[0.18em] text-smoke hover:text-acid transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          onClick={onRunCheck}
          className="bg-acid text-ink font-mono text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-2 rounded-full hover:bg-paper transition-colors active:scale-95"
        >
          Run the check
        </button>
      </div>
    </header>
  )
}
