/**
 * BottomSheet — Step 9.5.3 + Step 9.11.1
 *
 * A MUI SwipeableDrawer with anchor="bottom" that provides a mobile-friendly
 * overlay for the block library.  Includes swipe-to-close behaviour via the
 * SwipeableDrawer onClose / onOpen callbacks.
 *
 * Step 9.11.1 enhancements:
 * - role="dialog" and aria-modal="true" on drawer paper
 * - Escape key closes the sheet
 * - Enter key triggers onConfirm callback if provided
 *
 * Constraints:
 * - Uses MUI SwipeableDrawer (not Drawer) for swipe-to-close
 * - anchor must be "bottom"
 * - Uses MUI theme tokens only
 */
import React, { useCallback } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { SwipeableDrawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Optional confirm callback triggered by Enter key */
  onConfirm?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  onOpen,
  title,
  children,
  onConfirm,
}) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      } else if (event.key === "Enter" && onConfirm) {
        // Only trigger confirm if not on a button/link (let native behavior happen)
        const target = event.target as HTMLElement;
        const tag = target.tagName?.toUpperCase();
        if (
          tag !== "BUTTON" &&
          tag !== "A" &&
          tag !== "INPUT" &&
          tag !== "TEXTAREA"
        ) {
          event.preventDefault();
          onConfirm();
        }
      }
    },
    [onClose, onConfirm],
  );

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      PaperProps={
        {
          role: "dialog",
          "aria-modal": true,
          "aria-label": title || "Bottom sheet",
          onKeyDown: handleKeyDown,
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            // Max height: 85% of viewport so users can see content behind
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        } as React.ComponentProps<"div">
      }
      // iOS momentum scrolling
      ModalProps={{ keepMounted: true }}
    >
      {/* Swipe handle indicator */}
      <Box
        sx={{
          width: 32,
          height: 4,
          bgcolor: "action.disabled",
          borderRadius: 2,
          mx: "auto",
          mt: 1,
          mb: 0.5,
          flexShrink: 0,
        }}
      />

      {/* Header */}
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <IconButton
            aria-label="Close"
            size="small"
            onClick={onClose}
            sx={{ minHeight: 48, minWidth: 48 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Scrollable content */}
      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          p: 2,
          // Momentum scrolling on iOS
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </Box>
    </SwipeableDrawer>
  );
};

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;
