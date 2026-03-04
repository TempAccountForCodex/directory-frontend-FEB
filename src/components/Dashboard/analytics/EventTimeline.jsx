import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Chip, Avatar } from '@mui/material';
import { Activity, ClipboardList, Download, Eye, Link, MousePointerClick } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { AnalyticsPanelHeader, DashboardPanel } from '../shared';
import axios from 'axios';
import PageSelector from './PageSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EventTimeline = ({ limit = 20, period = '30', customDateRange = {} }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState('all');

  const fetchEvents = useCallback(async () => {
    try {
      const params = { limit };
      if (selectedPage && selectedPage !== 'all') {
        params.page = selectedPage;
      }

      const response = await axios.get(`${API_URL}/analytics/events`, {
        params,
      });
      setData(response.data.data);
      setError(null);
      setLoading(false);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
      setLoading(false);
      return null;
    }
  }, [limit, selectedPage]);

  useEffect(() => {
    const baseDelay = 60000;
    const maxDelay = 300000;
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

      const payload = await fetchEvents();
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
  }, [fetchEvents]);

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

  const getEventIcon = (type) => {
    const icons = {
      button_click: <MousePointerClick size={18} />,
      form_submit: <ClipboardList size={18} />,
      download: <Download size={18} />,
      cta_click: <MousePointerClick size={18} />,
      page_view: <Eye size={18} />,
      link_click: <Link size={18} />,
    };
    return icons[type] || <Activity size={18} />;
  };

  const getEventColor = (type) => {
    const colors_map = {
      button_click: '#2196F3',
      form_submit: '#4CAF50',
      download: '#9C27B0',
      cta_click: '#FF5722',
      page_view: '#00BCD4',
      link_click: '#FF9800',
    };
    return colors_map[type] || colors.primary;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const formatEventName = (type) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <DashboardPanel
      variant="card"
      padding={0}
      sx={{
        borderRadius: '16px',
        maxHeight: 600,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: colors.bgHero,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: colors.border,
          borderRadius: '4px',
          '&:hover': {
            background: colors.primary,
          },
        },
      }}
    >
      <AnalyticsPanelHeader
        title="Event Timeline"
        icon={<Activity size={20} />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Live Feed"
              size="small"
              sx={{
                background: `${colors.success}20`,
                color: colors.success,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
            <PageSelector
              selectedPage={selectedPage}
              onPageChange={setSelectedPage}
              period={period}
              customDateRange={customDateRange}
            />
          </Box>
        }
        colors={colors}
        sx={{
          position: 'sticky',
          top: 0,
          p: 3,
          zIndex: 1,
          background: colors.darker,
          backdropFilter: 'blur(10px)',
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 3 }}>
        {(data?.events ?? []).length > 0 ? (
          data.events.map((event, index) => {
            const eventColor = getEventColor(event?.type ?? 'unknown');

            return (
              <Box
                key={event?.id ?? index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  background: index % 2 === 0 ? colors.rowHover : 'transparent',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: `${eventColor}10`,
                    borderColor: eventColor,
                  },
                }}
              >
                {/* Event Icon */}
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: `${eventColor}20`,
                    color: eventColor,
                  }}
                >
                  {getEventIcon(event?.type ?? 'unknown')}
                </Avatar>

                {/* Event Details */}
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        color: colors.text,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {formatEventName(event?.type ?? 'unknown')}
                    </Typography>

                    <Typography
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.7rem',
                      }}
                    >
                      {formatTime(event?.timestamp ?? new Date())}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.8rem',
                      mb: 1,
                    }}
                  >
                    {event?.page ?? 'N/A'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${event?.count ?? 0} ${(event?.count ?? 0) === 1 ? 'event' : 'events'}`}
                      size="small"
                      sx={{
                        background: `${eventColor}15`,
                        color: eventColor,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 20,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, textAlign: 'center', py: 2 }}
          >
            No events available
          </Typography>
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          color: colors.textSecondary,
          mt: 2,
          pt: 2,
          px: 3,
          pb: 3,
          borderTop: `1px solid ${colors.border}`,
          fontSize: '0.7rem',
        }}
      >
        Showing last {data?.events?.length ?? 0} events • Updates every minute
      </Typography>
    </DashboardPanel>
  );
};

export default EventTimeline;
