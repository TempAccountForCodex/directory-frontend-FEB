import { memo, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Alert,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Check,
  ChevronRight,
  Copy,
  Globe,
  Lock,
  X,
} from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { DashboardCard } from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';
import DashboardCancelButton from '../shared/DashboardCancelButton';
import DashboardInput from '../shared/DashboardInput';
import DashboardIconButton from '../shared/DashboardIconButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

const PLAN_ALLOWS_CUSTOM_DOMAIN = ['website_growth', 'website_agency'];

const DNS_PROVIDERS = ['GoDaddy', 'Namecheap', 'Cloudflare', 'Other'];

const DNS_INSTRUCTIONS = {
  GoDaddy: 'In GoDaddy: Go to DNS Management → Add Record → CNAME pointing to your Techietribe subdomain.',
  Namecheap: 'In Namecheap: Go to Advanced DNS → Add New Record → CNAME pointing to your Techietribe subdomain.',
  Cloudflare: 'In Cloudflare: Go to DNS → Add Record → CNAME pointing to your Techietribe subdomain.',
  Other: 'Log into your domain registrar → Navigate to DNS settings → Add CNAME record pointing to your Techietribe subdomain.',
};

const DOMAIN_WIZARD_STEPS = ['Enter Domain', 'Configure DNS', 'Verify Domain', 'SSL Provisioning'];

