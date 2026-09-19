import {
  isValidHexColor,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  getLuminance,
  getContrastRatio,
  getPrimaryForeground,
  adjustColorForDarkMode,
  formatHslString,
} from "./colorUtils";

describe("colorUtils", () => {
  describe("isValidHexColor", () => {
    it("accepts valid #RRGGBB strings", () => {
      expect(isValidHexColor("#10B981")).toBe(true);
      expect(isValidHexColor("#ffffff")).toBe(true);
      expect(isValidHexColor("#000000")).toBe(true);
      expect(isValidHexColor("#1a56db")).toBe(true);
      expect(isValidHexColor("  #10B981  ")).toBe(true);
    });

    it("rejects invalid formats, shorthand, named colors, and script injections", () => {
      expect(isValidHexColor("")).toBe(false);
      expect(isValidHexColor(null)).toBe(false);
      expect(isValidHexColor(undefined)).toBe(false);
      expect(isValidHexColor("#fff")).toBe(false);
      expect(isValidHexColor("10B981")).toBe(false);
      expect(isValidHexColor("#10B981AA")).toBe(false);
      expect(isValidHexColor("green")).toBe(false);
      expect(isValidHexColor("rgb(0,0,0)")).toBe(false);
      expect(isValidHexColor("javascript:alert(1)")).toBe(false);
    });
  });

  describe("hexToRgb", () => {
    it("correctly converts valid hex to RGB", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#10b981")).toEqual({ r: 16, g: 185, b: 129 });
    });

    it("returns null for invalid hex", () => {
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb(null)).toBeNull();
    });
  });

  describe("rgbToHsl and hslToRgb", () => {
    it("round-trips standard colors", () => {
      const original = { r: 16, g: 185, b: 129 };
      const hsl = rgbToHsl(original.r, original.g, original.b);
      const converted = hslToRgb(hsl.h, hsl.s, hsl.l);

      expect(Math.abs(converted.r - original.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(converted.g - original.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(converted.b - original.b)).toBeLessThanOrEqual(2);
    });
  });

  describe("getLuminance and getContrastRatio", () => {
    it("computes standard extremes correctly", () => {
      const whiteLum = getLuminance(255, 255, 255);
      const blackLum = getLuminance(0, 0, 0);

      expect(whiteLum).toBeCloseTo(1.0, 2);
      expect(blackLum).toBeCloseTo(0.0, 2);

      const ratio = getContrastRatio(whiteLum, blackLum);
      expect(ratio).toBeCloseTo(21.0, 1);
    });
  });

  describe("getPrimaryForeground", () => {
    it("returns white text for dark backgrounds (>= 4.5:1 ratio)", () => {
      // Dark navy: #1e3a8a -> (30, 58, 138)
      expect(getPrimaryForeground(30, 58, 138)).toBe("0 0% 100%");
      // Dark green: #064e3b -> (6, 78, 59)
      expect(getPrimaryForeground(6, 78, 59)).toBe("0 0% 100%");
    });

    it("returns dark text for bright backgrounds where white fails 4.5:1", () => {
      // Bright yellow: #facc15 -> (250, 204, 21)
      expect(getPrimaryForeground(250, 204, 21)).toBe("222 47% 11%");
      // Pure white: (255, 255, 255)
      expect(getPrimaryForeground(255, 255, 255)).toBe("222 47% 11%");
    });
  });

  describe("adjustColorForDarkMode", () => {
    it("lightens very dark colors to achieve at least 3:1 contrast against dark canvas", () => {
      // Extremely dark blue: h=220, s=80, l=10
      const adjusted = adjustColorForDarkMode(220, 80, 10);
      expect(adjusted.l).toBeGreaterThan(10);

      const rgb = hslToRgb(adjusted.h, adjusted.s, adjusted.l);
      const lum = getLuminance(rgb.r, rgb.g, rgb.b);
      const darkBgLum = getLuminance(11, 15, 26);
      const ratio = getContrastRatio(lum, darkBgLum);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it("leaves sufficiently bright colors untouched", () => {
      // Bright emerald: h=160, s=84, l=39
      const adjusted = adjustColorForDarkMode(160, 84, 39);
      expect(adjusted.l).toBe(39);
    });
  });

  describe("formatHslString", () => {
    it("formats HSL numbers into Tailwind CSS variable format", () => {
      expect(formatHslString(160.4, 84.1, 39.2)).toBe("160 84% 39%");
    });
  });
});
