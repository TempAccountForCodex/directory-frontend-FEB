/**
 * ActivityFeedCard — Step 10.14.3
 *
 * Reusable card that displays the unified activity feed for a specific website.
 * Uses existing Dashboard shared components for consistent styling.
 *
 * Props:
 *   websiteId    {number}  (required) — which website to fetch activity for
 *   limit        {number}  (optional, default 10) — items per page
 *   title        {string}  (optional, default 'Recent Activity')
 *   showFilters  {boolean} (optional, default true)
 */

import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
import {
  Plus,
  Edit,
  Globe,
  Settings,
  Users,
  Activity,
} from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import DashboardTable from './DashboardTable';
import { DashboardTablePagination } from './DashboardTable';
import FilterBar from './FilterBar';
import EmptyState from './EmptyState';
import DashboardTooltip from './DashboardTooltip';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ─── Activity Type Configuration ──────────────────────────────────────────────

const ACTIVITY_TYPE_CONFIG = {
  page_created:       { icon: Plus,     color: 'success', label: 'Page Created' },
  page_updated:       { icon: Edit,     color: 'info',    label: 'Page Updated' },
  page_deleted:       { icon: Edit,     color: 'error',   label: 'Page Deleted' },
  block_created:      { icon: Plus,     color: 'success', label: 'Block Added' },
  block_updated:      { icon: Edit,     color: 'info',    label: 'Block Updated' },
  block_deleted:      { icon: Edit,     color: 'error',   label: 'Block Deleted' },
  website_published:  { icon: Globe,    color: 'success', label: 'Published' },
  website_unpublished:{ icon: Globe,    color: 'warning', label: 'Unpublished' },
  website_updated:    { icon: Settings, color: 'info',    label: 'Settings Updated' },
  website_created:    { icon: Plus,     color: 'success', label: 'Website Created' },
  collaborator_added: { icon: Users,    color: 'primary', label: 'Collaborator Added' },
  collaborator_removed: { icon: Users,  color: 'error',   label: 'Collaborator Removed' },
};

// Filter options for FilterBar
const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Activity' },
  { value: 'page_created,page_updated,page_deleted', label: 'Pages' },
  { value: 'block_created,block_updated,block_deleted', label: 'Blocks' },
  { value: 'website_published,website_unpublished,website_updated,website_created', label: 'Website' },
  { value: 'collaborator_added,collaborator_removed', label: 'Collaborators' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lightweight relative time formatter — avoids date-fns dependency.
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'just now';
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return 'just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

/**
 * Format a full ISO date to a human-readable string for tooltips.
 */
function formatFullDate(timestamp) {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return String(timestamp);
  }
}

/**
 * Build a human-readable activity message.
 */
function buildMessage(item) {
  const actor = item.actorName || 'Someone';
  const target = item.targetName ? `"${item.targetName}"` : '';
  const config = ACTIVITY_TYPE_CONFIG[item.type];
  const label = config ? config.label.toLowerCase() : item.action || item.type;

  if (item.targetName) {
    return `${actor} — ${label}: ${target}`;
  }
  return `${actor} — ${label}`;
}

// ─── MUI chip color → hex mapping helper ──────────────────────────────────────
const CHIP_COLORS = {
  success: '#2e7d32',
  info:    '#0288d1',
  error:   '#d32f2f',
  warning: '#ed6c02',
  primary: '#378C92',
};

// ─── ActivityFeedCard ─────────────────────────────────────────────────────────

