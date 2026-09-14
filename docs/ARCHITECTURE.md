# RatioCalc – Architecture

How the code is organised. Behaviour is defined in [LOGIC.md](LOGIC.md), visuals in [DESIGN.md](DESIGN.md).

---

## Stack

| Part | Choice |
|---|---|
| Language | TypeScript, strictest `tsc` settings (see `tsconfig.json`) |
| Build / dev server | Vite |
| Framework | none – plain DOM APIs |
| Runtime dependencies | none |
| Styling | one plain CSS file with custom properties |
| Hosting | GitHub Pages at `https://mcmodersd.github.io/RatioCalc/` (`base: '/RatioCalc/'`) |

- It is a single page: one `index.html` and one entry script.
- There is no router and no server; everything runs in the browser.

## Project structure

```text
RatioCalc/
├─ index.html              calculator page shell: header, section containers, footer
├─ imprint/index.html      static imprint page      → /RatioCalc/imprint/
├─ privacy/index.html      static privacy policy    → /RatioCalc/privacy/
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ main.ts              bootstrap: detect screen → read URL → build UI → first render
│  ├─ screen.ts            screen resolution → monitor preset or custom input (LOGIC §10)
│  ├─ presets.ts           R6 in-game presets and monitor presets
│  ├─ ratio.ts             AspectRatio type, parsing, preset matching, fraction approximation
│  ├─ stretch.ts           pure calculations: compute(state) → Result
│  ├─ format.ts            number formatting (factor, percent, ratio, "stretched / squished")
│  ├─ state.ts             State type, defaults, URL read/write
│  ├─ ui/
│  │  ├─ dom.ts            tiny element helpers (h, svg, requireElement, clamp)
│  │  ├─ motion.ts         number counting, value fades, pop – all respect reduced motion
│  │  ├─ controls.ts       chip group + custom input (used for monitor, in-game and new monitor)
│  │  ├─ migration.ts      "Migrate to a new monitor" button, new-monitor panel, cancel
│  │  ├─ result.ts         result card (migration only)
│  │  ├─ compareTable.ts   comparison table
│  │  └─ numberLine.ts     SVG number line
│  └─ style.css            tokens (core first, then helpers) and component styles
├─ docs/                   OVERVIEW, LOGIC, DESIGN, ARCHITECTURE
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

### Module rules

- `presets.ts`, `ratio.ts`, `stretch.ts`, `format.ts` and `state.ts` are **pure** – no DOM access. `state.ts` only reads and writes the URL through small functions that take/return strings.
- `screen.ts` is split the same way: `detectMonitor(size, presets)` is pure, only `readScreenSize()` touches `window.screen`.
- `ui/*` modules only render and emit events. They never calculate.
- No module keeps hidden global state except `main.ts`, which owns the current `State`.

## Core types

```ts
// ratio.ts
interface AspectRatio {
  readonly label: string   // "16:9" or "2.389 (≈ 31:13)"
  readonly value: number   // width / height
  readonly isPreset: boolean
}

type ParseResult =
  | { readonly ok: true; readonly ratio: AspectRatio }
  | { readonly ok: false; readonly error: string }

// state.ts
type RatioInput =
  | { readonly kind: 'preset'; readonly label: string }
  | { readonly kind: 'custom'; readonly raw: string }

interface State {
  readonly monitor: RatioInput
  readonly game: RatioInput
  readonly migrating: boolean          // new-monitor panel open
  readonly target: RatioInput | null   // new monitor; null = not picked. Ignored unless migrating
}

// stretch.ts
interface PresetComparison {
  readonly preset: AspectRatio
  readonly stretchFactor: number       // S_p
  readonly stretchPercent: number      // (S_p − 1) × 100
  readonly changePercent: number       // (S_p / S − 1) × 100
  readonly isHighlighted: boolean      // nearest preset
}

interface Result {
  readonly monitor: AspectRatio
  readonly game: AspectRatio
  readonly target: AspectRatio | null
  readonly effectiveMonitor: AspectRatio
  readonly stretchFactor: number       // S
  readonly stretchPercent: number
  readonly idealRatio: number          // g_ideal
  readonly idealDescription: string    // "1.200 (≈ 6:5)"
  readonly nearest: PresetComparison
  readonly isExactMatch: boolean
  readonly comparisons: readonly PresetComparison[]
  readonly axis: { readonly lo: number; readonly hi: number }
}
```

- Types use `readonly` everywhere.
- No `enum` and no other non-erasable syntax, because `erasableSyntaxOnly` is on. Use union types instead.

### Explicit types

Every variable carries an explicit type, even where TypeScript could infer it:

```ts
const width: number = canvas.clientWidth
const { lo, hi }: Axis = current.axis
let state: State = stateFromQuery(window.location.search)
const title: HTMLHeadingElement = h('h2', { class: 'section-title' })
presets.forEach((candidate: AspectRatio): void => { … })
const toX: (value: number) => number = (value: number): number => …
```

- This covers `const` / `let`, destructuring, callback parameters and arrow return types.
- Functions always declare parameter and return types.
- `for … of` loops are not used, because TypeScript does not allow a type annotation on their loop variable. Use `forEach` with a typed parameter, or an indexed `for` loop.

## Data flow

```text
 user input (chip / custom field / migrate / cancel / table row / number-line dot)
        │
        ▼
 controls emit  →  main.ts updates State
        │
        ├─ show / hide migration panel
        ├─ parse monitor, in-game and (only while migrating) new monitor (ratio.ts)
        │     └─ any invalid? → show field error, keep last valid Result, stop
        │
        ▼
 compute(state) → Result            (stretch.ts, pure)
        │
        ├─ renderNumberLine(result)  (ui/numberLine.ts)
        ├─ renderResult(result)      (ui/result.ts; section hidden unless result.target)
        ├─ renderTable(result)       (ui/compareTable.ts)
        │
        ▼
 writeUrl(state) → history.replaceState
```

- **Rendering:** every change re-renders the output sections from the `Result`. The DOM is small (8 rows, ~8 dots), so there is no diffing or reactivity library.
- **Controls:** built once on start. Afterwards only their checked / invalid states are updated, so focus and caret position in custom inputs are never lost.
- **Number line:** the `<svg>` element is created once. Dots and markers are updated through `transform` so CSS transitions can animate them.

## index.html shell

The HTML holds the static structure. TypeScript fills the sections.

```html
<header>
  <h1>Rainbow Six Siege stretch calculator</h1>   <!-- no product name on the page -->
  <p>…</p>
</header>
<main id="app">
  <section id="setup"></section>
  <section id="number-line"></section>
  <section id="result" aria-live="polite"></section>
  <section id="compare"></section>
</main>
<section class="explainer">How it's calculated: …</section>
<footer>Imprint · Privacy Policy · GitHub</footer>
```

## Pages

- `vite.config.ts` registers three HTML entries under `build.rolldownOptions.input`: `index.html`, `imprint/index.html` and `privacy/index.html`.
- The legal pages have no script. They link `/src/style.css` directly, which Vite bundles with the `/RatioCalc/` base.
- All links between pages are **relative** (`imprint/`, `../`, `../privacy/`). They work in the dev server and on GitHub Pages without knowing the base path.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server at `http://localhost:5173/RatioCalc/` |
| `npm run build` | `tsc` type check, then `vite build` → `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

## Deployment

- A GitHub Actions workflow runs on every push to `main`:
  1. `npm ci`
  2. `npm run build`
  3. Upload `dist/` as the Pages artifact and deploy it
- `dist/` is never committed.
- The workflow is set up in a later step.

## Testing

- For now there is no test framework.
- The reference tables in [LOGIC.md §9](LOGIC.md#9-reference-values) are the expected values.
- Because all calculations live in pure modules (`ratio.ts`, `stretch.ts`, `format.ts`), Vitest can be added later without restructuring.
