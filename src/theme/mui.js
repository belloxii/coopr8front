import { createTheme } from "@mui/material/styles";

/**
 * Builds the MUI theme for a given mode so MUI components (Menu, Popover,
 * Avatar, Badge, BottomNavigation, Select, Skeleton, Modal paper, …) track the
 * same light/dark toggle as the Tailwind layer. Palette values are kept close
 * to the CSS-variable tokens in index.css (green primary, matching surfaces).
 */
export const buildMuiTheme = (mode) => {
  // Field fill that is clearly distinct from the card/paper behind it, mirroring
  // the Tailwind --input token (light hsl(214 32% 91%) / dark hsl(217 33% 24%)).
  // action.hover is only a ~5% overlay and disappears on a white/dark card, so
  // we use a concrete step instead. Hover/focus deepen it slightly.
  const fieldFill =
    mode === "dark" ? "hsl(217, 33%, 24%)" : "hsl(214, 30%, 86%)";
  const fieldFillStrong =
    mode === "dark" ? "hsl(217, 33%, 28%)" : "hsl(214, 30%, 81%)";

  return createTheme({
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#2fbf6b" : "#1fa65a" },
      ...(mode === "dark"
        ? {
            background: { default: "#0b1220", paper: "#141c2b" },
            text: { primary: "#eef2f7", secondary: "#9aa8bd" },
            divider: "rgba(148,163,184,0.24)",
          }
        : {
            background: { default: "#ffffff", paper: "#ffffff" },
          }),
    },
    shape: { borderRadius: 8 },
    components: {
      // App-wide "no outline" modern input: every TextField / Select renders as a
      // filled, borderless, softly-shaded field with a focus ring instead of a
      // border. Flipping the defaults here restyles all modals and forms at once
      // (change-password, edit-profile, loan/share dialogs, …) without touching
      // each field. Individual fields can still opt out with variant="outlined".
      MuiTextField: {
        defaultProps: { variant: "filled" },
      },
      MuiSelect: {
        defaultProps: { variant: "filled" },
      },
      MuiFilledInput: {
        defaultProps: { disableUnderline: true },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 14,
            backgroundColor: fieldFill,
            transition: "background-color 120ms ease, box-shadow 120ms ease",
            "&:hover": {
              backgroundColor: fieldFillStrong,
            },
            "&.Mui-focused": {
              backgroundColor: fieldFillStrong,
              boxShadow: `0 0 0 2px ${theme.palette.primary.main}55`,
            },
            "&.Mui-error.Mui-focused": {
              boxShadow: `0 0 0 2px ${theme.palette.error.main}55`,
            },
            // Kill the default filled-input underline pseudo-elements.
            "&:before, &:after": { display: "none" },
          }),
        },
      },
    },
  });
};

