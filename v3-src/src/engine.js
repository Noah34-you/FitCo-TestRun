/* ============================================================
   FitCo V3 — the recommendation engine (the actual product).
   Faithful port of the production scoring: two layers
   (objective 80% / preference 20%), minimum-based multi-issue
   scoring, hard elimination guardrails. No fake percentages
   ever leave this module — the UI receives ranks and tiers.
   ============================================================ */

export const FIT_KEYS = ['slimTaper','straightFit','athleticTaper','athleticStraight','relaxedTaper','relaxedFit'];

export const FIT_LABEL = {
  slimTaper: 'Slim Taper', straightFit: 'Straight Fit',
  athleticTaper: 'Athletic Taper', athleticStraight: 'Athletic Straight',
  relaxedTaper: 'Relaxed Taper', relaxedFit: 'Relaxed Fit',
};

export const FIT_INFO = {
  slimTaper:        { rise: 'Mid rise',      desc: 'Narrower through the thigh with a clean taper to the ankle. Best for lean builds that want a sharp silhouette.' },
  straightFit:      { rise: 'Mid rise',      desc: 'Consistent width from hip to ankle. The most versatile cut across body types.' },
  athleticTaper:    { rise: 'Mid rise',      desc: 'Roomy in the thigh with a defined taper below the knee. Cut for muscular thighs and athletic builds.' },
  athleticStraight: { rise: 'Mid rise',      desc: 'Generous room through seat and thigh with a straighter leg. For broader builds.' },
  relaxedTaper:     { rise: 'Mid-high rise', desc: 'Comfortable room throughout with a slight taper at the ankle. The balance of comfort and shape.' },
  relaxedFit:       { rise: 'Mid-high rise', desc: 'Maximum room from hip to ankle. The most comfortable cut with a straighter, easier leg.' },
};

/* ---------------- scoring maps (ported verbatim) ---------------- */
const buildMap = {
  slim:      { slimTaper: 80, straightFit: 65, athleticTaper: 50, athleticStraight: 30, relaxedTaper: 20, relaxedFit: 10 },
  average:   { slimTaper: 55, straightFit: 75, athleticTaper: 65, athleticStraight: 50, relaxedTaper: 40, relaxedFit: 30 },
  athletic:  { slimTaper: 20, straightFit: 45, athleticTaper: 85, athleticStraight: 80, relaxedTaper: 50, relaxedFit: 35 },
  broader:   { slimTaper: 10, straightFit: 35, athleticTaper: 45, athleticStraight: 80, relaxedTaper: 85, relaxedFit: 90 },
};
const fitWrongMap = {
  tightThighsSeat: { slimTaper: 15, straightFit: 45, athleticTaper: 95, athleticStraight: 90, relaxedTaper: 70, relaxedFit: 55 },
  waistGap:        { slimTaper: 80, straightFit: 70, athleticTaper: 60, athleticStraight: 55, relaxedTaper: 45, relaxedFit: 35 },
  tooMuchFabric:   { slimTaper: 55, straightFit: 70, athleticTaper: 80, athleticStraight: 45, relaxedTaper: 55, relaxedFit: 20 },
  lengthOff:       { slimTaper: 55, straightFit: 60, athleticTaper: 60, athleticStraight: 60, relaxedTaper: 60, relaxedFit: 55 },
  usuallyFine:     { slimTaper: 65, straightFit: 70, athleticTaper: 60, athleticStraight: 55, relaxedTaper: 50, relaxedFit: 40 },
};
const heightMap = {
  under58:   { slimTaper: 75, straightFit: 60, athleticTaper: 55, athleticStraight: 50, relaxedTaper: 45, relaxedFit: 40 },
  '58to511': { slimTaper: 70, straightFit: 85, athleticTaper: 80, athleticStraight: 75, relaxedTaper: 70, relaxedFit: 60 },
  '60to62':  { slimTaper: 60, straightFit: 80, athleticTaper: 85, athleticStraight: 80, relaxedTaper: 75, relaxedFit: 65 },
  '63plus':  { slimTaper: 45, straightFit: 70, athleticTaper: 80, athleticStraight: 85, relaxedTaper: 80, relaxedFit: 75 },
};
const legMap = {
  tapered: { slimTaper: 90, straightFit: 35, athleticTaper: 85, athleticStraight: 30, relaxedTaper: 60, relaxedFit: 15 },
  balanced:{ slimTaper: 55, straightFit: 90, athleticTaper: 70, athleticStraight: 65, relaxedTaper: 50, relaxedFit: 35 },
  straight:{ slimTaper: 30, straightFit: 90, athleticTaper: 35, athleticStraight: 85, relaxedTaper: 55, relaxedFit: 80 },
  relaxed: { slimTaper: 15, straightFit: 45, athleticTaper: 30, athleticStraight: 60, relaxedTaper: 90, relaxedFit: 95 },
};
const priorityMap = {
  cleanerSilhouette: { slimTaper: 90, straightFit: 50, athleticTaper: 80, athleticStraight: 30, relaxedTaper: 50, relaxedFit: 10 },
  balancedEveryday:  { slimTaper: 45, straightFit: 90, athleticTaper: 60, athleticStraight: 70, relaxedTaper: 45, relaxedFit: 30 },
  maximumComfort:    { slimTaper: 10, straightFit: 40, athleticTaper: 35, athleticStraight: 65, relaxedTaper: 85, relaxedFit: 95 },
};

