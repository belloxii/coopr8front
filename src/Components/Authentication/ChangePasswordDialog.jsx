import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { changeDefaultPass, getUserProfile } from "../../Store/Auth/Action";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import { green } from "@mui/material/colors";

const ChangePasswordDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetAndClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
      );
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        changeDefaultPass({
          oldPassword,
          newPassword,
        })
      );

      setTimeout(async () => {
        const resCode = localStorage.getItem("cpResCode");
        const resMsg = localStorage.getItem("cpResMsg");

        if (resCode === "100") {
          // Success - refresh profile to clear requiresPasswordChange flag
          const jwt = localStorage.getItem("jwt");
          await dispatch(getUserProfile(jwt));

          setSuccess(resMsg || "Password changed successfully!");
          setLoading(false);

          // Auto-close after showing success message
          setTimeout(() => {
            resetAndClose();
          }, 3000);
        } else {
          setError(resMsg || "Failed to change password.");
          setLoading(false);
        }
      }, 500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "35px" } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <IconButton
          onClick={resetAndClose}
          disabled={loading}
          size="small"
          aria-label="close"
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          Change Your Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your account is using the default password (123456). We strongly recommend changing it to secure your account.
        </Typography>
      </DialogTitle>

      <form onSubmit={(e) => { e.preventDefault(); if (!success && !loading) handleSubmit(e); }}>
        <DialogContent sx={{ pb: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Current Password"
            type={showOldPassword ? "text" : "password"}
            required
            size="small"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={!!success}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            required
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={!!success}
            sx={{ mb: 2 }}
            helperText="At least 8 characters with uppercase, lowercase, number, and special character"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            required
            size="small"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!!success}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          {!success && (
            <Button
              onClick={resetAndClose}
              disabled={loading}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                py: 1.5,
                minWidth: 110,
                borderRadius: "999px",
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !!success || !oldPassword || !newPassword || !confirmPassword}
            sx={{
              bgcolor: green[600],
              "&:hover": { bgcolor: green[700] },
              py: 1.5,
              borderRadius: "999px",
              textTransform: "none",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Change Password"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangePasswordDialog;
