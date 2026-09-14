import { formatRatio } from './format'

export interface AspectRatio {
  readonly label: string
  readonly value: number
  readonly isPreset: boolean
}

export type ParseResult =
  | { readonly ok: true; readonly ratio: AspectRatio }
  | { readonly ok: false; readonly error: string }

export const ERROR_FORMAT: string = 'Enter a ratio like 16:9, 2560x1440 or 1.78'
export const ERROR_POSITIVE: string = 'Values must be greater than 0'
export const ERROR_OUT_OF_RANGE: string = 'This value is too large or too small to calculate'

const PRESET_TOLERANCE: number = 1e-6
const FRACTION_MAX_DENOMINATOR: number = 20
const FRACTION_MAX_NUMERATOR: number = 100
const FRACTION_TOLERANCE: number = 0.005

const PAIR_PATTERN: RegExp = /^(\d+(?:[.,]\d+)?)\s*[:/xX×]\s*(\d+(?:[.,]\d+)?)$/
const DECIMAL_PATTERN: RegExp = /^\d+(?:[.,]\d+)?$/

export function preset(width: number, height: number): AspectRatio {
  return { label: `${width}:${height}`, value: width / height, isPreset: true }
}

export function isUsableRatio(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function matchPreset(value: number, presets: readonly AspectRatio[]): AspectRatio | undefined {
  return presets.find((candidate: AspectRatio): boolean => Math.abs(candidate.value - value) < PRESET_TOLERANCE)
}

export function approximateFraction(value: number): string | null {
  for (let denominator: number = 1; denominator <= FRACTION_MAX_DENOMINATOR; denominator++) {
    const numerator: number = Math.round(value * denominator)
    if (numerator > FRACTION_MAX_NUMERATOR) return null
    if (numerator > 0 && Math.abs(numerator / denominator - value) <= FRACTION_TOLERANCE) {
      return `${numerator}:${denominator}`
    }
  }
  return null
}

export function describeValue(value: number, presets: readonly AspectRatio[]): string {
  const match: AspectRatio | undefined = matchPreset(value, presets)
  if (match) return `${formatRatio(value)} (${match.label})`
  const fraction: string | null = approximateFraction(value)
  return fraction === null ? formatRatio(value) : `${formatRatio(value)} (≈ ${fraction})`
}

export function parseRatio(raw: string, presets: readonly AspectRatio[]): ParseResult {
  const text: string = raw.trim()
  let value: number

  const pair: RegExpExecArray | null = PAIR_PATTERN.exec(text)
  if (pair) {
    const width: number = toNumber(pair[1] ?? '')
    const height: number = toNumber(pair[2] ?? '')
    if (width <= 0 || height <= 0) return failure(ERROR_POSITIVE)
    value = width / height
  } else if (DECIMAL_PATTERN.test(text)) {
    value = toNumber(text)
    if (value <= 0) return failure(ERROR_POSITIVE)
  } else {
    return failure(ERROR_FORMAT)
  }

  if (!isUsableRatio(value)) return failure(ERROR_OUT_OF_RANGE)

  const ratio: AspectRatio = matchPreset(value, presets) ?? {
    label: describeValue(value, []),
    value,
    isPreset: false
  }
  return { ok: true, ratio }
}

function toNumber(text: string): number {
  return Number(text.replace(',', '.'))
}

function failure(error: string): ParseResult {
  return { ok: false, error }
}