import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Modal,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
  alpha,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileText as ArticleIcon,
  Users as PeopleIcon,
  Tag as CategoryIcon,
  LayoutDashboard as DashboardIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Zap as QuickIcon,
  ArrowRight as ArrowIcon,
  Plus as AddIcon,
  ChartBar as AnalyticsIcon,
  Bell as NotificationsIcon,
  X as CloseIcon,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { DashboardInput } from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Searchable pages/features configuration
const SEARCHABLE_FEATURES = [
  {
    id: 'overview',
    title: 'Overview Dashboard',
    description: 'View analytics and statistics',
    icon: DashboardIcon,
    path: '/dashboard',
    keywords: ['dashboard', 'overview', 'home', 'analytics', 'stats'],
    category: 'Pages',
  },
  {
    id: 'insights',
    title: 'Manage Insights',
    description: 'Create and manage blog posts',
    icon: ArticleIcon,
    path: '/dashboard',
    action: () => 'insights',
    keywords: ['insights', 'blogs', 'posts', 'articles', 'content'],
    category: 'Pages',
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage users and permissions',
    icon: PeopleIcon,
    path: '/dashboard',
    action: () => 'users',
    keywords: ['users', 'team', 'members', 'permissions', 'roles'],
    category: 'Pages',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure dashboard settings',
    icon: SettingsIcon,
    path: '/dashboard',
    action: () => 'settings',
    keywords: ['settings', 'configuration', 'preferences', 'account'],
    category: 'Pages',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'View all notifications',
    icon: NotificationsIcon,
    path: '/dashboard',
    keywords: ['notifications', 'alerts', 'updates'],
    category: 'Pages',
  },
  {
    id: 'analytics',
    title: 'Analytics Overview',
    description: 'Google Analytics data',
    icon: AnalyticsIcon,
    path: '/dashboard',
    action: () => 'overview',
    keywords: ['analytics', 'google', 'metrics', 'traffic', 'visitors'],
    category: 'Pages',
  },
];

// Quick actions
const QUICK_ACTIONS = [
  {
    id: 'create-insight',
    title: 'Create New Insight',
    description: 'Start writing a new blog post',
    icon: AddIcon,
    action: 'create-insight',
    keywords: ['create', 'new', 'insight', 'blog', 'post', 'write'],
    category: 'Quick Actions',
  },
  {
    id: 'create-user',
    title: 'Create New User',
    description: 'Add a new team member',
    icon: PeopleIcon,
    action: 'create-user',
    keywords: ['create', 'new', 'user', 'member', 'team', 'add'],
    category: 'Quick Actions',
  },
];

