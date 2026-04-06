/**
 * AccountDelegateInviteModal (Step 7.15.2)
 *
 * Dialog component for inviting a delegate to manage an account.
 * Supports:
 * - Email input with client-side validation
 * - Role selection (ACCOUNT_ADMIN, ACCOUNT_COLLABORATOR)
 * - Service scope checkboxes for ACCOUNT_COLLABORATOR role
 * - Rate limit (429) and generic error handling
 * - Double-submit prevention
 *
 * Props:
 *   - open: boolean - Whether the modal is open
 *   - onClose: () => void - Close handler
 *   - onSuccess: () => void - Called after successful invite (to refresh list)
 */

import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { X, UserPlus, Mail } from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardInput,
  DashboardGradientButton,
  DashboardCancelButton,
} from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DELEGATE_ROLES = [
  {
    value: 'ACCOUNT_ADMIN',
    label: 'Account Admin',
    description: 'Full access to manage websites, insights, templates, and team settings',
  },
  {
    value: 'ACCOUNT_COLLABORATOR',
    label: 'Account Collaborator',
    description: 'Limited access based on selected service scopes',
  },
];

const SERVICE_SCOPES = [
  { value: 'websites', label: 'Websites', description: 'Create and manage websites' },
  { value: 'insights', label: 'Insights', description: 'View and manage analytics' },
  { value: 'templates', label: 'Templates', description: 'Create and manage templates' },
  { value: 'billing', label: 'Billing', description: 'View billing and invoices' },
  { value: 'settings', label: 'Settings', description: 'Manage account settings' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AccountDelegateInviteModal = React.memo(function AccountDelegateInviteModal({
  open,
  onClose,
  onSuccess,
}) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const muiTheme = useTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ACCOUNT_ADMIN');
  const [serviceScopes, setServiceScopes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);

  const resetForm = useCallback(() => {
    setEmail('');
    setRole('ACCOUNT_ADMIN');
    setServiceScopes([]);
    setSubmitting(false);
    setError(null);
    setEmailError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  }, [submitting, resetForm, onClose]);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setEmailError(null);
    setError(null);
  }, []);

  const handleRoleChange = useCallback((e) => {
    setRole(e.target.value);
    if (e.target.value === 'ACCOUNT_ADMIN') {
      setServiceScopes([]);
    }
  }, []);

  const handleScopeToggle = useCallback((scopeValue) => {
    setServiceScopes((prev) =>
      prev.includes(scopeValue)
        ? prev.filter((s) => s !== scopeValue)
        : [...prev, scopeValue]
    );
  }, []);

  const isCollaborator = useMemo(() => role === 'ACCOUNT_COLLABORATOR', [role]);

  const validateEmail = useCallback((emailValue) => {
    const trimmed = emailValue.trim();
    if (!trimmed) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return 'Please enter a valid email address';
    }
    return null;
  }, []);

  const handleSubmit = useCallback(async () => {
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setEmailError(null);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        role,
      };
      if (isCollaborator && serviceScopes.length > 0) {
        payload.serviceScopes = serviceScopes;
      }

      await axios.post(`${API_URL}/account/delegates/invite`, payload);
      resetForm();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 429) {
        setError(message || 'Too many invites. Please try again later.');
      } else {
        setError(message || 'Failed to send invite. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, role, isCollaborator, serviceScopes, validateEmail, resetForm, onClose, onSuccess]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby="delegate-invite-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: colors.bgCard,
          borderRadius: fullScreen ? 0 : '12px',
          border: fullScreen ? 'none' : `1px solid ${colors.border}`,
          maxWidth: fullScreen ? '100%' : 500,
        },
      }}
    >
      <DialogTitle
        id="delegate-invite-dialog-title"
        sx={{
          color: colors.text,
          fontWeight: 700,
          borderBottom: `0.5px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <UserPlus size={20} />
          <Typography variant="h6" fontWeight={700}>
            Invite a Delegate
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={submitting}
          aria-label="Close invite dialog"
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            role="alert"
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Email Input */}
        <Box sx={{ mb: 3 }}>
          <DashboardInput
            label="Email Address"
            aria-label="Email address"
            value={email}
            onChange={handleEmailChange}
            disabled={submitting}
            type="email"
            placeholder="delegate@example.com"
            error={!!emailError}
            helperText={emailError}
            fullWidth
          />
        </Box>

        {/* Role Selection */}
        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
          <FormLabel
            component="legend"
            sx={{ color: colors.text, fontWeight: 600, mb: 1, fontSize: '0.95rem' }}
          >
            Delegate Role
          </FormLabel>
          <RadioGroup
            aria-label="Select delegate role"
            value={role}
            onChange={handleRoleChange}
          >
            {DELEGATE_ROLES.map((r) => (
              <FormControlLabel
                key={r.value}
                value={r.value}
                control={
                  <Radio
                    sx={{
                      color: colors.textSecondary,
                      '&.Mui-checked': { color: colors.primary },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      {r.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.textSecondary }}
                    >
                      {r.description}
                    </Typography>
                  </Box>
                }
                sx={{
                  alignItems: 'flex-start',
                  py: 0.5,
                  mx: 0,
                  '& .MuiRadio-root': { pt: 0.5 },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Service Scopes (only for ACCOUNT_COLLABORATOR) */}
        {isCollaborator && (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel
              component="legend"
              sx={{ color: colors.text, fontWeight: 600, mb: 1, fontSize: '0.95rem' }}
            >
              Service Scopes
            </FormLabel>
            <Typography
              variant="caption"
              sx={{ color: colors.textSecondary, mb: 1.5, display: 'block' }}
            >
              Select which areas this delegate can access
            </Typography>
            <FormGroup>
              {SERVICE_SCOPES.map((scope) => (
                <FormControlLabel
                  key={scope.value}
                  control={
                    <Checkbox
                      checked={serviceScopes.includes(scope.value)}
                      onChange={() => handleScopeToggle(scope.value)}
                      disabled={submitting}
                      sx={{
                        color: colors.textSecondary,
                        '&.Mui-checked': { color: colors.primary },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text, fontWeight: 500 }}
                      >
                        {scope.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary }}
                      >
                        {scope.description}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    py: 0.25,
                    mx: 0,
                    '& .MuiCheckbox-root': { pt: 0.5 },
                  }}
                />
              ))}
            </FormGroup>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1.5,
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          '& > button': { width: { xs: '100%', sm: 'auto' } },
        }}
      >
        <DashboardCancelButton
          onClick={handleClose}
          disabled={submitting}
          aria-label="Cancel"
          sx={{ minHeight: 44 }}
        >
          Cancel
        </DashboardCancelButton>
        <DashboardGradientButton
          onClick={handleSubmit}
          disabled={submitting}
          aria-label="Send invite"
          startIcon={
            submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Mail size={16} />
            )
          }
          sx={{ minHeight: 44 }}
        >
          Send Invite
        </DashboardGradientButton>
      </DialogActions>
    </Dialog>
  );
});

AccountDelegateInviteModal.displayName = 'AccountDelegateInviteModal';

export default AccountDelegateInviteModal;
