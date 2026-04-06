/**
 * WebsiteManageInsights
 *
 * Dashboard component for managing website blog posts.
 * Step 2.24A — Website Blog Management Dashboard
 *
 * Forked from ManageInsights.jsx. Key differences:
 * - Uses useParams() to extract websiteId
 * - No approval workflow (no openApprovalDialog, approvalData, handleApproval)
 * - No project management (no projects state, fetchProjects, project dropdown)
 * - No PendingApproval subtab — only "posts" and "categories"
 * - MUI Switch toggle in status column (DRAFT ↔ APPROVED)
 * - Author-scoped API calls: all GET /api/blogs calls include ?authorId={user.id}
 * - Stats from /api/blogs/my-stats (author-scoped, no requireAdmin)
 * - localStorage keys use 'websiteBlogPosts' prefix
 * - URL navigation uses /dashboard/websites/:websiteId/blog/:subtab
 * - Preview button opens public website blog URL
 * - Enhanced empty state with first-time guidance CTA
 * - Draft count badge near Posts tab label
 * - Category quick-create inline in create/edit dialog
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
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
  Grid,
  Card,
  CardContent,
  Tooltip,
  ButtonGroup,
  Divider,
  CardMedia,
  alpha,
  InputAdornment,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import {
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  Eye as ViewIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as BulletIcon,
  ListOrdered as NumberedIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  X as CloseIcon,
  CirclePlus as AddSubsectionIcon,
  FileText as ArticleIcon,
  FilePlus as NewInsightIcon,
  FolderPlus as NewCategoryIcon,
  Tag as CategoryIcon,
  Search as SearchIcon,
  ArrowUp as ArrowUpwardIcon,
  ArrowDown as ArrowDownwardIcon,
  Globe as PublishIcon,
} from 'lucide-react';
import axios from 'axios';
import WebsiteCategoryManagement from './WebsiteCategoryManagement';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardActionButton,
  DashboardInput,
  DashboardPanel,
  DashboardSelect,
  InsightPreviewField,
  InsightPublishDateField,
  DashboardMetricCard,
  PageHeader,
  DashboardIconButton,
  getTrendProps,
} from './shared';
import { DashboardDataGrid } from './grid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const WebsiteManageInsights = ({ user }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const { websiteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse subtab from pathname — /dashboard/websites/:websiteId/blog/:subtab
  const parseSubtab = useCallback(() => {
    const segments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    // segments: ['dashboard', 'websites', websiteId, 'blog', subtab?]
    return segments[4] || 'posts';
  }, [location.pathname]);

  const subtab = parseSubtab();
  const activeTab = subtab || 'posts';

  // Redirect if on base blog path without subtab
  useEffect(() => {
    if (!segments_hasSubtab()) {
      navigate(`/dashboard/websites/${websiteId}/blog/posts`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function segments_hasSubtab() {
    const segments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    return segments.length > 4;
  }

  const triggerNotificationRefresh = () => {
    window.dispatchEvent(new Event('notifications:refresh'));
  };

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [page, setPage] = useState(() => {
    return parseInt(localStorage.getItem(`websiteBlogPosts_${websiteId}_page`)) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    return parseInt(localStorage.getItem(`websiteBlogPosts_${websiteId}_rowsPerPage`)) || 10;
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const contentRefs = useRef({});

  // Stats for blog posts scoped to the current user
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
  });

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addCategoryTrigger, setAddCategoryTrigger] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Quick-create category state (used in create/edit blog dialog)
  const [showQuickCreateCategory, setShowQuickCreateCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [quickCategoryLoading, setQuickCategoryLoading] = useState(false);

  // Add Category Dialog state (for when not on categories tab)
  const [openAddCategoryDialog, setOpenAddCategoryDialog] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    description: '',
    headings: [
      {
        heading: '',
        subsections: [{ subheading: '', content: '' }],
      },
    ],
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    image: '',
    publishDate: new Date().toISOString().split('T')[0],
  });

  const [originalFormData, setOriginalFormData] = useState(null);

  const [validationErrors, setValidationErrors] = useState({
    title: '',
    category: '',
    content: '',
    description: '',
    headings: [],
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  });

  // Persist rowsPerPage to localStorage
  useEffect(() => {
    localStorage.setItem(`websiteBlogPosts_${websiteId}_rowsPerPage`, rowsPerPage.toString());
  }, [rowsPerPage, websiteId]);

  // Persist page to localStorage
  useEffect(() => {
    localStorage.setItem(`websiteBlogPosts_${websiteId}_page`, page.toString());
  }, [page, websiteId]);

  // Reset to page 1 when rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [rowsPerPage]);

  // Fetch categories and stats on mount
  useEffect(() => {
    fetchCategories();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch blogs when page/rowsPerPage/user changes
  useEffect(() => {
    if (user?.id) {
      fetchBlogs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, user?.id]);

  // Helper to get image URL
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL.replace('/api', '')}${imagePath}`;
  }, []);

  // Check if form has been modified
  const hasFormChanged = useCallback(() => {
    if (!isEditing || !originalFormData) return true;
    if (imageFile) return true;
    return (
      formData.title !== originalFormData.title ||
      formData.category !== originalFormData.category ||
      formData.content !== originalFormData.content ||
      formData.description !== originalFormData.description ||
      formData.metaTitle !== originalFormData.metaTitle ||
      formData.metaDescription !== originalFormData.metaDescription ||
      formData.keywords !== originalFormData.keywords ||
      formData.publishDate !== originalFormData.publishDate ||
      JSON.stringify(formData.headings) !== JSON.stringify(originalFormData.headings)
    );
  }, [isEditing, originalFormData, imageFile, formData]);

  // Sorting
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Filter and sort blogs
  const sortedAndFilteredBlogs = useMemo(() => {
    return blogs
      .filter((blog) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            blog.title?.toLowerCase().includes(query) ||
            blog.category?.toLowerCase().includes(query) ||
            blog.author?.name?.toLowerCase().includes(query) ||
            blog.status?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        if (statusFilter !== 'all') {
          const statusMap = {
            published: 'approved',
            draft: 'draft',
          };
          if (blog.status !== statusMap[statusFilter]) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case 'title':
            aValue = a.title?.toLowerCase() || '';
            bValue = b.title?.toLowerCase() || '';
            break;
          case 'category':
            aValue = a.category?.toLowerCase() || '';
            bValue = b.category?.toLowerCase() || '';
            break;
          case 'author':
            aValue = a.author?.name?.toLowerCase() || '';
            bValue = b.author?.name?.toLowerCase() || '';
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          case 'publishedAt':
            aValue = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            bValue = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            break;
          case 'createdAt':
          default:
            aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
        }

        if (typeof aValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });
  }, [blogs, searchQuery, statusFilter, sortField, sortDirection]);

  // Draft count for badge
  const draftCount = useMemo(
    () => blogs.filter((b) => b.status === 'draft').length,
    [blogs]
  );

  // -------------------------------------------------------------------------
  // API calls
  // -------------------------------------------------------------------------
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      if (response.data.success && response.data.data) {
        const categoryNames = response.data.data.map((cat) => cat.name);
        setCategories(categoryNames);
      }
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/blogs/my-stats`);
      if (response.data.success) {
        setStats({
          total: response.data.stats.total || 0,
          published: response.data.stats.published || 0,
          draft: response.data.stats.draft || 0,
        });
      }
    } catch {
      // Silently fail — stats are non-critical
    }
  }, []);

  const fetchBlogs = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/blogs?page=${page}&limit=${rowsPerPage}&authorId=${user.id}`
      );
      setBlogs(response.data.blogs || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch {
      setBlogs([]);
      setSnackbar({
        open: true,
        message: 'Failed to fetch blog posts',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, user?.id]);

  // -------------------------------------------------------------------------
  // Format helpers
  // -------------------------------------------------------------------------
  const convertToNewFormat = useCallback((headings) => {
    if (!headings || !Array.isArray(headings)) {
      return [{ heading: '', subsections: [{ subheading: '', content: '' }] }];
    }

    return headings.map((section) => {
      if (section.subsections && Array.isArray(section.subsections)) {
        return section;
      }

      const subsections = [];
      if (section.description && Array.isArray(section.description)) {
        if (section.subheading) {
          subsections.push({
            subheading: section.subheading,
            content: section.description.join('\n'),
          });
        } else {
          subsections.push({
            subheading: '',
            content: section.description.join('\n'),
          });
        }
      } else {
        subsections.push({ subheading: '', content: '' });
      }

      return {
        heading: section.heading || '',
        subsections,
      };
    });
  }, []);

  // -------------------------------------------------------------------------
  // Dialog handlers
  // -------------------------------------------------------------------------
  const handleOpenDialog = useCallback((blog = null) => {
    if (blog) {
      setIsEditing(true);
      setCurrentInsight(blog);
      const convertedHeadings = convertToNewFormat(blog.headings);

      setFormData({
        title: blog.title,
        category: blog.category,
        content: blog.content,
        description: blog.description,
        headings: convertedHeadings,
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        keywords: blog.keywords || '',
        image: blog.image || '',
        publishDate: blog.publishedAt
          ? new Date(blog.publishedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });

      setImagePreview(getImageUrl(blog.image));
      setImageFile(null);

      setOriginalFormData({
        title: blog.title || '',
        category: blog.category || '',
        content: blog.content || '',
        description: blog.description || '',
        headings: blog.headings || [
          { heading: '', subsections: [{ subheading: '', content: '' }] },
        ],
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        keywords: blog.keywords || '',
        image: blog.image || '',
        publishDate: blog.publishedAt
          ? new Date(blog.publishedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setIsEditing(false);
      setCurrentInsight(null);
      setOriginalFormData(null);
      setFormData({
        title: '',
        category: '',
        content: '',
        description: '',
        headings: [{ heading: '', subsections: [{ subheading: '', content: '' }] }],
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        image: '',
        publishDate: new Date().toISOString().split('T')[0],
      });
      setImagePreview('');
      setImageFile(null);
    }
    setOpenDialog(true);
    setShowQuickCreateCategory(false);
    setQuickCategoryName('');
  }, [convertToNewFormat, getImageUrl]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentInsight(null);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview('');
    setOriginalFormData(null);
    setShowQuickCreateCategory(false);
    setQuickCategoryName('');
    setValidationErrors({
      title: '',
      category: '',
      content: '',
      description: '',
      headings: [],
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'Image size must be less than 5MB',
          severity: 'error',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Section management
  const handleSectionChange = useCallback((sectionIndex, field, value) => {
    setFormData((prev) => {
      const newHeadings = [...prev.headings];
      newHeadings[sectionIndex][field] = value;
      return { ...prev, headings: newHeadings };
    });
  }, []);

  const addSection = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      headings: [...prev.headings, { heading: '', subsections: [{ subheading: '', content: '' }] }],
    }));
  }, []);

  const removeSection = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      headings: prev.headings.filter((_, i) => i !== index),
    }));
  }, []);

  // Subsection management
  const handleSubsectionChange = useCallback((sectionIndex, subsectionIndex, field, value) => {
    setFormData((prev) => {
      const newHeadings = [...prev.headings];
      newHeadings[sectionIndex].subsections[subsectionIndex][field] = value;
      return { ...prev, headings: newHeadings };
    });
  }, []);

  const addSubsection = useCallback((sectionIndex) => {
    setFormData((prev) => {
      const newHeadings = [...prev.headings];
      newHeadings[sectionIndex].subsections.push({ subheading: '', content: '' });
      return { ...prev, headings: newHeadings };
    });
  }, []);

  const removeSubsection = useCallback((sectionIndex, subsectionIndex) => {
    setFormData((prev) => {
      const newHeadings = [...prev.headings];
      newHeadings[sectionIndex].subsections = newHeadings[sectionIndex].subsections.filter(
        (_, i) => i !== subsectionIndex
      );
      return { ...prev, headings: newHeadings };
    });
  }, []);

  // Text formatting helpers
  const insertTextAtCursor = useCallback((sectionIndex, subsectionIndex, textToInsert, wrapText = false) => {
    const refKey = `${sectionIndex}-${subsectionIndex}`;
    const textarea = contentRefs.current[refKey];

    if (!textarea) {
      const currentContent = formData.headings[sectionIndex].subsections[subsectionIndex].content;
      handleSubsectionChange(sectionIndex, subsectionIndex, 'content', currentContent + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.headings[sectionIndex].subsections[subsectionIndex].content;
    const selectedText = currentContent.substring(start, end);

    let newText;
    if (wrapText && selectedText) {
      const [prefix, suffix] = textToInsert.split('|');
      newText =
        currentContent.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        currentContent.substring(end);
    } else {
      newText = currentContent.substring(0, start) + textToInsert + currentContent.substring(end);
    }

    handleSubsectionChange(sectionIndex, subsectionIndex, 'content', newText);

    setTimeout(() => {
      const newPosition = start + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  }, [formData.headings, handleSubsectionChange]);

  const insertFormatting = useCallback((sectionIndex, subsectionIndex, format) => {
    const refKey = `${sectionIndex}-${subsectionIndex}`;
    const textarea = contentRefs.current[refKey];
    const selectedText =
      textarea?.value.substring(textarea.selectionStart, textarea.selectionEnd) || '';

    switch (format) {
      case 'bold':
        if (selectedText) {
          insertTextAtCursor(sectionIndex, subsectionIndex, `**|**`, true);
        } else {
          insertTextAtCursor(sectionIndex, subsectionIndex, '**bold text**');
        }
        break;
      case 'italic':
        if (selectedText) {
          insertTextAtCursor(sectionIndex, subsectionIndex, `*|*`, true);
        } else {
          insertTextAtCursor(sectionIndex, subsectionIndex, '*italic text*');
        }
        break;
      case 'bullet':
        insertTextAtCursor(sectionIndex, subsectionIndex, '\n• Bullet point');
        break;
      case 'numbered': {
        const currentText = formData.headings[sectionIndex].subsections[subsectionIndex].content;
        const lines = currentText.split('\n');
        const nextNum = lines.filter((l) => /^\d+\./.test(l.trim())).length + 1;
        insertTextAtCursor(sectionIndex, subsectionIndex, `\n${nextNum}. Numbered item`);
        break;
      }
      default:
        return;
    }
  }, [formData.headings, insertTextAtCursor]);

  const validateForm = useCallback(() => {
    const errors = {
      title: '',
      category: '',
      content: '',
      description: '',
      headings: [],
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    };

    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    } else if (formData.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
      isValid = false;
    } else if (formData.title.length > 255) {
      errors.title = 'Title must not exceed 255 characters';
      isValid = false;
    }

    if (!formData.category) {
      errors.category = 'Category is required';
      isValid = false;
    }

    if (!formData.content.trim()) {
      errors.content = 'Content preview is required';
      isValid = false;
    } else if (formData.content.length < 10) {
      errors.content = 'Content preview must be at least 10 characters';
      isValid = false;
    } else if (formData.content.length > 1000) {
      errors.content = 'Content preview must not exceed 1000 characters';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 50) {
      errors.description = `Description must be at least 50 characters (current: ${formData.description.length})`;
      isValid = false;
    }

    const headingErrors = formData.headings.map((section, index) => {
      if (!section.heading.trim()) {
        isValid = false;
        return `Section ${index + 1}: Main heading is required`;
      }
      return '';
    });
    errors.headings = headingErrors;

    if (formData.metaTitle && formData.metaTitle.length > 255) {
      errors.metaTitle = 'Meta title must not exceed 255 characters';
      isValid = false;
    }

    if (formData.metaDescription && formData.metaDescription.length > 500) {
      errors.metaDescription = 'Meta description must not exceed 500 characters';
      isValid = false;
    }

    if (formData.keywords && formData.keywords.length > 500) {
      errors.keywords = 'Keywords must not exceed 500 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix all validation errors before submitting',
        severity: 'error',
      });
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('description', formData.description);

      const headingsForAPI = formData.headings.map((section) => ({
        heading: section.heading,
        subsections: section.subsections.map((sub) => ({
          subheading: sub.subheading || '',
          content: Array.isArray(sub.content)
            ? sub.content
            : sub.content.split('\n').filter((p) => p.trim()),
        })),
      }));

      formDataToSend.append('headings', JSON.stringify(headingsForAPI));
      formDataToSend.append('metaTitle', formData.metaTitle || formData.title);
      formDataToSend.append('metaDescription', formData.metaDescription || formData.content);
      formDataToSend.append('keywords', formData.keywords || formData.category);
      formDataToSend.append('publishDate', formData.publishDate);

      if (imageFile) {
        formDataToSend.append('imageFile', imageFile);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (isEditing) {
        await axios.put(`${API_URL}/blogs/${currentInsight.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/blogs`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await fetchBlogs();
      await fetchStats();
      triggerNotificationRefresh();

      setSnackbar({
        open: true,
        message: isEditing ? 'Blog post updated successfully' : 'Blog post created successfully',
        severity: 'success',
      });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save blog post',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/blogs/${currentInsight.id}`);

      await fetchBlogs();
      await fetchStats();
      triggerNotificationRefresh();

      setSnackbar({
        open: true,
        message: 'Blog post deleted successfully',
        severity: 'success',
      });

      setOpenDeleteDialog(false);
      setCurrentInsight(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete blog post',
        severity: 'error',
      });
    }
  };

  // Publish toggle: approved ↔ draft
  const handleTogglePublish = useCallback(async (blog) => {
    try {
      const response = await axios.patch(
        `${API_URL}/blogs/${blog.id}/publish-toggle`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        const newStatus = blog.status === 'approved' ? 'draft' : 'approved';
        setSnackbar({
          open: true,
          message: newStatus === 'approved' ? 'Post published!' : 'Post unpublished',
          severity: 'success',
        });
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update publish status',
        severity: 'error',
      });
    }
  }, [fetchBlogs, fetchStats]);

  // Handle Add Category quick-create from dialog
  const handleAddCategorySubmit = async () => {
    try {
      await axios.post(`${API_URL}/categories`, categoryFormData);
      await fetchCategories();
      setSnackbar({
        open: true,
        message: 'Category created successfully',
        severity: 'success',
      });
      setOpenAddCategoryDialog(false);
      setCategoryFormData({ name: '', description: '' });
      setAddCategoryTrigger(0);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create category',
        severity: 'error',
      });
    }
  };

  // Quick-create category inline in the create/edit dialog
  const handleQuickCreateCategory = async () => {
    if (!quickCategoryName.trim()) return;
    setQuickCategoryLoading(true);
    try {
      await axios.post(`${API_URL}/categories`, { name: quickCategoryName.trim(), description: '' });
      await fetchCategories();
      setFormData((prev) => ({ ...prev, category: quickCategoryName.trim() }));
      setSnackbar({ open: true, message: 'Category created', severity: 'success' });
      setShowQuickCreateCategory(false);
      setQuickCategoryName('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create category',
        severity: 'error',
      });
    } finally {
      setQuickCategoryLoading(false);
    }
  };

  // Preview: open public website blog URL
  const handlePreview = useCallback((blog) => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    window.open(`${baseUrl}/blogdetail/${blog.slug || blog.id}`, '_blank');
  }, []);

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  // Stats row
  const renderStats = () => (
    <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardMetricCard
          title="Total Posts"
          value={stats.total}
          icon={ArticleIcon}
          showProgress={false}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardMetricCard
          title="Published"
          value={stats.published}
          icon={PublishIcon}
          showProgress={false}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardMetricCard
          title="Drafts"
          value={stats.draft}
          icon={ArticleIcon}
          showProgress={false}
        />
      </Grid>
    </Grid>
  );

  // Status chip
  const getStatusChip = useCallback((status) => {
    const statusConfig = {
      draft: {
        label: 'Draft',
        background: `linear-gradient(135deg, ${alpha(colors.text, 0.2)} 0%, ${alpha(colors.text, 0.1)} 100%)`,
        color: colors.textSecondary,
      },
      approved: {
        label: 'Published',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: '#F5F5F5',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          background: config.background,
          color: config.color,
          fontWeight: 700,
          border: 'none',
          boxShadow: status === 'approved' ? `0 2px 6px ${alpha('#22c55e', 0.2)}` : 'none',
        }}
      />
    );
  }, [colors]);

  // Sort header button
  const SortButton = useCallback(({ field, label }) => (
    <Button
      size="small"
      endIcon={
        sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUpwardIcon size={14} />
          ) : (
            <ArrowDownwardIcon size={14} />
          )
        ) : null
      }
      onClick={() => handleSort(field)}
      sx={{
        color: sortField === field ? colors.primary : colors.textSecondary,
        fontWeight: sortField === field ? 700 : 400,
        textTransform: 'none',
        p: 0,
        minWidth: 'auto',
        '&:hover': { background: 'transparent', color: colors.primary },
      }}
    >
      {label}
    </Button>
  ), [sortField, sortDirection, handleSort, colors]);

  // -------------------------------------------------------------------------
  // Data grid columns
  // -------------------------------------------------------------------------
  const columnDefs = useMemo(() => [
    {
      header: '#',
      accessorFn: (row, index) => (page - 1) * rowsPerPage + index + 1,
      size: 80,
      enableSorting: false,
      Cell: ({ renderedCellValue }) => (
        <Box sx={{ color: colors.textTertiary, fontWeight: 500 }}>
          {renderedCellValue}
        </Box>
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
      header: 'Published',
      accessorKey: 'status',
      size: 160,
      Cell: ({ cell, row }) => {
        const isPublished = cell.getValue() === 'approved';
        return (
          <Tooltip title={isPublished ? 'Click to unpublish' : 'Click to publish'}>
            <Switch
              checked={isPublished}
              onChange={() => handleTogglePublish(row.original)}
              size="small"
              color="primary"
              inputProps={{
                role: 'switch',
                'aria-label': `Toggle publish status for ${row.original.title}`,
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      size: 140,
      Cell: ({ cell, row }) => (
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          {new Date(row.original.publishedAt || cell.getValue()).toLocaleDateString()}
        </Typography>
      ),
    },
  ], [page, rowsPerPage, colors, handleTogglePublish]);

  // Action column
  const actionColumn = useMemo(() => ({
    width: 180,
    actions: (blog) => [
      {
        label: 'Preview',
        icon: <ViewIcon size={18} />,
        onClick: (data) => handlePreview(data),
        color: colors.primary,
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
        onClick: (data) => {
          setCurrentInsight(data);
          setOpenDeleteDialog(true);
        },
        color: '#ef4444',
        hoverBackground: alpha('#ef4444', 0.2),
      },
    ],
  }), [colors, handlePreview, handleOpenDialog]);

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <Box>
      <PageHeader
        title="Blog Posts"
        subtitle={`Manage blog posts for your website — write, publish, and track engagement`}
      />

      {/* Action Button Row */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="flex-end" gap={1.5} mb={2}>
          <DashboardIconButton
            icon={<NewInsightIcon size={20} />}
            label="New Post"
            tooltip="Create New Blog Post"
            variant="filled"
            onClick={() => handleOpenDialog()}
          />
          <DashboardIconButton
            icon={<NewCategoryIcon size={20} />}
            label="Add Category"
            tooltip="Add Category"
            variant="outlined"
            onClick={() => {
              if (activeTab === 'categories') {
                setAddCategoryTrigger((prev) => prev + 1);
              } else {
                setOpenAddCategoryDialog(true);
              }
            }}
          />
        </Box>
      </Box>

      {/* Summary Stats */}
      {renderStats()}

      {/* Search and Filter Controls */}
      <Stack
        sx={{ mb: 3 }}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            maxWidth: { xs: '100%', sm: '500px' },
          }}
        >
          <DashboardInput
            fullWidth
            placeholder={
              activeTab === 'categories'
                ? 'Search by category name or description...'
                : 'Search by title, category, or status...'
            }
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

        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexShrink: 0 }}>
          <DashboardSelect
            size="small"
            label="View"
            value={activeTab}
            onChange={(e) => {
              const newValue = e.target.value;
              navigate(`/dashboard/websites/${websiteId}/blog/${newValue}`);
              setSearchQuery('');
            }}
            containerSx={{
              minWidth: 160,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <MenuItem value="posts">
              Posts
              {draftCount > 0 && (
                <Chip
                  label={`${draftCount} draft${draftCount > 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: '0.65rem',
                    background: alpha(colors.textTertiary, 0.2),
                    color: colors.textSecondary,
                  }}
                />
              )}
            </MenuItem>
            <MenuItem value="categories">Categories</MenuItem>
          </DashboardSelect>

          {activeTab === 'posts' && (
            <DashboardSelect
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              containerSx={{
                minWidth: 140,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </DashboardSelect>
          )}
        </Stack>
      </Stack>

      {/* View Content */}
      {activeTab === 'categories' ? (
        <WebsiteCategoryManagement
          user={user}
          searchQuery={searchQuery}
          addTrigger={addCategoryTrigger}
        />
      ) : (
        <DashboardPanel padding={0} sx={{ borderRadius: 3 }}>
          <DashboardDataGrid
            gridId="website-manage-blog-posts"
            rowData={sortedAndFilteredBlogs}
            columnDefs={columnDefs}
            actionColumn={actionColumn}
            serverSidePagination={{
              totalRows: stats.total,
              currentPage: page,
              onPageChange: (newPage) => setPage(newPage),
              onPageSizeChange: (newSize) => setRowsPerPage(newSize),
            }}
            paginationPageSize={rowsPerPage}
            loading={loading}
            rowHeight={72}
            emptyMessage={
              blogs.length === 0
                ? "No blog posts yet. Write your first post!"
                : "No blog posts found matching your filters"
            }
            emptyIcon={<ArticleIcon size={48} color={colors.textTertiary} />}
            emptyAction={
              blogs.length === 0 ? (
                <DashboardActionButton
                  startIcon={<NewInsightIcon size={16} />}
                  onClick={() => handleOpenDialog()}
                >
                  Write Your First Blog Post
                </DashboardActionButton>
              ) : undefined
            }
            getRowId={(row) => row.id}
            pagination
          />
        </DashboardPanel>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
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
          {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.border }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Post Title"
                labelPlacement="floating"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                error={!!validationErrors.title}
                helperText={validationErrors.title || 'Title must be between 5 and 255 characters'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <DashboardSelect
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  error={!!validationErrors.category}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </DashboardSelect>
                {validationErrors.category && (
                  <Typography variant="caption" sx={{ color: colors.panelDanger, mt: 0.5, ml: 1.5 }}>
                    {validationErrors.category}
                  </Typography>
                )}
                {/* Quick-create category */}
                {!showQuickCreateCategory ? (
                  <Button
                    size="small"
                    startIcon={<AddIcon size={14} />}
                    onClick={() => setShowQuickCreateCategory(true)}
                    sx={{
                      mt: 0.5,
                      color: colors.primary,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      p: 0,
                      '&:hover': { background: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    + New Category
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Category name"
                      value={quickCategoryName}
                      onChange={(e) => setQuickCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickCreateCategory();
                        if (e.key === 'Escape') {
                          setShowQuickCreateCategory(false);
                          setQuickCategoryName('');
                        }
                      }}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          color: colors.text,
                          backgroundColor: alpha(colors.text, 0.04),
                          '& fieldset': { borderColor: colors.border },
                          '&:hover fieldset': { borderColor: alpha(colors.primary, 0.5) },
                          '&.Mui-focused fieldset': { borderColor: colors.primary },
                        },
                        '& .MuiInputBase-input': { color: colors.text, fontSize: '0.875rem' },
                      }}
                      autoFocus
                    />
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!quickCategoryName.trim() || quickCategoryLoading}
                      onClick={handleQuickCreateCategory}
                      sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 60 }}
                    >
                      {quickCategoryLoading ? '...' : 'Add'}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowQuickCreateCategory(false);
                        setQuickCategoryName('');
                      }}
                      sx={{ color: colors.textSecondary }}
                    >
                      <CloseIcon size={14} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <InsightPublishDateField
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
              />
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: colors.border }}>
                <Typography sx={{ color: colors.textSecondary }}>Featured Image</Typography>
              </Divider>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {imagePreview ? (
                <Card
                  sx={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={imagePreview}
                    alt="Preview"
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      if (!imagePreview.startsWith('http') && !imagePreview.startsWith('data:')) {
                        const backendUrl = `${API_URL.replace('/api', '')}${imagePreview}`;
                        e.target.src = backendUrl;
                      }
                    }}
                  />
                  <CardContent>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon size={18} />}
                        onClick={() => fileInputRef.current?.click()}
                        fullWidth
                        sx={{
                          color: colors.text,
                          borderColor: colors.border,
                          '&:hover': {
                            borderColor: colors.primary,
                            background: alpha(colors.primary, 0.1),
                          },
                        }}
                      >
                        Change Image
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CloseIcon size={18} />}
                        onClick={handleRemoveImage}
                        fullWidth
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
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  sx={{
                    backgroundColor: colors.cardBg,
                    border: `2px dashed ${alpha(colors.primary, 0.4)}`,
                    cursor: 'pointer',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: colors.primary,
                      background: alpha(colors.primary, 0.05),
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ mb: 2, color: colors.textTertiary }}>
                      <ImageIcon size={60} />
                    </Box>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
                      Upload Featured Image
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Click to browse or drag and drop
                      <br />
                      PNG, JPG, WEBP up to 5MB
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>

            <Grid item xs={12}>
              <InsightPreviewField
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                error={!!validationErrors.content}
                errorText={validationErrors.content}
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Full Introduction (Description)"
                labelPlacement="floating"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
                error={!!validationErrors.description}
                helperText={
                  validationErrors.description ||
                  `Full intro paragraph shown at the top of the post (minimum 50 characters) - Current: ${formData.description.length}`
                }
              />
            </Grid>

            {/* Content Sections with Subsections */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: colors.border }}>
                <Typography sx={{ color: colors.textSecondary }}>Content Sections</Typography>
              </Divider>

              {formData.headings.map((section, sectionIndex) => (
                <Card
                  key={sectionIndex}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 700 }}>
                      Section {sectionIndex + 1}
                    </Typography>
                    {formData.headings.length > 1 && (
                      <Button
                        size="small"
                        startIcon={<DeleteIcon size={18} />}
                        onClick={() => removeSection(sectionIndex)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': { background: alpha('#ef4444', 0.1) },
                        }}
                      >
                        Remove Section
                      </Button>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <DashboardInput
                        fullWidth
                        label="Main Section Heading"
                        labelPlacement="floating"
                        value={section.heading}
                        onChange={(e) =>
                          handleSectionChange(sectionIndex, 'heading', e.target.value)
                        }
                        required
                        error={!!validationErrors.headings[sectionIndex]}
                        helperText={
                          validationErrors.headings[sectionIndex] ||
                          'e.g., Key Benefits, Implementation Steps'
                        }
                        placeholder="e.g., Key Benefits, Implementation Steps"
                        sx={{
                          '& input:-webkit-autofill': {
                            WebkitBoxShadow: `0 0 0 100px ${colors.cardBgLight} inset`,
                            WebkitTextFillColor: colors.text,
                          },
                        }}
                      />
                    </Grid>

                    {/* Subsections */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1, borderColor: alpha(colors.border, 0.5) }}>
                        <Typography variant="caption" sx={{ color: colors.textTertiary }}>
                          Subsections
                        </Typography>
                      </Divider>

                      {section.subsections.map((subsection, subsectionIndex) => (
                        <Card
                          key={subsectionIndex}
                          sx={{
                            mb: 2,
                            p: 2,
                            border: `0.2px solid ${alpha(colors.border, 0.2)}`,
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ color: colors.primary, fontWeight: 600 }}
                            >
                              Subsection {subsectionIndex + 1}
                            </Typography>
                            {section.subsections.length > 1 && (
                              <IconButton
                                size="small"
                                onClick={() => removeSubsection(sectionIndex, subsectionIndex)}
                                sx={{
                                  color: '#ef4444',
                                  '&:hover': { background: alpha('#ef4444', 0.1) },
                                }}
                              >
                                <DeleteIcon size={16} />
                              </IconButton>
                            )}
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <DashboardInput
                                fullWidth
                                label="Subheading (Optional)"
                                labelPlacement="floating"
                                value={subsection.subheading}
                                onChange={(e) =>
                                  handleSubsectionChange(
                                    sectionIndex,
                                    subsectionIndex,
                                    'subheading',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Cost Efficiency, Scalability"
                                size="small"
                                sx={{
                                  '& input:-webkit-autofill': {
                                    WebkitBoxShadow: `0 0 0 100px ${colors.dark} inset`,
                                    WebkitTextFillColor: colors.text,
                                  },
                                }}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Box mb={1}>
                                <ButtonGroup size="small" variant="outlined">
                                  <Tooltip title="Bold: Select text or insert **text**">
                                    <Button
                                      onClick={() =>
                                        insertFormatting(sectionIndex, subsectionIndex, 'bold')
                                      }
                                      sx={{
                                        color: colors.text,
                                        borderColor: colors.border,
                                        '&:hover': {
                                          borderColor: colors.primary,
                                          background: alpha(colors.primary, 0.1),
                                        },
                                      }}
                                    >
                                      <BoldIcon size={16} />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Italic: Select text or insert *text*">
                                    <Button
                                      onClick={() =>
                                        insertFormatting(sectionIndex, subsectionIndex, 'italic')
                                      }
                                      sx={{
                                        color: colors.text,
                                        borderColor: colors.border,
                                        '&:hover': {
                                          borderColor: colors.primary,
                                          background: alpha(colors.primary, 0.1),
                                        },
                                      }}
                                    >
                                      <ItalicIcon size={16} />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Bullet Point">
                                    <Button
                                      onClick={() =>
                                        insertFormatting(sectionIndex, subsectionIndex, 'bullet')
                                      }
                                      sx={{
                                        color: colors.text,
                                        borderColor: colors.border,
                                        '&:hover': {
                                          borderColor: colors.primary,
                                          background: alpha(colors.primary, 0.1),
                                        },
                                      }}
                                    >
                                      <BulletIcon size={16} />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Numbered List">
                                    <Button
                                      onClick={() =>
                                        insertFormatting(sectionIndex, subsectionIndex, 'numbered')
                                      }
                                      sx={{
                                        color: colors.text,
                                        borderColor: colors.border,
                                        '&:hover': {
                                          borderColor: colors.primary,
                                          background: alpha(colors.primary, 0.1),
                                        },
                                      }}
                                    >
                                      <NumberedIcon size={16} />
                                    </Button>
                                  </Tooltip>
                                </ButtonGroup>
                              </Box>

                              <DashboardInput
                                fullWidth
                                label="Content"
                                labelPlacement="floating"
                                value={subsection.content}
                                onChange={(e) =>
                                  handleSubsectionChange(
                                    sectionIndex,
                                    subsectionIndex,
                                    'content',
                                    e.target.value
                                  )
                                }
                                multiline
                                rows={6}
                                required
                                inputRef={(el) => {
                                  contentRefs.current[`${sectionIndex}-${subsectionIndex}`] = el;
                                }}
                                placeholder="Write your content here. Use **text** for bold, *text* for italic, • for bullets"
                                helperText="Each new line creates a paragraph. Use formatting buttons to add style."
                                sx={{
                                  '& textarea:-webkit-autofill': {
                                    WebkitBoxShadow: `0 0 0 100px ${colors.dark} inset`,
                                    WebkitTextFillColor: colors.text,
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Card>
                      ))}

                      <Button
                        variant="text"
                        startIcon={<AddSubsectionIcon size={18} />}
                        onClick={() => addSubsection(sectionIndex)}
                        size="small"
                        sx={{
                          color: colors.primary,
                          '&:hover': { backgroundColor: alpha(colors.primary, 0.1) },
                        }}
                      >
                        Add Subsection
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon size={18} />}
                onClick={addSection}
                fullWidth
                sx={{
                  mt: 1,
                  color: colors.primary,
                  borderColor: colors.primary,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: colors.primaryDark,
                    backgroundColor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                Add Another Section
              </Button>
            </Grid>

            {/* SEO Fields */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: colors.border }}>
                <Typography sx={{ color: colors.textSecondary }}>
                  SEO Optimization (Optional)
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Meta Title"
                labelPlacement="floating"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                error={!!validationErrors.metaTitle}
                helperText={
                  validationErrors.metaTitle ||
                  `Leave empty to use post title (max 255 characters) - Current: ${formData.metaTitle.length}`
                }
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Meta Description"
                labelPlacement="floating"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                multiline
                rows={2}
                error={!!validationErrors.metaDescription}
                helperText={
                  validationErrors.metaDescription ||
                  `Leave empty to use content preview (max 500 characters) - Current: ${formData.metaDescription.length}`
                }
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Keywords (comma-separated)"
                labelPlacement="floating"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="AI, technology, innovation"
                error={!!validationErrors.keywords}
                helperText={
                  validationErrors.keywords ||
                  `Relevant keywords for SEO (max 500 characters) - Current: ${formData.keywords.length}`
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
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
              !formData.title ||
              !formData.category ||
              !formData.content ||
              !formData.description ||
              !hasFormChanged()
            }
          >
            {isEditing ? 'Update Post' : 'Create Post'}
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
            Are you sure you want to delete &quot;
            <strong style={{ color: colors.text }}>{currentInsight?.title}</strong>
            &quot;? This action cannot be undone.
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

      {/* Add Category Dialog (for non-categories tab) */}
      <Dialog
        open={openAddCategoryDialog}
        onClose={() => {
          setOpenAddCategoryDialog(false);
          setCategoryFormData({ name: '', description: '' });
        }}
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
          Add New Category
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DashboardInput
            fullWidth
            label="Category Name"
            labelPlacement="floating"
            value={categoryFormData.name}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
            required
            containerSx={{ mt: 1.5 }}
          />
          <DashboardInput
            fullWidth
            label="Description"
            labelPlacement="floating"
            value={categoryFormData.description}
            onChange={(e) =>
              setCategoryFormData({ ...categoryFormData, description: e.target.value })
            }
            multiline
            rows={3}
            containerSx={{ mt: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
          <Button
            onClick={() => {
              setOpenAddCategoryDialog(false);
              setCategoryFormData({ name: '', description: '' });
            }}
            sx={{
              color: colors.textSecondary,
              '&:hover': { background: alpha(colors.textSecondary, 0.1) },
            }}
          >
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleAddCategorySubmit}
            disabled={!categoryFormData.name.trim()}
          >
            Create
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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
            '& .MuiAlert-icon': { color: '#F5F5F5' },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WebsiteManageInsights;
