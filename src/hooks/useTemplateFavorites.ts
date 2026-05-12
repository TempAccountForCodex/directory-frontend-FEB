/**
 * useTemplateFavorites — Step 3.6.3
 *
 * Manages template favorites state:
 * - Fetches GET /api/templates/favorites on mount
 * - Provides isFavorited(id) check
 * - Provides toggleFavorite(id) with optimistic update
 * - Reverts on API failure
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { type TemplateSummary, normalizeTemplateSummary } from '../templates/templateApi';

export interface UseTemplateFavoritesReturn {
  favorites: TemplateSummary[];
  loading: boolean;
  error: string | null;
  isFavorited: (templateId: string) => boolean;
  toggleFavorite: (templateId: string) => void;
  fetchFavorites: () => void;
}

export const useTemplateFavorites = (): UseTemplateFavoritesReturn => {
  const [favorites, setFavorites] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/templates/favorites?page=1&limit=50`);
        if (!cancelled) {
          // API returns UserTemplateFavorite records with nested template object.
          // Use centralized normalizer for consistent preview field mapping.
          const records = response.data?.data || [];
          const mapped: TemplateSummary[] = records
            .filter((r: { template?: unknown }) => r.template)
            .map((r: { template: Record<string, unknown> }) =>
              normalizeTemplateSummary(r.template)
            );
          setFavorites(mapped);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load favorites';
          setError(message);
          setFavorites([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [fetchTrigger]);

  const fetchFavorites = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  const isFavorited = useCallback(
    (templateId: string): boolean => {
      return favorites.some((f) => f.id === templateId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (templateId: string) => {
      const currentlyFavorited = favorites.some((f) => f.id === templateId);
      const previousFavorites = [...favorites];

      // Optimistic update
      if (currentlyFavorited) {
        setFavorites((prev) => prev.filter((f) => f.id !== templateId));
      } else {
        // Add a minimal placeholder entry optimistically
        setFavorites((prev) => [...prev, { id: templateId } as TemplateSummary]);
      }

      // Fire API
      apiClient.post(`/templates/${templateId}/favorite`).catch((err: unknown) => {
        // Revert on failure
        console.error('[useTemplateFavorites] toggleFavorite failed:', err);
        setFavorites(previousFavorites);
      });
    },
    [favorites]
  );

  return {
    favorites,
    loading,
    error,
    isFavorited,
    toggleFavorite,
    fetchFavorites,
  };
};

export default useTemplateFavorites;
