import { useState, useCallback, useEffect } from "react";
import { Box, Typography, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";
import SidebarDropdownItem from "./SidebarDropdownItem";

// Logo imports
import WhiteLogo from "/assets/images/header/WhiteLogo.png";
import BlackLogo from "../../../assets/images/BlackLogo.webp";
import LogoBlackSmall from "../../../assets/images/LogoBlackSmall.webp";
import LogoWhiteSmall from "../../../assets/images/LogoWhiteSmall.webp";

/**
 * CollapsibleSidebar - Main sidebar with collapse toggle
 *
 * @param {boolean} isCollapsed - Current collapse state
 * @param {function} onToggleCollapse - Toggle handler
 * @param {array} menuItems - Main navigation items array
 * @param {array} bottomMenuItems - Bottom section items (Settings)
 * @param {string} activeTab - Currently active tab ID
 * @param {function} onTabChange - Tab navigation handler
 * @param {object} user - User object (unused here, for future)
 * @param {function} onLogout - Logout handler
 * @param {boolean} isMobile - Mobile viewport flag
 * @param {function} onMobileClose - Close drawer on mobile
 * @param {object} colors - Theme colors from getDashboardColors()
 */
const CollapsibleSidebar = ({
  isCollapsed = false,
  onToggleCollapse,
  menuItems = [],
  bottomMenuItems = [],
  activeTab,
  onTabChange,
  isMobile = false,
  onMobileClose,
  colors,
}) => {
  const navigate = useNavigate();
  const isLight = colors.mode === "light";
  const expandedLogoSrc = isLight ? BlackLogo : WhiteLogo;
  const collapsedLogoSrc = isLight ? LogoBlackSmall : LogoWhiteSmall;

  // Track which dropdown is currently open (null = none open)
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Handle dropdown toggle - opening one closes others
  const handleDropdownToggle = useCallback((dropdownId) => {
    setOpenDropdownId((prev) => (prev === dropdownId ? null : dropdownId));
  }, []);

  // Close all dropdowns when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdownId(null);
    }
  }, [isCollapsed]);

  // Framer Motion animation variants
  const sidebarVariants = {
    expanded: {
      width: 300,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.02,
      },
    },
    collapsed: {
      width: 70,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  };

  // Styles - Sidebar container styling
  const getSidebarContainerStyles = () => ({
    width: isCollapsed ? 70 : 300,
    minWidth: isCollapsed ? 70 : 300,
    height: isMobile || !isCollapsed ? "100vh" : "calc(100vh - 32px)",
    margin: isMobile || !isCollapsed ? 0 : "16px 0 16px 16px",
    borderRadius: isMobile || !isCollapsed ? 0 : "24px",
    // Light mode: subtle glass effect merged with background
    ...(isLight
      ? {
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(12px) saturate(150%)",
          WebkitBackdropFilter: "blur(12px) saturate(150%)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        }
      : {
          background: colors.sidebarBg || colors.dark,
        }),
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    // Use specific transitions instead of 'all' for better performance
    // 'all' causes expensive reflows, especially on pages with sticky elements
    transition:
      "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    willChange: "width, min-width", // Hint to browser for GPU optimization
  });

  const getLogoSectionStyles = () => ({
    padding: isCollapsed ? "20px 12px" : "24px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: isLight
      ? `4px solid ${colors.border}`
      : `1px solid ${colors.border}`,
    position: "relative",
    zIndex: 1,
  });

  const getNavSectionStyles = () => ({
    flex: 1,
    padding: "16px 12px",
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    zIndex: 1,

    // Custom scrollbar
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: alpha("#fff", 0.1),
      borderRadius: "4px",
    },
  });

  const getBottomSectionStyles = () => ({
    paddingX: "12px",
    paddingY: "8px",
    borderTop: `1px solid ${colors.border}`,
    position: "relative",
    zIndex: 1,
  });

  const getToggleButtonStyles = () => ({
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: isCollapsed ? "center" : "flex-start",
    gap: isCollapsed ? 0 : "12px",
    background: "transparent",
    border: "none",
    color: colors.sidebarIcon || "#6b7280",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    fontWeight: 500,

    "&:hover": {
      background: isLight
        ? "rgba(255, 255, 255, 0.4)"
        : "rgba(255, 255, 255, 0.04)",
      color: colors.sidebarIconActive || "#F5F5F5",
    },
  });

  // Handle navigation item click
  const handleNavClick = (itemId) => {
    onTabChange(itemId);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  // Handle logo click - navigate to home
  const handleLogoClick = () => {
    navigate("/");
  };

  // Filter visible menu items
  const visibleMenuItems = menuItems.filter((item) => item.visible !== false);
  const visibleBottomItems = bottomMenuItems.filter(
    (item) => item.visible !== false,
  );

  return (
    <motion.div
      data-testid="CollapsibleSidebar"
      variants={sidebarVariants}
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
    >
      <Box sx={getSidebarContainerStyles()}>
        {/* Logo Section */}
        <Box sx={getLogoSectionStyles()}>
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.img
                key="collapsed-logo"
                src={collapsedLogoSrc}
                alt="Logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  cursor: "pointer",
                  objectFit: "contain",
                }}
                onClick={handleLogoClick}
              />
            ) : (
              <motion.img
                key="expanded-logo"
                src={expandedLogoSrc}
                alt="TechietTribe"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 160,
                  height: "auto",
                  cursor: "pointer",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
                onClick={handleLogoClick}
              />
            )}
          </AnimatePresence>
        </Box>

        {/* Navigation Section */}
        <Box sx={getNavSectionStyles()}>
          {visibleMenuItems.map((item, index) => {
            // Render section header
            if (item.type === "header") {
              return (
                <AnimatePresence key={`header-${item.label}`}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: isLight
                            ? "#374151"
                            : colors.panelSubtle || "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          px: 1,
                          pt: index === 0 ? 0 : 2,
                          pb: 1,
                        }}
                      >
                        {item.label}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            }

            // Render dropdown item
            if (item.type === "dropdown" && item.children) {
              return (
                <SidebarDropdownItem
                  key={item.id}
                  dropdownId={item.id}
                  icon={item.icon}
                  label={item.label}
                  children={item.children}
                  isCollapsed={isCollapsed}
                  activeTab={activeTab}
                  onItemClick={handleNavClick}
                  index={index}
                  isOpen={openDropdownId === item.id}
                  onToggle={handleDropdownToggle}
                />
              );
            }

            // Render nav item
            return (
              <SidebarNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                isCollapsed={isCollapsed}
                onClick={() => handleNavClick(item.id)}
                badge={item.badge}
                index={index}
              />
            );
          })}
        </Box>

        {/* Bottom Section */}
        <Box sx={getBottomSectionStyles()}>
          {/* Settings */}
          {visibleBottomItems.map((item, index) => (
            <SidebarNavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              isCollapsed={isCollapsed}
              onClick={() => handleNavClick(item.id)}
              index={visibleMenuItems.length + index}
            />
          ))}

          {/* Collapse Toggle Button */}
          {!isMobile && (
            <Box
              component={motion.button}
              onClick={onToggleCollapse}
              sx={getToggleButtonStyles()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", alignItems: "center" }}
              >
                <ChevronLeft size={22} />
              </motion.div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default CollapsibleSidebar;
