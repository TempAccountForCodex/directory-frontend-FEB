import { memo, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Activity,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Users,
  FileText,
  BarChart2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  DashboardMetricCard,
  DashboardCard,
  EmptyState,
} from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const STATUS_COLORS = {
  PUBLISHED: 'success',
  DRAFT: 'default',
  ARCHIVED: 'warning',
};

const OverviewTab = memo(({ website, websiteId, onSaved, onNavigateToSection }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState(null);

  const fetchActivity = useCallback(async () => {
    if (!websiteId) return;
    try {
      setActivityLoading(true);
      const res = await axios.get(`${API_URL}/websites/${websiteId}/activity`);
      // Backend returns { success, data: { activities, total, hasMore } }
      setActivity(res.data?.data?.activities || res.data?.activity || []);
    } catch {
      // Non-fatal: show empty state
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleTogglePublish = useCallback(async () => {
    if (!website || publishLoading) return;
    try {
      setPublishLoading(true);
      setPublishError(null);
      const action = website.status === 'PUBLISHED' ? 'unpublish' : 'publish';
      const res = await axios.post(`${API_URL}/websites/${websiteId}/${action}`);
      if (onSaved) onSaved(res.data?.data || res.data);
    } catch (err) {
      setPublishError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setPublishLoading(false);
    }
  }, [website, websiteId, publishLoading, onSaved]);

  if (!website) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const isPublished = website.status === 'PUBLISHED';
  const statusColor = STATUS_COLORS[website.status] || 'default';

  return (
    <Box>
      {publishError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPublishError(null)}>
          {publishError}
        </Alert>
      )}

      {/* Website status chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Chip
          label={website.status}
          color={statusColor}
          size="small"
          sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        />
      </Box>

      {/* Stats cards — derived from real website DTO fields */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Pages"
            value={website.pages?.length ?? 0}
            icon={FileText}
            iconColor={colors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Status"
            value={website.status || 'DRAFT'}
            icon={BarChart2}
            iconColor={colors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Created"
            value={
              website.createdAt
                ? new Date(website.createdAt).toLocaleDateString()
                : 'N/A'
            }
            icon={Users}
            iconColor={colors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Last Updated"
            value={
              website.updatedAt
                ? new Date(website.updatedAt).toLocaleDateString()
                : 'Never'
            }
            icon={Globe}
            iconColor={colors.primary}
          />
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <DashboardActionButton
            startIcon={<Edit3 size={16} />}
            onClick={() => navigate(`/dashboard/websites/${websiteId}/editor`)}
            variant="outlined"
            aria-label="Edit website"
          >
            Edit Website
          </DashboardActionButton>

          <DashboardGradientButton
            startIcon={isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
            onClick={handleTogglePublish}
            disabled={publishLoading}
            aria-label={isPublished ? 'Unpublish website' : 'Publish website'}
          >
            {publishLoading ? 'Updating...' : isPublished ? 'Unpublish' : 'Publish'}
          </DashboardGradientButton>

          {website.subdomain && (
            <DashboardActionButton
              startIcon={<Globe size={16} />}
              onClick={() =>
                window.open(`https://${website.subdomain}.techietribe.app`, '_blank', 'noopener')
              }
              variant="outlined"
              aria-label="View live site"
            >
              View Live Site
            </DashboardActionButton>
          )}

          <DashboardActionButton
            startIcon={<Users size={16} />}
            onClick={() => onNavigateToSection && onNavigateToSection('team')}
            variant="outlined"
            aria-label="Manage team"
          >
            Manage Team
          </DashboardActionButton>
        </Box>
      </Box>

      {/* Recent activity */}
      <DashboardCard icon={Activity} title="Recent Activity">
        {activityLoading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1, mb: 1 }} />
            ))}
          </Box>
        ) : activity.length === 0 ? (
          <EmptyState
            icon={<Activity size={32} />}
            title="No recent activity"
            subtitle="Activity will appear here as your website is updated."
          />
        ) : (
          <List dense disablePadding>
            {activity.slice(0, 8).map((item, idx) => (
              <ListItem
                key={item.id || idx}
                disablePadding
                sx={{
                  py: 1,
                  borderBottom: idx < activity.length - 1 ? `1px solid ${colors.border}` : 'none',
                }}
              >
                <ListItemText
                  primary={item.description || item.action}
                  secondary={item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { color: 'text.primary' },
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: { color: 'text.secondary' },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DashboardCard>
    </Box>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
