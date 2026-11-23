const GENERATION_SPEED_MIN = 1;
const GENERATION_SPEED_MAX = 10;
export function isInteractiveKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ['input', 'textarea', 'select', 'button'].includes(tagName);
}

export function clampGenerationSpeed(value: number): number {
  return Math.min(GENERATION_SPEED_MAX, Math.max(GENERATION_SPEED_MIN, value));
}
