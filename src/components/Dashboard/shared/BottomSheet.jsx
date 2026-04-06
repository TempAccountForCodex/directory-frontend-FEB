/**
 * BottomSheet — Step 9.5.3
 *
 * Reusable mobile bottom sheet drawer with 3 snap points and swipe-to-dismiss.
 * Snap points: 0=collapsed (handle only), 1=half screen, 2=full screen.
 * Swipe down: collapse or dismiss. Swipe up: expand.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - useCallback on touch handlers for stable references
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Drawer, Box, Typography, alpha } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const SNAP_HEIGHTS = ['64px', '52vh', '90vh'];

/**
 * BottomSheet — reusable mobile bottom drawer (Step 9.5.3)
 *
 * @param {boolean} open - Sheet visibility
 * @param {function} onClose - Called when dismissed
 * @param {string} [title] - Header title
 * @param {number} [initialSnap=1] - Initial snap index 0/1/2
 * @param {React.ReactNode} children - Sheet content
 * @param {object} [sx={}] - Additional Paper sx overrides
 */
const BottomSheet = ({
  open,
  onClose,
  title,
  initialSnap = 1,
  children,
  sx = {},
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [snap, setSnap] = useState(initialSnap);
  const touchStartY = useRef(null);

  // Reset to initial snap when reopened
  useEffect(() => {
    if (open) setSnap(initialSnap);
  }, [open, initialSnap]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartY.current === null) return;
      const delta = e.changedTouches[0].clientY - touchStartY.current;
      touchStartY.current = null;

      if (delta > 80) {
        // Swipe down: collapse one step or dismiss
        const next = snap - 1;
        if (next < 0) onClose?.();
        else setSnap(next);
      } else if (delta < -80) {
        // Swipe up: expand one step
        setSnap((s) => Math.min(2, s + 1));
      }
    },
    [snap, onClose]
  );

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: SNAP_HEIGHTS[snap],
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          bgcolor: colors.bgDefault,
          transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...sx,
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      {/* Drag handle + title */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 1.5,
          pb: 1,
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(colors.textSecondary, 0.4),
            mb: title ? 1 : 0,
          }}
        />
        {title && (
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
            {title}
          </Typography>
        )}
      </Box>

      {/* Snap point indicators */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            onClick={() => setSnap(i)}
            sx={{
              width: snap === i ? 20 : 8,
              height: 6,
              borderRadius: 3,
              bgcolor: snap === i ? colors.primary : alpha(colors.textSecondary, 0.3),
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
        {children}
      </Box>
    </Drawer>
  );
};

export default BottomSheet;
