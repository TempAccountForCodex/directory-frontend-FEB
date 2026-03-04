import { Box, Typography } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * EmptyState Component
 *
 * Reusable empty state component for displaying "no data" messages
 *
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} title - Main message title
 * @param {string} subtitle - Optional subtitle/description
 * @param {React.ReactNode} action - Optional action button or component
 */
const EmptyState = ({ icon, title, subtitle, action }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 10 },
        px: 2,
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      {icon && (
        <Box
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 4,
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      )}

      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          color: colors.text,
          fontWeight: 700,
          mb: subtitle ? 1 : 3,
          fontSize: { xs: '1.125rem', md: '1.25rem' },
        }}
      >
        {title}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="body1"
          sx={{
            color: colors.textSecondary,
            mb: 3,
            maxWidth: 400,
            fontSize: { xs: '0.875rem', md: '1rem' },
          }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Action */}
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
