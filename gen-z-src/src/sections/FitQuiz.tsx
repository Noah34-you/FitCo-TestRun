import { useEffect, useState } from 'react'

type Option = { label: string; scores: number[] }
type Question = { title: string; sub: string; options: Option[] }

// score indexes: 0 cargo, 1 denim, 2 trouser, 3 carpenter
const QUESTIONS: Question[] = [
  {
    title: 'YOUR BUILD',
    sub: 'Be honest. The pants will know.',
    options: [
      { label: 'Tall & lanky', scores: [1, 2, 2, 1] },
      { label: 'Stocky / short kings', scores: [2, 1, 1, 2] },
      { label: 'Athletic thighs', scores: [2, 2, 1, 2] },
      { label: 'Slim all over', scores: [1, 2, 2, 0] },
    ],
  },
  {
    title: 'WHERE PANTS BETRAY YOU',
    sub: 'Everyone has a spot. Ours is data.',
    options: [
      { label: 'Waist gap', scores: [1, 1, 2, 1] },
      { label: 'Thigh squeeze', scores: [2, 2, 1, 2] },
      { label: 'Diaper seat', scores: [2, 1, 2, 1] },
      { label: 'All good tbh', scores: [1, 2, 2, 1] },
    ],
  },
  {
    title: 'RISE CHECK',
    sub: 'Where should the waistband live?',
    options: [
      { label: 'Low — Y2K mode', scores: [1, 2, 0, 1] },
      { label: 'Mid — the safe bet', scores: [2, 2, 1, 2] },
      { label: 'High — tucked tee energy', scores: [1, 0, 2, 2] },
    ],
  },
  {
    title: 'LEG OPENING',
    sub: 'What happens around the shoe?',
    options: [
      { label: 'Stacked on the sneaker', scores: [1, 2, 0, 1] },
      { label: 'Straight & clean', scores: [1, 1, 2, 2] },
      { label: 'Mega wide, swallow the shoe', scores: [2, 1, 2, 0] },
    ],
  },
  {
    title: 'THE BREAK',
    sub: 'Where the hem lands.',
    options: [
      { label: 'Puddle — max drape', scores: [2, 2, 1, 0] },
      { label: 'Crop — socks on display', scores: [0, 1, 2, 1] },
      { label: 'No break — purist', scores: [1, 1, 2, 2] },
    ],
  },
  {
    title: 'THE VIBE',
    sub: 'Final boss question.',
    options: [
      { label: 'Gorpcore / utility', scores: [2, 0, 0, 1] },
      { label: 'Skate', scores: [1, 2, 0, 2] },
      { label: 'Clean fit / minimal', scores: [0, 1, 2, 1] },
      { label: 'Workwear', scores: [1, 0, 0, 2] },
    ],
  },
]

const RESULTS = [
  {
    name: 'BIG DAWG CARGO',
    img: '/gen-z/img/cargo.webp',
    tags: 'OLIVE · BAGGY · MID RISE',
    why: 'Room through the thigh, utility pockets for the cargo cult, sits right at the waist. Your proportions said so.',
  },
  {
    name: 'STACKED DENIM',
    img: '/gen-z/img/denim.webp',
    tags: 'LT. WASH · BAGGY · PUDDLE BREAK',
    why: 'Long inseam built to stack on sneakers. Light wash keeps the fit loud without trying.',
  },
  {
    name: 'PLEATED WIDE TROUSER',
    img: '/gen-z/img/trouser.webp',
    tags: 'CHARCOAL · DOUBLE PLEAT · DRAPED',
    why: 'Double pleats give your thighs space and the drape does the rest. Clean fit, unlocked.',
  },
  {
    name: 'DOUBLE-KNEE CARPENTER',
    img: '/gen-z/img/carpenter.webp',
    tags: 'TAN DUCK · STRAIGHT BAGGY · UTILITY',
    why: 'Duck canvas that breaks in, not down. Reinforced knees for the way you actually move.',
  },
]

export default function FitQuiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0])
  const done = step >= QUESTIONS.length

  useEffect(() => {
    if (open) {
      setStep(0)
      setScores([0, 0, 0, 0])
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const pick = (opt: Option) => {
    setScores((s) => s.map((v, i) => v + opt.scores[i]))
    setStep((s) => s + 1)
  }

  const winner = scores.indexOf(Math.max(...scores))
  const result = RESULTS[winner]
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)]

  return (
    <div className="fixed inset-0 z-50 bg-ink flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-line shrink-0">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-smoke">
          {done ? (
            <span className="text-acid">Starting cut found</span>
          ) : (
            <>
              Q.0{step + 1} <span className="text-line">/ 06</span>
            </>
          )}
        </span>
        <button
          onClick={onClose}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-smoke hover:text-acid transition-colors"
        >
          Exit ✕
        </button>
      </div>

      {/* progress */}
      <div className="h-1 bg-ink-soft shrink-0">
        <div
          className="h-full bg-acid transition-all duration-500 ease-out"
          style={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {!done ? (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
            <h2 className="font-display uppercase leading-[0.9] text-[clamp(2.2rem,7vw,5rem)] text-paper">
              {q.title}
            </h2>
            <p className="mt-3 font-mono text-[11px] tracking-[0.16em] uppercase text-smoke">
              {q.sub}
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => pick(opt)}
                  className="group text-left border border-line rounded-xl px-5 py-5 sm:py-6 font-medium text-paper hover:border-acid hover:bg-acid hover:text-ink transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center justify-between gap-3">
                    {opt.label}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-acid animate-blink">
              ● Analysis complete
            </p>
            <h2 className="mt-4 font-display uppercase leading-[0.9] text-[clamp(2.2rem,6vw,4.5rem)]">
              Your cut: <span className="text-acid">{result.name}</span>
            </h2>

            <div className="mt-10 grid sm:grid-cols-2 gap-8 items-start">
              <div className="rounded-xl overflow-hidden border border-acid">
                <img src={result.img} alt={result.name} className="w-full aspect-[4/5] object-cover" />
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-smoke">
                  {result.tags}
                </p>
                <p className="mt-4 text-paper text-base sm:text-lg leading-relaxed">{result.why}</p>
                <p className="mt-4 text-smoke text-sm leading-relaxed">
                  Run it again with different answers and the match changes.
                  That's the point — the cut follows the build, not the tag.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      onClose()
                      requestAnimationFrame(() =>
                        document.getElementById('lineup')?.scrollIntoView({ behavior: 'smooth' }),
                      )
                    }}
                    className="bg-acid text-ink font-mono font-bold text-xs tracking-[0.14em] uppercase px-6 py-3.5 rounded-full hover:bg-paper transition-colors active:scale-95"
                  >
                    View the concept lineup
                  </button>
                  <button
                    onClick={() => {
                      setStep(0)
                      setScores([0, 0, 0, 0])
                    }}
                    className="border border-line text-paper font-mono text-xs tracking-[0.14em] uppercase px-6 py-3.5 rounded-full hover:border-acid hover:text-acid transition-colors"
                  >
                    Re-run check
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
