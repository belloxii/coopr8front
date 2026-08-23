import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdjustIcon from '@mui/icons-material/Adjust';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {
  acceptGuarantorRequest,
  declineGuarantorRequest,
  getMyRequests,
} from '../../../Store/Guarantor/Action';

const GuarantorRequests = () => {
  const dispatch = useDispatch();
  const { auth, guarantor } = useSelector((store) => store);

  const [confirmAction, setConfirmAction] = useState(null); // { type: 'accept' | 'decline', loanId: number }
  const [loading, setLoading] = useState(false);

  const requests = guarantor.requests;
  const currentUserId = auth.user?.user?.id;

  useEffect(() => {
    dispatch(getMyRequests());
  }, [dispatch]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setLoading(true);
    const { type, loanId } = confirmAction;
    if (type === 'accept') {
      await dispatch(acceptGuarantorRequest(loanId));
    } else {
      await dispatch(declineGuarantorRequest(loanId));
    }
    setLoading(false);
    setConfirmAction(null);
  };

  const getGuarantorStatus = (loan) => {
    if (loan.guarantor1?.id === currentUserId) return loan.guarantor1Status;
    if (loan.guarantor2?.id === currentUserId) return loan.guarantor2Status;
    return null;
  };

  const isPending = (loan) => getGuarantorStatus(loan) === 'PENDING';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <AdjustIcon className="text-green-600 w-4 h-4 mr-2" />;
      case 'DECLINED':
        return <HighlightOffIcon className="text-red-600 w-4 h-4 mr-2" />;
      default:
        return <PendingActionsIcon className="text-yellow-600 w-4 h-4 mr-2" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-foreground">Guarantor Requests</h2>

      {requests?.length === 0 ? (
        <div className="p-5 shadow-lg border rounded-xl bg-card mb-4">
          <p className="text-muted-foreground">No guarantor requests found.</p>
        </div>
      ) : (
        requests.map((loan) => (
          <div
            key={loan.id}
            className="flex justify-around pl-5 p-2 shadow-lg hover:shadow-2xl border rounded-xl bg-card mb-4 md:px-10"
          >
            {/* Loan Info Section */}
            <div className="block md:flex gap-4 w-1/2">
              <div className="bg-blue-100 p-3 w-[3rem] h-[3rem] rounded-full">
                <AccountBalanceWalletIcon className="text-blue-500 w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-lg capitalize">{loan.type} Loan</p>
                <p className="text-sm text-muted-foreground">
                  Amount: ₦{loan.amount?.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {loan.duration} months
                </p>
              </div>
            </div>

            {/* Guarantor Actions */}
            <div className="block md:flex w-1/2 md:w-full justify-between">
              <div className="mb-2 text-sm w-full md:w-auto">
                <div className="flex items-center mb-1">
                  {getStatusIcon(getGuarantorStatus(loan))}
                  <span className="font-medium capitalize">
                    {getGuarantorStatus(loan) || 'Pending'} as Guarantor
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requested by: {loan.user?.firstName} {loan.user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Requested on: {new Date(loan.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                {isPending(loan) ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAction({ type: 'accept', loanId: loan.id })}
                      className="px-4 py-1 rounded-full text-white bg-blue-500 hover:bg-blue-600 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: 'decline', loanId: loan.id })}
                      className="px-4 py-1 rounded-full text-red-500 font-semibold border-red-400 border-2 hover:bg-red-500 text-sm"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No action available</p>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-card p-6 rounded-3xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Do you want to {confirmAction.type === 'accept' ? 'Accept' : 'Decline'} this guarantor request?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAction}
                disabled={loading}
                className={`px-7 py-2 rounded-full text-white ${
                  loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Loading...' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                disabled={loading}
                className="px-7 py-2 bg-muted text-foreground rounded-full hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuarantorRequests;
