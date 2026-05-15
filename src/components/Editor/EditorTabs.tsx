/**
 * EditorTabs — Step 9.13.1
 *
 * Thin wrapper around TabNavigation that pre-configures the 4
 * customization tabs with MUI icons and localStorage persistence.
 *
 * Tabs:
 *   1. Appearance  (PaletteIcon)
 *   2. Layout      (GridViewIcon)
 *   3. Simple      (TuneIcon)
 *   4. Detailed    (SettingsIcon)
 *
 * Persistence: localStorage key 'editor-active-tab'
 * On mount: reads stored tab and calls onChange if it differs from activeTab prop.
 * On change: calls onChange + writes to localStorage.
 * Tab switching: <50ms — no heavy computation in handler.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders
 * - useCallback on handleChange for stable handler reference
 */

import React, { useEffect, useCallback } from "react";
import PaletteIcon from "@mui/icons-material/Palette";
import GridViewIcon from "@mui/icons-material/GridView";
import TuneIcon from "@mui/icons-material/Tune";
import SettingsIcon from "@mui/icons-material/Settings";
// @ts-ignore — TabNavigation is a JS component
import TabNavigation from "../Dashboard/shared/TabNavigation";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "editor-active-tab";

const TABS = [
  {
    label: "Appearance",
    value: "appearance",
    icon: <PaletteIcon fontSize="small" />,
  },
  { label: "Layout", value: "layout", icon: <GridViewIcon fontSize="small" /> },
  { label: "Simple", value: "simple", icon: <TuneIcon fontSize="small" /> },
  {
    label: "Detailed",
    value: "detailed",
    icon: <SettingsIcon fontSize="small" />,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EditorTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

// ---------------------------------------------------------------------------
// EditorTabs
// ---------------------------------------------------------------------------

const EditorTabs: React.FC<EditorTabsProps> = React.memo(
  ({ activeTab, onChange }) => {
    // On mount: read localStorage and restore stored tab
    useEffect(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored !== activeTab) {
          onChange(stored);
        }
      } catch {
        // Ignore storage errors
      }
      // Run only on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tab change: <50ms — just setState in parent + localStorage.setItem
    const handleChange = useCallback(
      (_event: React.SyntheticEvent, newValue: string) => {
        try {
          localStorage.setItem(STORAGE_KEY, newValue);
        } catch {
          // Ignore storage errors
        }
        onChange(newValue);
      },
      [onChange],
    );

    return (
      <TabNavigation tabs={TABS} value={activeTab} onChange={handleChange} />
    );
  },
);

EditorTabs.displayName = "EditorTabs";

export default EditorTabs;
