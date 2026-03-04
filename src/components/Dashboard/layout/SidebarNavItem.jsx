import { Box, Badge, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { DashboardTooltip } from '../shared';

/**
 * SidebarNavItem - Adaptive navigation item for collapsible sidebar
 *
 * @param {ReactNode} icon - MUI Icon component
 * @param {string} label - Text label (hidden when collapsed)
 * @param {boolean} isActive - Highlight as current page
 * @param {boolean} isCollapsed - Sidebar collapse state
 * @param {function} onClick - Navigation handler
 * @param {number} badge - Optional notification count
 * @param {string} tooltipText - Tooltip when collapsed (defaults to label)
 * @param {number} index - For staggered animation delay
 */
const SidebarNavItem = ({
  icon: Icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick,
  badge,
  tooltipText,
  index = 0,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Framer Motion animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const hoverVariants = {
    rest: { scale: 1, x: 0 },
    hover: {
      scale: isCollapsed ? 1.05 : 1,
      x: isCollapsed ? 0 : 6,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.98 },
  };

  const activeBackground =
    colors.sidebarActiveBg || colors.sidebarActive || 'rgba(255, 255, 255, 0.08)';
  const activeTextColor = colors.sidebarActiveText || colors.sidebarIconActive || '#000000';

  // Style functions - Clean minimal style like reference
  const getNavItemStyles = (theme) => ({
  borderRadius: '12px',
  padding: isCollapsed ? '12px' : '12px 24px',
  marginBottom: '6px',
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: isCollapsed ? 'center' : 'flex-start',
  gap: isCollapsed ? 0 : '12px',
  minHeight: isCollapsed ? '48px' : '44px',
  width: '100%',
  border: 'none',
  outline: 'none',
  fontFamily: 'inherit',

    // Simple colors - muted gray inactive, teal active
    color: isActive ? activeTextColor : colors.sidebarIcon || '#6b7280',
    background: isActive ? activeBackground : 'transparent',

    // Hover states
    '&:hover': {
      background: isActive
        ? activeBackground
        : colors.sidebarActive || 'rgba(255, 255, 255, 0.08)',
      color: isActive ? activeTextColor : colors.sidebarIconActive,
    },

    // Focus state for accessibility
    '&:focus-visible': {
      outline: `2px solid ${colors.primary}`,
      outlineOffset: '2px',
    },

    // Transition
    transition: 'all 0.2s ease',
  });

  const isLight = colors.mode === 'light';

  const getIconStyles = () => ({
    fontSize: '20px',
    color: 'inherit',
    transition: 'color 0.2s ease, filter 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    // Add subtle stroke effect in light mode for better visibility against glass background
    ...(isLight && !isActive ? { filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' } : {}),
    ...(isActive ? { fontWeight: 400 } : {}),
    '& .MuiSvgIcon-root': {
      fontSize: '20px',
      ...(isActive ? { fontWeight: 400 } : {}),
    },
    '& svg': {
      width: 20,
      height: 20,
      display: 'block',
    },
  });

  const getLabelStyles = () => ({
    opacity: isCollapsed ? 0 : 1,
    width: isCollapsed ? 0 : 'auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.2px',
    color: 'inherit',
    transition: 'opacity 0.2s ease, width 0.3s ease',
  });

  const getBadgeStyles = () => ({
    '& .MuiBadge-badge': {
      background: `linear-gradient(135deg, ${colors.error} 0%, #e91e63 100%)`,
      color: '#fff',
      fontSize: '0.7rem',
      fontWeight: 700,
      minWidth: '18px',
      height: '18px',
      boxShadow: `0 2px 6px ${alpha(colors.error, 0.4)}`,
    },
  });


  // Render the nav item content
  const renderContent = () => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      style={{ width: '100%' }}
    >
      <motion.div
        variants={hoverVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        style={{ width: '100%' }}
      >
        <Box
          component="button"
          onClick={onClick}
          sx={getNavItemStyles()}
          tabIndex={0}
          role="button"
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
        >
          {/* Icon - with badge overlay only when collapsed */}
          <Box sx={getIconStyles()}>
            {isCollapsed && badge && badge > 0 ? (
              <Badge
                badgeContent={badge > 99 ? '99+' : badge}
                sx={getBadgeStyles()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                {Icon}
              </Badge>
            ) : (
              Icon
            )}
          </Box>

          {/* Label (hidden when collapsed) */}
          <Typography component="span" sx={getLabelStyles()}>
            {label}
          </Typography>

          {/* Badge on the right side when expanded */}
          {!isCollapsed && badge && badge > 0 && (
            <Box
              sx={{
                ml: 'auto',
                background: `linear-gradient(135deg, ${colors.error} 0%, #e91e63 100%)`,
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                minWidth: '22px',
                height: '22px',
                borderRadius: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 6px ${alpha(colors.error, 0.4)}`,
              }}
            >
              {badge > 99 ? '99+' : badge}
            </Box>
          )}
        </Box>
      </motion.div>
    </motion.div>
  );

  // Wrap with tooltip only when collapsed
  if (isCollapsed) {
    return (
      <DashboardTooltip
        title={tooltipText || label}
        placement="right"
        colors={colors}
      >
        {renderContent()}
      </DashboardTooltip>
    );
  }

  return renderContent();
};

export default SidebarNavItem;
