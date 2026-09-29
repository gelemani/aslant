# Concept 2 · Living Matter: ARDORA

> Creative direction, 2026-09-29. Direction: LIVING MATTER (fluids, ink, bioluminescence, growth).
> Status: proposal, ready to build. Every science fact on the page is sourced in §10. The copy drafts contain no em dashes, no en dashes and none of the banned words from 06-anti-slop §4A.

---

## 0. The concept on one card

| | |
|---|---|
| **Brand** | **Ardora** (slug `ardora`) |
| **Name** | *Ardora* is the Galician and Spanish word for the glow of the sea: *mar de ardora* is a sea lit by plankton. English readers also hear *ardor* (burning) in it, which suits a light that gives off no heat. The name reads as symmetrical: A R D O R A, with the round O at the centre like a vessel. |
| **Offer** | A living light. A hand-blown glass vessel holds a culture of *Pyrocystis fusiformis*, a bioluminescent plankton about a millimetre long. It glows blue only when the water moves, and only in its night. A lamp in the base gives it a day on a twelve-hour timer, so its night can start when yours does. |
| **Conversion** | Join the first-edition list: **"Reserve a vessel"** (email + country). One CTA label everywhere. |
| **One sentence** | *The night sea, by the glass, sold by a page that behaves exactly like the product: dark until you touch it, tired if you overdo it, asleep by day.* |
| **Design read** | A product-launch landing page for a living object, for people who stay up late. The voice is calm and exact, like natural history. The look sits between scientific instrument and nocturne. |
| **World sentence** | Scrolling carries you through one night inside a glass of living seawater, from the moment the vessel's lamp switches off to the moment it comes back on. Each chapter teaches one rule of the light (it answers touch, it is made of cells, it needs a push, it tires, it keeps time), and the night ends with an offer to keep one of your own. |
| **Interaction sentence** | Scrolling tilts the vessel and moves the story clock. Pointer, touch and keyboard stir the water, and the water remembers every stir. |
| **Visitor mode** | Persuade + Experience. The artifact (the water) leads from the first frame; the interface recedes. |

**Why this beats the category default.** The obvious bioluminescence site is a neon-cyan cursor trail on black. Ardora avoids that because the light follows the organism's real physics, and the page is built around that rule:
- light appears only where the water *shears* past a threshold, so it outlines the edges of a stir rather than filling it;
- it comes as discrete sparks (one per cell), each answering one frame after the stretch (17 ms, which is also one frame at 60 Hz);
- it drains where you over-stir and recovers over time;
- it stops entirely in daylight.

The blue is never paint. It exists only as light the visitor causes.

---

## 1. Brand and offer

**What Ardora is.** A small maker of one object. The object is a stoppered, hand-blown glass vessel holding *P. fusiformis* in enriched seawater. Its base has a lamp on a timer. You need no pump, no feeding and no app. Care is light, a stable room, and splitting the culture every three or four weeks. The vessel is a gift that multiplies: when you split it, the second half is yours to give away. This brings the direction's "growth" into the offer itself.

**Audience.** One person: someone who is awake after midnight and wants an object with a life of its own on the desk or bedside table. In practice: design-object buyers, gift-givers and the science-curious, aged roughly 25 to 55, urban, used to paying for objects with a story. The copy speaks to "you" in the singular and never hedges between audiences.

**Conversion goal.** The first-edition list. The form has two fields, Email and "Where it will live" (country; living cultures only travel where the transit is gentle), and one button, "Reserve a vessel". Success state: "You're on the list." plus the finale described in S5.

**Honesty rules for this concept (binding).**
- No testimonials, partners, press, prices, ship dates or fake counts. The only human voice is a real, public-domain primary source: Charles Darwin, 1833 (chapter 6).
- Every science line is sourced (§10). Where the literature hedges, the copy hedges too; for example, the luciferin is "thought to be" derived from chlorophyll, so the page does not state it as fact.
- On-page numbers are either real biology (with a source) or the live values of our own shader, labelled "model".
- **Form:** the success copy may only promise what the build actually does. Either wire the form to a real store, or keep the success copy literally true (see §8 risk R7).

**Name check (2026-09-29).** Searches for "Ardora" found no well-known brand. There are small, unrelated uses: Ardora S.A. (a marine-engine workshop in Vigo), Ardora Boutique (Italian leather goods), and a Spanish education tool. It is fine for a concept piece; a trademark search is needed before any real launch. Rejected candidates, all taken in lighting or biotech: Mareld (Swedish lighting and kitchenware brand), Morild (Norwegian reflective apparel), Scintillon (San Diego research institute), Lunula and Noctiluca (existing lamps), Merituli (the Finnish release title of the film *Mareld*).

---

## 2. Core metaphor and narrative arc

**Metaphor: the viewport is the inside of the vessel.** One fixed canvas is the water. The DOM floats on it the way labels are etched on glass. Scrolling is time passing through one night, and also a gentle tilt of the glass. The chapters are the organism's rules, taught in order, then history, then the object, then the invitation, then dawn.

**The story clock.** Every chapter has a time within one night. The time is navigation (the night gauge, §2.11) and it drives the shader's glow capacity, which really does peak mid-night and fade toward dawn. It is not decoration; see §9 for the un-ban rationale.

| Time | Chapter | Rule / job | Layout family (each used once) | Pin | Glow capacity |
|---|---|---|---|---|---|
| 19:00 | 0 Lamp off (loader) | the room goes dark | act zero | none | 0 |
| 20:10 | 1 Hero | it answers touch | full-bleed canvas + low asymmetric lockup | none | 0.85 |
| 21:30 | 2 The cell | each spark is one cell | pinned zoom + specimen ledger | 120% | 0.95 |
| 22:40 | 3 The threshold | it needs a push | horizontal instrument band | none | 1.0 |
| 00:20 | 4 The limit | it tires | near-empty canvas beat | none | 1.0 |
| 01:50 | 5 The clock | it keeps time | radial centrepiece with flanking statements | none | 0.9 (dial may switch to day) |
| 03:10 | 6 1833 | you are not the first to see it | horizontal track | 180% | 0.8 |
| 04:20 | 7 The vessel | care, and growth | object + spec ledger | 100% | 0.6 |
| 05:40 | 8 Reserve | keep a night of your own | form composition | none | 0.35 (tired) |
| 07:00 | 9 Lamp on (footer) | dawn | dawn coda | none | 0 (day) |

Pacing: a dense beat (the threshold instrument) is followed by an empty one (the limit). The two participatory centrepieces (Cell, Clock) sit on either side of the rules, and history (1833) buys a breath before the object. Three pins in total, which is the maximum.

Language: British spelling throughout (centre, millimetre, colour). Sentence case everywhere. No eyebrows, section numbers or scroll cues.

