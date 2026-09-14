const REDUCED_MOTION_QUERY: string = '(prefers-reduced-motion: reduce)'
const EASE_OUT: string = 'cubic-bezier(0.22, 1, 0.36, 1)'
const TWEEN_DURATION: number = 360
const PULSE_DURATION: number = 420
const POP_DURATION: number = 360

interface Tween {
  value: number
  frame: number
}

const tweens: WeakMap<HTMLElement, Tween> = new WeakMap<HTMLElement, Tween>()

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** Counts the number shown in `element` from its last value to `to`. The first call sets it directly. */
export function tweenNumber(element: HTMLElement, to: number, format: (value: number) => string): void {
  const tween: Tween | undefined = tweens.get(element)
  if (tween === undefined || prefersReducedMotion()) {
    if (tween !== undefined) cancelAnimationFrame(tween.frame)
    tweens.set(element, { value: to, frame: 0 })
    element.textContent = format(to)
    return
  }

  cancelAnimationFrame(tween.frame)
  if (tween.value === to) {
    element.textContent = format(to)
    return
  }

  const from: number = tween.value
  const start: number = performance.now()
  const step: (now: number) => void = (now: number): void => {
    const progress: number = Math.min((now - start) / TWEEN_DURATION, 1)
    const eased: number = 1 - (1 - progress) ** 4
    tween.value = progress === 1 ? to : from + (to - from) * eased
    element.textContent = format(tween.value)
    if (progress < 1) tween.frame = requestAnimationFrame(step)
  }
  tween.frame = requestAnimationFrame(step)
}

/** Sets the text and briefly fades it in when it actually changed. */
export function setTextWithPulse(element: HTMLElement, text: string): void {
  if (element.textContent === text) return
  const hadText: boolean = element.textContent !== ''
  element.textContent = text
  if (hadText) pulse(element)
}

export function pulse(element: Element): void {
  if (prefersReducedMotion()) return
  const keyframes: Keyframe[] = [{ opacity: 0.25 }, { opacity: 1 }]
  element.animate(keyframes, { duration: PULSE_DURATION, easing: EASE_OUT })
}

export function pop(element: Element): void {
  if (prefersReducedMotion()) return
  const keyframes: Keyframe[] = [
    { opacity: 0, transform: 'scale(0.9)' },
    { opacity: 1, transform: 'scale(1)' },
  ]
  element.animate(keyframes, { duration: POP_DURATION, easing: EASE_OUT })
}
