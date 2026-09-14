import { preset, type AspectRatio } from './ratio'

export const GAME_PRESETS: readonly AspectRatio[] = [
  preset(5, 4),
  preset(4, 3),
  preset(3, 2),
  preset(16, 10),
  preset(5, 3),
  preset(16, 9),
  preset(19, 10),
  preset(21, 9)
]

export const MONITOR_PRESETS: readonly AspectRatio[] = [
  preset(5, 4),
  preset(4, 3),
  preset(3, 2),
  preset(16, 10),
  preset(5, 3),
  preset(16, 9),
  preset(21, 9),
  preset(32, 9)
]