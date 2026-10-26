const HEX = /^#([0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value);
}

export function hexToRgb(hex: string): [number, number, number] {
  const m = HEX.exec(hex);
  if (!m) return [249, 211, 107];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mix a colour towards white (amount > 0) or black (amount < 0). */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}

/** "r g b" triplet for Tailwind's rgb(var(--x) / alpha) pattern. */
export function rgbTriplet(hex: string): string {
  return hexToRgb(hex).join(' ');
}

export function hexToNumber(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (r << 16) | (g << 8) | b;
}

/** Relative luminance, used to pick readable text on brand colours. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readableOn(hex: string): string {
  return luminance(hex) > 0.45 ? '#0a0b26' : '#ffffff';
}

/** CSS custom properties that re-theme the UI for an event. */
export function themeVars(primary: string, accent: string): Record<string, string> {
  return {
    '--brand-primary': rgbTriplet(primary),
    '--brand-accent': rgbTriplet(accent),
    '--brand-on-primary': readableOn(primary),
  };
}
