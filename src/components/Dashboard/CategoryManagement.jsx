import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Typography,
  Alert,
  Snackbar,
  alpha,
} from '@mui/material';
import {
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  CircleCheck as ActiveIcon,
  CircleX as InactiveIcon,
  Tag as CategoryIcon,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { DashboardDataGrid } from './grid';
import { DashboardActionButton, DashboardInput, DashboardPanel } from './shared';
import { isAdmin as checkIsAdmin } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CategoryManagement = ({ user, searchQuery = '', addTrigger = 0 }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const isAdmin = checkIsAdmin(user.role);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open add dialog when parent triggers it
  useEffect(() => {
    if (addTrigger > 0) {
      handleOpenDialog();
    }
  }, [addTrigger]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories?includeInactive=true`);

      if (response.data.success) {
        setCategories(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch categories',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setIsEditing(true);
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setIsEditing(false);
      setCurrentCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/categories/${currentCategory.id}`, formData);
      } else {
        await axios.post(`${API_URL}/categories`, formData);
      }

      // IMMEDIATELY refetch data for real-time updates
      await fetchCategories();

      setSnackbar({
        open: true,
        message: isEditing ? 'Category updated successfully' : 'Category created successfully',
        severity: 'success',
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save category',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await axios.patch(`${API_URL}/categories/${category.id}/toggle-status`, {});

      // IMMEDIATELY refetch data for real-time updates
      await fetchCategories();

      setSnackbar({
        open: true,
        message: `Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error toggling category status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update category status',
        severity: 'error',
      });
    }
  };

  const handleDeleteClick = (category) => {
    setCurrentCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/categories/${currentCategory.id}`);

      // IMMEDIATELY refetch data for real-time updates
      await fetchCategories();

      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success',
      });
      setOpenDeleteDialog(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete category',
        severity: 'error',
      });
    }
  };

  // MRT column definitions
  const columnDefs = useMemo(
    () => [
      {
        header: '#',
        accessorFn: (row, index) => index + 1,
        size: 90,
        enableSorting: false,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ color: colors.textTertiary, fontWeight: 500 }}>{renderedCellValue}</Box>
        ),
      },
      {
        header: 'Category Name',
        accessorKey: 'name',
        minSize: 280,
        enableHiding: false, // Always show name
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
              {row.original.name}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textTertiary, lineHeight: 1.2 }}>
              {row.original.slug}
            </Typography>
          </Box>
        ),
      },
      {
        header: 'Description',
        accessorKey: 'description',
        minSize: 520,
        Cell: ({ cell }) => (
          <Typography sx={{ color: colors.textSecondary }}>{cell.getValue() || '-'}</Typography>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        size: 160,
        filterVariant: 'select',
        filterSelectOptions: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ],
        Cell: ({ cell, row }) => (
          <Chip
            label={cell.getValue() ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              background: cell.getValue()
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : `linear-gradient(135deg, ${colors.textTertiary} 0%, ${alpha(
                    colors.textTertiary,
                    0.8
                  )} 100%)`,
              color: '#F5F5F5',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: '24px',
              boxShadow: cell.getValue() ? `0 2px 6px ${alpha('#22c55e', 0.2)}` : 'none',
            }}
          />
        ),
      },
    ],
    [colors]
  );

  // AG-Grid action column config
  const actionColumn = useMemo(
    () =>
      isAdmin
        ? {
            width: 150,
            actions: (category) => [
              {
                label: category.isActive ? 'Deactivate' : 'Activate',
                icon: category.isActive ? <InactiveIcon size={20} /> : <ActiveIcon size={20} />,
                onClick: (data) => handleToggleStatus(data),
                color: category.isActive ? colors.error : colors.success,
                hoverBackground: alpha(colors.primary, 0.2),
              },
              {
                label: 'Edit',
                icon: <EditIcon size={18} />,
                onClick: (data) => handleOpenDialog(data),
                color: colors.warning,
                hoverBackground: alpha(colors.text, 0.1),
              },
              {
                label: 'Delete',
                icon: <DeleteIcon size={18} />,
                onClick: (data) => handleDeleteClick(data),
                color: colors.textSecondary,
                hoverBackground: alpha('#ef4444', 0.2),
              },
            ],
          }
        : undefined,
    [isAdmin, colors]
  );

  return (
    <Box>
      {/* Categories Table */}
      <DashboardPanel
        padding={0}
        sx={{
          borderRadius: 3,
          p: 0,
        }}
      >
        <DashboardDataGrid
          gridId="category-management"
          rowData={categories}
          globalFilter={searchQuery}
          columnDefs={columnDefs}
          actionColumn={actionColumn}
          loading={loading}
          rowHeight={72}
          emptyMessage={
            categories.length === 0
              ? 'No categories found'
              : 'No categories found matching your filters'
          }
          emptyIcon={<CategoryIcon size={48} color={colors.textTertiary} />}
          getRowId={(row) => row.id}
          pagination
          paginationPageSize={10}
        />
      </DashboardPanel>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
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
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DashboardInput
            fullWidth
            label="Category Name"
            labelPlacement="floating"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            containerSx={{ mt: 1.5 }}
          />
          <DashboardInput
            fullWidth
            label="Description"
            labelPlacement="floating"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            containerSx={{ mt: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: colors.textSecondary,
              '&:hover': {
                background: alpha(colors.textSecondary, 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <DashboardActionButton onClick={handleSubmit} disabled={!formData.name.trim()}>
            {isEditing ? 'Update' : 'Create'}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>Delete Category</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Are you sure you want to delete "{currentCategory?.name}"? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Make sure no insights are using this category before deleting.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              color: colors.textSecondary,
              '&:hover': {
                background: alpha(colors.textSecondary, 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#F5F5F5',
              fontWeight: 600,
              px: 3,
              boxShadow: `0 4px 12px ${alpha('#ef4444', 0.3)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha('#ef4444', 0.4)}`,
              },
              '&:active': {
                transform: 'translateY(0)',
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

export default CategoryManagement;
