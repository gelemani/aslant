# 07 · Build log

How Aslant went from an empty folder to a finished page on 29 September 2026 (Moscow time). This file covers the build and QA; the research, tournament and brief are in `01` to `06`, `concepts/` and `../BRIEF.md`.

## Timeline

| Time | Step |
|---|---|
| 00:40 | Start. Stack chosen: Next.js 16, React 19, R3F/three, GSAP, Lenis, CSS Modules. Core plumbing and a headless-Chrome QA harness (real M2 GPU) written and smoke-tested |
| 00:45 to 04:00 | Research (6 dossiers) → 6 concepts → 3 judges → brief synthesis → 2 critics (52 issues) → revised brief |
| 04:00 to 05:30 | Paused (usage limit) |
| 05:35 | Fonts generated per brief 3.2 (Sprat WOFF2, the wordmark instance at wdth 135 / wght 110, Geologica subsets, generated charset table); npm cache cleaned (the disk had 3 GB free) |
| 05:40 | Build starts: 11 agents in two parallel workflows, strict file ownership, coordination through file mailboxes and status files |
| 06:10 | G0 pass: all contracts compile, all eight chapters render server-side |
| 06:31 | G1 pass in Chrome and WebKit: caustic look matches the prototype references, calibration within 0.02 levels, loose phase at 59.9 / 58.8 fps |
| about 06:50 | Agents stopped (usage limit); every package reported complete or nearly complete |
| 10:45 | Resumed: typecheck, lint and tests green; first production build clean |
| 11:05 to 11:35 | Five independent audits: 38 findings (0 P0, 7 P1, 21 P2, 10 P3) |
| 11:35 to 11:56 | Six fixers, one per ownership area. All P1s fixed; most P2s fixed; rejections recorded with reasons from the brief |
| 11:56 | Production rebuild; posters and OG image captured from the live renderer |
| 14:40 to 14:52 | Final independent verification on the production build (an earlier attempt was stopped by a network outage): copy and contrast, function and accessibility, performance: ship with notes; art direction: fix first (scrims in motion, nav ghosting, card register, pixelated hero word) |
| 15:00 to 15:20 | Last fix round (4 fixers) and an independent recheck: ship with notes; blind distinctiveness score up from 7.5 to 8.2 of 10, every act at 7 or above |
| after 15:05 | The nav's shade band follows the first scroll in the hero; the nav hour follows the appointment clock minute for minute; a one-off long frame on the first desktop scroll pass was profiled (the full compositor program and two half-float textures were first drawn mid-scroll) and removed by warming them up at boot: the longest frame over three cold production sweeps fell from 1,517 ms to 17 to 67 ms (59 to 60 fps) |

## Packages

| Package | Scope |
|---|---|
| WP0-A / WP0-B | shell (layout, fonts, tokens, globals, base components) and contracts (frame bus, stores, light state, stage, boot, flags) |
| WP1 | One Clock (SmoothScroll), stage idle and quality governor, GPU tiers, flags and QA hooks |
| WP2 | conductor (scroll is the day), world spec, anchors, scrims, Overcast CSS light, live nav mark and favicon |
| WP3 | light transport: Python bake, sliced optimal transport worker, relief integration, rasterisation per script |
| WP4 | light render: caustic pass, compositor (plaster, spectrum, halation, grain), dust, calibration, stills, context loss |
| WP5 | clear-glass loupe (bicolour schlieren) and the optical bench |
| WP6 | loader (dawn), hero intro and formation, pointer sun, nav, menu |
| WP7 | write-yours: live streaming transport, numbers, contour map, save image |
| WP8 | sun model (NOAA, test vectors) and the appointment clock |
| WP9 | light-sweep headings, precedent ledger, commission form with honest modes |
| WP10 | dusk footer, afterimage epilogue, colophon, mode switches, keys, 404, icons, making log |
| QA | gate checks, copy / contrast / capture scripts |

## Orchestrator rulings

- **Cut scope:** sound and the ray view were cut before the build. The UI never promises them: no Sound switch, and the colophon hint and console signature end with "Press L to leave the room."
- **Relief depth:** a 300 mm pane at a 1.5 m throw needs about 6.0 mm of relief for `aslant` (4.9 mm for Ingrid) at the passing slope criterion. The computed value ships; the brief's earlier "1 to 3 mm" was scaled from a 100 mm pane.
- **Transport quality deviations accepted:** a golden-ratio direction schedule, 1,024-iteration bakes, stray rays snapped to ink on final maps, and ink-box sizing in both raster paths. Stray rays in the bake fell from 930 to 249, and to none on final maps.
- **Emergency fix:** a bare `[data-loader]` selector also matched `<html data-loader="open">` and hid the whole page; both loader rules are now scoped to `:not(html)`.
- **WebKit double download of `aslant.bin`:** a cache header did not help. It was replaced by a head-script fetch that the transport client consumes: one download in every browser and none in Overcast.
- **Making log:** "overnight" is printed only when the recorded end time is before 08:00. The log never prints a time that did not happen.
- **No git commits** were made (none were requested). Rollback points were kept as snapshots outside the project.

## Final fixes (after the audits)

- The fallback posters (hero desktop and mobile, relief, bench) and the OG image are captured from the live renderer. The capture script takes full frames and crops them, because clipped screenshots of an on-demand canvas came out blank.
- After the hero, the nav gets a shade band so text never prints through the bar (the hero's first frame is unchanged).
- Scrims: nearby text boxes merge, edge boxes extend to the viewport edge, and the feather widens during blends. This removes hard rectangles and light slivers from the moving light.
- The commission heading sets in 4 lines on a subgrid and stays in place while the panel is locked to the light.
- Loose light carries less energy until the word forms, so the word is always the brightest thing.
- The Ingrid light data loads after the intro, so it no longer competes with the first paint.
- A slow first load no longer drops a capable GPU into Overcast for the session.
- Accessibility: "Save the image" keeps keyboard focus; the write-yours result is announced once.
- Legibility: the bench captions fade out as the view hands over; the contour caption and the appointment layout on phones were fixed.

## Final verification (production build)

- **Copy and honesty:** check-copy passes with 0 failures. The colophon prints only true times ("between 00:40 and 15:04"). Nothing promises the cut features. Each of the two licensed reveals appears exactly once.
- **Contrast:** check-contrast passes at 1440×900, 1280×800 and 390×844 on every still and transition sample (worst 4.76:1). The checker now honours mask-image.
- **Function and accessibility:** a 70-stop keyboard walk with a visible focus ring everywhere; the menu focus trap, Esc and time-lapse jumps; one H1 and one H2 per chapter; landmarks and live regions; Still air, Overcast and no-JS complete; no horizontal overflow from 1920 down to 360; a clean console.
- **Performance:** LCP 188 ms cold and 144 ms warm (desktop), CLS 0; about 291 KB of first-load JS gzip, with three/R3F out of the initial chunks; 0 frames rendered when idle; a flat heap after three full scroll passes; the transport worker works in production.
- **Distinctiveness (blind, 06-anti-slop §3):** 8.2 / 10. By act: first light 8.5, clear glass 7.5, the bend 8.5, appointment 8.5, write yours 8.5, precedent 8, commission 7.5, dusk 7.
- **Known notes:** `NEXT_PUBLIC_SITE_URL` must be set for a real deploy (otherwise the OG URLs point to localhost). Mid-transition, soft scrim shadows can still show at the edge of a lit patch while text passes over it. Cold transfer is about 1.4 MB against a 1.2 MB budget (not broken down). Real Safari was not tested (WebKit via Playwright was).
