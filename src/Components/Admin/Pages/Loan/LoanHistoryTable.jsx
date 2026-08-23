import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { approveLoan, rejectLoan } from '../../../../Store/Loan/Action';
import ConfirmationModal from './ConfirmationModal';

const LoanHistoryTable = ({ loans = [], activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const activeType = searchParams.get("type")?.toLowerCase();

  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject'
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const filteredLoans = useMemo(() => {
    if (!activeType) return loans;
    return loans.filter((loan) => loan.type?.toLowerCase() === activeType);
  }, [loans, activeType]);

  const openModal = (type, loanId) => {
    setModalType(type);
    setSelectedLoanId(loanId);
    setModalVisible(true);
    if (type === 'reject') setRejectionReason('');
  };

  const handleConfirm = async () => {
    if (!selectedLoanId) return;
    setLoading(true);

    if (modalType === 'approve') {
      await dispatch(approveLoan(selectedLoanId));
    } else if (modalType === 'reject') {
      if (!rejectionReason.trim()) {
        alert("Please provide a reason for rejection");
        setLoading(false);
        return;
      }
      await dispatch(rejectLoan(selectedLoanId, { remark: rejectionReason }));
    }

    setLoading(false);
    setModalVisible(false);
  };

  const getStatusColor = (status) => {
    const lower = status?.toLowerCase();
    if (lower.includes("submitted")) return "text-yellow-600 bg-yellow-100 font-bold";
    if (lower.includes("approved")) return "text-blue-600 bg-blue-100 font-bold";
    if (lower.includes("completed")) return "text-green-600 bg-green-100 font-bold";
    if (lower.includes("declined")) return "text-red-600 bg-red-100 font-bold";
    return "text-muted-foreground";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">Loan History</h2>
      <div className="w-full bg-card border shadow rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-muted text-foreground">
              <th className="py-4 px-2 font-bold">SN</th>
              <th className="py-4 px-2 font-bold">Name</th>
              <th className="py-4 px-2 font-bold">Amount</th>
              <th className="py-4 px-2 font-bold">Type</th>
              <th className="py-4 px-2 font-bold">Date</th>
              {activeTab !== 'requests' && (
                <>
                  <th className="py-4 px-2 font-bold">Balance</th>
                  <th className="py-4 px-2 font-bold">Status</th>
                </>
              )}
              {activeTab === 'requests' && (
                <>
                  <th className="py-4 px-2 font-bold">Guarantor1</th>
                  <th className="py-4 px-2 font-bold">Guarantor2</th>
                </>
              )}
              <th className="py-4 px-2 font-bold">Account Details</th>
              <th className="py-4 px-2 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center text-muted-foreground py-4">No loans found.</td>
              </tr>
            ) : (
              filteredLoans.map((item, index) => (
                <tr key={item.id} className="border-b last:border-none text-foreground">
                  <td className="py-4 px-2">{index + 1}</td>
                  <td className="py-4 px-2">
                    {item?.user ? (
                      <Link to={`/admin/users/profile/${item.user.id}`}
                        className="text-blue-600 underline hover:text-foreground font-semibold">
                        {item.user.firstName} {item.user.lastName}
                      </Link>
                    ) : ("N/A")}
                  </td>
                  <td className="py-4 px-2">₦{Number(item.amount).toLocaleString()}</td>
                  <td className="py-4 px-2 capitalize">{item.type || 'N/A'}</td>
                  <td className="py-4 px-2">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                  {activeTab !== 'requests' && (
                    <>
                      <td className="py-4 px-2">₦{Number(item.balance || 0).toLocaleString()}</td>
                      <td className={`py-4 px-2 ${getStatusColor(item.status)}`}>{item.status}</td>
                    </>
                  )}
                  {activeTab === 'requests' && (
                    <>
                      <td className="py-4 px-2">{item.guarantor1Status ?? "N/A"}</td>
                      <td className="py-4 px-2">{item.guarantor2Status ?? "N/A"}</td>
                    </>
                  )}
                  <td className="py-4 px-2">{item.accountDetails}</td>
                  <td className="py-4 px-2 space-y-1">
                    <button
                      onClick={() => navigate(`/admin/loans/${item.id}`)}
                      className="bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600"
                    >
                      View
                    </button>
                    {activeTab === 'requests' && (
                      <>
                        <button
                          onClick={() => openModal('approve', item.id)}
                          className="bg-green-500 text-white px-4 py-1 mx-1 rounded-full hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openModal('reject', item.id)}
                          className="bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Shared Modal */}
      <ConfirmationModal
        visible={modalVisible}
        actionType={modalType}
        reason={rejectionReason}
        loading={loading}
        onChangeReason={(e) => setRejectionReason(e.target.value)}
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default LoanHistoryTable;
