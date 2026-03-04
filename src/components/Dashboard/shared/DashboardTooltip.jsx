import { Tooltip } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * DashboardTooltip - Reusable tooltip component with consistent dashboard styling
 *
 * @param {string} title - Tooltip content
 * @param {string} placement - Tooltip placement (default: 'bottom')
 * @param {boolean} arrow - Show arrow (default: true)
 * @param {boolean} disabled - Disable tooltip hover listener
 * @param {object} colors - Optional override for theme colors
 * @param {React.ReactNode} children - Content to wrap with tooltip
 */
const DashboardTooltip = ({
  title,
  placement = 'bottom',
  arrow = true,
  disabled = false,
  colors: colorsProp,
  children,
  ...rest
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = colorsProp || getDashboardColors(actualTheme);

  const tooltipStyles = {
    '& .MuiTooltip-tooltip': {
      background: colors.dark,
      color: colors.text,
      fontSize: '0.8rem',
      fontWeight: 500,
      padding: '8px 12px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      boxShadow: colors.shadow,
    },
    '& .MuiTooltip-arrow': {
      color: colors.dark,
      '&::before': {
        border: `1px solid ${colors.border}`,
      },
    },
  };

  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      disableHoverListener={disabled || !title}
      componentsProps={{
        tooltip: {
          sx: tooltipStyles['& .MuiTooltip-tooltip'],
        },
        arrow: {
          sx: {
            color: colors.dark,
            '&::before': {
              border: `1px solid ${colors.border}`,
            },
          },
        },
      }}
      {...rest}
    >
      {children}
    </Tooltip>
  );
};

export default DashboardTooltip;
