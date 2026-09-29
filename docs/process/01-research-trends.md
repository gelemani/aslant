# 01 — Research: Web & UI Design Trends, late 2025 → 2026

Researched 2026-09-29. 19 web searches, 27 full-page reads (WebFetch). Sources are cited inline as `[S#]`, and the full list is in §4.
The focus is on high-end marketing, landing and portfolio sites judged at the Awwwards SOTD/SOTY level. Product-UI trends are included only where they affect a jury's usability score.

> **Reading note on source quality.** Most "trends 2026" listicles (Wix, GoDaddy, VistaPrint, template shops) mostly repeat each other and aim at SEO. I gave more weight to primary or craft sources: Awwwards pages, Codrops case studies and tutorials, It's Nice That, Fontfabric, Figma's Config recap, CSS-Tricks, Chrome for Developers, and the three.js release analysis. Two sources need caution. **[S6] Digital Strategy Force** publishes precise Awwwards statistics (such as "61% of Q1-2026 SOTDs are immersive 3D") that I could not verify, so treat them as directional only. **[S9] Svilenković** mentions a "GSAP ScrollTrigger 4.0". Our stack pins GSAP 3.15, so ignore that claim. The search result labelled "Awwwards Mid-Year Digital Trends Report" turned out to be a 2022 SOTD by Editor X [S13] and was discarded as evidence.

---

## 0. The shape of 2026 in one paragraph

