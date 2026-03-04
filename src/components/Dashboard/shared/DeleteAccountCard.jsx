import { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  alpha,
  Divider,
} from '@mui/material';
import { TriangleAlert } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import DashboardConfirmButton from './DashboardConfirmButton';
import DashboardCancelButton from './DashboardCancelButton';

const DeleteAccountCard = ({ onDelete, loading = false }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    onDelete();
    handleClose();
  };

  return (
    <>
      <DashboardCard icon={TriangleAlert} title="Delete account">
        <Divider sx={{ mb: 1, opacity: 0.8 }} />
        <Typography
          variant="body2"
          sx={{
            color: colors.text,
            mb: 3,
            fontSize: '0.9rem',
            opacity: 0.9,
          }}
        >
          Delete your account and all of your source data. This is irreversible.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DashboardConfirmButton
            onClick={handleOpen}
            sx={{
              background: 'transparent',
              color: colors.error,
              border: `1px solid ${alpha(colors.error, 0.4)}`,
              boxShadow: 'none',
              bordderRadius: 20,
              px: 3,
              '&:hover': {
                background: alpha(colors.error, 0.05),
                border: `1px solid ${colors.error}`,
                boxShadow: `0 4px 12px ${alpha(colors.error, 0.1)}`,
              },
            }}
          >
            Delete account
          </DashboardConfirmButton>
        </Box>
      </DashboardCard>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Are you sure you want to delete your account? This action is permanent and cannot be
            undone. All your data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton onClick={handleClose} disabled={loading}>
            Cancel
          </DashboardCancelButton>
          <DashboardConfirmButton onClick={handleConfirm} disabled={loading} tone="danger">
            {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Delete Account'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteAccountCard;
