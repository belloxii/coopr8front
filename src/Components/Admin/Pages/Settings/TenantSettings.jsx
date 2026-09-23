import { Alert, Box, Button, CircularProgress, FormControlLabel, Switch, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../../../../config/api";

/** Tenant-owned security-adjacent onboarding policy. It never changes existing members. */
export default function TenantSettings() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/api/admin/config/membership")
      .then(({ data }) => setConfig(data))
      .catch(() => setMessage("Could not load membership settings."));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.put("/api/admin/config/membership", {
        requireEmail: config.requireEmail,
        requirePhone: config.requirePhone,
        requirePsn: config.requirePsn,
        requirePassport: config.requirePassport,
        requireNextOfKin: config.requireNextOfKin,
        autoActivateMembers: config.autoActivateMembers,
        requireInitialPasswordChange: config.requireInitialPasswordChange,
        defaultMemberStatus: config.defaultMemberStatus,
        reason: "Updated initial-password policy",
      });
      setConfig(data);
      setMessage("Saved. The policy applies to newly created members only.");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Could not save membership settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <Box p={3}>{message || <CircularProgress />}</Box>;

  return (
    <Box maxWidth={720} p={3}>
      <Typography variant="h5" gutterBottom>Membership settings</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Control onboarding rules for this cooperative. Platform password strength and session security remain centrally enforced.
      </Typography>
      <FormControlLabel
        control={<Switch checked={Boolean(config.requireInitialPasswordChange)}
          onChange={(event) => setConfig({ ...config, requireInitialPasswordChange: event.target.checked })} />}
        label="Force new members to change their temporary password at first sign-in"
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Off by default. Changing this does not interrupt existing members or invalidate their sessions.
      </Typography>
      {message && <Alert severity={message.startsWith("Saved") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}
      <Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
    </Box>
  );
}