const DomainTab = memo(({ website, websiteId, onSaved, userPlan = 'free' }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Subdomain section
  const [editingSubdomain, setEditingSubdomain] = useState(false);
  const [newSubdomain, setNewSubdomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainError, setSubdomainError] = useState(null);
  const [confirmSubdomainDialogOpen, setConfirmSubdomainDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [subdomainSaving, setSubdomainSaving] = useState(false);
  const [subdomainSuccess, setSubdomainSuccess] = useState(false);
  const [copiedSubdomain, setCopiedSubdomain] = useState(false);

  // Custom domain section
  const [domainWizardOpen, setDomainWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [customDomain, setCustomDomain] = useState('');
  const [dnsProvider, setDnsProvider] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [verifyRecord, setVerifyRecord] = useState(null);

  const debounceRef = useRef(null);

  const subdomain = website?.subdomain || website?.slug || '';
  const subdomainUrl = `${subdomain}.techietribe.app`;
  const canUseCustomDomain = PLAN_ALLOWS_CUSTOM_DOMAIN.includes(userPlan || '');

  const handleCopySubdomain = useCallback(() => {
    navigator.clipboard?.writeText(subdomainUrl).catch(() => {});
    setCopiedSubdomain(true);
    setTimeout(() => setCopiedSubdomain(false), 2000);
  }, [subdomainUrl]);

  const checkSubdomainAvailability = useCallback(async (value) => {
    if (!value || !SUBDOMAIN_REGEX.test(value)) {
      setSubdomainAvailable(null);
      return;
    }
    try {
      setSubdomainChecking(true);
      const res = await axios.get(`${API_URL}/domains/check-availability?subdomain=${encodeURIComponent(value)}`);
      setSubdomainAvailable(res.data?.available !== false);
    } catch {
      setSubdomainAvailable(null);
    } finally {
      setSubdomainChecking(false);
    }
  }, []);

  const handleSubdomainInput = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setNewSubdomain(value);
      setSubdomainError(null);
      setSubdomainAvailable(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value && !SUBDOMAIN_REGEX.test(value)) {
          setSubdomainError('Subdomain can only contain lowercase letters, numbers, and hyphens.');
          return;
        }
        checkSubdomainAvailability(value);
      }, 500);
    },
    [checkSubdomainAvailability]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSubdomainSave = async () => {
    try {
      setSubdomainSaving(true);
      const res = await axios.patch(`${API_URL}/domains/${websiteId}/subdomain`, {
        subdomain: newSubdomain,
      });
      // Backend returns { subdomain, canonicalUrl }
      if (onSaved) onSaved({ ...website, subdomain: res.data?.subdomain || newSubdomain });
      setConfirmSubdomainDialogOpen(false);
      setEditingSubdomain(false);
      setConfirmText('');
      setSubdomainSuccess(true);
      setTimeout(() => setSubdomainSuccess(false), 3000);
    } catch (err) {
      setSubdomainError(err?.response?.data?.message || 'Failed to update subdomain.');
      setConfirmSubdomainDialogOpen(false);
    } finally {
      setSubdomainSaving(false);
    }
  };

  const handleAddCustomDomain = async () => {
    try {
      const res = await axios.post(`${API_URL}/domains/${websiteId}/custom-domain`, {
        domain: customDomain,
      });
      // Backend returns { domain, verifyRecord: { type, name, value }, status }
      // Store verify info so the wizard can display it in the DNS step
      setVerifyRecord(res.data?.verifyRecord || null);
      setWizardStep(1);
    } catch (err) {
      setVerifyError(err?.response?.data?.message || 'Failed to add custom domain.');
    }
  };

  const handleVerifyDomain = async () => {
    try {
      setVerifying(true);
      setVerifyError(null);
      const res = await axios.post(`${API_URL}/domains/${websiteId}/custom-domain/verify`);
      // Backend returns { verified: boolean, status?: string, error?: string }
      if (res.data?.verified) {
        setWizardStep(3);
      } else {
        setVerifyError(res.data?.error || 'Domain verification failed. Please check your DNS records.');
      }
    } catch (err) {
      setVerifyError(err?.response?.data?.message || 'Domain verification failed. Please check your DNS records.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveCustomDomain = async () => {
    try {
      await axios.delete(`${API_URL}/domains/${websiteId}/custom-domain`);
      if (onSaved) onSaved({ ...website, customDomain: null, domainStatus: 'NONE' });
    } catch {
      // Silently fail removal errors — user can retry
    }
  };

  const CopyRecord = ({ label, value }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 1.5,
        borderRadius: 1,
        border: `1px solid ${colors.border}`,
        background: alpha(colors.text, 0.03),
        mb: 1,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', width: 80, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box
        component="code"
        sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {value}
      </Box>
      <DashboardIconButton
        size="small"
        onClick={() => navigator.clipboard?.writeText(value).catch(() => {})}
        aria-label={`Copy ${label}`}
      >
        <Copy size={14} />
      </DashboardIconButton>
    </Box>
  );

  return (
    <Box>
      {subdomainSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Subdomain updated successfully.
        </Alert>
      )}

      {/* Subdomain section */}
      <DashboardCard icon={Globe} title="Subdomain" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box
            component="code"
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(colors.text, 0.05),
              border: `1px solid ${colors.border}`,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: 'text.primary',
              minWidth: 200,
            }}
          >
            {subdomainUrl}
          </Box>
          <DashboardIconButton
            onClick={handleCopySubdomain}
            aria-label="Copy subdomain URL"
          >
            {copiedSubdomain ? <Check size={16} /> : <Copy size={16} />}
          </DashboardIconButton>
        </Box>

        {!editingSubdomain ? (
          <DashboardActionButton
            variant="outlined"
            size="small"
            onClick={() => {
              setEditingSubdomain(true);
              setNewSubdomain(subdomain);
            }}
            aria-label="Change subdomain"
          >
            Change Subdomain
          </DashboardActionButton>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {subdomainError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {subdomainError}
              </Alert>
            )}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <DashboardInput
                value={newSubdomain}
                onChange={handleSubdomainInput}
                size="small"
                placeholder="your-subdomain"
                InputProps={{
                  endAdornment: (
                    <Box sx={{ color: 'text.secondary', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      .techietribe.app
                    </Box>
                  ),
                }}
                aria-label="New subdomain"
                helperText={
                  subdomainChecking ? (
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CircularProgress size={10} /> Checking availability...
                    </Box>
                  ) : subdomainAvailable === true ? (
                    <Box component="span" sx={{ color: 'success.main' }}>
                      <Check size={12} style={{ verticalAlign: 'middle' }} /> Available
                    </Box>
                  ) : subdomainAvailable === false ? (
                    <Box component="span" sx={{ color: 'error.main' }}>
                      <X size={12} style={{ verticalAlign: 'middle' }} /> Already taken
                    </Box>
                  ) : null
                }
                error={!!subdomainError}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <DashboardCancelButton
                onClick={() => {
                  setEditingSubdomain(false);
                  setSubdomainError(null);
                  setSubdomainAvailable(null);
                }}
              />
              <DashboardGradientButton
                size="small"
                onClick={() => setConfirmSubdomainDialogOpen(true)}
                disabled={!subdomainAvailable || subdomainChecking || subdomainSaving}
                aria-label="Confirm subdomain change"
              >
                {subdomainSaving ? 'Saving...' : 'Save Subdomain'}
              </DashboardGradientButton>
            </Box>
          </Box>
        )}
      </DashboardCard>

      {/* Custom domain section */}
      <DashboardCard icon={Globe} title="Custom Domain" sx={{ mb: 3 }}>
        {!canUseCustomDomain ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Lock size={32} style={{ color: colors.textSecondary, marginBottom: 8 }} />
            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Available on Growth Plan or Higher
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Upgrade your plan to connect your own domain like yourbrand.com.
            </Typography>
            <DashboardGradientButton
              component="a"
              href="/dashboard/settings/billing"
              aria-label="Upgrade plan to use custom domain"
            >
              Upgrade Plan
            </DashboardGradientButton>
          </Box>
        ) : website?.customDomain ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="body1" sx={{ flex: 1, color: 'text.primary', fontFamily: 'monospace' }}>
                {website.customDomain}
              </Typography>
              <Chip
                label={website.domainStatus || 'Pending'}
                color={website.domainStatus === 'ACTIVE' ? 'success' : 'warning'}
                size="small"
              />
              <DashboardCancelButton
                size="small"
                onClick={handleRemoveCustomDomain}
              >
                Remove Domain
              </DashboardCancelButton>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Connect your own domain (e.g., yourbrand.com) to your website.
            </Typography>
            <DashboardGradientButton
              startIcon={<ChevronRight size={16} />}
              onClick={() => setDomainWizardOpen(true)}
              aria-label="Add custom domain"
            >
              Add Custom Domain
            </DashboardGradientButton>
          </Box>
        )}
      </DashboardCard>

      {/* Subdomain change confirmation dialog */}
      <Dialog
        open={confirmSubdomainDialogOpen}
        onClose={() => {
          setConfirmSubdomainDialogOpen(false);
          setConfirmText('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Subdomain Change</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Changing your subdomain will break any existing links to your website.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your new URL will be:{' '}
            <Box component="code" sx={{ fontFamily: 'monospace' }}>
              {newSubdomain}.techietribe.app
            </Box>
          </Typography>
          <DashboardInput
            label={`Type "${newSubdomain}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            fullWidth
            autoFocus
            inputProps={{ 'aria-label': 'Type subdomain to confirm change' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton
            onClick={() => {
              setConfirmSubdomainDialogOpen(false);
              setConfirmText('');
            }}
          />
          <DashboardGradientButton
            onClick={handleSubdomainSave}
            disabled={confirmText !== newSubdomain || subdomainSaving}
            aria-label="Confirm and save subdomain"
          >
            {subdomainSaving ? 'Saving...' : 'Confirm Change'}
          </DashboardGradientButton>
        </DialogActions>
      </Dialog>

      {/* Domain wizard dialog */}
      <Dialog
        open={domainWizardOpen}
        onClose={() => {
          setDomainWizardOpen(false);
          setWizardStep(0);
          setCustomDomain('');
          setVerifyError(null);
          setVerifyRecord(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Custom Domain</DialogTitle>
        <DialogContent>
          <Stepper activeStep={wizardStep} orientation="vertical">
            {/* Step 0: Enter Domain */}
            <Step>
              <StepLabel>Enter Domain</StepLabel>
              <StepContent>
                <DashboardInput
                  label="Domain Name"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim())}
                  fullWidth
                  placeholder="yourbrand.com"
                  helperText="Enter your domain without http:// or www."
                  inputProps={{ 'aria-label': 'Custom domain name' }}
                  sx={{ mt: 1, mb: 2 }}
                />
                {verifyError && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {verifyError}
                  </Alert>
                )}
                <DashboardGradientButton
                  onClick={handleAddCustomDomain}
                  disabled={!customDomain}
                  size="small"
                >
                  Next
                </DashboardGradientButton>
              </StepContent>
            </Step>

            {/* Step 1: Configure DNS */}
            <Step>
              <StepLabel>Configure DNS</StepLabel>
              <StepContent>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Add these DNS records to your domain registrar:
                </Typography>
                <CopyRecord label="CNAME" value={`${website?.subdomain}.techietribe.app`} />
                <CopyRecord label="A Record" value="76.76.21.21" />
                {verifyRecord && (
                  <>
                    <Typography variant="body2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                      Add this TXT record to verify domain ownership:
                    </Typography>
                    <CopyRecord label="TXT Name" value={verifyRecord.name || `_techietribe-verify.${customDomain}`} />
                    <CopyRecord label="TXT Value" value={verifyRecord.value || ''} />
                  </>
                )}

                <Tabs
                  value={dnsProvider}
                  onChange={(_, v) => setDnsProvider(v)}
                  sx={{ mt: 2, mb: 1 }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {DNS_PROVIDERS.map((p) => (
                    <Tab key={p} label={p} />
                  ))}
                </Tabs>
                <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                  {DNS_INSTRUCTIONS[DNS_PROVIDERS[dnsProvider]]}
                </Alert>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <DashboardCancelButton onClick={() => setWizardStep(0)} />
                  <DashboardGradientButton onClick={() => setWizardStep(2)} size="small">
                    Next
                  </DashboardGradientButton>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Verify Domain */}
            <Step>
              <StepLabel>Verify Domain</StepLabel>
              <StepContent>
                {verifyError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {verifyError}
                  </Alert>
                )}
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Ensure the TXT record below is published in your DNS, then click Verify.
                </Typography>
                {verifyRecord && (
                  <>
                    <CopyRecord label="TXT Name" value={verifyRecord.name || `_techietribe-verify.${customDomain}`} />
                    <CopyRecord label="TXT Value" value={verifyRecord.value || ''} />
                  </>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <DashboardCancelButton onClick={() => setWizardStep(1)} />
                  <DashboardGradientButton
                    onClick={handleVerifyDomain}
                    disabled={verifying}
                    size="small"
                  >
                    {verifying ? 'Verifying...' : 'Verify Domain'}
                  </DashboardGradientButton>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: SSL Provisioning */}
            <Step>
              <StepLabel>SSL Provisioning</StepLabel>
              <StepContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Domain verified! SSL certificate provisioning is in progress. This may take a few minutes.
                  The domain status will update automatically once provisioning completes.
                </Alert>
                <DashboardGradientButton
                  onClick={() => {
                    setDomainWizardOpen(false);
                    setWizardStep(0);
                    if (onSaved) onSaved({ ...website, customDomain, domainStatus: 'VERIFIED' });
                    setCustomDomain('');
                    setVerifyRecord(null);
                  }}
                  size="small"
                >
                  Done
                </DashboardGradientButton>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton
            onClick={() => {
              setDomainWizardOpen(false);
              setWizardStep(0);
              setCustomDomain('');
              setVerifyError(null);
              setVerifyRecord(null);
            }}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
});

DomainTab.displayName = 'DomainTab';

export default DomainTab;
