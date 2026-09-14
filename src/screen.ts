import { MAX_RATIO, MIN_RATIO, type AspectRatio } from './ratio'
import type { RatioInput } from './state'

/** A screen within 1 % of a preset selects that preset instead of a custom resolution. */
const PRESET_TOLERANCE: number = 0.01

export interface ScreenSize {
  readonly width: number
  readonly height: number
}

export interface DetectedMonitor {
  readonly input: RatioInput
  /** Physical resolution, e.g. "2560×1440". */
  readonly resolution: string
}

/** Physical screen resolution in landscape orientation, or null if the browser reports nothing usable. */
export function readScreenSize(): ScreenSize | null {
  const { width, height }: Screen = window.screen
  const scale: number = window.devicePixelRatio > 0 ? window.devicePixelRatio : 1
  const size: ScreenSize = {
    width: toPhysicalPixels(Math.max(width, height), scale),
    height: toPhysicalPixels(Math.min(width, height), scale),
  }
  return size.width > 0 && size.height > 0 ? size : null
}

/**
 * Browsers round the screen size to whole CSS pixels, so `cssPixels × scale` can be off by up to `scale / 2`
 * (2880 px at 175 % → 1646 CSS px → 2880.5). Panel sizes are even numbers, so the candidate in that range
 * with the most factors of two wins; ties go to the one closest to the exact product.
 */
export function toPhysicalPixels(cssPixels: number, scale: number): number {
  const exact: number = cssPixels * scale
  let best: number = Math.round(exact)
  for (let candidate: number = Math.ceil((cssPixels - 0.5) * scale); candidate <= (cssPixels + 0.5) * scale; candidate++) {
    if (candidate <= 0) continue
    const moreEven: number = factorsOfTwo(candidate) - factorsOfTwo(best)
    if (moreEven > 0 || (moreEven === 0 && Math.abs(candidate - exact) < Math.abs(best - exact))) best = candidate
  }
  return best
}

export function detectMonitor(size: ScreenSize, presets: readonly AspectRatio[]): DetectedMonitor | null {
  const value: number = size.width / size.height
  if (!Number.isFinite(value) || value < MIN_RATIO || value > MAX_RATIO) return null

  const match: AspectRatio | undefined = presets.find(
    (candidate: AspectRatio): boolean => Math.abs(candidate.value - value) / candidate.value <= PRESET_TOLERANCE,
  )
  return {
    input: match ? { kind: 'preset', label: match.label } : { kind: 'custom', raw: `${size.width}x${size.height}` },
    resolution: `${size.width}×${size.height}`,
  }
}

function factorsOfTwo(value: number): number {
  let count: number = 0
  for (let rest: number = value; rest > 0 && rest % 2 === 0; rest /= 2) count++
  return count
}
