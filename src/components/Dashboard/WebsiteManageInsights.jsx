/**
 * WebsiteManageInsights
 *
 * Blog management tab rendered inside the per-website management dashboard
 * (WebsiteManagementDashboard → section "blog"). Also reachable via the legacy
 * /dashboard/websites/:websiteId/blog route.
 *
 * Feature plan: docs/WEBSITE_BLOG_FEATURE_PLAN.md (FE1). Key behaviors:
 * - Website-scoped API surface: /api/websites/:websiteId/blogs* (props-driven websiteId;
 *   no author scoping, no global /categories, /my-stats, or /publish-toggle).
 * - Split status model: approvalStatus (DRAFT | PENDING_APPROVAL | APPROVED | REJECTED)
 *   plus visibility (PUBLISHED | UNPUBLISHED). Public = APPROVED + PUBLISHED.
 * - Approval workflow: OWNER/ADMIN approve/reject pending posts (websiteRole prop);
 *   visibility (show/hide) is OWNER/ADMIN-only.
 * - Categories are derived from this website's posts (no separate category model).
 * - Preview targets the website's own public blog page (full route ships in FE3).
 * - localStorage keys use 'websiteBlogPosts' prefix.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  Fab,
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
  Search as SearchIcon,
  Check as ApproveIcon,
  Clock as PendingIcon,
  Filter as FilterIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PenSquare as PenSquareIcon,
  CheckCircle2 as PublishedStatIcon,
  FileEdit as DraftStatIcon,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardActionButton,
  DashboardInput,
  DashboardSelect,
  InsightPreviewField,
  InsightPublishDateField,
} from './shared';
import { API_URL } from '@/config/api';


const WebsiteManageInsights = ({ websiteId: websiteIdProp, websiteRole, website }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  // Palette aligned to the dashboard's warm teal-tinted dark theme (no blue).
  const pal = {
    bg: isDark ? '#111114' : '#F2F3EB',
    textPrimary: isDark ? '#ffffff' : '#252525',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.5)' : '#6A6F78',
    cardBg: isDark ? 'rgba(20, 28, 26, 0.8)' : 'rgba(255, 255, 255, 0.7)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
    accent: '#378C92',
    tableRowBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    tableRowHover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    inputBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    iconGradient: 'linear-gradient(180deg, rgba(7,148,133,0.25), rgba(0,135,236,0.18))',
    shadow: isDark
      ? '0 10px 40px -10px rgba(0,0,0,0.6)'
      : '0 10px 40px -10px rgba(0,0,0,0.05)',
  };
  const { user } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  // websiteId comes from the management-dashboard tab (prop) or the legacy
  // /dashboard/websites/:websiteId/blog route (URL param) for backward compat.
  const websiteId = websiteIdProp ?? params.websiteId;

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

  // Stats for this website's blog posts (from /websites/:id/blogs/stats)
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
  });

  // Categories are derived from this website's posts (locked decision — no separate
  // per-website category model). sessionCategories holds names added this session via
  // the inline quick-create before a post has been saved with them.
  const [sessionCategories, setSessionCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Anchors for the redesigned status-filter and rows-per-page menus.
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [rppMenuAnchor, setRppMenuAnchor] = useState(null);

  // Quick-create category state (used in create/edit blog dialog)
  const [showQuickCreateCategory, setShowQuickCreateCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');

  // Reject-with-reason dialog (approval workflow)
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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

  // Fetch stats on mount / website change
  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  // Fetch blogs when page/rowsPerPage/website changes
  useEffect(() => {
    fetchBlogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, websiteId]);

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
            blog.author?.displayName?.toLowerCase().includes(query) ||
            blog.status?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        if (statusFilter !== 'all') {
          const live =
            blog.status === 'APPROVED' && blog.visibility === 'PUBLISHED';
          if (statusFilter === 'published' && !live) return false;
          if (statusFilter === 'pending' && blog.status !== 'PENDING_APPROVAL')
            return false;
          if (statusFilter === 'draft' && blog.status !== 'DRAFT') return false;
          if (statusFilter === 'rejected' && blog.status !== 'REJECTED')
            return false;
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

  // Categories derived from this website's posts + any added this session.
  const categories = useMemo(() => {
    const set = new Set(sessionCategories);
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [blogs, sessionCategories]);

  // Role helpers (website collaborator role: OWNER | ADMIN | EDITOR | VIEWER)
  const normalizedRole = (websiteRole || '').toUpperCase();
  const canApprove = normalizedRole === 'OWNER' || normalizedRole === 'ADMIN';
  const canPublish = canApprove; // visibility is OWNER/ADMIN-only (BE0 confirmed)

  // OWNER/ADMIN can edit/delete any post; EDITOR only their own (backend also enforces).
  const canManagePost = useCallback(
    (blog) =>
      canApprove ||
      (user?.id != null &&
        blog?.author?.id != null &&
        String(user.id) === String(blog.author.id)),
    [canApprove, user?.id]
  );

  // -------------------------------------------------------------------------
  // API calls
  // -------------------------------------------------------------------------
  const fetchStats = useCallback(async () => {
    if (!websiteId) return;
    try {
      const response = await apiClient.get(`/websites/${websiteId}/blogs/stats`);
      if (response.data.success) {
        const s = response.data.stats || {};
        setStats({
          total: s.total || 0,
          published: s.published || 0,
          draft: s.draft || 0,
          pending: s.pending || 0,
        });
      }
    } catch {
      // Silently fail — stats are non-critical
    }
  }, [websiteId]);

  const fetchBlogs = useCallback(async () => {
    if (!websiteId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/websites/${websiteId}/blogs?page=${page}&limit=${rowsPerPage}`
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
  }, [page, rowsPerPage, websiteId]);

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
        await apiClient.put(
          `/websites/${websiteId}/blogs/${currentInsight.id}`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        await apiClient.post(`/websites/${websiteId}/blogs`, formDataToSend, {
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
      await apiClient.delete(`/websites/${websiteId}/blogs/${currentInsight.id}`);

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

  // Show/hide a post publicly (visibility PUBLISHED <-> UNPUBLISHED) — OWNER/ADMIN only.
  const handleTogglePublish = useCallback(async (blog) => {
    const nextVisibility =
      blog.visibility === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    try {
      const response = await apiClient.patch(
        `/websites/${websiteId}/blogs/${blog.id}/visibility`,
        { visibility: nextVisibility }
      );
      if (response.data.success) {
        setSnackbar({
          open: true,
          message:
            nextVisibility === 'PUBLISHED' ? 'Post published!' : 'Post hidden',
          severity: 'success',
        });
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update visibility',
        severity: 'error',
      });
    }
  }, [websiteId, fetchBlogs, fetchStats]);

  // Approve / reject a pending post — OWNER/ADMIN only.
  const handleApprove = useCallback(async (blog) => {
    try {
      await apiClient.patch(`/websites/${websiteId}/blogs/${blog.id}/approve`, {});
      setSnackbar({ open: true, message: 'Post approved', severity: 'success' });
      fetchBlogs();
      fetchStats();
      triggerNotificationRefresh();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to approve post',
        severity: 'error',
      });
    }
  }, [websiteId, fetchBlogs, fetchStats]);

  const handleReject = useCallback(async (blog, rejectionReason) => {
    try {
      await apiClient.patch(`/websites/${websiteId}/blogs/${blog.id}/reject`, {
        rejectionReason: rejectionReason || '',
      });
      setSnackbar({ open: true, message: 'Post rejected', severity: 'success' });
      fetchBlogs();
      fetchStats();
      triggerNotificationRefresh();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to reject post',
        severity: 'error',
      });
    }
  }, [websiteId, fetchBlogs, fetchStats]);

  // Quick-add a category inline in the create/edit dialog. Categories are derived from
  // posts (locked decision), so this just registers the typed name for this session and
  // selects it — it is persisted when the post is saved with that category.
  const handleQuickCreateCategory = () => {
    const name = quickCategoryName.trim();
    if (!name) return;
    setSessionCategories((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setFormData((prev) => ({ ...prev, category: name }));
    setShowQuickCreateCategory(false);
    setQuickCategoryName('');
  };

  // Preview: open the post on the website's own public blog page (/blog/:slug).
  // NOTE: the public blog page + detail route are delivered in FE3. Until then this opens
  // the tenant path (which resolves once FE3 lands). Drafts/pending use the authenticated
  // preview route the FE3 preview page will consume.
  const handlePreview = useCallback(
    (blog) => {
      const live = blog.status === 'APPROVED' && blog.visibility === 'PUBLISHED';
      if (!live) {
        setSnackbar({
          open: true,
          message: 'Publish this post to preview it on your site.',
          severity: 'success',
        });
        return;
      }
      const siteSlug = website?.subdomain || website?.slug;
      const postSlug = blog.slug || blog.id;
      if (siteSlug) {
        window.open(`/site/${siteSlug}/blog/${postSlug}`, '_blank');
      }
    },
    [website]
  );

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  // Overview stat cells (right-hand cluster in the title bento).
  const overviewStats = [
    { label: 'Total Posts', value: stats.total, icon: ArticleIcon },
    { label: 'Published', value: stats.published, icon: PublishedStatIcon },
    { label: 'Pending', value: stats.pending, icon: PendingIcon },
    { label: 'Drafts', value: stats.draft, icon: DraftStatIcon },
  ];

  // Status pill styling (approvalStatus -> design token colors).
  const statusMeta = (status) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approved', bg: '#378C92', color: '#030303' };
      case 'PENDING_APPROVAL':
        return { label: 'Pending', bg: '#fbbf24', color: '#000000' };
      case 'REJECTED':
        return { label: 'Rejected', bg: '#ef4444', color: '#ffffff' };
      case 'DRAFT':
      default:
        return { label: 'Draft', bg: '#9ca3af', color: '#000000' };
    }
  };

  const statusFilterLabels = {
    all: 'All Status',
    published: 'Published',
    pending: 'Pending',
    draft: 'Draft',
    rejected: 'Rejected',
  };

  // Row action buttons (preview / edit / approve / reject / delete), gated by role.
  const getRowActions = (blog) => {
    const manageable = canManagePost(blog);
    const acts = [
      {
        key: 'preview',
        label: 'Preview',
        icon: <ViewIcon size={18} />,
        color: pal.textMuted,
        hover: alpha(pal.accent, 0.15),
        onClick: () => handlePreview(blog),
      },
    ];
    if (manageable) {
      acts.push({
        key: 'edit',
        label: 'Edit',
        icon: <EditIcon size={18} />,
        color: pal.textMuted,
        hover: alpha(pal.accent, 0.15),
        onClick: () => handleOpenDialog(blog),
      });
    }
    if (canApprove && blog.status === 'PENDING_APPROVAL') {
      acts.push(
        {
          key: 'approve',
          label: 'Approve',
          icon: <ApproveIcon size={18} />,
          color: '#16a34a',
          hover: alpha('#22c55e', 0.2),
          onClick: () => handleApprove(blog),
        },
        {
          key: 'reject',
          label: 'Reject',
          icon: <CloseIcon size={18} />,
          color: '#ef4444',
          hover: alpha('#ef4444', 0.2),
          onClick: () => {
            setRejectTarget(blog);
            setRejectReason('');
            setOpenRejectDialog(true);
          },
        }
      );
    }
    if (manageable) {
      acts.push({
        key: 'delete',
        label: 'Delete',
        icon: <DeleteIcon size={18} />,
        color: '#ef4444',
        hover: alpha('#ef4444', 0.12),
        onClick: () => {
          setCurrentInsight(blog);
          setOpenDeleteDialog(true);
        },
      });
    }
    return acts;
  };

  // Pagination display range (server-side; current page rows already fetched).
  const totalRows = stats.total || sortedAndFilteredBlogs.length;
  const rangeStart = totalRows === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const rangeEnd = (page - 1) * rowsPerPage + sortedAndFilteredBlogs.length;
  const rowsPerPageOptions = [5, 10, 25, 50];

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100%",
        bgcolor: pal.bg,
        color: pal.textPrimary,
        borderRadius: 4,
        transition: "background-color 0.5s ease, color 0.5s ease",
      }}
    >
      {/* Aurora background blobs */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(55,140,146,0.15) 0%, rgba(55,140,146,0) 70%)",
          filter: "blur(60px)",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "50%",
          height: "70%",
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(45,115,119,0.14) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1180px",
          mx: "auto",
          width: "100%",
          px: { xs: 2, sm: 2 },
          py: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* TOP ROW: title bento + stats cluster */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2,
          }}
        >
          {/* Title cell */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "16px",
              p: { xs: 3, md: 3.5 },
              backgroundColor: pal.cardBg,
              border: `1px solid ${pal.cardBorder}`,
              boxShadow: pal.shadow,
              backdropFilter: "blur(24px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Decorative teal orb + concentric rings (right side) */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                right: -80,
                top: "50%",
                transform: "translateY(-50%)",
                width: 320,
                height: 320,
                borderRadius: "50%",
                pointerEvents: "none",
                background:
                  "radial-gradient(circle, rgba(55,140,146,0.18) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                right: 32,
                top: "50%",
                transform: "translateY(-50%)",
                width: 192,
                height: 192,
                borderRadius: "50%",
                pointerEvents: "none",
                border: "1px solid rgba(55,140,146,0.15)",
                boxShadow: "0 0 60px rgba(55,140,146,0.08)",
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                right: 64,
                top: "50%",
                transform: "translateY(-50%)",
                width: 112,
                height: 112,
                borderRadius: "50%",
                pointerEvents: "none",
                border: "1px solid rgba(55,140,146,0.1)",
              }}
            />

            {/* Content: heading/subtitle at top, button at bottom-left */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                gap: 3,
              }}
            >
              <Box sx={{ maxWidth: "460px" }}>
                <Box sx={{ display: "inline-block", mb: 1.5 }}>
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { xs: "1.5rem", md: "2rem" },
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                      mb: 0.75,
                    }}
                  >
                    Blog Posts
                  </Typography>
                  <Box
                    sx={{
                      height: "2px",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(90deg, #378C92, transparent)",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    color: pal.textMuted,
                    fontSize: "0.9rem",
                    fontWeight: 300,
                    lineHeight: 1.6,
                    maxWidth: "460px",
                  }}
                >
                  Manage blog posts for your website — write, publish, and track
                  engagement across all your content.
                </Typography>
              </Box>
              <Button
                onClick={() =>
                  navigate(`/dashboard/websites/${websiteId}/editor`)
                }
                startIcon={<PenSquareIcon size={16} />}
                sx={{
                  alignSelf: "flex-start",
                  backgroundColor: pal.accent,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  px: 2.5,
                  py: 1,
                  borderRadius: "999px",
                  boxShadow: "0 8px 24px -6px rgba(55,140,146,0.55)",
                  "&:hover": {
                    backgroundColor: pal.accent,
                    filter: "brightness(1.1)",
                  },
                }}
              >
                Open Editor
              </Button>
            </Box>
          </Box>

          {/* Stats cluster */}
          <Box
            sx={{
              borderRadius: "16px",
              p: 2,
              backgroundColor: pal.cardBg,
              border: `1px solid ${pal.cardBorder}`,
              boxShadow: pal.shadow,
              backdropFilter: "blur(24px)",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: pal.textMuted,
                px: 1,
                mb: 0.25,
              }}
            >
              Overview
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}
            >
              {overviewStats.map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.25,
                    borderRadius: "10px",
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.02)",
                    transition: "background-color 0.3s",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: pal.iconGradient,
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                        }`,
                      }}
                    >
                      <s.icon size={16} color={pal.accent} />
                    </Box>
                    <Typography
                      sx={{
                        color: pal.textMuted,
                        fontWeight: 500,
                        fontSize: "0.875rem",
                      }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
                    {s.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* MIDDLE ROW: search + filter */}
        <Box
          sx={{
            borderRadius: "14px",
            p: 0.75,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            backgroundColor: pal.cardBg,
            border: `1px solid ${pal.cardBorder}`,
            boxShadow: pal.shadow,
            backdropFilter: "blur(24px)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 16,
                display: "flex",
                pointerEvents: "none",
                color: pal.textMuted,
              }}
            >
              <SearchIcon size={18} />
            </Box>
            <Box
              component="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or status..."
              sx={{
                width: "100%",
                height: 42,
                pl: "44px",
                pr: 2,
                borderRadius: "10px",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "0.85rem",
                fontWeight: 500,
                fontFamily: "inherit",
                color: pal.textPrimary,
                "&::placeholder": { color: pal.textMuted },
              }}
            />
          </Box>
          <Box
            sx={{
              width: "1px",
              height: 32,
              my: "auto",
              backgroundColor: "rgba(127,127,127,0.2)",
              display: { xs: "none", sm: "block" },
            }}
          />
          <Button
            onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
            sx={{
              height: 42,
              px: 2.5,
              borderRadius: "10px",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: pal.textPrimary,
              fontWeight: 500,
              fontSize: "0.85rem",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              },
            }}
          >
            <FilterIcon size={16} color={pal.textMuted} />
            <span>{statusFilterLabels[statusFilter]}</span>
            <ChevronDownIcon size={16} color={pal.textMuted} />
          </Button>
          <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={() => setStatusMenuAnchor(null)}
            PaperProps={{
              sx: {
                backgroundColor: pal.cardBg,
                backdropFilter: "blur(24px)",
                border: `1px solid ${pal.cardBorder}`,
                color: pal.textPrimary,
              },
            }}
          >
            {Object.keys(statusFilterLabels).map((k) => (
              <MenuItem
                key={k}
                selected={statusFilter === k}
                onClick={() => {
                  setStatusFilter(k);
                  setStatusMenuAnchor(null);
                }}
                sx={{ fontSize: "0.875rem", color: pal.textPrimary }}
              >
                {statusFilterLabels[k]}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* BOTTOM ROW: table */}
        <Box
          sx={{
            borderRadius: "16px",
            backgroundColor: pal.cardBg,
            border: `1px solid ${pal.cardBorder}`,
            boxShadow: pal.shadow,
            backdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                whiteSpace: "nowrap",
                "& td, & th": { borderBottom: "none" },
              }}
            >
              <TableHead>
                <TableRow>
                  {["#", "Title", "Category", "Status", "Date"].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        px: 3,
                        py: 1.75,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: pal.textMuted,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{
                      px: 3,
                      py: 1.75,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: pal.textMuted,
                    }}
                  >
                    Visible
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      px: 3,
                      py: 1.75,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: pal.textMuted,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{
                        textAlign: "center",
                        py: 8,
                        color: pal.textMuted,
                        borderTop: `1px solid ${pal.tableRowBorder}`,
                      }}
                    >
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : sortedAndFilteredBlogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      sx={{
                        textAlign: "center",
                        py: 8,
                        borderTop: `1px solid ${pal.tableRowBorder}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          color: pal.textMuted,
                        }}
                      >
                        <ArticleIcon size={48} />
                        <Typography sx={{ color: pal.textMuted }}>
                          {blogs.length === 0
                            ? "No blog posts yet. Write your first post!"
                            : "No blog posts found matching your filters"}
                        </Typography>
                        {blogs.length === 0 && (
                          <Button
                            onClick={() => handleOpenDialog()}
                            startIcon={<NewInsightIcon size={16} />}
                            sx={{
                              mt: 1,
                              textTransform: "none",
                              backgroundColor: pal.accent,
                              color: "#fff",
                              borderRadius: "999px",
                              px: 2.5,
                              "&:hover": {
                                backgroundColor: pal.accent,
                                filter: "brightness(1.1)",
                              },
                            }}
                          >
                            Write Your First Blog Post
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAndFilteredBlogs.map((post, idx) => {
                    const meta = statusMeta(post.status);
                    const isPublished = post.visibility === "PUBLISHED";
                    const number = String(
                      (page - 1) * rowsPerPage + idx + 1,
                    ).padStart(2, "0");
                    const publishTip = !canPublish
                      ? "Only owners/admins can publish"
                      : isPublished
                        ? "Click to hide from your site"
                        : "Click to publish to your site";
                    return (
                      <TableRow
                        key={post.id}
                        sx={{
                          borderTop: `1px solid ${pal.tableRowBorder}`,
                          transition: "background-color 0.2s",
                          "&:hover": { backgroundColor: pal.tableRowHover },
                          "&:hover .row-actions": { opacity: 1 },
                        }}
                      >
                        <TableCell
                          sx={{ px: 3, py: 1.75, color: pal.textMuted }}
                        >
                          {number}
                        </TableCell>
                        <TableCell sx={{ px: 3, py: 1.75 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: pal.textPrimary,
                            }}
                          >
                            {post.title}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ px: 3, py: 1.75, color: pal.textMuted }}
                        >
                          {post.category}
                        </TableCell>
                        <TableCell sx={{ px: 3, py: 1.75 }}>
                          <Box
                            component="span"
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: "999px",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              backgroundColor: meta.bg,
                              color: meta.color,
                              display: "inline-block",
                            }}
                          >
                            {meta.label}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{ px: 3, py: 1.75, color: pal.textMuted }}
                        >
                          {new Date(
                            post.publishedAt || post.createdAt,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center" sx={{ px: 3, py: 1.75 }}>
                          <Tooltip title={publishTip}>
                            <Box
                              component="span"
                              sx={{ display: "inline-flex" }}
                            >
                              <Box
                                component="button"
                                disabled={!canPublish}
                                onClick={() => handleTogglePublish(post)}
                                sx={{
                                  width: 44,
                                  height: 24,
                                  borderRadius: "999px",
                                  position: "relative",
                                  border: "none",
                                  p: 0,
                                  cursor: canPublish
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: canPublish ? 1 : 0.6,
                                  backgroundColor: isPublished
                                    ? pal.accent
                                    : pal.inputBg,
                                  transition: "background-color 0.3s",
                                }}
                              >
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: "4px",
                                    left: "4px",
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                    transition: "transform 0.3s",
                                    transform: isPublished
                                      ? "translateX(20px)"
                                      : "translateX(0)",
                                  }}
                                />
                              </Box>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right" sx={{ px: 3, py: 1.75 }}>
                          <Box
                            className="row-actions"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 0.5,
                              opacity: 0,
                              transition: "opacity 0.3s",
                            }}
                          >
                            {getRowActions(post).map((a) => (
                              <Tooltip key={a.key} title={a.label}>
                                <IconButton
                                  size="small"
                                  onClick={a.onClick}
                                  sx={{
                                    color: a.color,
                                    borderRadius: "10px",
                                    "&:hover": { backgroundColor: a.hover },
                                  }}
                                >
                                  {a.icon}
                                </IconButton>
                              </Tooltip>
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              px: 3,
              py: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${pal.tableRowBorder}`,
              mt: "auto",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                fontSize: "0.875rem",
                fontWeight: 500,
                color: pal.textMuted,
              }}
            >
              Rows per page:
              <Button
                onClick={(e) => setRppMenuAnchor(e.currentTarget)}
                endIcon={<ChevronDownIcon size={14} />}
                sx={{
                  minWidth: "auto",
                  p: 0.5,
                  textTransform: "none",
                  color: pal.textMuted,
                  fontWeight: 500,
                }}
              >
                {rowsPerPage}
              </Button>
              <Menu
                anchorEl={rppMenuAnchor}
                open={Boolean(rppMenuAnchor)}
                onClose={() => setRppMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    backgroundColor: pal.cardBg,
                    backdropFilter: "blur(24px)",
                    border: `1px solid ${pal.cardBorder}`,
                    color: pal.textPrimary,
                  },
                }}
              >
                {rowsPerPageOptions.map((n) => (
                  <MenuItem
                    key={n}
                    selected={n === rowsPerPage}
                    onClick={() => {
                      setRowsPerPage(n);
                      setRppMenuAnchor(null);
                    }}
                    sx={{ fontSize: "0.875rem", color: pal.textPrimary }}
                  >
                    {n}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: "0.875rem",
                fontWeight: 500,
                color: pal.textMuted,
              }}
            >
              <span>
                {rangeStart}-{rangeEnd} of {totalRows}
              </span>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  sx={{
                    color: pal.textMuted,
                    borderRadius: "8px",
                    "&.Mui-disabled": { opacity: 0.4 },
                  }}
                >
                  <ChevronLeftIcon size={20} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  sx={{
                    color: pal.textMuted,
                    borderRadius: "8px",
                    "&.Mui-disabled": { opacity: 0.4 },
                  }}
                >
                  <ChevronRightIcon size={20} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Floating action button */}
      <Fab
        onClick={() => handleOpenDialog()}
        aria-label="New blog post"
        sx={{
          position: "fixed",
          bottom: 40,
          right: 40,
          width: 64,
          height: 64,
          backgroundColor: pal.accent,
          color: "#fff",
          boxShadow: "0 0 24px rgba(55,140,146,0.5)",
          zIndex: 1200,
          "&:hover": {
            backgroundColor: pal.accent,
            filter: "brightness(1.1)",
            transform: "scale(1.05)",
          },
          "& svg": { transition: "transform 0.3s" },
          "&:hover svg": { transform: "rotate(90deg)" },
        }}
      >
        <AddIcon size={28} />
      </Fab>

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
            maxHeight: "90vh",
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
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
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
                helperText={
                  validationErrors.title ||
                  "Title must be between 5 and 255 characters"
                }
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
                  <Typography
                    variant="caption"
                    sx={{ color: colors.panelDanger, mt: 0.5, ml: 1.5 }}
                  >
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
                      textTransform: "none",
                      fontSize: "0.8rem",
                      p: 0,
                      "&:hover": {
                        background: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    + New Category
                  </Button>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      placeholder="Category name"
                      value={quickCategoryName}
                      onChange={(e) => setQuickCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickCreateCategory();
                        if (e.key === "Escape") {
                          setShowQuickCreateCategory(false);
                          setQuickCategoryName("");
                        }
                      }}
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          color: colors.text,
                          backgroundColor: alpha(colors.text, 0.04),
                          "& fieldset": { borderColor: colors.border },
                          "&:hover fieldset": {
                            borderColor: alpha(colors.primary, 0.5),
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.primary,
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: colors.text,
                          fontSize: "0.875rem",
                        },
                      }}
                      autoFocus
                    />
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!quickCategoryName.trim()}
                      onClick={handleQuickCreateCategory}
                      sx={{
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        minWidth: 60,
                      }}
                    >
                      Add
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowQuickCreateCategory(false);
                        setQuickCategoryName("");
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
                <Typography sx={{ color: colors.textSecondary }}>
                  Featured Image
                </Typography>
              </Divider>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
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
                    sx={{ objectFit: "cover" }}
                    onError={(e) => {
                      if (
                        !imagePreview.startsWith("http") &&
                        !imagePreview.startsWith("data:")
                      ) {
                        const backendUrl = `${API_URL.replace("/api", "")}${imagePreview}`;
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
                          "&:hover": {
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
                          color: "#ef4444",
                          borderColor: alpha("#ef4444", 0.3),
                          "&:hover": {
                            borderColor: "#ef4444",
                            background: alpha("#ef4444", 0.1),
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
                    cursor: "pointer",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: colors.primary,
                      background: alpha(colors.primary, 0.05),
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Box sx={{ mb: 2, color: colors.textTertiary }}>
                      <ImageIcon size={60} />
                    </Box>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
                      Upload Featured Image
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.textSecondary }}
                    >
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
                <Typography sx={{ color: colors.textSecondary }}>
                  Content Sections
                </Typography>
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
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: colors.primary, fontWeight: 700 }}
                    >
                      Section {sectionIndex + 1}
                    </Typography>
                    {formData.headings.length > 1 && (
                      <Button
                        size="small"
                        startIcon={<DeleteIcon size={18} />}
                        onClick={() => removeSection(sectionIndex)}
                        sx={{
                          color: "#ef4444",
                          "&:hover": { background: alpha("#ef4444", 0.1) },
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
                          handleSectionChange(
                            sectionIndex,
                            "heading",
                            e.target.value,
                          )
                        }
                        required
                        error={!!validationErrors.headings[sectionIndex]}
                        helperText={
                          validationErrors.headings[sectionIndex] ||
                          "e.g., Key Benefits, Implementation Steps"
                        }
                        placeholder="e.g., Key Benefits, Implementation Steps"
                        sx={{
                          "& input:-webkit-autofill": {
                            WebkitBoxShadow: `0 0 0 100px ${colors.cardBgLight} inset`,
                            WebkitTextFillColor: colors.text,
                          },
                        }}
                      />
                    </Grid>

                    {/* Subsections */}
                    <Grid item xs={12}>
                      <Divider
                        sx={{ my: 1, borderColor: alpha(colors.border, 0.5) }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: colors.textTertiary }}
                        >
                          Subsections
                        </Typography>
                      </Divider>

                      {section.subsections.map(
                        (subsection, subsectionIndex) => (
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
                                  onClick={() =>
                                    removeSubsection(
                                      sectionIndex,
                                      subsectionIndex,
                                    )
                                  }
                                  sx={{
                                    color: "#ef4444",
                                    "&:hover": {
                                      background: alpha("#ef4444", 0.1),
                                    },
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
                                      "subheading",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g., Cost Efficiency, Scalability"
                                  size="small"
                                  sx={{
                                    "& input:-webkit-autofill": {
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
                                          insertFormatting(
                                            sectionIndex,
                                            subsectionIndex,
                                            "bold",
                                          )
                                        }
                                        sx={{
                                          color: colors.text,
                                          borderColor: colors.border,
                                          "&:hover": {
                                            borderColor: colors.primary,
                                            background: alpha(
                                              colors.primary,
                                              0.1,
                                            ),
                                          },
                                        }}
                                      >
                                        <BoldIcon size={16} />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Italic: Select text or insert *text*">
                                      <Button
                                        onClick={() =>
                                          insertFormatting(
                                            sectionIndex,
                                            subsectionIndex,
                                            "italic",
                                          )
                                        }
                                        sx={{
                                          color: colors.text,
                                          borderColor: colors.border,
                                          "&:hover": {
                                            borderColor: colors.primary,
                                            background: alpha(
                                              colors.primary,
                                              0.1,
                                            ),
                                          },
                                        }}
                                      >
                                        <ItalicIcon size={16} />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Bullet Point">
                                      <Button
                                        onClick={() =>
                                          insertFormatting(
                                            sectionIndex,
                                            subsectionIndex,
                                            "bullet",
                                          )
                                        }
                                        sx={{
                                          color: colors.text,
                                          borderColor: colors.border,
                                          "&:hover": {
                                            borderColor: colors.primary,
                                            background: alpha(
                                              colors.primary,
                                              0.1,
                                            ),
                                          },
                                        }}
                                      >
                                        <BulletIcon size={16} />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Numbered List">
                                      <Button
                                        onClick={() =>
                                          insertFormatting(
                                            sectionIndex,
                                            subsectionIndex,
                                            "numbered",
                                          )
                                        }
                                        sx={{
                                          color: colors.text,
                                          borderColor: colors.border,
                                          "&:hover": {
                                            borderColor: colors.primary,
                                            background: alpha(
                                              colors.primary,
                                              0.1,
                                            ),
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
                                      "content",
                                      e.target.value,
                                    )
                                  }
                                  multiline
                                  rows={6}
                                  required
                                  inputRef={(el) => {
                                    contentRefs.current[
                                      `${sectionIndex}-${subsectionIndex}`
                                    ] = el;
                                  }}
                                  placeholder="Write your content here. Use **text** for bold, *text* for italic, • for bullets"
                                  helperText="Each new line creates a paragraph. Use formatting buttons to add style."
                                  sx={{
                                    "& textarea:-webkit-autofill": {
                                      WebkitBoxShadow: `0 0 0 100px ${colors.dark} inset`,
                                      WebkitTextFillColor: colors.text,
                                    },
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Card>
                        ),
                      )}

                      <Button
                        variant="text"
                        startIcon={<AddSubsectionIcon size={18} />}
                        onClick={() => addSubsection(sectionIndex)}
                        size="small"
                        sx={{
                          color: colors.primary,
                          "&:hover": {
                            backgroundColor: alpha(colors.primary, 0.1),
                          },
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
                  "&:hover": {
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
              "&:hover": { background: alpha(colors.text, 0.05) },
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
            {isEditing ? "Update Post" : "Create Post"}
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
        <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Are you sure you want to delete &quot;
            <strong style={{ color: colors.text }}>
              {currentInsight?.title}
            </strong>
            &quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              color: colors.textSecondary,
              "&:hover": { background: alpha(colors.text, 0.05) },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#F5F5F5",
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha("#ef4444", 0.3)}`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: `0 6px 20px ${alpha("#ef4444", 0.4)}`,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject-with-reason Dialog (approval workflow) */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            border: `1px solid ${colors.border}`,
            background: colors.bgCard,
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
          Reject Post
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, mb: 2 }}
          >
            Optionally tell the author why &quot;
            <strong style={{ color: colors.text }}>
              {rejectTarget?.title}
            </strong>
            &quot; was rejected. They can revise and resubmit.
          </Typography>
          <DashboardInput
            fullWidth
            label="Reason (optional)"
            labelPlacement="floating"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={3}
            containerSx={{ mt: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
          <Button
            onClick={() => setOpenRejectDialog(false)}
            sx={{
              color: colors.textSecondary,
              "&:hover": { background: alpha(colors.textSecondary, 0.1) },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (rejectTarget) handleReject(rejectTarget, rejectReason);
              setOpenRejectDialog(false);
            }}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#F5F5F5",
              fontWeight: 600,
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            background:
              snackbar.severity === "success"
                ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#F5F5F5",
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(
              snackbar.severity === "success" ? "#22c55e" : "#ef4444",
              0.3,
            )}`,
            "& .MuiAlert-icon": { color: "#F5F5F5" },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WebsiteManageInsights;