const SearchPopup = ({ open, onClose }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    insights: [],
    users: [],
    categories: [],
    features: [],
    quickActions: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Save recent search
  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({
        insights: [],
        users: [],
        categories: [],
        features: [],
        quickActions: [],
      });
      return;
    }

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const lowerQuery = query.toLowerCase();

      // Search features and quick actions locally
      const matchingFeatures = SEARCHABLE_FEATURES.filter(
        (feature) =>
          feature.title.toLowerCase().includes(lowerQuery) ||
          feature.description.toLowerCase().includes(lowerQuery) ||
          feature.keywords.some((kw) => kw.includes(lowerQuery))
      );

      const matchingQuickActions = QUICK_ACTIONS.filter(
        (action) =>
          action.title.toLowerCase().includes(lowerQuery) ||
          action.description.toLowerCase().includes(lowerQuery) ||
          action.keywords.some((kw) => kw.includes(lowerQuery))
      );

      // Search backend for insights, users, and categories
      const [insightsRes, usersRes, categoriesRes] = await Promise.all([
        axios
          .get(`${API_URL}/insights?search=${query}&limit=5`, {
            headers: {},
          })
          .catch(() => ({ data: { insights: [] } })),
        axios
          .get(`${API_URL}/users?search=${query}&limit=5`, {
            headers: {},
          })
          .catch(() => ({ data: { users: [] } })),
        axios
          .get(`${API_URL}/categories?search=${query}`, {
            headers: {},
          })
          .catch(() => ({ data: [] })),
      ]);

      setSearchResults({
        insights: insightsRes.data.insights || [],
        users: usersRes.data.users || [],
        categories: Array.isArray(categoriesRes.data) ? categoriesRes.data.slice(0, 5) : [],
        features: matchingFeatures,
        quickActions: matchingQuickActions,
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all flattened results
  const getAllResults = () => {
    const results = [];

    if (searchResults.quickActions.length > 0) {
      results.push({ type: 'header', label: 'Quick Actions' });
      searchResults.quickActions.forEach((item) =>
        results.push({ type: 'quick-action', data: item })
      );
    }

    if (searchResults.features.length > 0) {
      results.push({ type: 'header', label: 'Pages' });
      searchResults.features.forEach((item) => results.push({ type: 'feature', data: item }));
    }

    if (searchResults.insights.length > 0) {
      results.push({ type: 'header', label: 'Insights' });
      searchResults.insights.forEach((item) => results.push({ type: 'insight', data: item }));
    }

    if (searchResults.users.length > 0) {
      results.push({ type: 'header', label: 'Users' });
      searchResults.users.forEach((item) => results.push({ type: 'user', data: item }));
    }

    if (searchResults.categories.length > 0) {
      results.push({ type: 'header', label: 'Categories' });
      searchResults.categories.forEach((item) => results.push({ type: 'category', data: item }));
    }

    return results;
  };

  const allResults = getAllResults();
  const selectableResults = allResults.filter((r) => r.type !== 'header');

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, selectableResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectableResults[selectedIndex]) {
      e.preventDefault();
      handleResultClick(selectableResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleResultClick = (result) => {
    saveRecentSearch(searchQuery);

    switch (result.type) {
      case 'feature':
        if (result.data.action) {
          // Trigger tab change in Dashboard
          const tab = result.data.action();
          navigate('/dashboard', { state: { activeTab: tab } });
        } else {
          navigate(result.data.path);
        }
        break;
      case 'quick-action':
        // Handle quick actions
        handleQuickAction(result.data.action);
        break;
      case 'insight':
        navigate('/dashboard', {
          state: { activeTab: 'insights', insightId: result.data.id },
        });
        break;
      case 'user':
        navigate('/dashboard', {
          state: { activeTab: 'users', userId: result.data.id },
        });
        break;
      case 'category':
        navigate('/dashboard', {
          state: { activeTab: 'insights', category: result.data.slug },
        });
        break;
      default:
        break;
    }

    onClose();
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-insight':
        navigate('/dashboard', { state: { activeTab: 'insights', action: 'create' } });
        break;
      case 'create-user':
        navigate('/dashboard', { state: { activeTab: 'users', action: 'create' } });
        break;
      default:
        break;
    }
  };

  const getResultIcon = (result) => {
    switch (result.type) {
      case 'insight':
        return <ArticleIcon size={18} color={colors.panelAccent} />;
      case 'user':
        return <PeopleIcon size={18} color={colors.panelInfo} />;
      case 'category':
        return <CategoryIcon size={18} color={colors.panelWarning} />;
      case 'feature':
        const Icon = result.data.icon;
        return <Icon size={18} color={colors.panelAccent} />;
      case 'quick-action':
        const QIcon = result.data.icon;
        return <QIcon size={18} color={colors.panelAccent} />;
      default:
        return <SearchIcon size={18} color={colors.panelIcon} />;
    }
  };

  const getResultTitle = (result) => {
    switch (result.type) {
      case 'insight':
        return result.data.title;
      case 'user':
        return result.data.name;
      case 'category':
        return result.data.name;
      case 'feature':
      case 'quick-action':
        return result.data.title;
      default:
        return '';
    }
  };

  const getResultDescription = (result) => {
    switch (result.type) {
      case 'insight':
        return result.data.content?.substring(0, 80) + '...';
      case 'user':
        return result.data.username || result.data.email;
      case 'category':
        return result.data.description || `Category: ${result.data.name}`;
      case 'feature':
      case 'quick-action':
        return result.data.description;
      default:
        return '';
    }
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 8,
      }}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 680,
          maxHeight: '70vh',
          borderRadius: '16px',
          backgroundColor: colors.panelBg,
          color: colors.panelText,
          border: `1px solid ${colors.panelBorder}`,
          boxShadow: colors.panelShadow,
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* Search Input */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${colors.panelBorder}`,
            backgroundColor: colors.panelBg,
          }}
        >
          <DashboardInput
            inputRef={inputRef}
            fullWidth
            placeholder="Search everything... (insights, users, pages, actions)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={24} color={colors.panelIcon} />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} sx={{ color: colors.panelAccent }} />
                </InputAdornment>
              ) : searchQuery ? (
                <InputAdornment position="end">
                  <Box
                    component="span"
                    onClick={() => setSearchQuery('')}
                    sx={{
                      color: colors.panelMuted,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      '&:hover': { color: colors.panelText },
                    }}
                  >
                    <CloseIcon size={20} />
                  </Box>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              '& .MuiOutlinedInput-input': {
                py: 1.5,
                '&::placeholder': {
                  color: colors.panelSubtle,
                  opacity: 1,
                },
              },
            }}
          />

          {/* Keyboard hints */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Chip
              label="↑↓ Navigate"
              size="small"
              sx={{
                background: alpha(colors.panelText, 0.06),
                color: colors.panelMuted,
                fontSize: '0.75rem',
                height: '24px',
              }}
            />
            <Chip
              label="Enter Select"
              size="small"
              sx={{
                background: alpha(colors.panelText, 0.06),
                color: colors.panelMuted,
                fontSize: '0.75rem',
                height: '24px',
              }}
            />
            <Chip
              label="Esc Close"
              size="small"
              sx={{
                background: alpha(colors.panelText, 0.06),
                color: colors.panelMuted,
                fontSize: '0.75rem',
                height: '24px',
              }}
            />
          </Box>
        </Box>

        {/* Search Results */}
        <List
          ref={listRef}
          sx={{
            maxHeight: 'calc(70vh - 140px)',
            overflowY: 'auto',
            p: 0,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(colors.panelText, 0.04),
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(colors.panelText, 0.12),
              borderRadius: '4px',
              '&:hover': {
                background: alpha(colors.panelText, 0.2),
              },
            },
          }}
        >
          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <>
              <Box
                sx={{
                  p: 2,
                  pb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.813rem',
                    fontWeight: 700,
                    color: colors.panelMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <HistoryIcon
                    size={16}
                    style={{ marginRight: 4, verticalAlign: 'middle' }}
                  />
                  Recent Searches
                </Typography>
                <Typography
                  onClick={clearRecentSearches}
                  sx={{
                    fontSize: '0.75rem',
                    color: colors.panelAccent,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Clear
                </Typography>
              </Box>
              {recentSearches.map((search, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => handleRecentSearchClick(search)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        background: colors.panelHover,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <HistoryIcon size={20} color={colors.panelSubtle} />
                    </ListItemIcon>
                    <ListItemText
                      primary={search}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: '0.938rem',
                          color: colors.panelMuted,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider sx={{ borderColor: colors.panelBorder, my: 1 }} />
            </>
          )}

          {/* Search Results */}
          {searchQuery && allResults.length === 0 && !loading && (
            <Box
              sx={{
                p: 8,
                textAlign: 'center',
              }}
            >
              <Box sx={{ mb: 2, color: colors.panelSubtle }}>
                <SearchIcon size={64} />
              </Box>
              <Typography
                sx={{
                  color: colors.panelMuted,
                  fontSize: '0.938rem',
                }}
              >
                No results found for "{searchQuery}"
              </Typography>
            </Box>
          )}

          {allResults.map((result, index) => {
            if (result.type === 'header') {
              return (
                <Box key={`header-${result.label}`} sx={{ p: 2, pb: 1, pt: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.813rem',
                      fontWeight: 700,
                      color: colors.panelMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {result.label}
                  </Typography>
                </Box>
              );
            }

            const selectableIndex = selectableResults.indexOf(result);
            const isSelected = selectableIndex === selectedIndex;

            return (
              <ListItem key={`${result.type}-${index}`} disablePadding>
                <ListItemButton
                  data-index={selectableIndex}
                  onClick={() => handleResultClick(result)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    background: isSelected ? alpha(colors.panelAccent, 0.16) : 'transparent',
                    borderLeft: isSelected
                      ? `3px solid ${colors.panelAccent}`
                      : '3px solid transparent',
                    '&:hover': {
                      background: colors.panelHover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{getResultIcon(result)}</ListItemIcon>
                  <ListItemText
                    primary={getResultTitle(result)}
                    secondary={getResultDescription(result)}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: '0.938rem',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? colors.panelText : colors.panelMuted,
                      },
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        fontSize: '0.813rem',
                        color: colors.panelSubtle,
                        mt: 0.5,
                      },
                    }}
                  />
                  {isSelected && (
                    <ArrowIcon
                      sx={{
                        color: colors.panelAccent,
                        fontSize: 20,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Modal>
  );
};

export default SearchPopup;
