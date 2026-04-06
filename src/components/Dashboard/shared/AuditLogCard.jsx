import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Typography, TableHead, TableBody, TableCell, Skeleton, MenuItem, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ScrollText, Download } from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import DashboardTable, {
  DashboardTableHeadCell,
  DashboardTableRow,
  DashboardTablePagination,
} from './DashboardTable';
import DashboardSelect from './DashboardSelect';
import DashboardDateField from './DashboardDateField';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Hardcoded fallbacks -- used only if /api/audit/meta fetch fails.
 * The canonical source of truth is the backend endpoint.
 */
const FALLBACK_ACTIONS = [
  'create', 'update', 'delete', 'publish', 'unpublish', 'archive', 'restore',
];

const FALLBACK_ENTITY_TYPES = [
  'Website', 'Page', 'Block', 'Template', 'Store', 'Product', 'Order', 'User', 'Blog',
];

/** Convert a raw value string to { value, label } for dropdowns */
const toOption = (v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' '),
});

const AuditLogCard = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dynamic filter options from /api/audit/meta
  const [actionOptions, setActionOptions] = useState(FALLBACK_ACTIONS.map(toOption));
  const [entityTypeOptions, setEntityTypeOptions] = useState(FALLBACK_ENTITY_TYPES.map(toOption));
  const metaFetched = useRef(false);

  useEffect(() => {
    if (metaFetched.current) return;
    metaFetched.current = true;
    axios
      .get(`${API_URL}/audit/meta`)
      .then(({ data }) => {
        if (Array.isArray(data.actions) && data.actions.length > 0) {
          setActionOptions(data.actions.map(toOption));
        }
        if (Array.isArray(data.entityTypes) && data.entityTypes.length > 0) {
          setEntityTypeOptions(data.entityTypes.map(toOption));
        }
      })
      .catch(() => {
        // Keep fallback values -- already set in initial state
      });
  }, []);

  const tableColors = useMemo(
    () => ({
      text: colors.text,
      textSecondary: alpha(colors.text, 0.6),
      textTertiary: alpha(colors.text, 0.4),
      primary: colors.primary,
      border: alpha(colors.text, 0.08),
    }),
    [colors.text, colors.primary]
  );

  const buildFilterParams = useCallback(() => {
    const params = {};
    if (actionFilter) params.action = actionFilter;
    if (entityTypeFilter) params.entityType = entityTypeFilter;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    return params;
  }, [actionFilter, entityTypeFilter, dateFrom, dateTo]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...buildFilterParams(),
      };
      const response = await axios.get(`${API_URL}/audit/admin/logs`, { params });
      setLogs(response.data.data?.logs || []);
      setTotalCount(response.data.data?.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, buildFilterParams]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = useCallback((_event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleActionFilterChange = useCallback((e) => {
    setActionFilter(e.target.value);
    setPage(0);
  }, []);

  const handleEntityTypeFilterChange = useCallback((e) => {
    setEntityTypeFilter(e.target.value);
    setPage(0);
  }, []);

  const handleDateFromChange = useCallback((e) => {
    setDateFrom(e.target.value);
    setPage(0);
  }, []);

  const handleDateToChange = useCallback((e) => {
    setDateTo(e.target.value);
    setPage(0);
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const params = { format: 'csv', ...buildFilterParams() };
      const response = await axios.get(`${API_URL}/audit/admin/logs/export`, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers['content-disposition'];
      const match = disposition?.match(/filename="?([^"]+)"?/);
      link.download = match ? match[1] : 'audit-logs.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audit logs:', err);
    } finally {
      setExporting(false);
    }
  }, [buildFilterParams]);

  return (
    <DashboardCard icon={ScrollText} title="Audit logs">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1, alignItems: 'center' }}>
        <DashboardSelect
          value={actionFilter}
          onChange={handleActionFilterChange}
          size="small"
          fullWidth={false}
          containerSx={{ minWidth: 140 }}
          displayEmpty
        >
          <MenuItem value="">All actions</MenuItem>
          {actionOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </DashboardSelect>

        <DashboardSelect
          value={entityTypeFilter}
          onChange={handleEntityTypeFilterChange}
          size="small"
          fullWidth={false}
          containerSx={{ minWidth: 140 }}
          displayEmpty
        >
          <MenuItem value="">All resources</MenuItem>
          {entityTypeOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </DashboardSelect>

        <DashboardDateField
          label="From"
          value={dateFrom}
          onChange={handleDateFromChange}
          size="small"
          fullWidth={false}
          containerSx={{ minWidth: 150 }}
        />

        <DashboardDateField
          label="To"
          value={dateTo}
          onChange={handleDateToChange}
          size="small"
          fullWidth={false}
          containerSx={{ minWidth: 150 }}
        />

        <Button
          variant="text"
          size="small"
          onClick={handleExport}
          disabled={exporting}
          startIcon={<Download size={16} />}
          sx={{
            ml: 'auto',
            color: colors.primary,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: alpha(colors.primary, 0.05) },
          }}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '14px' }} />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : logs.length === 0 ? (
        <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: alpha(colors.text, 0.5) }}>No audit logs found</Typography>
        </Box>
      ) : (
        <>
          <DashboardTable colors={tableColors} variant="inset">
            <TableHead>
              <DashboardTableRow colors={tableColors}>
                <DashboardTableHeadCell colors={tableColors}>Timestamp</DashboardTableHeadCell>
                <DashboardTableHeadCell colors={tableColors}>User</DashboardTableHeadCell>
                <DashboardTableHeadCell colors={tableColors}>Action</DashboardTableHeadCell>
                <DashboardTableHeadCell colors={tableColors}>Resource</DashboardTableHeadCell>
              </DashboardTableRow>
            </TableHead>
            <TableBody>
              {logs.map((entry) => (
                <DashboardTableRow key={entry.id} colors={tableColors}>
                  <TableCell>
                    <Typography
                      sx={{
                        color: colors.text,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                    <Typography
                      sx={{
                        color: alpha(colors.text, 0.5),
                        fontSize: '0.8rem',
                        fontWeight: 400,
                        mt: 0.25,
                      }}
                    >
                      {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: colors.text, fontSize: '0.9rem', fontWeight: 500 }}>
                      {entry.user?.name || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: colors.text,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      {entry.action}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: colors.text, fontSize: '0.9rem', fontWeight: 500 }}>
                      {entry.entityType}
                      {entry.entityId ? `:${entry.entityId}` : ''}
                    </Typography>
                  </TableCell>
                </DashboardTableRow>
              ))}
            </TableBody>
          </DashboardTable>

          {totalCount > rowsPerPage && (
            <DashboardTablePagination
              colors={tableColors}
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </>
      )}
    </DashboardCard>
  );
};

export default AuditLogCard;
