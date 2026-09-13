export default function CtaBanner({ onRunCheck }: { onRunCheck: () => void }) {
  return (
    <section className="bg-acid text-ink">
      <button
        onClick={onRunCheck}
        className="w-full mx-auto max-w-[1440px] px-4 sm:px-6 py-16 sm:py-24 text-left group"
      >
        <div className="flex justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase mb-8">
          <span>— Your move</span>
          <span className="hidden sm:block">No signup · No spam</span>
        </div>
        <span className="font-display uppercase leading-[0.85] tracking-tight text-[clamp(3rem,10vw,10rem)] flex flex-wrap items-center gap-x-6">
          Run the fit check
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-4">
            →
          </span>
        </span>
        <span className="mt-8 block font-mono text-[11px] sm:text-xs tracking-[0.16em] uppercase">
          Six questions · Forty seconds · One starting cut
        </span>
      </button>
    </section>
  )
}
