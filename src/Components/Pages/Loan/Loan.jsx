import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { myLoans } from "../../../Store/Loan/Action";
import ApplyLoanModal from "./ApplyLoanModal";
import LoanHistoryTable from "./LoanHistoryTable";
import OverviewCard from "../../../Utils/OverviewCard";

const Loan = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("real");
  const [showModal, setShowModal] = useState(false);

  const { loan } = useSelector((state) => state);

  useEffect(() => {
    dispatch(myLoans());
  }, [dispatch]);

  const refreshLoans = () => {
    dispatch(myLoans());
  };

  const loans = Array.isArray(loan?.loans) ? loan.loans : [];

  const loanCounts = {
    real: loans.filter((loan) => loan.type === "real").length,
    soft: loans.filter((loan) => loan.type === "soft").length,
    material: loans.filter((loan) => loan.type === "material").length,
  };

  const loanTypes = {
    real: { title: "Real Loan" },
    soft: { title: "Soft Loan" },
    material: { title: "Material Loan" },
  };

  // Filter and sort only approved loans
  const filteredLoans = loans
    .filter((item) => item.type?.toLowerCase() === activeTab)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const approvedLoans = loans
    .filter((item) => item.type?.toLowerCase() === activeTab && item.status === "approved")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Loan overview calculations using only approved loans
  const totalLoan = approvedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalPaid = approvedLoans.reduce((total, item) => {
    if (Array.isArray(item.repays)) {
      const repayTotal = item.repays.reduce((sum, repay) => sum + (repay.amount || 0), 0);
      return total + repayTotal;
    }
    return total;
  }, 0);
  const totalBalance = totalLoan - totalPaid;

  const totalInstallments = approvedLoans.reduce((sum, loan) => sum + (loan.duration || 0), 0);
  const completedInstallments = approvedLoans.reduce((sum, loan) => {
    const paid = Array.isArray(loan.repays)
      ? loan.repays.reduce((t, r) => t + (r.amount || 0), 0)
      : 0;
    const perInstallment = loan.repayAmount || 1;
    const done = Math.floor(paid / perInstallment);
    return sum + done;
  }, 0);
  const latestApprovedLoanId = approvedLoans[0]?.id || approvedLoans[0]?._id || "";

  // Overview Items
  const overviewItems = [
    {label: `Ongoing ${loanTypes[activeTab]?.title}`,value: `₦${totalLoan.toLocaleString()}`,
      nav: latestApprovedLoanId ? `/loans/${latestApprovedLoanId}` : ""
    },
    {label: "Amount Paid",value: `₦${totalPaid.toLocaleString()}`,nav: "/repayments"},
    {label: "Amount Left",value: `₦${totalBalance.toLocaleString()}`,nav: ""},
    {label: "Installments",value: `${completedInstallments} out of ${totalInstallments}`,nav: ""}
  ];


  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        {/* Header */}
        <div className="flex justify-between border-b mb-5">
          <p className="text-4xl font-bold text-foreground mb-5">Loans</p>
          <button
            onClick={() => setShowModal(true)}
            className="h-12 px-10 py-2 bg-green-500 text-white text-xl shadow-2xl rounded-full font-semibold hover:bg-green-700"
          >
            Apply Loan
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-3">
          {Object.keys(loanTypes).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`-skew-y-6 text-sm sm:text-base px-2 py-3 rounded-full font-semibold shadow transition duration-200 ${
                activeTab === tab
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-muted text-foreground hover:bg-green-700 hover:text-white"
              }`}
            >
              {loanTypes[tab].title} ({loanCounts[tab]})
            </button>
          ))}
        </div>

        {/* Loan Overview & History */}
        <OverviewCard
          title={`${loanTypes[activeTab].title} Overview`}
          items={overviewItems}
        />

        <LoanHistoryTable
          loans={filteredLoans}
          title={`${loanTypes[activeTab].title} History`}
        />
      </div>

      {/* Loan Application Modal */}
      <ApplyLoanModal
        open={showModal}
        onClose={() => setShowModal(false)}
        refreshLoans={refreshLoans}
      />
    </div>
  );
};

export default Loan;
