// src/components/OtpInputSection.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { TextField, Button, CircularProgress } from "@mui/material";
import { green, yellow } from "@mui/material/colors";
import { sendOTP, validateOTP } from "../Store/Auth/Action";
import { AUTH_FIELD_VARIANT, filledInputProps, filledFieldSx } from "../theme/authStyles";

/**
 * Sends and validates a one-time code.
 *
 * `organization` is the cooperative slug and is required for the unauthenticated purposes
 * (`signup`, `forgetpass`), because the same email address can belong to a member of more than one
 * cooperative and a code must only ever be valid inside the one it was issued for.
 *
 * It is deliberately omitted for `changepass`: that caller is already signed in, so the backend
 * takes the cooperative from their token and would ignore anything sent here.
 */
const OtpInputSection = ({ email, organization, action, onOtpValidated }) => {
  const dispatch = useDispatch();

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false); // purely controls OTP field visibility
  const [otpValid, setOtpValid] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [response, setResponse] = useState({ code: "", message: "" });

  const handleSendOtp = async () => {
    if (!email) {
      // Surface why nothing happens instead of silently returning.
      setResponse({
        code: "error",
        message: "No email address is on file for this account. Please contact an admin.",
      });
      return;
    }

    setOtpLoading(true);
    setResendDisabled(true);

    try {
      const result = await dispatch(sendOTP({ email, organization, action }));

      const code = result?.responseCode || "error";
      const message = result?.responseMessage || "Failed to send OTP. Please try again.";

      // Only reveal the OTP input when the code was actually sent.
      if (code === "100") {
        setOtpSent(true);
      }

      setResponse({ code, message });
    } catch (err) {
      setResponse({ code: "error", message: "Failed to send OTP. Please try again." });
    } finally {
      setOtpLoading(false);
      setTimeout(() => setResendDisabled(false), 60000); // enable resend after 60s
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || !email) return;
    setOtpLoading(true);

    try {
      // `action` matters here as much as it does on send: the backend uses it to pick which
      // outstanding code to check, and a member can legitimately have a signup code and a
      // password-change code at once. It was previously omitted, which now resolves no purpose
      // at all and fails the validation outright.
      const result = await dispatch(validateOTP({ email, organization, otp, action }));

      const code = result?.responseCode || "error";
      const message = result?.responseMessage || "OTP validation failed.";

      const isValid = code === "100";
      setOtpValid(isValid);
      setResponse({ code, message });
    } catch (err) {
      setOtpValid(false);
      setResponse({ code: "error", message: "OTP validation failed." });
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (onOtpValidated) {
      onOtpValidated(otpValid ? otp : "");
    }
  }, [otpValid, onOtpValidated]);

  return (
    <>
      {!otpSent ? (
        <>
          <Button
            size="small"
            fullWidth
            variant="contained"
            onClick={handleSendOtp}
            disabled={!email || otpLoading}
            sx={{
              bgcolor: green[600],
              "&:hover": { bgcolor: green[700] },
              height: "40px",
              borderRadius: "999px",
              px: 3,
            }}
          >
            {otpLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Send OTP"
            )}
          </Button>

          {response.message && (
            <p
              style={{
                marginTop: "0.5rem",
                color: response.code === "100" ? "green" : "red",
                fontSize: "0.875rem",
              }}
            >
              {response.message}
            </p>
          )}
        </>
      ) : (
        <>
          <TextField
            fullWidth
            size="small"
            variant={AUTH_FIELD_VARIANT}
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6, inputMode: "numeric" }}
            sx={{ mt: 2, ...filledFieldSx }}
            InputProps={filledInputProps}
          />

          {response.message && (
            <p
              style={{
                marginTop: "0.5rem",
                color: response.code === "100" ? "green" : "red",
                fontSize: "0.875rem",
              }}
            >
              {response.message}
            </p>
          )}

          <div className="flex justify-between flex-row items-center gap-2 mt-2">
            <Button
              variant="text"
              onClick={handleValidateOtp}
              disabled={!otp || otp.length < 6 || otpLoading || otpValid}
              sx={{
                borderRadius: "999px",
                px: 3,
                textTransform: "none",
                fontWeight: 700,
                color: green[700],
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(47,191,107,0.14)" : "rgba(31,166,90,0.10)",
                "&:hover": { bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(47,191,107,0.22)" : "rgba(31,166,90,0.18)" },
              }}
            >
              {otpLoading ? <CircularProgress size={20} /> : "Validate OTP"}
            </Button>
            <Button
              disabled={otpLoading || resendDisabled || otpValid}
              onClick={handleSendOtp}
              sx={{
                textTransform: "none",
                borderRadius: "999px",
                px: 3,
                color: yellow[700],
                "&:hover": {
                  textDecoration: "underline",
                  backgroundColor: "transparent",
                },
              }}
            >
              Resend OTP
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default OtpInputSection;
