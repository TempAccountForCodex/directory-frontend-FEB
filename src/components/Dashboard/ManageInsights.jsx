import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  CircleCheck as ApproveIcon,
  CircleX as RejectIcon,
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
  FolderOpen as ProjectsIcon,
  Clock as PendingIcon,
  Tag as CategoryIcon,
  Search as SearchIcon,
  ArrowUp as ArrowUpwardIcon,
  ArrowDown as ArrowDownwardIcon,
} from 'lucide-react';
import axios from 'axios';
import CategoryManagement from './CategoryManagement';
import PendingApproval from './PendingApproval';
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
import { isAdmin as checkIsAdmin, isSuperAdmin as checkIsSuperAdmin } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ManageInsights = ({
  user,
  highlightId,
  subtab: subtabProp,
  onSubTabChange,
  pageTitle,
  pageSubtitle,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse subtab from pathname manually (works with wildcard route)
  const parseSubtab = () => {
    const pathname = location.pathname;
    // Remove trailing slash and split into segments
    const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);

    // URL patterns:
    // /dashboard/insights -> segments = ['dashboard', 'insights']
    // /dashboard/insights/pending -> segments = ['dashboard', 'insights', 'pending']

    // Third segment is the subtab
    return segments[2] || null;
  };

  const subtab = parseSubtab();

  const triggerNotificationRefresh = () => {
    window.dispatchEvent(new Event('notifications:refresh'));
  };
  const [blogs, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [page, setPage] = useState(() => {
    return parseInt(localStorage.getItem('manageInsightsPage')) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('manageInsightsRowsPerPage')) || 10;
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const contentRefs = useRef({});

  // Stats for all insights (not just current page)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    totalViews: 0,
    trends: {
      total: null,
      approved: null,
      pending: null,
      totalViews: null,
    },
  });

  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addCategoryTrigger, setAddCategoryTrigger] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Project state
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [openProjectsDialog, setOpenProjectsDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSlug, setNewProjectSlug] = useState('');
  const [projectActionLoading, setProjectActionLoading] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState(null);

  // Add Category Dialog state (for when not on categories tab)
  const [openAddCategoryDialog, setOpenAddCategoryDialog] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });

  // Get active subtab from URL or default to 'insights'
  const activeTab = subtab || 'insights';

  // Redirect if on /dashboard/insights without subtab
  useEffect(() => {
    if (!subtab && location.pathname === '/dashboard/insights') {
      navigate('/dashboard/insights/insights', { replace: true });
    }
  }, [location.pathname, subtab, navigate]);

  // Handle highlight from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlHighlight = searchParams.get('highlight');

    if (urlHighlight) {
      // Scroll to and highlight the item
      setTimeout(() => {
        const element = document.getElementById(`insight-${urlHighlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlighted');

          // Remove highlight after 3 seconds
          setTimeout(() => {
            element.classList.remove('highlighted');
          }, 3000);
        }
      }, 500);
    }
  }, [location.search]);

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

  const [approvalData, setApprovalData] = useState({
    action: 'approve',
    rejectionReason: '',
  });

  const isAdmin = checkIsAdmin(user.role);
  const isSuperAdmin = checkIsSuperAdmin(user.role);

  // Fetch projects and categories on mount only
  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Re-fetch insights when project, page, or rowsPerPage changes
  useEffect(() => {
    if (selectedProjectId !== null) {
      fetchInsights();
      fetchStats();
    }
  }, [page, rowsPerPage, selectedProjectId]);

  // Persist rowsPerPage to localStorage
  useEffect(() => {
    localStorage.setItem('manageInsightsRowsPerPage', rowsPerPage.toString());
  }, [rowsPerPage]);

  // Persist page to localStorage
  useEffect(() => {
    localStorage.setItem('manageInsightsPage', page.toString());
  }, [page]);

  // Reset to page 1 when rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [rowsPerPage]);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  // Check if form has been modified
  const hasFormChanged = () => {
    if (!isEditing || !originalFormData) return true; // Allow submit for new insights

    // Check if image file has been changed
    if (imageFile) return true;

    // Compare form data
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
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort insights
  const sortedAndFilteredInsights = blogs
    .filter((insight) => {
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          insight.title?.toLowerCase().includes(query) ||
          insight.category?.toLowerCase().includes(query) ||
          insight.author?.name?.toLowerCase().includes(query) ||
          insight.status?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        const statusMap = {
          approved: 'APPROVED',
          pending: 'PENDING_APPROVAL',
          rejected: 'REJECTED',
          draft: 'DRAFT',
        };
        if (insight.status !== statusMap[statusFilter]) return false;
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

      // Handle string comparison
      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numeric comparison (dates)
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await axios.get(`${API_URL}/projects`);
      if (response.data.success) {
        const projectList = response.data.projects;
        setProjects(projectList);
        setSelectedProjectId((prev) => {
          if (projectList.length === 0) return null;
          const defaultProj =
            projectList.find((p) => p.slug === 'techietribe-directory') || projectList[0];
          if (prev === null) {
            // Initial load — pick the default project
            return defaultProj.id;
          }
          // Refresh after add/delete — keep current selection if it still exists
          const stillExists = projectList.some((p) => p.id === prev);
          return stillExists ? prev : defaultProj.id;
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Ensure insights don't stay in infinite loading state if projects fail to load
      setLoading(false);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      if (response.data.success && response.data.data) {
        // Extract category names from the response
        const categoryNames = response.data.data.map((cat) => cat.name);
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to empty array if fetch fails
      setCategories([]);
    }
  };

  // Handle Add Category from header button (works from any tab)
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
      // Also trigger refresh in CategoryManagement if it's rendered
      setAddCategoryTrigger(0);
    } catch (error) {
      console.error('Error creating category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create category',
        severity: 'error',
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/insights/stats`);

      setStats({
        total: response.data.total || 0,
        approved: response.data.approved || 0,
        pending: response.data.pending || 0,
        totalViews: response.data.totalViews || 0,
        trends: {
          total: response.data.trends?.total ?? null,
          approved: response.data.trends?.approved ?? null,
          pending: response.data.trends?.pending ?? null,
          totalViews: response.data.trends?.totalViews ?? null,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const projectParam = selectedProjectId ? `&projectId=${selectedProjectId}` : '';
      const response = await axios.get(
        `${API_URL}/insights?page=${page}&limit=${rowsPerPage}${projectParam}`
      );

      setInsights(response.data.insights || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([]);
      setSnackbar({
        open: true,
        message: 'Failed to fetch insights',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  // Convert old format to new format with subsections
  const convertToNewFormat = (headings) => {
    if (!headings || !Array.isArray(headings)) {
      return [{ heading: '', subsections: [{ subheading: '', content: '' }] }];
    }

    return headings.map((section) => {
      // If already in new format
      if (section.subsections && Array.isArray(section.subsections)) {
        return section;
      }

      // Convert old format: { heading, subheading?, description: [] }
      const subsections = [];
      if (section.description && Array.isArray(section.description)) {
        // If there's a subheading, create one subsection with it
        if (section.subheading) {
          subsections.push({
            subheading: section.subheading,
            content: section.description.join('\n'),
          });
        } else {
          // No subheading, just content
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
  };

  const handleOpenDialog = (blog = null) => {
    if (blog) {
      setIsEditing(true);
      setCurrentInsight(blog);

      // Convert old format to new format
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

      // Set image preview using the helper function
      setImagePreview(getImageUrl(blog.image));
      setImageFile(null);

      // Save original form data for change detection
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
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentInsight(null);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview('');
    setOriginalFormData(null);
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
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
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Section management
  const handleSectionChange = (sectionIndex, field, value) => {
    const newHeadings = [...formData.headings];
    newHeadings[sectionIndex][field] = value;
    setFormData((prev) => ({ ...prev, headings: newHeadings }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      headings: [...prev.headings, { heading: '', subsections: [{ subheading: '', content: '' }] }],
    }));
  };

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      headings: prev.headings.filter((_, i) => i !== index),
    }));
  };

  // Subsection management
  const handleSubsectionChange = (sectionIndex, subsectionIndex, field, value) => {
    const newHeadings = [...formData.headings];
    newHeadings[sectionIndex].subsections[subsectionIndex][field] = value;
    setFormData((prev) => ({ ...prev, headings: newHeadings }));
  };

  const addSubsection = (sectionIndex) => {
    const newHeadings = [...formData.headings];
    newHeadings[sectionIndex].subsections.push({ subheading: '', content: '' });
    setFormData((prev) => ({ ...prev, headings: newHeadings }));
  };

  const removeSubsection = (sectionIndex, subsectionIndex) => {
    const newHeadings = [...formData.headings];
    newHeadings[sectionIndex].subsections = newHeadings[sectionIndex].subsections.filter(
      (_, i) => i !== subsectionIndex
    );
    setFormData((prev) => ({ ...prev, headings: newHeadings }));
  };

  // Text formatting helpers - improved to work at cursor position
  const insertTextAtCursor = (sectionIndex, subsectionIndex, textToInsert, wrapText = false) => {
    const refKey = `${sectionIndex}-${subsectionIndex}`;
    const textarea = contentRefs.current[refKey];

    if (!textarea) {
      // Fallback: append to end
      const currentContent = formData.headings[sectionIndex].subsections[subsectionIndex].content;
      handleSubsectionChange(
        sectionIndex,
        subsectionIndex,
        'content',
        currentContent + textToInsert
      );
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.headings[sectionIndex].subsections[subsectionIndex].content;
    const selectedText = currentContent.substring(start, end);

    let newText;
    if (wrapText && selectedText) {
      // Wrap selected text
      const [prefix, suffix] = textToInsert.split('|');
      newText =
        currentContent.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        currentContent.substring(end);
    } else {
      // Insert at cursor
      newText = currentContent.substring(0, start) + textToInsert + currentContent.substring(end);
    }

    handleSubsectionChange(sectionIndex, subsectionIndex, 'content', newText);

    // Restore cursor position
    setTimeout(() => {
      const newPosition = start + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const insertFormatting = (sectionIndex, subsectionIndex, format) => {
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
      case 'numbered':
        const currentText = formData.headings[sectionIndex].subsections[subsectionIndex].content;
        const lines = currentText.split('\n');
        const nextNum = lines.filter((l) => /^\d+\./.test(l.trim())).length + 1;
        insertTextAtCursor(sectionIndex, subsectionIndex, `\n${nextNum}. Numbered item`);
        break;
      default:
        return;
    }
  };

  const validateForm = () => {
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

    // Title validation
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

    // Category validation
    if (!formData.category) {
      errors.category = 'Category is required';
      isValid = false;
    }

    // Content preview validation
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

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 50) {
      errors.description = `Description must be at least 50 characters (current: ${formData.description.length})`;
      isValid = false;
    }

    // Headings validation
    const headingErrors = formData.headings.map((section, index) => {
      if (!section.heading.trim()) {
        isValid = false;
        return `Section ${index + 1}: Main heading is required`;
      }
      return '';
    });
    errors.headings = headingErrors;

    // Meta title validation (optional but has max length)
    if (formData.metaTitle && formData.metaTitle.length > 255) {
      errors.metaTitle = 'Meta title must not exceed 255 characters';
      isValid = false;
    }

    // Meta description validation (optional but has max length)
    if (formData.metaDescription && formData.metaDescription.length > 500) {
      errors.metaDescription = 'Meta description must not exceed 500 characters';
      isValid = false;
    }

    // Keywords validation (optional but has max length)
    if (formData.keywords && formData.keywords.length > 500) {
      errors.keywords = 'Keywords must not exceed 500 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Validate form before submission
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

      // Append all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('description', formData.description);

      // Convert new format back to API format
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
      if (selectedProjectId) {
        formDataToSend.append('projectId', selectedProjectId.toString());
      }

      // Append image file if new one is selected
      if (imageFile) {
        formDataToSend.append('imageFile', imageFile);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (isEditing) {
        await axios.put(`${API_URL}/blogs/${currentInsight.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(`${API_URL}/blogs`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // IMMEDIATELY refetch data for real-time updates
      await fetchInsights();
      await fetchStats();
      triggerNotificationRefresh();

      setSnackbar({
        open: true,
        message: isEditing
          ? isAdmin
            ? 'Insight updated successfully'
            : 'Insight updated and submitted for approval'
          : isAdmin
            ? 'Insight created successfully'
            : 'Insight created and submitted for approval',
        severity: 'success',
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving insight:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save insight',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/blogs/${currentInsight.id}`);

      // IMMEDIATELY refetch data for real-time updates
      await fetchInsights();
      await fetchStats();
      triggerNotificationRefresh();

      setSnackbar({
        open: true,
        message: 'Insight deleted successfully',
        severity: 'success',
      });

      setOpenDeleteDialog(false);
      setCurrentInsight(null);
    } catch (error) {
      console.error('Error deleting insight:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete insight',
        severity: 'error',
      });
    }
  };

  const handleApproval = async () => {
    try {
      const endpoint = approvalData.action === 'approve' ? 'approve' : 'reject';

      await axios.patch(`${API_URL}/blogs/${currentInsight.id}/${endpoint}`, {
        rejectionReason: approvalData.rejectionReason,
      });

      // IMMEDIATELY refetch data for real-time updates
      await fetchInsights();
      await fetchStats();

      setSnackbar({
        open: true,
        message: `Insight ${
          approvalData.action === 'approve' ? 'approved' : 'rejected'
        } successfully`,
        severity: 'success',
      });

      setOpenApprovalDialog(false);
      setCurrentInsight(null);
      setApprovalData({ action: 'approve', rejectionReason: '' });
    } catch (error) {
      console.error('Error processing approval:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to process approval',
        severity: 'error',
      });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      DRAFT: {
        label: 'Draft',
        background: `linear-gradient(135deg, ${alpha(
          colors.text,
          0.2
        )} 0%, ${alpha(colors.text, 0.1)} 100%)`,
        color: colors.textSecondary,
      },
      PENDING_APPROVAL: {
        label: 'Pending Approval',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: '#F5F5F5',
      },
      APPROVED: {
        label: 'Approved',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: '#F5F5F5',
      },
      REJECTED: {
        label: 'Rejected',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#F5F5F5',
      },
    };

    const config = statusConfig[status] || {
      label: status,
      background: alpha(colors.text, 0.1),
      color: colors.textSecondary,
    };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          background: config.background,
          color: config.color,
          fontWeight: 700,
          border: 'none',
          boxShadow:
            status === 'PENDING_APPROVAL' || status === 'APPROVED' || status === 'REJECTED'
              ? `0 2px 6px ${alpha(config.color === '#F5F5F5' ? '#000' : config.color, 0.2)}`
              : 'none',
        }}
      />
    );
  };

  return (
    <Box>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      {/* Action Button Row */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="flex-end" gap={1.5} mb={2}>
          <DashboardIconButton
            icon={<NewInsightIcon size={20} />}
            label="New Insight"
            tooltip="Create New Insight"
            variant="filled"
            onClick={() => handleOpenDialog()}
          />
          {isAdmin && (
            <DashboardIconButton
              icon={<NewCategoryIcon size={20} />}
              label="Add Category"
              tooltip="Add Category"
              variant="outlined"
              onClick={() => {
                if (activeTab === 'categories') {
                  // Trigger the CategoryManagement dialog
                  setAddCategoryTrigger((prev) => prev + 1);
                } else {
                  // Open our own dialog
                  setOpenAddCategoryDialog(true);
                }
              }}
            />
          )}
          {isAdmin && (
            <DashboardIconButton
              icon={<ProjectsIcon size={20} />}
              label="Projects"
              tooltip="Manage Projects"
              variant="outlined"
              onClick={() => setOpenProjectsDialog(true)}
            />
          )}
        </Box>
      </Box>

      {/* Summary Stats - shown for all views */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Total Insights"
                value={stats.total}
                icon={ArticleIcon}
                {...getTrendProps(stats.total, stats.trends.total)}
                showProgress={false}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Approved"
                value={stats.approved}
                icon={ApproveIcon}
                {...getTrendProps(stats.approved, stats.trends.approved)}
                showProgress={false}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Pending"
                value={stats.pending}
                icon={PendingIcon}
                {...getTrendProps(stats.pending, stats.trends.pending)}
                showProgress={false}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Total Views"
                value={stats.totalViews.toLocaleString()}
                icon={ViewIcon}
                {...getTrendProps(stats.totalViews, stats.trends.totalViews)}
                showProgress={false}
              />
            </Grid>
          </Grid>

      {/* Search and Filter Controls - shown for all views */}
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
            placeholder={activeTab === 'pending'
              ? 'Search by title, category, or author...'
              : activeTab === 'categories'
                ? 'Search by category name or description...'
                : 'Search by title, category, author, or status...'}
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
          {!projectsLoading && projects.length > 0 && (
            <DashboardSelect
              size="small"
              label="Project"
              value={selectedProjectId || ''}
              onChange={(e) => {
                setSelectedProjectId(e.target.value ? parseInt(e.target.value) : null);
                setPage(1);
              }}
              containerSx={{
                minWidth: 180,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {projects.map((proj) => (
                <MenuItem key={proj.id} value={proj.id}>
                  {proj.name}
                </MenuItem>
              ))}
            </DashboardSelect>
          )}
          <DashboardSelect
            size="small"
            label="View"
            value={activeTab}
            onChange={(e) => {
              const newValue = e.target.value;
              const searchParams = new URLSearchParams(location.search);
              const queryString = searchParams.toString();
              navigate(
                `/dashboard/insights/${newValue}${queryString ? `?${queryString}` : ''}`
              );
              setSearchQuery('');
              if (onSubTabChange) {
                onSubTabChange();
              }
            }}
            containerSx={{
              minWidth: 160,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <MenuItem value="insights">Insights</MenuItem>
            <MenuItem value="pending">Pending Approval</MenuItem>
            <MenuItem value="categories">Categories</MenuItem>
          </DashboardSelect>

          {activeTab === 'insights' && (
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
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending Approval</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </DashboardSelect>
          )}
        </Stack>
      </Stack>

      {/* View Content */}
      {activeTab === 'pending' ? (
        <PendingApproval user={user} searchQuery={searchQuery} />
      ) : activeTab === 'categories' ? (
        <CategoryManagement user={user} searchQuery={searchQuery} addTrigger={addCategoryTrigger} />
      ) : (
        <DashboardPanel padding={0} sx={{ borderRadius: 3 }}>
            <DashboardDataGrid
              gridId="manage-insights"
              rowData={sortedAndFilteredInsights}
              columnDefs={[
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
                      {row.original.status === 'PENDING_APPROVAL' && (
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
                      )}
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
                  header: 'Status',
                  accessorKey: 'status',
                  size: 160,
                  Cell: ({ cell }) => {
                    const status = cell.getValue();
                    const statusConfig = {
                      APPROVED: {
                        label: 'Approved',
                        bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        shadow: '#22c55e',
                      },
                      PENDING_APPROVAL: {
                        label: 'Pending',
                        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        shadow: '#f59e0b',
                      },
                      REJECTED: {
                        label: 'Rejected',
                        bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        shadow: '#ef4444',
                      },
                      DRAFT: {
                        label: 'Draft',
                        bg: `linear-gradient(135deg, ${colors.textTertiary} 0%, ${alpha(
                          colors.textTertiary,
                          0.8
                        )} 100%)`,
                        shadow: colors.textTertiary,
                      },
                    };

                    const config = statusConfig[status] || statusConfig.DRAFT;

                    return (
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          background: config.bg,
                          color: '#F5F5F5',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: '24px',
                          boxShadow: `0 2px 6px ${alpha(config.shadow, 0.2)}`,
                        }}
                      />
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
              ]}
              actionColumn={{
                width: 150,
                actions: (blog) => [
                  {
                    label: 'View',
                    icon: <ViewIcon size={18} />,
                    onClick: (data) => {
                      const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
                      window.open(`${baseUrl}/insights/${data.slug}`, '_blank');
                    },
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
                    label: 'Approve',
                    icon: <ApproveIcon size={18} />,
                    onClick: (data) => {
                      setCurrentInsight(data);
                      setApprovalData({ action: 'approve', rejectionReason: '' });
                      setOpenApprovalDialog(true);
                    },
                    color: colors.success,
                    hoverBackground: alpha(colors.success, 0.2),
                    show: isAdmin && blog.status === 'PENDING_APPROVAL',
                  },
                  {
                    label: 'Reject',
                    icon: <RejectIcon size={18} />,
                    onClick: (data) => {
                      setCurrentInsight(data);
                      setApprovalData({ action: 'reject', rejectionReason: '' });
                      setOpenApprovalDialog(true);
                    },
                    color: colors.error,
                    hoverBackground: alpha(colors.error, 0.2),
                    show: isAdmin && blog.status === 'PENDING_APPROVAL',
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
                    show: isSuperAdmin,
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
          {isEditing ? 'Edit Insight' : 'Create New Insight'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.border }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DashboardInput
                fullWidth
                label="Insight Title"
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
                      console.error('Image load error:', e);
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
                  `Full intro paragraph shown at the top of the insight (minimum 50 characters) - Current: ${formData.description.length}`
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
                          '&:hover': {
                            background: alpha('#ef4444', 0.1),
                          },
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
                                  '&:hover': {
                                    background: alpha('#ef4444', 0.1),
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
                          '&:hover': {
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
                  `Leave empty to use insight title (max 255 characters) - Current: ${formData.metaTitle.length}`
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
            {isEditing ? 'Update Insight' : 'Create Insight'}
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
            Are you sure you want to delete "
            <strong style={{ color: colors.text }}>{currentInsight?.title}</strong>
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

      {/* Approval Dialog */}
      <Dialog
        open={openApprovalDialog}
        onClose={() => setOpenApprovalDialog(false)}
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>
          {approvalData.action === 'approve' ? 'Approve Insight' : 'Reject Insight'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ color: colors.textSecondary }}>
            Insight: <strong style={{ color: colors.text }}>{currentInsight?.title}</strong>
          </Typography>
          {approvalData.action === 'reject' && (
            <DashboardInput
              fullWidth
              label="Rejection Reason"
              labelPlacement="floating"
              multiline
              rows={3}
              value={approvalData.rejectionReason}
              onChange={(e) =>
                setApprovalData({
                  ...approvalData,
                  rejectionReason: e.target.value,
                })
              }
              containerSx={{ mt: 2 }}
              required
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
            disabled={approvalData.action === 'reject' && !approvalData.rejectionReason}
            sx={{
              background:
                approvalData.action === 'approve'
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#F5F5F5',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(
                approvalData.action === 'approve' ? '#22c55e' : '#ef4444',
                0.3
              )}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background:
                  approvalData.action === 'approve'
                    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: `0 6px 20px ${alpha(
                  approvalData.action === 'approve' ? '#22c55e' : '#ef4444',
                  0.4
                )}`,
              },
              '&:disabled': {
                background: alpha(colors.text, 0.1),
                color: colors.textTertiary,
                boxShadow: 'none',
              },
            }}
          >
            {approvalData.action === 'approve' ? 'Approve' : 'Reject'}
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
            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
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
              '&:hover': {
                background: alpha(colors.textSecondary, 0.1),
              },
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

      {/* Manage Projects Dialog — Admin Only */}
      <Dialog
        open={openProjectsDialog}
        onClose={() => {
          setOpenProjectsDialog(false);
          setNewProjectName('');
          setNewProjectSlug('');
          setRevealedApiKey(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 700,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          Manage Projects
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1.5 }}>
            Projects
          </Typography>
          {projects.map((proj) => (
            <Box
              key={proj.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                mb: 1,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography sx={{ color: colors.text, fontWeight: 600 }}>{proj.name}</Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  /{proj.slug}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Reveal API Key">
                  <span>
                    <DashboardIconButton
                      icon={<ViewIcon size={16} />}
                      size="small"
                      onClick={async () => {
                        try {
                          const res = await axios.get(`${API_URL}/projects/${proj.id}/apikey`);
                          setRevealedApiKey({ projectId: proj.id, key: res.data.project.apiKey });
                        } catch {
                          setSnackbar({ open: true, message: 'Failed to fetch API key', severity: 'error' });
                        }
                      }}
                    />
                  </span>
                </Tooltip>
                <Tooltip title="Delete Project">
                  <span>
                    <DashboardIconButton
                      icon={<DeleteIcon size={16} />}
                      size="small"
                      onClick={async () => {
                        if (!window.confirm(`Delete project "${proj.name}"? Blogs will become unassigned.`)) return;
                        try {
                          await axios.delete(`${API_URL}/projects/${proj.id}`);
                          await fetchProjects();
                          setSnackbar({ open: true, message: 'Project deleted', severity: 'success' });
                        } catch (err) {
                          setSnackbar({
                            open: true,
                            message: err.response?.data?.message || 'Failed to delete project',
                            severity: 'error',
                          });
                        }
                      }}
                    />
                  </span>
                </Tooltip>
              </Box>
            </Box>
          ))}

          {revealedApiKey && (
            <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
              <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                {revealedApiKey.key}
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 2, borderColor: colors.border }}>
            <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
              Add New Project
            </Typography>
          </Divider>

          <DashboardInput
            fullWidth
            label="Project Name"
            value={newProjectName}
            onChange={(e) => {
              setNewProjectName(e.target.value);
              setNewProjectSlug(
                e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              );
            }}
            containerSx={{ mb: 1.5 }}
          />
          <DashboardInput
            fullWidth
            label="Slug"
            value={newProjectSlug}
            onChange={(e) =>
              setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
            }
            helperText="Lowercase letters, numbers, and hyphens only"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
          <Button
            onClick={() => {
              setOpenProjectsDialog(false);
              setNewProjectName('');
              setNewProjectSlug('');
              setRevealedApiKey(null);
            }}
            sx={{ color: colors.textSecondary }}
          >
            Close
          </Button>
          <DashboardActionButton
            disabled={!newProjectName.trim() || !newProjectSlug.trim() || projectActionLoading}
            onClick={async () => {
              setProjectActionLoading(true);
              try {
                await axios.post(`${API_URL}/projects`, {
                  name: newProjectName.trim(),
                  slug: newProjectSlug.trim(),
                });
                await fetchProjects();
                setNewProjectName('');
                setNewProjectSlug('');
                setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
              } catch (err) {
                setSnackbar({
                  open: true,
                  message: err.response?.data?.message || 'Failed to create project',
                  severity: 'error',
                });
              } finally {
                setProjectActionLoading(false);
              }
            }}
          >
            {projectActionLoading ? 'Creating...' : 'Create Project'}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageInsights;
