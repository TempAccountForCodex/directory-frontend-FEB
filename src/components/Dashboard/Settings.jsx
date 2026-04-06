import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Alert,
  Grid,
  Paper,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Container,
  Skeleton,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Bell,
  CircleCheck,
  CircleUser,
  CreditCard,
  Crown,
  Gauge,
  Gift,
  Globe,
  Info,
  Lock,
  Mail,
  Plug,
  Save,
  Shield,
  Trash2,
  TriangleAlert,
  Upload,
  UserPlus,
  Users,
  Clock,
} from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import CodeInput from '../CodeInput';
import { usePlanSummary } from '../../hooks/usePlanSummary';
import ThemeSelector from './ThemeSelector';
import {
  DashboardCard,
  DashboardInput,
  DeleteAccountCard,
  EmptyState,
  PageHeader,
  MiniSideNav,
  DashboardGradientButton,
  InvoiceHistory,
  LoginHistoryCard,
  ChangePlanCard,
  AuditLogCard,
  ConfirmationDialog,
  BillingHistoryCard,
} from './shared';
import AccountDelegateInviteModal from './AccountDelegateInviteModal';
import ReferralDashboard from './settings/ReferralDashboard';
import DashboardActionButton from './shared/DashboardActionButton';
import DashboardCancelButton from './shared/DashboardCancelButton';
import DashboardConfirmButton from './shared/DashboardConfirmButton';
import BasicDetailsCard from './BasicDetailsCard';
import { isAdmin } from '../../constants/roles';
import { useBilling } from '../../hooks/useBilling';
import CancellationFlow from '../Settings/CancellationFlow';
import NotificationPreferences from './settings/NotificationPreferences';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const SETTINGS_NAV_SECTIONS = [
  {
    title: 'Personal',
    items: [
      { id: 'account', label: 'Account', icon: CircleUser },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: Lock },
    ],
  },
  {
    title: 'Organization',
    items: [
      { id: 'billing', label: 'Billing & plans', icon: CreditCard },
      { id: 'referrals', label: 'Referrals', icon: Gift },
      { id: 'team', label: 'Team', icon: Users },
      { id: 'integrations', label: 'Integrations', icon: Plug },
    ],
  },
];

