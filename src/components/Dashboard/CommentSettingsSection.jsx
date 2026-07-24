import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import { apiClient } from "../../api/client";

/**
 * CommentSettingsSection
 *
 * Inline (sidebar) control for who may comment on this website's blog articles.
 * Rendered inside the BLOG_ARTICLE block editor. Comment settings are stored at
 * the website level (not in block content), so this reads/writes the dedicated
 * `/api/websites/:id/comment-settings` endpoint rather than the block payload.
 */

const MODE_OPTIONS = [
  { value: "AUTH_ONLY", label: "Signed-in visitors only" },
  { value: "GUEST_EMAIL_REQUIRED", label: "Guests — email required" },
  { value: "GUEST_OPEN", label: "Guests — open (email optional)" },
];

const MODE_HELP = {
  AUTH_ONLY: "Only people with an account can comment.",
  GUEST_EMAIL_REQUIRED:
    "Anyone can comment after entering an email and name. Email stays private to you.",
  GUEST_OPEN: "Anyone can comment; email is optional.",
};

const DEFAULTS = {
  commentsEnabled: true,
  // Default new setups to guest commenting with email required, rather than
  // forcing sign-in. (The authoritative default lives in the backend column;
  // this covers the pre-fetch/fetch-failure state in the editor.)
  commentIdentityMode: "GUEST_EMAIL_REQUIRED",
  allowAnonymousDisplay: true,
  commentsRequireApproval: false,
};

/** The read shape uses `requiresApproval`; the write body uses
 * `commentsRequireApproval`. Normalize either into the form's shape. */
const normalize = (settings) => {
  if (!settings || typeof settings !== "object") return { ...DEFAULTS };
  return {
    commentsEnabled: settings.commentsEnabled ?? DEFAULTS.commentsEnabled,
    commentIdentityMode:
      settings.commentIdentityMode ?? DEFAULTS.commentIdentityMode,
    allowAnonymousDisplay:
      settings.allowAnonymousDisplay ?? DEFAULTS.allowAnonymousDisplay,
    commentsRequireApproval:
      settings.commentsRequireApproval ??
      settings.requiresApproval ??
      DEFAULTS.commentsRequireApproval,
  };
};

const isEqual = (a, b) =>
  a.commentsEnabled === b.commentsEnabled &&
  a.commentIdentityMode === b.commentIdentityMode &&
  a.allowAnonymousDisplay === b.allowAnonymousDisplay &&
  a.commentsRequireApproval === b.commentsRequireApproval;

