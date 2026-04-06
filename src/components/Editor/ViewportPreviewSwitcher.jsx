/**
 * ViewportPreviewSwitcher — Step 9.5.4
 *
 * Toolbar to select preview viewport width and toggle orientation.
 * Preset widths: 375 (mobile), 768 (tablet), 1280 (desktop).
 * Orientation toggle rotates the viewport for landscape testing.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo to prevent unnecessary rerenders
 * - useCallback on change handler
 */

import { memo, useCallback } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Tooltip, alpha } from '@mui/material';
import { Monitor, Tablet, Smartphone, RotateCcw } from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

const VIEWPORTS = [
  { label: 'Mobile', width: 375, Icon: Smartphone },
  { label: 'Tablet', width: 768, Icon: Tablet },
  { label: 'Desktop', width: 1280, Icon: Monitor },
];

/**
 * ViewportPreviewSwitcher — Step 9.5.4
 *
 * @param {number} [width=1280] - Active viewport width (375/768/1280)
 * @param {string} [orientation='portrait'] - 'portrait' | 'landscape'
 * @param {function} onWidthChange - (width: number) => void
 * @param {function} onOrientationToggle - () => void
 */
const ViewportPreviewSwitcher = memo(({
  width = 1280,
  orientation = 'portrait',
  onWidthChange,
  onOrientationToggle,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const handleChange = useCallback(
    (_, val) => {
      if (val !== null) onWidthChange?.(val);
    },
    [onWidthChange]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ToggleButtonGroup
        value={width}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            border: `1px solid ${alpha(colors.primary, 0.3)}`,
            color: colors.textSecondary,
            minWidth: 40,
            minHeight: 36,
            '&.Mui-selected': {
              bgcolor: alpha(colors.primary, 0.15),
              color: colors.primary,
              borderColor: colors.primary,
            },
          },
        }}
      >
        {VIEWPORTS.map(({ label, width: w, Icon }) => (
          <Tooltip key={w} title={`${label} — ${w}px`}>
            <ToggleButton value={w} aria-label={label}>
              <Icon size={16} />
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>

      <Tooltip title={`Toggle orientation (${orientation})`}>
        <Box
          role="button"
          tabIndex={0}
          onClick={onOrientationToggle}
          onKeyDown={(e) => e.key === 'Enter' && onOrientationToggle?.()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 1,
            border: `1px solid ${alpha(colors.primary, 0.3)}`,
            cursor: 'pointer',
            color: colors.textSecondary,
            '&:hover': { bgcolor: alpha(colors.primary, 0.1), color: colors.primary },
            transform: orientation === 'landscape' ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <RotateCcw size={16} />
        </Box>
      </Tooltip>
    </Box>
  );
});

ViewportPreviewSwitcher.displayName = 'ViewportPreviewSwitcher';

export default ViewportPreviewSwitcher;
