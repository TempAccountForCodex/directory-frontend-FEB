import { useState, useEffect } from 'react';
import { Box, MenuItem, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import axios from 'axios';
import { DashboardSelect } from '../shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PageSelector = ({ selectedPage, onPageChange, period = '30', customDateRange = {} }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailablePages();
  }, [period, customDateRange.startDate, customDateRange.endDate]);

  const fetchAvailablePages = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = { period };
      if (period === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        params.startDate = customDateRange.startDate;
        params.endDate = customDateRange.endDate;
      }

      // Fetch engagement data to get list of pages
      const response = await axios.get(`${API_URL}/analytics/engagement`, {
        params,
      });

      const pageEngagement = response.data.data?.pageEngagement || [];
      const pageList = pageEngagement
        .map((p) => ({
          path: p.page,
          views: p.views,
        }))
        .sort((a, b) => b.views - a.views); // Sort by views descending

      setPages(pageList);

      // Auto-select "All Pages" if no page is selected
      if (!selectedPage && onPageChange) {
        onPageChange('all');
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    if (onPageChange) {
      onPageChange(event.target.value);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} sx={{ color: colors.primary }} />
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Loading pages...
        </Typography>
      </Box>
    );
  }

  return (
    <DashboardSelect
      size="small"
      value={selectedPage || 'all'}
      onChange={handleChange}
      displayEmpty
      containerSx={{ minWidth: 200 }}
    >
      <MenuItem value="all">
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          All Pages
        </Typography>
      </MenuItem>
        {pages.map((page) => (
          <MenuItem key={page.path} value={page.path}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {page.path}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, ml: 2 }}>
                {page.views.toLocaleString()} views
              </Typography>
            </Box>
          </MenuItem>
        ))}
        {pages.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              No pages available
            </Typography>
          </MenuItem>
        )}
    </DashboardSelect>
  );
};

export default PageSelector;
