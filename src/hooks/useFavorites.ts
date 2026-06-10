import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "tt_favorite_listings";

function readStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Manages favorite listing IDs.
 * Currently persisted in localStorage; swap the internals for API calls
 * once the backend favorites endpoints are live (see BACKEND_FAVORITES.md).
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(readStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorited = useCallback(
    (id: string | number) => favorites.includes(String(id)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (id: string | number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const key = String(id);
      setFavorites((prev) =>
        prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
      );
      // TODO: replace with API call when backend is ready
      // if (isFavorited) DELETE /api/favorites/:id
      // else             POST /api/favorites  { listingId: id }
    },
    [],
  );

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return { favorites, isFavorited, toggleFavorite, clearFavorites };
}
