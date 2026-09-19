import React, { useEffect, useState, useMemo } from "react";
import { platformApi } from "../../config/platformApi";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

export default function PlatformOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expiringIn30Days, setExpiringIn30Days] = useState(false);

  // Modals state
  const [activeOrg, setActiveOrg] = useState(null);
  const [actionType, setActionType] = useState(null); // 'activate' | 'changePlan' | 'overrides' | null
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Modal form fields
  const [activationEndsAt, setActivationEndsAt] = useState("");
  const [activationPrice, setActivationPrice] = useState("");

  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [changePlanPrice, setChangePlanPrice] = useState("");
  const [changePlanEndsAt, setChangePlanEndsAt] = useState("");

  const [aiOverride, setAiOverride] = useState("inherit"); // 'inherit' | 'true' | 'false'
  const [ecomOverride, setEcomOverride] = useState("inherit"); // 'inherit' | 'true' | 'false'

  const loadOrganizations = async () => {
    setLoading(true);
    setError("");
    try {
      const [orgsRes, plansRes] = await Promise.all([
        platformApi.get(`/api/platform/organizations?expiringIn30Days=${expiringIn30Days}`),
        platformApi.get("/api/platform/plans"),
      ]);
      setOrganizations(orgsRes.data || []);
      setPlans(plansRes.data || []);
    } catch (err) {
      setError("Failed to load organizations. Please ensure you are authenticated.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [expiringIn30Days]);

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const q = searchTerm.toLowerCase();
      return (
        org.name?.toLowerCase().includes(q) ||
        org.slug?.toLowerCase().includes(q) ||
        org.ledgerPrefix?.toLowerCase().includes(q) ||
        org.planCode?.toLowerCase().includes(q)
      );
    });
  }, [organizations, searchTerm]);

  // Activate handler
  const handleOpenActivate = (org) => {
    setActiveOrg(org);
    setActionType("activate");
    setActionError("");
    // Default +1 year date in YYYY-MM-DD format
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setActivationEndsAt(d.toISOString().slice(0, 16));
    setActivationPrice(org.agreedPrice || "");
  };

  const submitActivate = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const payload = {};
      if (activationEndsAt) payload.subscriptionEndsAt = activationEndsAt;
      if (activationPrice) payload.agreedPrice = Number(activationPrice);

      await platformApi.post(`/api/platform/organizations/${activeOrg.id}/activate`, payload);
      setActionType(null);
      loadOrganizations();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data || "Activation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Suspend / Reactivate handler
  const handleToggleSuspend = async (org) => {
    const isSuspending = org.status === "ACTIVE";
    const endpoint = isSuspending ? "suspend" : "reactivate";
    const actionLabel = isSuspending ? "Suspend" : "Reactivate";

    if (!window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} "${org.name}"?`)) {
      return;
    }

    try {
      await platformApi.post(`/api/platform/organizations/${org.id}/${endpoint}`);
      loadOrganizations();
    } catch (err) {
      alert(`Failed to ${actionLabel.toLowerCase()} organization.`);
    }
  };

  // Change Plan handler
  const handleOpenChangePlan = (org) => {
    setActiveOrg(org);
    setActionType("changePlan");
    setActionError("");
    setSelectedPlanCode(org.planCode || "STARTER");
    setChangePlanPrice(org.agreedPrice || "");
    setChangePlanEndsAt(org.subscriptionEndsAt ? org.subscriptionEndsAt.slice(0, 16) : "");
  };

  const submitChangePlan = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const payload = { planCode: selectedPlanCode };
      if (changePlanPrice) payload.agreedPrice = Number(changePlanPrice);
      if (changePlanEndsAt) payload.subscriptionEndsAt = changePlanEndsAt;

      await platformApi.post(`/api/platform/organizations/${activeOrg.id}/change-plan`, payload);
      setActionType(null);
      loadOrganizations();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data || "Failed to change plan.");
    } finally {
      setActionLoading(false);
    }
  };

  // Overrides handler
  const handleOpenOverrides = (org) => {
    setActiveOrg(org);
    setActionType("overrides");
    setActionError("");
    setAiOverride(
      org.aiScanningOverride === true
        ? "true"
        : org.aiScanningOverride === false
        ? "false"
        : "inherit"
    );
    setEcomOverride(
      org.ecommerceOverride === true
        ? "true"
        : org.ecommerceOverride === false
        ? "false"
        : "inherit"
    );
  };

  const submitOverrides = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const payload = {
        aiScanningOverride: aiOverride === "inherit" ? null : aiOverride === "true",
        ecommerceOverride: ecomOverride === "inherit" ? null : ecomOverride === "true",
      };

      await platformApi.put(`/api/platform/organizations/${activeOrg.id}/overrides`, payload);
      setActionType(null);
      loadOrganizations();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data || "Failed to update overrides.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatNaira = (val) => {
    if (val === null || val === undefined) return "—";
    return `₦${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cooperative Organizations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Tenant provisioning, lifecycle activation, subscription tiers, and entitlement controls.
          </p>
        </div>

        <button
          onClick={loadOrganizations}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Filter & Controls bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fontSize="small" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, slug, ledger prefix…"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <label className="flex items-center space-x-2.5 cursor-pointer text-sm text-slate-300 select-none">
          <input
            type="checkbox"
            checked={expiringIn30Days}
            onChange={(e) => setExpiringIn30Days(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900"
          />
          <span className="flex items-center space-x-1.5">
            <WarningAmberIcon className="text-amber-400" fontSize="small" />
            <span>Expiring within 30 days</span>
          </span>
        </label>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center space-y-3">
          <CircularProgress color="inherit" size={32} />
          <span>Loading platform cooperatives…</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
          No organizations match the current filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Cooperative</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Agreed Price</th>
                <th className="px-5 py-3.5">Subscription</th>
                <th className="px-5 py-3.5">Members</th>
                <th className="px-5 py-3.5">Entitlements</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrgs.map((org) => {
                const isActive = org.status === "ACTIVE";
                const isPendingActivation = org.status === "PENDING_ACTIVATION";
                const isSuspended = org.status === "SUSPENDED";

                return (
                  <tr key={org.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{org.name}</div>
                      <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>/o/{org.slug}</span>
                        <span>•</span>
                        <span>Prefix: {org.ledgerPrefix || "—"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Active
                        </span>
                      )}
                      {isPendingActivation && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                          Pending Activation
                        </span>
                      )}
                      {isSuspended && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800">
                          Suspended
                        </span>
                      )}
                      {!isActive && !isPendingActivation && !isSuspended && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          {org.status}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-200">{org.planName || org.planCode}</div>
                      <div className="text-[11px] text-slate-500 uppercase">{org.planCode}</div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs">
                      {formatNaira(org.agreedPrice)}
                    </td>

                    <td className="px-5 py-4">
                      {org.complimentary ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950/80 text-blue-300 border border-blue-800">
                          Complimentary (Legacy)
                        </span>
                      ) : org.daysRemaining !== null ? (
                        <div>
                          <span
                            className={`text-xs font-semibold ${
                              org.daysRemaining <= 14
                                ? "text-red-400"
                                : org.daysRemaining <= 30
                                ? "text-amber-400"
                                : "text-slate-300"
                            }`}
                          >
                            {org.daysRemaining} days left
                          </span>
                          <div className="text-[11px] text-slate-500">
                            Ends: {org.subscriptionEndsAt ? new Date(org.subscriptionEndsAt).toLocaleDateString() : "—"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Not activated</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs font-mono">
                      {org.activeMemberCount || 0} active
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          title={`AI Form Scanning: ${org.effectiveAiScanning ? "Entitled" : "Not Entitled"}${
                            org.aiScanningOverride !== null ? " (Override)" : ""
                          }`}
                          className={`p-1 rounded-lg ${
                            org.effectiveAiScanning
                              ? "bg-purple-950 text-purple-400 border border-purple-800"
                              : "bg-slate-800/80 text-slate-600"
                          }`}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                        </span>
                        <span
                          title={`eCommerce: ${org.effectiveEcommerce ? "Entitled" : "Not Entitled"}${
                            org.ecommerceOverride !== null ? " (Override)" : ""
                          }`}
                          className={`p-1 rounded-lg ${
                            org.effectiveEcommerce
                              ? "bg-teal-950 text-teal-400 border border-teal-800"
                              : "bg-slate-800/80 text-slate-600"
                          }`}
                        >
                          <ShoppingBagOutlinedIcon sx={{ fontSize: 16 }} />
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        {isPendingActivation || !isActive ? (
                          <button
                            onClick={() => handleOpenActivate(org)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleSuspend(org)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-300 text-xs font-medium border border-slate-700 transition"
                          >
                            Suspend
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenChangePlan(org)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                        >
                          Plan
                        </button>

                        <button
                          onClick={() => handleOpenOverrides(org)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                        >
                          Overrides
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Activation Modal */}
      <Dialog
        open={actionType === "activate"}
        onClose={() => !actionLoading && setActionType(null)}
        PaperProps={{
          sx: {
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            borderRadius: "1.25rem",
            border: "1px solid #334155",
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #1e293b" }}>
          Activate Cooperative Account
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {actionError && (
            <div className="p-3 rounded-xl bg-red-950 text-red-300 text-xs border border-red-800">
              {actionError}
            </div>
          )}
          <p className="text-sm text-slate-300">
            You are activating <strong>{activeOrg?.name}</strong> (<code>{activeOrg?.slug}</code>).
          </p>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 leading-relaxed">
            Activation will set the status to <strong>ACTIVE</strong> and send an automated, branded activation
            email with their unique login portal link to the cooperative administrator.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Subscription Expiration Date
            </label>
            <input
              type="datetime-local"
              value={activationEndsAt}
              onChange={(e) => setActivationEndsAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Defaults to 1 year from today.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Agreed Annual Price (₦)
            </label>
            <input
              type="number"
              step="0.01"
              value={activationPrice}
              onChange={(e) => setActivationPrice(e.target.value)}
              placeholder="Leave blank to inherit plan price"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #1e293b" }}>
          <button
            onClick={() => setActionType(null)}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submitActivate}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow transition disabled:opacity-50"
          >
            {actionLoading ? "Activating…" : "Confirm & Activate"}
          </button>
        </DialogActions>
      </Dialog>

      {/* Change Plan Modal */}
      <Dialog
        open={actionType === "changePlan"}
        onClose={() => !actionLoading && setActionType(null)}
        PaperProps={{
          sx: {
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            borderRadius: "1.25rem",
            border: "1px solid #334155",
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #1e293b" }}>
          Change Subscription Plan
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {actionError && (
            <div className="p-3 rounded-xl bg-red-950 text-red-300 text-xs border border-red-800">
              {actionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Plan
            </label>
            <select
              value={selectedPlanCode}
              onChange={(e) => {
                const code = e.target.value;
                setSelectedPlanCode(code);
                const p = plans.find((item) => item.code === code);
                if (p) setChangePlanPrice(p.price);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {plans.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({p.code}) — {formatNaira(p.price)}/yr
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Agreed Annual Price (₦)
            </label>
            <input
              type="number"
              step="0.01"
              value={changePlanPrice}
              onChange={(e) => setChangePlanPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Subscription End Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={changePlanEndsAt}
              onChange={(e) => setChangePlanEndsAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Leave unchanged to keep current expiry.</span>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #1e293b" }}>
          <button
            onClick={() => setActionType(null)}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submitChangePlan}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow transition disabled:opacity-50"
          >
            {actionLoading ? "Updating…" : "Update Plan"}
          </button>
        </DialogActions>
      </Dialog>

      {/* Feature Overrides Modal */}
      <Dialog
        open={actionType === "overrides"}
        onClose={() => !actionLoading && setActionType(null)}
        PaperProps={{
          sx: {
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            borderRadius: "1.25rem",
            border: "1px solid #334155",
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #1e293b" }}>
          Feature Entitlement Overrides
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {actionError && (
            <div className="p-3 rounded-xl bg-red-950 text-red-300 text-xs border border-red-800">
              {actionError}
            </div>
          )}
          <p className="text-sm text-slate-300">
            Overrides supersede the plan flags for <strong>{activeOrg?.name}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              AI Form Scanning (Gemini Vision)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "inherit", label: "Inherit Plan" },
                { id: "true", label: "Force Enabled" },
                { id: "false", label: "Force Disabled" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAiOverride(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    aiOverride === opt.id
                      ? "bg-emerald-950 border-emerald-600 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              eCommerce & Product Marketplace
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "inherit", label: "Inherit Plan" },
                { id: "true", label: "Force Enabled" },
                { id: "false", label: "Force Disabled" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setEcomOverride(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    ecomOverride === opt.id
                      ? "bg-emerald-950 border-emerald-600 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #1e293b" }}>
          <button
            onClick={() => setActionType(null)}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submitOverrides}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow transition disabled:opacity-50"
          >
            {actionLoading ? "Saving…" : "Save Overrides"}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
