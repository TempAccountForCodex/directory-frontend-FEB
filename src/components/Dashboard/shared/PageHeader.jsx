import { Box, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * PageHeader Component
 *
 * Reusable page header component for dashboard pages with consistent styling
 * across all tabs (Insights, Websites, Stores, etc.)
 *
 * @param {string} title - Main heading text
 * @param {string} subtitle - Subheading/description text
 * @param {React.ReactNode} action - Optional action button(s) in the top right
 * @param {React.ReactNode} tabs - Optional tabs component to render below the header
 * @param {object} colors - Theme colors from getDashboardColors() (optional, will auto-derive)
 */
const PageHeader = ({ title, subtitle, action, tabs, colors: propColors }) => {
  const { actualTheme } = useCustomTheme();
  const colors = propColors || getDashboardColors(actualTheme);
  const isLight = colors.mode === 'light';

  const titleVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const headerContainerStyles = {
    marginBottom: { xs: '18px', md: '24px' },
  };

  const topRowStyles = {
    display: 'flex',
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: 'space-between',
    gap: { xs: '12px', md: '20px' },
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
  };

  const titleContainerStyles = {
    flex: 1,
    minWidth: 0,
    paddingTop: { xs: '2px', md: '4px' },
  };

  const titleStyles = {
    fontFamily: '"Special Gothic Expanded One", sans-serif',
    fontStyle: 'normal',
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.28rem' },
    lineHeight: 1.02,
    letterSpacing: '0.7px',
    marginBottom: { xs: '10px', md: '12px' },
    color: isLight ? colors.text : '#F8FAFC',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const subtitleStyles = {
    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1.02rem' },
    fontWeight: 400,
    color: isLight ? alpha(colors.text, 0.58) : alpha(colors.text, 0.68),
    lineHeight: 1.45,
    letterSpacing: '0.1px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const actionContainerStyles = {
    flexShrink: 0,
    alignSelf: { xs: 'flex-start', sm: 'center' },
  };

  const tabsContainerStyles = {
    marginTop: { xs: '12px', md: '16px' },
  };

  return (
    <Box sx={headerContainerStyles}>
      <Box sx={topRowStyles}>
        <Box sx={titleContainerStyles}>
          <motion.div variants={titleVariants} initial="hidden" animate="visible">
            <Typography component="h1" sx={titleStyles}>
              {title}
            </Typography>
          </motion.div>
          {subtitle && (
            <motion.div variants={subtitleVariants} initial="hidden" animate="visible">
              <Typography sx={subtitleStyles}>{subtitle}</Typography>
            </motion.div>
          )}
        </Box>

        {action && <Box sx={actionContainerStyles}>{action}</Box>}
      </Box>

      {tabs && <Box sx={tabsContainerStyles}>{tabs}</Box>}
    </Box>
  );
};

export default PageHeader;