const ActivityFeedCard = memo(function ActivityFeedCard({
  websiteId,
  limit: limitProp = 10,
  title = 'Recent Activity',
  showFilters = true,
}) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');

  // Derived: types array for API (null means all)
  const typesParam = useMemo(
    () => (typeFilter === 'all' ? null : typeFilter),
    [typeFilter],
  );

  // Fetch activity from API
  const fetchActivity = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(limitProp),
        offset: String(page * limitProp),
      });
      if (typesParam) params.set('types', typesParam);

      const res = await axios.get(`${API_URL}/websites/${websiteId}/activity?${params}`);
      const { activities: items = [], total: count = 0 } = res.data?.data || {};
      setActivities(items);
      setTotal(count);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  }, [websiteId, limitProp, page, typesParam]);

  // Re-fetch when dependencies change
  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // Handlers
  const handlePageChange = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleTypeChange = useCallback((e) => {
    setTypeFilter(e.target.value);
    setPage(0);
  }, []);

  // Memoised header section
  const filterSection = useMemo(
    () =>
      showFilters ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <FilterBar
            label="Filter"
            value={typeFilter}
            onChange={handleTypeChange}
            options={TYPE_FILTER_OPTIONS}
          />
        </Box>
      ) : null,
    [showFilters, typeFilter, handleTypeChange],
  );

  // Skeleton rows during loading
  if (loading && activities.length === 0) {
    return (
      <DashboardCard icon={Activity} title={title}>
        {filterSection}
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={52}
            sx={{ mb: 1, borderRadius: '10px' }}
          />
        ))}
      </DashboardCard>
    );
  }

  return (
    <DashboardCard icon={Activity} title={title}>
      {/* Filter bar */}
      {filterSection}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && activities.length === 0 && (
        <EmptyState
          icon={<Activity size={32} color={colors.textSecondary} />}
          title="No activity yet"
          subtitle="Actions on this website will appear here."
        />
      )}

      {/* Activity table */}
      {activities.length > 0 && (
        <>
          <DashboardTable variant="inset" colors={colors}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: alpha(colors.text, 0.6), fontSize: '0.85rem', fontWeight: 500, py: '10px', px: '22px', borderBottom: `1px solid ${alpha(colors.text, 0.06)}`, backgroundColor: alpha(colors.text, 0.02) }}>
                  Type
                </TableCell>
                <TableCell sx={{ color: alpha(colors.text, 0.6), fontSize: '0.85rem', fontWeight: 500, py: '10px', px: '22px', borderBottom: `1px solid ${alpha(colors.text, 0.06)}`, backgroundColor: alpha(colors.text, 0.02) }}>
                  Activity
                </TableCell>
                <TableCell align="right" sx={{ color: alpha(colors.text, 0.6), fontSize: '0.85rem', fontWeight: 500, py: '10px', px: '22px', borderBottom: `1px solid ${alpha(colors.text, 0.06)}`, backgroundColor: alpha(colors.text, 0.02) }}>
                  When
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((item) => {
                const config = ACTIVITY_TYPE_CONFIG[item.type] || { icon: Activity, color: 'primary', label: item.type };
                const ItemIcon = config.icon;
                const chipColor = config.color;
                const iconColor = CHIP_COLORS[chipColor] || colors.primary;

                return (
                  <TableRow
                    key={item.id}
                    sx={{
                      backgroundColor: 'transparent',
                      '&:hover': { backgroundColor: alpha(colors.text, 0.015) },
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* Type chip */}
                    <TableCell sx={{ py: '14px', px: '22px', borderBottom: `1px solid ${alpha(colors.text, 0.05)}`, color: colors.text }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: alpha(iconColor, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ItemIcon size={13} color={iconColor} />
                        </Box>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 20,
                            backgroundColor: alpha(iconColor, 0.12),
                            color: iconColor,
                            fontWeight: 600,
                            border: 'none',
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* Activity message */}
                    <TableCell sx={{ py: '14px', px: '22px', borderBottom: `1px solid ${alpha(colors.text, 0.05)}`, color: colors.text }}>
                      <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.875rem', fontWeight: 500 }}>
                        {buildMessage(item)}
                      </Typography>
                    </TableCell>

                    {/* Relative timestamp with full date tooltip */}
                    <TableCell align="right" sx={{ py: '14px', px: '22px', borderBottom: `1px solid ${alpha(colors.text, 0.05)}`, color: colors.text }}>
                      <DashboardTooltip
                        title={formatFullDate(item.timestamp)}
                        placement="left"
                        arrow
                        colors={colors}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: colors.textSecondary, fontSize: '0.75rem', cursor: 'default' }}
                        >
                          {formatRelativeTime(item.timestamp)}
                        </Typography>
                      </DashboardTooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DashboardTable>

          {/* Pagination */}
          {total > limitProp && (
            <DashboardTablePagination
              colors={colors}
              component="div"
              count={total}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={limitProp}
              rowsPerPageOptions={[limitProp]}
            />
          )}
        </>
      )}
    </DashboardCard>
  );
});

export default ActivityFeedCard;
