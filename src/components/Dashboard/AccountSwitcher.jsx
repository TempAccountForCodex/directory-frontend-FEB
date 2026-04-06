/**
 * AccountSwitcher - Sidebar component for account delegation (Step 7.15.3)
 *
 * Renders in the dashboard sidebar to allow users to switch between
 * their own account and accounts they have delegate access to.
 *
 * Features:
 *   - Dropdown list of delegated accounts
 *   - Context switch on account selection
 *   - Amber delegation banner when acting on behalf of another user
 *   - "Return to my account" button
 *   - Compact icon-only mode when sidebar is collapsed
 *   - Keyboard navigation: Arrow keys, Escape, Enter
 *   - Full accessibility: aria-labels, aria-expanded, aria-live
 *
 * SECURITY:
 *   - X-Account-Context header only set after server confirms switch-context
 *   - Self-delegation prevented
 *   - Expired delegation handled gracefully
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import {
  Users as UsersIcon,
  ArrowLeftRight as SwitchIcon,
  ChevronDown,
  ChevronUp,
  LogOut as ReturnIcon,
  Lock as LockIcon,
} from 'lucide-react';
import { useAccountContext } from '../../context/AccountContext';

// ── Delegation Banner ───────────────────────────────────────────────────────

const DelegationBanner = React.memo(({ delegateAccount, onReturn, isSwitching, colors }) => {
  if (!delegateAccount) return null;

  const ownerName = delegateAccount.ownerUser?.name || delegateAccount.ownerUser?.email || 'Unknown';

  return (
    <Box
      role="status"
      aria-live="polite"
      data-testid="delegation-banner"
      sx={{
        px: 2,
        py: 1.5,
        mx: 1,
        mb: 1,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SwitchIcon size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <Typography
          variant="caption"
          sx={{
            color: '#f59e0b',
            fontWeight: 600,
            fontSize: '0.7rem',
            lineHeight: 1.2,
          }}
        >
          Acting as {ownerName}
        </Typography>
      </Box>
      <Box
        component="button"
        onClick={onReturn}
        disabled={isSwitching}
        aria-label="Return to my account"
        data-testid="return-to-own-account"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.5,
          borderRadius: '8px',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          cursor: isSwitching ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.7rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          opacity: isSwitching ? 0.6 : 1,
          '&:hover:not(:disabled)': {
            background: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 0.6)',
          },
        }}
      >
        {isSwitching ? (
          <CircularProgress size={12} sx={{ color: '#f59e0b' }} />
        ) : (
          <ReturnIcon size={12} />
        )}
        Return to my account
      </Box>
    </Box>
  );
});
DelegationBanner.displayName = 'DelegationBanner';

// ── Account List Item ───────────────────────────────────────────────────────

const AccountListItem = React.memo(({ account, onSelect, isSelected, isSwitching, colors, index }) => {
  const ownerName = account.ownerUser?.name || 'Unknown';
  const ownerEmail = account.ownerUser?.email || '';
  const roleName = account.role === 'ACCOUNT_ADMIN' ? 'Admin' : 'Collaborator';

  return (
    <Box
      component="button"
      role="option"
      aria-selected={isSelected}
      aria-label={`Switch to ${ownerName} account as ${roleName}`}
      data-testid={`account-option-${account.ownerUser?.id}`}
      onClick={() => onSelect(account)}
      disabled={isSwitching}
      tabIndex={0}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: '8px',
        border: 'none',
        background: isSelected
          ? 'rgba(245, 158, 11, 0.1)'
          : 'transparent',
        cursor: isSwitching ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        opacity: isSwitching ? 0.6 : 1,
        '&:hover:not(:disabled)': {
          background: isSelected
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(255, 255, 255, 0.06)',
        },
        '&:focus-visible': {
          outline: '2px solid rgba(245, 158, 11, 0.5)',
          outlineOffset: '-2px',
        },
      }}
    >
      {/* Avatar circle */}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: isSelected
            ? 'rgba(245, 158, 11, 0.2)'
            : 'rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.7rem',
          fontWeight: 700,
          color: isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.5)',
        }}
      >
        {ownerName.charAt(0).toUpperCase()}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 600,
            fontSize: '0.75rem',
            color: isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.8)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {ownerName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '0.65rem',
            color: 'rgba(255, 255, 255, 0.4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {ownerEmail}
        </Typography>
      </Box>

      {/* Role chip */}
      <Chip
        label={roleName}
        size="small"
        sx={{
          height: 18,
          fontSize: '0.6rem',
          fontWeight: 600,
          background: isSelected
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(255, 255, 255, 0.06)',
          color: isSelected
            ? '#f59e0b'
            : 'rgba(255, 255, 255, 0.5)',
          border: 'none',
          '& .MuiChip-label': { px: 0.75 },
        }}
      />
    </Box>
  );
});
AccountListItem.displayName = 'AccountListItem';

