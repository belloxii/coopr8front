import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SaveModal from "./SaveModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable"; // 👈 import it like this
import { getUserLastSaving, mySavings } from "../../../Store/Saving/Action";
import OverviewCard from "../../../Utils/OverviewCard";
import { isSalaryDeductionUser, SALARY_DEDUCTION_NOTICE } from "../../../Utils/paymentType";
import { useOrganization } from "../../../Utils/useOrganization";
import { drawDocumentHeader, drawPlatformFooter, exportFileName } from "../../../Utils/exportBranding";

const Savings = () => {
  const dispatch = useDispatch();
  const { auth, user, saving } = useSelector((store) => store);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Statements belong to the cooperative, not the platform.
  const { name: orgName, address: orgAddress } = useOrganization();

  const userId = auth?.user?.user?.id;
  const salaryDeduction = isSalaryDeductionUser(auth);

  useEffect(() => {
    if (userId) {
      dispatch(mySavings());
      dispatch(getUserLastSaving());
    }
  }, [userId, dispatch]);

  const getStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase();

    if (lowerStatus.includes("submitted")) return "text-yellow-600 bg-yellow-100 font-bold";
    if (lowerStatus.includes("approved") ) return "text-blue-600 bg-blue-100 font-bold";
    if (lowerStatus.includes("completed")) return "text-green-600 bg-green-100 font-bold";
    if (lowerStatus.includes("declined")) return "text-red-600 bg-red-100 font-bold";

    return "text-muted-foreground";
  };

  const filterByDate = (data) => {
    if (!startDate && !endDate) return data;

    return data.filter((item) => {
      const date = new Date(item.createdAt);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      return (!from || date >= from) && (!to || date <= to);
    });
  };

  const filteredSavings = filterByDate(
    [...(saving?.savings || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  );

  const exportToExcel = () => {
    const data = filteredSavings.map((item, index) => ({
      SN: index + 1,
      Amount: item.amount,
      "Transaction ID": item.txnId || "-",
      Date: new Date(item.createdAt).toLocaleDateString("en-GB"),
      Balance: item.balance,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Savings");
    XLSX.writeFile(workbook, exportFileName(orgName, "savings", "xlsx"));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Cooperative letterhead, then the document title
    let y = drawDocumentHeader(doc, {
      organizationName: orgName,
      organizationAddress: orgAddress,
      title: "Savings Report",
    });

    // User Details
    const userData = auth?.user?.user || {};
    const userProfile = user?.findUser || {};

    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    const memberId = userData.ledgerID || 'N/A';
    const email = userData.email || 'N/A';
    const address = userProfile.address || 'N/A';

    doc.text(`Name: ${fullName}`, 14, y);
    doc.text(`Ledger ID: ${memberId}`, 120, y);
    y += 8;
    doc.text(`Email: ${email}`, 14, y);
    doc.text(`Address: ${address}`, 120, y);
    y += 8;

    // Date Range
    let dateRangeText = '';
    if (startDate && endDate) {
      dateRangeText = `Date Range: ${startDate} to ${endDate}`;
    } else if (startDate) {
      dateRangeText = `From: ${startDate}`;
    } else if (endDate) {
      dateRangeText = `Up to: ${endDate}`;
    } else {
      dateRangeText = 'Date Range: All';
    }
    doc.text(dateRangeText, 14, y);
    y += 6;

    // Table Data
    const rows = filteredSavings.map((item, index) => [
      index + 1,
      `N${item.amount.toLocaleString()}`,
      item.txnId || "-",
      new Date(item.createdAt).toLocaleDateString("en-GB"),
      `N${item.balance.toLocaleString()}`,
      item.status,
    ]);

    // Table
    autoTable(doc, {
      head: [["SN", "Amount", "Transaction ID", "Date", "Balance", "Status"]],
      body: rows,
      startY: y,
    });

    drawPlatformFooter(doc);
    doc.save(exportFileName(orgName, "savings", "pdf"));
  };

  const overviewItems = [
    { label: "Total Savings", value: `₦${filteredSavings[0]?.balance?.toLocaleString() || 0}`, nav: ""  },
    { label: "Monthly Plan", value: `₦${user?.findUser?.plan?.toLocaleString() || 0}`, nav: "" },
    { label: "Last Saving Date", value: `${saving?.lastSaving?.createdAt
                    ? new Date(saving.lastSaving.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",month: "long",year: "numeric",}): "N/A"}`, nav: "" },
    { label: "Next Saving Date",value: saving?.lastSaving?.createdAt? new Date(
            new Date(saving.lastSaving.createdAt).setMonth(
              new Date(saving.lastSaving.createdAt).getMonth() + 1)).toLocaleDateString("en-GB", {
                month: "long",year: "numeric",}): "N/A",nav: "",}
  ];


  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-4xl font-bold text-foreground">Savings</h1>
          {salaryDeduction ? (
            <span className="py-2 px-4 bg-green-100 text-green-700 text-sm rounded-full font-semibold border border-green-200">
              Salary deduction
            </span>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="py-2 px-4 bg-green-600 text-white text-lg rounded-full font-semibold shadow hover:bg-green-700 transition"
            >
              Save Now
            </button>
          )}
        </div>

        {salaryDeduction && (
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            {SALARY_DEDUCTION_NOTICE}
          </div>
        )}

        <OverviewCard title="Savings Overview" items={overviewItems} />

<div className="flex flex-col md:flex-row justify-between gap-4 mb-4 w-full">
  <div className="flex flex-wrap gap-2">
    <div>
      <div className="ml-3">start date</div>
      <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"/>
    </div>
    <div>
      <div className="ml-3">end date</div>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"/>
      </div>

       <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="bg-muted text-foreground  hover:bg-muted text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow mt-4"
          >
            Clear Filters
          </button>

  </div>

  <div className="flex flex-wrap gap-2">
    <button
      onClick={exportToExcel}
      className="bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow"
    >
      Export Excel
    </button>
    <button
      onClick={exportToPDF}
      className="bg-red-600 text-white hover:bg-red-700 text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow"
    >
      Export PDF
    </button>
  </div>
</div>

        <h2 className="text-2xl font-bold text-foreground mb-4">Savings History</h2>
        <div className="w-full bg-card border shadow-lg rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted text-foreground">
                <th className="p-3 font-bold">SN</th>
                <th className="p-3 font-bold">Amount</th>
                <th className="p-3 font-bold">Transaction ID</th>
                <th className="p-3 font-bold">Date</th>
                <th className="p-3 font-bold">Balance</th>
                <th className="p-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSavings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted-foreground py-6">
                    No Savings Yet
                  </td>
                </tr>
              ) : (
                filteredSavings.map((item, index) => (
                  <tr key={index} className="border-t text-foreground">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">₦{item.amount.toLocaleString()}</td>
                    <td className="p-3">{item.txnId || "-"}</td>
                    <td className="p-3">
                      {new Date(item.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3">₦{item.balance.toLocaleString()}</td>
                    <td className={`p-3 ${getStatusColor(item.status)}`}>{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaveModal handleClose={() => setShowModal(false)} open={showModal} />
    </div>
  );
};

export default Savings;
