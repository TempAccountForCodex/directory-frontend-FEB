import { createTheme } from '@mui/material';
import mainTheme from './theme';
import dashboardStars from '../assets/common/star.svg';
import dashboardDarkHole from '../assets/common/darkhole.svg';
import lightModeBg from '../assets/dashboard/bg.jpeg';

const dashboardFontFamily =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';

// LIGHT MODE glass tokens - More opaque for readability like reference
const lightGlass = {
  blur: 16,
  sat: 120,
  bg: 'rgba(255, 255, 255, 0.92)', // More opaque for readable cards
  bgStrong: 'rgba(255, 255, 255, 0.96)', // Almost solid white
  bgSubtle: 'rgba(255, 255, 255, 0.75)', // For sidebar/overlays
  border: 'rgba(0, 0, 0, 0.06)',
  borderStrong: 'rgba(0, 0, 0, 0.10)',
  shadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowSm: '0 2px 8px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 8px 32px rgba(0, 0, 0, 0.10)',
};

const getLightGlassSurface = ({ strong = false, subtle = false } = {}) => ({
  backgroundColor: subtle ? lightGlass.bgSubtle : (strong ? lightGlass.bgStrong : lightGlass.bg),
  backdropFilter: `blur(${lightGlass.blur}px) saturate(${lightGlass.sat}%)`,
  WebkitBackdropFilter: `blur(${lightGlass.blur}px) saturate(${lightGlass.sat}%)`,
  border: `1px solid ${strong ? lightGlass.borderStrong : lightGlass.border}`,
  boxShadow: lightGlass.shadowSm,
});

export const getDashboardTheme = (mode = 'dark') =>
  createTheme({
    ...mainTheme,
    typography: {
      ...mainTheme.typography,
      fontFamily: dashboardFontFamily,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      allVariants: { fontFamily: dashboardFontFamily },
      body1: { ...(mainTheme.typography?.body1 || {}), fontWeight: 400 },
      body2: { ...(mainTheme.typography?.body2 || {}), fontWeight: 400 },
      button: { ...(mainTheme.typography?.button || {}), fontWeight: 400 },
    },
    palette: {
      ...mainTheme.palette,
      mode,
      background: {
        // keep your existing dark exactly the same
        default: mode === 'dark' ? '#090A0B' : '#F6F7FB',
        // IMPORTANT: in light mode make Paper transparent so the glass surface shows
        paper: mode === 'dark' ? mainTheme.palette.bg.dark : 'transparent',
      },
      text: {
        primary: mode === 'dark' ? '#F5F5F5' : '#111827',
        secondary: mode === 'dark' ? '#8a8fa3' : '#6b7280',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(17, 24, 39, 0.10)',
      success: { main: mode === 'dark' ? '#4ecb71' : '#059669' },
      error: { main: mode === 'dark' ? '#ff6b6b' : '#dc2626' },
      warning: { main: mode === 'dark' ? '#ffc107' : '#d97706' },
      info: { main: mode === 'dark' ? '#378C92' : '#378C92' },
    },
    components: {
      /**
       * LIGHT MODE ONLY background scene (so blur has something to blur).
       * Dark mode: NO changes.
       */
      ...(mode === 'light'
        ? {
            MuiCssBaseline: {
              styleOverrides: {
                body: {
                  // Background handled in Dashboard.jsx for proper z-index layering
                },
              },
            },

            /**
             * Light mode component styles - Clean, readable cards
             */
            MuiPaper: {
              styleOverrides: {
                root: {
                  ...getLightGlassSurface({ strong: true }),
                  borderRadius: 16,
                  backgroundImage: 'none',
                },
              },
            },
            MuiCard: {
              styleOverrides: {
                root: {
                  ...getLightGlassSurface({ strong: true }),
                  borderRadius: 16,
                },
              },
            },
            MuiDrawer: {
              styleOverrides: {
                paper: {
                  ...getLightGlassSurface({ subtle: true }),
                  borderRadius: 0,
                  border: 'none',
                },
              },
            },
            MuiAppBar: {
              styleOverrides: {
                root: {
                  ...getLightGlassSurface({ strong: true }),
                  borderRadius: 16,
                },
              },
            },
            // Better input styling for light mode
            MuiTextField: {
              styleOverrides: {
                root: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 12,
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.08)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.15)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#378C92',
                    },
                  },
                },
              },
            },
            MuiButton: {
              styleOverrides: {
                root: {
                  borderRadius: 10,
                  textTransform: 'none',
                  fontWeight: 500,
                },
                contained: {
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                  },
                },
              },
            },
          }
        : {
            // DARK MODE: DO NOT TOUCH ANYTHING
          }),
    },
  });

