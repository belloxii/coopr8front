import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { mySavings } from '../../../Store/Saving/Action';
import { myRepays } from '../../../Store/Repay/Action';
import { getUserById } from '../../../Store/User/Action';
import UserPhoto from '../../../Utils/UserPhoto';
import BackButton from '../../Navigation/BackButton';
import { useOrganization } from '../../../Utils/useOrganization';

const Profile = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { user } = useSelector(store => store);

  // A member belongs to a cooperative, so the profile names it.
  const { name: orgName, isLoaded: orgLoaded } = useOrganization();

  const [openEditProfile, setOpenEditProfile] = useState(false);
  const userData = user?.findUser;

  useEffect(() => {
    if (userId) {
      dispatch(mySavings(userId));
      dispatch(myRepays(userId));
      dispatch(getUserById(userId));
    }
  }, [dispatch, userId]);

  console.log("userId: ", userId)
  console.log("user: ", user)
  console.log("userData: ", userData)

  return (
    <div className="text-left bg-card z-40 m-3">
      <BackButton />
      <div className="p-3 lg:p-9 border rounded-xl shadow-xl bg-card">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-5">
            <UserPhoto
              src={userData?.passport}
              name={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
              size={128}
              ring
            />
            <div>
              <h1 className="font-bold text-2xl">{`${userData?.firstName || ''} ${userData?.middleName || ''} ${userData?.lastName || ''}`}</h1>
              {orgLoaded && (
                <p className="text-sm text-muted-foreground">Member of {orgName}</p>
              )}
              <p className="text-muted-foreground">@{userData?.username}</p>
              <p className="text-sm text-green-600 font-semibold">{userData?.status}</p>
            </div>
          </div>
          <Button
            sx={{ borderRadius: "20px", textTransform: "none" }}
            variant="contained" disabled
            onClick={() => setOpenEditProfile(true)}
          >
            Edit Profile
          </Button>
        </div>

        {/* User Details */}
        <div className="grid md:grid-cols-2 gap-6 mt-5 text-foreground p-9">
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

        {/* Edit Modal */}
        <EditProfileModal handleClose={() => setOpenEditProfile(false)} open={openEditProfile} />
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

export default Profile;
