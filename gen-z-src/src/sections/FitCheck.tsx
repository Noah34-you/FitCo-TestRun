import { useState } from 'react'

const ROWS = [
  {
    q: 'YOUR BUILD',
    tags: 'HEIGHT · FRAME · THIGH SITUATION',
    a: 'Height, frame, and how much room you need through the upper leg. Thighs determine everything — the tag ignores them, we start with them.',
  },
  {
    q: 'WHERE PANTS BETRAY YOU',
    tags: 'WAIST GAP · THIGH SQUEEZE · DIAPER SEAT',
    a: 'The seat controls how pants sit through your hips and backside. Tell us where it usually goes wrong and we compensate in the cut.',
  },
  {
    q: 'RISE CHECK',
    tags: 'LOW · MID · HIGHWATER',
    a: 'Rise changes where the waistband sits and how the whole upper half feels. Half an inch here is the difference between "fine" and "lived-in".',
  },
  {
    q: 'LEG OPENING',
    tags: 'STACKED · STRAIGHT · MEGA WIDE',
    a: 'The opening sets the final silhouette around your shoe. Stacked on sneakers, clean over boots, or wide enough to swallow both.',
  },
  {
    q: 'THE BREAK',
    tags: 'PUDDLE · CROP · NO BREAK',
    a: 'Where the hem lands. The knee taper decides how the leg falls into it — puddle for drape, crop for socks, none for purists.',
  },
  {
    q: 'THE VIBE',
    tags: 'SKATE · GORPCORE · CLEAN FIT · WORKWEAR',
    a: 'The cut has to match the fit pic. Same measurements, different energy — this is how we pick which pants make the lineup for you.',
  },
]

export default function FitCheck() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="fitcheck" className="border-t border-line">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-smoke mb-10">
          <span>
            <span className="text-acid">02</span> — The fit check
          </span>
          <span className="hidden sm:block">~40 seconds</span>
        </div>

        <div className="border-t border-line">
          {ROWS.map((row, i) => {
            const isOpen = open === i
            return (
              <div key={row.q} className="border-b border-line">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full py-6 sm:py-8 flex items-center gap-4 sm:gap-8 text-left group"
                >
                  <span className="font-mono text-[11px] text-smoke tracking-widest w-10 shrink-0">
                    Q.0{i + 1}
                  </span>
                  <span
                    className={`font-display uppercase text-2xl sm:text-4xl lg:text-5xl tracking-tight transition-colors ${
                      isOpen ? 'text-acid' : 'text-paper group-hover:text-acid'
                    }`}
                  >
                    {row.q}
                  </span>
                  <span className="ml-auto hidden lg:block font-mono text-[10px] tracking-[0.18em] text-smoke">
                    {row.tags}
                  </span>
                  <span
                    className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'border-acid bg-acid text-ink rotate-45'
                        : 'border-line text-smoke group-hover:border-acid group-hover:text-acid'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-8 pl-14 sm:pl-[4.5rem] pr-4 max-w-2xl text-smoke text-sm sm:text-base leading-relaxed">
                      {row.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
