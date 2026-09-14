import { describeStretch, formatFactor, formatPercent, formatTick } from '../format'
import type { AspectRatio } from '../ratio'
import { tickStep, tickValues, type Axis, type PresetComparison, type Result } from '../stretch'
import { changeArrow, changeLabel, monitorName } from './compareTable'
import { clamp, h, svg } from './dom'
import { tweenNumber } from './motion'

export interface NumberLineView {
  readonly element: HTMLElement
  render(result: Result): void
}

interface DotView {
  readonly group: SVGGElement
  readonly leader: SVGLineElement
  readonly label: SVGTextElement
}

interface TickView {
  readonly group: SVGGElement
}

interface DotPosition {
  readonly x: number
  readonly rowY: number
}

interface PlacedDot {
  readonly comparison: PresetComparison
  readonly x: number
}

interface LabelBox {
  readonly x: number
  readonly halfWidth: number
  readonly rowY: number
}

interface Point {
  readonly x: number
  readonly y: number
}

type Interval = readonly [number, number]

const HEIGHT: number = 132
const PADDING_X: number = 28
const ZONE_Y: number = 14
const ROW_Y: readonly [number, number] = [66, 46]
const AXIS_Y: number = 92
const TICK_LABEL_Y: number = 120
const YOU_LINE_TOP: number = 22
const YOU_LINE_BOTTOM: number = AXIS_Y + 8
const YOU_ABOVE_LABEL: number = 16
const COINCIDE_DISTANCE: number = 6
const MIN_SEGMENT: number = 12
const LEADER_OFFSET: number = 8
const CHAR_WIDTH: number = 7
const LABEL_GAP: number = 8
const TICK_LEAVE_MS: number = 260
const MOBILE_QUERY: string = '(max-width: 767px)'