/* Works with PARTIAL answers — this powers the live convergence
   in the Fitting. Unanswered layers simply don't move the needle. */
export function computeScores(answers) {
  const obj = {}; const pref = {};
  FIT_KEYS.forEach(f => { obj[f] = 50; pref[f] = 50; });

  if (answers.build && buildMap[answers.build]) {
    FIT_KEYS.forEach(f => { obj[f] = buildMap[answers.build][f]; });
  }
  const issues = answers.fitWrong || [];
  if (issues.length) {
    FIT_KEYS.forEach(f => {
      let min = 100;
      issues.forEach(i => { const m = fitWrongMap[i]; if (m && m[f] < min) min = m[f]; });
      obj[f] = (obj[f] + min) / 2;
    });
  }
  if (answers.height && heightMap[answers.height]) {
    FIT_KEYS.forEach(f => { obj[f] = (obj[f] * 3 + heightMap[answers.height][f]) / 4; });
  }
  // hard elimination guardrails
  if ((answers.build === 'athletic' || answers.build === 'broader') && issues.includes('tightThighsSeat')) {
    obj.slimTaper = Math.min(obj.slimTaper, 15);
    obj.straightFit = Math.min(obj.straightFit, 45);
  }
  if (answers.build === 'slim' && issues.includes('tooMuchFabric')) {
    obj.relaxedFit = Math.min(obj.relaxedFit, 20);
    obj.relaxedTaper = Math.min(obj.relaxedTaper, 35);
  }
  if (answers.build === 'broader' && issues.includes('tightThighsSeat')) {
    obj.athleticStraight = Math.max(obj.athleticStraight, 82);
    obj.relaxedTaper = Math.max(obj.relaxedTaper, 78);
    obj.relaxedFit = Math.max(obj.relaxedFit, 75);
  }
  if (answers.build === 'athletic' && issues.includes('tightThighsSeat')) {
    obj.athleticTaper = Math.max(obj.athleticTaper, 88);
  }

  const leg = legMap[answers.legShape];
  const pri = priorityMap[answers.priority];
  if (leg || pri) {
    FIT_KEYS.forEach(f => {
      const l = leg ? leg[f] : 50, p = pri ? pri[f] : 50;
      pref[f] = Math.round(l * 0.7 + p * 0.3);
    });
  }
  const final = {};
  FIT_KEYS.forEach(f => { final[f] = Math.round(obj[f] * 0.8 + pref[f] * 0.2); });
  const ranked = [...FIT_KEYS].sort((a, b) => final[b] - final[a]);
  return { final, ranked, best: ranked[0], alt1: ranked[1], alt2: ranked[2] };
}