The web split in two. The **middle of the market** converged on a single AI-generated template look: Inter headlines, a purple-to-blue gradient, bento cards, three feature tiles, and dark mode by default [S20][S22]. Designers and juries both reacted against it. **The top of the market** went in two directions at once. One is **toward the GPU**: persistent real-time worlds, scroll-driven camera narratives, custom shaders. The 2025 Sites of the Year were a WebGL planet game ([Messenger by abeto](https://www.awwwards.com/sites/messenger)) and a WebGL F1 portfolio (Lando Norris by OFF+BRAND) [S14][S15][S16]. The other is **toward the hand and the material**: photocopy grain, micro-technical labels, blotchy living logos, pick-and-mix type, and "crafted, not prompted" authorship signals [S3][S19][S24]. Shader tooling became commodity in 2026: Unicorn Studio, Figma's Config 2026 shader fills, and WebGPU in every browser [S8][S11][S18]. As a result, **"has a shader" no longer differentiates a site. The idea the shader expresses does.** Juries reward concept, pacing, restraint and frame-rate stability more than they reward effects [S6][S17][S25].

---

## 1. Trend catalogue

Maturity key: **RISING** (fresh, few elite examples) · **PEAK** (widely seen at SOTD level, still credible if well executed) · **OVERUSED** (reads as template or dated to a 2026 jury).

### 1.1 Persistent real-time worlds & scroll-as-camera
- **Looks/feels like:** You do not "scroll a page". You travel through one continuous place. The camera follows a spline driven by normalized scroll, the DOM story is layered above, and chapters snap. Examples are a "tiny WebGL planet" (Messenger), a horizontal journey "rendered almost entirely in shadow, with audio coupled to camera state" (Immersive Garden's *Artisans d'Idées*) [S7][S14], and the Santamaria portfolio, which uses snap-scroll "page-turning" through a fractured landscape [S17].
- **Signature techniques:** One persistent canvas behind the DOM. Master timeline driven by 0→1 scroll progress. GSAP ScrollTrigger plus Observer to unify wheel, touch and trackpad. Free-scroll mixed with snap blocks. GPU instancing. KTX2 and Draco compression. Atmospheric passes rendered at low resolution [S6][S17].
- **Maturity:** **PEAK** at award level. Directionally, immersive sites dominate SOTD/SOTY [S6][S15]. Outside creative brands it under-delivered, because 0.8–2 MB of JS before first content kills conversion sites [S10].
- **Elite execution:** One place, not five scenes. The world has to *mean* something ("they should feel like they arrived somewhere, not just opened a tab" [S17]). Messenger's discipline sets the budget: the whole game loads at 5.7 MB [S16]. Frame stability counts toward usability score: judges test on multiple devices [S6]. Always ship an honest poster-frame fallback.

### 1.2 Procedural shader art as brand material
- **Looks/feels like:** Fields, fluids, ink, nebulae, SDF forms and noise-driven light used as the site's *material*, not as a background decoration. Examples: Santamaria's fBm "Ink Bleed" contact menu [S17], and Unicorn Studio's Aurora, Nebula, Wisps, Beam and Blob Tracking effects [S18].
- **Signature techniques:** Fragment shaders (fBm, domain warping, SDF raymarching, curl noise), GPU fluid sims reacting to the cursor, custom post-processing for tone [S6]. three.js r182–r186 made WebGPU and TSL first-class, and WebGPU now ships in every major engine, with Safari 26 as the last to arrive [S11].
- **Maturity:** **PEAK moving toward commoditizing.** Shaders are now "WebGL for everyone" through no-code tools [S23][S18], and Figma Config 2026 added *prompted* WebGPU shader fills on the canvas [S8]. A generic aurora or blob shader now reads as a Unicorn Studio preset.
- **Elite execution:** Write the shader so it *is the concept* (a physical metaphor that belongs to this brand only). Parameterize it, and let scroll or story move its parameters with intention. Render at reduced DPR with a hard frame budget. Unify it with typography, for example by sharing noise between the text mask and the field. Stack note: pmndrs `postprocessing` targets WebGLRenderer, and three r183 renamed its own `PostProcessing` class to `RenderPipeline` [S11]. Keep R3F on WebGL2 unless we deliberately go all-in on TSL.

### 1.3 Retro-computational post: dithering, ASCII, halftone, CRT
- **Looks/feels like:** 1-bit or 4-shade images, Bayer or Floyd–Steinberg patterns, procedurally drawn ASCII glyph fields, scanlines and phosphor bloom [S12]. Codrops' 2025 review names real-time dithering (Niccolò Fanton) as one of the year's breakout techniques [S21].
- **Techniques:** Ordered dithering in the fragment shader, glyph-density mapping on 5×7 procedural grids, bloom to soften pixel edges [S12]. Canva reports "lo-fi aesthetic" searches up 527% [S19].
- **Maturity:** **PEAK tipping to OVERUSED.** It is now a one-click Unicorn Studio effect ("ASCII dither") [S18].
- **Elite execution:** Only when the concept is *about* signal, resolution or reproduction. Do it light and print-like rather than green-CRT-on-black. Tie the dither threshold to something meaningful, such as scroll depth or "distance from the subject".

### 1.4 Analog reproduction & tactile materiality ("Make me a copy", Texture Check)
- **Looks/feels like:** Office-photocopier greyscale, soft grain, debris, toner dropout, scanned and scrunched A4 [S3]. Canva calls it "Texture Check": glassy, waxy, translucent surfaces, with "tactile design" searches up 30% [S19]. Adobe's version is "puffy, soft, squishy" sensory surfaces [S24].
- **Techniques:** Film grain and noise (CSS or shader), paper fibre, misregistration, halftone, subtle chromatic offset, *physically plausible* light on surfaces. Fireart pushes mathematically generated CSS textures instead of heavy 3D [S20].
- **Maturity:** **RISING** in graphic design and **PEAK** as simple grain overlays on the web. Uniform grain on everything is already generic.
- **Elite execution:** Texture has to be *caused*. Grain should respond to light or exposure, and toner dropout should happen where the "copy" is reproduced. Avoid a static noise PNG over the whole page.

### 1.5 Tactile brutalism & raw structure
- **Looks/feels like:** Hard 0px corners, 1px hairlines, visible grids, zero drop shadows, deep monochrome broken by one acid accent (cyan, magenta or chartreuse), and depth from overlapping lines instead of blur [S20][S23]. Muzli cites T-KO 2.0 [S23]. StudioMeyer says "anti-grid brutalism" was an unexpected winner as the counter to bento [S10].
- **Maturity:** **PEAK moving toward OVERUSED.** The signal is Codrops, Sept 2026: *bleibtgleich'26 — "A 180° Turn From Brutalism to Minimalism."* A notable portfolio abandoned brutalism for quiet minimalism that "rewards closer exploration" [S25]. Muzli notes that calling designs "ugly" as a compliment shows saturation [S23].
- **Elite execution:** Keep the *precision* (hairlines, grid, true alignment) and drop the aggression. Structure should be visible because it carries information, not because it poses as edgy.

### 1.6 Micrographics & the aesthetics of technical information
- **Looks/feels like:** Labels, chemical diagrams, blueprints, tiny metrics, and packaging micro-type become the main event. "The aesthetics of technical information… were never meant to look good" (Brandon Wang, via It's Nice That) [S3]. Examples: Astrae Studio's grid-and-symbol systems for Nike, and Uncommon's chemistry-diagram billboards [S3]. Tubik's "Raw aesthetics: monospaced fonts, grids, wireframes", as in Crezco's blueprint-like UI [S27]. Fontfabric's "Digital Narrative" turns data and spreadsheets into visuals [S4], and Canva's "Prompt Playground" reports "data visualization animation" searches up 201% [S19].
- **Maturity:** **RISING**. This is the most "expert-coded" trend of 2026, and It's Nice That ties it to "work grounded in expertise" [S3].
- **Elite execution:** Micro-labels must be **true and live**: real coordinates, real shader parameters, real frame times and real scroll positions. They should not be lorem specs. This fits our honest-asset rule perfectly: data graphics are allowed and invented claims are not.

### 1.7 The Visual Index (specimen/collection layouts)
- **Looks/feels like:** Flattened, numbered inventories of cut-out objects, like museum drawers or type specimens. Examples: Hyejin Song's sushi-utensil layouts and From Form's Museum Night identity [S3], tied to Gen-Z "trinket revival" collecting [S3].
- **Maturity:** **RISING** in print, **rare** on the web. That is a strong opportunity.
- **Elite execution:** Treat each specimen as a live procedural object in a numbered, catalogued grid. Clicking a specimen opens it into the full-screen world, using persistent-canvas transitions (see 1.12).

### 1.8 Type as image: ultra-display, dynamic proportions, kinetic/variable type
- **Looks/feels like:** Letters stretched, broken and overlapped into graphic objects (Fontfabric "Type as an Image"). Extreme extended or condensed widths, and variable axes animated on scroll or hover [S4][S22]. Envato lists Jitter, Sofi and Museum of Money [S22]. Figma Resource Library covers kinetic lettering and variable fonts [S1].
- **Maturity:** **PEAK** for oversized sans heroes, which are now common, and **RISING** for type that is genuinely *material* (distorted by shader, fluid or physics). Note StudioMeyer's reality check: kinetic type "remained confined to demos and hero sections" because of CWV and a11y costs [S10]. Envato UX lists "bold typography as novelty" as dated in *product* UI [S5].
- **Elite execution:** One display face with real character, set at architectural scale, plus one precise mono or grotesk for micro-labels. Motion on type should come from the concept (ink, pressure, heat), not from default SplitText staggers. Honour `prefers-reduced-motion`.

### 1.9 Typographic sub-trends to pick from (Fontfabric 2026 [S4], Creative Bloq, It's Nice That [S3])
- **Italics as headline stars** (Collins' Bose, Cluny's LMA): **RISING**.
- **Reversed contrast** (thick horizontals, thin verticals; Red Antler's Fuku): **RISING**, and very fresh on the web.
- **Modern antiquas / flared serifs** (Wolff Olins' Lloyds): **PEAK**. This is the "trust" serif.
- **Historical references for tech** (blackletter for crypto, Albertus-like Roman caps for AI in Koto's Faculty): **RISING**.
- **Pick-and-mix / ransom-note lettersets** (Design Office Fun's Trobar, *Font Feelings*): **RISING** in graphic design and risky on the web.
- **Sans is still king, but details matter**: the default. Differentiation comes from terminals, spacing and proportion [S4].
- Fontfabric notes the shift "from the heritage-inspired and expressive serifs of last year toward the performative, image-based letterforms of today" [S4].

### 1.10 Blotch: fluid, living marks & motion identity
- **Looks/feels like:** Logos that melt, bleed, pour and shift, "already in motion". Examples: Cash & Carry's *Other* wine wordmark that pours, Caramba's *Wolke*, and How Bond's Allas Pool bubbles [S3]. The related "Motion visual identity" trend [S26] is logos that unfold in a way specific to the brand.
- **Maturity:** **RISING**.
- **Elite execution:** Build the wordmark as an SDF or mask that the site's shader physically acts on, so the brand mark and the world are made of the same substance.

### 1.11 Liquid Glass & refraction
- **Looks/feels like:** Apple's WWDC-25 material: refraction, specular rim, gel-like layers. It was toned down at WWDC-26 with less transparency and a user clear/tinted control [S28][S9b].
- **Techniques (web):** backdrop-filter plus SVG displacement filters (Safari limitations apply), or WebGL refraction [S9b].
- **Maturity:** **PEAK → BACKLASH.** CSS-Tricks documents contrast and legibility failures "over a bright photo" [S9b]. Tubik names **"Anti-Liquid Glass: function over visual spectacle"** as a trend in its own right (Linear kept blur and dropped refraction) [S27]. Envato UX lists glassmorphism as dated [S5]. StudioMeyer measured 15–30% FPS drops on mid-tier Android [S10].
- **Elite execution:** Do not use glass for UI chrome. If used at all, refraction belongs to **one physical object inside the WebGL world** (a lens, a drop, a specimen jar), never to cards or navigation.

### 1.12 Motion as language & persistent-canvas transitions
- **Looks/feels like:** Motion explains cause and effect rather than decorating [S5][S26b]. Examples: Dia's drop targets "gravitate" and Arc's downloads "fly" into the library [S26b]. On the site level, image planes persist across routes and morph between layouts with no "pop" (Codrops, June 2026: keep, remove and add planes that track DOM slots) [S29].
- **Techniques:** One WebGL scene whose planes track DOM rects via `getBoundingClientRect`, then detach and tween during navigation [S29]. Synchronized SplitText. View Transitions API for DOM-only states.
- **Maturity:** **PEAK** in craft circles. The persistent canvas is the current state of the art.
- **Elite execution:** A small, consistent motion vocabulary: a single custom ease family, 2–3 durations, and one signature transition used *everywhere*.

### 1.13 Native CSS motion: scroll-driven + scroll-triggered animations
- **What's new:** `animation-timeline: scroll()/view()` is cross-browser production-ready [S30]. Chrome 145 (2026) adds **scroll-*triggered*** animations (`timeline-trigger`, `animation-trigger`), which are declarative replacements for IntersectionObserver [S31]. Estimates say about 70% of decorative library animations can move to native CSS [S30].
- **Maturity:** **RISING** as an engineering practice. It is invisible to users, but it improves INP and usability scores.
- **Elite execution:** Use CSS for small reveals and progress indicators, and save GSAP/Lenis for the choreographed hero and world timeline. Juries notice when nothing jitters.

### 1.14 Sound as a design layer
- **Looks/feels like:** Ambient loops and micro-audio cues. Examples: Immersive Garden coupled audio to *camera state rather than a clock* [S7]. Santamaria applies a low-pass filter when entering project scenes, with no autoplay [S17]. Muzli: "The Sound of Design", with Ledger's brand site as an example [S23]. Directional (unverified) data puts spatial audio at 54% on an "immersive excellence index" [S6].
- **Maturity:** **RISING**, and still rare.
- **Elite execution:** Off by default with a beautiful, explicit toggle. Sound is procedurally generated by Web Audio from the same parameters as the shader, so image and sound are one instrument. Keep it quiet.

### 1.15 Calm, slow, editorial ("Opt-out era", Explorecore)
- **Looks/feels like:** Canva's **Opt-Out Era** has serif fonts, pared-back palettes and structured editorial layouts ("clean layout", "serif", "simple branding" searches up 54%). **Explorecore** has "beautifully simple layouts, interactive elements, and clean serif fonts" that encourage slower browsing [S19]. Envato UX: "calm interfaces… the end of visual theatrics" [S5]. The bleibtgleich pivot to minimalism is another example [S25].
- **Maturity:** **RISING** at the high end. Quiet is becoming the new loud.
- **Elite execution:** Large amounts of negative space, a small palette, long pacing between beats, and one spectacular moment rather than twenty. This is the answer to "god-tier without slop".

### 1.16 Surreal / liminal ("Reality Warp")
- **Looks/feels like:** Dreamlike, uncanny compositions that blur real and synthetic. Canva reports "liminal" and "uncanny" searches up 220% [S19]. Codrops' 2025 review lists "liminal 3D environments" as a recurring aesthetic [S21]. Adobe: surreal scale shifts and easter eggs [S24].
- **Maturity:** **RISING**, though the AI-image version of surreal is already slop.
- **Elite execution:** Surreal through *procedural geometry and impossible light*, not generated imagery. Pair it with rigorous Swiss micro-typography so the dream reads as intentional.

### 1.17 Presence, play & multiplayer
- **Looks/feels like:** Sites that behave like tiny games or shared rooms. Messenger shows other players and lets them emote [S16]. bleibtgleich'26 shows live multiplayer cursors over WebSockets [S25]. Figma's list includes gamified design [S1]. Envato UX says product-UI gamification is fading [S5].
- **Maturity:** **RISING** for *presence* and **OVERUSED** for badges and points gamification.
- **Elite execution:** A single toy-like interaction with real physics or simulation (the "fidget"), which people keep playing with and share. No points systems.

### 1.18 Authorship signals & anti-slop ("Crafted, not prompted")
- **Looks/feels like:** Visible process, hand-made marks, colophons that credit tools and methods [S27][S22]. Crossglobe cites 61% of marketers saying brand taste and point of view matter more than ever [S32]. The slop fingerprint is well documented: purple→blue gradients, gray 1px borders on every card, Inter headlines, three feature cards in a row, and dark mode by default [S32].
- **Maturity:** **RISING** (as an attitude).
- **Elite execution:** A real **colophon** that lists the shaders, techniques, fonts and frame budget. It is honest and technical, and it is a flex for the jury.

### 1.19 Machine Experience (MX) & semantic foundations
- **What:** Semantic HTML, heading hierarchy, schema, `llms.txt`, and AI readability [S20][S23][S10]. StudioMeyer calls AI readability layers an "unexpected winner" [S10].
- **Maturity:** **RISING** and invisible, but cheap to do. The WebGL world should sit over a *complete* semantic document.

### 1.20 Color: dopamine vs. monochrome-plus-one
- The sources disagree. Figma, Envato Web and Muzli push saturated "dopamine" palettes and "Goodbye beige" [S1][S22][S23]. Fireart pushes cyber-monochrome with one acid accent [S20]. Canva's Opt-Out Era and Explorecore push pared-back palettes [S19]. SOTY winners use tiny palettes: Messenger uses two colors, #81BFBC and #C9D5C3 [S16], and Lando Norris uses two [S15].
- **Reading:** At the top, **the palette is small and owned.** Use one or two brand-specific hues that come from the concept, never the generic neon-on-black.

---

## 2. "Dated in 2026" — avoid or subvert

**Layout & components**
- Bento grids as the marketing-page skeleton. They held up in product UI [S10] and read as template on an art site [S20].
- Three feature cards in a row, with an icon, title and two lines each [S32].
- Gray 1px bordered cards everywhere, pill toggles, pastel gradients masking structure [S27][S32].
- Full-bleed hero photo or video with overlay text. Directionally under 12% and under 8% of 2026 winners respectively [S6], but cinematic heroes still appear in mid-market roundups [S26].
- Logo marquees, testimonial carousels, and "trusted by" strips (these also break our honest-asset rules).
- Horizontal-scroll galleries used as a default "wow" section (mixed scroll direction is now a listicle trend [S26]).

**Visual effects**
- Purple→blue/indigo gradients, aurora/mesh-gradient backgrounds, "AI sparkle" iconography [S32].
- Glassmorphism/Liquid-Glass UI cards and nav bars [S5][S27][S10].
- Neumorphism (still listed by Figma [S1], but dated to any jury).
- Organic blob shapes and the generic Spline blob or spinning 3D logo ("3D to demonstrate capability" [S22][S10]).
- Uniform film grain PNG over everything. Neon-glow-on-black "cyber" dark mode.
- Dithering/ASCII applied without a concept. It is now a preset [S18].
- Y2K chrome, retrofuturist pixel art [S1]. Metaverse and NFT-coded 3D ("the audience that cared has moved on") [S9].

**Motion clichés**
- Blend-mode-difference cursor circle that follows the mouse. Magnetic buttons on every CTA. "Creative cursors" are listed as dated by Envato UX [S5].
- SplitText word-stagger on every heading, 0→100% counter preloaders, text-scramble on every hover.
- Decorative parallax and bouncing micro-interactions [S27].
- Locomotive Scroll (Lenis replaced it [S9]). Desktop-only scroll experiences [S9].
- Inescapable animation with no reduced-motion path [S27].

**Typography**
- Inter/Geist-by-default headlines [S32]. Generic oversized neo-grotesk hero plus a tiny paragraph plus a CTA (the Framer-template hero).
- Last year's heritage serif moment is ageing into "performative, image-based letterforms" [S4].

---

## 3. Five ahead-of-the-curve syntheses (fresh to a 2026 jury)

Each synthesis combines a **rising** trend with a **peak** execution vehicle and deliberately excludes the overused layer. All five are achievable with our stack (R3F + custom GLSL + GSAP + Lenis) and our honest-asset rules. None needs generated imagery.

### A. "The Specimen Cabinet": Visual Index × Micrographics × Procedural Organisms
A numbered, museum-drawer index of **procedural specimens** (1.7). Each is a live shader or SDF organism, catalogued with **true, live micrographics** (1.6) showing its seed, parameters, vertex count and frame time. Choosing a specimen triggers a **persistent-canvas transition** (1.12), and it grows into the full-screen world. The editorial pacing is calm (1.15), with hairline structure but no brutalist aggression (1.5).
*Why it's fresh:* the Visual Index is barely used on the web, and live, truthful tech labels answer "crafted, not prompted" (1.18). *Risk:* it can feel cold, so it needs one warm, tactile hero moment.

### B. "Analog Signal on a GPU": Photocopy Materiality × Real-time Shaders, in light mode
Render **print reproduction** in real time (1.4 + 1.3): toner dropout, halftone rosettes, misregistration, paper fibre, and a Xerox light sweep that *physically scans* the content as you scroll. Use a warm paper-white ground instead of neon-on-black, with ink-black type and one owned accent.
*Why it's fresh:* dithering and CRT are tired in dark mode. The *photocopier* (It's Nice That's "Make me a copy" [S3]) is the 2026 analog reference, and nobody has done it as a live GPU material. It also sits in Canva's Opt-Out and Explorecore direction [S19].

### C. "The Living Letter": Blotch × Type-as-Image × Shader Physics
The **wordmark is the protagonist** (1.10 + 1.8). A reversed-contrast or italic display face (1.9) is converted to an SDF and inhabited by the site's substance (ink, liquid, heat). It bleeds, pools and re-forms as you scroll or touch. Micro-typography stays surgically precise around it. Web Audio is derived from the same field parameters (1.14).
*Why it's fresh:* motion identity and blotch logos are rising in branding [S3][S26], but they rarely become a GPU-native, interactive mark. *Risk:* legibility. The mark must settle into a readable state at rest and under reduced motion.

### D. "Slow Cinema": One Persistent Place × Explorecore Calm × Camera-coupled Sound
A single continuous world traversed by scroll (1.1). It is lit mostly by **shadow and one light source** (after *Artisans d'Idées* [S7]), and paced like a film with long holds, snap chapters (1.1) and serif editorial captions (1.15). Sound is off by default and, when enabled, follows camera state through a low-pass filter as depth increases (1.14).
*Why it's fresh:* it swaps the maximal WebGL "demo reel" for restraint and atmosphere, which is where juries' "creativity" and "content" scores converge [S6][S17]. *Risk:* this is the heaviest option for performance and mobile, and it needs strict device tiers.

### E. "Precise Dream": Liminal Surrealism × Swiss Instrumentation
Impossible, dreamlike procedural scenes (1.16): an infinite room, a horizon that folds, an object with the wrong scale. These are annotated with the rigor of a **scientific instrument** (1.6): coordinates, measurements, calibration marks and a live readout of the dream's physics. Include one toy-like interaction worth sharing (1.17).
*Why it's fresh:* surreal and liminal is rising (+220% [S19]), but the AI-image version is slop. Making it *procedural and measured* is the anti-slop form.

**Researcher's recommendation to the concept team:** the strongest risk-to-reward route is **B or C as the visual core, with A's live-micrographic system as the typographic and information layer.** This combination:
1. leans on RISING trends (photocopy materiality, micrographics, blotch, reversed contrast and italics),
2. makes the GPU serve an idea rather than an effect,
3. keeps page weight small, since shaders cost almost nothing next to GLB and texture budgets, and so fits the Apple Silicon target and degrades cleanly to a static poster frame,
4. turns the honest-asset rules (no fake logos or testimonials) into a *feature*, because live truthful data and a colophon become the "proof".
D is the most jury-bait but also the most schedule risk for a ~6h build.

---

## 4. Source list

Fetched and read in full (WebFetch):
- [S1] Figma — *Top Web Design Trends for 2026*: https://www.figma.com/resource-library/web-design-trends/
- [S3] It's Nice That — *The graphic trends you'll want to bookmark for 2026*: https://www.itsnicethat.com/features/forward-thinking-graphic-trends-2026-graphic-design-120126
- [S4] Fontfabric — *Top 10 Typography Trends for 2026*: https://www.fontfabric.com/blog/top-typography-trends-for-2026/
- [S5] Envato — *UX/UI design trends for 2026: calm interfaces, transparent AI and the end of visual theatrics*: https://elements.envato.com/learn/ux-ui-design-trends
- [S6] Digital Strategy Force — *Why Are Immersive Experiences Dominating the 2026 Awwwards?* (statistics unverified; directional): https://digitalstrategyforce.com/journal/why-are-immersive-experiences-dominating-the-2026-awwwards/
- [S7] Codrops — WebGPU hub (Artisans d'Idées / Immersive Garden reference) via search: https://tympanus.net/codrops/hub/tag/webgpu/
- [S8] Figma Blog — *Config 2026: New Materials, New Tools and a More Expressive Canvas*: https://www.figma.com/blog/config-2026-recap/
- [S9] Svilenković — *Scrollytelling Trends 2026*: https://svilenkovic.com/3d/scrollytelling-trends-2026
- [S9b] CSS-Tricks — *Getting Clarity on Apple's Liquid Glass*: https://css-tricks.com/getting-clarity-on-apples-liquid-glass/
- [S10] StudioMeyer — *Web Design Trends 2026: What Actually Held Up After Six Months*: https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check
- [S11] Utsubo — *What's New in Three.js (2026): WebGPU, New Workflows & Beyond*: https://www.utsubo.com/blog/threejs-2026-what-changed
- [S12] Codrops — *Efecto: Building Real-Time ASCII and Dithering Effects with WebGL Shaders* (Jan 2026): https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/
- [S13] Awwwards — "Mid-Year Digital Trends Report" (turned out to be a 2022 SOTD; discarded as evidence): https://www.awwwards.com/sites/mid-year-digital-trends-report
- [S14] Awwwards — *Sites of the Year*: https://www.awwwards.com/websites/sites_of_the_year/
- [S15] Codrops — *Creativity at Enterprise-Scale, Without Compromise: The OFF+BRAND. Story* (Aug 2026): https://tympanus.net/codrops/2026/08/17/creativity-at-enterprise-scale-without-compromise-the-offbrand-story/
- [S16] Awwwards — *Messenger* (abeto) SOTD page: https://www.awwwards.com/sites/messenger
- [S17] Codrops — *More Than a Portfolio: Building a Scroll-Driven 3D World with Something to Say* (Apr 2026): https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/
- [S18] Codrops — *WebGL for Designers: Creating Interactive, Shader-Driven Graphics Directly in the Browser* (Unicorn Studio, Mar 2026): https://tympanus.net/codrops/2026/03/04/webgl-for-designers-creating-interactive-shader-driven-graphics-directly-in-the-browser/
- [S19] Canva Newsroom — *'Imperfect by Design': The visual design trends set to define 2026*: https://www.canva.com/newsroom/news/design-trends-2026/
- [S20] Fireart Studio — *Web Design Trends 2026: Tactile Brutalism & Invisible Architecture*: https://fireart.studio/blog/the-best-web-design-trends/
- [S21] Codrops — *2025: A Very Special Year in Review*: https://tympanus.net/codrops/2025/12/29/2025-a-very-special-year-in-review/
- [S22] Envato — *Web design trends for 2026: kinetic type, broken grids and the return of visual personality*: https://elements.envato.com/learn/web-design-trends
- [S23] Muzli — *Web Design Trends 2026*: https://muz.li/blog/web-design-trends-2026/
- [S24] Adobe Express — *Top 10 graphic design trends for 2026*: https://www.adobe.com/express/learn/blog/design-trends-2026
- [S25] Codrops — *bleibtgleich'26: A 180° Turn From Brutalism to Minimalism* (Sept 2026): https://tympanus.net/codrops/2026/09/23/bleibtgleich26-a-180-turn-from-brutalism-to-minimalism/
- [S26] Really Good Designs — *Top 10 Web Design Trends 2026*: https://reallygooddesigns.com/web-design-trends-2026/
- [S27] Tubik Studio — *What's Next: 7 UI Design Trends of 2026*: https://tubikstudio.com/blog/ui-design-trends-2026/
- [S26b] Pixelmatters — *7 UI design trends to watch in 2026*: https://www.pixelmatters.com/insights/7-UI-design-trends-to-watch-in-2026
- [S29] Codrops — *Building Persistent Page Transitions with WebGPU and Vanilla JavaScript* (June 2026): https://tympanus.net/codrops/2026/06/30/building-persistent-page-transitions-with-webgpu-and-vanilla-javascript/
- [S31] Chrome for Developers — *CSS scroll-triggered animations are coming!* (Dec 2025): https://developer.chrome.com/blog/scroll-triggered-animations

Search-result evidence (not fetched in full, or fetch failed):
- [S2] Webflow Blog — *8 web design trends to watch in 2026* (fetch failed: header overflow): https://webflow.com/blog/web-design-trends-2026
- [S28] Wikipedia — *Liquid Glass* (WWDC-26 revamp, transparency control): https://en.wikipedia.org/wiki/Liquid_Glass
- [S30] Frontend Horizon — *View Transitions API and CSS Scroll-Driven Animations: The Browser Wins of 2026*: https://www.frontendhorizon.com/blog/view-transitions-api-and-css-scroll-driven-animations-the-browser-wins-of-2026 · Mintec: https://mintec.co/blog/scroll-driven-view-transitions-css-2026/
- [S32] Crossglobe — *The Anti-AI-Slop Trend* (stats) and VibeCodeKit — *AI Slop Design* (slop fingerprint): https://crossglobemarketing.com/blogs/anti-ai-slop-human-centered-design-trends-2026/ · https://vibecodekit.dev/ai-slop-design
- Creative Bloq — typography and graphic trends 2026 (fetch returned nav only): https://www.creativebloq.com/design/fonts-typography/breaking-rules-and-bringing-joy-top-typography-trends-for-2026 · https://www.creativebloq.com/design/graphic-design/texture-warmth-and-tactile-rebellion-the-big-graphic-design-trends-for-2026
- OFF+BRAND — Lando Norris case study: https://www.itsoffbrand.com/our-work/lando-norris
- Awwwards — August 2026 SOTDs (Where the Shadow Fell, The Watch, MIU MIU, Lama Lama SOTM): https://www.awwwards.com/websites/sites_of_the_day/
- Codrops — *Exploring Procedural Geometry with Three.js and WebGPU* (Aug 2026): https://tympanus.net/codrops/2026/08/11/exploring-procedural-geometry-with-three-js-and-webgpu/
- Behance *Design Trends 2026* and UX Collective *experience design trends 2026* (both 403 on fetch): https://www.behance.net/gallery/239027109/Design-Trends-2026 · https://uxdesign.cc/the-most-popular-experience-design-trends-of-2026-3ca85c8a3e3d
