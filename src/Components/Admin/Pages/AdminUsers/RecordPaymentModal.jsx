import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminPostSaving,
  adminPostRepay,
  findLoansByUserId,
  getAllUsers,
} from "../../../../Store/Admin/Action";

/**
 * Admin records a payment a SELF_PAY member made by bank transfer (they
 * transferred, then notified the admin). Posts a single saving or repayment
 * against the member with channel TRANSFER on the backend.
 *
 * For repayments, the admin may target a specific approved loan; when left on
 * "Spread across approved loans" the backend applies it oldest-first and caps
 * at the outstanding balance.
 */
const ACTIVE_LOAN_STATUSES = ["approved", "active"];

const RecordPaymentModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const { loans } = useSelector((store) => store.admin);

  const [type, setType] = useState("saving"); // saving | repayment
  const [amount, setAmount] = useState("");
  const [loanId, setLoanId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the member's loans so repayments can target a specific one.
  useEffect(() => {
    if (open && user?.id) {
      dispatch(findLoansByUserId(user.id));
    }
  }, [open, user?.id, dispatch]);

  // Reset the form each time the modal is opened for a (new) member.
  useEffect(() => {
    if (open) {
      setType("saving");
      setAmount("");
      setLoanId("");
      setNote("");
      setError("");
      setSuccess("");
      setLoading(false);
    }
  }, [open, user?.id]);

  const approvedLoans = useMemo(
    () =>
      (loans || []).filter((l) =>
        ACTIVE_LOAN_STATUSES.includes(l.status?.toLowerCase())
      ),
    [loans]
  );

  if (!open) return null;

  const memberName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    const payload = {
      userId: user.id,
      amount: value,
      note: note.trim() || undefined,
    };

    setLoading(true);
    try {
      if (type === "saving") {
        await dispatch(adminPostSaving(payload));
        setSuccess(`₦${value.toLocaleString()} saving recorded for ${memberName}.`);
      } else {
        if (loanId) payload.loanId = Number(loanId);
        const applied = await dispatch(adminPostRepay(payload));
        const appliedAmt = applied?.applied ?? applied?.amount ?? value;
        setSuccess(
          `₦${Number(appliedAmt).toLocaleString()} repayment recorded for ${memberName}.`
        );
      }
      // Refresh member balances shown in the list.
      dispatch(getAllUsers());
      setAmount("");
      setNote("");
      setLoanId("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "The payment could not be recorded."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card text-foreground rounded-3xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold">Record payment</h3>
            <p className="text-sm text-muted-foreground">
              {memberName || "Member"}
              {user?.ledgerID ? ` · ${user.ledgerID}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="mb-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Use this to record a bank transfer a member notified you about. It is
          posted with channel <span className="font-semibold">TRANSFER</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment type */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Type</label>
            <div className="flex gap-2">
              {[
                { key: "saving", label: "Saving" },
                { key: "repayment", label: "Loan repayment" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setType(opt.key)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    type === opt.key
                      ? "bg-green-600 text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Amount (₦)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"
              autoFocus
            />
          </div>

          {/* Loan target (repayment only) */}
          {type === "repayment" && (
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Apply to loan
              </label>
              <select
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                className="w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"
              >
                <option value="">Spread across approved loans (oldest first)</option>
                {approvedLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.type || "Loan"} #{l.id} — balance ₦
                    {(l.balance || 0).toLocaleString()}
                  </option>
                ))}
              </select>
              {approvedLoans.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  This member has no approved loans — a repayment will be rejected.
                </p>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. transfer ref / teller number"
              className="w-full rounded-xl border-0 bg-input px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-green-600/50"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-green-50 dark:bg-green-950/40 p-3 text-sm text-green-700 dark:text-green-300">
              {success}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-muted px-5 py-2 font-semibold text-foreground hover:opacity-90"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-green-600 px-5 py-2 font-semibold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Recording…" : "Record payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
