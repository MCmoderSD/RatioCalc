# RatioCalc – Design

Dark mode only. Single page. Numbers first.

## Core Colors (fixed)

These four colors are the fixed brand values. **They are never changed, tinted or replaced.** Everything else in the UI is built around them.

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#ff3d2c` | Accent: selected chips, current-stretch marker, nearest preset, focus ring |
| `--bg` | `#0c0f16` | Page background, text on primary fills |
| `--text-strong` | `#ffffff` | Important text: headings, main values, recommended preset |
| `--text` | `#b0bac6` | Normal text: labels, table cells, descriptions |

## Helper Colors (derived)

Helper and transition colors only. They are derived from the core colors and may be tuned freely as long as contrast requirements stay met.

| Token | Value | Derived from | Usage |
|---|---|---|---|
| `--primary-hover` | `#ff5a4b` | `--primary`, lighter | Hover on primary fills |
| `--primary-border` | `rgb(255 61 44 / 0.5)` | `--primary` at 50 % | Chip hover border |
| `--primary-subtle` | `rgb(255 61 44 / 0.12)` | `--primary` at 12 % | Highlighted table row, marker halo |
| `--surface` | `#131823` | `--bg`, lighter | Cards / sections |
| `--surface-raised` | `#1a2030` | `--bg`, lighter | Chips, inputs, tooltip |
| `--border` | `#262d3b` | `--bg`, lighter | Card borders, dividers, axis line |
| `--text-muted` | `#7b8594` | `--text` towards `--bg` | Axis tick labels, hints, captions |
| `--warning` | `#ffb547` | – | Invalid input (kept apart from `--primary` so errors never look like a selection) |

## Contrast

| Foreground | Background | Ratio | Rating |
|---|---|---|---|
| `#ffffff` | `#0c0f16` | 19.2 : 1 | AAA |
| `#b0bac6` | `#0c0f16` | 9.8 : 1 | AAA |
| `#b0bac6` | `#131823` | 9.0 : 1 | AAA |
| `#ff3d2c` | `#0c0f16` | 5.4 : 1 | AA |
| `#ff3d2c` | `#131823` | 5.0 : 1 | AA |
| `#7b8594` | `#0c0f16` | 5.1 : 1 | AA |
| `#7b8594` | `#131823` | 4.8 : 1 | AA |
| `#ffb547` | `#0c0f16` | 10.9 : 1 | AAA |
| `#0c0f16` | `#ff3d2c` | 5.4 : 1 | AA |
| `#ffffff` | `#ff3d2c` | 3.5 : 1 | ✗ for normal text |

**Rule:** text on a filled `--primary` surface uses `--bg` (`#0c0f16`), never white.

## Scrollbar & selection

- **Scrollbar** (page, table overflow and any other scroll container):
  - Transparent track, so the page background shows through
  - Rounded thumb in `--border`, inset 4px inside a 14px gutter, min. 48px tall
  - Hover: `--text-muted`
  - Dragging: `--primary`
- **Browser support:**
  - Chromium and Safari use `::-webkit-scrollbar`, which allows the hover and drag states.
  - Firefox gets the standard `scrollbar-width: thin` and `scrollbar-color: var(--border) transparent`, applied only where `::-webkit-scrollbar` is unsupported. Chromium would otherwise let the standard properties override the richer styling.
- **Text selection:** `--text-strong` on `--primary-border`.

## Typography

