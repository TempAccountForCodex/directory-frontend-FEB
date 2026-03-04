import { Box, Typography, alpha } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardTooltip from './DashboardTooltip';

/**
 * DashboardIconButton - Reusable icon button that expands on hover to show label
 *
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} label - Text label shown on hover
 * @param {string} tooltip - Tooltip text (defaults to label)
 * @param {string} variant - 'filled' (primary) or 'outlined' (secondary)
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disable the button
 * @param {object} colors - Optional override for theme colors
 * @param {object} sx - Additional sx styles
 */
const DashboardIconButton = ({
  icon,
  label,
  tooltip,
  variant = 'filled',
  onClick,
  disabled = false,
  colors: colorsProp,
  sx = {},
  ...rest
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = colorsProp || getDashboardColors(actualTheme);

  const isFilled = variant === 'filled';
  const tooltipText = tooltip || label;

  const getButtonStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: '50px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: disabled ? 0.5 : 1,
    };

    if (isFilled) {
      return {
        ...baseStyles,
        bgcolor: colors.primary,
        color: '#fff',
        p: { xs: '10px', sm: '14px' },
        maxWidth: { xs: 44, sm: 52 },
        boxShadow: `0 2px 8px ${alpha(colors.primary, 0.3)}`,
        '&:hover': disabled
          ? {}
          : {
              maxWidth: 220,
              px: 2.5,
              bgcolor: alpha(colors.primary, 0.88),
              boxShadow: `0 4px 16px ${alpha(colors.primary, 0.4)}`,
            },
        '&:active': disabled
          ? {}
          : {
              transform: 'scale(0.96)',
            },
      };
    }

    // Outlined variant
    return {
      ...baseStyles,
      bgcolor: colors.bgHero,
      color: colors.primary,
      border: `1.5px solid ${alpha(colors.primary, 0.35)}`,
      p: { xs: '9px', sm: '13px' },
      maxWidth: { xs: 44, sm: 52 },
      boxShadow: `0 2px 8px ${alpha(colors.primary, 0.1)}`,
      '&:hover': disabled
        ? {}
        : {
            maxWidth: 200,
            px: 2.5,
            bgcolor: colors.bgHero,
            borderColor: colors.primary,
            boxShadow: `0 4px 16px ${alpha(colors.primary, 0.2)}`,
          },
      '&:active': disabled
        ? {}
        : {
            transform: 'scale(0.96)',
          },
    };
  };

  const getLabelStyles = () => ({
    fontWeight: 600,
    fontSize: '0.8rem',
    opacity: 0,
    transition: 'opacity 0.2s ease 0.1s',
    '.MuiBox-root:hover > &': {
      opacity: 1,
    },
  });

  return (
    <DashboardTooltip title={tooltipText} placement="bottom">
      <Box
        onClick={disabled ? undefined : onClick}
        sx={{
          ...getButtonStyles(),
          ...sx,
        }}
        {...rest}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
        {label && (
          <Typography variant="body2" sx={getLabelStyles()}>
            {label}
          </Typography>
        )}
      </Box>
    </DashboardTooltip>
  );
};

export default DashboardIconButton;
