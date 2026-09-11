# FitCo — Pre-Launch Compliance Audit

**Audit date:** 11 September 2026
**Scope:** the FitCo website and codebase at branch `claude/fitco-compliance-audit-4thapk`
**Method:** full source review, plus live testing in Chromium (axe-core 4.x against WCAG 2.0/2.1/2.2 A and AA, manual keyboard and screen-reader journeys, network and storage inspection, `npm audit`)

> **This audit does not establish that FitCo is legally compliant, and passing it does not
> make the site immune from complaints, regulatory attention, or litigation.** It identifies
> foreseeable risks, corrects technical problems that could safely be corrected, and marks
> the matters that require a business decision or a qualified lawyer. Several items below
> cannot be closed by code at all. Nothing here is legal advice.

---

## 1. The single most important finding

**FitCo is not an ecommerce site.** It is a static, backend-less recommendation site that
links out to third-party retailers. There is no cart, no checkout, no payment processing, no
accounts, no login, no server, no database, and no API. `terms/index.html` states this and the
code confirms it — there is not one `fetch()` call in the entire repository outside the
waitlist added during this audit.

This is not a technicality. It removes whole categories of risk that a pants retailer would
carry, and it means the correct output for those categories is **"not applicable"**, not a
generated policy:

| Category | Status | Why |
|---|---|---|
| Refund / Return Policy | **N/A** | FitCo never takes an order. Returns are the retailer's. |
| Shipping / Delivery Policy | **N/A** | FitCo ships nothing. |
| Payment data handling / PCI | **N/A** | No payment is ever processed or touched. |
| Authentication, passwords, sessions | **N/A** | No accounts exist. |
| API authorization, CSRF, SQL injection | **N/A** | No server, no database, no API. |
| File uploads | **N/A** | None exist. |
| Product reviews, UGC, search | **N/A** | None exist. |

Writing a returns policy for FitCo would be inventing a business practice. It is deliberately
not done here.

---

## 2. VERIFIED FACTS

Established by reading the code and confirmed in a live browser.

### 2.1 Architecture
- The live homepage is a React SPA (`index.html` → `assets/`, built from `v3-src/`), hash-routed
  through four views: `home → fitting → calibrating → report`.
- Static pages: `/about/`, `/shop/`, `/terms/`, `/privacy/`.
- `/quiz/` and `/v2/` are superseded prototypes, reachable only by direct URL.
- The committed bundle reproduces byte-identically from source, so what is deployed matches
  what was reviewed.

### 2.2 Data actually collected
The fitting asks **six questions**: product type, build (4 options), where pants fit wrong
(up to 2), height (**4 coarse bands, never an exact figure**), leg shape, and priority.

**FitCo does not collect** names, email addresses (outside the waitlist), phone numbers,
postal addresses, payment details, purchase history, date of birth, weight, waist size, or
inseam. There is nowhere on the site to enter any of them.

Data minimisation here is genuinely good. The problem was never over-collection — it was that
the Privacy Policy *claimed* collection that does not happen.

| Data | Where it goes | Leaves the device? |
|---|---|---|
| Six fitting answers | `localStorage.fitco_v3_answers` | No (unless analytics is enabled and consented) |
| Fit result, completion flag | `localStorage` | No |
| Consent choice | `localStorage.fitco_consent` | No |
| Email address (waitlist) | Hosted email provider | Only once an endpoint is configured |

### 2.3 Third-party surface — before and after

| | Before | After |
|---|---|---|
| Third-party hosts contacted | `fonts.googleapis.com`, `fonts.gstatic.com` | **none** |
| Cookies set | none (analytics dormant) | **none** |
| Analytics | PostHog, installed, dormant, **ungated** | PostHog, dormant, **consent-gated** |

Confirmed absent throughout: Google Analytics, Google Tag Manager, Meta Pixel, TikTok Pixel,
Hotjar, Clarity, Segment, Mixpanel, Amplitude, FullStory, LogRocket, session replay, advertising
networks, chat widgets, iframes, social embeds, video embeds, WebSockets, and CDNs.

