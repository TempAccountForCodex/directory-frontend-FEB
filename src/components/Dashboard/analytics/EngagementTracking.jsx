import { useState, useEffect } from 'react';
import { Box, Card, Typography, LinearProgress, CircularProgress, Chip } from '@mui/material';
import { ArrowUpDown, Clock, LogOut, MousePointerClick } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { AnalyticsPanelHeader, DashboardPanel } from '../shared';
import axios from 'axios';
import PageSelector from './PageSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EngagementTracking = ({ period = '30', customDateRange = {} }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState('all');

  useEffect(() => {
    fetchEngagementData();
  }, [period, customDateRange.startDate, customDateRange.endDate, selectedPage]);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = { period };
      if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        params.startDate = customDateRange.startDate;
        params.endDate = customDateRange.endDate;
      }
      if (selectedPage && selectedPage !== 'all') {
        params.page = selectedPage;
      }

      const response = await axios.get(`${API_URL}/analytics/engagement`, {
        params,
      });
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching engagement data:', err);
      setError('Failed to load engagement data');
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getExitRateColor = (rate) => {
    if (rate < 30) return '#4CAF50';
    if (rate < 50) return '#FF9800';
    return '#F44336';
  };

  return (
    <DashboardPanel variant="card" sx={{ borderRadius: '16px' }}>
      <AnalyticsPanelHeader
        title="Engagement Tracking"
        action={
          <PageSelector
            selectedPage={selectedPage}
            onPageChange={setSelectedPage}
            period={period}
            customDateRange={customDateRange}
          />
        }
        colors={colors}
      />

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card
          sx={{
            flex: 1,
            minWidth: 150,
            p: 2,
            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.primaryDark}20 100%)`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ArrowUpDown size={18} color={colors.primary} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Avg Scroll Depth
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ color: colors.text, fontWeight: 700 }}>
            {data?.scrollDepth?.avg ?? 0}%
          </Typography>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 150,
            p: 2,
            background: `linear-gradient(135deg, ${colors.error}20 0%, ${colors.error}10 100%)`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MousePointerClick size={18} color={colors.error} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Rage Clicks
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ color: colors.text, fontWeight: 700 }}>
            {data?.rageClicks ?? 0}
          </Typography>
        </Card>
      </Box>

      {/* Page Engagement Table */}
      <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
        {selectedPage === 'all' ? 'Top Pages by Engagement' : 'Page Engagement Details'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(data?.pageEngagement ?? []).length > 0 ? (
          data.pageEngagement.slice(0, 5).map((page, index) => (
            <Box
              key={index}
              sx={{
                borderRadius: '12px',
                p: 2,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    color: colors.text,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    flex: 1,
                  }}
                >
                  {page?.page ?? 'N/A'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    icon={<Clock size={14} />}
                    label={formatDuration(page?.avgSessionDuration ?? 0)}
                    size="small"
                    sx={{
                      background: `${colors.primary}20`,
                      color: colors.primary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<LogOut size={14} />}
                    label={`${page?.exitRate ?? 0}%`}
                    size="small"
                    sx={{
                      background: `${getExitRateColor(parseFloat(page?.exitRate ?? 0))}20`,
                      color: getExitRateColor(parseFloat(page?.exitRate ?? 0)),
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, ((page?.avgSessionDuration ?? 0) / 300) * 100)}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: colors.border,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.primary,
                      borderRadius: 3,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary, minWidth: 60, textAlign: 'right' }}
                >
                  {(page?.views ?? 0).toLocaleString()} views
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, textAlign: 'center', py: 2 }}
          >
            No data available
          </Typography>
        )}
      </Box>
    </DashboardPanel>
  );
};

export default EngagementTracking;
