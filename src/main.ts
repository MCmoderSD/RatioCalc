import './style.css'
import { GAME_PRESETS, MONITOR_PRESETS } from './presets'
import { ERROR_FORMAT, parseRatio, type AspectRatio, type ParseResult } from './ratio'
import { detectMonitor, readScreenSize, type DetectedMonitor, type ScreenSize } from './screen'
import { DEFAULT_STATE, stateFromQuery, stateToQuery, type RatioInput, type State } from './state'
import { compute, isFiniteResult, type Result } from './stretch'
import { createCompareTable, type CompareTableView } from './ui/compareTable'
import { createField, type Field, type FieldStatus } from './ui/controls'
import { requireElement } from './ui/dom'
import { createMigration, type MigrationView } from './ui/migration'
import { createNumberLine, type NumberLineView } from './ui/numberLine'
import { createResult, type ResultView } from './ui/result'

type Resolution =
  | { readonly valid: true; readonly ratio: AspectRatio | null; readonly status: FieldStatus }
  | { readonly valid: false; readonly status: FieldStatus }

const IDLE: FieldStatus = { kind: 'idle' }
const ERROR_EXTREME: string = 'This combination is too extreme to calculate'
const NOT_MIGRATING: Resolution = { valid: true, ratio: null, status: IDLE }

const screenSize: ScreenSize | null = readScreenSize()
const detectedMonitor: DetectedMonitor | null = screenSize === null ? null : detectMonitor(screenSize, MONITOR_PRESETS)

let state: State = stateFromQuery(window.location.search, detectedMonitor?.input)

const resultSection: HTMLElement = requireElement('#result')
const resultView: ResultView = createResult()
const compareTable: CompareTableView = createCompareTable(GAME_PRESETS, pickGamePreset)
const numberLine: NumberLineView = createNumberLine(GAME_PRESETS, pickGamePreset)

const monitorField: Field = createField({
  name: 'monitor',
  legend: 'Current monitor',
  presets: MONITOR_PRESETS,
  initial: state.monitor,
  onChange: (monitor: RatioInput): void => setState({ ...state, monitor })
})

const gameField: Field = createField({
  name: 'game',
  legend: 'In-game aspect ratio',
  presets: GAME_PRESETS,
  initial: state.game,
  onChange: (game: RatioInput): void => setState({ ...state, game })
})

const targetField: Field = createField({
  name: 'target',
  legend: 'New monitor',
  presets: MONITOR_PRESETS,
  initial: state.target,
  onChange: (target: RatioInput): void => setState({ ...state, target })
})

const migration: MigrationView = createMigration(targetField, (migrating: boolean): void => setState({ ...state, migrating }))

if (detectedMonitor) monitorField.setLegendNote(`Your screen: ${detectedMonitor.resolution}`)

requireElement('#setup').append(monitorField.element, gameField.element, migration.element)
requireElement('#number-line').append(numberLine.element)
resultSection.append(resultView.element)
requireElement('#compare').append(compareTable.element)

if (!update()) {
  state = { ...DEFAULT_STATE, monitor: detectedMonitor?.input ?? DEFAULT_STATE.monitor }
  monitorField.select(state.monitor)
  gameField.select(state.game)
  targetField.select(state.target)
  update()
}

function pickGamePreset(label: string): void {
  const game: RatioInput = { kind: 'preset', label }
  gameField.select(game)
  setState({ ...state, game })
}

function setState(next: State): void {
  state = next
  update()
}

function update(): boolean {
  migration.setActive(state.migrating)

  const monitor: Resolution = resolveField(state.monitor, MONITOR_PRESETS, false)
  const game: Resolution = resolveField(state.game, GAME_PRESETS, false)
  const target: Resolution = state.migrating ? resolveField(state.target, MONITOR_PRESETS, true) : NOT_MIGRATING

  monitorField.setStatus(monitor.status)
  gameField.setStatus(game.status)
  targetField.setStatus(target.status)

  if (!monitor.valid || !game.valid || !target.valid) return false
  if (monitor.ratio === null || game.ratio === null) return false

  const result: Result = compute({ monitor: monitor.ratio, game: game.ratio, target: target.ratio })
  if (!isFiniteResult(result)) {
    const extreme: FieldStatus = { kind: 'error', message: ERROR_EXTREME }
    if (state.monitor.kind === 'custom') monitorField.setStatus(extreme)
    if (state.game.kind === 'custom') gameField.setStatus(extreme)
    if (state.migrating && state.target?.kind === 'custom') targetField.setStatus(extreme)
    return false
  }

  resultSection.hidden = result.target === null
  resultView.render(result)
  numberLine.render(result)
  compareTable.render(result)
  writeUrl()
  return true
}

function resolveField(input: RatioInput | null, presets: readonly AspectRatio[], optional: boolean): Resolution {
  if (input === null) return { valid: true, ratio: null, status: IDLE }

  if (input.kind === 'preset') {
    const label: string = input.label
    const match: AspectRatio | undefined = presets.find((candidate: AspectRatio): boolean => candidate.label === label)
    return match
      ? { valid: true, ratio: match, status: IDLE }
      : { valid: false, status: { kind: 'error', message: ERROR_FORMAT } }
  }

  if (input.raw.trim() === '') {
    return optional
      ? { valid: true, ratio: null, status: IDLE }
      : { valid: false, status: { kind: 'hint', message: ERROR_FORMAT } }
  }

  const parsed: ParseResult = parseRatio(input.raw, presets)
  if (!parsed.ok) return { valid: false, status: { kind: 'error', message: parsed.error } }

  const message: string = parsed.ratio.isPreset ? `Matches preset ${parsed.ratio.label}` : parsed.ratio.label
  return { valid: true, ratio: parsed.ratio, status: { kind: 'hint', message } }
}

function writeUrl(): void {
  const query: string = stateToQuery(state)
  const { pathname, hash }: Location = window.location
  window.history.replaceState(null, '', `${pathname}${query === '' ? '' : `?${query}`}${hash}`)
}