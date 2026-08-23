import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { findLoanById } from "../../../Store/Loan/Action";
import RepaymentModal from "../Repayment/RepaymentModal";
import { isSalaryDeductionUser } from "../../../Utils/paymentType";
import BackButton from "../../Navigation/BackButton";

const LoanDetails = () => {
  const dispatch = useDispatch();
  const { loanId } = useParams();
  const { loan, auth } = useSelector((store) => store);
  const loanDetails = loan?.loan;
  const [showModal, setShowModal] = useState(false);
  const salaryDeduction = isSalaryDeductionUser(auth);

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

  const loanStatus = loanDetails?.status?.toLowerCase();
  const isDeclined = loanStatus === "declined";
  const isSubmitted = loanStatus === "submitted";
  const isFullyPaid = !loanDetails?.balance || loanDetails.balance <= 0;
  const repayDisabled = isDeclined || isSubmitted || isFullyPaid || salaryDeduction;

  let tooltipText = "Click to repay loan";
  if (salaryDeduction) tooltipText = "Repayments are deducted from your salary automatically";
  else if (isDeclined) tooltipText = "Repayment not available, loan was not approved";
  else if (isSubmitted) tooltipText = "Repayment not available, loan is under review";
  else if (isFullyPaid) tooltipText = "Repayment not available: Loan is fully paid";

  return (
    <div className="text-left bg-card z-40 m-3">
      <BackButton />
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-5">
          <h1 className="text-3xl font-bold text-foreground">Loan Details</h1>
          {salaryDeduction ? (
            <span className="py-2 px-4 bg-green-100 text-green-700 text-sm rounded-full font-semibold border border-green-200">
              Salary deduction
            </span>
          ) : (
            <div title={tooltipText}>
              <button
                onClick={() => setShowModal(true)}
                disabled={repayDisabled}
                className={`text-sm sm:text-base text-white p-3 sm:px-4 rounded-full font-semibold shadow transition ${
                  !repayDisabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}>
                Repay Loan
              </button>
            </div>
          )}
        </div>

        {/* Loan Info Table */}
        <div className="bg-card border shadow-md rounded-lg p-5 mb-10 max-w-3xl">
          <h2 className="text-xl font-bold text-foreground mb-4">Loan Information</h2>
          <table className="min-w-full text-sm text-left">
            <tbody>
              {[
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
                <tr key={idx} className="border-b last:border-none">
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
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted text-foreground text-sm">
                  {["SN", "Loan Amount", "Repay Amount", "Date", "Balance", "Status"].map(
                    (title, idx) => (
                      <th
                        key={idx}
                        className="py-3 px-4 font-semibold text-muted-foreground text-left text-sm"
                      >
                        {title}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loanDetails?.repays?.length > 0 ? (
                  loanDetails.repays
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((repay, index) => (
                      <tr key={index} className="border-b last:border-none">
                        <td className="py-3 px-4 text-foreground font-medium">{index + 1}</td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          ₦{loanDetails.amount?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          ₦{repay.amount?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {new Date(repay.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          ₦{repay.balance?.toLocaleString()}
                        </td>
                        <td className={`py-3 px-4 ${getStatusColor(repay.status)}`}>
                          {repay.status}
                        </td>
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

        {/* Repayment Modal */}
        {showModal && loanDetails && (
          <RepaymentModal
            open={showModal}
            onClose={() => setShowModal(false)}
            loan={loanDetails}
          />
        )}
      </div>
    </div>
  );
};

export default LoanDetails;
