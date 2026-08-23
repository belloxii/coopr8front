import {
  Button,
  IconButton,
  Modal,
  Paper,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { changePass } from "../../Store/Auth/Action";
import OtpInputSection from "../../Utils/OtpInputSection";

const ChangePasswordModal = ({ open, onClose, email }) => {
  const dispatch = useDispatch();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpValid, setOtpValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cpResMsg, setCpResMsg] = useState(localStorage.getItem("cpResMsg"));
  const [cpResCode, setCpResCode] = useState(localStorage.getItem("cpResCode"));
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const resetPasswordModal = () => {
    onClose();
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCpResMsg(null);
    setCpResCode(null);
    localStorage.removeItem("cpResMsg");
    localStorage.removeItem("cpResCode");
  };

  const handleSubmitPasswordChange = async () => {
    setLoading(true);
    await dispatch(changePass({
      oldPassword,
      newPassword,
      confirmPassword,
      otp: localStorage.getItem('otp'),
    }));
    setLoading(false);

    const code = localStorage.getItem("cpResCode");
    const msg = localStorage.getItem("cpResMsg");
    setCpResMsg(msg);
    setCpResCode(code);

    if (code === "100") {
      setTimeout(() => {
        resetPasswordModal();
      }, 5000);
    }
  };

  return (
    <Modal open={open} onClose={resetPasswordModal}>
      <Paper elevation={24} className="p-6 absolute top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 space-y-4" sx={{ borderRadius: '35px' }}>
        <div className='flex justify-between'>
          <h2 className="text-xl font-bold mb-2 text-foreground">Change Password</h2>
          <IconButton onClick={resetPasswordModal} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmitPasswordChange(); }} className="space-y-6">

          <TextField
            label="Old Password"
            type={showOldPass ? 'text' : 'password'}
            required
            size="small"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowOldPass(!showOldPass)} edge="end">
                  {showOldPass ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <TextField
            label="New Password"
            type={showNewPass ? 'text' : 'password'}
            required
            size="small"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end">
                  {showNewPass ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <TextField
            label="Confirm New Password"
            type={showConfirmPass ? 'text' : 'password'}
            required
            size="small"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end">
                  {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <OtpInputSection
            email={email}
            action="changePass"
            onOtpValidated={setOtpValid}
          />

          <div className="flex justify-between gap-3 mt-4">
            <Button
              type="button"
              onClick={resetPasswordModal}
              color="inherit"
              sx={{ borderRadius: '999px', px: 5 }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading || !otpValid}
              sx={{ borderRadius: '999px', px: 5 }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>

          {cpResMsg && (
            <p className="text-sm mt-2 text-center" style={{ color: cpResCode === "100" ? "green" : "red" }}>
              {cpResMsg}
            </p>
          )}
        </form>
      </Paper>
    </Modal>
  );
};

export default ChangePasswordModal;
