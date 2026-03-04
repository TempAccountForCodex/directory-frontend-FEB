import { Box, IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * RowActionButtonGroup Component
 *
 * Renders a row of icon actions with consistent styling.
 *
 * @param {Array} actions - Action configs: { label, icon, onClick, color, hoverColor, background, hoverBackground, disabled, show, tooltip, sx }
 * @param {string} size - IconButton size ("small" | "medium" | "large")
 * @param {object} colors - Theme colors from getDashboardColors() (optional, will auto-derive)
 * @param {object} sx - Optional style overrides for the container
 */
const RowActionButtonGroup = ({ actions = [], size = 'small', colors: propColors, sx }) => {
  const { actualTheme } = useCustomTheme();
  const colors = propColors || getDashboardColors(actualTheme);

  return (
    <Box sx={[{ display: 'flex', alignItems: 'center', gap: 1 }, sx]}>
      {actions
        .filter((action) => action && action.show !== false)
        .map((action, index) => {
          const {
            label,
            icon,
            onClick,
            color = colors.textSecondary,
            hoverColor = color,
            background = 'transparent',
            hoverBackground,
            disabled = false,
            tooltip,
            sx: actionSx,
          } = action;
          const resolvedHoverBackground =
            hoverBackground !== undefined ? hoverBackground : alpha(hoverColor, 0.15);

          return (
            <Tooltip key={label || index} title={tooltip || label || ''}>
              <span>
                <IconButton
                  size={size}
                  className="row-action-button"
                  onClick={onClick}
                  disabled={disabled}
                  sx={[
                    {
                      color: `${color} !important`,
                      background,
                      '&:hover': {
                        background: resolvedHoverBackground,
                        color: `${hoverColor} !important`,
                      },
                    },
                    actionSx,
                  ]}
                >
                  {icon}
                </IconButton>
              </span>
            </Tooltip>
          );
        })}
    </Box>
  );
};

export default RowActionButtonGroup;
