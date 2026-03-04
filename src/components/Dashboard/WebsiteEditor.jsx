import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  House,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { DashboardInput, DashboardSelect } from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BLOCK_TYPES = ['HERO', 'FEATURES', 'TESTIMONIALS', 'CTA', 'CONTACT'];

const WebsiteEditor = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [website, setWebsite] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialogs
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);

  // Forms
  const [pageForm, setPageForm] = useState({
    title: '',
    path: '',
    isHome: false,
    isPublished: true,
  });
  const [blockForm, setBlockForm] = useState({ blockType: '', content: {} });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (websiteId) {
      fetchWebsiteData();
    }
  }, [websiteId]);

  useEffect(() => {
    if (selectedPage) {
      fetchBlocks(selectedPage.id);
    } else {
      setBlocks([]);
    }
  }, [selectedPage]);

  const fetchWebsiteData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch website details
      const websiteRes = await axios.get(`${API_URL}/websites/${websiteId}`, {
        headers: {},
      });
      setWebsite(websiteRes.data.data);

      // Fetch pages
      const pagesRes = await axios.get(`${API_URL}/websites/${websiteId}/pages`, {
        headers: {},
      });
      const pagesList = pagesRes.data.data || [];
      setPages(pagesList);

      // Auto-select home page or first page
      const homePage = pagesList.find((p) => p.isHome) || pagesList[0];
      if (homePage) {
        setSelectedPage(homePage);
      }
    } catch (err) {
      console.error('Error fetching website data:', err);
      setError(err.response?.data?.message || 'Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (pageId) => {
    try {
      const response = await axios.get(`${API_URL}/pages/${pageId}/blocks`, {
        headers: {},
      });
      setBlocks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching blocks:', err);
    }
  };

  const handleCreatePage = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      const response = await axios.post(`${API_URL}/websites/${websiteId}/pages`, pageForm, {
        headers: {},
      });

      const newPage = response.data.data;
      setPages([...pages, newPage]);
      setPageDialogOpen(false);
      setPageForm({ title: '', path: '', isHome: false, isPublished: true });

      // Select the new page
      setSelectedPage(newPage);
    } catch (err) {
      console.error('Error creating page:', err);
      setFormError(err.response?.data?.message || 'Failed to create page');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Are you sure you want to delete this page? This will also delete all blocks.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/pages/${pageId}`, {
        headers: {},
      });

      const updatedPages = pages.filter((p) => p.id !== pageId);
      setPages(updatedPages);

      // Select another page if current page was deleted
      if (selectedPage?.id === pageId) {
        setSelectedPage(updatedPages[0] || null);
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      alert(err.response?.data?.message || 'Failed to delete page');
    }
  };

  const handleSetHomePage = async (pageId) => {
    try {
      await axios.put(`${API_URL}/pages/${pageId}`, { isHome: true }, { headers: {} });

      // Update pages state
      const updatedPages = pages.map((p) => ({ ...p, isHome: p.id === pageId }));
      setPages(updatedPages);
      setSelectedPage(updatedPages.find((p) => p.id === pageId));
    } catch (err) {
      console.error('Error setting home page:', err);
      alert(err.response?.data?.message || 'Failed to set home page');
    }
  };

  const handleCreateBlock = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      // Validate content based on blockType
      const validatedContent = validateBlockContent(blockForm.blockType, blockForm.content);
      if (!validatedContent.valid) {
        setFormError(validatedContent.error);
        setSubmitting(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/pages/${selectedPage.id}/blocks`,
        {
          blockType: blockForm.blockType,
          content: blockForm.content,
          isVisible: true,
        },
        { headers: {} }
      );

      setBlocks([...blocks, response.data.data]);
      setBlockDialogOpen(false);
      setBlockForm({ blockType: '', content: {} });
    } catch (err) {
      console.error('Error creating block:', err);
      setFormError(err.response?.data?.message || 'Failed to create block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBlock = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      const response = await axios.put(
        `${API_URL}/blocks/${editingBlock.id}`,
        { content: blockForm.content },
        { headers: {} }
      );

      setBlocks(blocks.map((b) => (b.id === editingBlock.id ? response.data.data : b)));
      setEditingBlock(null);
      setBlockForm({ blockType: '', content: {} });
    } catch (err) {
      console.error('Error updating block:', err);
      setFormError(err.response?.data?.message || 'Failed to update block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!confirm('Are you sure you want to delete this block?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/blocks/${blockId}`, {
        headers: {},
      });

      setBlocks(blocks.filter((b) => b.id !== blockId));
    } catch (err) {
      console.error('Error deleting block:', err);
      alert(err.response?.data?.message || 'Failed to delete block');
    }
  };

  const handleToggleBlockVisibility = async (block) => {
    try {
      const response = await axios.put(
        `${API_URL}/blocks/${block.id}`,
        { isVisible: !block.isVisible },
        { headers: {} }
      );

      setBlocks(blocks.map((b) => (b.id === block.id ? response.data.data : b)));
    } catch (err) {
      console.error('Error toggling block visibility:', err);
      alert('Failed to update block visibility');
    }
  };

  const handleMoveBlock = async (blockId, direction) => {
    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    if (
      (direction === 'up' && blockIndex === 0) ||
      (direction === 'down' && blockIndex === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    [newBlocks[blockIndex], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[blockIndex],
    ];

    try {
      await axios.put(
        `${API_URL}/blocks/reorder`,
        {
          blockIds: newBlocks.map((b) => b.id),
        },
        { headers: {} }
      );

      // Update sortOrder in local state
      setBlocks(newBlocks.map((b, idx) => ({ ...b, sortOrder: idx })));
    } catch (err) {
      console.error('Error reordering blocks:', err);
      alert('Failed to reorder blocks');
    }
  };

  const validateBlockContent = (blockType, content) => {
    switch (blockType) {
      case 'HERO':
        if (!content.heading) {
          return { valid: false, error: 'HERO block requires a heading' };
        }
        break;
      case 'CTA':
        if (!content.heading || !content.ctaText || !content.ctaLink) {
          return { valid: false, error: 'CTA block requires heading, ctaText, and ctaLink' };
        }
        break;
      case 'FEATURES':
        if (
          !content.features ||
          !Array.isArray(content.features) ||
          content.features.length === 0
        ) {
          return { valid: false, error: 'FEATURES block requires at least one feature' };
        }
        break;
      case 'TESTIMONIALS':
        if (
          !content.testimonials ||
          !Array.isArray(content.testimonials) ||
          content.testimonials.length === 0
        ) {
          return { valid: false, error: 'TESTIMONIALS block requires at least one testimonial' };
        }
        break;
    }
    return { valid: true };
  };

  const getBlockContentPreview = (block) => {
    const content = block.content || {};
    const truncate = (str, maxLen = 40) => {
      if (!str) return '';
      return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
    };

    switch (block.blockType) {
      case 'HERO':
        return content.heading ? `HERO – ${truncate(content.heading)}` : 'HERO – (no heading)';
      case 'CTA':
        return content.heading ? `CTA – ${truncate(content.heading)}` : 'CTA – (no heading)';
      case 'FEATURES':
        const featCount = content.features?.length || 0;
        return `FEATURES – ${featCount} feature${featCount !== 1 ? 's' : ''}`;
      case 'TESTIMONIALS':
        const testCount = content.testimonials?.length || 0;
        return `TESTIMONIALS – ${testCount} testimonial${testCount !== 1 ? 's' : ''}`;
      case 'CONTACT':
        const parts = [];
        if (content.email) parts.push('email');
        if (content.phone) parts.push('phone');
        if (content.address) parts.push('address');
        if (content.showForm) parts.push('form');
        return `CONTACT – ${parts.length > 0 ? parts.join(', ') : 'empty'}`;
      default:
        return block.blockType;
    }
  };

  const renderBlockForm = () => {
    const blockType = blockForm.blockType || editingBlock?.blockType;
    const content = blockForm.content;

    switch (blockType) {
      case 'HERO':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading *"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Main headline text (required)"
            />
            <DashboardInput
              fullWidth
              label="Subheading"
              labelPlacement="floating"
              value={content.subheading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, subheading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Supporting text (optional)"
            />
            <DashboardInput
              fullWidth
              label="CTA Text"
              labelPlacement="floating"
              value={content.ctaText || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaText: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button text (optional)"
            />
            <DashboardInput
              fullWidth
              label="CTA Link"
              labelPlacement="floating"
              value={content.ctaLink || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaLink: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button URL (optional)"
            />
            <DashboardInput
              fullWidth
              label="Background Image URL"
              labelPlacement="floating"
              value={content.backgroundImage || ''}
              onChange={(e) =>
                setBlockForm({
                  ...blockForm,
                  content: { ...content, backgroundImage: e.target.value },
                })
              }
              sx={{ mb: 2 }}
              helperText="Image URL for background (optional)"
            />
            <DashboardSelect
              fullWidth
              label="Alignment"
              value={content.alignment || 'center'}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, alignment: e.target.value } })
              }
              containerSx={{ mb: 2 }}
            >
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </DashboardSelect>
          </>
        );
      case 'CTA':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading *"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Call to action headline (required)"
            />
            <DashboardInput
              fullWidth
              label="Subheading"
              labelPlacement="floating"
              value={content.subheading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, subheading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Supporting text (optional)"
            />
            <DashboardInput
              fullWidth
              label="CTA Button Text *"
              labelPlacement="floating"
              value={content.ctaText || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaText: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button text (required)"
            />
            <DashboardInput
              fullWidth
              label="CTA Link *"
              labelPlacement="floating"
              value={content.ctaLink || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, ctaLink: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Button URL (required)"
            />
            <DashboardInput
              fullWidth
              label="Background Image URL"
              labelPlacement="floating"
              value={content.backgroundImage || ''}
              onChange={(e) =>
                setBlockForm({
                  ...blockForm,
                  content: { ...content, backgroundImage: e.target.value },
                })
              }
              helperText="Image URL for background (optional)"
            />
          </>
        );
      case 'FEATURES':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Section heading (optional)"
            />
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text }}>
              Features
            </Typography>
            {(content.features || []).map((feature, index) => (
              <Card key={index} sx={{ mb: 2, p: 2, bgcolor: alpha(colors.dark, 0.3) }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Feature {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newFeatures = content.features.filter((_, i) => i !== index);
                      setBlockForm({
                        ...blockForm,
                        content: { ...content, features: newFeatures },
                      });
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
                <DashboardInput
                  fullWidth
                  label="Icon"
                  labelPlacement="floating"
                  value={feature.icon || ''}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[index] = { ...feature, icon: e.target.value };
                    setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                  helperText="Icon name or URL"
                />
                <DashboardInput
                  fullWidth
                  label="Title *"
                  labelPlacement="floating"
                  value={feature.title || ''}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[index] = { ...feature, title: e.target.value };
                    setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <DashboardInput
                  fullWidth
                  label="Description *"
                  labelPlacement="floating"
                  value={feature.description || ''}
                  onChange={(e) => {
                    const newFeatures = [...content.features];
                    newFeatures[index] = { ...feature, description: e.target.value };
                    setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
                  }}
                  multiline
                  rows={2}
                  size="small"
                />
              </Card>
            ))}
            <Button
              startIcon={<Plus size={18} />}
              onClick={() => {
                const newFeatures = [
                  ...(content.features || []),
                  { icon: '', title: '', description: '' },
                ];
                setBlockForm({ ...blockForm, content: { ...content, features: newFeatures } });
              }}
              sx={{ textTransform: 'none' }}
            >
              Add Feature
            </Button>
          </>
        );
      case 'TESTIMONIALS':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Section heading (optional)"
            />
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text }}>
              Testimonials
            </Typography>
            {(content.testimonials || []).map((testimonial, index) => (
              <Card key={index} sx={{ mb: 2, p: 2, bgcolor: alpha(colors.dark, 0.3) }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Testimonial {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newTestimonials = content.testimonials.filter((_, i) => i !== index);
                      setBlockForm({
                        ...blockForm,
                        content: { ...content, testimonials: newTestimonials },
                      });
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
                <DashboardInput
                  fullWidth
                  label="Quote *"
                  labelPlacement="floating"
                  value={testimonial.quote || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, quote: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  sx={{ mb: 1 }}
                  multiline
                  rows={2}
                  size="small"
                />
                <DashboardInput
                  fullWidth
                  label="Author *"
                  labelPlacement="floating"
                  value={testimonial.author || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, author: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <DashboardInput
                  fullWidth
                  label="Position"
                  labelPlacement="floating"
                  value={testimonial.position || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, position: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  sx={{ mb: 1 }}
                  size="small"
                  helperText="Job title / company"
                />
                <DashboardInput
                  fullWidth
                  label="Avatar URL"
                  labelPlacement="floating"
                  value={testimonial.avatarUrl || ''}
                  onChange={(e) => {
                    const newTestimonials = [...content.testimonials];
                    newTestimonials[index] = { ...testimonial, avatarUrl: e.target.value };
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, testimonials: newTestimonials },
                    });
                  }}
                  size="small"
                  helperText="Photo URL"
                />
              </Card>
            ))}
            <Button
              startIcon={<Plus size={18} />}
              onClick={() => {
                const newTestimonials = [
                  ...(content.testimonials || []),
                  { quote: '', author: '', position: '', avatarUrl: '' },
                ];
                setBlockForm({
                  ...blockForm,
                  content: { ...content, testimonials: newTestimonials },
                });
              }}
              sx={{ textTransform: 'none' }}
            >
              Add Testimonial
            </Button>
          </>
        );
      case 'CONTACT':
        return (
          <>
            <DashboardInput
              fullWidth
              label="Heading"
              labelPlacement="floating"
              value={content.heading || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, heading: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Contact section heading (optional)"
            />
            <DashboardInput
              fullWidth
              label="Email"
              labelPlacement="floating"
              value={content.email || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, email: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Contact email (optional)"
            />
            <DashboardInput
              fullWidth
              label="Phone"
              labelPlacement="floating"
              value={content.phone || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, phone: e.target.value } })
              }
              sx={{ mb: 2 }}
              helperText="Contact phone (optional)"
            />
            <DashboardInput
              fullWidth
              label="Address"
              labelPlacement="floating"
              value={content.address || ''}
              onChange={(e) =>
                setBlockForm({ ...blockForm, content: { ...content, address: e.target.value } })
              }
              sx={{ mb: 2 }}
              multiline
              rows={2}
              helperText="Physical address (optional)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={content.showForm || false}
                  onChange={(e) =>
                    setBlockForm({
                      ...blockForm,
                      content: { ...content, showForm: e.target.checked },
                    })
                  }
                />
              }
              label="Show contact form"
            />
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 }, pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/dashboard?tab=websites')}>
            <ArrowLeft size={18} />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 700 }}>
              {website?.name}
            </Typography>
            <Box display="flex" gap={1} mt={0.5}>
              <Chip label={website?.status} size="small" />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                /s/{website?.slug}
              </Typography>
            </Box>
          </Box>
        </Box>

        {website?.status === 'PUBLISHED' && (
          <Button
            variant="outlined"
            startIcon={<Eye size={18} />}
            onClick={() => window.open(`/s/${website?.slug}`, '_blank')}
            sx={{ textTransform: 'none' }}
          >
            View Live
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Pages Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: alpha(colors.dark, 0.5), borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                Pages
              </Typography>
              <IconButton size="small" onClick={() => setPageDialogOpen(true)}>
                <Plus size={18} />
              </IconButton>
            </Box>

            <List dense>
              {pages.map((page) => (
                <ListItem
                  key={page.id}
                  button
                  selected={selectedPage?.id === page.id}
                  onClick={() => setSelectedPage(page)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(colors.primary, 0.2),
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {page.isHome && <House size={16} />}
                        <Typography variant="body2">{page.title}</Typography>
                      </Box>
                    }
                    secondary={page.path}
                  />
                  <ListItemSecondaryAction>
                    {!page.isHome && (
                      <>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => handleSetHomePage(page.id)}
                          title="Set as home"
                        >
                          <House size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Blocks & Preview */}
        <Grid item xs={12} md={9}>
          {selectedPage ? (
            <Grid container spacing={3}>
              {/* Blocks List */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2, bgcolor: alpha(colors.dark, 0.5), borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                      Blocks
                    </Typography>
                    <IconButton size="small" onClick={() => setBlockDialogOpen(true)}>
                      <Plus size={18} />
                    </IconButton>
                  </Box>

                  {blocks.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: colors.textSecondary, textAlign: 'center', py: 4 }}
                    >
                      No blocks yet. Add your first block!
                    </Typography>
                  ) : (
                    <List dense>
                      {blocks.map((block, index) => (
                        <ListItem
                          key={block.id}
                          sx={{
                            border: `1px solid ${alpha(colors.primary, block.isVisible ? 0.2 : 0.1)}`,
                            borderRadius: 1,
                            mb: 1,
                            opacity: block.isVisible ? 1 : 0.5,
                            bgcolor: block.isVisible ? 'transparent' : alpha(colors.dark, 0.3),
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" fontWeight={600}>
                                  {block.blockType}
                                </Typography>
                                {!block.isVisible && (
                                  <Chip
                                    label="Hidden"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      bgcolor: alpha(colors.textSecondary, 0.2),
                                      color: colors.textSecondary,
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={getBlockContentPreview(block)}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveBlock(block.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveBlock(block.id, 'down')}
                              disabled={index === blocks.length - 1}
                            >
                              <ArrowDown size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingBlock(block);
                                setBlockForm({
                                  blockType: block.blockType,
                                  content: block.content,
                                });
                              }}
                            >
                              <Pencil size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleBlockVisibility(block)}
                            >
                              <Eye size={16} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteBlock(block.id)}>
                              <Trash2 size={16} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>

              {/* Preview */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, bgcolor: alpha(colors.dark, 0.5), borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                      Preview
                    </Typography>
                    <IconButton size="small" onClick={() => fetchBlocks(selectedPage.id)}>
                      <RefreshCw size={18} />
                    </IconButton>
                  </Box>

                  {website?.status === 'PUBLISHED' && selectedPage?.isPublished ? (
                    <Box
                      sx={{
                        width: '100%',
                        height: '600px',
                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <iframe
                        src={`/s/${website.slug}${selectedPage.path}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                        title="Website Preview"
                      />
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Preview not available. Publish the website and page to see live preview.
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography
              variant="body1"
              sx={{ color: colors.textSecondary, textAlign: 'center', py: 8 }}
            >
              Select or create a page to get started
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Create Page Dialog */}
      <Dialog
        open={pageDialogOpen}
        onClose={() => !submitting && setPageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: colors.bgDefault, color: colors.text }}>
          Create Page
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.bgDefault, pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <DashboardInput
            fullWidth
            label="Title"
            labelPlacement="floating"
            value={pageForm.title}
            onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />

          <DashboardInput
            fullWidth
            label="Path"
            labelPlacement="floating"
            value={pageForm.path}
            onChange={(e) => setPageForm({ ...pageForm, path: e.target.value })}
            helperText="Must start with / (example: /about)"
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={pageForm.isHome}
                onChange={(e) => setPageForm({ ...pageForm, isHome: e.target.checked })}
              />
            }
            label="Set as home page"
          />
        </DialogContent>

        <DialogActions sx={{ bgcolor: colors.bgDefault, px: 3, pb: 2 }}>
          <Button onClick={() => setPageDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePage}
            variant="contained"
            disabled={submitting || !pageForm.title || !pageForm.path}
          >
            {submitting ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Block Dialog */}
      <Dialog
        open={blockDialogOpen || !!editingBlock}
        onClose={() => {
          if (!submitting) {
            setBlockDialogOpen(false);
            setEditingBlock(null);
            setBlockForm({ blockType: '', content: {} });
            setFormError(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: colors.bgDefault, color: colors.text }}>
          {editingBlock ? 'Edit Block' : 'Add Block'}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: colors.bgDefault, pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {!editingBlock && (
            <DashboardSelect
              fullWidth
              label="Block Type"
              value={blockForm.blockType}
              onChange={(e) =>
                setBlockForm({ ...blockForm, blockType: e.target.value, content: {} })
              }
              containerSx={{ mb: 3 }}
            >
              {BLOCK_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </DashboardSelect>
          )}

          {(blockForm.blockType || editingBlock) && renderBlockForm()}
        </DialogContent>

        <DialogActions sx={{ bgcolor: colors.bgDefault, px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setBlockDialogOpen(false);
              setEditingBlock(null);
              setBlockForm({ blockType: '', content: {} });
              setFormError(null);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={editingBlock ? handleUpdateBlock : handleCreateBlock}
            variant="contained"
            disabled={submitting || (!editingBlock && !blockForm.blockType)}
          >
            {submitting ? <CircularProgress size={24} /> : editingBlock ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WebsiteEditor;
