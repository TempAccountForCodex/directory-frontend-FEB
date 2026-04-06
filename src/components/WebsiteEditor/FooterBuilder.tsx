/**
 * FooterBuilder — Step 10.2
 *
 * Editor component for configuring a website's global footer.
 * Fetches existing config on mount, saves via PUT API.
 *
 * Props:
 *   websiteId     — target website ID
 *   onSave        — optional callback after successful save
 *   initialConfig — optional pre-populated config (skips initial fetch if provided)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  Skeleton,
  Snackbar,
  MenuItem,
  alpha,
} from "@mui/material";
import { Plus, Trash2, LayoutTemplate } from "lucide-react";
import axios from "axios";

import {
  DashboardCard,
  DashboardInput,
  DashboardSelect,
  DashboardIconButton,
  DashboardGradientButton,
} from "../Dashboard/shared";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { getDashboardColors } from "../../styles/dashboardTheme";

// ── Types ─────────────────────────────────────────────────────────────────────

type SocialPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube";

interface ColLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: ColLink[];
}

interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

interface FooterConfig {
  copyright: string;
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  logo?: string;
}

interface FooterBuilderProps {
  websiteId: number;
  onSave?: () => void;
  initialConfig?: Record<string, unknown>;
}

const API_BASE = "/api";
const MAX_COLUMNS = 4;
const MAX_COL_LINKS = 8;
const MAX_SOCIAL_LINKS = 5;

const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function defaultConfig(): FooterConfig {
  return {
    copyright: `© ${new Date().getFullYear()} My Company. All rights reserved.`,
    columns: [],
    socialLinks: [],
    logo: "",
  };
}

function configFromApi(raw: Record<string, unknown> | null): FooterConfig {
  if (!raw) return defaultConfig();
  return {
    copyright: String(raw.copyright || ""),
    columns: Array.isArray(raw.columns) ? (raw.columns as FooterColumn[]) : [],
    socialLinks: Array.isArray(raw.socialLinks)
      ? (raw.socialLinks as SocialLink[])
      : [],
    logo: raw.logo ? String(raw.logo) : "",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

const FooterBuilder: React.FC<FooterBuilderProps> = ({
  websiteId,
  onSave,
  initialConfig,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [config, setConfig] = useState<FooterConfig>(() =>
    initialConfig
      ? configFromApi(initialConfig as Record<string, unknown>)
      : defaultConfig(),
  );
  const [loading, setLoading] = useState(!initialConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ── Fetch existing config ───────────────────────────────────────────────

  useEffect(() => {
    if (initialConfig) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE}/websites/${websiteId}/global-components/footer`)
      .then(({ data }) => {
        if (!cancelled) {
          setConfig(configFromApi(data.data?.config || null));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setConfig(defaultConfig());
          } else {
            setError("Failed to load footer configuration.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [websiteId, initialConfig]);

  // ── Copyright & logo ────────────────────────────────────────────────────

  const handleCopyright = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, copyright: e.target.value }));
    },
    [],
  );

  const handleLogo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, logo: e.target.value }));
  }, []);

  // ── Columns ─────────────────────────────────────────────────────────────

  const handleAddColumn = useCallback(() => {
    setConfig((prev) => {
      if (prev.columns.length >= MAX_COLUMNS) return prev;
      return { ...prev, columns: [...prev.columns, { title: "", links: [] }] };
    });
  }, []);

  const handleRemoveColumn = useCallback((colIdx: number) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== colIdx),
    }));
  }, []);

  const handleColumnTitle = useCallback((colIdx: number, value: string) => {
    setConfig((prev) => {
      const updated = [...prev.columns];
      updated[colIdx] = { ...updated[colIdx], title: value };
      return { ...prev, columns: updated };
    });
  }, []);

  const handleAddColLink = useCallback((colIdx: number) => {
    setConfig((prev) => {
      const updated = [...prev.columns];
      if (updated[colIdx].links.length >= MAX_COL_LINKS) return prev;
      updated[colIdx] = {
        ...updated[colIdx],
        links: [...updated[colIdx].links, { label: "", url: "" }],
      };
      return { ...prev, columns: updated };
    });
  }, []);

  const handleRemoveColLink = useCallback((colIdx: number, linkIdx: number) => {
    setConfig((prev) => {
      const updated = [...prev.columns];
      updated[colIdx] = {
        ...updated[colIdx],
        links: updated[colIdx].links.filter((_, i) => i !== linkIdx),
      };
      return { ...prev, columns: updated };
    });
  }, []);

  const handleColLinkChange = useCallback(
    (colIdx: number, linkIdx: number, field: keyof ColLink, value: string) => {
      setConfig((prev) => {
        const updatedCols = [...prev.columns];
        const updatedLinks = [...updatedCols[colIdx].links];
        updatedLinks[linkIdx] = { ...updatedLinks[linkIdx], [field]: value };
        updatedCols[colIdx] = { ...updatedCols[colIdx], links: updatedLinks };
        return { ...prev, columns: updatedCols };
      });
    },
    [],
  );

  // ── Social links ─────────────────────────────────────────────────────────

  const handleAddSocial = useCallback(() => {
    setConfig((prev) => {
      if (prev.socialLinks.length >= MAX_SOCIAL_LINKS) return prev;
      return {
        ...prev,
        socialLinks: [...prev.socialLinks, { platform: "twitter", url: "" }],
      };
    });
  }, []);

  const handleRemoveSocial = useCallback((idx: number) => {
    setConfig((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
    }));
  }, []);

  const handleSocialPlatform = useCallback(
    (idx: number, value: SocialPlatform) => {
      setConfig((prev) => {
        const updated = [...prev.socialLinks];
        updated[idx] = { ...updated[idx], platform: value };
        return { ...prev, socialLinks: updated };
      });
    },
    [],
  );

  const handleSocialUrl = useCallback((idx: number, value: string) => {
    setConfig((prev) => {
      const updated = [...prev.socialLinks];
      updated[idx] = { ...updated[idx], url: value };
      return { ...prev, socialLinks: updated };
    });
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.put(
        `${API_BASE}/websites/${websiteId}/global-components/footer`,
        {
          config,
        },
      );
      setSnackbar({
        open: true,
        message: "Footer saved successfully.",
        severity: "success",
      });
      onSave?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save footer.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  }, [websiteId, config, onSave]);

  const canAddColumn = useMemo(
    () => config.columns.length < MAX_COLUMNS,
    [config.columns.length],
  );
  const canAddSocial = useMemo(
    () => config.socialLinks.length < MAX_SOCIAL_LINKS,
    [config.socialLinks.length],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <DashboardCard
        icon={LayoutTemplate}
        title="Footer Configuration"
        subtitle="Global site footer"
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Copyright */}
        <DashboardInput
          label="Copyright Text"
          value={config.copyright}
          onChange={handleCopyright}
          placeholder="© 2026 My Company. All rights reserved."
          inputProps={{ maxLength: 200 }}
          sx={{ mb: 2 }}
        />

        {/* Logo URL */}
        <DashboardInput
          label="Logo URL (optional)"
          value={config.logo || ""}
          onChange={handleLogo}
          placeholder="https://example.com/logo.png"
          sx={{ mb: 2 }}
        />

        {/* Columns */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: colors.panelText, fontWeight: 500 }}
          >
            Footer Columns ({config.columns.length}/{MAX_COLUMNS})
          </Typography>
          {canAddColumn && (
            <DashboardIconButton
              icon={Plus}
              tooltipLabel="Add column"
              onClick={handleAddColumn}
              aria-label="Add footer column"
            />
          )}
        </Box>

        {config.columns.map((col, colIdx) => (
          <Box
            key={colIdx}
            sx={{
              border: `1px solid ${alpha(colors.panelText, 0.12)}`,
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DashboardInput
                label="Column Title"
                value={col.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleColumnTitle(colIdx, e.target.value)
                }
                inputProps={{ maxLength: 60 }}
                sx={{ flex: 1 }}
              />
              <DashboardIconButton
                icon={Trash2}
                tooltipLabel="Remove column"
                onClick={() => handleRemoveColumn(colIdx)}
                aria-label={`Remove column ${colIdx + 1}`}
                sx={{ mt: "28px" }}
              />
            </Box>

            <Typography
              variant="caption"
              sx={{ color: colors.panelMuted, display: "block", mb: 1 }}
            >
              Links ({col.links.length}/{MAX_COL_LINKS})
            </Typography>

            {col.links.map((link, linkIdx) => (
              <Box key={linkIdx} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <DashboardInput
                  label="Label"
                  value={link.label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleColLinkChange(
                      colIdx,
                      linkIdx,
                      "label",
                      e.target.value,
                    )
                  }
                  sx={{ flex: 1 }}
                />
                <DashboardInput
                  label="URL"
                  value={link.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleColLinkChange(colIdx, linkIdx, "url", e.target.value)
                  }
                  sx={{ flex: 2 }}
                />
                <DashboardIconButton
                  icon={Trash2}
                  tooltipLabel="Remove link"
                  onClick={() => handleRemoveColLink(colIdx, linkIdx)}
                  aria-label={`Remove link ${linkIdx + 1} from column ${colIdx + 1}`}
                  sx={{ mt: "28px" }}
                />
              </Box>
            ))}

            {col.links.length < MAX_COL_LINKS && (
              <DashboardIconButton
                icon={Plus}
                tooltipLabel="Add link"
                onClick={() => handleAddColLink(colIdx)}
                aria-label={`Add link to column ${colIdx + 1}`}
              />
            )}
          </Box>
        ))}

        {/* Social links */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
            mt: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: colors.panelText, fontWeight: 500 }}
          >
            Social Links ({config.socialLinks.length}/{MAX_SOCIAL_LINKS})
          </Typography>
          {canAddSocial && (
            <DashboardIconButton
              icon={Plus}
              tooltipLabel="Add social link"
              onClick={handleAddSocial}
              aria-label="Add social link"
            />
          )}
        </Box>

        {config.socialLinks.map((social, idx) => (
          <Box
            key={idx}
            sx={{ display: "flex", gap: 1, mb: 1, alignItems: "flex-start" }}
          >
            <DashboardSelect
              label="Platform"
              value={social.platform}
              onChange={(e: { target: { value: string } }) =>
                handleSocialPlatform(idx, e.target.value as SocialPlatform)
              }
              sx={{ flex: 1 }}
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </DashboardSelect>
            <DashboardInput
              label="URL"
              value={social.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSocialUrl(idx, e.target.value)
              }
              placeholder="https://twitter.com/mycompany"
              sx={{ flex: 2 }}
            />
            <DashboardIconButton
              icon={Trash2}
              tooltipLabel="Remove"
              onClick={() => handleRemoveSocial(idx)}
              aria-label={`Remove social link ${idx + 1}`}
              sx={{ mt: "28px" }}
            />
          </Box>
        ))}

        {/* Save */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <DashboardGradientButton
            onClick={handleSave}
            disabled={saving || !config.copyright.trim()}
          >
            {saving ? "Saving…" : "Save Footer"}
          </DashboardGradientButton>
        </Box>
      </DashboardCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(FooterBuilder);
