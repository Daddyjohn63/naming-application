/** Marks a component's root DOM node for DevTools inspection. */
export function dataComponent(name: string): { "data-component": string } {
  return { "data-component": name }
}
