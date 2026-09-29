# 02 — Research: What Award Winners Actually Do (2025–2026)

**Role:** design critic / award analyst
**Date:** 2026-09-29
**Purpose:** Pull high-level principles from recent Awwwards / CSSDA / FWA winners and studio case studies so our single landing page can clear the Site-of-the-Day bar and aim at Site-of-the-Year. **This is not a copy list.** Nothing below should be reproduced literally: no layouts, signature mechanics, palettes, or copy. Use it to set the bar, the pacing and the level of craft.

> **How reliable the sources are.** Scores, tags, palettes and dates come from each site's Awwwards page (primary). Tech stacks and quotes come from the official case studies on Awwwards, Codrops, Lusion's blog, or the studio's own site (primary). A few points come from secondary commentary: hontran.dev, utsubo.com and webgpu.com showcase pages. Those are marked *(secondary)*. Most winners do not publish their font names, so where a font is not documented I say so instead of guessing.

---

## 0. The scoreboard (context)

**Awwwards Annual Awards 2025** ([winners](https://www.awwwards.com/annual-awards/winners), [SOTY list](https://www.awwwards.com/websites/sites_of_the_year/))

| Category | Winner | Studio |
|---|---|---|
| Site of the Year 2025 (+ Users' Choice) | Lando Norris | OFF+BRAND |
| Developer Site of the Year 2025 | Messenger | abeto |
| E-commerce of the Year 2025 | Scout Motors | Locomotive |
| Agency of the Year | Immersive Garden | — |
| Studio of the Year | Malvah | — |
| Independent of the Year | Louis Paquet | — |
| (2024 SOTY + Dev SOTY, for reference) | Igloo Inc | abeto (with Bureaux) |

**Awwwards Sites of the Month, Jan 2025 → Aug 2026** ([source](https://www.awwwards.com/websites/sites_of_the_month/))
Immersive Garden site (Jan '25) · Dropbox Brand / Daybreak (Feb) · Siena Film Foundation / Niccolò Miranda (Mar) · Navigate / Resn (Apr) · Anime.js / Julian Garnier (May) · Montfort / Immersive Garden (Jun) · Tracing Art / Resn (Jul) · Cartier Watches & Wonders 2025 / Immersive Garden (Aug) · Terminal Industries / REJOUICE (Sep) · Ponpon Mania / Patrick Heng (Oct) · MindMarket / Louis Paquet (Dec) · Bruno's Portfolio / Bruno Simon (Jan '26) · The Renaissance Edition / Shopify Design (Feb) · GQ & AP The Extraordinary Lab / Immersive Garden (Mar) · Oryzo AI / Lusion (Apr) · Floema / Bürocratik (May) · Son Daven / The First The Last (Jun) · Lama Lama (Jul) · ERA Residence / The First The Last (Aug). Every one of them also took the Developer Award.

**CSS Design Awards — Website of the Year 2025** ([source](https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/)): 1. Dropbox Brand / Daybreak (9.03) · 2. The Symphony of Vines / Unseen Studio (8.88) · 3. Charles Leclerc / Apart & Uprising (8.85). Best UI: Exat Typeface / Studio Size & RISE2. Best UX: Dropbox Brand. Best Innovation: Merouane Bali. Best Portfolio: Bruno's Portfolio. Best Agency: We are Büro.

**How Awwwards scores** ([evaluation](https://www.awwwards.com/about-evaluation/)): Design 40%, Usability 30%, Creativity 20%, Content 10%. Every SOTD also goes to a developer jury, and the Developer Award needs a score above 7. The developer sub-scores are Semantics/SEO, Animations/Transitions, Accessibility, WPO (web performance), Responsive and Markup. Those sub-scores are shown on each site's page.

**The scores reveal a pattern.** Across the winners below, **Creativity is almost always the highest sub-score and Usability the lowest.** Examples: Lando Norris C 8.71 / U 7.90; Symphony of Vines C 7.95 / U 6.90; Oryzo C 8.35 / U 7.51. On the developer side, **Animations/Transitions scores highest (8.6–9.4) and Accessibility lowest (≈7.0).** Usability carries 30% of the score. Winners are mostly held back by usability and accessibility, not by a lack of spectacle, so that is where cheap points are. A spectacular site that is also clearly navigable, fast and accessible beats the field.

---

## 1. Site dossiers (17 sites)

Format for each site: URL · core idea · hero moment · signature interaction · technique · type · color · **why it won**.

### 1. Lando Norris — OFF+BRAND · Awwwards Site of the Year 2025
- **URL:** https://landonorris.com · [Awwwards](https://www.awwwards.com/sites/lando-norris) · [case study](https://www.itsoffbrand.com/our-work/lando-norris)
- **Core idea:** A driver's personal "digital home" with two sides, elite athlete and relatable person.
- **Hero moment:** Scroll-driven cinematics built around 3D helmet rotation. A "Helmets Hall of Fame" lets you inspect his helmet designs in 3D *(secondary: [webgpu.com](https://www.webgpu.com/showcase/mclaren-f1-driver-lando-norris-official-website/))*.
- **Signature interaction:** Speed-inspired scroll momentum. Rive-driven motion graphics layered over WebGL.
- **Technique:** WebGL + GSAP + Rive, built on Webflow. Lazy-loading and optimized asset delivery keep a visually dense site fast.
- **Type / color:** Bold display type. The palette is essentially two colors: **#D2FF00 lime on #111112 near-black**.
- **Scores:** 8.18 overall (D 8.12 / U 7.9 / C 8.71 / Ct 8.18). Dev: Animations 8.6, Accessibility 7.0.
- **Why it won:** One brand-true object (the helmet) is the 3D hero. It isn't abstract 3D decoration. The site sticks to a relentless two-color system with one electric accent, and its motion vocabulary ("speed") comes from the subject itself. It is also full of real content: career stats, media, a store.

### 2. Messenger — abeto · Developer Site of the Year 2025
- **URL:** https://messenger.abeto.co · [Awwwards](https://www.awwwards.com/sites/messenger)
- **Core idea:** A tiny cel-shaded planet in the browser where you deliver mail. It's a calm world that feels "a little bit weird" ([80.lv](https://80.lv/articles/deliver-mail-on-tiny-colorful-planet-in-this-relaxing-web-game)).
- **Hero moment:** Seeing the whole spherical world at once. You can walk off in any direction and arrive back where you started.
- **Signature interaction:** Light multiplayer. You see other players and talk only through emoji (WebSockets).
- **Technique:** Three.js + three-mesh-bvh for collisions. Houdini/Blender models, Substance textures, a Node WebSocket server.
- **Color:** Soft teal **#81BFBC** and pale greige **#C9D5C3**. Low-contrast and calm; never shouts.
- **Scores:** 7.92 (Dev 8.21).
- **Why it won:** A complete, coherent world. The mood is strong (tranquil + odd), the stylization is controlled (cel-shading instead of chasing realism), and the social layer is small and humane. It rewards staying on the page.

### 3. Igloo Inc — abeto × Bureaux · Site of the Year + Dev SOTY 2024
- **URL:** https://igloo.inc · [case study](https://www.awwwards.com/igloo-inc-case-study.html)
- **Core idea:** A corporate landing page for a holding company, told through ice.
- **Hero moment:** An intro rendered in real time, not a video, that sets a "future-forward" tone and flows seamlessly into the main experience.
- **Signature interaction:** Each portfolio project is encased in a unique ice block grown by a custom crystal-growth algorithm. A particle simulation re-forms into shapes per link, and its color is driven by particle speed.
- **Technique:** The *entire UI is rendered in WebGL*. Text glitches and scrambles swap SDF (signed-distance-field) texture offsets instead of re-laying out the DOM. Volume data went from VDB to a custom compressed format smaller than a typical image. Scene transitions use chromatic aberration, "tech displacement" and frost. Stack: Three.js, Svelte, GSAP, Houdini, Blender. Performance was measured on low-end devices throughout development.
- **Sound:** Music and SFX are synced to particle movement: "playful and satisfying".
- **Why it won:** One material metaphor (ice/crystal) runs through the hero, the navigation, the transitions and even the text effects. Everything is procedural, so it is lightweight and consistent. Quote: *"Iterating directly in the browser makes it easier to explore options and prototype effects, often leading to better results."*

### 4. Oryzo AI — Lusion · Site of the Month April 2026
- **URL:** https://oryzo.ai · [Awwwards](https://www.awwwards.com/sites/oryzo-ai) · BTS [part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics), [part 3](https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations)
- **Core idea:** A satirical "AI-era product launch" for a cork coaster. Premium craft is applied to an ordinary object. It is openly a fictional self-initiated piece: "five minutes of your life gloriously wasted for a nerdy laugh."
- **Hero moment:** A warm, calm "creative work desk" scene with the product in the center.
- **Signature interaction:** 3D → 2D → 3D transitions, WebGL sketch interactions, and interactive particles in the footer.
- **Technique:** Three.js + GSAP. A hybrid of Gaussian splats (for reflective props) and texture mapping ("One Trick Pony Does Not Work"). About 90% of the texture detail goes into the central 50% of the frame, where the camera looks most. Real cork bark was photographed for photogrammetry.
- **Type / color:** *"Around 99 percent of the type on the site is set in a single family."* The palette is **four values: cream, near-black, muted olive, orange** (Awwwards lists #100904 / #FF8539).
- **Design principles (their words):** "A realistic image. The product at the centre. Seamless transitions. Humour." / *"Design cannot constantly ask for attention. Its job is to support the content, not compete with it."* / *"the challenge is often not adding more, but knowing when to stop."*
- **Why it won:** A concept with wit, a single hero object, extreme typographic and color restraint, and technical ambition that stays invisible.

### 5. The Renaissance Edition — Shopify Design · SOTM Feb 2026
- **URL:** [Awwwards](https://www.awwwards.com/sites/the-renaissance-edition)
- **Core idea:** A product-release showcase of 150+ updates, framed as "a mashup of generative paintings with elements of modern commerce."
- **Hero moment:** A hero transition plus an intro animation. Juries also called out a "Hidden Layer" and the **404 page**.
- **Technique:** WebGL + Blender. **Animations/Transitions scored 9.40.**
- **Color:** Two values, **#F7F7EE cream and #292919 olive-charcoal**.
- **Scores:** 7.92 (Dev 8.05).
- **Why it won:** A strong art-historical metaphor applied to dry content, with transitions polished to near-perfect scores. Juries noticed the hidden layer and the 404, which shows that edges and easter eggs count.

### 6. GQ × Audemars Piguet — The Extraordinary Lab — Immersive Garden · SOTM Mar 2026
- **URL:** https://www.gq.com/sponsored/story/the-extraordinary-lab · [case study](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html)
- **Core idea:** A watch told as a continuous cinematic timeline built around a recorded conversation, "not a traditional luxury campaign website or a classic product showcase."
- **Signature interaction:** Scroll/drag scrubs the camera, the scene *and the dialogue* together. Audio fades and pauses intelligently so fast scrubbing doesn't produce chipmunk speech.
- **Technique:** Three.js, Theatre.js, GSAP, Blender PBR, custom shaders, planar reflections, parallax mapping. **Targeted 60 fps on iPhone 11/12**, with optimization planned from day one.
- **Color:** Dark, precise, "slightly electric": futuristic without sci-fi clichés.
- **Why it won:** Sound is treated as an interaction layer, not a background track. Quote: *"technology disappears behind rhythm, atmosphere, interaction, storytelling, and emotion."*

### 7. Cartier Watches & Wonders 2025 — Immersive Garden · SOTM Aug 2025
- **URL:** [Awwwards](https://www.awwwards.com/sites/cartier-watches-wonders-2025) · [case study](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html)
- **Core idea:** The physical pavilion turned into six intimate digital "alcoves," one per watch.
- **Signature interaction:** **Hidden gestures.** Each alcove "responds to hidden gestures, giving users the sense that the scene opens up as they engage with it."
- **Technique:** Three.js, GSAP, Lenis, Blender. A Web Audio score by Mooders serves as a narrative layer.
- **Why it won:** Chapters are self-contained worlds with a "rhythm of discovery". Quiet contemplation is rewarded with secrets. The luxury feel comes from intimacy and slowness, not from spectacle.

### 8. The Symphony of Vines — Unseen Studio · CSSDA WOTY #2 2025
- **URL:** https://symphonyofvines.unseen.co · [Awwwards](https://www.awwwards.com/sites/the-symphony-of-vines)
- **Core idea:** An interactive cinematic journey through millennia of geology that made a Bordeaux terroir.
- **Signature interaction:** Almost every chapter has a *physical* mouse interaction: interactive rivers, deforming terrain, river formation, waves and soil, an interactive title.
- **Technique:** Three.js, Cinema 4D, sound/audio.
- **Color:** Warm tan **#D5B08C** on black.
- **Scores:** 7.43. **Usability 6.9** (lowest), Creativity 7.95.
- **Why it won / lesson:** A spectacular elemental narrative with tactile interaction in every chapter. The usability score shows the cost of a cinematic-only flow. Keep navigation escape hatches.

### 9. Dropbox Brand — Daybreak Studio · CSSDA WOTY #1 2025, Awwwards SOTM Feb 2025
- **URL:** [case study](https://www.awwwards.com/case-study-dropbox-brand-guidelines.html) · [Rive blog](https://rive.app/blog/dropbox-launches-interactive-brand-guidelines-site-using-rive)
- **Core idea:** Brand guidelines as "a floor that anyone could build from" instead of a rulebook.
- **Signature interaction:** A variable-type explorer, an icon "slot machine", and a paper-plane flight editor.
- **Craft details (these are what won it):** Color chips use non-linear easing on a custom grid that prevents hover collisions. The type widget uses binary search to sync variable-font axes. Menu tabs stretch using *quartic regression* for squash-and-stretch. A button's color transition is **timed to human pupil dilation**. **200+ tracked QA issues** were logged just for animation timing.
- **Technique:** Webflow + custom JS + Rive.
- **Why it won:** Craft at the micro level. Every hover is a designed moment. Quote: *"The brand came not in strict rules, but the spaces between them, in moments of looseness and discovery."*

### 10. Siena Film Foundation — Niccolò Miranda · SOTM Mar 2025
- **URL:** https://siena.film · [case study](https://www.awwwards.com/siena-film-foundation-case-study.html)
- **Core idea:** Cinema expressed through a neo-romanesque Tuscan architectural language and "grotesque" art direction.
- **Hero moment:** A WebGL filmstrip slider with vintage poster typography and subtle parallax.
- **Signature interaction:** A menu modeled on a cinema ticket (local + global nav). Looping rollovers inspired by old lettering. **Post-processing blur whose direction and strength follow interaction speed** (horizontal on the work page, vertical on home). A Poster mode / Footage mode toggle.
- **Loader:** Dynamic stripes from the Tuscan motif that flow into the content.
- **Technique:** Three.js, GSAP, Lenis, Webflow, GPU texture compression, channel packing.
- **Why it won:** A culturally specific visual source, rather than "generic cinematic," applied consistently from the loader to the hover states. Quote: *"Creativity should elevate the user experience, never weigh it down."*

### 11. Tracing Art — Resn × Getty · SOTM Jul 2025
- **URL:** https://www.getty.edu/tracingart/ · [case study](https://www.awwwards.com/tracing-art.html)
- **Core idea:** 12 million provenance records turned into "interconnected constellations of cultural movement."
- **Hero moment:** A sphere of hundreds of artwork images rendered as a Three.js particle system.
- **Signature interaction:** A three-chapter continuous narrative. A **vertical progress bar that expands into a chapter menu**, so you always have context without breaking the flow.
- **Technique:** GSAP ScrollTrigger, Lenis, Three.js. Pipeline: Sharp for WebP, toktx for KTX2 GPU textures.
- **Why it won:** Data made emotional. The navigation is honest and always available. A chapter structure paces the story.

### 12. Ponpon Mania — Patrick Heng × Justine Soulié · SOTM Oct 2025
- **URL:** https://ponpon-mania.com · [case study](https://www.awwwards.com/ponpon-mania-a-comic-that-breathes-through-web-interaction.html)
- **Core idea:** A web comic that "breathes": a sheep who wants to be a DJ.
- **Hero moment:** **Color bursts into a mostly black-and-white world** when the character enters his dream, so color works as a narrative device.
- **Signature interaction:** Navigation modeled on a music player (chapters are albums, panels are tracks). Matter.js physics on 2D illustration.
- **Technique:** OGL, Nuxt, GSAP, Matter.js, Lenis, texture atlases. Tweakpane was used to tune shader values live, saved to JSON.
- **Why it won:** A metaphor-consistent UI (the whole navigation speaks the story's language) and color used with restraint and intention. Minimal 3D; the craft is in the feel.

### 13. MindMarket — Louis Paquet · SOTM Dec 2025 (Louis Paquet = Independent of the Year 2025)
- **URL:** [case study](https://www.awwwards.com/mindmarket-case-study.html)
- **Core idea:** A qualitative-research firm that should *feel* human understanding rather than explain it with data.
- **Hero moment:** **A single thread drawn on scroll** (three layered SVG paths: main, secondary, shadow) that acts as the narrative spine of the page.
- **Technique:** Astro, GSAP DrawSVG, Rive micro-illustrations triggered on viewport entry, custom GSAP eases.
- **Why it won:** One graphic device carries the whole page. No WebGL is needed to win SOTM. Quote: *"The technology never competes with the message. It supports it quietly, confidently, and consistently."*

### 14. Bruno's Portfolio (2026) — Bruno Simon · SOTM Jan 2026, CSSDA Best Portfolio 2025
- **URL:** https://bruno-simon.com · [case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- **Core idea:** Drive a little car around an island that holds the portfolio.
- **Signature interaction:** Shared-world features: a daily-reset circuit leaderboard, moderated "whispers" (player messages), global counters. Input by gamepad, touch, keyboard or mouse.
- **Technique:** Three.js **TSL → WebGPU with automatic WebGL fallback**. 78,400 single-triangle grass blades. ETC1S/UASTC + Draco compression. Mobile presets turn off DOF and lower shadow resolution.
- **Sound:** Commissioned score, spatialized object sounds. *"Sound is one of the most powerful ways to convey emotion."*
- **Why it won:** Immediate agency with a sense of play. Performance is treated as a creative constraint (*"Performance is the real constraint on creativity."*), and quality tiers are built in.

### 15. Terminal Industries — REJOUICE × PROPAGANDE · SOTM Sep 2025
- **URL:** https://terminal-industries.com · [Awwwards](https://www.awwwards.com/sites/terminal-industries)
- **Core idea:** An enterprise B2B brand launch (a yard operating system) staged as a high-impact product story.
- **Technique:** Vue/Nuxt + CSS-driven animation on Vercel. **Dev: Animations 8.8, WPO 8.2.** It won without heavy WebGL.
- **Why it won:** It proves "boring" B2B content can win SOTM through bold brand, scroll storytelling and fast, very well-choreographed CSS/JS motion.

### 16. Exat Typeface microsite — Studio Size × RISE2 · CSSDA Best UI 2025
- **URL:** https://exat.hottype.co · [Awwwards](https://www.awwwards.com/sites/exat-typeface) · [Abduzeedo](https://abduzeedo.com/exat-variable-font-microsite)
- **Core idea:** A type specimen as a living system.
- **Signature interaction:** Scroll position *is* state. Hovering a style name morphs the specimen live across weight and width axes.
- **Technique:** GSAP, ScrollTrigger, Lenis.
- **Why it won:** Typography alone, choreographed with precision, can carry an award-level site. It's a reminder that type is our cheapest and highest-leverage asset.

### 17. Floema — Bürocratik · SOTM May 2026
- **URL:** [Awwwards](https://www.awwwards.com/sites/floema)
- **Core idea:** Sustainable urban furniture. The site serves two audiences at once: a B2B catalogue and an emotional nature narrative.
- **Signature interaction:** Scroll-driven video zoom, a 3D material you rotate with the mouse, and a refined menu/search interaction.
- **Technique:** Nuxt, GSAP, WebGL. Palette: pale yellow **#E9E778** on **#241F21**.
- **Why it won:** Emotion and utility live together. Juries listed the *menu and search* among the highlights, so functional UI polish is judged too.

**Also noted (brief):**
- **Scout Motors** (Locomotive, E-commerce of the Year 2025) shows heritage storytelling married to commerce ([Locomotive](https://locomotive.ca/en/work/scout-motors)).
- **Charles Leclerc** (Apart/Uprising, CSSDA WOTY #3) is a personal-brand site as ecosystem hub ([Awwwards](https://www.awwwards.com/sites/charles-leclerc)).
- **Montfort** and the **Immersive Garden site**: bas-relief 3D, Roman-numeral nav anchors, and a "Backstage" section that shows process and easter eggs ([case study](https://www.awwwards.com/case-study-immersive-gardens-new-website.html)).
- **Vercel vgpu prism** (Codrops, Sep 2026) is a hero that "prioritized balancing performance and perception". It uses adaptive quality driven by GPU tier, **battery level (<30% unplugged)** and a live FPS monitor ([Codrops](https://tympanus.net/codrops/2026/09/03/from-rays-to-meshes-building-vercels-prism-with-vgpu/)).
- **Shopify Spring '26 "Everywhere"** runs WebGL atmosphere under DOM content. Scroll uniforms bypass React. Only the active and neighbouring scenes are mounted. DPR is clamped per tier. *"High-end browser work is mostly pipeline work"* ([Codrops](https://tympanus.net/codrops/2026/06/26/engineering-the-web-experience-behind-shopifys-spring-26-edition-everywhere/)).
- **Shader.se** uses scroll-driven multi-scene FBO chaining (each scene renders into a texture passed to the next) and a single compose pass for grain, CA and bloom. It skips off-screen scenes entirely: *"Most of the time goes into finding an idea that feels specific, then tuning animations and transitions until they have the right weight, timing, and personality"* ([Codrops](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)).
- **Utsubo / Vectr** (FWA of the Day, Jun 2026) runs a WebGPU hero in an OffscreenCanvas worker with capability detection and a WebGL fallback. The 3D payload was cut by 80–95%, reaching Lighthouse 94 ([Utsubo](https://www.utsubo.com/blog/vectr-ai-startup-branding-case-study)).
- **Studio Freight (Darkroom)** calls its ethos "brutal elegance": *"dropping good ideas for one great one"* ([Codrops](https://tympanus.net/codrops/2026/07/29/studio-freight-moving-missions-forward/)).
- **Obys**: *"You can break the grid only if you understand it. You can distort typography only if you respect it."* and *"Freedom without structure is noise."* ([Codrops](https://tympanus.net/codrops/2026/03/06/obys-the-small-studio-designing-big-digital-narratives/)).

---

## 2. What separates Site-of-the-Year from merely good

### 2.1 Concept before technique
- **Every SOTY/SOTM has one sentence you could say out loud.** "A tiny planet where someone has to deliver the mail." "A cork coaster launched like an AI product." "Ice that grows around each project." "A comic that breathes." If we can't say our concept in one sentence, we don't have one.
- **The metaphor goes all the way down.** Igloo's ice shapes the hero, the nav, the transitions and the text glitches. Ponpon's music player is the navigation. Siena's cinema ticket is the menu. Winners *carry the concept into utility UI*: loader, menu, cursor, 404, footer. Merely good sites stop at the hero.
- **Specific over generic.** Tuscan neo-romanesque, not "cinematic." Bordeaux geology, not "nature." A culturally or physically specific source makes a site unmistakable.
- **Wit or emotion, not just "wow".** Oryzo's humour, Messenger's "calm but a little weird", Cartier's intimacy. Juries remember a *feeling*.

### 2.2 Restraint (the hardest craft)
- **Two to four colors.** Nearly every winner's Awwwards palette is two colors: a dark near-black (never #000) and one light or accent value (#D2FF00 on #111112; #F7F7EE on #292919; #D5B08C on black). Oryzo uses four values in total.
- **One type family for ~99% of text** (Oryzo). A second face, if any, is a deliberate accent.
- **One signature moment.** Utsubo's jury analysis *(secondary)*: "A single unforgettable interaction, not multiple scattered effects." Studio Freight drops good ideas "for one great one."
- **Know when to stop.** Lusion: "the challenge is often not adding more, but knowing when to stop." UI must "support the content, not compete with it."
- **Most winners are not full-3D worlds.** MindMarket (SVG thread), Terminal Industries (CSS/Vue), Exat (type only) and Dropbox (Rive) all took SOTM. WebGL is a tool, not the entry ticket.

### 2.3 Pacing and structure
- **Chapters, not an endless scroll.** Tracing Art uses three chapters, Cartier six alcoves. A recommended arc *(secondary, [Utsubo](https://www.utsubo.com/blog/immersive-storytelling-websites-guide))*: Hook 0–15% → Context 15–35% → Journey 35–70% → Climax 70–85% → Resolution 85–100%. **Five scenes max**; visitors give 2–3 minutes.
- **Contrast in tempo.** Winners alternate dense, immersive moments with calm, readable blocks (Obys alternates "dense visuals with readable blocks"). Silence and stillness make the peaks land.
- **"If there's no interaction, make a video."** Every chapter should give the user *agency*: drag, hold, hover-deform, scrub. Symphony of Vines puts a physical interaction in every chapter.
- **Always-available orientation.** A progress indicator or chapter menu (Tracing Art) protects the 30% Usability weight.

### 2.4 Transitions (the most-scored dev sub-criterion)
- Winners' dev scores peak on Animations/Transitions (Renaissance 9.4; Terminal 8.8; Lando 8.6).
- Transitions *carry meaning*: 3D→2D→3D (Oryzo), frost and chromatic displacement (Igloo), velocity-driven directional blur (Siena).
- Juror quote *(secondary, [hontran.dev](https://www.hontran.dev/blog/best-award-winning-websites-2026))*: "The motion has a *director*, not just a library". Winning transitions "never call attention to themselves."
- **Motion reacts to velocity.** Blur, skew, stretch and particle color are scaled by scroll or pointer speed, not by fixed tweens. This makes the site feel physical.

### 2.5 Loader and intro
- The loader is **part of the concept**: Siena's stripes flow into the content; Igloo's intro is rendered in real time and hands off seamlessly. Renaissance's intro animation was singled out by the jury.
- Best practice is a real-time intro (no video weight) that doubles as asset preloading and ends in a **seamless handoff**, with no hard cut from loader to page.

### 2.6 Sound
- Present in most top-tier entries: Igloo (SFX synced to particles), Cartier (composed score), GQ/AP (sound *is* the timeline), Bruno (spatial audio), Symphony of Vines.
- Winners treat sound as an **interaction layer**: tied to gestures and velocity, and it fades gracefully when scrubbing fast (GQ/AP).
- It must be opt-in (browser autoplay policy) and look beautiful muted.

### 2.7 Cursor and micro-interaction
- Dropbox's pupil-dilation timing, quartic squash-and-stretch and collision-free hover grid are the level of micro-craft that tips a CSSDA jury to 9+.
- A custom cursor is only worth it if it *does something* the concept needs: a light source (Lusion's point light follows the cursor), a lens, a force on a fluid. Decorative dot-followers read as template.

### 2.8 Performance as design
- Targets from winners and analysts: **60 fps on mid-range phones (GQ/AP: iPhone 11/12)**, LCP < 1.5 s, CLS < 0.05, page weight < 3 MB *(secondary, [Utsubo guide](https://www.utsubo.com/blog/award-winning-website-design-guide))*.
- Techniques that recur: procedural or real-time generation instead of video (Igloo); KTX2/Basis textures and Draco; texture atlases; DPR clamping; GPU-tier detection with quality presets; rendering only the active and neighbouring scenes; scroll values written straight into uniforms, bypassing React; async shader compilation to avoid first-frame hitches (False Earth); OffscreenCanvas workers (Vectr).
- *"Performance is the real constraint on creativity"* (Bruno Simon).

### 2.9 Content and honesty
- Content is 10% of the score, but placeholder copy or stock visuals are penalized "immediately" *(secondary)*. Winners have **real, written, specific copy** with a voice (Oryzo's deadpan satire). The juries also go looking at 404s, footers and menus.

### 2.10 Accessibility (the most common weakness)
- Winners' Accessibility sub-scores sit at about 7.0, the lowest dev metric. Reduced-motion paths, keyboard navigation, visible focus, semantic HTML under the canvas, and captions or transcripts for audio are **the cheapest remaining points**. The juror analysis says reduced-motion fallbacks "separate craftspeople from amateurs."

---

## 3. Jury-delight checklist (polish items juries notice)

**Arrival**
- [ ] A loader that *is* the concept, doubles as real preloading (a progress value tied to actual assets), and hands off seamlessly with no white flash or hard cut.
- [ ] First meaningful frame < 1.5 s, even while the heavy scene streams in.
- [ ] Hero readable in the first 3 seconds: what is this, why care.
- [ ] Headline reveal choreographed with a masked line or word stagger, custom ease, and no layout shift.

**Motion craft**
- [ ] One custom easing family used everywhere (CustomEase), not stock `power2`.
- [ ] Velocity-aware effects: scroll speed drives skew, blur, chromatic offset or particle energy, and settles with inertia.
- [ ] Hover states designed individually, with squash-and-stretch, magnetic pull or a material response. Hovers don't collide.
- [ ] Transitions between chapters carry the concept, e.g. a shader dissolve in the brand's material. Never a generic fade.
- [ ] Nothing animates without a reason. There are still moments.

**WebGL and art direction**
- [ ] One signature real-time object or material that belongs to *this* brand.
- [ ] Film grain / dithering to kill gradient banding. Subtle chromatic aberration and vignette in a single compose pass.
- [ ] Cursor as a physical force or light on the scene, not a decorative follower.
- [ ] Color used as narrative: a restrained base with an accent that appears at the climax (the Ponpon principle).
- [ ] DPR clamp, adaptive quality (GPU tier, FPS monitor, battery), pause rendering when the tab is hidden or the canvas is off-screen.

**Typography and layout**
- [ ] One primary family (variable if possible) with an accent face used sparingly. Tuned tracking and leading at every size; optical sizes.
- [ ] A visible, disciplined grid that breaks only on purpose.
- [ ] Oversized editorial numerals and labels (chapter indices, coordinates, small mono utility text) for rhythm.
- [ ] Text never rendered only into canvas without a DOM or semantic twin.

**Sound**
- [ ] Opt-in sound toggle that is itself beautifully animated (e.g. a live waveform or equalizer).
- [ ] SFX tied to interactions (hover ticks, transition swells), mixed quietly, and ducked or faded during fast scrubs.
- [ ] Everything works and looks complete muted.

**Navigation and usability**
- [ ] Persistent orientation: a progress indicator that expands into a chapter menu.
- [ ] Menu open/close is a designed moment. Keyboard accessible, focus trapped, Esc closes it.
- [ ] Smooth scroll (Lenis) that respects anchors, keyboard scrolling, and `prefers-reduced-motion`.
- [ ] Clear primary call to action reachable at any time.

**Edges (juries look here)**
- [ ] A designed 404 page in the concept's language.
- [ ] A footer finale: an interactive or kinetic moment, not an afterthought (Oryzo's particle footer).
- [ ] A hidden layer or easter egg that rewards curiosity (Cartier's hidden gestures, Renaissance's "Hidden Layer", Immersive Garden's Backstage).
- [ ] Favicon, OG image, theme-color, selection color, custom scrollbar or none, and `::selection` styled to the palette.
- [ ] Console signature or credits for the curious developer juror.

**Responsive and fallback**
- [ ] Mobile designed in parallel: touch or gyro replaces hover, and the hero is recomposed for portrait, not just scaled down.
- [ ] Reduced-motion mode is a *designed* alternative (static art-directed frames), not a broken page.
- [ ] No-WebGL fallback is a composed poster image/CSS version of the hero.
- [ ] Tested at 60 fps on Apple Silicon (Chrome and Safari) and acceptable on a mid-range phone.

**Dev jury**
- [ ] Semantic landmarks, one h1, heading order, alt text, lang, meta and OG tags.
- [ ] Lighthouse ≥ 90 performance where feasible. CLS ≈ 0. No console errors.
- [ ] Clean, readable source (juries do open DevTools).

---

## 4. Implications for our build (principles only, no copying)

1. **Write the one-sentence concept first**, then make the metaphor reach the loader, cursor, menu, transitions, footer and 404.
2. **One signature real-time moment** (a procedural shader or material native to our concept), not a buffet of effects. Everything else supports it.
3. **Palette of 2–4 values, one type family plus an accent.** A near-black base (not #000) and one charged accent reserved for climaxes.
4. **3–5 chapters** with a hook → climax → resolution arc, tempo contrast, and an interaction in each.
5. **Velocity-aware motion system** with one custom ease family, built on GSAP, ScrollTrigger and Lenis. Scroll values go straight into shader uniforms, outside React state.
6. **Opt-in Web Audio layer** tied to interaction. It must be complete muted.
7. **Performance and accessibility as score multipliers**: tiered quality, DPR clamp, mount only nearby scenes, real reduced-motion and no-WebGL designs, semantic DOM under the canvas. This is where most winners lose points and where we can win them.
8. **Polish the edges**: 404, footer finale, one hidden easter egg, OG image, favicon, console credits.

---

### Source index
- Awwwards — SOTY: https://www.awwwards.com/websites/sites_of_the_year/ · Annual winners: https://www.awwwards.com/annual-awards/winners · SOTM: https://www.awwwards.com/websites/sites_of_the_month/ · SOTD: https://www.awwwards.com/websites/sites_of_the_day/ · Evaluation: https://www.awwwards.com/about-evaluation/
- Awwwards site pages: lando-norris, messenger, oryzo-ai, the-renaissance-edition, the-symphony-of-vines, terminal-industries, floema, exat-typeface (https://www.awwwards.com/sites/…)
- Case studies: Igloo https://www.awwwards.com/igloo-inc-case-study.html · Bruno https://www.awwwards.com/brunos-portfolio-case-study.html · Immersive Garden https://www.awwwards.com/case-study-immersive-gardens-new-website.html · Cartier https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html · GQ/AP https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html · Siena https://www.awwwards.com/siena-film-foundation-case-study.html · Dropbox https://www.awwwards.com/case-study-dropbox-brand-guidelines.html · Tracing Art https://www.awwwards.com/tracing-art.html · Ponpon Mania https://www.awwwards.com/ponpon-mania-a-comic-that-breathes-through-web-interaction.html · MindMarket https://www.awwwards.com/mindmarket-case-study.html · Lusion v3 https://www.awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html
- Lusion Oryzo BTS: https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics · https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations
- OFF+BRAND: https://www.itsoffbrand.com/our-work/lando-norris · Locomotive: https://locomotive.ca/en/work/scout-motors
- CSSDA WOTY 2025: https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/
- Codrops: Shader.se https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/ · Vercel prism https://tympanus.net/codrops/2026/09/03/from-rays-to-meshes-building-vercels-prism-with-vgpu/ · Shopify Spring '26 https://tympanus.net/codrops/2026/06/26/engineering-the-web-experience-behind-shopifys-spring-26-edition-everywhere/ · False Earth https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/ · Studio Freight https://tympanus.net/codrops/2026/07/29/studio-freight-moving-missions-forward/ · Obys https://tympanus.net/codrops/2026/03/06/obys-the-small-studio-designing-big-digital-narratives/
- Secondary: Utsubo https://www.utsubo.com/blog/award-winning-website-design-guide · https://www.utsubo.com/blog/immersive-storytelling-websites-guide · https://www.utsubo.com/blog/vectr-ai-startup-branding-case-study · hontran.dev https://www.hontran.dev/blog/best-award-winning-websites-2026 · webgpu.com showcase (Lando) · 80.lv (Messenger) · Abduzeedo (Exat)