// Legacy export for backward compatibility
export const dashboardTheme = getDashboardTheme('dark');

// Helper to get all colors easily based on theme mode
export const getDashboardColors = (mode = 'dark') => {
  if (mode === 'light') {
    // Light mode colors - Warm, readable, professional (like reference image)
    return {
      mode: 'light',
      primary: mainTheme.palette.text.main, // #378C92 - Brand teal
      primaryLight: '#4fb3ba',
      primaryDark: '#2d7377',

      // Sidebar specific colors (light mode - merged with background)
      sidebarBg: 'rgba(255, 255, 255, 0.35)', // Subtle glass
      sidebarActive: 'rgba(255, 255, 255, 0.5)', // Hover background
      sidebarActiveBg: '#40a0a7', // Selected - more visible
      sidebarActiveText: '#111827', // Very dark for selected
      sidebarIcon: '#000000', // Darker gray icons for visibility
      sidebarIconActive: '#111827', // Very dark active icons

      // Card backgrounds
      dark: 'rgba(255, 255, 255, 0.9)', // Card background
      darker: 'rgba(255, 255, 255, 0.6)', // Strong card background
      cardBg: 'rgba(255, 255, 255, 0.95)', // Almost solid white
      cardBgLight: 'rgba(255, 255, 255, 0.85)',

      // Row backgrounds
      rowBg: 'rgba(255, 255, 255, 0.6)',
      rowHover: 'rgba(255, 255, 255, 0.6)',

      // Borders - subtle but visible
      border: 'rgba(0, 0, 0, 0.08)',
      borderLight: 'rgba(0, 0, 0, 0.05)',

      // Text colors - STRONG CONTRAST for readability
      text: '#000000', // Very dark gray (almost black)
      textSecondary: '#000000', // Medium dark gray
      textTertiary: '#6b7280', // Still readable
      textLight: '#ffffff',

      // Panel/popup/table palette - Clean whites with good contrast
      panelBg: 'rgba(255, 255, 255, 0.55)', // Same as sidebar,
      panelBorder: 'rgba(0, 0, 0, 0.08)',
      panelText: '#111827', // Very dark
      panelMuted: '#4b5563', // Readable muted
      panelSubtle: '#6b7280', // Section headers
      panelIcon: '#374151', // Dark icons
      panelHover: 'rgba(0, 0, 0, 0.04)',
      panelShadow: '0 8px 32px rgba(0, 0, 0, 0.10)',
      panelShadowSm: '0 4px 12px rgba(0, 0, 0, 0.08)',
      panelAccent: '#14b8a6',
      panelWarning: '#d97706',
      panelDanger: '#dc2626',
      panelInfo: '#2563eb',

      // Status colors
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706',

      // Background references
      bgDefault: `url(${lightModeBg})`,
      bgBase: 'transparent', // Let background image show
      bgImage: lightModeBg,
      bgImageAccent: 'none',
      bgPaper: 'rgba(255, 255, 255, 0.61)',
      bgHero: 'rgba(255, 255, 255, 0.5)',
      bgCard: 'rgba(255, 255, 255, 0.55)',

      // Shadows
      shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      shadowMd: '0 4px 16px rgba(0, 0, 0, 0.10)',
    };
  }

  // Dark mode colors (Channel Analytics warm dark gray aesthetic)
  return {
    mode: 'dark',
    primary: mainTheme.palette.text.main, // #378C92 (unchanged)
    primaryLight: '#4ba3a9',
    primaryDark: '#2d7377',

    // Sidebar specific colors (matching reference image)
    sidebarBg: '#202427', // Near-black sidebar
    sidebarActive: 'rgba(255, 255, 255, 0.08)', // Subtle hover background
    sidebarActiveBg: mainTheme.palette.text.main,
    sidebarActiveHoverBg: '#347b80 ', // Teal selected background
    sidebarActiveText: '#000000', // Black selected text/icons
    sidebarIcon: '#b2b5b8', // Muted gray icons
    sidebarIconActive: '#F5F5F5', // White active icons

    // Dark teal-green backgrounds (auth screen style)
    dark: '#111114', // Sidebar base - near black
    darker: '#0a0f0d', // Darkest teal-tinted
    cardBg: 'rgba(20, 28, 26, 0.8)', // Teal-tinted glassmorphic card
    cardBgLight: 'rgba(25, 35, 32, 0.7)', // Lighter teal variant

    // Row backgrounds (teal-tinted tones)
    rowBg: '#121517',
    rowHover: 'rgba(255, 255, 255, 0.06)',

    // Borders (teal-tinted for auth screen style)
    border: 'rgba(55, 140, 146, 0.15)',
    borderLight: 'rgba(55, 140, 146, 0.08)',

    // Text colors (unchanged)
    text: '#F5F5F5',
    textSecondary: '#9FA6AE',
    textTertiary: '#6b7280',
    textLight: '#ffffff',

    // Panel/popup/table palette
    panelBg: '#121517',
    panelBorder: 'rgba(255, 255, 255, 0.08)',
    panelText: '#f8fafc',
    panelMuted: '#9ca3af',
    panelSubtle: '#6b7280',
    panelIcon: '#e5e7eb',
    panelHover: 'rgba(255, 255, 255, 0.06)',
    panelShadow: '0 20px 40px rgba(0, 0, 0, 0.55)',
    panelShadowSm: '0 6px 14px rgba(0, 0, 0, 0.35)',
    panelAccent: '#2dd4bf',
    panelWarning: '#f59e0b',
    panelDanger: '#ef4444',
    panelInfo: '#60a5fa',

    // Status colors (unchanged)
    success: '#4ecb71',
    error: '#ff6b6b',
    warning: '#ffc107',

    // Background references - auth screen dark teal-green gradient
    bgDefault: 'linear-gradient(135deg, #101a17 0%, #0e1814 50%, #0d1612 100%)',
    bgBase: '#090A0B',
    bgImage: dashboardStars,
    bgImageAccent: dashboardDarkHole,
    bgPaper: '#111816', // Dark teal-tinted
    bgHero: '#111816', // Sidebar/header
    bgCard: '#121517',

    // Shadows (enhanced for depth)
    shadow: '0 4px 24px rgba(0,0,0,0.4)',
    shadowMd: '0 8px 32px rgba(0,0,0,0.5)',
  };
};

/**
 * Your helper – only change LIGHT mode return.
 * Dark mode return stays exactly as you currently have it.
 */
export const getGlassCardStyles = (mode = 'dark') => {
  // DARK MODE: keep your existing dark styles exactly as-is
  if (mode === 'dark') {
    return {
      background: 'rgba(15, 20, 18, 0.85)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(55, 140, 146, 0.12)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(55, 140, 146, 0.18)',
      },
    };
  }

  // LIGHT MODE: Clean white cards with subtle shadow
  return {
    ...getLightGlassSurface({ strong: true }),
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: lightGlass.shadow,
    },
  };
};