/* ---------------- diagnosis (the "understood" paragraph) ---------------- */
export function diagnose(answers, bestKey) {
  const name = FIT_LABEL[bestKey];
  const issues = answers.fitWrong || [];
  const main = issues[0] || 'usuallyFine';
  const b = answers.build || 'average';
  const p = answers.priority || 'balancedEveryday';
  if (main === 'tightThighsSeat') {
    if (b === 'slim') return `You told us pants usually feel too tight through the thighs and seat. Most slim-cut pants are made for narrower legs, so the waist fits but everything above the knee doesn't. That's why ${name} is likely your strongest match. It gives you more room through the thigh while keeping a clean, tapered shape below the knee.`;
    if (b === 'athletic') return `You told us pants usually feel too tight through the thighs and seat. Standard cuts aren't cut for muscular legs, which is why the waist fits but the thighs pinch. That's why ${name} is likely your strongest match. It's cut with extra room through the seat and thigh, then tapers cleanly below the knee.`;
    if (b === 'broader') return `You told us pants usually feel too tight through the thighs and seat. Most brands cut for average proportions, so broader builds end up with pants that bind in all the wrong places. That's why ${name} is likely your strongest match. It gives you generous room through the seat and thigh with a straighter leg that balances your frame.`;
    return `You told us pants usually feel too tight through the thighs and seat, so you end up sizing up and living with a loose waist. That's why ${name} is likely your strongest match. It's cut with extra room exactly where you need it.`;
  }
  if (main === 'waistGap') return `You told us pants usually gap at the waist — a waistband cut for wider hips, or a rise that won't stay put. That's why ${name} is likely your strongest match. It's cut with a more structured waist and proper rise so it stays put without digging in.`;
  if (main === 'tooMuchFabric') {
    if (b === 'slim') return `You told us pants usually have too much fabric below the knee — slim builds end up swimming in cuts drawn for average proportions. That's why ${name} is likely your strongest match. It's cut closer to the leg without being skinny.`;
    return `You told us pants usually have too much fabric below the knee. That's why ${name} is likely your strongest match. It keeps the leg line cleaner without going too slim.`;
  }
  if (main === 'lengthOff') return `You told us the length usually feels off. Inseam varies wildly by brand, which is why the same size can look cropped in one pair and drag in another. ${name} works with most standard inseams, and we'll point you toward brands with reliable length options.`;
  if (p === 'cleanerSilhouette') return `You told us pants usually fit fine, and you want a cleaner silhouette. That's why ${name} is likely your strongest match — a sharp, tailored line that's still comfortable all day.`;
  if (p === 'maximumComfort') return `You told us pants usually fit fine, and comfort matters most. That's why ${name} is likely your strongest match — easy through the leg with a shape that still looks intentional.`;
  return `Based on what you told us, ${name} is likely your strongest match. It's cut for your proportions and should handle your fit needs better than a standard cut.`;
}

