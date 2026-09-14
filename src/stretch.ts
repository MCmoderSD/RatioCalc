import { GAME_PRESETS } from './presets'
import { describeValue, type AspectRatio } from './ratio'

/** Changes below this (in %) count as "current" / "exact match". */
export const EXACT_MATCH_THRESHOLD: number = 0.05

const AXIS_PADDING: number = 0.1
const AXIS_ROUNDING: number = 10
const TICK_STEPS: readonly number[] = [5, 10, 20, 25, 50, 100, 200, 250, 500]
const LARGEST_TICK_STEP: number = 500

export interface StretchInputs {
  readonly monitor: AspectRatio
  readonly game: AspectRatio
  readonly target: AspectRatio | null
}

export interface PresetComparison {
  readonly preset: AspectRatio
  readonly stretchFactor: number
  readonly stretchPercent: number
  readonly changePercent: number
  readonly isHighlighted: boolean
}

type PresetMeasurement = Omit<PresetComparison, 'isHighlighted'>

export interface Axis {
  readonly lo: number
  readonly hi: number
}

export interface Result {
  readonly monitor: AspectRatio
  readonly game: AspectRatio
  readonly target: AspectRatio | null
  readonly effectiveMonitor: AspectRatio
  readonly stretchFactor: number
  readonly stretchPercent: number
  readonly idealRatio: number
  readonly idealDescription: string
  readonly nearest: PresetComparison
  readonly isExactMatch: boolean
  readonly comparisons: readonly PresetComparison[]
  readonly axis: Axis
}

export function stretchFactor(monitorRatio: number, gameRatio: number): number {
  return monitorRatio / gameRatio
}

export function toPercent(factor: number): number {
  return (factor - 1) * 100
}

export function compute(inputs: StretchInputs, presets: readonly AspectRatio[] = GAME_PRESETS): Result {
  const { monitor, game, target }: StretchInputs = inputs
  const effectiveMonitor: AspectRatio = target ?? monitor
  const factor: number = stretchFactor(monitor.value, game.value)
  const stretchPercent: number = toPercent(factor)
  const idealRatio: number = effectiveMonitor.value / factor

  const measured: readonly PresetMeasurement[] = presets.map((candidate: AspectRatio): PresetMeasurement => {
    const presetFactor: number = stretchFactor(effectiveMonitor.value, candidate.value)
    return {
      preset: candidate,
      stretchFactor: presetFactor,
      stretchPercent: toPercent(presetFactor),
      changePercent: (presetFactor / factor - 1) * 100,
    }
  })

  let nearestIndex: number = 0
  measured.forEach((entry: PresetMeasurement, index: number): void => {
    const best: PresetMeasurement | undefined = measured[nearestIndex]
    if (best !== undefined && Math.abs(entry.changePercent) < Math.abs(best.changePercent)) {
      nearestIndex = index
    }
  })

  const comparisons: readonly PresetComparison[] = measured.map(
    (entry: PresetMeasurement, index: number): PresetComparison => ({ ...entry, isHighlighted: index === nearestIndex }),
  )
  const nearest: PresetComparison | undefined = comparisons[nearestIndex]
  if (nearest === undefined) throw new Error('At least one preset is required')

  return {
    monitor,
    game,
    target,
    effectiveMonitor,
    stretchFactor: factor,
    stretchPercent,
    idealRatio,
    idealDescription: describeValue(idealRatio, presets),
    nearest,
    isExactMatch: Math.abs(nearest.changePercent) < EXACT_MATCH_THRESHOLD,
    comparisons,
    axis: axisDomain([
      stretchPercent,
      ...comparisons.map((comparison: PresetComparison): number => comparison.stretchPercent),
    ]),
  }
}

export function axisDomain(values: readonly number[]): Axis {
  const min: number = Math.min(0, ...values)
  const max: number = Math.max(0, ...values)
  const padding: number = (max - min) * AXIS_PADDING
  return {
    lo: Math.floor((min - padding) / AXIS_ROUNDING) * AXIS_ROUNDING,
    hi: Math.ceil((max + padding) / AXIS_ROUNDING) * AXIS_ROUNDING,
  }
}

export function tickStep(axis: Axis, maxTicks: number): number {
  const span: number = axis.hi - axis.lo
  return TICK_STEPS.find((step: number): boolean => span / step <= maxTicks) ?? LARGEST_TICK_STEP
}

export function tickValues(axis: Axis, step: number): number[] {
  const values: number[] = []
  for (let value: number = Math.ceil(axis.lo / step) * step; value <= axis.hi; value += step) {
    values.push(value === 0 ? 0 : value)
  }
  return values
}
