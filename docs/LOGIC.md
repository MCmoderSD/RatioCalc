# RatioCalc – Logic

The single source of truth for every number RatioCalc shows.
All formulas here are pure math — no DOM, no rounding until the formatting step.
Terms follow the glossary in [OVERVIEW.md](OVERVIEW.md#glossary).

---

## 1. Presets

### R6 in-game presets (in this order)

| Label | Value |
|---|---|
| `5:4` | 1.2500 |
| `4:3` | 1.3333 |
| `3:2` | 1.5000 |
| `16:10` | 1.6000 |
| `5:3` | 1.6667 |
| `16:9` | 1.7778 |
| `19:10` | 1.9000 |
| `21:9` | 2.3333 |

### Monitor presets (in this order)

| Label | Value |
|---|---|
| `4:3` | 1.3333 |
| `5:4` | 1.2500 |
| `16:10` | 1.6000 |
| `16:9` | 1.7778 |
| `21:9` | 2.3333 |
| `32:9` | 3.5556 |

Notes:

- A preset's value is always computed as `width / height` from its label, never hard-coded as a decimal.
- `21:9` is exactly `21 / 9`. Real ultrawides differ (2560×1080 = 2.370, 3440×1440 = 2.389) and can be entered as a custom resolution.
- The order of the in-game list matters: it is the display order of the table and the tie-breaker for the nearest preset.

## 2. Custom input parsing

Every field has a *Custom…* option with a free-text input. The input is trimmed, then matched against these forms:

| Form | Examples | Pattern |
|---|---|---|
| Pair | `16:9`, `16/9`, `16x9`, `2560x1440`, `3440 × 1440` | `^(\d+(?:[.,]\d+)?)\s*[:/xX×]\s*(\d+(?:[.,]\d+)?)$` |
| Decimal | `1.78`, `1,78`, `2` | `^\d+(?:[.,]\d+)?$` |

- A comma is treated as a decimal point (`1,78` = `1.78`).
- Pair value = `a / b`. Decimal value = the number itself.

### Validation

| Case | Result | Message |
|---|---|---|
| Matches no form | invalid | `Enter a ratio like 16:9, 2560x1440 or 1.78` |
| Any part is `0`, or value not finite | invalid | `Values must be greater than 0` |
| Value `< 0.5` or `> 5.0` | invalid | `Ratio must be between 0.5 and 5.0` |
| Empty **target** field | valid | – (means *no target*) |
| Empty **monitor / game** custom field | invalid | `Enter a ratio like 16:9, 2560x1440 or 1.78` |

- While a field is invalid, the page keeps showing the **last valid result**. Only the field shows its error.

### Preset matching

- If a parsed custom value is within `1e-6` of a preset in the same list, it is treated as that preset and shows the preset label.
- Example: `1920x1080` → `16:9`.
- Otherwise the label is the value (3 decimals) plus its fraction, if one exists (see §5).
- Example: `3440x1440` → `2.389 (≈ 31:13)`.
- The note below a valid custom field shows that label, or `Matches preset 16:9` for a preset match.

## 3. Formulas

Inputs: monitor ratio `m`, game ratio `g`, optional target monitor ratio `t`.

```text
m_t              = t ?? m                      effective monitor

S                = m / g                       current stretch factor
stretchPercent   = (S − 1) × 100               current stretch in %

S_p              = m_t / g_p                   stretch of preset p on the effective monitor
stretchPercent_p = (S_p − 1) × 100

change_p         = (S_p / S − 1) × 100         change of preset p vs. current, in %
                 = (g_ideal / g_p − 1) × 100   (equivalent)

g_ideal          = m_t / S = g × m_t / m       game ratio that keeps S on m_t
```

- Without a target, `m_t = m` and therefore `g_ideal = g`.
- `change_p` is a **relative** change, not a difference in percentage points. `+6.7%` means the image becomes 6.7 % wider than it is now; `−25.0%` means 25 % narrower.
- On the same monitor, `change_p = (g / g_p − 1) × 100` does not depend on the monitor at all.

### Nearest preset

```text
nearest = the in-game preset p with the smallest |change_p|
```

- Ties are resolved by the in-game preset order (first wins).
- `|change_p| < 0.05` counts as an **exact match**.
  - Without a target it is labelled `current`.
  - With a target it is labelled `exact match`.
- Without a target and with a preset selected, the nearest preset is always the selected one.
- With a custom game ratio it is the closest preset.

## 4. Why a factor, not a difference

The stretch you *see* is how much wider the image is displayed than rendered, and that is `m / g`. A plain difference `m − g` gives misleading results as soon as the monitor changes:

**Keeping a setup on a new monitor** (16:9 with 4:3 → 16:10 monitor):

| Method | Kept value | Resulting game ratio | Actual stretch on 16:10 |
|---|---|---|---|
| Difference | `16/9 − 4/3 = 0.444` | `1.6 − 0.444 = 1.156` | `1.6 / 1.156 = ×1.385` (+38.5 %) ✗ |
| Factor | `(16/9) / (4/3) = 1.333` | `1.6 / 1.333 = 1.200` | `×1.333` (+33.3 %) ✓ |

**Comparing two setups:**

| Setup | Difference | Factor |
|---|---|---|
| 16:9 monitor with 4:3 | 0.444 | ×1.333 (+33.3 %) |
| 21:9 monitor with 16:9 | 0.556 | ×1.313 (+31.3 %) |

The difference claims the second setup is *more* stretched; it is actually *less* stretched.

## 5. Fraction approximation

Used to show a non-preset value as a readable ratio (e.g. `g_ideal = 1.200` → `≈ 6:5`).

```text
for d = 1 … 20:
    n = round(v × d)
    if n > 0 and |n / d − v| ≤ 0.005:
        return "n:d"
return none
```

- Because the smallest denominator is found first, the fraction is always reduced (`1.2` → `6:5`, never `12:10`).
- If the value matches a preset, the preset label is shown instead of a fraction.
- If no fraction is found, only the decimal is shown.

## 6. Formatting

| Value | Format | Examples |
|---|---|---|
| Stretch factor | `×` + 3 decimals | `×1.333`, `×0.762` |
| Percent (stretch & change) | sign + 1 decimal + `%` | `+33.3%`, `−23.8%`, `±0.0%` |
| Ratio value | 3 decimals | `1.200`, `2.389` |
| Tooltip values | 4 decimals | `×1.3333`, `+33.3333%` |

- Negative numbers use the real minus sign `−` (U+2212), not a hyphen.
- Any percent with `|x| < 0.05` is shown as `±0.0%`.
- Decimal separator is always `.` (English UI).

## 7. Number line axis

The number line plots stretch percent on the **effective monitor** `m_t`, on a linear x-axis.

### Domain

```text
values = [0, stretchPercent, stretchPercent_p for every preset]
min    = min(values)
max    = max(values)
pad    = 0.1 × (max − min)
lo     = floor((min − pad) / 10) × 10
hi     = ceil ((max + pad) / 10) × 10
x(v)   = (v − lo) / (hi − lo) × width
```

### Ticks

- Step = the smallest value from `[5, 10, 20, 25, 50, 100, 200, 250, 500]` such that `(hi − lo) / step ≤ 10`. On narrow screens (< 768px) the limit is `≤ 5`.
  - The larger steps cover extreme custom setups: at most ×10 = +900 % within the allowed 0.5–5.0 range.
- Ticks sit at multiples of the step inside `[lo, hi]`.
- `0` is always drawn and labelled **Native**.

### Examples

| Setup | Raw range | Domain | Step (desktop / mobile) |
|---|---|---|---|
| 16:9 with 4:3, no target | −23.8 … +42.2 | −40 … +50 | 10 / 20 |
| 16:9 with 5:4 → 32:9 | 0.0 … +184.4 | −20 … +210 | 25 / 50 |

## 8. URL state

The setup is mirrored into the query string on every valid change (`history.replaceState`, no new history entries).

```text
?monitor=16:9&ratio=4:3&target=16:10
?monitor=3440x1440&ratio=4:3
```

| Param | Content | Missing / invalid |
|---|---|---|
| `monitor` | Monitor preset label or custom input | detected screen (§10), otherwise `16:9` |
| `ratio` | In-game preset label or custom input | default `16:9` |
| `target` | Monitor preset label or custom input | not migrating |

- A valid `target` opens the page in **migration mode** with that new monitor picked.
- `target` is only written while migrating and after a new monitor is picked; *Cancel migration* removes it.

- On load, a value that equals a preset label of its list selects that preset.
- Anything else is parsed as a custom input (§2). An invalid value falls back to the default without showing an error.

## 9. Reference values

These tables are the expected output for the implementation. All values were verified with a script.

### A – Comparison table without target

Monitor `16:9`, in-game `4:3` → `S = ×1.333`, `+33.3%`

| Preset | Stretch | vs. current |
|---|---|---|
| 5:4 | +42.2% | +6.7% |
| 4:3 | +33.3% | current |
| 3:2 | +18.5% | −11.1% |
| 16:10 | +11.1% | −16.7% |
| 5:3 | +6.7% | −20.0% |
| 16:9 | ±0.0% | −25.0% |
| 19:10 | −6.4% | −29.8% |
| 21:9 | −23.8% | −42.9% |

### B – Individual cases

| Monitor | Game | Target | S | Stretch | Ideal ratio | Nearest (vs. current) |
|---|---|---|---|---|---|---|
| 16:9 | 16:9 | – | ×1.000 | ±0.0% | 1.778 (16:9) | 16:9 (current) |
| 16:9 | 21:9 | – | ×0.762 | −23.8% | 2.333 (21:9) | 21:9 (current) |
| 16:10 | 4:3 | – | ×1.200 | +20.0% | 1.333 (4:3) | 4:3 (current) |
| 16:9 | 4:3 | 16:10 | ×1.333 | +33.3% | 1.200 (≈ 6:5) | 5:4 (−4.0%) |
| 16:9 | 4:3 | 21:9 | ×1.333 | +33.3% | 1.750 (≈ 7:4) | 16:9 (−1.6%) |
| 16:9 | 5:4 | 32:9 | ×1.422 | +42.2% | 2.500 (≈ 5:2) | 21:9 (+7.1%) |

## 10. Monitor detection

When the URL has no valid `monitor` parameter, the current monitor is pre-selected from the screen the browser runs on. A shared link always wins over detection.

```text
w, h   = window.screen.width, window.screen.height     (CSS pixels)
scale  = window.devicePixelRatio                        (1 if not available)
width  = physical(max(w, h), scale)                     landscape
height = physical(min(w, h), scale)
value  = width / height
```

### CSS pixels → physical pixels

Browsers round the screen size to whole CSS pixels, so a plain `round(css × scale)` can be off by one or two pixels. Example: a 2880×1800 panel at 175 % reports `1646×1029` CSS px, and `1646 × 1.75 = 2880.5`, which rounds to `2881`.

```text
physical(css, scale):
    candidates = every integer n with (css − 0.5) × scale ≤ n ≤ (css + 0.5) × scale
    pick the candidate with the most factors of two      (panel sizes are even)
    on a tie, pick the one closest to css × scale
    no candidate → round(css × scale)
```

| Panel | Scale | CSS px | Plain rounding | `physical()` |
|---|---|---|---|---|
| 2880×1800 | 175 % | 1646×1029 | 2881×1801 ✗ | 2880×1800 ✓ |
| 2560×1440 | 150 % | 1707×960 | 2561×1440 ✗ | 2560×1440 ✓ |
| 2256×1504 | 150 % | 1504×1003 | 2256×1505 ✗ | 2256×1504 ✓ |
| 2560×1600 | 175 % | 1463×914 | 2560×1600 | 2560×1600 ✓ |
| 3840×2160 | 250 % | 1536×864 | 3840×2160 | 3840×2160 ✓ |

- If `width` or `height` is `0`, or `value` is outside `0.5 … 5.0`, detection is skipped and the default `16:9` is used.
- If a monitor preset is within **1 %** of `value` (`|preset − value| / preset ≤ 0.01`), that preset is selected.
- Otherwise the resolution is selected as a custom input, e.g. `3440x1440`.
- The monitor legend shows `Your screen: 2560×1440` whenever detection succeeded, even after the user picks another monitor.

| Screen | Selected |
|---|---|
| 1920×1080, 1366×768, 2560×1440 | `16:9` |
| 1440×900, 1680×1050 | `16:10` |
| 1280×1024 | `5:4` |
| 1024×768 | `4:3` |
| 3840×1080, 5120×1440 | `32:9` |
| 2560×1080, 3440×1440 | custom resolution |

Limitations:

- Browser zoom can change `devicePixelRatio`, so the *shown resolution* may be off while zoomed. The ratio stays correct.
- Privacy modes (e.g. Firefox `resistFingerprinting`) may report the window size instead of the screen.
