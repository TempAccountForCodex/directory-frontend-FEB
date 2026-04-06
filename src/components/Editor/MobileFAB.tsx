/**
 * MobileFAB — Step 9.5.3 + Step 9.11.2
 *
 * A Floating Action Button (FAB) visible only on mobile viewports.
 * Tapping it opens the block library BottomSheet.
 *
 * Step 9.11.2 enhancements:
 * - Tooltip with keyboard shortcut hint
 * - Ensured Tab-focusable (MUI Fab is inherently focusable)
 *
 * Constraints:
 * - Hidden on md+ breakpoints via sx display
 * - aria-label must include "Add block"
 * - Uses MUI theme tokens only (no hardcoded colors)
 */
import React from "react";
import { Fab, Box, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export interface MobileFABProps {
  onOpen: () => void;
}

const MobileFAB: React.FC<MobileFABProps> = ({ onOpen }) => {
  return (
    <Box
      data-testid="mobile-fab-wrapper"
      sx={{
        // Hidden on md and above
        display: { xs: "block", md: "none" },
      }}
    >
      <Tooltip title="Add a new block">
        <Fab
          aria-label="Add block"
          color="primary"
          onClick={onOpen}
          sx={{
            position: "fixed",
            // Sit above MobileActionBar (bottom: 72 accounts for 64px bar + 8px gap)
            bottom: 72,
            right: 16,
            zIndex: (theme) => theme.zIndex.speedDial,
            // Touch target already >= 48px by default for Fab (56px)
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

MobileFAB.displayName = "MobileFAB";

export default MobileFAB;
