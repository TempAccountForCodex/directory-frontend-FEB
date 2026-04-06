/**
 * @deprecated This file is unmounted and dead. Do NOT mount it — it has its own
 * bugs (stale API assumptions, missing plan code alignment). The active domain
 * management UI lives in:
 *   frontend/src/components/Dashboard/website-manage/DomainTab.jsx
 *
 * Retained only for reference. Will be removed in a future cleanup pass.
 *
 * --- Original header ---
 * DomainManagement Page — Step 10.1.11 & 10.1.12
 *
 * Renders inside the MiniSideNav 'Domain' tab at
 * /dashboard/websites/:id/manage/domain
 *
 * Sections:
 *   A) Subdomain management — availability check, debounced input, save
 *   B) Custom domain management — plan-gated, DNS verification, status
 */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import useMediaQuery from "@mui/material/useMediaQuery";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import LockIcon from "@mui/icons-material/Lock";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  DashboardCard,
  DashboardInput,
  DashboardConfirmButton,
  DashboardCancelButton,
  DashboardGradientButton,
  DashboardTooltip,
  TabNavigation,
  ConfirmationDialog,
} from "../components/Dashboard/shared";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

type SubdomainStatus = "idle" | "checking" | "available" | "taken" | "invalid";

type DomainStatus =
  | "NONE"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "SSL_PROVISIONING"
  | "ACTIVE"
  | "FAILED";

interface WebsiteData {
  id: number;
  subdomain: string;
  customDomain: string | null;
  domainStatus: DomainStatus;
  verifyToken?: string;
}

interface PlanData {
  customDomain: boolean;
  plan: string;
}

interface DnsRecord {
  type: string;
  host: string;
  value: string;
}

const DOMAIN_STATUS_COLORS: Record<
  DomainStatus,
  "default" | "warning" | "info" | "success" | "error"
> = {
  NONE: "default",
  PENDING_VERIFICATION: "warning",
  VERIFIED: "info",
  SSL_PROVISIONING: "info",
  ACTIVE: "success",
  FAILED: "error",
};

const DNS_PROVIDERS = [
  { label: "GoDaddy", value: "godaddy" },
  { label: "Namecheap", value: "namecheap" },
  { label: "Cloudflare", value: "cloudflare" },
  { label: "Other", value: "other" },
];

