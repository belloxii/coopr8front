import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import UserPhoto from "../../../../Utils/UserPhoto";
import RecordPaymentModal from "./RecordPaymentModal";

const UserTable = ({ users, onActivate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [payUser, setPayUser] = useState(null);

  const filteredUsers = () => {
    const term = searchTerm.toLowerCase().trim();

    const isPending = (u) => ["new", "pending"].includes(u.status?.toLowerCase());

    const byTab =
      activeTab === "new"
        ? users.filter(isPending)
        : activeTab === "admin"
        ? users.filter((u) => u.role?.toLowerCase().includes("admin"))
        : users;

    return byTab.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        user.ledgerID?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  };

  const tabLabels = [
    { key: "all", label: `All Users (${users.length})` },
    { key: "new", label: `Pending Approval (${users.filter((u) => ["new", "pending"].includes(u.status?.toLowerCase())).length})` },
    { key: "admin", label: `Administrators (${users.filter((u) => u.role?.toLowerCase().includes("admin")).length})` },
    
  ];

  return (
    <div>
      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:max-w-md">
          <SearchIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border-0 rounded-full bg-input text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tabLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`text-sm -skew-y-6 sm:text-base p-3 sm:px-4 rounded-full font-semibold shadow transition ${
                activeTab === key ? "bg-red-500 text-white" : "bg-muted text-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-card border shadow-lg rounded-full-lg overflow-x-auto rounded-xl">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-muted border-b">
              <th className="py-4 px-2 font-bold text-muted-foreground">SN</th>
              <th className="py-4 px-2 font-bold text-muted-foreground">Avatar</th>
              {["Ledger ID", "Full Name", "Join Date", "Savings", "Loan"].map((h) => (
                <th key={h} className="py-4 px-2 font-bold text-muted-foreground">{h}</th>
              ))}
              {activeTab === "all" && (
                <th className="py-4 px-2 font-bold text-muted-foreground">Status</th>
              )}
              <th className="py-4 px-2 font-bold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers().length > 0 ? (
              filteredUsers()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((user, index) => (
                  <tr key={user.id || index} className="">
                    <td className="py-4 px-2 text-foreground font-medium">{index + 1}</td>
                    <td className="py-4 px-2">
                      <UserPhoto
                        src={user.passport}
                        name={`${user.firstName || ""} ${user.lastName || ""}`}
                        size={40}
                      />
                    </td>
                    <td className="py-4 px-2 text-foreground font-medium">{user.ledgerID || user.id}</td>
                    <td className="py-4 px-2 text-foreground">{user.firstName} {user.lastName}</td>
                    <td className="py-4 px-2 text-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-2 text-foreground">₦{(user.savingsBalance || 0).toLocaleString()}</td>
                    <td className="py-4 px-2 text-foreground">₦{(user.loanBalance || 0).toLocaleString()}</td>
                    {activeTab === "all" && (
                      <td className="py-4 px-2 text-foreground capitalize">{user.status || "N/A"}</td>
                    )}
                    <td className="py-4 px-2 text-foreground space-x-2">
                      {["new", "pending"].includes(user.status?.toLowerCase()) && activeTab === "new" && (
                        <button
                          onClick={() => onActivate(user)}
                          className="px-4 py-1 bg-green-500 text-white rounded-full hover:bg-green-400 text-sm"
                        >
                          Activate
                        </button>
                      )}
                      {!["new", "pending"].includes(user.status?.toLowerCase()) && (
                        <button
                          onClick={() => setPayUser(user)}
                          className="px-4 py-1 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 text-sm"
                        >
                          Record payment
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/admin/users/profile/${user.id}`)}
                        className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-400 text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={activeTab === "all" ? 9 : 8} className="py-4 px-2 text-center text-muted-foreground">
                  No users found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RecordPaymentModal
        open={!!payUser}
        user={payUser}
        onClose={() => setPayUser(null)}
      />
    </div>
  );
};

export default UserTable;
