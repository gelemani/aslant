# Concept 3: OVERTIDE (direction: Time and Sound)

Creative director's concept. Written 2026-09-29, after reading dossiers 01 to 06 in full.
Every number in this document is either verified against a source (listed in section 14) or computed from the verified constants (the scripts are reproducible and the outputs are quoted). Where a value is a design model rather than a measurement, it is labelled **model**.

---

## 0. The idea in four lines

**One sentence (the jury test):** Overtide is a concert that lasts exactly one tide. The page *is* that tide, from dusk high water to dawn high water, and the sea's own chord plays underneath it.

**The true fact under everything:** the tide is literally a sum of slow sine waves ("harmonic constituents") with fixed astronomical periods. Raise them all by the same **22.23 octaves** and they become an audible chord. The Moon's wave (M2) lands on **110 Hz**, the Sun's (S2) on **113.86 Hz**, and the two beat against each other **3.86 times a second**. That beat is the spring-neap cycle, played at audible speed: **one second of the chord holds 57 days of sea.** In shallow water the tide also grows harmonics of its own, and oceanographers call them *overtides*. That is the name.

**World sentence:** a fixed over-under view of a North Sea harbour at night: one waterline splits the screen into air and water. It falls and rises with the tide as you scroll, bends into a chart whenever time needs to be seen, and the letters of the name stand in it like pilings.

**Interaction sentence:** scroll moves the tide and the night forward; pointer and touch **pluck the waterline like a string**; stillness develops the image like a long exposure; the hour slider previews one hour of the tide and holds it.

Design read: *an event landing page for a durational concert, for listeners and culture travellers who want slowness, with a nocturnal, exact, scientific-poetic language, leaning toward instrument-grade editorial minimalism over one live GLSL sea.*
Dials: DESIGN_VARIANCE 8 · MOTION_INTENSITY 7 (slow, but everything moves for a reason) · VISUAL_DENSITY 3.

---

## 1. Brand

| | |
|---|---|
| **Name** | **Overtide** |
| **Slug** | `overtide` (npm-safe, lowercase, no scope) |
| **Etymology** | A real oceanographic term: a harmonic of a tidal constituent generated in shallow water (M4 = 2 x M2, M6 = 3 x M2). Wikipedia's constituent table groups M4, M6 and M8 under "shallow water overtides of principal lunar". The word also holds *overtone* (sound), *tide* (time), *over time* and even *overture*. |
| **Mark** | A plotted equation, not a drawing: one M2 period with its first overtide, `y = cos t + 0.30 cos(2t + 100deg)`, t over 0 to 2 pi. It shows a long, shouldered fall (6.96 h) and a steep rise (5.46 h), which is the real flood-dominant asymmetry of shallow estuaries. It reads like a wave gathering to break. It stays legible at 16 px (tested). Generated as an SVG path from the formula, so it is a data graphic, not a model-drawn illustration. |
| **Name check** | "Overtide" is used by a small Thai T-shirt label (overtidebrand), a script font on MyFonts/Envato and a San Diego design studio (OverTide Creative). None of them is in music, events or sound, and none is a well-known brand. Fallback names, if the client objects: *Lunga* (score marking for a very long hold) or *Tidechord*. |

**Offer.** A proposed durational concert: **one chord built from the tide's constituents, played on a harbour wall on the North Sea from the evening high water to the morning one**, on the equinoctial spring tide of **the night of 23 to 24 March 2027**. The chord never stops. It brightens as the water falls (the overtides grow in shallow water) and fills out again as the tide returns. People come for an hour or stay all night. Blankets are provided and sleeping is allowed. The exact place is sent with your hour.

