import type { Field } from './controls'
import { h } from './dom'

export interface MigrationView {
  readonly element: HTMLElement
  setActive(active: boolean): void
}

/** "Migrate to a new monitor" button that swaps itself for the new-monitor field and a cancel button. */
export function createMigration(targetField: Field, onToggle: (active: boolean) => void): MigrationView {
  const start: HTMLButtonElement = h('button', { type: 'button', class: 'button' }, [
    'Migrate to a new monitor',
    h('span', { class: 'button__icon', 'aria-hidden': 'true' }, ['→']),
  ])
  const cancel: HTMLButtonElement = h('button', { type: 'button', class: 'button button--quiet' }, ['Cancel migration'])
  const panel: HTMLDivElement = h('div', { class: 'migration__panel' }, [targetField.element, cancel])
  const element: HTMLDivElement = h('div', { class: 'migration' }, [start, panel])

  start.addEventListener('click', (): void => {
    onToggle(true)
    targetField.focus()
  })
  cancel.addEventListener('click', (): void => {
    onToggle(false)
    start.focus()
  })

  function setActive(active: boolean): void {
    start.hidden = active
    panel.hidden = !active
  }

  return { element, setActive }
}