### 2.0 Lamp off (act zero, the loader)
- **Purpose:** hide shader compilation and the simulation warm-up behind a moment that belongs to the story.
- **What you see:** the page is already its dark hero, painted server-side. A warm glow at the bottom edge (the vessel's base lamp, `--gl-lamp`) fades out as loading progresses. When the lamp is gone the room is dark, and the hero's "dark adaptation" begins (§3).
- **Progress is real:** fonts 0.2, `compileAsync` plus one warm-up simulation step 0.4, poster decode 0.1, first rendered frame 0.3. Minimum 900 ms, failsafe 4 s. There is no counter.
- **Skips:** returning visitors in the same session (sessionStorage in try/catch) and reduced motion (instant dark). If loading passes 2.5 s, one small line appears in the gauge: "Letting the dark in".
- **WebGL:** `uLamp` 1 → 0. Pointer input is live from the first frame.

### 2.1 Hero (20:10): "The night sea, by the glass."
Full treatment in §3. The copy is here.
- **H1:** The night sea, by the glass.
- **Sub (20 words):** Ardora is a hand-blown vessel of living plankton. It rests by day. At night it lights wherever you move it.
- **CTA:** Reserve a vessel
- Alternate H1s, for reference: "Plankton that lights when you touch it." · "A glass of sea that answers touch."

### 2.2 The cell (21:30): pinned zoom
- **Purpose:** make the sparks tangible. Each one is a living cell you can see without a lens.
- **Desktop layout:** 12 columns. Columns 1 to 5 hold the H2, the body, then the specimen ledger (label/value rows with 1px data hairlines). Columns 6 to 12 hold the microscope field in the canvas: one cell in focus, about 42vh long and set on a slight diagonal, with 6 to 8 out-of-focus cells at other depths. The field has no frame and no card.
- **Mobile:** the pin shortens to 90%. H2 at the top, the field in the centre (cell about 70vw), the ledger after the pin releases.
- **H2:** Each spark is one cell.
- **Body (41 words):** *Pyrocystis fusiformis* is a single cell about a millimetre long, big enough to see without a lens. It has no way to swim. It drifts, it divides about once a week, and when the water around it is torn, it flashes.
- **Ledger** (labels in Host Grotesk, sentence case; values in Datatype):

  | Label | Value |
  |---|---|
  | Species | *Pyrocystis fusiformis* |
  | Size | 970 × 163 µm |
  | Moves | only with the water |
  | Divides | every 5 to 7 days |
  | Light | blue, about 475 nm |
  | Flash | under 0.25 s, 17 ms after the stretch |

- **UI line:** "Touch a cell."
- **Live readout:** "Flash strength 100%". It drops with repeated pokes (64%, 41%...), which is the model's per-cell fatigue.
- **Motion:** a scroll-scrubbed zoom (`uZoom` 0 → 1). The macro sparks under the viewport centre expand and become cell bodies, crossfading at 0.55, then the focus pulls in (edge softness 18px → 1.5px). The ledger rows get the dark-adaptation reveal (§6), staggered 90 ms. Poking a cell flashes its scintillons at the rim: one frame of latency, then decay within 0.22 s.
- **WebGL:** the micro layer is on. The fluid display fades to 0 and the fluid pauses (rule of two).

```
desktop 1440                                   mobile 390
┌──────────────────────────────────────────┐   ┌───────────────────┐
│ Each spark is          ·   (  )          │   │ Each spark is     │
│ one cell.        ·        ( O  )  ·      │   │ one cell.         │
│ body 41 words ...     (   spindle   )    │   │    ( spindle )    │
│ Species   P. fusiformis    (  )     ·    │   │ Touch a cell.     │
│ Size      970 × 163 µm            ·      │   │ Species ...       │
│ ...       Touch a cell.  Flash 100%      │   │ Size ...          │
└──────────────────────────────────────────┘   └───────────────────┘
```

### 2.3 The threshold (22:40): instrument band
- **Purpose:** teach the mechanism by feel. Slow water stays dark; a push crosses the threshold.
- **Desktop layout:** a wide, low band across the vertical middle of the viewport. Columns 1 to 5 hold the H2 and body. Columns 7 to 12 hold one instrument:
  - a 1px horizontal line;
  - a gold threshold tick at 1.00;
  - a 2px live needle showing your stir;
  - a large live number in Datatype (40px) with the label "Your stir, relative to the threshold (model)".

  Water fills everything else.
- **Mobile:** stacked, with the instrument full width under the text. The finger stirs.
- **H2:** Light starts with a stretch.
- **Body (34 words):** When moving water shears a cell, its membrane stretches. A signal opens channels, acid floods its tiny lamps, called scintillons, and they flash. Drift slowly and the water stays dark. Push, and it answers.
- **Kinetic type (the page's one variable-axis moment):** the H2 widens on Sprat's `wdth` axis (100 → 135) in proportion to your stir once it crosses the threshold. The heading literally stretches with the membrane. It is a single line in a fixed-width container (quickTo, 0.25 s), static under reduced motion.
- **Instrument honesty:** the needle value is computed on the CPU from pointer speed, using the same constants as the shader's splat and threshold, and it is labelled "model". There is no GPU readback.
- **WebGL:** fluid + light. The H2 and the instrument are hulls (S2).

### 2.4 The limit (00:20): near-empty beat
- **Purpose:** the page's memory. Light is finite, and the site has been counting since you arrived.
- **Layout:** almost nothing. The H2 and a short body sit bottom-left (columns 1 to 5). A small data legend sits bottom-right: a 120px bar labelled "spent" and "ready". The rest of the screen is the map.
- **H2:** It tires, like you do.
- **Body (34 words):** A culture can answer for a few minutes a night. Spent cells need hours before they flash again. This page keeps the same count, only faster. The dark patches are where you have been.
- **Motion:** `uChargeView` fades 0 → 1 over 700 ms (tide ease) when the section is 30% in view. The whole water shows a faint teal haze of remaining potential, and every path you stirred during the visit shows as a dark trail through it. Stir now and you cut new dark paths live; they heal over about 8 s (compressed from hours, and the body says so).
- **Mobile:** same, with the copy at the top.

### 2.5 The clock (01:50): eyepiece dial
- **Purpose:** the circadian rule, told as a toy. It is also the page's one authored theme switch, from night to day.
- **Desktop layout:** a centred eyepiece dial, `min(64vh, 560px)`. A 24-hour ring (SVG data graphic) has a draggable handle, and the lamp window (07:00 to 19:00) is marked as an arc.
  - The H2 is split around the dial: "By day it drinks light." on the left and "By night it gives it back." on the right. It is one heading element, and DOM order equals reading order.
  - Above the dial, a true local-time line: "It's 01:16 where you are."
  - Below the dial: a state label ("Lamp off. Night phase.") and the body.
  - Inside the ring, the micro layer shows 3 to 5 cells at high magnification.
- **Mobile:** the dial is 86vw with the two statements stacked above and below. Dragging uses the angle from the centre.
- **H2:** By day it drinks light. By night it gives it back.
- **Body (39 words):** Inside each cell, gold chloroplasts spread out to catch the sun, then gather at the centre by night while the light-makers move to the edges. The base lamp keeps this clock, so its night can start when yours does.
- **Interaction:** the handle starts at the visitor's real local time.
  - Dragging it into the lamp window switches the page to day over 700 ms (tide):
    - the ground turns to Dawn water and the text turns to Kelp;
    - light stops entirely;
    - inside the eyepiece, chloroplasts spread through the cells and the scintillons retreat to the centre.
  - Dragging out of the window returns night.
  - Leaving the section always restores night.
  - Keyboard: the dial is `role="slider"` (0 to 1439 minutes; arrow keys move 15 minutes, Page Up/Down move 1 hour), with `aria-valuetext` such as "07:30, lamp on, day phase".
- **WebGL:** micro layer inside a circular mask. Outside the ring, the water is paused. `uDay` is owned by the dial.

```
┌──────────────────────────────────────────────────────┐
│               It's 01:16 where you are.              │
│                     .-~~~~~-.                        │
│  By day it        /  ( cells )  \        By night it │
│  drinks light.   |   ( in the ) |       gives it     │
│                   \ ( eyepiece)/        back.        │
│                     `-._●_.-'   ← handle on 24h ring │
│               Lamp off. Night phase.                 │
│        Inside each cell, gold chloroplasts ...       │
└──────────────────────────────────────────────────────┘
```

### 2.6 1833 (03:10): horizontal track
- **Purpose:** a human voice with scale, and a primary source instead of a testimonial. It also pays off S2, because the word "vessel" is Darwin's.
- **Layout:** a pinned horizontal track about 180% long. The quote is set large across about 280vw in 2 to 3 long lines of Sprat Condensed Light. An invisible ship's hull (an obstacle shaped like a pointed lens, about 30vw long) crosses the water from left to right as you scroll. It is never drawn: you see only the two bow waves of light and the milky wake it leaves in the simulation. Each word turns from silt to salt as the bow passes its x position. The caption sits at the end of the track.
- **Mobile:** no pin. The quote is stacked vertically, and the hull travels top to bottom with section progress. Same physics.
- **H2 (small, is the caption):** Charles Darwin, *The Voyage of the Beagle*, south of the Río de la Plata, December 1833
- **Quote (verbatim, public domain, ch. VIII; starts at a sentence boundary):** "There was a fresh breeze, and every part of the surface, which during the day is seen as foam, now glowed with a pale light. The vessel drove before her bows two billows of liquid phosphorus, and in her wake she was followed by a milky train."
- **Motion:** SplitText words (`aria: 'auto'` on the block). A word lights when `hullX > wordCenterX`: a 17 ms delay, then colour ease 220 ms. This is the page's only SplitText use, and the words are lit by physics, not by a stagger.
- **WebGL:** fluid + light with a moving obstacle (`uHull`, `uHullVel`). In this chapter only the hull is an obstacle (text hulls are off), so the ship owns the frame.

### 2.7 The vessel (04:20): object + ledger
- **Purpose:** the product, drawn by its own light, and growth made literal.
- **Desktop layout:**
  - Columns 1 to 7: as you scroll, the water pours into a vessel silhouette (a round-bottom, stoppered flask as a 2D SDF, about 70vh tall). Outside the flask is air (darker, no cells). The glass walls are solid boundaries, so any stir inside makes light break along the walls and the object outlines itself. A faint 8% salt rim keeps it readable at rest.
  - Columns 8 to 12: H2, spec ledger, closing line.
  - At "Every 3 to 4 weeks" the flask divides into two flasks (an SDF smooth-min split, `uSplit` 0 → 1).
- **Mobile:** the flask at the top (50vh), the ledger below.
- **H2:** Care is mostly leaving it alone.
- **Ledger:**

  | Label | Value |
  |---|---|
  | Glass | hand-blown, stoppered |
  | Culture | *Pyrocystis fusiformis* in enriched seawater |
  | Lamp | in the base, on a twelve-hour timer |
  | Room | 18 to 24 °C, out of direct sun |
  | After lamp-off | wait an hour, then swirl it gently |
  | Every 3 to 4 weeks | pour half into fresh medium |

- **Closing line:** Every vessel can become two. The second one is for giving away.
- **Motion:** the pour is `uVessel` 0 → 1, scrubbed. Ledger rows use the dark-adaptation reveal, staggered 90 ms. The split is scrubbed on the last 30% of the pin.
- **WebGL:** fluid + light with a domain mask and wall obstacles.

### 2.8 Reserve (05:40): the last hour of night
- **Purpose:** conversion. The water is tired now (capacity 0.35), so the light is sparse and precious.
- **Desktop layout:** the H2 large at the left (columns 1 to 8). Below it, the form sits in one line like a signature line: email (columns 1 to 5), country (6 to 8), button (9 to 11). The helper line sits under the form. The water fills the rest.
- **Mobile:** stacked full-width fields, with a 56px button in the thumb zone.
- **H2:** Keep a night of your own.
- **Body (20 words):** The first vessels leave when their cultures are ready. Leave your email and we will write once, when yours is.
- **Labels:** Email · Where it will live
- **Helper:** One email, when it's ready. Nothing else.
- **Button:** Reserve a vessel. While sending: "Sending". Success: "On the list".
- **Error:** That email doesn't look right.
- **Success line:** You're on the list.
- **Finale:** S5.
- **WebGL:** fluid + light at low capacity, then the `uRing` event on success.

### 2.9 Lamp on (07:00): footer, dawn
- **Purpose:** resolution. The night ends and the organisms go to work.
- **Layout:** the ground rises to Dawn water (`uDay` 0 → 1, scrubbed over the last 60vh) and warm lamp light returns at the bottom edge. Gold cells drift faintly and nothing glows.
  - One line: "Lamp on. Resting until tonight."
  - Links: Colophon, Sources, Back to night.
  - The Motion toggle.
  - A last composition: the "Ardora" wordmark at 21vw in Sprat Extended Thin, kelp on dawn, bleeding off the bottom edge.
  - Small print: "Ardora, 2026."
- **No** mega-grid, no social links (none are real).
- **Colophon** (a dialog, focus-trapped, Esc closes):
  - how the water, light and cells are made;
  - fonts and licences, and the science sources;
  - a live readout (simulation resolution, pressure iterations, JS frame time);
  - the line: "The cell answers 17 ms after the stretch. That is one frame at 60 Hz, so the light on this page answers one frame after yours does."
  - the hidden gesture: "Press L to put the page to bed" (every piece of UI fades out over 700 ms and only the water stays; press L or Esc to return).
- **404 page, in daylight:** H1 "The lamp is on." · "Nothing glows by day, and nothing lives at this address." · link "Back to the dark".

### 2.10 Navigation
- **Top bar:**
  - left: the "Ardora" wordmark;
  - right: The cell, The vessel, a Sound switch, and "Reserve a vessel" as a text link;
  - mobile: the wordmark, Reserve, and Menu.
- **Mobile menu:** opens like a lid being lifted (a clip-path from the top, 500 ms settle). It lists the chapters by story time plus the Sound and Motion toggles. Focus is trapped and Esc closes it.
- No background blur. The bar sits directly on the water, and in day state its text flips to Kelp.

### 2.11 Night gauge (desktop ≥1024px)
- A 1px line, 56vh tall, 28px from the right edge, with 10 chapter ticks.
- The current tick shows "21:30 The cell" (time in Datatype, name in Host Grotesk). Hover or focus reveals every label.
- Each tick is a button with a 44px hit area that calls `lenis.scrollTo`, and carries `aria-current="step"`.
- It replaces a progress bar and a chapter menu in one quiet object (the Tracing Art principle, rebuilt in our own language).

---

## 3. Hero

### 3.1 Static first frame (complete without JS or WebGL)
- **What SSR paints:**
  - the night ground;
  - the hero poster: our own render, captured from the live canvas at about 2.0 s into the intro, with the word ARDORA half-lit in sparks and a wake curling right (WebP, about 80 KB);
  - the nav, H1, sub and CTA, all real DOM text. The H1 is the LCP element.
- **Where the poster lives:** in the hero section (absolute), not in the fixed layer, so it never ghosts behind later chapters when WebGL is missing.
- **Until capture:** the fallback is the night ground with the vignette. It is honest, just emptier.
- **With JS:** an inline `<head>` script sets `html.js`. The H1 starts "under-exposed" (opacity 0.18, blur 6px) rather than hidden, so LCP still counts it.

```
desktop 1440 × 900
┌────────────────────────────────────────────────────────────────────────┐
│ Ardora                         The cell   The vessel   Sound off   Reserve a vessel │
│                                                                 ┆ gauge │
│                                                                 ┆       │
│        A    R    D    O    R    A      ← planted in the water,  ┆ 20:10 │
│                                          invisible until stirred┆       │
│                                                                 ┆       │
│ The night sea,                                                          │
│ by the glass.                                                           │
│ Ardora is a hand-blown vessel of living                                 │
│ plankton. It rests by day. At night it lights                           │
│ wherever you move it.      [ Reserve a vessel ]                         │
└────────────────────────────────────────────────────────────────────────┘
mobile 390 × 844: wordmark + Menu at top; H1 at top-left (about 52px);
the water word ARDORA at 45% height across 88vw; sub; full-width CTA in the thumb zone.
```

H1: Sprat wdth 122, wght 40, `clamp(3.25rem, 1.2rem + 6.4vw, 8.25rem)`, line-height 0.9. It spans columns 1 to 7 at the bottom-left, with the sub and CTA stacked beneath. This is not a split header. The giant ARDORA lives only in the water, as cell density.

### 3.2 Intro choreography (the first three seconds after the lamp)
| t (after the lamp goes out) | Event |
|---|---|
| 0 ms | The room is dark. **Dark adaptation:** the H1 lines go from opacity 0.18 / blur 6px to 1 / 0 over 900 ms (settle ease), staggered 120 ms. The sub follows at +200 ms. Nav and CTA are already usable. The meaning: things appear the way they do when your eyes adjust. |
| 300 ms | **The first stir.** A scripted rake (7 splats spaced vertically over the word's height) sweeps left to right in 1.4 s. The shear at its front crosses the threshold over the planted word, which is denser in cells, so **ARDORA surfaces letter by letter in blue sparks.** |
| 1.1 s | Vortices shed behind the rake tear the first letters into eddies while the last letters are still arriving. |
| 1.7 s | The rake exits right. Two large eddies curl in the right third, and the light decays over about 1.5 s. |
| 3.0 s | Ambient: a very slow curl-noise current, so the edges of the eddies spark now and then. The page is alive and waiting. |

The intro never blocks: scrolling or stirring during it just adds to the water. Under reduced motion there is no rake and no blur: the captured poster is shown, and one pre-computed frame renders once.

### 3.3 Pointer response
- **Move:** the pointer delta becomes a force splat (force ≈ 6 × delta px, radius scales with speed). Slow drifts stay under the threshold and stay dark. Faster strokes light **the edges of the stroke** (shear layers), the way real wakes do.
- **Press:** a radial impulse, so a thin ring of light forms at the edge of the touch.
- **Press and drag:** 1.6 × force.
- **Touch:** the same, with the finger.
- **Keyboard:** arrows, Space and Page keys scroll, and scroll velocity is a force, so keyboard users make light too.
- **Memory:** every flash drains the local charge (S3), so stirring the same spot answers softer.
- **Contrast guard:** light never sits behind glyphs. Headline rects are solid in the simulation (S2), and the display pass darkens emission inside them by 70%.
- **The native cursor stays.** There is no follower: the light is the feedback.

### 3.4 The image people will remember
**A black screen. An invisible hand passes across it, and the word ARDORA rises out of the water in thousands of blue sparks, letter by letter, then tears apart into eddies.** Afterwards only your own hand can bring pieces of it back. The name is re-planted, still invisible, whenever you return to the top after 20 s or more away.

---

## 4. Signature moments

**S1. The name in the water.**
- The brand is planted into the simulation as *cell density*: Sprat Extended Black, rasterised into the density field and blurred 2px. It is invisible at rest, because only light shows cells.
- The lamp-off rake reveals it once, left to right. After that it is yours to find.
- It is the living-mark trend (06 trends §1.10), done as physics rather than as an animation of the logo.

**S2. Headlines are hulls.**
- Every headline line (the SplitText line rects) and the primary CTA is a solid, moving body in the fluid. Scroll fast and the water rushes past the type: each line throws a crescent of light at its leading edge and a sparkling wake behind. Scrolling down lights the top edges; scrolling back up lights the bottom edges.
- This is the true physics of bioluminescent bow waves: shear is highest at boundaries.
- It pays off in 1833, where an invisible ship lights Darwin's own words about "two billows of liquid phosphorus".
- The DOM and the canvas become one choreography (anti-slop #45). The same rects also act as contrast scrims.

**S3. The map of your touch (participatory).**
- The page keeps a *charge* texture for the whole visit. Flashes drain it and time refills it.
- In "The limit" the map becomes visible: a faint haze of potential light, with your whole history on the page cut through it as dark paths. Stir, and you watch yourself use the light up.
- It is the one moment where a jury member sees their own behaviour reflected back. It is also true: a culture can be agitated for a few minutes before it needs a day to recover.

**S4. Set its clock (participatory).**
- The eyepiece dial starts at your real local time. Drag the handle into the lamp window and the whole page turns to day: pale water, gold chloroplasts spreading through the magnified cells, the scintillons pulling in, no light at all.
- Drag back and night returns.
- It is the page's single authored theme switch, and it is motivated by biology rather than by a dark-mode toggle.

**S5 (finale, not a signature). The last light.**
- On a successful reservation, a single ring of light expands from the button through the entire vessel. This is the only time the whole page lights at once.
- As you scroll on, dawn rises into the footer.
- Flash-safe (§5.4): one ring, 0.8 s, thin front, never strobing.

---

## 5. Typography, colour, texture

### 5.1 Fonts (all from the research list, all OFL, all self-hosted)
| Role | Face | Source and licence | Axes / cuts | Why only this face |
|---|---|---|---|---|
| Display: H1, H2, quote, wordmark, the water word | **Sprat VF** (Ethan Nakache, Collletttivo) | OFL-1.1, verified in the repo `LICENSE.txt`. File: `github.com/collletttivo/sprat/fonts/SpratVF.woff2` (75.8 KB). Load with `next/font/local`. | **Verified `fvar`:** `wdth` 100 (Condensed) · 122 (Regular) · 200 (Extended); `wght` 10 (Thin) · 40 (Light) · 100 (Regular) · 120 (Medium) · 175 (Bold) · 200 (Black). Default instance: Condensed Thin. No italic. | Its long, pointed serifs are *fusiform* (spindle-shaped), the exact shape of *P. fusiformis*. Its high contrast lets hairlines fall into the dark like faint light. The width axis lets a heading stretch with the membrane (§2.3). OFL means we can rasterise it into the simulation. The name is also a small sea fish, which goes in the colophon. |
| Text and UI | **Host Grotesk** (Element Type) | Google Fonts, OFL. `next/font/google` (present in Next 16.3 font-data). | `wght` 300 to 800, italic available | Calm, warm and legible at 16 to 18px. It is not on the reflex list and stays out of Sprat's way. Italic is used only for titles (*The Voyage of the Beagle*, species names). |
| Data: live readouts, specs, story times | **Datatype** | Google Fonts, OFL (added 2026-03). `next/font/google`. | `wdth` 50 to 150, `wght` 100 to 900, tabular figures | New and unassociated. Its width axis echoes Sprat's. It is used **only** for real numbers, in sentence case and without tracked caps (anti-slop #17). |

**Engineering gotcha.** Sprat's `wght` axis runs 10 to 200, not 100 to 900, so `font-weight: 400` would clamp to Black. Declare the face with `weight: '10 200'` and `declarations: [{ prop: 'font-stretch', value: '100% 200%' }]`, and set every display role explicitly with `font-variation-settings: 'wdth' X, 'wght' Y`. Preload only Sprat and Host Grotesk 400/500. If the GitHub download ever fails, the fallback is **Imbue** (GF, OFL, `opsz` 10 to 100, `wght` 100 to 900).

### 5.2 Scale and setting
| Token | Face / settings | Size (fluid) | Leading · tracking |
|---|---|---|---|
| `--type-hero` | Sprat wdth 122 · wght 40 | `clamp(3.25rem, 1.2rem + 6.4vw, 8.25rem)` | 0.90 · -0.025em |
| `--type-h2` | Sprat wdth 100 · wght 100 | `clamp(2.5rem, 1rem + 4.8vw, 5.75rem)` | 0.94 · -0.02em |
| `--type-quote` | Sprat wdth 100 · wght 40 | `clamp(1.9rem, 0.9rem + 3.2vw, 4rem)` | 1.06 · -0.01em |
| `--type-mark-xl` | Sprat wdth 200 · wght 10 | 21vw (footer) | 0.80 · 0 |
| `--type-mark-nav` | Sprat wdth 200 · wght 40 | 20px | 1 · +0.01em |
| `--type-body` | Host Grotesk 400 | 1.125rem desktop / 1rem mobile | 1.55 · 0; max 62ch |
| `--type-ui` | Host Grotesk 500 | 15px | 1.33 |
| `--type-label` | Host Grotesk 400, silt | 13px | 1.38 |
| `--type-data` | Datatype wdth 85 · wght 400 | 13 to 15px | tabular-nums |
| `--type-data-live` | Datatype wdth 110 · wght 500 | 40px (instrument value) | tabular-nums |

Rules:
- Sprat only at 40px or larger (its hairlines need size on a dark ground).
- `text-wrap: balance` on headings, and more space above a heading than below it.
- Light-on-dark compensation: body +0.01em tracking and line-height 1.6 on the night ground.
- Real curly quotes. No `<br>`-broken headlines. No single-word accents.

### 5.3 Colour (exact values, roles, measured WCAG contrast)
Strategy: **restrained, with colour as an event.** The night ground owns about 85 to 90% of pixels. Salt carries text. Gold (the cell's own pigment) is under 3% and reserved for action, focus and selection. **Blue is never a CSS colour.** It exists only as light the visitor causes in the canvas. Dawn is the one other ground, used by the Clock's day state, the footer and the 404.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--c-night` | `#06100F` | Night water: the ground. Seawater tinted by algae (hue about 175), never `#000` | |
| `--c-deep` | `#0C1B19` | Deep water: raised surfaces (menu sheet, input fields, colophon dialog) | |
| `--c-salt` | `#DCE5DE` | Primary text on night | 14.98 on night · 13.74 on deep |
| `--c-silt` | `#8FA59C` | Secondary text, labels, data hairlines (at 40%) | 7.38 on night · 6.77 on deep |
| `--c-peridinin` | `#E0A43E` | Action, focus ring, `::selection`, caret, gauge marker. Peridinin is the dinoflagellate's gold pigment | 8.77 on night; night text on it 8.77; kelp text on it 7.59 |
| `--c-dawn` | `#D6DED6` | Dawn water: the day ground (cool grey-green, not cream) | |
| `--c-kelp` | `#10211D` | Text on dawn | 12.15 on dawn |
| `--c-kelp-muted` | `#4A5E57` | Secondary text on dawn | 5.04 on dawn |
| `--c-peridinin-deep` | `#7A4E0D` | Accent text on dawn | 5.23 on dawn |
| `--gl-scintillon` | `#3AA6FF` | **Shader only.** Emitted light (about 475 nm, clipped to sRGB) | |
| `--gl-halo` | `#1FA99B` | **Shader only.** Light scattered through seawater (water passes blue-green) | |
| `--gl-core` | `#EAF7FF` | **Shader only.** Overexposed flash cores, reached through tone mapping | |
| `--gl-chloroplast` | `#B88A2C` | **Shader only.** Cell pigment in the micro view and day state | |
| `--gl-lamp` | `#FFD9A0` | **Shader only.** The base lamp's warm light (loader, footer) | |

In day state the CTA keeps its gold fill with Kelp text and gains a 1px Kelp border, because gold on dawn is only 1.6:1 for non-text contrast. Browser surfaces are themed from tokens:
- `::selection` peridinin on night; `caret-color` peridinin;
- focus ring: 2px peridinin at 3px offset, or kelp in day state;
- thin scrollbar with a silt thumb;
- underline offset 0.2em;
- `theme-color` `#06100F`.

Shader colours come from the tokens through `THREE.Color` (T04), so the canvas and DOM stay in step.

### 5.4 Texture and materials (every texture has a cause)
- **Water:** near-black, with a barely visible low-frequency variation (1.5% luminance) that drifts with the ambient current, so it reads as a volume rather than flat paint.
- **Grain:** only in the canvas composite, never on the DOM. It is photon noise, the grain of a low-light exposure: 1.2% luminance, ×1.4 in the darkest values, stepped at 24 fps, static under reduced motion. The hero poster has it baked in.
- **Glass:** the vessel walls are drawn by light wherever stirred water shears against them, plus a faint 8% salt rim. In day state, gold specks refract slightly at the walls.
- **Cells:** translucent membranes (SDF rim), gold chloroplast granules, and pale scintillon points that flash blue.
- **Lamp:** a warm radial light from the bottom edge, only in the loader, the day state and the footer.
- **No** glass UI, no CSS glows, no gradients in CSS. Radius is 0 on every rectangle; circles are used only where the data is round (the dial, cells).

**Flash safety:** never more than 3 flashes per second over more than 25% of the viewport. The tone mapper caps the peak. The S5 ring is a single thin front.

---

## 6. Motion language

### 6.1 Tokens
```css
--ease-settle: cubic-bezier(0.16, 1, 0.3, 1);   /* arrivals: water settling after a stir */
--ease-drain:  cubic-bezier(0.7, 0, 0.84, 0);    /* exits: light draining away */
--ease-tide:   cubic-bezier(0.65, 0, 0.35, 1);   /* reversible states: lamp on/off, charge view, menu */
--t-latency: 17ms;   /* P. fusiformis flash latency; also one frame at 60 Hz */
--t-flash:  220ms;   /* the flash is under 0.25 s */
--t-state:  280ms;
--t-tide:   700ms;
--t-adapt:  900ms;   /* dark-adaptation reveal */
--t-lamp:  1400ms;   /* lamp off / lamp on */
```
The GSAP twins are `CustomEase.create('settle', '0.16,1,0.3,1')`, plus `'drain'` and `'tide'` with the values above. Scrubbed timelines use `ease: 'none'` with `scrub: 1` (the lag feels like water resistance). Nothing bounces, nothing loops on UI, and exits are faster than entrances.

**Micro-craft rule: every control answers like a cell.** Hover, press and toggle feedback waits `--t-latency` and decays over `--t-flash`: a 1.18 brightness flash on the gold fill, or an underline going 1px → 2px. The colophon says so.

### 6.2 Reveal vocabulary (varies by section; no uniform fade-up)
| Where | Reveal | Meaning |
|---|---|---|
| H1 and H2s | Dark adaptation: opacity 0.18 → 1, blur 6px → 0, 900 ms settle, line stagger 120 ms | Things appear as your eyes adjust |
| Ledgers (Cell, Vessel) | Row adaptation, stagger 90 ms | A specimen card being read |
| Darwin quote | Word lit when the hull passes its x position (17 ms + 220 ms) | Words are read by the ship's light |
| Instrument | Needle `quickTo` 0.12 s; the threshold tick flashes on crossing | Feedback, not decoration |
| Charge map | 700 ms tide | Revealing what was always there |
| Day switch | 700 ms tide on the ground, text and `uDay` together | A lamp switching |

### 6.3 Scroll feel
- Lenis only, synced to the GSAP ticker (the existing `SmoothScroll`). Set `lerp: 0.075` and `wheelMultiplier: 0.9` for a slightly viscous feel, like moving a hand through water.
- Scroll velocity is physical input:
  - it sets the velocity of every hull (S2);
  - it adds a weak global body force (the glass tilting), so fast scrolling lights the walls and the type edges.
- **Pins:** Cell 120%, 1833 180%, Vessel 100%; that is three, and no more.
- No snap. Anchors go through `lenis.scrollTo`.

### 6.4 Chapter transitions (all inside the one water)
| Seam | Transition |
|---|---|
| Lamp off → Hero | Lamp glow fades; dark adaptation; the rake reveals the name |
| Hero → Cell | You lean in: sparks under the centre become cells (`uZoom`) |
| Cell → Threshold | You lean back: focus pulls out to the macro water |
| Threshold → Limit | Dense instrument to empty screen; the charge map tides in |
| Limit → Clock | The eyepiece ring draws itself (DrawSVG 0 → 100%, scrubbed); the charge map tides out |
| Clock → 1833 | Night is restored if you left it in day; the hull enters from the left |
| 1833 → Vessel | The hull exits right; the water pours into the flask (`uVessel`) |
| Vessel → Reserve | The flask opens back to full water; capacity has dropped, so the water is tired |
| Reserve → Lamp on | Dawn rises (`uDay`); warm lamp light returns at the bottom edge |

### 6.5 Cursor
The native cursor stays everywhere. There is no follower and no magnetism. The pointer is an instrument, and its feedback is light in the water. On touch devices the finger is the instrument. Under reduced motion, a touch gives a soft, static brightening at the contact point (a 200 ms fade), so the light still answers without movement.

### 6.6 Sound (P2, off by default, complete when muted)
- **Toggle:** a Sound switch (`role="switch"`) with text "Sound off/on". Its indicator is 5 hairline bars driven by the live stimulus energy: real data, not an equaliser costume.
- **Bed:** pink noise through a 500 to 900 Hz low-pass (water in a glass) at about -30 dBFS, with a 0.05 Hz LFO.
- **Sparks:** short sine and triangle grains at 2 to 5 kHz (8 ms attack, 120 ms decay, a pentatonic pitch set, random pan), 30 per second at most.
  - The rate follows the stimulus above threshold, computed on the CPU from pointer and scroll with the shader's constants.
  - Gain is scaled by a CPU mirror of fatigue, so tired water sounds quieter.
  - Grains duck during fast scrubbing.
- **Lamp on/off:** a 20 ms filtered click. **Ring:** one soft two-sine swell a fifth apart, 1.5 s.
- **Rules:** start only inside the click gesture, use `setTargetAtTime` everywhere, and suspend on `visibilitychange`.

---

## 7. WebGL plan

### 7.1 Architecture
- **One persistent canvas:** the existing `StageRoot`/`Stage` (fixed, `pointer-events: none`, `aria-hidden`, poster underneath).
- **Rendering:** 2D only, with clip-space quads. There is no 3D scene, no drei `View`, and no pmndrs `EffectComposer`: our display shader *is* the composite pass, which saves a full-screen pass.
- **Recommendation to infra:** move `Stage` to `frameloop="never"` and drive `advance(timeSeconds)` from the GSAP ticker after Lenis (techniques doc, Part 2), so the hulls, text and water never drift a frame apart.
- **Two visual systems, never both heavy at once (rule of two):**
  1. the water (fluid + light), in every chapter except while the micro layer is focused;
  2. the micro layer (instanced SDF cells), in Cell and Clock, where the water pauses.

### 7.2 Passes, per frame (run in `useFrame(-2)`, `dt = min(delta, 1/30)`)
**A. Fluid, at simulation resolution S** (Stable Fluids after Stam 1999, following Dobryakov's MIT implementation; the T22 code applies as is).
- Order: curl → vorticity confinement (strength 18 to 25) → divergence → pressure clear (×0.8) → Jacobi pressure ×N → gradient subtract → advect velocity (dissipation 0.2).
- **Obstacle pass**, after advect and after gradient subtract: inside any obstacle SDF, velocity equals the obstacle's velocity. The obstacles are:
  - up to 16 rounded rects (headline lines and the CTA, padded 6px);
  - the 1833 hull, a lens SDF with `uHullVel`;
  - the vessel walls, `|sdFlask| < wall`.
- **Inputs:** pointer splats (T22 splat), tap rings, the intro rake, the S5 ring (a radial force band `v += n · A · exp(-((r - R(t))² / w²))` for 0.8 s), the scroll body force, and an ambient curl-noise current at very low amplitude (off under reduced motion).

**B. Field, at field resolution F.** One RGBA16F ping-pong pass: R density, G charge, B emission.
```glsl
// strain rate |S| from the velocity texture (sim texel tx)
float ux=(vR.x-vL.x)*.5, uy=(vT.x-vB.x)*.5, vx=(vR.y-vL.y)*.5, vy=(vT.y-vB.y)*.5;
float strain = sqrt(2.0*(ux*ux+vy*vy) + (uy+vx)*(uy+vx));
float excite = smoothstep(uThresh, uThresh*1.6, strain*uGain);        // threshold, then more light
float cap    = uNightCapacity * (1.0 - uDay);                           // story clock and lamp
float eNew   = density * charge * excite * cap;
float emit   = max(prevEmit * exp(-uDt/0.10), eNewPrev);               // previous frame's stimulus = one-frame latency; decay well under 0.25 s
charge  = clamp(charge + uDt*(1.0-charge)/uRecover - eNew*uDrain*uDt, 0.0, 1.0);   // uRecover about 8 s here (hours in reality)
density = advect(density) ; density += (uBase(uv) - density)*(1.0-exp(-uDt/25.0)); // settles back slowly
```
The wordmark is planted by rasterising "ARDORA" with a 2D canvas (Sprat Extended Black, 84vw, blurred 2px) into a texture. A single "plant" pass blends it into density (hero at 1.0, background base 0.35). It is re-planted over 2 s on returning to the top after 20 s or more away.

**C. Halo.** Emission is downsampled to ¼ resolution and put through 2 dual-Kawase blur passes, which gives the scattering halo.

**D. Display.** A full-screen quad at the canvas DPR.
- **Ground:** `mix(night, dawn, uDay)` plus the water variation.
- **Sparkle cells:** a hashed grid at a 3.5 CSS px pitch. Each site has a random offset, a random threshold and a presence of `step(h, density)`. Emission is sampled *at the cell centre*, which keeps the points discrete. The result is a Gaussian dot, lit by `smoothstep(thr, thr+0.25, emission)` with a tiny 40 Hz shimmer. This is what makes it look like a photograph of a real wake rather than a neon trail.
- **Light:** `sparkle*scintillon + halo*haloTeal*0.6`, then tone map with `1 - exp(-x*exposure)`, which yields the white cores.
- **Day:** gold chloroplast specks from density, faded in by `uDay` and offset by velocity so they drift.
- **Charge view** (`uChargeView`): the potential light `charge*density*0.08` shown as teal haze, so used-up paths read as dark trails.
- **Also:**
  - vessel mask and air outside it;
  - obstacle scrim, where emission inside text rects is scaled ×0.3;
  - lamp glow (`uLamp`, from the bottom edge);
  - grain and a gentle vignette (the curvature of the glass).

**E. Micro layer** (Cell and Clock). 24, 16 or 8 instanced quads, depending on tier.
- **Cell body:** a 2D spindle SDF (a pointed vesica with a slight bend per instance).
- **Membrane:** a rim at alpha 0.8 over translucent cytoplasm.
- **Chloroplasts:** an fbm network. At night it is clustered at the centre (σ small); by day it spreads along the cell (`uDay`).
- **Scintillons:** hashed points at the rim by night and near the centre by day. On a poke they flash with one frame of latency and a 0.22 s decay, and per-instance fatigue drains 36% per poke, recovering over 6 s.
- **Depth and zoom:** depth layers use SDF softness as out-of-focus blur. `uZoom` maps macro sparks to cell positions for the crossfade.
- Write these shaders ourselves, or use Inigo Quilez's 2D SDF formulas (MIT). No Shadertoy code.

### 7.3 Uniforms and owners (one owner per uniform, T05)
| Uniform | Owner | Notes |
|---|---|---|
| `uTime`, `uDt` | frame loop | frozen under reduced motion |
| pointer position, velocity, pressed | input system (`frame.pointer`) | touch equals pointer |
| `uScrollVel` | Lenis bridge (`frame.scroll`) | drives hull velocity and body force |
| `uObstacles[16]`, `uObstacleCount` | hull registry `useHull(ref)` | rects cached on resize / ScrollTrigger refresh; per-frame position from the scroll offset (no layout reads) |
| `uLamp` | loader, footer | warm light 0..1 |
| `uNightCapacity` | story clock (ScrollTrigger across chapters) | see the table in §2 |
| `uHero` | Hero trigger | planting and re-planting |
| `uZoom`, `uMicro` | Cell and Clock triggers | macro/micro crossfade |
| `uThresh`, `uGain` | constants (tier-scaled) | shared with the CPU instrument maths |
| `uChargeView` | Limit trigger | 0..1 |
| `uDayDial` / `uDayDawn` | dial / footer trigger | the shader uses `max()`; two owners, never one value |
| `uHull`, `uHullVel` | 1833 trigger | the lens obstacle |
| `uVessel`, `uSplit` | Vessel trigger | flask mask, one-to-two split |
| `uRing` | form success | position and start time |

### 7.4 Tiers and budgets (estimates; measure on M1/M2 first)
| Tier | Who | S / Jacobi | F | DPR | Halo | Micro N |
|---|---|---|---|---|---|---|
| high | Apple Silicon desktop | 128 / 20 | 512 | 1.5 (up to 1.75 if headroom) | 2 blur passes | 24 |
| medium | PerformanceMonitor decline | 96 / 14 | 384 | 1.35 | 1 pass | 16 |
| low | coarse pointer, ≤4 cores/GB | 64 / 10 | 256 | 1.25 | mip sample only | 8 |
| calm | reduced motion or Motion: calm | one pre-computed frame (seed + 90 steps once); static glow on touch | 256 | 1 | none | static still |
| static | no WebGL2, no half-float render targets, context lost | CSS / posters | | | | |

**GPU target (tier high, 1440×900):** fluid about 0.4 ms, field about 0.3 ms, halo about 0.3 ms, display about 1.2 ms, micro about 0.4 ms when on. That totals about 3 ms, well inside the 16.6 ms frame. JS stays at 2 ms per frame or less.

**Performance rules:**
- Simulation FBOs have a fixed size, not coupled to DPR.
- Rendering pauses when hidden (existing `Lifecycle`).
- `PerformanceMonitor` steps the tier down and never oscillates.
- If `EXT_color_buffer_half_float` is missing, drop to **procedural mode**: no simulation; light comes from a 32-point pointer trail plus curl noise with the same sparkle display. It is still alive.

### 7.5 Fallbacks (designed, not broken)
- **No WebGL:**
  - the hero poster (our own capture);
  - Cell and Vessel get captured stills of our renders;
  - the Clock dial still works as a DOM slider and flips the CSS palette;
  - 1833 shows the quote fully lit;
  - Reserve works; the footer is dawn.
- **Reduced motion:**
  - Lenis smoothing off, pins off (final states laid out);
  - no rake, no ambient light, no bow waves;
  - the dial switches day and night instantly;
  - the quote is shown fully lit;
  - the ring becomes a static confirmation.
- **Poster capture:** a `?capture=hero|cell|vessel` route sets uniforms and saves `canvas.toBlob` after N steps. These are honest assets: our own render.
- **Context loss:** the poster shows. On restore the scene remounts, the density is re-seeded and the charge resets.

---

## 8. Feasibility (about 4 hours of parallel agent work)

### 8.1 Workstreams
| # | Build item | Size | Stream |
|---|---|---|---|
| 1 | Tokens, fonts (Sprat local VF with the axis mapping; Host Grotesk; Datatype), grid, the full static page with all copy, and a no-JS complete state | M | C (DOM) |
| 2 | Fluid class + field pass + display shader (strain light, sparkle, halo, grain) | L (critical path) | A (WebGL lead) |
| 3 | Hull registry `useHull` + obstacle pass + text scrim | M | A + D |
| 4 | Hero intro: lamp, dark adaptation, rake, wordmark planting | M | A + C |
| 5 | Threshold instrument (CPU stimulus maths) + Limit charge view | S | C + A |
| 6 | Micro layer (spindle SDF, organelles by `uDay`, poke flash, fatigue) + Cell pin | M | B |
| 7 | Clock dial (SVG ring, slider a11y, local time, day palette via CSS vars) | S to M | B + C |
| 8 | Vessel flask SDF, walls, pour, split | M | A |
| 9 | 1833 hull obstacle + SplitText words lit by hull x + horizontal pin (vertical on mobile) | M | A + C |
| 10 | Reserve form (validation, states, honest submit) + ring + dawn footer + 404 + colophon dialog + L gesture | M | C + D |
| 11 | Night gauge + nav + mobile menu lid + Motion/Sound toggles | S | C |
| 12 | Tiers, reduced motion, no-WebGL, poster capture, context loss, QA gates | M | D |
| 13 | Web Audio | S | D (P2) |

**Timeline and gates:**
- **T+1:00, look gate.** The hero water answers the pointer with strain light and sparkle. A blind screenshot test against anti-slop #4 must read as "a photograph of a real wake", not "neon on black". If it fails, tune before going further (§8.3 R1).
- **T+2:00.** Hulls, intro, threshold and limit.
- **T+3:00.** Micro, Clock, Vessel and Reserve.
- **T+3:30.** 1833 and all fallbacks.
- **T+4:00.** QA pass (06 anti-slop §5 plus 04 techniques §4.3).

### 8.2 Cut order if behind (never cut the hero reveal, hulls, charge map or Reserve)
1. Sound.
2. The 1833 moving hull: keep the quote as a static typographic chapter; scroll hulls still throw light.
3. The vessel split animation: keep the line.
4. The micro layer: Cell uses the macro zoom plus a static still; the Clock keeps its DOM palette switch.
5. The kinetic `wdth` heading.

### 8.3 Risks and mitigations
| # | Risk | Mitigation |
|---|---|---|
| R1 | Dark plus blue reads as the generic neon-on-black default | Light only from strain (stroke edges, not fills); discrete sparkle cells; white cores and teal scatter rather than flat cyan; blue never in CSS; a gold UI accent; a day chapter and a dawn ending. Checked at the T+1:00 gate. |
| R2 | Obstacle boundaries cause fluid artefacts | Use a velocity override only, rounded rects with 6px padding, and a cap of 16. If unstable, keep the scrim and add emission at rect edges proportional to relative velocity. |
| R3 | GPU cost of the full-resolution display at DPR 1.75 | Default DPR 1.5; the simulation and field at fixed size; halo at ¼ resolution; measure first on Chrome and Safari. |
| R4 | Scope (9 sections, 2 visual systems) | Parallel streams, strict gates, the cut order above. |
| R5 | Sprat's non-standard axes | Documented mapping (§5.1); set every display role through `font-variation-settings`. |
| R6 | Text contrast over light | Hull rects are solid (no flow, no light) and scrimmed ×0.3; contrast is checked per chapter in both day and night. |
| R7 | Dishonest form | Store submissions for real (a route handler writing to a server-side store, or an env-configured provider). If nothing is stored in this build, the success copy says only what is true. Never promise an email we cannot send. |
| R8 | Flashing | Cap at 3 flashes per second over 25% of the viewport; a single ring; peak luminance capped in the tone mapper. |
| R9 | Name collisions (small "Ardora" businesses) | Acceptable for a concept; flagged for a trademark check. |
| R10 | Science accuracy | Every fact in §10. Scintillon migration is documented in *P. lunula*, and in *P. fusiformis* as "organellar movements". If QA cannot confirm it for *fusiformis*, change the Clock line to "…while, in its cousin *P. lunula*, the light-makers move to the edges". |

---

## 9. Anti-slop compliance

**Un-ban rationales (one sentence each, as 06 §1 requires):**
- **#4 near-black + one saturated accent:** the ground is algae-tinted seawater at night, and the blue is never paint: it exists only as light emitted where the visitor's stir crosses the simulation's threshold, while the UI accent is the cell's own gold pigment.
- **#10 dark by default:** the use scene is a bedside object at night and the organism only glows in the dark; the page still has a day chapter and ends at dawn.
- **#33 / #36 numbers and time strips:** the story hours are the narrative sequence and the chapter navigation, and they drive the shader's glow-capacity curve.
- **#41 particles:** each spark is a cell, a hashed site with its own threshold and presence from the density field; it is the world's material.
- **#47 cursor effect as the idea:** the pointer is one of four inputs (intro rake, scroll, keyboard, pointer) into a simulated world with memory, and the page is complete without a pointer.

**Checked:**
- No gradients in CSS, gradient text, glass, blobs, bento, three-card rows, eyebrows, section numbers, scroll cues or percentage loader.
- No custom cursor, magnetic buttons or marquee.
- SplitText is used once, and meaningfully.
- No stock photos, SVG illustrations (the dial is a data graphic; the flask and cells are SDF shaders) or emoji.
- No testimonials, logos or invented metrics.
- Section families: 9 distinct, none repeated.
- The copy drafts contain no em dashes, en dashes or banned words.
- The Darwin excerpt deliberately starts one sentence in, skipping the sentence that contains a word from the 06 §4A list, so the banned-word grep stays clean.

**Headline test (could a competitor paste it?):**
- "The night sea, by the glass." Only a living-light product can say it.
- "Each spark is one cell." "Light starts with a stretch." "It tires, like you do." All organism-specific.
- "By day it drinks light. By night it gives it back." Photosynthesis and bioluminescence, true.
- "Care is mostly leaving it alone." True of this product: no feeding.
- "Keep a night of your own." Closes the one-night arc.

---

## 10. Sources

**Science** (checked 2026-09-29; the page cites these in "Sources"):
- Size (970 × 163 µm), non-motile, circadian glow, recovery (15 to 60 min; about 6 h when fatigued), division every 5 to 7 days: [Wikipedia, *Pyrocystis fusiformis*](https://en.wikipedia.org/wiki/Pyrocystis_fusiformis).
- 17 ms latency after the threshold, flash under 0.25 s, threshold strain rate below 100 s⁻¹ for *P. fusiformis*: [Frontiers in Marine Science 2023, *A review of mechanically stimulated bioluminescence of marine plankton*](https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2023.1299602/full).
- Chloroplasts dispersed by day and gathered at the centre by night in *P. fusiformis*: [Springer, *The Circadian Rhythms in Bioluminescence, Photosynthesis and Organellar Movements in the Large Dinoflagellate, Pyrocystis fusiformis*](https://link.springer.com/chapter/10.1007/978-3-662-39932-3_90). Scintillons at the periphery by night and central by day (*P. lunula*): [IJMS 2020, *Pyrocystis lunula, a case study*](https://doi.org/10.3390/ijms21051784).
- Care: 18 to 24 °C; 8 to 12 h of light; split every 3 to 4 weeks; about 1 h to adapt after lights-off; a few minutes of agitation, then a day to regenerate. From the [Carolina Biological care guide](https://www.carolina.com/teacher-resources/Interactive/care-guide-bioluminescent-dinoflagellates/tr41209.tr) and the [Bauhaus-Universität Weimar DIY Bio care notes](https://www.uni-weimar.de/kunst-und-gestaltung/wiki/index.php?title=GMU:DIY_Bio:_doing_things_with_biology/Frederic_Blais-Belanger/How_to_take_care&mobileaction=toggle_view_desktop).
- Emission about 475 nm; luciferin an open tetrapyrrole *thought* to derive from chlorophyll; scintillons: [PNAS 2005, dinoflagellate luciferase structure](https://www.pnas.org/doi/10.1073/pnas.0409335102) and [Chemistry World, *The chemistry behind sea sparkle*](https://www.chemistryworld.com/features/unravelling-the-chemistry-behind-the-seas-bioluminescent-sparkle/4022961.article).
- *Mar de ardora* (luminous sea): [Wikipedia (es), *Mar de ardora*](https://es.wikipedia.org/wiki/Mar_de_ardora). The RAE lists *ardora* and *ardentía* as marine phosphorescence.

**Text:** Charles Darwin, *The Voyage of the Beagle* (1845 ed.), ch. VIII, public domain; verbatim text checked against [infidels.org chapter VIII](https://infidels.org/library/historical/charles-darwin-voyage-of-beagle-chapter8/). December 1833 per [The Beagle Project](https://beagleproject.wordpress.com/2012/10/24/billows-of-liquid-phosphorus-and-darwins-inspiration/).

**Fonts:**
- Sprat: [collletttivo.it/typefaces/sprat](https://www.collletttivo.it/typefaces/sprat) · repo `github.com/collletttivo/sprat` (OFL-1.1 `LICENSE.txt`; `fonts/SpratVF.woff2`; axes read from `fvar` locally).
- Host Grotesk and Datatype: Google Fonts, OFL, present in Next 16.3.6 `font-data.json` (checked in `node_modules`).

**Techniques:** 04-research-techniques T01, T02, T03, T04, T05, T09, T11, T16, T17-style state change (CSS vars, not a View Transition, because the dial drags), T18, T19 (in-canvas), T20, T22, T23, T25-style rect tracking, T35, T36, T38. Stable Fluids: Stam (1999); GPU approach after [Dobryakov, MIT](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation).
