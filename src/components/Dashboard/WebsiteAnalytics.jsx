import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import { Eye, MousePointerClick } from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { DashboardTable } from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const WebsiteAnalytics = ({ websiteId }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (websiteId) {
      fetchAnalytics();
    }
  }, [websiteId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/websites/${websiteId}/analytics/summary`, {
        headers: {},
      });
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              bgcolor: colors.bgPaper,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${colors.primary}22`,
                    color: colors.primary,
                  }}
                >
                  <Eye size={22} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Page Views (30 days)
                  </Typography>
                  <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700 }}>
                    {analytics.totalPageViews.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              bgcolor: colors.bgPaper,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${colors.primary}22`,
                    color: colors.primary,
                  }}
                >
                  <MousePointerClick size={22} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    CTA Clicks (30 days)
                  </Typography>
                  <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700 }}>
                    {analytics.totalCtaClicks.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: colors.border }} />

      {/* Top Pages */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 700 }}>
          Top Pages
        </Typography>
        {analytics.pageViewsByPath.length > 0 ? (
          <DashboardTable
            colors={colors}
            variant="flat"
            containerProps={{
              component: Paper,
              sx: {
                bgcolor: colors.panelBg,
                border: `1px solid ${colors.panelBorder}`,
                boxShadow: 'none',
              },
            }}
          >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Page Path</TableCell>
                  <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>
                    Views
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.pageViewsByPath.map((page, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: colors.text }}>{page.path || '/'}</TableCell>
                    <TableCell align="right" sx={{ color: colors.text }}>
                      {page.count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </DashboardTable>
        ) : (
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
            No page views yet
          </Typography>
        )}
      </Box>

      {/* Recent Activity */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: colors.text, fontWeight: 700 }}>
          Recent Activity (Last 7 Days)
        </Typography>
        {analytics.pageViewsByDay.length > 0 ? (
          <DashboardTable
            colors={colors}
            variant="flat"
            containerProps={{
              component: Paper,
              sx: {
                bgcolor: colors.panelBg,
                border: `1px solid ${colors.panelBorder}`,
                boxShadow: 'none',
              },
            }}
            tableProps={{ size: 'small' }}
          >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Date</TableCell>
                  <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>
                    Page Views
                  </TableCell>
                  <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>
                    CTA Clicks
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.pageViewsByDay
                  .slice(-7)
                  .reverse()
                  .map((day, index) => {
                    const ctaDay = analytics.ctaClicksByDay.find((d) => d.date === day.date);
                    return (
                      <TableRow key={index}>
                        <TableCell sx={{ color: colors.text }}>{formatDate(day.date)}</TableCell>
                        <TableCell align="right" sx={{ color: colors.text }}>
                          {day.count.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ color: colors.text }}>
                          {(ctaDay?.count || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
          </DashboardTable>
        ) : (
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
            No recent activity
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default WebsiteAnalytics;
