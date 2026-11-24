export function normalizeHex(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized.toLowerCase() : null;
}
