import { Button, alpha } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const DashboardActionButton = ({ sx, ...props }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const backgroundColor = colors.sidebarActiveBg || colors.primary;
  const textColor = colors.sidebarActiveText || '#000000';

  return (
    <Button
      variant="contained"
      disableElevation
      sx={[
        {
          backgroundColor,
          color: textColor,
          fontSize: { xs: '0.7rem', md: '0.8rem' },
          letterSpacing: '0.2px',
          textTransform: 'none',
          borderRadius: 2,
          px: 1.5,
          py: 0.9,
          boxShadow: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
          '&:hover': {
            bgcolor: alpha(colors.primary, 0.85),
            boxShadow: `0 6px 16px ${alpha(colors.primary, 0.4)}`,
          },
          '&:disabled': {
            bgcolor: alpha(colors.primary, 0.4),
            color: alpha('#fff', 0.6),
          },
          '&:active': {
            transform: 'translateY(0)',
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

export default DashboardActionButton;