- Date basis (computed with Jean Meeus's lunar phase algorithm, *Astronomical Algorithms* ch. 49): full moon **22 March 2027, 10:45 UTC**, two days after the March equinox. Spring tides arrive a day or two after full moon on most coasts, and equinoctial spring tides are among the largest of the year.
- The concert's length is set by the Moon, not the local coast: **one M2 period, 12 h 25 min 14 s.** This keeps the headline number exact whatever the harbour does.

**Audience.** Adults from 25 to 55 who travel for unusual nights: listeners of drone, ambient and durational music (the La Monte Young, Eliane Radigue and sleep-concert crowd), design and culture people living through the "opt-out" slowness moment (dossier 01, 1.15), and, as a second audience, the Awwwards jury.

**Conversion goal.** **"Hold an hour."** You choose one hour of the tide on a live tide curve, listen to it, and leave an email to hold it: a waitlist that carries a chosen slot. Holding is free, and we confirm when the place is set. Secondary goals: turning sound on, and staying still at low water (the hidden layer).

**Honesty frame.** The colophon says it plainly: *"Overtide is a proposal for a concert. The tide is real."* All tide physics on the page is true and sourced. Heights come from a labelled **model** spring tide. The Moon's phase is computed live. There is no proof, logo, quote or metric we do not have.

**Voice.** Plain, exact, a little dry, physical verbs: fall, rise, hold, pull, pulse, surface, thin. It names numbers when they are true. It speaks as the event, never as a SaaS. No hype words (dossier 06, 4A), no em or en dashes, no "not X, but Y".

---

## 2. Core metaphor and narrative arc

**Metaphor:** *the page is one tide.* Scroll position is tide time. The screen is a tide gauge you look through: a fixed over-under camera on a harbour wall, with air above the waterline and water below it. The waterline's height on screen **is** the tide height of the **model** spring tide at the current page time.

**The tide model used for the timeline (model, labelled in the colophon):** `h(t) = 2.55 + 2.25 cos(2 pi t / 12.4206012 h)` metres. High water 4.80 m, low water 0.30 m, range 4.50 m, which is the M2 wave at spring amplitude. A **tide hour** is 1/12 of the cycle: **62 min 06 s**. The rule of twelfths applies: the water moves 1, 2, 3, 3, 2, 1 twelfths of the range (0.38, 0.75, 1.13, 1.13, 0.75, 0.38 m) in successive tide hours.

**Screen mapping:** waterline y (fraction of viewport height, from top) = `lerp(yHW, yLW, (4.80 - h) / 4.50)`, with desktop yHW 0.54 and yLW 0.90, and mobile yHW 0.43 and yLW 0.92.

### 2.1 Timeline ledger (single source of truth for all chapters)

Times are floored to the minute (clock convention) and computed from the constant, never hand-typed.

| Chapter | id | Page time (tide hours) | Clock | Water (model) | Sky | Waterline mode | Sound when on |
|---|---|---|---|---|---|---|---|
| C0 Hero | `top` | 0 to 1 | +00:00 to +01:02 | 4.80 to 4.43 m | dusk | world | full chord, overtides faint |
| C1 The concert | `concert` | 1 to 2 | +01:02 to +02:04 | 4.43 to 3.68 | dusk to night | world | overtides rising |
| C2 The chord | `chord` | 2 to 3 | +02:04 to +03:06 | 3.68 to 2.55 | night | **graph** (72 h window) | the five staff voices, toggleable |
| C3 The beat | `beat` | 3 to 5 | +03:06 to +05:10 | 2.55 to 0.68 | night | **graph** (time-lens 3 d to 57 d) | M2 + S2 isolated, beating 3.86 Hz |
| C4 Low water | `low-water` | 5 to 7 | +05:10 to +07:14 (LW +06:12) | 0.68, 0.30, 0.68 | deepest night | world, stillness exposure | thins to one held note (M4) |
| C5 Twelfths | `twelfths` | 7 to 9 | +07:14 to +09:18 | 0.68 to 2.55 | night | world | low notes return, flood air |
| C6 Your hour | `your-hour` | 9 to 11 | +09:18 to +11:23 | 2.55 to 4.43 | blue hour | **graph** (the concert, 12 h 25 min) | preview of the chosen hour |
| C7 High water (dawn interval, bookend, colophon) | `high-water` | 11 to 12 | +11:23 to +12:25 | 4.43 to 4.80 | dawn | world | chord closes |

Arc mapping (dossier 02, 2.3): **hook** C0 · **context** C1 · **journey** C2 and C3 · **climax of stillness** C4 (the emotional peak is silence, dossier 01, 1.15) · **agency** C5 and C6 · **resolution** C7 (dawn, the accent becomes the sunrise).

Tempo contrast: dense (C2, C3) is followed by near-empty (C4), then dense (C5), then instrument (C6), then quiet (C7).

Every chapter has a different layout family (8 families: Stage, Manuscript, Score, Time-lens, Void, Ledger, Instrument, Horizon/Colophon) and an interaction (pluck everywhere, plus toggles in C2, scrub-zoom in C3, stillness in C4, row preview in C5, slider and form in C6).

### 2.2 Chapter specs

Copy below is draft-final. Shipped strings use the typographic apostrophe (’) and no em or en dashes. Headline caps: 7 words in the hero, 8 elsewhere. Every number in copy is rendered from `tide.ts` constants, so it cannot drift.

---

#### C0. Hero: "High water" (`#top`, +00:00)
Full spec in section 3. Summary:
- **Purpose:** the one image, the brand, the offer in one line, the CTA.
- **Layout family:** *Stage*. The monumental wordmark stands in the water. A large empty sky is above it, and the statement sits under the surface.
- **Copy:**
  - H1 (one element, two visual parts): wordmark **OVERTIDE** (rendered in WebGL; DOM text transparent) and the statement **"One chord, held for one tide."**
  - Sub: **"A concert from one high water to the next, twelve hours and twenty-five minutes long. Next: 23 March 2027."** (19 words)
  - CTA: **"Hold an hour"** (scrolls to `#your-hour`)
  - Data label (Datatype, beside the waterline, right edge): `4.80 m` / `High water, +00:00`
- **Motion:** the seiche intro (the harbour rings once), then pluckable waterline. Statement lines rise from a mask with the twelfths ease.
- **WebGL:** world mode. Letters texture with broken-straw refraction, lamp, marine snow, dusk sky.

#### C1. "The concert" (`#concert`, +01:02)
- **Purpose:** context. What it is, when, where, how long, what to bring.
- **Layout family:** *Manuscript*. One narrow column at `--gutter`, max 56ch, and a deliberately empty right two-thirds: sky, lamp and water. Mobile: single column.
- **Copy:**
  - H2: **"Arrive at any hour. Leave at any other."**
  - Body: **"Overtide is one chord, played on a harbour wall on the North Sea from the evening high water to the morning one. It never stops. It brightens as the water falls and fills out again as the tide returns."** (41 words)
  - Definition list (Host Grotesk labels, sentence case):
    - *When*: "The night of 23 to 24 March 2027, on the equinoctial spring tide, among the largest of the year."
    - *Where*: "A harbour wall on the North Sea. The exact place comes with your hour."
    - *How long*: `12 h 25 min 14 s`, "one turn of the Moon's tide."
    - *Bring*: "A coat. Blankets are there. Sleeping is allowed."
- **Motion:** the H2 arrives with a **waterline wipe** (see 6.4); the body fades in only. Marine snow drifts seaward (left) because the ebb current is running.
- **WebGL:** world mode. The waterline falls 0.75 m (visible descent). The sky darkens from dusk to night.
- **Five questions:** the idea is the practical facts of a night-long concert. Manuscript is unused elsewhere. The focal motion is the falling waterline, which means time passing. A competitor could not paste this, because the facts are ours. At 390px it is a single column; with reduced motion it is static; without WebGL the CSS waterline moves via scroll-driven CSS.

#### C2. "The tide is a chord" (`#chord`, +02:04). Signature moment 2
- **Purpose:** the true idea. Five constituents sum to the sea, and raised 22 octaves they are notes. The name is explained here.
- **Layout family:** *Score*. A full-bleed **five-line staff** across the sky. The labels sit at the left margin like a clef, and the waterline below becomes their sum.
- **Sequence (scrubbed by the section's progress):**
  1. Enter: five parallel hairlines, instantly read as a music staff.
  2. They **wake up**: each line bends into its constituent's sine, drawn over a 72-hour window with true relative periods and amplitudes.
  3. The flat waterline below **morphs into their sum**. The sea becomes an area chart made of water and sky. A lamp-coloured "now" dot marks the current page time on the curve.
- **Interaction:** each staff line is a real `<button aria-pressed>` with a 44 px hit band. Tap or click takes the constituent **out of the sea**: the line dims to 20%, the waterline curve reshapes over 2 beats, and (sound on) that voice fades out. Hover or focus sounds a soft preview of the voice. Order is top to bottom by pitch, as on a staff:

  | Line | Button label (line 1) | Data (Datatype, line 2) | Equilibrium amplitude (M2 = 100) |
  |---|---|---|---|
  | 1 | S2 Sun | `12 h 00 min · 113.86 Hz` | 45.8 |
  | 2 | M2 Moon | `12 h 25 min · 110.00 Hz` | 100 |
  | 3 | N2 Moon, far and near | `12 h 39 min · 107.93 Hz` | 19.2 |
  | 4 | K1 Moon and Sun, tilt | `23 h 56 min · 57.08 Hz` | 58.3 |
  | 5 | O1 Moon, tilt | `25 h 49 min · 52.92 Hz` | 41.7 |
- **Copy:**
  - H2: **"The tide is a chord."**
  - Body: **"Five slow waves, pulled by the Moon and the Sun, add up to the water you see. Each keeps its own time. Raise them twenty-two octaves and they become notes."** (31 words)
  - Affordance line: **"Tap a line to take it out of the sea."**
  - Name note (after the staff): **"Where the water is shallow, the tide grows overtones of its own. Oceanographers call them overtides."**
  - Caption (Datatype, small): "Periods from the tide-generating force. Loudness starts from each wave's share of the pull, then is mixed by ear."
- **Mobile:** the staff spans the width with labels above each line, and lines 48 px apart (touch targets). The graph window shrinks to 48 h.
- **No-JS / no-WebGL:** the staff and the sum curve are SSR-rendered SVG paths computed from `tide.ts` at build time. The toggles still work in JS without WebGL (the SVG sum is recomputed).

#### C3. "A spring tide is a beat" (`#beat`, +03:06). Signature moment 2, second half
- **Purpose:** the aha. Two close notes beat, and M2 against S2 **is** the spring-neap cycle. Then: squeeze 57 days into one second and you can hear it.
- **Layout family:** *Time-lens*. A tall section (desktop 240svh, mobile 180svh) with `position: sticky` text. The canvas is fixed anyway, so **no ScrollTrigger pin is needed**; section progress scrubs the lens.
- **Sequence (progress 0 to 1, log-scaled window W):**
  - 0 to 0.15: W = 3 days. Only M2 and S2 remain (the other lines fade from the staff above; the audio isolates them).
  - 0.15 to 0.6: W grows to **29.53 days** (one synodic month). The fast wiggle compresses and a **swelling envelope** appears. Phase labels fade in at their true positions: *New moon* (0 d), *First quarter* (7.38 d), *Full moon* (14.77 d), *Last quarter* (22.15 d).
  - 0.6 to 1: W grows to **56.93 days**, the length that fits in one second of the chord. The labels swap to seconds (`0 s`, `0.5 s`, `1 s`), and the envelope shows **3.86 pulses**, exactly what the ear hears. The readout ends on "57 days, played in one second".
- **Copy:**
  - H2: **"A spring tide is a beat."**
  - Body: **"Two notes a little apart pulse against each other. The Moon's wave and the Sun's are 3.5% apart, so the sea swells and slackens every 14.77 days. The swell is called spring."** (33 words)
  - Optional caption: "(It has nothing to do with the season.)"
  - End line: **"Squeeze 57 days into one second and you can hear it: 3.86 pulses a second."**
  - If sound is off, a contextual button: **"Hear it"** (turns sound on). This is the best-placed sound opt-in on the page.
- **Mobile:** on a 358 px canvas, W is capped at 20 days, with the envelope drawn as a second line beyond that, so each M2 cycle stays at least 6 px wide.
- **Reduced motion / no WebGL:** a static SSR SVG of the full month (curve and envelope) plus the end line.

#### C4. "Low water" (`#low-water`, +06:12 at centre). Signature moment 3
- **Purpose:** the calm climax. The water stands, and the page asks for nothing but stillness.
- **Layout family:** *Void*. 170svh with sticky content. The waterline sits at its lowest (y 0.90), so almost the whole screen is night sky. One short line of text sits left at the gutter, low. The Moon appears upper right, only if you stay.
- **Stillness mechanic:** when the section owns the viewport (exact progress) and there has been no scroll, no pointer movement and no key press for 1.2 s, `still` ramps from 0 to 1 over about 5 s:
  - The sea pass is accumulated into a long exposure (section 7.4). Marine snow dissolves into mist, and the waterline's residual tremble averages into one soft line.
  - Grain falls, as it would in a longer exposure.
  - The **Moon** develops upper right: an SVG disc with a computed terminator, opacity driven by `still`.
  - The hidden line fades in beside it (it is always in the DOM for screen readers): **"Tonight the Moon is 88% lit and waning. It is pulling on every ocean at once."** The percentage and waxing/waning are computed from the visitor's clock with Meeus's algorithm. For 29 September 2026, 21:00 UTC it gives 88%, waning, three days after the full moon of 26 September.
  - With sound on, the chord thins to one pure sine (M4, 220 Hz), which is the held note.
  - Any input resets `still` to 0 over 0.3 s, and the image "re-grains".
- **Copy:** H2 **"Low water."** Line: **"For a few minutes the sea hardly moves. Stay with it."** Data label: `0.30 m, +06:12`.
- **Touch:** "still" means no touch. The section is long enough that a thumb pause lands inside it.
- **Reduced motion:** the developed state is shown immediately (the whole page is already still), with the Moon and line visible.
- **Reference grammar, not copied:** the long-exposure seascape tradition (Hiroshi Sugimoto's *Seascapes*, and *Theaters*, where a whole film becomes one frame): time integrated into a single image.

#### C5. "A tide in twelfths" (`#twelfths`, +07:14)
- **Purpose:** the practical programme of the night, told through the sailor's rule. It also gives the flood its turn.
- **Layout family:** *Ledger*. A full-width tabular list in Datatype. **Each row is indented by its water height, so the column of times itself traces the tide curve** (concrete-poetry tide table): indent = `(4.80 - h) / 4.50 * 18vw` on desktop and `12vw` max on mobile.
- **Rows** (computed; 13 rows: time, change, height, what you hear):

  | Time | Change | Height | Note |
  |---|---|---|---|
  | +00:00 | | 4.80 m | High water. Every note in. |
  | +01:02 | -0.38 m | 4.43 m | One twelfth. |
  | +02:04 | -0.75 m | 3.68 m | Two twelfths. The first overtones surface. |
  | +03:06 | -1.13 m | 2.55 m | Three twelfths. Falling fastest. |
  | +04:08 | -1.13 m | 1.43 m | Three twelfths. The low notes thin. |
  | +05:10 | -0.75 m | 0.68 m | Two twelfths. |
  | +06:12 | -0.38 m | 0.30 m | Low water. One note left. |
  | +07:14 | +0.38 m | 0.68 m | One twelfth. The low notes return. |
  | +08:16 | +0.75 m | 1.43 m | Two twelfths. |
  | +09:18 | +1.13 m | 2.55 m | Three twelfths. Rising fastest, the air of the flood. |
  | +10:21 | +1.13 m | 3.68 m | Three twelfths. |
  | +11:23 | +0.75 m | 4.43 m | Two twelfths. First light. |
  | +12:25 | +0.38 m | 4.80 m | High water. The chord closes. |
- **Copy:**
  - H2: **"A tide in twelfths."**
  - Body: **"Sailors keep a rule for the tide: in each tide hour of 62 minutes the water moves one, two, three, three, two, then one twelfth of its range. The chord follows the same count."** (37 words)
  - After the table: **"Blankets and tea are there. Sleeping is allowed. Leave and come back whenever you like."**
- **Interaction:** hovering or focusing a row previews that moment. The world's waterline and sky glide to that row's height (2 beats, twelfths ease) and, with sound on, the chord moves there. Rows are focusable (`tabindex=0`, `aria-describedby` to the note).
- **Motion:** rows enter with a quarter-beat stagger (0.065 s), opacity only. The indent itself is the shape, so rows never slide in. The world waterline rises through this chapter, and marine snow now drifts landward (right).

#### C6. "Choose your hour" (`#your-hour`, +09:18). Signature moment 4, conversion
- **Purpose:** the CTA as an instrument.
- **Layout family:** *Instrument*. The waterline becomes the **whole concert as a curve**: x spans +00:00 to +12:25, one cosine from high to low to high. A one-hour window sits on it as a warm band in the water beneath the curve, and a lamp-coloured segment on the curve itself.
- **Control:** a native `<input type="range">`, visually aligned over the curve: min 0, max 685 minutes (the window start), step 5, PageUp and PageDown move one hour. `aria-valuetext` example: "From plus 2 hours 10 minutes to plus 3 hours 10 minutes. Water falling fast, 3.6 metres to 2.5 metres." While dragging, **the world previews your hour**: the background water level, sky light and (sound on) chord move to that hour's state.
- **Readout:** large display (Imbue 300, 64 to 88 px): `+02:10 to +03:10`. Datatype state line, computed: "Falling fast, 3.6 m to 2.5 m. Overtones surfacing." (model: 3.58 m to 2.48 m, falling 1.11 m per hour)
- **Form:** Email (label above; helper below: **"Two emails: when the place is set, and the day before."**). Submit: **"Hold this hour"**. States:
  - Idle, focus and hover (fill rises from the bottom like water, 2 beats).
  - Invalid: "That address looks incomplete." (aria-live polite, below the field).
  - Submitting: the button label becomes "Holding" and a hairline fills along the button's bottom edge.
  - Success: a small SVG ticket (the curve with your hour lit) and **"Held: +02:10 to +03:10, the night of 23 March 2027. We will write when the place is set."** One pluck of the waterline plays, plus (sound on) a soft swell.
  - Network error: "The hour could not be held just now. Try again in a minute."
- **Copy:**
  - H2: **"Choose your hour."**
  - Body: **"Every hour of the tide sounds different. Slide along the water to hear one, then hold it. Holding is free; we confirm when the place is set."** (28 words)
- **Backend:** POST to `NEXT_PUBLIC_HOLD_ENDPOINT` (Buttondown, Formspree or similar). Wiring a real list is a **launch blocker** listed in the handoff; the success copy promises emails.
- **No-JS:** a plain `<form>` with a `<select>` of the 12 tide hours plus email. With JS it upgrades to the slider.
- **Mobile:** stacked (readout, then curve full-width, then slider under it, then form).

#### C7. "High water" (`#high-water`, +11:23 to +12:25): dawn interval, bookend and colophon
- **Dawn interval (desktop 60svh, mobile 50svh, no text at all):** the sky lifts through the blue hour to dawn, the lamp fades out, and a thin warm band appears on the horizon. **The accent that was one lamp all night is now the sunrise.** The water rises the last twelfth. This is the only textless stretch, a breath before the end.
- **Bookend (100svh):** the wordmark returns, standing in the water at high water again, now **dark silhouettes against the dawn** (ink letters on mist sky, green underwater parts). Same frame as the hero, opposite light: this is the one deliberately repeated composition, and the repetition is the story, because the tide comes back.
  - Final line (Imbue): **"The water is back where it started."**
  - CTA: **"Hold an hour"**
- **Colophon (opaque `--c-mist-hi` panel that slides over the canvas like a shore):** *Horizon/Colophon* family, a three-column small-type grid (one column on mobile):
  - "Overtide is a proposal for a concert. The tide is real."
  - "The chord: eight tidal constituents raised 22.23 octaves, so M2 sounds at 110 Hz and one second holds 57 days of sea. Periods from Doodson's harmonic development of the tide; equilibrium amplitudes after Bosboom and Stive, *Coastal Dynamics*, TU Delft."
  - "NOAA adds 37 such waves to predict a tide. In 1872 William Thomson designed a machine of pulleys and a chain to do the same sum. This page does it in a fragment shader."
  - "Heights come from a model spring tide with a 4.5 m range. Moon phases are computed with Jean Meeus's algorithm."
  - "Type: Imbue by Tyler Finck (ETC), Host Grotesk by Element Type, Datatype by Frank Tisellano. All under the SIL Open Font License."
  - "Motion follows the rule of twelfths, which is almost exactly cubic-bezier(0.47, 0.14, 0.53, 0.86). The base duration is 259 ms: one pulse of the spring tide at this transposition."
  - Live: `This frame took 2.8 ms.` (the real value from the renderer, updated at 2 Hz; "No WebGL on this device" when there is no canvas).
  - Controls: Sound (switch), Motion: Full / Calm (segmented), and the mark with "Overtide, 2026".
- **The chord closes:** with sound on, the chord fades out across the bookend and reaches silence at +12:25. It resumes if you scroll back up.

---

## 3. Hero

### 3.1 Composition

Desktop, 1440 x 900 (fractions of viewport height, from the top):
```
 0.00 +--------------------------------------------------------------------------------+
      | [mark] Overtide             [~.~ +00:00 High water]        Sound (~)  Hold an hour |  nav, 64px, no background, top scrim only
      |                                                                                |
      |                              (empty dusk sky)                                  |
 0.24 |  O    V    E    R    T    I    D    E        <- Imbue 300, font-size            |
      |  |    |    |    |    |    |    |    |           min(41.5vw, 66svh),             |
      |  |    |    |    |    |    |    |    |           caps 0.24 to 0.655              |
 0.54 |~~====~~====~~====~~====~~====~~====~~====~~~~~~~~~~~~~~~~~~*~~~~~~~~ 4.80 m ~~| <- the waterline (1.5px meniscus), lamp * at x 0.78
      |  |    |    |    |    |    |    |    |    underwater: lower third of the caps   |
 0.655|  (refracted: shifted and magnified 1.33x, "broken straw")      warm lamp glow  |
 0.70 |  One chord, held for one tide.                   (H1 statement, Imbue 300 66px)|
      |  A concert from one high water to the next, twelve hours                        |
      |  and twenty-five minutes long. Next: 23 March 2027.   (Host Grotesk 18/1.5)     |
      |  [ Hold an hour ]                                     (lamp fill, abyss text)   |
 1.00 +--------------------------------------------------------------------------------+
```
Mobile, 390 x 844. **The word breaks at the water:** OVER stands in the air and TIDE is under the surface.
```
 [mark]      [+00:00 ~.~]   Sound   Index
 O  V  E  R        caps 0.18 to 0.40, font-size ~290px
~~~~~~~~~~~~~~~~~~~~~~~~~~*~~~   waterline 0.43, lamp at x 0.82
 T  I  D  E        0.46 to 0.68, fully underwater, refracted
 One chord, held
 for one tide.                   H1 30px, 2 lines
 A concert from one high water to the next, ...   15px, 3 lines
 [ Hold an hour ]                bottom 0.97
```

### 3.2 Static first frame (complete without JS or WebGL)
The CSS poster in `StageRoot`'s `poster` slot is a composed image, not a gradient:
- **Sky and water:** `linear-gradient(to bottom, #0D2524 0%, #16302F 54%, #071A19 54.01%, #04100F 100%)`. The waterline is a 1px `--c-foam` line at 62% opacity (pseudo-element), with a 6px soft glow below it at 8% opacity.
- **Wordmark:** the DOM `<span class="wordmark">Overtide</span>` inside the H1, uppercase via `text-transform`, rendered twice:
  - The above-water copy is clipped with `clip-path: inset(0 0 var(--below) 0)` in `--c-foam`.
  - The underwater copy is an `aria-hidden` duplicate clipped to the lower part, in `#4E7770`, with `transform: translateX(0.6%) scaleY(1.06)`, `transform-origin` at the waterline, and `filter: blur(0.4px)`. That is the broken-straw offset, readable as "in water" with zero JS.
- **Lamp:** a 4px `radial-gradient` dot at (78%, 53.4%) in `--c-lamp`, plus an 18% elliptical warm glow below it into the water.
- **Moving waterline without JS:** `@supports (animation-timeline: scroll())`: the poster's waterline `translate` follows a keyframe list of the tide curve over `scroll(root)`, so even tier 0 gets a tide (Chrome/Edge, Safari 26+). Without support it stays static.
- Statement, sub and CTA are real SSR text. The H1 and wordmark are the LCP candidates and are never hidden behind an overlay.

### 3.3 Intro choreography: the seiche (first ~3 s)
No loader overlay and no percentage counter. Act zero is **the harbour ringing once**. A seiche is the standing wave of a harbour, and its first mode tilts the surface like a seesaw about a central node. It strikes the page like a bell before the chord.

| t (from canvas first frame) | What happens |
|---|---|
| 0.00 to 0.24 s | The canvas cross-fades over the identical poster (240 ms). The still image comes alive: marine snow starts to drift and the meniscus starts to shimmer. |
| 0.00 to 3.10 s | **Seiche:** the waterline tilts about the screen centre, `tilt(t) = 0.9deg x e^(-t/0.95s) x cos(2 pi t / 1.554s)`, about ±11px at the edges on the first swing, then 4px, then 1.3px. The period is exactly 6 beats (1.554 s). The underwater letter parts slosh with it. This is the page's **only** oscillating motion, and it plays once. |
| 0.50 s | The H1 statement rises from a line mask: `yPercent 110 to 0`, 4 beats (1.036 s), `twelfths` ease. This is SplitText's single use on the page. |
| 1.30 s | The sub fades in (opacity only, 2 beats). |
| 1.80 s | The CTA and nav fade in (2 beats). The `4.80 m` label decodes (ScrambleText on digits only, 2 beats, final text in `aria-label`). |
| ~3.1 s | Settled. |

- Lenis is **not** stopped during the intro. Any scroll or key press jumps the intro timeline to `progress(1)`. Nav, message and CTA are usable at once (rulebook 5.5).
- Warm cache: identical. It is short enough, and the seiche *is* the brand moment.
- Reduced motion: no seiche and no rise. Everything is visible, and the canvas renders one frame.
- Real work hidden inside it: `gl.compileAsync`, wordmark rasterisation after `document.fonts.load('300 100px <imbue family>')`, and one string-sim step. The canvas does not fade in until the first real frame (the existing `Stage` lifecycle sets `webgl: 'ready'`).

### 3.4 Pointer response: pluck the horizon (signature moment 1)
- **The waterline is a string.** Pointer or finger **crossing** the waterline plucks it at that x. Strength scales with vertical crossing speed (`amp = clamp(|vy| x 0.004, 2, 14) px`, signed by direction). A 1D wave simulation (section 7.5) splits the pluck into two pulses that run to the screen edges, reflect, and die away in about 1.5 s. Standing waves appear if you keep plucking: resonance, made visible.
- With sound on, each pluck plays a **tone from the tide chord**, chosen by the x zone (left to right, low to high: 105.8, 114.2, 215.9, 220, 227.7, 440, 447.7, 660 Hz, the chord's tones doubled to be audible on laptop speakers). It is panned by x and its level follows the pluck strength.
- It is active in world mode only (not while the waterline is a chart), so data is never distorted.
- No hint text and no custom cursor. The line spans the full width, so every pointer crosses it within seconds. The first time sound is switched on, one line appears near the toggle: **"Cross the waterline to pluck it."**
- Touch: drag across the line, or tap directly on it (±16px band).

### 3.5 The one image people will remember
**Pale, giant letters standing in black-green water like pilings, cut by a single trembling line of light. Below the line the letters are broken and magnified like a straw in a glass. One sodium lamp burns on the water at the right.** At the end of the page the same letters stand black against a dawn sky.

---

## 4. Signature moments

1. **Pluck the horizon** (participatory, everywhere). The waterline is a playable string. With sound on, it is also the page's **oscilloscope**: the real audio output (AnalyserNode) is written onto the waterline at ±3px, so you *see* the chord beat on the horizon. Image and sound are one instrument (dossier 01, 1.14).
2. **The sea is the chart** (C2 into C3). A music staff wakes into five true tide waves. The waterline melts into their sum, so the water itself becomes an area chart you can edit by taking waves out of the sea. Then a **time-lens** zooms from 3 days to a month to 57 days, and the picture you are looking at becomes, exactly, one second of the sound you are hearing: 3.86 pulses. The claim is true, and you can check it by ear.
3. **Low water: hold still** (participatory by stillness, C4). The only interaction on the page is to stop. The image develops like a long exposure, the real tonight's Moon appears, and the chord thins to a single held note. A juror will describe it as "the site that waits for you".
4. **Choose your hour** (functional, C6). The booking control is a slider along the whole concert's tide curve. The world behind it previews the chosen hour in water level, light and sound before you hold it. The conversion is the art piece's last interaction, not a form bolted on.

---

## 5. Typography, colour and materials

### 5.1 Faces (all from dossier 03; all OFL-1.1; self-hosted by `next/font/google`)

| Role | Face | Source / licence | Why this face and no other |
|---|---|---|---|
| Display: wordmark, H1, H2, big readouts | **Imbue** (Tyler Finck, ETC), variable `wght 100-900`, `opsz 10-100` | Google Fonts, OFL-1.1 (`ofl/imbue/METADATA.pb`) | A tall condensed Didone. At `wght 300, opsz 100` the capitals stand like **pilings or organ pipes**, and the hairlines are as thin as the waterline that cuts them (specimen rendered and checked). Dossier 03 #4: "Thin weights at huge size look like engraved glass." It is not on the reflex list (dossier 06 #15). |
| Text and UI | **Host Grotesk** (Element Type, Dogukan Karapinar, Ibrahim Kactioglu), `wght 300-800` | Google Fonts, OFL-1.1 | Calm, open, slightly wide, and legible light-on-dark at 17 to 18px (rendered next to Pliant, which set tighter and busier). It is not on the reflex list. |
| Data only (times, heights, Hz, periods, frame time) | **Datatype** (Frank Tisellano), `wdth 50-150`, `wght 100-900` | Google Fonts, OFL-1.1, added 2026-02-25 | An instrument-panel data face with a real width axis, so tables can run condensed (`wdth 80-90`). It is new enough to carry no template associations. **Used only where the content is a measurement**, in sentence case with tabular numerals, never tracked-caps costume. |

```ts
// app/fonts.ts
import { Imbue, Host_Grotesk, Datatype } from 'next/font/google'
export const imbue = Imbue({ subsets: ['latin'], axes: ['opsz'], variable: '--font-imbue', display: 'swap' })
export const host = Host_Grotesk({ subsets: ['latin'], variable: '--font-host', display: 'swap' })
export const datatype = Datatype({ subsets: ['latin'], axes: ['wdth'], variable: '--font-datatype', display: 'swap' })
```
Measured latin woff2 sizes: Imbue 43 KB, Host Grotesk 20 KB, Datatype 77 KB, about 140 KB total. For the OG image (satori needs TTF), ship a static Imbue Light TTF in `/assets` (OFL permits).

**Scale (desktop 1440, obvious steps; mobile in brackets):**
- Wordmark (type as image): `min(41.5vw, 66svh)` at `wght 300`, `opsz 100`, tracking 0, uppercase. Cap height is 0.63em, and the word runs about 2.1em wide. Mobile stacked (two lines, OVER and TIDE): `min(74vw, 34svh)`.
- H1 statement and H2: `clamp(40px, 4.6vw, 76px)` at Imbue `wght 300`, `opsz 100`, line-height 0.98, tracking -0.012em, `text-wrap: balance`. Mixed case. No italics anywhere (no single-word accents).
- Big readout (C6): Imbue 300, `clamp(48px, 6vw, 88px)`.
- Body: Host Grotesk 400, 18/1.6 (17/1.55), max 56 to 60ch, tracking +0.005em on dark.
- UI and buttons: Host Grotesk 500, 15px (16px), line-height 1.
- Data: Datatype `wdth 85`, `wght 380`, 13px micro (14px), 17px in the C5 table (15px), `font-variant-numeric: tabular-nums`.
- Steps: 13 / 15 / 18 / 24 / 32 / 44 / 58 / 76 (about x1.33), with the wordmark outside the scale as an image.

### 5.2 Colour: strategy "Committed"
Sea-green owns about 85% of the surface. One warm accent covers under 2% of pixels until dawn, when it becomes the horizon. The palette comes from the physical scene: **a North Sea harbour at night, one sodium lamp, and then a cold dawn.** Contrast is measured with the WCAG formula.

| Token | Hex | Role | Measured contrast |
|---|---|---|---|
| `--c-abyss` | `#04100F` | page ground, deep water | |
| `--c-deep` | `#071A19` | water mid-tone, underwater panels | |
| `--c-swell` | `#0D2524` | raised UI surfaces (inputs, index dialog) | |
| `--c-horizon` | `#16302F` | sky at the horizon; decorative hairlines only | |
| `--c-foam` | `#E3ECE8` | primary text on night; the meniscus line | 16.05 on abyss, 13.33 on swell, 11.64 on horizon, 4.85 over underwater letters |
| `--c-kelp` | `#91A9A3` | secondary text on night | 7.74 on abyss, 6.43 on swell |
| `--c-rule` | `#5E7C76` | UI boundaries (input border, slider track) | 4.25 on abyss, 3.53 on swell |
| `--c-lamp` | `#E58A4E` | **the one accent**: the harbour lamp, CTA fill, "now" dots, focus ring, `::selection`, and later the sunrise band | 7.44 as text on abyss; abyss text on lamp 7.44; 5.39 on horizon |
| `--c-mist` | `#C7D3CF` | dawn sky and ground | |
| `--c-mist-hi` | `#DCE4E0` | dawn surfaces, colophon panel | |
| `--c-ink` | `#062220` | text on dawn; dawn CTA fill; letter silhouettes | 10.85 on mist, 12.90 on mist-hi |
| `--c-ink-2` | `#3C5552` | secondary text on dawn | 5.22 on mist, 6.21 on mist-hi |
| `--c-lamp-deep` | `#A2461C` | accent text and focus on dawn | 4.73 on mist-hi (AA), 3.98 on mist (large text and UI only) |
| `--c-rule-dawn` | `#5A746E` | UI boundaries on dawn | 3.28 on mist |

Rules:
- No `#000` or `#fff`.
- Never lamp text on mist (1.69, fails).
- On dawn, the CTA is ink fill with mist-hi text (12.90).
- `::selection` uses lamp background with abyss text. `caret-color: var(--c-lamp)`.
- Focus: `outline: 2px solid var(--c-lamp); outline-offset: 3px` (`--c-lamp-deep` on dawn).
- Scrollbar: thin, `--c-rule` thumb on a transparent track.
- The theme is locked: one continuous night scene. The single authored switch is the dawn, driven by scroll.
- The DOM flips to dawn tokens only inside the textless dawn interval, so no text ever sits on a mid-luminance sky.

**World-only colour keyframes** (shader uniforms, all converted through `THREE.Color` from the tokens):

| Page time | Sky top | Sky at horizon | Water | Lamp |
|---|---|---|---|---|
| 0 to 1.5 h (dusk) | `#0D2524` | `#1E3A38` | `#071A19` to `#04100F` | on |
| 2 to 9 h (night, darkest at 6 h) | `#06110F` | `#0D2524` | `#04100F` | on |
| 9.5 to 11.3 h (blue hour) | `#0B2230` | `#2B4A55` | `#0A1F24` | dims to 0.4 |
| 11.6 to 12.4 h (dawn) | `#9FB5B4` | `#DCE4E0`, warm band `#E58A4E` to `#F1C9A5` | `#6E8C87` to `#2A4744` | off |

### 5.3 Texture, grain, materials (every texture has a cause)
- **Grain is night ISO.** It lives in the compose pass, never as a DOM overlay (except the tier 0 poster). Luminance-weighted amplitude is 0.035 at night and 0.012 at dawn: darker means more noise, as in real low-light photography. It steps at 24 fps for a filmic feel. A ±0.5/255 dither kills banding in the long dark gradients. Long exposure (C4) visibly smooths it.
- **Water:** depth tint (Beer-Lambert `exp(-k x depth)` from `--c-deep` to `--c-abyss`) and **marine snow**: sparse suspended specks, 1 to 2.5 px, two parallax layers, that drift **with the tidal current** (left on the ebb, right on the flood, still at slack). Specks near the lamp's underwater glow are warm-lit. These are particles as a material of the world, not a starfield (dossier 06 #41).
- **Meniscus:** the only bright line on the page, 1.5 px of foam at 70% with a 2 px soft falloff. It is the waterline, the string and the oscilloscope.
- **Letters:** matte, pale foam above water with a faint cool gradient from the sky. Underwater they are tinted, magnified 1.33x vertically about the waterline and shifted sideways (broken straw), with a slight wobble from the surface waves. P2 details:
  - A **wet line**: letters stay darker where the water was recently, fading over about 20 s of page time, so the letters remember the tide.
  - Faint **caustics** on the submerged parts at dawn.
- **Lamp:** a 3 px warm core, a subtle halo (no bloom pass) and a soft warm column of light entering the water beneath it.
- **Corners:** 0 everywhere. Circles appear only as points on curves (the now-dots and the slider thumb).
- **Icons:** none. UI uses text labels ("Sound", "Index", "Close"). The only glyphs are the mark and data graphics.

---

## 6. Motion language

### 6.1 The tempo: one beat = 259 ms
The page's base unit is **one pulse of the spring tide at our transposition**: 1 / 3.856 Hz = 259 ms. Every duration is a whole or half number of beats, and they land inside the recommended ranges (rulebook 5.3).

```css
:root {
  --beat: 259ms;
  --t-half: 130ms;  /* press and hover feedback */
  --t-1: 259ms;     /* state change: toggles, switch, staff line on/off */
  --t-2: 518ms;     /* overlay, dialog, form state, hover fill */
  --t-4: 1036ms;    /* reveals (waterline wipe, statement rise) */
  --t-6: 1554ms;    /* hero focal beats; also the seiche period */
  --t-12: 3108ms;   /* world transitions when not scrubbed (sound fade-in) */
  --ease-twelfths: cubic-bezier(0.47, 0.14, 0.53, 0.86); /* rule of twelfths, error < 0.0001 at every tide hour */
  --ease-arrive: cubic-bezier(0.16, 1, 0.3, 1);           /* UI arrivals (expo out) */
  --ease-leave: cubic-bezier(0.7, 0, 0.84, 0);            /* exits, always faster (t-1 or t-2) */
}
```
GSAP: `CustomEase.create('twelfths', 'M0,0 C0.0556,0.0278 0.1111,0.0417 0.1667,0.0833 C0.2222,0.125 0.2778,0.1806 0.3333,0.25 C0.3889,0.3194 0.4444,0.4167 0.5,0.5 C0.5556,0.5833 0.6111,0.6806 0.6667,0.75 C0.7222,0.8194 0.7778,0.875 0.8333,0.9167 C0.8889,0.9583 0.9444,0.9722 1,1')` (Catmull-Rom through the seven twelfths points). Register `arrive` and `leave` from the same beziers. Scrubbed timelines use `ease: 'none'`.

**Where each ease is used:** `twelfths` for anything that depicts water moving (waterline tweens, row previews, waterline wipes, the statement rise, the tide-clock dot). `arrive` and `leave` for UI (dialog, form states, toggles). No bounce or elastic. The seiche is a physical damped cosine that plays once (see section 13).

### 6.2 Scroll feel
- Lenis only (existing `SmoothScroll`): `lerp 0.08`, `wheelMultiplier 0.9`, native touch, `anchors: true`. No `normalizeScroll`. No wheel trapping.
- **No ScrollTrigger pins at all.** Long chapters use `position: sticky` inner frames, which work with Lenis, while the fixed canvas does the "pinning".
- **Velocity is weather.** Smoothed scroll velocity (attack 0.025 s, release 0.175 s, technique T06) adds chop to the water and air noise to the sound, and brightens grain slightly. Scroll slowly and the sea goes glassy. **The page physically rewards slowness.**
- Page time comes from scroll with no integration. **Exact** time drives the nav clock, `aria-current` and the gating of stillness and the slider. **Damped** time (lambda 5.2) drives visuals (rulebook 6.4). Reverse scroll and reload land in the same state.

### 6.3 Stagger and triggers
- Line stagger is a half beat (0.13 s); table rows a quarter beat (0.065 s).
- Triggers use `start: 'top 78%'` and `once: true`.
- The stagger cap is 6 beats.

### 6.4 Reveals: the waterline wipe (one rule, H2s only)
Each H2 is revealed by `clip-path: inset()` as if the water were leaving or covering it, with a 1px foam hairline riding the clip edge. **The direction tells the tide**: top-down in ebb chapters (C1 to C3), bottom-up in flood chapters (C5 to C6). It takes 4 beats with the `twelfths` ease. Body copy uses opacity only (2 beats) and never slides. SplitText appears once, on the hero statement. This avoids fade-up everywhere (dossier 06 #52) and SplitText everywhere (#56). The focal motion of each chapter belongs to the world, not the text.

### 6.5 Hover and press
- **CTA (lamp fill):** on hover the fill **rises from the bottom like water** (a background clip, 2 beats, `twelfths`). Press: `translateY(1px)` over a half beat.
- **Links:** `text-underline-offset` 3 to 5 px over a half beat.
- **Staff lines:** hover thickens the line from 1 to 1.5 px and shows its readout.
- No magnetic buttons, no scale bumps, no shimmer.

### 6.6 Cursor decision
**The native cursor stays.** There is no follower or blob. The pointer acts on the world by plucking the waterline, which is additive, disabled under reduced motion, and has a touch equivalent.

### 6.7 Transitions between chapters
The transition is always **the tide itself**: the waterline's height, the light of the sky, and the waterline's mode morphing between horizon and chart over about 50svh of scroll. Nothing cuts or flashes. Chapters are states of one sea (dossier 06 #45).

### 6.8 Sound design summary (full engine in section 8)
Sound is off by default. The toggle is a `role="switch"` with a live 28 x 12 px oscilloscope of the real output (flat when off). The chord fades in over 12 beats (3.1 s). When on, the waterline carries the waveform. Each chapter shapes the mix (see the ledger in section 2.1). Everything works and looks complete when muted.

---

## 7. WebGL plan

### 7.1 One persistent canvas
There is one R3F `<Canvas>`, fixed full-viewport behind the DOM (existing `StageRoot` / `Stage`), with an orthographic pixel camera, `pointer-events: none` and `aria-hidden`. Pointer input comes from `window` (passive listeners), because the pluck needs crossing detection anywhere. No per-chapter canvases, no `View`, no 3D meshes, no GLB, no textures to download. **The only texture is the rasterised wordmark.** The world is entirely procedural, so page weight is fonts plus JS.

### 7.2 Render graph (a manual loop, `useFrame(..., 1)`, no EffectComposer)

| Pass | Target | When | Budget (M1, 1440 x 900 @ DPR 1.75) |
|---|---|---|---|
| **Sea**: sky, waterline (world or graph), underwater, letters, lamp, marine snow, dawn band | `rtFrame` (HalfFloat, canvas size) | always | ≤ 2.0 ms |
| **Exposure**: `accum = mix(accum, frame, k)`, ping-pong at half resolution | `rtAccum[2]` | only while `still > 0.001` (C4) | ≤ 0.3 ms |
| **Compose**: `mix(frame, accum, still)`, grain (night ISO), dither, vignette 6% | screen | always | ≤ 0.4 ms |

Total GPU ≤ 2.7 ms and JS ≤ 3 ms per frame. That leaves headroom at 60 Hz and allows a 120 Hz ProMotion display on tier 3. This follows dossier 06 #42: two post effects at most, both caused (grain as exposure, vignette as lens).

### 7.3 Uniforms and who owns them (one owner per uniform)

| Uniform | Source | Notes |
|---|---|---|
| `uRes`, `uDpr`, `uTime` | R3F state | `uRes` in device px |
| `uWaterY` | timeline, damped hours then `h(t)`, then screen fraction | desktop 0.54 to 0.90, mobile 0.43 to 0.92 |
| `uTilt` | intro timeline (seiche) | 0 after the intro |
| `uLine` (256 x 1, RG float) | JS every frame | R = string displacement (px), G = audio waveform (-1 to 1) |
| `uSound` | store `soundOn`, eased | scales the G channel (±3px) |
| `uGraph` | chapter scrub (C2, C3, C6) | 0 is world mode, 1 is chart mode |
| `uWinStart`, `uWinSpan` | chapter scrub | tide hours; C3 log-scrubs the span from 72 h to 1366 h (56.93 d) |
| `uGain[8]`, `uAmp[8]`, `uSpeed[8]`, `uPhase[8]` | `tide.ts` + staff toggles | constituent sum on the GPU |
| `uGraphScale` | layout | px per model metre; the curve spans ±12% of viewport height |
| `uNow` | exact page time | the lamp-coloured "now" dot on charts |
| `uHourBand` | C6 slider | x-range of the chosen hour (warm band under the curve) |
| `uNight`, `uDawn`, `uLamp` | damped hours | sky keyframes from 5.2 |
| `uCurrent` | `dh/dt`, normalised | marine snow drift direction and speed |
| `uChop` | smoothed scroll velocity | surface roughness, small |
| `uLetters`, `uLettersRect`, `uLettersOn`, `uLetterCol` | DOM-synced wordmark (hero, bookend) | `CanvasTexture` mask; colour switches foam to ink at dawn |
| `uStill` | C4 idle detector | 0 to 1 over about 5 s; reset over 0.3 s |

`lib/tide.ts` is pure TS with zero dependencies. It feeds the GLSL uniforms, the SSR SVG fallbacks, the audio engine and the copy numbers from the same constants.

### 7.4 Key shader pieces (sketch, WebGL2 via three `ShaderMaterial`)
```glsl
// Waterline in CSS px from the top. World mode: flat + string + audio + seiche. Chart mode: constituent sum.
float sumTide(float h){ float s = 0.; for (int i = 0; i < 8; i++) s += uGain[i]*uAmp[i]*cos(radians(uSpeed[i])*h + uPhase[i]); return s; }
float dSumTide(float h){ float s = 0.; for (int i = 0; i < 8; i++) s -= uGain[i]*uAmp[i]*radians(uSpeed[i])*sin(radians(uSpeed[i])*h + uPhase[i]); return s; }
float waterline(float xCss, float wCss, float hCss, out float slope){
  float xn = xCss / wCss;
  vec2 L = texture(uLine, vec2(xn, .5)).rg;
  float flatY = uWaterY*hCss + L.r + uSound*L.g*3.0 + tan(uTilt)*(xCss - .5*wCss);
  float h = uWinStart + xn*uWinSpan;
  float graphY = uWaterY*hCss - sumTide(h)*uGraphScale;
  slope = uGraph * (-dSumTide(h)*uGraphScale*uWinSpan/wCss);      // dy/dx for anti-aliasing
  return mix(flatY, graphY, uGraph);
}
// In main(): d = (yCss - waterline(...)) / sqrt(1. + slope*slope);  meniscus = exp(-(d/0.9)*(d/0.9));
// d < 0 is air: sky keyframes, letters above water, lamp core and halo.
// d > 0 is water: depth tint, lamp column, marine snow, letters sampled at the refracted position:
//   vec2 obj = vec2(xCss + d*0.04 + sin(uTime*1.3 + yCss*0.05)*1.2, wy + d/1.333);   // broken straw + magnification
```
- **Graph anti-aliasing:** the analytic derivative keeps the chart line at 1.5 px even when dense. Minimum cycle width is 6 px (the mobile span cap in C3).
- **Marine snow:** hash-grid cells in coordinates offset by `uTime*uCurrent`, two scales, soft discs. It is fully procedural, with zero allocation.
- **Letters texture:** the wordmark is drawn to a 2D canvas at DPR from the DOM element's computed font (technique T27, path 1) after `document.fonts.load`, and re-rasterised on resize (debounced 150 ms). Its rect is re-read every frame, but only while `#top` or the bookend is near the viewport. The mobile variant rasterises two lines.
- **Exposure:** `k = mix(1.0, 0.035, uStill)` on HalfFloat targets at half resolution, so there is no banding.

### 7.5 The string (CPU, about 0.05 ms per frame)
```ts
const N = 256, dx = 1 / (N - 1), C = 1.25 /* screen widths per s */, GAMMA = 1.6 /* damping per s */
const y = new Float32Array(N), v = new Float32Array(N)
export function stepString(dt: number) {
  dt = Math.min(dt, 1 / 30)
  const sub = Math.ceil((C * dt) / (dx * 0.8)), h = dt / sub, k = (C * C) / (dx * dx)   // CFL-stable substeps
  for (let s = 0; s < sub; s++) {
    for (let i = 1; i < N - 1; i++) v[i] += h * (k * (y[i - 1] - 2 * y[i] + y[i + 1]) - GAMMA * v[i])
    for (let i = 1; i < N - 1; i++) y[i] += h * v[i]
  }
}
export function pluck(xn: number, ampPx: number, w = 0.06) {           // triangular displacement, d'Alembert splits it
  for (let i = 1; i < N - 1; i++) { const d = Math.abs(i * dx - xn) / w; if (d < 1) y[i] += ampPx * (1 - d) }
}
// Crossing detection on pointermove: sign(prevY - wyAt(prevX)) != sign(y - wyAt(x)) and uGraph < 0.5, then pluck.
// wyAt() is the JS twin of the GLSL waterline for world mode. Upload y (R) and the analyser samples (G) to uLine each frame.
```

### 7.6 Quality tiers (existing `quality` store: high / medium / low)

| Tier | Who | What runs |
|---|---|---|
| **high** | Apple Silicon and desktop, fine pointer | Everything. DPR ≤ 1.75. Two marine-snow layers. Refraction wobble. Exposure pass. |
| **medium** | coarse pointer, `deviceMemory ≤ 4`, or a PerformanceMonitor decline | DPR 1.25. One snow layer. No wobble. Sea pass rendered at 0.75 scale. No exposure pass (C4 uses a cheap "calm" cross-fade instead). C3 span capped at 20 days. |
| **low / reduced motion** | `prefers-reduced-motion` or Motion: Calm | Render on demand, only on chapter change and resize. Snapped states per chapter. No seiche, no string, no drift. Graph morphs are instant. C4 is shown developed. |
| **none** | no WebGL2, context lost, or `Save-Data` | CSS poster with the scroll-driven CSS waterline, SSR SVG charts, the plain form. Complete and composed. |

- Offscreen and hidden: `document.hidden` stops the loop (existing).
- Context loss: `Stage` shows the poster, then on restore re-seeds the string and re-rasterises the wordmark.
- PerformanceMonitor steps DPR down by 0.25 before any feature is cut.

### 7.7 Fallback matrix

| Chapter | No WebGL | Reduced motion | No JS |
|---|---|---|---|
| C0 | CSS poster with broken-straw wordmark | static frame, text visible | same poster, text visible |
| C1 | CSS waterline via scroll timeline | static | static |
| C2 | SSR SVG staff and sum; toggles work in JS | SVG or canvas snapped, toggles instant | SVG, no toggles |
| C3 | SSR SVG month envelope and end line | static SVG | static SVG |
| C4 | text, plus the Moon in SVG if JS | developed state shown | text only |
| C5 | full table | full table, no row preview motion | full table |
| C6 | SVG curve, slider, form | same, instant preview | `<select>` plus email form |
| C7 | CSS dawn gradient, ink wordmark in DOM | static dawn | static dawn |

---

## 8. Sound engine (generative, opt-in, about 25 Web Audio nodes)

**Pitches.** `f = 110 Hz x speed / 28.9841042`. These are true constituent speeds; M2 is set to A2.

| Voice | Speed (deg/h) | Period | Hz | Gain (M2 = 1, equilibrium) | Bus |
|---|---|---|---|---|---|
| O1 | 13.9430356 | 25 h 49 min 10 s | 52.916 | 0.417 | deep |
| P1 | 14.9589314 | 24 h 03 min 57 s | 56.772 | 0.196 | deep |
| K1 | 15.0410686 | 23 h 56 min 04 s | 57.084 | 0.583 | deep |
| N2 | 28.4397295 | 12 h 39 min 30 s | 107.934 | 0.192 | main |
| M2 | 28.9841042 | 12 h 25 min 14 s | 110.000 | 1.000 | main |
| S2 | 30.0000000 | 12 h 00 min 00 s | 113.856 | 0.458 | main |
| K2 | 30.0821373 | 11 h 58 min 02 s | 114.167 | 0.129 | main |
| M4 / MS4 / M6 | 57.968 / 58.984 / 86.952 | 6 h 12 min 37 s / 6 h 06 min 12 s / 4 h 08 min 25 s | 220.000 / 223.856 / 330.000 | 0.35 / 0.16 / 0.12, times `shallow` | shallow (overtides) |

**Beats you can hear, all true.** S2 against M2 beats at 3.856 Hz (14.765 days, spring and neap). M2 against N2 at 2.066 Hz (27.555 days, perigee). K1 against O1 at 4.167 Hz (13.661 days, declination). K2 against S2, and K1 against P1, at 0.312 Hz: one slow swell every 3.2 s, which is the **182.6-day equinoctial cycle**. The equinox you booked is audible as the chord's slowest breath.

**Graph.**
1. All oscillators are sines, with ±1 cent random detune for life.
2. Voices feed per-voice gains, then three buses (deep, main, shallow), then a lowpass (1.8 to 3.2 kHz by `shallow`).
3. Then a convolver, using a procedurally generated impulse response: 2.8 s of decorrelated stereo noise with exponential decay, wet 0.35, "the harbour".
4. Then a DynamicsCompressor as a gentle limiter, then a master gain normalised to about -18 dBFS, then the destination.
5. An AnalyserNode (fftSize 1024) feeds the waterline (downsampled to 256) and the toggle scope.

**Control mapping (AudioParams via `setTargetAtTime`, updated at 10 Hz, never per frame):**
- `shallow = (4.80 - h) / 4.50` (0 at high water, 1 at low water): overtides rise on the ebb.
- The deep and main buses scale by `0.35 + 0.65 x (1 - 0.8 x shallow)`: low notes thin toward low water.
- Air bus (bandpassed noise, 400 to 1200 Hz): `0.02 + 0.06 x |dh/dt| + 0.05 x |scroll velocity|`, clamped. You hear the flood and your own speed.
- Per chapter:
  - C2: staff toggles gate their voices over 1 beat.
  - C3: isolate M2 and S2 (others duck to 0.1).
  - C4: `still` crossfades everything toward a pure M4 sine.
  - C6: the mix previews the slider hour.
  - C7: fade to silence at +12:25.
- **Pluck:** two sines ±2 cents plus an 8 ms filtered noise transient, with a 1.8 s exponential decay, panned by x (-0.6 to 0.6), level from pluck strength, capped at 8 simultaneous voices.
- **Lifecycle:** create or resume `AudioContext` only inside the switch's click. `visibilitychange` suspends it. The preference is remembered in `localStorage` (try/catch) but still needs a gesture. The switch is hidden when `AudioContext` is missing.
- **Hint on first enable:** "Best on headphones: the lowest notes are under 60 Hz." (true: O1, P1 and K1).

---

## 9. Utility UI in the concept's language (the metaphor goes all the way down)

- **Nav (desktop):** the mark and "Overtide"; the **tide clock**; "Sound" with its live scope; "Hold an hour" (text link with a lamp underline).
  - The tide clock is a 160 x 22 sparkline of one tide with a lamp dot moving left to right (monotonic progress) and up and down (height), plus `+03:06 Falling`.
  - It is a button that opens the **Index**.
  - There is no nav background. A 96 px abyss-to-transparent top scrim gives legibility with no glass or blur. Over the dawn sections the nav switches to ink tokens.
- **Nav (mobile):** mark; compact clock `+03:06`; "Sound"; "Index".
- **Index dialog** (`role="dialog"`, focus trap, Esc closes, `--c-swell` panel):
  - The heading "The tide tonight", with a mini curve and the now dot.
  - Chapters listed **as tide times**: `+00:00 High water`, `+01:02 The concert`, `+02:04 The chord`, `+03:06 Springs and neaps`, `+05:10 Low water`, `+07:14 Twelfths`, `+09:18 Your hour`, `+11:23 High water`.
  - Sound switch, Motion: Full / Calm, and "Hold an hour".
  - Links use `lenis.scrollTo`, and `aria-current` follows exact time.
- **404:** the waterline at its lowest. "No water at this address." / "The tide took this page somewhere else." / link **"Back to high water"**.
- **Favicon:** the mark in lamp on abyss (SVG). `theme-color` is `#04100F`.
- **OG image** (`app/opengraph-image.tsx`, satori, static): the wordmark split by a line, foam above, tinted and offset below (broken straw built from two flex boxes with `overflow: hidden`). Alt text: "Overtide: one chord, held for one tide."
- **Meta description:** "A concert that lasts one tide: one chord built from the Moon's and the Sun's pull, played from high water to high water on 23 March 2027."
- **Console credit:** the five frequencies, "One second of this chord is 57 days of sea.", and "This page is 12 h 25 min 14 s long."
- **Semantics:** `header` > `nav`; `main` > 8 `section`s with `aria-labelledby`; one `h1`; `footer`. The canvas is decorative, and every meaningful value is also DOM text.

---

## 10. Accessibility (where winners lose points; we collect them)
- **Controls:**
  - Staff lines: five `<button aria-pressed>`, labels such as "M2, the Moon, 12 hours 25 minutes. In the sea."
  - Slider: native range input with `aria-valuetext`.
  - Sound: `role="switch" aria-checked`.
  - Motion: a segmented radio group.
  - Index: a real dialog.
  - Twelfths rows: focusable, with preview on focus.
- **Targets and focus:** all targets are ≥ 44 x 44 px, and the focus ring is always visible (lamp, 2 px, offset 3 px).
- **Live text:** the C4 hidden line is always in the DOM (visually revealed only). Readouts announce only on change completion (`aria-live="polite"`, throttled to one update per second).
- **Reduced motion:** the designed calm version (section 7.6). Lenis is off, there are no scrubs, and the long chapters' sticky frames stay but nothing is driven. Sound is still allowed (sound is not motion).
- **Other checks:** zoom to 200% reflows; `lang="en"`; no text inside the canvas without a DOM twin; SplitText uses `aria: 'auto'` on the single H1 split.

---

## 11. Feasibility: build plan for about 4 hours of parallel agents

It fits the existing scaffold: `src/lib/frame.ts`, `src/lib/store.ts` (`soundOn`, `quality`, `activeSection`), `src/webgl/StageRoot.tsx` / `Stage.tsx` (poster, lifecycle, PerformanceMonitor), `src/components/providers/SmoothScroll.tsx` (Lenis on the GSAP ticker).

### 11.1 Work packages

| WP | Owner (agent) | Scope | Size | Priority |
|---|---|---|---|---|
| W1 Tide core | Engine | `lib/tide.ts` (constants, `h(t)`, `dh/dt`, twelfths rows, constituent sum, beat helpers, Meeus phases, next full moon); `lib/timeline.ts` (section anchors from `data-tide`, exact and damped hours, per-chapter progress); tokens.css; fonts | M, 45 min | P0 |
| W2 Sea shader | Shader | Sea pass (sky keyframes, waterline world mode, meniscus, underwater tint, letters texture with refraction, lamp, marine snow), compose pass (grain, dither, vignette), seiche uniform, wordmark rasteriser plus DOM sync | L, 2.5 h (critical path) | P0 |
| W3 Sections | DOM | All 8 blocks with final copy, CSS Modules, mobile compositions, the CSS poster (broken straw), SSR SVG fallbacks from `tide.ts`, the no-JS form, 404, OG, metadata | L, 2 h | P0 |
| W4 Interaction | Interaction | String sim and crossing detection; graph mode wiring; staff buttons; C6 slider, readout, form states and ticket; C5 row preview | M-L, 1.75 h | P0 (C3 lens and C4 stillness are P1) |
| W5 Sound | Audio | Chord engine, buses, analyser into `uLine.g`, pluck synth, sound switch with scope, chapter mixes | M, 1.25 h | P0 basic, P1 mixes |
| W6 Chrome and QA | Integrator | Nav tide clock, index dialog, motion toggle, console credit; perf, reduced-motion, no-WebGL and mobile QA; rubric pass | M, rolling | P0 |

### 11.2 Checkpoints (internal gates, since the client is asleep)
1. **T+0:45: static truth.** The page is complete without JS: all copy, the CSS poster, SVG charts and the plain form. Numbers render from `tide.ts`.
2. **T+1:45: the image.** Sea pass v1 in the hero: the waterline from the timeline, broken-straw letters, lamp, snow, the seiche. It matches the poster within a few px. 60 fps at DPR 1.75 in Chrome and Safari on Apple Silicon.
3. **T+2:45: the journey.** Graph mode (C2 and C6), staff toggles, pluck, the basic chord and waterline scope. The whole scroll works forward, reverse, with anchor jumps and reload mid-page.
4. **T+3:30: the peaks.** C3 time-lens, C4 exposure and Moon, dawn and bookend, the colophon's live frame time.
5. **T+4:00: hardening.** Reduced motion, no WebGL (`--disable-webgl`), 390 px, keyboard-only, context-loss test, console clean, `next build`.

### 11.3 Cut list (cut in this order if behind)
P2 first: wet line, caustics on letters, the underwater mirror band, the calendar file. Then:
1. The exposure pass (fallback: cross-fade to a calm state plus the Moon).
2. The C3 zoom beyond 29.5 days (end on the month, keep the "57 days" line and the "Hear it" button).
3. Chapter-specific audio mixes (keep the chord, plucks and scope).
4. C5 row preview.

**Never cut:** the waterline as tide, the broken-straw hero, the staff to sum morph, the slider and form, the fallbacks.

### 11.4 Main risks and how to de-risk them

| Risk | Mitigation |
|---|---|
| Sea shader grows too heavy | Build behind `#define` feature flags. Profile at every gate. Cut order: DPR, then snow layer 2, then wobble, then sea pass at 0.75 scale. |
| Wordmark texture misaligns with the DOM (font load, DPR, Safari) | Rasterise after `document.fonts.load` with the exact computed font string. Keep a dev overlay to diff against the DOM. The CSS poster stays underneath as the safety net. |
| Dense chart lines alias | Analytic-derivative line width; minimum 6 px per cycle (span caps per tier); envelope-only beyond the cap. |
| Audio clicks, loudness, iOS mute switch | Only `setTargetAtTime` ramps, a limiter, -18 dBFS master, headphone hint; test on laptop speakers. The silent-switch case degrades to a muted, still complete page. |
| Time mapping bugs (reverse inconsistency, jumps) | Time is a pure function of scroll through the measured anchors; no integration; exact versus damped split. Re-measure on `ScrollTrigger` refresh, fonts and resize. |
| Scope (four signature moments) | P0/P1/P2 tags above. Moments 1 and 2 plus the booking are P0; stillness and the lens are P1. |
| Honesty drift in copy | Every number is rendered from `tide.ts`. The colophon discloses the proposal and the model tide. The form backend is a launch blocker. |

### 11.5 Acceptance gates (observable)
- LCP element is the SSR H1 or wordmark, under 1.5 s locally. CLS about 0.
- 60 fps (p95 frame time under 16.7 ms) on hero, C2, C3 and C6 on an M-series MacBook in Chrome and Safari.
- Zero console errors. `offscreenRunningCount` 0.
- A pluck works with mouse, trackpad and touch. Sound is off by default and toggles cleanly.
- All four fallbacks are verified. Keyboard walk passes. Screen-reader spot check passes (H1 read once).
- Rubric (dossier 06, section 3) scored by a second reviewer: ≥ 8.5, no chapter below 7, no cap triggered.

---

## 12. Why this can win (mapped to the dossiers)
- **One sentence, true all the way down** (dossier 02, 2.1). The name is a real term. The mark is the equation. The motion ease is the sailor's rule. The duration unit is the spring beat. The nav is a tide clock. The index lists tide times. The CTA is the lamp, and the lamp becomes the sunrise. The 404 is low tide. The colophon gives the real sources.
- **"The shader expresses an idea"** (dossier 01, 1.2). The shader is a chart of the Moon's pull that happens to be beautiful, not an aurora.
- **Live, true micrographics** (dossier 01, 1.6): Hz, periods, heights, tonight's Moon, and the frame time.
- **Sound from the same parameters as the image** (dossier 01, 1.14; dossier 02, 2.6): the waterline is the oscilloscope, and C3's picture equals one second of the sound.
- **Calm with one spectacular idea** (dossier 01, 1.15): tempo contrast, a textless dawn, and a climax of stillness.
- **Usability and accessibility as score multipliers** (dossier 02, 2.10): real controls, designed reduced motion, poster parity, and every number in the DOM.
- **Weight:** no 3D assets and no images. Fonts are about 140 KB, and the R3F chunk is lazy after LCP.

---

## 13. Anti-slop audit (dossier 06) and the written exceptions

**Cleared:**
- No purple, no gradient text, no glass, no blobs.
- No eyebrows, no pills, no three cards, no bento, no stat banner (C1's `dl` is practical event information, not metrics).
- No logo wall, testimonials or invented proof. No scroll cue. No custom cursor. No magnetic buttons. No marquee. No counter preloader.
- No em or en dashes and no banned words in the copy drafts (grep before release).
- No icons except text labels. Radius 0. One accent. One theme with an authored dawn.
- Fonts are outside the reflex list.

**Exceptions, one-sentence rationales (the direction contract):**
- **#4 (dark ground plus one warm accent):** the scene is a harbour at night with one sodium lamp, so the dark carries a sea-green hue, the accent is a light source with no glow edges, and it becomes the sunrise.
- **#15 (serif display):** Imbue's condensed Didone capitals are the pilings and organ pipes the concept needs, and their hairlines match the waterline that cuts them.
- **#17 (mono labels):** Datatype appears only on measured values (times, heights, Hz), in sentence case, never as tracked-caps costume.
- **#33 (numbered sections):** chapters are labelled with tide times because the reader's position in the tide is the information.
- **#30 (a repeated layout):** the dawn bookend repeats the hero frame in opposite light, because the story is that the water returns.
- **#55 (no oscillating ease):** the seiche is a physically damped standing wave that plays once, at the start, because resonance is the subject. UI never bounces.
- **#41 (particles):** marine snow is suspended sediment that moves only with the computed tidal current.
- **#11 (grain):** grain is exposure noise, rendered once in the compose pass and scaled by darkness.

---

## 14. Sources (checked 2026-09-29)
- Constituent periods and speeds (M2 28.9841042, S2 30, N2 28.4397295, K2 30.0821373, K1 15.0410686, O1 13.9430356, P1 14.9589314, M4 57.9682084, MS4 58.9841042, M6 86.9523127 deg/h), and the "shallow water overtides" grouping: https://en.wikipedia.org/wiki/Theory_of_tides
- Equilibrium amplitudes (M2 0.24, S2 0.11, N2 0.046, K2 0.031, K1 0.14, O1 0.10, P1 0.047 m) and "the beating period of M2 and S2 is 14.7 days": Bosboom and Stive, *Coastal Dynamics*, Table 3.5: https://geo.libretexts.org/Bookshelves/Oceanography/Coastal_Dynamics_(Bosboom_and_Stive)/03:_Ocean_waves/3.07:_Generation_of_the_tide/3.7.6:_Tidal_constituents
- "Tide predictions are a calculation, summing the effects of the 37 Cosine Curves": https://tidesandcurrents.noaa.gov/about_harmonic_constituents.html
- Neap tide, compound tide and equinoctial tides definitions: https://tidesandcurrents.noaa.gov/glossary.html
- Thomson's 1872 tide predicting machine (chain over and under pulleys): https://collection.sciencemuseumgroup.org.uk/objects/co53901/william-thomsons-tide-predicting-machine-1872 · https://en.wikipedia.org/wiki/Tide-predicting_machine
- Shallow-water asymmetry ("often the duration of rising tide is much shorter than the duration of falling tide"): https://www.coastalwiki.org/wiki/Tidal_asymmetry_and_tidal_inlet_morphodynamics
- Moon phases: Jean Meeus, *Astronomical Algorithms*, ch. 49 (implemented and run; full moon 2026-09-26 16:50 UTC, full moon 2027-03-22 10:45 UTC).
- Fonts (designer and licence from `google/fonts` METADATA.pb; variable masters rendered locally): Imbue (Tyler Finck, ETC, OFL), Host Grotesk (Element Type et al., OFL), Datatype (Frank Tisellano, OFL).
- Name check: instagram.com/overtidebrand · myfonts.com/collections/overtide-font-cititype · overtidecreations.com
- Derived values (reproducible Python in the session scratchpad `concept3/`): transposition 4,918,558x = 22.2298 octaves; 1 s = 56.93 days; beats 3.856, 2.066, 4.167 and 0.312 Hz; tide hour 62.103 min; twelfths bezier fit; WCAG contrasts; mark asymmetry 6.96 h / 5.46 h.
