import { Paper } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * DashboardPanel Component
 *
 * Reusable panel wrapper for dashboard sections.
 *
 * @param {React.ReactNode} children - Panel content
 * @param {string} variant - "panel" (default) or "card"
 * @param {number|object} padding - Panel padding (sx-compatible)
 * @param {object} colors - Theme colors from getDashboardColors() (optional, will auto-derive)
 * @param {object} sx - Optional style overrides
 */
const DashboardPanel = ({
  children,
  variant = 'panel',
  padding = 3,
  colors: propColors,
  sx,
  ...props
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = propColors || getDashboardColors(actualTheme);
  const isCard = variant === 'card';

  const baseStyles = {
    background: isCard ? colors.bgCard : colors.panelBg,
    border: `1px solid ${isCard ? colors.border : colors.panelBorder}`,
    borderRadius: { xs: 2, md: 3 },
    boxShadow: isCard ? colors.shadow : colors.panelShadowSm,
    p: padding,
  };

  return (
    <Paper elevation={0} {...props} sx={[baseStyles, sx]}>
      {children}
    </Paper>
  );
};

export default DashboardPanel;