const Settings = ({ subtab, pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const {
    user: authUser,
    updateUser,
    resendVerification,
    verifyEmail,
    requestEmailChange,
    confirmEmailChange,
    requestPasswordReset,
    resetPassword,
    unlinkGoogle,
    deleteAccount,
    changePassword: apiChangePassword,
  } = useAuth();

  const { planSummary, loading: planLoading } = usePlanSummary();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    displayImage: null,
  });

  // Email verification state
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState(0);

  // Email change state
  const [emailChangeDialogOpen, setEmailChangeDialogOpen] = useState(false);
  const [emailChangeStep, setEmailChangeStep] = useState('email');
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeCode, setEmailChangeCode] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeCooldown, setEmailChangeCooldown] = useState(0);

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState('email');
  const [passwordEmail, setPasswordEmail] = useState('');
  const [passwordCode, setPasswordCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordCooldown, setPasswordCooldown] = useState(0);

  // Google unlink state
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(subtab || 'account');

  // Billing hook — for cancel subscription and billing history
  const {
    billingDetails: billingData,
    cancelSubscription: cancelBillingSubscription,
    fetchBillingHistory,
    refetch: refetchBilling,
    subscriptionStatus: billingSubscriptionStatus,
    cancelledAt: billingCancelledAt,
    currentPeriodEnd: billingCurrentPeriodEnd,
  } = useBilling();

  // Cancellation flow state
  const [showCancellationFlow, setShowCancellationFlow] = useState(false);

  const isFreePlan = useMemo(
    () =>
      !planSummary?.websitePlan?.code ||
      planSummary.websitePlan.code === 'website_free',
    [planSummary]
  );

  const isCancellingState = useMemo(
    () => billingSubscriptionStatus === 'cancelled' && !!billingCancelledAt,
    [billingSubscriptionStatus, billingCancelledAt]
  );

  const showCancelButton = useMemo(
    () => !isFreePlan && !isCancellingState,
    [isFreePlan, isCancellingState]
  );

  const handleCancelSubscription = useCallback(
    async (options) => {
      const result = await cancelBillingSubscription(options);
      if (result) {
        setShowCancellationFlow(false);
        await refetchBilling();
      }
      return result;
    },
    [cancelBillingSubscription, refetchBilling]
  );

  const handleCloseCancellationFlow = useCallback(() => {
    setShowCancellationFlow(false);
  }, []);

  const handleShowCancellationFlow = useCallback(() => {
    setShowCancellationFlow(true);
  }, []);

  // Delegate management state (Step 7.15.1)
  const [delegates, setDelegates] = useState([]);
  const [delegatesLoading, setDelegatesLoading] = useState(false);
  const [delegatesError, setDelegatesError] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [delegateToRevoke, setDelegateToRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);

  // Update active section when subtab changes (e.g. from URL or profile dropdown)
  useEffect(() => {
    if (subtab && subtab !== activeSection) {
      setActiveSection(subtab);
    }
  }, [subtab]);

  const activeSectionLabel = useMemo(() => {
    for (const section of SETTINGS_NAV_SECTIONS) {
      const match = section.items.find((item) => item.id === activeSection);
      if (match) return match.label;
    }
    return 'Account';
  }, [activeSection]);

  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        name: authUser.name || '',
      }));
      if (authUser.displayImage) {
        setPreviewImage(getImageUrl(authUser.displayImage));
      } else {
        setPreviewImage('');
      }
    }
  }, [authUser]);

  // Cooldown timers
  useEffect(() => {
    if (verifyCooldown > 0) {
      const timer = setTimeout(() => setVerifyCooldown(verifyCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [verifyCooldown]);

  useEffect(() => {
    if (emailChangeCooldown > 0) {
      const timer = setTimeout(() => setEmailChangeCooldown(emailChangeCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailChangeCooldown]);

  useEffect(() => {
    if (passwordCooldown > 0) {
      const timer = setTimeout(() => setPasswordCooldown(passwordCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [passwordCooldown]);

  // ── Delegate Management (Step 7.15.1) ──────────────────────────────────────

  const fetchDelegates = useCallback(async () => {
    setDelegatesLoading(true);
    setDelegatesError(null);
    try {
      const [delegateRes, inviteRes] = await Promise.all([
        axios.get(`${API_URL}/account/delegates`),
        axios.get(`${API_URL}/account/delegates/invites/pending`),
      ]);
      setDelegates(delegateRes.data?.delegates || []);
      setPendingInvites(inviteRes.data?.invites || []);
    } catch (err) {
      setDelegatesError(err.response?.data?.message || 'Failed to load delegates');
    } finally {
      setDelegatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'team') {
      fetchDelegates();
    }
  }, [activeSection, fetchDelegates]);

  const handleOpenInviteModal = useCallback(() => {
    setInviteModalOpen(true);
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setInviteModalOpen(false);
  }, []);

  const handleInviteSuccess = useCallback(() => {
    fetchDelegates();
  }, [fetchDelegates]);

  const handleOpenRevokeDialog = useCallback((delegate) => {
    setDelegateToRevoke(delegate);
    setRevokeDialogOpen(true);
  }, []);

  const handleCancelRevoke = useCallback(() => {
    setRevokeDialogOpen(false);
    setDelegateToRevoke(null);
  }, []);

  const handleConfirmRevoke = useCallback(async () => {
    if (!delegateToRevoke) return;
    setRevoking(true);
    try {
      await axios.delete(`${API_URL}/account/delegates/${delegateToRevoke.id}`);
      setRevokeDialogOpen(false);
      setDelegateToRevoke(null);
      fetchDelegates();
    } catch (err) {
      setDelegatesError(err.response?.data?.message || 'Failed to revoke delegate');
      setRevokeDialogOpen(false);
      setDelegateToRevoke(null);
    } finally {
      setRevoking(false);
    }
  }, [delegateToRevoke, fetchDelegates]);

  // isFreePlan already declared above (line ~187) — reuse it for delegation section

  const delegateRoleLabel = useCallback((role) => {
    switch (role) {
      case 'ACCOUNT_ADMIN': return 'Account Admin';
      case 'ACCOUNT_COLLABORATOR': return 'Account Collaborator';
      default: return role;
    }
  }, []);

  const delegateRoleColor = useCallback((role) => {
    switch (role) {
      case 'ACCOUNT_ADMIN': return '#2196f3';
      case 'ACCOUNT_COLLABORATOR': return '#4caf50';
      default: return '#9e9e9e';
    }
  }, []);

  // Memoized styles for better scroll performance
  const cardStyles = useMemo(
    () => ({
      p: 3,
      mb: 3,
      background: colors.bgCard,
      backdropFilter: 'blur(10px)', // Reduced from 20px for better performance
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      boxShadow: colors.shadow,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        boxShadow: colors.shadowMd,
        transform: 'translateY(-2px)',
      },
    }),
    [colors]
  );

  const headerGradientStyles = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }),
    [colors]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        displayImage: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleNavChange = useCallback(
    (nextId) => {
      navigate(`/dashboard/settings/${nextId}`);
    },
    [navigate]
  );

  const handleUpdateProfile = useCallback(
    async (profileData) => {
      setError('');
      setSuccess('');
      setLoading(true);

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', profileData.name);

        if (profileData.title !== undefined) {
          formDataToSend.append('title', profileData.title);
        }

        if (profileData.biography !== undefined) {
          formDataToSend.append('biography', profileData.biography);
        }

        if (profileData.displayImage instanceof File) {
          formDataToSend.append('displayImage', profileData.displayImage);
        } else if (profileData.displayImage === 'remove') {
          // You might need a specific backend field or logic to handle 'remove'
          // For now, let's assume we handle it via the absence of a file or a clear flag
          formDataToSend.append('removeImage', 'true');
        }

        const response = await axios.put(`${API_URL}/account`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Update the user in AuthContext with the response data
        updateUser(response.data.user);

        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
    [updateUser]
  );

  // Email verification handlers
  const handleSendVerificationCode = useCallback(async () => {
    if (!authUser?.email) return;

    setVerifyLoading(true);
    setError('');

    try {
      const result = await resendVerification(authUser.email);
      if (result.success) {
        setVerifyDialogOpen(true);
        setVerifyCooldown(60);
        setSuccess('Verification code sent to your email');
      } else {
        setError(result.message || 'Failed to send verification code');
        if (result.retryAfter) {
          setVerifyCooldown(result.retryAfter);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setVerifyLoading(false);
    }
  }, [authUser, resendVerification]);

  const handleVerifyEmail = async () => {
    if (!authUser?.email || verifyCode.length !== 6) return;

    setVerifyLoading(true);
    setError('');

    try {
      const result = await verifyEmail(authUser.email, verifyCode);
      if (result.success) {
        setSuccess('Email verified successfully!');
        setVerifyDialogOpen(false);
        setVerifyCode('');
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    if (!authUser?.email || verifyCooldown > 0) return;

    setVerifyLoading(true);
    setError('');

    try {
      const result = await resendVerification(authUser.email);
      if (result.success) {
        setVerifyCooldown(60);
        setVerifyCode('');
        setSuccess('Verification code resent');
      } else {
        setError(result.message || 'Failed to resend code');
        if (result.retryAfter) {
          setVerifyCooldown(result.retryAfter);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Email change handlers
  const handleRequestEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setEmailChangeLoading(true);
    setError('');

    try {
      const result = await requestEmailChange(newEmail);
      if (result.success) {
        setEmailChangeStep('code');
        setEmailChangeCooldown(60);
        setSuccess('Verification code sent to your new email');
      } else {
        setError(result.message || 'Failed to send verification code');
        if (result.retryAfter) {
          setEmailChangeCooldown(result.retryAfter);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    if (emailChangeCode.length !== 6) return;

    setEmailChangeLoading(true);
    setError('');

    try {
      const result = await confirmEmailChange(emailChangeCode);
      if (result.success) {
        setSuccess(`Email successfully changed to ${result.newEmail}`);
        setEmailChangeDialogOpen(false);
        setEmailChangeStep('email');
        setNewEmail('');
        setEmailChangeCode('');
      } else {
        setError(result.message || 'Email change failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleResendEmailChangeCode = async () => {
    if (!newEmail || emailChangeCooldown > 0) return;

    setEmailChangeLoading(true);
    setError('');

    try {
      const result = await requestEmailChange(newEmail);
      if (result.success) {
        setEmailChangeCooldown(60);
        setEmailChangeCode('');
        setSuccess('Verification code resent');
      } else {
        setError(result.message || 'Failed to resend code');
        if (result.retryAfter) {
          setEmailChangeCooldown(result.retryAfter);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Password change handlers
  const handleOpenPasswordDialog = () => {
    setPasswordEmail(authUser?.email || '');
    setPasswordDialogOpen(true);
  };

  const handleRequestPasswordReset = async () => {
    if (!passwordEmail || !passwordEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setPasswordLoading(true);
    setError('');

    try {
      const result = await requestPasswordReset(passwordEmail);
      if (result.success) {
        setPasswordStep('code');
        setPasswordCooldown(60);
        setSuccess('Password reset code sent to your email');
      } else {
        setError(result.message || 'Failed to send reset code');
        if (result.retryAfter) {
          setPasswordCooldown(result.retryAfter);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (passwordCode.length !== 6 || !newPassword || newPassword.length < 6) {
      setError('Please enter a valid code and password (min 6 characters)');
      return;
    }

    setPasswordLoading(true);
    setError('');

    try {
      const result = await resetPassword(passwordEmail, passwordCode, newPassword);
      if (result.success) {
        setSuccess('Password changed successfully!');
        setPasswordDialogOpen(false);
        setPasswordStep('email');
        setPasswordCode('');
        setNewPassword('');
      } else {
        setError(result.message || 'Password reset failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendPasswordCode = async () => {
    if (!passwordEmail || passwordCooldown > 0) return;

    setPasswordLoading(true);
    setError('');

    try {
      const result = await requestPasswordReset(passwordEmail);
      if (result.success) {
        setPasswordCooldown(60);
        setPasswordCode('');
        setSuccess('Reset code resent');
      } else {
        setError(result.message || 'Failed to resend code');
        if (result.retryAfter) {
          setPasswordCooldown(result.retryAfter);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Google unlink handler
  const handleUnlinkGoogle = async () => {
    setUnlinkLoading(true);
    setError('');

    try {
      const result = await unlinkGoogle();
      if (result.success) {
        setSuccess('Google account disconnected successfully');
        setUnlinkDialogOpen(false);
      } else {
        setError(result.message || 'Failed to disconnect Google account');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setUnlinkLoading(false);
    }
  };

  const handleDeleteAccount = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await deleteAccount();
      if (result.success) {
        // Redirect will happen automatically because AuthContext sets user to null
        // which triggers a re-render and ProtectedRoute will redirect to login
        setSuccess('Account successfully deleted. You will be redirected.');
      } else {
        setError(result.message || 'Failed to delete account');
      }
    } catch (err) {
      setError('An unexpected error occurred during account deletion');
    } finally {
      setLoading(false);
    }
  }, [deleteAccount]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  const handlePasswordChange = async (passwordData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiChangePassword(passwordData.oldPassword, passwordData.newPassword);
      if (result.success) {
        setSuccess('Password updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to update password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <PageHeader title={pageTitle} subtitle={pageSubtitle} />
        <Alert severity="warning">Please sign in to view settings.</Alert>
      </Container>
    );
  }

  const profileAvatar = previewImage || getImageUrl(authUser.displayImage);

  return (
    <Box>
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, ${colors.success} 0%, ${alpha(colors.success, 0.8)} 100%)`,
            color: colors.textLight,
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(colors.success, 0.3)}`,
            border: 'none',
            '& .MuiAlert-icon': {
              color: colors.textLight,
            },
          }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, ${colors.error} 0%, ${alpha(colors.error, 0.8)} 100%)`,
            color: colors.textLight,
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(colors.error, 0.3)}`,
            border: 'none',
            '& .MuiAlert-icon': {
              color: colors.textLight,
            },
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '240px 1fr' },
          gap: { xs: 3, lg: 4 },
          alignItems: 'start',
          mt: 1,
        }}
      >
        <MiniSideNav
          profile={{
            name: authUser.name || 'Account',
            email: authUser.email,
            avatarSrc: profileAvatar,
          }}
          sections={SETTINGS_NAV_SECTIONS}
          activeItem={activeSection}
          onChange={handleNavChange}
        />
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: colors.text,
              fontWeight: 600,
              mb: 3,
              fontSize: { xs: '2rem', md: '2rem' },
            }}
          >
            {activeSectionLabel}
          </Typography>

          {activeSection === 'account' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <BasicDetailsCard
                user={authUser}
                onSave={handleUpdateProfile}
                onCancel={() => navigate('/dashboard')}
                loading={loading}
              />
              <ThemeSelector variant="inline" />
              <DeleteAccountCard onDelete={handleDeleteAccount} />
            </Box>
          )}

          {activeSection === 'security' && (
            <Stack spacing={3}>
              <DashboardCard icon={Mail} title="Email & Verification">
                <Divider sx={{ mb: 1, opacity: 0.8 }} />
                {!authUser ? (
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                ) : (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current Email
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.text, fontWeight: 500 }}>
                        {authUser.email}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {authUser.emailVerified ? (
                          <Chip
                            icon={<CircleCheck size={14} />}
                            label="Verified"
                            size="small"
                            sx={{
                              bgcolor: alpha(colors.success, 0.1),
                              color: colors.success,
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-icon': { color: colors.success },
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<TriangleAlert size={14} />}
                            label="Not Verified"
                            size="small"
                            sx={{
                              bgcolor: alpha('#f59e0b', 0.1),
                              color: '#f59e0b',
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-icon': { color: '#f59e0b' },
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                      {!authUser.emailVerified && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleSendVerificationCode}
                          disabled={verifyLoading || verifyCooldown > 0}
                          sx={{
                            color: colors.primary,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { bgcolor: alpha(colors.primary, 0.05) },
                          }}
                        >
                          {verifyLoading ? (
                            <CircularProgress size={16} />
                          ) : verifyCooldown > 0 ? (
                            `Wait ${verifyCooldown}s`
                          ) : (
                            'Verify now'
                          )}
                        </Button>
                      )}
                      <DashboardActionButton
                        size="small"
                        onClick={() => setEmailChangeDialogOpen(true)}
                        sx={{
                          px: 3,
                          py: 1,
                          borderRadius: '8px',
                          textTransform: 'none',
                          boxShadow: 'none',
                        }}
                      >
                        Change Email
                      </DashboardActionButton>
                    </Box>
                  </Box>
                )}
              </DashboardCard>

              <DashboardCard icon={Lock} title="Password">
                <Divider sx={{ mb: 1, opacity: 0.8 }} />
                {!authUser ? (
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {authUser.googleId && !authUser.password
                        ? 'You signed in with Google. Set a password to enable password-based signin.'
                        : 'Change your password for account security. You will receive a reset code via email.'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <DashboardActionButton
                        size="small"
                        onClick={handleOpenPasswordDialog}
                        sx={{
                          px: 3,
                          py: 1,
                          borderRadius: '8px',
                          textTransform: 'none',
                          boxShadow: 'none',
                        }}
                      >
                        {authUser.googleId && !authUser.password
                          ? 'Set Password'
                          : 'Update Password'}
                      </DashboardActionButton>
                    </Box>
                  </Box>
                )}
              </DashboardCard>

              <DashboardCard icon={Globe} title="Google Account">
                <Divider sx={{ mb: 1, opacity: 0.8 }} />
                {!authUser ? (
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {authUser.googleId ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Your account is connected to Google.
                          </Typography>
                          <Chip
                            icon={<CircleCheck size={14} />}
                            label="Connected to Google"
                            size="small"
                            sx={{
                              alignSelf: 'flex-start',
                              bgcolor: alpha(colors.success, 0.1),
                              color: colors.success,
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: colors.success },
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Connect your Google account for quick signin.
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      {authUser.googleId ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setUnlinkDialogOpen(true)}
                          disabled={unlinkLoading}
                          sx={{
                            background: 'transparent',
                            color: colors.error,
                            border: `1px solid ${alpha(colors.error, 0.4)}`,
                            boxShadow: 'none',
                            bordderRadius: 20,
                            px: 3,
                            '&:hover': {
                              background: alpha(colors.error, 0.05),
                              border: `1px solid ${colors.error}`,
                              boxShadow: `0 4px 12px ${alpha(colors.error, 0.1)}`,
                            },
                          }}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <DashboardActionButton
                          size="small"
                          onClick={() => {
                            window.location.href = 'http://localhost:5001/api/auth/google/start';
                          }}
                          sx={{
                            bgcolor: colors.success,
                            color: colors.textLight,
                            '&:hover': { bgcolor: alpha(colors.success, 0.8) },
                            px: 3,
                            py: 1,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                          }}
                        >
                          Connect Google
                        </DashboardActionButton>
                      )}
                    </Box>
                  </Box>
                )}
              </DashboardCard>

              <LoginHistoryCard />

              {isAdmin(authUser.role) && <AuditLogCard />}
            </Stack>
          )}

          {activeSection === 'billing' && (
            <Box>
              <ChangePlanCard />
              <Box sx={{ mt: 3 }}>
                <DashboardCard icon={Gauge} title="Plan & Limits">
                <Divider sx={{ mb: 2, opacity: 0.8 }} />

                {planLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading plan information...
                    </Typography>
                  </Box>
                ) : planSummary ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ color: colors.text }}
                        >
                          {planSummary.websitePlan.name}
                        </Typography>
                        <Chip
                          label={
                            planSummary.websitePlan.priceMonthlyUsd === 0
                              ? 'Free'
                              : `$${planSummary.websitePlan.priceMonthlyUsd}/mo`
                          }
                          size="small"
                          sx={{
                            bgcolor: alpha(colors.primary, 0.1),
                            color: colors.primary,
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Websites
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ color: colors.text }}
                          >
                            {planSummary.websiteUsage.websitesOwned} /{' '}
                            {planSummary.websitePlan.maxSites}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (planSummary.websiteUsage.websitesOwned /
                              planSummary.websitePlan.maxSites) *
                            100
                          }
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: alpha(colors.textSecondary, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor:
                                planSummary.websiteUsage.websitesOwned >=
                                planSummary.websitePlan.maxSites
                                  ? colors.error
                                  : colors.primary,
                            },
                          }}
                        />
                        {planSummary.websiteUsage.websitesOwned >=
                          planSummary.websitePlan.maxSites && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            <Box sx={{ color: colors.error }}>
                              <Info size={16} />
                            </Box>
                            <Typography variant="caption" sx={{ color: colors.error }}>
                              Website limit reached. Upgrade to create more websites.
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Max Pages per Website
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ color: colors.text }}
                          >
                            {planSummary.websitePlan.maxPagesPerSite}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Max Sections per Page
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ color: colors.text }}
                          >
                            {planSummary.websitePlan.maxBlocksPerPage}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          gutterBottom
                        >
                          Features
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip
                            label={
                              planSummary.websitePlan.listedInDirectory
                                ? 'Directory Listing'
                                : 'No Directory Listing'
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: planSummary.websitePlan.listedInDirectory
                                ? colors.primary
                                : colors.border,
                              color: planSummary.websitePlan.listedInDirectory
                                ? colors.primary
                                : colors.textSecondary,
                            }}
                          />
                          <Chip
                            label={`${planSummary.websitePlan.analyticsLevel} Analytics`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: colors.border,
                              color: colors.textSecondary,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {planSummary.storePlan.code && (
                      <>
                        <Divider sx={{ my: 2, opacity: 0.8 }} />
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              sx={{ color: colors.text }}
                            >
                              {planSummary.storePlan.name}
                            </Typography>
                            <Chip
                              label={
                                planSummary.storePlan.priceMonthlyUsd === 0
                                  ? 'Free'
                                  : `$${planSummary.storePlan.priceMonthlyUsd}/mo`
                              }
                              size="small"
                              sx={{
                                bgcolor: alpha(colors.primary, 0.1),
                                color: colors.primary,
                                fontWeight: 600,
                              }}
                            />
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Max Stores
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{ color: colors.text }}
                              >
                                {planSummary.storePlan.maxStores}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Max Products per Store
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{ color: colors.text }}
                              >
                                {planSummary.storePlan.maxProductsPerStore}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Platform Fee
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{ color: colors.text }}
                              >
                                {planSummary.storePlan.platformFeePercent}%
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Analytics Level
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{ color: colors.text }}
                              >
                                {planSummary.storePlan.analyticsLevel}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unable to load plan information
                  </Typography>
                )}
                </DashboardCard>
              </Box>
              {/* Cancel Subscription button — only on paid plans, not when already cancelling */}
              {showCancelButton && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <DashboardCancelButton
                    onClick={handleShowCancellationFlow}
                    size="small"
                  >
                    Cancel Subscription
                  </DashboardCancelButton>
                </Box>
              )}

              {/* Inline CancellationFlow — shown below Plan & Limits */}
              {showCancellationFlow && (
                <CancellationFlow
                  currentPlan={planSummary?.websitePlan?.code || 'website_free'}
                  currentPeriodEnd={billingCurrentPeriodEnd}
                  onCancel={handleCancelSubscription}
                  onClose={handleCloseCancellationFlow}
                  accountCreditCents={billingData?.accountCreditCents || null}
                />
              )}

              <Box sx={{ mt: 3 }}>
                <InvoiceHistory />
              </Box>

              <Box sx={{ mt: 3 }}>
                <BillingHistoryCard fetchBillingHistory={fetchBillingHistory} />
              </Box>
            </Box>
          )}

          {activeSection === 'notifications' && (
            <NotificationPreferences />
          )}

          {activeSection === 'team' && (
            <Box>
              {/* Header with Invite Button */}
              <Paper elevation={0} sx={{ ...cardStyles, mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: colors.text, fontWeight: 700 }}
                    >
                      Team & Delegates
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.textSecondary, mt: 0.5 }}
                    >
                      Manage who can access and manage your account
                    </Typography>
                  </Box>
                  {isFreePlan ? (
                    <Chip
                      label="Upgrade to invite delegates"
                      size="small"
                      icon={<Crown size={14} />}
                      sx={{
                        bgcolor: alpha('#f59e0b', 0.15),
                        color: '#f59e0b',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => setActiveSection('billing')}
                      aria-label="Upgrade your plan to invite delegates"
                    />
                  ) : (
                    <DashboardGradientButton
                      startIcon={<UserPlus size={16} />}
                      onClick={handleOpenInviteModal}
                      aria-label="Invite Delegate"
                      sx={{ minHeight: 44 }}
                    >
                      Invite Delegate
                    </DashboardGradientButton>
                  )}
                </Box>
              </Paper>

              {/* Delegate List */}
              {delegatesLoading ? (
                <Box
                  aria-label="Loading delegates"
                  aria-busy="true"
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  {[1, 2, 3].map((i) => (
                    <Paper key={i} elevation={0} sx={{ ...cardStyles, mb: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={44} height={44} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="40%" height={18} />
                        </Box>
                        <Skeleton variant="rectangular" width={100} height={28} sx={{ borderRadius: 1 }} />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : delegatesError ? (
                <Alert severity="error" role="alert" sx={{ mb: 2 }}>
                  {delegatesError}
                </Alert>
              ) : delegates.length === 0 && pendingInvites.length === 0 ? (
                <Paper elevation={0} sx={{ ...cardStyles, mb: 0 }}>
                  <EmptyState
                    icon={<Users size={24} color={colors.text} />}
                    title="No delegates yet"
                    subtitle="Invite team members to help manage your account."
                    action={
                      !isFreePlan ? (
                        <DashboardGradientButton
                          startIcon={<UserPlus size={16} />}
                          onClick={handleOpenInviteModal}
                          aria-label="Invite Delegate"
                        >
                          Invite Delegate
                        </DashboardGradientButton>
                      ) : null
                    }
                  />
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Active Delegates */}
                  {delegates.map((delegate) => {
                    const user = delegate.delegateUser;
                    const initials = (user?.name || user?.email || '?')
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    const roleColor = delegateRoleColor(delegate.role);

                    return (
                      <Paper key={delegate.id} elevation={0} sx={{ ...cardStyles, mb: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: alpha(roleColor, 0.2),
                              color: roleColor,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                            aria-hidden="true"
                          >
                            {initials}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                color: colors.text,
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {user?.name || 'Unknown User'}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.textSecondary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {user?.email || ''}
                            </Typography>
                          </Box>
                          <Chip
                            label={delegateRoleLabel(delegate.role)}
                            size="small"
                            sx={{
                              bgcolor: alpha(roleColor, 0.15),
                              color: roleColor,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                          {delegate.serviceScopes && delegate.serviceScopes.length > 0 && (
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
                              {delegate.serviceScopes.map((scope) => (
                                <Chip
                                  key={scope}
                                  label={scope}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: 22,
                                    color: colors.textSecondary,
                                    borderColor: colors.border,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          <Tooltip title="Revoke delegate access" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenRevokeDialog(delegate)}
                              sx={{
                                color: '#f44336',
                                minWidth: 44,
                                minHeight: 44,
                                '&:hover': { bgcolor: alpha('#f44336', 0.1) },
                              }}
                              aria-label={`Revoke access for ${user?.name || 'delegate'}`}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    );
                  })}

                  {/* Pending Invites */}
                  {pendingInvites.length > 0 && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: colors.textSecondary, fontWeight: 600, mt: 1 }}
                      >
                        Pending Invites ({pendingInvites.length})
                      </Typography>
                      {pendingInvites.map((invite) => (
                        <Paper
                          key={invite.id}
                          elevation={0}
                          sx={{
                            ...cardStyles,
                            mb: 0,
                            border: `1px dashed ${alpha('#ff9800', 0.3)}`,
                            bgcolor: alpha('#ff9800', 0.04),
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha('#ff9800', 0.1),
                                flexShrink: 0,
                              }}
                            >
                              <Clock size={18} color="#ff9800" />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: colors.text,
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {invite.email}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip
                                  label="PENDING"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#ff9800', 0.15),
                                    color: '#ff9800',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    height: 18,
                                  }}
                                />
                                <Chip
                                  label={delegateRoleLabel(invite.role)}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(delegateRoleColor(invite.role), 0.15),
                                    color: delegateRoleColor(invite.role),
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    height: 18,
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </>
                  )}
                </Box>
              )}

              {/* Invite Delegate Modal */}
              <AccountDelegateInviteModal
                open={inviteModalOpen}
                onClose={handleCloseInviteModal}
                onSuccess={handleInviteSuccess}
              />

              {/* Revoke Confirmation Dialog */}
              <ConfirmationDialog
                open={revokeDialogOpen}
                onConfirm={handleConfirmRevoke}
                onCancel={handleCancelRevoke}
                title="Revoke Delegate Access"
                message={`Are you sure you want to revoke access for ${delegateToRevoke?.delegateUser?.name || delegateToRevoke?.delegateUser?.email || 'this delegate'}? They will no longer be able to manage your account.`}
                confirmLabel="Revoke"
                cancelLabel="Cancel"
                variant="danger"
                loading={revoking}
              />
            </Box>
          )}

          {activeSection === 'referrals' && (
            <ReferralDashboard colors={colors} />
          )}

          {activeSection === 'integrations' && (
            <Paper elevation={0} sx={{ ...cardStyles, mb: 0 }}>
              <EmptyState
                icon={<Plug size={24} color={colors.text} />}
                title="Integrations"
                subtitle="Connect third-party services to power up your workflow."
              />
            </Paper>
          )}
        </Box>
      </Box>

      {/* Email Verification Dialog */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>Verify Your Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
            Enter the 6-digit code sent to {authUser.email}
          </Typography>
          <CodeInput
            value={verifyCode}
            onChange={setVerifyCode}
            onComplete={(code) => setVerifyCode(code)}
            disabled={verifyLoading}
            error={!!error}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
          <DashboardActionButton
            fullWidth
            onClick={handleVerifyEmail}
            disabled={verifyLoading || verifyCode.length !== 6}
          >
            {verifyLoading ? (
              <CircularProgress size={24} sx={{ color: 'inherit' }} />
            ) : (
              'Verify Email'
            )}
          </DashboardActionButton>
          <Button
            fullWidth
            variant="text"
            onClick={handleResendVerificationCode}
            disabled={verifyLoading || verifyCooldown > 0}
            sx={{ color: colors.primary }}
          >
            {verifyCooldown > 0 ? `Resend code (${verifyCooldown}s)` : 'Resend code'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Change Dialog */}
      <Dialog
        open={emailChangeDialogOpen}
        onClose={() => {
          setEmailChangeDialogOpen(false);
          setEmailChangeStep('email');
          setNewEmail('');
          setEmailChangeCode('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>Change Email Address</DialogTitle>
        <DialogContent>
          {emailChangeStep === 'email' ? (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
                Enter your new email address. We'll send a verification code to confirm the change.
              </Typography>
              <DashboardInput
                label="New email address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={emailChangeLoading}
                containerSx={{ mt: 1 }}
              />
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 1, color: colors.textSecondary }}>
                Enter the 6-digit code sent to:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: colors.primary }}>
                {newEmail}
              </Typography>
              <CodeInput
                value={emailChangeCode}
                onChange={setEmailChangeCode}
                onComplete={(code) => setEmailChangeCode(code)}
                disabled={emailChangeLoading}
                error={!!error}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
          {emailChangeStep === 'email' ? (
            <DashboardActionButton
              fullWidth
              onClick={handleRequestEmailChange}
              disabled={emailChangeLoading || !newEmail}
            >
              {emailChangeLoading ? (
                <CircularProgress size={24} sx={{ color: 'inherit' }} />
              ) : (
                'Send Verification Code'
              )}
            </DashboardActionButton>
          ) : (
            <>
              <DashboardActionButton
                fullWidth
                onClick={handleConfirmEmailChange}
                disabled={emailChangeLoading || emailChangeCode.length !== 6}
              >
                {emailChangeLoading ? (
                  <CircularProgress size={24} sx={{ color: 'inherit' }} />
                ) : (
                  'Confirm Email Change'
                )}
              </DashboardActionButton>
              <Button
                fullWidth
                variant="text"
                onClick={handleResendEmailChangeCode}
                disabled={emailChangeLoading || emailChangeCooldown > 0}
                sx={{ color: colors.primary }}
              >
                {emailChangeCooldown > 0 ? `Resend code (${emailChangeCooldown}s)` : 'Resend code'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setEmailChangeStep('email');
                  setEmailChangeCode('');
                }}
                disabled={emailChangeLoading}
                sx={{ color: colors.textSecondary }}
              >
                Change email address
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setPasswordStep('email');
          setPasswordCode('');
          setNewPassword('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>Change Password</DialogTitle>
        <DialogContent>
          {passwordStep === 'email' ? (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
                We'll send a verification code to your email to confirm the password change.
              </Typography>
              <DashboardInput
                label="Email address"
                type="email"
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
                disabled={passwordLoading}
                containerSx={{ mt: 1 }}
              />
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
                Enter the 6-digit code sent to your email
              </Typography>
              <CodeInput
                value={passwordCode}
                onChange={setPasswordCode}
                onComplete={(code) => setPasswordCode(code)}
                disabled={passwordLoading}
                error={!!error}
              />
              <DashboardInput
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
                helperText="Minimum 6 characters"
                containerSx={{ mt: 3 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
          {passwordStep === 'email' ? (
            <DashboardConfirmButton
              fullWidth
              onClick={handleRequestPasswordReset}
              disabled={passwordLoading || !passwordEmail}
            >
              {passwordLoading ? (
                <CircularProgress size={24} sx={{ color: 'inherit' }} />
              ) : (
                'Send Reset Code'
              )}
            </DashboardConfirmButton>
          ) : (
            <>
              <DashboardConfirmButton
                fullWidth
                onClick={handleResetPassword}
                disabled={passwordLoading || passwordCode.length !== 6 || newPassword.length < 6}
              >
                {passwordLoading ? (
                  <CircularProgress size={24} sx={{ color: 'inherit' }} />
                ) : (
                  'Change Password'
                )}
              </DashboardConfirmButton>
              <Button
                fullWidth
                variant="text"
                onClick={handleResendPasswordCode}
                disabled={passwordLoading || passwordCooldown > 0}
                sx={{ color: colors.primary }}
              >
                {passwordCooldown > 0 ? `Resend code (${passwordCooldown}s)` : 'Resend code'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Google Unlink Confirmation Dialog */}
      <Dialog
        open={unlinkDialogOpen}
        onClose={() => setUnlinkDialogOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>
          Disconnect Google Account?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Are you sure you want to disconnect your Google account?
            {!authUser.password && ' You will need to set a password to continue signing in.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <DashboardCancelButton
            onClick={() => setUnlinkDialogOpen(false)}
            disabled={unlinkLoading}
          >
            Cancel
          </DashboardCancelButton>
          <DashboardConfirmButton
            onClick={handleUnlinkGoogle}
            disabled={unlinkLoading}
            tone="danger"
          >
            {unlinkLoading ? (
              <CircularProgress size={24} sx={{ color: 'inherit' }} />
            ) : (
              'Disconnect'
            )}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
