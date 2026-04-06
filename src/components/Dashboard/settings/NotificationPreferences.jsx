/**
 * NotificationPreferences — Step 10.10
 *
 * Full notification preferences UI with:
 * - Master email + marketing toggles
 * - Per-category accordion sections
 * - Per-type email/in-app toggles
 * - Unfilterable types with lock icon + tooltip
 * - Save button disabled when no changes
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  ChevronDown,
  Lock,
  Mail,
  Bell,
  Globe,
  Layout,
  Users,
  MessageSquare,
  Bot,
  CreditCard,
  Shield,
  Radio,
  Save,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { DashboardCard, DashboardConfirmButton, DashboardTooltip } from '../shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Unfilterable types that cannot be disabled
const UNFILTERABLE_TYPES = [
  'PAYMENT_FAILED',
  'DORMANT_RENEWAL_WARNING',
  'ACCOUNT_RESTRICTION',
  'INCIDENT_STARTED',
];

// Human-readable labels for notification types
const TYPE_LABELS = {
  WEBSITE_CREATED: 'Website created',
  WEBSITE_PUBLISHED: 'Website published',
  WEBSITE_UNPUBLISHED: 'Website unpublished',
  TEMPLATE_SUBMITTED: 'Template submitted',
  TEMPLATE_APPROVED: 'Template approved',
  TEMPLATE_REJECTED: 'Template rejected',
  TEMPLATE_EDITED: 'Template edited',
  COLLABORATOR_INVITED: 'Collaborator invited',
  COLLABORATOR_JOINED: 'Collaborator joined',
  COLLABORATOR_DECLINED: 'Collaborator declined',
  INVITE_EXPIRED: 'Invite expired',
  APPROVAL_REQUESTED: 'Approval requested',
  APPROVAL_APPROVED: 'Approval approved',
  APPROVAL_REJECTED: 'Approval rejected',
  DOMAIN_VERIFIED: 'Domain verified',
  DOMAIN_FAILED: 'Domain verification failed',
  FORM_SUBMISSION: 'Form submission received',
  LISTING_PUBLISHED: 'Listing published',
  REVIEW_RECEIVED: 'Review received',
  COMMENT_RECEIVED: 'Comment received',
  AI_GENERATION_COMPLETE: 'AI generation complete',
  AI_GENERATION_FAILED: 'AI generation failed',
  PAYMENT_FAILED: 'Payment failed',
  PAYMENT_SUCCEEDED: 'Payment succeeded',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled',
  SUBSCRIPTION_TRIAL_ENDING: 'Trial ending soon',
  PLAN_CHANGED: 'Plan changed',
  DORMANT_RENEWAL_WARNING: 'Dormant renewal warning',
  REFERRAL_REWARD_EARNED: 'Referral reward earned',
  ACCOUNT_RESTRICTION: 'Account restriction',
  ACCOUNT_DELEGATE_INVITE: 'Delegate invitation',
  ACCOUNT_DELEGATE_ACCEPTED: 'Delegate accepted',
  ACCOUNT_DELEGATE_REVOKED: 'Delegate revoked',
  INCIDENT_STARTED: 'Incident started',
  INCIDENT_RESOLVED: 'Incident resolved',
  INCIDENT_UPDATE: 'Incident update',
  SYSTEM: 'System notification',
};

// Category groupings
const CATEGORIES = [
  {
    id: 'websites',
    label: 'Websites',
    icon: Globe,
    types: ['WEBSITE_CREATED', 'WEBSITE_PUBLISHED', 'WEBSITE_UNPUBLISHED'],
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Layout,
    types: ['TEMPLATE_SUBMITTED', 'TEMPLATE_APPROVED', 'TEMPLATE_REJECTED', 'TEMPLATE_EDITED'],
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: Users,
    types: [
      'COLLABORATOR_INVITED', 'COLLABORATOR_JOINED', 'COLLABORATOR_DECLINED',
      'INVITE_EXPIRED', 'APPROVAL_REQUESTED', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED',
    ],
  },
  {
    id: 'domains',
    label: 'Domains',
    icon: Globe,
    types: ['DOMAIN_VERIFIED', 'DOMAIN_FAILED'],
  },
  {
    id: 'forms_listings',
    label: 'Forms & Listings',
    icon: MessageSquare,
    types: ['FORM_SUBMISSION', 'LISTING_PUBLISHED', 'REVIEW_RECEIVED', 'COMMENT_RECEIVED'],
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Bot,
    types: ['AI_GENERATION_COMPLETE', 'AI_GENERATION_FAILED'],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    types: [
      'PAYMENT_FAILED', 'PAYMENT_SUCCEEDED', 'SUBSCRIPTION_CANCELLED',
      'SUBSCRIPTION_TRIAL_ENDING', 'PLAN_CHANGED', 'DORMANT_RENEWAL_WARNING',
      'REFERRAL_REWARD_EARNED',
    ],
  },
  {
    id: 'account',
    label: 'Account',
    icon: Shield,
    types: [
      'ACCOUNT_RESTRICTION', 'ACCOUNT_DELEGATE_INVITE',
      'ACCOUNT_DELEGATE_ACCEPTED', 'ACCOUNT_DELEGATE_REVOKED',
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    icon: Radio,
    types: ['INCIDENT_STARTED', 'INCIDENT_RESOLVED', 'INCIDENT_UPDATE', 'SYSTEM'],
  },
];

const NotificationPreferences = React.memo(function NotificationPreferences() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Master toggles
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [marketingEmailsEnabled, setMarketingEmailsEnabled] = useState(false);

  // Per-type preferences: { [type]: { emailEnabled, inAppEnabled } }
  const [preferences, setPreferences] = useState({});

  // Track original state for dirty check
  const [originalState, setOriginalState] = useState(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/notifications/preferences`);
      const data = res.data;
      setEmailNotificationsEnabled(data.emailNotificationsEnabled);
      setMarketingEmailsEnabled(data.marketingEmailsEnabled);
      setPreferences(data.preferences || {});
      setOriginalState(JSON.stringify({
        emailNotificationsEnabled: data.emailNotificationsEnabled,
        marketingEmailsEnabled: data.marketingEmailsEnabled,
        preferences: data.preferences || {},
      }));
    } catch (err) {
      setError('Failed to load notification preferences');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const isDirty = useMemo(() => {
    if (!originalState) return false;
    const currentState = JSON.stringify({
      emailNotificationsEnabled,
      marketingEmailsEnabled,
      preferences,
    });
    return currentState !== originalState;
  }, [emailNotificationsEnabled, marketingEmailsEnabled, preferences, originalState]);

  const handleToggleType = useCallback((type, field) => {
    if (UNFILTERABLE_TYPES.includes(type)) return;
    setPreferences((prev) => {
      const current = prev[type] || { emailEnabled: true, inAppEnabled: true };
      return {
        ...prev,
        [type]: { ...current, [field]: !current[field] },
      };
    });
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Build preferences array from changed types
      const prefsArray = Object.entries(preferences).map(([notificationType, prefs]) => ({
        notificationType,
        emailEnabled: prefs.emailEnabled,
        inAppEnabled: prefs.inAppEnabled,
      }));

      const res = await axios.put(`${API_URL}/notifications/preferences`, {
        emailNotificationsEnabled,
        marketingEmailsEnabled,
        preferences: prefsArray,
      });

      setOriginalState(JSON.stringify({
        emailNotificationsEnabled: res.data.emailNotificationsEnabled,
        marketingEmailsEnabled: res.data.marketingEmailsEnabled,
        preferences: res.data.preferences || {},
      }));
      setPreferences(res.data.preferences || {});
      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  }, [emailNotificationsEnabled, marketingEmailsEnabled, preferences]);

  const getTypePref = useCallback(
    (type) => preferences[type] || { emailEnabled: true, inAppEnabled: true },
    [preferences]
  );

  if (loading) {
    return (
      <DashboardCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} sx={{ color: colors.accent }} />
        </Box>
      </DashboardCard>
    );
  }

  return (
    <Box>
      {/* Success / Error alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Master Toggles */}
      <DashboardCard sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700, mb: 2 }}>
          Email Settings
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Mail size={20} color={colors.accent} />
            <Box>
              <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.938rem' }}>
                Email notifications
              </Typography>
              <Typography sx={{ color: colors.textSecondary, fontSize: '0.813rem' }}>
                Receive email alerts for important notifications
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={emailNotificationsEnabled}
            onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: colors.accent },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: colors.accent,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Mail size={20} color={colors.textSecondary} />
            <Box>
              <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.938rem' }}>
                Marketing emails
              </Typography>
              <Typography sx={{ color: colors.textSecondary, fontSize: '0.813rem' }}>
                Receive product updates, tips, and promotional content
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={marketingEmailsEnabled}
            onChange={(e) => setMarketingEmailsEnabled(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: colors.accent },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: colors.accent,
              },
            }}
          />
        </Box>
      </DashboardCard>

      {/* Per-Category Notification Preferences */}
      <DashboardCard sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700, mb: 1 }}>
          Notification Preferences
        </Typography>
        <Typography sx={{ color: colors.textSecondary, fontSize: '0.875rem', mb: 2 }}>
          Choose which notifications you receive via email and in-app
        </Typography>

        {/* Column headers */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 3,
            pr: 2,
            mb: 1,
          }}
        >
          <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, width: 48, textAlign: 'center' }}>
            Email
          </Typography>
          <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: 600, width: 48, textAlign: 'center' }}>
            In-App
          </Typography>
        </Box>

        {CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <Accordion
              key={category.id}
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: 'transparent',
                border: `1px solid ${alpha(colors.text, 0.08)}`,
                borderRadius: '8px !important',
                mb: 1,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { mb: 1 },
              }}
            >
              <AccordionSummary
                expandIcon={<ChevronDown size={18} color={colors.textSecondary} />}
                sx={{
                  minHeight: 48,
                  px: 2,
                  '& .MuiAccordionSummary-content': { my: 1, alignItems: 'center', gap: 1.5 },
                }}
              >
                <CategoryIcon size={18} color={colors.accent} />
                <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.875rem' }}>
                  {category.label}
                </Typography>
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', ml: 1 }}>
                  ({category.types.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, py: 0, pb: 1 }}>
                {category.types.map((type) => {
                  const pref = getTypePref(type);
                  const isLocked = UNFILTERABLE_TYPES.includes(type);
                  return (
                    <Box
                      key={type}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.75,
                        borderBottom: `1px solid ${alpha(colors.text, 0.04)}`,
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: colors.text,
                            fontSize: '0.813rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {TYPE_LABELS[type] || type}
                        </Typography>
                        {isLocked && (
                          <DashboardTooltip title="This notification cannot be disabled for safety reasons">
                            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                              <Lock size={14} color={colors.textSecondary} />
                            </Box>
                          </DashboardTooltip>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ width: 48, display: 'flex', justifyContent: 'center' }}>
                          <Switch
                            size="small"
                            checked={isLocked ? true : pref.emailEnabled}
                            disabled={isLocked}
                            onChange={() => handleToggleType(type, 'emailEnabled')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: colors.accent },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ width: 48, display: 'flex', justifyContent: 'center' }}>
                          <Switch
                            size="small"
                            checked={isLocked ? true : pref.inAppEnabled}
                            disabled={isLocked}
                            onChange={() => handleToggleType(type, 'inAppEnabled')}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: colors.accent },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: colors.accent,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </DashboardCard>

      {/* Save button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <DashboardConfirmButton
          onClick={handleSave}
          disabled={!isDirty || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </DashboardConfirmButton>
      </Box>
    </Box>
  );
});

export default NotificationPreferences;