const CommentSettingsSection = ({
  websiteId,
  initialSettings,
  onSaved,
  accent = "#111827",
  textColor = "#111827",
}) => {
  const [form, setForm] = useState(() => normalize(initialSettings));
  const [saved, setSaved] = useState(() => normalize(initialSettings));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedOk, setSavedOk] = useState(false);

  // Fetch the authoritative current settings on mount so the toggles reflect
  // what's actually saved, not just whatever the block payload happened to carry.
  useEffect(() => {
    if (!websiteId) return undefined;
    let cancelled = false;
    setLoading(true);
    apiClient
      .get(`/websites/${websiteId}/comment-settings`)
      .then((res) => {
        if (!cancelled && res.data?.settings) {
          const next = normalize(res.data.settings);
          setForm(next);
          setSaved(next);
        }
      })
      .catch(() => {
        // Keep the seeded values — save still works if the read is unavailable.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const guestMode =
    form.commentIdentityMode === "GUEST_EMAIL_REQUIRED" ||
    form.commentIdentityMode === "GUEST_OPEN";
  const dirty = !isEqual(form, saved);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedOk(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const res = await apiClient.patch(
        `/websites/${websiteId}/comment-settings`,
        {
          commentsEnabled: form.commentsEnabled,
          commentIdentityMode: form.commentIdentityMode,
          allowAnonymousDisplay: form.allowAnonymousDisplay,
          commentsRequireApproval: form.commentsRequireApproval,
        },
      );
      const next = normalize(res.data?.settings ?? form);
      setForm(next);
      setSaved(next);
      setSavedOk(true);
      onSaved?.(next);
    } catch (e) {
      setError(
        e?.response?.data?.error?.message ||
          e?.response?.data?.message ||
          "Couldn't save comment settings. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const headingSx = {
    fontSize: "0.94rem",
    fontWeight: 800,
    color: textColor,
  };
  const labelSx = { fontWeight: 700, fontSize: "0.86rem", color: textColor };
  const helpSx = { fontSize: "0.75rem", color: alphaText(textColor, 0.6) };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography sx={{ ...headingSx, mb: 0.5 }}>Comments</Typography>
      <Typography sx={{ ...helpSx, mb: 1.5 }}>
        Controls who can comment on every article on this site.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {savedOk && !dirty && (
        <Alert severity="success" sx={{ mb: 1.5 }}>
          Comment settings saved.
        </Alert>
      )}
      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <CircularProgress size={15} />
          <Typography sx={helpSx}>Loading current settings…</Typography>
        </Box>
      )}

      <FormControlLabel
        sx={{ ml: 0, mb: 1, alignItems: "center" }}
        control={
          <Switch
            size="small"
            checked={form.commentsEnabled}
            onChange={(e) => setField("commentsEnabled", e.target.checked)}
          />
        }
        label={
          <Typography sx={{ ...labelSx, ml: 0.5 }}>Enable comments</Typography>
        }
      />

      <Typography sx={{ ...labelSx, mt: 1, mb: 0.75 }}>
        Who can comment
      </Typography>
      <FormControl fullWidth size="small" disabled={!form.commentsEnabled}>
        <Select
          value={form.commentIdentityMode}
          onChange={(e) => setField("commentIdentityMode", e.target.value)}
          sx={{ borderRadius: "10px", backgroundColor: "#fff" }}
        >
          {MODE_OPTIONS.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography sx={{ ...helpSx, mt: 0.75 }}>
        {MODE_HELP[form.commentIdentityMode]}
      </Typography>

      <FormControlLabel
        sx={{ ml: 0, mt: 1.5, alignItems: "flex-start" }}
        control={
          <Switch
            size="small"
            checked={form.allowAnonymousDisplay}
            disabled={!form.commentsEnabled || !guestMode}
            onChange={(e) =>
              setField("allowAnonymousDisplay", e.target.checked)
            }
          />
        }
        label={
          <Box sx={{ ml: 0.5, mt: 0.25 }}>
            <Typography sx={labelSx}>Allow anonymous display</Typography>
            <Typography sx={helpSx}>
              Guests can hide their name publicly. You still see their details.
            </Typography>
          </Box>
        }
      />
      <FormControlLabel
        sx={{ ml: 0, mt: 1, alignItems: "flex-start" }}
        control={
          <Switch
            size="small"
            checked={form.commentsRequireApproval}
            disabled={!form.commentsEnabled}
            onChange={(e) =>
              setField("commentsRequireApproval", e.target.checked)
            }
          />
        }
        label={
          <Box sx={{ ml: 0.5, mt: 0.25 }}>
            <Typography sx={labelSx}>Require approval</Typography>
            <Typography sx={helpSx}>
              New guest comments stay hidden until you approve them.
            </Typography>
          </Box>
        }
      />

      <Button
        fullWidth
        variant="contained"
        onClick={handleSave}
        disabled={saving || loading || !dirty}
        startIcon={saving ? <CircularProgress size={15} color="inherit" /> : null}
        sx={{
          mt: 2,
          textTransform: "none",
          borderRadius: "10px",
          fontWeight: 700,
          backgroundColor: accent,
          boxShadow: "none",
          "&:hover": { backgroundColor: accent, opacity: 0.92, boxShadow: "none" },
        }}
      >
        {saving ? "Saving…" : dirty ? "Save comment settings" : "Saved"}
      </Button>
    </Box>
  );
};

/** Lightweight alpha helper so this component carries no MUI theme dependency. */
function alphaText(color, amount) {
  if (typeof color === "string" && color.startsWith("#") && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${amount})`;
  }
  return color;
}

export default CommentSettingsSection;