// ── Main Component ──────────────────────────────────────────────────────────

const AccountSwitcher = React.memo(({ isCollapsed = false, colors = {} }) => {
  const {
    isDelegating,
    delegateAccount,
    delegatedAccounts,
    isLoading,
    isSwitching,
    error,
    switchAccount,
    clearDelegation,
  } = useAccountContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelectAccount = useCallback(
    async (account) => {
      const success = await switchAccount(account);
      if (success) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    },
    [switchAccount]
  );

  const handleReturn = useCallback(async () => {
    await clearDelegation();
  }, [clearDelegation]);

  // Don't render if user has no delegated accounts and is not delegating
  const hasAccounts = delegatedAccounts.length > 0;
  if (!hasAccounts && !isDelegating && !isLoading) {
    return null;
  }

  // Collapsed sidebar: show icon-only indicator
  if (isCollapsed) {
    return (
      <Box
        data-testid="account-switcher-collapsed"
        sx={{ px: '12px', mb: 1 }}
      >
        {/* Delegation active indicator */}
        {isDelegating && (
          <DelegationBannerCompact
            onReturn={handleReturn}
            isSwitching={isSwitching}
          />
        )}

        {/* Switcher trigger icon */}
        {hasAccounts && !isDelegating && (
          <Box
            component="button"
            onClick={handleToggle}
            aria-label="Switch account"
            aria-expanded={isOpen}
            ref={triggerRef}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          >
            <UsersIcon size={20} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      ref={dropdownRef}
      data-testid="account-switcher"
      sx={{ px: '12px', mb: 1 }}
    >
      {/* Delegation banner */}
      {isDelegating && (
        <DelegationBanner
          delegateAccount={delegateAccount}
          onReturn={handleReturn}
          isSwitching={isSwitching}
          colors={colors}
        />
      )}

      {/* Error message */}
      {error && (
        <Box
          role="alert"
          data-testid="account-switcher-error"
          sx={{
            px: 1.5,
            py: 1,
            mx: 1,
            mb: 1,
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: '#ef4444', fontSize: '0.7rem' }}
          >
            {error}
          </Typography>
        </Box>
      )}

      {/* Switcher trigger */}
      {hasAccounts && !isDelegating && (
        <Box
          component="button"
          onClick={handleToggle}
          aria-label="Switch account"
          aria-expanded={isOpen}
          ref={triggerRef}
          data-testid="account-switcher-trigger"
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1.5,
            mx: 1,
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.03)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'rgba(255, 255, 255, 0.6)',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.06)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
            },
          }}
        >
          <UsersIcon size={16} />
          <Typography
            variant="caption"
            sx={{
              flex: 1,
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Switch Account
          </Typography>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Box>
      )}

      {/* Dropdown list */}
      {isOpen && !isDelegating && (
        <Box
          role="listbox"
          aria-label="Delegated accounts"
          data-testid="account-list"
          sx={{
            mx: 1,
            mt: 0.5,
            p: 0.5,
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 1.5 }}>
              <Skeleton variant="rectangular" height={36} sx={{ borderRadius: '8px', mb: 0.5 }} />
              <Skeleton variant="rectangular" height={36} sx={{ borderRadius: '8px' }} />
            </Box>
          ) : delegatedAccounts.length === 0 ? (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                py: 2,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.7rem',
              }}
            >
              No delegated accounts available
            </Typography>
          ) : (
            delegatedAccounts.map((account, index) => (
              <AccountListItem
                key={account.id}
                account={account}
                onSelect={handleSelectAccount}
                isSelected={false}
                isSwitching={isSwitching}
                colors={colors}
                index={index}
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
});
AccountSwitcher.displayName = 'AccountSwitcher';

// ── Compact Banner (collapsed sidebar) ──────────────────────────────────────

const DelegationBannerCompact = React.memo(({ onReturn, isSwitching }) => {
  return (
    <Box
      component="button"
      onClick={onReturn}
      disabled={isSwitching}
      aria-label="Return to my account"
      data-testid="delegation-banner-compact"
      role="status"
      aria-live="polite"
      sx={{
        width: 44,
        height: 44,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background: 'rgba(245, 158, 11, 0.1)',
        cursor: isSwitching ? 'not-allowed' : 'pointer',
        color: '#f59e0b',
        transition: 'all 0.2s ease',
        '&:hover:not(:disabled)': {
          background: 'rgba(245, 158, 11, 0.2)',
        },
      }}
    >
      {isSwitching ? (
        <CircularProgress size={16} sx={{ color: '#f59e0b' }} />
      ) : (
        <SwitchIcon size={18} />
      )}
    </Box>
  );
});
DelegationBannerCompact.displayName = 'DelegationBannerCompact';

export default AccountSwitcher;
