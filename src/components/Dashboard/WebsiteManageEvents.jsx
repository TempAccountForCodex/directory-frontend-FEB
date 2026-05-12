/**
 * WebsiteManageEvents
 *
 * Dashboard component for managing website events.
 * Step 2.29C.4 — Event Management Dashboard
 *
 * Features:
 * - Stats row: Total Events, Published, Upcoming, Past
 * - Two subtabs: Events (CRUD) and Categories
 * - Events table with Title, Date, Location, Status toggle, RSVPs, Actions
 * - Create/Edit dialog with DateTimePicker for start/end dates
 * - Quick filter buttons: Upcoming / Past / All
 * - Search bar, sort dropdown
 * - Delete confirmation dialog
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  Switch,
  Checkbox,
  FormControlLabel,
  Skeleton,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  ButtonGroup,
  Button,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  Calendar as CalendarIcon,
  MapPin as LocationIcon,
  Globe as OnlineIcon,
  Tag as CategoryIcon,
} from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  PageHeader,
  DashboardMetricCard,
  TabNavigation,
  DashboardTable,
  DashboardInput,
  DashboardSelect,
  DashboardActionButton,
  DashboardCancelButton,
  DashboardConfirmButton,
  EmptyState,
  RowActionButtonGroup,
} from './shared';

// ---------------------------------------------------------------------------
// Slug generator
// ---------------------------------------------------------------------------
const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

// ---------------------------------------------------------------------------
// Default form data
// ---------------------------------------------------------------------------
const DEFAULT_FORM = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  startDate: null,
  endDate: null,
  location: '',
  isOnline: false,
  onlineUrl: '',
  capacity: '',
  price: '',
  category: '',
};

// ---------------------------------------------------------------------------
// Stat Skeleton (loading placeholder for a single metric card)
// ---------------------------------------------------------------------------
const StatSkeleton = ({ colors }) => (
  <Box
    sx={{
      borderRadius: '18px',
      background: colors.panelBg,
      p: 3,
      minHeight: 110,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Skeleton variant="circular" width={56} height={56} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={32} />
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Row Skeleton
// ---------------------------------------------------------------------------
const RowSkeleton = ({ cols = 6, colors }) => (
  <TableRow>
    {Array.from({ length: cols }).map((_, i) => (
      <TableCell key={i} sx={{ color: colors.text }}>
        <Skeleton variant="text" width="80%" />
      </TableCell>
    ))}
  </TableRow>
);

// ---------------------------------------------------------------------------
// WebsiteManageEvents Component
// ---------------------------------------------------------------------------
const WebsiteManageEvents = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const { websiteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse subtab from URL
  const parseSubtab = useCallback(() => {
    const segments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    // /dashboard/websites/:websiteId/events/:subtab
    return segments[4] || 'events';
  }, [location.pathname]);

  const activeTab = parseSubtab();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, upcoming: 0, past: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'upcoming' | 'past'
  const [sortBy, setSortBy] = useState('startDate');
  const [categories, setCategories] = useState([]);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  // Toast
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/events/stats?websiteId=${websiteId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch {
      // Stats loading silently fails — don't block UI
    } finally {
      setStatsLoading(false);
    }
  }, [websiteId]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ websiteId });
      if (searchQuery) params.set('search', searchQuery);
      if (filterMode !== 'all') params.set('filter', filterMode);
      params.set('sortBy', sortBy);

      const res = await fetch(`/api/events?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        // Extract unique categories from events
        const cats = [...new Set((data.events || []).map((e) => e.category).filter(Boolean))];
        setCategories(cats);
      }
    } catch (err) {
      showSnackbar(err.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, [websiteId, searchQuery, filterMode, sortBy]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ---------------------------------------------------------------------------
  // Filtered + sorted events (client-side for quick filter)
  // ---------------------------------------------------------------------------
  const filteredEvents = useMemo(() => {
    const now = new Date();
    let result = [...events];

    // Quick filter
    if (filterMode === 'upcoming') {
      result = result.filter((e) => new Date(e.startDate) >= now);
    } else if (filterMode === 'past') {
      result = result.filter((e) => new Date(e.startDate) < now);
    }

    // Search filter (client-side secondary)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => e.title?.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'startDate') {
        return new Date(a.startDate) - new Date(b.startDate);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'rsvps') {
        return (b.rsvpCount || 0) - (a.rsvpCount || 0);
      }
      return 0;
    });

    return result;
  }, [events, filterMode, searchQuery, sortBy]);

  // ---------------------------------------------------------------------------
  // Form handlers
  // ---------------------------------------------------------------------------
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentEvent(null);
    setFormData(DEFAULT_FORM);
    setOpenDialog(true);
  };

  const handleOpenEdit = (event) => {
    setIsEditing(true);
    setCurrentEvent(event);
    setFormData({
      title: event.title || '',
      slug: event.slug || '',
      description: event.description || '',
      imageUrl: event.imageUrl || '',
      startDate: event.startDate ? new Date(event.startDate) : null,
      endDate: event.endDate ? new Date(event.endDate) : null,
      location: event.location || '',
      isOnline: event.isOnline || false,
      onlineUrl: event.onlineUrl || '',
      capacity: event.capacity !== null && event.capacity !== undefined ? String(event.capacity) : '',
      price: event.price || '',
      category: event.category || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEvent(null);
  };

  const handleFormChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug when title changes and not editing
      if (field === 'title' && !isEditing) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleDateChange = (field) => (newValue) => {
    setFormData((prev) => ({ ...prev, [field]: newValue }));
  };

  // ---------------------------------------------------------------------------
  // API mutations
  // ---------------------------------------------------------------------------
  const handleSaveEvent = async () => {
    try {
      const payload = {
        ...formData,
        websiteId,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        capacity: formData.capacity ? Number(formData.capacity) : null,
      };

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/events/${currentEvent.id}` : '/api/events';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save event');
      }

      showSnackbar(isEditing ? 'Event updated successfully' : 'Event created successfully');
      handleCloseDialog();
      fetchEvents();
      fetchStats();
    } catch (err) {
      showSnackbar(err.message || 'Failed to save event', 'error');
    }
  };

  const handleToggleStatus = async (event) => {
    const newStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/events/${event.id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      // Optimistic update
      setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e)));
      fetchStats();
    } catch (err) {
      showSnackbar(err.message || 'Failed to update status', 'error');
    }
  };

  const handleOpenDelete = (event) => {
    setCurrentEvent(event);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`/api/events/${currentEvent.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      showSnackbar('Event deleted successfully');
      setOpenDeleteDialog(false);
      setCurrentEvent(null);
      fetchEvents();
      fetchStats();
    } catch (err) {
      showSnackbar(err.message || 'Failed to delete event', 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // Stat icon components (MUI icons)
  // ---------------------------------------------------------------------------
  const TotalIcon = ({ sx }) => <CalendarIcon size={22} style={{ color: sx?.color }} />;
  const PublishedIcon = ({ sx }) => <OnlineIcon size={22} style={{ color: sx?.color }} />;
  const UpcomingIcon = ({ sx }) => <CalendarIcon size={22} style={{ color: sx?.color }} />;
  const PastIcon = ({ sx }) => <LocationIcon size={22} style={{ color: sx?.color }} />;

  // ---------------------------------------------------------------------------
  // Render: Stats row
  // ---------------------------------------------------------------------------
  const renderStats = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { title: 'Total Events', value: stats.total, icon: TotalIcon },
        { title: 'Published', value: stats.published, icon: PublishedIcon },
        { title: 'Upcoming', value: stats.upcoming, icon: UpcomingIcon },
        { title: 'Past', value: stats.total - stats.upcoming - stats.draft, icon: PastIcon },
      ].map((card, i) =>
        statsLoading ? (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatSkeleton colors={colors} />
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <DashboardMetricCard
              title={card.title}
              value={card.value}
              icon={card.icon}
            />
          </Grid>
        )
      )}
    </Grid>
  );

  // ---------------------------------------------------------------------------
  // Render: Events table
  // ---------------------------------------------------------------------------
  const renderEventsTable = () => {
    if (loading) {
      return (
        <DashboardTable colors={colors}>
          <TableHead>
            <TableRow>
              {['Title', 'Date', 'Location', 'Status', 'RSVPs', 'Actions'].map((col) => (
                <TableCell key={col} sx={{ color: alpha(colors.text, 0.6) }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <RowSkeleton key={i} cols={6} colors={colors} />
            ))}
          </TableBody>
        </DashboardTable>
      );
    }

    if (!loading && filteredEvents.length === 0) {
      return (
        <EmptyState
          icon={<CalendarIcon size={48} color={colors.textSecondary} />}
          title="No events yet. Create your first event!"
          subtitle="Add events to your website to let visitors know what's happening."
          action={
            <DashboardActionButton startIcon={<AddIcon size={16} />} onClick={handleOpenCreate}>
              Add Event
            </DashboardActionButton>
          }
        />
      );
    }

    return (
      <DashboardTable colors={colors}>
        <TableHead>
          <TableRow>
            {['Title', 'Date', 'Location', 'Status', 'RSVPs', 'Actions'].map((col) => (
              <TableCell key={col} sx={{ color: alpha(colors.text, 0.6) }}>
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEvents.map((event) => {
            const isOnline = event.isOnline;
            const locationDisplay = isOnline ? 'Online' : event.location || '—';
            const isPublished = event.status === 'PUBLISHED';

            return (
              <TableRow key={event.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                    {event.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {formatDate(event.startDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {locationDisplay}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={isPublished ? 'Click to unpublish' : 'Click to publish'}>
                    <Switch
                      checked={isPublished}
                      onChange={() => handleToggleStatus(event)}
                      size="small"
                      color="primary"
                      inputProps={{ role: 'switch', 'aria-label': `Toggle status for ${event.title}` }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {event.rsvpCount ?? 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <RowActionButtonGroup
                    actions={[
                      {
                        label: 'Edit',
                        icon: <EditIcon size={16} />,
                        onClick: () => handleOpenEdit(event),
                        color: colors.primary,
                        hoverColor: colors.primaryDark,
                      },
                      {
                        label: 'Delete',
                        icon: <DeleteIcon size={16} />,
                        onClick: () => handleOpenDelete(event),
                        color: '#ef4444',
                        hoverColor: '#dc2626',
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </DashboardTable>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Categories tab (simple list)
  // ---------------------------------------------------------------------------
  const renderCategoriesTab = () => (
    <Box>
      {categories.length === 0 ? (
        <EmptyState
          icon={<CategoryIcon size={48} color={colors.textSecondary} />}
          title="No categories yet"
          subtitle="Categories are automatically created when you add events with a category."
        />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {categories.map((cat) => (
            <Box
              key={cat}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                background: alpha(colors.primary, 0.1),
                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                color: colors.primary,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {cat}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  // ---------------------------------------------------------------------------
  // Render: Create/Edit Dialog
  // ---------------------------------------------------------------------------
  const renderDialog = () => (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: colors.panelBg,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}`, pb: 2 }}>
        {isEditing ? 'Edit Event' : 'Create New Event'}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            {/* Title */}
            <Grid item xs={12} sm={8}>
              <DashboardInput
                label="Event Title"
                value={formData.title}
                onChange={handleFormChange('title')}
                placeholder="My Amazing Event"
                required
              />
            </Grid>

            {/* Slug (auto-generated, read-only) */}
            <Grid item xs={12} sm={4}>
              <DashboardInput
                label="Slug"
                value={formData.slug}
                onChange={handleFormChange('slug')}
                placeholder="auto-generated"
                disabled={!isEditing}
                helperText={!isEditing ? 'Auto-generated from title' : undefined}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <DashboardInput
                label="Description"
                value={formData.description}
                onChange={handleFormChange('description')}
                multiline
                rows={3}
                placeholder="Describe your event..."
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12}>
              <DashboardInput
                label="Image URL"
                value={formData.imageUrl}
                onChange={handleFormChange('imageUrl')}
                placeholder="https://example.com/event-image.jpg"
              />
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  component="label"
                  sx={{ color: colors.panelMuted, fontSize: '0.95rem', fontWeight: 500, mb: 1, display: 'block' }}
                >
                  Start Date & Time *
                </Typography>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.startDate}
                  onChange={handleDateChange('startDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'medium',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          color: colors.panelText,
                          backgroundColor: alpha(colors.panelText, 0.04),
                          '& fieldset': { borderColor: colors.panelBorder },
                          '&:hover fieldset': { borderColor: alpha(colors.panelAccent, 0.3) },
                          '&.Mui-focused fieldset': { borderColor: colors.panelAccent },
                        },
                        '& .MuiInputLabel-root': { color: colors.panelMuted },
                        '& .MuiSvgIcon-root': { color: colors.panelMuted },
                      },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  component="label"
                  sx={{ color: colors.panelMuted, fontSize: '0.95rem', fontWeight: 500, mb: 1, display: 'block' }}
                >
                  End Date & Time (optional)
                </Typography>
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.endDate}
                  onChange={handleDateChange('endDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'medium',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          color: colors.panelText,
                          backgroundColor: alpha(colors.panelText, 0.04),
                          '& fieldset': { borderColor: colors.panelBorder },
                          '&:hover fieldset': { borderColor: alpha(colors.panelAccent, 0.3) },
                          '&.Mui-focused fieldset': { borderColor: colors.panelAccent },
                        },
                        '& .MuiInputLabel-root': { color: colors.panelMuted },
                        '& .MuiSvgIcon-root': { color: colors.panelMuted },
                      },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6}>
              <DashboardInput
                label="Location"
                value={formData.location}
                onChange={handleFormChange('location')}
                placeholder="123 Main St, City, State"
                disabled={formData.isOnline}
              />
            </Grid>

            {/* Online event checkbox */}
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isOnline}
                    onChange={handleFormChange('isOnline')}
                    sx={{ color: colors.panelMuted, '&.Mui-checked': { color: colors.panelAccent } }}
                  />
                }
                label="Online Event"
                sx={{ color: colors.panelText, mt: 'auto' }}
                aria-label="Online Event"
              />
            </Grid>

            {/* Online URL (conditional) */}
            {formData.isOnline && (
              <Grid item xs={12}>
                <DashboardInput
                  label="Online URL"
                  value={formData.onlineUrl}
                  onChange={handleFormChange('onlineUrl')}
                  placeholder="https://zoom.us/meeting/..."
                  aria-label="Online URL"
                />
              </Grid>
            )}

            {/* Capacity */}
            <Grid item xs={12} sm={4}>
              <DashboardInput
                label="Capacity"
                value={formData.capacity}
                onChange={handleFormChange('capacity')}
                type="number"
                placeholder="100"
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={4}>
              <DashboardInput
                label="Price"
                value={formData.price}
                onChange={handleFormChange('price')}
                placeholder="Free or $25"
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={4}>
              <DashboardInput
                label="Category"
                value={formData.category}
                onChange={handleFormChange('category')}
                placeholder="Technology, Business..."
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${colors.border}`, gap: 1 }}>
        <DashboardCancelButton onClick={handleCloseDialog}>Cancel</DashboardCancelButton>
        <DashboardConfirmButton onClick={handleSaveEvent} disabled={!formData.title || !formData.startDate}>
          {isEditing ? 'Update Event' : 'Create Event'}
        </DashboardConfirmButton>
      </DialogActions>
    </Dialog>
  );

  // ---------------------------------------------------------------------------
  // Render: Delete Confirmation Dialog
  // ---------------------------------------------------------------------------
  const renderDeleteDialog = () => (
    <Dialog
      open={openDeleteDialog}
      onClose={() => setOpenDeleteDialog(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: colors.panelBg,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ color: colors.text }}>Delete Event</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: colors.textSecondary }}>
          Are you sure you want to delete{' '}
          <Box component="span" sx={{ color: colors.text, fontWeight: 600 }}>
            {currentEvent?.title}
          </Box>
          ? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <DashboardCancelButton onClick={() => setOpenDeleteDialog(false)}>Cancel</DashboardCancelButton>
        <DashboardConfirmButton tone="danger" onClick={handleConfirmDelete}>
          Delete
        </DashboardConfirmButton>
      </DialogActions>
    </Dialog>
  );

  // ---------------------------------------------------------------------------
  // Tab definitions
  // ---------------------------------------------------------------------------
  const tabs = [
    { label: 'Events', value: 'events' },
    { label: 'Categories', value: 'categories' },
  ];

  const handleTabChange = (_, newValue) => {
    navigate(`/dashboard/websites/${websiteId}/events/${newValue}`, { replace: true });
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader
        title="Events"
        subtitle="Manage events for your website — create, publish, and track RSVPs"
        action={
          <DashboardActionButton startIcon={<AddIcon size={16} />} onClick={handleOpenCreate}>
            Add Event
          </DashboardActionButton>
        }
      />

      {/* Stats Row */}
      {renderStats()}

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        value={activeTab === 'categories' ? 'categories' : 'events'}
        onChange={handleTabChange}
      />

      {/* Events subtab */}
      {activeTab !== 'categories' && (
        <>
          {/* Toolbar: Quick Filters + Search + Sort */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
            }}
          >
            {/* Quick Filters */}
            <ButtonGroup size="small" sx={{ flexShrink: 0 }}>
              {['all', 'upcoming', 'past'].map((mode) => (
                <Button
                  key={mode}
                  variant={filterMode === mode ? 'contained' : 'outlined'}
                  onClick={() => setFilterMode(mode)}
                  sx={{
                    textTransform: 'capitalize',
                    borderColor: colors.border,
                    color: filterMode === mode ? undefined : colors.textSecondary,
                    '&:hover': { borderColor: colors.primary },
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </ButtonGroup>

            {/* Search */}
            <Box sx={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
              <DashboardInput
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                inputSize="sm"
                containerSx={{ gap: '4px' }}
                inputProps={{ 'aria-label': 'Search events' }}
              />
            </Box>

            {/* Sort By */}
            <Box sx={{ minWidth: 160 }}>
              <DashboardSelect
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
              >
                <MenuItem value="startDate">Date</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="rsvps">RSVPs</MenuItem>
              </DashboardSelect>
            </Box>
          </Box>

          {/* Events Table */}
          {renderEventsTable()}
        </>
      )}

      {/* Categories subtab */}
      {activeTab === 'categories' && renderCategoriesTab()}

      {/* Dialogs */}
      {renderDialog()}
      {renderDeleteDialog()}

      {/* Toast Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default memo(WebsiteManageEvents);
