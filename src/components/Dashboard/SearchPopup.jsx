import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Globe as WebsiteIcon,
  Store as StoreIcon,
  Palette as TemplateIcon,
  History as HistoryIcon,
  ArrowRight as ArrowIcon,
  X as CloseIcon,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardInput } from './shared';
import { getSearchableFeatures, getQuickActions } from './searchConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const SearchPopup = ({ open, onClose }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role;

  // Role-gated features and quick actions (memoized, recomputed only when role changes)
  const roleFeatures = useMemo(() => getSearchableFeatures(userRole), [userRole]);
  const roleQuickActions = useMemo(() => getQuickActions(userRole), [userRole]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    websites: [],
    stores: [],
    templates: [],
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
  const saveRecentSearch = useCallback((query) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({
        websites: [],
        stores: [],
        templates: [],
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

      // Search features and quick actions locally (instant, no API call)
      const matchingFeatures = roleFeatures.filter(
        (feature) =>
          feature.title.toLowerCase().includes(lowerQuery) ||
          feature.description.toLowerCase().includes(lowerQuery) ||
          feature.keywords.some((kw) => kw.includes(lowerQuery))
      );

      const matchingQuickActions = roleQuickActions.filter(
        (action) =>
          action.title.toLowerCase().includes(lowerQuery) ||
          action.description.toLowerCase().includes(lowerQuery) ||
          action.keywords.some((kw) => kw.includes(lowerQuery))
      );

      // Single unified backend search call
      const searchRes = await axios
        .get(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=5`, {
          withCredentials: true,
        })
        .catch(() => ({
          data: { websites: [], stores: [], templates: [], insights: [], users: [], categories: [] },
        }));

      const data = searchRes.data;

      setSearchResults({
        websites: data.websites || [],
        stores: data.stores || [],
        templates: data.templates || [],
        insights: data.insights || [],
        users: data.users || [],
        categories: data.categories || [],
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

    if (searchResults.websites.length > 0) {
      results.push({ type: 'header', label: 'Websites' });
      searchResults.websites.forEach((item) => results.push({ type: 'website', data: item }));
    }

    if (searchResults.stores.length > 0) {
      results.push({ type: 'header', label: 'Stores' });
      searchResults.stores.forEach((item) => results.push({ type: 'store', data: item }));
    }

    if (searchResults.templates.length > 0) {
      results.push({ type: 'header', label: 'Templates' });
      searchResults.templates.forEach((item) => results.push({ type: 'template', data: item }));
    }

    if (searchResults.insights.length > 0) {
      results.push({ type: 'header', label: 'Insights' });
      searchResults.insights.forEach((item) => results.push({ type: 'insight', data: item }));
    }

    if (searchResults.users.length > 0) {
      results.push({ type: 'header', label: 'Users' });
      searchResults.users.forEach((item) => results.push({ type: 'user', data: item }));
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

  const handleResultClick = useCallback((result) => {
    saveRecentSearch(searchQuery);

    switch (result.type) {
      case 'feature': {
        const nav = result.data.navigation;
        if (nav.path) {
          navigate(nav.path);
        } else if (nav.activeTab) {
          const state = { activeTab: nav.activeTab };
          if (nav.subtab) state.subtab = nav.subtab;
          navigate('/dashboard', { state });
        }
        break;
      }
      case 'quick-action':
        handleQuickAction(result.data.action);
        break;
      case 'website':
        navigate('/dashboard', {
          state: { activeTab: 'websites', websiteId: result.data.id },
        });
        break;
      case 'store':
        navigate('/dashboard', {
          state: { activeTab: 'stores', storeId: result.data.id },
        });
        break;
      case 'template':
        navigate(`/dashboard/websites/templates?highlight=${result.data.id}`);
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
      default:
        break;
    }

    onClose();
  }, [searchQuery, saveRecentSearch, navigate, onClose]);

  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case 'create-website':
        navigate('/dashboard/websites/templates');
        break;
      case 'create-store':
        navigate('/dashboard', { state: { activeTab: 'stores', action: 'create' } });
        break;
      case 'create-insight':
        navigate('/dashboard', { state: { activeTab: 'insights', action: 'create' } });
        break;
      case 'create-template':
        navigate('/dashboard', { state: { activeTab: 'websites/create-template' } });
        break;
      case 'create-user':
        navigate('/dashboard', { state: { activeTab: 'users', action: 'create' } });
        break;
      case 'pending-insights':
        navigate('/dashboard', { state: { activeTab: 'insights', subtab: 'pending' } });
        break;
      case 'communications':
        navigate('/dashboard/communications');
        break;
      default:
        break;
    }
  }, [navigate]);

  const getResultIcon = useCallback((result) => {
    switch (result.type) {
      case 'website':
        return <WebsiteIcon size={18} color={colors.panelAccent} />;
      case 'store':
        return <StoreIcon size={18} color={colors.panelAccent} />;
      case 'template':
        return <TemplateIcon size={18} color={colors.panelAccent} />;
      case 'insight':
        return <ArticleIcon size={18} color={colors.panelAccent} />;
      case 'user':
        return <PeopleIcon size={18} color={colors.panelInfo} />;
      case 'feature': {
        const Icon = result.data.icon;
        return <Icon size={18} color={colors.panelAccent} />;
      }
      case 'quick-action': {
        const QIcon = result.data.icon;
        return <QIcon size={18} color={colors.panelAccent} />;
      }
      default:
        return <SearchIcon size={18} color={colors.panelIcon} />;
    }
  }, [colors]);

  const getResultTitle = useCallback((result) => {
    switch (result.type) {
      case 'website':
      case 'store':
      case 'template':
        return result.data.title;
      case 'insight':
        return result.data.title;
      case 'user':
        return result.data.name;
      case 'feature':
      case 'quick-action':
        return result.data.title;
      default:
        return '';
    }
  }, []);

  const getResultDescription = useCallback((result) => {
    switch (result.type) {
      case 'website':
      case 'store':
      case 'template':
        return result.data.subtitle;
      case 'insight':
        return result.data.description || result.data.content?.substring(0, 80) + '...';
      case 'user':
        return result.data.username || result.data.email;
      case 'feature':
      case 'quick-action':
        return result.data.description;
      default:
        return '';
    }
  }, []);

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
