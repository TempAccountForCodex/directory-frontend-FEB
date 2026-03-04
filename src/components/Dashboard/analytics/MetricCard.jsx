import { Card, Typography, Chip, Tooltip, Box } from '@mui/material';
import { Info, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';

const MetricCard = ({
  title,
  value,
  change,
  tooltip,
  format = 'number',
  invertColors = false,
  icon,
}) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);

  // Format value based on type
  const formatValue = (val) => {
    // Handle null/undefined values
    const safeVal = val ?? 0;

    switch (format) {
      case 'number':
        return safeVal.toLocaleString();
      case 'percentage':
        return `${safeVal}%`;
      case 'currency':
        return `$${safeVal.toLocaleString()}`;
      case 'time':
        const minutes = Math.floor(safeVal / 60);
        const seconds = safeVal % 60;
        return `${minutes}m ${seconds}s`;
      default:
        return safeVal;
    }
  };

  // Determine trend direction
  const getTrendIcon = () => {
    const safeChange = change ?? 0;
    if (Math.abs(safeChange) < 0.5) return <Minus size={14} />;
    return safeChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
  };

  // Get heat color based on change value
  const getHeatColor = () => {
    const safeChange = change ?? 0;
    const absChange = Math.abs(safeChange);
    const isPositive = invertColors ? safeChange < 0 : safeChange > 0;

    if (absChange < 1) return colors.textSecondary;
    if (absChange < 5) return isPositive ? '#4CAF50' : '#FF9800';
    if (absChange < 15) return isPositive ? '#2E7D32' : '#F57C00';
    return isPositive ? '#1B5E20' : '#E65100';
  };

  const heatColor = getHeatColor();

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        p: 2.5,
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${colors.primary}20`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {icon && <Box sx={{ color: colors.primary }}>{icon}</Box>}
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
              {title}
            </Typography>
            {tooltip && (
              <Tooltip
                title={tooltip}
                arrow
                placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      fontSize: '0.85rem',
                      boxShadow: `0 4px 12px ${colors.darker}40`,
                    },
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: colors.textSecondary,
                    cursor: 'help',
                    display: 'inline-flex',
                    '&:hover': { color: colors.primary },
                  }}
                >
                  <Info size={16} />
                </Box>
              </Tooltip>
            )}
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: colors.text,
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem' },
            }}
          >
            {formatValue(value)}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getTrendIcon()}
              label={`${(change ?? 0) > 0 ? '+' : ''}${change ?? 0}%`}
              size="small"
              sx={{
                background: `${heatColor}20`,
                color: heatColor,
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: '8px',
                '& .MuiChip-icon': {
                  color: heatColor,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
              vs previous period
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default MetricCard;
