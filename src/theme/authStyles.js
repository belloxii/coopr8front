// Shared styling for the auth screens (sign in / sign up).
//
// The design goal: no hard outlines. Fields and panels are set apart from the
// card behind them by a slightly different background *shade* instead of a
// border. `action.hover` / `action.selected` are theme-aware overlays — a soft
// grey over a light card, a subtle light film over a dark one — so a single
// value reads correctly in both themes.

export const AUTH_FIELD_VARIANT = "filled";

// Kills the filled-variant underline; spread into a field's InputProps.
export const filledInputProps = { disableUnderline: true };

// Spread onto a TextField / FormControl `sx`. Works for text inputs and selects
// (both render a FilledInput under the hood).
export const filledFieldSx = {
  "& .MuiFilledInput-root": {
    borderRadius: "14px",
    backgroundColor: "action.hover",
    overflow: "hidden",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": { backgroundColor: "action.selected" },
    "&.Mui-focused": {
      backgroundColor: "action.selected",
      boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}55`,
    },
    // Remove the default underline in every state.
    "&:before, &:after": { display: "none" },
  },
};

// Borderless card container — depth comes from a soft shadow, not an outline.
export const authCardSx = {
  borderRadius: 5,
  bgcolor: "background.paper",
  boxShadow: "0 18px 48px -20px rgba(15, 23, 42, 0.45)",
};

// Nested sub-panel (OTP box, passport upload). One faint step above the card so
// it reads as a grouped area without needing a border.
export const authPanelSx = {
  borderRadius: 3,
  border: "none",
  bgcolor: (theme) =>
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
};
