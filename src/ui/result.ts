import { describeStretch, formatFactor, formatPercent } from '../format'
import type { Result } from '../stretch'
import { h } from './dom'
import { pop, setTextWithPulse, tweenNumber } from './motion'

export interface ResultView {
  readonly element: HTMLElement
  render(result: Result): void
}

/** Migration answer: current setup on the left, what to set on the new monitor on the right. */
export function createResult(): ResultView {
  const factor: HTMLParagraphElement = h('p', { class: 'result__factor' })
  const percent: HTMLParagraphElement = h('p', { class: 'result__percent' })
  const context: HTMLParagraphElement = h('p', { class: 'result__context' })

  const targetCaption: HTMLParagraphElement = h('p', { class: 'caption' })
  const recommendedPreset: HTMLParagraphElement = h('p', { class: 'result__preset' })
  const details: HTMLParagraphElement = h('p', { class: 'result__details' })

  const element: HTMLDivElement = h('div', { class: 'card result' }, [
    h('div', { class: 'result__current' }, [h('p', { class: 'caption' }, ['Your stretch now']), factor, percent, context]),
    h('div', { class: 'result__target' }, [targetCaption, recommendedPreset, details]),
  ])

  function render(result: Result): void {
    tweenNumber(factor, result.stretchFactor, (value: number): string => formatFactor(value))
    tweenNumber(percent, result.stretchPercent, describeStretch)
    context.textContent = `${result.game.label} on ${result.monitor.label}`

    if (result.target === null) return
    targetCaption.textContent = `On ${result.target.label}, set in-game to`

    const preset: string = result.nearest.preset.label
    if (recommendedPreset.textContent !== preset) {
      const hadPreset: boolean = recommendedPreset.textContent !== ''
      recommendedPreset.textContent = preset
      if (hadPreset) pop(recommendedPreset)
    }

    setTextWithPulse(
      details,
      result.isExactMatch
        ? 'Exact match'
        : `Ideal ${result.idealDescription} · ${formatPercent(result.nearest.changePercent)} vs. current`,
    )
  }

  return { element, render }
}