export function createNumberLine(
  presets: readonly AspectRatio[],
  onPick: (label: string) => void
): NumberLineView {
  const title: HTMLHeadingElement = h('h2', { id: 'number-line-title', class: 'section-title' })
  const summaryFactor: HTMLSpanElement = h('span', { class: 'number-line__factor' })
  const summaryPercent: HTMLSpanElement = h('span', { class: 'number-line__percent' })
  const header: HTMLDivElement = h('div', { class: 'number-line__header' }, [
    title,
    h('p', { class: 'number-line__summary', 'aria-live': 'polite' }, [summaryFactor, summaryPercent])
  ])

  const ticks: SVGGElement = svg('g', { class: 'nl-ticks' })
  const axisLine: SVGLineElement = svg('line', { class: 'nl-axis', y1: AXIS_Y, y2: AXIS_Y })
  const squished: SVGTextElement = svg('text', { class: 'nl-text nl-zone', x: 0, y: ZONE_Y, 'text-anchor': 'start' }, ['Squished'])
  const stretched: SVGTextElement = svg('text', { class: 'nl-text nl-zone', y: ZONE_Y, 'text-anchor': 'end' }, ['Stretched'])
  const youPath: SVGPathElement = svg('path', { class: 'nl-you__line' })
  const youLine: SVGGElement = svg('g', { class: 'nl-you' }, [youPath])
  const youLabel: SVGGElement = svg('g', { class: 'nl-you' }, [
    svg('text', { class: 'nl-you__label', y: 0, 'text-anchor': 'middle' }, ['You'])
  ])
  const dotsGroup: SVGGElement = svg('g', { class: 'nl-dots' })

  const root: SVGSVGElement = svg('svg', { class: 'nl', height: HEIGHT, role: 'group' }, [
    ticks,
    axisLine,
    squished,
    stretched,
    youLine,
    dotsGroup,
    youLabel
  ])

  const tooltipValue: HTMLSpanElement = h('span', { class: 'nl-tooltip__value' })
  const tooltipChange: HTMLSpanElement = h('span', { class: 'nl-tooltip__change' })
  const tooltip: HTMLDivElement = h('div', { class: 'nl-tooltip', role: 'tooltip' }, [tooltipValue, tooltipChange])
  const canvas: HTMLDivElement = h('div', { class: 'number-line__canvas' }, [root, tooltip])
  const element: HTMLDivElement = h('div', { class: 'number-line is-static' }, [header, canvas])

  let current: Result | null = null
  let activeLabel: string | null = null
  const positions: Map<string, DotPosition> = new Map<string, DotPosition>()
  const dots: Map<string, DotView> = new Map<string, DotView>()
  const tickViews: Map<number, TickView> = new Map<number, TickView>()

  presets.forEach((candidate: AspectRatio): void => {
    const leader: SVGLineElement = svg('line', {
      class: 'nl-dot__leader',
      x1: 0,
      y1: 0,
      x2: 0,
      y2: -1,
      'vector-effect': 'non-scaling-stroke'
    })
    const label: SVGTextElement = svg('text', { class: 'nl-dot__label', 'text-anchor': 'middle' }, [candidate.label])
    const group: SVGGElement = svg('g', { class: 'nl-dot', tabindex: 0, role: 'button' }, [
      leader,
      svg('circle', { class: 'nl-dot__hit', r: 14 }),
      svg('circle', { class: 'nl-dot__halo', r: 14 }),
      svg('circle', { class: 'nl-dot__focus', r: 12 }),
      svg('circle', { class: 'nl-dot__ring', r: 9 }),
      svg('circle', { class: 'nl-dot__dot', r: 5 }),
      label
    ])

    group.addEventListener('click', (): void => onPick(candidate.label))
    group.addEventListener('keydown', (event: KeyboardEvent): void => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      onPick(candidate.label)
    })
    group.addEventListener('pointerenter', (): void => showTooltip(candidate.label))
    group.addEventListener('focus', (): void => showTooltip(candidate.label))
    group.addEventListener('pointerleave', hideTooltip)
    group.addEventListener('blur', hideTooltip)

    dots.set(candidate.label, { group, leader, label })
    dotsGroup.append(group)
  })

  function draw(): void {
    if (current === null) return
    const width: number = canvas.clientWidth
    if (width <= 0) return

    const { lo, hi }: Axis = current.axis
    const toX: (value: number) => number = (value: number): number => PADDING_X + ((value - lo) / (hi - lo)) * (width - 2 * PADDING_X)

    root.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`)
    axisLine.setAttribute('x1', String(PADDING_X))
    axisLine.setAttribute('x2', String(width - PADDING_X))
    stretched.setAttribute('x', String(width))

    const maxTicks: number = window.matchMedia(MOBILE_QUERY).matches ? 5 : 10
    drawTicks(tickValues(current.axis, tickStep(current.axis, maxTicks)), toX)

    const youX: number = toX(current.stretchPercent)
    const placed: PlacedDot[] = current.comparisons
      .map((comparison: PresetComparison): PlacedDot => ({ comparison, x: toX(comparison.stretchPercent) }))
      .sort((a: PlacedDot, b: PlacedDot): number => a.x - b.x)

    const coincident: PlacedDot | null = placed.reduce<PlacedDot | null>(
      (best: PlacedDot | null, entry: PlacedDot): PlacedDot | null => {
        const distance: number = Math.abs(entry.x - youX)
        return distance < COINCIDE_DISTANCE && (best === null || distance < Math.abs(best.x - youX)) ? entry : best
      },
      null
    )

    const rowEnds: [number, number] = [-Infinity, -Infinity]
    const labelBoxes: LabelBox[] = []
    let youPosition: Point = { x: clamp(youX, 16, width - 16), y: ZONE_Y }
    const hasTarget: boolean = current.target !== null

    placed.forEach(({ comparison, x }: PlacedDot): void => {
      const view: DotView | undefined = dots.get(comparison.preset.label)
      if (!view) return

      const isYou: boolean = comparison === coincident?.comparison
      const halfWidth: number = textWidth(comparison.preset.label) / 2
      const labelX: number = clamp(x, halfWidth, width - halfWidth)
      const span: number = isYou ? Math.max(halfWidth, textWidth('You') / 2) : halfWidth
      const left: number = labelX - span
      const firstFree: boolean = left >= rowEnds[0] + LABEL_GAP
      const secondFree: boolean = left >= rowEnds[1] + LABEL_GAP

      let row: 0 | 1
      if (isYou) {
        row = firstFree && secondFree ? 0 : secondFree ? 1 : 0
        const youInSecondRow: boolean = row === 0 && secondFree
        if (youInSecondRow) rowEnds[1] = labelX + span
        youPosition = { x: labelX, y: (youInSecondRow ? ROW_Y[0] : ROW_Y[1]) - YOU_ABOVE_LABEL }
      } else {
        row = firstFree ? 0 : secondFree ? 1 : rowEnds[0] <= rowEnds[1] ? 0 : 1
      }
      rowEnds[row] = labelX + span
      const rowY: number = ROW_Y[row]
      const leaderLength: number = Math.max(0, AXIS_Y - rowY - 4 - LEADER_OFFSET)

      view.group.style.transform = `translate(${x}px, ${AXIS_Y}px)`
      view.group.classList.toggle('is-highlighted', comparison.isHighlighted)
      view.group.setAttribute('aria-label', dotLabel(comparison, hasTarget))
      view.label.style.transform = `translate(${labelX - x}px, ${rowY - AXIS_Y}px)`
      view.leader.style.transform = `translate(0px, ${-LEADER_OFFSET}px) scale(1, ${leaderLength})`
      positions.set(comparison.preset.label, { x, rowY })
      labelBoxes.push({ x: labelX, halfWidth, rowY })
    })

    youLabel.style.transform = `translate(${youPosition.x}px, ${youPosition.y}px)`
    youLine.style.transform = `translate(${youX}px, 0px)`
    youLine.classList.toggle('is-hidden', coincident !== null)

    if (coincident === null) {
      const blocked: Interval[] = [
        ...labelBoxes
          .filter((box: LabelBox): boolean => Math.abs(box.x - youX) <= box.halfWidth + 4)
          .map((box: LabelBox): Interval => [box.rowY - 13, box.rowY + 5]),
        ...placed
          .filter((entry: PlacedDot): boolean => Math.abs(entry.x - youX) <= 12)
          .map((): Interval => [AXIS_Y - 12, AXIS_Y + 12])
      ]
      youPath.setAttribute('d', lineSegments(YOU_LINE_TOP, YOU_LINE_BOTTOM, blocked))
    }

    const youInZoneRow: boolean = youPosition.y === ZONE_Y
    const youHalfWidth: number = textWidth('You') / 2
    squished.classList.toggle(
      'is-hidden',
      youInZoneRow && youPosition.x - youHalfWidth < textWidth('Squished') + LABEL_GAP
    )
    stretched.classList.toggle(
      'is-hidden',
      youInZoneRow && youPosition.x + youHalfWidth > width - textWidth('Stretched') - LABEL_GAP
    )

    root.setAttribute(
      'aria-label',
      `Presets on ${current.effectiveMonitor.label}. Your stretch ${formatPercent(current.stretchPercent)}. ` +
        `Nearest preset ${current.nearest.preset.label}.`
    )
    positionTooltip()
  }

  function drawTicks(values: readonly number[], toX: (value: number) => number): void {
    const visible: Set<number> = new Set<number>(values)

    tickViews.forEach((view: TickView, value: number): void => {
      if (visible.has(value)) return
      tickViews.delete(value)
      view.group.style.transform = `translate(${toX(value)}px, 0px)`
      view.group.classList.add('is-leaving')
      window.setTimeout((): void => view.group.remove(), TICK_LEAVE_MS)
    })

    values.forEach((value: number): void => {
      const x: number = toX(value)
      const existing: TickView | undefined = tickViews.get(value)
      if (existing) {
        existing.group.style.transform = `translate(${x}px, 0px)`
        return
      }

      const isZero: boolean = value === 0
      const size: number = isZero ? 10 : 4
      const group: SVGGElement = svg('g', { class: 'nl-tick-group is-entering' }, [
        svg('line', { class: isZero ? 'nl-tick is-zero' : 'nl-tick', x1: 0, x2: 0, y1: AXIS_Y - size, y2: AXIS_Y + size }),
        svg('text', { class: isZero ? 'nl-text is-zero' : 'nl-text', x: 0, y: TICK_LABEL_Y, 'text-anchor': 'middle' }, [
          isZero ? 'Native' : formatTick(value)
        ])
      ])
      group.style.transform = `translate(${x}px, 0px)`
      ticks.append(group)
      tickViews.set(value, { group })
      requestAnimationFrame((): void => {
        requestAnimationFrame((): void => group.classList.remove('is-entering'))
      })
    })
  }

  function showTooltip(label: string): void {
    activeLabel = label
    positionTooltip()
  }

  function hideTooltip(): void {
    activeLabel = null
    tooltip.classList.remove('is-visible')
  }

  function positionTooltip(): void {
    if (activeLabel === null || current === null) return
    const label: string = activeLabel
    const comparison: PresetComparison | undefined = current.comparisons.find(
      (entry: PresetComparison): boolean => entry.preset.label === label
    )
    const position: DotPosition | undefined = positions.get(label)
    if (!comparison || !position) return

    const arrow: string = changeArrow(comparison)
    const change: string = changeLabel(comparison, current.target !== null)
    tooltipValue.textContent = formatPercent(comparison.stretchPercent)
    tooltipChange.textContent = arrow === '' ? change : `${arrow} ${change}`

    const maxLeft: number = Math.max(0, canvas.clientWidth - tooltip.offsetWidth)
    tooltip.style.left = `${clamp(position.x - tooltip.offsetWidth / 2, 0, maxLeft)}px`
    tooltip.style.top = `${position.rowY - 18 - tooltip.offsetHeight}px`
    tooltip.classList.add('is-visible')
  }

  new ResizeObserver((): void => {
    element.classList.add('is-static')
    draw()
    requestAnimationFrame((): void => element.classList.remove('is-static'))
  }).observe(canvas)

  function render(result: Result): void {
    current = result
    title.textContent = `Stretch on ${monitorName(result)}`
    tweenNumber(summaryFactor, result.stretchFactor, (value: number): string => formatFactor(value))
    tweenNumber(summaryPercent, result.stretchPercent, describeStretch)
    draw()
  }

  return { element, render }
}

function textWidth(text: string): number {
  return text.length * CHAR_WIDTH
}

function lineSegments(top: number, bottom: number, blocked: readonly Interval[]): string {
  const segments: string[] = []
  const sorted: Interval[] = [...blocked].sort((a: Interval, b: Interval): number => a[0] - b[0])
  let start: number = top

  for (let index: number = 0; index < sorted.length && start < bottom; index++) {
    const interval: Interval | undefined = sorted[index]
    if (interval === undefined) continue
    const [from, to]: Interval = interval
    const end: number = Math.min(from, bottom)
    if (end - start >= MIN_SEGMENT) segments.push(`M0 ${start}V${end}`)
    start = Math.max(start, to)
  }

  if (bottom - start >= MIN_SEGMENT) segments.push(`M0 ${start}V${bottom}`)
  return segments.join('')
}

function dotLabel(comparison: PresetComparison, hasTarget: boolean): string {
  const change: string = changeLabel(comparison, hasTarget)
  const changeText: string = change.endsWith('%') ? `${change} vs. current` : change
  return `${comparison.preset.label}: ${formatPercent(comparison.stretchPercent)} stretch, ${changeText}. Use as in-game aspect ratio.`
}