### 2.4 Consumer-protection practices that were already sound
No star ratings, no review counts, no fabricated testimonials, no customer counts, no scarcity
cues, no countdown timers, no strikethrough or compare-at pricing, no "% off", no fit guarantee.
The product deliberately refuses invented precision (`"You'll never see a 96% match here"`) and
attaches a spec-based caveat to every recommendation. Outbound retailer links carry no affiliate
tags, no UTM parameters, and no click IDs.

### 2.5 Security posture
No secrets in the working tree or anywhere in git history. `.env` correctly ignored. The
PostHog project key is publishable by design and is currently empty. With no server, no
database and no auth, the classic web-application attack surface is essentially absent.

---

## 3. TECHNICAL FINDINGS

Severity: **CRITICAL** (fix before launch) · **HIGH** (meaningful exposure) · **MEDIUM** ·
**LOW**. "Fixed" means implemented and verified in this branch.

### CRITICAL

**C1 — Raw legal placeholders were public.**
*Where:* `terms/index.html` (`[DATE]`, `[STATE / COUNTRY]`, `[JURISDICTION]`), `privacy/index.html` (`[DATE]`).
*Why it matters:* unfinished template text on a live legal page undermines the enforceability
and credibility of the whole document and signals the policies were never reviewed.
*Correction:* effective date set to 11 September 2026; governing law set to the State of
California, United States. **No legal entity and no dispute venue were invented** (see L1, L2).
*Status:* **Fixed.** `grep` for the placeholder tokens returns zero hits.

**C2 — The waitlist told users a falsehood.**
*Where:* `shop/index.html` — success copy "You're on the list. We'll be in touch." against a
handler that wrote the address to `localStorage` and nothing else. No `action`, no backend, no
email provider.
*Why it matters:* this is a plainly false statement made to a consumer to obtain their email
address. It is the clearest deception-risk item found, independent of any specific statute.
*Correction:* real POST to a hosted provider endpoint read from `fitco-forms-config.js`. While
no endpoint is configured the form is disabled and states the waitlist is not open. It can no
longer claim success without having sent anything. The local list of other people's addresses
is deleted.
*Status:* **Fixed**, pending the owner supplying an endpoint (**O2**).

**C3 — Privacy Policy described a different product.**
*Where:* `privacy/index.html` — named Google Analytics and Vercel Analytics (neither present),
omitted PostHog (the only analytics wired in), listed Weight / Waist size / Inseam as collected
(never asked), and described affiliate links and affiliate-network cookies (none exist).
*Why it matters:* a privacy policy is a representation to consumers and to regulators. Every
one of these statements was inaccurate in a verifiable way.
*Correction:* rewritten to describe actual behaviour, including the four named `localStorage`
keys, the absence of cookies, and the absence of affiliate relationships.
*Status:* **Fixed.**

**C4 — Consent was promised but never implemented.**
*Where:* `privacy/index.html` promised consent before non-essential cookies; no consent
mechanism existed anywhere in the repo.
*Why it matters:* analytics was armed and unconfigured. Pasting a PostHog key — a one-line
change — would have started a 365-day identifier cookie and begun transmitting body-build
answers with no prompt, instantly making several policy statements false.
*Correction:* `fitco-consent.js` gates all analytics; Global Privacy Control and Do Not Track
are honoured as a standing opt-out; the static-page loader now sets `capture_pageview:false` to
match the app.
*Status:* **Fixed**, verified in four states (unconfigured / undecided / GPC / allowed).

**C5 — Text contrast failed WCAG 2.2 AA across the core palette.**
*Where:* `v3-src/src/index.css`, `fitco-ui.css`, per-page tokens.
*Evidence (computed, then confirmed by axe):*

| Token | Hex | On paper #f3f0e8 | AA 4.5:1 |
|---|---|---|---|
| `--color-muted` | #7b766a | **3.96:1** | FAIL |
| `--color-chalk` | #a87f2c | **3.21:1** | FAIL |
| `text-muted/70` | ≈#9f9b90 | **2.44:1** | FAIL |
| `--fc-muted` | #6e6e6e | **4.24:1** | FAIL |

