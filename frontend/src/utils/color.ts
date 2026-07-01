/** Small, dependency-free color helpers used to derive a full accent palette from a single hex value. */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16) || 0;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function mixToward(hex: string, target: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [tr, tg, tb] = target;
  return rgbToHex(r + (tr - r) * amount, g + (tg - g) * amount, b + (tb - b) * amount);
}

export function darken(hex: string, amount = 0.18): string {
  return mixToward(hex, [0, 0, 0], amount);
}

export function lighten(hex: string, amount = 0.18): string {
  return mixToward(hex, [255, 255, 255], amount);
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Warm dark or warm light text depending on which reads better on top of `hex`. */
export function pickForeground(hex: string): string {
  return relativeLuminance(hex) > 0.42 ? "#1a1206" : "#fff8ee";
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  const h = hex.trim();
  return h.startsWith("#") ? h : `#${h}`;
}
