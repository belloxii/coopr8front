import { useState } from "react";
import {
  Button,
  TextField,
  CircularProgress,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { requestPasswordReset, resetPassword } from "../../Store/Auth/Action";
import {
  AUTH_FIELD_VARIANT,
  filledInputProps,
  filledFieldSx,
  authCardSx,
} from "../../theme/authStyles";

/**
 * Password reset, in two steps on one page.
 *
 * Step 1 asks for the membership number and the email on file and requests a code. Step 2 takes the
 * code and the new password.
 *
 * Three things about this form are security decisions rather than UX ones:
 *
 * 1. **The cooperative is part of the request.** Reset is never "the account with this email" --
 *    the same address can belong to a member of more than one cooperative. On /o/{slug}/... the
 *    slug supplies it; password reset is unavailable without that tenant identity.
 *
 * 2. **Step 1's answer is the same either way.** Whether or not that member exists, the message is
 *    identical, so this form cannot be used to find out who belongs to a cooperative. That is why
 *    it always advances to step 2 -- stopping here on "no such member" would leak the very thing
 *    the identical message hides.
 *
 * 3. **The code is emailed to the address already on the record**, not to the address typed in
 *    here. Typing someone else's email does not redirect their reset code.
 */
const ForgotPasswordForm = ({ organizationSlug }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [ledgerID, setLedgerID] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loginPath = `/o/${organizationSlug}/login`;

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const result = await dispatch(
      requestPasswordReset({
        organization: organizationSlug,
        ledgerID,
        email,
      })
    );

    setLoading(false);

    // Advance regardless of the response code. A member who exists and one who does not get the
    // same screen, for the reason given above; only a transport-level failure stops here.
    if (result?.responseMessage) {
      setNotice(result.responseMessage);
    } else {
      setNotice(
        "If that membership number and email match a member, a reset code has been sent."
      );
    }
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    const result = await dispatch(
      resetPassword({
        organization: organizationSlug,
        ledgerID,
        email,
        otp,
        newPassword,
        confirmPassword,
      })
    );

    setLoading(false);

    if (result?.responseCode === "100") {
      setNotice(
        result.responseMessage || "Your password has been reset. Please sign in."
      );
      setTimeout(() => navigate(loginPath), 1500);
      return;
    }

    setError(
      result?.responseMessage ||
        "That code could not be used. Request a new one and try again."
    );
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, ...authCardSx }}>
      <form onSubmit={step === 1 ? handleRequest : handleReset} className="w-full">
        <h2 className="text-2xl font-bold mb-2 text-left text-foreground">
          Reset your password
        </h2>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {step === 1
            ? "Enter your membership number and the email address on your member record. We will send a code to that address."
            : "Enter the code from your email and choose a new password."}
        </Typography>

        {notice && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {notice}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 1 ? (
          <>
            <div className="mb-5">
              <TextField
                fullWidth
                variant={AUTH_FIELD_VARIANT}
                label="Membership number"
                placeholder="e.g. ABC0001"
                required
                value={ledgerID}
                onChange={(e) =>
                  setLedgerID(
                    e.target.value
                      .replace(/[^A-Za-z0-9]/g, "")
                      .toUpperCase()
                      .slice(0, 24)
                  )
                }
                helperText="Your full membership number, as issued by your cooperative."
                sx={filledFieldSx}
                InputProps={filledInputProps}
              />
            </div>

            <div className="mb-6">
              <TextField
                fullWidth
                type="email"
                variant={AUTH_FIELD_VARIANT}
                label="Email on your record"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="The code is sent to the address already on your record."
                sx={filledFieldSx}
                InputProps={filledInputProps}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-5">
              <TextField
                fullWidth
                variant={AUTH_FIELD_VARIANT}
                label="Reset code"
                required
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                inputProps={{ maxLength: 5, inputMode: "numeric" }}
                sx={filledFieldSx}
                InputProps={filledInputProps}
              />
            </div>

            <div className="mb-5">
              <TextField
                fullWidth
                variant={AUTH_FIELD_VARIANT}
                label="New password"
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="At least 8 characters, with an upper case letter, a lower case letter, a number and a symbol."
                sx={filledFieldSx}
                InputProps={{
                  ...filledInputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div className="mb-6">
              <TextField
                fullWidth
                variant={AUTH_FIELD_VARIANT}
                label="Confirm new password"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={Boolean(confirmPassword) && confirmPassword !== newPassword}
                helperText={
                  Boolean(confirmPassword) && confirmPassword !== newPassword
                    ? "The two passwords do not match."
                    : " "
                }
                sx={filledFieldSx}
                InputProps={filledInputProps}
              />
            </div>
          </>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={
            loading ||
            (step === 1
              ? ledgerID.length === 0 || email.length === 0
              : otp.length === 0 ||
                newPassword.length === 0 ||
                confirmPassword.length === 0)
          }
          sx={{
            borderRadius: "999px",
            py: 1.6,
            bgcolor: green[600],
            textTransform: "none",
            fontSize: "16px",
            "&:hover": { bgcolor: green[700] },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : step === 1 ? (
            "Send reset code"
          ) : (
            "Set new password"
          )}
        </Button>

        <div className="mt-6 flex justify-between">
          {step === 2 && (
            <Button
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
                setNotice("");
              }}
              sx={{ textTransform: "none", color: green[700] }}
            >
              Request another code
            </Button>
          )}

          <Button
            onClick={() => navigate(loginPath)}
            sx={{ textTransform: "none", color: green[700], ml: "auto" }}
          >
            Back to sign in
          </Button>
        </div>
      </form>
    </Paper>
  );
};

export default ForgotPasswordForm;
