import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  alpha,
} from '@mui/material';
import {
  Archive,
  CircleCheck,
  ClipboardList,
  ExternalLink,
  FileWarning,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { useWebsites } from '../../../api/queries/websites';
import {
  DashboardActionButton,
  DashboardMetricCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTableRow,
  EmptyState,
  PageHeader,
  SearchBar,
} from '../shared';

const PAID_PLANS = new Set(['website_core', 'website_growth', 'website_agency']);
const MIN_PUBLISH_COMPLETENESS = 60;

const extractWebsiteList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.websites)) return payload.data.websites;
  if (Array.isArray(payload?.websites)) return payload.websites;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const getWebsiteId = (website) =>
  website?.id ??
  website?.websiteId ??
  website?.website_id ??
  website?.websiteID ??
  website?.website?.id ??
  website?.website?.websiteId ??
  website?.website?.website_id;

const getPlanCode = (website) =>
  website?.websitePlan ??
  website?.planCode ??
  website?.owner?.websitePlan ??
  website?.user?.websitePlan ??
  website?.plan ??
  '';

const normalizeStatus = (value) => String(value || '').toLowerCase();

const hasListingDraft = (website) =>
  Boolean(
    website?.directoryOptedIn ||
      website?.isDirectoryArchived ||
      website?.businessName ||
      website?.shortDescription ||
      website?.businessCategory ||
      website?.priceLevel ||
      (Array.isArray(website?.tags) && website.tags.length > 0),
  );

const getListingStatus = (website) => {
  if (!hasListingDraft(website)) return 'not_listed';
  if (website?.isDirectoryArchived) return 'archived';

  const score =
    website?.listingCompletenessScore ??
    website?.directoryCompletenessScore ??
    website?.completenessScore ??
    website?.completeness?.score;

  if (website?.directoryOptedIn && website?.isPublic) return 'published';
  if (typeof score === 'number' && score < MIN_PUBLISH_COMPLETENESS) return 'needs_completion';
  if (!website?.businessName && !website?.name) return 'needs_completion';
  return 'draft';
};

const statusConfig = {
  published: {
    label: 'Published',
    color: 'success',
  },
  archived: {
    label: 'Archived',
    color: 'warning',
  },
  draft: {
    label: 'Draft',
    color: 'info',
  },
  needs_completion: {
    label: 'Needs completion',
    color: 'error',
  },
  not_listed: {
    label: 'Not listed',
    color: 'default',
  },
};

const getMissingHints = (website) => {
  const missing = [];
  if (!(website?.businessName || website?.name)) missing.push('business name');
  if (!website?.shortDescription) missing.push('description');
  if (!website?.businessCategory) missing.push('category');
  if (!(website?.phone || website?.contactEmail)) missing.push('contact');
  if (!website?.fullAddress && !website?.city && !website?.country) missing.push('location');
  if (!Array.isArray(website?.tags) || website.tags.length === 0) missing.push('tags');
  return missing;
};

