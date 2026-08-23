import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mySavings } from "../../../Store/Saving/Action";
import { myRepays } from "../../../Store/Repay/Action";
import OverviewCard from "../../../Utils/OverviewCard";
import { myShares } from "../../../Store/Shares/Action";
import GuarantorRequests from "./GuarantorRequests";
import { useOrganization } from "../../../Utils/useOrganization";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { auth, saving, repay, shares } = useSelector((store) => store);
  const user = auth?.user?.user;

  // The dashboard is a tenant surface: it names the member's own cooperative.
  const { name: orgName, isLoaded: orgLoaded } = useOrganization();

  useEffect(() => {
    if (user?.id) {
      dispatch(mySavings());
      dispatch(myRepays());
      dispatch(myShares());
    }
  }, [dispatch, user?.id]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getRecentEntries = (entries) =>
    [...(entries || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

  const renderTableSection = (title, data, balanceLabel = "Balance") => (
    <div className="mt-5">
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <div className="w-full bg-card border shadow rounded-2xl overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-muted text-foreground">
              <th className="p-3 font-semibold">Date</th>
              <th className="p-3 font-semibold">Amount</th>
              <th className="p-3 font-semibold">Transaction ID</th>
              <th className="p-3 font-semibold">{balanceLabel}</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-muted-foreground">
                  No {title.toLowerCase()} found
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{formatDate(item.createdAt)}</td>
                  <td className="p-3">₦{item.amount?.toLocaleString()}</td>
                  <td className="p-3">{item.txnId || "-"}</td>
                  <td className="p-3">
                    ₦{item.balance?.toLocaleString() || "-"}
                  </td>
                  <td className="p-3 capitalize">
                    {item.status || "submitted"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const savingsTotal = saving?.savings?.reduce((acc, s) => acc + s.amount, 0);
  const repayTotal = repay?.repays?.reduce((acc, r) => acc + r.amount, 0);
  const sharesTotal = shares?.myShares?.reduce((acc, sh) => acc + sh.amount, 0);

  const overviewItems = [
    { label: "Total Savings", value: `₦${savingsTotal?.toLocaleString() || 0}`, nav: "/savings"  },
    { label: "Loan Balance", value: `₦${repayTotal?.toLocaleString() || 0}`, nav: "/loans" },
    { label: "Total Purchase", value: `₦${user?.totalPurchase}`, nav: "/purchase" },
    { label: "Shares Balance", value: `₦${sharesTotal?.toLocaleString() || 0}`, nav: "/shares" },
  ];

  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        <h1 className="text-3xl font-bold text-foreground mb-3">Dashboard</h1>
        <p className="text-2xl text-center font-semibold text-muted-foreground">
          Welcome,{" "}
          {`${user?.firstName || ""} ${user?.middleName || ""} ${
            user?.lastName || ""
          }`}
        </p>
        {/* Which cooperative the member is signed in to */}
        {orgLoaded && (
          <p className="text-center text-sm text-muted-foreground mb-2">{orgName}</p>
        )}

        <OverviewCard title="" items={overviewItems} />

        <GuarantorRequests/>

        {renderTableSection(
          "Recent Savings",
          getRecentEntries(saving?.savings),
          "Savings Balance"
        )}
        {renderTableSection(
          "Recent Repayments",
          getRecentEntries(repay?.repays),
          "Loan Balance"
        )}
      </div>
    </div>
  );
};

export default Dashboard;