`muted` is the default secondary body text at 11–13px, so this affected most of the site.
*Correction:* tokens darkened to ≥4.6:1 with hue preserved. `--color-chalkline` deliberately
left unchanged — it appears only on dark sections where it already passes at 6.99:1.
*Status:* **Fixed.**

### HIGH

**H1 — Keyboard focus was destroyed on every question.**
`v3-src/src/screens/Fitting.jsx` — `AnimatePresence` unmounted the activated option, dropping
focus to `<body>` six times per fitting. WCAG 2.4.3 Focus Order, 4.1.3 Status Messages.
*Correction:* focus is taken at mount via the heading's ref callback (a timer races the
`mode="wait"` exit transition). A `role="status"` live region now mirrors the converging result,
which was previously `aria-hidden` and invisible to screen readers.
*Status:* **Fixed** — full keyboard journey verified with no focus loss.

**H2 — The email input had no label.**
`shop/index.html` — accessible name came from `placeholder` alone, which disappears as soon as
the user types. WCAG 1.3.1, 3.3.2, 4.1.2.
**Note:** axe did *not* flag this, because `placeholder` satisfies its accessible-name check.
This is a concrete example of why an automated score is not proof of accessibility.
*Status:* **Fixed** — real `<label>`, `autocomplete`, and announced error/status regions.

**H3 — A hidden success message was announced to screen readers.**
`shop/index.html` — the confirmation was hidden with `opacity:0`, which leaves it in the
accessibility tree. It would have been read out on page load, telling a screen-reader user they
had joined a list they had not.
*Status:* **Fixed** (`visibility:hidden` until shown). *Found only through manual testing.*

**H4 — Affiliate disclosure was inverted.**
Terms §7 and Privacy §5 asserted affiliate links exist; the code has none; the report screen
told users "rankings never touch affiliate status". The `/v2/` page claimed affiliate status
lived "in a separate field from every scoring input" — a field present in no shipped data
structure.
*Correction:* all three now state the truth: no affiliate relationships, no commission. If that
changes, FTC 16 CFR Part 255 requires clear and conspicuous disclosure **next to the links**,
not buried in a policy page — noted in both documents.
*Status:* **Fixed.**

**H5 — Catalog claims were numerically false.**
"15 pants", "15-pant vetted catalog", "6 brands we trust", "15 pants measured" against an
actual catalog of **22 products from 11 brands**.
*Status:* **Fixed** everywhere.

**H6 — "Measured" and "vouch for" contradicted the product's own data.**
`engine.js` attaches *"Spec-based data — we haven't hand-verified this one yet"* to **every**
product, while `/about/` and `/v2/` claimed the pants were measured and vouched for. The code
was the honest one.
*Status:* **Fixed** — copy now matches the engine.

**H7 — Dependency vulnerabilities.**
6 advisories (2 high, 4 moderate). `dompurify` and `fflate` reach the browser via posthog-js;
`nanoid`, `postcss`, `browserslist`, `baseline-browser-mapping` are build-time only.
*Status:* **Fixed** — non-breaking upgrades; `npm audit` now reports 0.

**H8 — Google Fonts disclosed every visitor's IP to a third party.**
Unconditional, with `preconnect`, before any interaction, with no way to decline.
*Status:* **Fixed** — self-hosted. **Zero third-party requests now occur on any page.**

### MEDIUM

