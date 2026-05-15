/**
 * KeyboardShortcutsHelp — Keyboard shortcuts help modal (Step 9.6.4)
 *
 * Features:
 * - MUI Dialog listing all registered shortcuts from useShortcutManager
 * - Grouped by category with ListSubheader
 * - Search/filter by description or key combo
 * - Platform-specific display (Cmd on Mac, Ctrl on Windows/Linux)
 * - First-time tooltip via localStorage flag 'editor-shortcuts-seen'
 * - Accessible: aria-label on dialog, keyboard navigation
 */

import React, { memo, useState, useCallback, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Box,
  Typography,
  Chip,
  Snackbar,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import type { ShortcutEntry } from "../../hooks/useShortcutManager";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIRST_TIME_FLAG = "editor-shortcuts-seen";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a normalized key combo for display.
 * - Replaces 'ctrl' with 'Cmd' on Mac, 'Ctrl' on others
 * - Capitalizes modifier and key names
 * - Joins with '+'
 */
const formatKeyCombo = (key: string, isMac: boolean): string[] => {
  const parts = key.split("+");
  return parts.map((part) => {
    switch (part.toLowerCase()) {
      case "ctrl":
        return isMac ? "Cmd" : "Ctrl";
      case "meta":
        return isMac ? "Cmd" : "Meta";
      case "shift":
        return "Shift";
      case "alt":
        return isMac ? "Opt" : "Alt";
      case "arrowup":
        return "↑";
      case "arrowdown":
        return "↓";
      case "arrowleft":
        return "←";
      case "arrowright":
        return "→";
      case "escape":
        return "Esc";
      case "delete":
        return "Del";
      case "enter":
        return "Enter";
      case "?":
        return "?";
      case "/":
        return "/";
      case "\\":
        return "\\";
      case "[":
        return "[";
      case "]":
        return "]";
      case "+":
        return "+";
      case "-":
        return "-";
      case "0":
        return "0";
      default:
        return part.toUpperCase();
    }
  });
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface KeyboardShortcutsHelpProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when user closes the dialog */
  onClose: () => void;
  /** Readonly map of all registered shortcuts from useShortcutManager */
  shortcuts: ReadonlyMap<string, ShortcutEntry>;
  /** True on macOS — controls Cmd vs Ctrl display */
  isMac: boolean;
  /** If true, shows first-time hint snackbar (respects localStorage flag) */
  showFirstTimeHint?: boolean;
}

// ---------------------------------------------------------------------------
// KeyComboChips sub-component
// ---------------------------------------------------------------------------

const KeyComboChips: React.FC<{ keyCombo: string; isMac: boolean }> = memo(
  ({ keyCombo, isMac }) => {
    const parts = formatKeyCombo(keyCombo, isMac);
    return (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {parts.map((part, i) => (
          <Chip
            key={i}
            label={part}
            size="small"
            variant="outlined"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontFamily: "monospace",
              borderRadius: 1,
              color: "text.secondary",
              borderColor: "divider",
            }}
          />
        ))}
      </Box>
    );
  },
);
KeyComboChips.displayName = "KeyComboChips";

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = memo(
  ({ open, onClose, shortcuts, isMac, showFirstTimeHint = false }) => {
    const [searchQuery, setSearchQuery] = useState("");
    // Initialize hintOpen by reading localStorage immediately (no effect needed for initial value)
    const [hintOpen, setHintOpen] = useState(() => {
      if (!showFirstTimeHint) return false;
      return !localStorage.getItem(FIRST_TIME_FLAG);
    });

    const handleHintClose = useCallback(() => {
      setHintOpen(false);
      localStorage.setItem(FIRST_TIME_FLAG, "1");
    }, []);

    const handleClose = useCallback(() => {
      onClose();
      setSearchQuery("");
    }, [onClose]);

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      },
      [],
    );

    // Filter shortcuts
    const filteredShortcuts = useMemo(() => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return Array.from(shortcuts.values());
      return Array.from(shortcuts.values()).filter(
        (s) =>
          s.description.toLowerCase().includes(query) ||
          s.key.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query),
      );
    }, [shortcuts, searchQuery]);

    // Group by category (preserving insertion order with a stable sort)
    const groupedShortcuts = useMemo(() => {
      const groups: Record<string, ShortcutEntry[]> = {};
      for (const entry of filteredShortcuts) {
        if (!groups[entry.category]) {
          groups[entry.category] = [];
        }
        groups[entry.category].push(entry);
      }
      return groups;
    }, [filteredShortcuts]);

    const categoryOrder = useMemo(
      () => ["Editing", "Blocks", "Navigation", "UI"],
      [],
    );

    // Sorted categories: known categories first, then alphabetical unknowns
    const sortedCategories = useMemo(() => {
      const cats = Object.keys(groupedShortcuts);
      return cats.sort((a, b) => {
        const ia = categoryOrder.indexOf(a);
        const ib = categoryOrder.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
    }, [groupedShortcuts, categoryOrder]);

    const modifierLabel = isMac ? "Cmd" : "Ctrl";

    return (
      <>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          aria-modal="true"
          PaperProps={{
            "aria-label": "Keyboard shortcuts help",
            role: "dialog",
            sx: {
              bgcolor: "background.paper",
              maxHeight: "80vh",
            },
          }}
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <KeyboardIcon fontSize="small" color="action" />
              <Typography variant="h6" component="span">
                Keyboard Shortcuts
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 0 }}>
            {/* Search box */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                aria-label="Search keyboard shortcuts"
              />
            </Box>

            {/* Shortcut list */}
            {filteredShortcuts.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">
                  No shortcuts match your search.
                </Typography>
              </Box>
            ) : (
              <List
                dense
                subheader={<li />}
                sx={{ pb: 0 }}
                aria-label="Keyboard shortcuts list"
              >
                {sortedCategories.map((category, catIdx) => (
                  <li key={category}>
                    <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                      <ListSubheader
                        disableSticky={false}
                        sx={{
                          bgcolor: "background.paper",
                          color: "text.primary",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          lineHeight: "36px",
                          borderTop: catIdx > 0 ? 1 : 0,
                          borderColor: "divider",
                        }}
                      >
                        {category}
                      </ListSubheader>
                      {groupedShortcuts[category].map((entry) => (
                        <ListItem
                          key={entry.key}
                          sx={{
                            py: 0.75,
                            px: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                          aria-keyshortcuts={entry.key}
                        >
                          <ListItemText
                            primary={entry.description}
                            primaryTypographyProps={{
                              variant: "body2",
                              color: "text.primary",
                            }}
                          />
                          <KeyComboChips keyCombo={entry.key} isMac={isMac} />
                        </ListItem>
                      ))}
                    </ul>
                  </li>
                ))}
              </List>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ flex: 1 }}
            >
              Press {modifierLabel}+? to open this panel
            </Typography>
            <Button
              onClick={handleClose}
              size="small"
              aria-label="Close shortcuts help"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* First-time hint snackbar — only rendered when hint should actually show */}
        {showFirstTimeHint && hintOpen && (
          <Snackbar
            open={hintOpen}
            onClose={handleHintClose}
            autoHideDuration={6000}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            message={`Press ${modifierLabel}+? to see all keyboard shortcuts`}
            action={
              <Button color="inherit" size="small" onClick={handleHintClose}>
                Got it
              </Button>
            }
            ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
          />
        )}
      </>
    );
  },
);

KeyboardShortcutsHelp.displayName = "KeyboardShortcutsHelp";

export default KeyboardShortcutsHelp;
