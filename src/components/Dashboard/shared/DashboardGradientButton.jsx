import { Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const DashboardGradientButton = ({ sx, ...props }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isLight = colors.mode === 'light';

  return (
    <Button
      variant="contained"
      sx={[
        {
          background: isLight
            ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
            : colors.bgCard,
          color: isLight ? '#FFFFFF' : colors.text,
          fontWeight: 600,
          textTransform: 'none',
          px: 3,
          py: 1.5,
          borderRadius: 2,
          border: isLight
            ? `1px solid ${alpha(colors.primary, 0.3)}`
            : `1px solid ${colors.border}`,
          boxShadow: `0 2px 8px ${alpha(colors.primary, 0.25)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: isLight
              ? `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`
              : `linear-gradient(135deg, ${colors.bgCard} 0%, ${colors.bgCard} 10%)`,
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
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

export default DashboardGradientButton;
