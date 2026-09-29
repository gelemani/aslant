# 03 — Type & Color Research (type director / color strategist)

Date: 2026-09-29. Scope: free-for-commercial-web, self-hostable typefaces; 12 pairings; 12 palettes grounded in 2026 color forecasts.

The type data (axes, ranges, weights) was **checked against machine-readable sources**, not written from memory:
- Google Fonts metadata feed `https://fonts.google.com/metadata/fonts` (1,946 families, fetched 2026-09-29).
- **Next.js 16.3.6's bundled `next/font/google` font-data.json** (`https://unpkg.com/next@16.3/dist/compiled/@next/font/dist/google/font-data.json`). Every `next/font/google` import below exists in this file. Two newer GF families, *Valley Sans* and *Scoutie Sans* (added 2026-08-25), are **not** in it, so they're excluded.
- Fontshare catalog API `https://api.fontshare.com/v2/fonts` (100 families, with `license_type`, axes and weights).
- The ITF Free Font License **v2.0 (17 Aug 2026)** text, read from the official Fontshare download zip (`https://api.fontshare.com/v2/fonts/download/boska` → `License/FFL.txt`).
- The `google/fonts` GitHub repo: each GF family used here sits under `/ofl/` (OFL-1.1). I checked with HTTP 200 on `raw.githubusercontent.com/google/fonts/main/ofl/<name>/METADATA.pb`.

---

## 0. TL;DR for the build team

