# 06 · Anti-Slop Doctrine

Status: binding for design, build, copy and QA. Research date: 2026-09-29.
Owner role: design critic. Every PR / section review runs the rubric in section 3 and the copy scan in section 4.

---

## 0. Why generic happens (the mechanism, in one paragraph)

LLM-built pages converge because the model samples the statistical center of its training web ("distributional convergence"): Tailwind defaults, shadcn cards, Inter, indigo gradients, the hero > features > logos > pricing > FAQ skeleton ([Anthropic, Improving frontend design through Skills](https://claude.com/blog/improving-frontend-design-through-skills); [Claude Cookbook, Prompting for frontend aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)). The purple is traceable to Tailwind's `indigo-500` demo default saturating tutorials and repos ([prg.sh, Oct 2025](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website); [925 Studios, Sep 2026](https://www.925studios.co/blog/ai-slop-design-tells)). Even "trying harder" converges: Anthropic itself notes Claude drifts to Space Grotesk once told to avoid Inter. And the 2026 escape hatches are now slop too: cream + serif + terracotta, near-black + one neon accent with glowing edges, broadsheet hairlines + italic serif + tracked mono labels (impeccable `reference/new-work.md`; [codemyspec, Jul 2026](https://codemyspec.com/blog/vibe-coded-websites-look-the-same)). Human SaaS teams reach the same result by copying Stripe/Linear and templates ([Overpass Studio, updated May 2026](https://www.overpass.studio/blog/why-saas-websites-look-the-same)). Visitors notice: the cost is "they probably used AI... are they vibe-coding the product too?" ([Shuffle, Jan 2026](https://shuffle.dev/blog/2026/01/why-do-most-ai-generated-websites-look-the-same/); [codemyspec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same)).

**What elite studios do instead** (the positive thesis we build toward):
1. **Total commitment to one idea.** "There is no normal page hiding underneath; the world IS the site" (Igloo Inc, via [dappasol cinematic guide](https://dappasol.com/guides/cinematic-website-examples/)). Awwwards SOTY 2025 *Messenger* (abeto) is a tiny playable WebGL planet, not a page with a 3D widget ([Awwwards SOTD page](https://www.awwwards.com/sites/messenger); [Awwwards SOTY](https://www.awwwards.com/websites/sites_of_the_year/)).
2. **Direction over tech.** "Plenty of Three.js sites feel like tech demos. The cinematic ones feel like someone directed them." Locomotive's work has "almost no 3D, still unmistakably filmic": pacing and type do the work ([dappasol](https://dappasol.com/guides/cinematic-website-examples/)).
3. **Art direction + choreographed motion + 60fps**, as a juror put it: "Award-winners aren't decorated templates"; transitions "carry meaning"; "Beauty at 60fps is the whole discipline" ([Hon Tran, Jun 2026](https://www.hontran.dev/blog/best-award-winning-websites-2026)). Praised examples: By-Kin (transitions that never call attention to themselves), Iventions (Three.js for "atmosphere instead of spectacle"), Uncommon (a grid "that breaks at exactly the right moments").
4. **Encode decisions once, in a file**, so every section obeys them (DESIGN.md approach: [Developers Digest, Apr 2026](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it); [codemyspec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same)). For us: tokens in `:root` + this doc.
5. **Human signal is a trust signal in 2026.** Texture, grain, authored imperfection, idiosyncratic type are read as "made by someone" ([Lindsay Marsh, 2026 trends](https://lindsaymarsh.substack.com/p/design-trends-2026-imperfection-rebellion); [Crossglobe, anti-AI-slop trend](https://crossglobemarketing.com/blogs/anti-ai-slop-human-centered-design-trends-2026/)). Counter-movements like anti-grid brutalism exist because bento became the default ([StudioMeyer mid-2026 reality check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)).

Test of last resort (impeccable): **if someone could guess our aesthetic from the category alone, or from "category + avoiding AI clichés", we failed.**

---

## 1. DO-NOT / DO-INSTEAD (68 tells)

Rule of use: any tell below may be un-banned only by a one-sentence written rationale in the direction contract that names why *this* concept needs it. "It looks premium" is never a rationale.

### 1A. Color & surface

| # | DO NOT | DO INSTEAD |
|---|---|---|
| 1 | Purple-to-blue / indigo-to-violet gradients anywhere (hero wash, buttons, card glows). Source: every list above. | Derive the palette from the concept's physical world (a material, a light condition, a pigment). Pick a color *strategy* first: Restrained, Committed (one color owns 30-60% of surface), Full, or Drenched (impeccable). |
| 2 | Gradient-filled headline text (`background-clip:text`). | Emphasis via size, weight, width axis, or an in-shader treatment of the type itself that the concept motivates. |
| 3 | Timid, evenly distributed palette (five pastels each at 20%). | "Dominant colors with sharp accents" ([Anthropic](https://claude.com/blog/improving-frontend-design-through-skills)). Color commits at region scale, not sprinkled accents. |
| 4 | Near-black ground + one neon accent (acid green / vermilion / cyan) + glowing edges. The 2026 "dark premium" default. | If dark, make the dark *specific* (ink with a hue, tinted shadow, light that has a source). Accent earns its place by meaning, not by glow. |
| 5 | Cream / bone / paper ground + serif display + terracotta or oxblood accent (`#f5f1ea`, `#b6553a`, `#1a1714` families). | Treat that palette as spent. Start from saturated materials of the concept world. |
| 6 | Colored outer glows, neon `box-shadow` halos, zero-offset colored shadows. | Shadows with offset, soft blur, tinted from the ground hue. Light in WebGL comes from a lit source, not a CSS halo. |
| 7 | Glassmorphism / frosted cards as default container. Also costs 15-30% FPS on Android ([StudioMeyer](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)). | At most one functional blur (e.g., the nav over a shader). Otherwise opaque planes, type directly on the canvas, or no container. |
| 8 | Random floating gradient blobs / "aurora" mesh backgrounds that mean nothing. | One authored shader whose behavior is the concept (it reacts to scroll, pointer, time, content). If you cannot say what the shader *is*, delete it. |
| 9 | Pure `#000` / pure `#fff` plus Tailwind gray body text. | Tinted neutrals; secondary text tinted from the surface hue, never flat gray (impeccable craft-floor). |
| 10 | Permanent dark mode chosen "because tech" with gray-on-black low-contrast body ([Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)). | Light/dark decided by a one-sentence use scene (who, where, what light). Body text ≥4.5:1 always. |
| 11 | Film grain / noise as a costume slapped on at the end. | Grain only if it belongs to the material; render it once in the post pass (fixed layer, `pointer-events:none`), tuned, not 0.08 opacity everywhere. |
| 12 | Colored `border-left` / `border-top` strips on cards and callouts ("the single most reliable AI tell"). | No accent strips. Hierarchy from type and space. |
| 13 | Browser-default surfaces: blue selection, default caret, default scrollbar, default focus ring. | Theme `::selection`, `caret-color`, focus rings, scrollbar, underline offset from tokens. Cheapest "built, not assembled" signal (impeccable). |

### 1B. Typography

| # | DO NOT | DO INSTEAD |
|---|---|---|
| 14 | Inter (or Roboto / Arial / system) for everything, at three weights. | A display face with a point of view, self-hosted via `next/font/local`, paired with a disciplined text face. Type is the #1 carrier of identity when there are no photos. |
| 15 | The "tried-harder" reflex list: Space Grotesk, Space Mono, Syne, Outfit, DM Sans/Serif, Plus Jakarta, Instrument Sans/Serif, Fraunces, Playfair, Cormorant, Lora, Newsreader, IBM Plex, Geist-as-personality (impeccable new-work; taste skill; [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)). | Look further: foundry trials/free-for-web from Pangram Pangram, Velvetyne, Collletttivo, Displaay, Commercial Type-adjacent open alternatives, or variable fonts whose axes we animate. Record the reason no other face could do it. |
| 16 | One serif italic word injected into a sans headline ("Build *beautiful* things"). | Emphasis within the same family (italic, weight, width axis), or through motion of the word itself. |
| 17 | All-caps tracked mono micro-labels everywhere as "technical" costume. | Mono only for real data, code, coordinates, measurements. Labels in the text face, sentence case. |
| 18 | Screaming 10rem H1 with nothing else going on; or the opposite, polite 48px everything. | A real scale with obvious jumps; display size set together with the canvas composition. Tracking floor -0.04em; balanced headings (`text-wrap: balance`). |
| 19 | `<br>`-broken headline with italicized last word as the "design move". | Headlines that read naturally first; line breaks set by the grid and measured copy. |
| 20 | Body measure spanning 120ch or crammed into 30ch. | 60-72ch body; hanging punctuation, real quotes (“ ”), tabular numerals where numbers align. |
| 21 | Em-dash and en-dash as rhythm crutch (the #1 visible LLM tell in the taste skill's production tests). | Periods, commas, colons, parentheses. Hyphen for ranges. Zero `—` in shipped copy. |
| 22 | Middle-dot separator chains ("Design · Build · Ship · Scale"). | Max one `·` per line; use line breaks or columns. |

### 1C. Layout & structure

| # | DO NOT | DO INSTEAD |
|---|---|---|
| 23 | Centered hero: pill badge + two-line H1 + subhead + two buttons (primary filled, secondary ghost) + mockup below ([Adpharm, May 2026](https://www.theadpharm.com/insights/claude-design-without-the-ai-slop-look); [codemyspec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same)). | The hero *is* the concept's first frame: full-bleed canvas, asymmetric type lockup, one action. The first 3 seconds demonstrate something only this site can do. |
| 24 | Badge/pill/eyebrow above the H1 ("✨ New: v2.0 is here", "BETA", "Introducing"). | No eyebrow. Impeccable treats this as an absolute ban: "delete the label and let the heading speak." |
| 25 | The canonical skeleton hero > logos > 3 features > testimonials > pricing > FAQ > CTA > footer ([Shuffle](https://shuffle.dev/blog/2026/01/why-do-most-ai-generated-websites-look-the-same/)). | Structure from the narrative: acts/chapters of one continuous world, each with a different spatial idea. |
| 26 | Three equal cards with icon + heading + two lines of text. | Asymmetric composition, a pinned scroll sequence, a single large interactive object, or a typographic list. If you have three points, ask whether one of them should dominate. |
| 27 | Bento grid as filler ("Japanese lunch box" on every SaaS page, now the default per [StudioMeyer](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)). | Only if the content is genuinely heterogeneous and each tile has a live behavior. Otherwise a composition with one hero element and deliberate negative space. |
| 28 | `rounded-2xl` on everything, one uniform radius, one uniform soft shadow. | Decide radius per role (maybe 0). Sharp edges and full-bleed planes read authored. |
| 29 | Cards nested in cards; cards as the universal container. | Group with space, a single rule, or the canvas itself. |
| 30 | Identical section rhythm: same padding, same heading-then-grid pattern, same fade-up, 8 times. | Vary section *families* (min 4 on the page, none repeated); vary density and pace: a dense beat next to a near-empty one. |
| 31 | Zigzag image-left/text-right alternation for 3+ sections. | Max two in a row; break with full-bleed, pinned or horizontal sequence. |
| 32 | Split header: big headline left, tiny explainer paragraph floating top-right. | Stack headline and body, or give the right column a real job. |
| 33 | Section-number eyebrows (`01 / Capabilities`, `002 · Work`) and `01 / 04` pagination. | Numbers only when sequence carries information the reader needs. |
| 34 | Stat banner: "10x faster · 99.9% uptime · 24/7 support" in big numbers + small labels. | If a number matters, visualize it as data in the scene. Never invent perfect-looking metrics. |
| 35 | Decorative hairline crosshair grids, corner brackets, registration marks as "designed" texture. | Lines only where they organize real content or belong to the concept's world. |
| 36 | Decorative hero-bottom strip (`EST. 2026 · LISBON · TYPE / MOTION / CODE`), city/time/weather strips. | Delete. If the bottom edge needs something, it is the next act bleeding in. |
| 37 | "Scroll to explore" labels and animated mouse-wheel icons. | Compose the fold so the next act visibly peeks in; the page itself invites scroll. |
| 38 | Vertical rotated side text for decoration. | Only if it serves a real axis of the composition. |
| 39 | Hero that fails at 390px (text over busy canvas, clipped H1, horizontal scroll). | Design the mobile composition deliberately (different crop, lower DPR shader, simplified act), not a squished desktop. |

### 1D. Imagery, 3D & WebGL (our stack's specific traps)

| # | DO NOT | DO INSTEAD |
|---|---|---|
| 40 | The iridescent / chrome noise-displaced icosphere blob, torus knot, or "liquid metal" hero object; `MeshPhysicalMaterial` iridescence text (the stock three.js hero demos, cf. [freefrontend](https://freefrontend.com/three-js/), [CrazyGL](https://crazygl.com/)). | One original visual system derived from the concept: its own geometry, its own shading model, its own behavior. If it could be a Codrops demo thumbnail, it is not ours. |
| 41 | Particle sphere / galaxy / starfield / "neural network" dot-and-line plexus. | Particles only if they are a material of the world (sand, ink, pollen, signal) with physics that tell the story. |
| 42 | Tech-demo syndrome: effects stacked with no director (bloom + chromatic aberration + DOF + noise + vignette all at once). | Post-processing budget: max 2 passes the concept needs; each tuned to near-subliminal. Every effect answers "what does this say?" |
| 43 | Default bloom making everything glow. | Tone-mapped, restrained highlights; bloom only on actual light sources, threshold high. |
| 44 | Spline/stock 3D illustrations (clay people, glossy isometric icons, floating 3D emoji). | Procedural shader art authored in GLSL; typography as the main figure. |
| 45 | Canvas that is decorative wallpaper behind a normal page (effects "layered onto traditional layouts" per [dappasol](https://dappasol.com/guides/cinematic-website-examples/)). | The canvas and the DOM are one choreography: scroll drives camera/uniforms, type interacts with the scene, sections are states of the world. |
| 46 | WebGL that tanks mobile, 2MB hero runtime, no fallback ([StudioMeyer](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)). | Adaptive DPR, `frameloop="demand"` when idle, pause offscreen, tiered quality, static poster frame for no-WebGL and `prefers-reduced-motion`. Real text stays in the DOM for SEO and screen readers. |
| 47 | Hero cursor effect that is the whole idea (trail, magnetic blob). | Pointer interaction must modify the world meaningfully and be optional; touch gets an equivalent (tilt, drag, tap). |
| 48 | Div-based fake product screenshots, fake dashboards, fake terminal windows (the "#1 LLM-design tell" per taste skill). | Show nothing fake. If there is a "product", show it through the living shader/system itself. |
| 49 | Model-drawn SVG illustrations, hand-rolled icons, geometric masks faking organic cutouts. | A real icon library for UI glyphs; simple brand mark only; organic shapes come from shaders/SDFs. |
| 50 | Emoji or unicode glyphs as icons (✨ 🚀 ⚡ →). | Consistent icon set (one stroke weight) or no icons. |
| 51 | Generic Unsplash "people at laptop / abstract architecture" photos as mood filler. | Only photography that is the concept; otherwise none. Honest asset rule applies. |

### 1E. Motion

| # | DO NOT | DO INSTEAD |
|---|---|---|
| 52 | Same fade-up-20px-on-scroll on every element of every section ("sections fading in as you scroll", [Shuffle](https://shuffle.dev/blog/2026/01/why-do-most-ai-generated-websites-look-the-same/)). | One authored focal moment per act; "a generic fade-and-rise, hover lift, parallax layer, or scroll reveal is not a thesis" (impeccable animate.md). |
| 53 | Scattered micro-interactions everywhere. | "One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions" ([Anthropic](https://claude.com/blog/improving-frontend-design-through-skills)). |
| 54 | Infinite looping pulses, bouncing arrows, shimmer on buttons, rotating badge text. | Things at rest are at rest. Loops only in the world (ambient shader time), slow and low amplitude. |
| 55 | Bounce/elastic/back easing by reflex; default `ease-in-out` everywhere. | A small custom ease family (CustomEase), exponential ease-out for arrivals, faster exits. Named tokens, reused. |
| 56 | SplitText char-by-char stagger on every heading. | Split effects reserved for 1-2 moments where the letters themselves mean something (e.g., type dissolving into the shader). |
| 57 | Parallax on everything; lines that follow you down the page for no reason. | Depth motion tied to the world's camera, not per-div offsets. |
| 58 | Scroll-jacking that fights the user, broken pinning, jumps on resize. Two smooth-scroll engines. | Lenis only, synced to ScrollTrigger ticker; scrubbed, reversible, interruptible; tested on trackpad, wheel, touch, keyboard. |
| 59 | Preloader with a percentage counter 0-100 as the only "intro". | If a loader exists, it is act zero of the concept and lasts < 2s on warm cache. |
| 60 | Custom cursor replacing the native one with no function. | Native cursor kept; any cursor companion is additive, disabled on touch and reduced-motion. |

### 1F. Content & trust (honest-asset rule)

| # | DO NOT | DO INSTEAD |
|---|---|---|
| 61 | Fake logo walls / "Trusted by 10,000+ teams" / "As seen in". | No social proof we do not have. Let craft be the proof. |
| 62 | Invented testimonials with "Sarah K., CEO" and avatar circles. | None. If a human voice is needed, it is the brand's own manifesto voice, signed as such. |
| 63 | Fake-perfect numbers (99.9%, 10x, 24/7) or fake precision. | Only true numbers (e.g., real shader stats, real frame counts, real dates). |
| 64 | Pricing toggle, FAQ accordion, feature comparison table as reflexive filler. | Include only what the concept needs; end on one strong action. |
| 65 | Startup-slop names: Nexus, Flux, Nova, Lumen, Aether, Vertex, Synth, "-ly", "-ify". | A name with a real etymology or image tied to the concept; check it is not an existing well-known brand. |
| 66 | Version stamps and fake status: `v2.0`, `BETA`, "last sync 4s ago", pulsing green "live" dots. | Status only if real. |
| 67 | Footer mega-grid of dead links (Product / Company / Resources / Legal) on a one-page site. | A footer that is a last composition: name, one line, working links only. |
| 68 | Unstyled states: broken hover, no focus-visible, no reduced-motion variant, no no-JS content. | Every interactive thing has hover, focus-visible, active; reduced-motion is a designed version, not "motion off". |

---

## 2. The five questions every section must answer before it ships

1. What is the one idea of this act, in one sentence without adjectives?
2. Which layout family is it, and is that family unused elsewhere on the page?
3. What is its single focal motion moment, and what does the motion *mean*?
4. Could this section appear on a competitor's site unchanged? (If yes: redo.)
5. What does it look like at 390px, with reduced motion, and without WebGL?

---

## 3. Distinctiveness rubric (0-10)

Score the page (and each act) in a blind "screenshot + 10s screen recording" review. Target to ship: **≥ 8.5 overall, no act below 7.** Score below 6 on any act = rebuild that act, not polish it.

| Score | Anchor description | Test |
|---|---|---|
| **0** | Pure template. Indigo gradient, centered pill hero, 3 cards, logo wall, Inter. | Indistinguishable from a v0/Lovable default. |
| **1** | Template with a color swap. | Change the logo and it could be any SaaS. |
| **2** | "Tried harder" default: Space Grotesk / Instrument Serif, dark + neon, bento, glass. | Recognizably 2025 vibe-coded. |
| **3** | 2026 escape-hatch default: cream + serif + terracotta, or broadsheet hairlines + mono labels, done competently. | Aesthetic guessable from "category + avoiding AI clichés". |
| **4** | Competent agency-template: good type, smooth scroll, fade-ups, a stock-feeling WebGL blob. | Looks like a Framer/Webflow premium template. |
| **5** | Some authored choices (custom palette, good face) but structure and motion are standard; WebGL is wallpaper. | You remember "nice", not "what". |
| **6** | A real concept exists but is applied as decoration; 1-2 memorable moments; rhythm still repetitive. | You can describe one moment a day later. |
| **7** | Concept drives hero and most acts; motion choreographed; shader is original; few tells remain. Awwwards Honorable Mention level. | Someone could describe the site's idea in one sentence. |
| **8** | Single committed world; DOM and canvas choreographed together; type is a signature; every act a different spatial idea; performant on mobile. Awwwards SOTD range. | Screenshot is identifiable without a logo. |
| **9** | 8 plus a genuinely new interaction or visual idea people would screen-record and share; zero tells; states, a11y and fallbacks all designed. SOTM contender. | Other designers would ask "how did they do that?" |
| **10** | Defines a reference others will copy (Messenger, Igloo Inc tier). Concept, craft, performance and restraint all at the limit. | Becomes a new default for others (irony noted). |

**Automatic caps** (regardless of other merits):
- Any fake social proof, fake testimonial, or fake metric: cap **3**.
- Any tell from #1, #2, #23, #24, #26, #40, #48 present: cap **5**.
- Hero drops below 50fps on an M-series MacBook, or no reduced-motion / no-WebGL fallback: cap **6**.
- More than 3 banned copy terms (section 4) visible: cap **6**.
- Any `—` in visible copy: cap **7** until fixed.

Sub-scores to report alongside (each 0-10): Concept commitment, Typography, Color/Material, Composition & rhythm, Motion direction, WebGL originality, Copy voice, Craft (states, a11y, perf).

---

## 4. Copywriting anti-slop

Principle: "pattern density, not individual tells, signals AI output" ([Ritner Digital](https://www.ritnerdigital.com/blog/the-phrases-that-give-away-ai-writing-and-how-to-edit-them-out-before-they-cost-you-trust)). Weightless headlines like "Build faster. Ship smarter." fail because they could belong to anyone; "say something only your product could say" ([925 Studios](https://www.925studios.co/blog/ai-slop-design-tells)).

### 4A. Banned words (grep the codebase for these before every release)

unleash, unlock, elevate, empower, seamless, seamlessly, revolutionize, revolutionary, transform/transformative, cutting-edge, next-gen, next-level, state-of-the-art, game-changer, game-changing, innovative, groundbreaking, reimagine, supercharge, turbocharge, effortless(ly), leverage, harness, utilize, streamline, optimize, synergy, holistic, robust, scalable (in marketing copy), delve, tapestry, realm, landscape, testament, pivotal, multifaceted, intricate, meticulous(ly), paramount, foster, navigate (figurative), showcase, beacon, cornerstone, embark, journey (figurative), elevate, curated, crafted (as filler), bespoke (as filler), immersive (as a claim; show it instead), magic/magical, AI-powered (unless literally true and relevant), world-class, best-in-class, blazing(ly) fast, lightning-fast, powerful, stunning, beautiful (self-describing), sleek, robust, dive in, deep dive.
Sources: [Ritner Digital](https://www.ritnerdigital.com/blog/the-phrases-that-give-away-ai-writing-and-how-to-edit-them-out-before-they-cost-you-trust), [Blake Stockton, Red Flag Words](https://www.blakestockton.com/p/red-flag-words), [Ruben Hassid](https://ruben.substack.com/p/delve), taste skill 9.D.

### 4B. Banned phrases and structures

| Banned | Why it reads as slop | Do instead |
|---|---|---|
| "In today's fast-paced (digital) world / landscape" | Throat-clearing opener. | Start on the claim. |
| "It's not just X, it's Y." / "Not X. Y." / "Less X, more Y." / "Forget X." | Negative parallelism, the defining 2025-26 LLM cadence; exploded in corporate filings ([Ruben Hassid](https://ruben.substack.com/p/its-not-x-its-y)). | State Y directly. |
| Rule-of-three adjective stacks: "Fast, simple, powerful." | Mechanical triplets. | One precise claim, or two unequal ones. |
| "Build faster. Ship smarter." style verb-adverb couplets | Weightless, interchangeable. | A sentence with a concrete noun only we could use. |
| "Whether you're a X or a Y..." | Audience hedging. | Speak to one person. |
| "Ready to get started?" / "Join thousands of..." / "Take your X to the next level" | Template CTAs. | CTA names the literal action ("Enter the field", "Play with the light"); 1-3 words. |
| "Designed for the way you work" / "Everything you need" / "All in one place" | Says nothing. | Name the specific thing. |
| "Let's dive in" / "Read on to discover" / "Here's the thing" | Meta-commentary. | Delete. |
| "Trusted by / Loved by / Quietly in use at" | Proof we do not have. | Delete. |
| Poetic-performative labels: "Field notes", "On the bench", "Loose plates", "Chapter One" as filler | Craftsman costume (taste skill 9.F). | Plain labels or none. |
| Micro-meta sentences under headings ("The list stays short on purpose.") | Clutter pretending to be voice. | Delete. |
| Every paragraph the same length, every sentence ~15 words | Low burstiness. | Vary: a 3-word sentence next to a 25-word one. |
| Bold-term-colon lists ("**Speed:** ...") on a landing page | Documentation cadence. | Prose or pure typographic list. |
| Rhetorical questions as headings ("What if design could feel?") | Cliché hook. | Declarative. |

### 4C. Tone we want (alternatives)

- **Concrete nouns over adjectives.** Replace "stunning visuals" with what is literally on screen ("4,096 threads of light, bent by your cursor").
- **Specific numbers that are true** (render stats, dimensions, dates) over round marketing numbers.
- **Short declaratives with an odd, human angle.** Wit allowed, hype not.
- **One voice.** Write as the world/brand speaking, not as a SaaS explaining features.
- **Verbs that are physical:** bend, pour, fold, drift, catch, ring, split, settle, strike. Not: empower, enable, drive, deliver.
- **Headline test:** could a competitor paste it on their site unchanged? If yes, rewrite.
- **Length caps:** hero headline ≤ 7 words; hero sub ≤ 20 words; any paragraph ≤ 45 words.
- **Punctuation:** no em/en dashes, curly quotes, real ellipsis character only if used at all (prefer not).

---

## 5. QA checklist (mechanical, run before morning handoff)

- [ ] `grep -rnE "—|–" app/ components/` returns nothing in visible copy.
- [ ] Banned-word grep (section 4A) returns nothing in visible copy.
- [ ] No `linear-gradient` with purple/indigo/violet hues; no `background-clip: text`.
- [ ] No font from the reflex list (#15) in `next/font` imports.
- [ ] No eyebrow/pill above any H1/H2; no section numbers; no scroll cue.
- [ ] ≥ 4 distinct layout families, none repeated; no 3-equal-card row.
- [ ] `::selection`, `caret-color`, focus-visible, scrollbar themed.
- [ ] Reduced-motion variant designed; no-WebGL poster; DOM text for all canvas content.
- [ ] 60fps target on M-series (Chrome + Safari); DPR clamp and offscreen pause verified; mobile 390px composition checked.
- [ ] Zero fake proof, metrics, testimonials, logos.
- [ ] Rubric scored blind by a second reviewer: ≥ 8.5, no act < 7, no caps triggered.

---

## Sources

Primary/recent web:
- Anthropic, Improving frontend design through Skills: https://claude.com/blog/improving-frontend-design-through-skills
- Claude Cookbook, Prompting for frontend aesthetics: https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics
- 925 Studios, AI Slop Fonts and Gradients (Sep 2026): https://www.925studios.co/blog/ai-slop-design-tells
- Developers Digest, 16 patterns (Apr 2026): https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- codemyspec, Why vibe coded websites look the same (Jul 2026): https://codemyspec.com/blog/vibe-coded-websites-look-the-same
- The Adpharm, Claude Design without the AI slop look (May 2026): https://www.theadpharm.com/insights/claude-design-without-the-ai-slop-look
- prg.sh, Why your AI keeps building the same purple gradient website (Oct 2025): https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- Shuffle, Why do most AI-generated websites look the same (Jan 2026): https://shuffle.dev/blog/2026/01/why-do-most-ai-generated-websites-look-the-same/
- Overpass Studio, Why SaaS websites look the same (May 2026): https://www.overpass.studio/blog/why-saas-websites-look-the-same
- StudioMeyer, Web design trends 2026 reality check (May 2026): https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check
- Hon Tran, Best award-winning websites 2026, juror view (Jun 2026): https://www.hontran.dev/blog/best-award-winning-websites-2026
- dappasol, Cinematic website examples (2026): https://dappasol.com/guides/cinematic-website-examples/
- Awwwards, Messenger SOTD / Sites of the Year: https://www.awwwards.com/sites/messenger , https://www.awwwards.com/websites/sites_of_the_year/
- Ritner Digital, AI writing giveaways: https://www.ritnerdigital.com/blog/the-phrases-that-give-away-ai-writing-and-how-to-edit-them-out-before-they-cost-you-trust
- Ruben Hassid, "It's not X, it's Y": https://ruben.substack.com/p/its-not-x-its-y
- Blake Stockton, Red flag words: https://www.blakestockton.com/p/red-flag-words
- Lindsay Marsh, Design trends 2026: https://lindsaymarsh.substack.com/p/design-trends-2026-imperfection-rebellion
- Crossglobe, Anti-AI-slop trend: https://crossglobemarketing.com/blogs/anti-ai-slop-human-centered-design-trends-2026/

Local skills:
- `~/.claude/skills/design-taste-frontend/SKILL.md` (sections 4.1-4.4, 9.A-9.G)
- `~/.claude/plugins/cache/impeccable/impeccable/4.4.0/skills/impeccable/reference/craft-floor.md`, `new-work.md` (sec. 4 "Commit the world"), `animate.md`

Notes on source conflicts: the taste skill bans custom cursors, vertical text and decorative grids outright; for an Awwwards-tier experience we treat them as conditional (#35, #38, #60) rather than banned. StudioMeyer reports bento and dark mode "won" in 2026; for our bar that is exactly why they are defaults to avoid, not evidence to follow.
