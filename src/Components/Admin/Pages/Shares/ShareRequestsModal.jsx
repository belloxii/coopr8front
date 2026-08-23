import { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

const ShareRequestsModal = ({ allShare, handleApprove, handleReject }) => {
  const [open, setOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [removedIds, setRemovedIds] = useState([]);

  const shareRequests = allShare.filter(
    (s) =>
      s.type === "debit" &&
      s.status === "submitted" &&
      !removedIds.includes(s.id)
  );

  const closeModal = () => setOpen(false);
  const closeReasonModal = () => {
    setReasonModalOpen(false);
    setDeclineReason("");
    setSelectedId(null);
  };

  const closeApproveModal = () => {
    setApproveModalOpen(false);
    setSelectedId(null);
  };

  const confirmApprove = (id) => {
    setSelectedId(id);
    setApproveModalOpen(true);
  };

  const submitApprove = () => {
    handleApprove(selectedId);
    setRemovedIds((prev) => [...prev, selectedId]);
    closeApproveModal();
  };

  const confirmReject = (id) => {
    setSelectedId(id);
    setReasonModalOpen(true);
  };

  const submitDecline = () => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for decline.");
      return;
    }
    handleReject(selectedId, declineReason);
    setRemovedIds((prev) => [...prev, selectedId]);
    closeReasonModal();
  };

  return (
    <>
        <button
          className="p-3 font-semibold bg-blue-500 hover:bg-blue-400 rounded-full text-white"
          onClick={() => setOpen(true)}>
          Click to Approve or Reject
        </button>

      {/* Approval Modal */}
      <Modal open={open} onClose={closeModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Share Withdrawal Requests</h2>
            <IconButton onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </div>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-muted text-left">
                <th className="px-3 py-2">S/N</th>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shareRequests.map((share, index) => (
                <tr key={share.id} className="text-sm text-foreground border-t">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">
                    {`${share.user?.firstName ?? ""} ${share.user?.lastName ?? ""}` || "N/A"}
                  </td>
                  <td className="px-3 py-2">{share.user?.ledgerID || "N/A"}</td>
                  <td className="px-3 py-2">₦{share.amount.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    {new Date(share.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">{share.status}</td>
                  <td className="px-3 py-2 space-x-2">
                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      onClick={() => confirmApprove(share.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      onClick={() => confirmReject(share.id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
              {shareRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No withdrawal requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Modal>

      {/* Decline Reason Modal */}
      <Modal open={reasonModalOpen} onClose={closeReasonModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Reason for Decline</h2>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              variant="outlined"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button onClick={submitDecline} color="error" variant="contained">
                Submit
              </Button>
              <Button onClick={closeReasonModal} variant="outlined">
                Cancel
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal open={approveModalOpen} onClose={closeApproveModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <h2 className="text-lg font-bold mb-4">Confirm Approval</h2>
          <p>Are you sure you want to approve this withdrawal request?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={submitApprove} color="success" variant="contained">
              Yes, Approve
            </Button>
            <Button onClick={closeApproveModal} variant="outlined">
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default ShareRequestsModal;