- **Font stack:** `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No external fonts.
- **Numbers** always use `font-variant-numeric: tabular-nums` so values do not jump while changing.

| Role | Size | Weight | Color |
|---|---|---|---|
| Main stretch value | 48px | 700 | `--text-strong` |
| Page title (28px on mobile) | 36px | 700 | `--text-strong` |
| Recommended preset, number-line factor | 28px | 700 | `--text-strong` |
| Section title | 20px | 600 | `--text-strong` |
| Body | 16px | 400 | `--text` |
| Chips, table, hints | 14px | 400 / 600 | `--text` |
| Fieldset legend (uppercase, `letter-spacing: 0.08em`) | 12px | 600 | `--text` |
| Axis labels, captions | 12px | 400 | `--text-muted` |

- Line height: `1.5` for text, `1.1` for large numbers.

## Spacing & shape

- **Spacing scale:** `4 · 8 · 12 · 16 · 24 · 32 · 48` px
- **Radius:** `8px` for chips, inputs and tooltips; `12px` for cards
- **Borders:** `1px solid var(--border)`
- **Page:** `max-width: 960px`, centered, horizontal padding `16px` (mobile) / `24px` (desktop)
- **Vertical gap:** `32px` between sections, `16px` inside a section

## Page layout

One page, top to bottom. No routing, tabs, modals or "Calculate" button — results update live.

**Default mode** – only what's needed to see and compare your stretch:

1. **Header** – page title and one-line description (no product name)
2. **Setup** – current monitor, in-game aspect ratio, *Migrate to a new monitor* button
3. **Number line** – directly below the setup, with the current stretch value in its header
4. **Comparison table**
5. **How it's calculated** – title line, explanation line below
6. **Footer** – Imprint · Privacy Policy · GitHub

**Migration mode** – after clicking *Migrate to a new monitor*:

- The button is replaced by a panel with the *New monitor* field and *Cancel migration*.
- Once a new monitor is picked, the number line and table switch to it and the **result card** appears between number line and table.

### Wireframe – default

`[ … ]` = selected chip, `( … )` = unselected chip. The example uses 4:3 in-game; the actual default is 16:9.

```text
Rainbow Six Siege stretch calculator
See your stretch, compare aspect ratio presets and keep your stretch on a new monitor.

CURRENT MONITOR  Your screen: 2560×1440
( 5:4 ) ( 4:3 ) ( 3:2 ) ( 16:10 ) ( 5:3 ) [ 16:9 ] ( 21:9 ) ( 32:9 ) ( Custom… )

IN-GAME ASPECT RATIO
( 5:4 ) [ 4:3 ] ( 3:2 ) ( 16:10 ) ( 5:3 ) ( 16:9 ) ( 19:10 ) ( 21:9 ) ( Custom… )

( Migrate to a new monitor → )

Stretch on 16:9                                  ×1.333 +33.3% stretched
Squished                                            You  Stretched
           21:9             16:9    16:10           4:3
                       19:10      5:3     3:2              5:4
  ┼──────┼───●──┼──────┼─●────●────●─┼●────●┼──────┼─◉────┼─●────┼
 −40    −30    −20    −10  Native   +10    +20    +30    +40    +50

Presets on 16:9
  Preset     Stretch     vs. current
  5:4        +42.2%      ▲ +6.7%
▌ 4:3        +33.3%        current
  3:2        +18.5%      ▼ −11.1%
  16:10      +11.1%      ▼ −16.7%
  5:3         +6.7%      ▼ −20.0%
  16:9        ±0.0%      ▼ −25.0%
  19:10       −6.4%      ▼ −29.8%
  21:9       −23.8%      ▼ −42.9%

How it's calculated:
Stretch = monitor ratio ÷ in-game ratio. Positive values are stretched, negative values are squished. Details
────────────────────────────────────────────────────────────────────
Imprint   Privacy Policy   GitHub
```

### Wireframe – migration (16:9 with 4:3 → 16:10)

Only the parts that change are shown.

```text
┌─────────────────────────────────────────────────────────────────┐
  NEW MONITOR
  ( 5:4 ) ( 4:3 ) ( 3:2 ) [ 16:10 ] ( 5:3 ) ( 16:9 ) ( 21:9 ) ( 32:9 ) ( Custom… )
  Cancel migration
└─────────────────────────────────────────────────────────────────┘

Stretch on 16:10 (new monitor)                   ×1.333 +33.3% stretched
  …

┌─ Result ─────────────────────────────────────────────────────────┐
  YOUR STRETCH NOW                 ON 16:10, SET IN-GAME TO
  ×1.333                           [ 5:4 ]
  +33.3% stretched                 Ideal 1.200 (≈ 6:5) · −4.0% vs. current
  4:3 on 16:9
└──────────────────────────────────────────────────────────────────┘

Presets on 16:10 (new monitor)
  Preset     Stretch     vs. current
▌ 5:4        +28.0%      ▼ −4.0%
  4:3        +20.0%      ▼ −10.0%
  3:2         +6.7%      ▼ −20.0%
  16:10       ±0.0%      ▼ −25.0%
  5:3         −4.0%      ▼ −28.0%
  16:9       −10.0%      ▼ −32.5%
  19:10      −15.8%      ▼ −36.8%
  21:9       −31.4%      ▼ −48.6%
