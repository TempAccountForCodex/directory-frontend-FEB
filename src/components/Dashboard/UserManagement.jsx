import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Typography,
  Alert,
  Snackbar,
  Pagination,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
  alpha,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  Ban as BlockIcon,
  CircleCheck as ActiveIcon,
  User as PersonIcon,
  ShieldCheck as AdminIcon,
  PenLine as CreatorIcon,
  Crown as SuperAdminIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CreateIcon from '@mui/icons-material/Create';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardActionButton,
  DashboardInput,
  DashboardPanel,
  DashboardRoleSelect,
  DashboardSelect,
  DashboardMetricCard,
  PageHeader,
  DashboardIconButton,
  getTrendProps,
} from './shared';
import { DashboardDataGrid } from './grid';
import RowActionButtonGroup from './shared/RowActionButtonGroup';
import { ROLES, isSuperAdmin as checkIsSuperAdmin } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const UserManagement = ({ user: currentUser, pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [page, setPage] = useState(() => {
    return parseInt(localStorage.getItem('userManagementPage')) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('userManagementRowsPerPage')) || 10;
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    contentCreators: 0,
    blocked: 0,
    trends: {
      total: null,
      admins: null,
      contentCreators: null,
      blocked: null,
    },
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: ROLES.USER,
    blocked: false,
  });

  const isSuperAdmin = checkIsSuperAdmin(currentUser.role);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, rowsPerPage]);

  // Persist rowsPerPage to localStorage
  useEffect(() => {
    localStorage.setItem('userManagementRowsPerPage', rowsPerPage.toString());
  }, [rowsPerPage]);

  // Persist page to localStorage
  useEffect(() => {
    localStorage.setItem('userManagementPage', page.toString());
  }, [page]);

  // Reset to page 1 when rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [rowsPerPage]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/stats`);

      setStats({
        total: response.data.total || 0,
        admins: response.data.admins || 0,
        contentCreators: response.data.contentCreators || 0,
        blocked: response.data.blocked || 0,
        trends: {
          total: response.data.trends?.total ?? null,
          admins: response.data.trends?.admins ?? null,
          contentCreators: response.data.trends?.contentCreators ?? null,
          blocked: response.data.trends?.blocked ?? null,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users?page=${page}&limit=${rowsPerPage}`);

      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      showSnackbar('Failed to fetch users', 'error');
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentEditUser(user);
      setFormData({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role,
        blocked: user.blocked,
      });

      if (user.displayImage) {
        setImagePreview(getImageUrl(user.displayImage));
      } else {
        setImagePreview('');
      }
      setImageFile(null);
    } else {
      setIsEditing(false);
      setCurrentEditUser(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: ROLES.USER,
        blocked: false,
      });
      setImagePreview('');
      setImageFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEditUser(null);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview('');
    setSubmitting(false);
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'blocked' ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size must be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showSnackbar('Please enter a valid email address', 'error');
      return;
    }

    // NOTE: Removed frontend duplicate email check to avoid race conditions
    // Backend will handle duplicate email validation with proper database queries

    // Validate password complexity (only if password is provided)
    if (formData.password) {
      if (formData.password.length < 8) {
        showSnackbar('Password must be at least 8 characters', 'error');
        return;
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        showSnackbar(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'error'
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('email', formData.email);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('blocked', formData.blocked);

      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      if (imageFile) {
        formDataToSend.append('displayImage', imageFile);
      }

      if (isEditing) {
        await axios.put(`${API_URL}/users/${currentEditUser.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(`${API_URL}/users`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // IMMEDIATELY refetch data for real-time updates
      await fetchUsers();
      await fetchStats();

      showSnackbar(
        isEditing ? 'User updated successfully' : 'User created successfully',
        'success'
      );
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar(error.response?.data?.message || 'Failed to save user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (userId, currentBlockedState) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}/block`, { blocked: !currentBlockedState });

      // IMMEDIATELY refetch data for real-time updates
      await fetchUsers();
      await fetchStats();

      showSnackbar(
        `User ${!currentBlockedState ? 'blocked' : 'unblocked'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling block:', error);
      showSnackbar(error.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/users/${currentEditUser.id}`);

      // IMMEDIATELY refetch data for real-time updates
      await fetchUsers();
      await fetchStats();

      showSnackbar('User deleted successfully', 'success');
      setOpenDeleteDialog(false);
      setCurrentEditUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      SUPER_ADMIN: {
        label: 'Super Admin',
        icon: SuperAdminIcon,
        color: colors.primaryLight,
      },
      ADMIN: {
        label: 'Admin',
        icon: AdminIcon,
        color: colors.primary,
      },
      CONTENT_CREATOR: {
        label: 'Content Creator',
        icon: CreatorIcon,
        color: '#f59e0b',
      },
      USER: {
        label: 'User',
        icon: PersonIcon,
        color: '#8b5cf6',
      },
    };

    const config = roleConfig[role] || roleConfig.USER;
    const Icon = config.icon;

    return (
      <Chip
        icon={<Icon size={14} color={config.color} />}
        label={config.label}
        size="small"
        sx={{
          background: alpha(config.color, 0.15),
          color: config.color,
          fontWeight: 700,
          fontSize: '0.65rem',
          height: '24px',
          border: `1px solid ${alpha(config.color, 0.3)}`,
          '& .MuiChip-icon': {
            marginLeft: '4px',
          },
        }}
      />
    );
  };

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter users based on search query, role, and status
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Role filter
    if (roleFilter !== 'All') {
      if (roleFilter === 'Admin' && user.role !== ROLES.ADMIN) return false;
      if (roleFilter === 'Super Admin' && user.role !== ROLES.SUPER_ADMIN) return false;
      if (roleFilter === 'Content Creator' && user.role !== ROLES.CONTENT_CREATOR) return false;
      if (roleFilter === 'User' && user.role !== ROLES.USER) return false;
    }

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active' && user.blocked) return false;
      if (statusFilter === 'Blocked' && !user.blocked) return false;
    }

    return true;
  });

  // Sort filtered users
  const sortedAndFilteredUsers = [...filteredUsers].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'name':
        aVal = a.name?.toLowerCase() || '';
        bVal = b.name?.toLowerCase() || '';
        break;
      case 'username':
        aVal = a.username?.toLowerCase() || '';
        bVal = b.username?.toLowerCase() || '';
        break;
      case 'email':
        aVal = a.email?.toLowerCase() || '';
        bVal = b.email?.toLowerCase() || '';
        break;
      case 'role':
        aVal = a.role?.toLowerCase() || '';
        bVal = b.role?.toLowerCase() || '';
        break;
      case 'createdAt':
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
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      {/* Action Button Row */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <DashboardIconButton
            icon={<AddIcon size={20} />}
            label="Create User"
            tooltip="Create New User"
            variant="filled"
            onClick={() => handleOpenDialog()}
          />
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Total Users"
            value={stats.total}
            icon={PeopleIcon}
            {...getTrendProps(stats.total, stats.trends.total)}
            showProgress={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Admins"
            value={stats.admins}
            icon={AdminPanelSettingsIcon}
            {...getTrendProps(stats.admins, stats.trends.admins)}
            showProgress={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Content Creators"
            value={stats.contentCreators}
            icon={CreateIcon}
            {...getTrendProps(stats.contentCreators, stats.trends.contentCreators)}
            showProgress={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Blocked"
            value={stats.blocked}
            icon={BlockOutlinedIcon}
            {...getTrendProps(stats.blocked, stats.trends.blocked)}
            showProgress={false}
          />
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Stack
        sx={{ mb: 3 }}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
      >
        <Box sx={{ mb: 2, width: { xs: '100%', sm: '100%', md: '500px' } }}>
          <DashboardInput
            fullWidth
            size="small"
            placeholder="Search by name, username, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} color={colors.panelIcon} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.875rem', sm: '0.97rem' },
              },
              '& .MuiOutlinedInput-input': {
                padding: { xs: '8px 8px 8px 0', sm: '10px 10px 10px 0' },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                fontSize: { xs: '0.8125rem', sm: '0.96rem' },
              },
            }}
          />
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row' }}>
          <DashboardSelect
            size="small"
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            containerSx={{ minWidth: { xs: '100%', sm: 180 } }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Super Admin">Super Admin</MenuItem>
            <MenuItem value="Content Creator">Content Creator</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </DashboardSelect>

          <DashboardSelect
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerSx={{ minWidth: { xs: '100%', sm: 180 } }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Blocked">Blocked</MenuItem>
          </DashboardSelect>
        </Box>
      </Stack>

      <DashboardPanel padding={0} sx={{ borderRadius: 3 }}>
        <DashboardDataGrid
          gridId="user-management"
          rowData={sortedAndFilteredUsers}
          columnDefs={[
            {
              header: '#',
              accessorFn: (row, index) => (page - 1) * rowsPerPage + index + 1,
              size: 80,
              enableSorting: false,
              Cell: ({ renderedCellValue }) => (
                <Box sx={{ color: colors.textTertiary, fontWeight: 500 }}>{renderedCellValue}</Box>
              ),
            },
            {
              header: 'User',
              accessorKey: 'name',
              minSize: 220,
              Cell: ({ row }) => (
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={getImageUrl(row.original.displayImage)}
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      border: `2px solid ${alpha(colors.primary, 0.2)}`,
                    }}
                  >
                    {row.original.name?.charAt(0) || <PersonIcon size={20} />}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                      {row.original.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      @{row.original.username}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              header: 'Email',
              accessorKey: 'email',
              minSize: 200,
              Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {cell.getValue()}
                </Typography>
              ),
            },
            {
              header: 'Role',
              accessorKey: 'role',
              size: 160,
              Cell: ({ cell }) => getRoleChip(cell.getValue()),
            },
            {
              header: 'Status',
              accessorKey: 'blocked',
              size: 140,
              Cell: ({ cell }) => (
                <Chip
                  label={cell.getValue() ? 'Blocked' : 'Active'}
                  size="small"
                  sx={{
                    background: cell.getValue()
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#F5F5F5',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: '24px',
                    boxShadow: `0 2px 6px ${alpha(cell.getValue() ? '#ef4444' : '#22c55e', 0.2)}`,
                  }}
                />
              ),
            },
            {
              header: 'Created',
              accessorKey: 'createdAt',
              size: 140,
              Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {new Date(cell.getValue()).toLocaleDateString()}
                </Typography>
              ),
            },
          ]}
          actionColumn={{
            width: 150,
            actions: (user) => [
              {
                label: 'Edit',
                icon: <EditIcon size={18} />,
                onClick: (data) => handleOpenDialog(data),
                color: colors.warning,
                hoverBackground: alpha(colors.text, 0.1),
              },
              {
                label: user.blocked ? 'Unblock' : 'Block',
                icon: <BlockIcon size={18} />,
                onClick: (data) => handleToggleBlock(data.id, data.blocked),
                color: user.blocked ? colors.success : colors.error,
                hoverBackground: alpha(colors.primary, 0.2),
              },
              {
                label: 'Delete',
                icon: <DeleteIcon size={18} />,
                onClick: (data) => {
                  setCurrentEditUser(data);
                  setOpenDeleteDialog(true);
                },
                color: '#ef4444',
                hoverBackground: alpha('#ef4444', 0.2),
                show: isSuperAdmin && user.id !== currentUser.id,
              },
            ],
          }}
          serverSidePagination={{
            totalRows: stats.total,
            currentPage: page,
            onPageChange: (newPage) => setPage(newPage),
            onPageSizeChange: (newSize) => setRowsPerPage(newSize),
          }}
          paginationPageSize={rowsPerPage}
          loading={loading}
          rowHeight={72}
        />
      </DashboardPanel>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 700,
            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          {isEditing ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.border }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <DashboardInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isEditing}
                helperText={isEditing ? 'Email cannot be changed' : 'Enter a valid email address'}
                labelPlacement="floating"
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                labelPlacement="floating"
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                label={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditing}
                helperText={
                  isEditing
                    ? 'Leave blank to keep current password'
                    : '8+ chars with uppercase, lowercase, number, and special character'
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: colors.panelIcon }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                labelPlacement="floating"
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardRoleSelect
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                includeSuperAdmin={isSuperAdmin}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom sx={{ color: colors.textSecondary }}>
                Display Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Avatar
                  src={imagePreview}
                  alt={formData.name}
                  sx={{
                    width: 60,
                    height: 60,
                    border: `2px solid ${colors.primary}`,
                    boxShadow: `0 2px 8px ${alpha(colors.primary, 0.15)}`,
                  }}
                >
                  {formData.name?.charAt(0).toUpperCase()}
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UploadIcon size={18} />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      color: colors.text,
                      borderColor: colors.border,
                      '&:hover': {
                        borderColor: colors.primary,
                        background: alpha(colors.primary, 0.1),
                      },
                    }}
                  >
                    Upload
                  </Button>
                  {imagePreview && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        color: '#ef4444',
                        borderColor: alpha('#ef4444', 0.3),
                        '&:hover': {
                          borderColor: '#ef4444',
                          background: alpha('#ef4444', 0.1),
                        },
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.blocked}
                    onChange={handleInputChange}
                    name="blocked"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#ef4444',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#ef4444',
                      },
                    }}
                  />
                }
                label="Block User"
                sx={{ color: colors.textSecondary }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            background: colors.bgCard,
            borderTop: `1px solid ${colors.border}`,
            p: 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: colors.textSecondary,
              '&:hover': { background: alpha(colors.text, 0.05) },
            }}
          >
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleSubmit}
            disabled={
              submitting || !formData.email || !formData.name || (!isEditing && !formData.password)
            }
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ maxWidth: 220 }}
          >
            {submitting ? 'Processing...' : isEditing ? 'Update User' : 'Create User'}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Are you sure you want to delete user "
            <strong style={{ color: colors.text }}>{currentEditUser?.name}</strong>
            "? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              color: colors.textSecondary,
              '&:hover': { background: alpha(colors.text, 0.05) },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#F5F5F5',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha('#ef4444', 0.3)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: `0 6px 20px ${alpha('#ef4444', 0.4)}`,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default UserManagement;