/* ---------------- catalog (the real 15) ---------------- */
export const CATALOG = [
  { id:'bonobos_swc_slim', brand:'Bonobos', name:'Stretch Washed Chino', variant:'Slim', price:99, category:'chinos', primaryFit:'slimTaper', secondaryFits:['straightFit'], img:'/images/products/bonobos_stretch_washed_chino.jpg', link:'https://bonobos.com/products/stretch-washed-chino-1', benefit:"Bonobos' bestselling chino. Stretch cotton that moves with you." },
  { id:'levis_512', brand:"Levi's", name:'512 Slim Taper Jeans', variant:'', price:70, category:'jeans', primaryFit:'slimTaper', secondaryFits:[], img:'/images/products/levis_512.jpg', link:'https://www.levi.com/US/en_US/clothing/men/jeans/taper/512TM-slim-taper-fit-mens-jeans/p/288331193', benefit:"Levi's modern slim taper. Affordable, durable, goes with everything." },
  { id:'lulu_abc_slim', brand:'Lululemon', name:'ABC Slim-Fit 5 Pocket', variant:'Warpstreme', price:148, category:'technical', primaryFit:'slimTaper', secondaryFits:['straightFit'], img:'/images/products/lulu_abc_slim.jpg', link:'https://shop.lululemon.com/p/mens-trousers/Abc-Slim-5-Pocket-32/_/prod9390007', benefit:"Lululemon's Warpstreme fabric. Wrinkle-resistant and travel-ready." },
  { id:'bonobos_swc_straight', brand:'Bonobos', name:'Stretch Washed Chino', variant:'Straight', price:99, category:'chinos', primaryFit:'straightFit', secondaryFits:[], img:'/images/products/bonobos_stretch_washed_chino.jpg', link:'https://bonobos.com/products/stretch-washed-chino-1', benefit:'The classic straight-leg chino. Works with sneakers or boots.' },
  { id:'jcrew_770', brand:'J.Crew', name:'770 Straight-Fit Stretch Chino', variant:'', price:90, category:'chinos', primaryFit:'straightFit', secondaryFits:[], img:'/images/products/jcrew_770.jpg', link:'https://www.jcrew.com/p/mens/categories/clothing/pants-and-chinos/chino/770trade-straight-fit-stretch-chino-pant/AR886', benefit:"J.Crew's most popular chino. Straight fit that flatters most builds." },
  { id:'levis_505', brand:"Levi's", name:'505 Regular Straight Jeans', variant:'', price:70, category:'jeans', primaryFit:'straightFit', secondaryFits:[], img:'/images/products/levis_505.jpg', link:'https://www.levi.com/US/en_US/jeans-by-fit-number/men/jeans/505TM/505TM-regular-fit-stretch-mens-jeans/p/005051649', benefit:"Levi's original straight jean. Timeless, reliable, under $70." },
  { id:'bonobos_swc_athletic', brand:'Bonobos', name:'Stretch Washed Chino', variant:'Athletic', price:99, category:'chinos', primaryFit:'athleticTaper', secondaryFits:['athleticStraight'], img:'/images/products/bonobos_stretch_washed_chino.jpg', link:'https://bonobos.com/products/stretch-washed-chino-1', benefit:'Extra room in the thigh with a clean taper below the knee.' },
  { id:'levis_541', brand:"Levi's", name:'541 Athletic Taper Jeans', variant:'', price:70, category:'jeans', primaryFit:'athleticTaper', secondaryFits:['athleticStraight'], img:'/images/products/levis_541.jpg', link:'https://www.levi.com/US/en_US/clothing/men/jeans/541TM-athletic-taper-mens-jeans/p/181810629', benefit:'Cut for muscular legs. More seat and thigh room than standard taper jeans.' },
  { id:'lulu_abc_classic', brand:'Lululemon', name:'ABC Classic-Fit 5 Pocket', variant:'Warpstreme', price:128, category:'technical', primaryFit:'athleticTaper', secondaryFits:['straightFit'], img:'/images/products/lulu_abc_classic.jpg', link:'https://shop.lululemon.com/p/men-pants/ABC-Pant-Classic-32/_/prod9000003', benefit:"Lululemon's classic fit with technical fabric. Office-ready comfort." },
  { id:'vuori_meta_relaxed', brand:'Vuori', name:'Meta Pant', variant:'Relaxed', price:118, category:'technical', primaryFit:'athleticStraight', secondaryFits:['relaxedFit'], img:'/images/products/vuori_meta_relaxed.webp', link:'https://vuoriclothing.com/products/meta-pant-relaxed-fit-32-charcoal', benefit:"Vuori's performance fabric in a relaxed cut. Feels like a sweatpant, looks polished." },
  { id:'bonobos_ww_athletic', brand:'Bonobos', name:'Stretch Weekday Warrior', variant:'Athletic', price:129, category:'chinos', primaryFit:'athleticStraight', secondaryFits:['athleticTaper'], img:'/images/products/bonobos_ww_athletic.jpg', link:'https://bonobos.com/products/stretch-weekday-warrior-dress-pants', benefit:'Dress pant styling with athletic-fit room. Wrinkle-resistant for daily wear.' },
  { id:'levis_550', brand:"Levi's", name:'550 Relaxed Fit Tapered', variant:'', price:60, category:'jeans', primaryFit:'relaxedTaper', secondaryFits:['relaxedFit'], img:'/images/products/levis_550.jpg', link:'https://www.levi.com/US/en_US/clothing/men/jeans/550TM/550TM-relaxed-fit-tapered-mens-jeans/p/550501845', benefit:'Relaxed through the thigh with a modern tapered leg. Easy, comfortable fit.' },
  { id:'duer_nosweat_relaxed_taper', brand:'DUER', name:'No Sweat Pant', variant:'Relaxed Taper', price:129, category:'technical', primaryFit:'relaxedTaper', secondaryFits:['relaxedFit'], img:'/images/products/duer_nosweat_relaxed_taper.webp', link:'https://shopduer.com/products/mens-dress-sweatpant-relaxed', benefit:"DUER's signature stretch fabric. Dress pant look with full mobility." },
  { id:'jcrew_giant', brand:'J.Crew', name:'Giant-Fit Chino Pant', variant:'', price:118, category:'chinos', primaryFit:'relaxedFit', secondaryFits:['relaxedTaper'], img:'/images/products/jcrew_giant.jpg', link:'https://www.jcrew.com/p/mens/categories/clothing/pants-and-chinos/chino/giant-fit-chino-pant/BI521', benefit:"J.Crew's roomiest chino. Maximum comfort without looking sloppy." },
  { id:'levis_555', brand:"Levi's", name:'555 Relaxed Straight Jeans', variant:'', price:80, category:'jeans', primaryFit:'relaxedFit', secondaryFits:[], img:'/images/products/levis_555.jpg', link:'https://www.levi.com/US/en_US/clothing/men/jeans/relaxed/555TM-relaxed-straight-mens-jeans/p/000LO0001', benefit:"Levi's relaxed straight fit. Most room in the leg with a classic silhouette." },
  /* Stage-1 additions (July 2026 research pass). img:null = no official
     image was publicly retrievable; the report renders its drafting
     placeholder instead. */
  { id:'jcrew_484', brand:'J.Crew', name:'484 Slim-Fit Stretch Chino', variant:'', price:70, category:'chinos', primaryFit:'slimTaper', secondaryFits:[], img:null, link:'https://www.jcrew.com/p/mens/categories/clothing/pants-and-chinos/chino/484-slim-fit-stretch-chino-pant/AR885', benefit:'A slim chino that publishes its real numbers. Rare at this price.' },
  { id:'jcrew_1040', brand:'J.Crew', name:'1040 Athletic Tapered-Fit Stretch Chino', variant:'', price:85, category:'chinos', primaryFit:'athleticTaper', secondaryFits:[], img:null, link:'https://www.jcrew.com/p/mens/categories/clothing/pants-and-chinos/athletic/1040-athletic-tapered-fit-stretch-chino-pant/AV209', benefit:'Room in the seat and thigh, taper from the knee. J.Crew publishes the measurements.' },
  { id:'toddsnyder_slim_5pocket', brand:'Todd Snyder', name:'Slim Fit 5-Pocket Chino', variant:'Garment-Dyed', price:148, category:'chinos', primaryFit:'slimTaper', secondaryFits:[], img:null, link:'https://www.toddsnyder.com/products/garment-dyed-5-pocket-twill-black', benefit:'Heavy garment-dyed twill that holds its shape for years. True to size.' },
  { id:'flint_tinder_365_tapered', brand:'Flint and Tinder', name:'365 Pant', variant:'Athletic Tapered', price:108, category:'chinos', primaryFit:'athleticTaper', secondaryFits:[], img:null, link:'https://huckberry.com/store/flint-and-tinder/category/p/62339-365-pant-tapered', benefit:'Soft garment-dyed twill with published garment measurements. Jean look, chino feel.' },
  { id:'proof_rover_athletic_tapered', brand:'Proof', name:'Rover EDC Pant', variant:'Athletic Tapered', price:98, category:'technical', primaryFit:'athleticTaper', secondaryFits:[], img:null, link:'https://huckberry.com/store/proof/category/p/89516-rover-edc-pant-athletic-tapered', benefit:'Rugged everyday pant. Roomy thigh, narrow hem, breaks in like denim.' },
  { id:'state_liberty_athletic_dress', brand:'State and Liberty', name:'Athletic Fit Stretch Suit Pants', variant:'Black', price:150, category:'technical', primaryFit:'athleticTaper', secondaryFits:[], img:'/images/products/state_liberty_athletic_dress.jpg', link:'https://stateandliberty.com/products/athletic-fit-stretch-suit-pants-black', benefit:'Dress pants cut for muscular legs. Runs small, so size up.' },
  { id:'carhartt_rigby_relaxed', brand:'Carhartt', name:'Rigby Relaxed Straight Pants', variant:'Canvas', price:60, category:'technical', primaryFit:'relaxedFit', secondaryFits:[], img:null, link:'https://www.carhartt.com/product/102291/relaxed-straight-rigby-dungaree', benefit:'Workwear-grade canvas. Roomy, tough, and under sixty dollars.' },
];