```

## Components

### Header

- **No product name on the page.** *RatioCalc* is only the project name.
- Title `Rainbow Six Siege stretch calculator` as `<h1>`: 36px (28px mobile) / 700, `--text-strong`, letter-spacing −0.02em. At least 1.25× the 20px section titles, so the page has a clear top level.
- Description `See your stretch, compare aspect ratio presets and keep your stretch on a new monitor.`: 16px, `--text`.
- No navigation.

### Favicon

- `public/favicon.svg`: a monitor outline with two corner brackets (top-left, bottom-right), symbolising the in-game image inside the screen.
- Strokes `--primary` on a rounded `--bg` square, round caps and joins, stroke width 2.2 on a 32×32 grid.

### Chip group (setup fields)

- Each field is a `<fieldset>` with a `<legend>`.
- The monitor legend can carry a note, `Your screen: 2560×1440` (12px / 400, no uppercase, `--text-muted`, 8px left margin), when the screen was detected.
- Chips are **native radio inputs** with styled labels, so arrow keys and screen readers work out of the box.

| State | Background | Border | Text |
|---|---|---|---|
| Default | `--surface-raised` | `--border` | `--text` |
| Hover | `--surface-raised` | `--primary-border` | `--text-strong` |
| Selected | `--primary` | `--primary` | `--bg`, 600 |
| Selected + hover | `--primary-hover` | `--primary-hover` | `--bg`, 600 |
| Focus-visible | + `outline: 2px solid var(--primary)`, `outline-offset: 2px` | | |

- Size: height 36px, padding `0 14px`, radius 8px, 14px / 600 text in every state (so selecting never shifts the layout), gap 8px, chips wrap onto new lines.
- Every field ends with a `Custom…` chip. There is no `None` chip; the new-monitor field simply starts with nothing selected.

### Migration

- **Start button** `Migrate to a new monitor →` below the in-game field:
  - Height 40px, padding `0 16px`, radius 8px, 14px / 600, `--text-strong` on `--surface-raised`, 1px `--border`
  - Hover: border `--primary-border`. The arrow is `--primary`.
  - Click: the button hides, the panel opens and focus moves to the first chip of the new-monitor field.
- **Panel:** `--surface` card (1px `--border`, radius 12px, padding 16px) holding the *New monitor* chip group and a quiet `Cancel migration` button.
- **Cancel button:** transparent, `--text`, 36px high. Hover: `--text-strong` with a `--border` outline. Click: the panel closes, the start button returns and gets focus, and the page is back in default mode.

### Custom input

- Appears directly below the chip group when `Custom…` is selected, and gets focus automatically.
- Placeholder: `e.g. 3440x1440 or 1.85`.
- Width 240px (100 % on mobile), height 36px, `--surface-raised` background, `--border` border, radius 8px.
- On focus: border `--primary`.
- **Invalid:** border `--warning`, message below in 12px `--warning`, linked via `aria-describedby`, input gets `aria-invalid="true"`.
- **Valid value:** caption below in 12px `--text-muted`, e.g. `2.389 (≈ 31:13)` or `Matches preset 16:9`.

### Result card

- **Only shown in migration mode, once a new monitor is picked.** Hidden otherwise (no placeholder).
- Card: `--surface`, `--border`, radius 12px, padding 24px (16px mobile). Two columns on desktop.
- **Left – before:**
  - Caption `YOUR STRETCH NOW` (12px uppercase, `--text`)
  - Value `×1.333` (48px / 700, `--text-strong`)
  - Subline `+33.3% stretched` / `−23.8% squished` / `Native (no stretch)` (16px, `--text`)
  - Context `4:3 on 16:9` (14px, `--text-muted`)
- **Right – after:**
  - Caption `ON 16:10, SET IN-GAME TO`
  - Preset `5:4` (28px / 700, `--text-strong`) as a badge: `--primary-subtle` background, 1px `--primary-border`, radius 8px, width fits the content
  - Details `Ideal 1.200 (≈ 6:5) · −4.0% vs. current` (14px, `--text`)
  - On an exact match, the details read `Exact match`.

### Comparison table

- Title: `Presets on 16:9`, or `Presets on 16:10 (new monitor)` while migrating (20px / 600, `--text-strong`) – always names the effective monitor.
- Real `<table>` inside a card (`--surface`, `--border`, radius 12px) with `<th scope="col">` headers `Preset | Stretch | vs. current`.
- Rows in in-game preset order. Numbers right-aligned, `tabular-nums`.
- **Highlighted row** (nearest preset — without a target this is the current preset):
  - Background `--primary-subtle`
  - Text `--text-strong`
  - No side bars or thick one-sided borders – the tinted background is the only highlight
- **vs. current** cell:
  - `▲ +6.7%` for wider, `▼ −11.1%` for narrower, `current` / `exact match` for `±0.0%`
  - Direction is shown by arrow and sign, never by color alone. Cell color stays `--text`.
- Rows are clickable (`<button>` inside the preset cell spanning the row): clicking sets that preset as the **in-game aspect ratio**.
- Row hover: background `--surface-raised`.

### Number line

- Inline **SVG**, full content width, about 150px high, drawn from the axis domain in [LOGIC.md §7](LOGIC.md#7-number-line-axis).
- **Header row** (flex, wraps on narrow screens):
  - Title `Stretch on 16:9`, or `Stretch on 16:10 (new monitor)` while migrating (20px / 600, `--text-strong`)
  - Summary on the right: factor `×1.333` (28px / 700, `--text-strong`) and `+33.3% stretched` (14px, `--text`), `aria-live="polite"`
  - The summary always shows the **current** stretch, which is also the `You` marker.
- Layers from top to bottom:
  1. **Zone labels** `Squished` (left edge) and `Stretched` (right edge): 12px, `--text-muted`.
  2. **Preset labels** in two staggered rows. Presets are sorted by position and alternate between the rows so neighbours like `5:3` / `16:10` never overlap. 12px, `--text`.
  3. **Axis** line 1px `--border`, with preset dots (radius 5, fill `--text`) sitting on it.
  4. **Tick labels** `−40 … +50`: 12px, `--text-muted`. The zero tick is taller, drawn in `--text` and labelled `Native`.
- **Current stretch marker** – label `You` (12px / 600, `--primary`). It never runs through a label or a dot:
  - **On a preset** (dot closer than 6px): no line. `You` sits 16px above that preset's label, and the label rows reserve room for it.
  - **Between presets:** `You` sits in the zone-label row with a vertical 2px `--primary` line down to the axis. The line is cut wherever it would cross a label or a dot, and stubs shorter than 12px are dropped.
  - If `You` in the zone-label row would overlap `Squished` / `Stretched`, that zone label is hidden.
- **Highlighted preset** (same as the table): dot fill `--primary`, ring radius 9 with 2px `--primary` stroke, halo `--primary-subtle`, label `--text-strong` / 600.
- **Tooltip** on hover and keyboard focus of a dot:
  - Content, kept minimal: stretch in `--text-strong` / 600, then the change in `--text` – e.g. `+11.1%  ▼ −16.7%` or `+33.3%  current`. The preset name is already the dot's label.
  - Style: `--surface-raised` background, `--border`, radius 8px, 12px text
- Dots are focusable and clickable, with the same effect as clicking the table row.

### How it's calculated

- Two lines, no inline run-on:
  - Title `How it's calculated:` (`<h2>`, 18px / 600, `--text-strong`) – clearly one size step above the 14px text
  - Explanation below: `Stretch = monitor ratio ÷ in-game ratio. Positive values are stretched, negative values are squished.` plus a `Details` link to LOGIC.md (14px, `--text-muted`)

