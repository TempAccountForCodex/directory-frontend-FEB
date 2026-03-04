import { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Typography,
  Alert,
  Snackbar,
  alpha,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  CircleCheck as ApproveIcon,
  CircleX as RejectIcon,
  Eye as ViewIcon,
  ArrowLeftRight as CompareIcon,
} from 'lucide-react';
import axios from 'axios';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { DashboardInput, DashboardPanel } from './shared';
import { DashboardDataGrid } from './grid';
import { isAdmin as checkIsAdmin } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PendingApproval = ({ user, searchQuery = '' }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const triggerNotificationRefresh = () => {
    window.dispatchEvent(new Event('notifications:refresh'));
  };
  const [pendingInsights, setPendingInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = checkIsAdmin(user?.role);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [page, setPage] = useState(() => {
    return parseInt(localStorage.getItem('pendingApprovalPage')) || 0;
  });
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('pendingApprovalRowsPerPage')) || 10;
  });
  const [totalCount, setTotalCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [viewTab, setViewTab] = useState(() => {
    return parseInt(localStorage.getItem('pendingApprovalViewTab')) || 0;
  }); // 0 = current, 1 = diff
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchPendingInsights();
  }, [page, rowsPerPage]);

  // Persist rowsPerPage to localStorage
  useEffect(() => {
    localStorage.setItem('pendingApprovalRowsPerPage', rowsPerPage.toString());
  }, [rowsPerPage]);

  // Persist page to localStorage
  useEffect(() => {
    localStorage.setItem('pendingApprovalPage', page.toString());
  }, [page]);

  // Persist viewTab to localStorage
  useEffect(() => {
    localStorage.setItem('pendingApprovalViewTab', viewTab.toString());
  }, [viewTab]);

  const fetchPendingInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/insights?status=PENDING_APPROVAL&page=${page + 1}&limit=${rowsPerPage}`
      );

      setPendingInsights(response.data.insights || []);
      setTotalCount(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching pending insights:', error);
      showSnackbar('Failed to load pending insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (insight) => {
    setCurrentInsight(insight);
    setViewTab(0); // Reset to current view tab
    setOpenViewDialog(true);
  };

  const handleApprovalClick = (insight, action) => {
    setCurrentInsight(insight);
    setApprovalAction(action);
    setRejectionReason('');
    setOpenApprovalDialog(true);
  };

  const handleApproval = async () => {
    try {
      const endpoint =
        approvalAction === 'approve'
          ? `${API_URL}/insights/${currentInsight.id}/approve`
          : `${API_URL}/insights/${currentInsight.id}/reject`;

      const payload =
        approvalAction === 'reject' && rejectionReason ? { rejectionReason: rejectionReason } : {};

      await axios.patch(endpoint, payload);

      // IMMEDIATELY refetch data for real-time updates
      await fetchPendingInsights();
      triggerNotificationRefresh();

      showSnackbar(
        `Insight ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`,
        'success'
      );
      setOpenApprovalDialog(false);
    } catch (error) {
      console.error('Error processing approval:', error);
      showSnackbar(error.response?.data?.message || `Failed to ${approvalAction} insight`, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter pending insights based on search query
  const filteredPendingInsights = pendingInsights.filter((insight) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      insight.title?.toLowerCase().includes(query) ||
      insight.category?.toLowerCase().includes(query) ||
      insight.author?.name?.toLowerCase().includes(query)
    );
  });

  // Sort filtered insights
  const sortedAndFilteredInsights = [...filteredPendingInsights].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'title':
        aVal = a.title?.toLowerCase() || '';
        bVal = b.title?.toLowerCase() || '';
        break;
      case 'category':
        aVal = a.category?.toLowerCase() || '';
        bVal = b.category?.toLowerCase() || '';
        break;
      case 'author':
        aVal = a.author?.name?.toLowerCase() || '';
        bVal = b.author?.name?.toLowerCase() || '';
        break;
      case 'submittedAt':
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Box>
      {/* Table */}
      <DashboardPanel
        padding={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          p: 0,
        }}
      >
        <DashboardDataGrid
          gridId="pending-approvals"
          rowData={sortedAndFilteredInsights}
          columnDefs={[
            {
              header: '#',
              accessorFn: (row, index) => page * rowsPerPage + index + 1,
              size: 80,
              enableSorting: false,
              Cell: ({ renderedCellValue }) => (
                <Box sx={{ color: colors.textTertiary, fontWeight: 500 }}>{renderedCellValue}</Box>
              ),
            },
            {
              header: 'Title',
              accessorKey: 'title',
              minSize: 320,
              Cell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                    {row.original.title}
                  </Typography>
                  <Chip
                    label={row.original.isEdit ? 'EDITED' : 'NEW'}
                    size="small"
                    sx={{
                      background: row.original.isEdit
                        ? `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`
                        : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: '#F5F5F5',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      height: '20px',
                      boxShadow: `0 2px 6px ${alpha(
                        row.original.isEdit ? colors.primary : '#22c55e',
                        0.2
                      )}`,
                    }}
                  />
                </Box>
              ),
            },
            {
              header: 'Category',
              accessorKey: 'category',
              size: 160,
              Cell: ({ cell }) => (
                <Chip
                  label={cell.getValue()}
                  size="small"
                  sx={{
                    background: alpha(colors.primary, 0.15),
                    color: colors.primary,
                    fontWeight: 600,
                    border: `1px solid ${alpha(colors.primary, 0.3)}`,
                  }}
                />
              ),
            },
            {
              header: 'Author',
              accessorKey: 'author.name',
              size: 160,
              Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {cell.getValue() || 'Unknown'}
                </Typography>
              ),
            },
            {
              header: 'Submitted',
              accessorKey: 'createdAt',
              size: 140,
              Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {new Date(cell.getValue()).toLocaleDateString()}
                </Typography>
              ),
            },
            {
              header: 'Status',
              accessorKey: 'status',
              size: 140,
              Cell: () => (
                <Chip
                  label="Pending"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#F5F5F5',
                    fontWeight: 700,
                    boxShadow: `0 2px 6px ${alpha('#f59e0b', 0.2)}`,
                  }}
                />
              ),
            },
          ]}
          actionColumn={{
            width: 150,
            actions: (insight) => [
              {
                label: 'View',
                icon: <ViewIcon size={18} />,
                onClick: (data) => handleView(data),
                color: colors.textSecondary,
                hoverColor: colors.primary,
                hoverBackground: alpha(colors.primary, 0.15),
              },
              {
                label: 'Approve',
                icon: <ApproveIcon size={18} />,
                onClick: (data) => handleApprovalClick(data, 'approve'),
                color: colors.success,
                hoverBackground: alpha(colors.success, 0.2),
                show: isAdmin,
              },
              {
                label: 'Reject',
                icon: <RejectIcon size={18} />,
                onClick: (data) => handleApprovalClick(data, 'reject'),
                color: colors.error,
                hoverBackground: alpha(colors.error, 0.2),
                show: isAdmin,
              },
            ],
          }}
          serverSidePagination={{
            totalRows: totalCount,
            currentPage: page + 1,
            onPageChange: (newPage) => setPage(newPage - 1),
            onPageSizeChange: (newSize) => setRowsPerPage(newSize),
          }}
          paginationPageSize={rowsPerPage}
          loading={loading}
          rowHeight={72}
        />
      </DashboardPanel>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `2px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            View Insight
            {currentInsight?.isEdit && (
              <Chip
                label="EDITED"
                size="small"
                icon={<CompareIcon size={16} color="#F5F5F5" />}
                sx={{
                  background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
                  color: '#F5F5F5',
                  fontWeight: 700,
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentInsight && (
            <Box sx={{ pt: 1 }}>
              {currentInsight.isEdit &&
                currentInsight.history &&
                currentInsight.history.length > 0 && (
                  <Box sx={{ borderBottom: 1, borderColor: colors.border, mb: 2 }}>
                    <Tabs
                      value={viewTab}
                      onChange={(e, newValue) => setViewTab(newValue)}
                      sx={{
                        '& .MuiTab-root': {
                          color: colors.textSecondary,
                          '&.Mui-selected': {
                            color: colors.primary,
                          },
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: colors.primary,
                        },
                      }}
                    >
                      <Tab label="Current Version" />
                      <Tab label="Compare Changes" />
                    </Tabs>
                  </Box>
                )}

              {viewTab === 0 ? (
                // Current Version Tab
                <Box>
                  <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                    {currentInsight.title}
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Category
                      </Typography>
                      <Chip
                        label={currentInsight.category}
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(
                            colors.primary,
                            0.2
                          )} 0%, ${alpha(colors.primaryDark, 0.1)} 100%)`,
                          color: colors.primary,
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Author
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.text, mt: 0.5 }}>
                        {currentInsight.author?.name || 'Unknown'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2, borderColor: colors.border }} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary, mb: 1, fontWeight: 600 }}
                  >
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: colors.text, mb: 2 }}>
                    {currentInsight.description}
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: colors.border }} />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary, mb: 1, fontWeight: 600 }}
                  >
                    Content Preview
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      maxHeight: 300,
                      overflow: 'auto',
                      p: 2,
                      background: alpha(colors.darker, 0.3),
                      borderRadius: 2,
                    }}
                  >
                    {currentInsight.content}
                  </Typography>
                </Box>
              ) : (
                // Diff View Tab
                <Box sx={{ mt: 2 }}>
                  {currentInsight.history && currentInsight.history.length > 0 ? (
                    <>
                      <Alert
                        severity="info"
                        sx={{
                          mb: 2,
                          backgroundColor: alpha(colors.primary, 0.1),
                          color: colors.primary,
                          '& .MuiAlert-icon': { color: colors.primary },
                          border: `1px solid ${alpha(colors.primary, 0.3)}`,
                        }}
                      >
                        Comparing previous version with current changes
                      </Alert>

                      <Typography
                        variant="subtitle2"
                        sx={{ color: colors.text, mb: 1, fontWeight: 600 }}
                      >
                        Title Changes
                      </Typography>
                      <ReactDiffViewer
                        oldValue={currentInsight.history[0].title}
                        newValue={currentInsight.title}
                        splitView={true}
                        leftTitle="Previous Version"
                        rightTitle="Current Version"
                        styles={{
                          variables: {
                            dark: {
                              diffViewerBackground: colors.cardBg,
                              diffViewerColor: colors.text,
                              addedBackground: alpha(colors.success, 0.15),
                              addedColor: colors.success,
                              removedBackground: alpha(colors.error, 0.15),
                              removedColor: colors.error,
                              wordAddedBackground: alpha(colors.success, 0.25),
                              wordRemovedBackground: alpha(colors.error, 0.25),
                              addedGutterBackground: alpha(colors.success, 0.2),
                              removedGutterBackground: alpha(colors.error, 0.2),
                              gutterBackground: colors.cardBgLight,
                              gutterBackgroundDark: colors.cardBg,
                              highlightBackground: alpha(colors.primary, 0.1),
                              highlightGutterBackground: alpha(colors.primary, 0.2),
                              codeFoldGutterBackground: colors.cardBgLight,
                              codeFoldBackground: colors.cardBg,
                              emptyLineBackground: colors.cardBg,
                              gutterColor: colors.textTertiary,
                              addedGutterColor: colors.success,
                              removedGutterColor: colors.error,
                              codeFoldContentColor: colors.textSecondary,
                              diffViewerTitleBackground: colors.cardBgLight,
                              diffViewerTitleColor: colors.text,
                              diffViewerTitleBorderColor: colors.border,
                            },
                          },
                        }}
                        useDarkTheme={true}
                      />

                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: colors.text,
                          mb: 1,
                          mt: 3,
                          fontWeight: 600,
                        }}
                      >
                        Description Changes
                      </Typography>
                      <ReactDiffViewer
                        oldValue={currentInsight.history[0].description}
                        newValue={currentInsight.description}
                        splitView={true}
                        leftTitle="Previous Version"
                        rightTitle="Current Version"
                        styles={{
                          variables: {
                            dark: {
                              diffViewerBackground: colors.cardBg,
                              diffViewerColor: colors.text,
                              addedBackground: alpha(colors.success, 0.15),
                              addedColor: colors.success,
                              removedBackground: alpha(colors.error, 0.15),
                              removedColor: colors.error,
                              wordAddedBackground: alpha(colors.success, 0.25),
                              wordRemovedBackground: alpha(colors.error, 0.25),
                              addedGutterBackground: alpha(colors.success, 0.2),
                              removedGutterBackground: alpha(colors.error, 0.2),
                              gutterBackground: colors.cardBgLight,
                              gutterBackgroundDark: colors.cardBg,
                              highlightBackground: alpha(colors.primary, 0.1),
                              highlightGutterBackground: alpha(colors.primary, 0.2),
                              codeFoldGutterBackground: colors.cardBgLight,
                              codeFoldBackground: colors.cardBg,
                              emptyLineBackground: colors.cardBg,
                              gutterColor: colors.textTertiary,
                              addedGutterColor: colors.success,
                              removedGutterColor: colors.error,
                              codeFoldContentColor: colors.textSecondary,
                              diffViewerTitleBackground: colors.cardBgLight,
                              diffViewerTitleColor: colors.text,
                              diffViewerTitleBorderColor: colors.border,
                            },
                          },
                        }}
                        useDarkTheme={true}
                      />

                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: colors.text,
                          mb: 1,
                          mt: 3,
                          fontWeight: 600,
                        }}
                      >
                        Content Changes
                      </Typography>
                      <ReactDiffViewer
                        oldValue={currentInsight.history[0].content}
                        newValue={currentInsight.content}
                        splitView={true}
                        leftTitle="Previous Version"
                        rightTitle="Current Version"
                        styles={{
                          variables: {
                            dark: {
                              diffViewerBackground: colors.cardBg,
                              diffViewerColor: colors.text,
                              addedBackground: alpha(colors.success, 0.15),
                              addedColor: colors.success,
                              removedBackground: alpha(colors.error, 0.15),
                              removedColor: colors.error,
                              wordAddedBackground: alpha(colors.success, 0.25),
                              wordRemovedBackground: alpha(colors.error, 0.25),
                              addedGutterBackground: alpha(colors.success, 0.2),
                              removedGutterBackground: alpha(colors.error, 0.2),
                              gutterBackground: colors.cardBgLight,
                              gutterBackgroundDark: colors.cardBg,
                              highlightBackground: alpha(colors.primary, 0.1),
                              highlightGutterBackground: alpha(colors.primary, 0.2),
                              codeFoldGutterBackground: colors.cardBgLight,
                              codeFoldBackground: colors.cardBg,
                              emptyLineBackground: colors.cardBg,
                              gutterColor: colors.textTertiary,
                              addedGutterColor: colors.success,
                              removedGutterColor: colors.error,
                              codeFoldContentColor: colors.textSecondary,
                              diffViewerTitleBackground: colors.cardBgLight,
                              diffViewerTitleColor: colors.text,
                              diffViewerTitleBorderColor: colors.border,
                            },
                          },
                        }}
                        useDarkTheme={true}
                      />
                    </>
                  ) : (
                    <Alert severity="info" sx={{ color: colors.textSecondary }}>
                      No previous version available for comparison
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenViewDialog(false)}
            sx={{
              color: colors.textSecondary,
              '&:hover': { background: alpha(colors.text, 0.05) },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={openApprovalDialog}
        onClose={() => setOpenApprovalDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            // background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.cardBgLight} 100%)`,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>
          {approvalAction === 'approve' ? 'Approve Insight' : 'Reject Insight'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 2 }}>
            {approvalAction === 'approve'
              ? 'Are you sure you want to approve this insight? It will be published to the website.'
              : 'Are you sure you want to reject this insight?'}
          </Typography>
          {approvalAction === 'reject' && (
            <DashboardInput
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason (Optional)"
              labelPlacement="floating"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenApprovalDialog(false)}
            sx={{
              color: colors.textSecondary,
              '&:hover': { background: alpha(colors.text, 0.05) },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproval}
            variant="contained"
            sx={{
              background:
                approvalAction === 'approve'
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#F5F5F5',
              fontWeight: 600,
              px: 3,
              boxShadow: `0 4px 12px ${alpha(
                approvalAction === 'approve' ? '#22c55e' : '#ef4444',
                0.3
              )}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background:
                  approvalAction === 'approve'
                    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(
                  approvalAction === 'approve' ? '#22c55e' : '#ef4444',
                  0.4
                )}`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            {approvalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            background:
              snackbar.severity === 'success'
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#F5F5F5',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(
              snackbar.severity === 'success' ? '#22c55e' : '#ef4444',
              0.3
            )}`,
            '& .MuiAlert-icon': {
              color: '#F5F5F5',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingApproval;
