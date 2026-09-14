import type { AspectRatio } from '../ratio'
import type { RatioInput } from '../state'
import { h } from './dom'

export type FieldStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'hint'; readonly message: string }
  | { readonly kind: 'error'; readonly message: string }

export interface FieldOptions {
  readonly name: string
  readonly legend: string
  readonly presets: readonly AspectRatio[]
  /** null = no chip selected */
  readonly initial: RatioInput | null
  readonly onChange: (input: RatioInput) => void
}

export interface Field {
  readonly element: HTMLFieldSetElement
  select(input: RatioInput | null): void
  setStatus(status: FieldStatus): void
  /** Small muted text next to the legend, e.g. the detected screen. */
  setLegendNote(text: string | null): void
  /** Focuses the selected chip, or the first one. */
  focus(): void
}

const VALUE_CUSTOM: string = 'custom'

export function createField(options: FieldOptions): Field {
  const { name, legend, presets, initial, onChange }: FieldOptions = options
  const noteId: string = `${name}-custom-note`
  const radios: HTMLInputElement[] = []

  const chip: (value: string, text: string) => HTMLLabelElement = (value: string, text: string): HTMLLabelElement => {
    const radio: HTMLInputElement = h('input', { type: 'radio', name, value, class: 'chip__input' })
    radios.push(radio)
    return h('label', { class: 'chip' }, [radio, h('span', { class: 'chip__label' }, [text])])
  }

  const chips: HTMLDivElement = h('div', { class: 'chips' }, [
    ...presets.map((candidate: AspectRatio): HTMLLabelElement => chip(candidate.label, candidate.label)),
    chip(VALUE_CUSTOM, 'Custom…'),
  ])

  const customInput: HTMLInputElement = h('input', {
    type: 'text',
    id: `${name}-custom`,
    class: 'custom__input',
    placeholder: 'e.g. 3440x1440 or 1.85',
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': `${legend}: custom ratio`,
    'aria-describedby': noteId,
  })
  const note: HTMLParagraphElement = h('p', { id: noteId, class: 'custom__note' })
  const custom: HTMLDivElement = h('div', { class: 'custom' }, [customInput, note])

  const legendNote: HTMLSpanElement = h('span', { class: 'field__legend-note' })
  legendNote.hidden = true

  const element: HTMLFieldSetElement = h('fieldset', { class: 'field' }, [
    h('legend', { class: 'field__legend' }, [legend, legendNote]),
    chips,
    custom,
  ])

  // Only a pointer selection moves focus into the custom input; arrow-key users stay in the radio group.
  let selectingWithPointer: boolean = false
  chips.addEventListener('pointerdown', (): void => {
    selectingWithPointer = true
  })

  chips.addEventListener('change', (event: Event): void => {
    const radio: EventTarget | null = event.target
    if (!(radio instanceof HTMLInputElement)) return
    const isCustom: boolean = radio.value === VALUE_CUSTOM
    custom.hidden = !isCustom

    if (isCustom) {
      if (selectingWithPointer) customInput.focus()
      onChange({ kind: 'custom', raw: customInput.value })
    } else {
      onChange({ kind: 'preset', label: radio.value })
    }
    selectingWithPointer = false
  })

  customInput.addEventListener('input', (): void => {
    onChange({ kind: 'custom', raw: customInput.value })
  })

  function select(input: RatioInput | null): void {
    const value: string | null = input === null ? null : input.kind === 'preset' ? input.label : VALUE_CUSTOM
    radios.forEach((radio: HTMLInputElement): void => {
      radio.checked = radio.value === value
    })
    if (input?.kind === 'custom') customInput.value = input.raw
    custom.hidden = value !== VALUE_CUSTOM
  }

  function setStatus(status: FieldStatus): void {
    const isError: boolean = status.kind === 'error'
    note.textContent = status.kind === 'idle' ? '' : status.message
    note.classList.toggle('is-error', isError)
    if (isError) customInput.setAttribute('aria-invalid', 'true')
    else customInput.removeAttribute('aria-invalid')
  }

  function setLegendNote(text: string | null): void {
    legendNote.textContent = text ?? ''
    legendNote.hidden = text === null
  }

  function focus(): void {
    const radio: HTMLInputElement | undefined =
      radios.find((candidate: HTMLInputElement): boolean => candidate.checked) ?? radios[0]
    radio?.focus()
  }

  select(initial)
  return { element, select, setStatus, setLegendNote, focus }
}