const DirectoryListingsDashboard = ({ pageTitle, pageSubtitle, mode = 'all' }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isFetching, error, refetch } = useWebsites({ limit: 100 });

  const websites = useMemo(() => extractWebsiteList(data), [data]);
  const listingRows = useMemo(
    () =>
      websites.map((website) => {
        const status = getListingStatus(website);
        const planCode = getPlanCode(website);
        const missing = getMissingHints(website);
        return {
          id: getWebsiteId(website),
          website,
          status,
          planCode,
          planEligible: PAID_PLANS.has(planCode),
          missing,
          title: website?.businessName || website?.name || 'Untitled website',
          category: website?.businessCategory || 'Uncategorized',
          websiteStatus: normalizeStatus(website?.status) || 'draft',
        };
      }),
    [websites],
  );

  const counts = useMemo(
    () => ({
      total: listingRows.length,
      active: listingRows.filter((row) => row.status === 'published').length,
      archived: listingRows.filter((row) => row.status === 'archived').length,
      needsWork: listingRows.filter((row) => row.status === 'needs_completion' || row.status === 'draft').length,
    }),
    [listingRows],
  );

  const visibleRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return listingRows
      .filter((row) => {
        if (mode === 'archived') return row.status === 'archived';
        if (mode === 'modify') return row.status !== 'archived';
        return true;
      })
      .filter((row) => {
        if (!query) return true;
        return [row.title, row.category, row.websiteStatus, row.status]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [listingRows, mode, searchQuery]);

  const handleManage = (row) => {
    if (!row.id) return;
    navigate(`/dashboard/websites/${row.id}/manage/listing`);
  };

  const handleCreateWebsite = () => {
    navigate('/dashboard/websites/templates');
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Listings" value={counts.total} icon={ClipboardList} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Active" value={counts.active} icon={CircleCheck} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Archived" value={counts.archived} icon={Archive} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard title="Needs work" value={counts.needsWork} icon={FileWarning} />
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(colors.border, 0.55)}`,
          background: alpha(colors.bgCard, 0.68),
          boxShadow: `0 4px 20px ${alpha(colors.darker, 0.08)}`,
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box sx={{ maxWidth: 620 }}>
              <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
                Directory listings
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Manage each website listing from its setup form. Archived listings stay saved here until republished.
              </Typography>
            </Box>
            <Box sx={{ minWidth: { xs: '100%', md: 280 } }}>
              <SearchBar
                value={searchQuery}
                onChange={(event) => setSearchQuery(event?.target?.value || '')}
                placeholder="Search listings..."
              />
            </Box>
          </Stack>

          {isFetching ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              action={<DashboardActionButton onClick={() => refetch()}>Retry</DashboardActionButton>}
            >
              Failed to load your websites.
            </Alert>
          ) : listingRows.length === 0 ? (
            <EmptyState
              icon={<Globe size={34} color={colors.primary} />}
              title="No websites yet"
              subtitle="Create a website first, then set up its directory listing from the listing setup form."
              action={<DashboardActionButton onClick={handleCreateWebsite}>Create Website</DashboardActionButton>}
            />
          ) : visibleRows.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ color: colors.textSecondary }}>
                No listings match the current view.
              </Typography>
            </Box>
          ) : (
            <DashboardTable colors={colors}>
              <TableHead>
                <DashboardTableRow colors={colors}>
                  <DashboardTableHeadCell colors={colors}>Listing</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={colors}>Status</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={colors}>Plan</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={colors}>Readiness</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={colors} align="right">Action</DashboardTableHeadCell>
                </DashboardTableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => {
                  const config = statusConfig[row.status] || statusConfig.not_listed;
                  return (
                    <DashboardTableRow key={row.id || row.title} colors={colors}>
                      <TableCell>
                        <Box>
                          <Typography sx={{ color: colors.text, fontWeight: 700 }}>
                            {row.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {row.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" color={config.color} label={config.label} />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ color: colors.text }}>
                            {row.planCode || 'unknown'}
                          </Typography>
                          {!row.planEligible && (
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              Hidden until plan allows listings
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {row.missing.length > 0 ? (
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                            {row.missing.slice(0, 3).map((item) => (
                              <Chip key={item} size="small" variant="outlined" label={item} />
                            ))}
                            {row.missing.length > 3 && (
                              <Chip size="small" variant="outlined" label={`+${row.missing.length - 3}`} />
                            )}
                          </Stack>
                        ) : (
                          <Chip size="small" color="success" variant="outlined" label="Ready" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <DashboardActionButton
                          onClick={() => handleManage(row)}
                          endIcon={<ExternalLink size={16} />}
                          sx={{ minWidth: 128 }}
                        >
                          {row.status === 'not_listed' ? 'Set up' : 'Manage'}
                        </DashboardActionButton>
                      </TableCell>
                    </DashboardTableRow>
                  );
                })}
              </TableBody>
            </DashboardTable>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DirectoryListingsDashboard;
