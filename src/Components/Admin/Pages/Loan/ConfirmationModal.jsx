// components/ConfirmationModal.jsx
const ConfirmationModal = ({
  visible,
  actionType, // "approve" | "reject"
  reason = '',
  loading,
  onChangeReason,
  onConfirm,
  onClose,
}) => {
  if (!visible) return null;

  const isReject = actionType === 'reject';
  const title = isReject
    ? 'Provide a reason for rejection'
    : 'Are you sure you want to approve this loan?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-card p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {isReject && (
          <textarea
            value={reason}
            onChange={onChangeReason}
            className="w-full p-2 border rounded"
            placeholder="Reason"
          />
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : isReject
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {loading ? (isReject ? 'Rejecting...' : 'Approving...') : isReject ? 'Reject Loan' : 'Yes, Approve'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
