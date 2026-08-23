import { TextField, InputAdornment } from "@mui/material";

const CommaNumberInput = ({ label, name, value, onChange, ...props }) => {
  // Format value with commas
  const formattedValue = value ? parseInt(value).toLocaleString() : "";

  // Strip commas and allow only numbers
  const handleLocalChange = (e) => {
    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, ""); // remove non-digits
    onChange({ target: { name, value: raw } });
  };

  return (
    <TextField
      type="text"
      name={name}
      label={label}
      value={formattedValue}
      onChange={handleLocalChange}
      fullWidth
      required
      InputProps={{
        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
      }}
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "999px",
        },
        ...props.sx,
      }}
    />
  );
};

export default CommaNumberInput;