| # | Finding | Status |
|---|---|---|
| M1 | Fake-disabled Continue button: focusable, Enter-activatable, silently did nothing | **Fixed** — real `disabled` |
| M2 | `aria-label` on a bare `<div>` progress indicator (prohibited ARIA, ignored by screen readers) | **Fixed** — `role="img"` |
| M3 | Global key handler bound 1–5 and Escape to `window` with no focus or modifier guard | **Fixed** — guarded |
| M4 | SPA never changed `document.title` across four views (WCAG 2.4.2) | **Fixed** — per-view titles |
| M5 | No skip link anywhere; `<main>` missing on `/shop/`, `/about/`, `/quiz/`, `/v2/` | **Fixed** |
| M6 | Tap targets under 24×24 (WCAG 2.2 SC 2.5.8): Exit 22×20, Back 47×20, footer links | **Fixed** |
| M7 | `Calibrating` had no heading; focus fell to `<body>` entering it | **Fixed** |
| M8 | "MEASURING SEAT / CHECKING RISE" implied measuring the visitor; nothing is measured | **Fixed** — honest step labels |
| M9 | Legacy quiz options had no ARIA roles or `aria-checked` | **Fixed** |
| M10 | `/#works` and `/#fits` nav links on five pages resolved to nothing | **Fixed** — real anchors added |
| M11 | Hardcoded prices with no as-of date; "under $70" on an item priced 70, "under sixty dollars" on one priced 60 | **Fixed** — as-of date + retailer-is-authoritative note |
| M12 | Supplier marketing stated as FitCo fact ("bestselling", "most popular", "holds its shape for years", "True to size") | **Fixed** — attributed or replaced |
| M13 | `/shop/` superlatives with one hardcoded pick each and no caveat | **Fixed** — "our pick" + basis note |
| M14 | Unsourced claims: brands "least honest about" the thigh; "500 pairs that are just average" | **Fixed** — removed |
| M15 | No CSP or security headers; no `robots.txt` | **Fixed** — `_headers` + `robots.txt` |
| M16 | 479 lines of dead code carrying contradictory price research | **Fixed** — deleted |
| M17 | Infinite pulse animation ignored `prefers-reduced-motion` (WCAG 2.2.2) | **Fixed** |
| M18 | Fitting top bar overflowed horizontally at 320px (WCAG 1.4.10) | **Fixed** |
| M19 | `/quiz/` and `/v2/` publicly indexable with stale claims and a duplicate catalog | **Mitigated** — `noindex` + robots; removal is **O6** |

### LOW / accepted with mitigation

- **L-a — Two-decimal inch specs** (13.50″, 9.40″) come from a hardcoded reference table, not a
  measured garment, which sits awkwardly beside the "no invented precision" rule. Mitigated by
  the existing "Reference geometry · not garment-specific" caption. Making the caption more
  prominent is a design decision, not a defect.
- **L-b — Auto-advance on selection** (420ms) changes context without explicit request
  (WCAG 3.2.2). It is core to the product's feel and is now announced via the live region and
  reversible via Back. Flagged, deliberately not removed.
- **L-c — Every radio is a separate tab stop.** ARIA APG expects one tab stop with arrow-key
  navigation. Not a WCAG failure and fully operable; noted for a future pass.
- **L-d — `rel="noopener"` without `noreferrer`** on retailer links, so the FitCo URL is sent as
  `Referer`. Intentional and normal for outbound links; noted only for completeness.

### A note on automated testing

