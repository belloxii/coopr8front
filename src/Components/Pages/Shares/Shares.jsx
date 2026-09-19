import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { myShares } from "../../../Store/Shares/Action";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AddShareModal from "./AddShareModal";
import WithdrawShareModal from "./WithdrawShareModal";
import OverviewCard from "../../../Utils/OverviewCard";
import { isSalaryDeductionUser } from "../../../Utils/paymentType";
import { useOrganization } from "../../../Utils/useOrganization";
import { drawDocumentHeader, drawPlatformFooter, exportFileName } from "../../../Utils/exportBranding";

const Shares = () => {
  const dispatch = useDispatch();
  const { auth, shares } = useSelector((store) => store);
  const userId = auth?.user?.user?.id;
  const email = auth?.user?.user?.email;
  const salaryDeduction = isSalaryDeductionUser(auth);

  // Statements belong to the cooperative, not the platform.
  const { name: orgName, address: orgAddress } = useOrganization();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);

  useEffect(() => {
    if (userId) dispatch(myShares());
  }, [userId, dispatch]);

  const filteredShares = (shares?.myShares || [])
    .filter((share) => {
      const date = new Date(share.createdAt);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      const typeMatch =
        filterType === "all" || share?.type?.toLowerCase() === filterType;
      return (!from || date >= from) && (!to || date <= to) && typeMatch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalShares = filteredShares.reduce((acc, item) => {
    const amt = Number(item.amount);
    if (isNaN(amt)) return acc;
    return item.type?.toLowerCase() === "credit" ? acc + amt : acc - amt;
  }, 0);

  const lastShareDate = (() => {
    const date = filteredShares[0]?.createdAt
      ? new Date(filteredShares[0].createdAt)
      : null;
    return date && !isNaN(date)
      ? date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A";
  })();

  const exportToExcel = () => {
    const data = filteredShares.map((item, index) => ({
      SN: index + 1,
      Type: item.type,
      Amount: item.amount,
      "Transaction ID": item.txnId || "-",
      Date: new Date(item.createdAt).toLocaleDateString("en-GB"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shares");
    XLSX.writeFile(workbook, exportFileName(orgName, "shares", "xlsx"));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Cooperative letterhead, then the document title
    const y = drawDocumentHeader(doc, {
      organizationName: orgName,
      organizationAddress: orgAddress,
      title: "Shares Report",
    });

    const rows = filteredShares.map((item, index) => [
      index + 1,
      item.type,
      `₦${Number(item.amount)?.toLocaleString()}`,
      item.txnId || "-",
      new Date(item.createdAt).toLocaleDateString("en-GB"),
    ]);
    autoTable(doc, {
      head: [["SN", "Type", "Amount", "Transaction ID", "Date"]],
      body: rows,
      startY: y,
    });

    drawPlatformFooter(doc);
    doc.save(exportFileName(orgName, "shares", "pdf"));
  };

  const getStatusColor = (status) => {
    const lower = status?.toLowerCase?.(); // Safely check both `status` and `toLowerCase`
    if (!lower) return "text-muted-foreground";

    if (lower.includes("submitted")) return "text-yellow-600 bg-yellow-100 font-bold";
    if (lower.includes("approved")) return "text-blue-600 bg-blue-100 font-bold";
    if (lower.includes("completed")) return "text-green-600 bg-green-100 font-bold";
    if (lower.includes("declined")) return "text-red-600 bg-red-100 font-bold";
    if (lower.includes("refunded")) return "text-purple-600 bg-purple-100 font-bold";

    return "text-muted-foreground";
  };

  const currency = (amount) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount || 0);

  const overviewItems = [
    {label: "My Shares",value: currency(totalShares),nav: "",},
    {label: "Last Shares Date",value: lastShareDate,nav: "",},
    {label: "Total Profit",value: currency(auth?.user?.user?.profit),nav: "",},
    {label: "Pending Withdrawals",value: currency(filteredShares
      ?.filter((share) => share.status === "submitted" && share.type === "debit")
      ?.reduce((sum, s) => sum + s.amount, 0)),nav: "",}
  ];

  
  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-4xl font-bold text-foreground">Shares</h1>
          <div className="flex flex-wrap gap-1">
            {!salaryDeduction && (
              <button
                onClick={() => setOpenAddModal(true)}
                className="py-2 px-4 bg-primary text-primary-foreground text-lg rounded-full font-semibold shadow hover:opacity-90 transition"
              >Add Share</button>
            )}
            <button
              onClick={() => setOpenWithdrawModal(true)}
              className="py-2 px-4 bg-red-500 text-white text-lg rounded-full font-semibold shadow hover:bg-red-600 transition"
            >Withdraw</button>
          </div>
        </div>

        <OverviewCard title="Shares Overview" items={overviewItems} />

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 w-full">
          <div className="flex flex-wrap gap-2">
            <div>
              <div className="ml-3">Transaction:</div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-input border-0 rounded-xl py-2 px-6 text-foreground outline-none transition focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
            <div>
              <div className="ml-3">Start Date:</div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <div className="ml-3">End Date:</div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={() => {
                setFilterType('all');
                setStartDate('');
                setEndDate('');
              }}
              className="bg-muted text-foreground hover:bg-muted text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow mt-4"
            >Clear Filters</button>
          </div>

          <div className="flex flex-wrap gap-1">
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white hover:bg-green-700 text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow"
            >Export Excel</button>
            <button
              onClick={exportToPDF}
              className="bg-red-500 text-white hover:bg-red-700 text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow"
            >Export PDF</button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">Shares History</h2>
        <div className="w-full bg-card border shadow-lg rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted text-muted-foreground">
                <th className="p-3 font-bold">SN</th>
                <th className="p-3 font-bold">Date</th>
                <th className="p-3 font-bold">Amount</th>
                <th className="p-3 font-bold">Credit</th>
                <th className="p-3 font-bold">Debit</th>
                <th className="p-3 font-bold">Balance</th>
                <th className="p-3 font-bold">Ref</th>
                <th className="p-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {filteredShares.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted-foreground py-6">
                    No Transaction Yet
                  </td>
                </tr>
              ) : (
                filteredShares.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 text-foreground">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{new Date(item.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="p-3">₦{Number(item.amount).toLocaleString()}</td>
                    <td className="p-3 text-green-600">
                      {item.type?.toLowerCase() === "credit" ? `₦${Number(item.amount).toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3 text-red-600">
                      {item.type?.toLowerCase() === "debit" ? `₦${Number(item.amount).toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3">₦{Number(item.balance).toLocaleString()}</td>
                    <td className="p-3">{item.txnId || "-"}</td>
                    <td className={`p-3 ${getStatusColor(item.status)}`}>{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddShareModal open={openAddModal} onClose={() => setOpenAddModal(false)} email={email} />
      <WithdrawShareModal open={openWithdrawModal} onClose={() => setOpenWithdrawModal(false)} totalShares={totalShares} />
    </div>
  );
};

export default Shares;
