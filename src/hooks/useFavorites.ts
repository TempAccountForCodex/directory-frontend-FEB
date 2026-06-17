import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavourite } from "./useFavourites";

const STORAGE_KEY = "tt_favorite_listings";

function readStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Manages listing favourite state.
 * - Anonymous users use localStorage.
 * - Signed-in users use the backend favourites endpoint for the active card.
 */
export function useFavorites(activeId?: string | number | null) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>(readStorage);
  const backendFavourite = useFavourite(user && activeId ? activeId : null);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const isFavorited = useCallback(
    (id: string | number) => {
      if (user && activeId !== undefined && activeId !== null && String(id) === String(activeId)) {
        return backendFavourite.isFavourited;
      }
      return favorites.includes(String(id));
    },
    [activeId, backendFavourite.isFavourited, favorites, user],
  );

  const toggleFavorite = useCallback(
    async (id: string | number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (user && activeId !== undefined && activeId !== null && String(id) === String(activeId)) {
        await backendFavourite.toggleFavourite();
        return;
      }

      const key = String(id);
      setFavorites((prev) =>
        prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
      );
    },
    [activeId, backendFavourite, user],
  );

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return {
    favorites,
    isFavorited,
    toggleFavorite,
    clearFavorites,
    loading: backendFavourite.loading,
    favouriteCount: backendFavourite.favouriteCount,
  };
}
