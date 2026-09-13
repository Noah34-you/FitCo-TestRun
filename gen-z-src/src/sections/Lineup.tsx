const PRODUCTS = [
  {
    name: 'BIG DAWG CARGO',
    img: '/gen-z/img/cargo.webp',
    tags: 'OLIVE · BAGGY · MID RISE',
    price: 'TBD',
    fit: 'Relaxed',
  },
  {
    name: 'STACKED DENIM',
    img: '/gen-z/img/denim.webp',
    tags: 'LT. WASH · BAGGY · PUDDLE BREAK',
    price: 'TBD',
    fit: 'Relaxed',
  },
  {
    name: 'PLEATED WIDE TROUSER',
    img: '/gen-z/img/trouser.webp',
    tags: 'CHARCOAL · DOUBLE PLEAT · DRAPED',
    price: 'TBD',
    fit: 'Straight',
  },
  {
    name: 'DOUBLE-KNEE CARPENTER',
    img: '/gen-z/img/carpenter.webp',
    tags: 'TAN DUCK · STRAIGHT BAGGY · UTILITY',
    price: 'TBD',
    fit: 'Straight',
  },
]

export default function Lineup() {
  return (
    <section id="lineup" className="border-t border-line">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-20 sm:py-28">
        <div className="flex justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-smoke mb-10">
          <span>
            <span className="text-acid">03</span> — The lineup
          </span>
          <span className="hidden sm:block">Cut-matched only</span>
        </div>

        <h2 className="font-display uppercase leading-[0.9] text-[clamp(2.4rem,6vw,5.5rem)] mb-12">
          Only pants that <span className="text-outline-acid">pass.</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {PRODUCTS.map((p, i) => (
            <article
              key={p.name}
              className="group relative rounded-xl overflow-hidden border border-line bg-ink-soft hover:border-acid transition-colors duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full aspect-[4/5] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur font-mono text-[10px] tracking-[0.16em] text-acid px-2 py-1 rounded">
                  #0{i + 1}
                </span>
                <span className="absolute top-3 right-3 bg-acid text-ink font-mono text-[10px] font-bold tracking-[0.1em] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.fit} cut
                </span>
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display uppercase text-sm sm:text-lg tracking-tight text-paper">
                    {p.name}
                  </h3>
                  <span className="font-mono text-xs sm:text-sm text-acid">{p.price}</span>
                </div>
                <p className="mt-1.5 font-mono text-[9px] sm:text-[10px] tracking-[0.14em] text-smoke uppercase">
                  {p.tags}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl font-mono text-[10px] sm:text-[11px] tracking-[0.12em] leading-relaxed text-smoke uppercase">
          Concept lineup for this early Gen Z edition. Verified retailer links,
          current prices and product-level fit data will be added before launch.
        </p>
      </div>
    </section>
  )
}
