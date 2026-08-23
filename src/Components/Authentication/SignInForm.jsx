import {
  Button,
  TextField,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../Store/Auth/Action";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AUTH_FIELD_VARIANT, filledInputProps, filledFieldSx, authCardSx } from "../../theme/authStyles";

const SignInForm = ({ organizationSlug }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // The ledger ID prefix is per-organization (Organization.ledgerPrefix), so the member types
  // their full membership number exactly as issued instead of the client assuming a prefix.
  // Nothing about the ledger format is hardcoded here.
  const [ledgerID, setLedgerID] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseCode, setResponseCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Keeps the member inside the cooperative they arrived at: from /o/{slug}/login, "Forgot
  // Password?" and "Create Account" must not drop the slug, or the next page would no longer know
  // which cooperative it is for.
  const within = (page) =>
    organizationSlug ? `/o/${organizationSlug}/${page}` : `/${page}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setPopupOpen(true);
    setResponseCode("");
    setResponseText("Logging in...");

    try {
      await dispatch(
        loginUser({
          // Which cooperative to look this membership number up in. Present when the member
          // arrived at /o/{slug}/login, which is the normal path. Omitted on plain /login, where
          // the backend falls back to the number's own prefix -- that fallback resolves a single
          // cooperative or fails, and it never widens a slug that was supplied here.
          organization: organizationSlug,
          ledgerID,
          password,
        })
      );

      setTimeout(() => {
        const resCode = localStorage.getItem("resCode");
        const resMsg = localStorage.getItem("resMsg");

        setResponseCode(resCode);
        setResponseText(resMsg || "Unable to login.");

        if (resCode === "100") {
          setTimeout(() => {
            setPopupOpen(false);
            navigate("/home");
            navigate(0);
          }, 1200);
        } else {
          setLoading(false);
        }
      }, 500);
    } catch (err) {
      setLoading(false);
      setResponseCode("error");
      setResponseText("Something went wrong. Please try again.");
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, ...authCardSx }}>
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-left text-foreground">
        Welcome back
      </h2>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Sign in with your cooperative ledger ID and password.
      </Typography>

      {/* Ledger ID */}
      <div className="mb-5">
        <TextField
          fullWidth
          variant={AUTH_FIELD_VARIANT}
          label="Membership number"
          placeholder="e.g. ABC0001"
          required
          value={ledgerID}
          onChange={(e) => {
            const value = e.target.value
              .replace(/[^A-Za-z0-9]/g, "")
              .toUpperCase()
              .slice(0, 24);

            setLedgerID(value);
          }}
          helperText="Enter your full membership number as issued by your cooperative."
          sx={filledFieldSx}
          InputProps={filledInputProps}
        />
      </div>

      {/* Password */}
      <div className="mb-2">
        <TextField
          fullWidth
          variant={AUTH_FIELD_VARIANT}
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={filledFieldSx}
          InputProps={{
            ...filledInputProps,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Forgot password */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => navigate(within("forgot-password"))}
          sx={{
            textTransform: "none",
            color: green[700],
          }}
        >
          Forgot Password?
        </Button>
      </div>

      {/* Login */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={
          loading ||
          ledgerID.length === 0 ||
          password.length === 0
        }
        sx={{
          borderRadius: "999px",
          py: 1.6,
          bgcolor: green[600],
          textTransform: "none",
          fontSize: "16px",
          "&:hover": {
            bgcolor: green[700],
          },
        }}
      >
        {loading ? (
          <CircularProgress
            size={24}
            color="inherit"
          />
        ) : (
          "Login"
        )}
      </Button>

      <div className="my-8">
        <Typography align="center" color="text.secondary">
          Don't have an account?
        </Typography>

        <Button
          fullWidth
          variant="text"
          disableElevation
          sx={{
            mt: 2,
            borderRadius: "999px",
            py: 1.5,
            color: green[700],
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(47,191,107,0.14)" : "rgba(31,166,90,0.10)",
            textTransform: "none",
            "&:hover": {
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(47,191,107,0.22)" : "rgba(31,166,90,0.18)",
            },
          }}
          onClick={() => navigate(within("signup"))}
        >
          Create Account
        </Button>
      </div>

      {/* Status Dialog */}
      <Dialog
        open={popupOpen}
        onClose={!loading ? () => setPopupOpen(false) : undefined}
      >
        <DialogTitle>Login Status</DialogTitle>

        <DialogContent>
          <Typography
            color={
              responseCode === "100"
                ? "success.main"
                : responseCode
                ? "error.main"
                : "text.primary"
            }
          >
            {responseText}
          </Typography>
        </DialogContent>

        {!loading && responseCode !== "100" && (
          <DialogActions>
            <Button
              onClick={() => setPopupOpen(false)}
              sx={{
                color: green[700],
                textTransform: "none",
              }}
            >
              Close
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </form>
    </Paper>
  );
};

export default SignInForm;
