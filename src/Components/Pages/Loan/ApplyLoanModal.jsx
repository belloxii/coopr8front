import { useState, useMemo } from "react";
import {
  Modal,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { applyLoan } from "../../../Store/Loan/Action";
import { getUserByPhone } from "../../../Store/User/Action";
import CommaNumberInput from "../../../Utils/CommaNumberInput";

const ApplyLoanModal = ({ open, onClose, refreshLoans }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    duration: "",
    purpose: "",
    guarantor1: "",
    guarantor2: "",
    accountDetails: "| Bank Name: \n| Account Number: \n| Account Name: ",
  });

  const [guarantors, setGuarantors] = useState({ name1: "", name2: "" });
  const [guarantorValid, setGuarantorValid] = useState({ g1: false, g2: false });

const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === "type") {
    setFormData((prev) => ({
      ...prev,
      type: value,
      duration: value === "soft" ? "2" : prev.duration,
    }));
    return;
  }

  if (name === "guarantor1" || name === "guarantor2") {
    const phone = value.replace(/\D/g, "").slice(0, 11);
    setFormData((prev) => ({ ...prev, [name]: phone }));

    if (phone.length === 11) {
      dispatch(getUserByPhone(phone)).then((res) => {
        const user = res?.payload;
        const fullName = user?.firstName ? `${user.firstName} ${user.lastName}` : "";

        setGuarantors((prev) => ({
          ...prev,
          [name === "guarantor1" ? "name1" : "name2"]: fullName,
        }));

        setGuarantorValid((prev) => ({
          ...prev,
          [name === "guarantor1" ? "g1" : "g2"]: !!user?.firstName,
        }));
      });
    } else {
      setGuarantors((prev) => ({
        ...prev,
        [name === "guarantor1" ? "name1" : "name2"]: "",
      }));
      setGuarantorValid((prev) => ({
        ...prev,
        [name === "guarantor1" ? "g1" : "g2"]: false,
      }));
    }
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.accountDetails.length < 63) return;

    setLoading(true);
    setResponseMessage("");

    try {
      const response = await dispatch(applyLoan(formData));

      const { responseCode, responseMessage } = response || {};

      setResponseMessage(responseMessage || "Unexpected response");

      if (responseCode === "100") {
        refreshLoans();
        setTimeout(() => onClose(), 3000);
      }
    } catch (err) {
      console.error("Loan apply error", err);
      setResponseMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (
      formData.type &&
      formData.amount &&
      formData.duration &&
      formData.guarantor1.length === 11 &&
      formData.guarantor2.length === 11 &&
      guarantorValid.g1 &&
      guarantorValid.g2
    ) {
      setStep(2);
    }
  };

  const repayPerMonth = useMemo(() => {
    const amt = parseFloat(formData.amount) || 0;
    const dur = parseInt(formData.duration, 10) || 1;
    return amt > 0 && dur > 0 ? (amt / dur).toFixed(2) : '';
  }, [formData.amount, formData.duration]);


  return (
<Modal open={open} onClose={onClose}>
  <div className="absolute top-1/2 left-1/2 w-[95%] sm:w-[85%] md:w-[65%] lg:w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-6 shadow-2xl">
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      Apply for a Loan
    </Typography>

    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 ? (
        <>

          <div className="flex flex-row gap-2 items-stretch">
          <TextField
            select
            name="type"
            label="Loan Type"
            value={formData.type}
            onChange={handleInputChange}
            fullWidth
            required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                },
              }}
          >
            <MenuItem value="" disabled>Select Loan Type</MenuItem>
            <MenuItem value="real">Real Loan</MenuItem>
            <MenuItem value="soft">Emergency Loan</MenuItem>
            <MenuItem value="material">Material Loan</MenuItem>
          </TextField>

          <CommaNumberInput
            name="amount"
            label="Loan Amount"
            value={formData.amount}
            onChange={handleInputChange}
          />
          </div>

          <div className="flex flex-row gap-2 items-stretch">
{formData.type === "soft" ? (
  <TextField
    label="Duration (months)"
    value="2"
    fullWidth
    disabled
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "999px",
      },
    }}
  />
) : (
  <TextField
    select
    name="duration"
    label="Duration (months)"
    value={formData.duration}
    onChange={handleInputChange}
    fullWidth
    required
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "999px",
      },
    }}
  >
    <MenuItem value="" disabled>Select Duration</MenuItem>
    {[...Array(11)].map((_, i) => (
      <MenuItem key={i} value={i + 2}>{i + 2} months</MenuItem>
    ))}
  </TextField>
)}

          <TextField
            label="Monthly Repayment"
            value={repayPerMonth ? `₦${Number(repayPerMonth).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''}
            fullWidth
            disabled
            sx={{"& .MuiOutlinedInput-root": {borderRadius: "999px"}}}
          />
          </div>

          {[1, 2].map((g) => (
            <div key={g}>
              <label className="block text-sm font-medium mb-1">
                Guarantor {g} Phone
              </label>
              <div className="flex flex-row gap-2 items-stretch">
                <input
                  type="text"
                  name={`guarantor${g}`}
                  value={formData[`guarantor${g}`]}
                  onChange={handleInputChange}
                  placeholder="080XXXXXXXX"
                  className={`w-[40%] px-4 py-2 rounded-xl border-0 bg-input text-foreground outline-none transition focus:ring-2 ${
                    !guarantorValid[`g${g}`] && formData[`guarantor${g}`]
                      ? "ring-2 ring-red-500"
                      : "focus:ring-green-600/50"
                  }`}/>
                <input
                  type="text"
                  readOnly
                  value={guarantors[`name${g}`]}
                  placeholder="Name"
                  className="flex-1 px-4 py-2 rounded-xl border-0 bg-input text-muted-foreground outline-none"
                />
              </div>
              {!guarantorValid[`g${g}`] && formData[`guarantor${g}`] && (
                <p className="text-red-500 text-sm mt-1">
                  Not a valid cooperator
                </p>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={nextStep}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <TextField
            name="accountDetails"
            label="Bank Account Details"
            multiline
            minRows={4}
            fullWidth
            value={formData.accountDetails}
            onChange={handleInputChange}
            required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                },
              }}
          />
          {formData.accountDetails.length < 63 && (
            <p className="text-sm text-red-500">
              Kindly supply a valid account detail
            </p>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-400 text-white px-6 py-2 rounded-full hover:bg-gray-600"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`text-white px-6 py-2 rounded-full ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Submit Loan"
              )}
            </button>
          </div>

          {responseMessage && (
            <p
              className={`text-sm mt-2 ${
                responseMessage.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {responseMessage}
            </p>
          )}
        </>
      )}
    </form>
  </div>
</Modal>

  );
};

export default ApplyLoanModal;
