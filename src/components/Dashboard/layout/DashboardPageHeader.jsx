import { Box, IconButton, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { Menu as MenuIcon, Search, Users } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationPopup from '../NotificationPopup';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * DashboardPageHeader - Inline top bar with search, notifications, and user profile
 *
 * @param {object} user - User object for avatar
 * @param {function} onMenuToggle - Mobile hamburger handler
 * @param {function} onSearchOpen - Opens search popup
 * @param {function} onLogout - Logout handler
 * @param {function} onProfile - Navigate to profile handler
 * @param {boolean} showMenuButton - Show hamburger on mobile
 * @param {object} colors - Theme colors from getDashboardColors() (optional, will auto-derive)
 */
const DashboardPageHeader = ({
  user,
  onMenuToggle,
  onSearchOpen,
  onLogout,
  onProfile,
  showMenuButton = false,
  colors: propColors,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = propColors || getDashboardColors(actualTheme);
  const isLight = colors.mode === 'light';
  const controlBackground = isLight ? 'alpha(colors.text, 0.06)' : alpha('#fff', 0.08);
  const controlBorder = isLight ? alpha(colors.text, 0.12) : 'rgba(255, 255, 255, 0.16)';
  const controlColor = isLight ? colors.text : '#f8fafc';
  const controlHoverBackground = isLight ? alpha(colors.text, 0.12) : alpha('#fff', 0.16);
  const controlHoverBorder = isLight ? alpha(colors.text, 0.2) : 'rgba(255, 255, 255, 0.26)';

  const searchButtonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const menuButtonVariants = {
    rest: { rotate: 0 },
    hover: { rotate: 90, transition: { duration: 0.2 } },
  };

  // Styles
  const headerContainerStyles = {
    py: { xs: 1.3, md: 1.2 },
    px: { xs: 2, md: 3 },
    position: 'relative',
    zIndex: 1,
    borderBottom: `1px solid ${alpha(colors.panelText, 0.2)}`,
  };

  const topRowStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: { xs: '14px', md: '24px' },
  };

  const leftSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: '12px', md: '16px' },
  };

  const menuButtonStyles = {
    width: 42,
    height: 42,
    borderRadius: '14px',
    background: controlBackground,
    border: `1px solid ${controlBorder}`,
    color: controlColor,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: controlHoverBackground,
      borderColor: controlHoverBorder,
      color: controlColor,
    },
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: '8px', md: '10px' },
    flexShrink: 0,
  };

  const profileDividerStyles = {
    width: '1px',
    height: 32,
    backgroundColor: colors.sideBar || alpha(controlColor, isLight ? 0.2 : 0.24),
    alignSelf: 'center',
    mx: 0.5,
  };

  const iconButtonStyles = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    p: 0,
    color: alpha(controlColor, 0.7),
    transition: 'color 0.2s ease, transform 0.2s ease',
    '&:hover': {
      background: alpha(controlColor, isLight ? 0.08 : 0.12),
      color: controlColor,
    },
  };

  return (
    <Box sx={headerContainerStyles}>
      {/* Top Row: Search on left, Controls on right */}
      <Box sx={topRowStyles}>
        {/* Left: Search + Mobile Menu */}
        <Box sx={leftSectionStyles}>
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <motion.div variants={menuButtonVariants} initial="rest" whileHover="hover">
              <IconButton onClick={onMenuToggle} sx={menuButtonStyles}>
                <MenuIcon size={20} strokeWidth={2} />
              </IconButton>
            </motion.div>
          )}

          {/* Search Button */}
          <motion.div
            variants={searchButtonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <IconButton onClick={onSearchOpen} sx={iconButtonStyles}>
              <Search size={22} strokeWidth={2} />
            </IconButton>
          </motion.div>
        </Box>

        {/* Right: Notifications + Users + Divider + Avatar */}
        <Box sx={rightSectionStyles}>
          {/* Notifications */}
          <NotificationPopup />

          {/* Users/Team Icon */}
          <motion.div
            variants={searchButtonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <IconButton sx={iconButtonStyles}>
              <Users size={22} strokeWidth={2} />
            </IconButton>
          </motion.div>

          <Box sx={profileDividerStyles} />

          {/* User Profile Dropdown */}
          <UserProfileDropdown
            user={user}
            onLogout={onLogout}
            onProfile={onProfile}
            colors={colors}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPageHeader;
