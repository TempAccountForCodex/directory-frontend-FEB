import { Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const DashboardConfirmButton = ({ tone = 'primary', sx, ...props }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isLight = colors.mode === 'light';

  const toneStyles = {
    primary: {
      background: isLight
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
        : colors.bgCard,
      color: isLight ? '#FFFFFF' : colors.text,
      border: isLight
        ? `1px solid ${alpha(colors.primary, 0.3)}`
        : `1px solid ${colors.border}`,
      boxShadow: `0 2px 8px ${alpha(colors.primary, 0.25)}`,
      hoverBackground: isLight
        ? `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`
        : `linear-gradient(135deg, ${colors.bgCard} 0%, ${colors.bgCard} 10%)`,
      hoverShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
      disabledBackground: alpha(colors.primary, 0.35),
      disabledColor: alpha(colors.text, 0.6),
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: `0 4px 12px ${alpha('#ef4444', 0.3)}`,
      hoverBackground: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      hoverShadow: `0 6px 20px ${alpha('#ef4444', 0.4)}`,
      disabledBackground: alpha('#ef4444', 0.35),
      disabledColor: alpha('#ffffff', 0.7),
    },
  };

  const currentTone = toneStyles[tone] || toneStyles.primary;

  return (
    <Button
      variant="contained"
      sx={[
        {
          background: currentTone.background,
          color: currentTone.color,
          fontWeight: 600,
          textTransform: 'none',
          border: currentTone.border,
          boxShadow: currentTone.boxShadow,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: currentTone.hoverBackground,
            boxShadow: currentTone.hoverShadow,
          },
          '&.Mui-disabled': {
            background: currentTone.disabledBackground,
            color: currentTone.disabledColor,
          },
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            color: 'inherit',
          },
        },
        sx,
      ]}
      {...props}
    />
  );
};

export default DashboardConfirmButton;
