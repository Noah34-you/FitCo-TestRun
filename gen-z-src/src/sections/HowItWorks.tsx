const STEPS = [
  {
    n: '01',
    title: 'Start with your proportions.',
    body: "Your build and your usual fit problems tell us where you need room. Your preferred leg shape narrows the choice. That's the whole quiz — no email, no account, no 40-field profile.",
  },
  {
    n: '02',
    title: 'Then get pants worth a look.',
    body: 'We compare your shape against the cuts in our catalog. You get a starting fit, the reason behind it, and links to explore at the retailer. Check each retailer’s current price and return policy before buying.',
  },
]

export default function HowItWorks() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-smoke mb-8">
            <span className="text-acid">02.5</span> — The method
          </div>
          <h2 className="font-display uppercase leading-[0.9] text-[clamp(2.4rem,5.5vw,5rem)]">
            Six questions.
            <br />
            <span className="text-smoke">Zero</span>{' '}
            <span className="text-outline">accounts.</span>
          </h2>
        </div>

        <div className="flex flex-col justify-end gap-10">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-line pt-6 flex gap-6">
              <span className="font-display text-3xl sm:text-4xl text-outline-thin shrink-0">
                {s.n}
              </span>
              <div>
                <h3 className="font-display uppercase text-xl sm:text-2xl tracking-tight text-paper">
                  {s.title}
                </h3>
                <p className="mt-3 text-smoke text-sm sm:text-base leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