### Footer

- A single row, separated from the content by a 1px `--border` line: `Imprint` · `Privacy Policy` · `GitHub` (repository).
- The link of the current page (`aria-current="page"`) is `--text-strong`.

### Legal pages (imprint, privacy policy)

- Same `.page` layout, tokens, footer and rise-in animation as the calculator.
- Header: back link `← Stretch calculator` (14px, `--text-muted`, the arrow nudges left on hover) above the `<h1>`. The privacy policy adds `Last updated: …` as its tagline.
- Content column max 680px, sections 32px apart, `<h2>` 20px / 600 `--text-strong`, body `--text`.
- Inline code (URL examples) on `--surface-raised`, radius 4px.
- Unfilled `[placeholders]` are shown in `--warning`, so they cannot go live unnoticed.
- Contact email everywhere: `business@mcmodersd.de` as a `mailto:` link.
- All external links (GitHub, GitHub docs) open in a new tab with `target="_blank" rel="noopener noreferrer"`. Internal links (calculator, imprint, privacy) stay in the same tab.
- 14px, links `--text-muted` without underline, hover `--text-strong` with underline, gap 24px, wraps on narrow screens.

## States

| Situation | Behaviour |
|---|---|
| Initial load | State from the URL; otherwise detected screen (or 16:9), 16:9 in-game, default mode |
| Link with `target` | Opens in migration mode with that new monitor picked |
| Custom field invalid | Field shows warning; result, table and line keep the last valid values |
| Default mode | No result card; table and line use the current monitor |
| Migrating, no new monitor picked | Panel open; no result card; table and line still use the current monitor |
| Migrating, new monitor picked | Result card shows recommendation; table and line use the new monitor |

