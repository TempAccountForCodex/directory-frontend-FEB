/**
 * MyTemplates Page — Step 3.6.4
 *
 * User's personal template library with three tabs:
 * - Favorites: templates the user has hearted
 * - Recently Used: browsing/usage history
 * - All Templates: full gallery with filters
 *
 * Rendered inside Dashboard layout via renderContent switch.
 * No standalone route needed (accessed at /dashboard/websites/my-templates).
 */
import { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, LayoutTemplate } from "lucide-react";
import axios from "axios";
import {
  PageHeader,
  TabNavigation,
  EmptyState,
  DashboardPanel,
} from "../components/Dashboard/shared";
import TemplateGallery from "../components/Templates/TemplateGallery";
import TemplateFilters from "../components/Templates/TemplateFilters";
import { useTemplates } from "../hooks/useTemplates";
import { useTemplateFavorites } from "../hooks/useTemplateFavorites";
import {
  type TemplateSummary,
  normalizeTemplateSummary,
} from "../templates/templateApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const TAB_FAVORITES = "favorites";
const TAB_RECENT = "recently-used";
const TAB_ALL = "all-templates";

const TABS = [
  { label: "Favorites", value: TAB_FAVORITES },
  { label: "Recently Used", value: TAB_RECENT },
  { label: "All Templates", value: TAB_ALL },
];

interface HistoryEntry {
  id: string;
  templateId: string;
  usedAt: string;
  template?: TemplateSummary;
}

const SKELETON_COUNT = 4;

const SkeletonGrid = () => (
  <Grid container spacing={3}>
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      </Grid>
    ))}
  </Grid>
);

const MyTemplates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(TAB_FAVORITES);

  // Favorites
  const {
    favorites,
    loading: favoritesLoading,
    isFavorited,
    toggleFavorite,
  } = useTemplateFavorites();

  // Recently Used
  const [history, setHistory] = useState<TemplateSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyFetched, setHistoryFetched] = useState<boolean>(false);

  // All Templates
  const {
    templates,
    loading: allLoading,
    filters,
    setFilters,
  } = useTemplates();

  // Fetch history only when tab is activated
  useEffect(() => {
    if (activeTab !== TAB_RECENT || historyFetched) return;

    let cancelled = false;
    setHistoryLoading(true);

    axios
      .get(`${API_URL}/templates/history?page=1&limit=20`)
      .then((res) => {
        if (!cancelled) {
          const entries: HistoryEntry[] = res.data?.data || [];
          // Extract template summaries from history entries.
          // Use centralized normalizer for consistent preview field mapping.
          const templates: TemplateSummary[] = entries
            .filter((entry) => entry.template)
            .map((entry) =>
              normalizeTemplateSummary(
                entry.template as unknown as Record<string, unknown>,
              ),
            );
          setHistory(templates);
          setHistoryFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHistory([]);
          setHistoryFetched(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, historyFetched]);

  const handleTabChange = useCallback((_e: unknown, newValue: string) => {
    setActiveTab(newValue);
  }, []);

  const handleSelectTemplate = useCallback(
    (_template: TemplateSummary) => {
      navigate("/dashboard/websites/templates");
    },
    [navigate],
  );

  const handlePreviewTemplate = useCallback((_template: TemplateSummary) => {
    // Preview handled within gallery — no-op at page level
  }, []);

  const handleFavoriteToggle = useCallback(
    (templateId: string) => {
      toggleFavorite(templateId);
    },
    [toggleFavorite],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="My Templates"
        subtitle="Your saved and recently used templates"
      />

      <TabNavigation tabs={TABS} value={activeTab} onChange={handleTabChange} />

      {/* Favorites Tab */}
      {activeTab === TAB_FAVORITES && (
        <DashboardPanel>
          {favoritesLoading ? (
            <SkeletonGrid />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={<Heart size={40} color="#378C92" />}
              title="No favorites yet"
              subtitle="Click the heart icon on any template to save it here"
            />
          ) : (
            <TemplateGallery
              templates={favorites}
              loading={false}
              onSelectTemplate={handleSelectTemplate}
              onPreviewTemplate={handlePreviewTemplate}
              isFavorited={isFavorited}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
        </DashboardPanel>
      )}

      {/* Recently Used Tab */}
      {activeTab === TAB_RECENT && (
        <DashboardPanel>
          {historyLoading ? (
            <SkeletonGrid />
          ) : history.length === 0 ? (
            <EmptyState
              icon={<Clock size={40} color="#378C92" />}
              title="No recently used templates"
              subtitle="Templates you use will appear here"
            />
          ) : (
            <TemplateGallery
              templates={history}
              loading={false}
              onSelectTemplate={handleSelectTemplate}
              onPreviewTemplate={handlePreviewTemplate}
              isFavorited={isFavorited}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
        </DashboardPanel>
      )}

      {/* All Templates Tab */}
      {activeTab === TAB_ALL && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <TemplateFilters filters={filters} onFiltersChange={setFilters} />
          </Box>
          <TemplateGallery
            templates={templates}
            loading={allLoading}
            onSelectTemplate={handleSelectTemplate}
            onPreviewTemplate={handlePreviewTemplate}
            isFavorited={isFavorited}
            onFavoriteToggle={handleFavoriteToggle}
          />
        </Box>
      )}
    </Box>
  );
};

export default MyTemplates;