1. **Hero display pick:** **Playfair** (the 2023 variable family, *not* Playfair Display). It has an `opsz` axis from 5 to **1200**, so at 200–400px it draws hairlines that no other free serif reaches. As a kinetic alternative, **Science Gothic** has a `wdth` axis from 50 to **200** plus a `CTRS` contrast axis, which makes it a width-morphing machine. Both are OFL and ship through `next/font/google` with `axes`.
2. **Body text:** **Newsreader** (opsz 6–72) or **Instrument Sans** (wdth 75–100). **Mono/HUD:** **Martian Mono** (it has a width axis) or **Fragment Mono**.
3. **Avoid for this project:** Inter, Roboto, Poppins, Montserrat, Open Sans (GF popularity ranks #2–#6), and the 2021–25 "Awwwards default" set: Clash Display, Satoshi, General Sans, Syne, Space Grotesk, Unbounded, Geist/Geist Mono. Instrument Serif is also **trending toward overuse** (GF rank #70 and climbing). Use it only if the concept demands it.
4. **Palette pick:** **"05 Phthalo & Gilt"** or **"01 Abyssal Teal"**. Both are dark and shader-friendly, and both come straight from the 2026 blue-green consensus (WGSN/Coloro *Transformative Teal*, the Threads *Phthalo*, Adobe's "blue-greens"). **"12 Safelight"** is the most "art-object" option.
5. **Licensing gotchas:** Fontshare's FFL v2.0 **allows self-hosting**. It **forbids subsetting, format conversion and modification**. So never run fonttools/glyphhanger on FFL fonts and never bake them into MSDF atlases. Use OFL fonts for anything rendered inside WebGL.

---

## 1. Licensing ground rules (verified)

### 1.1 SIL OFL 1.1 (Google Fonts, Velvetyne, Collletttivo, League of Moveable Type, most Open Foundry)
- Commercial use, web embedding, self-hosting, subsetting and modification are all allowed. The only restrictions: you can't sell the font by itself, and a modified version can't use the Reserved Font Name.
- `next/font/google` downloads fonts at build time and self-hosts them. The browser sends **no requests to Google** (Next.js docs, v16.3.6: https://nextjs.org/docs/app/api-reference/components/font).
- **Custom axes via next/font:** `axes: ['SOFT','WONK','opsz']` etc. By default only `wght` is included. Omit `weight` (or leave it as `'variable'`) when you pass `axes`.

### 1.2 ITF Free Font License v2.0 (Fontshare), from the official `FFL.txt` in the download zip
- **Allowed:** "personal or commercial purposes, free of charge… Websites, Mobile or Desktop Applications… Games." Also: "**You may self-host the Font Software on your own servers… including through standard webfont technologies such as CSS @font-face. Self-hosting by end users is permitted and recommended.**" Logos and wordmarks are allowed and can be trademarked.
- **Forbidden:** "modify… **subsetting, format conversion**, or altering font names…". Also forbidden: redistribution "through another font website, font library… **repository**… publicly accessible servers". So:
  - Serve the **official WOFF2 files unchanged**. `next/font/local` does not subset local files (the docs say only Google fonts are subset), so it's OK.
  - **Do not** convert FFL fonts to MSDF/SDF atlases or typeface JSON for three.js. That's arguably conversion into a "bitmap or vector representation". Use an **OFL** face for WebGL text.
  - If the repo goes **public** on GitHub, gitignore FFL font binaries (or load them from the Fontshare API instead). A public repo counts as a "publicly accessible" distribution channel.
- **API URL pattern (tested, HTTP 200):**
  `https://api.fontshare.com/v2/css?f[]=<slug>@<weights>&display=swap`
  - Weight codes: `300,400,700` are statics. **`1` = variable roman, `2` = variable italic.** For example, `f[]=boska@1` returned `font-weight: 200 900`. Multiple families: `f[]=boska@1,2&f[]=switzer@1`.
  - The FFL says the API carries **no availability guarantee**. For production, download the zip and self-host the unmodified WOFF2 with `next/font/local`.
- Source: https://www.fontshare.com/licenses/itf-ffl (full text in each zip's `License/FFL.txt`).

### 1.3 Other catalogs
- **uncut.wtf** is a *curated catalogue* of 163 typefaces, and its licenses **vary per font** ("All fonts copyright of their respective creators"): https://uncut.wtf/. Verify each one. **Uncut Sans** is OFL-1.1 (repo LICENSE.txt: https://github.com/kaspernordkvist/uncut_sans).
- **Open Foundry** (https://open-foundry.com/fonts) is also a curated index. **Bagnard** is OFL-1.1 (GitHub license API: https://github.com/sebsan/Bagnard). **Bluu Next** is listed as *retired* on Velvetyne, so skip it.

---

## 2. Candidate typefaces (61 numbered entries, plus flagged overused ones)

Legend: **Role**: D = display, T = text, M = mono, A = accent/decor. **Overuse** flags: ⚠ = common in 2024–26 "premium template" sites; ⛔ = generic default, avoid. Popularity rank is GF's own (1 = most used).

### 2.1 Google Fonts, via `next/font/google` (all OFL-1.1, Latin + Latin-Ext, all present in Next 16.3.6 font-data)

| # | Family / import name | Class | Personality | Variable axes (verified) | Role | Pop. rank | Notes at 200px+ |
|---|---|---|---|---|---|---|---|
| 1 | **Playfair** / `Playfair` | Transitional-Didone serif | Couture editorial, razor contrast | `opsz 5–1200`, `wdth 87.5–112.5`, `wght 300–900`, ital | D | 216 | **Best free serif for giant type.** At opsz≥600 the hairlines go almost invisible, and ball terminals and wedge serifs sharpen. Set `font-optical-sizing:auto` or pin `opsz` to 1000+. Tracking −0.03em, line-height 0.86. Don't confuse it with Playfair Display (⚠ rank 22, static-ish). |
| 2 | **Fraunces** / `Fraunces` | "Wonky" soft old-style | Warm, sly, 1970s Windsor/Cooper DNA | `SOFT 0–100`, `WONK 0–1`, `opsz 9–144`, `wght 100–900`, ital | D/A | 87 | Animating SOFT 0→100 melts the serifs, which is a unique kinetic effect. WONK=1 makes n/m/h lean. It was used heavily in DTC branding (2021–23), so push the axes to extremes to feel new. |
| 3 | **Bodoni Moda** / `Bodoni_Moda` | Didone | Fashion-mag hauteur | `opsz 6–96`, `wght 400–900`, ital | D | 143 | Opsz tops out at 96, so at 300px the hairlines stay a bit heavy. Still gorgeous in italic. |
| 4 | **Imbue** / `Imbue` | Condensed Didone | Art-deco poster, vertical tension | `opsz 10–100`, `wght 100–900` | D | 776 (rare) | Tall, tight columns of letters. Very good for full-bleed vertical stacks. Thin weights at huge size look like engraved glass. |
| 5 | **Newsreader** / `Newsreader` | Text serif (Production Type) | Literary, calm, trustworthy | `opsz 6–72`, `wght 200–800`, ital | T (also D) | 122 | One of the best free text serifs. At opsz 72 it's a respectable display too. |
| 6 | **Gloock** / `Gloock` | High-contrast serif | Dark, dramatic, inky | none (400) | D | 482 | Heavy wedge serifs. Works as a single-weight "stamp" headline. No kinetic potential. |
| 7 | **Young Serif** / `Young_Serif` | Heavy old-style | Bookish, warm, crafted | none (400) | D | 626 | Chunky and friendly at size. Pair it with a cold grotesk for tension. |
| 8 | **Wittgenstein** / `Wittgenstein` | Humanist serif | Philosophical, sober | `wght 400–900`, ital | T/D | 1226 (rare) | Solid and slightly archaic. An underused option for pull quotes. |
| 9 | **Instrument Serif** / `Instrument_Serif` | Condensed display serif | Chic, slightly retro | none (400 + italic) | D | 70 ⚠ | Beautiful, but everywhere in 2024–26 startup/portfolio sites. |
| 10 | **Science Gothic** / `Science_Gothic` | Square gothic (Bank Gothic lineage) | Engineered, cinematic, sci-fi | `wdth 50–200`, `wght 100–900`, `CTRS 0–85` (contrast), `slnt −10–0` | D/A | 1164 (rare, added 2025-11) | **Top kinetic candidate.** A 4× width range means one word can breathe from sliver to billboard. CTRS adds contrast like a serif without serifs. Caps-first design. |
| 11 | **Google Sans Flex** / `Google_Sans_Flex` | Geometric-humanist sans | Friendly, systematic | `wdth 25–151`, `wght 1–1000`, `opsz 6–144`, `ROND 0–100`, `GRAD 0–100`, `slnt` | D/T | 66 ⚠ | The richest axis set on GF. Weight 1 is a true hairline. **Risk:** it reads as Google's product UI, so use it only at extreme axis values. |
| 12 | **Roboto Flex** / `Roboto_Flex` | Parametric grotesk | Technical, infinitely tunable | 13 axes incl. `wdth 25–151`, `wght 100–1000`, `opsz 8–144`, `XTRA`, `YTUC`, `GRAD` | A | 96 ⛔ lineage | The parametric axes (XTRA counters, YTUC cap height) are great for glitchy morphs, but the default instance *is* Roboto. Use only mid-animation. |
| 13 | **Anybody** / `Anybody` | Grotesk, width-extreme | Sporty, loud, playful | `wdth 50–150`, `wght 100–900`, ital | D | 703 | Ultra-condensed black to ultra-extended hairline. Classic for scroll-scrubbed width animations. |
| 14 | **Mona Sans** / `Mona_Sans` | Neo-grotesk | Precise, modern (GitHub) | `wdth 75–125`, `wght 200–900`, ital | D/T | 408 | Clean width axis and good spacing. Expanded black at 200px looks premium. |
| 15 | **Hubot Sans** / `Hubot_Sans` | Techno grotesk (Mona sibling) | Robotic, squared | `wdth 75–125`, `wght 200–900`, ital | D/A | 1219 | Squared curves. Nice as a HUD/label face. |
| 16 | **Bricolage Grotesque** / `Bricolage_Grotesque` | Grotesk with ink traps | Quirky, French-editorial | `opsz 12–96`, `wdth 75–100`, `wght 200–800` | D | 43 ⚠ | Low opsz exaggerates the ink traps and looks great blown up. Increasingly common. |
| 17 | **Big Shoulders** / `Big_Shoulders` | Condensed industrial gothic | Chicago signage, civic | `opsz 10–72`, `wght 100–900` | D | 545 | Opsz 72 tightens the details. Great for tall stacked numerals. There's also a `Big_Shoulders_Stencil` cut. |
| 18 | **Special Gothic** / `Special_Gothic` | Gothic grotesk | Poster, workmanlike | `wdth 75–125`, `wght 400–700` | D | 591 (new 2025) | Separate static `Special_Gothic_Expanded_One` and `Special_Gothic_Condensed_One` cuts for extremes. |
| 19 | **Strichpunkt Sans** / `Strichpunkt_Sans` | Grotesk, expanded-only | Wide, confident, Swiss-German | `wdth 100–200`, `wght 400–900` | D | 1889 (new 2026-05) | Almost nobody uses it yet. Width 200 is a true superextended. |
| 20 | **Pliant** / `Pliant` | Sans | Flexible, soft-geometric | `wdth 100–125`, `wght 100–900` | D/T | 1420 (new 2026-06) | Fresh 2026 addition, so zero template associations. |
| 21 | **Zalando Sans** / `Zalando_Sans` | Neo-grotesk | Fashion-retail crisp | `wdth 75–125`, `wght 200–900`, ital | T/D | 656 | Solid workhorse with a width axis. Expanded siblings too (`Zalando_Sans_Expanded`). |
| 22 | **TikTok Sans** / `TikTok_Sans` | Grotesk (Grilli Type + Contrast) | Energetic, digital | `opsz 12–36`, `wdth 75–150`, `wght 300–900`, `slnt` | D/T | 645 | Great drawing by Grilli Type, but the brand name leaks. Use it only if the concept is anonymous. |
| 23 | **Mozilla Headline** / `Mozilla_Headline` | Grotesk | Open-web, humane | `wdth 75–125`, `wght 200–700` | D | 1030 | Studio DRAMA drawing. Quiet and characterful. |
| 24 | **Commissioner** / `Commissioner` | Flared sans | Engraved, lapidary | `FLAR 0–100` (flare), `VOLM 0–100` (volume), `wght`, `slnt` | D/T | 300 | Animating FLAR turns a sans into a glyphic serif. That's a subtle, premium morph. |
| 25 | **Geologica** / `Geologica` | Sans | Geological, crisp | `SHRP 0–100` (sharpness), `CRSV 0–1`, `slnt`, `wght` | T/A | 187 | SHRP sharpens corners, which maps well to a "crystallize" scroll effect. |
| 26 | **Pathway Extreme** / `Pathway_Extreme` | Condensed grotesk | Transit, structural | `opsz 8–144`, `wdth 75–100`, `wght 100–900`, ital | D/T | 654 | Opsz up to 144 is rare for a condensed sans. |
| 27 | **Instrument Sans** / `Instrument_Sans` | Neo-grotesk | Clean, slightly warm | `wdth 75–100`, `wght 400–700`, ital | T | 129 | Excellent body/UI face. Its condensed end suits nav labels. |
| 28 | **Host Grotesk** / `Host_Grotesk` | Grotesk | Neutral-warm, contemporary | `wght 300–800`, ital | T | 393 | A calm alternative to Inter for body copy. |
| 29 | **Schibsted Grotesk** / `Schibsted_Grotesk` | News grotesk | Journalistic, sturdy | `wght 400–900`, ital | T | 94 | Good at small sizes. Slightly common. |
| 30 | **Martian Mono** / `Martian_Mono` | Mono | Evil Martians tech, wide | `wdth 75–112.5`, `wght 100–800` | M | 766 | A mono with a width axis is rare. Great for HUD counters. |
| 31 | **Fragment Mono** / `Fragment_Mono` | Mono (Helvetica-derived) | Swiss, neutral | none (400 + italic) | M | 612 | The "grotesk in mono" feel. Good for tiny captions and coordinates. |
| 32 | **Datatype** / `Datatype` | Mono/data face | Tabular, instrument-panel | `wdth 50–150`, `wght 100–900` | M/A | 1861 (new 2026-03) | Brand-new and unused. The width axis lets numbers breathe. |
| 33 | **Geist Pixel** / `Geist_Pixel` | Pixel/dot | Digital, Vercel | `ELSH 0–100` (element shape) | A | 1629 (new 2026-06) | Morphs pixel shape (square → round). Decorative only. |
| 34 | **Doto** / `Doto` | Dot-matrix | LED board | `ROND 0–100`, `wght 100–900` | A | 949 | Dot-matrix numerals for counters and loaders. |
| 35 | **Handjet** / `Handjet` | Modular/element font | Stitched, pixel-craft | `ELSH 0–16`, `ELGR 1–2`, `wght` | A | 1298 | 16 element shapes (circles, hearts…). Fun for a loader, never for copy. |
| — | ⛔ Inter / `Inter`, Roboto, Poppins, Montserrat, Open Sans | — | Generic defaults | — | — | 5 / 2 / 6 / 6 / … | Overused. Do not use. |
| — | ⚠ Space Grotesk, Syne, Unbounded, Manrope, DM Sans, Geist, Geist Mono, JetBrains Mono | — | 2021–26 "startup premium" defaults | — | — | 56 / 186 / 179 / 28 / 20 / 104 / 147 / 45 | Avoid as the lead face. Geist Mono and JetBrains Mono are acceptable for a small code snippet only. |

### 2.2 Fontshare (ITF FFL v2.0: self-host OK, **no subsetting/conversion**). Data from the Fontshare API.
Latin coverage: all listed ship `script: latin` with extended Western/Central European language lists (Afar…Zulu), per the API.

| # | Family (slug) | Class | Personality | Axes / weights (API) | Role | Notes at 200px+ |
|---|---|---|---|---|---|---|
| 36 | **Boska** (`boska`) | Contemporary serif display | Sharp, fashionable, angular | `wght 200–900`, var italic | D | Crisp triangular serifs. Italic 200 at 300px is gorgeous. `f[]=boska@1,2` |
| 37 | **Zodiak** (`zodiak`) | Didone-ish serif | Luxe, dramatic | `wght 100–900`, ital | D | The thin weight at huge size gives near-Didone contrast. `f[]=zodiak@1,2` |
| 38 | **Gambetta** (`gambetta`) | Transitional text/display serif | Bookish, elegant | `wght 300–700`, ital | T/D | A reliable text serif. The display weights are fine. `f[]=gambetta@1,2` |
| 39 | **Sentient** (`sentient`) | Text serif | Warm, literary | `wght 200–700`, ital | T | Good body serif on Fontshare. |
| 40 | **Erode** (`erode`) | Soft serif | Weathered, organic | `wght 300–700`, ital | D/T | Eroded-stone feel. Good for nature/eco concepts. |
| 41 | **Bespoke Serif** (`bespoke-serif`) | Serif (family with Sans/Slab/Stencil) | Systematic, crafted | `wght 300–800`, ital | D/T | Includes a Stencil sibling (`bespoke-stencil`) for layered effects. |
| 42 | **Gambarino** (`gambarino`) | Display serif (Théo Guillard) | Romantic, quirky | single 400 | D | Only one weight. It has lots of character at poster size. |
| 43 | **Melodrama** (`melodrama`) | Condensed display (serif/sans hybrid) | Theatrical | `wght 300–700` | D | Tall, dramatic, good for stacked words. |
| 44 | **Panchang** (`panchang`) | Wide sans | Monumental, expanded | `wght 200–800` | D | Very wide. Works for single-word heroes. |
| 45 | **Switzer** (`switzer`) | Neo-grotesk (Jérémie Hornus) | Swiss, clean | `wght 100–900`, ital | T | A strong body/UI face, less overused than Satoshi. |
| — | Tanker (`tanker`), Array (`array`), Stardom (`stardom`), Bevellier (`bevellier`, `wght 100–900`), New Title (`new-title`), Expose (`expose`), Technor (`technor`) | Display | various | see API | D/A | Useful for specific concepts. Tanker = heavy brutal, Array = modular, Bevellier = bevel/engraved. |
| — | ⚠ Satoshi, General Sans, Clash Display/Grotesk, Cabinet Grotesk, Chillax | Sans | — | — | — | These are the 2021–25 Awwwards-template set. Avoid as the lead. |

### 2.3 Independent OFL foundries (verified on foundry pages)

| # | Family | Foundry / designer | Class & personality | Axes / weights | Role | License / source | Latin | 200px+ notes |
|---|---|---|---|---|---|---|---|---|
| 46 | **Sprat** | Collletttivo / Ethan Nakache | Sharp high-contrast serif, Eric Gill-inspired, long spiky serifs | **Variable: width + weight**, 18 styles thin→black | D | OFL. https://www.collletttivo.it/typefaces/sprat | Latin + accents/ext | **The best free kinetic *serif***. Condensed thin to extended black, with serif shapes that change by weight. Self-host with `next/font/local`. |
| 47 | **Halibut** | Collletttivo / Matteo Maggi | Roman with oblique stress, sharp unbracketed serifs | Variable width + weight, 6 styles | D | OFL. https://www.collletttivo.it/typefaces/halibut | Latin ext | Very narrow to very wide with long spiky serifs, so it breathes well on scroll. |
| 48 | **Aujournuit** | Collletttivo / Teo Gaudet | Calligraphic, organic, "runny ink" display (2024) | Variable **width** (very condensed → very wide), 5 styles | D/A | OFL. https://www.collletttivo.it/typefaces/aujournuit | Latin ext + zodiac signs | Liquid, organic. Pairs naturally with fluid shaders. |
| 49 | **Apfel Grotezk** | Collletttivo / Luigi Gorlero | Round, airy grotesk with big x-height | 5 static | T/D | OFL. https://www.collletttivo.it/typefaces/apfel-grotezk | Latin | Friendly. Also has a "Brukt" ink-saving cut-out variant. |
| 50 | **Necto Mono**, **Mazius Display**, **Ronzino**, **Ortica** | Collletttivo | Mono / swash display / grotesk / serif | static | M/D | OFL. https://www.collletttivo.it/typefaces | Latin | The foundry asks for credit, so add a colophon line. |
| 51 | **Ouroboros** | Velvetyne / Ariel Martín Pérez | Art-nouveau occult serif ("for alchemists, witches, heretics") | 1 style | D/A | OFL-1.1. https://velvetyne.fr/fonts/ouroboros/ | Latin + Cyrillic + alchemical symbols | Very strong mood. Headlines only. |
| 52 | **Basteleur** | Velvetyne / Keussel | Tarot de Marseille × Cooper Black serif | Bold + Moonlight | D | OFL-1.1. https://velvetyne.fr/fonts/basteleur/ | Latin | Mystic-retro. Moonlight is light, Bold is round. |
| 53 | **Le Murmure** | Velvetyne / Jérémy Landes | Condensed editorial sans with random alternates | 1 style | D | OFL-1.1. https://velvetyne.fr/fonts/le-murmure/ | Latin, Greek, Cyrillic | Red Dot Grand Prix. Use `rand`/alternates for a hand-set rhythm. |
| 54 | **Karrik** | Velvetyne / Morizot & Le Bihan | Brutalist vernacular grotesk, deliberately uneven | Regular + Italic, SS01 chaotic caps | D/T | OFL-1.1. https://velvetyne.fr/fonts/karrik/ | Latin | The imperfections show at size, and that's the point. It's the "anti-AI-perfection" 2026 mood. |
| 55 | **Lineal** | Velvetyne / Frank Adebiaye et al. | Modular Futura, no optical corrections | 7 weights Thin→Heavy | D | OFL-1.1. https://velvetyne.fr/fonts/lineal/ | Latin ext | Geometric and raw. |
| 56 | **Sligoil** | Velvetyne / Ariel Martín Pérez | Funky mono with big ink traps (2025 update) | Micro, Medium, Bold | M/A | OFL-1.1. https://velvetyne.fr/fonts/sligoil/ | Latin + Vietnamese | A characterful HUD mono. |
| 57 | **League Gothic** | The League of Moveable Type | Condensed American gothic | `wdth 75–100` (GF: `League_Gothic`) | D | OFL. https://www.theleagueofmoveabletype.com/ | Latin ext | Classic. Tall stacked numerals. |
| 58 | **League Spartan** | The League of Moveable Type | Geometric (Futura/Spartan) | `wght 100–900` (GF: `League_Spartan`) | D | OFL | Latin ext | Heavy weights are punchy. |
| 59 | **Linden Hill / Sorts Mill Goudy** | The League of Moveable Type / Barry Schwartz | Goudy revivals, bookish | static (GF: `Linden_Hill`, `Sorts_Mill_Goudy`) | T/D | OFL | Latin | Old-world warmth for literary concepts. |
| 60 | **Bagnard** | Open Foundry / Sébastien Sanfilippo | Serif drawn from Napoleonic-era prison graffiti | Regular + Sans | D | OFL-1.1. https://github.com/sebsan/Bagnard | Latin | Scratched and humane. Strong story. |
| 61 | **Uncut Sans** | uncut.wtf / Kasper Nordkvist | Slightly quirky grotesk | 12 cuts incl. a variable file (repo `/Variable`; confirm axes via `fvar`) | T | OFL-1.1. https://github.com/kaspernordkvist/uncut_sans | Latin | A calm body face with a subtle twist. |

> "Letter Spacing / Line Height / Font Size" appear as sliders on Collletttivo pages. Those are **specimen-tester controls, not font axes**. The real axes are width (+ weight where stated). Inspect `fvar` after download (`fc-query` or wakamaifondue.com) before promising an axis in code.

---

## 3. Twelve pairings

Each entry is display + text + optional mono. All the "next/font" names below are verified imports.

| # | Display | Text | Mono | Mood | Rationale |
|---|---|---|---|---|---|
| P1 | **Playfair** (`opsz` 1000+, wght 300, italic accents) | **Instrument Sans** | **Fragment Mono** | Couture museum / "quiet luxury" (matches Cloud Dancer) | Extreme hairline contrast at giant size against a neutral grotesk. The mono's Swiss neutrality handles captions. All three are OFL through `next/font/google`, so it's zero-risk. |
| P2 | **Science Gothic** (wdth 50↔200 scroll-scrubbed, CTRS on hover) | **Newsreader** | **Martian Mono** | Cinematic sci-fi observatory | A caps-only gothic that stretches like a lens. The warm serif body keeps it human. Martian's width axis echoes the display's motion. |
| P3 | **Sprat** (local, wdth+wght) | **Switzer** (Fontshare) | **Sligoil** | Sharp, fashion-avant-garde | A kinetic serif with spiky serifs over a quiet Swiss sans. Sligoil's ink traps rhyme with Sprat's points. *Local fonts; FFL rules apply to Switzer.* |
| P4 | **Fraunces** (SOFT 0→100 + WONK animated, opsz 144) | **Host Grotesk** | **Geist Pixel** (tiny accents only) | Tactile, playful-warm, "melting" | Soft-serif morphing is a signature interaction. The neutral grotesk steps back. |
| P5 | **Imbue** (thin, huge, vertical stacks) | **Newsreader** | **Datatype** | Art-deco archive / cabinet of curiosities | Tall condensed Didone plus a literary serif body gives an editorial voice. Datatype adds a new, unfamiliar instrument layer. |
| P6 | **Anybody** (wdth 50↔150, wght 100↔900) | **Mona Sans** | **Martian Mono** | Sport-kinetic, energetic, bold | A width-extreme face for scroll-scrubbed headlines, with Mona's width axis for body/UI coherence. Everything is variable. |
| P7 | **Boska** (italic 200) | **Sentient** | — | Literary-fashion, intimate | An all-Fontshare serif duo. Boska's italic is the star. Self-host the unmodified WOFF2. |
| P8 | **Aujournuit** (wdth var) | **Apfel Grotezk** | **Necto Mono** | Organic / biodynamic / liquid | Runny-ink display matches fluid shaders. It's an all-Collletttivo system, so one colophon credit covers it. |
| P9 | **Le Murmure** (random alternates) | **Karrik** | **Fragment Mono** | Brutalist-editorial, human-made, anti-AI | Irregular rhythm plus deliberately imperfect grotesk, straight from 2026's "imperfect by design" trend (https://medium.com/design-bootcamp/typography-trends-2026-2027-when-letters-begin-to-breathe-8499fb6c5ef1). |
| P10 | **Strichpunkt Sans** (wdth 200, wght 900) | **Pliant** | **Datatype** | Ultra-contemporary Swiss-German, "nobody has seen this yet" | All three were added to GF in 2026, so they have zero template association. Superextended headings over a flexible sans. |
| P11 | **Commissioner** (FLAR 0→100 on scroll) | **Commissioner** (FLAR 0, VOLM low) | **Martian Mono** | Lapidary, engraved, monolithic | A one-family system where sans becomes glyphic serif through flare. That gives kinetic coherence with the fewest bytes. |
| P12 | **Ouroboros** (sparingly) + **Bodoni Moda** italic | **Newsreader** | **Sligoil** | Occult / alchemical / ritual | For a mystic concept: alchemical glyph sets are real font glyphs, which fits the "honest asset" rule for ornament. |

Implementation notes for kinetic type:
- Declare axes explicitly, e.g. `Fraunces({ subsets:['latin'], axes:['SOFT','WONK','opsz'], variable:'--font-display' })`. Omit `weight` when passing `axes`.
- Animate axes through CSS custom properties (`@property --wdth { syntax:'<number>'; inherits:true; initial-value:100 }` → `font-variation-settings:'wdth' var(--wdth)`) and tween the property with GSAP. Each change re-shapes text, so limit it to the hero word(s) or per-char spans from SplitText. Avoid it on paragraphs.
- Use standard properties where possible (`font-stretch` for `wdth`, `font-weight`, `font-optical-sizing:auto`). Reserve `font-variation-settings` for custom axes (SOFT, WONK, CTRS, FLAR).
- At 200px+: tracking −0.02 to −0.05em, `line-height` 0.82–0.95, `text-rendering:optimizeLegibility`, and `font-kerning:normal`. Consider `text-wrap:balance` for 2–3 line heroes.
- **WebGL text** (drei `<Text>`/troika) renders the *default instance* of variable fonts and prefers TTF/WOFF. Use a **static OFL** file for in-canvas type, and never an FFL font (conversion ban).

---

## 4. Color: 2026 forecast research

| Source | 2026 pick | Approx. sRGB | Takeaway |
|---|---|---|---|
| **Pantone** Color of the Year 2026 | **PANTONE 11-4201 Cloud Dancer**, a "billowy white… serenity", announced 4 Dec 2025 | **#F0EEE9** (approx; the hex is an sRGB approximation) | The reset/quiet-luxury neutral. It's the obvious *light* ground. https://www.pantone.com/color-of-the-year/2026 · https://www.pantone.com/articles/press-releases/pantone-announces-color-of-the-year-2026-cloud-dancer · https://www.npr.org/2025/12/04/nx-s1-5632651/pantones-color-of-the-year-2026-white |
| **WGSN × Coloro** Colour of the Year 2026 | **Transformative Teal**, "a fluid fusion of classic dark blue and aqua green… change and redirection" | ≈ **#1C7E84** (approx, per colorcombinations.org) | Blue-green is *the* 2026 consensus hue. https://www.wgsn.com/en/blog/colour-year-2026-transformative-teal |
| WGSN × Coloro Key Colours S/S 26 | Transformative Teal, **Electric Fuchsia** (a "kinetic and digital" neon between pink and purple), **Blue Aura**, **Amber Haze**, **Jelly Mint** | not published | Neon digital accent plus soothing pastels ("micro-moments of joy"). https://www.wgsn.com/en/blog/coloro-x-wgsn-introduce-key-colours-s-s-26 |
| WGSN × Coloro Key Colours A/W 26/27 | Transformative Teal, **Wax Paper** (creamy yellow off-white), **Fresh Purple** (bridges physical/digital), **Cocoa Powder** (red-brown), **Green Glow** ("hypnotic… radiates and illuminates", nocturnal) | not published | Green Glow plus a dark ground is shader-native. Wax Paper is the warm alternative to Cloud Dancer. https://www.wgsn.com/en/blog/key-colours-w-26-27 |
| **Adobe** 2026 Creative Trends / Express color roundup | "**Blue-greens will be the color trend of 2026**, blending the natural mystery of the ocean with the sleekness of clean technology". Cloud Dancer + Transformative Teal + **Divine Damson** + **Phthalo** framed as "balance and resilience". Also Pinterest's **Wasabi #E9F056** | — | Confirms the teal/phthalo axis, plus luxury plum. https://www.adobe.com/express/learn/blog/color-of-year-trends · https://business.adobe.com/resources/creative-trends-report.html · https://www.adobe.com/express/learn/blog/design-trends-2026 |
| **Pinterest Palette 2026** | Cool Blue **#D7EFFF**, Jade **#AEB8A0**, Plum Noir **#351E28**, Wasabi **#E9F056**, Persimmon **#FF5C34** | official hexes | Hard hexes from a primary source. Plum Noir × Wasabi is a ready-made clash. https://newsroom.pinterest.com/news/from-cool-blue-to-persimmon-meet-the-2026-pinterest-palette/ · https://business.pinterest.com/pinterest-palette/ |
| Graham & Brown | **Divine Damson** (burgundy-plum) | ≈ #4C2E48 | Moody luxury. |
| Threads community | **Phthalo Green**, "a vivid black-green… energy and artistry" | — | The artist's-pigment dark green. |
| Behr / Benjamin Moore / Etsy / Glidden / Dunn-Edwards / C2 | Hidden Gem ≈#5E7A72 · Silhouette ≈#57504C · Patina Blue · Warm Mahogany ≈#7B473C · Midnight Garden ≈#39463C · Epernay ≈#D6B96C | approx | Smoky jade, espresso-charcoal and verdigris confirm the "earthy-mineral dark" direction. https://colorcombinations.org/trends/color-trends-2026/ · https://elements.envato.com/learn/color-trends |
| Shutterstock | No 2026 color report found (last widely published: 2022) | — | I didn't cite it. Envato and Adobe say 2026 is about **contrast pairings rather than one hue**, "Highs and Lows" (melancholic darks + cheerful pastels) and "cosmic gradients" (iridescent, holographic). https://elements.envato.com/learn/color-trends |

**Synthesis:** 2026 = (a) a **reset neutral** (Cloud Dancer / Wax Paper), (b) **ocean-tech blue-greens** (Transformative Teal, Phthalo, Patina), (c) **moody plums/browns** (Plum Noir, Damson, Cocoa), and (d) **one electric spike** (Wasabi / Green Glow / Electric Fuchsia / Persimmon). For an art-level WebGL page: a deep blue-green or plum ground, a single electric accent used sparingly, and shader glow as a color *event* rather than wallpaper.

---

## 5. Twelve palettes (exact hex + measured WCAG 2.x contrast)

I computed the ratios with the WCAG relative-luminance formula (script: scratchpad `contrast.py`). Grades: **AAA** ≥7, **AA** ≥4.5 (body text), **AA-L** ≥3 (≥24px / ≥18.66px bold text, UI glyphs), **✗** <3 (decor/fills only). `glow` is for shader emission, bloom and gradients, never text, unless a row says otherwise.

### Dark
(Palette numbers are IDs, not ranks. They're grouped by ground: 01/03/05/06/07/11 dark, 02/08/09 light, 04/10/12 unexpected.)

**01 — Abyssal Teal** (Transformative Teal as ocean-tech)
`bg #050B0C · surface #0C1A1C · ink #E8F1EE · muted #8AA3A0 · accent #1C7E84 · accent-text #4FD1C5 · glow #9BFFF0`
- ink/bg 17.22 AAA · ink/surface 15.46 AAA · muted/bg 7.39 AAA · muted/surface 6.63 AA
- accent #1C7E84/bg 4.12 **AA-L only**, so use it for fills and large type. For small accent text use **#4FD1C5** (10.63 AAA). Button: bg-on-#4FD1C5 10.63 AAA.

**03 — Plum Noir / Wasabi** (Pinterest's own clash)
`bg #120A0E · surface #351E28 · ink #F4E9EC · muted #A98F99 · accent #E9F056 · glow #B86BFF`
- ink/bg 16.47 AAA · ink/surface 12.95 AAA · muted/bg 6.58 AA · muted/surface 5.17 AA
- accent/bg 15.87 AAA, so Wasabi works for text, links and big type. Button: dark bg text on Wasabi 15.87 AAA (never ink-on-accent: 1.04 ✗). glow/bg 6.12.

**05 — Phthalo & Gilt** (artist's black-green + Epernay gold + WGSN Green Glow) · *recommended*
`bg #03110C · surface #0A2219 · ink #E9F0E4 · muted #88A596 · accent #D6B96C · glow #3DFFA8`
- ink/bg 16.57 AAA · ink/surface 14.37 AAA · muted/bg 7.22 AAA · muted/surface 6.27 AA
- accent/bg 10.11 AAA · accent/surface 8.77 AAA · button text: bg-on-gold 10.11 AAA · glow/bg 14.75 (it can serve as a "live" status color too).

**06 — Darkroom Persimmon**
`bg #0D0907 · surface #1B1411 · ink #F5ECE2 · muted #A08F82 · accent #FF5C34 · glow #FFA25E`
- ink/bg 16.97 AAA · muted/bg 6.37 AA · muted/surface 5.84 AA
- accent/bg 6.45 AA · accent/surface 5.92 AA · button: bg-on-accent 6.45 AA (ink-on-accent 2.63 ✗) · glow/bg 9.99.

**07 — Fuchsia Aura** (WGSN Electric Fuchsia + Fresh Purple)
`bg #07060B · surface #14121D · ink #F2F0F8 · muted #908AA6 · accent #FF2BD6 · glow #7C5CFF`
- ink/bg 17.88 AAA · muted/bg 6.13 AA · muted/surface 5.62 AA
- accent/bg 6.32 AA · button: bg-on-accent 6.32 AA · glow/bg 4.65 (AA, but on surface only 4.26 AA-L, so keep it decorative).
- Fuchsia is a strong "digital" cliché risk, so keep it to ≤3% of pixels.

**11 — Patina & Copper** (Etsy Patina Blue + copper oxidation)
`bg #0A1413 · surface #12211F · ink #EEE7DA · muted #93A39D · accent #D9814A · glow #5FD6C6`
- ink/bg 15.22 AAA · muted/bg 7.10 AAA · muted/surface 6.31 AA
- accent/bg 6.41 AA · accent/surface 5.69 AA · button: bg-on-accent 6.41 AA · glow/bg 10.62.
- Complementary copper vs. verdigris mirrors a real chemical process, which makes a strong shader story.

### Light

**02 — Cloud Dancer / Persimmon** (Pantone ground + Pinterest spike)
`bg #F0EEE9 · surface #E4E0D8 · ink #141311 · muted #5F5A52 · accent #FF5C34 · accent-text #B8330F · glow #FFB59C`
- ink/bg 16.01 AAA · ink/surface 14.11 AAA · muted/bg 5.90 AA · muted/surface 5.19 AA
- Persimmon on the light ground is **2.65 ✗**, so use it only as a *fill* with **ink text on it (6.04 AA)**. For accent-colored text use **#B8330F** (5.15 AA). Glow is decor only (1.47).

**08 — Wax Paper Archive** (WGSN Wax Paper + Warm Mahogany + Epernay)
`bg #F3EBD6 · surface #E9DEC2 · ink #1C1712 · muted #675C4C · accent #7B473C · glow #D6B96C`
- ink/bg 14.96 AAA · ink/surface 13.29 AAA · muted/bg 5.50 AA · muted/surface 4.89 AA
- accent/bg 6.29 AA · accent/surface 5.59 AA · button: bg-on-accent 6.29 AA · glow 1.60 ✗ (gilded shader sheen only).

**09 — Glacier Cobalt** (Pinterest Cool Blue + electric cobalt)
`bg #F5FAFF · surface #D7EFFF · ink #08182A · muted #4A5E72 · accent #1F3DFF · glow #8FDBFF`
- ink/bg 17.03 AAA · ink/surface 15.05 AAA · muted/bg 6.38 AA · muted/surface 5.64 AA
- accent/bg 6.31 AA · accent/surface 5.58 AA · button: bg-on-accent 6.31 AA · glow 1.46 ✗ (decor).

### Unexpected

**04 — Wasabi Voltage** (chartreuse *as the ground*)
`bg #E9F056 · surface #D9E03E · ink #0F100B · muted #3E4120 · accent #351E28 · glow #FFFFFF`
- ink/bg 15.52 AAA · ink/surface 13.36 AAA · muted/bg 8.61 AAA · muted/surface 7.41 AAA
- accent (Plum Noir)/bg 12.48 AAA · button: Wasabi text on plum 12.48 AAA · glow white 1.23 ✗ (specular highlights only). Alt spark: cobalt #1F3DFF on Wasabi 5.38 AA.
- Risky and loud, but unforgettable. Use it for one chapter rather than the whole page.

**10 — Silhouette Mineral** (a *mid-tone* ground: Benjamin Moore Silhouette + Sherwin-Williams Universal Khaki)
`bg #57504C · surface #4A4441 · ink #F0EEE9 · muted #D6C8B0 · accent #FFD29A · glow #FFE9C7`
- ink/bg 6.82 AA · ink/surface 8.25 AAA · muted/bg 4.80 AA · muted/surface 5.81 AA
- accent/bg 5.62 AA · accent/surface 6.81 AA · button: bg-on-accent 5.62 AA · glow/bg 6.67.
- It's neither dark nor light, and that reads like a gallery wall. Shaders look like pigment on a mid-grey ground.

**12 — Safelight** (monochrome darkroom red, one hue from shadow to highlight)
`bg #110203 · surface #220607 · ink #FFDCD2 · muted #B8756A · accent #FF2A1A · glow #FF7A3D`
- ink/bg 15.88 AAA · ink/surface 14.97 AAA · muted/bg 5.60 AA · muted/surface 5.28 AA
- accent/bg 5.41 AA · accent/surface 5.10 AA · button: bg-on-accent 5.41 AA (ink-on-accent 2.93 ✗) · glow/bg 7.84.
- The most "art object" option: a single-hue world where WebGL renders only in luminance. Pure red (#FF2A1A) can vibrate on some displays, so keep large accent areas off the hero. Test for protanopia; the monochrome structure keeps hierarchy readable by luminance anyway.

### Token template (drop into `globals.css`)
```css
:root {
  --c-bg: #03110C; --c-surface: #0A2219; --c-ink: #E9F0E4;
  --c-muted: #88A596; --c-accent: #D6B96C; --c-glow: #3DFFA8;
  /* shader uniforms mirror these; convert to linear sRGB in JS before passing to three.js */
}
```
Note for WebGL: three.js r152+ treats hex colors via `THREE.Color` as sRGB and converts them to linear under `ColorManagement.enabled`. Pass palette colors through `new THREE.Color(hex)` (not raw `vec3(r/255…)`) so shader output matches the CSS exactly after output encoding. Otherwise canvas and DOM colors drift apart.

---

## 6. Recommendations to the art director (ranked)

1. **"Observatory"**: P2 (Science Gothic / Newsreader / Martian Mono) × **05 Phthalo & Gilt**. Width-morphing caps over an aurora-like green-glow shader. Most kinetic, most 2026.
2. **"Couture Hairline"**: P1 (Playfair opsz 1000+ / Instrument Sans / Fragment Mono) × **02 Cloud Dancer / Persimmon** or **10 Silhouette Mineral**. The quietest, most luxurious option, built on Pantone 2026.
3. **"Ritual"**: P3 (Sprat) or P12 (Ouroboros + Bodoni Moda) × **12 Safelight** or **03 Plum Noir / Wasabi**. The most artistic and least commercial.

Whatever wins: two families max (plus an optional mono), ≤3 font files preloaded, hero font `display:'swap'` with `adjustFontFallback`, and body at 17–19px with line-height 1.5–1.6 and max 68ch.

---

### Sources
- Next.js Font API (v16.3.6): https://nextjs.org/docs/app/api-reference/components/font
- Next 16.3 font-data: https://unpkg.com/next@16.3/dist/compiled/@next/font/dist/google/font-data.json
- Google Fonts metadata: https://fonts.google.com/metadata/fonts · google/fonts repo: https://github.com/google/fonts
- Fontshare API: https://api.fontshare.com/v2/fonts · ITF FFL: https://www.fontshare.com/licenses/itf-ffl
- Velvetyne: https://velvetyne.fr/fonts/ · Collletttivo: https://www.collletttivo.it/typefaces · League of Moveable Type: https://www.theleagueofmoveabletype.com/ · Open Foundry: https://open-foundry.com/fonts · UNCUT: https://uncut.wtf/
- Pantone 2026: https://www.pantone.com/color-of-the-year/2026 · WGSN COTY: https://www.wgsn.com/en/blog/colour-year-2026-transformative-teal · WGSN A/W 26/27: https://www.wgsn.com/en/blog/key-colours-w-26-27 · WGSN S/S 26: https://www.wgsn.com/en/blog/coloro-x-wgsn-introduce-key-colours-s-s-26
- Pinterest Palette 2026: https://newsroom.pinterest.com/news/from-cool-blue-to-persimmon-meet-the-2026-pinterest-palette/
- Adobe: https://www.adobe.com/express/learn/blog/color-of-year-trends · https://business.adobe.com/resources/creative-trends-report.html
- Envato 2026 color trends: https://elements.envato.com/learn/color-trends · Paint-brand hex compilation: https://colorcombinations.org/trends/color-trends-2026/
- Typography trend context: https://medium.com/design-bootcamp/typography-trends-2026-2027-when-letters-begin-to-breathe-8499fb6c5ef1 · https://designflea.com/typography-trends-2026/
