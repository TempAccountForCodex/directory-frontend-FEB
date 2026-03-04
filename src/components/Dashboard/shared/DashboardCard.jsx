import { Box, Card, CardContent, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * DashboardCard
 *
 * A reusable card component with:
 * - Leading icon in a circular container with dashboard-specific styling
 * - Main title / header
 * - Optional subtitle / subheader
 * - Content area (children)
 */
const DashboardCard = ({ icon: Icon, title, subtitle, children, sx, contentPadding }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const iconShadow = isDark
    ? `0 10px 24px ${alpha('#000', 0.5)}, inset 0 4px 0 ${alpha('#fff', 0.04)}`
    : `0 4px 12px ${alpha('#000', 0.1)}`;

  const baseCardSx = {
    position: 'relative',
    height: '100%',
    borderRadius: '18px',
    background: colors.panelBg,
    boxShadow: isDark ? `0 4px 24px ${alpha('#000', 0.3)}` : `0 4px 16px ${alpha('#000', 0.04)}`,
    ...sx,
  };

  return (
    <Card sx={baseCardSx}>
      <CardContent
        sx={{
          p: contentPadding || { xs: '20px', sm: '25px' },
          '&:last-child': { pb: contentPadding ? undefined : 2 },
        }}
      >
        <Box display="flex" alignItems="center" gap="18px" mb={children ? 2 : 0}>
          {Icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                minWidth: 48,
                minHeight: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: iconShadow,
              }}
            >
              <Icon size={20} color={colors.text} />
            </Box>
          )}

          <Box>
            <Typography
              variant="h6"
              sx={{
                color: colors.text,
                fontSize: '1.1rem',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: alpha(colors.text, 0.5),
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {children && <Box>{children}</Box>}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
