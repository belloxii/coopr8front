/**
 * Color and WCAG contrast utilities for multi-tenant dynamic theme styling.
 */

/**
 * Validates that a color is in exact #RRGGBB hex format.
 * Rejects anything else so no arbitrary strings reach CSS properties.
 *
 * @param {string} hex
 * @returns {boolean}
 */
export function isValidHexColor(hex) {
  return typeof hex === "string" && /^#[0-9a-fA-F]{6}$/.test(hex.trim());
}

/**
 * Parses #RRGGBB into { r, g, b } (0-255).
 *
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }|null}
 */
export function hexToRgb(hex) {
  if (!isValidHexColor(hex)) return null;
  const clean = hex.trim();
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Converts RGB (0-255) to HSL { h: 0-360, s: 0-100, l: 0-100 }.
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{ h: number, s: number, l: number }}
 */
export function rgbToHsl(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL back to RGB { r: 0-255, g: 0-255, b: 0-255 }.
 *
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {{ r: number, g: number, b: number }}
 */
export function hslToRgb(h, s, l) {
  const hNorm = (h % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p, q, t) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

/**
 * Calculates WCAG relative luminance of an sRGB color.
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG contrast ratio between two luminances (range 1:1 to 21:1).
 *
 * @param {number} lum1
 * @param {number} lum2
 * @returns {number}
 */
export function getContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines whether text on top of the primary color should be white ("0 0% 100%")
 * or near-black ("222 47% 11%") based on WCAG AA 4.5:1 threshold.
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} HSL string for --primary-foreground
 */
export function getPrimaryForeground(r, g, b) {
  const lum = getLuminance(r, g, b);
  const contrastWithWhite = getContrastRatio(lum, 1.0);
  return contrastWithWhite >= 4.5 ? "0 0% 100%" : "222 47% 11%";
}

/**
 * In dark mode, ensures the primary color has at least 3:1 contrast against the
 * dark mode canvas background (hsl(222 47% 8%)). If not, increases lightness.
 *
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {{ h: number, s: number, l: number }}
 */
export function adjustColorForDarkMode(h, s, l) {
  // Dark background hsl(222 47% 8%) ~ rgb(11, 15, 26)
  const darkBgLum = getLuminance(11, 15, 26);
  let currentL = l;
  let rgb = hslToRgb(h, s, currentL);
  let lum = getLuminance(rgb.r, rgb.g, rgb.b);
  let ratio = getContrastRatio(lum, darkBgLum);

  while (ratio < 3.0 && currentL < 90) {
    currentL = Math.min(90, currentL + 4);
    rgb = hslToRgb(h, s, currentL);
    lum = getLuminance(rgb.r, rgb.g, rgb.b);
    ratio = getContrastRatio(lum, darkBgLum);
  }

  return { h, s, l: currentL };
}

/**
 * Formats HSL components into "H S% L%" string for Tailwind consumption.
 *
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {string}
 */
export function formatHslString(h, s, l) {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}
