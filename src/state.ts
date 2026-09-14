import { GAME_PRESETS, MONITOR_PRESETS } from './presets'
import { parseRatio, type AspectRatio } from './ratio'

export type RatioInput =
  | { readonly kind: 'preset'; readonly label: string }
  | { readonly kind: 'custom'; readonly raw: string }

export interface State {
  readonly monitor: RatioInput
  readonly game: RatioInput
  readonly migrating: boolean
  readonly target: RatioInput | null
}

type QueryEntry = readonly [string, RatioInput | null]

export const DEFAULT_STATE: State = {
  monitor: { kind: 'preset', label: '16:9' },
  game: { kind: 'preset', label: '16:9' },
  migrating: false,
  target: null
}

const PARAM_MONITOR: string = 'monitor'
const PARAM_RATIO: string = 'ratio'
const PARAM_TARGET: string = 'target'

export function stateFromQuery(search: string, fallbackMonitor: RatioInput = DEFAULT_STATE.monitor): State {
  const params: URLSearchParams = new URLSearchParams(search)
  const target: RatioInput | null = inputFromParam(params.get(PARAM_TARGET), MONITOR_PRESETS)
  return {
    monitor: inputFromParam(params.get(PARAM_MONITOR), MONITOR_PRESETS) ?? fallbackMonitor,
    game: inputFromParam(params.get(PARAM_RATIO), GAME_PRESETS) ?? DEFAULT_STATE.game,
    migrating: target !== null,
    target
  }
}

export function stateToQuery(state: State): string {
  const entries: readonly QueryEntry[] = [
    [PARAM_MONITOR, state.monitor],
    [PARAM_RATIO, state.game],
    [PARAM_TARGET, state.migrating ? state.target : null]
  ]
  return entries
    .flatMap(([name, input]: QueryEntry): string[] => {
      const value: string | null = inputToParam(input)
      return value === null ? [] : [`${name}=${encodeParam(value)}`]
    })
    .join('&')
}

function inputFromParam(value: string | null, presets: readonly AspectRatio[]): RatioInput | null {
  if (value === null) return null
  const text: string = value.trim()
  if (presets.some((candidate: AspectRatio): boolean => candidate.label === text)) return { kind: 'preset', label: text }
  return parseRatio(text, presets).ok ? { kind: 'custom', raw: text } : null
}

function inputToParam(input: RatioInput | null): string | null {
  if (input === null) return null
  const value: string = input.kind === 'preset' ? input.label : input.raw.trim()
  return value === '' ? null : value
}

function encodeParam(value: string): string {
  return encodeURIComponent(value).replace(/%3A/gi, ':').replace(/%2F/gi, '/')
}