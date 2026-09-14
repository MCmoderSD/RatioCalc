type Attributes = Readonly<Record<string, string | number>>
type Child = Node | string

const SVG_NAMESPACE: 'http://www.w3.org/2000/svg' = 'http://www.w3.org/2000/svg'

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  children: readonly Child[] = []
): HTMLElementTagNameMap[K] {
  const element: HTMLElementTagNameMap[K] = document.createElement(tag)
  setAttributes(element, attributes)
  element.append(...children)
  return element
}

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  children: readonly Child[] = []
): SVGElementTagNameMap[K] {
  const element: SVGElementTagNameMap[K] = document.createElementNS(SVG_NAMESPACE, tag)
  setAttributes(element, attributes)
  element.append(...children)
  return element
}

export function setAttributes(element: Element, attributes: Attributes): void {
  Object.entries(attributes).forEach(([name, value]: [string, string | number]): void => {
    element.setAttribute(name, String(value))
  })
}

export function requireElement(selector: string): HTMLElement {
  const element: HTMLElement | null = document.querySelector<HTMLElement>(selector)
  if (!element) throw new Error(`Missing element ${selector}`)
  return element
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}