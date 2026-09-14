import { formatPercent } from '../format'
import type { AspectRatio } from '../ratio'
import { EXACT_MATCH_THRESHOLD, type PresetComparison, type Result } from '../stretch'
import { h } from './dom'
import { setTextWithPulse } from './motion'

export interface CompareTableView {
  readonly element: HTMLElement
  render(result: Result): void
}

interface RowView {
  readonly row: HTMLTableRowElement
  readonly stretch: HTMLTableCellElement
  readonly arrow: HTMLSpanElement
  readonly change: HTMLSpanElement
}

export function createCompareTable(
  presets: readonly AspectRatio[],
  onPick: (label: string) => void
): CompareTableView {
  const title: HTMLHeadingElement = h('h2', { id: 'compare-title', class: 'section-title' })
  const body: HTMLTableSectionElement = h('tbody')
  const rows: Map<string, RowView> = new Map<string, RowView>()

  presets.forEach((candidate: AspectRatio): void => {
    const pick: HTMLButtonElement = h('button', {
      type: 'button',
      class: 'compare__pick',
      'aria-label': `Use ${candidate.label} as in-game aspect ratio`
    }, [candidate.label])
    const stretch: HTMLTableCellElement = h('td')
    const arrow: HTMLSpanElement = h('span', { class: 'compare__arrow', 'aria-hidden': 'true' })
    const change: HTMLSpanElement = h('span')
    const row: HTMLTableRowElement = h('tr', {}, [h('th', { scope: 'row' }, [pick]), stretch, h('td', {}, [arrow, change])])

    row.addEventListener('click', (): void => onPick(candidate.label))
    rows.set(candidate.label, { row, stretch, arrow, change })
    body.append(row)
  })

  const table: HTMLTableElement = h('table', { class: 'compare' }, [
    h('thead', {}, [
      h('tr', {}, [
        h('th', { scope: 'col' }, ['Preset']),
        h('th', { scope: 'col' }, ['Stretch']),
        h('th', { scope: 'col' }, ['vs. current'])
      ])
    ]),
    body
  ])

  const element: HTMLDivElement = h('div', {}, [title, h('div', { class: 'card table-wrap' }, [table])])

  function render(result: Result): void {
    title.textContent = `Presets on ${monitorName(result)}`
    result.comparisons.forEach((comparison: PresetComparison): void => {
      const view: RowView | undefined = rows.get(comparison.preset.label)
      if (!view) return
      view.row.classList.toggle('is-highlighted', comparison.isHighlighted)
      setTextWithPulse(view.stretch, formatPercent(comparison.stretchPercent))
      view.arrow.textContent = changeArrow(comparison)
      setTextWithPulse(view.change, changeLabel(comparison, result.target !== null))
    })
  }

  return { element, render }
}

export function monitorName(result: Result): string {
  return result.target === null ? result.effectiveMonitor.label : `${result.target.label} (new monitor)`
}

export function changeArrow(comparison: PresetComparison): string {
  if (Math.abs(comparison.changePercent) < EXACT_MATCH_THRESHOLD) return ''
  return comparison.changePercent > 0 ? '▲' : '▼'
}

export function changeLabel(comparison: PresetComparison, hasTarget: boolean, digits: number = 1): string {
  if (Math.abs(comparison.changePercent) < EXACT_MATCH_THRESHOLD) return hasTarget ? 'exact match' : 'current'
  return formatPercent(comparison.changePercent, digits)
}