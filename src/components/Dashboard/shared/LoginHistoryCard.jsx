import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TableHead, TableBody, TableCell, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Timer } from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import DashboardTable, {
  DashboardTableHeadCell,
  DashboardTableRow,
  DashboardTablePagination,
} from './DashboardTable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * LoginHistoryCard
 *
 * Displays a paginated table of recent login history entries.
 * Fetches data from API, maintains last 1 year of history.
 */
const LoginHistoryCard = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const tableColors = {
    text: colors.text,
    textSecondary: alpha(colors.text, 0.6),
    textTertiary: alpha(colors.text, 0.4),
    primary: colors.primary,
    border: alpha(colors.text, 0.08),
  };

  const fetchLoginHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/account/login-history`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setLoginHistory(response.data.loginHistory || []);
      setTotalCount(response.data.pagination?.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch login history:', err);
      setError('Failed to load login history');
      setLoginHistory([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchLoginHistory();
  }, [fetchLoginHistory]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return `on ${date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  const formatLoginType = (type) => {
    const typeMap = {
      credential: 'Credential login',
      google: 'Google login',
      magic_link: 'Magic link login',
    };
    return typeMap[type] || type;
  };

  const formatUserAgent = (browser, os) => {
    if (browser && os) {
      return `${browser}, ${os}`;
    }
    return browser || os || 'Unknown';
  };

  return (
    <DashboardCard icon={Timer} title="Login history">
      {loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '14px' }} />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : loginHistory.length === 0 ? (
        <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: alpha(colors.text, 0.5) }}>No login history available</Typography>
        </Box>
      ) : (
        <>
          <DashboardTable colors={tableColors} variant="inset">
            <TableHead>
              <DashboardTableRow colors={tableColors}>
                <DashboardTableHeadCell colors={tableColors}>Login type</DashboardTableHeadCell>
                <DashboardTableHeadCell colors={tableColors}>IP address</DashboardTableHeadCell>
                <DashboardTableHeadCell colors={tableColors}>User agent</DashboardTableHeadCell>
              </DashboardTableRow>
            </TableHead>
            <TableBody>
              {loginHistory.map((entry) => (
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
                      {formatLoginType(entry.loginType)}
                    </Typography>
                    <Typography
                      sx={{
                        color: alpha(colors.text, 0.5),
                        fontSize: '0.8rem',
                        fontWeight: 400,
                        mt: 0.25,
                      }}
                    >
                      {formatTimestamp(entry.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: colors.text,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    >
                      {entry.ipAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: colors.text,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    >
                      {formatUserAgent(entry.browser, entry.os)}
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

export default LoginHistoryCard;
