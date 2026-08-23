import { useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Box, Typography } from "@mui/material";
import { paystackPay } from "../../../Store/PaystackPay/Action";
import CommaNumberInput from "../../../Utils/CommaNumberInput";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 10,
};

const AddShareModal = ({ open, onClose, email }) => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayment = () => {
    const value = parseFloat(amount);

    if (!email || !value || value <= 0) {
      setErrorMessage("Please provide a valid amount and user email.");
      return;
    }

    if (value < 2000) {
      setErrorMessage("Minimum share amount is ₦2000.");
      return;
    }

    const callbackUrl = `${window.location.origin}/verify/addshare`;

    setLoading(true);
    dispatch(
      paystackPay({
        email,
        amount: value * 100,
        callback_url: callbackUrl,
        metadata: {
          type: "shares",
        },
      })
    ).finally(() => setLoading(false));
  };

  const isDisabled = loading || !amount || parseFloat(amount) < 2000;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Add Share
        </Typography>

        <CommaNumberInput
          label="Amount (Min: ₦2000)"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2 }}
        />

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        <button
          onClick={handlePayment}
          disabled={isDisabled}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold p-4 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Add Shares"}
        </button>
      </Box>
    </Modal>
  );
};

export default AddShareModal;
