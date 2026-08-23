import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoanHistoryTable from "./LoanHistoryTable";
import { getAllLoans } from "../../../../Store/Loan/Action";
import OverviewCard from "../../../../Utils/OverviewCard";

const Loan = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("real");

  const { loan } = useSelector((state) => state);

  useEffect(() => {
    dispatch(getAllLoans());
  }, [dispatch]);

  const loans = Array.isArray(loan?.loans) ? loan.loans : [];

  const loanCounts = {
    real: loans.filter((loan) => loan.type === "real").length,
    soft: loans.filter((loan) => loan.type === "soft").length,
    material: loans.filter((loan) => loan.type === "material").length,
    requests: loans.filter((loan) => loan.status?.toLowerCase() === "submitted").length,
  };

  const loanTypes = {
    real: { title: "Real Loan" },
    soft: { title: "Soft Loan" },
    material: { title: "Material Loan" },
    requests: { title: "Loan Requests" },
  };

const filteredLoans =
  activeTab === "requests"
    ? loans.filter((item) => item.status?.toLowerCase() === "submitted")
    : loans
        .filter((item) => item.type?.toLowerCase() === activeTab)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Get only approved loans
const approvedLoans = filteredLoans.filter(
  (item) => item.status?.toLowerCase() !== "submitted"
);

// Total loan amount disbursed
const loanDisbursed = approvedLoans.reduce(
  (total, item) => total + (item.amount || 0),
  0
);

// Total amount returned (sum of all repayments for each approved loan)
const loanReturned = approvedLoans.reduce((total, item) => {
  if (Array.isArray(item.repays)) {
    const repayTotal = item.repays.reduce(
      (sum, repay) => sum + (repay.amount || 0),
      0
    );
    return total + repayTotal;
  }
  return total;
}, 0);

// Remaining balance
const loanRemain = loanDisbursed - loanReturned;


  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        {/* Header */}
        <div className="flex justify-between border-b mb-5">
          <p className="text-4xl font-bold text-foreground mb-5">Loans</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(loanTypes).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm -skew-y-6 sm:text-base px-2 py-3 rounded-full font-semibold shadow transition duration-200 ${
                activeTab === tab
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-muted text-foreground hover:bg-red-400 hover:text-white"
              }`}
            >
              {loanTypes[tab].title} ({loanCounts[tab]})
            </button>
          ))}
        </div>

        {/* Overview and Table */}
        <div className="space-y-6 text-left">
        <OverviewCard
          title={`${activeTab} Loan Overview`}
          items={[
            { label: "Loan Disbursed", value: `₦${loanDisbursed.toLocaleString()}` },
            { label: "Loan Returned", value: `₦${loanReturned.toLocaleString()}` },
            { label: "Loan Remaining", value: `₦${loanRemain.toLocaleString()}` },]}/>

          <LoanHistoryTable
            loans={filteredLoans}
            activeTab={activeTab}
            title={`${loanTypes[activeTab].title} History`}/>
        </div>
      </div>
    </div>
  );
};

export default Loan;