/* Tiered, explained product ranking. Tiers — never percentages. */
export function rankProducts(answers, bestKey) {
  const cat = answers.productType && answers.productType !== 'any' ? answers.productType : null;
  const scored = [];
  CATALOG.forEach(p => {
    const primary = p.primaryFit === bestKey;
    const secondary = p.secondaryFits.includes(bestKey);
    if (!primary && !secondary) return;
    const inCat = !cat || p.category === cat;
    const reasons = [];
    reasons.push(primary
      ? `Cut specifically as ${FIT_LABEL[bestKey]} — your recommended fit.`
      : `Not a dedicated ${FIT_LABEL[bestKey]}, but its geometry overlaps it.`);
    reasons.push(p.benefit);
    const flags = [];
    if (!inCat) flags.push(`Outside your ${cat} pick — the geometry is right, the category isn't.`);
    flags.push("Spec-based data — we haven't hand-verified this one yet.");
    scored.push({
      ...p, reasons, flags,
      order: (primary ? 0 : 2) + (inCat ? 0 : 1),
      tier: primary ? (inCat ? 'Best match' : 'Fit match, other category') : 'Also fits',
    });
  });
  scored.sort((a, b) => a.order - b.order || a.price - b.price);
  const inCategory = scored.filter(r => r.order % 2 === 0);
  const notice = cat && inCategory.length === 0
    ? `We haven't verified a great ${FIT_LABEL[bestKey]} ${cat} yet — these match your fit geometry in other categories.`
    : null;
  return { results: scored.slice(0, 4), notice };
}

