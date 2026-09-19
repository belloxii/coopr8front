import React, { useEffect, useState } from "react";
import { platformApi } from "../../config/platformApi";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export default function PlatformPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Modal State
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    perUserPrice: "",
    includedUsers: "",
    aiScanningEnabled: false,
    ecommerceEnabled: false,
    active: true,
    sortOrder: 0,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Audit Log Modal State
  const [auditPlan, setAuditPlan] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await platformApi.get("/api/platform/plans");
      setPlans(res.data || []);
    } catch (err) {
      setError("Failed to load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setEditError("");
    setEditForm({
      name: plan.name || "",
      price: plan.price !== null ? plan.price : "",
      perUserPrice: plan.perUserPrice !== null ? plan.perUserPrice : "",
      includedUsers: plan.includedUsers !== null ? plan.includedUsers : "",
      aiScanningEnabled: Boolean(plan.aiScanningEnabled),
      ecommerceEnabled: Boolean(plan.ecommerceEnabled),
      active: Boolean(plan.active),
      sortOrder: plan.sortOrder || 0,
    });
  };

  const submitEditPlan = async (e) => {
    e.preventDefault();
    if (!editForm.name || editForm.price === "") {
      setEditError("Plan name and price are required.");
      return;
    }

    setEditLoading(true);
    setEditError("");
    try {
      const payload = {
        name: editForm.name.trim(),
        price: Number(editForm.price),
        perUserPrice: editForm.perUserPrice !== "" ? Number(editForm.perUserPrice) : null,
        includedUsers: editForm.includedUsers !== "" ? Number(editForm.includedUsers) : null,
        aiScanningEnabled: editForm.aiScanningEnabled,
        ecommerceEnabled: editForm.ecommerceEnabled,
        active: editForm.active,
        sortOrder: Number(editForm.sortOrder),
      };

      await platformApi.put(`/api/platform/plans/${editingPlan.id}`, payload);
      setEditingPlan(null);
      loadPlans();
    } catch (err) {
      setEditError(err.response?.data?.message || err.response?.data || "Failed to update plan.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenAudit = async (plan) => {
    setAuditPlan(plan);
    setAuditLoading(true);
    try {
      const res = await platformApi.get(`/api/platform/plans/${plan.id}/audit`);
      setAuditLogs(res.data || []);
    } catch (err) {
      alert("Failed to load audit logs for this plan.");
    } finally {
      setAuditLoading(false);
    }
  };

  const formatNaira = (val) => {
    if (val === null || val === undefined) return "—";
    return `₦${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Subscription Plans</h1>
          <p className="text-sm text-slate-400 mt-1">
            Commercial tiers, pricing models, feature gates, and append-only price change audit logs.
          </p>
        </div>

        <button
          onClick={loadPlans}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center space-y-3">
          <CircularProgress color="inherit" size={32} />
          <span>Loading subscription plans…</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-slate-900/60 p-6 flex flex-col justify-between shadow-xl transition hover:border-slate-700 ${
                plan.active ? "border-slate-800" : "border-slate-800/40 opacity-75"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      {plan.code}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">{plan.name}</h2>
                  </div>
                  {plan.active ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-2xl font-extrabold text-white font-mono">
                    {formatNaira(plan.price)}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">
                    per {plan.billingPeriod?.toLowerCase() || "year"}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Included Users:</span>
                    <span className="font-semibold text-slate-200">
                      {plan.includedUsers !== null ? `${plan.includedUsers} users` : "Unlimited"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Per-User Overage:</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {formatNaira(plan.perUserPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 items-center">
                    <span className="text-slate-400">AI Form Scanning:</span>
                    {plan.aiScanningEnabled ? (
                      <span className="flex items-center text-emerald-400 font-medium space-x-1">
                        <CheckIcon sx={{ fontSize: 16 }} />
                        <span>Enabled</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-slate-500 space-x-1">
                        <CloseIcon sx={{ fontSize: 16 }} />
                        <span>Disabled</span>
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between py-1 items-center">
                    <span className="text-slate-400">eCommerce Marketplace:</span>
                    {plan.ecommerceEnabled ? (
                      <span className="flex items-center text-teal-400 font-medium space-x-1">
                        <CheckIcon sx={{ fontSize: 16 }} />
                        <span>Enabled</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-slate-500 space-x-1">
                        <CloseIcon sx={{ fontSize: 16 }} />
                        <span>Disabled</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenAudit(plan)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1 border border-slate-700 transition"
                  title="View price audit trail"
                >
                  <HistoryIcon sx={{ fontSize: 16 }} />
                  <span>Audit Log</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1 shadow transition"
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                  <span>Edit Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog
        open={Boolean(editingPlan)}
        onClose={() => !editLoading && setEditingPlan(null)}
        PaperProps={{
          sx: {
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            borderRadius: "1.25rem",
            border: "1px solid #334155",
            maxWidth: "520px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #1e293b" }}>
          Edit {editingPlan?.name} ({editingPlan?.code})
        </DialogTitle>
        <form onSubmit={submitEditPlan}>
          <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {editError && (
              <div className="p-3 rounded-xl bg-red-950 text-red-300 text-xs border border-red-800">
                {editError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Plan Name
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Base Price (₦ / year)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Per-User Price (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.perUserPrice}
                  onChange={(e) => setEditForm({ ...editForm, perUserPrice: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Included Users
                </label>
                <input
                  type="number"
                  value={editForm.includedUsers}
                  onChange={(e) => setEditForm({ ...editForm, includedUsers: e.target.value })}
                  placeholder="Blank for unlimited"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={editForm.sortOrder}
                  onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.aiScanningEnabled}
                  onChange={(e) => setEditForm({ ...editForm, aiScanningEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">AI Form Scanning Enabled by default</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.ecommerceEnabled}
                  onChange={(e) => setEditForm({ ...editForm, ecommerceEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">eCommerce Marketplace Enabled by default</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Active (Visible in public catalog)</span>
              </label>
            </div>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: "1px solid #1e293b" }}>
            <button
              type="button"
              onClick={() => setEditingPlan(null)}
              disabled={editLoading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow transition disabled:opacity-50"
            >
              {editLoading ? "Saving…" : "Save Plan"}
            </button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Price Audit Log Dialog */}
      <Dialog
        open={Boolean(auditPlan)}
        onClose={() => setAuditPlan(null)}
        PaperProps={{
          sx: {
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            borderRadius: "1.25rem",
            border: "1px solid #334155",
            maxWidth: "600px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #1e293b" }}>
          Price Audit History — {auditPlan?.name} ({auditPlan?.code})
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {auditLoading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center space-y-2">
              <CircularProgress size={24} color="inherit" />
              <span className="text-xs">Loading audit records…</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              No price changes recorded for this plan yet.
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span>
                      Changed by Admin ID <strong>#{log.changedBy}</strong>
                    </span>
                    <span>{new Date(log.changedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-sm">
                    <span className="text-red-400 line-through">{formatNaira(log.oldPrice)}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400 font-bold">{formatNaira(log.newPrice)}</span>
                  </div>
                  {(log.oldPerUserPrice !== null || log.newPerUserPrice !== null) && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Per-user: {formatNaira(log.oldPerUserPrice)} → {formatNaira(log.newPerUserPrice)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #1e293b" }}>
          <button
            onClick={() => setAuditPlan(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
