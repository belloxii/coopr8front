import { useEffect } from "react";
import { useTheme } from "../theme/ThemeContext";
import {
  isValidHexColor,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  getPrimaryForeground,
  adjustColorForDarkMode,
  formatHslString,
} from "./colorUtils";

/**
 * Applies the active cooperative tenant's primary brand color to the CSS design system.
 *
 * Rules:
 * 1. Accepts ONLY exact `#RRGGBB` hex strings. Rejects anything else.
 * 2. Converts primary color to HSL and sets `--primary` and `--ring` on document.documentElement.
 * 3. Sets `--primary-foreground` to white or near-black by WCAG contrast (>= 4.5:1).
 * 4. In dark mode, lightens the color if contrast against the background is under 3:1.
 * 5. Restores base defaults when no tenant is known (or color is null/invalid).
 *
 * @param {string|null|undefined} primaryColor - The tenant's primary color hex.
 */
export const useApplyTenantTheme = (primaryColor) => {
  const { mode } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    // If no valid tenant color is provided, restore defaults by removing inline overrides.
    if (!isValidHexColor(primaryColor)) {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--primary-foreground");
      return;
    }

    const rgb = hexToRgb(primaryColor);
    if (!rgb) return;

    let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // In dark mode, ensure at least 3:1 contrast against the dark background.
    if (mode === "dark") {
      hsl = adjustColorForDarkMode(hsl.h, hsl.s, hsl.l);
    }

    // Determine final RGB for foreground text contrast calculation
    const finalRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    const primaryForeground = getPrimaryForeground(finalRgb.r, finalRgb.g, finalRgb.b);
    const hslString = formatHslString(hsl.h, hsl.s, hsl.l);

    root.style.setProperty("--primary", hslString);
    root.style.setProperty("--ring", hslString);
    root.style.setProperty("--primary-foreground", primaryForeground);

    return () => {
      // Cleanup on unmount
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--primary-foreground");
    };
  }, [primaryColor, mode]);
};

export default useApplyTenantTheme;