const DNS_INSTRUCTIONS: Record<string, string[]> = {
  godaddy: [
    "1. Log in to your GoDaddy account.",
    "2. Go to DNS → Manage DNS for your domain.",
    '3. Click "Add" under DNS Records.',
    "4. Select Type = TXT.",
    "5. Enter the Host and TXT Value below.",
    "6. Set TTL to 1 hour and save.",
    '7. Return here and click "Verify Domain" (may take up to 48 hours to propagate).',
  ],
  namecheap: [
    "1. Log in to Namecheap and go to Domain List.",
    '2. Click "Manage" next to your domain.',
    "3. Go to the Advanced DNS tab.",
    "4. Add a new TXT Record.",
    "5. Set the Host and Value fields as shown below.",
    "6. Save changes.",
    '7. Return here and click "Verify Domain" (up to 48 hours).',
  ],
  cloudflare: [
    "1. Log in to Cloudflare and select your domain.",
    "2. Go to DNS → Records.",
    '3. Click "Add record".',
    "4. Select Type = TXT, enter the Name and Content below.",
    "5. Set Proxy status to DNS only (grey cloud).",
    "6. Click Save.",
    '7. Return here and click "Verify Domain" (usually propagates quickly).',
  ],
  other: [
    "1. Log in to your DNS provider's control panel.",
    "2. Navigate to DNS Management for your domain.",
    "3. Add a new TXT record with the Host and Value shown below.",
    "4. Save the changes.",
    '5. Return here and click "Verify Domain" (may take up to 48 hours).',
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateDomainFormat(domain: string): boolean {
  const domainRegex =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CopyButtonProps {
  value: string;
}

const CopyButton = React.memo(({ value }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  return (
    <DashboardTooltip
      title={copied ? "Copied!" : "Copy to clipboard"}
      placement="top"
    >
      <Chip
        icon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
        label={copied ? "Copied" : value}
        size="small"
        onClick={handleCopy}
        sx={{
          fontFamily: "monospace",
          fontSize: "0.78rem",
          cursor: "pointer",
          maxWidth: "100%",
          "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
        }}
      />
    </DashboardTooltip>
  );
});
CopyButton.displayName = "CopyButton";

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface DomainManagementProps {
  websiteId: number;
}

const DomainManagement = React.memo(({ websiteId }: DomainManagementProps) => {
  const isMobile = useMediaQuery("(max-width:768px)");

  // ----- Website data -----
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // ----- Subdomain state -----
  const [subdomain, setSubdomain] = useState("");
  const [subdomainStatus, setSubdomainStatus] =
    useState<SubdomainStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [subdomainError, setSubdomainError] = useState("");
  const [isChangingSubdomain, setIsChangingSubdomain] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----- Custom domain state -----
  const [customDomain, setCustomDomain] = useState("");
  const [domainStatus, setDomainStatus] = useState<DomainStatus>("NONE");
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyRecord, setVerifyRecord] = useState<DnsRecord | null>(null);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDnsGuide, setShowDnsGuide] = useState(false);
  const [selectedDnsProvider, setSelectedDnsProvider] = useState("godaddy");
  const [domainInputValue, setDomainInputValue] = useState("");
  const [domainInputError, setDomainInputError] = useState("");
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // ----- Snackbar -----
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  // ----- Fetch data on mount -----
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [websiteRes, planRes] = await Promise.all([
          fetch(`${API_URL}/websites/${websiteId}`, { credentials: "include" }),
          fetch(`${API_URL}/billing/plan`, { credentials: "include" }),
        ]);

        if (websiteRes.ok) {
          const data: WebsiteData = await websiteRes.json();
          setWebsiteData(data);
          setSubdomain(data.subdomain || "");
          setCustomDomain(data.customDomain || "");
          setDomainStatus(data.domainStatus || "NONE");
          if (data.verifyToken) {
            setVerifyToken(data.verifyToken);
            if (data.customDomain) {
              setVerifyRecord({
                type: "TXT",
                host: `_techietribe-verify.${data.customDomain}`,
                value: data.verifyToken,
              });
            }
            if (data.domainStatus === "PENDING_VERIFICATION") {
              setShowDnsGuide(true);
            }
          }
        }

        if (planRes.ok) {
          const pData: PlanData = await planRes.json();
          setPlanData(pData);
        }
      } catch (err) {
        console.error("Failed to load domain data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [websiteId]);

  // ----- Subdomain handlers -----
  const checkSubdomainAvailability = useCallback(async (value: string) => {
    setSubdomainStatus("checking");
    try {
      const res = await fetch(
        `${API_URL}/domains/check-availability?subdomain=${encodeURIComponent(value)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Check failed");
      const data = await res.json();
      if (data.available) {
        setSubdomainStatus("available");
        setSuggestions([]);
        setSubdomainError("");
      } else {
        setSubdomainStatus("taken");
        setSuggestions(data.suggestions || []);
        setSubdomainError(`${value}.techietribe.app is taken`);
      }
    } catch {
      setSubdomainStatus("idle");
      setSubdomainError("Could not check availability. Please try again.");
    }
  }, []);

  const handleSubdomainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setSubdomain(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value) {
        setSubdomainStatus("idle");
        setSubdomainError("");
        setSuggestions([]);
        return;
      }

      if (!SUBDOMAIN_REGEX.test(value)) {
        setSubdomainStatus("invalid");
        setSubdomainError(
          "Subdomain must use lowercase letters, numbers and hyphens only. " +
            "Must start and end with a letter or number.",
        );
        setSuggestions([]);
        return;
      }

      // Debounce availability check
      debounceRef.current = setTimeout(() => {
        checkSubdomainAvailability(value);
      }, 500);
    },
    [checkSubdomainAvailability],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setSubdomain(suggestion);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      checkSubdomainAvailability(suggestion);
    },
    [checkSubdomainAvailability],
  );

  const handleSaveSubdomain = useCallback(async () => {
    if (subdomainStatus !== "available") return;
    setIsChangingSubdomain(true);
    try {
      const res = await fetch(`${API_URL}/domains/${websiteId}/subdomain`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setWebsiteData((prev) =>
        prev ? { ...prev, subdomain: data.subdomain } : prev,
      );
      setSnackbar({
        open: true,
        message: "Subdomain updated successfully!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to update subdomain. Please try again.",
        severity: "error",
      });
    } finally {
      setIsChangingSubdomain(false);
    }
  }, [subdomain, subdomainStatus, websiteId]);

  // Derived: whether save is enabled
  const isSaveSubdomainEnabled = useMemo(
    () =>
      subdomainStatus === "available" &&
      subdomain !== (websiteData?.subdomain || ""),
    [subdomainStatus, subdomain, websiteData?.subdomain],
  );

  // ----- Custom domain handlers -----
  const handleDomainInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim().toLowerCase();
      setDomainInputValue(value);
      if (value && !validateDomainFormat(value)) {
        setDomainInputError("Please enter a valid domain (e.g., example.com)");
      } else {
        setDomainInputError("");
      }
    },
    [],
  );

  const handleAddDomain = useCallback(async () => {
    if (!domainInputValue || !validateDomainFormat(domainInputValue)) return;
    setIsAddingDomain(true);
    try {
      const res = await fetch(`${API_URL}/domains/${websiteId}/custom-domain`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInputValue }),
      });
      if (!res.ok) throw new Error("Add domain failed");
      const data = await res.json();
      setCustomDomain(data.domain);
      setDomainStatus(data.status || "PENDING_VERIFICATION");
      if (data.verifyRecord) {
        setVerifyRecord(data.verifyRecord);
        setVerifyToken(data.verifyRecord.value || "");
      }
      setShowDnsGuide(true);
      setDomainInputValue("");
      setSnackbar({
        open: true,
        message: "Domain added. Complete DNS verification to activate.",
        severity: "info",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to add domain. Please try again.",
        severity: "error",
      });
    } finally {
      setIsAddingDomain(false);
    }
  }, [domainInputValue, websiteId]);

  const handleVerifyDomain = useCallback(async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(
        `${API_URL}/domains/${websiteId}/custom-domain/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error("Verify failed");
      const data = await res.json();
      if (data.verified) {
        setDomainStatus(data.status || "VERIFIED");
        setVerifyResult({
          success: true,
          message: "Domain verified successfully!",
        });
        setShowDnsGuide(false);
        setSnackbar({
          open: true,
          message: "Domain verified! SSL provisioning in progress.",
          severity: "success",
        });
      } else {
        setVerifyResult({
          success: false,
          message:
            "Verification failed. DNS records may not have propagated yet. " +
            "This can take up to 48 hours. Please try again later.",
        });
      }
    } catch {
      setVerifyResult({
        success: false,
        message:
          "Verification check failed. Please try again. DNS can take up to 48 hours to propagate.",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [websiteId]);

  const handleRemoveDomain = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/domains/${websiteId}/custom-domain`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Remove failed");
      setCustomDomain("");
      setDomainStatus("NONE");
      setVerifyRecord(null);
      setVerifyToken("");
      setShowDnsGuide(false);
      setVerifyResult(null);
      setRemoveDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Custom domain removed successfully.",
        severity: "success",
      });
    } catch {
      setRemoveDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Failed to remove domain. Please try again.",
        severity: "error",
      });
    }
  }, [websiteId]);

  const handleDnsProviderChange = useCallback((_: unknown, value: string) => {
    setSelectedDnsProvider(value);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleOpenRemoveDialog = useCallback(() => {
    setRemoveDialogOpen(true);
  }, []);

  const handleCloseRemoveDialog = useCallback(() => {
    setRemoveDialogOpen(false);
  }, []);

  // ----- Derived: subdomain status display -----
  const subdomainStatusNode = useMemo(() => {
    if (subdomainStatus === "checking") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Checking availability…
          </Typography>
        </Box>
      );
    }
    if (subdomainStatus === "available") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
          <Typography variant="caption" sx={{ color: "success.main" }}>
            {subdomain}.techietribe.app is available
          </Typography>
        </Box>
      );
    }
    if (subdomainStatus === "taken") {
      return (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <CancelIcon sx={{ fontSize: 18, color: "error.main" }} />
            <Typography variant="caption" sx={{ color: "error.main" }}>
              {subdomain}.techietribe.app is taken
            </Typography>
          </Box>
          {suggestions.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mr: 0.5 }}
              >
                Try:
              </Typography>
              {suggestions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={() => handleSuggestionClick(s)}
                  sx={{ cursor: "pointer", fontSize: "0.78rem" }}
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }
    if (subdomainStatus === "invalid") {
      return (
        <Box
          sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, mt: 1 }}
        >
          <WarningIcon
            sx={{
              fontSize: 18,
              color: "warning.main",
              flexShrink: 0,
              mt: "1px",
            }}
          />
          <Typography variant="caption" sx={{ color: "warning.main" }}>
            Subdomain must use lowercase letters, numbers and hyphens only. Must
            start and end with a letter or number.
          </Typography>
        </Box>
      );
    }
    return null;
  }, [subdomainStatus, subdomain, suggestions, handleSuggestionClick]);

  // ----- DNS guide content -----
  const dnsGuideContent = useMemo(() => {
    const instructions =
      DNS_INSTRUCTIONS[selectedDnsProvider] || DNS_INSTRUCTIONS.other;
    return (
      <Stack spacing={1}>
        {instructions.map((step, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{ color: "text.secondary", lineHeight: 1.6 }}
          >
            {step}
          </Typography>
        ))}
      </Stack>
    );
  }, [selectedDnsProvider]);

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  // ----- Render -----
  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, sm: 0 } }}>
      <Stack spacing={3}>
        {/* ──────────────── SUBDOMAIN SECTION ──────────────── */}
        <DashboardCard title="Subdomain">
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Your free subdomain on techietribe.app. Change it anytime.
            </Typography>

            <Box sx={{ position: "relative" }}>
              <DashboardInput
                label="Subdomain"
                value={subdomain}
                onChange={handleSubdomainChange}
                placeholder="yoursite"
                disabled={isChangingSubdomain}
                error={subdomainStatus === "invalid"}
                InputProps={{
                  endAdornment:
                    subdomainStatus === "checking" ? (
                      <CircularProgress size={16} />
                    ) : undefined,
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
              >
                Your site URL: {subdomain || "…"}.techietribe.app
              </Typography>
            </Box>

            {subdomainStatusNode}

            <Box>
              <DashboardConfirmButton
                onClick={handleSaveSubdomain}
                disabled={!isSaveSubdomainEnabled || isChangingSubdomain}
                startIcon={
                  isChangingSubdomain ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                Save Subdomain
              </DashboardConfirmButton>
            </Box>
          </Stack>
        </DashboardCard>

        {/* ──────────────── CUSTOM DOMAIN SECTION ──────────────── */}
        {planData && !planData.customDomain ? (
          /* Locked state for Free/Core plans */
          <DashboardCard title="Custom Domain" icon={LockIcon}>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <LockIcon sx={{ color: "text.secondary", mt: 0.25 }} />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
                  >
                    Custom Domain Locked
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Custom domains are available on Growth plan and above.
                    Upgrade to connect your own domain (e.g., example.com) to
                    your site.
                  </Typography>
                </Box>
              </Box>
              <Box>
                <DashboardGradientButton
                  component="a"
                  href="/dashboard/settings/billing"
                >
                  Upgrade to Growth Plan
                </DashboardGradientButton>
              </Box>
            </Stack>
          </DashboardCard>
        ) : (
          /* Full custom domain management */
          <DashboardCard title="Custom Domain">
            <Stack spacing={3}>
              {/* Active domain status */}
              {customDomain && domainStatus !== "NONE" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Current domain:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {customDomain}
                  </Typography>
                  <Chip
                    label={domainStatus}
                    color={DOMAIN_STATUS_COLORS[domainStatus] ?? "default"}
                    size="small"
                  />
                  <DashboardCancelButton
                    onClick={handleOpenRemoveDialog}
                    sx={{ ml: "auto" }}
                  >
                    Remove Domain
                  </DashboardCancelButton>
                </Box>
              )}

              {/* Add domain input (only when no domain set) */}
              {!customDomain && (
                <Stack spacing={1.5}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Connect your own domain to this website.
                  </Typography>
                  <DashboardInput
                    label="Custom Domain"
                    value={domainInputValue}
                    onChange={handleDomainInputChange}
                    placeholder="example.com"
                    error={!!domainInputError}
                    helperText={domainInputError}
                    disabled={isAddingDomain}
                  />
                  <Box>
                    <DashboardConfirmButton
                      onClick={handleAddDomain}
                      disabled={
                        !domainInputValue ||
                        !!domainInputError ||
                        isAddingDomain
                      }
                      startIcon={
                        isAddingDomain ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : undefined
                      }
                    >
                      Add Domain
                    </DashboardConfirmButton>
                  </Box>
                </Stack>
              )}

              {/* DNS Verification Section */}
              {showDnsGuide && domainStatus === "PENDING_VERIFICATION" && (
                <DashboardCard title="DNS Verification">
                  <Stack spacing={2.5}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Add the following TXT record to your domain's DNS settings
                      to verify ownership.
                    </Typography>

                    {/* TXT Record details */}
                    {verifyRecord && (
                      <Box
                        sx={{
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          overflow: "hidden",
                        }}
                      >
                        {[
                          { label: "Record Type", value: verifyRecord.type },
                          { label: "Host", value: verifyRecord.host },
                          { label: "Value", value: verifyRecord.value },
                        ].map((row) => (
                          <Box
                            key={row.label}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              px: 2,
                              py: 1.25,
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              gap: 2,
                              "&:last-child": { borderBottom: "none" },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                minWidth: 100,
                                fontWeight: 500,
                              }}
                            >
                              {row.label}
                            </Typography>
                            <CopyButton value={row.value} />
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* DNS Provider Guides */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary", fontWeight: 600 }}
                        >
                          Step-by-step instructions:
                        </Typography>
                        <DashboardTooltip
                          title="Choose your DNS provider for specific instructions on where to add DNS records."
                          placement="top"
                        >
                          <HelpOutlineIcon
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              cursor: "help",
                            }}
                          />
                        </DashboardTooltip>
                      </Box>

                      {isMobile ? (
                        /* Mobile: accordion */
                        <Stack spacing={1}>
                          {DNS_PROVIDERS.map((provider) => (
                            <Accordion
                              key={provider.value}
                              expanded={selectedDnsProvider === provider.value}
                              onChange={() =>
                                setSelectedDnsProvider(
                                  selectedDnsProvider === provider.value
                                    ? ""
                                    : provider.value,
                                )
                              }
                            >
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {provider.label}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Stack spacing={0.75}>
                                  {(
                                    DNS_INSTRUCTIONS[provider.value] ||
                                    DNS_INSTRUCTIONS.other
                                  ).map((step, i) => (
                                    <Typography
                                      key={i}
                                      variant="body2"
                                      sx={{
                                        color: "text.secondary",
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {step}
                                    </Typography>
                                  ))}
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Stack>
                      ) : (
                        /* Desktop: tabs */
                        <Box>
                          <TabNavigation
                            tabs={DNS_PROVIDERS}
                            value={selectedDnsProvider}
                            onChange={handleDnsProviderChange}
                          />
                          <Box sx={{ pt: 1 }}>{dnsGuideContent}</Box>
                        </Box>
                      )}
                    </Box>

                    {/* CNAME / A record alternatives */}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
                      >
                        Additional DNS records (optional):
                      </Typography>
                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            CNAME (www):
                          </Typography>
                          <DashboardTooltip
                            title="Point your www subdomain to our servers using a CNAME record."
                            placement="top"
                          >
                            <Chip
                              label="www → sites.techietribe.app"
                              size="small"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                              }}
                            />
                          </DashboardTooltip>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            A Record (apex):
                          </Typography>
                          <DashboardTooltip
                            title="Use an A record for your root/apex domain. Contact support for the server IP."
                            placement="top"
                          >
                            <Chip
                              label="@ → Contact support for server IP"
                              size="small"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                              }}
                            />
                          </DashboardTooltip>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Verify result */}
                    {verifyResult && (
                      <Alert
                        severity={verifyResult.success ? "success" : "warning"}
                      >
                        {verifyResult.message}
                      </Alert>
                    )}

                    {/* Verify button */}
                    <Box>
                      <DashboardConfirmButton
                        onClick={handleVerifyDomain}
                        disabled={isVerifying}
                        startIcon={
                          isVerifying ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : undefined
                        }
                      >
                        Verify Domain
                      </DashboardConfirmButton>
                    </Box>
                  </Stack>
                </DashboardCard>
              )}

              {/* Post-verification status details */}
              {customDomain && domainStatus === "ACTIVE" && (
                <Alert severity="success">
                  Your domain <strong>{customDomain}</strong> is active and
                  serving traffic.
                </Alert>
              )}
              {customDomain && domainStatus === "SSL_PROVISIONING" && (
                <Alert severity="info">
                  SSL certificate is being provisioned. This may take a few
                  minutes.
                </Alert>
              )}
              {customDomain && domainStatus === "FAILED" && (
                <Alert severity="error">
                  Domain setup failed. Please remove the domain and try again,
                  or contact support.
                </Alert>
              )}
            </Stack>
          </DashboardCard>
        )}
      </Stack>

      {/* Remove domain confirmation dialog */}
      <ConfirmationDialog
        open={removeDialogOpen}
        onConfirm={handleRemoveDomain}
        onCancel={handleCloseRemoveDialog}
        title="Remove Custom Domain"
        message={`Are you sure you want to remove ${customDomain}? Your site will revert to the techietribe.app subdomain.`}
        confirmLabel="Remove Domain"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

DomainManagement.displayName = "DomainManagement";

export default DomainManagement;
