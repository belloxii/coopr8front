import {
  Modal, Box, Typography, IconButton, TextField, MenuItem,
  FormControl, InputLabel, Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { paystackPay } from '../../../Store/PaystackPay/Action';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', maxWidth: 500,
  bgcolor: 'background.paper', borderRadius: 10,
  boxShadow: 24, p: 4, maxHeight: '90vh', overflowY: 'auto',
};

const RepaymentModal = ({ open, onClose, loanList = [], loan: singleLoan }) => {
  const dispatch = useDispatch();
  const email = useSelector((state) => state.auth.user?.user?.email);

  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isSingleLoan = !!singleLoan;
  const currentLoan = isSingleLoan
    ? singleLoan
    : loanList.find((l) => l.id === selectedLoanId);

  // Format to 2 decimal places
  const toMoney = (val) =>
    Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });


  const repayAmount = useMemo(() => {
    if (!currentLoan) return 0.00;
    const duration = parseInt(currentLoan.duration, 10) || 1;
    const loanAmount = parseFloat(currentLoan.amount) || 0;
    return (loanAmount / duration).toFixed(2);
  }, [currentLoan]);

  useEffect(() => {
    if (open) {
      setSelectedLoanId(isSingleLoan ? singleLoan.id : '');
      setInstallments(1);
      setAmount('');
      setErrorMsg('');
    }
  }, [open, singleLoan, isSingleLoan]);

  useEffect(() => {
    if (repayAmount && installments > 0) {
      const total = (parseFloat(repayAmount) * installments).toFixed(2);
      setAmount(total);
    }
  }, [installments, repayAmount]);

  const handlePay = () => {
    if (!currentLoan || !email || !amount) return;

    const balance = parseFloat(currentLoan.balance).toFixed(2);
    const repay = parseFloat(repayAmount).toFixed(2);
    const enteredAmount = parseFloat(amount).toFixed(2);

    if (parseFloat(enteredAmount) > parseFloat(balance)) {
      setErrorMsg("Amount exceeds loan balance.");
      return;
    }

    const remainder = (parseFloat(enteredAmount) % parseFloat(repay)).toFixed(2);
    if (parseFloat(remainder) !== 0) {
      setErrorMsg(`Amount must be a multiple of ₦${parseFloat(repay).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const callback_url = `${window.location.origin}/verify/repay/${selectedLoanId}`;

    const payload = {
      email,
      amount: parseInt(parseFloat(enteredAmount) * 100, 10),
      callback_url,
      metadata: {
        type: 'repayment',
        loanId: selectedLoanId,
      },
    };

    dispatch(paystackPay(payload))
      .finally(() => setLoading(false));
  };

const generateInstallmentOptions = () => {
  if (!currentLoan) return [];

  const duration = parseInt(currentLoan.duration, 10) || 0;
  const loanAmount = parseFloat(currentLoan.amount) || 0;
  const loanBalance = parseFloat(currentLoan.balance) || 0;
  const repay = parseFloat(repayAmount) || 0;

  const installmentsPaid = Math.floor((loanAmount - loanBalance) / repay);
  const remainingInstallments = duration - installmentsPaid;

  return Array.from({ length: remainingInstallments }, (_, i) => {
    const count = i + 1;
    const amount = (repay * count).toFixed(2);
    return { count, amount };
  });
};


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <div className="flex justify-between items-center mb-5">
          <Typography variant="h6" fontWeight="bold">Make a Repayment</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </div>

        <div className="space-y-4">
          {!isSingleLoan && (
            <FormControl fullWidth>
              <InputLabel id="loan-select-label">Select Loan</InputLabel>
              <Select
                labelId="loan-select-label"
                value={selectedLoanId}
                onChange={(e) => {
                  setSelectedLoanId(e.target.value);
                  setInstallments(1);
                }}
                label="Select Loan"
                sx={{ borderRadius: '25px' }}
              >
                <MenuItem value="">Select a loan</MenuItem>
                {loanList.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.type} – ₦{toMoney(l.amount)} | Balance: ₦{toMoney(l.balance)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {currentLoan && (
            <FormControl fullWidth>
              <InputLabel id="installments-label">Installments</InputLabel>
              <Select
                labelId="installments-label"
                value={installments}
                onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                sx={{ borderRadius: '25px' }}
              >
                {generateInstallmentOptions().map((opt) => (
                  <MenuItem key={opt.count} value={opt.count}>
                    {opt.count} Installment{opt.count > 1 ? 's' : ''} – ₦{Number(opt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Total Amount"
            fullWidth
            value={`₦${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            disabled
            InputProps={{
              sx: {
                borderRadius: '999px',
                '& .MuiInputBase-input': { borderRadius: '999px' },
              },
            }}
          />

          {errorMsg && (
            <Typography variant="body2" color="error">{errorMsg}</Typography>
          )}

          <button
            disabled={!currentLoan || !amount || !!errorMsg || loading}
            onClick={handlePay}
            className={`w-full bg-green-700 text-white font-bold p-4 rounded-full ${
              loading || errorMsg ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-800'
            }`}
          >
            {loading ? 'Initializing...' : 'Repay Now'}
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default RepaymentModal;
