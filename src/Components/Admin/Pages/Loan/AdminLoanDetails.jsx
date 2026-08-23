import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { findLoanById, approveLoan, rejectLoan } from "../../../../Store/Loan/Action";
import ConfirmationModal from "./ConfirmationModal";
import BackButton from "../../../Navigation/BackButton";

const AdminLoanDetails = () => {
  const dispatch = useDispatch();
  const { loanId } = useParams();
  const { loan } = useSelector((store) => store);
  const loanDetails = loan?.loan;

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // "approve" | "reject"
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (loanId) dispatch(findLoanById(loanId));
  }, [dispatch, loanId]);

  const getStatusColor = (status) => {
    const map = {
      submitted: "text-yellow-600 bg-yellow-100 font-bold",
      approved: "text-blue-600 bg-blue-100 font-bold",
      completed: "text-green-600 bg-green-100 font-bold",
      declined: "text-red-600 bg-red-100 font-bold",
    };
    return map[status?.toLowerCase()] || "text-muted-foreground";
  };

  const status = loanDetails?.status?.toLowerCase();
  const isSubmitted = status === "submitted";
  const isDeclined = status === "declined";

  const openModal = (type) => {
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!loanId) return;

    setLoading(true);
    if (actionType === "approve") {
      await dispatch(approveLoan(loanId));
    } else if (actionType === "reject") {
      if (!rejectionReason.trim()) {
        alert("Please provide a reason for rejection");
        setLoading(false);
        return;
      }
      await dispatch(rejectLoan(loanId, { remark: rejectionReason }));
    }

    await dispatch(findLoanById(loanId)); // Refresh loan details
    setLoading(false);
    setShowModal(false);
    setRejectionReason("");
  };

  return (
    <div className="text-left bg-card z-40 m-3">
      <BackButton />
      <div className="p-3 border border-border rounded-xl shadow-xl bg-card">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-4 mb-5">
          <h1 className="text-3xl font-bold text-foreground">Loan Details</h1>
          <div className="flex gap-3">
            <button
              onClick={() => openModal("approve")}
              disabled={!isSubmitted}
              className={`text-sm sm:text-base text-white p-3 sm:px-4 rounded-full font-semibold shadow ${
                isSubmitted ? "bg-green-500 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Approve
            </button>
            <button
              onClick={() => openModal("reject")}
              disabled={!isSubmitted}
              className={`text-sm sm:text-base text-white p-3 sm:px-4 rounded-full font-semibold shadow ${
                isSubmitted ? "bg-red-500 hover:bg-red-400" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Reject
            </button>
          </div>
        </div>

        {/* Loan Info */}
        <div className="bg-card border border-border shadow-md rounded-lg p-5 mb-10 max-w-3xl">
          <h2 className="text-xl font-bold text-foreground mb-4">Loan Information</h2>
          <table className="min-w-full text-sm text-left">
            <tbody>
              {[
                 ["Loan Applicant",loanDetails?.user ? (
                    <Link to={`/admin/users/profile/${loanDetails.user.id}`}
                      className="text-blue-600 underline hover:text-foreground font-semibold">
                      {loanDetails.user.firstName} {loanDetails.user.lastName}
                    </Link>
                  ) : ("N/A"),
                ],
                ["Loan Type", loanDetails?.type],
                [
                  "Loan Status",
                  isDeclined
                    ? `${loanDetails.status} (${loanDetails?.remark || "No reason provided"})`
                    : loanDetails?.status,
                ],
                ["Loan Amount", `₦${loanDetails?.amount?.toLocaleString()}`],
                ["Loan Balance", `₦${loanDetails?.balance?.toLocaleString()}`],
                ["Account Details", `${loanDetails?.accountDetails}`],
                ["Guarantors Responce", `| ${loanDetails?.guarantor1?.firstName} ${loanDetails?.guarantor1?.lastName}: ${loanDetails?.guarantor1Status} | ${loanDetails?.guarantor2?.firstName} ${loanDetails?.guarantor2?.lastName}: ${loanDetails?.guarantor2Status}`],
              ].map(([label, value], idx) => (
                <tr key={idx} className="border-b border-border last:border-none">
                  <td className="py-2 px-4 font-bold text-muted-foreground capitalize">{label}</td>
                  <td
                    className={`py-2 px-4 font-semibold capitalize ${
                      label === "Loan Status" ? getStatusColor(loanDetails?.status) : "text-foreground"
                    }`}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Repayment History */}
        <div className="mt-10">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Repayment History</h2>
          <div className="w-full bg-card border shadow-lg rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead>
                <tr className="border-b bg-muted">
                  {["SN", "Loan Amount", "Repay Amount", "Date", "Balance", "Status"].map((title, idx) => (
                    <th key={idx} className="py-4 px-2 font-bold text-sm">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loanDetails?.repays?.length > 0 ? (
                  loanDetails.repays
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((repay, index) => (
                      <tr key={index} className="border-b last:border-none">
                        <td className="py-4 px-2">{index + 1}</td>
                        <td className="py-4 px-2">₦{loanDetails.amount?.toLocaleString()}</td>
                        <td className="py-4 px-2">₦{repay.amount?.toLocaleString()}</td>
                        <td className="py-4 px-2">
                          {new Date(repay.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-2">₦{repay.balance?.toLocaleString()}</td>
                        <td className={`py-4 px-2 ${getStatusColor(repay.status)}`}>{repay.status}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted-foreground">
                      No repayments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        visible={showModal}
        actionType={actionType}
        reason={rejectionReason}
        loading={loading}
        onChangeReason={(e) => setRejectionReason(e.target.value)}
        onConfirm={handleConfirmAction}
        onClose={() => {
          setShowModal(false);
          setRejectionReason("");
        }}
      />

    </div>
  );
};

export default AdminLoanDetails;
