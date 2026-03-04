import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Menu, MenuItem, Typography, ListItemIcon, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { User, Shield, CreditCard } from 'lucide-react';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';

/**
 * UserProfileDropdown - Clickable avatar with profile dropdown menu
 *
 * @param {object} user - User object { name, displayImage, email, role }
 * @param {function} onLogout - Logout handler
 */
const UserProfileDropdown = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Framer Motion animation variants
  const avatarVariants = {
    rest: {
      scale: 1,
    },
    hover: {
      scale: 1.05,
    },
    tap: { scale: 0.95 },
  };

  // Handlers
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    onLogout?.();
  };

  // Styles
  const getAvatarButtonStyles = () => ({
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    borderRadius: '999px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const getAvatarStyles = () => ({
    width: 40,
    height: 40,
    border: `2px solid ${alpha(colors.panelText, 0.2)}`,
    boxShadow: colors.panelShadowSm,
    transition: 'all 0.2s ease',
  });

  const getAvatarWrapperStyles = () => ({
    position: 'relative',
    display: 'inline-flex',
  });

  const getStatusDotStyles = () => ({
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: '999px',
    backgroundColor: '#22c55e', // Green online indicator
    border: `2px solid ${colors.panelBg}`,
  });

  const getMenuPaperStyles = () => ({
    backgroundColor: colors.panelBg,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: '14px',
    boxShadow: colors.panelShadow,
    width: 252,
    marginTop: '6px',
    overflow: 'hidden',
  });

  const getUserInfoStyles = () => ({
    padding: '16px 18px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    borderBottom: `1px solid ${colors.panelBorder}`,
  });

  const getUserNameStyles = () => ({
    fontSize: '1.1rem',
    fontWeight: 500,
    color: colors.panelText,
  });

  const getUserEmailStyles = () => ({
    fontSize: '0.85rem',
    color: colors.panelMuted,
  });

  const getMenuSectionStyles = () => ({
    borderBottom: `1px solid ${colors.panelBorder}`,
  });

  const getMenuItemStyles = () => ({
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: colors.panelText,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: colors.panelHover,
    },
  });

  const getMenuItemIconStyles = () => ({
    minWidth: 'auto',
    color: colors.panelIcon,
    transition: 'color 0.2s ease',
    '& svg': {
      fontSize: 20,
    },
  });

  const getMenuItemTextStyles = () => ({
    fontSize: '0.95rem',
    fontWeight: 500,
    color: colors.panelText,
  });

  const getSignOutStyles = () => ({
    justifyContent: 'center',
    padding: '12px 18px',
    color: colors.panelText,
    fontSize: '0.95rem',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: colors.panelHover,
    },
  });

  const menuItems = [
    { label: 'Account', icon: <User size={20} />, path: '/dashboard/settings/account' },
    { label: 'Security', icon: <Shield size={20} />, path: '/dashboard/settings/security' },
    { label: 'Billing', icon: <CreditCard size={20} />, path: '/dashboard/settings/billing' },
  ];

  return (
    <>
      {/* Avatar Button */}
      <Box
        component={motion.button}
        onClick={handleClick}
        sx={getAvatarButtonStyles()}
        variants={avatarVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <Box sx={getAvatarWrapperStyles()}>
          <Avatar src={user?.displayImage} sx={getAvatarStyles()} alt={user?.name || 'User'}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={getStatusDotStyles()} />
        </Box>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: getMenuPaperStyles() }}
        MenuListProps={{ disablePadding: true }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={getUserInfoStyles()}>
          <Typography sx={getUserNameStyles()}>{user?.name || 'User'}</Typography>
          <Typography sx={getUserEmailStyles()}>{user?.email || ''}</Typography>
        </Box>

        {/* Menu Items */}
        <Box sx={getMenuSectionStyles()}>
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              onClick={() => {
                handleClose();
                navigate(item.path);
              }}
              sx={getMenuItemStyles()}
            >
              <ListItemIcon sx={getMenuItemIconStyles()}>{item.icon}</ListItemIcon>
              <Typography sx={getMenuItemTextStyles()}>{item.label}</Typography>
            </MenuItem>
          ))}
        </Box>

        <MenuItem onClick={handleLogout} sx={getSignOutStyles()}>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserProfileDropdown;