/* ---------------- the six questions ---------------- */
export const QUESTIONS = [
  { key:'productType', cat:'Problem', label:'What are you shopping for?', sub:'Jeans and chinos fit differently, so we start here.',
    options:[
      { v:'jeans', t:'Jeans', s:'Five-pocket denim' },
      { v:'chinos', t:'Chinos', s:'Cotton twill, smart-casual' },
      { v:'technical', t:'Technical pants', s:'Stretch, performance fabrics' },
      { v:'any', t:'Surprise me', s:'Best fit across categories' },
    ] },
  { key:'build', cat:'Body', label:'Which best describes your build?', sub:'This matters more than your waist size.',
    options:[
      { v:'slim', t:'Slim', s:'Leaner through legs and seat' },
      { v:'average', t:'Average', s:'In-between proportions' },
      { v:'athletic', t:'Athletic', s:'Developed thighs and seat' },
      { v:'broader', t:'Broader', s:'Fuller through waist and seat' },
    ] },
  { key:'fitWrong', cat:'Problem', label:'Where do pants usually fit wrong?', sub:'Pick up to two.', multi:2,
    options:[
      { v:'tightThighsSeat', t:'Tight in thighs or seat', s:'Pulling or pinching above the knee' },
      { v:'waistGap', t:'Waist gaps', s:'Band gaps when the seat fits' },
      { v:'tooMuchFabric', t:'Too much fabric below the knee', s:'Baggy or bunching at the hem' },
      { v:'lengthOff', t:'Length feels off', s:'Hems stack up or float high' },
      { v:'usuallyFine', t:'Usually fit fine', s:'No consistent problem' },
    ] },
  { key:'height', cat:'Body', label:'How tall are you?', sub:'Height decides inseam and where the break lands.',
    options:[
      { v:'under58', t:'Under 5′8″', s:'Shorter inseams work best' },
      { v:'58to511', t:'5′8″ – 5′11″', s:'The range most brands cut for' },
      { v:'60to62', t:'6′0″ – 6′2″', s:'Longer inseams needed' },
      { v:'63plus', t:'6′3″ +', s:'Length is the priority' },
    ] },
  { key:'legShape', cat:'Fit', label:'Which leg shape looks best to you?', sub:'No wrong answer here.',
    options:[
      { v:'tapered', t:'Tapered', s:'Narrows from knee to ankle' },
      { v:'balanced', t:'Balanced', s:'Gentle taper, middle ground' },
      { v:'straight', t:'Straight', s:'Same width top to bottom' },
      { v:'relaxed', t:'Relaxed', s:'Extra room all the way down' },
    ] },
  { key:'priority', cat:'Style', label:'What matters most?', sub:'When two fits tie, this decides it.',
    options:[
      { v:'cleanerSilhouette', t:'Cleaner silhouette', s:'Sharp, tailored line' },
      { v:'balancedEveryday', t:'Balanced everyday', s:'Works across situations' },
      { v:'maximumComfort', t:'Maximum comfort', s:'Room to move, all day' },
    ] },
];
