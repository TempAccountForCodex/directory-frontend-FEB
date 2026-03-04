import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Box, Typography, alpha, Popper, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * SidebarDropdownItem - Reusable dropdown navigation item for collapsible sidebar
 *
 * @param {string} dropdownId - Unique identifier for this dropdown
 * @param {ReactNode} icon - Icon component for the dropdown trigger
 * @param {string} label - Text label for the dropdown
 * @param {array} children - Array of child items { id, label, icon }
 * @param {boolean} isCollapsed - Sidebar collapse state
 * @param {string} activeTab - Currently active tab ID
 * @param {function} onItemClick - Handler when child item is clicked
 * @param {number} index - For staggered animation delay
 * @param {boolean} isOpen - Controlled open state from parent
 * @param {function} onToggle - Handler to toggle dropdown (receives dropdownId)
 */
const SidebarDropdownItem = memo(function SidebarDropdownItem({
  dropdownId,
  icon: Icon,
  label,
  children = [],
  isCollapsed = false,
  activeTab,
  onItemClick,
  index = 0,
  isOpen = false,
  onToggle,
}) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isLight = colors.mode === 'light';

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const anchorRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Check if any child is active
  const hasActiveChild = children.some((child) => child.id === activeTab);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (!isCollapsed && onToggle) {
      onToggle(dropdownId);
    }
  }, [isCollapsed, onToggle, dropdownId]);

  // Handle hover for collapsed mode tooltip
  const handleMouseEnter = useCallback(() => {
    if (isCollapsed) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setTooltipOpen(true);
      }, 100);
    }
  }, [isCollapsed]);

  const handleMouseLeave = useCallback(() => {
    if (isCollapsed) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setTooltipOpen(false);
      }, 150);
    }
  }, [isCollapsed]);

  const handleTooltipMouseEnter = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setTooltipOpen(false);
    }, 150);
  }, []);

  const handleChildClick = useCallback(
    (childId) => {
      onItemClick?.(childId);
      setTooltipOpen(false);
    },
    [onItemClick]
  );

  // Animation variants
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
      x: isCollapsed ? 0 : 4,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.98 },
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const activeBackground = colors.sidebarActiveBg || colors.sidebarActive;
  const activeTextColor = colors.sidebarActiveText || colors.sidebarIconActive;
  const lineColor = colors.sidebarIcon;
  const hoverBg = colors.sidebarActive;

  // Trigger button styles - only shows background when has active child (not just open)
  const getTriggerStyles = () => ({
    borderRadius: '12px',
    padding: isCollapsed ? '12px' : '12px 24px',
    marginBottom: isOpen ? '0' : '6px',
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
    // Only show active styling if a child is active, NOT just when open
    color: colors.sidebarIcon,
    background: 'transparent',
    '&:hover': {
      background: hoverBg,
      color: colors.sidebarIconActive,
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary}`,
      outlineOffset: '2px',
    },
    transition: 'all 0.2s ease',
  });

  const getIconStyles = () => ({
    fontSize: '20px',
    color: 'inherit',
    transition: 'color 0.2s ease, filter 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...(isLight && !hasActiveChild ? { filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' } : {}),
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
    flex: 1,
    textAlign: 'left',
  });

  // Child item styles with vertical line design
  const getChildItemStyles = (isActive) => ({
    borderRadius: '12px',
    padding: '10px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    color: isActive ? activeTextColor : colors.sidebarIcon,
    background: isActive ? activeBackground : 'transparent',
    '&:hover': {
      background: isActive ? activeBackground : hoverBg,
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

  // Tooltip menu styles - Professional dropdown with clear visual hierarchy
  const getTooltipStyles = () => ({
    background: isLight
      ? 'rgba(255, 255, 255, 0.98)'
      : 'rgba(18, 21, 23, 0.98)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: '16px',
    border: isLight
      ? '1px solid rgba(0, 0, 0, 0.08)'
      : `1px solid ${colors.border}`,
    boxShadow: isLight
      ? '0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(0, 0, 0, 0.06)'
      : '0 10px 40px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3)',
    padding: '10px',
    minWidth: '200px',
    zIndex: 1500,
  });

  const getTooltipItemStyles = (isActive) => ({
    borderRadius: '10px',
    padding: '11px 14px',
    marginBottom: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    letterSpacing: '0.01em',
    color: isActive
      ? (isLight ? '#ffffff' : activeTextColor)
      : (isLight ? '#1f2937' : colors.text),
    background: isActive
      ? colors.primary
      : 'transparent',
    '&:hover': {
      background: isActive
        ? (colors.primaryDark || colors.primary)
        : (isLight ? 'rgba(55, 140, 146, 0.12)' : 'rgba(255, 255, 255, 0.08)'),
      color: isActive
        ? (isLight ? '#ffffff' : activeTextColor)
        : (isLight ? colors.primary : colors.textLight),
      transform: 'translateX(2px)',
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.primary}`,
      outlineOffset: '2px',
    },
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:last-child': {
      marginBottom: 0,
    },
  });

  // Render collapsed mode with tooltip
  if (isCollapsed) {
    return (
      <>
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
              ref={anchorRef}
              component="button"
              onClick={handleToggle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={getTriggerStyles()}
              tabIndex={0}
              role="button"
              aria-label={label}
              aria-expanded={tooltipOpen}
              aria-haspopup="menu"
            >
              <Box sx={getIconStyles()}>{Icon}</Box>
            </Box>
          </motion.div>
        </motion.div>

        <Popper
          open={tooltipOpen}
          anchorEl={anchorRef.current}
          placement="right-start"
          transition
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 12],
              },
            },
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
              },
            },
          ]}
          sx={{ zIndex: 1500 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Box
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                sx={getTooltipStyles()}
              >
                {/* Header */}
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: isLight ? 'rgba(0, 0, 0, 0.5)' : colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    px: 1.5,
                    pt: 0.5,
                    pb: 1.5,
                    borderBottom: isLight
                      ? '1px solid rgba(0, 0, 0, 0.06)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    mb: 1,
                  }}
                >
                  {label}
                </Typography>

                {/* Menu items */}
                {children.map((child) => (
                  <Box
                    key={child.id}
                    component="button"
                    onClick={() => handleChildClick(child.id)}
                    sx={getTooltipItemStyles(activeTab === child.id)}
                    tabIndex={0}
                    role="menuitem"
                  >
                    {child.icon && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'inherit',
                          '& svg': { width: 18, height: 18, strokeWidth: 1.75 },
                        }}
                      >
                        {child.icon}
                      </Box>
                    )}
                    <Typography
                      component="span"
                      sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                    >
                      {child.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Fade>
          )}
        </Popper>
      </>
    );
  }

  // Render expanded mode with dropdown
  return (
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
          onClick={handleToggle}
          sx={getTriggerStyles()}
          tabIndex={0}
          role="button"
          aria-label={label}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <Box sx={getIconStyles()}>{Icon}</Box>
          <Typography component="span" sx={getLabelStyles()}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}>
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Box>
        </Box>
      </motion.div>

      {/* Dropdown children with continuous vertical line */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ overflow: 'hidden' }}
          >
            <Box
              sx={{
                display: 'flex',
                ml: '32px',
                mt: '4px',
                mb: '6px',
              }}
            >
              {/* Continuous vertical line with active indicator */}
              <Box
                sx={{
                  position: 'relative',
                  width: '3px',
                  flexShrink: 0,
                  mr: '12px',
                }}
              >
                {/* Thin base line */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '1px',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    background: alpha(lineColor, 0.3),
                    borderRadius: '1px',
                  }}
                />
                {/* Thick active indicator */}
                {children.map((child, childIndex) => {
                  const isActive = activeTab === child.id;
                  if (!isActive) return null;
                  return (
                    <Box
                      key={child.id}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        width: '3px',
                        height: '30px',
                        mt: childIndex === 0 ? 1 : 0,
                        mb: childIndex === children.length - 1 ? 1 : 0,
                        top: `calc(${childIndex} * (46px + 4px))`,
                        background: alpha(lineColor, 0.7),
                        borderRadius: '2px',
                        transition: 'top 0.2s ease',
                      }}
                    />
                  );
                })}
              </Box>

              {/* Children items */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {children.map((child, childIndex) => {
                  const isActive = activeTab === child.id;
                  return (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: childIndex * 0.05 },
                      }}
                    >
                      <Box
                        component="button"
                        onClick={() => handleChildClick(child.id)}
                        sx={getChildItemStyles(isActive)}
                        tabIndex={0}
                        role="menuitem"
                      >
                        {child.icon && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              '& svg': { width: 18, height: 18 },
                            }}
                          >
                            {child.icon}
                          </Box>
                        )}
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          {child.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default SidebarDropdownItem;
