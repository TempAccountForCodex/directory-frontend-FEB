import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, LinearProgress, Chip } from '@mui/material';
import { Gauge, Monitor, Smartphone } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { AnalyticsPanelHeader, DashboardPanel } from '../shared';
import axios from 'axios';
import PageSelector from './PageSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CoreWebVitals = ({ period = '30', customDateRange = {} }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState('all');

  useEffect(() => {
    fetchWebVitals();
  }, [period, customDateRange.startDate, customDateRange.endDate, selectedPage]);

  const fetchWebVitals = async () => {
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

      const response = await axios.get(`${API_URL}/analytics/web-vitals`, {
        params,
      });
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching web vitals:', err);
      setError('Failed to load web vitals');
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

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good':
        return '#4CAF50';
      case 'needs-improvement':
        return '#FF9800';
      case 'poor':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getSpeedColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  const vitals = [
    {
      name: 'LCP',
      fullName: 'Largest Contentful Paint',
      value: data?.lcp?.value ?? 0,
      unit: 's',
      rating: data?.lcp?.rating ?? 'poor',
      threshold: data?.lcp?.threshold ?? 2.5,
      description: 'Loading performance',
    },
    {
      name: 'FID',
      fullName: 'First Input Delay',
      value: data?.fid?.value ?? 0,
      unit: 'ms',
      rating: data?.fid?.rating ?? 'poor',
      threshold: data?.fid?.threshold ?? 100,
      description: 'Interactivity',
    },
    {
      name: 'CLS',
      fullName: 'Cumulative Layout Shift',
      value: data?.cls?.value ?? 0,
      unit: '',
      rating: data?.cls?.rating ?? 'poor',
      threshold: data?.cls?.threshold ?? 0.1,
      description: 'Visual stability',
    },
  ];

  return (
    <DashboardPanel variant="card" sx={{ borderRadius: '16px' }}>
      <AnalyticsPanelHeader
        title="Core Web Vitals"
        icon={<Gauge size={20} />}
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

      {/* Page Speed Scores */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box
          sx={{
            flex: 1,
            p: 2,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Smartphone size={18} color={colors.primary} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Mobile
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{ color: getSpeedColor(data?.pageSpeed?.mobile ?? 0), fontWeight: 700 }}
          >
            {data?.pageSpeed?.mobile ?? 0}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={data?.pageSpeed?.mobile ?? 0}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: colors.border,
              '& .MuiLinearProgress-bar': {
                bgcolor: getSpeedColor(data?.pageSpeed?.mobile ?? 0),
                borderRadius: 3,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 2,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Monitor size={18} color={colors.primary} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Desktop
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{ color: getSpeedColor(data?.pageSpeed?.desktop ?? 0), fontWeight: 700 }}
          >
            {data?.pageSpeed?.desktop ?? 0}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={data?.pageSpeed?.desktop ?? 0}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: colors.border,
              '& .MuiLinearProgress-bar': {
                bgcolor: getSpeedColor(data?.pageSpeed?.desktop ?? 0),
                borderRadius: 3,
              },
            }}
          />
        </Box>
      </Box>

      {/* Core Web Vitals Metrics */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {vitals.map((vital, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Box>
                <Typography
                  sx={{
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {vital.name}
                </Typography>
                <Typography
                  sx={{
                    color: colors.textSecondary,
                    fontSize: '0.75rem',
                  }}
                >
                  {vital.description}
                </Typography>
              </Box>

              <Chip
                label={vital.rating.toUpperCase()}
                size="small"
                sx={{
                  background: `${getRatingColor(vital.rating)}20`,
                  color: getRatingColor(vital.rating),
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  color: getRatingColor(vital.rating),
                  fontWeight: 700,
                }}
              >
                {vital.value}
              </Typography>
              <Typography
                sx={{
                  color: colors.textSecondary,
                  fontSize: '0.9rem',
                }}
              >
                {vital.unit}
              </Typography>
              <Typography
                sx={{
                  color: colors.textSecondary,
                  fontSize: '0.75rem',
                  ml: 'auto',
                }}
              >
                Threshold: {vital.threshold}
                {vital.unit}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(100, (vital.value / vital.threshold) * 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: colors.border,
                '& .MuiLinearProgress-bar': {
                  bgcolor: getRatingColor(vital.rating),
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </DashboardPanel>
  );
};

export default CoreWebVitals;