The report screen persistently showed 4 `color-contrast` violations that were **false
positives**: axe was sampling mid-fade while `whileInView` animations were still running, so it
measured a blended colour. The tell was that the reported colour differed on every run
(#79756b, #858177, #817c73). Once animations settle the computed colour is #6a655b and the page
is clean. Conversely, H2 and H3 — both real, both user-facing — were **not** caught by axe at
all. Automated scanning found roughly half of what mattered here.

---

## 4. THIRD-PARTY SERVICES

| Service | Purpose | Receives | Cookies/storage | In Privacy Policy? | Consent issue | A11y issue | Security issue | Action |
|---|---|---|---|---|---|---|---|---|
| ~~Google Fonts~~ | Webfonts | ~~IP, UA, Referer, every page load~~ | None | Was listed | **Was: no opt-out** | None | None | **Removed — self-hosted** |
| PostHog | Product analytics | Page/step events, answers, IP-derived region, device | 1st-party cookie + localStorage | Yes, accurately | **Resolved — consent-gated, GPC/DNT honoured** | None | Publishable key only | Dormant; gated if enabled |
| Mailchimp / Buttondown | Waitlist email | Email address only | Provider's own | Yes | On explicit submit | Form labelled | Public form endpoint, no API key in page | **Awaiting endpoint (O2)** |
| Web host | Serves the site | IP, as any server does | None | Yes | N/A | N/A | HTTPS/HSTS — **undecided (O7)** | Choose host |
| Retailers (11) | Outbound links | Referer on click only | Their own, after you leave | Yes | User-initiated | N/A | None | None needed |

**No advertising network, analytics vendor, session-replay tool, chat widget, embed, or CDN
receives anything about a FitCo visitor.**

---

## 5. California analysis

The owner has set governing law to California, which confirms a California operator. Two
separate regimes matter and they do not have the same trigger.

**CalOPPA** (Cal. Bus. & Prof. Code §22575 et seq.) applies to any commercial website collecting
personally identifiable information from California residents, **with no revenue or volume
threshold**. It requires a conspicuous privacy policy and — specifically — a disclosure of how
the site responds to Do Not Track signals. The policy previously had no DNT disclosure. **This
is now added, and GPC and DNT are honoured in code.**

**CCPA / CPRA** applicability is **fact-dependent and currently unresolved**. It attaches only
if the business meets one of: ≥ $25M annual gross revenue; buying, selling or sharing the
personal information of ≥ 100,000 consumers or households; or deriving ≥ 50% of annual revenue
from selling or sharing personal information. **None of these facts are known to this audit, and
FitCo should not be assumed subject to CCPA merely because it exists.** The site's current
"we do not sell or share" statement is accurate as built — there is no advertising, no
cross-context behavioural advertising, and no advertising identifiers — which is why no
"Do Not Sell or Share My Personal Information" link is offered.

**This changes the moment advertising, an ad pixel, or any cross-context tracking is added.**
Re-run this analysis before that ships.

**GDPR/UK GDPR** is likewise fact-dependent (whether FitCo targets or monitors people in the
EU/UK). The existing policy section is retained. The consent gate now makes the stated
consent basis true rather than aspirational.

---

## 6. OWNER DECISION REQUIRED

| # | Decision | Why it is blocked |
|---|---|---|
| **O1** | **Identify the legal entity operating FitCo** | No corporation, LLC, DBA or sole proprietorship was invented. The policies say only "FitCo", the service name. **Top launch blocker.** |
| **O2** | **Mailchimp/Buttondown form endpoint and audience ID**, plus double opt-in, unsubscribe and retention | The waitlist stays disabled until supplied. It cannot claim success without it. |
| **O3** | Confirm `fitco.fit` is the production domain and `support@fitco.fit` is monitored | The Privacy Policy makes it the sole channel for access and deletion requests. An unmonitored address is a broken promise. |
| **O4** | Is the `/about/` founder narrative a real person's genuine account? | If it is a constructed persona, FTC endorsement rules are engaged. Not changed, because the answer is unknown. |
| **O5** | Retention periods for the email list and for analytics | The policy currently says these are being finalised. That is honest but temporary. |
| **O6** | Keep publishing `/quiz/` and `/v2/`? | Both are `noindex`ed but still reachable and carry a duplicate catalog that will drift. Recommend deleting both. |
| **O7** | Hosting provider | Determines HTTPS/HSTS enforcement and where `_headers` goes. **HTTPS could not be verified — it is a hosting property, not a code property.** |

---

## 7. LEGAL QUESTIONS

Matters that cannot responsibly be resolved in code.

1. **No dispute venue is specified.** The `[JURISDICTION]` placeholder was removed rather than
   guessed. A forum-selection clause is optional; confirm whether its absence is the intended
   posture for a California-governed consumer agreement.
2. **Is the $100 liability cap enforceable** against consumers in California, and is the
   indemnification clause appropriate for a free consumer service?
3. **Do the fit disclaimers adequately limit exposure** when a recommendation leads to a
   purchase the customer is unhappy with?
4. **CCPA/CPRA applicability** once revenue and visitor volume are known — and whether a
   "Your Privacy Choices" link becomes mandatory.
5. **Naming, ranking and depicting 11 third-party brands** in a curated catalog: trademark,
   nominative fair use, and comparative-advertising exposure. FitCo also publishes opinions on
   brand sizing ("advise sizing up"), which is now attributed but still a public statement about
   a named company.
6. **The 13+ age representation** against COPPA and state age-appropriate-design codes,
   particularly since the site collects body-shape information from minors aged 13–17.
7. **Accessibility**: WCAG 2.2 AA was the technical target. Whether FitCo is a "place of public
   accommodation" under ADA Title III, and what that requires, is a legal question this audit
   does not answer.

---

## 8. Pre-launch checklist

**PASS** = verified in this branch · **NEEDS REVIEW** = requires an owner or legal decision ·
**N/A** = does not apply to this business

| Category | Status | Notes |
|---|---|---|
| Site & route inventory | **PASS** | 9 routes mapped; 2 marked as superseded prototypes |
| Data-flow inventory | **PASS** | Section 2.2 |
| Data minimisation | **PASS** | 6 coarse answers; no name, email, address, payment or exact measurements |
| Privacy Policy accuracy | **PASS** | Rewritten to match code; verified claim by claim |
| Terms & Conditions | **NEEDS REVIEW** | Placeholders filled; entity (O1) and venue (LQ1) outstanding |
| Refund / Return Policy | **N/A** | FitCo sells nothing |
| Shipping Policy | **N/A** | FitCo ships nothing |
| Cookie disclosure | **PASS** | No cookies set; localStorage keys enumerated by name |
| Consent mechanism | **PASS** | Gated, verified in 4 states |
| GPC / DNT | **PASS** | Honoured as standing opt-out |
| CalOPPA DNT disclosure | **PASS** | Added |
| CCPA / CPRA applicability | **NEEDS REVIEW** | Threshold facts unknown (Section 5) |
| GDPR applicability | **NEEDS REVIEW** | Targeting/monitoring facts unknown |
| Footer legal links | **PASS** | On every page and every SPA view, including fitting and report |
| Accessibility — automated | **PASS** | 9/9 pages clean; report's 4 proven false positives |
| Accessibility — manual | **PASS** | Keyboard journey, focus, reflow at 320px, reduced motion |
| Accessibility Statement | **NEEDS REVIEW** | Not written — needs a real contact route and remediation commitment (O3) |
| Pricing clarity | **PASS** | As-of date; retailer is authoritative |
| Fees / hidden charges | **N/A** | FitCo charges nothing |
| Claim substantiation | **PASS** | Counts corrected; supplier claims attributed |
| Reviews / testimonials | **NEEDS REVIEW** | None on site; founder narrative unverified (O4) |
| Affiliate disclosure | **PASS** | None exist; documented, with FTC requirement noted for the future |
| Button/action honesty | **PASS** | Waitlist can no longer claim success without sending |
| HTTPS / HSTS | **NEEDS REVIEW** | Hosting-dependent (O7); `_headers` prepared |
| Security headers / CSP | **PASS** | Written to match actual load behaviour |
| Secrets & env vars | **PASS** | None in tree or history |
| Dependency vulnerabilities | **PASS** | 6 resolved; audit clean |
| Auth / sessions / API / CSRF / injection | **N/A** | No server, no database, no accounts |
| Payment data handling | **N/A** | Never touched |
| PII in logs | **PASS** | No server logs; client error capture truncates to 300 chars and is consent-gated |
| Email list handling | **NEEDS REVIEW** | Blocked on provider endpoint (O2) |
| Legal entity identified | **FAIL** | **O1 — launch blocker** |

---

## 9. What I could not do

- **Verify HTTPS, HSTS, or that the security headers are actually served.** These are properties
  of the hosting provider, which is undecided. `_headers` is prepared but unproven in production.
- **Confirm whether affiliate relationships exist.** Acted on the owner's statement that none do.
- **Verify the founder narrative**, product photographs, or whether any pant has ever been
  physically measured.
- **Verify that prices are currently accurate.** They are a hand-taken snapshot; the fix was to
  date them and point at the retailer rather than to imply they are live.
- **Test with real assistive technology.** Testing used the accessibility tree, axe-core and
  keyboard-only operation. That is not the same as a session with an actual screen-reader user,
  which is the only way to find some classes of problem.
