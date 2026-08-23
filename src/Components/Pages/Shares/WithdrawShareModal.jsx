import { useState } from "react";
import { Modal, Box, Typography, TextField } from "@mui/material";
import { useDispatch } from "react-redux";
import { withdrawShare, myShares } from "../../../Store/Shares/Action";
import CommaNumberInput from "../../../Utils/CommaNumberInput";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 6,
};

const WithdrawShareModal = ({ open, onClose, totalShares }) => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [accountDetails, setAccountDetails] = useState("| Bank Name: \n| Account Number: \n| Account Name: ");
  const [validationMessage, setValidationMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      return "Please enter a valid withdrawal amount.";
    }
    if (numericAmount > totalShares) {
      return "Withdrawal amount exceeds your available share balance.";
    }
    if (accountDetails.trim().length < 63) {
      return "Please provide full account details.";
    }
    return "";
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) {
      setValidationMessage(error);
      return;
    }

    setSubmitting(true);
    const numericAmount = parseFloat(amount.replace(/,/g, ""));

    dispatch(withdrawShare({ amount: numericAmount, accountDetails }))
      .then(() => dispatch(myShares()))
      .finally(() => {
        setValidationMessage("");
        setSubmitting(false);
        onClose();
      });
  };

  return (
    <Modal open={open} onClose={() => !submitting && onClose()}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Withdraw Share
        </Typography>

        <CommaNumberInput
          label="Amount"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2 }}/>

        <TextField
          fullWidth
          label="Account Details"
          multiline
          minRows={4}
          value={accountDetails}
          onChange={(e) => setAccountDetails(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": { borderRadius: "16px" },
          }}/>

        {validationMessage && (
          <p className="text-red-500 text-sm mb-2">{validationMessage}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full font-bold p-4 rounded-full transition duration-200 ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-400 text-white"
          }`}
        >
          {submitting ? "Processing..." : "Withdraw"}
        </button>
      </Box>
    </Modal>
  );
};

export default WithdrawShareModal;
