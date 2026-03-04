import { Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const DashboardCancelButton = ({ sx, ...props }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Button
      variant="text"
      sx={[
        {
          color: colors.textSecondary,
          textTransform: 'none',
          '&:hover': {
            background: alpha(colors.text, 0.05),
          },
        },
        sx,
      ]}
      {...props}
    />
  );
};

export default DashboardCancelButton;