## Responsive

| Breakpoint | Changes |
|---|---|
| `≥ 768px` | Result card in two columns; up to 10 axis ticks |
| `< 768px` | Result card stacked; custom input full width; table stays 3 columns (14px → 13px); up to 5 axis ticks; preset labels may use 12px → 11px |

- The page body never scrolls horizontally.
- The number line scales with its container (`viewBox` + `width: 100%`).

## Motion

Everything moves on one curve so the page feels calm and connected.

| Token | Value | Used for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Every transition and animation |
| `--duration-fast` | `150ms` | Hover, press, tooltip, input focus |
| `--duration` | `260ms` | Chip selection, row highlight, reveals, fades |
| `--duration-slow` | `480ms` | Number-line movement, section rise-in |

**Page & sections**

- On load, header, setup, number line, table, explainer and footer rise in (`opacity` + 10px `translateY`), staggered 0–280ms.
- The result card rises in each time it appears (migration with a picked monitor).
- The custom input and the migration panel reveal with a 6px slide-down fade. The start button fades back in after *Cancel migration*.

**Controls**

- Chips: background, border and color ease over `--duration`. The selected chip gets a soft 4px `--primary-subtle` glow. Pressing scales the chip to 0.95.
- Buttons: pressing scales to 0.97. The `→` icon nudges 3px right on hover.

**Numbers**

- The stretch factor and percent in the number-line header and the result card **count** to the new value (360ms, ease-out quartic) instead of jumping.
- Table cells and the result details briefly fade in (opacity 0.25 → 1) when their value changes.
- A new recommended preset in the result card pops in (scale 0.9 → 1 with a fade).

**Number line**

- Dots, labels, leader lines and the `You` marker slide to their new positions over `--duration-slow`. Leaders are unit lines scaled with CSS, so their length animates too.
- Ticks are keyed by value: existing ones slide, new ones fade in, removed ones slide and fade out.
- Highlight ring and halo scale from 0.4 to 1 while fading in. The keyboard focus ring works the same way. Hovering a dot scales it to 1.3.
- The `You` line fades out when `You` moves onto a preset label, and zone labels fade instead of popping.
- Tooltip: fades in and rises 4px over `--duration-fast`.
- While the canvas resizes, all number-line transitions are paused, so nothing lags behind the layout.

**Reduced motion**

- Under `prefers-reduced-motion: reduce` all CSS transitions and animations are off, and the JS helpers (number counting, fades, pop) set values instantly.

## Accessibility

- All inputs are native (`fieldset`, `legend`, `input type="radio"`, `input type="text"`, `table`, `button`).
- Visible focus ring on every interactive element (`--primary`, 2px, offset 2px).
- The number line SVG has `role="group"` (not `img`, because its dots are focusable buttons) and an `aria-label` summary, e.g. `Presets on 16:9. Your stretch +33.3%. Nearest preset 4:3.` Every dot has its own `aria-label`. The comparison table carries the same data in accessible form.
- Result updates are announced via `aria-live="polite"` on the result card.
- Color is never the only carrier of meaning: signs, arrows and labels accompany every highlight.

## CSS tokens

Core tokens first, helpers below – mirrored 1:1 in `src/style.css`.

```css
:root {
  /* Core colors (fixed) */
  --primary: #ff3d2c;
  --bg: #0c0f16;
  --text-strong: #ffffff;
  --text: #b0bac6;

  /* Helper colors (derived) */
  --primary-hover: #ff5a4b;
  --primary-border: rgb(255 61 44 / 0.5);
  --primary-subtle: rgb(255 61 44 / 0.12);
  --surface: #131823;
  --surface-raised: #1a2030;
  --border: #262d3b;
  --text-muted: #7b8594;
  --warning: #ffb547;

  color-scheme: dark;
}
```
