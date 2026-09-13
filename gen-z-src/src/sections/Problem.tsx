export default function Problem() {
  return (
    <section id="problem" className="border-t border-line">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-smoke mb-10">
          <span>
            <span className="text-acid">01</span> — The problem
          </span>
          <span className="hidden sm:block">Read this twice</span>
        </div>

        <h2 className="font-display uppercase leading-[0.95] text-[clamp(2rem,6vw,5.5rem)] max-w-6xl">
          A 34 waist means <span className="text-acid">nothing.</span> Same tag,
          five brands, five different fits.{' '}
          <span className="text-smoke">Your build is the data.</span>{' '}
          We read it.
        </h2>

        <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl">
          <p className="text-smoke text-sm sm:text-base leading-relaxed">
            Size charts were invented for a body that doesn't exist — some
            average dude from 1987. You squat, you skate, you have thighs.
            The tag doesn't know that. We do.
          </p>
          <p className="text-smoke text-sm sm:text-base leading-relaxed">
            Six questions about how you're built and how you like your legs to
            look. We match you to a starting cut, then show you pants worth
            considering in that shape. No size-chart roulette. No changing-room grief.
          </p>
        </div>
      </div>
    </section>
  )
}
