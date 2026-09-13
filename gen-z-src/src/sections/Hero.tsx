import { useState } from 'react'

const FITS = [
  {
    id: 'slim',
    label: 'Slim',
    readout: 'Tapered leg, stacked or cropped. Zero parachute energy.',
    spec: 'RISE: MID // OPENING: 6.5" // BREAK: CROP',
  },
  {
    id: 'straight',
    label: 'Straight',
    readout: 'The default done right. Room where you need it, clean line down.',
    spec: 'RISE: MID // OPENING: 7.5" // BREAK: SINGLE',
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    readout: 'Big dawg territory. Puddle break, max drape, no apologies.',
    spec: 'RISE: HIGH // OPENING: 9"+ // BREAK: PUDDLE',
  },
]

function RotatingBadge() {
  return (
    <div className="absolute -top-8 -left-8 sm:-top-10 sm:-left-10 w-24 h-24 sm:w-28 sm:h-28 z-20">
      <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
        <defs>
          <path id="circlePath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="49" className="fill-acid" />
        <text className="fill-ink font-mono" style={{ fontSize: 10.5, letterSpacing: 2.2 }}>
          <textPath href="#circlePath">FIT CHECK ✦ 40 SEC ✦ FREE ✦</textPath>
        </text>
        <text
          x="50"
          y="55"
          textAnchor="middle"
          className="fill-ink font-display"
          style={{ fontSize: 20 }}
        >
          GO
        </text>
      </svg>
    </div>
  )
}

export default function Hero({ onRunCheck }: { onRunCheck: () => void }) {
  const [fit, setFit] = useState(FITS[1])

  return (
    <section id="top" className="relative pt-14">
      {/* meta strip */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-6 flex justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-smoke">
        <span>
          FitCo<span className="text-acid">®</span> — Pants matched by build
        </span>
        <span className="hidden sm:block">Vol.02 // The Gen Z Cut</span>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 mt-6 sm:mt-10 grid lg:grid-cols-12 gap-8 lg:gap-6 items-end">
        {/* type block */}
        <div className="lg:col-span-8 relative z-10">
          <h1 className="font-display uppercase leading-[0.86] tracking-tight">
            <span className="block text-outline text-[clamp(3rem,9.5vw,9rem)]">
              Stop guessing.
            </span>
            <span className="block text-paper text-[clamp(3rem,9.5vw,9rem)]">
              Start stacking.
            </span>
            <span className="block text-acid text-[clamp(3rem,9.5vw,9rem)]">
              Pants that fit.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-smoke text-sm sm:text-base leading-relaxed">
            Six questions about how you're built and how you like your legs to
            look. We match you to a starting cut — then show you pants worth
            considering in that shape.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onRunCheck}
              className="group bg-acid text-ink font-mono font-bold text-xs sm:text-sm tracking-[0.14em] uppercase px-7 py-4 rounded-full hover:bg-paper transition-colors active:scale-95"
            >
              Find your fit{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="#fitcheck"
              className="border border-line text-paper font-mono text-xs sm:text-sm tracking-[0.14em] uppercase px-7 py-4 rounded-full hover:border-acid hover:text-acid transition-colors"
            >
              How it works
            </a>
          </div>

          <div className="mt-8 flex gap-6 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-smoke">
            <span>
              <span className="text-paper">06</span> questions
            </span>
            <span>
              <span className="text-paper">00</span> accounts
            </span>
            <span>
              <span className="text-paper">01</span> starting cut
            </span>
          </div>
        </div>

        {/* image block */}
        <div className="lg:col-span-4 relative">
          <RotatingBadge />
          <div className="relative rounded-xl overflow-hidden border border-line rotate-1 hover:rotate-0 transition-transform duration-500">
            <img
              src="/gen-z/img/hero.webp"
              alt="FitCo fit check — model in baggy black pants"
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-paper/90">
              <span className="bg-ink/70 backdrop-blur px-2 py-1 rounded">Fit check ↗ 40 sec</span>
              <span className="bg-ink/70 backdrop-blur px-2 py-1 rounded animate-blink text-acid">● Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* fit selector — the v1 pill bar, v2 treatment */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 mt-12 pb-14">
        <div className="rounded-2xl border border-line bg-ink-soft/60 backdrop-blur p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex rounded-full border border-line p-1 w-fit shrink-0">
              {FITS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFit(f)}
                  className={`px-5 sm:px-7 py-2.5 rounded-full font-mono text-xs tracking-[0.12em] uppercase transition-all active:scale-95 ${
                    fit.id === f.id
                      ? 'bg-paper text-ink font-bold'
                      : 'text-smoke hover:text-paper'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-paper font-medium">{fit.readout}</p>
              <p className="mt-1 font-mono text-[10px] sm:text-[11px] tracking-[0.16em] text-smoke">
                {fit.spec}
              </p>
            </div>
            <div className="md:ml-auto font-mono text-[10px] tracking-[0.18em] uppercase text-acid shrink-0">
              Tap to explore the fit ↖
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
