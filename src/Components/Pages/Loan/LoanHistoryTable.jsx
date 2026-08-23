import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const getStatusColor = (status) => {
  const lower = status?.toLowerCase();
  if (lower.includes("submitted")) return "text-yellow-600 bg-yellow-100 font-bold";
  if (lower.includes("approved")) return "text-blue-600 bg-blue-100 font-bold";
  if (lower.includes("completed")) return "text-green-600 bg-green-100 font-bold";
  if (lower.includes("declined")) return "text-red-600 bg-red-100 font-bold";
  return "text-muted-foreground";
};

const LoanTable = ({ loans = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeType = searchParams.get("type")?.toLowerCase();

  const filteredLoans = useMemo(() => {
    if (!activeType) return loans;
    return loans.filter((loan) => loan.type?.toLowerCase() === activeType);
  }, [loans, activeType]);


  return (
    <div className="w-full bg-card border shadow rounded-2xl overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-muted text-foreground">
            {['SN', 'Amount', 'Date', 'Type', 'Balance', 'Status', 'Action'].map((head, idx) => (
              <th key={idx} className="py-3 px-2 font-bold">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredLoans.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted-foreground py-6">
                No Loans Yet
              </td>
            </tr>
          ) : (
            filteredLoans.map((item, index) => (
              <tr key={item.id} className="border-b last:border-none text-foreground">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">₦{Number(item.amount).toLocaleString()}</td>
                <td className="py-3 px-4">
                  {new Date(item.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-3 px-4 capitalize">{item.type || 'N/A'}</td>
                <td className="py-3 px-4">₦{Number(item.balance || 0).toLocaleString()}</td>
                <td className={`py-3 px-4 ${getStatusColor(item.status)}`}>{item.status}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => navigate(`/loans/${item.id}`)}
                    className="bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const LoanHistoryTable = ({ loans = [] }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">Loan History</h2>
      <LoanTable loans={loans} />
    </div>
  );
};

export default LoanHistoryTable;
