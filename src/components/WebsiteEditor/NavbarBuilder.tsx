/**
 * NavbarBuilder — Step 10.2
 *
 * Editor component for configuring a website's global navbar.
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
  Switch,
  FormControlLabel,
  MenuItem,
  alpha,
} from "@mui/material";
import { Plus, Trash2, Navigation } from "lucide-react";
import axios from "axios";

import {
  DashboardCard,
  DashboardInput,
  DashboardIconButton,
  DashboardGradientButton,
} from "../Dashboard/shared";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { getDashboardColors } from "../../styles/dashboardTheme";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  link: string;
}

interface NavbarConfig {
  brandName: string;
  navigationItems: NavItem[];
  ctaText?: string;
  ctaLink?: string;
  sticky?: boolean;
  logo?: string;
}

interface NavbarBuilderProps {
  websiteId: number;
  onSave?: () => void;
  initialConfig?: Record<string, unknown>;
}

const API_BASE = "/api";
const MAX_NAV_ITEMS = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function defaultConfig(): NavbarConfig {
  return {
    brandName: "",
    navigationItems: [{ label: "Home", link: "/" }],
    ctaText: "",
    ctaLink: "",
    sticky: false,
    logo: "",
  };
}

function configFromApi(raw: Record<string, unknown> | null): NavbarConfig {
  if (!raw) return defaultConfig();
  return {
    brandName: String(raw.brandName || ""),
    navigationItems: Array.isArray(raw.navigationItems)
      ? (raw.navigationItems as NavItem[])
      : [],
    ctaText: raw.ctaText ? String(raw.ctaText) : "",
    ctaLink: raw.ctaLink ? String(raw.ctaLink) : "",
    sticky: Boolean(raw.sticky),
    logo: raw.logo ? String(raw.logo) : "",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

const NavbarBuilder: React.FC<NavbarBuilderProps> = ({
  websiteId,
  onSave,
  initialConfig,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [config, setConfig] = useState<NavbarConfig>(() =>
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
    if (initialConfig) return; // skip fetch if pre-populated
    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE}/websites/${websiteId}/global-components/navbar`)
      .then(({ data }) => {
        if (!cancelled) {
          setConfig(configFromApi(data.data?.config || null));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.response?.status === 404) {
            // Not yet created — use defaults
            setConfig(defaultConfig());
          } else {
            setError("Failed to load navbar configuration.");
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

  // ── Field handlers ──────────────────────────────────────────────────────

  const handleBrandName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, brandName: e.target.value }));
    },
    [],
  );

  const handleCtaText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, ctaText: e.target.value }));
    },
    [],
  );

  const handleCtaLink = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfig((prev) => ({ ...prev, ctaLink: e.target.value }));
    },
    [],
  );

  const handleSticky = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setConfig((prev) => ({ ...prev, sticky: checked }));
    },
    [],
  );

  const handleLogo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, logo: e.target.value }));
  }, []);

  const handleNavItemChange = useCallback(
    (idx: number, field: keyof NavItem, value: string) => {
      setConfig((prev) => {
        const updated = [...prev.navigationItems];
        updated[idx] = { ...updated[idx], [field]: value };
        return { ...prev, navigationItems: updated };
      });
    },
    [],
  );

  const handleAddNavItem = useCallback(() => {
    setConfig((prev) => {
      if (prev.navigationItems.length >= MAX_NAV_ITEMS) return prev;
      return {
        ...prev,
        navigationItems: [...prev.navigationItems, { label: "", link: "" }],
      };
    });
  }, []);

  const handleRemoveNavItem = useCallback((idx: number) => {
    setConfig((prev) => ({
      ...prev,
      navigationItems: prev.navigationItems.filter((_, i) => i !== idx),
    }));
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.put(
        `${API_BASE}/websites/${websiteId}/global-components/navbar`,
        {
          config,
        },
      );
      setSnackbar({
        open: true,
        message: "Navbar saved successfully.",
        severity: "success",
      });
      onSave?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save navbar.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  }, [websiteId, config, onSave]);

  const canAddMore = useMemo(
    () => config.navigationItems.length < MAX_NAV_ITEMS,
    [config.navigationItems.length],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <DashboardCard
        icon={Navigation}
        title="Navbar Configuration"
        subtitle="Global site navigation"
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Brand name */}
        <DashboardInput
          label="Brand Name"
          value={config.brandName}
          onChange={handleBrandName}
          placeholder="My Company"
          inputProps={{ maxLength: 80 }}
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

        {/* Navigation items */}
        <Typography
          variant="body2"
          sx={{ color: colors.panelText, fontWeight: 500, mb: 1 }}
        >
          Navigation Items ({config.navigationItems.length}/{MAX_NAV_ITEMS})
        </Typography>

        {config.navigationItems.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              gap: 1,
              mb: 1,
              alignItems: "flex-start",
            }}
          >
            <DashboardInput
              label="Label"
              value={item.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNavItemChange(idx, "label", e.target.value)
              }
              inputProps={{ maxLength: 40 }}
              sx={{ flex: 1 }}
            />
            <DashboardInput
              label="Link"
              value={item.link}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNavItemChange(idx, "link", e.target.value)
              }
              inputProps={{ maxLength: 500 }}
              sx={{ flex: 2 }}
            />
            <DashboardIconButton
              icon={Trash2}
              tooltipLabel="Remove"
              onClick={() => handleRemoveNavItem(idx)}
              aria-label={`Remove navigation item ${idx + 1}`}
              sx={{ mt: "28px" }}
            />
          </Box>
        ))}

        {canAddMore && (
          <Box sx={{ mb: 2 }}>
            <DashboardIconButton
              icon={Plus}
              tooltipLabel="Add navigation item"
              onClick={handleAddNavItem}
              aria-label="Add navigation item"
            />
          </Box>
        )}

        {/* CTA */}
        <Typography
          variant="body2"
          sx={{ color: colors.panelText, fontWeight: 500, mb: 1, mt: 2 }}
        >
          Call to Action (optional)
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mb: 2,
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <DashboardInput
            label="CTA Text"
            value={config.ctaText || ""}
            onChange={handleCtaText}
            placeholder="Get Started"
            sx={{ flex: 1 }}
          />
          <DashboardInput
            label="CTA Link"
            value={config.ctaLink || ""}
            onChange={handleCtaLink}
            placeholder="/signup"
            sx={{ flex: 2 }}
          />
        </Box>

        {/* Sticky toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(config.sticky)}
              onChange={handleSticky}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" sx={{ color: colors.panelText }}>
              Sticky navbar (stays at top while scrolling)
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        {/* Save */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <DashboardGradientButton
            onClick={handleSave}
            disabled={saving || !config.brandName.trim()}
          >
            {saving ? "Saving…" : "Save Navbar"}
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

export default React.memo(NavbarBuilder);
