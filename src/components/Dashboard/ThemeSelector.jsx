import { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import { Check, Laptop, Moon, Settings, Sun } from 'lucide-react';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { getDashboardColors } from '../../styles/dashboardTheme';
import DashboardCard from './shared/DashboardCard';

/**
 * ThemeSelector - Theme switcher with popover or inline mode
 *
 * @param {string} variant - 'popover' (default icon button) or 'inline' (horizontal buttons)
 */
const ThemeSelector = ({ variant = 'popover' }) => {
  const { themeMode, actualTheme, changeTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [anchorEl, setAnchorEl] = useState(null);
  const isDark = actualTheme === 'dark';
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (mode) => {
    changeTheme(mode);
    handleClose();
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Light mode',
      icon: <Sun size={20} />,
      description: 'Best for bright environments',
    },
    {
      value: 'dark',
      label: 'Dark mode',
      icon: <Moon size={20} />,
      description: 'Recommended for dark rooms',
    },
    {
      value: 'system',
      label: 'System',
      icon: <Sun size={20} />,
      description: "Adapts to your device's theme",
    },
  ];

  const getCurrentIcon = () => {
    if (themeMode === 'system') return <Laptop size={18} />;
    if (themeMode === 'light') return <Sun size={18} />;
    return <Moon size={18} />;
  };

  // Inline variant - matches settings card style in the example
  if (variant === 'inline') {
    return (
      <DashboardCard icon={Settings} title="Theme options">
        <Box
          sx={{
            mt: 2,
            borderRadius: '16px',
            border: `1px solid ${isDark ? alpha(colors.text, 0.1) : alpha('#000', 0.08)}`,
            background: isDark ? alpha('#000', 0.2) : alpha('#f8fafc', 0.5),
            overflow: 'hidden',
          }}
        >
          {themeOptions.map((option, index) => {
            const isSelected = themeMode === option.value;
            return (
              <Box
                key={option.value}
                onClick={() => changeTheme(option.value)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 1.6,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom:
                    index < themeOptions.length - 1
                      ? `1px solid ${isDark ? alpha(colors.text, 0.08) : alpha('#000', 0.05)}`
                      : 'none',
                  '&:hover': {
                    background: isDark ? alpha(colors.text, 0.03) : alpha(colors.primary, 0.03),
                  },
                }}
              >
                {/* Option Icon */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark ? alpha(colors.text, 0.04) : '#fff',
                    border: `1px solid ${isDark ? alpha(colors.text, 0.08) : alpha('#000', 0.05)}`,
                    boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                    color: isSelected ? colors.primary : colors.text,
                    flexShrink: 0,
                  }}
                >
                  {option.icon}
                </Box>

                {/* Option Text */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: isSelected ? 600 : 500,
                      color: colors.text,
                    }}
                  >
                    {option.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: alpha(colors.text, 0.5),
                      mt: 0.2,
                    }}
                  >
                    {option.description}
                  </Typography>
                </Box>

                {/* Radio Indicator */}
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? colors.sidebarActiveBg || colors.primary : isDark ? alpha(colors.text, 0.2) : alpha('#000', 0.15)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {isSelected && (
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: colors.sidebarActiveBg || colors.primary,
                        boxShadow: `0 0 10px ${alpha(colors.sidebarActiveBg || colors.primary, 0.4)}`,
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </DashboardCard>
    );
  }

  // Default popover variant
  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: colors.textLight,
          background: alpha(colors.textLight, 0.05),
          transition: 'all 0.3s ease',
          '&:hover': {
            background: alpha(colors.primary, 0.15),
            color: colors.primary,
            transform: 'scale(1.1) rotate(180deg)',
          },
        }}
      >
        {getCurrentIcon()}
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 240,
            borderRadius: '12px',
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 8px 32px ${alpha(actualTheme === 'dark' ? '#000' : '#000', actualTheme === 'dark' ? 0.4 : 0.1)}`,
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${colors.border}`,
            background: `linear-gradient(135deg, ${alpha(
              colors.primary,
              0.1
            )} 0%, ${alpha(colors.primaryDark, 0.05)} 100%)`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.938rem',
              fontWeight: 700,
              color: colors.text,
            }}
          >
            Theme Settings
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              mt: 0.5,
            }}
          >
            Choose your preferred theme
          </Typography>
        </Box>

        <List sx={{ p: 1 }}>
          {themeOptions.map((option) => (
            <ListItem key={option.value} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleThemeChange(option.value)}
                selected={themeMode === option.value}
                sx={{
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha(colors.primary, 0.1),
                  },
                  '&.Mui-selected': {
                    background: `linear-gradient(135deg, ${alpha(
                      colors.primary,
                      0.15
                    )} 0%, ${alpha(colors.primaryDark, 0.1)} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(
                        colors.primary,
                        0.2
                      )} 0%, ${alpha(colors.primaryDark, 0.15)} 100%)`,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: themeMode === option.value ? colors.primary : colors.textSecondary,
                    minWidth: 40,
                  }}
                >
                  {option.icon}
                </ListItemIcon>
                <ListItemText
                  primary={option.label}
                  secondary={option.description}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: themeMode === option.value ? 700 : 500,
                    color: colors.text,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: colors.textTertiary,
                  }}
                />
                {themeMode === option.value && (
                  <Box sx={{ color: colors.primary, ml: 1, display: 'flex' }}>
                    <Check size={18} />
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${colors.border}`,
            background: alpha(colors.primary, 0.05),
          }}
        >
          <Typography
            sx={{
              fontSize: '0.688rem',
              color: colors.textTertiary,
              textAlign: 'center',
            }}
          >
            Currently using:{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 600,
                color: colors.primary,
                textTransform: 'capitalize',
              }}
            >
              {actualTheme} mode
            </Box>
          </Typography>
        </Box>
      </Popover>
    </>
  );
};

export default ThemeSelector;
