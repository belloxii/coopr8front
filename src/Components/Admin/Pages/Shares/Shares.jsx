import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import ShareRequestsCard from "./ShareRequestsModal";
import { approveWithdraw, declineWithdraw, getAllShares } from "../../../../Store/Shares/Action";
import OverviewCard from "../../../../Utils/OverviewCard";
import { Link } from "react-router-dom";
import { useOrganization } from "../../../../Utils/useOrganization";
import { exportFileName } from "../../../../Utils/exportBranding";

const Shares = () => {
  const dispatch = useDispatch();
  const { shares } = useSelector((store) => store);
  const allShare = shares.allShares;

  // Reports belong to the cooperative, not the platform.
  const { name: orgName } = useOrganization();

  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllShares());
  }, [dispatch]);

const filteredShares = useMemo(() => {
  const filtered = allShare
    ?.filter((share) => {
      const created = new Date(share.createdAt);
      const matchType = typeFilter === "all" || share.type === typeFilter;
      const matchStart = !startDate || created >= new Date(startDate);
      const matchEnd = !endDate || created <= new Date(endDate);
      const fullName = `${share.user?.firstName ?? ""} ${share.user?.lastName ?? ""}`;
      const memberID = share.user?.ledgerID ?? "";
      const matchSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberID.toLowerCase().includes(searchTerm.toLowerCase());

      return matchType && matchStart && matchEnd && matchSearch;
    }) || [];

  // Sort by newest first
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}, [allShare, typeFilter, startDate, endDate, searchTerm]);

  const totalCredit = filteredShares
    .filter((s) => s.type === "credit")
    .reduce((sum, s) => sum + s.amount, 0);
  const totalDebit = filteredShares
    .filter((s) => s.type === "debit")
    .reduce((sum, s) => sum + s.amount, 0);

  const shareRequests = allShare.filter(
    (s) =>
      s.type === "debit" &&
      s.status === "submitted"
  );

  const exportToExcel = () => {
    const data = filteredShares.map((s, idx) => ({
      SN: idx + 1,
      Name: `${s.user?.firstName ?? ""} ${s.user?.lastName ?? ""}`,
      MemberID: s.user?.ledgerID ?? "",
      Amount: s.amount,
      Credit: s.type === "credit" ? s.amount : "",
      Debit: s.type === "debit" ? s.amount : "",
      Balance: s.balance,
      Date: new Date(s.createdAt).toLocaleDateString("en-GB"),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shares");
    XLSX.writeFile(wb, exportFileName(orgName, "member-shares", "xlsx"));
  };

  const handleApprove = (id) => {
    dispatch(approveWithdraw(id))
  };

const handleReject = (id, remark) => {
  dispatch(declineWithdraw(id, remark));
};


  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        <div className="flex justify-between items-center border-b mb-5 pb-4">
          <h1 className="text-4xl p-3 font-bold text-foreground">Shares</h1>
          <ShareRequestsCard
            allShare={allShare}
            handleApprove={handleApprove}
            handleReject={handleReject}/>
          </div>

        {/* Overview */}
        <OverviewCard title="Shares Overview" items={[
            {label: "Total Shares Bought",value: `₦${totalCredit.toLocaleString()}`,},
            {label: "Total Withdraw",value: `₦${totalDebit.toLocaleString()}`,},
            {label: "Shares Balance",value: `₦${(totalCredit - totalDebit).toLocaleString()}`,},
            {label: "Withdraw requests",value: `${shareRequests.length}`,},
          ]}/>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-input border-0 rounded-xl p-2 px-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"
            >
              <option value="all">All</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-input border-0 rounded-xl p-2 px-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-input border-0 rounded-xl p-2 px-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground">Search (Name or ID)</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md bg-input border-0 rounded-xl p-2 px-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"
            />
          </div>
          </div>
          
          <div className="justify-between flex mt-6">
          <p className="text-2xl font-bold text-foreground mt-2">Shares History</p>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white transition text-sm sm:text-base p-3 sm:px-4 rounded-full font-semibold shadow">
              Export Excel
            </button>
        </div>

        {/* Table */}
      <div className="w-full bg-card border shadow-lg rounded-full-lg overflow-x-auto rounded-xl mt-4">
        <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-muted text-left text-sm font-bold">
                <th className="py-4 px-2">SN</th>
                <th className="py-4 px-2">Name</th>
                <th className="py-4 px-2">ID</th>
                <th className="py-4 px-2">Credit</th>
                <th className="py-4 px-2">Debit</th>
                <th className="py-4 px-2">Balance</th>
                <th className="py-4 px-2">Date</th>
                <th className="py-4 px-2">Staus</th>
                <th className="py-4 px-2">Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredShares.length > 0 ? (
                filteredShares.map((share, idx) => (
                  <tr key={share.id} className="border-b last:border-none">
                    <td className="py-4 px-2">{idx + 1}</td>
                    <td className="py-4 px-2">
                      {share?.user ? (
                        <Link to={`/admin/users/profile/${share.user.id}`}
                          className="text-blue-600 underline hover:text-foreground font-semibold">
                          {share.user.firstName} {share.user.lastName}
                        </Link>
                      ) : ("N/A")}
                    </td>
                    <td className="py-4 px-2">{share.user?.ledgerID ?? "N/A"}</td>
                    <td className="py-4 px-2">{share.type === "credit" ? `₦${share.amount?.toLocaleString()}` : "-"}</td>
                    <td className="py-4 px-2">{share.type === "debit" ? `₦${share.amount?.toLocaleString()}` : "-"}</td>
                    <td className="py-4 px-2">₦{share.balance?.toLocaleString()}</td>
                    <td className="py-4 px-2">
                      {new Date(share.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-4 px-2">{share.status}</td>
                    <td className="py-4 px-2">{share.remark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted-foreground py-4">
                    No shares found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Shares;
