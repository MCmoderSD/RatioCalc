# RatioCalc – Overview

RatioCalc is a single-page stretch calculator for **Rainbow Six Siege**.
You enter your monitor and your in-game aspect ratio, and it tells you how stretched your game is, how every other preset would change that, and — if you are moving to a new monitor — which aspect ratio keeps your stretch the same.

Hosted as a static site on GitHub Pages: `https://mcmodersd.github.io/RatioCalc/`

*RatioCalc* is only the project / repository name. The page itself shows no product name; its heading is **Rainbow Six Siege stretch calculator**.

Related docs:

- [LOGIC.md](LOGIC.md) – formulas, parsing, rounding, reference values
- [DESIGN.md](DESIGN.md) – colors, typography, layout, components
- [ARCHITECTURE.md](ARCHITECTURE.md) – code structure, data flow, deployment

---

## Purpose

Many Siege players run a "stretched" resolution: a narrower in-game aspect ratio (e.g. 4:3) displayed full-screen on a wider monitor (e.g. 16:9). Models look wider and the stretch becomes part of how the game "feels".

RatioCalc answers three questions:

1. **How stretched am I?** – current stretch factor and percent.
2. **What would another preset do?** – for every R6 preset, how much wider or narrower the image would be compared to now.
3. **What do I pick on a new monitor?** – the aspect ratio that keeps the same stretch on a different screen, plus the closest in-game preset.

It is also meant for **comparing setups with others**: the full setup lives in the URL, so a link reproduces exactly what you see.

## Target audience

- Siege players using or experimenting with stretched resolutions
- Players upgrading or switching monitors (e.g. 16:9 → 16:10, 16:9 → 21:9)
- Players comparing their setup with teammates or pros

## Assumptions

- **Letterbox is off.** The in-game image always fills the entire monitor, so any mismatch between game and monitor ratio becomes stretch.
- Ratios are treated as plain numbers (width ÷ height). The preset `21:9` is exactly 21/9; real ultrawide panels can be entered as a custom resolution (e.g. `3440x1440`).

## Glossary

| Term | Symbol | Meaning |
|---|---|---|
| Monitor ratio | `m` | Aspect ratio of the monitor you play on now |
| Game ratio | `g` | Aspect ratio selected in the R6 display settings |
| New monitor (target) | `m_t` | Monitor you want to migrate to, picked after clicking *Migrate to a new monitor*. Not migrating → `m_t = m` |
| Stretch factor | `S` | `S = m / g`. How much wider the image is shown than rendered. `1` = native |
| Stretch percent | – | `(S − 1) × 100`. Positive = **stretched**, negative = **squished** |
| Change vs. current | `change_p` | Relative change of a preset's stretch compared to your current stretch, in % |
| Ideal ratio | `g_ideal` | Game ratio that gives exactly your current stretch on `m_t` |
| Nearest preset | – | The R6 preset whose stretch on `m_t` is closest to your current stretch |

Example: 4:3 on a 16:9 monitor → `S = 1.333`, `+33.3%` stretched. Switching to 5:4 on the same monitor → `+6.7%` vs. current (6.7 % wider than now).

## Single-page principle

- **One page, one scroll.** No routing, no tabs, no modals, no multi-step wizard.
- The only other pages are the legal ones, as plain static HTML: `/RatioCalc/imprint/` and `/RatioCalc/privacy/`.
- **Two modes on the same page:**
  - **Default:** setup → number line → comparison table. Nothing else.
  - **Migration** (after clicking *Migrate to a new monitor*): the new-monitor field opens inside the setup, and the result card with the recommendation appears between number line and table.
- **Live updates.** Every input change recalculates immediately — there is no "Calculate" button.
- **Shareable.** The current setup is mirrored into the URL query string.

## Features

1. **Setup** – preset chips and a custom input per field:
   - Current monitor – **pre-selected from your screen resolution** when the browser reports it, otherwise `16:9`
   - In-game aspect ratio – default `16:9`
   - **Migrate to a new monitor** button – opens the *New monitor* field and a *Cancel migration* button
2. **Number line** – directly below the setup: all presets plotted on a stretch-percent axis, your current stretch marked, and the current stretch value (`×1.333 +33.3% stretched`) in its header.
3. **Result** – only while migrating and once a new monitor is picked: current stretch next to the ideal ratio, its fraction, and the nearest R6 preset with its deviation.
4. **Comparison table** – every R6 preset with its stretch on the effective monitor and its change vs. current in %.

### R6 in-game presets

`5:4` · `4:3` · `3:2` · `16:10` · `5:3` · `16:9` · `19:10` · `21:9`

### Monitor presets

`4:3` · `5:4` · `16:10` · `16:9` · `21:9` · `32:9`

## User flows

### (a) Experimenting on the current monitor

1. Your monitor is already selected from your screen (e.g. `16:9`, shown as `Your screen: 2560×1440`). Change it if needed.
2. In-game `16:9` is selected by default. Pick your in-game ratio (e.g. `4:3`) → the number line marks you at `+33.3%` and its header shows `×1.333 +33.3% stretched`.
3. Read the comparison table: `5:4` would be `+6.7%` vs. current, `16:10` would be `−16.7%`, and so on. Click a row or a dot on the number line to try that preset.

### (b) Moving to a new monitor

1. Set your current monitor `16:9` and in-game ratio `4:3` (`+33.3%`).
2. Click **Migrate to a new monitor** and pick `16:10` as the new monitor.
3. Result card: ideal ratio `1.200 (≈ 6:5)` — not an R6 preset — so the nearest preset is **`5:4`**, which is `−4.0%` vs. current.
4. The number line and table switch to `… on 16:10 (new monitor)`, with `5:4` highlighted.
5. **Cancel migration** closes the field and returns to the default view.

## Out of scope

- Backend, accounts, saved profiles
- FOV / sensitivity calculators
- Light mode
- Multiple pages
