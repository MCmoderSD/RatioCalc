const MINUS: string = '−'

export function formatFactor(factor: number, digits: number = 3): string {
  return `×${factor.toFixed(digits)}`
}

export function formatPercent(percent: number, digits: number = 1): string {
  const zeroThreshold: number = 0.5 * 10 ** -digits
  if (Math.abs(percent) < zeroThreshold) return `±${(0).toFixed(digits)}%`
  const sign: string = percent > 0 ? '+' : MINUS
  return `${sign}${Math.abs(percent).toFixed(digits)}%`
}

/** "+33.3% stretched", "−23.8% squished" or "Native (no stretch)". */
export function describeStretch(percent: number): string {
  const formatted: string = formatPercent(percent)
  if (formatted.startsWith('±')) return 'Native (no stretch)'
  return `${formatted} ${percent > 0 ? 'stretched' : 'squished'}`
}

export function formatRatio(value: number, digits: number = 3): string {
  return value.toFixed(digits)
}

export function formatTick(value: number): string {
  if (value === 0) return '0'
  return `${value > 0 ? '+' : MINUS}${Math.abs(value)}`
}
