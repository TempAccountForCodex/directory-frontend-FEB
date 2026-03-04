import { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { ChartBar, ClipboardCheck, MousePointerClick, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { AnalyticsPanelHeader, DashboardPanel } from '../shared';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ConversionMetrics = ({ period = '30', customDateRange = {} }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversionMetrics();
  }, [period, customDateRange.startDate, customDateRange.endDate]);

  const fetchConversionMetrics = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = { period };
      if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        params.startDate = customDateRange.startDate;
        params.endDate = customDateRange.endDate;
      }

      const response = await axios.get(`${API_URL}/analytics/conversions`, {
        params,
      });
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversion metrics:', err);
      setError('Failed to load conversion metrics');
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

  return (
    <DashboardPanel variant="card" sx={{ borderRadius: '16px' }}>
      <AnalyticsPanelHeader
        title="Conversion Metrics"
        icon={<ChartBar size={20} />}
        colors={colors}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Leads"
            value={data?.totalLeads?.value ?? 0}
            change={data?.totalLeads?.change ?? 0}
            tooltip="Total number of leads generated from all sources"
            format="number"
            icon={<TrendingUp size={20} />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Form Submissions"
            value={data?.formSubmissions?.value ?? 0}
            change={data?.formSubmissions?.change ?? 0}
            tooltip="Contact form and career form submissions"
            format="number"
            icon={<ClipboardCheck size={20} />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="CTA Clicks"
            value={data?.ctaClicks?.value ?? 0}
            change={data?.ctaClicks?.change ?? 0}
            tooltip="Total clicks on Call-to-Action buttons"
            format="number"
            icon={<MousePointerClick size={20} />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={data?.conversionRate?.value ?? 0}
            change={data?.conversionRate?.change ?? 0}
            tooltip="Percentage of sessions that resulted in conversions"
            format="percentage"
            icon={<ChartBar size={20} />}
          />
        </Grid>
      </Grid>
    </DashboardPanel>
  );
};

export default ConversionMetrics;
