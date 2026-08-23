import { useEffect, useState } from 'react';
import { Button, MenuItem, Select } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import EditProfileModal from './EditProfileModal';
import UserPhoto from '../../../../../Utils/UserPhoto';
import BackButton from '../../../../Navigation/BackButton';
import { findLoansByUserId, findRepaysByUserId, findSavingsByUserId, findSharesByUserId, findUserById } from '../../../../../Store/Admin/Action';

const AdminProfile = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const navigate = useNavigate();

  const { findUser, savings, loans, repays } = useSelector((store) => store.admin);
  const { userShares } = useSelector((store) => store.shares);
  const userData = findUser;

  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [loanStatusFilter, setLoanStatusFilter] = useState('');
  const [repayTypeFilter, setRepayTypeFilter] = useState('');

  const loanTypeMap = {
    realLoans: 'real',
    softLoans: 'soft',
    materialLoans: 'material',
  };

  useEffect(() => {
    if (userId) {
      dispatch(findUserById(userId));
      dispatch(findSavingsByUserId(userId));
      dispatch(findRepaysByUserId(userId));
      dispatch(findLoansByUserId(userId));
      dispatch(findSharesByUserId(userId));
    }
  }, [dispatch, userId]);

  const tabLabels = [
    { key: 'details', label: 'User Details' },
    { key: 'savings', label: `Savings (${savings?.length || 0})` },
    { key: 'realLoans', label: `Real Loans (${loans?.filter(l => l.type === 'real').length || 0})` },
    { key: 'softLoans', label: `Soft Loans (${loans?.filter(l => l.type === 'soft').length || 0})` },
    { key: 'materialLoans', label: `Material Loans (${loans?.filter(l => l.type === 'material').length || 0})` },
    { key: 'loanRequests', label: `Loan Requests (${loans?.filter(l => l.status === 'submitted').length || 0})` },
    { key: 'repays', label: `Repays (${repays?.length || 0})` },
    { key: 'shares', label: `Shares (${userShares?.length || 0})` },
  ];

  const headers = {
    savings: ['SN', 'Amount', 'Balance', 'Date', 'Status'],
    realLoans: ['SN', 'Amount', 'Balance', 'Date', 'Status'],
    softLoans: ['SN', 'Amount', 'Balance', 'Date', 'Status'],
    materialLoans: ['SN', 'Amount', 'Balance', 'Date', 'Status'],
    loanRequests: ['SN', 'Amount', 'Type', 'Balance', 'Date', 'Status'],
    repays: ['SN', 'Parent Loan Amount', 'Repay Amount', 'Balance', 'Date', 'Status'],
    shares: ['SN', 'Type', 'Amount', 'Balance', 'Date', 'Status'],
  };

  const getActiveData = () => {
    if (activeTab === 'savings') {
      return [...(savings || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (activeTab === 'repays') {
      let data = [...(repays || [])];
      if (repayTypeFilter) {
        data = data.filter(r => r.loanType?.toLowerCase() === repayTypeFilter.toLowerCase());
      }
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (activeTab === 'shares') {
      return [...(userShares || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (activeTab === 'loanRequests') {
      return (loans || [])
        .filter(l => l.status?.toLowerCase() === 'submitted')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (activeTab in loanTypeMap) {
      let data = (loans || []).filter(l => l.type === loanTypeMap[activeTab]);
      if (loanStatusFilter) {
        data = data.filter(l => l.status?.toLowerCase() === loanStatusFilter.toLowerCase());
      }
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return [];
  };

  const renderCell = (item, key) => {
    switch (key) {
      case 'Amount': return `₦${item.amount?.toLocaleString() || 0}`;
      case 'Balance': return `₦${item.balance?.toLocaleString() || 0}`;
      case 'Parent Loan Amount': return `₦${item.parentLoan?.amount?.toLocaleString() || 0}`;
      case 'Repay Amount': return `₦${item.amount?.toLocaleString() || 0}`;
      case 'Balance After': return `₦${item.balance?.toLocaleString() || 0}`;
      case 'Date': return item.createdAt ? format(new Date(item.createdAt), 'do MMM yyyy') : '-';
      case 'Status': return item.status || '-';
      case 'Type': return item.type === 'credit' ? 'Credit' : 'Debit';
      default: return '-';
    }
  };

  return (
    <div className="text-left bg-card z-40 m-3">
      <BackButton />
      <div className="p-3 border rounded-xl shadow-xl bg-card">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-5">
            <UserPhoto
              src={userData?.passport}
              name={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
              size={128}
              ring
            />
            <div>
              <h1 className="font-bold text-2xl">
                {`${userData?.firstName || ''} ${userData?.middleName || ''} ${userData?.lastName || ''}`}
              </h1>
              <p className="text-muted-foreground">@{userData?.username}</p>
              <p className="text-sm text-green-600 font-semibold">{userData?.status}</p>
            </div>
          </div>
          <Button
            sx={{ borderRadius: "20px", textTransform: "none", backgroundColor: "#ef4444", '&:hover': { backgroundColor: "#dc2626" } }}
            variant="contained"
            onClick={() => setOpenEditProfile(true)}
          >
            Edit Profile
          </Button>
        </div>

        <div className="flex justify-between flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabLabels.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold ${
                  activeTab === key ? 'bg-red-500 text-white' : 'bg-muted text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {(activeTab in loanTypeMap || activeTab === 'repays') && (
            <div className="flex items-center gap-4">
              {activeTab in loanTypeMap && (
                <Select
                  value={loanStatusFilter}
                  onChange={(e) => setLoanStatusFilter(e.target.value)}
                  displayEmpty
                  className="w-60 h-10"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                </Select>
              )}
              {activeTab === 'repays' && (
                <Select
                  value={repayTypeFilter}
                  onChange={(e) => setRepayTypeFilter(e.target.value)}
                  displayEmpty
                  className="w-60 h-10"
                >
                  <MenuItem value="">All Loan Types</MenuItem>
                  <MenuItem value="real">Real</MenuItem>
                  <MenuItem value="soft">Soft</MenuItem>
                  <MenuItem value="material">Material</MenuItem>
                </Select>
              )}
            </div>
          )}
        </div>

        {activeTab === 'details' ? (
          <div className="grid md:grid-cols-2 gap-6 mt-6 text-foreground px-9">
            <Detail label="Ledger ID" value={userData?.ledgerID} />
            <Detail label="Full Name" value={`${userData?.firstName || ''} ${userData?.middleName || ''} ${userData?.lastName || ''}`} />
            <Detail label="Email" value={userData?.email} />
            <Detail label="Phone" value={userData?.phone} />
            <Detail label="Gender" value={userData?.gender} />
            <Detail label="Marital Status" value={userData?.marital} />
            <Detail label="Address" value={userData?.address} />
            <Detail label="State" value={userData?.state} />
            <Detail label="LGA" value={userData?.lga} />
            <Detail label="Station" value={userData?.station} />
            <Detail label="Role" value={userData?.role} />
            <Detail label="Savings Balance" value={`₦${(userData?.savingsBalance || 0).toLocaleString()}`} />
            <Detail label="Loan Balance" value={`₦${(userData?.loanBalance || 0).toLocaleString()}`} />
            <Detail label="Shares Balance" value={`₦${(userData?.sharesBalance || 0).toLocaleString()}`} />
            <Detail label="Saving Plan" value={`₦${(userData?.savingPlan || 0).toLocaleString()}`} />
            <Detail label="Special Saving Plan" value={`₦${(userData?.specialSavingPlan || 0).toLocaleString()}`} />
            <Detail label="Share Plan" value={`₦${(userData?.sharePlan || 0).toLocaleString()}`} />
            <Detail label="PSN" value={userData?.psn} />
            <Detail label="Occupation" value={userData?.occupation} />
            <Detail label="Account Created" value={userData?.createdAt ? format(new Date(userData?.createdAt), 'do MMMM, yyyy') : ''} />
          </div>
        ) : (
          <div className="w-full bg-card border shadow-lg rounded-lg overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-muted border-b">
                  {headers[activeTab].map((h) => (
                    <th key={h} className="py-4 px-4 font-bold text-muted-foreground text-lg">{h}</th>
                  ))}
                  {['realLoans', 'softLoans', 'materialLoans', 'loanRequests'].includes(activeTab) && (
                    <th className="py-4 px-4 font-bold text-muted-foreground text-lg">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {getActiveData().length > 0 ? (
                  getActiveData().map((item, idx) => (
                    <tr key={item._id || idx} className="border-b last:border-none">
                      {headers[activeTab].map((header, i) => (
                        <td key={i} className="py-3 px-4 text-foreground">
                          {header === 'SN' ? idx + 1 : renderCell(item, header)}
                        </td>
                      ))}
                      {['realLoans', 'softLoans', 'materialLoans', 'loanRequests'].includes(activeTab) && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/admin/loans/${item.id}`)}
                            className="bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600"
                          >
                            View
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers[activeTab].length} className="py-4 px-4 text-center text-muted-foreground">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <EditProfileModal open={openEditProfile} handleClose={() => setOpenEditProfile(false)} userId={userId} />
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-base font-medium">{value || '-'}</p>
  </div>
);

export default AdminProfile;
