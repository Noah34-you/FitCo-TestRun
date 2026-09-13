const items = [
  'NO BAD FITS',
  'SIX QUESTIONS',
  'ZERO ACCOUNTS',
  'BUILT FOR YOUR BUILD',
  'RETAILER POLICIES APPLY',
  'CUT > SIZE TAG',
]

export default function Ticker({ fast = false }: { fast?: boolean }) {
  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className="flex items-center shrink-0">
          <span className="font-mono text-xs font-bold tracking-[0.14em] uppercase text-ink">
            {t}
          </span>
          <span className="mx-5 text-ink text-sm">✦</span>
        </span>
      ))}
    </>
  )

  return (
    <div className="bg-acid border-y border-ink/20 overflow-hidden py-2 select-none">
      <div className={`flex whitespace-nowrap ${fast ? 'animate-marquee-fast' : 'animate-marquee'}`}>
        <div className="flex shrink-0">{row}{row}</div>
        <div className="flex shrink-0" aria-hidden="true">{row}{row}</div>
      </div>
    </div>
  )
}
