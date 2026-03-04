import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { AnalyticsPanelHeader, DashboardPanel } from '../shared';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const UserJourneyFunnel = ({ period = '30', customDateRange = {} }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFunnelData();
  }, [period, customDateRange.startDate, customDateRange.endDate]);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = { period };
      if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        params.startDate = customDateRange.startDate;
        params.endDate = customDateRange.endDate;
      }

      const response = await axios.get(`${API_URL}/analytics/funnel`, {
        params,
      });
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching funnel data:', err);
      setError('Failed to load funnel data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: colors.error }}>{error}</Typography>
      </Box>
    );
  }

  const stages = [
    { key: 'landing', label: 'Landing Page', icon: '🚀' },
    { key: 'keyPage', label: 'Key Pages', icon: '📄' },
    { key: 'conversion', label: 'Conversion', icon: '✨' },
    { key: 'exit', label: 'Exit', icon: '👋' },
  ];

  const maxUsers = data?.stages
    ? Math.max(...Object.values(data.stages).map((s) => s?.users ?? 0))
    : 0;

  return (
    <DashboardPanel variant="card" sx={{ borderRadius: '16px' }}>
      <AnalyticsPanelHeader title="User Journey Funnel" colors={colors} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {stages.map((stage, index) => {
          const stageData = data?.stages?.[stage.key] ?? { users: 0, dropoff: 0 };
          const widthPercentage = maxUsers > 0 ? (stageData.users / maxUsers) * 100 : 0;
          const isLast = index === stages.length - 1;

          // Get next stage data for arrow direction
          const nextStageData = !isLast
            ? (data?.stages?.[stages[index + 1].key] ?? { users: 0, dropoff: 0 })
            : null;
          const currentUsers = stageData?.users ?? 0;
          const nextUsers = nextStageData?.users ?? 0;

          // Determine arrow direction and color
          let ArrowIcon = TrendingDown;
          let arrowColor = colors.error;

          if (nextUsers > currentUsers) {
            ArrowIcon = TrendingUp;
            arrowColor = colors.success;
          } else if (nextUsers === currentUsers) {
            ArrowIcon = Minus;
            arrowColor = colors.textSecondary;
          }

          return (
            <Box key={stage.key}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {/* Stage Icon and Label */}
                <Box sx={{ minWidth: 120 }}>
                  <Typography
                    sx={{
                      color: colors.text,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <span style={{ fontSize: '0.8rem' }}>{stage.icon}</span>
                    {stage.label}
                  </Typography>
                </Box>

                {/* Funnel Bar */}
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <Box
                    sx={{
                      width: `${widthPercentage}%`,
                      height: 10,
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      transition: 'all 0.4s ease',
                      position: 'relative',
                      '&:hover': {
                        transform: 'scaleX(1.02)',
                        boxShadow: `0 4px 12px ${colors.primary}40`,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    >
                      {(stageData?.users ?? 0).toLocaleString()}
                    </Typography>

                    {!isLast && (stageData?.dropoff ?? 0) > 0 && (
                      <Typography
                        sx={{
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: 'rgba(255,255,255,0.2)',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                        }}
                      >
                        -{stageData?.dropoff ?? 0}% dropoff
                      </Typography>
                    )}
                  </Box>

                  {/* Percentage of total */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: -20,
                      color: colors.textSecondary,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {widthPercentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              {/* Arrow to next stage */}
              {!isLast && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    my: 0.5,
                  }}
                >
                  <ArrowIcon size={24} color={arrowColor} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </DashboardPanel>
  );
};

export default UserJourneyFunnel;
