const MINUS: string = '−'
const COMPACT_FROM: number = 1e6
const EXPONENTIAL_FROM: number = 1e15
const COMPACT_TICK_FROM: number = 1e4
const COMPACT: Intl.NumberFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 })

export function formatFactor(factor: number, digits: number = 3): string {
  return `×${formatNumber(factor, digits)}`
}

export function formatPercent(percent: number, digits: number = 1): string {
  const zeroThreshold: number = 0.5 * 10 ** -digits
  if (Math.abs(percent) < zeroThreshold) return `±${(0).toFixed(digits)}%`
  const sign: string = percent > 0 ? '+' : MINUS
  return `${sign}${formatNumber(Math.abs(percent), digits)}%`
}

export function describeStretch(percent: number): string {
  const formatted: string = formatPercent(percent)
  if (formatted.startsWith('±')) return 'Native (no stretch)'
  return `${formatted} ${percent > 0 ? 'stretched' : 'squished'}`
}

export function formatRatio(value: number, digits: number = 3): string {
  return formatNumber(value, digits)
}

export function formatTick(value: number): string {
  if (value === 0) return '0'
  const magnitude: number = Math.abs(value)
  const text: string = magnitude >= COMPACT_TICK_FROM ? formatNumber(magnitude, 0, true) : String(magnitude)
  return `${value > 0 ? '+' : MINUS}${text}`
}

export function formatNumber(value: number, digits: number, compactEarly: boolean = false): string {
  const magnitude: number = Math.abs(value)
  if (magnitude >= EXPONENTIAL_FROM) return value.toExponential(2)
  if (magnitude >= COMPACT_FROM || (compactEarly && magnitude >= COMPACT_TICK_FROM)) return COMPACT.format(value)
  if (magnitude > 0 && magnitude < 0.5 * 10 ** -digits) return value.toPrecision(3)
  return value.toFixed(digits)
}