import { memo, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Alert,
  Skeleton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Save, Settings, Trash2, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { DashboardCard } from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';
import DashboardCancelButton from '../shared/DashboardCancelButton';
import DashboardConfirmButton from '../shared/DashboardConfirmButton';
import DashboardInput from '../shared/DashboardInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public — Anyone can view your website' },
  { value: 'private', label: 'Private — Only team members can view' },
  { value: 'password', label: 'Password Protected — Requires a password' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ar', label: 'Arabic' },
];

const SettingsTab = memo(({ website, websiteId, onSaved, onDeleted, currentUserRole }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  const [name, setName] = useState(website?.name || '');
  const [visibility, setVisibility] = useState(website?.visibility || 'public');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState(website?.language || 'en');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);

  // Delete — two-step
  const [deleteStep, setDeleteStep] = useState(0); // 0=closed, 1=confirm, 2=type name
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Sync from website prop
  useEffect(() => {
    if (website) {
      setName(website.name || '');
      setVisibility(website.visibility || 'public');
      setLanguage(website.language || 'en');
    }
  }, [website?.id]);

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError('Website name is required.');
      return;
    }
    try {
      setSaving(true);
      setSaveError(null);
      // Backend PUT /api/websites/:id only accepts: name, primaryColor, secondaryColor,
      // headingTextColor, bodyTextColor, logoUrl, faviconUrl, metaTitle, metaDescription.
      // TODO: visibility, language, and password are not yet supported by the backend.
      // These fields are rendered in the UI but will be silently ignored until backend support is added.
      const payload = {
        name: name.trim(),
      };
      const res = await axios.put(`${API_URL}/websites/${websiteId}`, payload);
      if (onSaved) onSaved(res.data?.data || res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    // TODO: Backend does not have a dedicated archive endpoint. Using soft-delete
    // (DELETE /api/websites/:id) as the closest equivalent. The website can be restored
    // via POST /api/websites/:id/restore. A proper ARCHIVED status requires backend changes.
    try {
      setArchiveLoading(true);
      await axios.delete(`${API_URL}/websites/${websiteId}`);
      if (onSaved) onSaved({ ...website, status: 'ARCHIVED' });
      setArchiveDialogOpen(false);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to archive website.');
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await axios.delete(`${API_URL}/websites/${websiteId}`);
      if (onDeleted) onDeleted();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete website.');
      setDeleteLoading(false);
    }
  };

  if (!website) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully.
        </Alert>
      )}

      {/* General settings */}
      <DashboardCard icon={Settings} title="General Settings" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Website name */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>
              Website Name
            </Typography>
            <DashboardInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              inputProps={{ 'aria-label': 'Website name', maxLength: 100 }}
            />
          </Box>

          {/* Visibility — Coming soon */}
          <Box sx={{ opacity: 0.6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>
              Visibility
            </Typography>
            <FormControl fullWidth disabled>
              <Select
                value={visibility}
                inputProps={{ 'aria-label': 'Website visibility selector' }}
              >
                {VISIBILITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
              Visibility controls coming soon
            </Typography>
          </Box>

          {/* Language — Coming soon */}
          <Box sx={{ opacity: 0.6 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>
              Language / Locale
            </Typography>
            <FormControl fullWidth disabled>
              <Select
                value={language}
                inputProps={{ 'aria-label': 'Language/locale selector' }}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
              Language settings coming soon
            </Typography>
          </Box>
        </Box>
      </DashboardCard>

      {/* Save button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <DashboardGradientButton
          startIcon={<Save size={16} />}
          onClick={handleSave}
          disabled={saving}
          aria-label="Save website settings"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </DashboardGradientButton>
      </Box>

      {/* Danger Zone */}
      <DashboardCard
        icon={Trash2}
        title="Danger Zone"
        sx={{
          borderColor: 'error.main',
          border: `2px solid`,
          borderRadius: '18px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Archive */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              pb: 2,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Archive Website
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Archive Website (soft-delete — can be restored later)
              </Typography>
            </Box>
            <DashboardActionButton
              startIcon={<Archive size={16} />}
              onClick={() => setArchiveDialogOpen(true)}
              variant="outlined"
              color="warning"
              disabled={website.status === 'ARCHIVED'}
              aria-label="Archive this website"
            >
              {website.status === 'ARCHIVED' ? 'Already Archived' : 'Archive Website'}
            </DashboardActionButton>
          </Box>

          {/* Delete */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                Permanent Removal
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Permanently delete this website and all its content. This cannot be undone.
              </Typography>
            </Box>
            <DashboardActionButton
              startIcon={<Trash2 size={16} />}
              onClick={() => setDeleteStep(1)}
              variant="outlined"
              color="error"
              aria-label="Delete this website"
            >
              Delete Website
            </DashboardActionButton>
          </Box>
        </Box>
      </DashboardCard>

      {/* Archive dialog */}
      <Dialog
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Archive Website</DialogTitle>
        <DialogContent>
          Are you sure you want to archive "{website.name}"? The website will be hidden from your
          active list but all content is preserved.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton onClick={() => setArchiveDialogOpen(false)} />
          <DashboardActionButton
            onClick={handleArchive}
            color="warning"
            variant="contained"
            disabled={archiveLoading}
            aria-label="Confirm archive website"
          >
            {archiveLoading ? 'Archiving...' : 'Archive'}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Delete step 1 — Are you sure? */}
      <Dialog
        open={deleteStep === 1}
        onClose={() => setDeleteStep(0)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Website</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is permanent and cannot be undone.
          </Alert>
          Are you sure you want to permanently delete "{website.name}" and all its content?
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton onClick={() => setDeleteStep(0)} />
          <DashboardConfirmButton
            onClick={() => setDeleteStep(2)}
            color="error"
            aria-label="Proceed to final delete confirmation"
          >
            Yes, Delete
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>

      {/* Delete step 2 — Type website name */}
      <Dialog
        open={deleteStep === 2}
        onClose={() => {
          setDeleteStep(0);
          setDeleteConfirmText('');
          setDeleteError(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Permanent Deletion</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Alert severity="error" sx={{ mb: 2 }}>
            This is irreversible. All pages, blocks, media, and settings will be permanently lost.
          </Alert>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Type{' '}
            <Box component="code" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {website.name}
            </Box>{' '}
            to confirm:
          </Typography>
          <DashboardInput
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            fullWidth
            autoFocus
            placeholder={website.name}
            inputProps={{ 'aria-label': 'Type website name to confirm deletion' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <DashboardCancelButton
            onClick={() => {
              setDeleteStep(0);
              setDeleteConfirmText('');
              setDeleteError(null);
            }}
          />
          <DashboardConfirmButton
            onClick={handleDelete}
            color="error"
            disabled={deleteConfirmText !== website.name || deleteLoading}
            aria-label="Permanently delete website"
          >
            {deleteLoading ? 'Deleting...' : 'Delete Forever'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

SettingsTab.displayName = 'SettingsTab';

export default SettingsTab;
