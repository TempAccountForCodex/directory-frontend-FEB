import { Box, Typography } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * AnalyticsPanelHeader Component
 *
 * Consistent header for analytics panels with title, subtitle, icon, and actions.
 *
 * @param {string} title - Panel title
 * @param {string} subtitle - Optional subtitle text
 * @param {React.ReactNode} icon - Optional icon shown before title
 * @param {React.ReactNode} action - Optional action area (filters, chips, buttons)
 * @param {object} colors - Theme colors from getDashboardColors() (optional, will auto-derive)
 * @param {object} sx - Optional style overrides for the header container
 */
const AnalyticsPanelHeader = ({ title, subtitle, icon, action, colors: propColors, sx }) => {
  const { actualTheme } = useCustomTheme();
  const colors = propColors || getDashboardColors(actualTheme);

  return (
    <Box
      sx={[
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        },
        sx,
      ]}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        {icon && <Box sx={{ display: 'flex', color: colors.primary }}>{icon}</Box>}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default AnalyticsPanelHeader;
