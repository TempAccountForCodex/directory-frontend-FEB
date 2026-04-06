/**
 * useResponsiveEditor — Step 9.5.1
 *
 * Provides isMobile / isTablet / isDesktop breakpoint flags and a
 * derived `columns` count (1 / 2 / 3) for the editor layout.
 *
 * Breakpoints (MUI defaults):
 *   xs  0     – sm  599px   → mobile   (1 column)
 *   sm  600   – md  899px   → tablet   (2 columns)
 *   md  900+              → desktop  (3 columns)
 */
import { useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export interface ResponsiveEditorState {
  /** true on xs / sm viewports (< 900px) */
  isMobile: boolean;
  /** true on md viewports (900–1199px) */
  isTablet: boolean;
  /** true on lg / xl viewports (≥ 1200px) */
  isDesktop: boolean;
  /** 1 on mobile, 2 on tablet, 3 on desktop */
  columns: 1 | 2 | 3;
}

export function useResponsiveEditor(): ResponsiveEditorState {
  const theme = useTheme();

  // down('md') covers xs + sm + md → ≤ 899px  → "mobile" in editor terms
  const isMobileRaw = useMediaQuery(theme.breakpoints.down("md"));
  // between('md','lg') → 900–1199px
  const isTabletRaw = useMediaQuery(theme.breakpoints.between("md", "lg"));
  // up('lg') → ≥ 1200px
  const isDesktopRaw = useMediaQuery(theme.breakpoints.up("lg"));

  return useMemo<ResponsiveEditorState>(() => {
    // Mutually-exclusive priority: desktop > tablet > mobile
    if (isDesktopRaw) {
      return { isMobile: false, isTablet: false, isDesktop: true, columns: 3 };
    }
    if (isTabletRaw) {
      return { isMobile: false, isTablet: true, isDesktop: false, columns: 2 };
    }
    // Fallback — mobile (or SSR where all queries return false)
    return {
      isMobile: isMobileRaw || true,
      isTablet: false,
      isDesktop: false,
      columns: 1,
    };
  }, [isMobileRaw, isTabletRaw, isDesktopRaw]);
}
