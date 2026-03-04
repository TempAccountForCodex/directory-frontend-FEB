import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Chip, Avatar } from '@mui/material';
import { Circle, Globe, Users } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { AnalyticsPanelHeader, DashboardPanel } from '../shared';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const RealTimePanel = () => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchRealTimeData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/realtime-advanced`, {
        headers: {},
      });
      setData(response.data.data);
      setError(null);
      setLoading(false);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError('Failed to load real-time data');
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const baseDelay = 30000;
    const maxDelay = 120000;
    const delayRef = { current: baseDelay };
    const lastHashRef = { current: null };
    const timerRef = { current: null };

    const isPageActive = () => document.visibilityState === 'visible' && document.hasFocus();

    const scheduleNext = (delay) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(runPoll, delay);
    };

    const runPoll = async () => {
      if (!isPageActive()) {
        scheduleNext(baseDelay);
        return;
      }

      const payload = await fetchRealTimeData();
      if (payload) {
        const hash = JSON.stringify(payload);
        if (hash === lastHashRef.current) {
          delayRef.current = Math.min(delayRef.current * 2, maxDelay);
        } else {
          delayRef.current = baseDelay;
          lastHashRef.current = hash;
        }
      }

      scheduleNext(delayRef.current);
    };

    const handleVisibility = () => {
      if (isPageActive()) {
        delayRef.current = baseDelay;
        runPoll();
      }
    };

    runPoll();
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchRealTimeData]);

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

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      Canada: '🇨🇦',
      India: '🇮🇳',
      Australia: '🇦🇺',
      Germany: '🇩🇪',
      France: '🇫🇷',
      Japan: '🇯🇵',
    };
    return flags[country] || '🌍';
  };

  return (
    <DashboardPanel variant="card" sx={{ borderRadius: '16px' }}>
      <AnalyticsPanelHeader
        title="Real-Time Analytics"
        icon={<Globe size={20} />}
        action={
          <Chip
            icon={
              <Circle
                size={10}
                fill="currentColor"
                stroke="none"
                style={{ animation: 'pulse 2s infinite' }}
              />
            }
            label="LIVE"
            size="small"
            sx={{
              background: `${colors.success}20`,
              color: colors.success,
              fontWeight: 700,
              fontSize: '0.7rem',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
            }}
          />
        }
        colors={colors}
      />

      {/* Active Users Counter */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 3,
          p: 3,
          background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.primaryDark}10 100%)`,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Box sx={{ color: colors.primary, mb: 1, display: 'flex', justifyContent: 'center' }}>
          <Users size={24} />
        </Box>
        <Typography variant="h3" sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}>
          {data?.activeUsers ?? 0}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Active Users Right Now
        </Typography>
      </Box>

      {/* Current Paths */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
          Current Pages
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {(data?.currentPaths ?? []).length > 0 ? (
            data.currentPaths.map((path, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: colors.rowHover,
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Typography
                  sx={{
                    color: colors.text,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                >
                  {path?.path ?? 'N/A'}
                </Typography>

                <Chip
                  label={path?.users ?? 0}
                  size="small"
                  sx={{
                    minWidth: 40,
                    background: `${colors.primary}20`,
                    color: colors.primary,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                />
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, textAlign: 'center', py: 2 }}
            >
              No active users currently
            </Typography>
          )}
        </Box>
      </Box>

      {/* Live Geographic Distribution */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Globe size={18} color={colors.primary} />
          <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
            Live Geographic Distribution
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {(data?.liveGeo ?? []).length > 0 ? (
            data.liveGeo.map((location, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: colors.rowHover,
                  p: 1.5,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '1.2rem',
                      background: 'transparent',
                    }}
                  >
                    {getCountryFlag(location?.country ?? '')}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        color: colors.text,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {location?.city ?? 'Unknown'}
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.7rem',
                      }}
                    >
                      {location?.country ?? 'Unknown'}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={location?.users ?? 0}
                  size="small"
                  sx={{
                    minWidth: 40,
                    background: `${colors.success}20`,
                    color: colors.success,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                />
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, textAlign: 'center', py: 2 }}
            >
              No location data available
            </Typography>
          )}
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          color: colors.textSecondary,
          mt: 2,
          fontSize: '0.7rem',
        }}
      >
        Updates every 30 seconds
      </Typography>
    </DashboardPanel>
  );
};

export default RealTimePanel;
