import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { getAllSavings } from "../../../../Store/Saving/Action";
import { getAllUsers } from "../../../../Store/Admin/Action";
import OverviewCard from "../../../../Utils/OverviewCard";
import { Link } from "react-router-dom";
import { useOrganization } from "../../../../Utils/useOrganization";
import { exportFileName } from "../../../../Utils/exportBranding";

const Savings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((store) => store);
  const { admin } = useSelector((store) => store);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Reports belong to the cooperative, not the platform.
  const { name: orgName } = useOrganization();

  useEffect(() => {
    dispatch(getAllSavings());
    dispatch(getAllUsers());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "text-green-600 font-bold";
      case "completed": return "text-yellow-500 font-bold";
      case "submitted": return "text-blue-500 font-bold";
      default: return "text-muted-foreground";
    }
  };

  const totalSavings = saving?.savings?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  const totalMonthlyPlans = (() => {
    const activeUsers = admin?.users?.filter(user => user.status === 'ACTIVE');
    const tmp = activeUsers?.reduce((sum, user) => sum + (user.plan || 0), 0) || 0;
    return tmp;
  })();

  const totalSavedThisMonth = () => {
    const now = new Date();
    return saving?.savings?.reduce((sum, item) => {
      const createdAt = new Date(item.createdAt);
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
        ? sum + (item.amount || 0)
        : sum;
    }, 0) || 0;
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
    saving?.savings
      ?.filter((item) => {
        const user = item.user || {};
        const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
        const ledgerID = user.ledgerID?.toLowerCase() ?? "";
        const txnId = item.txnId?.toLowerCase() ?? "";
        const status = item.status?.toLowerCase() ?? "";
        const term = searchTerm.toLowerCase();
        return name.includes(term) || ledgerID.includes(term) || txnId.includes(term) || status.includes(term);
      })
      ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
  );

  const csvData = filteredSavings.map((item, index) => ({
    SN: index + 1,
    Name: `${item?.user?.firstName || "N/A"} ${item?.user?.lastName || ""}`,
    LedgerID: item?.user?.ledgerID || "N/A",
    Amount: item.amount || 0,
    TXID: item.txnId || "N/A",
    Date: new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    Balance: item.balance || 0,
    Status: item.status || "Unknown",
  }));

  const exportToExcel = () => {
    const data = csvData;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Savings");
    XLSX.writeFile(workbook, exportFileName(orgName, "member-savings", "xlsx"));
  };

  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        <div className="flex justify-between items-center border-b mb-5 pb-4">
          <h2 className="text-4xl font-bold text-foreground">All Member Savings</h2>
          <button
            onClick={() => navigate("/admin/savings/add-savings")}
            className="py-2 px-4 bg-red-500 text-white text-lg rounded-full font-semibold hover:bg-red-700 transition"
          >
            Add Savings
          </button>
        </div>

        <OverviewCard title="Savings Overview" items={[
            {label: "Total Savings",value: `₦${totalSavings.toLocaleString()}`,},
            {label: "Total Monthly Plan",value: `₦${totalMonthlyPlans.toLocaleString()}`,},
            {label: "Total Saved This Month",value: `₦${totalSavedThisMonth().toLocaleString()}`,},]}/>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 w-full">
          <div className="flex flex-wrap gap-2">
            <div>
              <div className="ml-3">Start Date</div>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50" />
            </div>
            <div>
              <div className="ml-3">End Date</div>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-input border-0 rounded-xl py-2 px-4 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50" />
            </div>
            <button onClick={() => { setStartDate(""); setEndDate(""); }} className="bg-muted text-foreground hover:bg-muted text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow mt-4">
              Clear Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-input border-0 rounded-full max-w-[11rem] h-[45px] pl-2 text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-green-600/50"
              />
            <button onClick={exportToExcel} className="bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base h-[45px] py-2 px-4 rounded-full font-semibold shadow">
              Export Excel
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">Savings History</h2>
        <div className="w-full bg-card border shadow-lg rounded-2xl overflow-x-auto text-foreground">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">SN</th>
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">Member Name</th>
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">Ledger ID</th>
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">Amount</th>
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">TXID</th>
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">Date</th>
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">Balance</th>
                <th className="py-4 px-2 text-left font-bold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSavings.length > 0 ? (
                filteredSavings.map((item, index) => (
                  <tr key={item._id || index} className="border-b last:border-none">
                    <td className="py-4 px-2">{index + 1}</td>
                    <td className="py-4 px-2">
                      {item?.user ? (
                        <Link
                          to={`/admin/users/profile/${item.user.id}`}
                          className="text-blue-600 underline hover:text-foreground font-semibold">
                          {item.user.firstName} {item.user.lastName}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="py-4 px-2">{item?.user?.ledgerID || "N/A"}</td>
                    <td className="py-4 px-2">₦{item.amount?.toLocaleString()}</td>
                    <td className="py-4 px-2">{item.txnId || "N/A"}</td>
                    <td className="py-4 px-2">{new Date(item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</td>
                    <td className="py-4 px-2">₦{item.balance?.toLocaleString()}</td>
                    <td className={`py-4 px-2 ${getStatusColor(item.status)}`}>{item.status || "Unknown"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-5 text-center text-muted-foreground">No savings history available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Savings;
