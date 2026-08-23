import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../../Store/User/Action';
import { paystackPay } from '../../../Store/PaystackPay/Action';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90vw', sm: 500, md: 600 },
  bgcolor: 'background.paper',
  border: 'none',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: 10,
  outline: 'none',
};

const SaveModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { auth, user } = useSelector(store => store);

  const userId = auth?.user?.user?.id;
  const email = auth?.user?.user?.email;

  const monthlyPlan = user?.findUser?.plan || 1000;
  const [newPlan, setNewPlan] = useState(monthlyPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const amountInKobo = newPlan * 100;

  useEffect(() => {
    if (user?.findUser?.plan) {
      setNewPlan(user.findUser.plan);
    }
  }, [user?.findUser?.plan]);

  const handleUpdate = async () => {
    if (!newPlan || newPlan <= 0) return;

    await dispatch(updateUser({ plan: newPlan, id: userId }));

    setIsEditing(false);
  };


  const handlePaystackPayment = async () => {
    if (!email || !amountInKobo) return;

    setIsLoading(true);
    const callback_url = `${window.location.origin}/verify/save`;

    try {
      await dispatch(paystackPay({
        email,
        amount: amountInKobo,
        callback_url,
        metadata: {
          type: 'savings',
        },
      }));
    } catch (error) {
      console.error("Payment init failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Save Now</h2>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex justify-center py-3">
          <div className="w-full space-y-7">
            <div className="p-3 rounded-xl flex items-center justify-between shadow-lg bg-black">
              <p className="text-md text-white pr-5">
                Your MONTHLY PLAN is the amount you save monthly. Click "Change Plan" to update it.
                <br /><br />
                Click "Save Now" to add money to your savings.
              </p>
              <AccountBalanceWalletIcon sx={{ width: '5rem', height: '5rem' }} className="text-blue-500" />
            </div>

            <div className="flex justify-between items-center border border-gray-700 rounded-full pl-5 pr-3 py-2">
              <div>
                <p className="text-md font-semibold">Monthly Plan:</p>
                <p className="text-green-500 text-md font-bold">₦{monthlyPlan.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-white text-md font-semibold border px-5 py-2 bg-blue-600 rounded-full"
              >
                Change Plan
              </button>
            </div>

            {isEditing && (
              <div className="flex items-center w-full rounded-full bg-input overflow-hidden">
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-transparent outline-none text-foreground"
                  value={newPlan}
                  onChange={(e) => setNewPlan(Number(e.target.value))}
                />
                <button
                  onClick={handleUpdate}
                  className="text-white text-md font-semibold px-7 py-3 bg-blue-600 rounded-full"
                >
                  Update
                </button>
              </div>
            )}

            {!isEditing && (
              <button
                onClick={handlePaystackPayment}
                className="cursor-pointer flex justify-center items-center bg-green-600 text-white rounded-full px-5 py-3 font-semibold w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Initializing...' : 'Save Now'}
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default SaveModal;
