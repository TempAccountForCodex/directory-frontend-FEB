import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Avatar, Button, alpha, Divider } from '@mui/material';
import { CircleUser, Camera, Trash2 } from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { DashboardCard, DashboardInput } from './shared';
import DashboardActionButton from './shared/DashboardActionButton';
import DashboardCancelButton from './shared/DashboardCancelButton';
import { Link } from 'react-router-dom';

const BasicDetailsCard = ({ user, onSave, onCancel, loading }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    biography: '',
    displayImage: null,
  });
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        title: user.title || '',
        biography: user.biography || '',
        displayImage: null,
      });
      if (user.displayImage) {
        setPreviewImage(getImageUrl(user.displayImage));
      } else {
        setPreviewImage('');
      }
    }
  }, [user]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        displayImage: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      displayImage: 'remove', // Special value to indicate removal
    }));
    setPreviewImage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DashboardCard icon={CircleUser} title="Basic details">
      <Divider sx={{ mb: 1, opacity: 0.8 }} />
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              position: 'relative',
              width: 100,
              height: 100,
              borderRadius: '50%',
              overflow: 'hidden',
              '&:hover .avatar-overlay': {
                opacity: 1,
              },
            }}
          >
            <Avatar
              src={previewImage}
              alt={user?.name}
              sx={{
                width: '100%',
                height: '100%',
                border: `2px solid ${isDark ? alpha(colors.text, 0.1) : alpha(colors.primary, 0.1)}`,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box
              className="avatar-overlay"
              component="label"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: alpha('#000', 0.5),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                color: '#fff',
                fontSize: '0.75rem',
                gap: 0.5,
              }}
            >
              <Camera size={20} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Select
              </Typography>
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Box>
          </Box>

          <Button
            variant="text"
            onClick={handleRemoveImage}
            sx={{
              color: colors.textSecondary,
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              '&:hover': {
                color: colors.error || '#ef4444',
                background: 'transparent',
              },
            }}
          >
            Remove
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DashboardInput
            label="Full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            fullWidth
            inputSize="sm"
            size="small"
          />

          <Box>
            <DashboardInput
              label="Email address"
              value={user?.email || ''}
              disabled
              fullWidth
              inputSize="sm"
              size="small"
            />
            <Typography
              variant="caption"
              sx={{ mt: 1, display: 'block', color: colors.textSecondary }}
            >
              Click{' '}
              <Box
                component={Link}
                to="/dashboard/settings/security"
                sx={{
                  color: colors.primary,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                here
              </Box>{' '}
              to change your email
            </Typography>
          </Box>

          <DashboardInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g Python Developer"
            fullWidth
            inputSize="sm"
            size="small"
          />

          <Box>
            <DashboardInput
              label="Biography (optional)"
              name="biography"
              value={formData.biography}
              onChange={handleChange}
              placeholder="Describe yourself..."
              multiline
              rows={3}
              fullWidth
              inputProps={{ maxLength: 200 }}
              inputSize="sm"
              size="small"
            />
            <Typography
              variant="caption"
              sx={{ mt: 1, display: 'block', color: colors.textSecondary, textAlign: 'right' }}
            >
              {formData.biography.length}/200 characters
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <DashboardCancelButton onClick={onCancel} disabled={loading}>
            Cancel
          </DashboardCancelButton>
          <DashboardActionButton
            type="submit"
            disabled={loading}
            sx={{
              px: 3,
            }}
          >
            {loading ? 'Updating...' : 'Save changes'}
          </DashboardActionButton>
        </Box>
      </form>
    </DashboardCard>
  );
};

export default BasicDetailsCard;
