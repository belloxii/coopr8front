import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { activateUser, getAllUsers } from "../../../../Store/Admin/Action";

import UserTable from "./UserTable";
import OverviewCard from "../../../../Utils/OverviewCard";

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users = [] } = useSelector((state) => state.admin);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const countAll = users.length;
  const countNew = users.filter((u) => ["new", "pending"].includes(u.status?.toLowerCase())).length;
  const countAdmin = users.filter((u) => u.role?.toLowerCase().includes("admin")).length;


  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleConfirmActivate = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmActivation = () => {
    if (selectedUser) {
      dispatch(activateUser(selectedUser.id)).then(() => {
        dispatch(getAllUsers());
        setSelectedUser(null);
        setShowConfirmModal(false);
      });
    }
  };

  return (
    <div className="text-left bg-card z-40 m-3">
      <div className="p-3 border border-border rounded-xl shadow-xl bg-card">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <h1 className="text-3xl font-bold text-foreground">Members</h1>
          <button
            onClick={() => navigate("/admin/users/add-user")}
            className="py-2 px-4 bg-red-500 text-white text-lg rounded-full font-semibold hover:bg-red-700 transition"
          >
            Add User
          </button>
        </div>
        <div className="space-y-6 text-left">

        <OverviewCard className="max-w-3xl" title="Members' Overview"
            items={[{ label: "All Members", value: countAll },
              { label: "New Members", value: countNew },
              { label: "Administrators", value: countAdmin },]}/>

        <UserTable users={users} onActivate={handleConfirmActivate} />
        </div>
      </div>

      {/* Confirm Activation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Confirm Activation</h3>
            <p className="mb-6">
              Are you sure you want to activate {selectedUser?.firstName} {selectedUser?.lastName}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-muted rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={confirmActivation}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
