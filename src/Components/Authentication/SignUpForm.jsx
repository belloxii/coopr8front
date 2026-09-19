import { useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { green } from "@mui/material/colors";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { regUser } from "../../Store/Auth/Action";
import OtpInputSection from "../../Utils/OtpInputSection";
import { AUTH_FIELD_VARIANT, filledInputProps, filledFieldSx, authCardSx, authPanelSx } from "../../theme/authStyles";

const steps = ["Your details", "Verify contact", "Passport & plan"];
// Filled, borderless fields set apart from the card by shade (see authStyles).
const fieldSx = filledFieldSx;
const fieldProps = { variant: AUTH_FIELD_VARIANT, InputProps: filledInputProps };

const SignUpForm = ({ organizationSlug }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", gender: "", isTescomStaff: "",
    psn: "", occupation: "", email: "", phone: "", address: "",
    savingPlan: "", passport: "",
  });
  const [passportFile, setPassportFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, code: "", message: "" });

  const previewUrl = useMemo(
    () => (passportFile ? URL.createObjectURL(passportFile) : ""),
    [passportFile]
  );

  // Sign-in links keep the cooperative in the path, so a new member who arrived at
  // /o/{slug}/signup lands back on their own cooperative's login page.
  const loginPath = organizationSlug ? `/o/${organizationSlug}/login` : "/login";

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }));
    if (name === "email") setVerifiedOtp("");
  };

  const stepIsValid = () => {
    if (activeStep === 0) {
      const { firstName, lastName, gender, isTescomStaff, psn, occupation } = formData;
      const basicValid = firstName && lastName && gender && isTescomStaff;
      if (!basicValid) return false;
      // TESCOM staff must provide PSN; non-staff must provide occupation
      if (isTescomStaff === "yes") return Boolean(psn);
      return Boolean(occupation);
    }
    if (activeStep === 1) return Boolean(formData.email && formData.phone && formData.address && verifiedOtp);
    return Boolean(formData.savingPlan && Number(formData.savingPlan) > 0 && passportFile);
  };

  const selectPassport = (event) => {
    const file = event.target.files?.[0];
    setUploadError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setUploadError("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return setUploadError("Passport image must be 5 MB or less.");
    setPassportFile(file);
  };

  const uploadPassport = async () => {
    const uploadData = new FormData();
    uploadData.append("image", passportFile);
    uploadData.append("organization", organizationSlug || "");
    uploadData.append("email", formData.email);
    uploadData.append("otp", verifiedOtp);
    const response = await axios.post(`${API_BASE_URL}/api/images/upload`, uploadData);
    if (!response.data?.url) throw new Error("Passport upload did not return an image URL.");
    return response.data.url;
  };

  const handleSubmit = async () => {
    if (!stepIsValid()) return;
    setLoading(true);
    try {
      const passport = await uploadPassport();
      const payload = {
        // Which cooperative this application is for. Supplied by /o/{slug}/signup; a signup with
        // no cooperative is refused by the backend rather than defaulted, because there is no
        // sensible default -- a new member has no membership number yet to derive one from.
        organization: organizationSlug,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        passport,
        savingPlan: Number(formData.savingPlan),
        otp: verifiedOtp,
      };
      // Add PSN or occupation based on TESCOM staff status
      if (formData.isTescomStaff === "yes") {
        payload.psn = formData.psn;
        payload.paymentType = "GOVERNMENT";
      } else {
        payload.occupation = formData.occupation;
        payload.paymentType = "SELF_PAY";
      }
      const result = await dispatch(regUser(payload));
      setPopup({
        open: true,
        code: result?.responseCode || "error",
        message: result?.responseMessage || "We could not create your account. Please try again.",
      });
    } catch (error) {
      setPopup({ open: true, code: "error", message: error.response?.data?.message || error.message || "Passport upload failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const stepContent = () => {
    if (activeStep === 0) return <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextField label="First name" name="firstName" required value={formData.firstName} onChange={handleChange} sx={fieldSx} {...fieldProps} />
      <TextField label="Last name" name="lastName" required value={formData.lastName} onChange={handleChange} sx={fieldSx} {...fieldProps} />
      <TextField label="Middle name (optional)" name="middleName" value={formData.middleName} onChange={handleChange} sx={fieldSx} {...fieldProps} />
      <FormControl required sx={fieldSx} variant={AUTH_FIELD_VARIANT}><InputLabel>Gender</InputLabel><Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} disableUnderline><MenuItem value="male">Male</MenuItem><MenuItem value="female">Female</MenuItem></Select></FormControl>
      <FormControl required sx={fieldSx} variant={AUTH_FIELD_VARIANT} className="sm:col-span-2"><InputLabel>Are you a TESCOM staff?</InputLabel><Select label="Are you a TESCOM staff?" name="isTescomStaff" value={formData.isTescomStaff} onChange={handleChange} disableUnderline><MenuItem value="yes">Yes</MenuItem><MenuItem value="no">No</MenuItem></Select></FormControl>
      {formData.isTescomStaff === "yes" && <TextField label="PSN" name="psn" required value={formData.psn} onChange={handleChange} inputProps={{ maxLength: 20 }} sx={fieldSx} {...fieldProps} className="sm:col-span-2" />}
      {formData.isTescomStaff === "no" && <TextField label="Occupation" name="occupation" required value={formData.occupation} onChange={handleChange} sx={fieldSx} {...fieldProps} className="sm:col-span-2" />}
    </Box>;

    if (activeStep === 1) return <Box className="space-y-4">
      <TextField fullWidth required type="email" label="Email address" name="email" value={formData.email} onChange={handleChange} sx={fieldSx} {...fieldProps} />
      <TextField fullWidth required type="tel" label="Phone number" name="phone" value={formData.phone} onChange={handleChange} sx={fieldSx} {...fieldProps} />
      <TextField fullWidth required multiline minRows={2} label="Residential address" name="address" value={formData.address} onChange={handleChange} sx={fieldSx} {...fieldProps} />
      <Paper elevation={0} sx={{ p: 2, ...authPanelSx }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Verify your email</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>We use a one-time code to confirm your email before creating your account.</Typography><OtpInputSection key={formData.email} email={formData.email} organization={organizationSlug} action="signup" onOtpValidated={setVerifiedOtp} /></Paper>
    </Box>;

    return <Box className="space-y-5">
      <TextField fullWidth required label="Monthly savings plan (₦)" name="savingPlan" type="number" value={formData.savingPlan} onChange={handleChange} inputProps={{ min: 1 }} sx={fieldSx} {...fieldProps} />
      <Paper elevation={0} sx={{ p: 2.5, ...authPanelSx, textAlign: "center" }}>
        {previewUrl ? <Box><img src={previewUrl} alt="Passport preview" className="mx-auto mb-3 h-28 w-28 rounded-full object-cover ring-4 ring-green-100" /><Typography variant="body2" sx={{ mb: 1 }}>{passportFile.name}</Typography></Box> : <CloudUploadOutlinedIcon sx={{ fontSize: 42, color: green[700], mb: 1 }} />}
        <Typography fontWeight={700}>Upload passport photograph</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>JPG or PNG — maximum 5 MB.</Typography>
        <Button component="label" variant="text" startIcon={<CloudUploadOutlinedIcon />} sx={{ borderRadius: 2, textTransform: "none", color: green[700], bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(47,191,107,0.14)" : "rgba(31,166,90,0.10)", "&:hover": { bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(47,191,107,0.22)" : "rgba(31,166,90,0.18)" } }}>Choose image<input hidden type="file" accept="image/png,image/jpeg" onChange={selectPassport} /></Button>
        {uploadError && <Alert severity="error" sx={{ mt: 2, textAlign: "left" }}>{uploadError}</Alert>}
      </Paper>
      <Alert icon={<CheckCircleRoundedIcon />} severity="success" sx={{ borderRadius: 3 }}>Your passport is uploaded securely when you create the account.</Alert>
    </Box>;
  };

  return <Paper elevation={0} sx={{ maxWidth: 760, mx: "auto", p: { xs: 2.5, sm: 4 }, ...authCardSx }}>
    <Typography variant="overline" sx={{ color: green[700], fontWeight: 800, letterSpacing: 1.4 }}>New membership</Typography>
    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Create your account</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Complete the three short steps to begin your cooperative membership.</Typography>
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>{steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
    {stepContent()}
    <Box className="flex justify-between gap-3 mt-7">
      <Button disabled={activeStep === 0 || loading} onClick={() => setActiveStep((step) => step - 1)} startIcon={<ArrowBackRoundedIcon />} sx={{ textTransform: "none", borderRadius: 2 }}>Back</Button>
      {activeStep < steps.length - 1 ? <Button variant="contained" disabled={!stepIsValid()} onClick={() => setActiveStep((step) => step + 1)} endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: green[600], "&:hover": { bgcolor: green[700] }, textTransform: "none", borderRadius: 2 }}>Continue</Button> : <Button variant="contained" disabled={!stepIsValid() || loading} onClick={handleSubmit} sx={{ bgcolor: green[600], "&:hover": { bgcolor: green[700] }, textTransform: "none", borderRadius: 2 }}>{loading ? <CircularProgress size={22} color="inherit" /> : "Create account"}</Button>}
    </Box>
    <Typography align="center" variant="body2" color="text.secondary" sx={{ mt: 3 }}>Already registered? <Button size="small" onClick={() => navigate(loginPath)} sx={{ color: green[700], textTransform: "none", fontWeight: 700 }}>Sign in</Button></Typography>
    <Dialog open={popup.open} onClose={() => setPopup((current) => ({ ...current, open: false }))}><DialogTitle>{popup.code === "100" ? "Account created" : "Unable to continue"}</DialogTitle><DialogContent><Typography>{popup.message}</Typography></DialogContent><DialogActions><Button onClick={() => { setPopup((current) => ({ ...current, open: false })); if (popup.code === "100") navigate(loginPath); }} sx={{ color: green[700], textTransform: "none" }}>Close</Button></DialogActions></Dialog>
  </Paper>;
};

export default SignUpForm;
