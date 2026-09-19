import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import RepaymentModal from './RepaymentModal'; // ✅ import reusable modal
import { myRepays } from '../../../Store/Repay/Action';
import { myLoans } from '../../../Store/Loan/Action';
import { useNavigate } from 'react-router-dom';
import { isSalaryDeductionUser, SALARY_DEDUCTION_NOTICE } from '../../../Utils/paymentType';
import { useOrganization } from '../../../Utils/useOrganization';
import { drawDocumentHeader, drawPlatformFooter, exportFileName } from '../../../Utils/exportBranding';

const Repayments = () => {
  const dispatch = useDispatch();
  const { repay, auth, loan } = useSelector((store) => store);
  const navigate = useNavigate();

  // Statements belong to the cooperative, not the platform.
  const { name: orgName, address: orgAddress } = useOrganization();

  const [showModal, setShowModal] = useState(false);
  const [filterLoanType, setFilterLoanType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const email = auth?.user?.user?.email;
  const salaryDeduction = isSalaryDeductionUser(auth);

  useEffect(() => {
    dispatch(myRepays());
    dispatch(myLoans());
  }, [dispatch]);

  const getParentLoan = (loanId) => loan?.loans?.find((l) => l.id === loanId);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s.includes("submitted")) return "text-yellow-600 bg-yellow-100 font-bold";
    if (s.includes("approved")) return "text-blue-600 bg-blue-100 font-bold";
    if (s.includes("completed")) return "text-green-600 bg-green-100 font-bold";
    if (s.includes("declined")) return "text-red-600 bg-red-100 font-bold";
    return "text-muted-foreground";
  };

  const filteredRepayments = repay?.repays
    ?.filter((item) => {
      const matchType = filterLoanType ? item.loanType === filterLoanType : true;
      const date = new Date(item.createdAt);
      const afterStart = startDate ? date >= new Date(startDate) : true;
      const beforeEnd = endDate ? date <= new Date(endDate) : true;
      return matchType && afterStart && beforeEnd;
    })
    ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];

  const exportToExcel = () => {
    const data = filteredRepayments.map((item, index) => {
      const parentLoan = getParentLoan(item.parentLoanId);
      return {
        SN: index + 1,
        'Loan Type': item.loanType,
        'Loan Amount': parentLoan?.amount || 0,
        'Repaid Amount': item.amount,
        Date: new Date(item.createdAt).toLocaleDateString(),
        Balance: item.balance,
        Status: item.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Repayments');
    XLSX.writeFile(workbook, exportFileName(orgName, 'repayments', 'xlsx'));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredRepayments.map((item, index) => {
      const parentLoan = getParentLoan(item.parentLoanId);
      return [
        index + 1,
        item.loanType,
        `₦${parentLoan?.amount?.toLocaleString() || 'N/A'}`,
        `₦${item.amount?.toLocaleString()}`,
        new Date(item.createdAt).toLocaleDateString(),
        `₦${item.balance?.toLocaleString()}`,
        item.status,
      ];
    });

    // Cooperative letterhead, then the document title
    let y = drawDocumentHeader(doc, {
      organizationName: orgName,
      organizationAddress: orgAddress,
      title: 'Loan Repayment History',
    });

    const user = auth?.user?.user || {};
    doc.text(`Name: ${user.firstName} ${user.lastName}`, 14, y);
    doc.text(`Ledger ID: ${user.ledgerID}`, 120, y);
    y += 8;
    doc.text(`Email: ${email}`, 14, y);
    doc.text(`Address: ${user.address}`, 120, y);
    y += 8;

    let dateRangeText = 'Date Range: All';
    if (startDate && endDate) dateRangeText = `Date Range: ${startDate} to ${endDate}`;
    else if (startDate) dateRangeText = `From: ${startDate}`;
    else if (endDate) dateRangeText = `Up to: ${endDate}`;
    doc.text(dateRangeText, 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['SN', 'Loan Type', 'Loan Amount', 'Repaid Amount', 'Date', 'Balance', 'Status']],
      body: tableData,
    });

    drawPlatformFooter(doc);
    doc.save(exportFileName(orgName, 'repayments', 'pdf'));
  };

  const uniqueLoanTypes = [...new Set(repay?.repays?.map((r) => r.loanType).filter(Boolean))];


  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        <div className="flex justify-between border-b mb-5 pb-5">
          <p className="text-2xl font-bold text-foreground">Repayment History</p>
          {salaryDeduction ? (
            <span className="py-2 px-4 bg-green-100 text-green-700 text-sm rounded-full font-semibold border border-green-200">
              Salary deduction
            </span>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-primary-foreground hover:opacity-90 text-sm sm:text-base p-3 sm:px-4 rounded-full font-semibold shadow transition"
            >
              Make Repayment
            </button>
          )}
        </div>

        {salaryDeduction && (
          <div className="mb-5 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            {SALARY_DEDUCTION_NOTICE}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 w-full">
          <div className="flex flex-wrap gap-2">
            <div>
              <div className="ml-3">Loan Type:</div>
              <select
                className="bg-input border-0 rounded-xl py-2 px-6 text-foreground outline-none transition focus:ring-2 focus:ring-primary/50"
                value={filterLoanType}
                onChange={(e) => setFilterLoanType(e.target.value)}>
                <option value="">All</option>
                {uniqueLoanTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="ml-3">Start Date:</div>
              <input
                type="date"
                className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-primary/50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <div className="ml-3">End Date:</div>
              <input
                type="date"
                className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-primary/50"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                setFilterLoanType('');
                setStartDate('');
                setEndDate('');
              }}
              className="bg-muted text-foreground hover:bg-muted text-sm h-[45px] py-2 px-4 rounded-full font-semibold shadow mt-4"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white hover:bg-green-700 text-sm h-[45px] py-2 px-4 rounded-full font-semibold shadow"
            >
              Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-500 text-white hover:bg-red-700 text-sm h-[45px] py-2 px-4 rounded-full font-semibold shadow"
            >
              Export PDF
            </button>
          </div>
        </div>
          <div className="w-full bg-card border shadow-lg rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted text-foreground">
                  {['SN', 'Loan Type', 'Loan Amount', 'Repaid Amount', 'Date', 'Balance', 'Status'].map((header) => (
                    <th key={header} className="py-4 px-2 font-bold text-muted-foreground">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRepayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted-foreground py-6">
                      No repayments found.
                    </td>
                  </tr>
                ) : (
                  filteredRepayments.map((item, index) => {
                    const parentLoan = getParentLoan(item.parentLoanId);
                    return (
                      <tr key={index} className="border-b last:border-none">
                        <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-4 text-muted-foreground flex items-center gap-2">
                          <span>{parentLoan?.type}</span>
                          {parentLoan?.id && (
                            <button
                              onClick={() => navigate(`/loans/${parentLoan.id}`)}
                              className="text-blue-600 text-xs border border-blue-500 px-2 py-[1px] rounded-full hover:bg-blue-100 transition">
                              View
                            </button>)}
                        </td>                        
                        <td className="py-3 px-4 text-muted-foreground">
                          ₦{parentLoan?.amount?.toLocaleString() || 'N/A'}
                        </td>                        <td className="py-3 px-4 text-muted-foreground">
                          ₦{item.amount?.toLocaleString()}
                        </td>                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',})}
                        </td>                        
                        <td className="py-3 px-4 text-muted-foreground">
                          ₦{item.balance?.toLocaleString()}
                        </td>
                        <td className={`py-2 px-4 font-bold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* ✅ Reusable Repayment Modal */}
      {showModal && (
        <RepaymentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          loanList={loan?.loans?.filter((l) => l.status === "approved")} // pass loans
        />
      )}
    </div>
  );
};

export default Repayments;
