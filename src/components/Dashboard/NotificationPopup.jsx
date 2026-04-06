import { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Divider,
  Button,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Bell as BellIcon,
  Circle as CircleIcon,
  CircleCheck as CheckCircleIcon,
  Trash2 as DeleteIcon,
  X as CloseIcon,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const NotificationPopup = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isLight = actualTheme === 'light';
  const controlColor = colors.text;
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef(null);
  const openRef = useRef(false);
  const pollTimeoutRef = useRef(null);
  const pollDelayRef = useRef(5000);
  const lastUnreadRef = useRef(null);
  const pollingActiveRef = useRef(false);

  const open = Boolean(anchorEl);

  // Fetch notifications with optimized pagination (6 per page for performance)
  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notifications?page=${pageNum}&limit=6`);

      const newNotifications = response.data.notifications || [];
      setNotifications((prev) => (append ? [...prev, ...newNotifications] : newNotifications));
      setHasMore(newNotifications.length === 6);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`);
      const count = response.data.unreadCount || 0;
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return null;
    }
  };

  const refreshNotifications = async () => {
    await fetchUnreadCount();
    if (openRef.current) {
      await fetchNotifications(1, false);
      setPage(1);
    }
  };

  const isPageActive = () => document.visibilityState === 'visible' && document.hasFocus();

  const stopPolling = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    pollingActiveRef.current = false;
  };

  const schedulePoll = (delay) => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    pollTimeoutRef.current = setTimeout(runPollingCycle, delay);
  };

  const runPollingCycle = async () => {
    if (!pollingActiveRef.current) return;
    if (!isPageActive()) {
      schedulePoll(pollDelayRef.current);
      return;
    }

    const count = await fetchUnreadCount();
    if (count !== null) {
      if (lastUnreadRef.current === count) {
        pollDelayRef.current = Math.min(pollDelayRef.current * 2, 60000);
      } else {
        pollDelayRef.current = 5000;
        lastUnreadRef.current = count;
      }
    }
    schedulePoll(pollDelayRef.current);
  };

  const startPolling = () => {
    if (pollingActiveRef.current) return;
    pollingActiveRef.current = true;
    pollDelayRef.current = 5000;
    schedulePoll(0);
  };

  // Stream unread count updates via SSE
  useEffect(() => {
    const streamUrl = new URL(`${API_URL}/notifications/stream`);

    const eventSource = new EventSource(streamUrl.toString(), {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      stopPolling();
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'unreadCount') {
          setUnreadCount((prev) => {
            if (openRef.current && payload.unreadCount !== prev) {
              fetchNotifications(1, false);
              setPage(1);
            }
            return payload.unreadCount || 0;
          });
        }
      } catch (error) {
        console.error('Error parsing notification stream message:', error);
      }
    };

    eventSource.onerror = () => {
      startPolling();
    };

    const handleVisibility = () => {
      if (isPageActive() && pollingActiveRef.current) {
        pollDelayRef.current = 5000;
        runPollingCycle();
      }
    };

    const handleRefreshEvent = () => {
      refreshNotifications();
    };

    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('notifications:refresh', handleRefreshEvent);

    return () => {
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('notifications:refresh', handleRefreshEvent);
      stopPolling();
      eventSource.close();
    };
  }, []);

  // Handle opening the popup
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      // Immediately fetch fresh notifications when popup opens
      fetchNotifications(1, false);
      fetchUnreadCount();
      setPage(1);
    }
  };

  // Handle closing the popup
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mark notification as read
  const markAsRead = async (notificationId, isRead) => {
    if (isRead) return; // Already read

    try {
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {});

      // IMMEDIATELY refetch data for real-time updates
      await fetchNotifications(page, false);
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, {});

      // IMMEDIATELY refetch data for real-time updates
      await fetchNotifications(page, false);
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`);

      // IMMEDIATELY refetch data for real-time updates
      await fetchNotifications(page, false);
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id, notification.isRead);
    if (notification.link) {
      handleClose();
      navigate(notification.link);
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString();
  };

  // Get notification icon color based on type — full color mapping (step 10.10)
  const getNotificationColor = (type) => {
    // Accent — positive / success
    const accentTypes = [
      'TEMPLATE_APPROVED', 'WEBSITE_CREATED', 'WEBSITE_PUBLISHED',
      'AI_GENERATION_COMPLETE', 'COLLABORATOR_INVITED', 'COLLABORATOR_JOINED',
      'APPROVAL_APPROVED', 'ACCOUNT_DELEGATE_ACCEPTED', 'DOMAIN_VERIFIED',
      'LISTING_PUBLISHED', 'PAYMENT_SUCCEEDED', 'PLAN_CHANGED',
      'INCIDENT_RESOLVED', 'REFERRAL_REWARD_EARNED', 'USER_UNBLOCKED',
    ];
    // Warning — attention needed
    const warningTypes = [
      'TEMPLATE_SUBMITTED', 'TEMPLATE_EDITED', 'WEBSITE_UNPUBLISHED',
      'AUTOSAVE_CONFLICT', 'COLLABORATOR_DECLINED', 'INVITE_EXPIRED',
      'APPROVAL_REQUESTED', 'ACCOUNT_DELEGATE_REVOKED',
      'SUBSCRIPTION_TRIAL_ENDING', 'DORMANT_RENEWAL_WARNING',
    ];
    // Danger — critical / negative
    const dangerTypes = [
      'TEMPLATE_REJECTED', 'AI_GENERATION_FAILED', 'APPROVAL_REJECTED',
      'ACCOUNT_RESTRICTION', 'DOMAIN_FAILED', 'PAYMENT_FAILED',
      'SUBSCRIPTION_CANCELLED', 'INCIDENT_STARTED', 'USER_BLOCKED',
    ];

    if (accentTypes.includes(type)) return colors.panelAccent;
    if (warningTypes.includes(type)) return colors.panelWarning;
    if (dangerTypes.includes(type)) return colors.panelDanger;
    // Info — everything else (BLOG_*, USER_CREATED, SYSTEM, FORM_SUBMISSION, etc.)
    return colors.panelInfo || colors.panelAccent;
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          color: controlColor,
          background: 'transparent',
          border: 'none',
          p: 0,
          transition: 'color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            color: controlColor,
            background: alpha(controlColor, isLight ? 0.08 : 0.12),
          },
        }}
      >
        <Badge
          variant="dot"
          overlap="circular"
          invisible={!unreadCount}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              width: 12,
              height: 12,
              minWidth: 12,
              backgroundColor: colors.panelDanger,
              boxShadow: `0 0 0 2px ${colors.panelBg}`,
              top: 3,
              right: 3,
            },
          }}
        >
          <BellIcon size={22} strokeWidth={2} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: '90vw',
            maxHeight: 600,
            borderRadius: '16px',
            backgroundColor: colors.panelBg,
            border: `1px solid ${colors.panelBorder}`,
            boxShadow: colors.panelShadow,
            color: colors.panelText,
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${colors.panelBorder}`,
            backgroundColor: colors.panelBg,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.panelText,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <BellIcon size={18} color={colors.panelIcon} /> Notifications
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: colors.panelMuted,
                '&:hover': { color: colors.panelText },
              }}
            >
              <CloseIcon size={18} />
            </IconButton>
          </Box>

          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllAsRead}
              sx={{
                fontSize: '0.813rem',
                color: colors.panelAccent,
                textTransform: 'none',
                fontWeight: 500,
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  background: 'transparent',
                  color: colors.panelAccent,
                },
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        <List
          ref={listRef}
          onScroll={handleScroll}
          sx={{
            p: 0,
            maxHeight: 480,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(colors.panelText, 0.04),
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(colors.panelText, 0.12),
              borderRadius: '4px',
              '&:hover': {
                background: alpha(colors.panelText, 0.2),
              },
            },
          }}
        >
          {loading && notifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <CircularProgress size={32} sx={{ color: colors.panelAccent }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
              }}
            >
              <Box sx={{ mb: 2, color: colors.panelMuted }}>
                <BellIcon size={64} />
              </Box>
              <Typography
                sx={{
                  color: colors.panelMuted,
                  fontSize: '0.938rem',
                  textAlign: 'center',
                }}
              >
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <Box key={notification.id}>
                {index > 0 && <Divider sx={{ borderColor: colors.panelBorder }} />}
                <ListItem
                  disablePadding
                  sx={{
                    background: notification.isRead
                      ? 'transparent'
                      : alpha(colors.panelText, 0.03),
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => deleteNotification(notification.id, e)}
                      sx={{
                        color: colors.panelMuted,
                        '&:hover': {
                          color: colors.panelDanger,
                          background: alpha(colors.panelDanger, 0.12),
                        },
                      }}
                    >
                      <DeleteIcon size={18} />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      pr: 6,
                      '&:hover': {
                        background: colors.panelHover,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          mt: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        {notification.isRead ? (
                          <CheckCircleIcon size={20} color={colors.panelMuted} />
                        ) : (
                          <CircleIcon size={12} color={getNotificationColor(notification.type)} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: notification.isRead ? 500 : 600,
                            color: notification.isRead ? colors.panelMuted : colors.panelText,
                            mb: 0.5,
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.813rem',
                            color: colors.panelMuted,
                            lineHeight: 1.5,
                            mb: 0.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: colors.panelSubtle,
                            letterSpacing: '0.2px',
                          }}
                        >
                          {formatTimestamp(notification.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              </Box>
            ))
          )}

          {loading && notifications.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 2,
              }}
            >
              <CircularProgress size={24} sx={{ color: colors.panelAccent }} />
            </Box>
          )}
        </List>

        {/* View All link */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${colors.panelBorder}`,
              textAlign: 'center',
            }}
          >
            <Button
              size="small"
              onClick={() => {
                handleClose();
                navigate('/dashboard/settings?tab=notifications');
              }}
              sx={{
                fontSize: '0.813rem',
                color: colors.panelAccent,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  background: alpha(colors.panelAccent, 0.08),
                },
              }}
            >
              Manage Notification Preferences
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationPopup;
